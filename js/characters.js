/* ============================================
   ACDb - Characters
   ============================================

   The characters of the Assassin's Creed games, for the Characters tab
   (#characters, js/characters-view.js). Characters are not catalog items:
   an item names the characters it shows in its own "characters" field
   (database.js), by their id here.

   Scope: named characters who appear in person (on screen, speaking or
   playable, in the story or a story DLC) in a main, spin-off or handheld
   game. Isu who appear as projections count, and so do the Isu of the
   Staff's simulations in Odyssey's The Fate of Atlantis, the only place
   they appear (the simulations rule under "games" is about characters
   who are real elsewhere). In: playable characters,
   main antagonists and the targets around them, mentors, recurring
   allies, Isu, modern-day characters and the real historical people the
   player meets. Out: unnamed characters, one-scene named characters with
   no further role, multiplayer personas, characters only mentioned or
   only in database entries, and characters from the mobile, browser and
   VR games (until decided otherwise). Also in (from batch 3): the main
   characters of the novels, comics, manga and the 2016 film, with the
   works they appear in as "stories".

   The list grows in batches:
   - the pilot (2026-10-30): the Ezio saga, the Kenway saga, Desmond Miles
     and two Isu (ids 1-25);
   - batch 2 (2026-10-31): the protagonists of the other games and the key
     figures around them, from Origins to Shadows, the Chronicles and
     Layla Hassan (ids 26-48);
   - batch 3 (2026-10-31): the modern-day team and Hytham, and the heroes
     of the novels, comics, manhua and the 2016 film (ids 49-81);
   - the owner's request (2026-10-31): Lydia Frye and Jack the Ripper from
     Syndicate's First World War memories and its expansion (ids 82-83);
   - batch 4 (2026-10-31): Altaïr's world, from Assassin's Creed and
     Bloodlines (ids 84-88);
   - batch 5 (2026-10-31): the Ezio saga's family, allies and enemies, from
     AC II to Revelations (ids 89-102);
   - batch 6 (2026-10-31): Black Flag's pirates, governors and Assassins
     (ids 103-111);
   - batch 7 (2026-10-31): AC III's Templars and Patriots, and
     Liberation's New Orleans (ids 112-122);
   - batch 8 (2026-10-31): Rogue's Colonial Brotherhood and Unity's Paris
     (ids 123-131);
   - batch 9 (2026-10-31): Mirage's Anbar, Alamut and Baghdad (ids
     132-139);
   - batch 10 (2026-11-01): Syndicate's London, and the Frye and Mir
     families (ids 140-155);
   - 2026-11-01: Unity's Marquis de Sade (id 156);
   - batch 11 (2026-11-01): Abstergo's Alan Rikkin and Victoria Bibeau,
     and seven Isu (ids 157-165);
   - batch 12 (2026-11-01): Origins' Egypt and Rome (ids 166-172);
   - batch 13 (2026-11-01): Odyssey's Greece and Valhalla's Norway and
     England (ids 173-191);
   - batch 14 (2026-11-01): the 2016 film's Sofia Rikkin and Joseph Lynch
     (ids 192-193);
   - batch 15 (2026-11-01): Baptiste, Darim, Duncan Walpole, Jacques de
     Molay, Leonidas, Ojeda, and Tsuyu and Alvaro of the manga Tales of
     Iga (ids 194-201).
   Still to come: more allies and targets from the games.

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
     stories   where they appear outside the games, as display text:
               "Comics: Assassins, Uprising", "Novel: Heresy", "Film:
               Assassin's Creed (2016)". Required for a character in no
               game (the card shows it instead of a games count); optional
               for the others (Juhani Otso Berg is in games and comics).
               Search finds it
     family    relatives who are characters too, as {"id", "relation"}:
               what the relative is to this character ("father", "twin
               sister", "great-niece"; the list is FAMILY_RELATIONS in
               tools/validate-catalog.py). Optional. Both sides list each
               other, so every page reads right (Jacob: Ethan Frye
               (father); Ethan: Jacob Frye (son)); the validator checks
               it. The page shows a Family row of links
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
   Batch 3 (two more researchers, 2026-10-31), settled as follows:
   - Names from the works, not from the brief: Owen Meyers and Javier
     Mondragón (Monroe is their teacher; the wiki's Javier Ortiz is
     someone else); Numa Al'Khamsin, called El Cakr; Niamh of Argyll (the
     wiki's "Niamh" is a druid in Wrath of the Druids); María; André "Dre"
     Bolden. The Templars comic has two leads, Darius Gift (Ubisoft's
     blurb) and Albert Bolden (the reviews); both are in. Dynasty's lead is
     Li E (Zhang Xiaojing is not in it).
   - Sides: Lucy Stillman and Daniel Cross are Templars, as the end of
     their stories leaves them (the same rule as Haytham). Quila and
     Tommy Greyling are allies, never sworn in. "The Black Cross" is kept
     out of every name: it is the 1927 arc's mystery and, for Otso Berg,
     a later twist.
   - year for a character in the games is still where a game first shows
     them (Vidic 2012, not Bloodstone's 1964; Berg 2014, Rogue); for the
     others, where their own story first shows them (Callum Lynch as a
     boy in 1986, Tomo as a child in 2000). Hytham is a Hidden One of 872,
     not a modern-day character.
   - Left out with one source only: Hytham as a boy in Mirage, Li E as a
     historical person. Left out as voice only or unconfirmed: Shaun in
     Unity, William Miles in Valhalla's The Last Chapter, Vidic in
     Brotherhood, Berg's faceless multiplayer scenes, Daniel Cross in
     Revelations.
   - Disputed years: Quila 1534 (#8; another source 1536), Pierrette 1851
     (the main story; one source 1848), Simeon Price 1852, Eddie Gorm
     1931. Birth years given by the wiki alone: Charlotte, Owen, Javier,
     Li E; Aguilar's (1455) is uncited, so it is left out.

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
   Batch 3 portraits (candidates kept in the scratchpad's portraits3):
   - Renders on the Assassin's Creed Wiki: Lucy, Shaun, Rebecca (AC II and
     Brotherhood looks), William Miles, Warren Vidic (his AC III look),
     Daniel Cross (AC III); Hytham (Discovery Tour: Viking Age); Juhani
     Otso Berg (Syndicate's database image).
   - A Revelations screenshot: Clay Kaczmarek (no render exists).
   - The film's official stills: Aguilar, María; Callum Lynch from a
     cut-out of one (the owner's pick, candidate 3).
   - Comic art (covers, panels, cut-outs): Charlotte, Galina, Quila, Tom
     Stoddard, Albert and André Bolden (Templars), Jonathan Hawk and Numa
     Al'Khamsin (Les Deux Royaumes), Aquilus (the Encyclopedia), Eddie
     Gorm, Tommy Greyling, Li E (Tokyopop's Dynasty vol. 2 cover).
   - No usable art, so the emblem: Darius Gift, Tomo, Simon Hathaway, Owen
     Meyers, Javier Mondragón, Pierrette Arnaud, Simeon Price, Geirmund
     Hel-hide, Niamh of Argyll.
   Batch 4 (two more researchers, 2026-10-31), settled as follows:
   - Al Mualim is an Assassin, the Mentor: both researchers found him
     secretly allied with the Templars, never sworn in (Wikipedia: he
     "betrayed both the Assassins and Templars"). He is historical, the
     games' Rashid ad-Din Sinan, born 1135 as the games have it (history:
     1131 or 1135).
   - Maria Thorpe is "other": she starts as a Templar and leaves them in
     Bloodlines, but only the wiki says she joins the Assassins, and no
     game shows it (the same rule as Quila). Born c. 1160: the wiki says
     1161, Wikipedia's character list 1160. In AC II through Desmond's
     vision of Altaïr and Maria in Acre (the wiki and a player's account;
     Wikipedia doesn't name her).
   - Left out until a scene is confirmed: Abbas Sofian in Assassin's Creed
     (the wiki and an IMDb voice credit, but no one could name the scene).
     Not counted: Al Mualim in AC II and Brotherhood (flashback only) and
     his body in Revelations; Malik and Robert in Revelations (mentioned
     only); Robert in Bloodlines (mentioned only).
   - year: Al Mualim and Abbas 1189, Revelations' "The Mentor's Keeper",
     as for Altaïr. Malik's birth year (1165) is from the wiki and
     Wikipedia's character list; Abbas's (1166) from the wiki, which
     quotes the game's database entry.
   - Left out with one source only: the comic Assassin's Creed 1: Desmond
     (Al Mualim, Malik), Maria in the Revelations novel and the comic
     Reflections.
   Batch 15 (one more researcher, 2026-11-01; the wiki through its
   accesstheanimus mirror, Fandom was down):
   - Tsuyu (Fujibayashi Tsuyu) is Naoe's mother: seen in the base game's
     flashbacks and in person in Claws of Awaji (Xbox Wire names her), so
     she counts for Shadows. Alvaro (Catarribera on the wiki) is only a
     voice and a journal in the game, so he is a manga character; he has
     nothing to do with Abstergo's Alvaro Gramatica. Kept out: why he
     left the Spanish Brotherhood, and Tsuyu's later life.
   - Darim: born 1195 per the wiki, citing The Secret Crusade; his comic
     is Reflections #2, which the wiki and Titan's own blurb for #4 back.
     The mobile games (Recollection, Memories) and Rebellion (Leonidas,
     Ojeda) don't count.
   - Baptiste is filed as a Templar, like Shay: a former Assassin who
     sides with the Templars. Duncan Walpole stays an Assassin: he dies
     before he can defect. No official births for either, nor for Ojeda.
   - Jacques de Molay: born c. 1244 (historians give 1240-1250); only a
     mention in Heresy. Leonidas: Kassandra's grandfather is no spoiler
     (Ubisoft's marketing says so); he is only named in the Odyssey novel.
   Batch 14 (two more researchers, 2026-11-01): Sofia Rikkin and Joseph
   Lynch are in the film and its novelization only (Sofia is only a voice
   on the phone in Heresy, and an email name in Origins). Sofia is a
   Templar: the film puts her inside her father's Order and the
   novelization says so; Joseph is an Assassin from the 1986 opening.
   Births from the wiki, citing official sources: Sofia 1980 (the
   novelization), Joseph 1955 (Fox's featurette "The Creed Mythology").
   Callum's line to Aguilar runs through his mother, so Joseph is linked
   to Callum alone. Kept out: what happened in 1986, the riot, the
   London ceremony and the ending.
   Batch 13 (four more researchers, two per game, 2026-11-01), settled
   as follows:
   - Sides: everyone is "other" but Darius, whom the Assassins honour as
     one of their own (his statue is in Monteriggioni's sanctuary): his
     DLC shows him with a hidden blade against the Order of the Ancients.
     Aspasia, Alfred and Fulke stay "other" with their Orders left out:
     late reveals (as for Ahmet). Dag never joins anything.
   - Kassandra's family: Myrrine is her mother and Nikolaos her
     stepfather (he tells her early, in chapter 2). Alexios stays
     unlinked (the Deimos twist), and so does Pythagoras, whose first
     scene reveals he is her father. Perikles and Aspasia were partners,
     not married (Wikipedia), and the list has no word for it.
   - Births: the game gives none (Odyssey and Valhalla have no
     database dates). Real ones only: Herodotos c. 484, Sokrates c. 470,
     Perikles c. 495, Aspasia c. 470, Pythagoras c. 570 BCE; Alfred
     c. 849 (Asser). The wiki's Phoibe c. 443 BCE and the sons of
     Ragnar's are left out.
   - Years first seen: the Odyssey cast 431 BCE, as Kassandra (Myrrine
     and Nikolaos are in its Taygetos flashback too); Darius 429 BCE;
     Pythagoras 422 BCE (the wiki). Valhalla: Styrbjorn 855, the feast
     where Eivor joins his family, as Eivor; Randvi, Dag and Valka 872;
     Ivarr and Ubba 873; Alfred and Fulke 874 (the arc order is the
     player's; The Saga Stone is the usual first); Halfdan 876.
   - The sons of Ragnar are listed as brothers: the wiki alone makes
     Halfdan a half-brother.
   - Not counted: Rebellion (mobile) for Myrrine, Sokrates, Darius,
     Randvi and Valka; Project Legacy (browser) for Pythagoras; the
     Discovery Tours. Stories: the Odyssey novel for all but Darius;
     Geirmund's Saga, Blood Brothers, Song of Glory and Sword of the White
     Horse as the researchers found them.
   - Kept out: the Phoenix, Deimos, the Ghost of Kosmos, Artabanus, the
     Grand Maegester and the Instrument, Halfdan's and Svala's Isu
     selves, the romances, and every death.
   Batch 12 (two more researchers, 2026-11-01), settled as follows:
   - Sides: Lucius Septimius is named as one of the Order of the
     Ancients early (Way of the Gabiniani), so he is a Templar. Flavius
     Metellus is "other": his place in the Order is a late reveal (as for
     Ahmet), and so is his Order name. Ptolemy XIII is the Order's
     puppet, not a member; Apollodorus is Cleopatra's man and the Hidden
     Ones' ally, not one of them. Brutus and Cassius are Assassins: Aya
     introduces them as "our Roman brothers" in their first scene.
   - Years first seen: Flavius and Septimius are among the masked men of
     Siwa in 49 BCE, but unknown there, so they take 48 BCE, their first
     open scene (Aya: Blade of the Goddess), with Ptolemy. Brutus and
     Cassius: 47 BCE (the wiki's character pages; its quest page says
     46). Khemu: 49 BCE, the Siwa flashback.
   - Births: Ptolemy c. 62 BCE, Brutus 85 BCE, Cassius c. 86 BCE
     (Wikipedia, the wiki). The real Septimius and Apollodorus have no
     known birth year; the wiki's "c. 90s BCE" for them, Flavius (who is
     fictional) and Khemu's c. 56 BCE are left out.
   - Games: Origins only. Not counted: Apollodorus in Rebellion (mobile),
     the Discovery Tour avatars, Septimius's spirit in a Curse of the
     Pharaohs side quest, and Brutus in Project Legacy (browser). Brutus
     and Cassius are in the Origins comic (Titan, 2018).
   - Family: Khemu is Bayek and Aya's son; Ptolemy is Cleopatra's younger
     brother. Their marriage (history) is left out: the game only calls
     them brother and sister. Brutus and Cassius were brothers-in-law,
     which the game doesn't mention and the list has no word for.
   - Kept out: who the Lion is, Khemu's death, Apollodorus's fate, the
     Battle of the Nile and the Ides of March.
   Batch 11 (two more researchers, 2026-11-01), settled as follows:
   - Alan Rikkin is in one game in person: a short scene in Assassin's
     Creed (2012), hearing Vidic's report (the wiki; Wikipedia: he
     "appeared in the first game"); everywhere else he is in emails and
     mentions. The film and Heresy are his stories. His 1951 birth is the
     wiki's alone ("around 1951"), so it is left out.
   - Victoria Bibeau: an Assassin in Odyssey, Layla's team in 2018, and
     Abstergo's psychiatrist in the books before that (her first
     appearance, Last Descendants, set in 2016, hence the year). Her
     death in The Fate of Atlantis stays out.
   - The Isu take -75000 like Juno and Minerva, and no birth year.
     Jupiter: Revelations (his message to Desmond) and AC III's Grand
     Temple holograms; his Valhalla role as Suttungr is left out, a
     reveal (and the identity is the wiki's alone). Aletheia: Odyssey;
     her Valhalla role, under another name, is a reveal too and left
     out. Aita: AC III's visions and Judgment of Atlantis; his Sages and
     what Juno does for him stay out. Hermes, Persephone, Hades and
     Poseidon: The Fate of Atlantis only (statues, paintings and
     mentions elsewhere). Every episode's ending stays out.
   - Names: Jupiter is also Tinia (Minerva's name for him) and Zeus;
     Persephone is also Kore. Myth names that the games don't use
     (Mercury, Pluto, Neptune, Veritas) are left out; Aita is not Hades.
   - Family: Juno and Aita married (Wikipedia, the wiki). Hades and
     Persephone married (the wiki; the episode's own story). Left out as
     the wiki's alone or myth: Hades, Poseidon and Zeus as brothers,
     Jupiter as Persephone's father, Juno and Minerva as his sisters.
   The Marquis de Sade (two more researchers, 2026-11-01): neither side.
   The wiki's infobox lists "Assassins" among his affiliations, but
   nothing in the game or the database makes him a member; he is a
   self-serving ally. Born 1740 (Wikipedia, Britannica, the database).
   First seen in 1789: a cameo in his Bastille cell as Arno is led past
   (the wiki's transcript of "Imprisoned" alone, matching the real de
   Sade shouting from his window that July); he meets Arno in 1791 and is
   in Dead Kings. Not in Bowden's novel (its character list); no comics.
   His title as the new King of Beggars stays out (a plot turn).
   Batch 10 (four more researchers, 2026-11-01), settled as follows:
   - Scope: two researchers listed everyone in Syndicate and its DLCs; the
     owner chose their six, the eight real people they work with, and
     Ethan Frye and Pyara Kaur. Left for later: the main targets (Ferris,
     Brewster, Elliotson, Millner, Twopenny, Cardigan), the allies (Clara
     O'Dea, Robert Topping, Agnes MacBean, George Westhouse), Churchill,
     the Master Spy, Nellie, Brinley Ellsworth and the modern day.
   - Jayadeep Mir is Henry Green (already here), so he gains the novels'
     name "The Ghost" (the Penguin blurb, Wikipedia; not used in the game)
     and Underworld, not a second entry.
   - Sides: Lucy Thorne is a Templar from her first scene. Pearl Attaway
     is "other" and her Templar side stays out: a twist (as for Ahmet).
     Maxwell Roth is an ally of the Order, never a member. Pyara Kaur is
     an ally (the wiki alone calls her an Assassin).
   - Ethan Frye is in one game in person: the end of Chronicles: India,
     where Arbaaz hands him the Koh-i-Noor (Wikipedia, the wiki). In
     Syndicate he is only mentioned. His birth year is the wiki's alone,
     so it is left out; Pyara's is unknown.
   - Underworld (Wikipedia, the Penguin blurb, readers' reviews): Henry,
     Ethan, Abberline and Evie are its main characters; Arbaaz and Pyara
     are in its flashbacks (the wiki and the owner). Pyara and Arbaaz meet
     in the graphic novel Brahman. Abberline is in Locus (its own blurb).
   - Births from the wiki alone, as the game's database has them: Pearl
     1833, Ned 1840. Ned Wynert is a trans man; his birth name is left
     out.
   - Family: Arbaaz and Pyara married (the wiki; the owner); Henry is
     their son (Syndicate's database). Lydia is Jacob's granddaughter.
   Families (2026-11-01), filled in from the facts settled above: the
   Auditore, the Kenways, the Fryes, the Mirs, the Borgia, the de la
   Serres with Arno (adopted), Aveline and her stepmother, Bayek and Aya,
   Eivor and her foster brother Sigurd, the Pazzi, Suleiman and his uncle
   Ahmet, Qabiha and her son, the Banu Musa, the Boldens, the Disraelis,
   and the ancestors the modern-day characters relive ("ancestor" and
   "descendant": Desmond's six, Callum's Aguilar, Charlotte's Tom
   Stoddard, Daniel Cross's Nikolai Orelov, Jonathan Hawk's Numa).
   Altaïr and Maria, and Ezio and Sofia, are shown as married (the end of
   their stories, widely known from Revelations and Embers). Kassandra and
   Alexios are left unlinked: that they are siblings is part of
   Odyssey's reveal about Deimos, which stays out. Haytham and
   Kaniehtí:io are each linked to their son, not to each other (there is
   no word for "partner" in FAMILY_RELATIONS).
   Batch 9 (two more researchers, 2026-10-31), settled as follows; both
   corrected the owner's brief in the same places:
   - Names: Fuladh, as Ubisoft and the game call him; his full name, from
     the novel Daughter of No One, is Fuladh Al Haami (no source has "al-
     Halab"). The caliph's son is Abu 'Abdallah in the game (its database:
     Abu 'Abdallah Muhammad ibn Ja'far), with Al-Mu'tazz, the name he
     later reigns under, as aka: he is not caliph during the story (al-
     Musta'in reigns 862-866). The Banu Musa are three people on screen,
     each with his own scenes, so three entries, as the game names them
     (Abu Jafar Muhammad, Ahmad, Al-Hasan, each "ibn Musa"), all with
     "Banu Musa" as aka. The game's database has one shared entry for
     them. Births: Muhammad c. 780 and Al-Hasan c. 810, from the owner
     (Wikipedia: Muhammad before 803); Ahmad's is unknown.
   - Sides: Fuladh and the Banu Musa are Hidden Ones (Ubisoft: "a Rafiq,
     or Eagle-Master, for the Hidden Ones"). Ali ibn Muhammad is an ally,
     not a member. Abu 'Abdallah is "other". Nehal is "other", and what
     she really is stays out: it is Mirage's central twist. Qabiha is
     "other" and her place in the Order stays out: it is the game's last
     reveal (as for Ahmet).
   - year: 861 (the Anbar prologue) for Nehal and Abu 'Abdallah; 862 for
     everyone met at Alamut or in Baghdad (the wiki's dating; Ubisoft says
     "circa 861"). Qabiha's disguised presence at Anbar is the wiki's
     reading alone, so she is first seen openly in Baghdad.
   - Stories: Fuladh is in person in Daughter of No One (he recruits
     Roshan) and A Soar of Eagles (Dark Horse's and Penguin Random House's
     blurbs). None of the others is in a novel or comic. Roshan, from the
     pilot, now has the same stories line: the novel is her own story and
     the comic is hers and Fuladh's.
   Batch 8 (two more researchers, 2026-10-31), settled as follows:
   - Sides: Liam O'Brien, Hope Jensen and the Chevalier de la Vérendrye
     are Assassins (the Chevalier is one of the Brotherhood Shay leaves,
     not a Templar); Christopher Gist is a Templar from before Shay meets
     him. Pierre Bellec stays an Assassin (he turns on his own leaders,
     not to the Templars). Mirabeau is the Paris Assassins' Mentor, shown
     early. François de la Serre is a Templar, shown at his death in the
     first sequence. Napoleon is "other", an ally. François-Thomas Germain
     is "other" and his Templar side is left out: Unity reveals it in
     stages up to its last act (as for Ahmet and Madeleine).
   - Names: the Chevalier de la Vérendrye as the game and Wikipedia's
     list of the series' historical characters have him (aka his full
     name, Louis-Joseph Gaultier de La Vérendrye, the explorer's fourth
     son); Mirabeau as the cast list has him (aka his full name);
     Napoleon Bonaparte as the game's database has it.
   - Games: none of the nine is in another game in person. Germain and de
     la Serre are only on a notice board in Rogue, Bellec's war years only
     in Unity's database. Napoleon is in Dead Kings and the 1808 ending,
     which count as Unity.
   - year: Germain 1791, when Arno meets him (an unnamed figure at
     Versailles in 1789 is the wiki's reading alone); de la Serre 1776.
   - Births: the games' and Wikipedia's years agree for the real people;
     Liam 1726, Hope 1732, Bellec c. 1740 and de la Serre 1733 from the
     database and Wikipedia's list. Novel roles (Bowden's Unity) rest on
     the wiki alone, so no stories.
   Batch 7 (two more researchers, 2026-10-31), settled as follows:
   - Sides: Kaniehtí:io, Samuel Adams and Lafayette are "other" (the
     wiki's infoboxes say Assassins; its own text, Wikipedia and a cut
     line of Achilles's say allies). Benjamin Church is a Templar, though
     he ends a renegade. Gérald Blanc is an Assassin from the start
     (Wikipedia: "fellow Assassin"). Madeleine de L'Isle is "other" and her
     Templar side and alias are left out: they are Liberation's final
     twist (as for Ahmet).
   - Names: Marquis de Lafayette, as AC III's database and cast list have
     him (aka Gilbert du Motier); Kaniehtí:io with the accent, as the
     database and the cast list write it (aka Ziio, from Forsaken and the
     fans). Her page is #characters/kaniehti-io (the colon becomes a
     hyphen, as for Ratonhnhaké:ton).
   - Games: William Johnson is the only one of AC III's Templars in Rogue;
     Birch is only mentioned in Black Flag and Rogue, Lafayette only in
     Unity's database. Kaniehtí:io and Samuel Adams are in The Tyranny of
     King Washington too, which counts as AC III.
   - Births as the games have them: Johnson 1715 (history: c. 1715);
     Hickey's is unknown, so it is left out. Kaniehtí:io 1731, Birch 1705,
     Agaté c. 1722, Madeleine 1732 and Gérald 1745 from the wiki and
     Wikipedia's list of the series' historical characters.
   - year: Samuel Adams 1770 (Boston's Most Wanted, after the massacre);
     Lafayette 1778 (Monmouth; his Valley Forge scene is optional); Agaté
     1766 (the wiki; he is first on screen in Sequence 2).
   - Stories: Forsaken for Birch only (the wiki and Wikipedia's list); the
     others' Forsaken roles rest on the wiki alone.
   Batch 6 (two more researchers, 2026-10-31), settled as follows:
   - All nine are in Black Flag Resynced: Metacritic's and Game Rant's
     credits, Wikipedia and reviews; Ah Tabai from a Resynced walkthrough
     and its database entry (he is missing from the credit lists). None is
     in person in Freedom Cry, Rogue, AC III or Liberation.
   - Names as the game credits them: Calico Jack Rackham (aka John
     Rackham), Laureano Torres y Ayala (history: Laureano de Torres y
     Ayala, kept as aka).
   - Sides: Mary Read and Ah Tabai are Assassins; Torres and Woodes Rogers
     are Templars, as the game shows them from the Havana meeting on.
     Benjamin Hornigold is "other": he joins the Templars only late in
     the story, so it is left out (as for Ahmet). Bartholomew Roberts is
     "other", a Sage, not a Templar. Anne Bonny never joins the Assassins
     in a main game.
   - Mary Read keeps "James Kidd" as aka: the game's and Hachette's
     figure name her by both.
   - Births as the game's database has them (the wiki alone): Anne Bonny
     1702 and Rackham 1682 (history: unknown and possibly 1673), Ah Tabai
     the 1660s; Hornigold "mid-1680s", kept as the 1680s (history: c.
     1680). Mary Read's is unknown in the game and in history, so it is
     left out. Vane c. 1680 (game: 1680; history: the 1680s).
   - The novel and the manga Awakening are left out of "stories": every
     cast list comes from the wiki alone.
   Batch 5 (two more researchers, 2026-10-31), settled as follows:
   - Names: Maria and Federico Auditore da Firenze, as for Giovanni and
     Claudia; Suleiman and Ahmet as the games' cast lists have them (the
     database says "Prince"), with Süleyman and Şehzade Ahmet as aka. La
     Volpe's given name, Gilberto, is from the novels (and Hachette's
     figure), so it is an aka.
   - Sides: La Volpe, Bartolomeo, Antonio and Paola are Assassins, shown
     as members at Ezio's induction in 1488 (no game shows their own).
     Maria, Federico and Lorenzo are "other": the wiki's Assassin labels
     for them are thinly sourced. Uberto is a Templar, as the game calls
     him. Tarik Barleti is "other", a loyal Janissary. Ahmet is "other" and
     his Templar side is left out: it is Revelations' twist (as for Jack
     the Ripper and Alexios).
   - Births as the games have them: Jacopo de' Pazzi 1421 (history: 1423),
     Bartolomeo 1455 (Wikipedia: c. 1455), Ahmet 1466 (history: c. 1466).
     From the wiki alone (the games' database entries): Maria 1432,
     Federico 1456, Uberto 1416, Antonio 1443, Paola 1438, Yusuf c. 1467,
     Tarik 1470.
   - year: Maria 1459 (Ezio's birth); the Pazzi 1478, the San Gimignano
     meeting (the wiki; Ubisoft's Initiates timeline says 1477, but the
     conspiracy is 1478); Antonio 1481 (the memory; his page says 1480).
     Federico is not in the 1459 birth scene.
   - Not counted: Federico's Brotherhood flashback, Antonio in Nexus VR
     (VR games are out of scope). Stories: Lineage (Wikipedia's cast) for
     Maria, Federico, Lorenzo and Uberto; the novels (wiki only) are left
     out.
   Batch 15 portraits, all from the Assassin's Creed Wiki (the owner
   picked Baptiste's, Jacques', Ojeda's and Tsuyu's): Liberation's
   database render of Baptiste, a Revelations still of Darim, Unity's
   render of Jacques de Molay, the Black Flag render of Duncan, Odyssey's
   bust render of Leonidas, the film's character-poster cut-out of Ojeda,
   Tsuyu's Claws of Awaji database render, and a manga panel of Alvaro,
   the only one there is (313 px wide, a little soft). Baptiste, Jacques
   and Tsuyu are scaled up from small renders.
   Batch 14 portraits, from the film like Callum's: Sofia's official
   character poster (a cut-out), and a still of Joseph at Abstergo.
   Batch 13 portraits, all from the Assassin's Creed Wiki: Ubisoft's
   promo art of Barnabas, Herodotos and Alfred (cropped below the
   lettering) and its render of Ivarr; model renders of Phoibe,
   Pythagoras, Sokrates, Perikles and Aspasia (her own look, not the
   Ghost's); cutscene close-ups of Myrrine, Nikolaos, Darius, Randvi,
   Ubba, Halfdan, Fulke, Dag, Styrbjorn (the prologue) and Valka.
   Batch 12 portraits, all from the Assassin's Creed Wiki: Ubisoft's
   render of Septimius (helmeted, as he always is); in-game close-ups of
   Flavius, Ptolemy XIII, Apollodorus and Khemu; cutscenes of Brutus and
   of Cassius (with Aya and Brutus, cropped to him).
   Batch 11 portraits, all from the Assassin's Creed Wiki: the Fate of
   Atlantis render of Aletheia; studio renders of Hermes's and Victoria
   Bibeau's Odyssey models; AC III's render of Jupiter; cutscene close-ups
   of Aita, Poseidon, Persephone and Hades; Alan Rikkin's only in-game
   look, a profile from Assassin's Creed's Abstergo lab.
   The Marquis de Sade's portrait is the wiki's studio render of his
   Unity model ("Development artwork"), in his white wig.
   Batch 10 portraits, all from the Assassin's Creed Wiki: Syndicate
   renders of Lucy Thorne, Bell, Dickens, Darwin, Marx, Nightingale and
   Queen Victoria; its database portraits of Abberline, Disraeli, Mary
   Anne and Duleep Singh; cutscene close-ups of Pearl Attaway, Maxwell
   Roth and Ned Wynert; Pyara's Chronicles: India model. Ethan Frye has
   no official art (his one scene shows him from behind): the emblem.
   Batch 9 portraits, all from the Assassin's Creed Wiki: Mirage's painted
   codex portraits, the style of Roshan's (the three Banu Musa cropped
   from their shared codex painting). The sharper 3D renders, promo
   posters and screenshots are among the candidates in portraits10.
   Batch 8 portraits, all from the Assassin's Creed Wiki: Rogue renders of
   Liam, Hope, Gist and the Chevalier; Unity screenshots of Germain (his
   silversmith look, not his robe), Bellec, Mirabeau and de la Serre
   (their renders are small); Napoleon from Dead Kings' promo art.
   Batch 7 portraits, all from the Assassin's Creed Wiki: AC III renders
   of Kaniehtí:io, Birch, Johnson, Church and Samuel Adams; AC III
   in-engine close-ups of Hickey, Pitcairn and Lafayette (their renders
   are small); Liberation Remastered database renders of Madeleine,
   Agaté and Gérald, with the white glow around them removed.
   Batch 6 portraits, all from the Assassin's Creed Wiki: the original
   Black Flag renders, to match Edward, Blackbeard and Adéwalé (each also
   has a Resynced render among the candidates in portraits7).
   Batch 5 portraits, all from the Assassin's Creed Wiki: AC II database
   portraits (256 wide, scaled up slightly) for Maria, Federico, Lorenzo,
   Uberto, Francesco, Bartolomeo, Antonio and Paola; La Volpe's
   Brotherhood render; Ahmet's Revelations promo render and Tarik's
   Revelations render. The owner's picks, small renders cropped wider and
   scaled up: Jacopo's AC II render, Yusuf's Revelations render and
   Suleiman's Revelations database render.
   Batch 4 portraits, all from the Assassin's Creed Wiki (the owner's
   picks for three): Al Mualim from Ubisoft's Revelations render sheet
   (an in-game headshot), Robert de Sablé's AC1 render (small, so scaled
   up), Maria Thorpe's Revelations render (her older look), Malik's AC1
   render, and young Abbas from Revelations' 1191 memories (no AC1 image
   of him exists).
   Lydia Frye and Jack the Ripper (candidates in the scratchpad's
   portraits4): Lydia's Syndicate render on the Assassin's Creed Wiki, and
   Jack from the expansion's promotional art.
   Lydia's facts (born 1893, Jacob's granddaughter, 1916, Churchill) agree
   on the wiki and Giant Bomb; Wikipedia gives 1916 and Churchill too.
   Jack the Ripper is "other" and his tie to the Brotherhood is left out:
   it is the expansion's twist. He counts as historical, as the game's
   take on the real, never-identified killer. Born c. 1860: the wiki's
   year, inside the 1853-1863 range the owner gives from police records.
   Rooks "drawn to his side" follows Wikipedia's wording.
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
    "family": [{"id": 11, "relation": "father"}, {"id": 89, "relation": "mother"}, {"id": 90, "relation": "brother"}, {"id": 12, "relation": "sister"}, {"id": 10, "relation": "uncle"}, {"id": 13, "relation": "wife"}, {"id": 3, "relation": "descendant"}],
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
    "family": [{"id": 87, "relation": "wife"}, {"id": 195, "relation": "son"}, {"id": 3, "relation": "descendant"}],
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
    "family": [{"id": 52, "relation": "father"}, {"id": 70, "relation": "ancestor"}, {"id": 2, "relation": "ancestor"}, {"id": 1, "relation": "ancestor"}, {"id": 14, "relation": "ancestor"}, {"id": 15, "relation": "ancestor"}, {"id": 16, "relation": "ancestor"}],
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
    "family": [{"id": 6, "relation": "son"}, {"id": 7, "relation": "daughter"}],
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
    "family": [{"id": 5, "relation": "father"}, {"id": 7, "relation": "sister"}],
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
    "family": [{"id": 5, "relation": "father"}, {"id": 6, "relation": "brother"}],
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
    "family": [{"id": 11, "relation": "brother"}, {"id": 90, "relation": "nephew"}, {"id": 1, "relation": "nephew"}, {"id": 12, "relation": "niece"}],
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
    "family": [{"id": 89, "relation": "wife"}, {"id": 90, "relation": "son"}, {"id": 1, "relation": "son"}, {"id": 12, "relation": "daughter"}, {"id": 10, "relation": "brother"}],
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
    "family": [{"id": 11, "relation": "father"}, {"id": 89, "relation": "mother"}, {"id": 90, "relation": "brother"}, {"id": 1, "relation": "brother"}, {"id": 10, "relation": "uncle"}],
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
    "family": [{"id": 1, "relation": "husband"}],
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
    "family": [{"id": 15, "relation": "son"}, {"id": 16, "relation": "grandson"}, {"id": 3, "relation": "descendant"}],
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
    "family": [{"id": 14, "relation": "father"}, {"id": 16, "relation": "son"}, {"id": 3, "relation": "descendant"}],
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
    "family": [{"id": 15, "relation": "father"}, {"id": 112, "relation": "mother"}, {"id": 14, "relation": "grandfather"}, {"id": 3, "relation": "descendant"}],
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
    "family": [{"id": 120, "relation": "stepmother"}],
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
    "family": [{"id": 161, "relation": "husband"}],
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
    "family": [{"id": 27, "relation": "wife"}, {"id": 170, "relation": "son"}],
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
    "family": [{"id": 26, "relation": "husband"}, {"id": 170, "relation": "son"}],
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
    "family": [{"id": 168, "relation": "brother"}],
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
    "family": [{"id": 173, "relation": "mother"}, {"id": 174, "relation": "stepfather"}, {"id": 198, "relation": "grandfather"}],
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
    "family": [{"id": 190, "relation": "adoptive father"}, {"id": 33, "relation": "foster brother"}],
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
    "family": [{"id": 190, "relation": "father"}, {"id": 183, "relation": "wife"}, {"id": 32, "relation": "foster sister"}],
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
    "stories": "Novel: Daughter of No One; comic: A Soar of Eagles",
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
    "family": [{"id": 130, "relation": "adoptive father"}],
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
    "family": [{"id": 130, "relation": "father"}],
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
    "family": [{"id": 154, "relation": "father"}, {"id": 39, "relation": "twin sister"}, {"id": 82, "relation": "granddaughter"}],
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
    "family": [{"id": 154, "relation": "father"}, {"id": 38, "relation": "twin brother"}, {"id": 82, "relation": "great-niece"}],
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
    "aka": ["Jayadeep Mir", "The Ghost"],
    "group": "assassin",
    "historical": false,
    "born": "1843",
    "year": 1868,
    "image": "images/characters/henry-green.webp",
    "games": ["Assassin's Creed Syndicate"],
    "stories": "Novel: Underworld",
    "family": [{"id": 43, "relation": "father"}, {"id": 155, "relation": "mother"}],
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
    "stories": "Graphic novel: Brahman; novel: Underworld",
    "family": [{"id": 155, "relation": "wife"}, {"id": 41, "relation": "son"}],
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
    "family": [{"id": 67, "relation": "descendant"}],
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
    "family": [{"id": 200, "relation": "mother"}],
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
  },
  {
    "id": 49,
    "name": "Lucy Stillman",
    "group": "templar",
    "historical": false,
    "born": "1988",
    "year": 2012,
    "image": "images/characters/lucy-stillman.webp",
    "games": ["Assassin's Creed", "Assassin's Creed II", "Assassin's Creed Brotherhood", "Assassin's Creed Revelations"],
    "description": "A brilliant scientist working inside Abstergo Industries, and the first friendly face Desmond Miles meets in the Animus lab."
  },
  {
    "id": 50,
    "name": "Shaun Hastings",
    "group": "assassin",
    "historical": false,
    "born": "1985",
    "year": 2012,
    "image": "images/characters/shaun-hastings.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood", "Assassin's Creed Revelations", "Assassin's Creed III", "Assassin's Creed IV: Black Flag", "Assassin's Creed Syndicate", "Assassin's Creed Valhalla"],
    "description": "The modern-day Assassins' sharp-tongued British historian, who fills in the history behind every memory with very dry wit."
  },
  {
    "id": 51,
    "name": "Rebecca Crane",
    "group": "assassin",
    "historical": false,
    "born": "1984",
    "year": 2012,
    "image": "images/characters/rebecca-crane.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood", "Assassin's Creed Revelations", "Assassin's Creed III", "Assassin's Creed IV: Black Flag", "Assassin's Creed Syndicate", "Assassin's Creed Valhalla"],
    "stories": "Novel: Last Descendants: Tomb of the Khan",
    "description": "The modern-day Assassins' cheerful technical wizard, who built and looks after their own Animus, which she calls Baby."
  },
  {
    "id": 52,
    "name": "William Miles",
    "group": "assassin",
    "historical": false,
    "born": "1948",
    "year": 2012,
    "image": "images/characters/william-miles.webp",
    "games": ["Assassin's Creed Revelations", "Assassin's Creed III", "Assassin's Creed Origins"],
    "family": [{"id": 3, "relation": "son"}],
    "description": "Desmond's father and a leader of the modern-day Assassins, a stern and demanding man who puts the Brotherhood first."
  },
  {
    "id": 53,
    "name": "Warren Vidic",
    "group": "templar",
    "historical": false,
    "born": "1940s",
    "year": 2012,
    "image": "images/characters/warren-vidic.webp",
    "games": ["Assassin's Creed", "Assassin's Creed II", "Assassin's Creed Revelations", "Assassin's Creed III"],
    "stories": "Comics: The Fall, The Chain; graphic novel: Bloodstone",
    "description": "A cold and calculating scientist at Abstergo Industries who runs the Animus project and holds Desmond Miles captive to search his memories."
  },
  {
    "id": 54,
    "name": "Clay Kaczmarek",
    "aka": ["Subject 16"],
    "group": "assassin",
    "historical": false,
    "born": "1982",
    "year": 2012,
    "image": "images/characters/clay-kaczmarek.webp",
    "games": ["Assassin's Creed Revelations"],
    "description": "Abstergo's test subject before Desmond, known only as Subject 16, who leaves cryptic messages and puzzles hidden inside the Animus."
  },
  {
    "id": 55,
    "name": "Juhani Otso Berg",
    "aka": ["Otso Berg"],
    "group": "templar",
    "historical": false,
    "born": "1985",
    "year": 2014,
    "image": "images/characters/juhani-otso-berg.webp",
    "games": ["Assassin's Creed Rogue", "Assassin's Creed Syndicate", "Assassin's Creed Chronicles: Russia", "Assassin's Creed Odyssey"],
    "stories": "Comics: Templars, Uprising",
    "description": "A Finnish former special forces officer who leads Abstergo's Sigma Team, hunting Assassins and Pieces of Eden for the Templars."
  },
  {
    "id": 56,
    "name": "Hytham",
    "group": "assassin",
    "historical": false,
    "born": "850s",
    "year": 872,
    "image": "images/characters/hytham.webp",
    "games": ["Assassin's Creed Valhalla"],
    "stories": "Novels: The Golden City, Geirmund's Saga, Sword of the White Horse",
    "description": "A young and earnest Hidden One who comes to England with Basim and keeps the Brotherhood's bureau in the Raven Clan's settlement."
  },
  {
    "id": 57,
    "name": "Callum Lynch",
    "aka": ["Cal Lynch"],
    "group": "assassin",
    "historical": false,
    "born": "1979",
    "year": 1986,
    "image": "images/characters/callum-lynch.webp",
    "games": [],
    "stories": "Film: Assassin's Creed (2016)",
    "family": [{"id": 193, "relation": "father"}, {"id": 58, "relation": "ancestor"}],
    "description": "A death-row prisoner who is taken by Abstergo and made to relive the memories of his ancestor Aguilar in the Animus."
  },
  {
    "id": 58,
    "name": "Aguilar de Nerha",
    "group": "assassin",
    "historical": false,
    "year": 1492,
    "image": "images/characters/aguilar-de-nerha.webp",
    "games": [],
    "stories": "Film: Assassin's Creed (2016)",
    "family": [{"id": 57, "relation": "descendant"}],
    "description": "An Assassin in fifteenth-century Andalusia, sworn to keep the Apple of Eden out of the hands of the Spanish Inquisition."
  },
  {
    "id": 59,
    "name": "María",
    "group": "assassin",
    "historical": false,
    "year": 1492,
    "image": "images/characters/maria.webp",
    "games": [],
    "stories": "Film: Assassin's Creed (2016)",
    "description": "Aguilar's fellow Assassin and partner in fifteenth-century Spain, a fearless fighter in the Brotherhood's war against the Inquisition."
  },
  {
    "id": 60,
    "name": "Charlotte de la Cruz",
    "group": "assassin",
    "historical": false,
    "born": "1992",
    "year": 2015,
    "image": "images/characters/charlotte-de-la-cruz.webp",
    "games": [],
    "stories": "Comics: Assassins, Uprising",
    "family": [{"id": 62, "relation": "ancestor"}],
    "description": "An overqualified office worker in San Diego whose obsession with conspiracy theories leads her straight into the Assassins' secret war."
  },
  {
    "id": 61,
    "name": "Galina Voronina",
    "group": "assassin",
    "historical": false,
    "born": "1983",
    "year": 2015,
    "image": "images/characters/galina-voronina.webp",
    "games": ["Assassin's Creed Syndicate"],
    "stories": "Comics: Assassins, Uprising",
    "description": "A tough, uncompromising Russian Assassin who leads the modern-day cell that takes Charlotte de la Cruz under its wing."
  },
  {
    "id": 62,
    "name": "Tom Stoddard",
    "aka": ["Thomas Stoddard"],
    "group": "assassin",
    "historical": false,
    "year": 1692,
    "image": "images/characters/tom-stoddard.webp",
    "games": [],
    "stories": "Comics: Assassins",
    "family": [{"id": 60, "relation": "descendant"}],
    "description": "A seasoned Assassin in 1692 Salem, an ancestor of Charlotte de la Cruz, caught up in the witch trials as hysteria grips the town."
  },
  {
    "id": 63,
    "name": "Quila",
    "group": "other",
    "historical": false,
    "year": 1534,
    "image": "images/characters/quila.webp",
    "games": [],
    "stories": "Comics: Assassins",
    "description": "An Inca courier in the last days of the Inca Empire, racing across the Andes as the Spanish conquest closes in."
  },
  {
    "id": 64,
    "name": "Darius Gift",
    "group": "templar",
    "historical": false,
    "year": 1927,
    "games": [],
    "stories": "Comics: Templars",
    "description": "A young and privileged Templar of the British Rite, sent to 1920s Shanghai on his first assignment for the Order."
  },
  {
    "id": 65,
    "name": "Albert Bolden",
    "aka": ["Albie Bolden"],
    "group": "templar",
    "historical": false,
    "born": "1893",
    "year": 1927,
    "image": "images/characters/albert-bolden.webp",
    "games": [],
    "stories": "Comics: Templars, Uprising",
    "family": [{"id": 66, "relation": "son"}],
    "description": "A jazz trumpeter from Baltimore and a Templar in 1920s Shanghai, caught up in a struggle to root out corruption within the Order."
  },
  {
    "id": 66,
    "name": "André Bolden",
    "aka": ["Dre Bolden"],
    "group": "templar",
    "historical": false,
    "born": "1944",
    "year": 2016,
    "image": "images/characters/andre-bolden.webp",
    "games": [],
    "stories": "Comics: Templars, Uprising",
    "family": [{"id": 65, "relation": "father"}],
    "description": "Albert Bolden's son, an older man in 2016 whose family memories suddenly become of great interest to Abstergo."
  },
  {
    "id": 67,
    "name": "Daniel Cross",
    "group": "templar",
    "historical": false,
    "born": "1974",
    "year": 2012,
    "image": "images/characters/daniel-cross.webp",
    "games": ["Assassin's Creed III"],
    "stories": "Comics: The Fall, The Chain",
    "family": [{"id": 44, "relation": "ancestor"}],
    "description": "A troubled drifter plagued by visions of his ancestor Nikolai Orelov, who is drawn into the war between the Assassins and the Templars."
  },
  {
    "id": 68,
    "name": "Jonathan Hawk",
    "group": "assassin",
    "historical": false,
    "year": 2012,
    "image": "images/characters/jonathan-hawk.webp",
    "games": [],
    "stories": "Graphic novels: Accipiter, Hawk, El Cakr, Leila",
    "family": [{"id": 69, "relation": "ancestor"}],
    "description": "A London Assassin and a friend of Desmond Miles, sent to find a powerful ancient sceptre through the memories of his ancestor."
  },
  {
    "id": 69,
    "name": "Numa Al'Khamsin",
    "aka": ["El Cakr"],
    "group": "assassin",
    "historical": false,
    "year": 1340,
    "image": "images/characters/numa-alkhamsin.webp",
    "games": [],
    "stories": "Graphic novels: Hawk, El Cakr, Leila",
    "family": [{"id": 68, "relation": "descendant"}],
    "description": "An elite Assassin of the Egyptian Brotherhood in the fourteenth century, known as El Cakr, the Hawk, who guards a powerful ancient sceptre."
  },
  {
    "id": 70,
    "name": "Aquilus",
    "group": "assassin",
    "historical": false,
    "year": 259,
    "image": "images/characters/aquilus.webp",
    "games": [],
    "stories": "Graphic novels: Desmond, Aquilus, Accipiter (the Ankh of Isis trilogy)",
    "family": [{"id": 3, "relation": "descendant"}],
    "description": "An Assassin of the third-century Roman Empire, one of Desmond Miles' ancestors, whose memories hold the secret of an ancient artefact."
  },
  {
    "id": 71,
    "name": "Eddie Gorm",
    "group": "assassin",
    "historical": false,
    "year": 1931,
    "image": "images/characters/eddie-gorm.webp",
    "games": [],
    "stories": "Graphic novels: Conspiracies",
    "description": "The boss of London's East End docks, a small-time racketeer drawn into the Assassins' war during the Second World War."
  },
  {
    "id": 72,
    "name": "Tomo",
    "aka": ["Tomo Sakagawa"],
    "group": "assassin",
    "historical": false,
    "year": 2000,
    "games": [],
    "stories": "Graphic novels: Bloodstone, Conspiracies",
    "description": "One of the youngest members of the Japanese Brotherhood, more scientist than fighter, who uncovers a conspiracy reaching back to the Vietnam War."
  },
  {
    "id": 73,
    "name": "Tommy Greyling",
    "aka": ["Thomas Greyling"],
    "group": "other",
    "historical": false,
    "year": 1863,
    "image": "images/characters/tommy-greyling.webp",
    "games": [],
    "stories": "Novel: Last Descendants; comic: Locus",
    "description": "A New York police officer in the 1863 draft riots who later becomes a Pinkerton detective on the trail of a killer in Victorian London."
  },
  {
    "id": 74,
    "name": "Li E",
    "group": "assassin",
    "historical": false,
    "born": "730",
    "year": 751,
    "image": "images/characters/li-e.webp",
    "games": [],
    "stories": "Manhua: Dynasty",
    "description": "A young man of eighth-century China who joins the Hidden Ones as the An Lushan Rebellion tears the Tang empire apart."
  },
  {
    "id": 75,
    "name": "Simon Hathaway",
    "group": "templar",
    "historical": false,
    "born": "1980s",
    "year": 2016,
    "games": [],
    "stories": "Novel: Heresy; comic: Uprising",
    "description": "A Templar historian at Abstergo who relives the memories of a companion of Joan of Arc to learn the secrets of a Sword of Eden."
  },
  {
    "id": 76,
    "name": "Owen Meyers",
    "group": "assassin",
    "historical": false,
    "born": "2001",
    "year": 2016,
    "games": [],
    "stories": "Novels: Last Descendants trilogy",
    "description": "A teenager desperate to clear his late father's name, who is recruited to explore the memories of his ancestors in the Animus."
  },
  {
    "id": 77,
    "name": "Javier Mondragón",
    "group": "assassin",
    "historical": false,
    "born": "2000",
    "year": 2016,
    "games": [],
    "stories": "Novels: Last Descendants trilogy",
    "description": "Owen's best friend, who follows him into the Animus and into the hidden war between the Assassins and the Templars."
  },
  {
    "id": 78,
    "name": "Pierrette Arnaud",
    "group": "assassin",
    "historical": false,
    "born": "c. 1833",
    "year": 1851,
    "games": [],
    "stories": "Novels: The Engine of History (The Magus Conspiracy, The Resurrection Plot)",
    "description": "A trapeze acrobat in mid-nineteenth-century Europe who is swept into the Assassins' fight to protect Ada Lovelace's Engine of History."
  },
  {
    "id": 79,
    "name": "Simeon Price",
    "group": "assassin",
    "historical": false,
    "born": "c. 1825",
    "year": 1852,
    "games": [],
    "stories": "Novels: The Engine of History (The Magus Conspiracy, The Resurrection Plot)",
    "description": "A seasoned British Assassin who, with Pierrette Arnaud, races to protect Ada Lovelace's Engine of History from a Templar-allied magician."
  },
  {
    "id": 80,
    "name": "Geirmund Hel-hide",
    "group": "other",
    "historical": true,
    "born": "c. 850",
    "year": 870,
    "games": [],
    "stories": "Novel: Geirmund's Saga",
    "description": "A Norse warrior from Rogaland in the Great Heathen Army's invasion of England, whose saga runs alongside Eivor's."
  },
  {
    "id": 81,
    "name": "Niamh of Argyll",
    "group": "assassin",
    "historical": false,
    "year": 878,
    "games": [],
    "stories": "Novel: Sword of the White Horse",
    "description": "A blind Norse-Gaelic woman at the court of King Alfred of Wessex, drawn into the Hidden Ones' fight to protect a sacred artefact."
  },
  {
    "id": 82,
    "name": "Lydia Frye",
    "group": "assassin",
    "historical": false,
    "born": "1893",
    "year": 1916,
    "image": "images/characters/lydia-frye.webp",
    "games": ["Assassin's Creed Syndicate"],
    "family": [{"id": 38, "relation": "grandfather"}, {"id": 39, "relation": "great-aunt"}],
    "description": "Jacob Frye's granddaughter, a British Assassin in London during the First World War, who works with Winston Churchill to root out enemy spies in Syndicate's 1916 memories."
  },
  {
    "id": 83,
    "name": "Jack the Ripper",
    "group": "other",
    "historical": true,
    "born": "c. 1860",
    "year": 1888,
    "image": "images/characters/jack-the-ripper.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The infamous Whitechapel killer of 1888, who draws members of the Rooks gang to his side and brings Evie Frye back to London in Syndicate's Jack the Ripper expansion."
  },
  {
    "id": 84,
    "name": "Al Mualim",
    "aka": ["Rashid ad-Din Sinan"],
    "group": "assassin",
    "historical": true,
    "born": "1135",
    "year": 1189,
    "image": "images/characters/al-mualim.webp",
    "games": ["Assassin's Creed", "Assassin's Creed: Altaïr's Chronicles", "Assassin's Creed Revelations"],
    "stories": "Novel: The Secret Crusade",
    "description": "The Mentor of the Assassins at Masyaf, a stern and revered old man who raised Altaïr in the Brotherhood and sends him out to hunt nine men across the Holy Land."
  },
  {
    "id": 85,
    "name": "Robert de Sablé",
    "group": "templar",
    "historical": true,
    "born": "c. 1150",
    "year": 1191,
    "image": "images/characters/robert-de-sable.webp",
    "games": ["Assassin's Creed"],
    "stories": "Novel: The Secret Crusade",
    "description": "The Grand Master of the Knights Templar during the Third Crusade, a ruthless knight who also rides in King Richard's army and the Assassins' most dangerous enemy in the Holy Land."
  },
  {
    "id": 86,
    "name": "Malik Al-Sayf",
    "group": "assassin",
    "historical": false,
    "born": "1165",
    "year": 1191,
    "image": "images/characters/malik-al-sayf.webp",
    "games": ["Assassin's Creed"],
    "stories": "Novel: The Secret Crusade",
    "description": "A proud and capable Assassin who goes into Solomon's Temple with Altaïr and his younger brother Kadar, and who later keeps the Brotherhood's bureau in Jerusalem."
  },
  {
    "id": 87,
    "name": "Maria Thorpe",
    "group": "other",
    "historical": false,
    "born": "c. 1160",
    "year": 1191,
    "image": "images/characters/maria-thorpe.webp",
    "games": ["Assassin's Creed", "Assassin's Creed II", "Assassin's Creed: Bloodlines", "Assassin's Creed Revelations"],
    "stories": "Novel: The Secret Crusade",
    "family": [{"id": 2, "relation": "husband"}, {"id": 195, "relation": "son"}],
    "description": "An English Templar in Robert de Sablé's service, sharp-tongued and handy with a sword, who crosses paths with Altaïr in Jerusalem during the Third Crusade."
  },
  {
    "id": 88,
    "name": "Abbas Sofian",
    "group": "assassin",
    "historical": false,
    "born": "1166",
    "year": 1189,
    "image": "images/characters/abbas-sofian.webp",
    "games": ["Assassin's Creed Revelations"],
    "stories": "Novel: The Secret Crusade",
    "description": "Altaïr's childhood friend at Masyaf, raised in the Brotherhood alongside him, whose friendship is soured by an old grievance over the fate of his father."
  },
  {
    "id": 89,
    "name": "Maria Auditore da Firenze",
    "group": "other",
    "historical": false,
    "born": "1432",
    "year": 1459,
    "image": "images/characters/maria-auditore-da-firenze.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood"],
    "stories": "Short film: Assassin's Creed: Lineage",
    "family": [{"id": 11, "relation": "husband"}, {"id": 90, "relation": "son"}, {"id": 1, "relation": "son"}, {"id": 12, "relation": "daughter"}],
    "description": "Ezio's mother, a gracious Florentine noblewoman and patron of artists, and the warm heart of the Auditore household."
  },
  {
    "id": 90,
    "name": "Federico Auditore da Firenze",
    "group": "other",
    "historical": false,
    "born": "1456",
    "year": 1476,
    "image": "images/characters/federico-auditore-da-firenze.webp",
    "games": ["Assassin's Creed II"],
    "stories": "Short film: Assassin's Creed: Lineage",
    "family": [{"id": 11, "relation": "father"}, {"id": 89, "relation": "mother"}, {"id": 1, "relation": "brother"}, {"id": 12, "relation": "sister"}, {"id": 10, "relation": "uncle"}],
    "description": "Ezio's carefree older brother, quick with a joke and a fist, who leads him on races across the rooftops of Florence."
  },
  {
    "id": 91,
    "name": "Lorenzo de' Medici",
    "aka": ["Lorenzo il Magnifico"],
    "group": "other",
    "historical": true,
    "born": "1449",
    "year": 1476,
    "image": "images/characters/lorenzo-de-medici.webp",
    "games": ["Assassin's Creed II"],
    "stories": "Short film: Assassin's Creed: Lineage",
    "description": "The ruler of Florence in all but name, a great patron of artists and thinkers and a close friend of Ezio's father, Giovanni."
  },
  {
    "id": 92,
    "name": "Uberto Alberti",
    "group": "templar",
    "historical": false,
    "born": "1416",
    "year": 1476,
    "image": "images/characters/uberto-alberti.webp",
    "games": ["Assassin's Creed II"],
    "stories": "Short film: Assassin's Creed: Lineage",
    "description": "The Gonfaloniere of Florence, the city's chief magistrate, and a trusted friend of the Auditore family."
  },
  {
    "id": 93,
    "name": "Jacopo de' Pazzi",
    "group": "templar",
    "historical": true,
    "born": "1421",
    "year": 1478,
    "image": "images/characters/jacopo-de-pazzi.webp",
    "games": ["Assassin's Creed II"],
    "family": [{"id": 94, "relation": "nephew"}],
    "description": "The ageing head of the powerful Pazzi banking family, the Medici's great rivals for control of Florence."
  },
  {
    "id": 94,
    "name": "Francesco de' Pazzi",
    "group": "templar",
    "historical": true,
    "born": "1444",
    "year": 1478,
    "image": "images/characters/francesco-de-pazzi.webp",
    "games": ["Assassin's Creed II"],
    "family": [{"id": 93, "relation": "uncle"}],
    "description": "Jacopo's hot-headed nephew and Vieri's father, a Pazzi banker who burns with resentment of the Medici."
  },
  {
    "id": 95,
    "name": "La Volpe",
    "aka": ["Gilberto", "The Fox"],
    "group": "assassin",
    "historical": false,
    "year": 1478,
    "image": "images/characters/la-volpe.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood"],
    "description": "Florence's elusive master thief, known as the Fox, who leads the city's guild of thieves and seems to hear of everything that happens in its streets."
  },
  {
    "id": 96,
    "name": "Bartolomeo d'Alviano",
    "group": "assassin",
    "historical": true,
    "born": "1455",
    "year": 1486,
    "image": "images/characters/bartolomeo-dalviano.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed Brotherhood"],
    "description": "A boisterous condottiere, a mercenary captain with a booming laugh who takes on the Templars with his men and his beloved sword, Bianca."
  },
  {
    "id": 97,
    "name": "Antonio de Magianis",
    "group": "assassin",
    "historical": false,
    "born": "1443",
    "year": 1481,
    "image": "images/characters/antonio-de-magianis.webp",
    "games": ["Assassin's Creed II", "Assassin's Creed II: Discovery"],
    "description": "The leader of the thieves' guild in Venice, a sharp-tongued schemer with no love for the nobles who rule the city."
  },
  {
    "id": 98,
    "name": "Paola",
    "group": "assassin",
    "historical": false,
    "born": "1438",
    "year": 1476,
    "image": "images/characters/paola.webp",
    "games": ["Assassin's Creed II"],
    "description": "The poised madam of Florence's most elegant courtesan house, who teaches a hunted young Ezio the art of vanishing into a crowd."
  },
  {
    "id": 99,
    "name": "Yusuf Tazim",
    "group": "assassin",
    "historical": false,
    "born": "c. 1467",
    "year": 1511,
    "image": "images/characters/yusuf-tazim.webp",
    "games": ["Assassin's Creed Revelations"],
    "description": "The cheerful, quick-witted leader of the Assassins in Constantinople, who welcomes Ezio to the city and shows him its rooftops."
  },
  {
    "id": 100,
    "name": "Suleiman",
    "aka": ["Prince Suleiman", "Süleyman", "Suleiman the Magnificent"],
    "group": "other",
    "historical": true,
    "born": "1494",
    "year": 1511,
    "image": "images/characters/suleiman.webp",
    "games": ["Assassin's Creed Revelations"],
    "family": [{"id": 101, "relation": "uncle"}],
    "description": "The Sultan's seventeen-year-old grandson, a curious and thoughtful young prince eager to learn everything Constantinople can teach him."
  },
  {
    "id": 101,
    "name": "Ahmet",
    "aka": ["Prince Ahmet", "Şehzade Ahmet"],
    "group": "other",
    "historical": true,
    "born": "1466",
    "year": 1511,
    "image": "images/characters/ahmet.webp",
    "games": ["Assassin's Creed Revelations"],
    "family": [{"id": 100, "relation": "nephew"}],
    "description": "The Sultan's eldest son and favoured heir, Suleiman's uncle, a polished and persuasive prince with his eye on the Ottoman throne."
  },
  {
    "id": 102,
    "name": "Tarik Barleti",
    "group": "other",
    "historical": false,
    "born": "1470",
    "year": 1511,
    "image": "images/characters/tarik-barleti.webp",
    "games": ["Assassin's Creed Revelations"],
    "description": "The proud, blunt captain of the Janissaries, the Sultan's elite guard, who has little patience for foreigners like Ezio."
  },
  {
    "id": 103,
    "name": "Mary Read",
    "aka": ["James Kidd"],
    "group": "assassin",
    "historical": true,
    "year": 1715,
    "image": "images/characters/mary-read.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "A sharp-witted young pirate in Nassau who sails under the name James Kidd, and who wants to know where Edward got his Assassin's robes."
  },
  {
    "id": 104,
    "name": "Anne Bonny",
    "group": "other",
    "historical": true,
    "born": "1702",
    "year": 1718,
    "image": "images/characters/anne-bonny.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "A quick-tongued barmaid at the Old Avery tavern in Nassau, more than a match for the pirates who drink there."
  },
  {
    "id": 105,
    "name": "Bartholomew Roberts",
    "aka": ["Black Bart", "The Sage"],
    "group": "other",
    "historical": true,
    "born": "1682",
    "year": 1715,
    "image": "images/characters/bartholomew-roberts.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "A mysterious captive in Havana, known as the Sage, sought by powerful men for what he is said to know."
  },
  {
    "id": 106,
    "name": "Benjamin Hornigold",
    "group": "other",
    "historical": true,
    "born": "1680s",
    "year": 1715,
    "image": "images/characters/benjamin-hornigold.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "A veteran pirate captain and Blackbeard's partner, one of the founders of the pirate haven at Nassau, who teaches Edward how to run a ship."
  },
  {
    "id": 107,
    "name": "Charles Vane",
    "group": "other",
    "historical": true,
    "born": "c. 1680",
    "year": 1717,
    "image": "images/characters/charles-vane.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "A hot-headed, violent pirate captain who answers to no one, sailing into Nassau with his quartermaster Jack Rackham."
  },
  {
    "id": 108,
    "name": "Calico Jack Rackham",
    "aka": ["John Rackham"],
    "group": "other",
    "historical": true,
    "born": "1682",
    "year": 1717,
    "image": "images/characters/calico-jack-rackham.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "Charles Vane's flamboyant, easy-going quartermaster, a charming opportunist with a fondness for drink."
  },
  {
    "id": 109,
    "name": "Laureano Torres y Ayala",
    "aka": ["Laureano de Torres y Ayala", "Governor Torres"],
    "group": "templar",
    "historical": true,
    "born": "1645",
    "year": 1715,
    "image": "images/characters/laureano-torres-y-ayala.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "The Spanish Governor of Havana, a polished and courteous statesman and the Grand Master of the Templars in the West Indies."
  },
  {
    "id": 110,
    "name": "Woodes Rogers",
    "group": "templar",
    "historical": true,
    "born": "1679",
    "year": 1715,
    "image": "images/characters/woodes-rogers.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "An English privateer and former navy captain among the Templars in Havana, who later comes to the Bahamas as its governor."
  },
  {
    "id": 111,
    "name": "Ah Tabai",
    "group": "assassin",
    "historical": false,
    "born": "1660s",
    "year": 1716,
    "image": "images/characters/ah-tabai.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "description": "The calm, stern Mentor of the Assassins in the West Indies, who leads the Brotherhood from its hidden home at Tulum."
  },
  {
    "id": 112,
    "name": "Kaniehtí:io",
    "aka": ["Ziio"],
    "group": "other",
    "historical": false,
    "born": "1731",
    "year": 1754,
    "image": "images/characters/kaniehti-io.webp",
    "games": ["Assassin's Creed III"],
    "family": [{"id": 16, "relation": "son"}],
    "description": "A Kanien'kehá:ka (Mohawk) woman fighting to protect her people's land, who crosses paths with Haytham Kenway in 1754."
  },
  {
    "id": 113,
    "name": "Reginald Birch",
    "group": "templar",
    "historical": false,
    "born": "1705",
    "year": 1754,
    "image": "images/characters/reginald-birch.webp",
    "games": ["Assassin's Creed III"],
    "stories": "Novel: Forsaken",
    "description": "A wealthy London merchant and an old friend of the Kenway family, who has watched over Haytham since he was a boy."
  },
  {
    "id": 114,
    "name": "Thomas Hickey",
    "group": "templar",
    "historical": true,
    "year": 1754,
    "image": "images/characters/thomas-hickey.webp",
    "games": ["Assassin's Creed III"],
    "description": "A crude, cocky soldier who works as William Johnson's hired muscle, more interested in coin than in any cause."
  },
  {
    "id": 115,
    "name": "John Pitcairn",
    "group": "templar",
    "historical": true,
    "born": "1722",
    "year": 1754,
    "image": "images/characters/john-pitcairn.webp",
    "games": ["Assassin's Creed III"],
    "description": "A young British marine officer serving under General Braddock in 1754, a soldier with a strong sense of duty."
  },
  {
    "id": 116,
    "name": "William Johnson",
    "group": "templar",
    "historical": true,
    "born": "1715",
    "year": 1754,
    "image": "images/characters/william-johnson.webp",
    "games": ["Assassin's Creed III", "Assassin's Creed Rogue"],
    "description": "A British trader and official with close ties to the Mohawk, whose hard-won research has been stolen by thieves in Boston."
  },
  {
    "id": 117,
    "name": "Benjamin Church",
    "group": "templar",
    "historical": true,
    "born": "1734",
    "year": 1754,
    "image": "images/characters/benjamin-church.webp",
    "games": ["Assassin's Creed III"],
    "description": "A Boston physician and surgeon, held for ransom by slavers when Haytham first comes looking for him."
  },
  {
    "id": 118,
    "name": "Samuel Adams",
    "aka": ["Sam Adams"],
    "group": "other",
    "historical": true,
    "born": "1722",
    "year": 1770,
    "image": "images/characters/samuel-adams.webp",
    "games": ["Assassin's Creed III"],
    "description": "A Boston political organiser and Patriot leader of the Sons of Liberty, who lends Connor a hand when the city turns against him."
  },
  {
    "id": 119,
    "name": "Marquis de Lafayette",
    "aka": ["Gilbert du Motier"],
    "group": "other",
    "historical": true,
    "born": "1757",
    "year": 1778,
    "image": "images/characters/marquis-de-lafayette.webp",
    "games": ["Assassin's Creed III"],
    "description": "A young French aristocrat and idealist serving as a major general in Washington's Continental Army."
  },
  {
    "id": 120,
    "name": "Madeleine de L'Isle",
    "group": "other",
    "historical": false,
    "born": "1732",
    "year": 1765,
    "image": "images/characters/madeleine-de-lisle.webp",
    "games": ["Assassin's Creed III: Liberation"],
    "family": [{"id": 19, "relation": "stepdaughter"}],
    "description": "Aveline's elegant, well-connected stepmother, the wife of the wealthy New Orleans merchant Philippe de Grandpré."
  },
  {
    "id": 121,
    "name": "Agaté",
    "group": "assassin",
    "historical": false,
    "born": "c. 1722",
    "year": 1766,
    "image": "images/characters/agate.webp",
    "games": ["Assassin's Creed III: Liberation"],
    "description": "A reclusive former slave who lives deep in the bayou, the Mentor of the Assassins in Louisiana and the man who trained Aveline."
  },
  {
    "id": 122,
    "name": "Gérald Blanc",
    "group": "assassin",
    "historical": false,
    "born": "1745",
    "year": 1765,
    "image": "images/characters/gerald-blanc.webp",
    "games": ["Assassin's Creed III: Liberation"],
    "description": "Aveline's childhood friend and her father's clerk, who keeps a quiet network of informants across New Orleans."
  },
  {
    "id": 123,
    "name": "Liam O'Brien",
    "group": "assassin",
    "historical": false,
    "born": "1726",
    "year": 1752,
    "image": "images/characters/liam-obrien.webp",
    "games": ["Assassin's Creed Rogue"],
    "description": "Shay's oldest friend and a senior Assassin of the Colonial Brotherhood, Achilles Davenport's first recruit and right hand."
  },
  {
    "id": 124,
    "name": "Hope Jensen",
    "group": "assassin",
    "historical": false,
    "born": "1732",
    "year": 1752,
    "image": "images/characters/hope-jensen.webp",
    "games": ["Assassin's Creed Rogue"],
    "description": "A Colonial Assassin who runs New York's criminal gangs as the Brotherhood's eyes and ears, and who teaches Shay the art of stealth."
  },
  {
    "id": 125,
    "name": "Christopher Gist",
    "group": "templar",
    "historical": true,
    "born": "1706",
    "year": 1756,
    "image": "images/characters/christopher-gist.webp",
    "games": ["Assassin's Creed Rogue"],
    "description": "A frontiersman and surveyor whom Shay saves from the gallows in New York, and who becomes first mate of his ship, the Morrigan."
  },
  {
    "id": 126,
    "name": "Chevalier de la Vérendrye",
    "aka": ["Louis-Joseph Gaultier de La Vérendrye"],
    "group": "assassin",
    "historical": true,
    "born": "1717",
    "year": 1752,
    "image": "images/characters/chevalier-de-la-verendrye.webp",
    "games": ["Assassin's Creed Rogue"],
    "description": "A proud French-Canadian nobleman, explorer and sea captain of the Colonial Brotherhood, who has little time for Shay."
  },
  {
    "id": 127,
    "name": "François-Thomas Germain",
    "group": "other",
    "historical": true,
    "born": "1726",
    "year": 1791,
    "image": "images/characters/francois-thomas-germain.webp",
    "games": ["Assassin's Creed Unity"],
    "description": "A celebrated royal silversmith of Paris, who says he was forced to make the pin used in a murder that Arno is investigating."
  },
  {
    "id": 128,
    "name": "Pierre Bellec",
    "group": "assassin",
    "historical": false,
    "born": "c. 1740",
    "year": 1789,
    "image": "images/characters/pierre-bellec.webp",
    "games": ["Assassin's Creed Unity"],
    "description": "A gruff veteran Assassin and old soldier of the Seven Years' War, who shares a cell with Arno in the Bastille and teaches him to fight."
  },
  {
    "id": 129,
    "name": "Mirabeau",
    "aka": ["Honoré Gabriel Riqueti, comte de Mirabeau"],
    "group": "assassin",
    "historical": true,
    "born": "1749",
    "year": 1789,
    "image": "images/characters/mirabeau.webp",
    "games": ["Assassin's Creed Unity"],
    "description": "The great orator of the National Assembly and a leading voice of the Revolution, who is secretly the Mentor of the Paris Assassins."
  },
  {
    "id": 130,
    "name": "François de la Serre",
    "group": "templar",
    "historical": false,
    "born": "1733",
    "year": 1776,
    "image": "images/characters/francois-de-la-serre.webp",
    "games": ["Assassin's Creed Unity"],
    "family": [{"id": 37, "relation": "daughter"}, {"id": 36, "relation": "adopted son"}],
    "description": "A nobleman of Versailles and Élise's father, who takes the orphaned young Arno into his family."
  },
  {
    "id": 131,
    "name": "Napoleon Bonaparte",
    "aka": ["Napoleon I"],
    "group": "other",
    "historical": true,
    "born": "1769",
    "year": 1792,
    "image": "images/characters/napoleon-bonaparte.webp",
    "games": ["Assassin's Creed Unity"],
    "description": "A young and ambitious Corsican artillery officer of the French Army, met searching the Tuileries for a prize of his own."
  },
  {
    "id": 132,
    "name": "Nehal",
    "group": "other",
    "historical": false,
    "year": 861,
    "image": "images/characters/nehal.webp",
    "games": ["Assassin's Creed Mirage"],
    "description": "Basim's closest friend in Anbar, a fellow street thief who trusts no one but herself and has little faith in the Hidden Ones."
  },
  {
    "id": 133,
    "name": "Fuladh",
    "aka": ["Fuladh Al Haami"],
    "group": "assassin",
    "historical": false,
    "year": 862,
    "image": "images/characters/fuladh.webp",
    "games": ["Assassin's Creed Mirage"],
    "stories": "Novel: Daughter of No One; comic: A Soar of Eagles",
    "description": "The Hidden Ones' calm, dry-humoured Eagle-Master at Alamut, who introduces Basim to his eagle, Enkidu, and helps Roshan guide him."
  },
  {
    "id": 134,
    "name": "Abu Jafar Muhammad ibn Musa",
    "aka": ["Muhammad ibn Musa", "Banu Musa"],
    "group": "assassin",
    "historical": true,
    "born": "c. 780",
    "year": 862,
    "image": "images/characters/abu-jafar-muhammad-ibn-musa.webp",
    "games": ["Assassin's Creed Mirage"],
    "family": [{"id": 135, "relation": "brother"}, {"id": 136, "relation": "brother"}],
    "description": "One of the three Banu Musa brothers, scholars of Baghdad's House of Wisdom, who crafts and upgrades the Hidden Ones' tools for Basim."
  },
  {
    "id": 135,
    "name": "Ahmad ibn Musa",
    "aka": ["Banu Musa"],
    "group": "assassin",
    "historical": true,
    "year": 862,
    "image": "images/characters/ahmad-ibn-musa.webp",
    "games": ["Assassin's Creed Mirage"],
    "family": [{"id": 134, "relation": "brother"}, {"id": 136, "relation": "brother"}],
    "description": "One of the three Banu Musa brothers of Baghdad's House of Wisdom, an inventor with a gift for ingenious machines who works with the Hidden Ones."
  },
  {
    "id": 136,
    "name": "Al-Hasan ibn Musa",
    "aka": ["Banu Musa"],
    "group": "assassin",
    "historical": true,
    "born": "c. 810",
    "year": 862,
    "image": "images/characters/al-hasan-ibn-musa.webp",
    "games": ["Assassin's Creed Mirage"],
    "family": [{"id": 134, "relation": "brother"}, {"id": 135, "relation": "brother"}],
    "description": "One of the three Banu Musa brothers, a scholar and engineer of the House of Wisdom who keeps a workshop for the Hidden Ones at Alamut."
  },
  {
    "id": 137,
    "name": "Qabiha",
    "group": "other",
    "historical": true,
    "year": 862,
    "image": "images/characters/qabiha.webp",
    "games": ["Assassin's Creed Mirage"],
    "family": [{"id": 138, "relation": "son"}],
    "description": "The mother of the murdered caliph's young son, who runs the harem in Baghdad and wields quiet influence at the Abbasid court."
  },
  {
    "id": 138,
    "name": "Abu 'Abdallah",
    "aka": ["Al-Mu'tazz", "Abu 'Abdallah Muhammad ibn Ja'far"],
    "group": "other",
    "historical": true,
    "born": "c. 847",
    "year": 861,
    "image": "images/characters/abu-abdallah.webp",
    "games": ["Assassin's Creed Mirage"],
    "family": [{"id": 137, "relation": "mother"}],
    "description": "The young son of Caliph al-Mutawakkil and Qabiha, an Abbasid prince who will one day rule as Caliph al-Mu'tazz."
  },
  {
    "id": 139,
    "name": "Ali ibn Muhammad",
    "aka": ["Sahib al-Zanj"],
    "group": "other",
    "historical": true,
    "year": 862,
    "image": "images/characters/ali-ibn-muhammad.webp",
    "games": ["Assassin's Creed Mirage"],
    "description": "The fiery leader of the Zanj, enslaved workers rising against their masters, and a useful but uneasy ally of the Hidden Ones in Baghdad."
  },
  {
    "id": 140,
    "name": "Lucy Thorne",
    "group": "templar",
    "historical": false,
    "born": "1837",
    "year": 1868,
    "image": "images/characters/lucy-thorne.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "Crawford Starrick's cold, sharp-minded lieutenant, a scholar of the occult hunting for a Piece of Eden hidden somewhere in London."
  },
  {
    "id": 141,
    "name": "Pearl Attaway",
    "group": "other",
    "historical": false,
    "born": "1833",
    "year": 1868,
    "image": "images/characters/pearl-attaway.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The shrewd owner of Attaway Transport, whose omnibuses are locked in a ruthless war for London's roads, and who hires Jacob to help her win it."
  },
  {
    "id": 142,
    "name": "Maxwell Roth",
    "group": "other",
    "historical": false,
    "year": 1868,
    "image": "images/characters/maxwell-roth.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The flamboyant leader of the Blighters, a lover of theatre and chaos who invites Jacob to the Alhambra music hall with an offer."
  },
  {
    "id": 143,
    "name": "Alexander Graham Bell",
    "group": "other",
    "historical": true,
    "born": "1847",
    "year": 1868,
    "image": "images/characters/alexander-graham-bell.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "A young Scottish inventor and friend of Henry Green, who builds the Frye twins' gadgets while he dreams of sending voices down a wire."
  },
  {
    "id": 144,
    "name": "Frederick Abberline",
    "group": "other",
    "historical": true,
    "born": "1843",
    "year": 1868,
    "image": "images/characters/frederick-abberline.webp",
    "games": ["Assassin's Creed Syndicate"],
    "stories": "Novel: Underworld; comic: Locus",
    "description": "A Whitechapel police sergeant who quietly trades favours with the Frye twins against London's gangs, and who returns as an inspector in 1888."
  },
  {
    "id": 145,
    "name": "Ned Wynert",
    "group": "other",
    "historical": false,
    "born": "1840",
    "year": 1868,
    "image": "images/characters/ned-wynert.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "An American businessman with a cargo and smuggling operation on the Thames, who hires the twins to raid shipments and trains."
  },
  {
    "id": 146,
    "name": "Charles Dickens",
    "group": "other",
    "historical": true,
    "born": "1812",
    "year": 1868,
    "image": "images/characters/charles-dickens.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The celebrated novelist and a member of the Ghost Club, who asks the twins to look into London's strangest ghost stories."
  },
  {
    "id": 147,
    "name": "Charles Darwin",
    "group": "other",
    "historical": true,
    "born": "1809",
    "year": 1868,
    "image": "images/characters/charles-darwin.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The famous naturalist, elderly but as curious as ever, who turns detective to expose a dangerous patent medicine."
  },
  {
    "id": 148,
    "name": "Karl Marx",
    "group": "other",
    "historical": true,
    "born": "1818",
    "year": 1868,
    "image": "images/characters/karl-marx.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The exiled German philosopher, organising London's workers, who asks the twins to protect his meetings without bloodshed."
  },
  {
    "id": 149,
    "name": "Florence Nightingale",
    "group": "other",
    "historical": true,
    "born": "1820",
    "year": 1868,
    "image": "images/characters/florence-nightingale.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The famous nurse of the Crimean War, now fighting the poisoned medicines that are flooding London's hospitals."
  },
  {
    "id": 150,
    "name": "Benjamin Disraeli",
    "group": "other",
    "historical": true,
    "born": "1804",
    "year": 1868,
    "image": "images/characters/benjamin-disraeli.webp",
    "games": ["Assassin's Creed Syndicate"],
    "family": [{"id": 151, "relation": "wife"}],
    "description": "The newly appointed Prime Minister, a sharp and witty statesman whom someone in London wants dead."
  },
  {
    "id": 151,
    "name": "Mary Anne Disraeli",
    "group": "other",
    "historical": true,
    "born": "1792",
    "year": 1868,
    "image": "images/characters/mary-anne-disraeli.webp",
    "games": ["Assassin's Creed Syndicate"],
    "family": [{"id": 150, "relation": "husband"}],
    "description": "Disraeli's lively, sharp-tongued wife, who insists on joining Jacob in the hunt for the plotters against her husband."
  },
  {
    "id": 152,
    "name": "Queen Victoria",
    "group": "other",
    "historical": true,
    "born": "1819",
    "year": 1868,
    "image": "images/characters/queen-victoria.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The Queen of the United Kingdom, monarch of an empire at the height of its power, who comes to rely on the Frye twins."
  },
  {
    "id": 153,
    "name": "Duleep Singh",
    "aka": ["Dalip Singh"],
    "group": "other",
    "historical": true,
    "born": "1838",
    "year": 1868,
    "image": "images/characters/duleep-singh.webp",
    "games": ["Assassin's Creed Syndicate"],
    "description": "The last Maharaja of the Sikh Empire, living in exile in England as a friend of the Queen, who quietly helps the Assassins."
  },
  {
    "id": 154,
    "name": "Ethan Frye",
    "group": "assassin",
    "historical": false,
    "year": 1841,
    "games": ["Assassin's Creed Chronicles: India"],
    "stories": "Novel: Underworld",
    "family": [{"id": 38, "relation": "son"}, {"id": 39, "relation": "daughter"}],
    "description": "A Master Assassin of the British Brotherhood and the father of Jacob and Evie Frye, to whom Arbaaz Mir entrusts a famous diamond."
  },
  {
    "id": 155,
    "name": "Pyara Kaur",
    "aka": ["Princess Pyara Kaur"],
    "group": "other",
    "historical": false,
    "year": 1841,
    "image": "images/characters/pyara-kaur.webp",
    "games": ["Assassin's Creed Chronicles: India"],
    "stories": "Graphic novel: Brahman; novel: Underworld",
    "family": [{"id": 43, "relation": "husband"}, {"id": 41, "relation": "son"}],
    "description": "A Sikh princess, granddaughter of Maharaja Ranjit Singh, and the woman the Assassin Arbaaz Mir has sworn to protect."
  },
  {
    "id": 156,
    "name": "Marquis de Sade",
    "aka": ["Donatien Alphonse François de Sade"],
    "group": "other",
    "historical": true,
    "born": "1740",
    "year": 1789,
    "image": "images/characters/marquis-de-sade.webp",
    "games": ["Assassin's Creed Unity"],
    "description": "The notorious libertine writer and aristocrat, a fellow prisoner of Arno's in the Bastille, who later becomes his mocking, self-serving ally, trading information for favours."
  },
  {
    "id": 157,
    "name": "Alan Rikkin",
    "group": "templar",
    "historical": false,
    "year": 2012,
    "image": "images/characters/alan-rikkin.webp",
    "games": ["Assassin's Creed"],
    "stories": "Film: Assassin's Creed (2016); novel: Heresy",
    "family": [{"id": 192, "relation": "daughter"}],
    "description": "The chief executive of Abstergo Industries, who keeps a close eye on its Animus research, from Desmond Miles's sessions to Callum Lynch's in the 2016 film."
  },
  {
    "id": 158,
    "name": "Victoria Bibeau",
    "group": "assassin",
    "historical": false,
    "year": 2016,
    "image": "images/characters/victoria-bibeau.webp",
    "games": ["Assassin's Creed Odyssey"],
    "stories": "Novels: Last Descendants trilogy, Heresy; comic: Locus",
    "description": "A psychiatrist and expert on the Bleeding Effect, once of Abstergo, who later joins Layla Hassan's Assassin team to watch over her health in the Animus."
  },
  {
    "id": 159,
    "name": "Jupiter",
    "aka": ["Tinia", "Zeus"],
    "group": "isu",
    "historical": false,
    "year": -75000,
    "image": "images/characters/jupiter.webp",
    "games": ["Assassin's Creed Revelations", "Assassin's Creed III"],
    "description": "A leader of the Isu, the First Civilization, whose message reaches Desmond across thousands of years with word of the hidden temples his people left behind."
  },
  {
    "id": 160,
    "name": "Aletheia",
    "group": "isu",
    "historical": false,
    "year": -75000,
    "image": "images/characters/aletheia.webp",
    "games": ["Assassin's Creed Odyssey"],
    "description": "An Isu whose mind lives on in the Staff of Hermes, guiding the Staff's keeper, Kassandra, toward the secrets of Atlantis."
  },
  {
    "id": 161,
    "name": "Aita",
    "group": "isu",
    "historical": false,
    "year": -75000,
    "image": "images/characters/aita.webp",
    "games": ["Assassin's Creed III", "Assassin's Creed Odyssey"],
    "family": [{"id": 25, "relation": "wife"}],
    "description": "An Isu scientist and Juno's husband, glimpsed in visions of the First Civilization's last days."
  },
  {
    "id": 162,
    "name": "Hermes Trismegistus",
    "group": "isu",
    "historical": false,
    "year": -75000,
    "image": "images/characters/hermes-trismegistus.webp",
    "games": ["Assassin's Creed Odyssey"],
    "description": "The Isu craftsman who gave the Staff of Hermes its name, and who offers to teach Kassandra its powers in the fields of Elysium."
  },
  {
    "id": 163,
    "name": "Poseidon",
    "group": "isu",
    "historical": false,
    "year": -75000,
    "image": "images/characters/poseidon.webp",
    "games": ["Assassin's Creed Odyssey"],
    "description": "The Isu king of Atlantis, who makes Kassandra a judge, a dikastes, of his city."
  },
  {
    "id": 164,
    "name": "Persephone",
    "aka": ["Kore"],
    "group": "isu",
    "historical": false,
    "year": -75000,
    "image": "images/characters/persephone.webp",
    "games": ["Assassin's Creed Odyssey"],
    "family": [{"id": 165, "relation": "husband"}],
    "description": "The Isu queen of Elysium, a seemingly perfect paradise that she rules with an iron fist."
  },
  {
    "id": 165,
    "name": "Hades",
    "group": "isu",
    "historical": false,
    "year": -75000,
    "image": "images/characters/hades.webp",
    "games": ["Assassin's Creed Odyssey"],
    "family": [{"id": 164, "relation": "wife"}],
    "description": "The Isu lord of the Underworld, who sets Kassandra to work restoring order in his realm."
  },
  {
    "id": 166,
    "name": "Flavius Metellus",
    "group": "other",
    "historical": false,
    "year": -48,
    "image": "images/characters/flavius-metellus.webp",
    "games": ["Assassin's Creed Origins"],
    "description": "A Roman officer and Julius Caesar's trusted lieutenant, who arrives with him in Alexandria in the middle of Egypt's civil war."
  },
  {
    "id": 167,
    "name": "Lucius Septimius",
    "group": "templar",
    "historical": true,
    "year": -48,
    "image": "images/characters/lucius-septimius.webp",
    "games": ["Assassin's Creed Origins"],
    "description": "A Roman commander of the Gabiniani, the garrison that serves Egypt's boy-king, and a member of the secret order that Bayek is hunting."
  },
  {
    "id": 168,
    "name": "Ptolemy XIII",
    "aka": ["Ptolemy XIII Theos Philopator"],
    "group": "other",
    "historical": true,
    "born": "c. 62 BCE",
    "year": -48,
    "image": "images/characters/ptolemy-xiii.webp",
    "games": ["Assassin's Creed Origins"],
    "family": [{"id": 28, "relation": "sister"}],
    "description": "Egypt's young pharaoh, at war with his exiled sister Cleopatra for the throne and guided by his scheming court advisers."
  },
  {
    "id": 169,
    "name": "Apollodorus",
    "aka": ["Apollodorus the Sicilian"],
    "group": "other",
    "historical": true,
    "year": -48,
    "image": "images/characters/apollodorus.webp",
    "games": ["Assassin's Creed Origins"],
    "description": "Cleopatra's devoted Sicilian spymaster, who runs her network of agents in Alexandria and brings Bayek into her service."
  },
  {
    "id": 170,
    "name": "Khemu",
    "group": "other",
    "historical": false,
    "year": -49,
    "image": "images/characters/khemu.webp",
    "games": ["Assassin's Creed Origins"],
    "family": [{"id": 26, "relation": "father"}, {"id": 27, "relation": "mother"}],
    "description": "Bayek and Aya's young son in Siwa, whom Bayek is teaching the ways of the Medjay."
  },
  {
    "id": 171,
    "name": "Brutus",
    "aka": ["Marcus Junius Brutus"],
    "group": "assassin",
    "historical": true,
    "born": "85 BCE",
    "year": -47,
    "image": "images/characters/brutus.webp",
    "games": ["Assassin's Creed Origins"],
    "stories": "Comic: Origins",
    "description": "A Roman senator wary of Julius Caesar's growing power, whom Aya counts among her Roman brothers."
  },
  {
    "id": 172,
    "name": "Cassius",
    "aka": ["Gaius Cassius Longinus"],
    "group": "assassin",
    "historical": true,
    "born": "c. 86 BCE",
    "year": -47,
    "image": "images/characters/cassius.webp",
    "games": ["Assassin's Creed Origins"],
    "stories": "Comic: Origins",
    "description": "A Roman senator and general who comes to Alexandria with Brutus as one of Aya's Roman allies."
  },
  {
    "id": 173,
    "name": "Myrrine",
    "group": "other",
    "historical": false,
    "year": -431,
    "image": "images/characters/myrrine.webp",
    "games": ["Assassin's Creed Odyssey"],
    "stories": "Novel: Odyssey",
    "family": [{"id": 198, "relation": "father"}, {"id": 174, "relation": "husband"}, {"id": 30, "relation": "daughter"}],
    "description": "A Spartan noblewoman, daughter of King Leonidas and Kassandra's mother, lost to her since a family tragedy on Mount Taygetos."
  },
  {
    "id": 174,
    "name": "Nikolaos",
    "aka": ["The Wolf of Sparta"],
    "group": "other",
    "historical": false,
    "year": -431,
    "image": "images/characters/nikolaos.webp",
    "games": ["Assassin's Creed Odyssey"],
    "stories": "Novel: Odyssey",
    "family": [{"id": 173, "relation": "wife"}, {"id": 30, "relation": "stepdaughter"}],
    "description": "A feared Spartan general known as the Wolf of Sparta, the man who raised Kassandra, and the target of her first great contract."
  },
  {
    "id": 175,
    "name": "Barnabas",
    "group": "other",
    "historical": false,
    "year": -431,
    "image": "images/characters/barnabas.webp",
    "games": ["Assassin's Creed Odyssey"],
    "stories": "Novel: Odyssey",
    "description": "A good-natured, one-eyed and very superstitious sea captain, who gives Kassandra his ship, the Adrestia, and its crew."
  },
  {
    "id": 176,
    "name": "Herodotos",
    "aka": ["Herodotus"],
    "group": "other",
    "historical": true,
    "born": "c. 484 BCE",
    "year": -431,
    "image": "images/characters/herodotos.webp",
    "games": ["Assassin's Creed Odyssey"],
    "stories": "Novel: Odyssey",
    "description": "The travelling historian and storyteller, the Father of History, who befriends Kassandra at Delphi and chronicles her journey."
  },
  {
    "id": 177,
    "name": "Phoibe",
    "group": "other",
    "historical": false,
    "year": -431,
    "image": "images/characters/phoibe.webp",
    "games": ["Assassin's Creed Odyssey"],
    "stories": "Novel: Odyssey",
    "description": "A lively orphan girl on Kephallonia, who looks up to Kassandra as a big sister and dreams of adventures of her own."
  },
  {
    "id": 178,
    "name": "Pythagoras",
    "group": "other",
    "historical": true,
    "born": "c. 570 BCE",
    "year": -422,
    "image": "images/characters/pythagoras.webp",
    "games": ["Assassin's Creed Odyssey"],
    "stories": "Novel: Odyssey",
    "description": "The legendary philosopher and mathematician of Samos, long believed dead, whose path crosses Kassandra's late in her journey."
  },
  {
    "id": 179,
    "name": "Sokrates",
    "aka": ["Socrates"],
    "group": "other",
    "historical": true,
    "born": "c. 470 BCE",
    "year": -431,
    "image": "images/characters/sokrates.webp",
    "games": ["Assassin's Creed Odyssey"],
    "stories": "Novel: Odyssey",
    "description": "Athens' barefoot philosopher, who loves to answer every question with another and to tangle Kassandra in moral dilemmas."
  },
  {
    "id": 180,
    "name": "Perikles",
    "aka": ["Pericles"],
    "group": "other",
    "historical": true,
    "born": "c. 495 BCE",
    "year": -431,
    "image": "images/characters/perikles.webp",
    "games": ["Assassin's Creed Odyssey"],
    "stories": "Novel: Odyssey",
    "description": "The statesman who leads Athens into its war with Sparta, and hosts the city's most famous symposium."
  },
  {
    "id": 181,
    "name": "Aspasia",
    "group": "other",
    "historical": true,
    "born": "c. 470 BCE",
    "year": -431,
    "image": "images/characters/aspasia.webp",
    "games": ["Assassin's Creed Odyssey"],
    "stories": "Novel: Odyssey",
    "description": "Perikles' sharp and influential companion, at the heart of Athens' circle of thinkers and politicians, who helps Kassandra search for her mother."
  },
  {
    "id": 182,
    "name": "Darius",
    "group": "assassin",
    "historical": false,
    "year": -429,
    "image": "images/characters/darius.webp",
    "games": ["Assassin's Creed Odyssey"],
    "description": "A Persian renegade in hiding, the legendary killer of King Xerxes and the first known wielder of a hidden blade, hunted by a shadowy order."
  },
  {
    "id": 183,
    "name": "Randvi",
    "group": "other",
    "historical": false,
    "year": 872,
    "image": "images/characters/randvi.webp",
    "games": ["Assassin's Creed Valhalla"],
    "stories": "Novel: Geirmund's Saga",
    "family": [{"id": 33, "relation": "husband"}],
    "description": "Sigurd's wife and the Raven Clan's shrewd counsellor, who keeps the clan's affairs and its map of alliances in order."
  },
  {
    "id": 184,
    "name": "Ivarr",
    "aka": ["Ivarr the Boneless", "Ivar the Boneless"],
    "group": "other",
    "historical": true,
    "year": 873,
    "image": "images/characters/ivarr.webp",
    "games": ["Assassin's Creed Valhalla"],
    "stories": "Comic: Blood Brothers",
    "family": [{"id": 185, "relation": "brother"}, {"id": 186, "relation": "brother"}],
    "description": "The wild and unpredictable son of Ragnar Lothbrok, who welcomes the Raven Clan into the Danish fight for Mercia."
  },
  {
    "id": 185,
    "name": "Ubba",
    "aka": ["Ubba Ragnarsson"],
    "group": "other",
    "historical": true,
    "year": 873,
    "image": "images/characters/ubba.webp",
    "games": ["Assassin's Creed Valhalla"],
    "family": [{"id": 184, "relation": "brother"}, {"id": 186, "relation": "brother"}],
    "description": "The steadiest of Ragnar Lothbrok's sons, a Danish commander in England who dreams of a lasting peace between Danes and Saxons."
  },
  {
    "id": 186,
    "name": "Halfdan",
    "aka": ["Halfdan Ragnarsson"],
    "group": "other",
    "historical": true,
    "year": 876,
    "image": "images/characters/halfdan.webp",
    "games": ["Assassin's Creed Valhalla"],
    "stories": "Novel: Geirmund's Saga; comic: Blood Brothers",
    "family": [{"id": 184, "relation": "brother"}, {"id": 185, "relation": "brother"}],
    "description": "The eldest of Ragnar Lothbrok's sons, a seasoned war-leader who calls on Eivor to help him hold Northumbria."
  },
  {
    "id": 187,
    "name": "Alfred the Great",
    "aka": ["Aelfred", "King Alfred"],
    "group": "other",
    "historical": true,
    "born": "c. 849",
    "year": 874,
    "image": "images/characters/alfred-the-great.webp",
    "games": ["Assassin's Creed Valhalla"],
    "stories": "Novel: Geirmund's Saga; comic: Blood Brothers",
    "description": "The proud and pious King of Wessex, the last Saxon king standing against the Danish invasion of England."
  },
  {
    "id": 188,
    "name": "Fulke",
    "group": "other",
    "historical": false,
    "year": 874,
    "image": "images/characters/fulke.webp",
    "games": ["Assassin's Creed Valhalla"],
    "description": "A Frankish scholar of holy relics, imprisoned for heresy at St Albanes, whose strange beliefs fascinate Sigurd."
  },
  {
    "id": 189,
    "name": "Dag",
    "group": "other",
    "historical": false,
    "year": 872,
    "image": "images/characters/dag.webp",
    "games": ["Assassin's Creed Valhalla"],
    "stories": "Comic: Song of Glory",
    "description": "A gruff veteran of the Raven Clan and Sigurd's old friend, who fights at Eivor's side but keeps a wary eye on her."
  },
  {
    "id": 190,
    "name": "Styrbjorn",
    "aka": ["King Styrbjorn"],
    "group": "other",
    "historical": false,
    "year": 855,
    "image": "images/characters/styrbjorn.webp",
    "games": ["Assassin's Creed Valhalla"],
    "stories": "Comic: Song of Glory; novel: Geirmund's Saga",
    "family": [{"id": 33, "relation": "son"}, {"id": 32, "relation": "adopted daughter"}],
    "description": "The ageing king of the Raven Clan, who took the orphaned Eivor into his family and raised her alongside his son Sigurd."
  },
  {
    "id": 191,
    "name": "Valka",
    "group": "other",
    "historical": false,
    "year": 872,
    "image": "images/characters/valka.webp",
    "games": ["Assassin's Creed Valhalla"],
    "stories": "Novel: Sword of the White Horse",
    "description": "The Raven Clan's seer, whose potions and rituals help Eivor make sense of her troubling dreams."
  },
  {
    "id": 192,
    "name": "Sofia Rikkin",
    "aka": ["Sophia Rikkin"],
    "group": "templar",
    "historical": false,
    "born": "1980",
    "year": 2016,
    "image": "images/characters/sofia-rikkin.webp",
    "games": [],
    "stories": "Film: Assassin's Creed (2016)",
    "family": [{"id": 157, "relation": "father"}],
    "description": "Abstergo's lead scientist in Madrid and Alan Rikkin's daughter, who puts Callum Lynch in the Animus in the hope of curing humanity of violence."
  },
  {
    "id": 193,
    "name": "Joseph Lynch",
    "group": "assassin",
    "historical": false,
    "born": "1955",
    "year": 1986,
    "image": "images/characters/joseph-lynch.webp",
    "games": [],
    "stories": "Film: Assassin's Creed (2016)",
    "family": [{"id": 57, "relation": "son"}],
    "description": "Callum Lynch's father, an Irish-born Assassin of the modern Brotherhood whom his son has not seen since he was a boy."
  },
  {
    "id": 194,
    "name": "Baptiste",
    "group": "templar",
    "historical": false,
    "year": 1765,
    "image": "images/characters/baptiste.webp",
    "games": ["Assassin's Creed III: Liberation"],
    "description": "A former Assassin of Saint-Domingue turned voodoo cult leader in the bayou, who has thrown in his lot with the Templars and stands in Aveline's way."
  },
  {
    "id": 195,
    "name": "Darim Ibn-La'Ahad",
    "group": "assassin",
    "historical": false,
    "born": "1195",
    "year": 1227,
    "image": "images/characters/darim-ibn-laahad.webp",
    "games": ["Assassin's Creed Revelations"],
    "stories": "Novel: The Secret Crusade; comic: Reflections",
    "family": [{"id": 2, "relation": "father"}, {"id": 87, "relation": "mother"}],
    "description": "Altaïr and Maria's elder son, a skilled archer who grows up in Masyaf and follows his father on his travels far beyond the Levant."
  },
  {
    "id": 196,
    "name": "Duncan Walpole",
    "group": "assassin",
    "historical": false,
    "year": 1715,
    "image": "images/characters/duncan-walpole.webp",
    "games": ["Assassin's Creed IV: Black Flag", "Assassin's Creed Black Flag Resynced"],
    "stories": "Novel: Black Flag",
    "description": "An Assassin deserting the Brotherhood with secrets to sell to the Templars, whose fateful duel with Edward Kenway sets the young pirate on a new course."
  },
  {
    "id": 197,
    "name": "Jacques de Molay",
    "group": "templar",
    "historical": true,
    "born": "c. 1244",
    "year": 1307,
    "image": "images/characters/jacques-de-molay.webp",
    "games": ["Assassin's Creed Unity"],
    "description": "The last Grand Master of the Knights Templar, guardian of the Order's deepest secrets as the King of France moves against it in 1307."
  },
  {
    "id": 198,
    "name": "Leonidas",
    "aka": ["Leonidas I", "King Leonidas"],
    "group": "other",
    "historical": true,
    "born": "c. 540 BCE",
    "year": -480,
    "image": "images/characters/leonidas.webp",
    "games": ["Assassin's Creed Odyssey"],
    "family": [{"id": 173, "relation": "daughter"}, {"id": 30, "relation": "granddaughter"}],
    "description": "The Spartan king who holds the pass at Thermopylae against the Persian army, wielding the spear his descendants will one day carry. Kassandra's grandfather."
  },
  {
    "id": 199,
    "name": "Ojeda",
    "group": "templar",
    "historical": false,
    "year": 1492,
    "image": "images/characters/ojeda.webp",
    "games": [],
    "stories": "Film: Assassin's Creed (2016)",
    "description": "Torquemada's towering enforcer in the Spanish Inquisition, who hunts Aguilar and María through the streets of Granada."
  },
  {
    "id": 200,
    "name": "Tsuyu",
    "aka": ["Fujibayashi Tsuyu"],
    "group": "assassin",
    "historical": false,
    "year": 1561,
    "image": "images/characters/tsuyu.webp",
    "games": ["Assassin's Creed Shadows"],
    "stories": "Manga: Tales of Iga",
    "family": [{"id": 45, "relation": "daughter"}],
    "description": "A young woman of Iga taken under the wing of the Spanish Assassin Alvaro, who trains as a shinobi and fights beside him against the Templars. Naoe's mother."
  },
  {
    "id": 201,
    "name": "Alvaro",
    "aka": ["Alvaro Catarribera"],
    "group": "assassin",
    "historical": false,
    "year": 1561,
    "image": "images/characters/alvaro.webp",
    "games": [],
    "stories": "Manga: Tales of Iga",
    "description": "A Spanish Assassin far from home, who comes to Iga with his apprentice Tsuyu to seek the help of its legendary shinobi against the Templars."
  }
]
