import sqlite3

conn = sqlite3.connect('bihocam.db')
cursor = conn.cursor()

# Define image mapping
mappings = {
    "YKS'de Son 3 Ay: Netlerinizi Artıracak Altın Kurallar": "/yks_study.png",
    "Verimli Çalışma Saatleri: Sabah mı, Gece mi Çalışmalı?": "/time_management.png",
    "LGS Matematik Soruları Nasıl Çözülür? Sıfırdan Başlayanlar İçin": "/math_study.png",
    "Sınav Stresiyle Baş Etmenin 5 Bilimsel Yolu": "/calm_student.png",
    "Online Eğitimde Odaklanma Problemini Çözmenin Yollarından": "/online_learning.png",
    "Online Eğitimde Odaklanma Problemini Çözmenin Yolları": "/online_learning.png",
    "TYT Türkçe Dil Bilgisi Konularını Bitirme Rehberi": "/calm_student.png",
    "Pomodoro Tekniği ile Ders Çalışma Veriminizi 2 Katına Çıkarın": "/time_management.png",
    "LGS'de Fen Bilimleri Konu Dağılımı ve Sınav İpuçları": "/math_study.png",
    "Hedef Belirleme ve İçsel Motivasyon: Başarının Gizli Anahtarı": "/yks_study.png",
    "Yapay Zeka Destekli Bireysel Öğrenim Sistemlerinin Faydaları": "/ai_study.png",
    "AYT Sayısal Konular İçin Çalışma Programı Nasıl Hazırlanır?": "/math_study.png",
    "AYT Sayısal Konuları İçin Çalışma Programı Nasıl Hazırlanır?": "/math_study.png",
    "Feynman Tekniği Nedir? Öğrendiklerinizi Bir Daha Unutmayın": "/time_management.png",
    "LGS Paragraf Sorularında Hız Kazanmanın 4 Püf Noktası": "/calm_student.png",
    "Akran Baskısı ve Sınav Döneminde Sosyal Çevre Yönetimi": "/calm_student.png",
    "Evden Ders Çalışırken Odaklanmayı Artıran 5 Masa Düzeni İpucu": "/time_management.png"
}

updated_count = 0
for title, img in mappings.items():
    cursor.execute("UPDATE blog_posts SET featured_image_url = ? WHERE title LIKE ?", (img, f"%{title}%"))
    if cursor.rowcount > 0:
        updated_count += 1
        print(f"Updated: '{title}' -> {img}")

conn.commit()
conn.close()
print(f"Successfully updated {updated_count} blog post image mappings!")
