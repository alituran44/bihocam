import sqlite3

db_path = 'C:/Users/Hp/Desktop/GitHub/bihocam/backend/bihocam.db'
conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Define unique Unsplash image mapping for each post
mappings = {
    "YKS'de Son 3 Ay: Netlerinizi Artıracak Altın Kurallar": "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    "Verimli Çalışma Saatleri: Sabah mı, Gece mi Çalışmalı?": "https://images.unsplash.com/photo-1518655061766-48f23af930f0?auto=format&fit=crop&w=600&q=80",
    "LGS Matematik Soruları Nasıl Çözülür? Sıfırdan Başlayanlar İçin": "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    "Sınav Stresiyle Baş Etmenin 5 Bilimsel Yolu": "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
    "Online Eğitimde Odaklanma Problemini Çözmenin Yolları": "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    "TYT Türkçe Dil Bilgisi Konularını Bitirme Rehberi": "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    "Pomodoro Tekniği ile Ders Çalışma Veriminizi 2 Katına Çıkarın": "https://images.unsplash.com/photo-1558021211-6d1403321394?auto=format&fit=crop&w=600&q=80",
    "LGS'de Fen Bilimleri Konu Dağılımı ve Sınav İpuçları": "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    "Hedef Belirleme ve İçsel Motivasyon: Başarının Gizli Anahtarı": "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    "Yapay Zeka Destekli Bireysel Öğrenim Sistemlerinin Faydaları": "https://images.unsplash.com/photo-1484417894907-623942c8ea29?auto=format&fit=crop&w=600&q=80",
    "AYT Sayısal Konuları İçin Çalışma Programı Nasıl Hazırlanır?": "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=600&q=80",
    "Feynman Tekniği Nedir? Öğrendiklerinizi Bir Daha Unutmayın": "https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=600&q=80",
    "LGS Paragraf Sorularında Hız Kazanmanın 4 Püf Noktası": "https://images.unsplash.com/photo-1488190211105-8b0e65b80b4e?auto=format&fit=crop&w=600&q=80",
    "Akran Baskısı ve Sınav Döneminde Sosyal Çevre Yönetimi": "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=600&q=80",
    "Evden Ders Çalışırken Odaklanmayı Artıran 5 Masa Düzeni İpucu": "https://images.unsplash.com/photo-1531482615713-2afd69097998?auto=format&fit=crop&w=600&q=80"
}

updated_count = 0
for title, img in mappings.items():
    cursor.execute("UPDATE blog_posts SET featured_image_url = ? WHERE title LIKE ?", (img, f"%{title}%"))
    if cursor.rowcount > 0:
        updated_count += 1
        print(f"Updated: '{title}' -> {img}")

conn.commit()
conn.close()
print(f"Successfully updated {updated_count} blog post image mappings to unique Unsplash photos!")
