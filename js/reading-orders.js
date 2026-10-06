/* ============================================
   ACDb - Reading Orders
   ============================================

   Curated ways to read the lore. Each order lists its books in in-universe
   (chronological) order; release order is derived by sorting on `released`.

   Entries:
     item      permanent item id from database.js (a readable type)
     setting   when the main story takes place, display text only. Frame
               stories are left out: a book sits where its main story does.
     released  earliest worldwide release, YYYY-MM-DD

   Sources: chronology from the Kulurak blog on the Assassin's Creed Wiki
   (User_blog:Kulurak/Chronological_order_of_Assassin's_Creed_franchise),
   checked against each book's own wiki article, which also gives the
   release dates. Verified 2026-10-06.
*/

const READING_ORDERS = [
  {
    "id": "bowden",
    "name": "Oliver Bowden Novels",
    "description": "The nine novels Oliver Bowden wrote for the series, from Bayek's Egypt to Victorian London.",
    "entries": [
      { "item": 219, "setting": "70–56 BCE", "released": "2017-10-10" },
      { "item": 208, "setting": "1176–1258", "released": "2011-06-23" },
      { "item": 206, "setting": "1476–1499", "released": "2009-11-26" },
      { "item": 207, "setting": "1499–1507", "released": "2010-11-25" },
      { "item": 209, "setting": "1510–1524", "released": "2011-11-24" },
      { "item": 211, "setting": "1711–1723", "released": "2013-11-07" },
      { "item": 210, "setting": "1735–1783", "released": "2012-12-04" },
      { "item": 212, "setting": "1778–1794", "released": "2014-11-20" },
      { "item": 213, "setting": "1847–1868", "released": "2015-11-05" }
    ]
  }
];
