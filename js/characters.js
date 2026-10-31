/* ============================================
   ACDb - Characters
   ============================================

   The characters of the Assassin's Creed games, for the Characters tab
   (#characters, js/characters-view.js). Characters are not catalog items:
   an item names the characters it shows in its own "characters" field
   (database.js), by their id here.

   Scope: named characters who appear in person (on screen, speaking or
   playable, in the story or a story DLC) in a main, spin-off or handheld
   game. Isu who appear as projections count. In: playable characters,
   main antagonists and the targets around them, mentors, recurring
   allies, Isu, modern-day characters and the real historical people the
   player meets. Out: unnamed characters, one-scene named characters with
   no further role, multiplayer personas, characters only mentioned or
   only in database entries, and characters from the mobile, browser and
   VR games (until decided otherwise). The main characters of the novels,
   comics and the film may come later.

   The list grows in batches:
   - the pilot (2026-10-30): the Ezio saga, the Kenway saga, Desmond Miles
     and two Isu (ids 1-25);
   - batch 2 (2026-10-31): the protagonists of the other games and the key
     figures around them, from Origins to Shadows, the Chronicles and
     Layla Hassan (ids 26-48).
   Still to come: the modern-day team (Lucy, Shaun, Rebecca, William
   Miles), more allies and targets, and the novels' and comics' heroes.

   Characters (keys in this order; the list itself is in id order):
     id        permanent number, the next one is the highest + 1. Items
               point at it, so never change or reuse one, even after
               deleting a character
     name      full name as Ubisoft writes it, accents included. The page's
               address is its slug with accents folded:
               #characters/ezio-auditore-da-firenze
     aka       other names visitors know them by (search finds them; shown
               on the card and the page). Optional. Not needed for a name
               already inside the full name ("Ezio")
     group     "assassin", "templar", "isu" or "other" (allies,
               pirates, everyone else): the side they're known for, which
               is where their main story leaves them (Edward Kenway and
               Adéwalé start as pirates, Claudia joins in Brotherhood, Shay
               leaves the Assassins). The Characters tab's faction chips.
               The wiki's infoboxes put some allies (Leonardo, Caterina
               Sforza, Sofia, Washington) under the Assassins; its own
               articles and Wikipedia call them allies, so "other". Precursor orders
               count as their successors (the Hidden Ones as Assassins,
               the Order of the Ancients as Templars) once they're added
     historical  true for a real historical person
     born      birth year as display text: "1459", "c. 1680", "85 BCE",
               the year the games use (Charles Lee 1731, where history
               says 1732 New Style). Left out when not known
     year      places the character in story order: the in-story year the
               player first sees them in a game (negative for BCE), not
               counting a cameo in another character's story (Haytham
               Kenway as a boy at the end of Black Flag). Not the birth
               year, so Desmond Miles sits in Modern Day. The Isu take
               -75000: Valhalla's visions show them in their own age,
               before the catastrophe. Era headings come from READING_ERAS
               (js/reading-orders.js)
     image     the portrait, images/characters/<slug>.webp: official
               Ubisoft art of the character as the games show them (a
               render, a database portrait or promo art, a screenshot only
               as a last resort), cropped to head and shoulders at 3:4 and
               saved as a 300x400 WebP with tools/make-portrait.py. Never
               fan art, cosplay, film stills or photos of merchandise.
               Optional: without one the tab shows the emblem
     games     the games they appear in person, names exactly as in GAMES
               (js/games.js), main, spin-off and handheld games only, in
               release order; a story DLC counts as its game. A remake
               counts when a source confirms the character. Not counted:
               flashbacks, voice only, videos, the Helix menu, paintings,
               corpses, visions of future Assassins, and Isu or Abstergo
               simulations in DLC (Ezio in Valhalla, Desmond's body in
               Black Flag)
     description  one or two spoiler-free sentences, 300 characters at
               most, written for ACDb (never copied from the wiki): who
               they are when the player meets them, not what happens to
               them. Their side is fine to state, even where a game keeps
               it back for a while (Haytham Kenway, Shay Patrick Cormac):
               the box, the store page and their figures all say it

   Items (the "characters" field in database.js): the ids of the
   characters an item shows or tells the story of. Figures, statues and
   busts of them; collector's editions whose statue or figurine is them;
   novels and comics where they're a main character; replicas of their
   own weapons and gear; art prints and posters of them. Not: art books,
   soundtracks, guides, or items about a whole game.

   Sources: the Assassin's Creed Wiki, read through its Access the Animus
   mirror (Fandom refused automated reading), checked against Wikipedia
   (real people, game plots and casts), Ubisoft and the press. Two
   researchers checked every name, side, birth year, first appearance and
   game on their own (2026-10-30). Both read the same wiki, so a fact
   only the wiki gives has one source. They agreed except on these,
   settled as follows:
   - Births: Sofia 1476 (Revelations' database; the Encyclopedia says
     1473); Cesare 1475 as the games have it (history: 1475 or 1476).
   - First seen: Rodrigo 1476, beside Uberto at Giovanni's execution (one
     researcher had 1478, San Gimignano); Caterina 1481 (the wiki only).
   - Left out until a scene is confirmed: Minerva in Brotherhood and
     Revelations, Juno in Revelations (voice only in The Lost Archive),
     Altaïr in AC III, Haytham in Black Flag Resynced (one wiki page),
     Washington's 1752 Mount Vernon scene in Rogue (the wiki only; Rogue
     itself is in, from the wiki and Wikipedia's character list).
   - Black Flag Resynced: Edward and Blackbeard (Ubisoft, Wikipedia, the
     wiki); Adéwalé from Ubisoft's fan kit art and a press cast list,
     though Freedom Cry was cut. It has no modern day, so no Desmond or
     Juno.
   - Shay is not in Unity: its opening shows an unnamed hooded killer.
   - Altaïr is in AC II: Desmond's vision of Altaïr and Maria in Acre.
   Batch 2 (two more researchers, 2026-10-31), settled as follows:
   - Names: Bayek of Siwa (the wiki's page is "Bayek"); Aya, known later as
     Amunet (the wiki's page), which her statues use; Sigurd Styrbjornsson
     (wiki, Wikipedia; Ubisoft also writes "Styrbjornson"); Basim Ibn
     Ishaq (Ubisoft, Wikipedia; the wiki writes "ibn"); Naoe (Ubisoft; the
     wiki's page is "Fujibayashi Naoe"); Nikolai Orelov (the game's
     "Nikolaï" is a misspelling).
   - Sides: Eivor with the Assassins (she takes the Hidden Ones' blade
     and creed; both researchers). Kassandra, Sigurd and Cleopatra under
     "other": none is sworn in (the wiki's text, against its infobox for
     Cleopatra and Sigurd). Alexios under "other" too: as a player
     character he is a mercenary like Kassandra, and his items show him
     so; the canon story's twist about him is left alone, as is his alias.
     Julius Caesar with the Templars (the Order of the Ancients; both).
   - Births: Kassandra 458 BCE and Alexios 451 BCE (the wiki and Wikipedia;
     the game implies 453 and 446); Shao Jun 1505 (the wiki and the
     Essential Guide; Chronicles: China says 1506). Arbaaz Mir's and
     Nikolai Orelov's are not known.
   - First seen: Kassandra and Alexios 431 BCE, as the story's dates are;
     their childhood scene is undated. Eivor and Sigurd 855, the prologue
     (Wikipedia and one wiki page; another says 856). Arno and Élise 1776,
     the Unity prologue. Yasuke 1581: his 1579 arrival isn't shown.
   - Games: Kassandra is in Valhalla through the free crossover story "A
     Fated Encounter"; Arno is in Rogue as the boy in its last memory.
     Left out with one source only: Roshan in Valhalla's free quest
     "Shared History", Élise as a child in Rogue, Sigurd in Dawn of
     Ragnarök. Shao Jun is not in Chronicles: Russia (only her memories).

   Portraits (2026-10-31): two researchers collected official art; every
   candidate they found stays in the session scratchpad for re-picking.
   - Renders on the Assassin's Creed Wiki (credited to Ubisoft, though
     most give no source): Ezio, Altaïr, Desmond (sent by the site owner),
     Leonardo, Rodrigo, Cesare, Lucrezia, Machiavelli, Giovanni, Claudia
     (Brotherhood); Edward, Adéwalé (260px, scaled up), Blackbeard (Black
     Flag); Haytham, Connor, Achilles, Charles Lee (AC III); Shay (Rogue);
     Juno (Brotherhood). Altaïr's and Connor's hoods hide their eyes, as
     in all their official art. The owner preferred these Black Flag
     renders to the fan kit's art for Adéwalé and Blackbeard, whose bright
     sky backgrounds stood out.
   - In-game database portraits: Caterina, Mario (AC II, 256px wide,
     scaled up), Aveline (Liberation Remastered), Washington (AC III,
     240px, scaled up), Sofia (Revelations, 120px, scaled up; the owner's
     choice over a screenshot). A bigger source would improve the scaled
     ones.
   - A screenshot, where no render shows the face: Minerva (AC II's
     Vatican vault, a glowing hologram).
   Batch 2 portraits (two more researchers, 2026-10-31; candidates kept
   in the scratchpad's portraits2 folder):
   - Ubisoft's Shadows fan kit: Naoe, Yasuke (helmeted; the owner's
     choice over a trailer close-up). Ubisoft's Chronicles turnaround
     sheets (one figure cropped): Arbaaz Mir, Nikolai Orelov.
   - Renders and promo art on the Assassin's Creed Wiki: Bayek, Aya,
     Cleopatra, Julius Caesar (Origins); Kassandra, Alexios (Odyssey);
     Eivor (the female Eivor), Sigurd (database render, 260px, scaled up;
     Valhalla); Roshan (Mirage); Arno, Élise (Unity); Jacob,
     Evie, Starrick, Henry Green (Syndicate); Shao Jun (the Chronicles:
     China cover art).
   - Sent by the site owner: Basim (a Mirage render, 240px, scaled up;
     kept as portraits2/basim/owner-supplied.png).
   - A close-up from Shadows' cutscenes: Oda Nobunaga. A screenshot:
     Layla Hassan (Origins; no render of her exists).
*/

const CHARACTERS = [
  {
    "id": 1,
    "name": "Ezio Auditore da Firenze",
    "group": "assassin",
    "historical": false,
    "born": "1459",
    "year": 1459,
    "image": "images/characters/ezio-auditore-da-firenze.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed II: Discovery", "Assassin's Creed Brotherhood", "Assassin's Creed Revelations"],
    "description": "A young Florentine nobleman whose carefree life ends when his family is betrayed. Trained by his uncle Mario, he grows into a master Assassin who will one day lead the Brotherhood in Italy."
  },
  {
    "id": 2,
    "name": "Altaïr Ibn-La'Ahad",
    "group": "assassin",
    "historical": false,
    "born": "1165",
    "year": 1189,
    "image": "images/characters/altair-ibn-laahad.webp",
    "games": ["Assassin's Creed", "Assassin's Creed: Altaïr's Chronicles", "Assassin's Creed II", "Assassin's Creed: Bloodlines", "Assassin's Creed Revelations"],
    "description": "A gifted but arrogant Assassin of the Levantine Brotherhood during the Third Crusade, stripped of his rank and sent to earn it back by hunting nine men across Damascus, Acre and Jerusalem."
  },
  {
    "id": 3,
    "name": "Desmond Miles",
    "group": "assassin",
    "historical": false,
    "born": "1987",
    "year": 2012,
    "image": "images/characters/desmond-miles.webp",
    "games": ["Assassin's Creed", "Assassin's Creed II", "Assassin's Creed Brotherhood", "Assassin's Creed Revelations", "Assassin's Creed III", "Assassin's Creed Valhalla"],
    "description": "A bartender descended from a long line of Assassins, taken by Abstergo Industries in 2012 and made to relive his ancestors' memories in a machine called the Animus."
  },
  {
    "id": 4,
    "name": "Leonardo da Vinci",
    "group": "other",
    "historical": true,
    "born": "1452",
    "year": 1476,
    "image": "images/characters/leonardo-da-vinci.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood"],
    "description": "The Renaissance painter, inventor and engineer, here a warm and endlessly curious friend of Ezio who builds his gadgets and deciphers the pages of an ancient codex."
  },
  {
    "id": 5,
    "name": "Rodrigo Borgia",
    "aka": ["Pope Alexander VI"],
    "group": "templar",
    "historical": true,
    "born": "1431",
    "year": 1476,
    "image": "images/characters/rodrigo-borgia.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood"],
    "description": "The Spanish cardinal who became Pope Alexander VI, here the Grand Master of the Templar Order in Italy and a patient, ruthless schemer."
  },
  {
    "id": 6,
    "name": "Cesare Borgia",
    "group": "templar",
    "historical": true,
    "born": "1475",
    "year": 1500,
    "image": "images/characters/cesare-borgia.webp",
    "games": ["Assassin's Creed Brotherhood"],
    "description": "Son of Rodrigo Borgia and captain-general of the papal armies, a ruthless commander who means to unite Italy under his own rule."
  },
  {
    "id": 7,
    "name": "Lucrezia Borgia",
    "group": "templar",
    "historical": true,
    "born": "1480",
    "year": 1500,
    "image": "images/characters/lucrezia-borgia.webp",
    "games": ["Assassin's Creed Brotherhood"],
    "description": "Daughter of Rodrigo Borgia and sister of Cesare, a sharp and dangerous figure at the papal court in Rome."
  },
  {
    "id": 8,
    "name": "Caterina Sforza",
    "group": "other",
    "historical": true,
    "born": "1463",
    "year": 1481,
    "image": "images/characters/caterina-sforza.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood"],
    "description": "The fearless Countess of Forlì, who defends her city against all comers and becomes one of Ezio's staunchest allies."
  },
  {
    "id": 9,
    "name": "Niccolò Machiavelli",
    "group": "assassin",
    "historical": true,
    "born": "1469",
    "year": 1488,
    "image": "images/characters/niccolo-machiavelli.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood"],
    "description": "The Florentine diplomat and political thinker, here a cool-headed member of the Assassins who is often at odds with Ezio."
  },
  {
    "id": 10,
    "name": "Mario Auditore",
    "group": "assassin",
    "historical": false,
    "born": "1434",
    "year": 1476,
    "image": "images/characters/mario-auditore.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood"],
    "description": "Ezio's uncle, a gruff condottiere who runs the family's villa at Monteriggioni and teaches his nephew how to fight."
  },
  {
    "id": 11,
    "name": "Giovanni Auditore da Firenze",
    "group": "assassin",
    "historical": false,
    "born": "1436",
    "year": 1459,
    "image": "images/characters/giovanni-auditore-da-firenze.webp",
    "games": ["Assassin's Creed II"],
    "description": "Ezio's father, a respected Florentine banker who leads a secret second life in the service of the Assassins."
  },
  {
    "id": 12,
    "name": "Claudia Auditore da Firenze",
    "group": "assassin",
    "historical": false,
    "born": "1461",
    "year": 1476,
    "image": "images/characters/claudia-auditore-da-firenze.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood"],
    "description": "Ezio's younger sister, quick-witted and capable, who keeps the family's affairs in order and refuses to be left on the sidelines."
  },
  {
    "id": 13,
    "name": "Sofia Sartor",
    "group": "other",
    "historical": false,
    "born": "1476",
    "year": 1511,
    "image": "images/characters/sofia-sartor.webp",
    "games": ["Assassin's Creed Revelations"],
    "description": "A Venetian bookseller in Constantinople who helps Ezio track down the keys to the library of Altaïr."
  },
  {
    "id": 14,
    "name": "Edward Kenway",
    "group": "assassin",
    "historical": false,
    "born": "1693",
    "year": 1715,
    "image": "images/characters/edward-kenway.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "A Welsh privateer turned pirate captain in the Caribbean, more interested in fortune and fame than in the war between Assassins and Templars he stumbles into."
  },
  {
    "id": 15,
    "name": "Haytham Kenway",
    "group": "templar",
    "historical": false,
    "born": "1725",
    "year": 1754,
    "image": "images/characters/haytham-kenway.webp",
    "games": ["Assassin's Creed III", "Assassin's Creed IV: Black Flag", "Assassin's Creed Rogue"],
    "description": "Son of Edward Kenway, raised in London and trained from childhood with the sword. He sails to the American colonies to build the Templar Order there."
  },
  {
    "id": 16,
    "name": "Ratonhnhaké:ton",
    "aka": ["Connor", "Connor Kenway"],
    "group": "assassin",
    "historical": false,
    "born": "1756",
    "year": 1760,
    "image": "images/characters/ratonhnhake-ton.webp",
    "games": ["Assassin's Creed III", "Assassin's Creed III: Liberation"],
    "description": "A Kanien'kehá:ka (Mohawk) man who takes the name Connor and joins the Assassins to protect his people during the American Revolution."
  },
  {
    "id": 17,
    "name": "Shay Patrick Cormac",
    "group": "templar",
    "historical": false,
    "born": "1731",
    "year": 1752,
    "image": "images/characters/shay-patrick-cormac.webp",
    "games": ["Assassin's Creed Rogue"],
    "description": "An Irish-American sailor trained as an Assassin, whose doubts about the Brotherhood set him on a very different path during the Seven Years' War."
  },
  {
    "id": 18,
    "name": "Adéwalé",
    "group": "assassin",
    "historical": false,
    "born": "1692",
    "year": 1715,
    "image": "images/characters/adewale.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Rogue", "Assassin's Creed Black Flag Resynced"],
    "description": "Born into slavery in Trinidad, he escapes to become quartermaster of Edward Kenway's ship, the Jackdaw, and later fights for the freedom of others as an Assassin."
  },
  {
    "id": 19,
    "name": "Aveline de Grandpré",
    "group": "assassin",
    "historical": false,
    "born": "1747",
    "year": 1765,
    "image": "images/characters/aveline-de-grandpre.webp",
    "games": ["Assassin's Creed III: Liberation", "Assassin's Creed IV: Black Flag"],
    "description": "Daughter of a French merchant and an enslaved woman, raised in New Orleans, who moves between three personas to fight injustice in Louisiana."
  },
  {
    "id": 20,
    "name": "Achilles Davenport",
    "group": "assassin",
    "historical": false,
    "born": "c. 1710",
    "year": 1752,
    "image": "images/characters/achilles-davenport.webp",
    "games": ["Assassin's Creed III", "Assassin's Creed Rogue"],
    "description": "Mentor of the Colonial Assassins in North America, who trains a new generation from his homestead in Massachusetts."
  },
  {
    "id": 21,
    "name": "Edward Thatch",
    "aka": ["Blackbeard", "Edward Teach"],
    "group": "other",
    "historical": true,
    "born": "c. 1680",
    "year": 1715,
    "image": "images/characters/edward-thatch.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "The most feared pirate in the Caribbean, a larger-than-life captain who becomes a friend and mentor to Edward Kenway."
  },
  {
    "id": 22,
    "name": "Charles Lee",
    "group": "templar",
    "historical": true,
    "born": "1731",
    "year": 1754,
    "image": "images/characters/charles-lee.webp",
    "games": ["Assassin's Creed III", "Assassin's Creed Rogue"],
    "description": "A British-born soldier who becomes a general of the Continental Army, and a loyal follower of Haytham Kenway."
  },
  {
    "id": 23,
    "name": "George Washington",
    "group": "other",
    "historical": true,
    "born": "1732",
    "year": 1754,
    "image": "images/characters/george-washington.webp",
    "games": ["Assassin's Creed III", "Assassin's Creed Rogue"],
    "description": "Commander-in-chief of the Continental Army and later the first President of the United States, whom Connor fights alongside during the Revolution."
  },
  {
    "id": 24,
    "name": "Minerva",
    "group": "isu",
    "historical": false,
    "year": -75000,
    "image": "images/characters/minerva.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed III", "Assassin's Creed Valhalla"],
    "description": "A member of the Isu, the advanced civilisation that ruled the Earth before humanity, who left messages for the Assassins across thousands of years."
  },
  {
    "id": 25,
    "name": "Juno",
    "group": "isu",
    "historical": false,
    "year": -75000,
    "image": "images/characters/juno.webp",
    "games": ["Assassin's Creed Brotherhood", "Assassin's Creed III", "Assassin's Creed IV: Black Flag", "Assassin's Creed Syndicate", "Assassin's Creed Valhalla"],
    "description": "An Isu scientist from the age before the great catastrophe, whose voice reaches Desmond across thousands of years from the vaults her people left behind."
  },
  {
    "id": 26,
    "name": "Bayek of Siwa",
    "group": "assassin",
    "historical": false,
    "born": "c. 85 BCE",
    "year": -49,
    "image": "images/characters/bayek-of-siwa.webp",
    "games": ["Assassin's Creed Origins"],
    "description": "One of the last Medjay, sworn protectors of Egypt's people, who leaves his village of Siwa to hunt down the masked men who tore his family apart."
  },
  {
    "id": 27,
    "name": "Aya",
    "aka": ["Amunet"],
    "group": "assassin",
    "historical": false,
    "born": "c. 85 BCE",
    "year": -48,
    "image": "images/characters/aya.webp",
    "games": ["Assassin's Creed Origins"],
    "description": "Bayek's wife, a sharp and determined warrior from Alexandria who carries their fight against a secret order from the banks of the Nile to the heart of Rome."
  },
  {
    "id": 28,
    "name": "Cleopatra",
    "group": "other",
    "historical": true,
    "born": "69 BCE",
    "year": -48,
    "image": "images/characters/cleopatra.webp",
    "games": ["Assassin's Creed Origins"],
    "description": "The young queen of Egypt, driven from her throne by her brother Ptolemy XIII, who sees in Bayek and Aya useful allies in winning it back."
  },
  {
    "id": 29,
    "name": "Julius Caesar",
    "group": "templar",
    "historical": true,
    "born": "100 BCE",
    "year": -48,
    "image": "images/characters/julius-caesar.webp",
    "games": ["Assassin's Creed Origins"],
    "description": "The Roman general whose arrival in Egypt in the middle of a civil war tips the balance of power and draws him into Cleopatra's fight for the throne."
  },
  {
    "id": 30,
    "name": "Kassandra",
    "aka": ["The Eagle Bearer"],
    "group": "other",
    "historical": false,
    "born": "458 BCE",
    "year": -431,
    "image": "images/characters/kassandra.webp",
    "games": ["Assassin's Creed Odyssey", "Assassin's Creed Valhalla"],
    "description": "A Spartan-born mercenary, or misthios, scraping a living on the island of Kephallonia when the Peloponnesian War and the search for her family pull her across the Greek world."
  },
  {
    "id": 31,
    "name": "Alexios",
    "group": "other",
    "historical": false,
    "born": "451 BCE",
    "year": -431,
    "image": "images/characters/alexios.webp",
    "games": ["Assassin's Creed Odyssey"],
    "description": "A Spartan-born mercenary, or misthios, and the hero of Odyssey for players who choose him instead of Kassandra, caught up in the Peloponnesian War."
  },
  {
    "id": 32,
    "name": "Eivor Varinsdottir",
    "aka": ["Eivor Wolf-Kissed"],
    "group": "assassin",
    "historical": false,
    "born": "847",
    "year": 855,
    "image": "images/characters/eivor-varinsdottir.webp",
    "games": ["Assassin's Creed Valhalla"],
    "description": "A fierce Viking raider of the Raven Clan who leaves Norway with her brother Sigurd to carve out a new home for their people in ninth-century England."
  },
  {
    "id": 33,
    "name": "Sigurd Styrbjornsson",
    "group": "other",
    "historical": false,
    "born": "842",
    "year": 855,
    "image": "images/characters/sigurd-styrbjornsson.webp",
    "games": ["Assassin's Creed Valhalla"],
    "description": "Eivor's adoptive brother and the son of a Norwegian jarl, a proud and restless leader who brings his clan across the sea to settle in England."
  },
  {
    "id": 34,
    "name": "Basim Ibn Ishaq",
    "group": "assassin",
    "historical": false,
    "born": "c. 844",
    "year": 861,
    "image": "images/characters/basim-ibn-ishaq.webp",
    "games": ["Assassin's Creed Valhalla", "Assassin's Creed Mirage"],
    "description": "A quick-witted street thief in ninth-century Baghdad, troubled by strange visions, who is taken in by the Hidden Ones and trained in their ways."
  },
  {
    "id": 35,
    "name": "Roshan",
    "group": "assassin",
    "historical": false,
    "born": "c. 802",
    "year": 861,
    "image": "images/characters/roshan.webp",
    "games": ["Assassin's Creed Mirage"],
    "description": "A seasoned Master of the Hidden Ones, wry and demanding, who takes the young Basim under her wing and teaches him the Creed."
  },
  {
    "id": 36,
    "name": "Arno Dorian",
    "group": "assassin",
    "historical": false,
    "born": "1768",
    "year": 1776,
    "image": "images/characters/arno-dorian.webp",
    "games": ["Assassin's Creed Rogue", "Assassin's Creed Unity"],
    "description": "A charming young Frenchman raised in a noble household at Versailles, who is drawn into the Assassins' fight amid the chaos of the French Revolution."
  },
  {
    "id": 37,
    "name": "Élise de la Serre",
    "group": "templar",
    "historical": false,
    "born": "1768",
    "year": 1776,
    "image": "images/characters/elise-de-la-serre.webp",
    "games": ["Assassin's Creed Unity"],
    "description": "Arno's childhood love, the fearless and headstrong daughter of a Templar Grand Master, who meets the Revolution with a sword in her hand."
  },
  {
    "id": 38,
    "name": "Jacob Frye",
    "group": "assassin",
    "historical": false,
    "born": "1847",
    "year": 1868,
    "image": "images/characters/jacob-frye.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "Evie's twin brother, a brash and charming Assassin who arrives in Victorian London set on taking the city back from its gangs one street at a time."
  },
  {
    "id": 39,
    "name": "Evie Frye",
    "group": "assassin",
    "historical": false,
    "born": "1847",
    "year": 1868,
    "image": "images/characters/evie-frye.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "Jacob's twin sister, a patient and clever Assassin who comes to London in search of a Piece of Eden rather than a fight with the gangs."
  },
  {
    "id": 40,
    "name": "Crawford Starrick",
    "group": "templar",
    "historical": false,
    "born": "1827",
    "year": 1868,
    "image": "images/characters/crawford-starrick.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The Grand Master of the Templars in Britain, a cold industrialist whose factories, banks and gangs hold Victorian London in their grip."
  },
  {
    "id": 41,
    "name": "Henry Green",
    "aka": ["Jayadeep Mir"],
    "group": "assassin",
    "historical": false,
    "born": "1843",
    "year": 1868,
    "image": "images/characters/henry-green.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The quiet keeper of the Assassins' bureau in London, an antiques dealer born in India who becomes the Frye twins' closest ally in the city."
  },
  {
    "id": 42,
    "name": "Shao Jun",
    "group": "assassin",
    "historical": false,
    "born": "1505",
    "year": 1526,
    "image": "images/characters/shao-jun.webp",
    "games": ["Assassin's Creed Chronicles: China"],
    "description": "The last Assassin of the Chinese Brotherhood, trained in Italy by Ezio Auditore, who returns to Ming China to bring down those who destroyed her order."
  },
  {
    "id": 43,
    "name": "Arbaaz Mir",
    "group": "assassin",
    "historical": false,
    "year": 1841,
    "image": "images/characters/arbaaz-mir.webp",
    "games": ["Assassin's Creed Chronicles: India"],
    "description": "An Assassin of the Indian Brotherhood in the Sikh Empire of the 1840s, caught between two empires as he guards a precious relic."
  },
  {
    "id": 44,
    "name": "Nikolai Orelov",
    "group": "assassin",
    "historical": false,
    "year": 1918,
    "image": "images/characters/nikolai-orelov.webp",
    "games": ["Assassin's Creed Chronicles: Russia"],
    "description": "A weary Russian Assassin in 1918, as revolution sweeps the country, who takes on one last mission before he hopes to start a new life with his family."
  },
  {
    "id": 45,
    "name": "Naoe",
    "aka": ["Fujibayashi Naoe"],
    "group": "assassin",
    "historical": false,
    "born": "c. 1564",
    "year": 1579,
    "image": "images/characters/naoe.webp",
    "games": ["Assassin's Creed Shadows"],
    "description": "A young shinobi of Iga, the daughter of Fujibayashi Nagato, trained in stealth and the blade as war closes in on her home province."
  },
  {
    "id": 46,
    "name": "Yasuke",
    "aka": ["Diogo"],
    "group": "assassin",
    "historical": true,
    "born": "c. 1555",
    "year": 1581,
    "image": "images/characters/yasuke.webp",
    "games": ["Assassin's Creed Shadows"],
    "description": "An African warrior who comes to Japan and enters the service of the warlord Oda Nobunaga, becoming a samurai in the Sengoku period."
  },
  {
    "id": 47,
    "name": "Oda Nobunaga",
    "group": "other",
    "historical": true,
    "born": "1534",
    "year": 1581,
    "image": "images/characters/oda-nobunaga.webp",
    "games": ["Assassin's Creed Shadows"],
    "description": "The ambitious and ruthless warlord bent on uniting Japan under his rule, the most feared man of the Sengoku period."
  },
  {
    "id": 48,
    "name": "Layla Hassan",
    "group": "assassin",
    "historical": false,
    "born": "1984",
    "year": 2017,
    "image": "images/characters/layla-hassan.webp",
    "games": ["Assassin's Creed Origins", "Assassin's Creed Odyssey", "Assassin's Creed Valhalla"],
    "description": "A brilliant and impatient Abstergo engineer who builds her own portable Animus to explore the memories of people the company has overlooked."
  }
]
