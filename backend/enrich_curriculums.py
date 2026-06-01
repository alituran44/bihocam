import sqlite3
import os
import json

db_path = os.path.join(os.path.dirname(__file__), "bihocam.db")
print(f"Enriching database at {db_path}...")

conn = sqlite3.connect(db_path)
cursor = conn.cursor()

# Get all education programs
cursor.execute("SELECT id, slug, title, category, price, hours FROM education_programs")
programs = cursor.fetchall()

def get_rich_data(slug, title, category, price, hours):
    # Set default values
    price_val = price or 3999900
    orig_price = int(price_val * 1.25)
    
    # 1. Determine subject type
    subject = "genel"
    title_lower = title.lower()
    if "matematik" in title_lower or "geometri" in title_lower:
        subject = "matematik"
    elif "türkçe" in title_lower or "edebiyat" in title_lower:
        subject = "turkce"
    elif "fizik" in title_lower or "kimya" in title_lower or "biyoloji" in title_lower or "fen" in title_lower:
        subject = "fen"
    elif "tarih" in title_lower or "coğrafya" in title_lower or "felsefe" in title_lower or "sosyal" in title_lower or "inkılap" in title_lower:
        subject = "sosyal"
    elif "ingilizce" in title_lower or "dil" in title_lower:
        subject = "dil"

    # Start date based on category
    start_date = "15.09.2026 19:00"
    if category == "TYT":
        start_date = "05.10.2026 18:30"
    elif category == "AYT":
        start_date = "12.10.2026 19:30"
    elif category == "LGS":
        start_date = "22.09.2026 18:00"
    elif category == "YDT":
        start_date = "15.10.2026 20:00"

    # 2. What you learn (Kazanımlar)
    what_you_learn = []
    if subject == "matematik":
        what_you_learn = [
            "Temel kavramlardan ileri seviye teoremlere kadar tüm konularda derinlemesine matematiksel mantık kurma becerisi.",
            "ÖSYM ve MEB tarzı yeni nesil, günlük yaşam durumlarına uyarlanmış hikayeli soruların hızlı çözüm taktikleri.",
            "Formülleri ezberlemek yerine ispatları ve geometrik mantıklarıyla öğrenerek kalıcı bilgi edinimi.",
            "Zaman alıcı sorularda pratik kısayollar, şık eleme teknikleri ve süre yönetimi stratejileri.",
            "Soru analiz yeteneği geliştirerek sorunun hangi konudan ve hangi yöntemle çözüleceğini saniyeler içinde anlama.",
            "Hata analiz yöntemleriyle denemelerde sık yapılan dikkatsizliklerin sistematik tespiti ve giderilmesi.",
            "3D modellemeler ve animasyonlar eşliğinde soyut geometrik kavramların ve katı cisimlerin görselleştirilmesi."
        ]
    elif subject == "turkce":
        what_you_learn = [
            "Paragraf sorularında hızlı okuma, ana düşünceyi saniyeler içinde bulma ve yapı analizi teknikleri.",
            "Tüm dil bilgisi kurallarını (ses olayları, yapı, ögeler) pratik kodlamalar ve zihin haritalarıyla kalıcı öğrenme.",
            "Yazar-eser-dönem eşleştirmelerinde ezber yerine hafıza teknikleri ve görsel hikayeleştirme kartları.",
            "Sözel mantık ve muhakeme sorularında tablo oluşturma, olasılıkları sıralama ve hızlı analiz yöntemleri.",
            "ÖSYM'nin en çok tercih ettiği çeldirici soru kalıplarını tanıma ve şıkları kolayca eleme becerisi.",
            "Edebi sanatlar, şiir tahlili ve kafiye/redif bulmada hatasız pratik yöntemler.",
            "Kelime hazinesini genişleterek anlam bilgisi ve sözcükte anlam sorularında tam isabet oranına ulaşma."
        ]
    elif subject == "fen":
        what_you_learn = [
            "Fen konularının temel bilimsel mantıklarını ve formüllerin arkasındaki doğa yasalarını keşfetme.",
            "Deney düzenekleri, grafik yorumlama ve görsel tablolara dayalı soruları hatasız analiz etme becerisi.",
            "Ezberlemesi zor olan Latince terimleri, kimyasal reaksiyonları ve fizik kurallarını akılda kalıcı kodlama teknikleriyle öğrenme.",
            "ÖSYM ve MEB sınav müfredatıyla %100 uyumlu, yeni nesil deneysel ve günlük yaşam odaklı soru çözümleri.",
            "Ünite sonlarında yapılan branş bazlı denemelerle fen netlerini maksimum seviyeye çıkarma stratejileri.",
            "Laboratuvar ortamını aratmayan 3D animasyonlar ve görsel araçlarla soyut konuları somutlaştırma.",
            "Bilgi ve analiz düzeyindeki sorulara yönelik farklı çözüm yolları ve pratik zaman kazanma taktikleri."
        ]
    elif subject == "sosyal":
        what_you_learn = [
            "Tarihsel olayların sebep-sonuç ilişkilerini ve dönemlerin jeopolitik analizlerini kavrama.",
            "Harita okuma, izohips yorumlama, iklim grafikleri ve nüfus piramitlerini hatasız analiz etme becerisi.",
            "Felsefi terimler sözlüğü, filozof görüşleri ve kavram haritalarıyla sosyal bilimler netlerini garantileme.",
            "Ezber yerine kronoloji tabloları ve görsel özetler yardımıyla bilgilerin kalıcı hafızaya aktarılması.",
            "ÖSYM'nin en çok sorduğu yoruma dayalı uzun paragraf sorularında hızlı okuma ve doğru yorumlama teknikleri.",
            "Güncel çevre sorunları, küresel jeopolitik konumlar ve bölgesel kalkınma projeleri coğrafi analizleri.",
            "Deneme sınavları ve soru çözümleriyle sosyal bilimler sorularında %100 başarı oranına ulaşma stratejileri."
        ]
    elif subject == "dil":
        what_you_learn = [
            "Sınavlarda en çok çıkan ileri düzey kelimelerin (vocabulary) eş ve zıt anlamlarıyla birlikte kalıcı öğrenimi.",
            "Dil bilgisi (grammar) yapılarını formülleştirmeden, kullanım mantığıyla hatasız öğrenme teknikleri.",
            "Paragraf, diyalog tamamlama ve anlamca en yakın cümleyi bulma sorularında hızlı ipuçları ve çözüm taktikleri.",
            "Çeviri (translation) sorularında bağlaçlar ve temel cümle ögelerinden yararlanarak saniyeler içinde doğru cevaba ulaşma.",
            "Okuma-anlama (reading comprehension) becerisini geliştirecek zengin metin analizleri ve soru çözümleri.",
            "Yabancı dil sınavlarında süre yönetimi, stres kontrolü ve taktiksel şık eleme stratejileri.",
            "Kelime kartları ve interaktif quizler yardımıyla kelime bilgisini düzenli olarak pekiştirme desteği."
        ]
    else:  # Genel dersler (TYT Tüm Dersler vb.)
        what_you_learn = [
            "Müfredattaki tüm alan derslerini kapsayan, sınav odaklı derinlemesine konu anlatımı ve soru çözümleri.",
            "Yeni nesil beceri temelli ve hikayeleştirilmiş sorular için hızlı ve pratik çözüm yolları.",
            "Zaman yönetimi, sınav stratejileri, şık eleme yöntemleri ve sınav stres kontrolü eğitimleri.",
            "Yapay zeka destekli eksik analizi sistemiyle zayıf olunan konuların anında tespiti ve takviyesi.",
            "Branş bazlı ve genel deneme sınavlarıyla gerçek sınav provası ve başarı eğrisi takibi.",
            "Uzman öğrenci koçları tarafından yapılan haftalık bireysel ders çalışma planlaması.",
            "Akademik gelişim danışmanlığı, rehberlik faaliyetleri ve düzenli veli bilgilendirme sistemi."
        ]

    # 3. Short description
    short_description = f"derslerimizin tüm verimiyle başlamasıyla hazırlanan {category} programları; canlı ders, deneme ve rehberlik desteğiyle tek platformda kolaylaşıyor. Sınav müfredatına uygun kaynaklarla konuşurken, profesyonel takip sistemiyle gelişiminizi anlık izleyebilirsiniz. Başarıya giden hazırlamak için eğitim programlarımızı hemen keşfedin."

    # 4. Description (Açıklama)
    description = (
        f"Bu program sayesinde {category} {title.replace('Eğitim Programı', '')} sınavına hazırlık sürecinde tüm müfredat konularını planlı ve sistemli bir şekilde çalışabilir, "
        f"düzenli deneme sınavlarıyla seviyenizi anlık olarak takip edebilirsiniz. Eğitim programı kapsamında toplam {hours or 120} saat canlı eğitim gerçekleştirilir. "
        f"Program süresince öğrenciler; kapsamlı konu anlatım videoları, geniş soru çözümü videoları ile derslerin temel prensiplerini ve görsel hafızaya dayalı konularını eksiksiz şekilde pekiştirir. "
        f"Ayrıca süreç boyunca uygulanan deneme ve seviye belirleme testleri ile gelişim grafiği düzenli olarak ölçülür. "
        f"Eğitim süresince akademik kariyer ve rehberlik danışmanlığı, birebir öğrenci koçluğu ve veli bilgilendirme sistemi eşlik eder. "
        f"Program, bireysel öğrenme verimliliğini korumak amacıyla 20 kişilik sınırlı kontenjan ile yürütülür."
    )

    # 5. Curriculum Intro (Bu Eğitim Programında sizi neler bekliyor?)
    curriculum_intro = (
        f"Bu program kapsamında {category} {title.replace('Eğitim Programı', '')} müfredatı öğrencinin hem ezberden uzak mantık kurmasını sağlayacak hem de görsel hafızasını destekleyecek bir yapıda ele alınır. "
        f"Program süresince öğrenciler; yoğun canlı ders maratonunda her konunun püf noktalarını öğrenirken, video içerikler ve zengin soru havuzuyla teorik bilgilerini pratiğe dönüştürürler. "
        f"Uygulanan deneme ve seviye belirleme testleri, öğrencinin sınav provasını defalarca yapmasına olanak tanıyarak gerçek sınav stresini minimize eder. "
        f"Akademik rehberlik, öğrenci koçluğu ve veli bilgilendirme sistemi sayesinde hazırlık süreci, öğrencinin motivasyonunu her zaman yüksek tutarak profesyonel bir takiple tamamlanır."
    )

    # 6. FAQs
    faqs = [
        {
            "q": "Dersler canlı mıdır?",
            "a": f"Evet, {title} kapsamındaki tüm derslerimiz alanında uzman eğitmenlerimizle etkileşimli ve canlı olarak işlenmektedir. Canlı ders sırasında aklınıza takılan tüm soruları eğitmenimize anlık olarak yöneltebilirsiniz."
        },
        {
            "q": "Yapay Zeka Destekli Öğretim Sistemi nasıl çalışıyor?",
            "a": "Yapay zeka sistemimiz, çözdüğünüz testleri ve girdiğiniz deneme sınavlarındaki başarı oranlarınızı analiz eder. Zayıf olduğunuz alt konuları belirleyerek size özel çalışma önerileri ve pekiştirme soruları sunar."
        },
        {
            "q": "Kaçırılan derslerin tekrarını izleyebilir miyim?",
            "a": "Kesinlikle! İşlenen tüm canlı derslerin kayıtları ders bitiminden hemen sonra profilinize eklenir. Sınav gününe kadar tüm ders kayıtlarını 7/24 sınırsız olarak yeniden izleyebilirsiniz."
        },
        {
            "q": "Deneme sınavları ve soru havuzu içeriği nasıldır?",
            "a": f"Program süresince müfredata tam uyumlu online deneme sınavları uygulanır. Ayrıca binlerce sorudan oluşan çözümlü soru havuzuna erişiminiz açılır. Her sorunun detaylı video çözümü mevcuttur."
        },
        {
            "q": "Rehberlik ve koçluk desteği veriliyor mu?",
            "a": "Evet, haftalık olarak rehber öğretmenlerimiz tarafından kişisel çalışma programınız hazırlanır, motivasyon ve zaman yönetimi koçluğu verilir. Ayrıca veli bilgilendirme sistemiyle süreç ailenizle de paylaşılır."
        }
    ]

    # 7. Reviews
    reviews = [
        {
            "name": "Buse K.",
            "score": 5,
            "role": "Öğrenci",
            "text": f"Derslerin işleniş tarzı çok iyi, hocalar ezberletmek yerine mantığını öğretiyor. Bu program sayesinde netlerimde inanılmaz bir artış oldu. Kesinlikle tavsiye ederim.",
            "date": "3 gün önce"
        },
        {
            "name": "Ahmet E.",
            "score": 5,
            "role": "Öğrenci",
            "text": "Canlı derslerin kalitesi ve hocaların ilgisi harika. Anlamadığım yerleri anında sorabiliyorum. Kaçırdığım dersleri de kayıttan izlemek çok büyük avantaj.",
            "date": "1 hafta önce"
        },
        {
            "name": "Merve T.",
            "score": 5,
            "role": "Öğrenci",
            "text": "Yapay zeka destekli eksik analizi gerçekten işe yarıyor. Hangi konulara çalışmam gerektiğini bana tek tek gösterdi. Çok sistemli bir eğitim programı.",
            "date": "2 hafta önce"
        }
    ]

    return {
        "price": price_val,
        "original_price": orig_price,
        "subtitle": "okuldaveevde",
        "short_description": short_description,
        "description": description,
        "curriculum_intro": curriculum_intro,
        "kontenjan": 20,
        "start_date": start_date,
        "what_you_learn": what_you_learn,
        "faqs": faqs,
        "reviews": reviews
    }

# Update all programs in DB
print("Updating all programs with rich, explanatory content...")
count = 0
for prog_id, slug, title, category, price, hours in programs:
    # Skip manual tyt-biyoloji since we did it with extreme detail, but wait, the Python script format is rich enough
    # and has specific templates, so let's enrich all of them including tyt-biyoloji (or tyt-biyoloji gets its custom detailed ones)
    data = get_rich_data(slug, title, category, price, hours)
    
    # Custom values for tyt-biyoloji to preserve our manual work
    if slug == "tyt-biyoloji":
        data["price"] = 2999900
        data["original_price"] = 3999900
        data["start_date"] = "05.01.2026 20:00"
        # preserve what_you_learn points
        data["what_you_learn"] = [
            "Hücre yapısı, organeller ve hücre bölünmeleri süreçlerinin detaylı analizi",
            "Kalıtım ilkeleri, genetik varyasyonlar ve soy ağacı çözümleri teknikleri",
            "Canlıların sınıflandırılması ve biyolojik çeşitliliğin temel kriterleri",
            "Ekosistem ekolojisi, madde döngüleri ve güncel çevre sorunlarına yönelik yorumlama becerileri",
            "Biyoloji sorularında sıkça karşılaşılan hatalı, grafik ve deney düzeneklerini analiz etme yöntemleri",
            "Yeni nesil TYT biyoloji soru tiplerine yönelik hızlı ve doğru çözüm stratejileri",
            "Bilimsel yöntemlerin ve karmaşık biyolojik süreçlerin akılda kalıcı kodlama teknikleri",
            "Branş bazlı denemeler ile ünite bazlı eksiklerin sistematik tespiti",
            "30 farklı deneme sınavı ile sınav anı yönetimi ve biyoloji netini maksimum sürede arttırma becerisi"
        ]

    # Convert complex structures to JSON strings for SQLite
    what_you_learn_json = json.dumps(data["what_you_learn"], ensure_ascii=False)
    faqs_json = json.dumps(data["faqs"], ensure_ascii=False)
    reviews_json = json.dumps(data["reviews"], ensure_ascii=False)

    cursor.execute(
        """
        UPDATE education_programs 
        SET price = ?, original_price = ?, subtitle = ?, short_description = ?, 
            description = ?, curriculum_intro = ?, kontenjan = ?, start_date = ?, 
            what_you_learn = ?, faqs = ?, reviews = ?
        WHERE id = ?
        """,
        (
            data["price"],
            data["original_price"],
            data["subtitle"],
            data["short_description"],
            data["description"],
            data["curriculum_intro"],
            data["kontenjan"],
            data["start_date"],
            what_you_learn_json,
            faqs_json,
            reviews_json,
            prog_id
        )
    )
    count += 1

conn.commit()
conn.close()
print(f"Successfully enriched {count} education programs in bihocam.db!")
