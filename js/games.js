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
               Assassin's Creed Wiki). Art that isn't 3:4 (DS and PSP boxes,
               the browser games' banners) is shown whole on a 300x400
               canvas over a blurred, darkened copy of itself, so the tiles
               don't crop the title. Optional: without one the Games tab
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
*/

const GAMES = [
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
      { "name": "The Da Vinci Disappearance", "type": "story", "image": "images/games/dlc/the-da-vinci-disappearance.webp", "setting": "1506", "released": "2011-03-08" }
    ]
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
      { "name": "The Lost Archive", "type": "story", "image": "images/games/dlc/the-lost-archive.webp", "setting": "Subject 16's memories", "released": "2012-02-28" }
    ]
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
      { "name": "The Benedict Arnold Missions", "type": "story", "image": "images/games/dlc/the-benedict-arnold-missions.webp", "setting": "1780", "released": "2012-10-30", "note": "PS3 exclusive at launch" },
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
      { "name": "Freedom Cry", "type": "expansion", "image": "images/games/dlc/freedom-cry.webp", "year": 1735, "setting": "1735–1737", "released": "2013-12-17", "marker": true }
    ]
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
    "dlcs": []
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
      { "name": "Dead Kings", "type": "expansion", "image": "images/games/dlc/dead-kings.webp", "setting": "1794", "released": "2015-01-13" }
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
      { "name": "The Hidden Ones", "type": "expansion", "image": "images/games/dlc/the-hidden-ones.webp", "year": -38, "setting": "38 BCE", "released": "2018-01-23", "marker": true },
      { "name": "The Curse of the Pharaohs", "type": "expansion", "image": "images/games/dlc/the-curse-of-the-pharaohs.webp", "year": -38, "setting": "38 BCE", "released": "2018-03-13", "marker": true }
    ]
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
      { "name": "Crossover Stories: Those Who Are Treasured", "type": "story", "image": "images/games/dlc/crossover-stories.webp", "year": -421, "setting": "421 BCE", "released": "2021-12-14", "marker": true, "note": "Free update" }
    ]
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
      { "name": "Wrath of the Druids", "type": "expansion", "image": "images/games/dlc/wrath-of-the-druids.webp", "year": 879, "setting": "c. 879", "released": "2021-05-13", "marker": true },
      { "name": "The Siege of Paris", "type": "expansion", "image": "images/games/dlc/the-siege-of-paris.webp", "year": 885, "setting": "c. 885", "released": "2021-08-12", "marker": true },
      { "name": "Crossover Stories: A Fated Encounter", "type": "story", "image": "images/games/dlc/crossover-stories.webp", "year": 887, "setting": "c. 887", "released": "2021-12-14", "marker": true, "note": "Free update" },
      { "name": "Dawn of Ragnarök", "type": "expansion", "image": "images/games/dlc/dawn-of-ragnarok.webp", "setting": "Odin's memories", "released": "2022-03-10" },
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
      { "name": "Valley of Memory", "type": "expansion", "image": "images/games/dlc/valley-of-memory.webp", "setting": "861", "released": "2025-11-18", "note": "Free update" }
    ]
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
      { "name": "The Works of Luis Frois", "type": "story", "setting": "During the main story", "released": "2025-05-06", "note": "Free update" },
      { "name": "A Critical Encounter", "type": "story", "setting": "During the main story", "released": "2025-06-25", "note": "Free update" },
      { "name": "Claws of Awaji", "type": "expansion", "image": "images/games/dlc/claws-of-awaji.webp", "setting": "After the main story", "released": "2025-09-16" },
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
