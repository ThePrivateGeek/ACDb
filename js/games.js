/* ============================================
   ACDb - Games
   ============================================

   The games and their DLCs, for the Games tab (#games, js/games-view.js)
   and the game rows in orders with "gameMarkers" (Complete Lore). Games
   are not catalog items: they have no id and no Read switch.

   Scope: every released game (main games, spin-offs, handheld, mobile,
   browser and VR games; announced games wait for their release). DLCs are
   expansions, story missions (Season Pass, pre-order, edition and
   platform-exclusive missions, free story updates), game modes and
   Discovery Tours. Cosmetic and gear packs, multiplayer map and character
   packs, and seasonal festivals are left out. Remasters and collections
   aren't games of their own: they're listed on the games they contain
   ("rereleases"). A remake is its own game ("remakeOf").

   Games (the list is in release order; keys in this order):
     name      the game's name exactly as the items' "game" field has it
               (SHORT_GAME_NAMES in js/app.js), so links to the collection
               and to Complete Lore's game filter work. Main games and
               spin-offs must be on that timeline; other kinds may not be.
     kind      "main", "spin-off" (Chronicles), "handheld", "mobile",
               "browser" or "vr": the Games tab's kind chips. Only main,
               spin-off and handheld games get a place in Complete Lore.
     developer the lead studio credited as developer
     platforms every platform the game itself came out on, later ports
               included (AC1 on PC); not those it reached only in a
               remaster or collection, and not streaming services that run
               an existing build (Luna, OnLive, GeForce NOW, Switch "Cloud
               Version"). Stadia counts: its games were ports. Names and
               order: PLATFORMS in tools/validate-catalog.py.
     image     the cover, images/games/<slug of name>.webp (300px wide
               at most; from Wikipedia, the Chronicles covers from the
               Assassin's Creed Wiki, some from the site owner). Art that
               isn't 3:4 (PSP boxes, the browser games' banners) is shown
               whole on a 300x400 canvas over a blurred, darkened copy of
               itself, so the tiles don't crop the title. Small originals
               aren't scaled up (AC III (mobile) 270px, Rebellion 190px). Optional: without one the Games tab
               shows a controller icon.
     year      start year of the main historical story (negative for BCE);
               places the game in the lore. The modern-day story and
               short prologues or epilogues don't count. Optional only for
               mobile, browser and VR games with no single setting.
     setting   when the main historical story takes place, display text
     released  earliest worldwide release, YYYY-MM-DD (official launch;
               early access for premium editions doesn't count)
     releasedPrecision  "month" or "year" when the day isn't known
     rereleases  remasters and collections that include the game:
               [{ name, released }], earliest worldwide release
     remakeOf  a remake tells its original's story: it gets no place of
               its own in the lore
     description  one or two spoiler-free sentences on the premise, 300
               characters at most
     dlcs      the game's DLCs, in release order

   DLCs: name, setting, released, releasedPrecision as above, plus
     type      "expansion" (adds a map or region, or is a headline Season
               Pass campaign; free or paid), "story" (missions in the
               existing world), "mode" (a game mode, e.g. River Raids) or
               "discovery-tour". The game dialog groups DLCs by type.
     year      start year; required with "marker"
     marker    true when the DLC is set in another period than its game:
               it then gets its own place in the lore (expansions and
               story DLCs only). The others are read as part of their game.
     note      how it was released, when that matters (exclusives)
     image     its cover, images/games/dlc/<slug>.webp (300px wide at most,
               cropped to about 3:4), when it has one: store art (Xbox
               Store), the Assassin's Creed Wiki, Wikipedia (Freedom Cry) or
               the site owner. The two Crossover Stories share one cover
               (crossover-stories.webp). Shadows' free updates have none and
               show a controller icon.
     episodes  episodic expansions: [{ name, released }], the DLC's own
               "released" being the first episode's

   Sources: settings from the Assassin's Creed Wiki (the Access the Animus
   mirror) and Wikipedia; release dates from Wikipedia, Ubisoft news and
   the press (PlayStation Blog, Gematsu, Push Square). Two independent
   researchers built the list; disagreements were settled as follows
   (verified 2026-10-14):
   - The Curse of the Pharaohs: 38 BCE, after The Hidden Ones, as Ubisoft's
     head of content clarified (Wikipedia says 34 BCE).
   - Wrath of the Druids and The Siege of Paris: sources disagree on the
     end year, so only the start is given ("c. 879", "c. 885").
   - The Copernicus Conspiracy: free PS3 DLC on Brotherhood's launch day
     (the wiki's 9 Nov 2010 predates the game).
   - The Tyranny of King Washington: The Infamy 19 Feb and The Betrayal
     19 Mar 2013 on Xbox 360 and PC (PS3 a day later).
   - The Last Chapter: out 29 Nov 2022, a week before its announced date.
   - The Lost Archive and Dawn of Ragnarök have no historical year; Claws
     of Awaji and Black Tides are set after Shadows' main story but are
     undated. None of them gets its own place in the lore.
   - Black Flag Resynced (2026) has no story DLC; Freedom Cry and the
     Aveline missions belong to the original.

   Developers, platforms and re-releases: two more independent researchers
   (Wikipedia and its citations, Ubisoft news, platform stores, the press),
   verified 2026-10-23. They agreed on every developer and platform; these
   points were settled as follows:
   - Stadia had AC III and Liberation only inside AC III Remastered, and
     Rogue only as Rogue Remastered, so it isn't their platform
     (Wikipedia's infoboxes list it anyway).
   - The Chronicles games reached PS Vita only in the Chronicles Trilogy;
     Black Flag and Rogue reached Switch only in The Rebel Collection.
   - Shadows' iPad version is announced but not out; Mirage has no Mac
     version. Liberation HD is a remaster, so Liberation's own platform is
     PS Vita.
   - Retail box sets of separate discs (Anthology, Heritage Collection, Ezio
     Trilogy, Americas Collection) aren't re-releases.

   Handheld and browser games: two more independent researchers (Wikipedia,
   the Assassin's Creed Wiki, Nintendo, Pocket Gamer, TouchArcade, Engadget,
   Game Informer, the press), verified 2026-10-23. They found the same five
   games; these points were settled as follows:
   - Bloodlines: Wikipedia says 1191–1193, the wiki autumn 1191; "1191".
   - Altaïr's Chronicles' phone versions (iOS, Android, Windows Phone,
     webOS, Symbian, Java ME) are Gameloft's ports of the DS game, so they're
     its platforms; Discovery's iOS version likewise.
   - Project Legacy: only "Ubisoft" is credited (one source names Ubisoft
     Montreal). It went live on 30 Sep 2010; later dates are press coverage.
     Its free memory sets were updates of the game, not DLCs (one was a
     holiday event).
   - Freerunners: open beta from April 2021 per the wiki only, so just the
     year is shown.
   - Left out: Assassin's Creed Initiates (a community website, not a game),
     the 2009 Twitter Assassination Experience (a promotion, one source),
     the Pirates web race (a demo of a mobile game; batch 2b) and Lost Legacy
     (cancelled).

   Mobile games: two more independent researchers (the Assassin's Creed
   Wiki, Wikipedia, Ubisoft news, the App Store, Pocket Gamer, TouchArcade,
   Engadget, appgefahren, the press), verified 2026-10-23. They found the
   same 14 games; these points were settled as follows:
   - Gameloft's Java phone games share their console games' names but are
     different games (side-scrollers that retell and change the stories), so
     they're their own entries, named "(mobile)" like the wiki's pages. Their
     release days come from the wiki only, so just the year is shown; AC's
     came out between 22 Oct and 5 Nov 2007 (Pocket Gamer). Their settings
     are the wiki's (AC II and Brotherhood both "1486"); Revelations' isn't
     given, so it takes the console game's.
   - Multiplayer Rearmed: in Canada on 21 Oct 2011, worldwide about a week
     later; the month is shown. Its logo reads "Multiplayer Rearmed".
   - Recollection: 1 Dec 2011 (appgefahren, Pocket Gamer's review); the
     wiki's 13 Dec is later than both.
   - Pirates: its Windows 8 store app is the PC version; the 2014 web race
     was only a demo. The free "Quest for Eden" update (2015) has a single
     source, so it isn't listed.
   - Arno's Chronicles: only the wiki names a studio (Playwing), so the
     developer is Ubisoft; it follows Unity's story, hence 1789.
   - Rebellion: Behaviour Interactive developed it (launch release, Ubisoft
     news); the campaigns' dates and settings are Ubisoft's posts. Its
     Helix Rift events were time-limited and aren't listed.
   - Soft launches don't count (Memories, Identity, Rebellion). Mobile games
     get no place in Complete Lore (the owner's call, 2026-10-23).
   - Left out: the Black Flag and Unity companion apps (no game of their
     own), and Jade, the Netflix game, Utopia and Singularity (not released).

   VR games: two more independent researchers (Ubisoft news and its escape
   games pages, the Meta store, UploadVR, Road to VR, Triotech's press
   releases, the Assassin's Creed Wiki), verified 2026-10-23. They found
   the same four games; these points were settled as follows:
   - Escape the Lost Pyramid, The Temple of Anubis and Beyond Medusa's Gate
     only run at VR venues (escape rooms, arcades, family entertainment
     centres): platform "Location-based". They're still offered.
   - Escape the Lost Pyramid: venues had it by September 2018 (the wiki says
     July), so just the year is shown. Its story is a 1928 expedition, told
     in the world of Origins.
   - The Temple of Anubis: launched in September 2018 (Triotech); no source
     dates its story, so it takes Origins' year (Bayek). Triotech made it
     under licence.
   - Beyond Medusa's Gate: 445 BCE per the wiki and two venues.
   - Nexus VR has three settings (405 BCE, 1509, 1775–1777), so no year.
   - Left out: the 2016 Assassin's Creed film's VR Experience (a 360° film,
     not a game), location-locked AR tour apps (Echoes of Revolution, Le
     Trésor Perdu d'Aliénor; the owner's call, 2026-10-23), the Odyssey
     Cloud Version for Switch (a port) and Ubisoft All-Star VR (not an
     Assassin's Creed game).

   Edition missions, modes and Discovery Tours: two more independent
   researchers (Ubisoft news and patch notes, the PlayStation, Xbox and
   Steam stores, the press, the Assassin's Creed Wiki), verified 2026-10-23.
   These points were settled as follows:
   - Edition-exclusive bonus levels count (AC II's Templar lairs,
     Brotherhood's two maps, Vlad the Impaler's Prison), as do pre-order and
     edition missions; the owner's call, 2026-10-23. Missions later sold in
     mixed packs with gear (The Hidden Secrets Pack, Illustrious Pirates,
     Secrets of the Revolution, Streets of London) are listed one by one,
     with the pack in the note. Killed by Science is only known from Unity's
     pack, so it takes the pack's date.
   - The Secrets of Greece (Odyssey's Season Pass mission) and Go with the
     Bo (Shadows' free quest) were found by one researcher, each with two
     sources.
   - Modes are free updates that add a way to play: River Raids, Mastery
     Challenge, Tombs of the Fallen, The Forgotten Saga, Story Creator Mode.
     New Game+, difficulty options, Shadows' Domains and Animus Rifts, and
     time-limited events (festivals, Trials of the Gods, crossover events)
     aren't listed.
   - The Discovery Tours were free updates and were also sold on their own:
     Ancient Egypt and Ancient Greece for PC, Viking Age for PC (2021) and
     consoles (2022).
   - The Benedict Arnold Missions were on PC as well as PS3.
   - Cover art for most of them came from the site owner (2026-10-24);
     the rest show the controller icon.
*/

const GAMES = [
  {
    "name": "Assassin's Creed (mobile)",
    "kind": "mobile",
    "developer": "Gameloft",
    "platforms": ["Android", "Java ME"],
    "image": "images/games/assassins-creed-mobile.webp",
    "year": 1189,
    "setting": "1189–1191",
    "released": "2007-11-05",
    "releasedPrecision": "year",
    "description": "Gameloft's side-scrolling version of the first game for phones: Altaïr hunts eight Templars across the Holy Land of the Third Crusade to win back his rank, in a loose retelling of the console story. It came out shortly before the console game.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed",
    "kind": "main",
    "developer": "Ubisoft Montreal",
    "platforms": ["PS3", "Xbox 360", "PC"],
    "image": "images/games/assassins-creed.webp",
    "year": 1191,
    "setting": "1191",
    "released": "2007-11-13",
    "description": "In the Holy Land of the Third Crusade, the disgraced Assassin Altaïr Ibn-La'Ahad must win back his rank by hunting nine targets. In the present day, Desmond Miles relives his ancestor's memories in the Animus.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed: Altaïr's Chronicles",
    "kind": "handheld",
    "developer": "Gameloft Bucharest",
    "platforms": ["DS", "iOS", "Android", "Windows Phone", "webOS", "Symbian", "Java ME"],
    "image": "images/games/assassins-creed-altairs-chronicles.webp",
    "year": 1190,
    "setting": "1190",
    "released": "2008-02-05",
    "description": "A year before the first game, Altaïr Ibn-La'Ahad crosses the Holy Land of the Third Crusade to recover the Chalice, an artefact that could end the war, before the Templars find it. A side-scrolling prequel.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed II (mobile)",
    "kind": "mobile",
    "developer": "Gameloft",
    "platforms": ["Android", "Java ME"],
    "image": "images/games/assassins-creed-ii-mobile.webp",
    "year": 1486,
    "setting": "1486",
    "released": "2009-10-20",
    "releasedPrecision": "year",
    "description": "Ezio Auditore avenges his family across Florence, Venice and Forlì, guided by Leonardo da Vinci. A side-scroller for phones that retells Assassin's Creed II loosely, all in one year. It came out shortly before the console game.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed II",
    "kind": "main",
    "developer": "Ubisoft Montreal",
    "platforms": ["PS3", "Xbox 360", "PC", "Mac"],
    "image": "images/games/assassins-creed-ii.webp",
    "year": 1476,
    "setting": "1476–1499",
    "released": "2009-11-17",
    "rereleases": [{ "name": "The Ezio Collection", "released": "2016-11-15" }],
    "description": "Young Florentine noble Ezio Auditore da Firenze takes up the Assassins' cause after his family is betrayed, and follows a conspiracy across Renaissance Italy.",
    "dlcs": [
      { "name": "Palazzo Medici", "type": "story", "setting": "During the main story", "released": "2009-11-17", "note": "Edition bonus level" },
      { "name": "Santa Maria dei Frari", "type": "story", "setting": "During the main story", "released": "2009-11-17", "note": "Edition bonus level" },
      { "name": "Arsenale di Venezia", "type": "story", "setting": "During the main story", "released": "2009-11-17", "note": "Edition bonus level" },
      { "name": "The Battle of Forlì", "type": "story", "image": "images/games/dlc/the-battle-of-forli.webp", "setting": "1488", "released": "2010-01-28" },
      { "name": "The Bonfire of the Vanities", "type": "story", "image": "images/games/dlc/the-bonfire-of-the-vanities.webp", "setting": "1497–1498", "released": "2010-02-18" }
    ]
  },
  {
    "name": "Assassin's Creed: Bloodlines",
    "kind": "handheld",
    "developer": "Griptonite Games",
    "platforms": ["PSP"],
    "image": "images/games/assassins-creed-bloodlines.webp",
    "year": 1191,
    "setting": "1191",
    "released": "2009-11-17",
    "description": "Weeks after the first game, Altaïr follows the retreating Templars to Cyprus, where he joins the island's resistance to hunt down the last of the Order's leaders.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed II: Discovery",
    "kind": "handheld",
    "developer": "Griptonite Games",
    "platforms": ["DS", "iOS"],
    "image": "images/games/assassins-creed-ii-discovery.webp",
    "year": 1491,
    "setting": "1491–1492",
    "released": "2009-11-17",
    "description": "Ezio Auditore travels to Spain, where the Templars use Tomás de Torquemada's Inquisition to hunt down the Assassins. A side-scrolling game set during the events of Assassin's Creed II.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed II Multiplayer",
    "kind": "mobile",
    "developer": "Ubisoft",
    "platforms": ["iOS"],
    "image": "images/games/assassins-creed-ii-multiplayer.webp",
    "setting": "Renaissance Italy",
    "released": "2010-03-01",
    "description": "An online game for iPhone: up to four players each hunt an assigned target in the crowd while being hunted themselves, on maps from Assassin's Creed II. It has no story.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed: Project Legacy",
    "kind": "browser",
    "developer": "Ubisoft",
    "platforms": ["Facebook"],
    "image": "images/games/assassins-creed-project-legacy.webp",
    "setting": "Several eras",
    "released": "2010-09-30",
    "description": "An Abstergo recruit relives the memories of Assassins and Templars, mostly in Renaissance Italy. A text-based Facebook game that shared unlocks with Brotherhood; Facebook removed it in 2013.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed: Brotherhood (mobile)",
    "kind": "mobile",
    "developer": "Gameloft",
    "platforms": ["Android", "Java ME"],
    "image": "images/games/assassins-creed-brotherhood-mobile.webp",
    "year": 1486,
    "setting": "1486",
    "released": "2010-10-21",
    "releasedPrecision": "year",
    "description": "After Cesare Borgia steals the Apple of Eden, Ezio works with Rome's thieves to hunt down the Borgia's allies. A side-scroller for phones that retells Brotherhood loosely. It came out shortly before the console game.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Brotherhood",
    "kind": "main",
    "developer": "Ubisoft Montreal",
    "platforms": ["PS3", "Xbox 360", "PC", "Mac"],
    "image": "images/games/assassins-creed-brotherhood.webp",
    "year": 1499,
    "setting": "1499–1507",
    "released": "2010-11-16",
    "rereleases": [{ "name": "The Ezio Collection", "released": "2016-11-15" }],
    "description": "Ezio takes the fight to Rome, rebuilding the Assassin Brotherhood to break the Borgia family's hold on the city.",
    "dlcs": [
      { "name": "The Copernicus Conspiracy", "type": "story", "image": "images/games/dlc/the-copernicus-conspiracy.webp", "setting": "1500", "released": "2010-11-16", "note": "PS3 exclusive at launch" },
      { "name": "The Trajan Market", "type": "story", "setting": "During the main story", "released": "2010-11-16", "note": "Edition bonus level" },
      { "name": "The Aqueducts", "type": "story", "setting": "During the main story", "released": "2010-11-16", "note": "Edition bonus level" },
      { "name": "The Da Vinci Disappearance", "type": "story", "image": "images/games/dlc/the-da-vinci-disappearance.webp", "setting": "1506", "released": "2011-03-08" }
    ]
  },
  {
    "name": "Assassin's Creed: Multiplayer Rearmed",
    "kind": "mobile",
    "developer": "Ubisoft",
    "platforms": ["iOS"],
    "image": "images/games/assassins-creed-multiplayer-rearmed.webp",
    "setting": "Several eras",
    "released": "2011-10-21",
    "releasedPrecision": "month",
    "description": "A free follow-up to Assassin's Creed II Multiplayer for iPhone and iPad: up to four players blend into crowds and hunt each other, as characters from Brotherhood's and Revelations' multiplayer.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed: Revelations (mobile)",
    "kind": "mobile",
    "developer": "Gameloft",
    "platforms": ["Android", "Java ME"],
    "image": "images/games/assassins-creed-revelations-mobile.webp",
    "year": 1511,
    "setting": "c. 1511",
    "released": "2011-11-08",
    "releasedPrecision": "year",
    "description": "An older Ezio searches Constantinople for the keys to Altaïr's library, with levels set in Altaïr's time, and sends freed Assassins on missions of their own. A side-scroller for phones. It came out shortly before the console game.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Revelations",
    "kind": "main",
    "developer": "Ubisoft Montreal",
    "platforms": ["PS3", "Xbox 360", "PC"],
    "image": "images/games/assassins-creed-revelations.webp",
    "year": 1511,
    "setting": "1511–1512",
    "released": "2011-11-15",
    "rereleases": [{ "name": "The Ezio Collection", "released": "2016-11-15" }],
    "description": "An ageing Ezio travels to Constantinople in search of the library Altaïr left behind, and finds the Ottoman capital caught in a new struggle with the Templars.",
    "dlcs": [
      { "name": "Vlad the Impaler's Prison", "type": "story", "setting": "During the main story", "released": "2011-11-15", "note": "Edition bonus level" },
      { "name": "The Lost Archive", "type": "story", "image": "images/games/dlc/the-lost-archive.webp", "setting": "Subject 16's memories", "released": "2012-02-28" }
    ]
  },
  {
    "name": "Assassin's Creed Recollection",
    "kind": "mobile",
    "developer": "Ubisoft Montreal",
    "platforms": ["iOS"],
    "image": "images/games/assassins-creed-recollection.webp",
    "setting": "Ezio's era",
    "released": "2011-12-01",
    "description": "A real-time strategy card game for iPad, later iPhone: Assassins and Templars fight for control of regions with cards of the characters and places of the Ezio games, in a 20-mission campaign and online.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed III",
    "kind": "main",
    "developer": "Ubisoft Montreal",
    "platforms": ["PS3", "Xbox 360", "Wii U", "PC"],
    "image": "images/games/assassins-creed-iii.webp",
    "year": 1754,
    "setting": "1754–1783",
    "released": "2012-10-30",
    "rereleases": [{ "name": "Assassin's Creed III Remastered", "released": "2019-03-29" }],
    "description": "Ratonhnhaké:ton, a young Mohawk man known as Connor, joins the Assassins in the years of the American Revolution, from the colonial frontier to Boston and New York.",
    "dlcs": [
      { "name": "The Benedict Arnold Missions", "type": "story", "image": "images/games/dlc/the-benedict-arnold-missions.webp", "setting": "1780", "released": "2012-10-30", "note": "PS3 and PC only" },
      { "name": "The Lost Mayan Ruins", "type": "story", "setting": "During the main story", "released": "2012-10-30", "note": "Edition mission, later in The Hidden Secrets Pack (2012)" },
      { "name": "Ghost of War", "type": "story", "setting": "During the main story", "released": "2012-10-30", "note": "Edition mission, later in The Hidden Secrets Pack (2012)" },
      { "name": "A Dangerous Secret", "type": "story", "setting": "During the main story", "released": "2012-10-30", "note": "Edition mission, later in The Hidden Secrets Pack (2012)" },
      {
        "name": "The Tyranny of King Washington", "type": "expansion", "image": "images/games/dlc/the-tyranny-of-king-washington.webp",
        "setting": "c. 1783 (alternate reality)",
        "released": "2013-02-19",
        "episodes": [
          { "name": "The Infamy", "released": "2013-02-19" },
          { "name": "The Betrayal", "released": "2013-03-19" },
          { "name": "The Redemption", "released": "2013-04-23" }
        ]
      }
    ]
  },
  {
    "name": "Assassin's Creed III: Liberation",
    "kind": "handheld",
    "developer": "Ubisoft Sofia",
    "platforms": ["PS Vita"],
    "image": "images/games/assassins-creed-iii-liberation.webp",
    "year": 1765,
    "setting": "1765–1777",
    "released": "2012-10-30",
    "rereleases": [
      { "name": "Assassin's Creed Liberation HD", "released": "2014-01-14" },
      { "name": "Assassin's Creed III Remastered", "released": "2019-03-29" }
    ],
    "description": "In New Orleans, as Louisiana passes from French to Spanish rule, Aveline de Grandpré, daughter of a French merchant and an African mother, fights for the city's enslaved people.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed III (mobile)",
    "kind": "mobile",
    "developer": "Gameloft",
    "platforms": ["Android", "Java ME"],
    "image": "images/games/assassins-creed-iii-mobile.webp",
    "year": 1770,
    "setting": "1770–1776",
    "released": "2012-11-16",
    "releasedPrecision": "year",
    "description": "Connor fights the British and the Templars across the frontier, Boston and New York during the American Revolution, with naval battles aboard the Aquila. A side-scroller for phones that retells Assassin's Creed III loosely.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed IV: Black Flag",
    "kind": "main",
    "developer": "Ubisoft Montreal",
    "platforms": ["PS3", "PS4", "Xbox 360", "Xbox One", "Wii U", "PC", "Stadia"],
    "image": "images/games/assassins-creed-iv-black-flag.webp",
    "year": 1715,
    "setting": "1715–1722",
    "released": "2013-10-29",
    "rereleases": [{ "name": "The Rebel Collection", "released": "2019-12-06" }],
    "description": "Welsh privateer Edward Kenway turns pirate in the golden age of piracy and stumbles into the war between Assassins and Templars across the Caribbean.",
    "dlcs": [
      { "name": "Aveline", "type": "story", "image": "images/games/dlc/aveline.webp", "year": 1784, "setting": "1784", "released": "2013-10-29", "marker": true, "note": "PlayStation exclusive at launch" },
      { "name": "Black Island", "type": "story", "setting": "During the main story", "released": "2013-10-29", "note": "Edition mission, later in the Illustrious Pirates Pack (2014)" },
      { "name": "Mystery Island", "type": "story", "setting": "During the main story", "released": "2013-10-29", "note": "Edition mission, later in the Illustrious Pirates Pack (2014)" },
      { "name": "Sacrifice Island", "type": "story", "setting": "During the main story", "released": "2013-10-29", "note": "Edition mission, later in the Illustrious Pirates Pack (2014)" },
      { "name": "Freedom Cry", "type": "expansion", "image": "images/games/dlc/freedom-cry.webp", "year": 1735, "setting": "1735–1737", "released": "2013-12-17", "marker": true, "note": "Also sold standalone (2014)" }
    ]
  },
  {
    "name": "Assassin's Creed Pirates",
    "kind": "mobile",
    "developer": "Ubisoft Paris",
    "platforms": ["PC", "iOS", "Android", "Windows Phone"],
    "image": "images/games/assassins-creed-pirates.webp",
    "year": 1716,
    "setting": "1716–1718",
    "released": "2013-12-05",
    "description": "Captain Alonzo Batilla, a pirate who is neither Assassin nor Templar, sails the Caribbean in search of La Buse's lost treasure, in real-time ship battles. It left the stores in 2017.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Memories",
    "kind": "mobile",
    "developer": "GREE and PlayNext",
    "platforms": ["iOS"],
    "image": "images/games/assassins-creed-memories.webp",
    "setting": "Several eras",
    "released": "2014-08-21",
    "description": "A card-battle game for iOS: players collect Assassins and allies from six eras of history, hunt targets and fight in guilds of up to 20. It shut down in 2015.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Rogue",
    "kind": "main",
    "developer": "Ubisoft Sofia",
    "platforms": ["PS3", "Xbox 360", "PC"],
    "image": "images/games/assassins-creed-rogue.webp",
    "year": 1752,
    "setting": "1752–1760",
    "released": "2014-11-11",
    "rereleases": [
      { "name": "Assassin's Creed Rogue Remastered", "released": "2018-03-20" },
      { "name": "The Rebel Collection", "released": "2019-12-06" }
    ],
    "description": "During the Seven Years' War, the Assassin Shay Patrick Cormac turns against the Brotherhood and joins the Templars, sailing from the North Atlantic to colonial New York.",
    "dlcs": [
      { "name": "The Siege of Fort de Sable", "type": "story", "setting": "During the main story", "released": "2014-11-11", "note": "Pre-order and edition mission" },
      { "name": "The Armor of Sir Gunn's Quest", "type": "story", "setting": "During the main story", "released": "2014-11-11", "note": "Pre-order and edition mission" }
    ]
  },
  {
    "name": "Assassin's Creed Unity",
    "kind": "main",
    "developer": "Ubisoft Montreal",
    "platforms": ["PS4", "Xbox One", "PC", "Stadia"],
    "image": "images/games/assassins-creed-unity.webp",
    "year": 1789,
    "setting": "1789–1794",
    "released": "2014-11-11",
    "description": "In Paris during the French Revolution, Arno Dorian joins the Assassins to find the truth behind a murder that changed his life.",
    "dlcs": [
      { "name": "The Chemical Revolution", "type": "story", "image": "images/games/dlc/the-chemical-revolution.webp", "setting": "During the main story", "released": "2014-11-11", "note": "Edition mission, later in Secrets of the Revolution (2015)" },
      { "name": "The American Prisoner", "type": "story", "setting": "During the main story", "released": "2014-11-11", "note": "Edition mission, later in Secrets of the Revolution (2015)" },
      { "name": "Dead Kings", "type": "expansion", "image": "images/games/dlc/dead-kings.webp", "setting": "1794", "released": "2015-01-13" },
      { "name": "Killed by Science", "type": "story", "setting": "During the main story", "released": "2015-01-20", "note": "In the Secrets of the Revolution pack" }
    ]
  },
  {
    "name": "Assassin's Creed Chronicles: China",
    "kind": "spin-off",
    "developer": "Climax Studios",
    "platforms": ["PS4", "Xbox One", "PC"],
    "image": "images/games/assassins-creed-chronicles-china.webp",
    "year": 1526,
    "setting": "1526–1532",
    "released": "2015-04-21",
    "rereleases": [{ "name": "Assassin's Creed Chronicles Trilogy", "released": "2016-02-09" }],
    "description": "Shao Jun, one of the last Chinese Assassins, returns to Ming dynasty China to take revenge on the Templars who destroyed her Brotherhood. A side-scrolling stealth game.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Syndicate",
    "kind": "main",
    "developer": "Ubisoft Quebec",
    "platforms": ["PS4", "Xbox One", "PC", "Stadia"],
    "image": "images/games/assassins-creed-syndicate.webp",
    "year": 1868,
    "setting": "1868",
    "released": "2015-10-23",
    "description": "Twins Jacob and Evie Frye arrive in Victorian London to free the city from Templar control, building a gang to take on the industrial powers of 1868.",
    "dlcs": [
      { "name": "The Dreadful Crimes", "type": "story", "image": "images/games/dlc/the-dreadful-crimes.webp", "setting": "1868", "released": "2015-10-23", "note": "PS4 exclusive at launch" },
      { "name": "A Long Night", "type": "story", "image": "images/games/dlc/a-long-night.webp", "setting": "1868", "released": "2015-10-23", "note": "Season Pass mission" },
      { "name": "The Darwin and Dickens Conspiracy", "type": "story", "setting": "During the main story", "released": "2015-10-23", "note": "Pre-order mission, later in the Streets of London Pack (2016)" },
      { "name": "Runaway Train", "type": "story", "setting": "During the main story", "released": "2015-10-23", "note": "Edition mission, later in the Streets of London Pack (2016)" },
      { "name": "Jack the Ripper", "type": "expansion", "image": "images/games/dlc/jack-the-ripper.webp", "year": 1888, "setting": "1888", "released": "2015-12-15", "marker": true },
      { "name": "The Last Maharaja", "type": "story", "image": "images/games/dlc/the-last-maharaja.webp", "setting": "1868", "released": "2016-03-01" }
    ]
  },
  {
    "name": "Assassin's Creed Chronicles: India",
    "kind": "spin-off",
    "developer": "Climax Studios",
    "platforms": ["PS4", "Xbox One", "PC"],
    "image": "images/games/assassins-creed-chronicles-india.webp",
    "year": 1841,
    "setting": "1841",
    "released": "2016-01-12",
    "rereleases": [{ "name": "Assassin's Creed Chronicles Trilogy", "released": "2016-02-09" }],
    "description": "In the Sikh Empire of 1841, the Assassin Arbaaz Mir guards a precious artefact from the Templars amid the war with the East India Company. A side-scrolling stealth game.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Chronicles: Russia",
    "kind": "spin-off",
    "developer": "Climax Studios",
    "platforms": ["PS4", "Xbox One", "PC"],
    "image": "images/games/assassins-creed-chronicles-russia.webp",
    "year": 1918,
    "setting": "1918",
    "released": "2016-02-09",
    "rereleases": [{ "name": "Assassin's Creed Chronicles Trilogy", "released": "2016-02-09" }],
    "description": "In 1918, after the October Revolution, the veteran Assassin Nikolai Orelov takes one last mission, which leads him to the house where the Romanov family is held. A side-scrolling stealth game.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Identity",
    "kind": "mobile",
    "developer": "Ubisoft Blue Byte",
    "platforms": ["iOS", "Android"],
    "image": "images/games/assassins-creed-identity.webp",
    "year": 1501,
    "setting": "1501",
    "released": "2016-02-25",
    "description": "An Assassin of the player's making joins Machiavelli's Brotherhood in Renaissance Italy and hunts the Crows, a gang that copies Assassin skills. An action RPG for phones; it shut down in 2021.",
    "dlcs": [
      { "name": "Forlì – A Crimson Sunset", "type": "story", "setting": "The story's second act", "released": "2016-05-18" }
    ]
  },
  {
    "name": "Assassin's Creed Unity: Arno's Chronicles",
    "kind": "mobile",
    "developer": "Ubisoft",
    "platforms": ["Android"],
    "image": "images/games/assassins-creed-unity-arnos-chronicles.webp",
    "year": 1789,
    "setting": "French Revolution",
    "released": "2017-06-27",
    "releasedPrecision": "month",
    "description": "Arno Dorian runs, climbs and fights through 20 side-scrolling levels of revolutionary Paris, loosely following Unity's story. It only came preinstalled on some Honor phones.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Origins",
    "kind": "main",
    "developer": "Ubisoft Montreal",
    "platforms": ["PS4", "Xbox One", "PC", "Stadia"],
    "image": "images/games/assassins-creed-origins.webp",
    "year": -49,
    "setting": "49–44 BCE",
    "released": "2017-10-27",
    "description": "In Ptolemaic Egypt, the Medjay Bayek of Siwa and his wife Aya hunt a secret order, laying the foundations of what will become the Assassin Brotherhood.",
    "dlcs": [
      { "name": "Secrets of the First Pyramids", "type": "story", "image": "images/games/dlc/secrets-of-the-first-pyramids.webp", "setting": "During the main story", "released": "2017-10-27", "note": "Pre-order mission" },
      { "name": "Ambush at Sea", "type": "story", "setting": "During the main story", "released": "2017-10-27", "note": "Deluxe Edition mission" },
      { "name": "The Hidden Ones", "type": "expansion", "image": "images/games/dlc/the-hidden-ones.webp", "year": -38, "setting": "38 BCE", "released": "2018-01-23", "marker": true },
      { "name": "Discovery Tour by Assassin's Creed: Ancient Egypt", "type": "discovery-tour", "image": "images/games/dlc/discovery-tour-by-assassins-creed-ancient-egypt.webp", "setting": "Ptolemaic Egypt", "released": "2018-02-20", "note": "Free update; also sold on its own for PC" },
      { "name": "The Curse of the Pharaohs", "type": "expansion", "image": "images/games/dlc/the-curse-of-the-pharaohs.webp", "year": -38, "setting": "38 BCE", "released": "2018-03-13", "marker": true }
    ]
  },
  {
    "name": "The Tower Assassin's Creed",
    "kind": "mobile",
    "developer": "Ketchapp",
    "platforms": ["iOS", "Android"],
    "image": "images/games/the-tower-assassins-creed.webp",
    "setting": "Several eras",
    "released": "2017-11-01",
    "description": "A one-touch stacking game for the series' tenth anniversary: build the tallest tower floor by floor, then send an Assassin on a Leap of Faith from the top. Nine Assassins in five settings to unlock.",
    "dlcs": []
  },
  {
    "name": "Escape the Lost Pyramid",
    "kind": "vr",
    "developer": "Ubisoft Blue Byte",
    "platforms": ["Location-based"],
    "image": "images/games/escape-the-lost-pyramid.webp",
    "year": 1928,
    "setting": "1928",
    "released": "2018-07-01",
    "releasedPrecision": "year",
    "description": "In 1928 an expedition vanishes in the Sinai while searching for the Lost Pyramid of Nebka. Two or four players relive the explorers' memories and have 60 minutes to find what they were after and escape. A VR escape game for escape rooms and arcades.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed: The Temple of Anubis",
    "kind": "vr",
    "developer": "Triotech",
    "platforms": ["Location-based"],
    "image": "images/games/assassins-creed-the-temple-of-anubis.webp",
    "year": -49,
    "setting": "Ancient Egypt",
    "released": "2018-09-13",
    "releasedPrecision": "month",
    "description": "As Bayek, players walk a real maze in virtual reality, fighting a temple's guardians with bow and burning arrows to rescue Aya, and finish with a Leap of Faith. A ten-minute free-roam attraction for Triotech's VR Maze.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Odyssey",
    "kind": "main",
    "developer": "Ubisoft Quebec",
    "platforms": ["PS4", "Xbox One", "PC", "Stadia"],
    "image": "images/games/assassins-creed-odyssey.webp",
    "year": -431,
    "setting": "431–422 BCE",
    "released": "2018-10-05",
    "description": "During the Peloponnesian War, a Spartan mercenary, Kassandra or Alexios, sails the Greek world to uncover a cult and find a lost family. The player chooses the hero.",
    "dlcs": [
      { "name": "The Blind King", "type": "story", "image": "images/games/dlc/the-blind-king.webp", "setting": "During the main story", "released": "2018-10-05", "note": "Pre-order mission" },
      { "name": "The Secrets of Greece", "type": "story", "image": "images/games/dlc/the-secrets-of-greece.webp", "setting": "During the main story", "released": "2018-10-05", "note": "Season Pass mission" },
      { "name": "The Lost Tales of Greece", "type": "story", "image": "images/games/dlc/the-lost-tales-of-greece.webp", "setting": "431–422 BCE", "released": "2018-11-01", "releasedPrecision": "month", "note": "Free story quests, 2018–2019" },
      {
        "name": "Legacy of the First Blade", "type": "expansion", "image": "images/games/dlc/legacy-of-the-first-blade.webp",
        "setting": "c. 429–425 BCE",
        "released": "2018-12-04",
        "episodes": [
          { "name": "Hunted", "released": "2018-12-04" },
          { "name": "Shadow Heritage", "released": "2019-01-15" },
          { "name": "Bloodline", "released": "2019-03-05" }
        ]
      },
      {
        "name": "The Fate of Atlantis", "type": "expansion", "image": "images/games/dlc/the-fate-of-atlantis.webp",
        "setting": "422 BCE",
        "released": "2019-04-23",
        "episodes": [
          { "name": "Fields of Elysium", "released": "2019-04-23" },
          { "name": "Torment of Hades", "released": "2019-06-04" },
          { "name": "Judgment of Atlantis", "released": "2019-07-16" }
        ]
      },
      { "name": "Story Creator Mode", "type": "mode", "setting": "Players' own quests in the game's Greece", "released": "2019-06-10", "note": "Free update" },
      { "name": "Discovery Tour by Assassin's Creed: Ancient Greece", "type": "discovery-tour", "image": "images/games/dlc/discovery-tour-by-assassins-creed-ancient-greece.webp", "setting": "Classical Greece", "released": "2019-09-10", "note": "Free update; also sold on its own for PC" },
      { "name": "Crossover Stories: Those Who Are Treasured", "type": "story", "image": "images/games/dlc/crossover-stories.webp", "year": -421, "setting": "421 BCE", "released": "2021-12-14", "marker": true, "note": "Free update" }
    ]
  },
  {
    "name": "Assassin's Creed Rebellion",
    "kind": "mobile",
    "developer": "Behaviour Interactive",
    "platforms": ["iOS", "Android"],
    "image": "images/games/assassins-creed-rebellion.webp",
    "year": 1489,
    "setting": "15th-century Spain",
    "released": "2018-11-21",
    "description": "Aguilar de Nerha's Spanish Brotherhood builds a fortress and recruits Assassins from across the series to fight the Inquisition's Templars. A free strategy RPG; off the stores since September 2026, its servers close in January 2027.",
    "dlcs": [
      { "name": "Norway Campaign", "type": "story", "setting": "872", "released": "2021-03-10", "note": "Free update" },
      { "name": "Caribbean Campaign", "type": "story", "setting": "Golden Age of Piracy", "released": "2021-06-22", "note": "Free update" },
      { "name": "Naples Campaign", "type": "story", "setting": "1499", "released": "2021-09-21", "note": "Free update" }
    ]
  },
  {
    "name": "Beyond Medusa's Gate",
    "kind": "vr",
    "developer": "Ubisoft Blue Byte",
    "platforms": ["Location-based"],
    "image": "images/games/beyond-medusas-gate.webp",
    "year": -445,
    "setting": "445 BCE",
    "released": "2019-05-07",
    "description": "In a sea cave on the Aegean, where the Argonauts' ship is said to lie, two or four players have 60 minutes to solve its riddles and find a way out. A VR escape game set in the world of Assassin's Creed Odyssey.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Valhalla",
    "kind": "main",
    "developer": "Ubisoft Montreal",
    "platforms": ["PS4", "PS5", "Xbox One", "Xbox Series X|S", "PC", "Stadia"],
    "image": "images/games/assassins-creed-valhalla.webp",
    "year": 872,
    "setting": "872–878",
    "released": "2020-11-10",
    "description": "Eivor leads a Viking clan from Norway to settle in England in the age of Alfred the Great, forging alliances and raiding across the Anglo-Saxon kingdoms.",
    "dlcs": [
      { "name": "The Legend of Beowulf", "type": "story", "image": "images/games/dlc/the-legend-of-beowulf.webp", "setting": "873–878", "released": "2020-11-10", "note": "Season Pass quest" },
      { "name": "The Way of the Berserker", "type": "story", "image": "images/games/dlc/the-way-of-the-berserker.webp", "setting": "During the main story", "released": "2020-11-10", "note": "Pre-order quest" },
      { "name": "River Raids", "type": "mode", "setting": "During the main story", "released": "2021-02-16", "note": "Free update" },
      { "name": "Wrath of the Druids", "type": "expansion", "image": "images/games/dlc/wrath-of-the-druids.webp", "year": 879, "setting": "c. 879", "released": "2021-05-13", "marker": true },
      { "name": "Mastery Challenge", "type": "mode", "setting": "Animus trials", "released": "2021-06-15", "note": "Free update" },
      { "name": "The Siege of Paris", "type": "expansion", "image": "images/games/dlc/the-siege-of-paris.webp", "year": 885, "setting": "c. 885", "released": "2021-08-12", "marker": true },
      { "name": "Discovery Tour: Viking Age", "type": "discovery-tour", "image": "images/games/dlc/discovery-tour-viking-age.webp", "setting": "Viking Age Norway and England", "released": "2021-10-19", "note": "Free update; also sold on its own (PC 2021, consoles 2022)" },
      { "name": "Tombs of the Fallen", "type": "mode", "setting": "During the main story", "released": "2021-11-09", "note": "Free update" },
      { "name": "Crossover Stories: A Fated Encounter", "type": "story", "image": "images/games/dlc/crossover-stories.webp", "year": 887, "setting": "c. 887", "released": "2021-12-14", "marker": true, "note": "Free update" },
      { "name": "Dawn of Ragnarök", "type": "expansion", "image": "images/games/dlc/dawn-of-ragnarok.webp", "setting": "Odin's memories", "released": "2022-03-10" },
      { "name": "The Forgotten Saga", "type": "mode", "image": "images/games/dlc/the-forgotten-saga.webp", "setting": "Odin's memories", "released": "2022-08-02", "note": "Free update" },
      { "name": "The Last Chapter", "type": "story", "image": "images/games/dlc/the-last-chapter.webp", "year": 889, "setting": "c. 889", "released": "2022-11-29", "marker": true, "note": "Free update" }
    ]
  },
  {
    "name": "Assassin's Creed: Freerunners",
    "kind": "browser",
    "developer": "Ubisoft Da Nang",
    "platforms": ["Browser"],
    "image": "images/games/assassins-creed-freerunners.webp",
    "setting": "The Animus",
    "released": "2021-04-14",
    "releasedPrecision": "year",
    "description": "Up to eight players pick famous Assassins and race them through a side-scrolling Animus course. A free multiplayer party game from Ubisoft Nano's browser games, released as an open beta.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Mirage",
    "kind": "main",
    "developer": "Ubisoft Bordeaux",
    "platforms": ["PS4", "PS5", "Xbox One", "Xbox Series X|S", "PC", "iOS"],
    "image": "images/games/assassins-creed-mirage.webp",
    "year": 861,
    "setting": "861",
    "released": "2023-10-05",
    "description": "In ninth-century Baghdad, the street thief Basim Ibn Ishaq joins the Hidden Ones, in a smaller, stealth-focused return to the series' roots.",
    "dlcs": [
      { "name": "The Forty Thieves", "type": "story", "image": "images/games/dlc/the-forty-thieves.webp", "setting": "During the main story", "released": "2023-10-05", "note": "Pre-order quest" },
      { "name": "Valley of Memory", "type": "expansion", "image": "images/games/dlc/valley-of-memory.webp", "setting": "861", "released": "2025-11-18", "note": "Free update" }
    ]
  },
  {
    "name": "Assassin's Creed Nexus VR",
    "kind": "vr",
    "developer": "Red Storm Entertainment",
    "platforms": ["Meta Quest"],
    "image": "images/games/assassins-creed-nexus-vr.webp",
    "setting": "405 BCE, 1509 and 1775–1777",
    "released": "2023-11-16",
    "description": "A hacker inside Abstergo relives the memories of Ezio, Kassandra and Connor in first person, to stop the company from using ancient technology to control what people believe. Climbing, stealth and combat made for VR.",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Shadows",
    "kind": "main",
    "developer": "Ubisoft Quebec",
    "platforms": ["PS5", "Xbox Series X|S", "Switch 2", "PC", "Mac"],
    "image": "images/games/assassins-creed-shadows.webp",
    "year": 1579,
    "setting": "1579–1582",
    "released": "2025-03-20",
    "description": "In Japan's Sengoku period, the shinobi Naoe and Yasuke, an African samurai in the service of Oda Nobunaga, are drawn together by a shared fight.",
    "dlcs": [
      { "name": "Thrown to the Dogs", "type": "story", "image": "images/games/dlc/thrown-to-the-dogs.webp", "setting": "During the main story", "released": "2025-03-20", "note": "Pre-order quest, free for all from May 2025" },
      { "name": "The Works of Luis Frois", "type": "story", "setting": "During the main story", "released": "2025-05-06", "note": "Free update" },
      { "name": "A Critical Encounter", "type": "story", "setting": "During the main story", "released": "2025-06-25", "note": "Free update" },
      { "name": "Claws of Awaji", "type": "expansion", "image": "images/games/dlc/claws-of-awaji.webp", "setting": "After the main story", "released": "2025-09-16" },
      { "name": "Go with the Bo", "type": "story", "setting": "During the main story", "released": "2025-09-16", "note": "Free update" },
      { "name": "A Puzzlement", "type": "story", "setting": "During the main story", "released": "2025-11-25", "note": "Free update" },
      { "name": "Black Tides", "type": "story", "setting": "After the main story", "released": "2026-06-16", "note": "Free update" }
    ]
  },
  {
    "name": "Assassin's Creed Black Flag Resynced",
    "kind": "main",
    "developer": "Ubisoft Singapore",
    "platforms": ["PS5", "Xbox Series X|S", "PC"],
    "image": "images/games/assassins-creed-black-flag-resynced.webp",
    "year": 1715,
    "setting": "1715–1722",
    "released": "2026-07-09",
    "remakeOf": "Assassin's Creed IV: Black Flag",
    "description": "A remake of Assassin's Creed IV: Black Flag that retells Edward Kenway's story in the golden age of piracy.",
    "dlcs": []
  }
]
