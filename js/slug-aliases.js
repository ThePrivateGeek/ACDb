/**
 * Old item URL slugs, mapped to the permanent item id.
 *
 * An item's link (/#<slug> and /s/<slug>) comes from its name, so renaming an
 * item breaks links that were shared before. When you rename an item, add its
 * old slug here: the app opens the item and rewrites the address to the new
 * slug, and tools/build-share-pages.py keeps a share page at s/<old-slug>.html
 * that redirects to it. tools/validate-catalog.py checks every entry.
 * Never remove an entry; old links can live on for years.
 */
const SLUG_ALIASES = {
    // renamed 2026-04-10
    "ubicollectibles-aguilar-figurine-24cm": 107, // now "Ubicollectibles Aguilar Statue (24cm)"
    "ubicollectibles-maria-figurine": 108, // now "Ubicollectibles Maria Statue (24cm)"
    "ubicollectibles-jacob-frye-the-impetuous-brother-figurine": 98, // now "Ubicollectibles Jacob Frye 'The Impetuous Brother' Statue"
    "ubicollectibles-evie-frye-the-intrepid-sister-figurine": 99, // now "Ubicollectibles Evie Frye 'The Intrepid Sister' Statue"
    "ubicollectibles-bayek-figurine": 101, // now "Ubicollectibles Bayek Statue"
    "ubicollectibles-aya-figurine": 102, // now "Ubicollectibles Aya Statue"
    "ubicollectibles-alexios-figurine": 103, // now "Ubicollectibles Alexios Statue"
    "ubicollectibles-kassandra-figurine": 104, // now "Ubicollectibles Kassandra Statue"
    "alexios-legendary-figurine": 105, // now "Alexios Legendary Statue"
    "ubicollectibles-connor-the-last-breath-figurine": 204, // now "Ubicollectibles Connor 'The Last Breath' Statue"
    "ubicollectibles-connor-the-hunter-figurine": 205, // now "Ubicollectibles Connor 'The Hunter' Statue"
    "ubicollectibles-edward-kenway-the-assassin-pirate-figurine": 342, // now "Ubicollectibles Edward Kenway 'The Assassin Pirate' Statue"
    "ubicollectibles-blackbeard-the-legendary-pirate-figurine": 343, // now "Ubicollectibles Blackbeard 'The Legendary Pirate' Statue"
    // renamed 2026-04-15
    "assassins-creed-the-fall": 236, // now "Assassin's Creed: The Fall - Issue #1"
    "assassins-creed-dynasty": 323, // now "Assassin's Creed: Dynasty, Vol. 1"
    "assassins-creed-blade-of-shao-jun": 330, // now "Assassin's Creed: Blade of Shao Jun, Vol. 1"
    // renamed 2026-04-17
    "assassins-creed-limited-edition-status": 2, // now "Assassin's Creed Limited Edition Statue"
    // renamed 2026-04-19
    "assassins-creed-origins-dawn-of-the-creed-edition": 53, // now "Assassin's Creed Origins: Dawn of the Creed Collector's Case"
    "assassins-creed-steelbook-ac1-xbox-360": 195, // now "Assassin's Creed Steelcase Limited Edition"
    "assassins-creed-limited-edition-european": 1, // now "Assassin's Creed Limited Edition"
    // renamed 2026-04-21
    "assassins-creed-brotherhood-collectors-edition": 9, // now "Assassin's Creed Brotherhood Codex Edition"
    // renamed 2026-05-03
    "flydigi-apex-4-assassins-creed-dynasty-edition": 596, // now "Flydigi Apex 4 - Assassin's Creed Edition"
    // renamed 2026-10-06
    "assassins-creed-the-jade-seal": 224, // now "Assassin's Creed: Chang'an Wang (Prophecy of the Emperor)"
    // renamed 2026-10-16
    "mcfarlane-toys-connor-with-mohawk-action-figure-series-3": 33, // now "McFarlane Toys Connor with Mohawk Action Figure (Series 2)"
    "mcfarlane-toys-connor-color-tops-collector-edition": 41, // now "McFarlane Toys Connor Action Figure (Color Tops Red Wave)"
    "mcfarlane-toys-aguilar-action-figure-movie-series": 186, // now "McFarlane Toys Aguilar Action Figure (Color Tops Blue Wave #12)"
};
