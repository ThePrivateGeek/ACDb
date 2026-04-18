// Image mapping for AC Database items — all images stored locally in /images/
// Each value is an array: base image followed by any gallery siblings (_01, _02, ...).
// Gallery arrays are maintained by tools/build-images.py — drop new _NN.jpg files
// next to the base and run `python tools/build-images.py` to refresh. For a brand
// new item, add the "Item Name": ["images/folder/foo.jpg"] line here by hand first.
const AC_IMAGES = {
    // ── Collector's Editions ──
    "Assassin's Creed Limited Edition": [
        "images/collectors-editions/ac1-limited-edition.jpg",
        "images/collectors-editions/ac1-limited-edition_01.jpg",
        "images/collectors-editions/ac1-limited-edition_02.jpg",
    ],
    "Assassin's Creed Limited Edition Statue": [
        "images/collectors-editions/ac1-limited-edition_statue.jpg",
        "images/collectors-editions/ac1-limited-edition_statue_01.jpg",
    ],
    "Assassin's Creed II Black Edition": [
        "images/collectors-editions/ac2-black-edition.jpg",
        "images/collectors-editions/ac2-black-edition_01.jpg",
    ],
    "Assassin's Creed II White Edition": [
        "images/collectors-editions/ac2-white-edition.jpg",
        "images/collectors-editions/ac2-white-edition_01.jpg",
    ],
    "Assassin's Creed II Master Assassin's Edition": ["images/collectors-editions/ac2-master-assassins-edition.jpg"],
    "Assassin's Creed Brotherhood Collector's Edition": ["images/collectors-editions/brotherhood-collectors-edition.jpg"],
    "Assassin's Creed Brotherhood Collector's Edition (Doctor Variant)": ["images/collectors-editions/brotherhood-collectors-edition-doctor.jpg"],
    "Assassin's Creed Brotherhood Codex Edition": ["images/collectors-editions/brotherhood-codex-edition.jpg"],
    "Assassin's Creed Revelations Collector's Edition": ["images/collectors-editions/revelations-collectors-edition.jpg"],
    "Assassin's Creed Revelations Animus Edition": [
        "images/collectors-editions/revelations-animus-edition.jpg",
        "images/collectors-editions/revelations-animus-edition_01.jpg",
    ],
    "Assassin's Creed Revelations Templar Collector Edition": ["images/collectors-editions/revelations-templar-edition.jpg"],
    "Assassin's Creed Revelations Signature Edition": ["images/collectors-editions/revelations-signature-edition.jpg"],
    "Assassin's Creed III Freedom Edition": ["images/collectors-editions/ac3-freedom-edition.jpg"],
    "Assassin's Creed III Join or Die Edition": ["images/collectors-editions/ac3-join-or-die-edition.jpg"],
    "Assassin's Creed III Limited Edition": ["images/collectors-editions/ac3-limited-edition.jpg"],
    "Assassin's Creed IV: Black Flag Black Chest Edition": ["images/collectors-editions/ac4-black-chest-edition.jpg"],
    "Assassin's Creed IV: Black Flag Buccaneer Edition": ["images/collectors-editions/ac4-buccaneer-edition.jpg"],
    "Assassin's Creed IV: Black Flag Skull Edition": ["images/collectors-editions/ac4-skull-edition.jpg"],
    "Assassin's Creed IV: Black Flag Limited Edition": ["images/collectors-editions/ac4-limited-edition.jpg"],
    "Assassin's Creed Rogue Collector's Edition": [
        "images/collectors-editions/rogue-collectors-edition.jpg",
        "images/collectors-editions/rogue-collectors-edition_01.jpg",
    ],
    "Assassin's Creed Unity Guillotine Collector's Case": ["images/collectors-editions/unity-guillotine-collectors-case.jpg"],
    "Assassin's Creed Unity Notre Dame Edition": ["images/collectors-editions/unity-notre-dame-edition.jpg"],
    "Assassin's Creed Unity Collector's Edition": ["images/collectors-editions/unity-collectors-edition.jpg"],
    "Assassin's Creed Unity Bastille Edition": ["images/collectors-editions/unity-bastille-edition.jpg"],
    "Assassin's Creed Syndicate Big Ben Collector's Case": ["images/collectors-editions/syndicate-big-ben-collectors-case.jpg"],
    "Assassin's Creed Syndicate Charing Cross Edition": [
        "images/collectors-editions/syndicate-charing-cross-edition.jpg",
        "images/collectors-editions/syndicate-charing-cross-edition_01.jpg",
    ],
    "Assassin's Creed Syndicate The Rooks Edition": ["images/collectors-editions/syndicate-rooks-edition.jpg"],
    "Assassin's Creed Origins Deluxe Edition": [
        "images/collectors-editions/origins-deluxe-edition.jpg",
        "images/collectors-editions/origins-deluxe-edition_01.jpg",
        "images/collectors-editions/origins-deluxe-edition_02.jpg",
    ],
    "Assassin's Creed Origins Gods Edition": [
        "images/collectors-editions/origins-gods-edition.jpg",
        "images/collectors-editions/origins-gods-edition_01.jpg",
    ],
    "Assassin's Creed Origins Dawn of the Creed Edition": [
        "images/collectors-editions/origins-dawn-of-the-creed-edition.jpg",
        "images/collectors-editions/origins-dawn-of-the-creed-edition_01.jpg",
        "images/collectors-editions/origins-dawn-of-the-creed-edition_02.jpg",
    ],
    "Assassin's Creed Origins Dawn of the Creed Legendary Edition": ["images/collectors-editions/origins-dawn-of-the-creed-legendary-edition.jpg"],
    "Assassin's Creed Odyssey Pantheon Edition": ["images/collectors-editions/odyssey-pantheon-edition.jpg"],
    "Assassin's Creed Odyssey Spartan Edition": ["images/collectors-editions/odyssey-spartan-edition.jpg"],
    "Assassin's Creed Odyssey Medusa Edition": ["images/collectors-editions/odyssey-medusa-edition.jpg"],
    "Assassin's Creed Valhalla Collector's Edition": ["images/collectors-editions/valhalla-collectors-edition.jpg"],
    "Assassin's Creed Mirage Collector's Case": ["images/collectors-editions/mirage-collectors-case.jpg"],
    "Assassin's Creed Shadows Collector's Edition": ["images/collectors-editions/shadows-collectors-edition.jpg"],

    // ── Steelbooks ──
    "Assassin's Creed Steelbook (AC1, Xbox 360)": [
        "images/steelbooks/ac1-steelbook-xbox-360.jpg",
        "images/steelbooks/ac1-steelbook-xbox-360_01.jpg",
    ],
    "Assassin's Creed III Steelbook Edition": ["images/steelbooks/ac3-steelbook-edition.jpg"],
    "Assassin's Creed III Future Shop Steelbook Edition": ["images/steelbooks/ac3-future-shop-steelbook-edition.jpg"],
    "Assassin's Creed Origins Gold SteelBook Edition": ["images/steelbooks/origins-gold-steelbook.jpg"],
    "Assassin's Creed Valhalla Gold Steelbook Edition": ["images/steelbooks/valhalla-gold-steelbook.jpg"],
    "Assassin's Creed Valhalla Ultimate Steelbook Edition": ["images/steelbooks/valhalla-ultimate-steelbook.jpg"],
    "Assassin's Creed (2016 Movie) SteelBook Edition": ["images/steelbooks/ac-movie-steelbook.jpg"],

    // ── PureArts Statues and replicas ──
    "PureArts Animus Altair 1/4 Scale Statue": ["images/statues/purearts-animus-altair-1-4.png"],
    "PureArts Prestige Line Altair Ibn-La'Ahad 1/2 Scale Statue": ["images/statues/purearts-prestige-altair-1-2.jpg"],
    "PureArts Animus Ezio 1/4 Scale Statue": ["images/statues/purearts-animus-ezio-1-4.png"],
    "PureArts Animus Connor 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-connor-1-4.jpg"],
    "PureArts Animus Edward Kenway 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-edward-1-4.jpg"],
    "PureArts Animus Arno 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-arno-1-4.jpg"],
    "PureArts Animus Jacob & Evie 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-jacob-evie-1-4.jpg"],
    "PureArts Animus Basim 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-basim-1-4.jpg"],
    "PureArts Animus Naoe & Yasuke 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-naoe-yasuke-1-4.jpg"],
    "PureArts Animus Ezio 1/8 Scale Statue": ["images/statues/purearts-animus-ezio-1-8.jpg"],
    "PureArts Animus Altair 1/8 Scale Statue": ["images/statues/purearts-animus-altair-1-8.jpg"],
    "PureArts Animus Connor 1/8 Scale Statue": ["images/statues/purearts-animus-connor-1-8.jpg"],
    "PureArts Animus Bayek 1/8 Scale Statue": ["images/statues/purearts-animus-bayek-1-8.jpg"],
    "PureArts Animus Kassandra 1/8 Scale Statue": ["images/statues/purearts-animus-kassandra-1-8.jpg"],
    "PureArts Animus Eivor 1/8 Scale Statue": ["images/statues/purearts-animus-eivor-1-8.jpg"],
    "PureArts Animus Basim 1/8 Scale Statue": ["images/statues/purearts-animus-basim-1-8.jpg"],
    "PureArts Animus Yasuke 1/8 Scale Statue": ["images/statues/purearts-animus-yasuke-1-8.jpg"],
    "PureArts Animus Naoe 1/8 Scale Statue": ["images/statues/purearts-animus-naoe-1-8.jpg"],
    "Assassin's Creed Shadows Yasuke Helmet 1/1 Scale Replica": [
        "images/other/purearts-yasuke-helmet-replica.jpg",
        "images/other/purearts-yasuke-helmet-replica_01.jpg",
    ],
    "Assassin's Creed Animus Kassandra Exclusive Edition": [
        "images/statues/purearts-animus-kassandra-ee.jpg",
        "images/statues/purearts-animus-kassandra-ee_01.jpg",
        "images/statues/purearts-animus-kassandra-ee_02.jpg",
    ],
    "Assassin's Creed: Valhalla Eivor 1/6 Scale Articulated Figure": [
        "images/statues/purearts-eivor-articulated.jpg",
        "images/statues/purearts-eivor-articulated_01.jpg",
        "images/statues/purearts-eivor-articulated_02.jpg",
    ],
    // ── PureArts Other ──
    "PureArts Animus Eivor Statue": ["images/statues/purearts-animus-eivor-1-4.jpg"],
    "PureArts Spartan Kick Diorama 1/6 Scale (Exclusive Edition)": ["images/statues/purearts-spartan-kick-diorama.jpg"],
    "PureArts Naoe Bust 1/4 Scale": [
        "images/statues/purearts-naoe-bust-1-4.jpg",
        "images/statues/purearts-naoe-bust-1-4_01.jpg",
    ],
    "PureArts Yasuke Bust 1/4 Scale": [
        "images/statues/purearts-yasuke-bust-1-4.jpg",
        "images/statues/purearts-yasuke-bust-1-4_01.jpg",
    ],
    "PureArts Qlectors Naoe & Yasuke PVC Figure Set": ["images/statues/purearts-qlectors-naoe-yasuke.jpg"],
    "PureArts Qlectors Ezio Leap of Faith PVC Figure": ["images/statues/purearts-qlectors-ezio-leap-of-faith.jpg"],
    "PureArts Assassin's Creed Shadows Shogi Board Game": ["images/other/purearts-shadows-shogi-board.jpg"],
    "PureArts Assassin's Creed Valhalla Life-Size Hidden Blade Prop": ["images/other/valhalla-hidden-blade-replica.jpg"],
    "PureArts Assassin's Creed Valhalla Bundle (Eivor Statue, Hidden Blade & Dice Game)": ["images/other/valhalla-bundle-eivor-blade-dice.jpg"],

    // ── Ubicollectibles Figurines ──
    "Ubicollectibles Ezio Leap of Faith Figurine": ["images/statues/ubicollectibles-ezio-leap-of-faith.jpg"],
    "Ubicollectibles Ezio's Fury Statue (Brotherhood)": ["images/statues/ubicollectibles-ezios-fury-brotherhood.jpg"],
    "Ubicollectibles Legacy Collection - Altair Bust": ["images/statues/ubicollectibles-legacy-altair-bust.jpg"],
    "Ubicollectibles Legacy Collection - Ezio Bust": ["images/statues/ubicollectibles-legacy-ezio-bust.jpg"],
    "Ubicollectibles Legacy Collection - Connor Bust": ["images/statues/ubicollectibles-legacy-connor-bust.jpg"],
    "Ubicollectibles Legacy Collection - Edward Kenway Bust": ["images/statues/ubicollectibles-legacy-edward-bust.jpg"],
    "Ubicollectibles Legacy Collection - Aveline Bust": ["images/statues/ubicollectibles-legacy-aveline-bust.jpg"],
    "Ubicollectibles Aveline de Grandpre PVC Statue": ["images/statues/ubicollectibles-aveline-pvc-statue.jpg"],
    "Ubicollectibles Altair Apple of Eden Keeper Figurine": ["images/statues/ubicollectibles-altair-apple-of-eden.jpg"],
    "Ubicollectibles Jacob Frye 'The Impetuous Brother' Statue": [
        "images/statues/ubicollectibles-jacob-frye.jpg",
        "images/statues/ubicollectibles-jacob-frye_01.jpg",
    ],
    "Ubicollectibles Evie Frye 'The Intrepid Sister' Statue": [
        "images/statues/ubicollectibles-evie-frye.jpg",
        "images/statues/ubicollectibles-evie-frye_01.jpg",
    ],
    "Ubicollectibles Jacob & Evie 'The Wise and Wild Twins' Diorama": ["images/statues/ubicollectibles-jacob-evie-diorama.jpg"],
    "Ubicollectibles Bayek Statue": [
        "images/statues/ubicollectibles-bayek.jpg",
        "images/statues/ubicollectibles-bayek_01.jpg",
    ],
    "Ubicollectibles Aya Statue": [
        "images/statues/ubicollectibles-aya.jpg",
        "images/statues/ubicollectibles-aya_01.jpg",
    ],
    "Ubicollectibles Alexios Statue": [
        "images/statues/ubicollectibles-alexios.jpg",
        "images/statues/ubicollectibles-alexios_01.jpg",
    ],
    "Ubicollectibles Kassandra Statue": [
        "images/statues/ubicollectibles-kassandra.jpg",
        "images/statues/ubicollectibles-kassandra_01.jpg",
    ],
    "Alexios Legendary Statue": [
        "images/statues/alexios-legendary-figurine.jpg",
        "images/statues/alexios-legendary-figurine_01.jpg",
    ],
    "Ubicollectibles Aguilar Statue (24cm)": [
        "images/statues/ubicollectibles-aguilar-24cm.jpg",
        "images/statues/ubicollectibles-aguilar-24cm_01.jpg",
    ],
    "Ubicollectibles Maria Statue (24cm)": [
        "images/statues/ubicollectibles-maria.jpg",
        "images/statues/ubicollectibles-maria_01.jpg",
    ],
    "Triforce Aguilar Collector's Edition Statue (35cm)": [
        "images/statues/triforce-aguilar-35cm.jpg",
        "images/statues/triforce-aguilar-35cm_01.jpg",
    ],
    "Ubicollectibles Altair The Legendary Assassin": [
        "images/statues/ubicollectibles-altair-the-legendary-assassin.jpg",
        "images/statues/ubicollectibles-altair-the-legendary-assassin_01.jpg",
    ],
    "Ubicollectibles Assassin's Creed Rogue: The Renegade": [
        "images/statues/ubicollectibles-rogue-the-renegade.jpg",
        "images/statues/ubicollectibles-rogue-the-renegade_01.jpg",
    ],

    // ── Replicas / Props ──
    "Ubicollectibles Apple of Eden Replica (Movie)": [
        "images/other/apple-of-eden-replica-movie.jpg",
        "images/other/apple-of-eden-replica-movie_01.jpg",
    ],
    "Ubicollectibles Apple of Eden Collector Chest (Movie)": [
        "images/other/apple-of-eden-collector-chest-movie.jpg",
        "images/other/apple-of-eden-collector-chest-movie_01.jpg",
    ],
    "Ubicollectibles Hidden Blade Replica (Movie)": [
        "images/other/hidden-blade-replica-movie.jpg",
        "images/other/hidden-blade-replica-movie_01.jpg",
    ],
    "Ubicollectibles Apple of Eden Replica (Origins)": [
        "images/other/apple-of-eden-replica-origins.jpg",
        "images/other/apple-of-eden-replica-origins_01.jpg",
    ],
    "Ubicollectibles The First Hidden Blade Replica (Origins)": [
        "images/other/first-hidden-blade-replica-origins.jpg",
        "images/other/first-hidden-blade-replica-origins_01.jpg",
    ],
    "Ubicollectibles Broken Spear of Leonidas Replica": [
        "images/other/broken-spear-of-leonidas-replica.jpg",
        "images/other/broken-spear-of-leonidas-replica_01.jpg",
    ],
    "McFarlane Toys Hidden Blade & Gauntlet with Skull Buckle (Black Flag)": [
        "images/other/mcfarlane-hidden-blade-black-flag.jpg",
        "images/other/mcfarlane-hidden-blade-black-flag_01.jpg",
    ],
    "McFarlane Toys Gauntlet with Hidden Blade (Syndicate)": [
        "images/other/mcfarlane-hidden-blade-syndicate.jpg",
        "images/other/mcfarlane-hidden-blade-syndicate_01.jpg",
    ],
    "McFarlane Toys Aguilar's Hidden Blade (Movie)": ["images/other/mcfarlane-hidden-blade-movie.jpg"],
    "Assassins Creed Syndicate Official Press Promo Power Bank Cane Handle": [
        "images/other/syndicate-cane-handle-power-bank.jpg",
        "images/other/syndicate-cane-handle-power-bank_01.jpg",
    ],

    // ── McFarlane Action Figures ──
    "McFarlane Toys Altair Action Figure (Series 3)": [
        "images/statues/mcfarlane-altair.jpg",
        "images/statues/mcfarlane-altair_01.jpg",
        "images/statues/mcfarlane-altair_02.jpg",
    ],
    "McFarlane Toys Ezio Action Figure (Series 3)": [
        "images/statues/mcfarlane-ezio.jpg",
        "images/statues/mcfarlane-ezio_01.jpg",
    ],
    "McFarlane Toys Connor Action Figure (Series 1)": [
        "images/statues/mcfarlane-connor.jpg",
        "images/statues/mcfarlane-connor_01.jpg",
    ],
    "McFarlane Toys Edward Kenway Action Figure (Series 1)": [
        "images/statues/mcfarlane-edward.jpg",
        "images/statues/mcfarlane-edward_01.jpg",
    ],
    "McFarlane Toys Aveline de Grandpre Action Figure (Series 2)": [
        "images/statues/mcfarlane-aveline.jpg",
        "images/statues/mcfarlane-aveline_01.jpg",
    ],
    "McFarlane Toys Aguilar Action Figure (Movie Series)": [
        "images/statues/mcfarlane-aguilar.jpg",
        "images/statues/mcfarlane-aguilar_01.jpg",
    ],
    "McFarlane Toys Shay Cormac Figure (Series 4)": [
        "images/statues/mcfarlane-shay.jpg",
        "images/statues/mcfarlane-shay_01.jpg",
    ],
    "McFarlane Toys Haytham Kenway Action Figure (Series 1)": [
        "images/statues/mcfarlane-haytham.jpg",
        "images/statues/mcfarlane-haytham_01.jpg",
    ],
    "McFarlane Toys Ratonhnhake:ton Action Figure (Series 1)": [
        "images/statues/mcfarlane-ratonhnhaketon.jpg",
        "images/statues/mcfarlane-ratonhnhaketon_01.jpg",
    ],
    "McFarlane Toys Benjamin Hornigold Action Figure (Series 1)": [
        "images/statues/mcfarlane-hornigold.jpg",
        "images/statues/mcfarlane-hornigold_01.jpg",
        "images/statues/mcfarlane-hornigold_02.jpg",
    ],
    "McFarlane Toys Blackbeard Action Figure (Series 1)": [
        "images/statues/mcfarlane-blackbeard.jpg",
        "images/statues/mcfarlane-blackbeard_01.jpg",
    ],
    "McFarlane Toys Black Bart Action Figure (Series 1)": [
        "images/statues/mcfarlane-black-bart.jpg",
        "images/statues/mcfarlane-black-bart_01.jpg",
    ],
    "McFarlane Toys Adewale Action Figure (Series 2)": [
        "images/statues/mcfarlane-adewale.jpg",
        "images/statues/mcfarlane-adewale_01.jpg",
    ],
    "McFarlane Toys Arno Dorian Action Figure (Series 3)": [
        "images/statues/mcfarlane-arno.jpg",
        "images/statues/mcfarlane-arno_01.jpg",
    ],
    "McFarlane Toys Ah Tabai Action Figure (Series 3)": [
        "images/statues/mcfarlane-ah-tabai.jpg",
        "images/statues/mcfarlane-ah-tabai_01.jpg",
    ],
    "McFarlane Toys Edward Kenway Mayan Outfit Action Figure (Series 3)": [
        "images/statues/mcfarlane-edward-mayan.jpg",
        "images/statues/mcfarlane-edward-mayan_01.jpg",
    ],
    "McFarlane Toys Connor with Mohawk Action Figure (Series 3)": [
        "images/statues/mcfarlane-connor-mohawk.jpg",
        "images/statues/mcfarlane-connor-mohawk_01.jpg",
    ],
    "McFarlane Toys Arno Dorian Master Assassin Outfit Action Figure (Series 4)": [
        "images/statues/mcfarlane-arno-master-assassin.jpg",
        "images/statues/mcfarlane-arno-master-assassin_01.jpg",
    ],
    "McFarlane Toys Eagle Vision Arno Dorian Action Figure (Series 4)": [
        "images/statues/mcfarlane-arno-eagle-vision.jpg",
        "images/statues/mcfarlane-arno-eagle-vision_01.jpg",
    ],
    "McFarlane Toys Cane Sword Replica (Syndicate)": [
        "images/other/mcfarlane-cane-sword.jpg",
        "images/other/mcfarlane-cane-sword_01.jpg",
    ],
    "McFarlane Toys Jacob Frye Action Figure (Series 4)": [
        "images/statues/mcfarlane-jacob-frye.jpg",
        "images/statues/mcfarlane-jacob-frye_01.jpg",
    ],
    "McFarlane Toys Union Jacob Frye Action Figure (Series 5)": [
        "images/statues/mcfarlane-union-jacob.jpg",
        "images/statues/mcfarlane-union-jacob_01.jpg",
        "images/statues/mcfarlane-union-jacob_02.jpg",
    ],
    "McFarlane Toys Il Tricolore Ezio Auditore Action Figure (Series 5)": [
        "images/statues/mcfarlane-il-tricolore-ezio.jpg",
        "images/statues/mcfarlane-il-tricolore-ezio_01.jpg",
    ],
    "McFarlane Toys Revolutionary Connor Action Figure (Series 5)": [
        "images/statues/mcfarlane-revolutionary-connor.jpg",
        "images/statues/mcfarlane-revolutionary-connor_01.jpg",
    ],
    "McFarlane Toys Connor Color Tops Collector Edition": [
        "images/statues/mcfarlane-connor-color-tops.jpg",
        "images/statues/mcfarlane-connor-color-tops_01.jpg",
    ],
    "McFarlane Toys Phantom Blade Replica (Unity)": ["images/other/mcfarlane-phantom-blade.jpg"],

    // ── Art Books ──
    "Assassin's Creed Pre-Order Art Book": [
        "images/art-books/ac1-pre-order-art-book.jpg",
        "images/art-books/ac1-pre-order-art-book_01.jpg",
        "images/art-books/ac1-pre-order-art-book_02.jpg",
    ],
    "Assassin's Creed Encyclopedia (First Edition)": ["images/art-books/encyclopedia-first-edition.jpg"],
    "Assassin's Creed Encyclopedia (Second Edition)": ["images/art-books/encyclopedia-second-edition.jpg"],
    "Assassin's Creed Encyclopedia (Third Edition / Black Edition)": ["images/art-books/encyclopedia-third-edition.jpg"],
    "Assassin's Creed: The Complete Visual History": [
        "images/art-books/complete-visual-history.jpg",
        "images/art-books/complete-visual-history_01.jpg",
    ],
    "Assassin's Creed IV Black Flag: Blackbeard - The Lost Journal": [
        "images/art-books/blackbeard-lost-journal.jpg",
        "images/art-books/blackbeard-lost-journal_01.jpg",
        "images/art-books/blackbeard-lost-journal_02.jpg",
        "images/art-books/blackbeard-lost-journal_03.jpg",
    ],
    "Assassin's Creed Unity: Abstergo Entertainment Employee Handbook": [
        "images/art-books/abstergo-employee-handbook.jpg",
        "images/art-books/abstergo-employee-handbook_01.jpg",
        "images/art-books/abstergo-employee-handbook_02.jpg",
    ],
    "Assassin's Creed: Prima Official Game Guide": ["images/art-books/guide-ac1.jpg"],
    "Assassin's Creed II: The Complete Official Guide": ["images/art-books/guide-ac2.jpg"],
    "Assassin's Creed II: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-ac2-ce.jpg"],
    "Assassin's Creed Brotherhood: The Complete Official Guide": ["images/art-books/guide-brotherhood.jpg"],
    "Assassin's Creed Brotherhood: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-brotherhood-ce.jpg"],
    "Assassin's Creed Revelations: The Complete Official Guide": ["images/art-books/guide-revelations.jpg"],
    "Assassin's Creed Revelations: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-revelations-ce.jpg"],
    "Assassin's Creed III: The Complete Official Guide": ["images/art-books/guide-ac3.jpg"],
    "Assassin's Creed III: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-ac3-ce.jpg"],
    "Assassin's Creed IV Black Flag: The Complete Official Guide": ["images/art-books/guide-ac4.jpg"],
    "Assassin's Creed IV Black Flag: The Complete Official Guide - Collector's Edition": [
        "images/art-books/guide-ac4-ce.jpg",
        "images/art-books/guide-ac4-ce_01.jpg",
    ],
    "Assassin's Creed Unity: The Complete Official Guide": ["images/art-books/guide-unity.jpg"],
    "Assassin's Creed Unity: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-unity-ce.jpg"],
    "Assassin's Creed Syndicate: Official Strategy Guide": ["images/art-books/guide-syndicate.jpg"],
    "Assassin's Creed Syndicate: Official Collector's Edition Guide": ["images/art-books/guide-syndicate-ce.jpg"],
    "Assassin's Creed Origins: Official Guide": ["images/art-books/guide-origins.jpg"],
    "Assassin's Creed Origins: Official Collector's Edition Guide": ["images/art-books/guide-origins-ce.jpg"],
    "Assassin's Creed Odyssey: Official Collector's Edition Guide": ["images/art-books/guide-odyssey-ce.jpg"],
    "Assassin's Creed Odyssey: Official Platinum Edition Guide": [
        "images/art-books/guide-odyssey-pe.jpg",
        "images/art-books/guide-odyssey-pe_01.jpg",
    ],
    "Assassin's Creed Shadows: The Complete Official Guide": ["images/art-books/guide-shadows.jpg"],
    "Assassin's Creed Shadows: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-shadows-ce.jpg"],
    "Assassin's Creed: The Culinary Codex": [
        "images/art-books/culinary-codex.jpg",
        "images/art-books/culinary-codex_01.jpg",
    ],
    "Assassin's Creed Limited Edition Art Book (Prima Games)": ["images/art-books/ac1-art-book-prima-games.jpg"],
    "The Art of Assassin's Creed III": [
        "images/art-books/art-of-ac3.jpg",
        "images/art-books/art-of-ac3_01.jpg",
    ],
    "The Art of Assassin's Creed IV: Black Flag": [
        "images/art-books/art-of-ac4-black-flag.jpg",
        "images/art-books/art-of-ac4-black-flag_01.jpg",
        "images/art-books/art-of-ac4-black-flag_02.jpg",
    ],
    "The Art of Assassin's Creed Unity": ["images/art-books/art-of-ac-unity.jpg"],
    "The Art of Assassin's Creed Unity (Limited Edition)": [
        "images/art-books/art-of-ac-unity-le.jpg",
        "images/art-books/art-of-ac-unity-le_01.jpg",
        "images/art-books/art-of-ac-unity-le_02.jpg",
        "images/art-books/art-of-ac-unity-le_03.jpg",
        "images/art-books/art-of-ac-unity-le_04.jpg",
    ],
    "The Art of Assassin's Creed Syndicate": ["images/art-books/art-of-ac-syndicate.jpg"],
    "The Art of Assassin's Creed Origins": [
        "images/art-books/art-of-ac-origins.jpg",
        "images/art-books/art-of-ac-origins_01.jpg",
    ],
    "The Art of Assassin's Creed Odyssey": ["images/art-books/art-of-ac-odyssey.jpg"],
    "The Art of Assassin's Creed Valhalla": ["images/art-books/art-of-ac-valhalla.jpg"],
    "The Art of Assassin's Creed Valhalla (Deluxe Edition)": [
        "images/art-books/art-of-ac-valhalla-de.jpg",
        "images/art-books/art-of-ac-valhalla-de_01.jpg",
        "images/art-books/art-of-ac-valhalla-de_02.jpg",
    ],
    "The Art of Assassin's Creed Mirage": ["images/art-books/art-of-ac-mirage.jpg"],
    "The Art of Assassin's Creed Mirage (Deluxe Edition)": [
        "images/art-books/art-of-ac-mirage_deluxe.jpg",
        "images/art-books/art-of-ac-mirage_deluxe_01.jpg",
        "images/art-books/art-of-ac-mirage_deluxe_02.jpg",
    ],
    "The Art of Assassin's Creed Shadows": ["images/art-books/art-of-ac-shadows.jpg"],
    "The Art of Assassin's Creed Shadows (Deluxe Edition)": ["images/art-books/art-of-ac-shadows-deluxe.jpg"],
    "The Making of Assassin's Creed: 15th Anniversary": [
        "images/art-books/making-of-ac-15th-anniversary.jpg",
        "images/art-books/making-of-ac-15th-anniversary_01.jpg",
    ],
    "The Making of Assassin's Creed: 15th Anniversary (Deluxe Edition)": [
        "images/art-books/making-of-ac-15th-anniversary-de.jpg",
        "images/art-books/making-of-ac-15th-anniversary-de_01.jpg",
        "images/art-books/making-of-ac-15th-anniversary-de_02.jpg",
    ],
    "The Making of Assassin's Creed: 15th Anniversary Ultimate Edition HC": [
        "images/art-books/making-of-ac-15th-anniversary-ue.jpg",
        "images/art-books/making-of-ac-15th-anniversary-ue_01.jpg",
        "images/art-books/making-of-ac-15th-anniversary-ue_02.jpg",
        "images/art-books/making-of-ac-15th-anniversary-ue_03.jpg",
    ],

    // ── Funko Pop ──
    "Funko Pop! Games #20 - Altair": ["images/funko-pop/funko-pop-20-altair.jpg"],
    "Funko Pop Assassin's Creed Game Cover #901 Altair": [
        "images/funko-pop/funko-pop-901-altair-cover.jpg",
        "images/funko-pop/funko-pop-901-altair-cover_01.jpg",
    ],
    "Funko Pop! Games #21 - Ezio (Standard White)": ["images/funko-pop/funko-pop-21-ezio-white.jpg"],
    "Funko Pop! Games #21 - Ezio (Eagle Vision Blue) (GameStop Exclusive)": ["images/funko-pop/funko-pop-21-ezio-eagle-vision-blue.jpg"],
    "Funko Pop! Games #21 - Ezio (Black)": ["images/funko-pop/funko-pop-21-ezio-black.jpg"],
    "Funko Pop! Games #22 - Connor": ["images/funko-pop/funko-pop-22-connor.jpg"],
    "Funko Pop! Games #23 - Edward": ["images/funko-pop/funko-pop-23-edward.jpg"],
    "Funko Pop! Games #24 - Plague Doctor (Multiplayer)": ["images/funko-pop/funko-pop-24-plague-doctor.jpg"],
    "Funko Pop! Games #28 - Aveline de Grandpre": ["images/funko-pop/funko-pop-28-aveline.jpg"],
    "Funko Pop! Games #35 - Arno": ["images/funko-pop/funko-pop-35-arno.jpg"],
    "Funko Pop! Games #36 - Elise": ["images/funko-pop/funko-pop-36-elise.jpg"],
    "Funko Pop! Games #73 - Jacob Frye": ["images/funko-pop/funko-pop-73-jacob-frye.jpg"],
    "Funko Pop! Games #74 - Evie Frye": ["images/funko-pop/funko-pop-74-evie-frye.jpg"],
    "Funko Pop! Games #80 - Jacob Frye (Uncloaked) (Underground Toys Exclusive)": ["images/funko-pop/funko-pop-80-jacob-frye-uncloaked.jpg"],
    "Funko Pop! Games #776 - Eivor": ["images/funko-pop/funko-pop-776-eivor.jpg"],
    "Funko Pop! Games #778 - Eivor with Double Axe (GameStop Exclusive)": ["images/funko-pop/funko-pop-778-eivor-double-axe.jpg"],
    "Funko Pop! Movies #375 - Aguilar": ["images/funko-pop/funko-pop-375-aguilar.jpg"],
    "Funko Pop! Movies #376 - Maria": ["images/funko-pop/funko-pop-376-maria.jpg"],
    "Funko Pop! Movies #377 - Ojeda": ["images/funko-pop/funko-pop-377-ojeda.jpg"],
    "Funko Pop! Movies #378 - Callum Lynch": ["images/funko-pop/funko-pop-378-callum-lynch.jpg"],
    "Funko Pop! Movies #379 - Aguilar (Crouching) (Loot Crate Exclusive)": ["images/funko-pop/funko-pop-379-aguilar-crouching.jpg"],
    "Funko Pop! Altair #080 (Dorbz)": ["images/funko-pop/funko-altair-080-dorbz.jpg"],
    "Funko Pop! Arno #081 (Dorbz)": ["images/funko-pop/funko-arno-081-dorbz.jpg"],
    "Funko Pop! Elise #082 (Dorbz)": ["images/funko-pop/funko-elise-082-dorbz.jpg"],
    "Funko Pop! Edward #083 (Dorbz)": ["images/funko-pop/funko-edward-083-dorbz.jpg"],
    "Funko Pop! Ezio #084 (Dorbz)": ["images/funko-pop/funko-ezio-084-dorbz.jpg"],
    "Funko Pop! Jacob #085 (Dorbz)": ["images/funko-pop/funko-jacob-085-dorbz.jpg"],

    // ── Jewelry ──
    "Ubi Workshop Master Assassin Ring": [
        "images/other/ubi-workshop-master-assassin-ring.jpg",
        "images/other/ubi-workshop-master-assassin-ring_01.jpg",
    ],
    "Ubi Workshop Templar Ring": ["images/other/ubi-workshop-templar-ring.jpg"],
    "Ubi Workshop Connor Amulet Necklace (Silver)": ["images/other/ubi-workshop-connor-amulet-necklace.jpg"],
    "Ubi Workshop Syndicate Rooks Necklace": ["images/other/ubi-workshop-rooks-necklace.jpg"],
    "Ubi Workshop Syndicate Starrick Templar Necklace": ["images/other/ubi-workshop-starrick-templar-necklace.jpg"],
    "Ubi Workshop Syndicate Templar Amulet Necklace": ["images/other/ubi-workshop-templar-amulet-necklace.jpg"],
    "BIXLER x Assassin's Creed Odyssey Jewelry Collection": ["images/other/bixler-odyssey-jewelry-collection.jpg"],
    "King Ice x Assassin's Creed Shadows Necklace (Yasuke Kabuto 14K Gold)": [
        "images/other/king-ice-yasuke-kabuto-necklace.jpg",
        "images/other/king-ice-yasuke-kabuto-necklace_01.jpg",
    ],

    // ── Compilations / Other ──
    "Assassin's Creed Heritage Collection": [
        "images/other/heritage-collection.jpg",
        "images/other/heritage-collection_01.jpg",
    ],
    "Assassin's Creed: The Official Collection (Hachette Partworks)": ["images/statues/hachette-official-collection.jpg"],
    "Assassin's Creed Anthology Edition": [
        "images/collectors-editions/ac-anthology.jpg",
        "images/collectors-editions/ac-anthology_01.jpg",
    ],
    "Ubicollectibles Connor 'The Last Breath' Statue": [
        "images/statues/connor-the-last-breath.jpg",
        "images/statues/connor-the-last-breath_01.jpg",
    ],
    "Ubicollectibles Connor 'The Hunter' Statue": [
        "images/statues/connor-the-hunter.jpg",
        "images/statues/connor-the-hunter_01.jpg",
    ],
    "Ubicollectibles Edward Kenway 'The Assassin Pirate' Statue": ["images/statues/ubicollectibles-edward-the-assassin-pirate.jpg"],
    "Ubicollectibles Blackbeard 'The Legendary Pirate' Statue": ["images/statues/ubicollectibles-blackbeard-the-legendary-pirate.jpg"],
    "Loot Crate Assassin's Creed IV: Black Flag Edward Kenway Figure": ["images/statues/lootcrate-edward-kenway.jpg"],
    "Loot Crate Assassin's Creed Origins Bayek Figure": ["images/statues/lootcrate-bayek.jpg"],
    "Ubisoft Heroes Collection Chibi Figure - Shao Jun": ["images/statues/ubisoft-heroes-shao-jun.jpg"],
    "Ubisoft Heroes Collection Chibi Figure - Ezio": ["images/statues/ubisoft-heroes-ezio.jpg"],
    "Ubisoft Heroes Collection - Eivor Male": ["images/statues/ubisoft-heroes-eivor-male.jpg"],
    "Ubisoft Heroes Collection - Eivor Female": ["images/statues/ubisoft-heroes-eivor-female.jpg"],
    "YouTooz Assassin's Creed #0 - Ezio": [
        "images/statues/youtooz-ac-0-ezio.jpg",
        "images/statues/youtooz-ac-0-ezio_01.jpg",
    ],
    "YouTooz Assassin's Creed #1 - Eivor": [
        "images/statues/youtooz-ac-1-eivor.jpg",
        "images/statues/youtooz-ac-1-eivor_01.jpg",
    ],
    "YouTooz Assassin's Creed #2 - Yasuke": [
        "images/statues/youtooz-ac-2-yasuke.jpg",
        "images/statues/youtooz-ac-2-yasuke_01.jpg",
    ],
    "YouTooz Assassin's Creed #3 - Naoe": [
        "images/statues/youtooz-ac-3-naoe.jpg",
        "images/statues/youtooz-ac-3-naoe_01.jpg",
    ],

    // ── Novels ──
    "Assassin's Creed: Renaissance": ["images/novels/ac-renaissance.jpg"],
    "Assassin's Creed: Brotherhood (Novel)": ["images/novels/ac-brotherhood-novel.jpg"],
    "Assassin's Creed: The Secret Crusade": ["images/novels/ac-secret-crusade.jpg"],
    "Assassin's Creed: Revelations (Novel)": ["images/novels/ac-revelations-novel.jpg"],
    "Assassin's Creed: Forsaken": ["images/novels/ac-forsaken.jpg"],
    "Assassin's Creed: Black Flag (Novel)": ["images/novels/ac-black-flag-novel.jpg"],
    "Assassin's Creed: Unity (Novel)": ["images/novels/ac-unity-novel.jpg"],
    "Assassin's Creed: Underworld": ["images/novels/ac-underworld.jpg"],
    "Assassin's Creed: Heresy": ["images/novels/ac-heresy.jpg"],
    "Assassin's Creed: Heresy - Special Edition": ["images/novels/ac-heresy-se.jpg"],
    "Assassin's Creed: Last Descendants": ["images/novels/ac-last-descendants.jpg"],
    "Assassin's Creed: Last Descendants - Tomb of the Khan": ["images/novels/ac-last-descendants-tomb-of-khan.jpg"],
    "Assassin's Creed: Last Descendants - Fate of the Gods": ["images/novels/ac-last-descendants-fate-of-gods.jpg"],
    "Assassin's Creed Origins: Desert Oath": ["images/novels/ac-origins-desert-oath.jpg"],
    "Assassin's Creed: Odyssey (Novel)": ["images/novels/ac-odyssey-novel.jpg"],
    "Assassin's Creed Valhalla: Geirmund's Saga": ["images/novels/ac-valhalla-geirmunds-saga.jpg"],
    "Assassin's Creed: The Ming Storm": ["images/novels/ac-ming-storm.jpg"],
    "Assassin's Creed: Fragments - The Blade of Aizu": ["images/novels/ac-fragments-blade-of-aizu.jpg"],
    "Assassin's Creed: The Desert Threat": ["images/novels/ac-desert-threat.jpg"],
    "Assassin's Creed: The Jade Seal": ["images/novels/ac-jade-seal.jpg"],
    "Assassin's Creed: The Magus Conspiracy": ["images/novels/ac-magus-conspiracy.jpg"],
    "Assassin's Creed Valhalla: Sword of the White Horse": ["images/novels/ac-sword-white-horse.jpg"],
    "Assassin's Creed: The Golden City": ["images/novels/ac-golden-city.jpg"],
    "Assassin's Creed Mirage: Daughter of No One": ["images/novels/ac-daughter-of-no-one.jpg"],
    "Assassin's Creed: Fragments - The Highlands Children": ["images/novels/ac-fragments-highlands-children.jpg"],
    "Assassin's Creed: La Route de la Soie (The Silk Road)": ["images/novels/ac-silk-road.jpg"],
    "Assassin's Creed - Escape Room Puzzle Book": [
        "images/novels/ac-escape-room-puzzle-book.jpg",
        "images/novels/ac-escape-room-puzzle-book_01.jpg",
        "images/novels/ac-escape-room-puzzle-book_02.jpg",
    ],

    // ── Comic Books ──
    "Assassin's Creed: The Chain": ["images/comics/ac-the-chain.jpg"],
    "Assassin's Creed Vol. 2: Setting Sun": ["images/comics/ac-setting-sun.jpg"],
    "Assassin's Creed: Uprising Vol. 1 - Common Ground": ["images/comics/ac-uprising-vol1.jpg"],
    "Assassin's Creed: Uprising Vol. 2 - Inflection Point": ["images/comics/ac-uprising-vol2.jpg"],
    "Assassin's Creed: Uprising Vol. 3 - Finale": [
        "images/comics/ac-uprising-vol3.jpg",
        "images/comics/ac-uprising-vol3_01.jpg",
    ],
    "Assassin's Creed: Reflections": ["images/comics/ac-reflections.jpg"],
    "Assassin's Creed: Conspiracies": ["images/comics/ac-conspiracies.jpg"],
    "Assassin's Creed Valhalla: Song of Glory": ["images/comics/ac-song-of-glory.jpg"],
    "Assassin's Creed Valhalla: Blood Brothers": ["images/comics/ac-blood-brothers.jpg"],
    "Assassin's Creed Valhalla: Forgotten Myths": ["images/comics/ac-forgotten-myths.jpg"],
    "Assassin's Creed: Blade of Shao Jun, Vol. 1": ["images/comics/ac-blade-shao-jun-vol1.jpg"],
    "Assassin's Creed: Blade of Shao Jun, Vol. 2": ["images/comics/ac-blade-shao-jun-vol2.jpg"],
    "Assassin's Creed: Blade of Shao Jun, Vol. 3": ["images/comics/ac-blade-shao-jun-vol3.jpg"],
    "Assassin's Creed: Blade of Shao Jun, Vol. 4": ["images/comics/ac-blade-shao-jun-vol4.jpg"],
    "Assassin's Creed: The Fall - Issue #1": ["images/comics/ac-the-fall-issue-1.jpg"],
    "Assassin's Creed: The Fall - Issue #2": ["images/comics/ac-the-fall-issue-2.jpg"],
    "Assassin's Creed: The Fall - Issue #3": ["images/comics/ac-the-fall-issue-3.jpg"],
    "Assassin's Creed: The Fall (Deluxe Edition)": ["images/comics/ac-the-fall-deluxe.jpg"],
    "Assassin's Creed: The Fall & The Chain (Collected Edition)": [
        "images/comics/ac-the-fall-and-the-chain.jpg",
        "images/comics/ac-the-fall-and-the-chain_01.jpg",
    ],
    "Assassin's Creed Vol. 1: Desmond": ["images/comics/ac-vol1-desmond.jpg"],
    "Assassin's Creed Vol. 2: Aquilus": ["images/comics/ac-vol2-aquilus.jpg"],
    "Assassin's Creed Vol. 3: Accipiter": ["images/comics/ac-vol3-accipiter.jpg"],
    "Assassin's Creed Vol. 4: Hawk": ["images/comics/ac-vol4-hawk.jpg"],
    "Assassin's Creed Vol. 5: El Cakr": ["images/comics/ac-vol5-el-cakr.jpg"],
    "Assassin's Creed Vol. 6: Leila": ["images/comics/ac-vol6-leila.jpg"],
    "Assassin's Creed Vol. 1: Trial by Fire": ["images/comics/ac-trial-by-fire.jpg"],
    "Assassin's Creed Vol. 3: Homecoming": ["images/comics/ac-homecoming.jpg"],
    "Assassin's Creed: Templars - Issue #1": ["images/comics/ac-templars-issue-1.jpg"],
    "Assassin's Creed: Templars - Issue #2": ["images/comics/ac-templars-issue-2.jpg"],
    "Assassin's Creed: Templars - Issue #3": ["images/comics/ac-templars-issue-3.jpg"],
    "Assassin's Creed: Templars - Issue #4": ["images/comics/ac-templars-issue-4.jpg"],
    "Assassin's Creed: Templars - Issue #5": ["images/comics/ac-templars-issue-5.jpg"],
    "Assassin's Creed: Templars - Issue #6": ["images/comics/ac-templars-issue-6.jpg"],
    "Assassin's Creed: Templars - Issue #7": ["images/comics/ac-templars-issue-7.jpg"],
    "Assassin's Creed: Templars - Issue #8": ["images/comics/ac-templars-issue-8.jpg"],
    "Assassin's Creed: Templars - Issue #9": ["images/comics/ac-templars-issue-9.jpg"],
    "Assassin's Creed: Templars Vol. 1 - Black Cross": ["images/comics/ac-templars-black-cross.jpg"],
    "Assassin's Creed: Templars Vol. 2 - Cross of War": ["images/comics/ac-templars-cross-of-war.jpg"],
    "Assassin's Creed: Last Descendants - Locus": ["images/comics/ac-locus.jpg"],
    "Assassin's Creed: Origins (Comic)": ["images/comics/ac-origins-comic.jpg"],
    "Assassin's Creed: Dynasty, Vol. 1": ["images/comics/ac-dynasty-vol1.jpg"],
    "Assassin's Creed: Dynasty, Vol. 2": ["images/comics/ac-dynasty-vol2.jpg"],
    "Assassin's Creed: Dynasty, Vol. 3": ["images/comics/ac-dynasty-vol3.jpg"],
    "Assassin's Creed: Dynasty, Vol. 4": ["images/comics/ac-dynasty-vol4.jpg"],
    "Assassin's Creed: Dynasty, Vol. 5": ["images/comics/ac-dynasty-vol5.jpg"],
    "Assassin's Creed: Dynasty, Vol. 6": ["images/comics/ac-dynasty-vol6.jpg"],
    "Assassin's Creed Dynasty (Box Set)": [
        "images/comics/ac-dynasty-box-set.jpg",
        "images/comics/ac-dynasty-box-set_01.jpg",
        "images/comics/ac-dynasty-box-set_02.jpg",
        "images/comics/ac-dynasty-box-set_03.jpg",
    ],
    "Assassin's Creed: Visionaries": ["images/comics/ac-visionaries.jpg"],
    "Assassin's Creed Mirage: A Soar of Eagles": ["images/comics/ac-soar-of-eagles.jpg"],
    "Assassin's Creed Valhalla: The Hidden Codex": [
        "images/comics/ac-valhalla-hidden-codex.jpg",
        "images/comics/ac-valhalla-hidden-codex_01.jpg",
    ],
    "Assassin's Creed: The Essential Guide": [
        "images/art-books/ac-essential-guide.jpg",
        "images/art-books/ac-essential-guide_01.jpg",
    ],
    "Assassin's Creed: The Official Film Tie-In": ["images/novels/ac-official-film-tie-in.jpg"],
    "Assassin's Creed Unity: Chalice Initiate Edition (Prima Games)": [
        "images/art-books/guide-unity-chalice-initiate.jpg",
        "images/art-books/guide-unity-chalice-initiate_01.jpg",
        "images/art-books/guide-unity-chalice-initiate_02.jpg",
    ],
    "Assassin's Creed: Brahman": ["images/comics/ac-brahman.jpg"],

    // ── Other/Tankards and Goblets ──
    "Nemesis Now Assassin's Creed 'The Creed' Tankard": ["images/other/nemesis-the-creed-tankard.jpg"],
    "Nemesis Now Assassin's Creed Brotherhood Tankard": ["images/other/nemesis-brotherhood-tankard.jpg"],
    "Nemesis Now Assassin's Creed 'Through the Ages' Tankard": ["images/other/nemesis-through-the-ages-tankard.jpg"],
    "Nemesis Now Assassin's Creed Valhalla Tankard": ["images/other/nemesis-valhalla-tankard.jpg"],
    "Nemesis Now Assassin's Creed Shadows Tankard": ["images/other/nemesis-shadows-tankard.jpg"],
    "Nemesis Now Assassin's Creed 'The Creed' Goblet": ["images/other/nemesis-the-creed-goblet.jpg"],
    "Nemesis Now Assassin's Creed Brotherhood Goblet": ["images/other/nemesis-brotherhood-goblet.jpg"],
    "Nemesis Now Assassin's Creed Valhalla Goblet": ["images/other/nemesis-valhalla-goblet.jpg"],
    "Nemesis Now Assassin's Creed Shadows Goblet": ["images/other/nemesis-shadows-goblet.jpg"],
    "Assassin's Creed: Leap Into History - Limited Edition 5xLP Boxset": [
        "images/other/leap-into-history-vinyl.jpg",
        "images/other/leap-into-history-vinyl_01.jpg",
        "images/other/leap-into-history-vinyl_02.jpg",
    ],
    "Assassin's Creed Shadows: Soundtrack Collection Limited Edition 4LP Box Set": [
        "images/other/ac-shadows-le-vinyl.jpg",
        "images/other/ac-shadows-le-vinyl_01.jpg",
    ],
    "Assassin's Creed Shadows: Original Score - Deluxe 2xLP": [
        "images/other/ac-shadows-original-score-vinyl.jpg",
        "images/other/ac-shadows-original-score-vinyl_01.jpg",
    ],
    "Assassin's Creed Shadows: Kage No Iro - Deluxe Vinyl": [
        "images/other/ac-shadows-kage-no-iro-vinyl.jpg",
        "images/other/ac-shadows-kage-no-iro-vinyl_01.jpg",
    ],
    "Assassin's Creed Shadows: UKOMBOZI - Deluxe Vinyl": [
        "images/other/ac-shadows-ukombozi-vinyl.jpg",
        "images/other/ac-shadows-ukombozi-vinyl_01.jpg",
    ],
    "Assassin's Creed: The Piano Collection Vinyl": [
        "images/other/ac-piano-collection-vinyl.jpg",
        "images/other/ac-piano-collection-vinyl_01.jpg",
    ],
    "Assassin's Creed Mirage: Original Soundtrack Vinyl": [
        "images/other/ac-mirage-ost-vinyl.jpg",
        "images/other/ac-mirage-ost-vinyl_01.jpg",
    ],
    "Assassin's Creed Valhalla: Dawn of Ragnarok - Original Soundtrack Vinyl": [
        "images/other/ac-valhalla-dawn-of-ragnarok-vinyl.jpg",
        "images/other/ac-valhalla-dawn-of-ragnarok-vinyl_01.jpg",
    ],
    "Lofi Girl x Assassin's Creed: Shadows Vinyl": ["images/other/ac-shadows-lofi-girl-vinyl.jpg"],

    // ── Jazwares ──
    "Jazwares - Altair Ibn-La'Ahad (Basic Series)": ["images/statues/jazwares-altair-basic.jpg"],
    "Jazwares - Evie Frye (Basic Series)": ["images/statues/jazwares-evie-frye-basic.jpg"],
    "Jazwares - Jacob Frye (Basic Series)": ["images/statues/jazwares-jacob-frye-basic.jpg"],
    "Jazwares - Altair Ibn-La'Ahad (Mystery Figures)": ["images/statues/jazwares-altair-mystery.jpg"],
    "Jazwares - Aya (Mystery Figures)": ["images/statues/jazwares-aya-mystery.jpg"],
    "Jazwares - Bayek (Mystery Figures)": ["images/statues/jazwares-bayek-mystery.jpg"],
    "Jazwares - Ezio Auditore (Mystery Figures)": ["images/statues/jazwares-ezio-auditore-mystery.jpg"],
    "Jazwares - Thomas de Carneillon (Chase) (Mystery Figures)": ["images/statues/jazwares-thomas-de-carneillon-mystery.jpg"],

    // ── Xtreme Play ──
    "Xtreme Play - Alexios (Basic Series)": ["images/statues/xtreme-play-alexios-basic.jpg"],
    "Xtreme Play - Altair (Basic Series)": ["images/statues/xtreme-play-altair-basic.jpg"],
    "Xtreme Play - Arno (Basic Series)": ["images/statues/xtreme-play-arno-basic.jpg"],
    "Xtreme Play - Bayek (Basic Series)": ["images/statues/xtreme-play-bayek-basic.jpg"],
    "Xtreme Play - Connor (Basic Series)": ["images/statues/xtreme-play-connor-basic.jpg"],
    "Xtreme Play - Edward (Basic Series)": ["images/statues/xtreme-play-edward-basic.jpg"],
    "Xtreme Play - Evie (Basic Series)": ["images/statues/xtreme-play-evie-basic.jpg"],
    "Xtreme Play - Ezio (Basic Series)": ["images/statues/xtreme-play-ezio-basic.jpg"],
    "Xtreme Play - Jacob (Basic Series)": ["images/statues/xtreme-play-jacob-basic.jpg"],
    "Xtreme Play - Kassandra (Basic Series)": ["images/statues/xtreme-play-kassandra-basic.jpg"],
    "Xtreme Play - Altair (Plush)": ["images/statues/xtreme-play-altair-plush.jpg"],
    "Xtreme Play - Connor (Plush)": ["images/statues/xtreme-play-connor-plush.jpg"],
    "Xtreme Play - Evie (Plush)": ["images/statues/xtreme-play-evie-plush.jpg"],
    "Xtreme Play - Kassandra (Plush)": ["images/statues/xtreme-play-kassandra-plush.jpg"],

    // ── Neca ──
    "Neca - Ezio (Auditore da Firenze) (Basic Series)": ["images/statues/neca-ezio-auditore-da-firenze-basic.jpg"],
    "Neca - Ezio (Master Assassin) (Basic Series)": ["images/statues/neca-ezio-master-assassin-basic.jpg"],
    "Neca Altair (Basic Series)": [
        "images/statues/neca-altair-basic.jpg",
        "images/statues/neca-altair-basic_01.jpg",
    ],
    "Neca Ezio 2-Pack (Basic Series)": [
        "images/statues/neca-ezio-2-pack-basic.jpg",
        "images/statues/neca-ezio-2-pack-basic_01.jpg",
    ],
    "Neca Da Vinci's Flying Machine Model": [
        "images/statues/neca-da-vinci-flying-machine.jpg",
        "images/statues/neca-da-vinci-flying-machine_01.jpg",
        "images/statues/neca-da-vinci-flying-machine_02.jpg",
    ],
    "Neca Ezio (Eagle Vision)": [
        "images/statues/neca-ezio-eagle-vision.jpg",
        "images/statues/neca-ezio-eagle-vision_01.jpg",
        "images/statues/neca-ezio-eagle-vision_02.jpg",
        "images/statues/neca-ezio-eagle-vision_03.jpg",
    ],
    "Neca Ezio (Ebony Assassin) (Hooded)": ["images/statues/neca-ezio-ebony-hooded.jpg"],
    "Neca Ezio (Ebony Assassin) (Unhooded)": [
        "images/statues/neca-ezio-ebony-unhooded.jpg",
        "images/statues/neca-ezio-ebony-unhooded_01.jpg",
    ],
    "Neca Ezio (Legendary Assassin) (Hooded)": ["images/statues/neca-ezio-legendary-hooded.jpg"],
    "Neca Ezio (Legendary Assassin) (Unhooded)": [
        "images/statues/neca-ezio-legendary-unhooded.jpg",
        "images/statues/neca-ezio-legendary-unhooded_01.jpg",
    ],
    "Neca Ezio (Onyx Assassin) (Hooded)": [
        "images/statues/neca-ezio-onyx-hooded.jpg",
        "images/statues/neca-ezio-onyx-hooded_01.jpg",
    ],
    "Neca Ezio (Onyx Assassin) (Unhooded)": [
        "images/statues/neca-ezio-onyx-unhooded.jpg",
        "images/statues/neca-ezio-onyx-unhooded_01.jpg",
    ],
    "Neca Ezio Auditore (Brotherhood) (Head Knockers)": ["images/statues/neca-ezio-brotherhood-head-knockers.jpg"],
    "Neca Ezio Auditore (Revelations) (Head Knockers)": [
        "images/statues/neca-ezio-revelations-head-knockers.jpg",
        "images/statues/neca-ezio-revelations-head-knockers_01.jpg",
    ],
    "Neca Ezio Auditore (The Mentor) version 1": ["images/statues/neca-revelations-ezio-the-mentor-v1.jpg"],
    "Neca Ezio Auditore (The Mentor) version 2": [
        "images/statues/neca-revelations-ezio-the-mentor-v2.jpg",
        "images/statues/neca-revelations-ezio-the-mentor-v2_01.jpg",
        "images/statues/neca-revelations-ezio-the-mentor-v2_02.jpg",
    ],
    "Assassin's Creed Shot Glass Set": ["images/other/lootcrate-shot-glass-set.jpg"],
    "Assassin's Creed IV Black Flag Flask": ["images/other/lootcrate-black-flag-flask.jpg"],
    "Ravenforge Altaïr's Sword Replica": [
        "images/other/ravenforge-altair-sword.jpg",
        "images/other/ravenforge-altair-sword_01.jpg",
    ],
    "Ravenforge Naoe's Tantō Replica": [
        "images/other/ravenforge-naoe-tanto.jpg",
        "images/other/ravenforge-naoe-tanto_01.jpg",
    ],
    "Ravenforge Yasuke's Wakizashi Replica": [
        "images/other/ravenforge-yasuke-wakizashi.jpg",
        "images/other/ravenforge-yasuke-wakizashi_01.jpg",
    ],
    "Ravenforge Assassin's Creed Black Flag Hip Flask": [
        "images/other/ravenforge-black-flag-flask.jpg",
        "images/other/ravenforge-black-flag-flask_01.jpg",
        "images/other/ravenforge-black-flag-flask_02.jpg",
    ],
    "Ravenforge Assassin's Creed Hip Flask Gift Set": [
        "images/other/ravenforge-flask-gift-set.jpg",
        "images/other/ravenforge-flask-gift-set_01.jpg",
        "images/other/ravenforge-flask-gift-set_02.jpg",
    ],
    "Ravenforge Assassin's Creed Shadows Hip Flask": [
        "images/other/ravenforge-shadows-flask.jpg",
        "images/other/ravenforge-shadows-flask_01.jpg",
        "images/other/ravenforge-shadows-flask_02.jpg",
    ],
    "Ravenforge Assassin's Creed Odyssey Hip Flask": [
        "images/other/ravenforge-odyssey-flask.jpg",
        "images/other/ravenforge-odyssey-flask_01.jpg",
        "images/other/ravenforge-odyssey-flask_02.jpg",
    ],
    "Assassin's Creed: Into the Animus": [
        "images/art-books/into-the-animus.jpg",
        "images/art-books/into-the-animus_01.jpg",
    ],
    "Assassin's Creed: Infographics": [
        "images/art-books/ac-infographics.jpg",
        "images/art-books/ac-infographics_01.jpg",
        "images/art-books/ac-infographics_02.jpg",
        "images/art-books/ac-infographics_03.jpg",
        "images/art-books/ac-infographics_04.jpg",
    ],
    "PureArts Assassin's Creed Shadows Naoe Hidden Blade 1/1 Scale Replica": [
        "images/statues/purearts-naoe-hidden-blade.jpg",
        "images/statues/purearts-naoe-hidden-blade_01.jpg",
    ],
    "PureArts Amunet The Hidden One 1/8 Scale PVC Statue": [
        "images/statues/purearts-amunet.jpg",
        "images/statues/purearts-amunet_01.jpg",
    ],
    "PureArts Qlectors Altair Bell Tower PVC Figure": [
        "images/statues/purearts-qlectors-altair-bell-tower.jpg",
        "images/statues/purearts-qlectors-altair-bell-tower_01.jpg",
    ],
    "PureArts Desmond 1/6 Scale Premium Articulated Figure": [
        "images/statues/purearts-desmond.jpg",
        "images/statues/purearts-desmond_01.jpg",
    ],
    "PureArts Qlectors Connor The Last Breath PVC Figure": [
        "images/statues/purearts-qlectors-connor-last-breath.jpg",
        "images/statues/purearts-qlectors-connor-last-breath_01.jpg",
    ],
    "PureArts Prestige Line Ezio Auditore 1/2 Scale Statue": [
        "images/statues/purearts-prestige-ezio.jpg",
        "images/statues/purearts-prestige-ezio_01.jpg",
    ],
    "PureArts Hunt for the Nine 1/6 Scale Diorama": [
        "images/statues/purearts-hunt-for-the-nine.jpg",
        "images/statues/purearts-hunt-for-the-nine_01.jpg",
    ],
    "PureArts RIP Altair 1/6 Scale Diorama": [
        "images/statues/purearts-rip-altair.jpg",
        "images/statues/purearts-rip-altair_01.jpg",
    ],
    "PureArts Master Ezio 1/8 Scale PVC Statue": [
        "images/statues/purearts-master-ezio.jpg",
        "images/statues/purearts-master-ezio_01.jpg",
    ],
    "PureArts Orlog Dice Game Retail Edition": [
        "images/other/purearts-orlog-retail.jpg",
        "images/other/purearts-orlog-retail_01.jpg",
    ],
    "PureArts Orlog Dice Game Deluxe Edition": [
        "images/other/purearts-orlog-deluxe.jpg",
        "images/other/purearts-orlog-deluxe_01.jpg",
    ],
    "Assassin's Creed: Vendetta": [
        "images/other/ac-vendetta.jpg",
        "images/other/ac-vendetta_01.jpg",
        "images/other/ac-vendetta_02.jpg",
    ],
    "Assassin's Creed Unity Collectible Coin": [
        "images/other/lootcrate-unity-coin.jpg",
        "images/other/lootcrate-unity-coin_01.jpg",
    ],
    "Assassin's Creed Odyssey Promo Coin (Best Buy Exclusive)": ["images/other/odyssey-promo-coin.jpg"],
    "Assassin's Creed (Movie) Exclusive Limited Edition + Hidden Dagger Arm Sleeve": ["images/collectors-editions/ac-movie-limited-edition-arm-sleeve.jpg"],

    // ── Unimax ──
    "Unimax - Cesare Borgia (Gamestars Collectibles)": ["images/statues/unimax-cesare-borgia-gamestars-collectibles.jpg"],
    "Unimax - Ezio Auditore da Firenze (Gamestars Collectibles)": ["images/statues/unimax-ezio-auditore-da-firenze-gamestars-collectibles.jpg"],
    "Unimax - Leonardo da Vinci (Gamestars Collectibles)": ["images/statues/unimax-leonardo-da-vinci-gamestars-collectibles.jpg"],
    "Unimax - Niccolo Machiavelli (Gamestars Collectibles)": ["images/statues/unimax-niccolo-machiavelli-gamestars-collectibles.jpg"],
    "Unimax - The Doctor (Gamestars Collectibles)": ["images/statues/unimax-the-doctor-gamestars-collectibles.jpg"],
    "Unimax - The Harlequin (Gamestars Collectibles)": ["images/statues/unimax-the-harlequin-gamestars-collectibles.jpg"],

};

// Apply images to database — only if the file actually exists (image onload handles missing files gracefully)
(function applyImages() {
    if (typeof AC_DATABASE === 'undefined') return;
    AC_DATABASE.forEach(item => {
        if (AC_IMAGES[item.name]) {
            item.image = AC_IMAGES[item.name];
        }
    });
})();
