/* ============================================
   ACDb - Reading Orders
   ============================================

   Curated ways to read the lore. Each order lists its books in in-universe
   (chronological) order; release order is derived by sorting on `released`.

   Orders:
     eras      true to show era headings (READING_ERAS) in chronological mode
     games     true to show a filter by the items' game (#reading/<order>/<game>)

   Entries:
     item      permanent item id from database.js (a readable type)
     year      start year of the main story (negative for BCE); picks the
               era heading. The list order, not this number, is the order.
     setting   when the main story takes place, display text only. Frame
               stories are left out: a book sits where its main story does.
     released  earliest worldwide release, YYYY-MM-DD (any language or
               format, digital included)
     releasedPrecision  "month" or "year" when the day isn't known; the
               date then uses the 1st and shows only what is known

   Sources: chronology from the Kulurak blog on the Assassin's Creed Wiki
   (User_blog:Kulurak/Chronological_order_of_Assassin's_Creed_franchise),
   checked against each book's or issue's own wiki article, which also
   gives the release dates; publisher pages, comic shop databases and
   ISBN records settled disagreements. Series the blog doesn't cover
   (Yan Leisheng novels, Awakening, Visionaries, webcomics) come from
   their wiki articles and publishers. Every entry was researched and then
   independently re-checked. Verified 2026-10-06.

   Placement rules: a unit sits where its main historical story happens;
   frame stories don't count unless the unit is mostly modern day. Story
   arcs stay together in issue order at the arc's main story; anthologies
   (Reflections) are split by era. Collected editions that only reprint
   issues are left out, so each story is listed once.
*/

// Era headings for orders with "eras": true. An entry belongs to the first
// era whose "until" year (exclusive) is above its "year"; null = no end.
const READING_ERAS = [
  { "name": "Ancient World", "until": 500 },
  { "name": "Early Middle Ages", "until": 1000 },
  { "name": "High Middle Ages", "until": 1400 },
  { "name": "Renaissance", "until": 1600 },
  { "name": "Colonial Era", "until": 1760 },
  { "name": "Age of Revolution", "until": 1830 },
  { "name": "Industrial Age", "until": 1900 },
  { "name": "20th Century", "until": 2000 },
  { "name": "Modern Day", "until": null }
];

const READING_ORDERS = [
  {
    "id": "complete",
    "name": "Complete Lore",
    "description": "Every canon novel, comic and manga in the catalog, in story order from the Isu era to the present day. Story arcs stay together; anthologies are split by era.",
    "eras": true,
    "games": true,
    "entries": [
      { "item": 320, "year": -75000, "setting": "Isu era", "released": "2022-03-16" },
      { "item": 321, "year": -75000, "setting": "Isu era", "released": "2022-04-20" },
      { "item": 322, "year": -75000, "setting": "Isu era", "released": "2022-05-11" },
      { "item": 220, "year": -431, "setting": "431–421 BCE", "released": "2018-10-30" },
      { "item": 219, "year": -70, "setting": "70–56 BCE", "released": "2017-10-10" },
      { "item": 303, "year": -44, "setting": "44 BCE", "released": "2018-03-07" },
      { "item": 304, "year": -44, "setting": "44 BCE", "released": "2018-04-11" },
      { "item": 305, "year": -44, "setting": "44 BCE", "released": "2018-05-16" },
      { "item": 306, "year": -44, "setting": "44 BCE", "released": "2018-06-27" },
      { "item": 242, "year": 259, "setting": "259", "released": "2009-11-01", "releasedPrecision": "month" },
      { "item": 243, "year": 259, "setting": "259", "released": "2010-11-01", "releasedPrecision": "month" },
      { "item": 244, "year": 259, "setting": "259", "released": "2011-11-10" },
      { "item": 224, "year": 659, "setting": "659", "released": "2022-03-25" },
      { "item": 323, "year": 754, "setting": "754", "released": "2021-04-01" },
      { "item": 324, "year": 755, "setting": "755–756", "released": "2021-07-01", "releasedPrecision": "month" },
      { "item": 325, "year": 756, "setting": "756", "released": "2022-02-03" },
      { "item": 326, "year": 756, "setting": "756", "released": "2022-08-01", "releasedPrecision": "month" },
      { "item": 327, "year": 756, "setting": "756–758", "released": "2022-12-01", "releasedPrecision": "month" },
      { "item": 228, "year": 819, "setting": "819–824", "released": "2023-11-21" },
      { "item": 635, "year": 824, "setting": "824–861", "released": "2025-03-12" },
      { "item": 636, "year": 824, "setting": "824–861", "released": "2025-05-07" },
      { "item": 637, "year": 824, "setting": "824–861", "released": "2025-06-18" },
      { "item": 318, "year": 866, "setting": "866–871", "released": "2020-11-04" },
      { "item": 227, "year": 867, "setting": "867", "released": "2023-05-02" },
      { "item": 221, "year": 870, "setting": "c. 870–878", "released": "2020-11-10" },
      { "item": 314, "year": 870, "setting": "870", "released": "2020-10-21" },
      { "item": 315, "year": 870, "setting": "870", "released": "2020-11-18" },
      { "item": 316, "year": 870, "setting": "870", "released": "2020-12-23" },
      { "item": 231, "year": 870, "setting": "870", "released": "2021-09-08" },
      { "item": 461, "year": 872, "setting": "870s", "released": "2020-11-26" },
      { "item": 409, "year": 872, "setting": "870s", "released": "2023-01-25" },
      { "item": 226, "year": 878, "setting": "878", "released": "2022-04-05" },
      { "item": 218, "year": 985, "setting": "985", "released": "2017-12-26" },
      { "item": 208, "year": 1176, "setting": "1176–1258", "released": "2011-06-23" },
      { "item": 299, "year": 1227, "setting": "1227", "released": "2017-04-12" },
      { "item": 217, "year": 1259, "setting": "1259", "released": "2016-12-27" },
      { "item": 230, "year": 1296, "setting": "1296", "released": "2021-09-16" },
      { "item": 245, "year": 1340, "setting": "1340", "released": "2012-11-16" },
      { "item": 246, "year": 1341, "setting": "1341", "released": "2013-10-31" },
      { "item": 247, "year": 1341, "setting": "1341", "released": "2014-10-31" },
      { "item": 214, "year": 1428, "setting": "1428–1431", "released": "2016-11-15" },
      { "item": 206, "year": 1476, "setting": "1476–1499", "released": "2009-11-26" },
      { "item": 207, "year": 1499, "setting": "1499–1507", "released": "2010-11-25" },
      { "item": 298, "year": 1504, "setting": "1504–1505", "released": "2017-03-08" },
      { "item": 209, "year": 1510, "setting": "1510–1524", "released": "2011-11-24" },
      { "item": 260, "year": 1515, "setting": "1515–1516", "released": "2016-08-24" },
      { "item": 261, "year": 1515, "setting": "1515–1516", "released": "2016-10-05" },
      { "item": 262, "year": 1515, "setting": "1515–1516", "released": "2016-11-23" },
      { "item": 263, "year": 1515, "setting": "1515–1516", "released": "2016-12-28" },
      { "item": 330, "year": 1526, "setting": "1526", "released": "2020-02-19" },
      { "item": 331, "year": 1526, "setting": "1526–1529", "released": "2020-07-17" },
      { "item": 332, "year": 1529, "setting": "1529–1530", "released": "2021-02-19" },
      { "item": 333, "year": 1530, "setting": "1530–1532", "released": "2021-08-19" },
      { "item": 255, "year": 1536, "setting": "1536", "released": "2016-03-16" },
      { "item": 256, "year": 1536, "setting": "1536", "released": "2016-04-06" },
      { "item": 257, "year": 1536, "setting": "1536", "released": "2016-05-11" },
      { "item": 258, "year": 1536, "setting": "1536", "released": "2016-06-15" },
      { "item": 259, "year": 1536, "setting": "1536", "released": "2016-07-20" },
      { "item": 460, "year": 1560, "setting": "1560", "released": "2025-08-20" },
      { "item": 250, "year": 1692, "setting": "1692", "released": "2015-10-08" },
      { "item": 251, "year": 1692, "setting": "1692", "released": "2015-11-11" },
      { "item": 252, "year": 1692, "setting": "1692", "released": "2015-12-09" },
      { "item": 253, "year": 1692, "setting": "1692", "released": "2016-01-13" },
      { "item": 254, "year": 1692, "setting": "1692", "released": "2016-02-10" },
      { "item": 211, "year": 1711, "setting": "1711–1723", "released": "2013-11-07" },
      { "item": 300, "year": 1722, "setting": "1722", "released": "2017-05-17" },
      { "item": 625, "year": 1724, "setting": "1724–1725", "released": "2023-04-24" },
      { "item": 626, "year": 1725, "setting": "1725", "released": "2023-06-13" },
      { "item": 627, "year": 1725, "setting": "1725", "released": "2023-08-01" },
      { "item": 628, "year": 1725, "setting": "1725", "released": "2023-09-19" },
      { "item": 210, "year": 1735, "setting": "1735–1783", "released": "2012-12-04" },
      { "item": 212, "year": 1778, "setting": "1778–1794", "released": "2014-11-20" },
      { "item": 458, "year": 1791, "setting": "1791", "released": "2016-05-07" },
      { "item": 301, "year": 1796, "setting": "1796", "released": "2017-07-05" },
      { "item": 272, "year": 1805, "setting": "1805–1808", "released": "2016-10-19" },
      { "item": 273, "year": 1805, "setting": "1805–1808", "released": "2016-11-16" },
      { "item": 274, "year": 1805, "setting": "1805–1808", "released": "2016-12-07" },
      { "item": 275, "year": 1805, "setting": "1805–1808", "released": "2017-01-25" },
      { "item": 341, "year": 1839, "setting": "1839", "released": "2013-10-01", "releasedPrecision": "month" },
      { "item": 213, "year": 1847, "setting": "1847–1868", "released": "2015-11-05" },
      { "item": 225, "year": 1851, "setting": "1851–1862", "released": "2022-08-02" },
      { "item": 216, "year": 1863, "setting": "1863", "released": "2016-08-30" },
      { "item": 229, "year": 1867, "setting": "1867–1868", "released": "2021-04-15" },
      { "item": 278, "year": 1872, "setting": "1872", "released": "2016-09-28" },
      { "item": 279, "year": 1872, "setting": "1872", "released": "2016-10-19" },
      { "item": 280, "year": 1872, "setting": "1872", "released": "2016-11-16" },
      { "item": 281, "year": 1872, "setting": "1872", "released": "2016-12-21" },
      { "item": 236, "year": 1888, "setting": "1888", "released": "2010-11-10" },
      { "item": 237, "year": 1908, "setting": "1908", "released": "2010-12-15" },
      { "item": 238, "year": 1917, "setting": "1917", "released": "2011-02-09" },
      { "item": 240, "year": 1919, "setting": "1919–1928", "released": "2012-08-09" },
      { "item": 267, "year": 1927, "setting": "1927", "released": "2016-03-23" },
      { "item": 268, "year": 1927, "setting": "1927", "released": "2016-04-27" },
      { "item": 269, "year": 1927, "setting": "1927", "released": "2016-06-15" },
      { "item": 270, "year": 1927, "setting": "1927", "released": "2016-07-27" },
      { "item": 271, "year": 1927, "setting": "1927", "released": "2016-09-07" },
      { "item": 287, "year": 1937, "setting": "1937", "released": "2017-07-05" },
      { "item": 288, "year": 1937, "setting": "1937", "released": "2017-08-02" },
      { "item": 289, "year": 1937, "setting": "1937", "released": "2017-09-06" },
      { "item": 290, "year": 1937, "setting": "1937", "released": "2017-10-18" },
      { "item": 308, "year": 1940, "setting": "1940–1943", "released": "2016-10-21" },
      { "item": 309, "year": 1943, "setting": "1943", "released": "2017-12-01" },
      { "item": 311, "year": 1957, "setting": "1957–1963", "released": "2019-03-29" },
      { "item": 312, "year": 1957, "setting": "1964", "released": "2019-10-11" },
      { "item": 412, "year": 2016, "setting": "2016", "released": "2016-12-21" },
      { "item": 283, "year": 2017, "setting": "2017", "released": "2017-02-01" },
      { "item": 284, "year": 2017, "setting": "2017", "released": "2017-03-08" },
      { "item": 285, "year": 2017, "setting": "2017", "released": "2017-04-19" },
      { "item": 286, "year": 2017, "setting": "2017", "released": "2017-05-24" },
      { "item": 291, "year": 2018, "setting": "2018", "released": "2018-03-07" },
      { "item": 292, "year": 2018, "setting": "2018", "released": "2018-04-04" },
      { "item": 293, "year": 2018, "setting": "2018", "released": "2018-05-02" },
      { "item": 294, "year": 2018, "setting": "2018", "released": "2018-06-13" },
      { "item": 232, "year": 2022, "setting": "2022", "released": "2022-11-29" }
    ]
  },
  {
    "id": "bowden",
    "name": "Oliver Bowden Novels",
    "description": "The nine novels Oliver Bowden wrote for the series, from Bayek's Egypt to Victorian London.",
    "entries": [
      { "item": 219, "year": -70, "setting": "70–56 BCE", "released": "2017-10-10" },
      { "item": 208, "year": 1176, "setting": "1176–1258", "released": "2011-06-23" },
      { "item": 206, "year": 1476, "setting": "1476–1499", "released": "2009-11-26" },
      { "item": 207, "year": 1499, "setting": "1499–1507", "released": "2010-11-25" },
      { "item": 209, "year": 1510, "setting": "1510–1524", "released": "2011-11-24" },
      { "item": 211, "year": 1711, "setting": "1711–1723", "released": "2013-11-07" },
      { "item": 210, "year": 1735, "setting": "1735–1783", "released": "2012-12-04" },
      { "item": 212, "year": 1778, "setting": "1778–1794", "released": "2014-11-20" },
      { "item": 213, "year": 1847, "setting": "1847–1868", "released": "2015-11-05" }
    ]
  },
  {
    "id": "non-canon",
    "name": "Non-canon Stories",
    "description": "Stories officially outside the main continuity: the Yan Leisheng novels, the Awakening manga, Visionaries and the 2007 promo comics.",
    "entries": [
      { "item": 338, "setting": "Prehistory", "released": "2024-10-02" },
      { "item": 456, "year": 1191, "setting": "1191", "released": "2007-10-01", "releasedPrecision": "month" },
      { "item": 457, "year": 1191, "setting": "c. 1191", "released": "2007-10-12" },
      { "item": 222, "year": 1526, "setting": "1526–1529", "released": "2019-03-31" },
      { "item": 223, "year": 1530, "setting": "1530", "released": "2021-10-01", "releasedPrecision": "month" },
      { "item": 337, "setting": "Feudal Japan", "released": "2024-03-20" },
      { "item": 629, "year": 1715, "setting": "c. 1715", "released": "2013-08-10" },
      { "item": 630, "year": 1715, "setting": "c. 1715", "released": "2013-09-10" },
      { "item": 631, "year": 1715, "setting": "c. 1715", "released": "2013-10-10" },
      { "item": 632, "year": 1715, "setting": "c. 1715–1716", "released": "2013-11-09" },
      { "item": 633, "year": 1716, "setting": "c. 1716", "released": "2013-12-10" },
      { "item": 634, "year": 1716, "setting": "c. 1716", "released": "2014-01-10" },
      { "item": 336, "year": 1971, "setting": "1971", "released": "2023-11-29" }
    ]
  }
];
