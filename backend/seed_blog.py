import asyncio
import sys
from datetime import datetime, timedelta
from uuid import uuid4

# Ensure app modules are importable
sys.path.insert(0, ".")

from sqlalchemy import select
from app.db.session import AsyncSessionLocal
from app.models.user import User, UserRole
from app.models.blog_post import BlogPost, BlogPostStatus
from app.models.blog_category import BlogCategory
from app.models.blog_tag import BlogTag

async def seed_blog():
    async with AsyncSessionLocal() as db:
        print("Blog seed verileri oluşturuluyor...")
        
        # 1. Yazar Seçimi (Admin veya ilk öğretmen)
        user_res = await db.execute(select(User).filter(User.role == UserRole.ADMIN))
        author = user_res.scalar_one_or_none()
        if not author:
            user_res = await db.execute(select(User).filter(User.role == UserRole.TEACHER))
            author = user_res.scalar_one_or_none()
        
        if not author:
            print("HATA: Veritabanında yazar olarak atanacak kullanıcı (admin veya öğretmen) bulunamadı.")
            return

        print(f"Yazar olarak seçilen kullanıcı: {author.full_name} ({author.email})")

        # 2. Blog Kategorilerinin Oluşturulması
        categories_data = [
            ("YKS Hazırlık", "yks-hazirlik", "Üniversiteye hazırlık tüyoları, ders bazlı taktikler ve çalışma stratejileri.", "#4f46e5"),
            ("LGS Hazırlık", "lgs-hazirlik", "Liselere geçiş sınavı için rehberlik, ders çalışma programları ve tavsiyeler.", "#0ea5e9"),
            ("Çalışma Taktikleri", "calisma-taktikleri", "Pomodoro, Feynman ve diğer bilimsel ders çalışma metotları.", "#10b981"),
            ("Rehberlik & Motivasyon", "rehberlik-motivasyon", "Sınav kaygısı yönetimi, hedeflere odaklanma ve başarı hikayeleri.", "#f59e0b"),
            ("Eğitim Teknolojileri", "egitim-teknolojileri", "Dijital öğrenme platformları, yapay zeka destekleri ve verimli çalışma araçları.", "#ec4899")
        ]

        categories = {}
        for name, slug, desc, color in categories_data:
            # Varsa çek, yoksa ekle
            cat_res = await db.execute(select(BlogCategory).filter(BlogCategory.slug == slug))
            cat = cat_res.scalar_one_or_none()
            if not cat:
                cat = BlogCategory(
                    id=str(uuid4()),
                    name=name,
                    slug=slug,
                    description=desc,
                    color=color,
                    is_active=True
                )
                db.add(cat)
                await db.flush()
                print(f"Kategori eklendi: {name}")
            categories[slug] = cat

        # 3. Blog Yazıları Listesi
        posts_data = [
            {
                "title": "YKS'de Son 3 Ay: Netlerinizi Artıracak Altın Kurallar",
                "slug": "yks-son-3-ay-netleri-artiracak-altin-kurallar",
                "excerpt": "Sınava az bir zaman kala çalışmalarınızı maksimum verime ulaştırmak ve netlerinizi yukarı taşımak için uygulamanız gereken altın taktikler.",
                "content": "<p>YKS hazırlık sürecinde son 3 aya girmek, birçok aday için stresli görünse de aslında eksiklerin kapatılması ve netlerin hızla artırılması için en kritik dönemdir.</p><h3>1. Deneme Sınavı Sıklığını Artırın</h3><p>Artık konu çalışmak yerine eksiklerinizi denemeler üzerinden tespit etmelisiniz. Haftada en az 2 TYT ve 1 AYT genel denemesi çözmeye özen gösterin.</p><h3>2. Analiz Yapmadan Deneme Çözmeyin</h3><p>Çözdüğünüz her deneme sonrasında yanlış ve boş bıraktığınız soruların mutlaka doğrusunu öğrenin. Yanlış yapılan konulara 15 dakikalık hızlı tekrarlar uygulayın.</p><h3>3. Zaman Yönetimine Odaklanın</h3><p>TYT sınavında süre problemi yaşamamak adına turlama tekniğini aktif şekilde kullanın. Çözemediğiniz sorularla inatlaşmayın.</p>",
                "cat_slug": "yks-hazirlik",
                "is_featured": True,
                "days_ago": 1
            },
            {
                "title": "Verimli Çalışma Saatleri: Sabah mı, Gece mi Çalışmalı?",
                "slug": "verimli-calisma-saatleri-sabah-mi-gece-mi",
                "excerpt": "Kendi biyolojik saatinize göre ders çalışma veriminizi nasıl optimize edebileceğinizi bilimsel araştırmalar ışığında açıklıyoruz.",
                "content": "<p>Ders çalışırken en çok merak edilen konulardan biri de hangi saat dilimlerinin öğrenmeye daha uygun olduğudur. Bilimsel veriler her bireyin kronotipinin (biyolojik saatinin) farklı olduğunu göstermektedir.</p><h3>1. Sabah Çalışmasının Avantajları</h3><p>Erken saatlerde zihin dinçtir ve dış uyarıcılar (sosyal medya, gürültü vb.) minimum düzeydedir. Odaklanma gerektiren zor konular sabah saatlerinde daha hızlı kavranabilir.</p><h3>2. Gece Çalışmasının Avantajları</h3><p>Gecenin sessizliği derin odaklanmayı (deep work) kolaylaştırır. Yaratıcı çalışmalar veya uzun süreli projeler gece vakitlerinde daha verimli yürütülebilir.</p><h3>3. Önemli Olan Düzen</h3><p>Hangi saatte çalışırsanız çalışın, en önemli kural uykunuzu kaliteli almanız ve günlük rutininizi sabit tutmanızdır.</p>",
                "cat_slug": "calisma-taktikleri",
                "is_featured": False,
                "days_ago": 2
            },
            {
                "title": "LGS Matematik Soruları Nasıl Çözülür? Sıfırdan Başlayanlar İçin",
                "slug": "lgs-matematik-sorulari-nasil-cozulur-sifirdan-baslayanlar-icin",
                "excerpt": "LGS'nin en belirleyici dersi olan matematikte, yeni nesil soruları anlama ve çözme yeteneğinizi adım adım geliştirecek kılavuz.",
                "content": "<p>LGS Matematik dersindeki yeni nesil sorular, sadece formül ezberleyen öğrencileri değil, okuduğunu anlayan ve yorumlayan öğrencileri seçmeyi amaçlar.</p><h3>1. Temel İşlem Yeteneğinizi Güçlendirin</h3><p>Denklemler, rasyonel sayılar ve çarpanlar-katlar gibi temel konularda işlem hızınızı artırın. Temeli olmayan bir öğrencinin yeni nesil sorularda başarılı olması zordur.</p><h3>2. Soruyu Görselleştirin</h3><p>Verilen problemleri şema çizerek veya şekillerle ifade ederek somutlaştırın. Bu, sorunun mantığını anlamanızı kolaylaştırır.</p><h3>3. Her Gün En Az 20 Soru Çözün</h3><p>Matematik pratik gerektiren bir derstir. Süreklilik sağlayarak her gün farklı tipte sorular çözmeye özen gösterin.</p>",
                "cat_slug": "lgs-hazirlik",
                "is_featured": False,
                "days_ago": 3
            },
            {
                "title": "Sınav Stresiyle Baş Etmenin 5 Bilimsel Yolu",
                "slug": "sinav-stresiyle-bas-etmenin-5-bilimsel-yolu",
                "excerpt": "Sınav dönemlerinde artan kaygı ve stresi kontrol altına alarak ders verimliliğinizi artıracak kanıtlanmış zihinsel egzersizler.",
                "content": "<p>Sınav hazırlığında stres tamamen kaçınılması gereken bir durum değil, aksine belirli bir dozda motivasyonu artıran itici bir güçtür. Ancak fazlası performansı düşürür.</p><h3>1. Diyafram Nefesi Egzersizleri</h3><p>Stres anında kalp ritminiz hızlandığında, burnunuzdan 4 saniyede derin nefes alıp 8 saniyede vererek parasempatik sinir sisteminizi devreye sokun.</p><h3>2. Düzenli Fiziksel Aktivite</h3><p>Günde 20-30 dakikalık tempolu yürüyüşler vücuttaki kortizol (stres) hormonunu azaltır ve endorfin salgılatır.</p><h3>3. Zihinsel Prova (Visualisation)</h3><p>Sınav salonunda sakin bir şekilde soruları çözdüğünüzü ve başarılı olduğunuzu gözünüzde canlandırın. Beyin hayal edilenle gerçek durum arasındaki farkı ayırt edemez.</p>",
                "cat_slug": "rehberlik-motivasyon",
                "is_featured": True,
                "days_ago": 4
            },
            {
                "title": "Online Eğitimde Odaklanma Problemini Çözmenin Yolları",
                "slug": "online-egitimde-odaklanma-problemini-cozmenin-yollari",
                "excerpt": "Ekran karşısında ders dinlerken dikkatinizin dağılmasını önleyecek ve veriminizi artıracak pratik dijital masa düzeni önerileri.",
                "content": "<p>Çevrimiçi eğitimler büyük kolaylıklar sunsa da ev ortamının getirdiği dikkat dağıtıcı unsurlar odaklanmayı zorlaştırabilir.</p><h3>1. Ders Esnasında Bildirimleri Kapatın</h3><p>Telefonunuzu sessize alın ve ekranını göremeyeceğiniz bir yere koyun. Bilgisayardaki gereksiz tarayıcı sekmelerini kapatın.</p><h3>2. Kamera ve Aktif Katılım</h3><p>Ders esnasında not tutarak ve eğitmenin sorularına yanıtlar vererek aktif kalın. Pasif dinleme uykuyu ve dikkat dağılmasını tetikler.</p><h3>3. Ayrı Bir Çalışma Alanı Yaratın</h3><p>Yatağınızda veya koltukta değil, dik durabileceğiniz bir masa başında dersleri takip edin.</p>",
                "cat_slug": "egitim-teknolojileri",
                "is_featured": False,
                "days_ago": 5
            },
            {
                "title": "TYT Türkçe Dil Bilgisi Konularını Bitirme Rehberi",
                "slug": "tyt-turkce-dil-bilgisi-konularini-bitirme-rehberi",
                "excerpt": "Sözcük türleri, ses bilgisi ve yazım kuralları gibi TYT Türkçe'de her yıl mutlaka soru çıkan konuları hızlıca bitirme programı.",
                "content": "<p>TYT Türkçe sınavında 40 sorunun yaklaşık 7-10 adedi doğrudan dil bilgisi konularından gelmektedir. Bu soruları hızlıca çözmek size paragrafta zaman kazandıracaktır.</p><h3>1. Ses Bilgisi ile Başlayın</h3><p>Her yıl en az 1 sorunun çıktığı ses bilgisi konusunu kuralları ezberlemeden, bol bol kelime tahlili yaparak çalışın.</p><h3>2. Sözcük Türleri ve Cümlenin Ögeleri</h3><p>İsim, sıfat, zamir ve zarf konularını oturtmadan cümlenin ögelerine geçmeyin. Konular zincirleme bir mantıkla birbirine bağlıdır.</p><h3>3. Yazım Kuralları ve Noktalama</h3><p>TDK'nın güncel kurallarını içeren kısa notlar hazırlayın ve her gün 5 dakika bu notlara göz atın.</p>",
                "cat_slug": "yks-hazirlik",
                "is_featured": False,
                "days_ago": 6
            },
            {
                "title": "Pomodoro Tekniği ile Ders Çalışma Veriminizi 2 Katına Çıkarın",
                "slug": "pomodoro-teknigi-ile-ders-calisma-verimi-artirma",
                "excerpt": "Zamanı verimli kullanmanızı sağlayan, odaklanma sürenizi uzatan ve ders çalışırken yorulmanızı engelleyen popüler Pomodoro tekniği.",
                "content": "<p>Ders çalışırken masada saatlerce kalmanıza rağmen verim alamıyorsanız Pomodoro tekniği tam size göre olabilir.</p><h3>1. Pomodoro Nedir?</h3><p>25 dakika kesintisiz ders çalışma ve ardından gelen 5 dakikalık dinlenme sürecinden oluşan bir zaman yönetim sistemidir. Her 4 periyottan sonra 25-30 dakikalık uzun bir mola verilir.</p><h3>2. Molaları Doğru Değerlendirin</h3><p>5 dakikalık mola esnasında kesinlikle telefona bakmayın. Ayağa kalkın, esneyin, su için veya pencereden temiz hava alın.</p><h3>3. Kesintileri Not Edin</h3><p>Çalışma esnasında aklınıza gelen başka işleri bir kağıda yazıp hemen derse geri dönün. O işlerle mola vaktinde ilgilenin.</p>",
                "cat_slug": "calisma-taktikleri",
                "is_featured": False,
                "days_ago": 7
            },
            {
                "title": "LGS'de Fen Bilimleri Konu Dağılımı ve Sınav İpuçları",
                "slug": "lgs-fen-bilimleri-konu-dagilimi-ve-ipuclari",
                "excerpt": "LGS Fen Bilimleri testinde yüksek netler elde etmek için hangi ünitelere ağırlık vermeniz gerektiğini ve deneysel soruların çözüm yollarını paylaşıyoruz.",
                "content": "<p>Fen Bilimleri dersi, LGS'de katsayısı yüksek olan ve sayısal bölümde yer alan kritik derslerden biridir.</p><h3>1. Mevsimler ve İklim / DNA ve Genetik Kod</h3><p>Bu ilk iki ünite, LGS sınavında en fazla soru getiren ünitelerin başında gelir. Temel kavramları çok iyi öğrenin.</p><h3>2. Deney Düzenekleri ve Değişkenler</h3><p>Bağımlı değişken, bağımsız değişken ve kontrol edilen değişken kavramlarını içeren deney sorularını çözebilmek için bol bol deneysel soru tipi inceleyin.</p><h3>3. Görsel Soruları Okuma</h3><p>Grafik ve tablo yorumlama becerilerinizi geliştirin. Fen sorularındaki uzun paragraflar genellikle sorunun çözümünü içinde barındırır.</p>",
                "cat_slug": "lgs-hazirlik",
                "is_featured": False,
                "days_ago": 8
            },
            {
                "title": "Hedef Belirleme ve İçsel Motivasyon: Başarının Gizli Anahtarı",
                "slug": "hedef-belirleme-ve-icsel-motivasyon-basari-anahtari",
                "excerpt": "Dışsal ödüllere ihtiyaç duymadan, hedeflerinize emin adımlarla yürümenizi sağlayacak içsel motivasyonu geliştirme yöntemleri.",
                "content": "<p>Ders çalışırken motivasyonunuzun sürekli dalgalanması oldukça doğaldır. Önemli olan motivasyon düştüğünde dahi çalışmaya devam edecek disipline sahip olmaktır.</p><h3>1. Akıllı Hedefler (SMART) Belirleyin</h3><p>'Çok ders çalışacağım' yerine 'Bu akşam TYT Matematik'ten 40 soru çözeceğim' gibi net, ölçülebilir ve gerçekçi hedefler belirleyin.</p><h3>2. Amacınızı Kendinize Hatırlatın</h3><p>Neden bu sınava çalıştığınızı, kazanmak istediğiniz üniversiteyi veya bölümü gösteren görselleri çalışma masanıza asın.</p><h3>3. Kendinizi Ödüllendirin</h3><p>Haftalık hedeflerinizi tamamladığınızda kendinize sevdiğiniz bir aktiviteyi yapma veya bir film izleme ödülü verin.</p>",
                "cat_slug": "rehberlik-motivasyon",
                "is_featured": False,
                "days_ago": 9
            },
            {
                "title": "Yapay Zeka Destekli Bireysel Öğrenim Sistemlerinin Faydaları",
                "slug": "yapay-zeka-destekli-bireysel-ogrenim-sistemleri",
                "excerpt": "Eğitim teknolojilerindeki en son devrim olan yapay zeka asistanlarının öğrencilerin eksiklerini kapatmadaki kritik rolü.",
                "content": "<p>Eğitimde yapay zeka kullanımı, her öğrencinin kendine özgü hızda öğrenmesini sağlayan kişiselleştirilmiş bir deneyim sunar.</p><h3>1. Anında Geri Bildirim</h3><p>Yapay zeka asistanları, çözemediğiniz bir sorunun adım adım çözümünü anında sunarak öğrenme sürecinizin kesintiye uğramasını engeller.</p><h3>2. Kişisel Eksik Analizi</h3><p>Çözdüğünüz testlerdeki hata kalıplarını inceleyerek hangi konularda eksik olduğunuzu tespit eder ve size özel tekrar testleri oluşturur.</p><h3>3. Esnek Zamanlama</h3><p>7/24 yanınızda olan bir dijital eğitmen sayesinde, istediğiniz saatte ve istediğiniz mekanda kaliteli eğitim desteği alabilirsiniz.</p>",
                "cat_slug": "egitim-teknolojileri",
                "is_featured": True,
                "days_ago": 10
            },
            {
                "title": "AYT Sayısal Konuları İçin Çalışma Programı Nasıl Hazırlanır?",
                "slug": "ayt-sayisal-konulari-calisma-programi-hazirlama",
                "excerpt": "Matematik, Fizik, Kimya ve Biyoloji derslerinde AYT müfredatını eksiksiz bitirmenizi sağlayacak örnek haftalık çalışma programı.",
                "content": "<p>AYT sınavı, TYT'ye kıyasla tamamen bilgiye dayalıdır ve sayısal bölüm öğrencilerinin hedeflerine ulaşmasında asıl belirleyici rolü üstlenir.</p><h3>1. AYT Matematik: LTI (Limit-Türev-İntegral)</h3><p>Sayısalcılar için AYT Matematik'in kalbi bu üçlüde atar. Fonksiyonlar ve trigonometri konularını tam olarak kavramadan bu konulara başlamayın.</p><h3>2. AYT Fizik: Mekanik ve Elektrik</h3><p>Fizik dersinde formülleri ezberlemek yerine fiziksel yasaların mantığını kavramaya çalışın. Vektörler ve tork gibi temel konuları çok iyi öğrenin.</p><h3>3. Konu Bitirme Sırası</h3><p>Haftalık programınızda zorlandığınız bir ders ile kolay kavradığınız bir dersi ardışık yerleştirerek zihinsel yorgunluğu azaltın.</p>",
                "cat_slug": "yks-hazirlik",
                "is_featured": False,
                "days_ago": 11
            },
            {
                "title": "Feynman Tekniği Nedir? Öğrendiklerinizi Bir Daha Unutmayın",
                "slug": "feynman-teknigi-nedir-ogrendiklerini-unutmama",
                "excerpt": "Nobel ödüllü fizikçi Richard Feynman'ın karmaşık konuları en basit düzeyde kalıcı olarak öğrenmek için geliştirdiği 4 adımlı metot.",
                "content": "<p>Bir konuyu çalıştığınız halde kısa sürede unutuyorsanız, öğrenme metodunuzda bir eksiklik olabilir. Feynman Tekniği, bilgiyi kalıcı hale getirmenin en güçlü yoludur.</p><h3>1. Konuyu Seçin ve Çalışın</h3><p>Öğrenmek istediğiniz konuyu belirleyin ve temel kaynaklardan derinlemesine okuyun.</p><h3>2. Konuyu Bir Çocuğa Anlatır Gibi Anlatın</h3><p>Boş bir odaya geçin ve konuyu karşınızda 10 yaşında bir çocuk varmış gibi, hiç terim kullanmadan, en sade dille anlatmaya çalışın.</p><h3>3. Tıkandığınız Noktaları Belirleyin</h3><p>Anlatırken zorlandığınız veya boşluk bıraktığınız kısımları not edin. Bu kısımlar sizin konuyu tam olarak öğrenemediğiniz eksik alanlarınızdır.</p><h3>4. Kaynaklara Dönün ve Sadeleştirin</h3><p>Eksik olduğunuz kısımları tekrar okuyun, anlatımınızı daha da basitleştirip hikayeleştirerek kalıcı hale getirin.</p>",
                "cat_slug": "calisma-taktikleri",
                "is_featured": False,
                "days_ago": 12
            },
            {
                "title": "LGS Paragraf Sorularında Hız Kazanmanın 4 Püf Noktası",
                "slug": "lgs-paragraf-sorularinda-hiz-kazanma-taktikleri",
                "excerpt": "LGS Türkçe testinin ağırlıklı kısmını oluşturan paragraf sorularını hızlı ve sıfır hata ile çözmenizi sağlayacak stratejiler.",
                "content": "<p>LGS Türkçe sınavında başarılı olmanın yolu, hızlı okuyup doğru anlamaktan geçer. Paragraf soruları sınav süresini yönetmenizde kilit rol oynar.</p><h3>1. Önce Soru Kökünü Okuyun</h3><p>Paragrafa başlamadan önce soru kökünü okuyarak paragrafta neyi aramanız gerektiğini belirleyin. Bu, metni ikinci kez okuma ihtiyacını ortadan kaldırır.</p><h3>2. Her Gün 15-20 Paragraf Çözün</h3><p>Paragraf çözmeyi bir alışkanlık haline getirin. Rutin olarak her gün belirli miktarda soru çözmek okuma hızınızı ve dikkatinizi artıracaktır.</p><h3>3. Kitap Okuma Alışkanlığı</h3><p>Dönem boyunca düzenli olarak kitap okumak, kelime dağarcığınızı zenginleştirir ve soyut ifadeleri daha hızlı yorumlamanızı sağlar.</p>",
                "cat_slug": "lgs-hazirlik",
                "is_featured": False,
                "days_ago": 13
            },
            {
                "title": "Akran Baskısı ve Sınav Döneminde Sosyal Çevre Yönetimi",
                "slug": "akran-baskisi-ve-sinav-doneminde-sosyal-cevre-yonetimi",
                "excerpt": "Arkadaş çevrenizin sınav hazırlık sürecinizi sabote etmesini nasıl önleyebileceğinizi ve sınır koyma yöntemlerini ele alıyoruz.",
                "content": "<p>Sınav dönemlerinde arkadaşlarınızın çalışma tempoları, yaptıkları netler veya sizin hakkınızdaki yorumları üzerinizde baskı oluşturabilir.</p><h3>1. Kıyaslama Tuzağına Düşmeyin</h3><p>Her öğrencinin öğrenme hızı ve çalışma tarzı farklıdır. Kendinizi sadece bir gün önceki kendi halinizle kıyaslayın.</p><h3>2. Hayır Demeyi Öğrenin</h3><p>Çalışma saatlerinizde gelen dışarı çıkma veya oyun oynama tekliflerine kibarca 'Hayır' diyerek sınırlarınızı çizin.</p><h3>3. Sizi Destekleyen Arkadaşlar Edinin</h3><p>Size enerji veren, birlikte ders çalışabileceğiniz ve hedeflerinizi paylaşan motive edici arkadaş grupları içinde kalın.</p>",
                "cat_slug": "rehberlik-motivasyon",
                "is_featured": False,
                "days_ago": 14
            },
            {
                "title": "Evden Ders Çalışırken Odaklanmayı Artıran 5 Masa Düzeni İpucu",
                "slug": "evden-ders-calisirken-odaklanmayi-artiran-masa-duzeni",
                "excerpt": "Çalışma masanızın düzeni zihinsel netliğinizi ve odaklanma sürenizi doğrudan etkiler. İşte verimli bir çalışma alanı için ipuçları.",
                "content": "<p>Evden ders çalışırken dağınık bir masa, zihninizin de hızlıca dağılmasına ve yorulmanıza neden olur.</p><h3>1. Masada Sadece O An Çalıştığınız Dersin Malzemeleri Kalsın</h3><p>Fizik çalışırken masada kimya veya matematik kitaplarının durması zihinsel olarak bölünmenize ve stres yapmanıza sebep olur.</p><h3>2. Dikkat Dağıtıcı Unsurları Kaldırın</h3><p>Masanızda telefon, oyun konsolu kolları veya ilgisiz süs eşyaları bulundurmayın.</p><h3>3. Aydınlatma ve Ergonomi</h3><p>Mümkünse masanızı gün ışığı alan bir pencere kenarına koyun. Akşam çalışmaları için zihni uyku moduna sokmayan beyaz/sarı dengeli bir masa lambası tercih edin.</p>",
                "cat_slug": "calisma-taktikleri",
                "is_featured": False,
                "days_ago": 15
            }
        ]

        # 4. Yazıların Eklenmesi
        post_count = 0
        for pd in posts_data:
            # Varsa atla
            post_res = await db.execute(select(BlogPost).filter(BlogPost.slug == pd["slug"]))
            post = post_res.scalar_one_or_none()
            if not post:
                published_at = datetime.utcnow() - timedelta(days=pd["days_ago"])
                post = BlogPost(
                    id=str(uuid4()),
                    title=pd["title"],
                    slug=pd["slug"],
                    excerpt=pd["excerpt"],
                    content=pd["content"],
                    author_id=author.id,
                    status=BlogPostStatus.PUBLISHED,
                    published_at=published_at,
                    is_featured=pd["is_featured"],
                    view_count=100 + pd["days_ago"] * 12,
                    allow_comments=True
                )
                db.add(post)
                await db.flush()
                
                # Kategori ilişkisini kur
                cat = categories[pd["cat_slug"]]
                from app.models.blog_post import blog_post_categories
                await db.execute(blog_post_categories.insert().values(post_id=post.id, category_id=cat.id))
                
                post_count += 1
                print(f"Blog yazısı eklendi: {pd['title']}")

        await db.commit()
        print(f"\nSeed başarıyla tamamlandı: {post_count} yeni blog yazısı eklendi.")

if __name__ == "__main__":
    asyncio.run(seed_blog())
