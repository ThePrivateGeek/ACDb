// Tests for the spending sums in js/stats.js (Collection Insights: Spending,
// Spent by category, Collected by year).
//
//   node tools/test-spending.mjs
//
// Loads js/stats.js into a sandbox with a stub window and exercises
// ACDB.statsInternals. Prints "N passed" and exits non-zero on failure.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const source = readFileSync(fileURLToPath(new URL('../js/stats.js', import.meta.url)), 'utf8');
const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);
vm.runInContext(source, sandbox);
const S = sandbox.ACDB.statsInternals;

let passed = 0;
let failed = 0;
function check(condition, label, detail) {
    if (condition) passed++;
    else {
        failed++;
        console.log('FAIL:', label, detail === undefined ? '' : JSON.stringify(detail));
    }
}

// A small catalog and a collection keyed by id, like getItemData
const item = (id, category = 'Statue') => ({ id, name: `Item ${id}`, category });
const owned = (extra = {}) => ({ owned: true, wishlist: false, copies: 1, pricePaid: '', acquiredDate: '', ...extra });
const BLANK = { owned: false, wishlist: false, copies: 0, pricePaid: '', acquiredDate: '' };
function summarise(items, collection) {
    return S.spendingSummary(items, id => collection[id] || BLANK);
}

// ---- priceCents ----
check(S.priceCents('12.50') === 1250, 'priceCents reads a decimal');
check(S.priceCents('0') === 0, 'priceCents: 0 is a price');
check(['', '  ', null, undefined].every(v => S.priceCents(v) === null), 'priceCents: blank is no price');
check(['abc', '12abc', '-5'].every(v => S.priceCents(v) === null), 'priceCents: text and negatives are no price');
check(S.priceCents('1e3') === 100000, 'priceCents reads 1e3');
check(S.priceCents('1e300') === null, 'priceCents: a number too large is no price');
check(S.priceCents(12.5) === 1250, 'priceCents takes a number');

// ---- spendingSummary ----
{
    const r = summarise([item(1), item(2)], { 1: owned({ pricePaid: '0.10' }), 2: owned({ pricePaid: '0.20' }) });
    check(r.totalCents === 30, '0.10 + 0.20 is 30 cents exactly', r.totalCents);
}
{
    const r = summarise([item(1), item(2), item(3)], {
        1: owned({ pricePaid: '10' }),
        2: { ...BLANK, pricePaid: '99' },               // a price, not owned
        3: { ...BLANK, wishlist: true, pricePaid: '50' },
    });
    check(r.totalCents === 1000 && r.priced === 1 && r.owned === 1, 'items not owned add nothing', r);
}
{
    const r = summarise([item(1)], { 1: owned({ copies: 3, pricePaid: '50' }) });
    check(r.totalCents === 5000, 'a price counts once whatever the copies', r.totalCents);
}
{
    const r = summarise([item(1), item(2)], { 1: owned({ pricePaid: '0' }), 2: owned({ pricePaid: '100' }) });
    check(r.priced === 2 && r.totalCents / r.priced === 5000, 'a price of 0 counts and pulls the average down', r);
}
{
    const items = [item(1), item(2), item(3), item(4)];
    const r = summarise(items, {
        1: owned({ pricePaid: '20' }),
        2: owned({ pricePaid: '80' }),
        3: owned({ pricePaid: '80' }),
        4: owned({ pricePaid: 'abc' }),
    });
    check(r.top && r.top.item.id === 2 && r.top.cents === 8000, 'top is the highest price, the earlier item on a tie', r.top);
    check(r.priced === 3 && r.owned === 4, 'a junk price is no price', r);
}
{
    const r = summarise([item(1, 'Statue'), item(2, 'Statue'), item(3, 'Novel'), item(4, 'Comic')], {
        1: owned({ pricePaid: '100' }),
        2: owned({ pricePaid: '50.5' }),
        3: owned({ pricePaid: '12' }),
        4: owned(),
    });
    check(r.byCategory.Statue === 15050 && r.byCategory.Novel === 1200, 'byCategory sums per category', r.byCategory);
    check(!('Comic' in r.byCategory), 'byCategory has no key for a category without prices', r.byCategory);
}
{
    const r = summarise([item(1), item(2), item(3), item(4), item(5), item(6)], {
        1: owned({ pricePaid: '10', acquiredDate: '2024-03-01' }),
        2: owned({ pricePaid: '5', acquiredDate: '2024-11-30' }),
        3: owned({ acquiredDate: '2023-06-15' }),
        4: owned({ pricePaid: '7' }),
        5: owned({ acquiredDate: 'yesterday' }),
        6: { ...BLANK, acquiredDate: '2022-01-01' },
    });
    check(r.byYear['2024'] && r.byYear['2024'].count === 2 && r.byYear['2024'].cents === 1500, 'byYear: the year comes from the date', r.byYear);
    check(r.byYear['2023'] && r.byYear['2023'].count === 1 && r.byYear['2023'].cents === 0, 'byYear: a dated item without a price adds to the count only', r.byYear);
    check(r.undated === 2, 'an owned item with no date or a malformed date is undated', r.undated);
    check(!('2022' in r.byYear), 'byYear: an item not owned adds nothing', r.byYear);
}
{
    const r = summarise([item(1), item(2)], {});
    check(r.owned === 0 && r.priced === 0 && r.totalCents === 0 && r.top === null && r.undated === 0, 'an empty collection gives zeros', r);
    check(Object.keys(r.byCategory).length === 0 && Object.keys(r.byYear).length === 0, 'an empty collection gives empty maps', r);
}

// ---- formatMoney ----
check(S.formatMoney(124050, '€') === '€1,240.50', 'formatMoney with a symbol', S.formatMoney(124050, '€'));
check(S.formatMoney(124050, '') === '1,240.50', 'formatMoney with no symbol', S.formatMoney(124050, ''));
check(S.formatMoney(124050, '$', true) === '$1,241', 'formatMoney in whole units', S.formatMoney(124050, '$', true));
check(S.formatMoney(0, '£') === '£0.00', 'formatMoney of 0', S.formatMoney(0, '£'));
check(S.formatMoney(124050, 'NOK') === 'NOK 1,240.50', 'formatMoney: a code gets a space', S.formatMoney(124050, 'NOK'));
check(S.formatMoney(124050, 'CA$') === 'CA$1,240.50', 'formatMoney: CA$ needs no space', S.formatMoney(124050, 'CA$'));
check(S.formatMoney(150000, '¥', true) === '¥1,500', 'formatMoney: yen in whole units', S.formatMoney(150000, '¥', true));

console.log(`${passed} passed${failed ? `, ${failed} failed` : ''}`);
if (failed) process.exitCode = 1;
