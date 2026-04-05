"""
Download all AC Database images locally with clean filenames.
Run once: python3 download_images.py
"""
import os
import re
import urllib.request
import ssl

BASE = os.path.dirname(os.path.abspath(__file__))
IMG_DIR = os.path.join(BASE, "images")

# Map: (subfolder, clean_filename, url)
DOWNLOADS = [
    # ── Collector's Editions ──
    ("collectors-editions", "ac1-limited-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/09/A4Xg9-scaled.jpg"),
    ("collectors-editions", "ac2-black-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/01/830px-UK_Black_Edition_AC2_xbox360.jpg"),
    ("collectors-editions", "ac2-white-edition.jpg",
     "https://i0.wp.com/www.saint-ism.com/wp-content/uploads/2009/11/ac2_unboxing_white_collectors_edition_2.jpg"),
    ("collectors-editions", "ac2-master-assassins-edition.jpg",
     "https://i0.wp.com/www.saint-ism.com/wp-content/uploads/2009/11/ac2_unboxing_figures.jpg"),
    ("collectors-editions", "brotherhood-collectors-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/09/aaq.jpg"),
    ("collectors-editions", "brotherhood-collectors-edition-doctor.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2010/11/assassin-s-creed-brotherhood-collector-edition-ecc-2.jpg"),
    ("collectors-editions", "brotherhood-codex-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2010/11/Limited_Codex_Edition_IT.jpg"),
    ("collectors-editions", "revelations-collectors-edition.png",
     "https://www.assassinscollection.it/wp-content/uploads/2013/06/830px-Edizione_Collector_Revelations.png"),
    ("collectors-editions", "revelations-animus-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/06/ACR_ANIMUS_EDITION_HERO-Copia-e1415224270450.jpg"),
    ("collectors-editions", "revelations-templar-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/06/2013-06-16-16.24.00-Copia.jpg"),
    ("collectors-editions", "ac3-freedom-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/09/ac3_freedom_edition_mockup1.jpg"),
    ("collectors-editions", "ac3-join-or-die-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/09/ac3_join_or_die_editiontcm2642765.jpg"),
    ("collectors-editions", "ac3-limited-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/09/Assassinscreed3Americalimitededition_00.jpg"),
    ("collectors-editions", "ac4-black-chest-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/03/484229_556352697738702_1676772209_n.jpg"),
    ("collectors-editions", "ac4-buccaneer-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/03/39265_556352654405373_1618722182_n1.jpg"),
    ("collectors-editions", "ac4-skull-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2013/03/602016_556352664405372_1326706377_n-1.jpg"),
    ("collectors-editions", "ac4-limited-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2014/11/51.jpg"),
    ("collectors-editions", "rogue-collectors-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2018/05/5aafe5ee6b54a40685e77172-1.jpg"),
    ("collectors-editions", "unity-guillotine-collectors-case.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2014/11/57.jpg"),
    ("collectors-editions", "unity-notre-dame-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2014/11/55.jpg"),
    ("collectors-editions", "unity-collectors-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2014/11/58.jpg"),
    ("collectors-editions", "unity-bastille-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2014/11/56.jpg"),
    ("collectors-editions", "syndicate-big-ben-collectors-case.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2015/05/acv-combo-pres-bigben1.jpg"),
    ("collectors-editions", "syndicate-rooks-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2015/05/acv-combo-pres-therooks1.jpg"),
    ("collectors-editions", "origins-gods-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2018/05/592589c06b54a4d5238b4568-1.jpg"),
    ("collectors-editions", "origins-dawn-of-the-creed-edition.jpg",
     "https://takeoffstudios.com/wp-content/uploads/2019/07/TO_Assassins_Creed_Origins_CE_03.jpg"),
    ("collectors-editions", "origins-dawn-of-the-creed-legendary-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2018/05/592598cbef3aa5164c8b4568-10.jpg"),
    ("collectors-editions", "odyssey-pantheon-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2018/06/1-5-e1561793557990.jpg"),
    ("collectors-editions", "odyssey-spartan-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2018/06/1-4.jpg"),
    ("collectors-editions", "odyssey-medusa-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2018/06/1-3.jpg"),
    ("collectors-editions", "valhalla-collectors-edition.jpg",
     "https://www.assassinscollection.it/wp-content/uploads/2020/11/495115ea94915596c41.61862952-ACV_pack_Announce_COLLECTOR-EDITION_200430_5pm_CET_Paris-Time_IT.jpg"),
    ("collectors-editions", "mirage-collectors-case.jpg",
     "https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/2uNoFeOsG53JsIRWQIBZMp/9c846d605cc0651157e9f161dd2ff8fb/ACM_collector_thumbnail.jpg"),
    ("collectors-editions", "shadows-collectors-edition.jpg",
     "https://staticctf.ubisoft.com/J3yJr34U2pZ2Ieem48Dwy9uqj5PNUQTn/4SMMGBFhOgCwpFjQFWlGBF/77387f2b17b11e5a3e447b03a0770eee/US_AC_RED_MOCKUP_COLLECTOR_1920x1080.jpg"),

    # ── Steelbooks ──
    ("steelbooks", "origins-gold-steelbook.jpg",
     "https://www.strategyguidereviews.com/wp-content/uploads/2017/10/ACOriginsCE.jpg"),

    # ── PureArts Animus 1/4 Scale ──
    ("statues", "purearts-animus-altair-1-4.png",
     "https://www.purearts.com/cdn/shop/products/2020.01.20_Altair_winner.png?v=1744634352"),
    ("statues", "purearts-prestige-altair-1-2.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts-Prestige-Altair_26.jpg?v=1768489209&width=600"),
    ("statues", "purearts-animus-ezio-1-4.png",
     "https://www.purearts.com/cdn/shop/products/DSC01538_preorder.png?v=1751900110"),
    ("statues", "purearts-animus-connor-1-4.jpg",
     "https://www.purearts.com/cdn/shop/products/Purearts-Connor-Promo_01.jpg?v=1669301097"),
    ("statues", "purearts-animus-edward-1-4.jpg",
     "https://www.purearts.com/cdn/shop/products/full_statue.jpg?v=1744634220"),
    ("statues", "purearts-animus-arno-1-4.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts-Promo-Arno_001.jpg?v=1756309524&width=600"),
    ("statues", "purearts-animus-jacob-evie-1-4.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts-Promo_AC-Syndicate_002.jpg?v=1729712406&width=600"),
    ("statues", "purearts-animus-basim-1-4.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts-Promo_Basim_02.jpg?v=1741587982"),
    ("statues", "purearts-animus-naoe-yasuke-1-4.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts-Promo_Y_N_001.jpg?v=1741789436&width=600"),

    # ── PureArts Animus 1/8 Scale ──
    ("statues", "purearts-animus-ezio-1-8.jpg",
     "https://www.purearts.com/cdn/shop/files/Ezio1_Purearts_Promo.jpg?v=1743003786&width=600"),
    ("statues", "purearts-animus-altair-1-8.jpg",
     "https://www.purearts.com/cdn/shop/files/Altair1_Purearts_Promo.jpg?v=1743014264&width=600"),
    ("statues", "purearts-animus-connor-1-8.jpg",
     "https://www.purearts.com/cdn/shop/files/Connor1_Purearts_Promo.jpg?v=1743005143&width=600"),
    ("statues", "purearts-animus-bayek-1-8.jpg",
     "https://www.purearts.com/cdn/shop/files/Bayek1_Purearts_Promo.jpg?v=1743014618&width=600"),
    ("statues", "purearts-animus-kassandra-1-8.jpg",
     "https://www.purearts.com/cdn/shop/files/Kassandra1_Purearts_Promo.jpg?v=1743014829&width=600"),
    ("statues", "purearts-animus-eivor-1-8.jpg",
     "https://www.purearts.com/cdn/shop/files/Eivor1_Purearts_Promo.jpg?v=1743015074&width=600"),
    ("statues", "purearts-animus-basim-1-8.jpg",
     "https://www.purearts.com/cdn/shop/files/Basim1_Purearts_Promo.jpg?v=1743016234&width=600"),
    ("statues", "purearts-animus-yasuke-1-8.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts_PromoYasukePVC_01.jpg?v=1738790940&width=600"),
    ("statues", "purearts-animus-naoe-1-8.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts_PromoNaoePVC_01.jpg?v=1738790745&width=600"),

    # ── PureArts Other ──
    ("statues", "purearts-animus-eivor-1-4.jpg",
     "https://www.purearts.com/cdn/shop/products/03.jpg?v=1744634313"),
    ("statues", "purearts-spartan-kick-diorama.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts-Promo-SpartanKick_001.jpg?v=1750349107&width=600"),
    ("statues", "purearts-naoe-bust-1-4.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts-Promo-NaoeBust_1.jpg?v=1740616121&width=600"),
    ("statues", "purearts-yasuke-bust-1-4.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts-Promo-YasukeBust_1.jpg?v=1740613927&width=600"),
    ("statues", "purearts-qlectors-naoe-yasuke.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts_PromoYasuke_NaoeQlector_01.jpg?v=1738087432&width=600"),
    ("statues", "purearts-qlectors-ezio-leap-of-faith.jpg",
     "https://www.figurine-collector.com/125001-home_default/pure-arts-qlectors-assassin-s-creed-ezio-leap-of-faith.jpg"),
    ("statues", "ubicollectibles-ezio-leap-of-faith.jpg",
     "https://www.purearts.com/cdn/shop/files/Q_Ezio_01.jpg?v=1723671708"),
    ("statues", "ubicollectibles-kassandra.jpg",
     "https://thetechrevolutionist.com/wp-content/uploads/2018/06/EN_KASSANDRA.jpg"),

    # ── Other / Replicas ──
    ("other", "purearts-shadows-shogi-board.jpg",
     "https://www.purearts.com/cdn/shop/files/Purearts-Promo-Shogi_006.jpg?v=1740075018&width=600"),
    ("other", "valhalla-hidden-blade-replica.jpg",
     "https://geekculture.co/wp-content/uploads/2020/07/ACV_UBICOLLECTIBLES_HIDDENBLADE.jpg"),
    ("other", "valhalla-bundle-eivor-blade-dice.jpg",
     "https://geekculture.co/wp-content/uploads/2020/07/ACV_EIVOR.jpg"),

    # ── Funko Pop ──
    ("funko-pop", "funko-pop-20-altair.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-20-Altair.jpg"),
    ("funko-pop", "funko-pop-21-ezio-white.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-21-Ezio-II.jpg"),
    ("funko-pop", "funko-pop-21-ezio-eagle-vision-blue.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/11/Funko-Pop-Assassins-Creed-21-Ezio-Eagle-Vision-GameStop.jpg"),
    ("funko-pop", "funko-pop-21-ezio-black.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2017/01/Funko-Pop-Assassins-Creed-II-21-Ezio-Black.jpg"),
    ("funko-pop", "funko-pop-22-connor.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-22-Connor-III.jpg"),
    ("funko-pop", "funko-pop-23-edward.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-23-Edward-IV-Black-Flag.jpg"),
    ("funko-pop", "funko-pop-24-plague-doctor.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-24-Plague-Doctor-AC-Brotherhood.jpg"),
    ("funko-pop", "funko-pop-28-aveline.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-28-Aveline-de-Grandpre-Liberation-.jpg"),
    ("funko-pop", "funko-pop-35-arno.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-35-Arno-Unity.jpg"),
    ("funko-pop", "funko-pop-36-elise.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-36-Elise-Unity-.jpg"),
    ("funko-pop", "funko-pop-73-jacob-frye.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2015/10/2015-Funko-Pop-Assassins-Creed-Syndicate-Jacob-Frye.jpg"),
    ("funko-pop", "funko-pop-74-evie-frye.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2015/10/2015-Funko-Pop-Assassins-Creed-Syndicate-Evie-Frye.jpg"),
    ("funko-pop", "funko-pop-80-jacob-frye-uncloaked.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2021/01/Funko-Pop-Assassins-Creed-Figures-80-Jacob-Frye-Uncloaked-Underground-Toys-Europe-Exclusive.jpg"),
    ("funko-pop", "funko-pop-776-eivor.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2021/01/Funko-Pop-Assassins-Creed-Valhalla-Figures-778-Eivor.jpg"),
    ("funko-pop", "funko-pop-778-eivor-double-axe.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2021/01/Funko-Pop-Assassins-Creed-Valhalla-Figures-778-Eivor-with-Double-Axe-GameStop-Exclusive.jpg"),
    ("funko-pop", "funko-pop-375-aguilar.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-Movie-375-Aguilar.jpg"),
    ("funko-pop", "funko-pop-376-maria.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-Movie-376-Maria.jpg"),
    ("funko-pop", "funko-pop-377-ojeda.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-Movie-377-Ojeda.jpg"),
    ("funko-pop", "funko-pop-378-callum-lynch.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2016/10/Funko-Pop-Assassins-Creed-Movie-378-Callum-Lynch.jpg"),
    ("funko-pop", "funko-pop-379-aguilar-crouching.jpg",
     "https://cconnect.s3.amazonaws.com/wp-content/uploads/2017/01/Funko-Pop-Assassins-Creed-Movie-379-Aguilar-Crouching-LootCrate.jpg"),

    # ── Art Books ──
    ("art-books", "art-of-ac-valhalla.jpg",
     "https://i0.wp.com/conceptartworld.com/wp-content/uploads/2021/03/The-Art-of-Assassins-Creed-Valhalla-01-Cover.jpg"),
]

def download():
    ctx = ssl.create_default_context()
    ctx.check_hostname = False
    ctx.verify_mode = ssl.CERT_NONE

    ok = 0
    fail = 0
    for subfolder, filename, url in DOWNLOADS:
        dest_dir = os.path.join(IMG_DIR, subfolder)
        os.makedirs(dest_dir, exist_ok=True)
        dest = os.path.join(dest_dir, filename)

        if os.path.exists(dest) and os.path.getsize(dest) > 1000:
            print(f"  SKIP  {subfolder}/{filename} (already exists)")
            ok += 1
            continue

        try:
            req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with urllib.request.urlopen(req, context=ctx, timeout=30) as resp:
                data = resp.read()
            with open(dest, "wb") as f:
                f.write(data)
            size_kb = len(data) / 1024
            print(f"  OK    {subfolder}/{filename} ({size_kb:.0f} KB)")
            ok += 1
        except Exception as e:
            print(f"  FAIL  {subfolder}/{filename} -> {e}")
            fail += 1

    print(f"\nDone: {ok} downloaded, {fail} failed out of {len(DOWNLOADS)} total")

if __name__ == "__main__":
    download()
