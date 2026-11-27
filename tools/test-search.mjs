// Tests for the collection's search (js/search.js): how the typed text is
// read, and which items it leaves.
//
//   node tools/test-search.mjs
//
// Loads the real catalog (js/database.js, js/characters.js) and js/search.js
// into a sandbox with a stub window. What a search should find is worked out
// from the catalog itself, so adding items doesn't break the tests. Prints
// "N passed" and exits non-zero on failure.

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const sandbox = { console };
sandbox.window = sandbox;
vm.createContext(sandbox);
for (const file of ['database.js', 'characters.js', 'search.js']) {
    vm.runInContext(readFileSync(fileURLToPath(new URL(`../js/${file}`, import.meta.url)), 'utf8'), sandbox, { filename: file });
}
const DB = vm.runInContext('AC_DATABASE', sandbox);
const PEOPLE = vm.runInContext('CHARACTERS', sandbox);
const S = sandbox.ACDB.search;

let passed = 0;
let failed = 0;
function check(condition, label, detail) {
    if (condition) passed++;
    else {
        failed++;
        console.log('FAIL:', label, detail === undefined ? '' : JSON.stringify(detail));
    }
}

const NOW = new Date(2026, 10, 22);
const read = text => S.parse(text, NOW);
// The items a search leaves. `owned` and `readIds` stand in for a collection.
function find(text, { wide = false, owned = new Set(), wishlist = new Set(), readIds = new Set() } = {}) {
    const hasStatus = (item, status) => ({
        owned: owned.has(item.id),
        unowned: !owned.has(item.id),
        wishlist: wishlist.has(item.id),
        unwished: !wishlist.has(item.id),
        read: readIds.has(item.id),
        unread: !readIds.has(item.id),
        missing: !owned.has(item.id),
    })[status];
    const query = read(text);
    return DB.filter(item => query.matches(item, { wide, hasStatus }));
}
const ids = items => items.map(item => item.id).join(',');
const same = (a, b) => ids(a) === ids(b);
const sameWords = (a, b) => a.join('|') === b.join('|');
const where = test => DB.filter(test);
const inCategory = (...names) => where(i => names.includes(i.category));
const ofType = (...names) => where(i => names.includes(i.type));
const ofGame = (...names) => where(i => names.includes(i.game));
// Does the item's own text (not its characters' names) hold one of these as a whole word or phrase?
const says = (item, ...forms) => {
    const words = ` ${S.key([item.name, item.game, item.year, item.category, item.description, item.contents, item.type, item.series || ''].join(' ')).replace(/[^a-z0-9]+/g, ' ')} `;
    return forms.some(form => words.includes(` ${form} `));
};

// A search and the items it must leave
function finds(text, expected, options) {
    const found = find(text, options);
    check(same(found, expected), `"${text}" finds ${expected.length} items`, found.length);
}
// Two searches that must leave the same items
function alike(a, b) {
    check(same(find(a), find(b)), `"${a}" finds what "${b}" finds`, [find(a).length, find(b).length]);
}

// ---- Plain text, as before ----
check(find('ezio').length > 0 && find('ezio').length < DB.length, 'a plain word finds some items, not all', find('ezio').length);
{
    // The description is searched, and so are the other names of the characters an item shows
    const blades = where(i => /hidden blade/i.test(i.description));
    check(blades.length > 0 && blades.every(i => find('hidden blade').includes(i)), 'words in a description are found');
    const bearer = PEOPLE.find(c => (c.aka || []).some(name => /eagle bearer/i.test(name)));
    const hers = where(i => bearer && (i.characters || []).includes(bearer.id));
    check(hers.length > 0 && hers.some(i => !says(i, 'eagle bearer')) && hers.every(i => find('eagle bearer').includes(i)),
        'a character\'s other name finds the items that show them', hers.length);
}
{
    // Nothing typed doesn't read the catalog: it works with no catalog loaded
    const bare = { console };
    bare.window = bare;
    vm.createContext(bare);
    vm.runInContext(readFileSync(fileURLToPath(new URL('../js/search.js', import.meta.url)), 'utf8'), bare, { filename: 'search.js' });
    let threw = null;
    try { bare.ACDB.search.parse('  ').matches({ id: 1 }); } catch (error) { threw = String(error); }
    check(threw === null, 'an empty search does not read the catalog', threw);
}
finds('', DB);
finds('   ', DB);
finds('zzzzqqq', []);
alike('altair', 'altaïr');
alike('EZIO', 'ezio');
check(find('connor').length >= 30, '"connor" finds Ratonhnhaké:ton\'s items', find('connor').length);
check(read('ezio').understood.length === 0, 'a plain word shows no "Understood as" line');
check(read('hidden blade').understood.length === 0, 'two plain words show no line');

// ---- Plurals ----
check(find('apples of eden').length > 0 && same(find('apples of eden'), find('apple of eden')), '"apples of eden" finds what "apple of eden" finds');
check(find('hidden blades').length >= find('hidden blade').length && find('hidden blade').length > 0, '"hidden blades" finds the hidden blades');
alike('funko pops', 'funko pop');
check(find('templars').length > 0 && find('templars').every(i => find('templar').includes(i)), '"templars" finds the Templar items');
// The singular counts only as a whole word: "tops" must not find every "stop" and "laptop"
{
    const text = i => ` ${S.key([i.name, i.game, i.category, i.type, i.description, i.contents, i.series || ''].join(' ')).replace(/[^a-z0-9]+/g, ' ')} `;
    check(find('tops').every(i => text(i).includes('tops') || text(i).includes(' top ')), 'a singular is matched as a whole word', find('tops').length);
}
// Only kinds of item are read by their singular: "where's" is not the filler "where"
check(find("where's").length < find('where').length, 'a word that only looks like a plural of filler is still searched for', find("where's").length);
check(read('mines').statuses.length === 0, '"mines" is not "mine"');
// Plurals the simple rule gets wrong still find the whole word: "axes" is "axe", "movies" is "movie"
for (const [plural, single] of [['axes', 'axe'], ['movies', 'movie'], ['scarves', 'scarf'], ['prizes', 'prize'], ['boxes', 'box']]) {
    const whole = where(i => says(i, single));
    check(whole.length > 0 && whole.every(i => find(plural).includes(i)), `"${plural}" finds every "${single}"`, [whole.length, find(plural).length]);
}

// ---- Filler ----
finds('how many items are there in the database?', DB);
finds('the', DB);
finds('show me everything', DB);
alike('how many apples of eden are there in the database?', 'apple of eden');
alike('show me all the funko pops', 'funko pop');
alike('do you have any hidden blades', 'hidden blade');
alike("assassin's creed statues", 'statues');

// ---- Kinds: categories and main types, like the dropdowns ----
finds('statues', inCategory('Statue'));
finds('statue', inCategory('Statue'));
finds('list all art books', ofType('Art Book'));
finds('artbooks', ofType('Art Book'));
finds('how many novels are there?', inCategory('Novel'));
finds('comics', inCategory('Comic Book'));
finds('graphic novels', ofType('Graphic Novel'));
finds("collector's editions", inCategory("Collector's Edition"));
finds('ces', inCategory("Collector's Edition"));
finds('figures', inCategory('Figurine', 'Action Figure'));
finds('action figures', inCategory('Action Figure'));
finds('jewellery', inCategory('Jewelry & Accessories'));
finds('board games', ofType('Board Game'));
finds('how many building sets are there?', inCategory('Building Sets'));
finds('building blocks', inCategory('Building Sets'));
finds('bricks', inCategory('Building Sets'));
finds('puzzles', inCategory('Puzzles'));
finds('novels and comics', inCategory('Novel', 'Comic Book'));
finds('statues or figurines', inCategory('Statue', 'Figurine'));
check(sameWords(read('statues').understood, ['Statue']), '"statues" is understood as Statue', read('statues').understood);
check(sameWords(read('figures').understood, ['Figurine or Action Figure']), '"figures" is understood as either', read('figures').understood);
check(sameWords(read('statues statue').understood, ['Statue']), 'a kind said twice is one part', read('statues statue').understood);
// Every category answers to its own name
for (const category of new Set(DB.map(i => i.category))) finds(category, inCategory(category));
// The word lists in js/search.js still fit the catalog: every value is one
// the catalog has, and every word is read as it (a renamed category or
// type would otherwise quietly go back to plain text)
for (const [words, field, values] of S.words.kinds) {
    const known = new Set(DB.map(i => i[field]));
    check(values.every(value => known.has(value)), `the kind words "${words[0]}" name ${field} values the catalog has`, values.filter(value => !known.has(value)));
    for (const word of words) {
        check(sameWords(read(word).understood, [values.join(' or ')]), `"${word}" is understood as ${values.join(' or ')}`, read(word).understood);
    }
}
// Makers are text: they find more than the Type value does
check(find('pureArts').length >= ofType('PureArts').length && read('pureArts').understood.length === 0, 'a maker is plain text');
check(same(find('statues by pureArts'), inCategory('Statue').filter(i => find('"purearts"').includes(i))), '"statues by pureArts" is the PureArts statues');

// ---- Games ----
finds('valhalla', ofGame("Assassin's Creed Valhalla"));
finds('ac2', ofGame("Assassin's Creed II"));
finds('AC 3', ofGame("Assassin's Creed III"));
finds("assassin's creed 3", ofGame("Assassin's Creed III"));
finds("assassin's creed iii", ofGame("Assassin's Creed III"));
finds('ac3 liberation', ofGame("Assassin's Creed III: Liberation"));
finds('liberation', ofGame("Assassin's Creed III: Liberation"));
finds('black flag', ofGame("Assassin's Creed IV: Black Flag"));
finds('ac4', ofGame("Assassin's Creed IV: Black Flag"));
finds('black flag resynced', ofGame("Assassin's Creed Black Flag Resynced"));
finds('resynced', ofGame("Assassin's Creed Black Flag Resynced"));
finds('ac1', ofGame("Assassin's Creed"));
finds('the movie', ofGame("Assassin's Creed (Movie)"));
finds('chronicles', ofGame("Assassin's Creed Chronicles: China", "Assassin's Creed Chronicles: India", "Assassin's Creed Chronicles: Russia"));
finds('valhalla and odyssey', ofGame("Assassin's Creed Valhalla", "Assassin's Creed Odyssey"));
finds('valhalla statues', where(i => i.game === "Assassin's Creed Valhalla" && i.category === 'Statue'));
finds("assassin's creed", DB);
// Every game but "General" answers to its full name
for (const game of new Set(DB.map(i => i.game))) {
    if (game !== 'General' && game !== "Assassin's Creed") finds(game, ofGame(game));
}
// The other names in js/search.js are for games the catalog has, and each is read as its game
for (const [game, names] of Object.entries(S.words.games)) {
    check(ofGame(game).length > 0, `the catalog has the game "${game}"`);
    for (const name of names) {
        check((read(`ac ${name}`).understood[0] || '').split(' or ').includes(game), `"ac ${name}" is understood as ${game}`, read(`ac ${name}`).understood);
    }
}

// ---- Years ----
const year = test => where(i => test(i.year));
finds('2012', year(y => y === 2012));
finds('in 2017', year(y => y === 2017));
finds('what came out in 2020', year(y => y === 2020));
finds('before 2012', year(y => y < 2012));
finds('older than 2012', year(y => y < 2012));
finds('after 2020', year(y => y > 2020));
finds('since 2020', year(y => y >= 2020));
finds('2020 or later', year(y => y >= 2020));
finds('2020+', year(y => y >= 2020));
finds('until 2012', year(y => y <= 2012));
finds('2010-2014', year(y => y >= 2010 && y <= 2014));
finds('2010 - 2014', year(y => y >= 2010 && y <= 2014));
finds('2014 to 2010', year(y => y >= 2010 && y <= 2014));
finds('between 2010 and 2014', year(y => y >= 2010 && y <= 2014));
finds('from 2015 to 2018', year(y => y >= 2015 && y <= 2018));
finds('the 2010s', year(y => y >= 2010 && y <= 2019));
finds('this year', year(y => y === 2026));
finds('last year', year(y => y === 2025));
finds('next year', year(y => y === 2027));
finds('2012 2013', year(y => y === 2012 || y === 2013));
finds('after 2010 before 2015', year(y => y > 2010 && y < 2015));
finds('statues before 2012', inCategory('Statue').filter(i => i.year < 2012));
finds('statues from 2015', inCategory('Statue').filter(i => i.year === 2015));
check(sameWords(read('ezio statues before 2012').understood, ['Statue', 'before 2012', '“ezio”']), 'the line lists kinds, years, then words', read('ezio statues before 2012').understood);
check(read('2010-2014').understood[0] === '2010–2014' && read('since 2020').understood[0] === '2020 or later', 'years are labelled as read');
finds('between 2010-2014', year(y => y >= 2010 && y <= 2014));
finds("this year's statues", inCategory('Statue').filter(i => i.year === 2026));
finds('comics from 2012 and 2015', inCategory('Comic Book').filter(i => i.year === 2012 || i.year === 2015));
finds('not before 2012', year(y => y >= 2012));
// A year word with no year after it (yet) is ignored: "statues before", on the way to "statues before 2012", is the statues
for (const text of ['statues before', 'statues after', 'statues between', 'statues since', 'statues until']) finds(text, inCategory('Statue'));
// A year the catalog has nothing near is text, as before
check(read('1191').understood.length === 0, 'a story year is plain text');
{
    const all = DB.map(i => i.year);
    const [min, max] = [Math.min(...all), Math.max(...all)];
    check(sameWords(read(`${min}`).understood, [`${min}`]) && sameWords(read(`${max}`).understood, [`${max}`]), 'the first and last years of the catalog are years');
    check(read(`${min - 1}`).understood.length === 0 && read(`${max + 1}`).understood.length === 0, 'a year just outside the catalog is plain text', [min - 1, max + 1]);
}

// ---- Your collection ----
const statuses = text => read(text).statuses.join(',');
check(statuses('how many statues do i own') === 'owned', '"do i own" is owned');
check(statuses('my statues') === 'owned', '"my" is owned');
check(statuses("statues i don't own") === 'unowned', '"i don\'t own" is not owned');
check(statuses('which ones am i missing?') === 'unowned', '"am i missing" is not owned');
check(statuses('not mine') === 'unowned', '"not mine" is not owned');
check(statuses("what's on my wishlist") === 'wishlist', '"my wishlist" is the wishlist');
check(statuses('missing stories') === 'missing', '"missing stories" is Missing Stories');
check(statuses("comics i haven't read") === 'unread', '"i haven\'t read" is not read');
check(statuses("comics i've read") === 'read', '"i\'ve read" is read');
check(statuses('comics to read') === 'unread', '"to read" is not read');
check(statuses("things i own but haven't read") === 'owned,unread', 'owned and not read together');
check(statuses('i want to see all statues') === '', '"i want to see" asks for no status');
check(statuses('mary read') === '' && read('mary read').understood.length === 0, '"mary read" is plain text');
{
    const statues = inCategory('Statue');
    const owned = new Set(statues.slice(0, 3).map(i => i.id));
    finds('statues i own', statues.slice(0, 3), { owned });
    finds("statues i don't own", statues.slice(3), { owned });
    finds('how many do i own?', statues.slice(0, 3), { owned });
    // A "not" turns a status round, the wishlist too; before "missing stories" it means nothing
    finds('statues except mine', statues.slice(3), { owned });
    finds('statues -owned', statues.slice(3), { owned });
    const wishlist = new Set(statues.slice(0, 2).map(i => i.id));
    finds('statues on my wishlist', statues.slice(0, 2), { wishlist });
    finds('statues not on my wishlist', statues.slice(2), { wishlist });
    finds('statues -wishlist', statues.slice(2), { wishlist });
}
check(statuses('not on my wishlist') === 'unwished' && sameWords(read('not on my wishlist').understood, ['not on your wishlist']), '"not on my wishlist" is its opposite', read('not on my wishlist').understood);
check(statuses('comics -unread') === 'read' && statuses('everything except unread') === 'read', 'a "not" before "unread" is read');
check(statuses('not missing stories') === '', '"not missing stories" asks for no status');
// "read online": items with a read link, whatever has been read
finds('which comics can i read online', inCategory('Comic Book').filter(i => i.read));
check(statuses('comics i can read online') === '', '"read online" asks for no status');
for (const text of ["comics i can't read online", 'comics not read online', 'comics not available online', 'comics not free to read']) {
    finds(text, inCategory('Comic Book').filter(i => !i.read));
    check(statuses(text) === '', `"${text}" asks for no status`, statuses(text));
}

// ---- Not, or, quotes ----
finds('not statues', where(i => i.category !== 'Statue'));
finds('everything except comics', where(i => i.category !== 'Comic Book'));
finds('-statues', where(i => i.category !== 'Statue'));
finds('statues without ezio', inCategory('Statue').filter(i => !find('"ezio"').includes(i)));
finds('figurines -funko', inCategory('Figurine').filter(i => !find('"funko"').includes(i)));
finds('not 2012', year(y => y !== 2012));
finds('mcfarlane or neca', where(i => find('mcfarlane').includes(i) || find('neca').includes(i)));
finds('ezio and altair', find('ezio').filter(i => find('altair').includes(i)));
check(find('ezio and altair').length > 0, '"and" between two words finds the items with both');
// A "not" also covers the next of its kind after "and" or "or", and nothing else
finds('everything except comics and novels', where(i => i.category !== 'Comic Book' && i.category !== 'Novel'));
finds('not statues or figurines', where(i => i.category !== 'Statue' && i.category !== 'Figurine'));
finds('statues without ezio or altair', inCategory('Statue').filter(i => !find('"ezio"').includes(i) && !find('"altair"').includes(i)));
finds('not comics and before 2012', where(i => i.category !== 'Comic Book' && i.year < 2012));
finds('figurines -funko neca', inCategory('Figurine').filter(i => !find('"funko"').includes(i) && find('neca').includes(i)));
check(sameWords(read('except comics and novels').understood, ['not Comic Book', 'not Novel']), 'both left-out kinds are on the line', read('except comics and novels').understood);
check(sameWords(read('novels and comics').understood, ['Novel or Comic Book']), '"and" between two kinds is still either', read('novels and comics').understood);
// Quoted text is exact and is never read as a kind, a game or a year
check(find('"statue"').length > inCategory('Statue').length, '"statue" in quotes finds every mention', find('"statue"').length);
check(find('"art book"').every(i => find('"art"').includes(i)) && find('"art book"').length >= ofType('Art Book').length, 'a quoted phrase is matched whole');
check(read('"2012"').understood.length === 0 && read('"statue"').understood.length === 0, 'quoted text shows no line');
check(find('"apple of eden').length === find('apple of eden').length, 'an unclosed quote is ignored');

// ---- Items that only mention the word ----
for (const text of ['statues', 'figurines', 'steelbook', 'valhalla', '2012', 'ezio figurine', 'art books and statues']) {
    const strict = find(text);
    const wide = find(text, { wide: true });
    check(strict.every(i => wide.includes(i)) && wide.length >= strict.length, `"${text}": the wide search keeps every strict result`);
}
check(find('steelbook', { wide: true }).length > find('steelbook').length, '"steelbook" has items that only mention it');
// The wide search lets in the mentions and nothing else
finds('statues', where(i => i.category === 'Statue' || says(i, 'statue', 'statues')), { wide: true });
finds('2012', where(i => i.year === 2012 || says(i, '2012')), { wide: true });
finds('valhalla', where(i => i.game === "Assassin's Creed Valhalla" || says(i, 'valhalla', 'valhallas')), { wide: true });
check(sameWords(read('ezio statues').mentionWords, ['statue']), 'the mention word is the singular', read('ezio statues').mentionWords);
check(read('before 2012').mentionWords.length === 0 && read('ezio').mentionWords.length === 0, 'spans and plain words offer no wider search');
check(same(find('not statues', { wide: true }), find('not statues')), 'a left-out kind is never widened');

// ---- An item's own name always finds it ----
{
    const lost = DB.filter(item => !find(item.name).includes(item));
    check(lost.length === 0, 'every item is found by its full name', lost.slice(0, 5).map(i => i.name));
    const venice = where(i => i.name.includes('Brotherhood of Venice'));
    check(venice.length > 0 && venice.every(i => find('brotherhood of venice').includes(i)), 'a name with a game word in it is found whatever the item\'s game');
    // ...with filler before or after it too
    for (const text of ['the brotherhood of venice', 'show me brotherhood of venice', 'brotherhood of venice please']) {
        check(venice.every(i => find(text).includes(i)), `"${text}" finds every Brotherhood of Venice item`, find(text).length);
    }
    // "or" in a name is a word: "join or die" is the Join or Die Edition, not everything with "join" or "die"
    const joinOrDie = where(i => /join or die/i.test(i.name));
    check(joinOrDie.length > 0 && same(find('join or die'), where(i => find('"join"').includes(i) && find('"die"').includes(i) && find('"or"').includes(i)))
        && joinOrDie.every(i => find('join or die').includes(i)) && read('join or die').understood.length === 0,
        '"or" between two words of a name is a plain word', [joinOrDie.length, find('join or die').length]);
}

// ---- Typing never throws ----
for (const text of ['"', '""', '-', '--', '- -', '-"', 'not', 'or', 'or or', 'not not', '2010-', '-2012', '(', '?', '#', '+', 'アサシン', 'ac', 'ac ', '1/6', '#1', 'vol. 2', 'a'.repeat(500)]) {
    let threw = null;
    try { find(text); read(text).understood.join(''); } catch (error) { threw = String(error); }
    check(threw === null, `"${text.slice(0, 20)}" does not throw`, threw);
}

// ---- The Creed answers (an Easter egg), and changes nothing the search finds ----
check(S.reply('nothing is true') === 'Everything is permitted.', '"nothing is true" gets its reply', S.reply('nothing is true'));
check(S.reply('  Nothing is true, everything is permitted. ') === 'We work in the dark to serve the light. We are Assassins.', 'case and punctuation don\'t matter to a reply');
check(S.reply('Requiescat in pace') === 'Rest in peace.', '"requiescat in pace" gets its reply');
for (const text of ['', 'ezio', 'nothing', 'nothing is true statue', 'is nothing true']) {
    check(S.reply(text) === null, `"${text}" gets no reply`, S.reply(text));
}
check(same(find('nothing is true'), where(i => says(i, 'nothing') && says(i, 'true'))) && read('nothing is true').understood.length === 0,
    'a line of the Creed is still searched as plain words', find('nothing is true').length);

check(S.isEagleVision('eagle vision') && S.isEagleVision('  Eagle Vision! '), '"eagle vision" is the Eagle Vision switch, whatever its case and punctuation');
for (const text of ['', 'eagle', 'vision', 'eagle vision statue', 'vision eagle']) {
    check(!S.isEagleVision(text), `"${text}" is not the Eagle Vision switch`);
}
check(same(find('eagle vision'), where(i => says(i, 'eagle') && says(i, 'vision'))) && read('eagle vision').understood.length === 0,
    '"eagle vision" is still searched as plain words', find('eagle vision').length);

console.log(`${passed} passed${failed ? `, ${failed} failed` : ''}`);
process.exit(failed ? 1 : 0);
