# BiHocam İş Mantığı Sözlüğü (Glossary)

Bu dosya, BiHocam ekosistemindeki temel kavramların ve bunların teknik karşılıklarının açıklamalarını içerir.

## 👥 Kullanıcı ve Roller
- **Admin:** Platformun genel sahibi. Finansal ayarları (`commission_rate`) ve tüm kursları yönetebilir.
- **Staff:** Platform operasyon personeli. Destek ve içerik onaylama yetkileri vardır.
- **Organization (Kurum):** Bir kurumun (örneğin "X Dershanesi") yöneticisi. Kendi bünyesindeki öğrencileri ve öğretmenleri yönetebilir. `organization_id` üzerinden multi-tenant yapı sağlar.
- **Teacher (Eğitmen):** İçerik üreticisi. Kurs oluşturur (`Course`), ders ekler (`Lesson`) ve kazançlarını takip eder.
- **Student (Öğrenci):** İçerik tüketicisi. Kurs satın alır, izler ve quiz çözer.

## 📚 Eğitim İçerikleri
- **Course (Kurs):** Bir eğitmen tarafından oluşturulan ana eğitim paketi. İçinde dersler ve quizler barındırır. Durumları: `DRAFT`, `PUBLISHED`, `ARCHIVED`.
- **Lesson (Ders):** Kursun en küçük yapı birimi. Türleri: `VIDEO` (YouTube, Vimeo veya Yerel), `PDF`, `QUIZ`.
- **Preview (Önizleme):** Bir dersin ücretsiz olarak herkese açık olup olmadığını belirleyen bayrak (`is_preview`). Pazarlama için kullanılır.
- **Quiz:** Derslerin içine gömülen veya bağımsız olan sınavlar. Geçme notu (`passing_score`) ve deneme sınırı (`max_attempts`) gibi özelliklere sahiptir.

## 💰 Finansal ve Satış
- **Order (Sipariş):** Bir kullanıcının sepetindeki kursları satın alma işlemi. Durumları: `PENDING`, `PAID`, `FAILED`, `REFUNDED`.
- **Enrollment (Kayıt):** Bir öğrencinin bir kursa erişim hakkını temsil eden veritabanı kaydı. Başarılı bir `Order` sonrası otomatik oluşur.
- **Platform Commission:** Her satıştan BiHocam platformunun aldığı pay. Varsayılan oran %35'tir.
- **Teacher Earnings:** Satıştan komisyon düşüldükten sonra eğitmene kalan tutar.
- **Coupon (Kupon):** İndirim sağlayan kodlar. Yüzdesel (`PERCENTAGE`) veya sabit tutar (`FIXED`) olabilir.

## 📈 İlerleme ve Başarı
- **Lesson Progress:** Bir öğrencinin bir derste ne kadar ilerlediğini (izlenen saniye) ve tamamlayıp tamamlamadığını takip eder.
- **Course Progress:** Öğrencinin kurstaki tüm derslere göre yüzdesel tamamlanma oranı.
- **Certificate:** Bir kurs başarıyla tamamlandığında (tüm dersler bittiğinde ve quizler geçildiğinde) üretilen dijital belge.

---
*Knowledge Base Tooling - Gemini*
