// Tests for the spreadsheet export in js/collection.js (Account menu →
// Export as spreadsheet…).
//
//   node tools/test-export.mjs
//
// Loads js/utils.js, js/stats.js and js/collection.js into one sandbox with
// a stub window/document/localStorage and exercises ACDB.collectionInternals.
// Prints "N passed" and exits non-zero on failure.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const storage = new Map();
const sandbox = {
    localStorage: {
        getItem: k => (storage.has(k) ? storage.get(k) : null),
        setItem: (k, v) => storage.set(k, String(v)),
        removeItem: k => storage.delete(k),
    },
    document: { addEventListener() {}, getElementById: () => null },
    navigator: {},
    console,
};
sandbox.window = sandbox;
vm.createContext(sandbox);
['utils.js', 'stats.js', 'collection.js'].forEach(file => {
    vm.runInContext(readFileSync(fileURLToPath(new URL(`../js/${file}`, import.meta.url)), 'utf8'), sandbox);
});
const C = sandbox.ACDB.collectionInternals;

let passed = 0;
let failed = 0;
function check(condition, label, detail) {
    if (condition) passed++;
    else {
        failed++;
        console.log('FAIL:', label, detail === undefined ? '' : JSON.stringify(detail));
    }
}

// Splits a file into rows of cells, honouring quotes (a small CSV reader)
function parse(text, delimiter) {
    const rows = [];
    let row = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < text.length; i++) {
        const ch = text[i];
        if (quoted) {
            if (ch === '"' && text[i + 1] === '"') { cell += '"'; i++; }
            else if (ch === '"') quoted = false;
            else cell += ch;
        } else if (ch === '"') quoted = true;
        else if (ch === delimiter) { row.push(cell); cell = ''; }
        else if (ch === '\r' && text[i + 1] === '\n') { row.push(cell); rows.push(row); row = []; cell = ''; i++; }
        else cell += ch;
    }
    if (cell || row.length) { row.push(cell); rows.push(row); }
    return rows;
}

// The line ends outside quoted cells
function unquotedBreaks(text) {
    let quoted = false;
    let crlf = 0;
    let bareLF = 0;
    for (let i = 0; i < text.length; i++) {
        if (text[i] === '"') quoted = !quoted;
        else if (!quoted && text[i] === '\r' && text[i + 1] === '\n') { crlf++; i++; }
        else if (!quoted && text[i] === '\n') bareLF++;
    }
    return { crlf, bareLF };
}

// ---- csvCell ----
check(C.csvCell('Altaïr Ibn-La\'Ahad', ',') === 'Altaïr Ibn-La\'Ahad', 'plain text is unchanged');
check(C.csvCell('a,b', ',') === '"a,b"', 'a comma forces quotes');
check(C.csvCell('say "hi"', ',') === '"say ""hi"""', 'a quote is doubled and quoted');
check(C.csvCell('one\ntwo', ',') === '"one\ntwo"', 'a line break forces quotes');
check(C.csvCell('one\r\ntwo', ',') === '"one\r\ntwo"', 'a CRLF forces quotes');
check(['=1+1', '+1', '-1', '@x', '\tx'].every(v => C.csvCell(v, ',') === "'" + v), 'formula starts get an apostrophe',
    ['=1+1', '+1', '-1', '@x', '\tx'].map(v => C.csvCell(v, ',')));
check(C.csvCell('=1,2', ',') === '"\'=1,2"', 'a guarded formula holding a comma is also quoted', C.csvCell('=1,2', ','));
check(C.csvCell(12, ',') === '12', 'a number passes through');
check(C.csvCell(null, ',') === '' && C.csvCell(undefined, ',') === '', 'null and undefined are empty');
check(C.csvCell('a,b', ';') === 'a,b', 'with semicolons, a comma needs no quotes');
check(C.csvCell('a;b', ';') === '"a;b"', 'with semicolons, a semicolon forces quotes');

// ---- buildCSV ----
const ITEMS = [
    { id: 1, name: 'Altaïr Statue', game: "Assassin's Creed", year: 2008, category: 'Statue', type: 'Statue' },
    { id: 2, name: 'Tantō Replica', game: "Assassin's Creed Shadows", year: 2025, category: 'Replica', type: 'Replica' },
    { id: 3, name: 'Renaissance', game: "Assassin's Creed II", year: 2009, category: 'Novel', type: 'Novel', series: 'Assassin\'s Creed (novels)' },
    { id: 4, name: 'Untouched', game: 'General', year: 2020, category: 'Statue', type: 'Statue' },
    { id: 5, name: 'Wished For', game: 'General', year: 2021, category: 'Statue', type: 'Statue' },
    { id: 6, name: 'Junk Price', game: 'General', year: 2021, category: 'Statue', type: 'Statue' },
    { id: 7, name: 'Gift', game: 'General', year: 2022, category: 'Statue', type: 'Statue' },
    { id: 8, name: 'Negative', game: 'General', year: 2022, category: 'Statue', type: 'Statue' },
];
const BLANK = { owned: false, wishlist: false, hasBox: false, condition: '', copies: 0, pricePaid: '', acquiredDate: '', notes: '', hasRead: false, readDate: '' };
const owned = (extra = {}) => ({ ...BLANK, owned: true, copies: 1, ...extra });
const NOTE = 'Bought at "the" fair,\r\nbox dented\r\n=SUM(A1)';
const COLLECTION = {
    1: owned({ condition: 'near-mint', hasBox: true, pricePaid: '12.50', acquiredDate: '2026-10-09', notes: NOTE }),
    2: owned({ copies: 2, pricePaid: '1234.56' }),
    3: { ...BLANK, hasRead: true, readDate: '2026-01-02' },   // read, not owned
    5: { ...BLANK, wishlist: true },
    6: owned({ pricePaid: 'abc' }),
    7: owned({ pricePaid: '0' }),
    8: owned({ pricePaid: '-5' }),
};
const getData = id => COLLECTION[id] || BLANK;
const comma = C.buildCSV(ITEMS, getData, 'comma');
const semicolon = C.buildCSV(ITEMS, getData, 'semicolon');
const rowsC = parse(comma, ',');
const rowsS = parse(semicolon, ';');
const byId = rows => Object.fromEntries(rows.slice(1).map(r => [r[0], r]));
const C1 = byId(rowsC);
const S1 = byId(rowsS);
const col = name => rowsC[0].indexOf(name);

check(rowsC[0].length === 17 && rowsC[0].join('|') === 'ID|Name|Game|Year|Category|Type|Series|Owned|Wishlist|Copies|Condition|Original box|Price paid|Acquired|Read|Finished reading|Notes',
    'the header row is the 17 columns', rowsC[0]);
check(rowsC.every(r => r.length === 17), 'every row has 17 cells (commas)', rowsC.map(r => r.length));
check(rowsS.every(r => r.length === 17), 'every row has 17 cells (semicolons)', rowsS.map(r => r.length));
check(!('4' in C1), 'an item with no data is left out');
check('3' in C1 && C1['3'][col('Owned')] === 'no', 'an item only read is in');
check('5' in C1 && C1['5'][col('Wishlist')] === 'yes', 'an item only wished for is in');
check(rowsC.length === 1 + 7, 'header + one row per item with data', rowsC.length);
check(C1['1'][col('Name')] === 'Altaïr Statue' && C1['2'][col('Name')] === 'Tantō Replica', 'accents come through');
check(C1['1'][col('Notes')] === NOTE,'a three-line note stays one cell', C1['1'][col('Notes')]);
{
    const breaks = unquotedBreaks(comma);
    check(breaks.crlf === rowsC.length && breaks.bareLF === 0, 'unquoted line ends are CRLF, one per row', breaks);
}
check(comma.endsWith('\r\n') && semicolon.endsWith('\r\n'), 'the text ends with CRLF');

// Prices
check(C1['1'][col('Price paid')] === '12.5' && S1['1'][col('Price paid')] === '12,5', 'a price is 12.5 / 12,5', [C1['1'][col('Price paid')], S1['1'][col('Price paid')]]);
check(C1['2'][col('Price paid')] === '1234.56' && S1['2'][col('Price paid')] === '1234,56', 'no thousands separator');
check(comma.includes(',12.5,') && semicolon.includes(';12,5;'), 'a price is written unquoted');
check(C1['7'][col('Price paid')] === '0', 'a price of 0 is 0');
check(C1['6'][col('Price paid')] === 'abc', 'a junk price stays as text');
check(C1['8'][col('Price paid')] === "'-5", 'a negative price is guarded text', C1['8'][col('Price paid')]);
check(C1['5'][col('Price paid')] === '', 'no price is empty');

// The other columns
check(C1['1'][col('Condition')] === 'Near Mint', 'condition shows its label');
check(C1['1'][col('Original box')] === 'yes' && C1['2'][col('Original box')] === 'no', 'box is yes or no');
check(C1['1'][col('Acquired')] === '2026-10-09', 'dates are 2026-10-09');
check(C1['2'][col('Copies')] === '2' && C1['3'][col('Copies')] === '0', 'copies');
check(C1['3'][col('Read')] === 'yes' && C1['3'][col('Finished reading')] === '2026-01-02', 'a novel has yes and its date');
check(C1['1'][col('Read')] === '' && C1['1'][col('Finished reading')] === '', 'a statue has empty read columns');
check(C1['3'][col('Series')] === "Assassin's Creed (novels)" && C1['1'][col('Series')] === '', 'series, or empty');
check(C1['1'][col('Notes')].includes('=SUM') && !comma.includes('\n\'=SUM'), 'a formula on a later line of a note is left alone');
check(C1['1'][col('Year')] === '2008' && C1['1'][col('ID')] === '1', 'id and year are numbers');
check(C.buildCSV(ITEMS, getData, 'nonsense') === comma, 'an unknown format falls back to commas');
check(C.buildCSV(ITEMS, () => BLANK, 'comma') === rowsC[0].join(',') + '\r\n', 'an empty collection is only the header row');

console.log(`${passed} passed${failed ? `, ${failed} failed` : ''}`);
if (failed) process.exitCode = 1;
