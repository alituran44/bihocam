import sqlite3

db_path = 'C:/Users/Hp/Desktop/GitHub/bihocam/backend/bihocam.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Define unique Unsplash image mapping for each post by slug (foolproof encoding match)
mappings = {
    "yks-son-3-ay-netleri-artiracak-altin-kurallar": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    "verimli-calisma-saatleri-sabah-mi-gece-mi": "https://images.unsplash.com/photo-1518655061766-48f23af930f0?auto=format&fit=crop&w=600&q=80",
    "lgs-matematik-sorulari-nasil-cozulur-sifirdan-baslayanlar-icin": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    "sinav-stresiyle-bas-etmenin-5-bilimsel-yolu": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
    "online-egitimde-odaklanma-problemini-cozmenin-yollari": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    "tyt-turkce-dil-bilgisi-konularini-bitirme-rehberi": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    "pomodoro-teknigi-ile-ders-calisma-verimi-artirma": "https://images.unsplash.com/photo-1558021211-6d1403321394?auto=format&fit=crop&w=600&q=80",
    "lgs-fen-bilimleri-konu-dagilimi-ve-ipuclari": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    "hedef-belirleme-ve-icsel-motivasyon-basari-anahtari": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    "yapay-zeka-destekli-bireysel-ogrenim-sistemleri": "https://images.unsplash.com/photo-1484417894907-623942c8ea29?auto=format&fit=crop&w=600&q=80",
    "ayt-sayisal-konulari-calisma-programi-hazirlama": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    "feynman-teknigi-nedir-ogrendiklerini-unutmama": "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=80",
    "lgs-paragraf-sorularinda-hiz-kazanma-taktikleri": "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=600&q=80",
    "akran-baskisi-ve-sinav-doneminde-sosyal-cevre-yonetimi": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
    "evden-ders-calisirken-odaklanmayi-artiran-masa-duzeni": "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
}

updated_count = 0
for slug, img in mappings.items():
    cursor.execute("UPDATE blog_posts SET featured_image_url = ? WHERE slug = ?", (img, slug))
    if cursor.rowcount > 0:
        updated_count += 1
        print(f"Updated slug: '{slug}' -> {img}")

conn.commit()
conn.close()
print(f"Successfully updated {updated_count} blog post image mappings using slugs!")
