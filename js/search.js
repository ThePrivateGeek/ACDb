/* ============================================
   ACDb - Search: reading what was typed
   ============================================ */

// The collection's search box takes plain questions ("how many statues
// before 2012", "comics I haven't read", "list all art books"). Nothing is
// sent anywhere: parse() reads the text word by word against the lists
// below and the catalog's own values, and returns a question app.js asks
// of every item.
//
// What a word can be read as, first match wins, longest phrase first:
//   - "quoted text": exactly that text, never anything else
//   - years: "2017", "before 2012", "2010-2014", "since 2020", "2010s"
//   - your collection: "I own", "missing", "wishlist", "unread"
//   - a kind of item: a category or main type name ("statues", "art books")
//   - a game: its title or short name ("valhalla", "ac2")
//   - "not", "without", "except", -word: leaves out what follows, and the
//     next of its kind after "and" or "or" ("except comics and novels")
//   - "or" between two words: either word
//   - filler ("how many", "list", "the", "are there"): ignored
//   - anything else: text, matched as before
//
// Two kinds, two games or two years show items with either, as two ticks
// in one dropdown do. Kind, game and year words filter strictly, like the
// dropdowns; `wide` also lets in the items that only mention the word.
// If the whole text is part of an item's name, that item always matches:
// names contain these words too ("Mary Read", "Join or Die Edition").

(function () {
    'use strict';

    window.ACDB = window.ACDB || {};
    const A = window.ACDB;

    // ---- Words ----

    // Ignored wherever they stand. A filler word typed alone finds every
    // item, so keep words collectors search for on their own out of this
    // list ("display", "new", "first", "last", "pieces"). The year words
    // are here for when no year follows them: "statues before", on the way
    // to "statues before 2012", must not come up empty.
    const FILLER = `
        a an the of in on at to for from by with but that this these those it its as into about than
        is are was were be been am im ive do does did has have had got can could would
        how many much what whats which who where when why
        list show find give tell get see search look looking count number total want need like
        me us i you we your our
        all any every each some only just also ever yet still already currently now so
        there here exist exists existing available different kind kinds type types
        item items thing things stuff collectible collectibles collectable collectables
        merch merchandise product products
        database db acdb catalogue catalog site website
        released release came come out made published produced
        featuring showing containing including related based called named
        game games ones everything anything please thanks
        newest latest oldest
        between before after since until till during year years older newer earlier later prior onwards onward
        ac
    `;
    const FILLER_PHRASES = ['assassins creed', 'assassin creed', 'so far'];

    const NOT_WORDS = ['not', 'without', 'except', 'excluding', 'arent', 'isnt', 'other than'];

    // Status words: [what they ask for, the phrases]. Only clear phrases:
    // a bare "read", "want" or "need" stays text ("mary read" is a pirate).
    const STATUS_WORDS = [
        ['own', 'owned', [
            'own', 'owned', 'mine', 'my', 'i own', 'do i own', 'i already own', 'i have', 'do i have',
            'i already have', 'have i got', 'ive got', 'i got', 'i bought', 'ive bought', 'i collected',
            'ive collected', 'my collection', 'in my collection', 'from my collection',
        ]],
        ['own', 'unowned', [
            'unowned', 'not owned', 'not mine', 'i dont own', 'i do not own', 'dont own', 'do not own',
            'i dont have', 'i do not have', 'dont have', 'do not have', 'havent got', 'i havent got',
            'not in my collection', 'missing from my collection', 'missing', 'am i missing',
            'i am missing', 'im missing', 'still need', 'i still need', 'do i still need',
            'left to collect', 'left to get',
        ]],
        ['own', 'wishlist', [
            'wishlist', 'wish list', 'wishlisted', 'my wishlist', 'my wish list', 'on my wishlist',
            'on my wish list', 'in my wishlist',
        ]],
        ['own', 'missing', [
            'missing story', 'missing stories', 'stories i am missing', 'stories im missing',
        ]],
        ['read', 'read', [
            'i have read', 'ive read', 'have i read', 'i read', 'i already read', 'ive already read',
            'already read', 'have read', 'i finished', 'ive finished', 'finished reading',
        ]],
        ['read', 'unread', [
            'unread', 'not read', 'not yet read', 'havent read', 'i havent read', 'have not read',
            'i have not read', 'didnt read', 'i didnt read', 'to read', 'left to read', 'still to read',
            'need to read', 'i need to read', 'i still need to read',
        ]],
    ];

    // Items with a read link, and items without one. The "not" phrases are
    // listed whole, or "not read" would be taken first, as a status.
    const ONLINE_WORDS = [
        [true, [
            'read online', 'reading online', 'readable online', 'to read online', 'can i read online',
            'i can read online', 'free to read', 'read for free', 'available online', 'available to read',
        ]],
        [false, [
            'not read online', 'cant read online', 'i cant read online', 'cannot read online',
            'i cannot read online', 'can not read online', 'i can not read online', 'not readable online',
        ]],
    ];

    // Words for a kind of item, on top of the category names themselves:
    // [words, field, its values]. Singular; the plural is understood. Only
    // values the catalog has are used, so a renamed category drops out here
    // and its words go back to matching text. Maker types (PureArts,
    // McFarlane, Funko Pop) are left to the text on purpose: it finds more.
    const KIND_WORDS = [
        [['figure'], 'category', ['Figurine', 'Action Figure']],
        [['collector edition', 'ce', 'ces'], 'category', ["Collector's Edition"]],
        [['steel book'], 'category', ['Steelbook']],
        [['comic'], 'category', ['Comic Book']],
        [['art and reference', 'reference book'], 'category', ['Art & Reference']],
        [['replica', 'prop'], 'category', ['Replica/Prop']],
        [['board and card game', 'tabletop game'], 'category', ['Board & Card Games']],
        [['jewelry', 'jewellery', 'accessory'], 'category', ['Jewelry & Accessories']],
        [['jigsaw', 'jigsaw puzzle'], 'category', ['Puzzles']],
        [['building block', 'brick', 'brick set', 'block', 'block set', 'construction set'], 'category', ['Building Sets']],
        [['decor'], 'category', ['Home Decor']],
        [['gadget', 'tech and gadgets'], 'category', ['Tech & Gadgets']],
        [['art book', 'artbook'], 'type', ['Art Book']],
        [['graphic novel'], 'type', ['Graphic Novel']],
        [['manga'], 'type', ['Manga']],
        [['magazine'], 'type', ['Magazine']],
        [['official guide', 'strategy guide'], 'type', ['Official Guide']],
        [['companion book'], 'type', ['Companion Book']],
        [['gamebook', 'game book'], 'type', ['Gamebook']],
        [['board game'], 'type', ['Board Game']],
        [['card game'], 'type', ['Card Game']],
        [['vinyl soundtrack'], 'type', ['Vinyl Soundtrack']],
    ];

    // Other names for a game, on top of its title without "Assassin's Creed"
    // ("valhalla", "chronicles china", "movie"). Each is also understood
    // after "ac" and "assassin's creed"; a number also as "ac2". A new game
    // needs a line here only if its title alone isn't what people type.
    const GAME_NAMES = {
        "Assassin's Creed": ['1'],
        "Assassin's Creed II": ['2'],
        "Assassin's Creed III": ['3'],
        "Assassin's Creed III: Liberation": ['liberation', '3 liberation'],
        "Assassin's Creed IV: Black Flag": ['black flag', '4', 'iv', '4 black flag'],
        "Assassin's Creed Black Flag Resynced": ['resynced'],
        "Assassin's Creed (Movie)": ['film'],
        "Assassin's Creed Chronicles: China": ['chronicles'],
        "Assassin's Creed Chronicles: India": ['chronicles'],
        "Assassin's Creed Chronicles: Russia": ['chronicles'],
    };

    const STATUS_LABELS = {
        owned: 'owned',
        unowned: 'not owned',
        wishlist: 'on your wishlist',
        unwished: 'not on your wishlist',
        missing: 'missing stories',
        read: 'read',
        unread: 'not read',
    };

    // What a "not" before a status word asks for ("-owned", "except mine",
    // "not on my wishlist"). "Missing stories" has no opposite.
    const NOT_STATUS = { owned: 'unowned', unowned: 'owned', wishlist: 'unwished', read: 'unread', unread: 'read' };

    // ---- Text ----

    // Case, accents and apostrophes are ignored ("altair" finds Altaïr,
    // "obrien" O'Brien), as on the Games and Characters tabs
    function searchKey(text) {
        return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/['‘’ʿʾ]/g, '');
    }

    // Folded text as words between single spaces, with a space at each end,
    // so " statue " finds the whole word
    function wordsOf(folded) {
        return ` ${folded.replace(/[^\p{L}\p{N}]+/gu, ' ').trim()} `;
    }

    // A typed word without the punctuation around it ("database?", "(2017)").
    // A leading # ("#1") and a trailing + ("2020+") mean something. Two
    // steps from the start of the word, so a long run of punctuation inside
    // one costs no more than its length.
    function cleanWord(folded) {
        const start = folded.search(/[\p{L}\p{N}#]/u);
        const found = start < 0 ? null : /^.*[\p{L}\p{N}+]/su.exec(folded.slice(start));
        return found ? found[0] : '';
    }

    // What a plural may be the plural of: "statues" -> "statue", "stories"
    // -> "story", "boxes" -> "box", "axes" -> "ax" and "axe", "scarves" ->
    // "scarf". A wrong guess costs nothing, since a singular only ever
    // matches a whole word. Empty when the word doesn't look like a plural.
    function singulars(word) {
        if (word.length <= 3 || !word.endsWith('s') || word.endsWith('ss')) return [];
        const forms = [];
        if (word.endsWith('ies')) forms.push(`${word.slice(0, -3)}y`);
        if (/(ch|sh|x|z|ss)es$/.test(word)) forms.push(word.slice(0, -2));
        if (word.endsWith('ves')) forms.push(`${word.slice(0, -3)}f`, `${word.slice(0, -3)}fe`);
        forms.push(word.slice(0, -1));
        return forms;
    }

    // A phrase with its last word made singular, each way it can be
    function singularLasts(words) {
        return singulars(words[words.length - 1]).map(last => [...words.slice(0, -1), last]);
    }

    // The words of a phrase from the lists above, as the typed text is split
    function phraseWords(text) {
        return searchKey(text).split(/\s+/).map(cleanWord).filter(Boolean);
    }

    // The whole-word forms that count as a mention: the phrase, and its plural
    function mentionForms(phrase) {
        const text = wordsOf(phrase).trim();
        const forms = [` ${text} `, ` ${text}s `];
        if (text.endsWith('y')) forms.push(` ${text.slice(0, -1)}ies `);
        return forms;
    }

    // ---- What the catalog gives: each item's text, and the phrase list ----

    let index = null;

    function getIndex() {
        if (index) return index;

        // What the text is matched against, per item: its own fields and
        // the names (and other names) of the characters it shows, so
        // "connor" finds Ratonhnhaké:ton's items. Built once: the catalog
        // doesn't change while the page is open.
        const characterNames = new Map(CHARACTERS.map(c => [c.id, [c.name, ...(c.aka || [])].join(' ')]));
        const docs = new Map(AC_DATABASE.map(i => {
            const text = searchKey(
                `${i.name} ${i.game} ${i.year} ${i.category} ${i.description} ${i.contents} ${i.type} ${i.series || ''} `
                + (i.characters || []).map(id => characterNames.get(id) || '').join(' '));
            return [i.id, { text, words: wordsOf(text), name: wordsOf(searchKey(i.name)) }];
        }));

        // Phrase -> what it means. The first meaning given wins, except
        // that two games under one phrase ("chronicles") are both kept.
        // `alsoSingular` stores a catalog value's singular too ("Puzzles").
        const phrases = new Map();
        const put = (text, meaning, alsoSingular = false) => {
            const words = phraseWords(text);
            if (words.length === 0) return;
            [words, ...(alsoSingular ? singularLasts(words) : [])].forEach(form => {
                const key = form.join(' ');
                const known = phrases.get(key);
                if (!known) phrases.set(key, meaning);
                else if (known.is === 'game' && meaning.is === 'game') {
                    phrases.set(key, { is: 'game', values: [...new Set([...known.values, ...meaning.values])] });
                }
            });
        };

        STATUS_WORDS.forEach(([field, value, list]) => list.forEach(text => put(text, { is: 'status', field, value })));
        ONLINE_WORDS.forEach(([value, list]) => list.forEach(text => put(text, { is: 'online', value })));

        const categories = new Set(AC_DATABASE.map(i => i.category));
        const types = new Set(AC_DATABASE.map(i => i.type));
        categories.forEach(category => put(category, { is: 'kind', field: 'category', values: [category] }, true));
        KIND_WORDS.forEach(([list, field, wanted]) => {
            const values = wanted.filter(v => (field === 'category' ? categories : types).has(v));
            if (values.length > 0) list.forEach(text => put(text, { is: 'kind', field, values }));
        });

        new Set(AC_DATABASE.map(i => i.game)).forEach(game => {
            const title = phraseWords(game).join(' ');
            if (!title.startsWith('assassins creed')) return;   // "General"
            const rest = title.slice('assassins creed'.length).trim();
            [...(rest ? [rest] : []), ...(GAME_NAMES[game] || [])].forEach(name => {
                const meaning = { is: 'game', values: [game] };
                put(`ac ${name}`, meaning);
                put(`assassins creed ${name}`, meaning);
                if (/^\d/.test(name)) put(`ac${name}`, meaning);
                else if (!/^[ivx]+$/.test(name)) put(name, meaning);   // a bare "ii" is too little to go on
            });
        });

        NOT_WORDS.forEach(text => put(text, { is: 'not' }));
        put('or', { is: 'or' });
        put('and', { is: 'and' });
        FILLER.split(/\s+/).concat(FILLER_PHRASES).forEach(text => put(text, { is: 'filler' }));

        const years = AC_DATABASE.map(i => i.year);
        index = {
            docs,
            names: [...docs.values()].map(doc => doc.name).join(''),   // every name's words, for "or" in a name
            phrases,
            longest: Math.max(...[...phrases.keys()].map(key => key.split(' ').length)),
            minYear: Math.min(...years),
            maxYear: Math.max(...years),
        };
        return index;
    }

    // ---- Reading the text ----

    // The typed text as pieces: { quote } for "quoted text", { word } for
    // the rest. `not` marks a leading minus ("-funko").
    function piecesOf(text) {
        const pieces = [];
        const pattern = /(-?)["“”]([^"“”]*)["“”]|(\S+)/g;
        let found;
        while ((found = pattern.exec(text)) !== null) {
            if (found[3] === undefined) {
                const quote = searchKey(found[2]).trim().replace(/\s+/g, ' ');
                if (quote) pieces.push({ quote, not: found[1] === '-' });
                continue;
            }
            let raw = found[3];
            if (/^[-–—]+$/.test(raw)) {   // "2010 - 2014"
                pieces.push({ word: '-', not: false });
                continue;
            }
            const not = raw.length > 1 && raw.startsWith('-');
            if (not) raw = raw.slice(1);
            const word = cleanWord(searchKey(raw));
            if (word) pieces.push({ word, not });
        }
        return pieces;
    }

    const YEAR = /^(?:19|20)\d\d$/;
    const YEAR_SPAN = /^((?:19|20)\d\d)[-–—]((?:19|20)\d\d)$/;
    const YEAR_PLUS = /^((?:19|20)\d\d)\+$/;
    const DECADE = /^((?:19|20)\d0)s$/;
    const SPAN_WORDS = ['to', 'until', 'till', 'through', '-'];

    // A year or a span of years starting at piece `at`, or null. `used` is
    // how many pieces it took; `word` marks a bare year, which may also be
    // just a mention ("2016" in a name).
    function readYears(pieces, at, idx, now) {
        const word = k => {
            const piece = pieces[at + k];
            return piece && piece.word !== undefined && (k === 0 || !piece.not) ? piece.word : '';
        };
        const year = k => (YEAR.test(word(k)) ? Number(word(k)) : null);
        const span = (a, b, used) => {
            const min = Math.min(a, b);
            const max = Math.max(a, b);
            return { min, max, label: min === max ? `${min}` : `${min}–${max}`, used };
        };
        const before = (y, used) => ({ min: -Infinity, max: y - 1, label: `before ${y}`, used });
        const after = (y, used) => ({ min: y + 1, max: Infinity, label: `after ${y}`, used });
        const since = (y, used) => ({ min: y, max: Infinity, label: `${y} or later`, used });
        const upTo = (y, used) => ({ min: -Infinity, max: y, label: `${y} or earlier`, used });
        const [w0, w1, w2] = [word(0), word(1), word(2)];
        let found;

        // "between 2010 and 2014", "from 2010 to 2014", "2010 to 2014",
        // "2010-2014". "From 2012 and 2015" is two years.
        if ((w0 === 'between' || w0 === 'from') && year(1) && (SPAN_WORDS.includes(w2) || (w0 === 'between' && w2 === 'and')) && year(3)) {
            return span(year(1), year(3), 4);
        }
        if (year(0) && SPAN_WORDS.includes(w1) && year(2)) return span(year(0), year(2), 3);
        if ((found = YEAR_SPAN.exec(w0))) return span(Number(found[1]), Number(found[2]), 1);

        // "older than 2012", "prior to 2012", "newer than 2020", "up to 2012"
        if ((((w0 === 'older' || w0 === 'earlier') && w1 === 'than') || (w0 === 'prior' && w1 === 'to')) && year(2)) {
            return before(year(2), 3);
        }
        if ((w0 === 'newer' || w0 === 'later') && w1 === 'than' && year(2)) return after(year(2), 3);
        if (w0 === 'up' && w1 === 'to' && year(2)) return upTo(year(2), 3);

        // "from 2020 on", "2020 or later", "2012 or earlier", "2020 onwards", "2020+"
        if (w0 === 'from' && year(1) && ['on', 'onwards', 'onward'].includes(w2)) return since(year(1), 3);
        if (year(0) && (w1 === 'and' || w1 === 'or') && ['later', 'newer', 'after'].includes(w2)) return since(year(0), 3);
        if (year(0) && (w1 === 'and' || w1 === 'or') && ['earlier', 'older', 'before'].includes(w2)) return upTo(year(0), 3);
        if (year(0) && (w1 === 'onwards' || w1 === 'onward')) return since(year(0), 2);
        if ((found = YEAR_PLUS.exec(w0))) return since(Number(found[1]), 1);

        // "before 2012", "after 2020", "since 2020", "until 2012"
        if (w0 === 'before' && year(1)) return before(year(1), 2);
        if (w0 === 'after' && year(1)) return after(year(1), 2);
        if (w0 === 'since' && year(1)) return since(year(1), 2);
        if ((w0 === 'until' || w0 === 'till') && year(1)) return upTo(year(1), 2);

        // "in 2017", "from 2017", "the 2010s", "this year", "this year's"
        if (['in', 'from', 'of', 'during', 'year'].includes(w0) && year(1)) return span(year(1), year(1), 2);
        if ((found = DECADE.exec(w0))) return { min: Number(found[1]), max: Number(found[1]) + 9, label: w0, used: 1 };
        if ((w1 === 'year' || w1 === 'years') && ['this', 'last', 'next'].includes(w0)) {
            const y = now.getFullYear() + { this: 0, last: -1, next: 1 }[w0];
            return span(y, y, 2);
        }

        // A bare year, when the catalog has items from around then
        if (year(0) && year(0) >= idx.minYear && year(0) <= idx.maxYear) return { ...span(year(0), year(0), 1), word: w0 };
        return null;
    }

    // The longest phrase from the list starting at piece `at`, or null. A
    // kind of item is also looked up by its singular ("art books"); nothing
    // else is, or "where's" would be read as "where". `typed` is the phrase
    // as it was found, `single` its singular.
    function readPhrase(pieces, at, idx) {
        for (let length = Math.min(idx.longest, pieces.length - at); length >= 1; length--) {
            const slice = pieces.slice(at, at + length);
            if (slice.some((piece, k) => piece.word === undefined || (k > 0 && piece.not))) continue;
            const words = slice.map(piece => piece.word);
            const singles = singularLasts(words);
            for (const form of [words, ...singles]) {
                const meaning = idx.phrases.get(form.join(' '));
                if (!meaning || (form !== words && meaning.is !== 'kind')) continue;
                // Typed as the catalog's own plural ("puzzles"): its singular is the one the catalog knows
                const single = form !== words ? form
                    : singles.find(other => idx.phrases.get(other.join(' ')) === meaning) || singles[0] || words;
                return { meaning, used: length, typed: form.join(' '), single: single.join(' ') };
            }
        }
        return null;
    }

    // Do the words around the "or" at piece `at` stand that way in an
    // item's name ("Join or Die Edition")? Then it is a word, not a choice.
    function orInName(pieces, at, idx) {
        const before = pieces[at - 1];
        const after = pieces[at + 1];
        return Boolean(before && after && before.word !== undefined && after.word !== undefined && !after.not
            && idx.names.includes(` ${before.word} or ${after.word}`));
    }

    // One group of parts (kinds, games, years): an item needs one of the
    // wanted ones and none of the unwanted ones
    function passes(parts, test) {
        const wanted = parts.filter(part => !part.not);
        return (wanted.length === 0 || wanted.some(part => test(part, false)))
            && !parts.some(part => part.not && test(part, true));
    }

    function parse(text, now = new Date()) {
        const pieces = piecesOf(text);
        // Nothing typed: every item, and the catalog's text isn't read for it
        if (pieces.length === 0) return { matches: () => true, statuses: [], understood: [], mentionWords: [] };

        const idx = getIndex();
        const kinds = [];
        const games = [];
        const years = [];
        const texts = [];
        const status = { own: null, read: null };
        let online = null;
        let not = false;      // a "not" waiting for what it leaves out
        let notList = null;   // the group the part just left out went into
        let joined = false;   // an "and" or "or" since the last part
        let either = false;   // an "or" waiting for its second word
        let lastText = null;  // the text part just before, for "or"
        let first = -1;       // the first and last pieces that are no filler
        let last = -1;

        // Is the part being added left out? After a "not", and after a
        // left-out part of its own group and an "and" or "or": "except
        // comics and novels", "without ezio or altair".
        const takeNot = (list = null) => {
            const was = not || (joined && list !== null && notList === list);
            not = false;
            joined = false;
            notList = was ? list : null;
            return was;
        };
        const addText = (alt) => {
            const isNot = takeNot(texts);
            if (either && lastText && !isNot && !lastText.not) lastText.alts.push(alt);
            else texts.push(lastText = { alts: [alt], not: isNot });
            either = false;
        };
        // A kind, a game or a year; said twice ("statues statue"), it is one part
        const addPart = (list, part) => {
            const isNot = takeNot(list);
            if (!list.some(known => known.label === part.label && known.field === part.field && known.not === isNot)) {
                list.push({ ...part, not: isNot });
            }
            either = false;
            lastText = null;
        };
        const used = (at, count) => {
            if (first < 0) first = at;
            last = at + count - 1;
        };

        for (let at = 0; at < pieces.length;) {
            const piece = pieces[at];
            if (piece.not) not = true;
            if (piece.quote !== undefined) {
                used(at, 1);
                addText({ phrase: piece.quote });
                at++;
                continue;
            }
            const span = readYears(pieces, at, idx, now);
            if (span) {
                used(at, span.used);
                addPart(years, span.word ? { ...span, mention: mentionForms(span.word) } : span);
                at += span.used;
                continue;
            }
            if (piece.word === '-') {   // a dash that joined no years
                at++;
                continue;
            }
            const phrase = readPhrase(pieces, at, idx);
            const meaning = phrase && phrase.meaning;
            if (!meaning || (meaning.is === 'or' && orInName(pieces, at, idx))) {
                used(at, 1);
                addText({ word: piece.word, forms: singulars(piece.word).map(form => ` ${form} `) });
                at++;
                continue;
            }
            at += phrase.used;
            if (meaning.is === 'not') not = true;
            else if (meaning.is === 'or') either = joined = true;
            else if (meaning.is === 'and') joined = true;
            if (['not', 'or', 'and', 'filler'].includes(meaning.is)) continue;   // a waiting "not" or "or" stays for the next word

            used(at - phrase.used, phrase.used);
            if (meaning.is === 'kind') {
                addPart(kinds, { field: meaning.field, values: meaning.values, label: meaning.values.join(' or '), word: phrase.single, mention: mentionForms(phrase.single) });
            } else if (meaning.is === 'game') {
                addPart(games, { values: meaning.values, label: meaning.values.join(' or '), word: phrase.typed, mention: mentionForms(phrase.typed) });
            } else if (meaning.is === 'online') {
                online = takeNot() ? !meaning.value : meaning.value;
                lastText = null;
            } else if (meaning.is === 'status') {
                // A "not" before "missing stories" means nothing: then no status is asked for
                const value = takeNot() ? NOT_STATUS[meaning.value] : meaning.value;
                if (value) status[meaning.field] = value;
                lastText = null;
            }
        }

        const statuses = [status.own, status.read].filter(Boolean);
        const exactYears = years.filter(part => part.min === part.max);
        const spans = years.filter(part => part.min !== part.max);
        const structured = kinds.length + games.length + years.length + statuses.length > 0 || online !== null
            || texts.some(part => part.not || part.alts.length > 1);

        // Typing (part of) an item's name finds it whatever its words were
        // read as ("Origins Special Edition" is a comic), with or without
        // filler around it ("show me the brotherhood of venice"). Not for a
        // single word or phrase: "collector's editions" alone is a
        // question, and its answer is the category.
        const partCount = kinds.length + games.length + years.length + statuses.length + texts.length + (online === null ? 0 : 1);
        const nameText = structured && partCount >= 2 && !years.concat(kinds, games, texts).some(part => part.not)
            ? wordsOf(pieces.slice(first, last + 1).map(piece => (piece.word !== undefined ? piece.word : piece.quote)).join(' ')).trimEnd()
            : null;

        const textHit = (doc, alt) => (alt.phrase !== undefined
            ? doc.text.includes(alt.phrase)
            : doc.text.includes(alt.word) || alt.forms.some(form => doc.words.includes(form)));
        const mentioned = (doc, part) => part.mention.some(form => doc.words.includes(form));

        // Does the item answer the question? `wide` also lets in items that
        // only mention a kind, game or bare year; `hasStatus(item, status)`
        // answers for the visitor's collection.
        function matches(item, { wide = false, hasStatus = () => true } = {}) {
            const doc = idx.docs.get(item.id);
            if (!doc) return false;
            if (nameText && doc.name.includes(nameText)) return true;
            const loose = (part, strict) => wide && !strict && mentioned(doc, part);
            return passes(kinds, (part, strict) => part.values.includes(item[part.field]) || loose(part, strict))
                && passes(games, (part, strict) => part.values.includes(item.game) || loose(part, strict))
                && passes(exactYears, (part, strict) => item.year === part.min || (part.mention !== undefined && loose(part, strict)))
                && spans.every(part => (item.year >= part.min && item.year <= part.max) !== part.not)
                && texts.every(part => part.alts.some(alt => textHit(doc, alt)) !== part.not)
                && (online === null || Boolean(item.read) === online)
                && statuses.every(value => hasStatus(item, value));
        }

        // How the text was read, for the "Understood as" line: one entry per
        // group, empty when it was all plain words
        const understood = [];
        if (structured) {
            const group = (parts, label) => {
                const wanted = parts.filter(part => !part.not).map(label);
                if (wanted.length > 0) understood.push(wanted.join(' or '));
                parts.filter(part => part.not).forEach(part => understood.push(`not ${label(part)}`));
            };
            [kinds, games, exactYears].forEach(parts => group(parts, part => part.label));
            spans.forEach(part => understood.push(part.not ? `not ${part.label}` : part.label));
            statuses.forEach(value => understood.push(STATUS_LABELS[value]));
            if (online !== null) understood.push(online ? 'to read online' : 'not to read online');
            texts.forEach(part => {
                const words = part.alts.map(alt => `“${alt.phrase !== undefined ? alt.phrase : alt.word}”`).join(' or ');
                understood.push(part.not ? `not ${words}` : words);
            });
        }

        return {
            matches,
            statuses,
            understood,
            // The words read as a kind, a game or a bare year: other items may mention them
            mentionWords: [...kinds, ...games, ...exactYears].filter(part => !part.not && part.mention).map(part => part.word),
        };
    }

    // `words` is for tools/test-search.mjs, which checks the lists against the catalog
    // ---- An Easter egg: the Creed answers ----
    // A search that is exactly one of these lines (case and punctuation
    // aside) gets the next line back, shown above the results by app.js.
    // The search itself is untouched: "nothing is true" still finds the
    // bookends that carry the words.
    const REPLIES = {
        'nothing is true': 'Everything is permitted.',
        'everything is permitted': 'Nothing is true.',
        'nothing is true everything is permitted': 'We work in the dark to serve the light. We are Assassins.',
        'we work in the dark': 'To serve the light.',
        'we work in the dark to serve the light': 'We are Assassins.',
        'requiescat in pace': 'Rest in peace.',
    };

    function reply(text) {
        return REPLIES[wordsOf(searchKey(text)).trim()] || null;
    }

    A.search = { key: searchKey, parse, reply, words: { kinds: KIND_WORDS, games: GAME_NAMES } };
})();
