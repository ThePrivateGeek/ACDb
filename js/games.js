/* ============================================
   ACDb - Games
   ============================================

   The games and their story DLCs, for the Games tab of the reading view
   and the game rows in orders with "gameMarkers" (Complete Lore). Games
   are not catalog items: they have no id and no Read switch.

   Scope: the main games and the console spin-offs (no mobile, handheld,
   VR or multiplayer-only games). Story DLCs are expansions, Season Pass
   missions, platform-exclusive story DLC and free story updates; bonus
   missions that came with pre-orders or special editions, gear and
   cosmetic packs and game modes (The Forgotten Saga) are left out.

   Games (the list is in release order):
     name      the game's name exactly as the items' "game" field has it
               (SHORT_GAME_NAMES in js/app.js), so links to the collection
               and to Complete Lore's game filter work
     year      start year of the main historical story (negative for BCE);
               places the game in the lore. The modern-day story and
               short prologues or epilogues don't count.
     setting   when the main historical story takes place, display text
     released  earliest worldwide release, YYYY-MM-DD (official launch;
               early access for premium editions doesn't count)
     releasedPrecision  "month" or "year" when the day isn't known
     image     the cover, images/games/<slug of name>.webp (300px wide
               at most; from Wikipedia, the Chronicles covers from the
               Assassin's Creed Wiki).
     remakeOf  a remake tells its original's story: it gets no place of
               its own in the lore
     dlcs      the game's story DLCs, in release order

   DLCs: name, setting, released, releasedPrecision as above, plus
     year      start year; required with "marker"
     marker    true when the DLC is set in another period than its game:
               it then gets its own place in the lore. The others are read
               as part of their game.
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
*/

const GAMES = [
  {
    "name": "Assassin's Creed",
    "image": "images/games/assassins-creed.webp",
    "year": 1191,
    "setting": "1191",
    "released": "2007-11-13",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed II",
    "image": "images/games/assassins-creed-ii.webp",
    "year": 1476,
    "setting": "1476–1499",
    "released": "2009-11-17",
    "dlcs": [
      { "name": "The Battle of Forlì", "image": "images/games/dlc/the-battle-of-forli.webp", "setting": "1488", "released": "2010-01-28" },
      { "name": "The Bonfire of the Vanities", "image": "images/games/dlc/the-bonfire-of-the-vanities.webp", "setting": "1497–1498", "released": "2010-02-18" }
    ]
  },
  {
    "name": "Assassin's Creed Brotherhood",
    "image": "images/games/assassins-creed-brotherhood.webp",
    "year": 1499,
    "setting": "1499–1507",
    "released": "2010-11-16",
    "dlcs": [
      { "name": "The Copernicus Conspiracy", "image": "images/games/dlc/the-copernicus-conspiracy.webp", "setting": "1500", "released": "2010-11-16", "note": "PS3 exclusive at launch" },
      { "name": "The Da Vinci Disappearance", "image": "images/games/dlc/the-da-vinci-disappearance.webp", "setting": "1506", "released": "2011-03-08" }
    ]
  },
  {
    "name": "Assassin's Creed Revelations",
    "image": "images/games/assassins-creed-revelations.webp",
    "year": 1511,
    "setting": "1511–1512",
    "released": "2011-11-15",
    "dlcs": [
      { "name": "The Lost Archive", "image": "images/games/dlc/the-lost-archive.webp", "setting": "Subject 16's memories", "released": "2012-02-28" }
    ]
  },
  {
    "name": "Assassin's Creed III",
    "image": "images/games/assassins-creed-iii.webp",
    "year": 1754,
    "setting": "1754–1783",
    "released": "2012-10-30",
    "dlcs": [
      { "name": "The Benedict Arnold Missions", "image": "images/games/dlc/the-benedict-arnold-missions.webp", "setting": "1780", "released": "2012-10-30", "note": "PS3 exclusive at launch" },
      {
        "name": "The Tyranny of King Washington", "image": "images/games/dlc/the-tyranny-of-king-washington.webp",
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
    "image": "images/games/assassins-creed-iii-liberation.webp",
    "year": 1765,
    "setting": "1765–1777",
    "released": "2012-10-30",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed IV: Black Flag",
    "image": "images/games/assassins-creed-iv-black-flag.webp",
    "year": 1715,
    "setting": "1715–1722",
    "released": "2013-10-29",
    "dlcs": [
      { "name": "Aveline", "image": "images/games/dlc/aveline.webp", "year": 1784, "setting": "1784", "released": "2013-10-29", "marker": true, "note": "PlayStation exclusive at launch" },
      { "name": "Freedom Cry", "image": "images/games/dlc/freedom-cry.webp", "year": 1735, "setting": "1735–1737", "released": "2013-12-17", "marker": true }
    ]
  },
  {
    "name": "Assassin's Creed Rogue",
    "image": "images/games/assassins-creed-rogue.webp",
    "year": 1752,
    "setting": "1752–1760",
    "released": "2014-11-11",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Unity",
    "image": "images/games/assassins-creed-unity.webp",
    "year": 1789,
    "setting": "1789–1794",
    "released": "2014-11-11",
    "dlcs": [
      { "name": "Dead Kings", "image": "images/games/dlc/dead-kings.webp", "setting": "1794", "released": "2015-01-13" }
    ]
  },
  {
    "name": "Assassin's Creed Chronicles: China",
    "image": "images/games/assassins-creed-chronicles-china.webp",
    "year": 1526,
    "setting": "1526–1532",
    "released": "2015-04-21",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Syndicate",
    "image": "images/games/assassins-creed-syndicate.webp",
    "year": 1868,
    "setting": "1868",
    "released": "2015-10-23",
    "dlcs": [
      { "name": "The Dreadful Crimes", "image": "images/games/dlc/the-dreadful-crimes.webp", "setting": "1868", "released": "2015-10-23", "note": "PS4 exclusive at launch" },
      { "name": "A Long Night", "image": "images/games/dlc/a-long-night.webp", "setting": "1868", "released": "2015-10-23", "note": "Season Pass mission" },
      { "name": "Jack the Ripper", "image": "images/games/dlc/jack-the-ripper.webp", "year": 1888, "setting": "1888", "released": "2015-12-15", "marker": true },
      { "name": "The Last Maharaja", "image": "images/games/dlc/the-last-maharaja.webp", "setting": "1868", "released": "2016-03-01" }
    ]
  },
  {
    "name": "Assassin's Creed Chronicles: India",
    "image": "images/games/assassins-creed-chronicles-india.webp",
    "year": 1841,
    "setting": "1841",
    "released": "2016-01-12",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Chronicles: Russia",
    "image": "images/games/assassins-creed-chronicles-russia.webp",
    "year": 1918,
    "setting": "1918",
    "released": "2016-02-09",
    "dlcs": []
  },
  {
    "name": "Assassin's Creed Origins",
    "image": "images/games/assassins-creed-origins.webp",
    "year": -49,
    "setting": "49–44 BCE",
    "released": "2017-10-27",
    "dlcs": [
      { "name": "The Hidden Ones", "image": "images/games/dlc/the-hidden-ones.webp", "year": -38, "setting": "38 BCE", "released": "2018-01-23", "marker": true },
      { "name": "The Curse of the Pharaohs", "image": "images/games/dlc/the-curse-of-the-pharaohs.webp", "year": -38, "setting": "38 BCE", "released": "2018-03-13", "marker": true }
    ]
  },
  {
    "name": "Assassin's Creed Odyssey",
    "image": "images/games/assassins-creed-odyssey.webp",
    "year": -431,
    "setting": "431–422 BCE",
    "released": "2018-10-05",
    "dlcs": [
      { "name": "The Lost Tales of Greece", "image": "images/games/dlc/the-lost-tales-of-greece.webp", "setting": "431–422 BCE", "released": "2018-11-01", "releasedPrecision": "month", "note": "Free story quests, 2018–2019" },
      {
        "name": "Legacy of the First Blade", "image": "images/games/dlc/legacy-of-the-first-blade.webp",
        "setting": "c. 429–425 BCE",
        "released": "2018-12-04",
        "episodes": [
          { "name": "Hunted", "released": "2018-12-04" },
          { "name": "Shadow Heritage", "released": "2019-01-15" },
          { "name": "Bloodline", "released": "2019-03-05" }
        ]
      },
      {
        "name": "The Fate of Atlantis", "image": "images/games/dlc/the-fate-of-atlantis.webp",
        "setting": "422 BCE",
        "released": "2019-04-23",
        "episodes": [
          { "name": "Fields of Elysium", "released": "2019-04-23" },
          { "name": "Torment of Hades", "released": "2019-06-04" },
          { "name": "Judgment of Atlantis", "released": "2019-07-16" }
        ]
      },
      { "name": "Crossover Stories: Those Who Are Treasured", "image": "images/games/dlc/crossover-stories.webp", "year": -421, "setting": "421 BCE", "released": "2021-12-14", "marker": true, "note": "Free update" }
    ]
  },
  {
    "name": "Assassin's Creed Valhalla",
    "image": "images/games/assassins-creed-valhalla.webp",
    "year": 872,
    "setting": "872–878",
    "released": "2020-11-10",
    "dlcs": [
      { "name": "The Legend of Beowulf", "image": "images/games/dlc/the-legend-of-beowulf.webp", "setting": "873–878", "released": "2020-11-10", "note": "Season Pass quest" },
      { "name": "Wrath of the Druids", "image": "images/games/dlc/wrath-of-the-druids.webp", "year": 879, "setting": "c. 879", "released": "2021-05-13", "marker": true },
      { "name": "The Siege of Paris", "image": "images/games/dlc/the-siege-of-paris.webp", "year": 885, "setting": "c. 885", "released": "2021-08-12", "marker": true },
      { "name": "Crossover Stories: A Fated Encounter", "image": "images/games/dlc/crossover-stories.webp", "year": 887, "setting": "c. 887", "released": "2021-12-14", "marker": true, "note": "Free update" },
      { "name": "Dawn of Ragnarök", "image": "images/games/dlc/dawn-of-ragnarok.webp", "setting": "Odin's memories", "released": "2022-03-10" },
      { "name": "The Last Chapter", "image": "images/games/dlc/the-last-chapter.webp", "year": 889, "setting": "c. 889", "released": "2022-11-29", "marker": true, "note": "Free update" }
    ]
  },
  {
    "name": "Assassin's Creed Mirage",
    "image": "images/games/assassins-creed-mirage.webp",
    "year": 861,
    "setting": "861",
    "released": "2023-10-05",
    "dlcs": [
      { "name": "Valley of Memory", "image": "images/games/dlc/valley-of-memory.webp", "setting": "861", "released": "2025-11-18", "note": "Free update" }
    ]
  },
  {
    "name": "Assassin's Creed Shadows",
    "image": "images/games/assassins-creed-shadows.webp",
    "year": 1579,
    "setting": "1579–1582",
    "released": "2025-03-20",
    "dlcs": [
      { "name": "The Works of Luis Frois", "setting": "During the main story", "released": "2025-05-06", "note": "Free update" },
      { "name": "A Critical Encounter", "setting": "During the main story", "released": "2025-06-25", "note": "Free update" },
      { "name": "Claws of Awaji", "image": "images/games/dlc/claws-of-awaji.webp", "setting": "After the main story", "released": "2025-09-16" },
      { "name": "A Puzzlement", "setting": "During the main story", "released": "2025-11-25", "note": "Free update" },
      { "name": "Black Tides", "setting": "After the main story", "released": "2026-06-16", "note": "Free update" }
    ]
  },
  {
    "name": "Assassin's Creed Black Flag Resynced",
    "image": "images/games/assassins-creed-black-flag-resynced.webp",
    "year": 1715,
    "setting": "1715–1722",
    "released": "2026-07-09",
    "remakeOf": "Assassin's Creed IV: Black Flag",
    "dlcs": []
  }
]
