// Image mapping for AC Database items — all images stored locally in /images/
// Each value is an array: base image followed by any gallery siblings (_01, _02, ...).
// Gallery arrays are maintained by tools/build-images.py — drop new _NN.jpg files
// next to the base and run `python tools/build-images.py` to refresh. For a brand
// new item, add the "Item Name": ["images/folder/foo.webp"] line here by hand first.
const AC_IMAGES = {
    // ── Collector's Editions ──
    "Assassin's Creed Limited Edition": [
        "images/collectors-editions/ac1-limited-edition.webp",
        "images/collectors-editions/ac1-limited-edition_01.webp",
        "images/collectors-editions/ac1-limited-edition_02.webp",
    ],
    "Assassin's Creed Limited Edition Statue": [
        "images/collectors-editions/ac1-limited-edition_statue.webp",
        "images/collectors-editions/ac1-limited-edition_statue_01.webp",
    ],
    "Assassin's Creed II Black Edition": [
        "images/collectors-editions/ac2-black-edition.webp",
        "images/collectors-editions/ac2-black-edition_01.webp",
    ],
    "Assassin's Creed II White Edition": [
        "images/collectors-editions/ac2-white-edition.webp",
        "images/collectors-editions/ac2-white-edition_01.webp",
    ],
    "Assassin's Creed II Master Assassin's Edition": ["images/collectors-editions/ac2-master-assassins-edition.webp"],
    "Assassin's Creed Brotherhood Collector's Edition (Russian Exclusive)": [
        "images/collectors-editions/brotherhood-collectors-edition.webp",
        "images/collectors-editions/brotherhood-collectors-edition_01.webp",
    ],
    "Assassin's Creed Brotherhood Collector's Edition (Doctor Variant)": ["images/collectors-editions/brotherhood-collectors-edition-doctor.webp"],
    "Assassin's Creed Brotherhood Codex Edition": ["images/collectors-editions/brotherhood-codex-edition.webp"],
    "Assassin's Creed Revelations Collector's Edition": ["images/collectors-editions/revelations-collectors-edition.webp"],
    "Assassin's Creed Revelations Animus Edition": [
        "images/collectors-editions/revelations-animus-edition.webp",
        "images/collectors-editions/revelations-animus-edition_01.webp",
    ],
    "Assassin's Creed Revelations Templar Collector Edition": ["images/collectors-editions/revelations-templar-edition.webp"],
    "Assassin's Creed Revelations Signature Edition": ["images/collectors-editions/revelations-signature-edition.webp"],
    "Assassin's Creed III Freedom Edition": ["images/collectors-editions/ac3-freedom-edition.webp"],
    "Assassin's Creed III Join or Die Edition": ["images/collectors-editions/ac3-join-or-die-edition.webp"],
    "Assassin's Creed III Limited Edition": ["images/collectors-editions/ac3-limited-edition.webp"],
    "Assassin's Creed IV: Black Flag Black Chest Edition": ["images/collectors-editions/ac4-black-chest-edition.webp"],
    "Assassin's Creed IV: Black Flag Buccaneer Edition": ["images/collectors-editions/ac4-buccaneer-edition.webp"],
    "Assassin's Creed IV: Black Flag Skull Edition": ["images/collectors-editions/ac4-skull-edition.webp"],
    "Assassin's Creed IV: Black Flag Limited Edition": ["images/collectors-editions/ac4-limited-edition.webp"],
    "Assassin's Creed Rogue Collector's Edition": [
        "images/collectors-editions/rogue-collectors-edition.webp",
        "images/collectors-editions/rogue-collectors-edition_01.webp",
    ],
    "Assassin's Creed Unity Guillotine Collector's Case": ["images/collectors-editions/unity-guillotine-collectors-case.webp"],
    "Assassin's Creed Unity Notre Dame Edition": ["images/collectors-editions/unity-notre-dame-edition.webp"],
    "Assassin's Creed Unity Collector's Edition": ["images/collectors-editions/unity-collectors-edition.webp"],
    "Assassin's Creed Unity Bastille Edition": ["images/collectors-editions/unity-bastille-edition.webp"],
    "Assassin's Creed Syndicate Big Ben Collector's Case": ["images/collectors-editions/syndicate-big-ben-collectors-case.webp"],
    "Assassin's Creed Syndicate Charing Cross Edition": [
        "images/collectors-editions/syndicate-charing-cross-edition.webp",
        "images/collectors-editions/syndicate-charing-cross-edition_01.webp",
    ],
    "Assassin's Creed Syndicate The Rooks Edition": ["images/collectors-editions/syndicate-rooks-edition.webp"],
    "Assassin's Creed Origins Deluxe Edition": [
        "images/collectors-editions/origins-deluxe-edition.webp",
        "images/collectors-editions/origins-deluxe-edition_01.webp",
        "images/collectors-editions/origins-deluxe-edition_02.webp",
    ],
    "Assassin's Creed Origins Gods Edition": [
        "images/collectors-editions/origins-gods-edition.webp",
        "images/collectors-editions/origins-gods-edition_01.webp",
    ],
    "Assassin's Creed Origins Dawn of the Creed Legendary Edition": [
        "images/collectors-editions/origins-dawn-of-the-creed-legendary-edition.webp",
        "images/collectors-editions/origins-dawn-of-the-creed-legendary-edition_01.webp",
        "images/collectors-editions/origins-dawn-of-the-creed-legendary-edition_02.webp",
        "images/collectors-editions/origins-dawn-of-the-creed-legendary-edition_03.webp",
    ],
    "Assassin's Creed Odyssey Pantheon Edition": ["images/collectors-editions/odyssey-pantheon-edition.webp"],
    "Assassin's Creed Odyssey Spartan Edition": ["images/collectors-editions/odyssey-spartan-edition.webp"],
    "Assassin's Creed Odyssey Medusa Edition": ["images/collectors-editions/odyssey-medusa-edition.webp"],
    "Assassin's Creed Valhalla Collector's Edition": ["images/collectors-editions/valhalla-collectors-edition.webp"],
    "Assassin's Creed Mirage Collector's Case": ["images/collectors-editions/mirage-collectors-case.webp"],
    "Assassin's Creed Shadows Collector's Edition": ["images/collectors-editions/shadows-collectors-edition.webp"],
    "Assassin's Creed Origins: Dawn of the Creed Collector's Case": [
        "images/collectors-editions/origins-dawn-of-the-creed-collectors-case.webp",
        "images/collectors-editions/origins-dawn-of-the-creed-collectors-case_01.webp",
    ],
    "Assassin's Creed Black Flag Resynced Collectors Edition": [
        "images/collectors-editions/ac-black-flag-resynced-ce.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_01.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_02.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_03.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_04.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_05.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_06.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_07.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_08.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_09.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_10.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_11.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_12.webp",
        "images/collectors-editions/ac-black-flag-resynced-ce_13.webp",
    ],
    "Assassin's Creed IV Black: Flag Resynced Flagship Edition": [
        "images/collectors-editions/ac-black-flag-resynced-flagship.webp",
        "images/collectors-editions/ac-black-flag-resynced-flagship_01.webp",
    ],

    // ── Steelbooks ──
    "Assassin's Creed Steelcase Limited Edition": [
        "images/steelbooks/ac1-steelcase.webp",
        "images/steelbooks/ac1-steelcase_01.webp",
        "images/steelbooks/ac1-steelcase_02.webp",
    ],
    "Assassin's Creed III Steelbook Edition": ["images/steelbooks/ac3-steelbook-edition.webp"],
    "Assassin's Creed III Future Shop Steelbook Edition": ["images/steelbooks/ac3-future-shop-steelbook-edition.webp"],
    "Assassin's Creed Origins Gold SteelBook Edition": ["images/steelbooks/origins-gold-steelbook.webp"],
    "Assassin's Creed Valhalla Gold Steelbook Edition": ["images/steelbooks/valhalla-gold-steelbook.webp"],
    "Assassin's Creed Valhalla Ultimate Steelbook Edition": ["images/steelbooks/valhalla-ultimate-steelbook.webp"],
    "Assassin's Creed (2016 Movie) SteelBook Edition": ["images/steelbooks/ac-movie-steelbook.webp"],
    "Assassin's Creed Black Flag Resynced Steelbook": ["images/steelbooks/ac-bf-recynced-steelbook.webp"],

    // ── PureArts Statues and replicas ──
    "PureArts Animus Altair 1/4 Scale Statue": ["images/statues/purearts-animus-altair-1-4.webp"],
    "PureArts Prestige Line Altair Ibn-La'Ahad 1/2 Scale Statue": ["images/statues/purearts-prestige-altair-1-2.webp"],
    "PureArts Animus Ezio 1/4 Scale Statue": ["images/statues/purearts-animus-ezio-1-4.webp"],
    "PureArts Animus Connor 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-connor-1-4.webp"],
    "PureArts Animus Edward Kenway 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-edward-1-4.webp"],
    "PureArts Animus Arno 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-arno-1-4.webp"],
    "PureArts Animus Jacob & Evie 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-jacob-evie-1-4.webp"],
    "PureArts Animus Basim 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-basim-1-4.webp"],
    "PureArts Animus Naoe & Yasuke 1/4 Scale Statue (Exclusive Edition)": ["images/statues/purearts-animus-naoe-yasuke-1-4.webp"],
    "PureArts Animus Ezio 1/8 Scale Statue": ["images/statues/purearts-animus-ezio-1-8.webp"],
    "PureArts Animus Altair 1/8 Scale Statue": ["images/statues/purearts-animus-altair-1-8.webp"],
    "PureArts Animus Connor 1/8 Scale Statue": ["images/statues/purearts-animus-connor-1-8.webp"],
    "PureArts Animus Bayek 1/8 Scale Statue": ["images/statues/purearts-animus-bayek-1-8.webp"],
    "PureArts Animus Kassandra 1/8 Scale Statue": ["images/statues/purearts-animus-kassandra-1-8.webp"],
    "PureArts Animus Eivor 1/8 Scale Statue": ["images/statues/purearts-animus-eivor-1-8.webp"],
    "PureArts Animus Basim 1/8 Scale Statue": ["images/statues/purearts-animus-basim-1-8.webp"],
    "PureArts Animus Yasuke 1/8 Scale Statue": ["images/statues/purearts-animus-yasuke-1-8.webp"],
    "PureArts Animus Naoe 1/8 Scale Statue": ["images/statues/purearts-animus-naoe-1-8.webp"],
    "Assassin's Creed Shadows Yasuke Helmet 1/1 Scale Replica": [
        "images/other/purearts-yasuke-helmet-replica.webp",
        "images/other/purearts-yasuke-helmet-replica_01.webp",
    ],
    "Assassin's Creed Animus Kassandra Exclusive Edition": [
        "images/statues/purearts-animus-kassandra-ee.webp",
        "images/statues/purearts-animus-kassandra-ee_01.webp",
        "images/statues/purearts-animus-kassandra-ee_02.webp",
    ],
    "Assassin's Creed: Valhalla Eivor 1/6 Scale Articulated Figure": [
        "images/statues/purearts-eivor-articulated.webp",
        "images/statues/purearts-eivor-articulated_01.webp",
        "images/statues/purearts-eivor-articulated_02.webp",
    ],
    // ── PureArts Other ──
    "PureArts Animus Eivor Statue": ["images/statues/purearts-animus-eivor-1-4.webp"],
    "PureArts Spartan Kick Diorama 1/6 Scale (Exclusive Edition)": ["images/statues/purearts-spartan-kick-diorama.webp"],
    "PureArts Naoe Bust 1/4 Scale": [
        "images/statues/purearts-naoe-bust-1-4.webp",
        "images/statues/purearts-naoe-bust-1-4_01.webp",
    ],
    "PureArts Yasuke Bust 1/4 Scale": [
        "images/statues/purearts-yasuke-bust-1-4.webp",
        "images/statues/purearts-yasuke-bust-1-4_01.webp",
    ],
    "PureArts Qlectors Naoe & Yasuke PVC Figure Set": ["images/statues/purearts-qlectors-naoe-yasuke.webp"],
    "PureArts Qlectors Ezio Leap of Faith PVC Figure": ["images/statues/purearts-qlectors-ezio-leap-of-faith.webp"],
    "PureArts Assassin's Creed Shadows Shogi Board Game": ["images/other/purearts-shadows-shogi-board.webp"],
    "PureArts Assassin's Creed Valhalla Life-Size Hidden Blade Prop": ["images/other/valhalla-hidden-blade-replica.webp"],
    "PureArts Assassin's Creed Valhalla Bundle (Eivor Statue, Hidden Blade & Dice Game)": ["images/other/valhalla-bundle-eivor-blade-dice.webp"],
    "PureArts Qlectors Assassin's Creed Black Flag Edward Kenway PVC Figure": [
        "images/statues/purearts-qlectors-adward-resynced.webp",
        "images/statues/purearts-qlectors-adward-resynced_01.webp",
    ],

    // ── Ubicollectibles Figurines ──
    "Ubicollectibles Ezio Leap of Faith Figurine": ["images/statues/ubicollectibles-ezio-leap-of-faith.webp"],
    "Ubicollectibles Ezio's Fury Statue (Brotherhood)": ["images/statues/ubicollectibles-ezios-fury-brotherhood.webp"],
    "Ubicollectibles Legacy Collection - Altair Bust": ["images/statues/ubicollectibles-legacy-altair-bust.webp"],
    "Ubicollectibles Legacy Collection - Ezio Bust": ["images/statues/ubicollectibles-legacy-ezio-bust.webp"],
    "Ubicollectibles Legacy Collection - Connor Bust": ["images/statues/ubicollectibles-legacy-connor-bust.webp"],
    "Ubicollectibles Legacy Collection - Edward Kenway Bust": ["images/statues/ubicollectibles-legacy-edward-bust.webp"],
    "Ubicollectibles Legacy Collection - Aveline Bust": ["images/statues/ubicollectibles-legacy-aveline-bust.webp"],
    "Ubicollectibles Aveline de Grandpre PVC Statue": ["images/statues/ubicollectibles-aveline-pvc-statue.webp"],
    "Ubicollectibles Altair Apple of Eden Keeper Figurine": ["images/statues/ubicollectibles-altair-apple-of-eden.webp"],
    "Ubicollectibles Jacob Frye 'The Impetuous Brother' Statue": [
        "images/statues/ubicollectibles-jacob-frye.webp",
        "images/statues/ubicollectibles-jacob-frye_01.webp",
    ],
    "Ubicollectibles Evie Frye 'The Intrepid Sister' Statue": [
        "images/statues/ubicollectibles-evie-frye.webp",
        "images/statues/ubicollectibles-evie-frye_01.webp",
    ],
    "Ubicollectibles Jacob & Evie 'The Wise and Wild Twins' Diorama": ["images/statues/ubicollectibles-jacob-evie-diorama.webp"],
    "Ubicollectibles Bayek Statue": [
        "images/statues/ubicollectibles-bayek.webp",
        "images/statues/ubicollectibles-bayek_01.webp",
    ],
    "Ubicollectibles Aya Statue": [
        "images/statues/ubicollectibles-aya.webp",
        "images/statues/ubicollectibles-aya_01.webp",
    ],
    "Ubicollectibles Alexios Statue": [
        "images/statues/ubicollectibles-alexios.webp",
        "images/statues/ubicollectibles-alexios_01.webp",
    ],
    "Ubicollectibles Kassandra Statue": [
        "images/statues/ubicollectibles-kassandra.webp",
        "images/statues/ubicollectibles-kassandra_01.webp",
    ],
    "Alexios Legendary Statue": [
        "images/statues/alexios-legendary-figurine.webp",
        "images/statues/alexios-legendary-figurine_01.webp",
    ],
    "Ubicollectibles Aguilar Statue (24cm)": [
        "images/statues/ubicollectibles-aguilar-24cm.webp",
        "images/statues/ubicollectibles-aguilar-24cm_01.webp",
    ],
    "Ubicollectibles Maria Statue (24cm)": [
        "images/statues/ubicollectibles-maria.webp",
        "images/statues/ubicollectibles-maria_01.webp",
    ],
    "Triforce Aguilar Collector's Edition Statue (35cm)": [
        "images/statues/triforce-aguilar-35cm.webp",
        "images/statues/triforce-aguilar-35cm_01.webp",
    ],
    "Ubicollectibles Altair The Legendary Assassin": [
        "images/statues/ubicollectibles-altair-the-legendary-assassin.webp",
        "images/statues/ubicollectibles-altair-the-legendary-assassin_01.webp",
    ],
    "Ubicollectibles Assassin's Creed Rogue: The Renegade": [
        "images/statues/ubicollectibles-rogue-the-renegade.webp",
        "images/statues/ubicollectibles-rogue-the-renegade_01.webp",
    ],
    "Ubicollectibles Assassin's Creed Origins: Trial of the Gods Figurine": [
        "images/statues/ubicollectibles-origins-trial-of-the-gods.webp",
        "images/statues/ubicollectibles-origins-trial-of-the-gods_01.webp",
        "images/statues/ubicollectibles-origins-trial-of-the-gods_02.webp",
    ],
    "Connor - The Last Breath Premium Statue": ["images/statues/purearts-connor-last-breath.webp"],
    "Connor - The Last Breath Premium Statue (Bronze Edition)": ["images/statues/purearts-connor-last-breath-bronze.webp"],
    "Altair Crouched Figure": [
        "images/statues/altair-crouched.webp",
        "images/statues/altair-crouched_01.webp",
    ],
    "Edward Kenway Limited Developer's Bust": [
        "images/statues/edward-kenway-developer-bust.webp",
        "images/statues/edward-kenway-developer-bust_01.webp",
    ],
    "Assassin's Creed Revelations Ezio Limited Developer's Bust": [
        "images/statues/ezio-revelations-developer-bust.webp",
        "images/statues/ezio-revelations-developer-bust_01.webp",
    ],

    // ── Replicas / Props ──
    "Ubicollectibles Apple of Eden Replica (Movie)": [
        "images/other/apple-of-eden-replica-movie.webp",
        "images/other/apple-of-eden-replica-movie_01.webp",
    ],
    "Ubicollectibles Apple of Eden Collector Chest (Movie)": [
        "images/other/apple-of-eden-collector-chest-movie.webp",
        "images/other/apple-of-eden-collector-chest-movie_01.webp",
    ],
    "Ubicollectibles Hidden Blade Replica (Movie)": [
        "images/other/hidden-blade-replica-movie.webp",
        "images/other/hidden-blade-replica-movie_01.webp",
    ],
    "Ubicollectibles Apple of Eden Replica (Origins)": [
        "images/other/apple-of-eden-replica-origins.webp",
        "images/other/apple-of-eden-replica-origins_01.webp",
    ],
    "Ubicollectibles The First Hidden Blade Replica (Origins)": [
        "images/other/first-hidden-blade-replica-origins.webp",
        "images/other/first-hidden-blade-replica-origins_01.webp",
    ],
    "Ubicollectibles Broken Spear of Leonidas Replica": [
        "images/other/broken-spear-of-leonidas-replica.webp",
        "images/other/broken-spear-of-leonidas-replica_01.webp",
    ],
    "McFarlane Toys Hidden Blade & Gauntlet with Skull Buckle (Black Flag)": [
        "images/other/mcfarlane-hidden-blade-black-flag.webp",
        "images/other/mcfarlane-hidden-blade-black-flag_01.webp",
    ],
    "McFarlane Toys Gauntlet with Hidden Blade (Syndicate)": [
        "images/other/mcfarlane-hidden-blade-syndicate.webp",
        "images/other/mcfarlane-hidden-blade-syndicate_01.webp",
    ],
    "McFarlane Toys Aguilar's Hidden Blade (Movie)": ["images/other/mcfarlane-hidden-blade-movie.webp"],
    "Assassins Creed Syndicate Official Press Promo Power Bank Cane Handle": [
        "images/other/syndicate-cane-handle-power-bank.webp",
        "images/other/syndicate-cane-handle-power-bank_01.webp",
    ],
    "Landstalker Props Flintlock Pistol (Edward Kenway)": ["images/other/landstalker-flintlock-pistol.webp"],
    "Connor Tomahawk Developer Kit": [
        "images/other/connor-tomahawk-developer-kit.webp",
        "images/other/connor-tomahawk-developer-kit_01.webp",
    ],

    // ── McFarlane Action Figures ──
    "McFarlane Toys Altair Action Figure (Series 3)": [
        "images/statues/mcfarlane-altair.webp",
        "images/statues/mcfarlane-altair_01.webp",
        "images/statues/mcfarlane-altair_02.webp",
    ],
    "McFarlane Toys Ezio Action Figure (Series 3)": [
        "images/statues/mcfarlane-ezio.webp",
        "images/statues/mcfarlane-ezio_01.webp",
    ],
    "McFarlane Toys Connor Action Figure (Series 1)": [
        "images/statues/mcfarlane-connor.webp",
        "images/statues/mcfarlane-connor_01.webp",
    ],
    "McFarlane Toys Edward Kenway Action Figure (Series 1)": [
        "images/statues/mcfarlane-edward.webp",
        "images/statues/mcfarlane-edward_01.webp",
    ],
    "McFarlane Toys Aveline de Grandpre Action Figure (Series 2)": [
        "images/statues/mcfarlane-aveline.webp",
        "images/statues/mcfarlane-aveline_01.webp",
    ],
    "McFarlane Toys Aguilar Action Figure (Movie Series)": [
        "images/statues/mcfarlane-aguilar.webp",
        "images/statues/mcfarlane-aguilar_01.webp",
    ],
    "McFarlane Toys Shay Cormac Figure (Series 4)": [
        "images/statues/mcfarlane-shay.webp",
        "images/statues/mcfarlane-shay_01.webp",
    ],
    "McFarlane Toys Haytham Kenway Action Figure (Series 1)": [
        "images/statues/mcfarlane-haytham.webp",
        "images/statues/mcfarlane-haytham_01.webp",
    ],
    "McFarlane Toys Ratonhnhake:ton Action Figure (Series 1)": [
        "images/statues/mcfarlane-ratonhnhaketon.webp",
        "images/statues/mcfarlane-ratonhnhaketon_01.webp",
    ],
    "McFarlane Toys Benjamin Hornigold Action Figure (Series 1)": [
        "images/statues/mcfarlane-hornigold.webp",
        "images/statues/mcfarlane-hornigold_01.webp",
        "images/statues/mcfarlane-hornigold_02.webp",
    ],
    "McFarlane Toys Blackbeard Action Figure (Series 1)": [
        "images/statues/mcfarlane-blackbeard.webp",
        "images/statues/mcfarlane-blackbeard_01.webp",
    ],
    "McFarlane Toys Black Bart Action Figure (Series 1)": [
        "images/statues/mcfarlane-black-bart.webp",
        "images/statues/mcfarlane-black-bart_01.webp",
    ],
    "McFarlane Toys Adewale Action Figure (Series 2)": [
        "images/statues/mcfarlane-adewale.webp",
        "images/statues/mcfarlane-adewale_01.webp",
    ],
    "McFarlane Toys Arno Dorian Action Figure (Series 3)": [
        "images/statues/mcfarlane-arno.webp",
        "images/statues/mcfarlane-arno_01.webp",
    ],
    "McFarlane Toys Ah Tabai Action Figure (Series 3)": [
        "images/statues/mcfarlane-ah-tabai.webp",
        "images/statues/mcfarlane-ah-tabai_01.webp",
    ],
    "McFarlane Toys Edward Kenway Mayan Outfit Action Figure (Series 3)": [
        "images/statues/mcfarlane-edward-mayan.webp",
        "images/statues/mcfarlane-edward-mayan_01.webp",
    ],
    "McFarlane Toys Connor with Mohawk Action Figure (Series 3)": [
        "images/statues/mcfarlane-connor-mohawk.webp",
        "images/statues/mcfarlane-connor-mohawk_01.webp",
    ],
    "McFarlane Toys Arno Dorian Master Assassin Outfit Action Figure (Series 4)": [
        "images/statues/mcfarlane-arno-master-assassin.webp",
        "images/statues/mcfarlane-arno-master-assassin_01.webp",
    ],
    "McFarlane Toys Eagle Vision Arno Dorian Action Figure (Series 4)": [
        "images/statues/mcfarlane-arno-eagle-vision.webp",
        "images/statues/mcfarlane-arno-eagle-vision_01.webp",
    ],
    "McFarlane Toys Cane Sword Replica (Syndicate)": [
        "images/other/mcfarlane-cane-sword.webp",
        "images/other/mcfarlane-cane-sword_01.webp",
    ],
    "McFarlane Toys Jacob Frye Action Figure (Series 4)": [
        "images/statues/mcfarlane-jacob-frye.webp",
        "images/statues/mcfarlane-jacob-frye_01.webp",
    ],
    "McFarlane Toys Union Jacob Frye Action Figure (Series 5)": [
        "images/statues/mcfarlane-union-jacob.webp",
        "images/statues/mcfarlane-union-jacob_01.webp",
        "images/statues/mcfarlane-union-jacob_02.webp",
    ],
    "McFarlane Toys Il Tricolore Ezio Auditore Action Figure (Series 5)": [
        "images/statues/mcfarlane-il-tricolore-ezio.webp",
        "images/statues/mcfarlane-il-tricolore-ezio_01.webp",
    ],
    "McFarlane Toys Revolutionary Connor Action Figure (Series 5)": [
        "images/statues/mcfarlane-revolutionary-connor.webp",
        "images/statues/mcfarlane-revolutionary-connor_01.webp",
    ],
    "McFarlane Toys Connor Color Tops Collector Edition": [
        "images/statues/mcfarlane-connor-color-tops.webp",
        "images/statues/mcfarlane-connor-color-tops_01.webp",
    ],
    "McFarlane Toys Phantom Blade Replica (Unity)": ["images/other/mcfarlane-phantom-blade.webp"],

    // ── Art Books ──
    "Assassin's Creed Pre-Order Art Book": [
        "images/art-books/ac1-pre-order-art-book.webp",
        "images/art-books/ac1-pre-order-art-book_01.webp",
        "images/art-books/ac1-pre-order-art-book_02.webp",
    ],
    "Assassin's Creed Encyclopedia (First Edition)": ["images/art-books/encyclopedia-first-edition.webp"],
    "Assassin's Creed Encyclopedia (Second Edition)": ["images/art-books/encyclopedia-second-edition.webp"],
    "Assassin's Creed Encyclopedia (Third Edition / Black Edition)": ["images/art-books/encyclopedia-third-edition.webp"],
    "Assassin's Creed Encyclopedia (E3 Collector Edition)": ["images/art-books/encyclopedia-e3-collector-edition.webp"],
    "Assassin's Creed: The Complete Visual History": [
        "images/art-books/complete-visual-history.webp",
        "images/art-books/complete-visual-history_01.webp",
    ],
    "Assassin's Creed IV Black Flag: Blackbeard - The Lost Journal": [
        "images/art-books/blackbeard-lost-journal.webp",
        "images/art-books/blackbeard-lost-journal_01.webp",
        "images/art-books/blackbeard-lost-journal_02.webp",
        "images/art-books/blackbeard-lost-journal_03.webp",
    ],
    "Assassin's Creed Unity: Abstergo Entertainment Employee Handbook": [
        "images/art-books/abstergo-employee-handbook.webp",
        "images/art-books/abstergo-employee-handbook_01.webp",
        "images/art-books/abstergo-employee-handbook_02.webp",
    ],
    "Assassin's Creed: Prima Official Game Guide": ["images/art-books/guide-ac1.webp"],
    "Assassin's Creed II: The Complete Official Guide": ["images/art-books/guide-ac2.webp"],
    "Assassin's Creed II: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-ac2-ce.webp"],
    "Assassin's Creed Brotherhood: The Complete Official Guide": ["images/art-books/guide-brotherhood.webp"],
    "Assassin's Creed Brotherhood: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-brotherhood-ce.webp"],
    "Assassin's Creed Revelations: The Complete Official Guide": ["images/art-books/guide-revelations.webp"],
    "Assassin's Creed Revelations: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-revelations-ce.webp"],
    "Assassin's Creed III: The Complete Official Guide": ["images/art-books/guide-ac3.webp"],
    "Assassin's Creed III: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-ac3-ce.webp"],
    "Assassin's Creed IV Black Flag: The Complete Official Guide": ["images/art-books/guide-ac4.webp"],
    "Assassin's Creed IV Black Flag: The Complete Official Guide - Collector's Edition": [
        "images/art-books/guide-ac4-ce.webp",
        "images/art-books/guide-ac4-ce_01.webp",
    ],
    "Assassin's Creed Unity: The Complete Official Guide": ["images/art-books/guide-unity.webp"],
    "Assassin's Creed Unity: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-unity-ce.webp"],
    "Assassin's Creed Syndicate: Official Strategy Guide": ["images/art-books/guide-syndicate.webp"],
    "Assassin's Creed Syndicate: Official Collector's Edition Guide": ["images/art-books/guide-syndicate-ce.webp"],
    "Assassin's Creed Origins: Official Guide": ["images/art-books/guide-origins.webp"],
    "Assassin's Creed Origins: Official Collector's Edition Guide": ["images/art-books/guide-origins-ce.webp"],
    "Assassin's Creed Odyssey: Official Collector's Edition Guide": ["images/art-books/guide-odyssey-ce.webp"],
    "Assassin's Creed Odyssey: Official Platinum Edition Guide": [
        "images/art-books/guide-odyssey-pe.webp",
        "images/art-books/guide-odyssey-pe_01.webp",
    ],
    "Assassin's Creed Shadows: The Complete Official Guide": ["images/art-books/guide-shadows.webp"],
    "Assassin's Creed Shadows: The Complete Official Guide - Collector's Edition": ["images/art-books/guide-shadows-ce.webp"],
    "Assassin's Creed: The Culinary Codex": [
        "images/art-books/culinary-codex.webp",
        "images/art-books/culinary-codex_01.webp",
    ],
    "Assassin's Creed Limited Edition Art Book (Prima Games)": ["images/art-books/ac1-art-book-prima-games.webp"],
    "The Art of Assassin's Creed III": [
        "images/art-books/art-of-ac3.webp",
        "images/art-books/art-of-ac3_01.webp",
    ],
    "The Art of Assassin's Creed IV: Black Flag": [
        "images/art-books/art-of-ac4-black-flag.webp",
        "images/art-books/art-of-ac4-black-flag_01.webp",
        "images/art-books/art-of-ac4-black-flag_02.webp",
    ],
    "The Art of Assassin's Creed Unity": ["images/art-books/art-of-ac-unity.webp"],
    "The Art of Assassin's Creed Unity (Limited Edition)": [
        "images/art-books/art-of-ac-unity-le.webp",
        "images/art-books/art-of-ac-unity-le_01.webp",
        "images/art-books/art-of-ac-unity-le_02.webp",
        "images/art-books/art-of-ac-unity-le_03.webp",
        "images/art-books/art-of-ac-unity-le_04.webp",
    ],
    "The Art of Assassin's Creed Syndicate": ["images/art-books/art-of-ac-syndicate.webp"],
    "The Art of Assassin's Creed Origins": [
        "images/art-books/art-of-ac-origins.webp",
        "images/art-books/art-of-ac-origins_01.webp",
    ],
    "The Art of Assassin's Creed Odyssey": ["images/art-books/art-of-ac-odyssey.webp"],
    "The Art of Assassin's Creed Valhalla": [
        "images/art-books/art-of-ac-valhalla.webp",
        "images/art-books/art-of-ac-valhalla_01.webp",
    ],
    "The Art of Assassin's Creed Valhalla (Deluxe Edition)": [
        "images/art-books/art-of-ac-valhalla-de.webp",
        "images/art-books/art-of-ac-valhalla-de_01.webp",
        "images/art-books/art-of-ac-valhalla-de_02.webp",
    ],
    "The World of Assassin's Creed Valhalla: Journey to the North - Logs and Files of a Hidden One": [
        "images/art-books/world-of-ac-valhalla-journey-north.webp",
        "images/art-books/world-of-ac-valhalla-journey-north_01.webp",
        "images/art-books/world-of-ac-valhalla-journey-north_02.webp",
    ],
    "The World of Assassin's Creed Valhalla: Journey to the North - Logs and Files of a Hidden One (Deluxe Edition)": [
        "images/art-books/world-of-ac-valhalla-journey-north-deluxe.webp",
        "images/art-books/world-of-ac-valhalla-journey-north-deluxe_01.webp",
        "images/art-books/world-of-ac-valhalla-journey-north-deluxe_02.webp",
    ],
    "The Art of Assassin's Creed Mirage": ["images/art-books/art-of-ac-mirage.webp"],
    "The Art of Assassin's Creed Mirage (Deluxe Edition)": [
        "images/art-books/art-of-ac-mirage_deluxe.webp",
        "images/art-books/art-of-ac-mirage_deluxe_01.webp",
        "images/art-books/art-of-ac-mirage_deluxe_02.webp",
    ],
    "The Art of Assassin's Creed Shadows": ["images/art-books/art-of-ac-shadows.webp"],
    "The Art of Assassin's Creed Shadows (Deluxe Edition)": ["images/art-books/art-of-ac-shadows-deluxe.webp"],
    "The Making of Assassin's Creed: 15th Anniversary": [
        "images/art-books/making-of-ac-15th-anniversary.webp",
        "images/art-books/making-of-ac-15th-anniversary_01.webp",
    ],
    "The Making of Assassin's Creed: 15th Anniversary (Deluxe Edition)": [
        "images/art-books/making-of-ac-15th-anniversary-de.webp",
        "images/art-books/making-of-ac-15th-anniversary-de_01.webp",
        "images/art-books/making-of-ac-15th-anniversary-de_02.webp",
    ],
    "The Making of Assassin's Creed: 15th Anniversary Ultimate Edition HC": [
        "images/art-books/making-of-ac-15th-anniversary-ue.webp",
        "images/art-books/making-of-ac-15th-anniversary-ue_01.webp",
        "images/art-books/making-of-ac-15th-anniversary-ue_02.webp",
        "images/art-books/making-of-ac-15th-anniversary-ue_03.webp",
    ],
    "Assassin's Creed: The Poster Collection": [
        "images/art-books/ac-poster-collection.webp",
        "images/art-books/ac-poster-collection_01.webp",
        "images/art-books/ac-poster-collection_02.webp",
        "images/art-books/ac-poster-collection_03.webp",
    ],
    "Assassin's Creed: 2500 ans d'Histoire": [
        "images/art-books/ac-2500-ans-dhistoire.webp",
        "images/art-books/ac-2500-ans-dhistoire_01.webp",
    ],
    "Assassin's Creed: Atlas": [
        "images/art-books/ac-atlas.webp",
        "images/art-books/ac-atlas_01.webp",
        "images/art-books/ac-atlas_02.webp",
    ],
    "Assassin's Creed: Where's the Assassin?": [
        "images/art-books/ac-wheres-the-assassin.webp",
        "images/art-books/ac-wheres-the-assassin_01.webp",
    ],

    // ── Funko Pop ──
    "Funko Pop! Games #20 - Altair": ["images/funko-pop/funko-pop-20-altair.webp"],
    "Funko Pop Assassin's Creed Game Cover #901 Altair": [
        "images/funko-pop/funko-pop-901-altair-cover.webp",
        "images/funko-pop/funko-pop-901-altair-cover_01.webp",
    ],
    "Funko Pop! Games #21 - Ezio (Standard White)": ["images/funko-pop/funko-pop-21-ezio-white.webp"],
    "Funko Pop! Games #21 - Ezio (Eagle Vision Blue) (GameStop Exclusive)": ["images/funko-pop/funko-pop-21-ezio-eagle-vision-blue.webp"],
    "Funko Pop! Games #21 - Ezio (Black)": ["images/funko-pop/funko-pop-21-ezio-black.webp"],
    "Funko Pop! Games #22 - Connor": ["images/funko-pop/funko-pop-22-connor.webp"],
    "Funko Pop! Games #23 - Edward": ["images/funko-pop/funko-pop-23-edward.webp"],
    "Funko Pop! Games #24 - Plague Doctor (Multiplayer)": ["images/funko-pop/funko-pop-24-plague-doctor.webp"],
    "Funko Pop! Games #28 - Aveline de Grandpre": ["images/funko-pop/funko-pop-28-aveline.webp"],
    "Funko Pop! Games #35 - Arno": ["images/funko-pop/funko-pop-35-arno.webp"],
    "Funko Pop! Games #36 - Elise": ["images/funko-pop/funko-pop-36-elise.webp"],
    "Funko Pop! Games #73 - Jacob Frye": ["images/funko-pop/funko-pop-73-jacob-frye.webp"],
    "Funko Pop! Games #74 - Evie Frye": ["images/funko-pop/funko-pop-74-evie-frye.webp"],
    "Funko Pop! Games #80 - Jacob Frye (Uncloaked) (Underground Toys Exclusive)": ["images/funko-pop/funko-pop-80-jacob-frye-uncloaked.webp"],
    "Funko Pop! Games #776 - Eivor": ["images/funko-pop/funko-pop-776-eivor.webp"],
    "Funko Pop! Games #778 - Eivor with Double Axe (GameStop Exclusive)": ["images/funko-pop/funko-pop-778-eivor-double-axe.webp"],
    "Funko Pop! Movies #375 - Aguilar": ["images/funko-pop/funko-pop-375-aguilar.webp"],
    "Funko Pop! Movies #376 - Maria": ["images/funko-pop/funko-pop-376-maria.webp"],
    "Funko Pop! Movies #377 - Ojeda": ["images/funko-pop/funko-pop-377-ojeda.webp"],
    "Funko Pop! Movies #378 - Callum Lynch": ["images/funko-pop/funko-pop-378-callum-lynch.webp"],
    "Funko Pop! Movies #379 - Aguilar (Crouching) (Loot Crate Exclusive)": ["images/funko-pop/funko-pop-379-aguilar-crouching.webp"],
    "Funko Pop! Altair #080 (Dorbz)": ["images/funko-pop/funko-altair-080-dorbz.webp"],
    "Funko Pop! Arno #081 (Dorbz)": ["images/funko-pop/funko-arno-081-dorbz.webp"],
    "Funko Pop! Elise #082 (Dorbz)": ["images/funko-pop/funko-elise-082-dorbz.webp"],
    "Funko Pop! Edward #083 (Dorbz)": ["images/funko-pop/funko-edward-083-dorbz.webp"],
    "Funko Pop! Ezio #084 (Dorbz)": ["images/funko-pop/funko-ezio-084-dorbz.webp"],
    "Funko Pop! Jacob #085 (Dorbz)": ["images/funko-pop/funko-jacob-085-dorbz.webp"],

    // ── Jewelry ──
    "Ubi Workshop Master Assassin Ring": [
        "images/other/ubi-workshop-master-assassin-ring.webp",
        "images/other/ubi-workshop-master-assassin-ring_01.webp",
    ],
    "Ubi Workshop Templar Ring": ["images/other/ubi-workshop-templar-ring.webp"],
    "Ubi Workshop Connor Amulet Necklace (Silver)": ["images/other/ubi-workshop-connor-amulet-necklace.webp"],
    "Ubi Workshop Syndicate Rooks Necklace": ["images/other/ubi-workshop-rooks-necklace.webp"],
    "Ubi Workshop Syndicate Starrick Templar Necklace": ["images/other/ubi-workshop-starrick-templar-necklace.webp"],
    "Ubi Workshop Syndicate Templar Amulet Necklace": ["images/other/ubi-workshop-templar-amulet-necklace.webp"],
    "BIXLER x Assassin's Creed Odyssey Jewelry Collection": ["images/other/bixler-odyssey-jewelry-collection.webp"],
    "King Ice x Assassin's Creed Shadows Necklace (Yasuke Kabuto 14K Gold)": [
        "images/other/king-ice-yasuke-kabuto-necklace.webp",
        "images/other/king-ice-yasuke-kabuto-necklace_01.webp",
    ],
    "Assassin's Creed Odyssey Medallion Pendant (Medaglione)": [
        "images/other/odyssey-promo-pendent.webp",
        "images/other/odyssey-promo-pendent_01.webp",
    ],

    // ── Compilations / Other ──
    "Assassin's Creed Heritage Collection": [
        "images/other/heritage-collection.webp",
        "images/other/heritage-collection_01.webp",
    ],
    "Assassin's Creed: The Official Collection (Hachette Partworks)": ["images/statues/hachette-official-collection.webp"],
    "Assassin's Creed Anthology Edition": [
        "images/collectors-editions/ac-anthology.webp",
        "images/collectors-editions/ac-anthology_01.webp",
    ],
    "Ubicollectibles Connor 'The Last Breath' Statue": [
        "images/statues/connor-the-last-breath.webp",
        "images/statues/connor-the-last-breath_01.webp",
    ],
    "Ubicollectibles Connor 'The Hunter' Statue": [
        "images/statues/connor-the-hunter.webp",
        "images/statues/connor-the-hunter_01.webp",
    ],
    "Ubicollectibles Edward Kenway 'The Assassin Pirate' Statue": ["images/statues/ubicollectibles-edward-the-assassin-pirate.webp"],
    "Ubicollectibles Blackbeard 'The Legendary Pirate' Statue": ["images/statues/ubicollectibles-blackbeard-the-legendary-pirate.webp"],
    "Loot Crate Assassin's Creed IV: Black Flag Edward Kenway Figure": ["images/statues/lootcrate-edward-kenway.webp"],
    "Loot Crate Assassin's Creed Origins Bayek Figure": ["images/statues/lootcrate-bayek.webp"],
    "Ubisoft Heroes Collection Chibi Figure - Shao Jun": ["images/statues/ubisoft-heroes-shao-jun.webp"],
    "Ubisoft Heroes Collection Chibi Figure - Ezio": ["images/statues/ubisoft-heroes-ezio.webp"],
    "Ubisoft Heroes Collection - Eivor Male": ["images/statues/ubisoft-heroes-eivor-male.webp"],
    "Ubisoft Heroes Collection - Eivor Female": ["images/statues/ubisoft-heroes-eivor-female.webp"],
    "YouTooz Assassin's Creed #0 - Ezio": [
        "images/statues/youtooz-ac-0-ezio.webp",
        "images/statues/youtooz-ac-0-ezio_01.webp",
    ],
    "YouTooz Assassin's Creed #1 - Eivor": [
        "images/statues/youtooz-ac-1-eivor.webp",
        "images/statues/youtooz-ac-1-eivor_01.webp",
    ],
    "YouTooz Assassin's Creed #2 - Yasuke": [
        "images/statues/youtooz-ac-2-yasuke.webp",
        "images/statues/youtooz-ac-2-yasuke_01.webp",
    ],
    "YouTooz Assassin's Creed #3 - Naoe": [
        "images/statues/youtooz-ac-3-naoe.webp",
        "images/statues/youtooz-ac-3-naoe_01.webp",
    ],
    "Eivor Mystery Statuette (Qisahn Pre-Order Bonus)": ["images/statues/qisahn-eivor-mystery-statuette.webp"],

    // ── Novels ──
    "Assassin's Creed: Renaissance": ["images/novels/ac-renaissance.webp"],
    "Assassin's Creed: Brotherhood (Novel)": ["images/novels/ac-brotherhood-novel.webp"],
    "Assassin's Creed: The Secret Crusade": ["images/novels/ac-secret-crusade.webp"],
    "Assassin's Creed: Revelations (Novel)": ["images/novels/ac-revelations-novel.webp"],
    "Assassin's Creed: Forsaken": ["images/novels/ac-forsaken.webp"],
    "Assassin's Creed: Black Flag (Novel)": ["images/novels/ac-black-flag-novel.webp"],
    "Assassin's Creed: Unity (Novel)": ["images/novels/ac-unity-novel.webp"],
    "Assassin's Creed: Underworld": ["images/novels/ac-underworld.webp"],
    "Assassin's Creed: Heresy": ["images/novels/ac-heresy.webp"],
    "Assassin's Creed: Heresy - Special Edition": ["images/novels/ac-heresy-se.webp"],
    "Assassin's Creed: Last Descendants": ["images/novels/ac-last-descendants.webp"],
    "Assassin's Creed: Last Descendants - Tomb of the Khan": ["images/novels/ac-last-descendants-tomb-of-khan.webp"],
    "Assassin's Creed: Last Descendants - Fate of the Gods": ["images/novels/ac-last-descendants-fate-of-gods.webp"],
    "Assassin's Creed Origins: Desert Oath": ["images/novels/ac-origins-desert-oath.webp"],
    "Assassin's Creed: Odyssey (Novel)": ["images/novels/ac-odyssey-novel.webp"],
    "Assassin's Creed Valhalla: Geirmund's Saga": ["images/novels/ac-valhalla-geirmunds-saga.webp"],
    "Assassin's Creed: The Ming Storm": ["images/novels/ac-ming-storm.webp"],
    "Assassin's Creed: Fragments - The Blade of Aizu": ["images/novels/ac-fragments-blade-of-aizu.webp"],
    "Assassin's Creed: The Desert Threat": ["images/novels/ac-desert-threat.webp"],
    "Assassin's Creed: The Jade Seal": ["images/novels/ac-jade-seal.webp"],
    "Assassin's Creed: The Magus Conspiracy": ["images/novels/ac-magus-conspiracy.webp"],
    "Assassin's Creed Valhalla: Sword of the White Horse": ["images/novels/ac-sword-white-horse.webp"],
    "Assassin's Creed: The Golden City": ["images/novels/ac-golden-city.webp"],
    "Assassin's Creed Mirage: Daughter of No One": ["images/novels/ac-daughter-of-no-one.webp"],
    "Assassin's Creed: Fragments - The Highlands Children": ["images/novels/ac-fragments-highlands-children.webp"],
    "Assassin's Creed: La Route de la Soie (The Silk Road)": ["images/novels/ac-silk-road.webp"],
    "Assassin's Creed - Escape Room Puzzle Book": [
        "images/novels/ac-escape-room-puzzle-book.webp",
        "images/novels/ac-escape-room-puzzle-book_01.webp",
        "images/novels/ac-escape-room-puzzle-book_02.webp",
    ],

    // ── Comic Books ──
    "Assassin's Creed: The Chain": ["images/comics/ac-the-chain.webp"],
    "Assassin's Creed Vol. 2: Setting Sun": ["images/comics/ac-setting-sun.webp"],
    "Assassin's Creed: Uprising - Issue #1": ["images/comics/ac-uprising-issue-1.webp"],
    "Assassin's Creed: Uprising - Issue #2": ["images/comics/ac-uprising-issue-2.webp"],
    "Assassin's Creed: Uprising - Issue #3": ["images/comics/ac-uprising-issue-3.webp"],
    "Assassin's Creed: Uprising - Issue #4": ["images/comics/ac-uprising-issue-4.webp"],
    "Assassin's Creed: Uprising - Issue #5": ["images/comics/ac-uprising-issue-5.webp"],
    "Assassin's Creed: Uprising - Issue #6": ["images/comics/ac-uprising-issue-6.webp"],
    "Assassin's Creed: Uprising - Issue #7": ["images/comics/ac-uprising-issue-7.webp"],
    "Assassin's Creed: Uprising - Issue #8": ["images/comics/ac-uprising-issue-8.webp"],
    "Assassin's Creed: Uprising - Issue #9": ["images/comics/ac-uprising-issue-9.webp"],
    "Assassin's Creed: Uprising - Issue #10": ["images/comics/ac-uprising-issue-10.webp"],
    "Assassin's Creed: Uprising - Issue #11": ["images/comics/ac-uprising-issue-11.webp"],
    "Assassin's Creed: Uprising - Issue #12": ["images/comics/ac-uprising-issue-12.webp"],
    "Assassin's Creed: Uprising Vol. 1 - Common Ground": ["images/comics/ac-uprising-vol1.webp"],
    "Assassin's Creed: Uprising Vol. 2 - Inflection Point": ["images/comics/ac-uprising-vol2.webp"],
    "Assassin's Creed: Uprising Vol. 3 - Finale": [
        "images/comics/ac-uprising-vol3.webp",
        "images/comics/ac-uprising-vol3_01.webp",
        "images/comics/ac-uprising-vol3_02.webp",
    ],
    "Assassin's Creed: Reflections - Issue #1": ["images/comics/ac-reflections-issue-1.webp"],
    "Assassin's Creed: Reflections - Issue #2": ["images/comics/ac-reflections-issue-2.webp"],
    "Assassin's Creed: Reflections - Issue #3": ["images/comics/ac-reflections-issue-3.webp"],
    "Assassin's Creed: Reflections - Issue #4": ["images/comics/ac-reflections-issue-4.webp"],
    "Assassin's Creed: Reflections": ["images/comics/ac-reflections.webp"],
    "Assassin's Creed: Conspiracies, Vol. 1 - Die Glocke": ["images/comics/ac-conspiracies-vol1.webp"],
    "Assassin's Creed: Conspiracies, Vol. 2 - Le Projet Rainbow": ["images/comics/ac-conspiracies-vol2.webp"],
    "Assassin's Creed: Conspiracies": ["images/comics/ac-conspiracies.webp"],
    "Assassin's Creed: Bloodstone, Vol. 1": ["images/comics/ac-bloodstone-vol1.webp"],
    "Assassin's Creed: Bloodstone, Vol. 2": ["images/comics/ac-bloodstone-vol2.webp"],
    "Assassin's Creed: Bloodstone Collection": ["images/comics/ac-bloodstone-collection.webp"],
    "Assassin's Creed Valhalla: Song of Glory - Issue #1": ["images/comics/ac-song-of-glory-issue-1.webp"],
    "Assassin's Creed Valhalla: Song of Glory - Issue #2": ["images/comics/ac-song-of-glory-issue-2.webp"],
    "Assassin's Creed Valhalla: Song of Glory - Issue #3": ["images/comics/ac-song-of-glory-issue-3.webp"],
    "Assassin's Creed Valhalla: Song of Glory": [
        "images/comics/ac-song-of-glory.webp",
        "images/comics/ac-song-of-glory_01.webp",
        "images/comics/ac-song-of-glory_02.webp",
        "images/comics/ac-song-of-glory_03.webp",
    ],
    "Assassin's Creed Valhalla: Blood Brothers": ["images/comics/ac-blood-brothers.webp"],
    "Assassin's Creed Valhalla: Forgotten Myths": ["images/comics/ac-forgotten-myths.webp"],
    "Assassin's Creed Valhalla: Forgotten Myths - Issue #1": ["images/comics/ac-forgotten-myths-issue-1.webp"],
    "Assassin's Creed Valhalla: Forgotten Myths - Issue #2": ["images/comics/ac-forgotten-myths-issue-2.webp"],
    "Assassin's Creed Valhalla: Forgotten Myths - Issue #3": ["images/comics/ac-forgotten-myths-issue-3.webp"],
    "Assassin's Creed: Blade of Shao Jun, Vol. 1": ["images/comics/ac-blade-shao-jun-vol1.webp"],
    "Assassin's Creed: Blade of Shao Jun, Vol. 2": ["images/comics/ac-blade-shao-jun-vol2.webp"],
    "Assassin's Creed: Blade of Shao Jun, Vol. 3": ["images/comics/ac-blade-shao-jun-vol3.webp"],
    "Assassin's Creed: Blade of Shao Jun, Vol. 4": ["images/comics/ac-blade-shao-jun-vol4.webp"],
    "Assassin's Creed: Awakening, Vol. 1": [
        "images/comics/ac-awakening-vol1.webp",
        "images/comics/ac-awakening-vol1_01.webp",
    ],
    "Assassin's Creed: Awakening, Vol. 2": ["images/comics/ac-awakening-vol2.webp"],
    "Assassin's Creed: The Fall - Issue #1": ["images/comics/ac-the-fall-issue-1.webp"],
    "Assassin's Creed: The Fall - Issue #2": ["images/comics/ac-the-fall-issue-2.webp"],
    "Assassin's Creed: The Fall - Issue #3": ["images/comics/ac-the-fall-issue-3.webp"],
    "Assassin's Creed: The Fall (Deluxe Edition)": ["images/comics/ac-the-fall-deluxe.webp"],
    "Assassin's Creed: The Fall & The Chain (Collected Edition)": [
        "images/comics/ac-the-fall-and-the-chain.webp",
        "images/comics/ac-the-fall-and-the-chain_01.webp",
    ],
    "Assassin's Creed Vol. 1: Desmond": ["images/comics/ac-vol1-desmond.webp"],
    "Assassin's Creed Vol. 2: Aquilus": ["images/comics/ac-vol2-aquilus.webp"],
    "Assassin's Creed Vol. 3: Accipiter": ["images/comics/ac-vol3-accipiter.webp"],
    "Assassin's Creed Vol. 4: Hawk": ["images/comics/ac-vol4-hawk.webp"],
    "Assassin's Creed Vol. 5: El Cakr": ["images/comics/ac-vol5-el-cakr.webp"],
    "Assassin's Creed Vol. 6: Leila": ["images/comics/ac-vol6-leila.webp"],
    "Assassin's Creed: The Ankh of Isis Trilogy": ["images/comics/ac-ankh-of-isis-trilogy.webp"],
    "Assassin's Creed: The Hawk Trilogy": ["images/comics/ac-hawk-trilogy.webp"],
    "Assassin's Creed: Assassins - Issue #1": ["images/comics/ac-assassins-issue-1.webp"],
    "Assassin's Creed: Assassins - Issue #2": ["images/comics/ac-assassins-issue-2.webp"],
    "Assassin's Creed: Assassins - Issue #3": ["images/comics/ac-assassins-issue-3.webp"],
    "Assassin's Creed: Assassins - Issue #4": ["images/comics/ac-assassins-issue-4.webp"],
    "Assassin's Creed: Assassins - Issue #5": ["images/comics/ac-assassins-issue-5.webp"],
    "Assassin's Creed: Assassins - Issue #6": ["images/comics/ac-assassins-issue-6.webp"],
    "Assassin's Creed: Assassins - Issue #7": ["images/comics/ac-assassins-issue-7.webp"],
    "Assassin's Creed: Assassins - Issue #8": ["images/comics/ac-assassins-issue-8.webp"],
    "Assassin's Creed: Assassins - Issue #9": ["images/comics/ac-assassins-issue-9.webp"],
    "Assassin's Creed: Assassins - Issue #10": ["images/comics/ac-assassins-issue-10.webp"],
    "Assassin's Creed: Assassins - Issue #11": ["images/comics/ac-assassins-issue-11.webp"],
    "Assassin's Creed: Assassins - Issue #12": ["images/comics/ac-assassins-issue-12.webp"],
    "Assassin's Creed: Assassins - Issue #13": ["images/comics/ac-assassins-issue-13.webp"],
    "Assassin's Creed: Assassins - Issue #14": ["images/comics/ac-assassins-issue-14.webp"],
    "Assassin's Creed Vol. 1: Trial by Fire": ["images/comics/ac-trial-by-fire.webp"],
    "Assassin's Creed Vol. 3: Homecoming": ["images/comics/ac-homecoming.webp"],
    "Assassin's Creed: Templars - Issue #1": ["images/comics/ac-templars-issue-1.webp"],
    "Assassin's Creed: Templars - Issue #2": ["images/comics/ac-templars-issue-2.webp"],
    "Assassin's Creed: Templars - Issue #3": ["images/comics/ac-templars-issue-3.webp"],
    "Assassin's Creed: Templars - Issue #4": ["images/comics/ac-templars-issue-4.webp"],
    "Assassin's Creed: Templars - Issue #5": ["images/comics/ac-templars-issue-5.webp"],
    "Assassin's Creed: Templars - Issue #6": ["images/comics/ac-templars-issue-6.webp"],
    "Assassin's Creed: Templars - Issue #7": ["images/comics/ac-templars-issue-7.webp"],
    "Assassin's Creed: Templars - Issue #8": ["images/comics/ac-templars-issue-8.webp"],
    "Assassin's Creed: Templars - Issue #9": ["images/comics/ac-templars-issue-9.webp"],
    "Assassin's Creed: Templars Vol. 1 - Black Cross": ["images/comics/ac-templars-black-cross.webp"],
    "Assassin's Creed: Templars Vol. 2 - Cross of War": ["images/comics/ac-templars-cross-of-war.webp"],
    "Assassin's Creed: Last Descendants - Locus - Issue #1": ["images/comics/ac-locus-issue-1.webp"],
    "Assassin's Creed: Last Descendants - Locus - Issue #2": ["images/comics/ac-locus-issue-2.webp"],
    "Assassin's Creed: Last Descendants - Locus - Issue #3": ["images/comics/ac-locus-issue-3.webp"],
    "Assassin's Creed: Last Descendants - Locus - Issue #4": ["images/comics/ac-locus-issue-4.webp"],
    "Assassin's Creed: Last Descendants - Locus": ["images/comics/ac-locus.webp"],
    "Assassin's Creed: Origins - Issue #1": [
        "images/comics/ac-origins-issue-1.webp",
        "images/comics/ac-origins-issue-1_01.webp",
        "images/comics/ac-origins-issue-1_02.webp",
    ],
    "Assassin's Creed: Origins - Issue #2": [
        "images/comics/ac-origins-issue-2.webp",
        "images/comics/ac-origins-issue-2_01.webp",
    ],
    "Assassin's Creed: Origins - Issue #3": [
        "images/comics/ac-origins-issue-3.webp",
        "images/comics/ac-origins-issue-3_01.webp",
    ],
    "Assassin's Creed: Origins - Issue #4": ["images/comics/ac-origins-issue-4.webp"],
    "Assassin's Creed: Origins (Comic)": ["images/comics/ac-origins-comic.webp"],
    "Assassin's Creed: Dynasty, Vol. 1": ["images/comics/ac-dynasty-vol1.webp"],
    "Assassin's Creed: Dynasty, Vol. 2": ["images/comics/ac-dynasty-vol2.webp"],
    "Assassin's Creed: Dynasty, Vol. 3": ["images/comics/ac-dynasty-vol3.webp"],
    "Assassin's Creed: Dynasty, Vol. 4": ["images/comics/ac-dynasty-vol4.webp"],
    "Assassin's Creed: Dynasty, Vol. 5": ["images/comics/ac-dynasty-vol5.webp"],
    "Assassin's Creed: Dynasty, Vol. 6": ["images/comics/ac-dynasty-vol6.webp"],
    "Assassin's Creed Dynasty (Box Set)": [
        "images/comics/ac-dynasty-box-set.webp",
        "images/comics/ac-dynasty-box-set_01.webp",
        "images/comics/ac-dynasty-box-set_02.webp",
        "images/comics/ac-dynasty-box-set_03.webp",
    ],
    "Assassin's Creed: Visionaries - Issue #1": ["images/comics/ac-visionaries-issue-1.webp"],
    "Assassin's Creed: Visionaries - Issue #2": ["images/comics/ac-visionaries-issue-2.webp"],
    "Assassin's Creed: Visionaries - Issue #3": ["images/comics/ac-visionaries-issue-3.webp"],
    "Assassin's Creed: Visionaries": ["images/comics/ac-visionaries.webp"],
    "Assassin's Creed Mirage: A Soar of Eagles": ["images/comics/ac-soar-of-eagles.webp"],
    "Assassin's Creed Valhalla: The Hidden Codex": [
        "images/comics/ac-valhalla-hidden-codex.webp",
        "images/comics/ac-valhalla-hidden-codex_01.webp",
    ],
    "Assassin's Creed: The Essential Guide": [
        "images/art-books/ac-essential-guide.webp",
        "images/art-books/ac-essential-guide_01.webp",
    ],
    "Assassin's Creed: The Official Film Tie-In": ["images/novels/ac-official-film-tie-in.webp"],
    "Assassin's Creed Unity: Chalice Initiate Edition (Prima Games)": [
        "images/art-books/guide-unity-chalice-initiate.webp",
        "images/art-books/guide-unity-chalice-initiate_01.webp",
        "images/art-books/guide-unity-chalice-initiate_02.webp",
    ],
    "Assassin's Creed: Brahman": ["images/comics/ac-brahman.webp"],
    "Assassin's Creed (comic)": [
        "images/comics/ac-comic.webp",
        "images/comics/ac-comic_01.webp",
        "images/comics/ac-comic_02.webp",
    ],
    "Assassin's Creed (webcomic)": [
        "images/comics/ac-webcomic.webp",
        "images/comics/ac-webcomic_01.webp",
        "images/comics/ac-webcomic_02.webp",
        "images/comics/ac-webcomic_03.webp",
    ],
     "Assassin's Creed FCBD 2016 Edition": ["images/comics/ac-fcbd-2016.webp"],
     "Assassin's Creed FCBD 2021 Edition": ["images/comics/ac-fcbd-2021.webp"],
     "Assassin's Creed Shadows: Tales of Iga, Vol. 1": [
         "images/comics/ac-tales-of-iga-vol1.webp",
         "images/comics/ac-tales-of-iga-vol1_01.webp",
     ],
     "Assassin's Creed: Valhalla (webcomic)": [
         "images/comics/ac-valhalla-webcomic.webp",
         "images/comics/ac-valhalla-webcomic_01.webp",
         "images/comics/ac-valhalla-webcomic_02.webp",
         "images/comics/ac-valhalla-webcomic_03.webp",
     ],

    // ── Other/Tankards and Goblets ──
    "Nemesis Now Assassin's Creed 'The Creed' Tankard": ["images/other/nemesis-the-creed-tankard.webp"],
    "Nemesis Now Assassin's Creed Brotherhood Tankard": ["images/other/nemesis-brotherhood-tankard.webp"],
    "Nemesis Now Assassin's Creed 'Through the Ages' Tankard": ["images/other/nemesis-through-the-ages-tankard.webp"],
    "Nemesis Now Assassin's Creed Valhalla Tankard": ["images/other/nemesis-valhalla-tankard.webp"],
    "Nemesis Now Assassin's Creed Shadows Tankard": ["images/other/nemesis-shadows-tankard.webp"],
    "Nemesis Now Assassin's Creed 'The Creed' Goblet": ["images/other/nemesis-the-creed-goblet.webp"],
    "Nemesis Now Assassin's Creed Brotherhood Goblet": ["images/other/nemesis-brotherhood-goblet.webp"],
    "Nemesis Now Assassin's Creed Valhalla Goblet": ["images/other/nemesis-valhalla-goblet.webp"],
    "Nemesis Now Assassin's Creed Shadows Goblet": ["images/other/nemesis-shadows-goblet.webp"],
    "Assassin's Creed: Leap Into History - Limited Edition 5xLP Boxset": [
        "images/other/leap-into-history-vinyl.webp",
        "images/other/leap-into-history-vinyl_01.webp",
        "images/other/leap-into-history-vinyl_02.webp",
    ],
    "Assassin's Creed Shadows: Soundtrack Collection Limited Edition 4LP Box Set": [
        "images/other/ac-shadows-le-vinyl.webp",
        "images/other/ac-shadows-le-vinyl_01.webp",
    ],
    "Assassin's Creed Shadows: Original Score - Deluxe 2xLP": [
        "images/other/ac-shadows-original-score-vinyl.webp",
        "images/other/ac-shadows-original-score-vinyl_01.webp",
    ],
    "Assassin's Creed Shadows: Kage No Iro - Deluxe Vinyl": [
        "images/other/ac-shadows-kage-no-iro-vinyl.webp",
        "images/other/ac-shadows-kage-no-iro-vinyl_01.webp",
    ],
    "Assassin's Creed Shadows: UKOMBOZI - Deluxe Vinyl": [
        "images/other/ac-shadows-ukombozi-vinyl.webp",
        "images/other/ac-shadows-ukombozi-vinyl_01.webp",
    ],
    "Assassin's Creed: The Piano Collection Vinyl": [
        "images/other/ac-piano-collection-vinyl.webp",
        "images/other/ac-piano-collection-vinyl_01.webp",
    ],
    "Assassin's Creed Mirage: Original Soundtrack Vinyl": [
        "images/other/ac-mirage-ost-vinyl.webp",
        "images/other/ac-mirage-ost-vinyl_01.webp",
    ],
    "Assassin's Creed Valhalla: Dawn of Ragnarok - Original Soundtrack Vinyl": [
        "images/other/ac-valhalla-dawn-of-ragnarok-vinyl.webp",
        "images/other/ac-valhalla-dawn-of-ragnarok-vinyl_01.webp",
    ],
    "Lofi Girl x Assassin's Creed: Shadows Vinyl": ["images/other/ac-shadows-lofi-girl-vinyl.webp"],

    // ── Jazwares ──
    "Jazwares - Altair Ibn-La'Ahad (Basic Series)": ["images/statues/jazwares-altair-basic.webp"],
    "Jazwares - Evie Frye (Basic Series)": ["images/statues/jazwares-evie-frye-basic.webp"],
    "Jazwares - Jacob Frye (Basic Series)": ["images/statues/jazwares-jacob-frye-basic.webp"],
    "Jazwares - Altair Ibn-La'Ahad (Mystery Figures)": ["images/statues/jazwares-altair-mystery.webp"],
    "Jazwares - Aya (Mystery Figures)": ["images/statues/jazwares-aya-mystery.webp"],
    "Jazwares - Bayek (Mystery Figures)": ["images/statues/jazwares-bayek-mystery.webp"],
    "Jazwares - Ezio Auditore (Mystery Figures)": ["images/statues/jazwares-ezio-auditore-mystery.webp"],
    "Jazwares - Thomas de Carneillon (Chase) (Mystery Figures)": ["images/statues/jazwares-thomas-de-carneillon-mystery.webp"],

    // ── Xtreme Play ──
    "Xtreme Play - Alexios (Basic Series)": ["images/statues/xtreme-play-alexios-basic.webp"],
    "Xtreme Play - Altair (Basic Series)": ["images/statues/xtreme-play-altair-basic.webp"],
    "Xtreme Play - Arno (Basic Series)": ["images/statues/xtreme-play-arno-basic.webp"],
    "Xtreme Play - Bayek (Basic Series)": ["images/statues/xtreme-play-bayek-basic.webp"],
    "Xtreme Play - Connor (Basic Series)": ["images/statues/xtreme-play-connor-basic.webp"],
    "Xtreme Play - Edward (Basic Series)": ["images/statues/xtreme-play-edward-basic.webp"],
    "Xtreme Play - Evie (Basic Series)": ["images/statues/xtreme-play-evie-basic.webp"],
    "Xtreme Play - Ezio (Basic Series)": ["images/statues/xtreme-play-ezio-basic.webp"],
    "Xtreme Play - Jacob (Basic Series)": ["images/statues/xtreme-play-jacob-basic.webp"],
    "Xtreme Play - Kassandra (Basic Series)": ["images/statues/xtreme-play-kassandra-basic.webp"],
    "Xtreme Play - Altair (Plush)": ["images/statues/xtreme-play-altair-plush.webp"],
    "Xtreme Play - Connor (Plush)": ["images/statues/xtreme-play-connor-plush.webp"],
    "Xtreme Play - Evie (Plush)": ["images/statues/xtreme-play-evie-plush.webp"],
    "Xtreme Play - Kassandra (Plush)": ["images/statues/xtreme-play-kassandra-plush.webp"],

    // ── Neca ──
    "Neca - Ezio (Auditore da Firenze) (Basic Series)": ["images/statues/neca-ezio-auditore-da-firenze-basic.webp"],
    "Neca - Ezio (Master Assassin) (Basic Series)": ["images/statues/neca-ezio-master-assassin-basic.webp"],
    "Neca Altair (Basic Series)": [
        "images/statues/neca-altair-basic.webp",
        "images/statues/neca-altair-basic_01.webp",
    ],
    "Neca Ezio 2-Pack (Basic Series)": [
        "images/statues/neca-ezio-2-pack-basic.webp",
        "images/statues/neca-ezio-2-pack-basic_01.webp",
    ],
    "Neca Da Vinci's Flying Machine Model": [
        "images/statues/neca-da-vinci-flying-machine.webp",
        "images/statues/neca-da-vinci-flying-machine_01.webp",
        "images/statues/neca-da-vinci-flying-machine_02.webp",
    ],
    "Neca Ezio (Eagle Vision)": [
        "images/statues/neca-ezio-eagle-vision.webp",
        "images/statues/neca-ezio-eagle-vision_01.webp",
        "images/statues/neca-ezio-eagle-vision_02.webp",
        "images/statues/neca-ezio-eagle-vision_03.webp",
    ],
    "Neca Ezio (Ebony Assassin) (Hooded)": ["images/statues/neca-ezio-ebony-hooded.webp"],
    "Neca Ezio (Ebony Assassin) (Unhooded)": [
        "images/statues/neca-ezio-ebony-unhooded.webp",
        "images/statues/neca-ezio-ebony-unhooded_01.webp",
    ],
    "Neca Ezio (Legendary Assassin) (Hooded)": ["images/statues/neca-ezio-legendary-hooded.webp"],
    "Neca Ezio (Legendary Assassin) (Unhooded)": [
        "images/statues/neca-ezio-legendary-unhooded.webp",
        "images/statues/neca-ezio-legendary-unhooded_01.webp",
    ],
    "Neca Ezio (Onyx Assassin) (Hooded)": [
        "images/statues/neca-ezio-onyx-hooded.webp",
        "images/statues/neca-ezio-onyx-hooded_01.webp",
    ],
    "Neca Ezio (Onyx Assassin) (Unhooded)": [
        "images/statues/neca-ezio-onyx-unhooded.webp",
        "images/statues/neca-ezio-onyx-unhooded_01.webp",
    ],
    "Neca Ezio Auditore (Brotherhood) (Head Knockers)": ["images/statues/neca-ezio-brotherhood-head-knockers.webp"],
    "Neca Ezio Auditore (Revelations) (Head Knockers)": [
        "images/statues/neca-ezio-revelations-head-knockers.webp",
        "images/statues/neca-ezio-revelations-head-knockers_01.webp",
    ],
    "Neca Ezio Auditore (The Mentor) version 1": ["images/statues/neca-revelations-ezio-the-mentor-v1.webp"],
    "Neca Ezio Auditore (The Mentor) version 2": [
        "images/statues/neca-revelations-ezio-the-mentor-v2.webp",
        "images/statues/neca-revelations-ezio-the-mentor-v2_01.webp",
        "images/statues/neca-revelations-ezio-the-mentor-v2_02.webp",
    ],
    "Assassin's Creed Shot Glass Set": ["images/other/lootcrate-shot-glass-set.webp"],
    "Assassin's Creed IV Black Flag Flask": ["images/other/lootcrate-black-flag-flask.webp"],
    "Ravenforge Altaïr's Sword Replica": [
        "images/other/ravenforge-altair-sword.webp",
        "images/other/ravenforge-altair-sword_01.webp",
    ],
    "Ravenforge Naoe's Tantō Replica": [
        "images/other/ravenforge-naoe-tanto.webp",
        "images/other/ravenforge-naoe-tanto_01.webp",
    ],
    "Ravenforge Yasuke's Wakizashi Replica": [
        "images/other/ravenforge-yasuke-wakizashi.webp",
        "images/other/ravenforge-yasuke-wakizashi_01.webp",
    ],
    "Ravenforge Assassin's Creed Black Flag Hip Flask": [
        "images/other/ravenforge-black-flag-flask.webp",
        "images/other/ravenforge-black-flag-flask_01.webp",
        "images/other/ravenforge-black-flag-flask_02.webp",
    ],
    "Ravenforge Assassin's Creed Hip Flask Gift Set": [
        "images/other/ravenforge-flask-gift-set.webp",
        "images/other/ravenforge-flask-gift-set_01.webp",
        "images/other/ravenforge-flask-gift-set_02.webp",
    ],
    "Ravenforge Assassin's Creed Shadows Hip Flask": [
        "images/other/ravenforge-shadows-flask.webp",
        "images/other/ravenforge-shadows-flask_01.webp",
        "images/other/ravenforge-shadows-flask_02.webp",
    ],
    "Ravenforge Assassin's Creed Odyssey Hip Flask": [
        "images/other/ravenforge-odyssey-flask.webp",
        "images/other/ravenforge-odyssey-flask_01.webp",
        "images/other/ravenforge-odyssey-flask_02.webp",
    ],
    "Assassin's Creed: Into the Animus": [
        "images/art-books/into-the-animus.webp",
        "images/art-books/into-the-animus_01.webp",
    ],
    "Assassin's Creed: Infographics": [
        "images/art-books/ac-infographics.webp",
        "images/art-books/ac-infographics_01.webp",
        "images/art-books/ac-infographics_02.webp",
        "images/art-books/ac-infographics_03.webp",
        "images/art-books/ac-infographics_04.webp",
    ],
    "PureArts Assassin's Creed Shadows Naoe Hidden Blade 1/1 Scale Replica": [
        "images/statues/purearts-naoe-hidden-blade.webp",
        "images/statues/purearts-naoe-hidden-blade_01.webp",
    ],
    "PureArts Amunet The Hidden One 1/8 Scale PVC Statue": [
        "images/statues/purearts-amunet.webp",
        "images/statues/purearts-amunet_01.webp",
    ],
    "PureArts Qlectors Altair Bell Tower PVC Figure": [
        "images/statues/purearts-qlectors-altair-bell-tower.webp",
        "images/statues/purearts-qlectors-altair-bell-tower_01.webp",
    ],
    "PureArts Desmond 1/6 Scale Premium Articulated Figure": [
        "images/statues/purearts-desmond.webp",
        "images/statues/purearts-desmond_01.webp",
    ],
    "PureArts Qlectors Connor The Last Breath PVC Figure": [
        "images/statues/purearts-qlectors-connor-last-breath.webp",
        "images/statues/purearts-qlectors-connor-last-breath_01.webp",
    ],
    "PureArts Prestige Line Ezio Auditore 1/2 Scale Statue": [
        "images/statues/purearts-prestige-ezio.webp",
        "images/statues/purearts-prestige-ezio_01.webp",
    ],
    "PureArts Hunt for the Nine 1/6 Scale Diorama": [
        "images/statues/purearts-hunt-for-the-nine.webp",
        "images/statues/purearts-hunt-for-the-nine_01.webp",
    ],
    "PureArts RIP Altair 1/6 Scale Diorama": [
        "images/statues/purearts-rip-altair.webp",
        "images/statues/purearts-rip-altair_01.webp",
    ],
    "PureArts Master Ezio 1/8 Scale PVC Statue": [
        "images/statues/purearts-master-ezio.webp",
        "images/statues/purearts-master-ezio_01.webp",
    ],

    // ── Board Games / Tabletop ──
    "PureArts Orlog Dice Game Retail Edition": [
        "images/other/purearts-orlog-retail.webp",
        "images/other/purearts-orlog-retail_01.webp",
    ],
    "PureArts Orlog Dice Game Deluxe Edition": [
        "images/other/purearts-orlog-deluxe.webp",
        "images/other/purearts-orlog-deluxe_01.webp",
    ],
    "Assassin's Creed: Vendetta": [
        "images/other/ac-vendetta.webp",
        "images/other/ac-vendetta_01.webp",
        "images/other/ac-vendetta_02.webp",
    ],
    "Assassin's Creed: Arena": [
        "images/other/ac-arena.webp",
        "images/other/ac-arena_01.webp",
        "images/other/ac-arena_02.webp",
    ],
    "Monopoly: Assassin's Creed": [
        "images/other/monopoly-assassins-creed.webp",
        "images/other/monopoly-assassins-creed_01.webp",
        "images/other/monopoly-assassins-creed_02.webp",
    ],
    "Monopoly: Assassin's Creed Syndicate": [
        "images/other/monopoly-ac-syndicate.webp",
        "images/other/monopoly-ac-syndicate_01.webp",
        "images/other/monopoly-ac-syndicate_02.webp",
    ],
    "Risk: Assassin's Creed": [
        "images/other/risk-assassins-creed.webp",
        "images/other/risk-assassins-creed_01.webp",
        "images/other/risk-assassins-creed_02.webp",
    ],
    "Stratego: Assassin's Creed": [
        "images/other/stratego-assassins-creed.webp",
        "images/other/stratego-assassins-creed_01.webp",
        "images/other/stratego-assassins-creed_02.webp",
    ],
    "Assassin's Creed: Brotherhood of Venice": [
        "images/other/ac-brotherhood-of-venice.webp",
        "images/other/ac-brotherhood-of-venice_01.webp",
        "images/other/ac-brotherhood-of-venice_02.webp",
        "images/other/ac-brotherhood-of-venice_03.webp",
    ],
    "Assassin's Creed: Brotherhood of Venice - Roma Expansion": [
        "images/other/ac-bov-roma.webp",
        "images/other/ac-bov-roma_01.webp",
    ],
    "Assassin's Creed: Brotherhood of Venice - Tokyo XXI Expansion": ["images/other/ac-bov-tokyo-xxi.webp"],
    "Assassin's Creed: Brotherhood of Venice - Creed vs Crows Expansion": ["images/other/ac-bov-creed-vs-crows.webp"],
    "Assassin's Creed: Brotherhood of Venice - Apocalypse Expansion": [
        "images/other/ac-bov-apocalypse.webp",
        "images/other/ac-bov-apocalypse_01.webp",
    ],
    "Assassin's Creed: Assassin or Templar? (300 Questions)": ["images/other/ac-assassin-or-templar.webp"],
    "Assassin's Creed: The Last Quest of Leonardo da Vinci (Escape Game)": [
        "images/other/ac-escape-game-leonardo.webp",
        "images/other/ac-escape-game-leonardo_01.webp",
        "images/other/ac-escape-game-leonardo_02.webp",
    ],
    "Magic: The Gathering - Assassin's Creed (Universes Beyond) - Beyond Booster Box": ["images/other/mtg-ac-beyond-booster-box.webp"],
    "Magic: The Gathering - Assassin's Creed (Universes Beyond) - Beyond Booster Pack": ["images/other/mtg-ac-beyond-booster-pack.webp"],
    "Magic: The Gathering - Assassin's Creed (Universes Beyond) - Collector Booster Box": ["images/other/mtg-ac-collector-booster-box.webp"],
    "Magic: The Gathering - Assassin's Creed (Universes Beyond) - Collector Booster Pack": ["images/other/mtg-ac-collector-booster-pack.webp"],
    "Magic: The Gathering - Assassin's Creed (Universes Beyond) - Bundle": ["images/other/mtg-ac-bundle.webp"],
    "Magic: The Gathering - Assassin's Creed (Universes Beyond) - Starter Kit": ["images/other/mtg-ac-starter-kit.webp"],
    "PureArts Nine Men's Morris Assassin's Creed: Black Flag Resynced Board Game": [
        "images/other/ac-bf-resynced-nine-men-morris.webp",
        "images/other/ac-bf-resynced-nine-men-morris_01.webp",
        "images/other/ac-bf-resynced-nine-men-morris_02.webp",
        "images/other/ac-bf-resynced-nine-men-morris_03.webp",
    ],

    // ── Puzzles ──
    "Good Loot Gaming Puzzle: Assassin's Creed Legacy (1000 pieces)": [
        "images/other/goodloot-ac-legacy.webp",
        "images/other/goodloot-ac-legacy_01.webp",
    ],
    "Good Loot Gaming Puzzle: Assassin's Creed Syndicate - The Tavern (1000 pieces)": [
        "images/other/goodloot-ac-syndicate-tavern.webp",
        "images/other/goodloot-ac-syndicate-tavern_01.webp",
    ],
    "Good Loot Gaming Puzzle: Assassin's Creed Valhalla - Eivor Male (1000 pieces)": [
        "images/other/goodloot-ac-valhalla-eivor-male.webp",
        "images/other/goodloot-ac-valhalla-eivor-male_01.webp",
    ],
    "Good Loot Gaming Puzzle: Assassin's Creed Valhalla - Eivor Female (1500 pieces)": [
        "images/other/goodloot-ac-valhalla-eivor-female.webp",
        "images/other/goodloot-ac-valhalla-eivor-female_01.webp",
    ],
    "Good Loot Gaming Puzzle: Assassin's Creed Valhalla - Vista of England (1000 pieces)": [
        "images/other/goodloot-ac-valhalla-vista-england-1000.webp",
        "images/other/goodloot-ac-valhalla-vista-england-1000_01.webp",
    ],
    "Good Loot Gaming Puzzle: Assassin's Creed Valhalla - Vista of England (1500 pieces)": [
        "images/other/goodloot-ac-valhalla-vista-england-1500.webp",
        "images/other/goodloot-ac-valhalla-vista-england-1500_01.webp",
    ],
    "Good Loot Gaming Puzzle: Assassin's Creed Valhalla - Dawn of Ragnarok (1000 pieces)": [
        "images/other/goodloot-ac-valhalla-dawn-of-ragnarok.webp",
        "images/other/goodloot-ac-valhalla-dawn-of-ragnarok_01.webp",
    ],
    "Good Loot Gaming Puzzle: Assassin's Creed Mirage (1000 pieces)": [
        "images/other/goodloot-ac-mirage.webp",
        "images/other/goodloot-ac-mirage_01.webp",
        "images/other/goodloot-ac-mirage_02.webp",
    ],
    "Good Loot Gaming Puzzle: Assassin's Creed Shadows - Naoe & Yasuke (1000 pieces)": [
        "images/other/goodloot-ac-shadows-naoe-yasuke.webp",
        "images/other/goodloot-ac-shadows-naoe-yasuke_01.webp",
    ],
    "Good Loot Gaming Puzzle: Assassin's Creed Shadows - Vista of Japan (1000 pieces)": [
        "images/other/goodloot-ac-shadows-vista-japan.webp",
        "images/other/goodloot-ac-shadows-vista-japan_01.webp",
    ],
    "Dark Horse Deluxe Assassin's Creed Valhalla: Raid Planning Puzzle (1000 pieces)": [
        "images/other/darkhorse-ac-valhalla-raid-planning.webp",
        "images/other/darkhorse-ac-valhalla-raid-planning_01.webp",
        "images/other/darkhorse-ac-valhalla-raid-planning_02.webp",
    ],
    "Dark Horse Deluxe Assassin's Creed Valhalla: Fortress Assault Puzzle (1000 pieces)": [
        "images/other/darkhorse-ac-valhalla-fortress-assault.webp",
        "images/other/darkhorse-ac-valhalla-fortress-assault_01.webp",
    ],
    "Trefl Assassin's Creed (Movie) - Kolaż Puzzle (1500 pieces)": [
        "images/other/trefl-ac-movie-kolaz.webp",
        "images/other/trefl-ac-movie-kolaz_01.webp",
    ],
    "Wrebbit3D Assassin's Creed Unity: Notre-Dame de Paris 3D Puzzle": [
        "images/other/wrebbit3d-ac-unity-notre-dame.webp",
        "images/other/wrebbit3d-ac-unity-notre-dame_01.webp",
    ],

    "Assassin's Creed Unity Collectible Coin": [
        "images/other/lootcrate-unity-coin.webp",
        "images/other/lootcrate-unity-coin_01.webp",
    ],
    "Assassin's Creed Odyssey Promo Coin (Best Buy Exclusive)": ["images/other/odyssey-promo-coin.webp"],
    "Ubisoft Star Player Mentors Guild Medal": [
        "images/other/ubisoft-star-player-mentors-guild-medal.webp",
        "images/other/ubisoft-star-player-mentors-guild-medal_01.webp",
        "images/other/ubisoft-star-player-mentors-guild-medal_02.webp",
        "images/other/ubisoft-star-player-mentors-guild-medal_03.webp",
    ],
    "Assassin's Creed (Movie) Exclusive Limited Edition + Hidden Dagger Arm Sleeve": ["images/collectors-editions/ac-movie-limited-edition-arm-sleeve.webp"],

    // ── Unimax ──
    "Unimax - Cesare Borgia (Gamestars Collectibles)": ["images/statues/unimax-cesare-borgia-gamestars-collectibles.webp"],
    "Unimax - Ezio Auditore da Firenze (Gamestars Collectibles)": ["images/statues/unimax-ezio-auditore-da-firenze-gamestars-collectibles.webp"],
    "Unimax - Leonardo da Vinci (Gamestars Collectibles)": ["images/statues/unimax-leonardo-da-vinci-gamestars-collectibles.webp"],
    "Unimax - Niccolo Machiavelli (Gamestars Collectibles)": ["images/statues/unimax-niccolo-machiavelli-gamestars-collectibles.webp"],
    "Unimax - The Doctor (Gamestars Collectibles)": ["images/statues/unimax-the-doctor-gamestars-collectibles.webp"],
    "Unimax - The Harlequin (Gamestars Collectibles)": ["images/statues/unimax-the-harlequin-gamestars-collectibles.webp"],

    // __ Hachette The Official Assassin's Creed Collection __
    "Hachette Issue #01 Altaïr Ibn-La'Ahad": [
        "images/hachette/hachette-issue-01-altair-ibn-laahad.webp",
        "images/hachette/hachette-issue-01-altair-ibn-laahad_01.webp",
        "images/hachette/hachette-issue-01-altair-ibn-laahad_02.webp",
    ],
    "Hachette Issue #02 Ezio Auditore": [
        "images/hachette/hachette-issue-02-ezio-auditore.webp",
        "images/hachette/hachette-issue-02-ezio-auditore_01.webp",
        "images/hachette/hachette-issue-02-ezio-auditore_02.webp",
    ],
    "Hachette Issue #03 Haytham Kenway": [
        "images/hachette/hachette-issue-03-haytham-kenway.webp",
        "images/hachette/hachette-issue-03-haytham-kenway_01.webp",
    ],
    "Hachette Issue #04 Jacob Frye": [
        "images/hachette/hachette-issue-04-jacob-frye.webp",
        "images/hachette/hachette-issue-04-jacob-frye_01.webp",
    ],
    "Hachette Issue #05 Cesare Borgia": [
        "images/hachette/hachette-issue-05-cesare-borgia.webp",
        "images/hachette/hachette-issue-05-cesare-borgia_01.webp",
    ],
    "Hachette Issue #06 Ratonhnhaké:ton": [
        "images/hachette/hachette-issue-06-ratonhnhaketon.webp",
        "images/hachette/hachette-issue-06-ratonhnhaketon_01.webp",
    ],
    "Hachette Issue #07 Shay Cormac": [
        "images/hachette/hachette-issue-07-shay-cormac.webp",
        "images/hachette/hachette-issue-07-shay-cormac_01.webp",
    ],
    "Hachette Issue #08 Evie Frye": [
        "images/hachette/hachette-issue-08-evie-frye.webp",
        "images/hachette/hachette-issue-08-evie-frye_01.webp",
    ],
    "Hachette Issue #09 Aveline de Grandpré": [
        "images/hachette/hachette-issue-09-aveline-de-grandpre.webp",
        "images/hachette/hachette-issue-09-aveline-de-grandpre_01.webp",
    ],
    "Hachette Issue #10 Edward Kenway": [
        "images/hachette/hachette-issue-10-edward-kenway.webp",
        "images/hachette/hachette-issue-10-edward-kenway_01.webp",
    ],
    "Hachette Issue #11 Charlotte de la Cruz": [
        "images/hachette/hachette-issue-11-charlotte-de-la-cruz.webp",
        "images/hachette/hachette-issue-11-charlotte-de-la-cruz_01.webp",
    ],
    "Hachette Issue #12 Arno Dorian": [
        "images/hachette/hachette-issue-12-arno-dorian.webp",
        "images/hachette/hachette-issue-12-arno-dorian_01.webp",
    ],
    "Hachette Issue #13 Élise de la Serre": [
        "images/hachette/hachette-issue-13-elise-de-la-serre.webp",
        "images/hachette/hachette-issue-13-elise-de-la-serre_01.webp",
    ],
    "Hachette Issue #14 Duncan Walpole": [
        "images/hachette/hachette-issue-14-duncan-walpole.webp",
        "images/hachette/hachette-issue-14-duncan-walpole_01.webp",
    ],
    "Hachette Issue #15 Arbaaz Mir": [
        "images/hachette/hachette-issue-15-arbaaz-mir.webp",
        "images/hachette/hachette-issue-15-arbaaz-mir_01.webp",
    ],
    "Hachette Issue #16 Juhani Otso Berg": [
        "images/hachette/hachette-issue-16-juhani-otso-berg.webp",
        "images/hachette/hachette-issue-16-juhani-otso-berg_01.webp",
    ],
    "Hachette Issue #17 Juno": [
        "images/hachette/hachette-issue-17-juno.webp",
        "images/hachette/hachette-issue-17-juno_01.webp",
    ],
    "Hachette Issue #18 Nikolaï Orelov": [
        "images/hachette/hachette-issue-18-nikolai-orelov.webp",
        "images/hachette/hachette-issue-18-nikolai-orelov_01.webp",
    ],
    "Hachette Issue #19 Rebecca Crane": [
        "images/hachette/hachette-issue-19-rebecca-crane.webp",
        "images/hachette/hachette-issue-19-rebecca-crane_01.webp",
    ],
    "Hachette Issue #20 Desmond Miles": [
        "images/hachette/hachette-issue-20-desmond-miles.webp",
        "images/hachette/hachette-issue-20-desmond-miles_01.webp",
    ],
    "Hachette Issue #21 Bayek": [
        "images/hachette/hachette-issue-21-bayek.webp",
        "images/hachette/hachette-issue-21-bayek_01.webp",
    ],
    "Hachette Issue #22 Adéwalé": [
        "images/hachette/hachette-issue-22-adewale.webp",
        "images/hachette/hachette-issue-22-adewale_01.webp",
    ],
    "Hachette Issue #23 Aya": [
        "images/hachette/hachette-issue-23-aya.webp",
        "images/hachette/hachette-issue-23-aya_01.webp",
    ],
    "Hachette Issue #24 Daniel Cross": [
        "images/hachette/hachette-issue-24-daniel-cross.webp",
        "images/hachette/hachette-issue-24-daniel-cross_01.webp",
    ],
    "Hachette Issue #25 Julius Caesar": [
        "images/hachette/hachette-issue-25-julius-caesar.webp",
        "images/hachette/hachette-issue-25-julius-caesar_01.webp",
    ],
    "Hachette Issue #26 Jupiter": [
        "images/hachette/hachette-issue-26-jupiter.webp",
        "images/hachette/hachette-issue-26-jupiter_01.webp",
    ],
    "Hachette Issue #27 Cleopatra": [
        "images/hachette/hachette-issue-27-cleopatra.webp",
        "images/hachette/hachette-issue-27-cleopatra_01.webp",
    ],
    "Hachette Issue #28 Rodrigo Borgia": [
        "images/hachette/hachette-issue-28-rodrigo-borgia.webp",
        "images/hachette/hachette-issue-28-rodrigo-borgia_01.webp",
    ],
    "Hachette Issue #29 Layla Hassan": [
        "images/hachette/hachette-issue-29-layla-hassan.webp",
        "images/hachette/hachette-issue-29-layla-hassan_01.webp",
    ],
    "Hachette Issue #30 Malik Al-Sayf": [
        "images/hachette/hachette-issue-30-malik-al-sayf.webp",
        "images/hachette/hachette-issue-30-malik-al-sayf_01.webp",
    ],
    "Hachette Issue #31 Aveline de Grandpré": [
        "images/hachette/hachette-issue-31-aveline-de-grandpre.webp",
        "images/hachette/hachette-issue-31-aveline-de-grandpre_01.webp",
    ],
    "Hachette Issue #32 Crawford Starrick": [
        "images/hachette/hachette-issue-32-crawford-starrick.webp",
        "images/hachette/hachette-issue-32-crawford-starrick_01.webp",
    ],
    "Hachette Issue #33 Mario Auditore": [
        "images/hachette/hachette-issue-33-mario-auditore.webp",
        "images/hachette/hachette-issue-33-mario-auditore_01.webp",
    ],
    "Hachette Issue #34 Edward Thatch": [
        "images/hachette/hachette-issue-34-edward-thatch.webp",
        "images/hachette/hachette-issue-34-edward-thatch_01.webp",
    ],
    "Hachette Issue #35 Shao Jun": [
        "images/hachette/hachette-issue-35-shao-jun.webp",
        "images/hachette/hachette-issue-35-shao-jun_01.webp",
    ],
    "Hachette Issue #36 Lydia Frye": [
        "images/hachette/hachette-issue-36-lydia-frye.webp",
        "images/hachette/hachette-issue-36-lydia-frye_01.webp",
    ],
    "Hachette Issue #37 Leonardo da Vinci": [
        "images/hachette/hachette-issue-37-leonardo-da-vinci.webp",
        "images/hachette/hachette-issue-37-leonardo-da-vinci_01.webp",
    ],
    "Hachette Issue #38 Mary Read/James Kidd": [
        "images/hachette/hachette-issue-38-mary-read-james-kidd.webp",
        "images/hachette/hachette-issue-38-mary-read-james-kidd_01.webp",
    ],
    "Hachette Issue #39 François-Thomas Germain": [
        "images/hachette/hachette-issue-39-francois-thomas-germain.webp",
        "images/hachette/hachette-issue-39-francois-thomas-germain_01.webp",
    ],
    "Hachette Issue #40 Giovanni Borgia": [
        "images/hachette/hachette-issue-40-giovanni-borgia.webp",
        "images/hachette/hachette-issue-40-giovanni-borgia_01.webp",
    ],
    "Hachette Issue #41 Amunet": [
        "images/hachette/hachette-issue-41-amunet.webp",
        "images/hachette/hachette-issue-41-amunet_01.webp",
    ],
    "Hachette Issue #42 Al Mualim": [
        "images/hachette/hachette-issue-42-al-mualim.webp",
        "images/hachette/hachette-issue-42-al-mualim_01.webp",
    ],
    "Hachette Issue #43 Kiyoshi Takakura": [
        "images/hachette/hachette-issue-43-kiyoshi-takakura.webp",
        "images/hachette/hachette-issue-43-kiyoshi-takakura_01.webp",
    ],
    "Hachette Issue #44 William Miles": [
        "images/hachette/hachette-issue-44-william-miles.webp",
        "images/hachette/hachette-issue-44-william-miles_01.webp",
    ],
    "Hachette Issue #45 Jack the Ripper": [
        "images/hachette/hachette-issue-45-jack-the-ripper.webp",
        "images/hachette/hachette-issue-45-jack-the-ripper_01.webp",
    ],
    "Hachette Issue #46 Frederick Abberline": [
        "images/hachette/hachette-issue-46-frederick-abberline.webp",
        "images/hachette/hachette-issue-46-frederick-abberline_01.webp",
    ],
    "Hachette Issue #47 Baron Jordane": [
        "images/hachette/hachette-issue-47-baron-jordane.webp",
        "images/hachette/hachette-issue-47-baron-jordane_01.webp",
    ],
    "Hachette Issue #48 Pierre Bellec": [
        "images/hachette/hachette-issue-48-pierre-bellec.webp",
        "images/hachette/hachette-issue-48-pierre-bellec_01.webp",
    ],
    "Hachette Issue #49 Galina Voronina": [
        "images/hachette/hachette-issue-49-galina-voronina.webp",
        "images/hachette/hachette-issue-49-galina-voronina_01.webp",
    ],
    "Hachette Issue #50 The Black Cross": [
        "images/hachette/hachette-issue-50-the-black-cross.webp",
        "images/hachette/hachette-issue-50-the-black-cross_01.webp",
    ],
    "Hachette Issue #51 Henry Green (Jayadeep Mir)": [
        "images/hachette/hachette-issue-51-henry-green-jayadeep-mir.webp",
        "images/hachette/hachette-issue-51-henry-green-jayadeep-mir_01.webp",
    ],
    "Hachette Issue #52 Maestro Ezio Auditore": [
        "images/hachette/hachette-issue-52-maestro-ezio-auditore.webp",
        "images/hachette/hachette-issue-52-maestro-ezio-auditore_01.webp",
    ],
    "Hachette Issue #53 Bayek II": [
        "images/hachette/hachette-issue-53-bayek-ii.webp",
        "images/hachette/hachette-issue-53-bayek-ii_01.webp",
    ],
    "Hachette Issue #54 Connor Espíritu animal": [
        "images/hachette/hachette-issue-54-connor-espiritu-animal.webp",
        "images/hachette/hachette-issue-54-connor-espiritu-animal_01.webp",
    ],
    "Hachette Issue #55 Arend Schut-Cunningham": [
        "images/hachette/hachette-issue-55-arend-schut-cunningham.webp",
        "images/hachette/hachette-issue-55-arend-schut-cunningham_01.webp",
    ],
    "Hachette Issue #56 Kassandra": [
        "images/hachette/hachette-issue-56-kassandra.webp",
        "images/hachette/hachette-issue-56-kassandra_01.webp",
    ],
    "Hachette Issue #57 Agaté": [
        "images/hachette/hachette-issue-57-agate.webp",
        "images/hachette/hachette-issue-57-agate_01.webp",
    ],
    "Hachette Issue #58 Barnabas": [
        "images/hachette/hachette-issue-58-barnabas.webp",
        "images/hachette/hachette-issue-58-barnabas_01.webp",
    ],
    "Hachette Issue #59 Yusuf Tazim": [
        "images/hachette/hachette-issue-59-yusuf-tazim.webp",
        "images/hachette/hachette-issue-59-yusuf-tazim_01.webp",
    ],
    "Hachette Issue #60 Cultista de Kosmos": [
        "images/hachette/hachette-issue-60-cultista-de-kosmos.webp",
        "images/hachette/hachette-issue-60-cultista-de-kosmos_01.webp",
    ],
    "Hachette Issue #61 Herodotos": [
        "images/hachette/hachette-issue-61-herodotos.webp",
        "images/hachette/hachette-issue-61-herodotos_01.webp",
    ],
    "Hachette Issue #62 Mentor Altaïr": [
        "images/hachette/hachette-issue-62-mentor-altair.webp",
        "images/hachette/hachette-issue-62-mentor-altair_01.webp",
    ],
    "Hachette Issue #63 Aspasia": [
        "images/hachette/hachette-issue-63-aspasia.webp",
        "images/hachette/hachette-issue-63-aspasia_01.webp",
    ],
    "Hachette Issue #64 Warren Vidic": [
        "images/hachette/hachette-issue-64-warren-vidic.webp",
        "images/hachette/hachette-issue-64-warren-vidic_01.webp",
    ],
    "Hachette Issue #65 Ah Tabai": [
        "images/hachette/hachette-issue-65-ah-tabai.webp",
        "images/hachette/hachette-issue-65-ah-tabai_01.webp",
    ],
    "Hachette Issue #66 Darius": [
        "images/hachette/hachette-issue-66-darius.webp",
        "images/hachette/hachette-issue-66-darius_01.webp",
    ],
    "Hachette Issue #67 Shaun Hastings": [
        "images/hachette/hachette-issue-67-shaun-hastings.webp",
        "images/hachette/hachette-issue-67-shaun-hastings_01.webp",
    ],
    "Hachette Issue #68 Gilberto La Volpe": [
        "images/hachette/hachette-issue-68-gilberto-la-volpe.webp",
        "images/hachette/hachette-issue-68-gilberto-la-volpe_01.webp",
    ],
    "Hachette Issue #69 Mentor Ezio": [
        "images/hachette/hachette-issue-69-mentor-ezio.webp",
        "images/hachette/hachette-issue-69-mentor-ezio_01.webp",
    ],
    "Hachette Issue #70 Charles Lee": [
        "images/hachette/hachette-issue-70-charles-lee.webp",
        "images/hachette/hachette-issue-70-charles-lee_01.webp",
    ],
    "Hachette Issue #71 Ignacio Cardona": [
        "images/hachette/hachette-issue-71-ignacio-cardona.webp",
        "images/hachette/hachette-issue-71-ignacio-cardona_01.webp",
    ],
    "Hachette Issue #72 Clay Kaczmarek": [
        "images/hachette/hachette-issue-72-clay-kaczmarek.webp",
        "images/hachette/hachette-issue-72-clay-kaczmarek_01.webp",
    ],
    "Hachette Issue #73 Claudia Auditore": [
        "images/hachette/hachette-issue-73-claudia-auditore.webp",
        "images/hachette/hachette-issue-73-claudia-auditore_01.webp",
        "images/hachette/hachette-issue-73-claudia-auditore_02.webp",
    ],
    "Hachette Issue #74 Edward Kenway": ["images/hachette/hachette-issue-74-edward-kenway.webp"],
    "Hachette Issue #75 Jacques de Molay": ["images/hachette/hachette-issue-75-jacques-de-molay.webp"],
    "Hachette Issue #76 Evie Frye": ["images/hachette/hachette-issue-76-evie-frye.webp"],
    "Hachette Issue #77 Achilles Davenport": [
        "images/hachette/hachette-issue-77-achilles-davenport.webp",
        "images/hachette/hachette-issue-77-achilles-davenport_01.webp",
    ],
    "Hachette Issue #78 Baptiste": [
        "images/hachette/hachette-issue-78-baptiste.webp",
        "images/hachette/hachette-issue-78-baptiste_01.webp",
    ],
    "Hachette Issue #79 Madeleine de L'Isle": [
        "images/hachette/hachette-issue-79-madeleine-de-lisle.webp",
        "images/hachette/hachette-issue-79-madeleine-de-lisle_01.webp",
    ],
    "Hachette Issue #80 Darim Ibn-La'Ahad": [
        "images/hachette/hachette-issue-80-darim-ibn-laahad.webp",
        "images/hachette/hachette-issue-80-darim-ibn-laahad_01.webp",
    ],

    // ── Nendoroid ──
    "Nendoroid Ezio Auditore #1829": [
        "images/statues/nendoroid-1829-ezio-auditore.webp",
        "images/statues/nendoroid-1829-ezio-auditore_01.webp",
        "images/statues/nendoroid-1829-ezio-auditore_02.webp",
    ],

    // ── FiGPiN ──
    "FiGPiN Assassin's Creed Deluxe Box Set": [
        "images/other/figpin-ac-deluxe-box-set.webp",
        "images/other/figpin-ac-deluxe-box-set_01.webp",
        "images/other/figpin-ac-deluxe-box-set_02.webp",
        "images/other/figpin-ac-deluxe-box-set_03.webp",
        "images/other/figpin-ac-deluxe-box-set_04.webp",
    ],

    // ── MeoWorld (BonaFide Studio) ──
    "MeoWorld Assassin's Creed Cat Figurines": [
        "images/statues/meoworld-ac-cat-figurines.webp",
        "images/statues/meoworld-ac-cat-figurines_01.webp",
        "images/statues/meoworld-ac-cat-figurines_02.webp",
    ],

    // ── Lamps / Decor (Neamedia Icons) ──
    "Assassin's Creed: The Official Light (Neamedia Icons)": [
        "images/other/neamedia-ac-official-light.webp",
        "images/other/neamedia-ac-official-light_01.webp",
    ],
    "Assassin's Creed Mirage: Logo Light (Neamedia Icons)": [
        "images/other/neamedia-ac-mirage-logo-light.webp",
        "images/other/neamedia-ac-mirage-logo-light_01.webp",
    ],

    // ── Audio / Peripherals ──
    "GravaStar Mars Pro Limited Edition - Apple of Eden": [
        "images/other/gravastar-mars-pro-apple-of-eden.webp",
        "images/other/gravastar-mars-pro-apple-of-eden_01.webp",
    ],
    "Flydigi Apex 4 - Assassin's Creed Dynasty Edition": ["images/other/flydigi-apex4-ac-dynasty.webp"],

    // ── Art Prints / Posters ──
    "Blend Cota Studios - Assassin's Creed Fine Art Prints": [
        "images/other/blend-cota-ac-prints.webp",
        "images/other/blend-cota-ac-prints_01.webp",
        "images/other/blend-cota-ac-prints_02.webp",
        "images/other/blend-cota-ac-prints_03.webp",
        "images/other/blend-cota-ac-prints_04.webp",
        "images/other/blend-cota-ac-prints_05.webp",
    ],
    "Displate - Assassin's Creed Metal Posters": [
        "images/other/displate-ac-metal-posters.webp",
        "images/other/displate-ac-metal-posters_01.webp",
        "images/other/displate-ac-metal-posters_02.webp",
        "images/other/displate-ac-metal-posters_03.webp",
    ],
    "Art4Fans - Assassin's Creed Print Collection": [
        "images/other/art4fans-ac-prints.webp",
        "images/other/art4fans-ac-prints_01.webp",
    ],

    // ── Fragrance ──
    "Hidden Blade by Assassin's Creed (Ubisoft Brasil)": [
        "images/other/hidden-blade-fragrance.webp",
        "images/other/hidden-blade-fragrance_01.webp",
    ],
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
