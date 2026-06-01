import asyncio
from sqlalchemy import delete
from app.db.session import AsyncSessionLocal
from app.models.education_program import EducationProgram

PROGRAMS_DATA = [
    # ── 1. TYT TÜM DERSLER ──
    {
        "title": "TYT Tüm Dersler Eğitim Programı",
        "slug": "tyt-tum-dersler",
        "category": "TYT",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 6499900,
        "original_price": 7200000,
        "rating": 4.9,
        "review_count": 1389,
        "students": 12450,
        "hours": 280,
        "lessons": 0,
        "badge": "En Çok Satan",
        "description": "TYT kapsamındaki tüm dersleri (Türkçe, Matematik, Geometri, Fizik, Kimya, Biyoloji, Tarih, Coğrafya, Felsefe, Din Kültürü) sıfırdan en ileri düzeye kadar kapsayan, yeni nesil soru çözümleri ve sınav stratejileriyle zenginleştirilmiş bütünü kapsayan hazırlık programı.",
        "what_you_learn": [
            "TYT Türkçe dil bilgisi, paragraf teknikleri ve hızlı okuma becerileri.",
            "Temel Matematik kavramları, fonksiyonlar ve sınavda fark yaratan yeni nesil problem çözme metotları.",
            "Geometri vizyonu, üçgenler, çokgenler ve katı cisimlerin pratik kuralları.",
            "TYT Fen Bilimleri ve Sosyal Bilimler konularının eksiksiz müfredat hakimiyeti."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Türkçe Konuları (Sözcük, Cümle, Paragraf, Dil Bilgisi)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 2: Temel Matematik Konuları (Sayılar, Problemler, Fonksiyonlar)", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 3: Geometri Konuları (Üçgenler, Çokgenler, Analitik)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 4: Fizik Konuları (Mekanik, Elektrik, Optik, Dalgalar)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 5: Kimya Konuları (Atom, Bağlar, Maddenin Halleri, Kimya Her Yerde)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 6: Biyoloji Konuları (Hücre, Canlılar Dünyası, Kalıtım, Ekoloji)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 7: Tarih Konuları (İlk Çağlar, Selçuklu, Osmanlı, İnkılap Tarihi)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 8: Coğrafya Konuları (Doğa ve İnsan, Harita, İklim, Türkiye Coğrafyası)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 9: Felsefe Konuları (Bilgi, Varlık, Ahlak, Siyaset Felsefesi)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 10: Din Kültürü ve Ahlak Bilgisi (İnanç, İbadet, Hz. Muhammed, Ahlak)", "lessonCount": 0, "duration": "10 saat", "items": []}
        ],
        "faqs": [
            {"q": "Program kimler için uygundur?", "a": "Sıfırdan başlayan ya da temeli olup netlerini artırmak isteyen tüm TYT adayları için uygundur."},
            {"q": "Yeni nesil soruları kapsıyor mu?", "a": "Evet, ÖSYM'nin son 5 yılda sorduğu tüm yeni nesil soru mantığı detaylı olarak analiz edilmektedir."}
        ],
        "reviews": [
            {"name": "Emre K.", "score": 5, "role": "Öğrenci", "text": "Netlerim 45'ten 85'e çıktı. Harika bir program.", "date": "1 ay önce"}
        ],
        "active": True
    },
    # ── 2. YKS TÜM DERSLER TYT+AYT ──
    {
        "title": "YKS Tüm Dersler TYT+AYT Eğitim Programı",
        "slug": "yks-tum-dersler",
        "category": "YKS",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 7999900,
        "original_price": 9500000,
        "rating": 4.9,
        "review_count": 2180,
        "students": 18900,
        "hours": 520,
        "lessons": 0,
        "badge": "Popüler",
        "description": "Hem 1. Oturum (TYT) hem de 2. Oturum (AYT) tüm derslerini içeren, zenginleştirilmiş müfredat bölümleri, PDF kaynaklar ve canlı soru çözüm kamplarıyla desteklenen en kapsamlı YKS hazırlık programı.",
        "what_you_learn": [
            "TYT ve AYT sınavlarının ortak ve alana özel tüm konuları.",
            "Türev, İntegral, Limit, Modern Fizik, Organik Kimya gibi ağır AYT konularının pratik yöntemlerle anlatımı.",
            "Hızlı paragraf çözme teknikleri ve edebiyat yazar-eser ezber taktikleri.",
            "Deneme sınavı analizleri ile eksik tespiti ve nokta atışı telafi çalışmaları."
        ],
        "curriculum": [
            {"title": "Bölüm 1: TYT Türkçe ve Edebiyat Temelleri", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 2: TYT Matematik ve Geometri Temelleri", "lessonCount": 0, "duration": "60 saat", "items": []},
            {"title": "Bölüm 3: TYT Fen Bilimleri (Fizik, Kimya, Biyoloji)", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 4: TYT Sosyal Bilimler (Tarih, Coğrafya, Felsefe, Din)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 5: AYT İleri Matematik ve İleri Geometri", "lessonCount": 0, "duration": "90 saat", "items": []},
            {"title": "Bölüm 6: AYT Fizik, Kimya ve Biyoloji (Sayısal Alan)", "lessonCount": 0, "duration": "80 saat", "items": []},
            {"title": "Bölüm 7: AYT Türk Dili Edebiyatı ve Tarih-1 (Sözel / EA)", "lessonCount": 0, "duration": "60 saat", "items": []},
            {"title": "Bölüm 8: AYT Tarih-2, Coğrafya-2, Felsefe ve Sosyoloji (Sözel Alan)", "lessonCount": 0, "duration": "60 saat", "items": []},
            {"title": "Bölüm 9: YKS Deneme Sınavları ve Analiz Kampı", "lessonCount": 0, "duration": "40 saat", "items": []}
        ],
        "faqs": [
            {"q": "Canlı dersler kayıt ediliyor mu?", "a": "Evet, tüm canlı derslerimizin kayıtlarına sınav gününe kadar sınırsız erişebilirsiniz."}
        ],
        "reviews": [
            {"name": "Selma A.", "score": 5, "role": "Öğrenci", "text": "Derece yapmak isteyen herkes bu programı almalı.", "date": "2 hafta önce"}
        ],
        "active": True
    },
    # ── 3. AYT TÜM DERSLER ──
    {
        "title": "AYT Tüm Dersler Eğitim Programı",
        "slug": "ayt-tum-dersler",
        "category": "AYT",
        "gradient": "from-blue-900 via-cyan-800 to-teal-900",
        "price": 5999900,
        "original_price": 7100000,
        "rating": 4.9,
        "review_count": 945,
        "students": 7650,
        "hours": 320,
        "lessons": 0,
        "badge": "YKS 2. Oturum",
        "description": "AYT Sayısal, Eşit Ağırlık ve Sözel alanlarının tamamına hitap eden ileri düzey konu anlatımları ve seçkin soru bankası çözümleriyle donatılmış AYT uzmanlık paketi.",
        "what_you_learn": [
            "AYT Matematik, Geometri, Fizik, Kimya ve Biyoloji alanlarında tam uzmanlık.",
            "Edebiyat, Tarih, Coğrafya ve Sosyal Bilimler-2 testlerinin tüm detayları.",
            "ÖSYM tarzı özgün, seçici ve eleyici AYT soru tiplerinin analizleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: AYT Matematik (Türev, İntegral, Limit, Trigonometri, Logaritma)", "lessonCount": 0, "duration": "90 saat", "items": []},
            {"title": "Bölüm 2: AYT Geometri (Çember, Daire, Katı Cisimler, Analitik)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 3: AYT Fizik (Vektörler, Dinamik, Düzgün Çembersel Hareket, Modern Fizik)", "lessonCount": 0, "duration": "60 saat", "items": []},
            {"title": "Bölüm 4: AYT Kimya (Gazlar, Çözeltiler, Enerji, Hız, Denge, Organik Kimya)", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 5: AYT Biyoloji (Sistemler, Genden Proteine, Fotosentez, Solunum)", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 6: AYT Edebiyat ve Sosyal Bilimler (Edebiyat, Tarih, Coğrafya, Felsefe Grubu)", "lessonCount": 0, "duration": "30 saat", "items": []}
        ],
        "faqs": [
            {"q": "Matematik temelim zayıfsa katılamaz mıyım?", "a": "Katılabilirsiniz, ancak öncelikle TYT Matematik programımızı veya AYT öncesi sunduğumuz köprü derslerimizi izlemenizi öneririz."}
        ],
        "reviews": [
            {"name": "Burak T.", "score": 5, "role": "Öğrenci", "text": "Türev ve İntegrali ilk defa anladım diyebilirim.", "date": "3 hafta önce"}
        ],
        "active": True
    },
    # ── 4. TYT + AYT EŞİT AĞIRLIK ──
    {
        "title": "TYT + AYT Eşit Ağırlık Eğitim Programı",
        "slug": "yks-esit-agirlik",
        "category": "YKS",
        "gradient": "from-gray-900 via-gray-800 to-gray-700",
        "price": 6999900,
        "original_price": 8300000,
        "rating": 4.9,
        "review_count": 870,
        "students": 6200,
        "hours": 390,
        "lessons": 0,
        "badge": "EA Özel",
        "description": "Eşit Ağırlık öğrencilerinin YKS'de en yüksek başarıyı elde etmeleri için Matematik, Geometri, Türkçe, Edebiyat, Tarih ve Coğrafya derslerine odaklanan tam kapsamlı çalışma programı.",
        "what_you_learn": [
            "TYT'nin tüm ortak dersleri.",
            "AYT Edebiyat, Tarih-1, Coğrafya-1 konuları.",
            "AYT Matematik ve Geometri testlerinde en pratik soru çözüm yöntemleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: TYT Matematik ve Geometri", "lessonCount": 0, "duration": "70 saat", "items": []},
            {"title": "Bölüm 2: TYT Türkçe ve Dil Bilgisi", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 3: TYT Sosyal Bilimler ve Fen Bilimleri", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 4: AYT İleri Matematik ve İleri Geometri", "lessonCount": 0, "duration": "90 saat", "items": []},
            {"title": "Bölüm 5: AYT Türk Dili ve Edebiyatı", "lessonCount": 0, "duration": "60 saat", "items": []},
            {"title": "Bölüm 6: AYT Tarih-1", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 7: AYT Coğrafya-1", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 8: Eşit Ağırlık Alan Sınavı Stratejileri ve Denemeler", "lessonCount": 0, "duration": "40 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 5. LGS TÜM DERSLER ──
    {
        "title": "LGS Tüm Dersler Eğitim Programı",
        "slug": "lgs-tum-dersler",
        "category": "LGS",
        "gradient": "from-orange-700 via-amber-600 to-red-800",
        "price": 7599900,
        "original_price": 9500000,
        "rating": 4.9,
        "review_count": 1420,
        "students": 11800,
        "hours": 300,
        "lessons": 0,
        "badge": "LGS Lideri",
        "description": "Liselere Geçiş Sistemi (LGS) kapsamındaki tüm sözel ve sayısal derslerin, mantık-muhakeme sorularının ve MEB örnek sorularının detaylı çözümlerini barındıran şampiyonların hazırlık programı.",
        "what_you_learn": [
            "Matematik ve Fen Bilimleri yeni nesil beceri temelli soru çözümleri.",
            "Türkçe paragraf, sözel mantık ve grafik okuma becerileri.",
            "T.C. İnkılap Tarihi, Din Kültürü ve İngilizce testlerinin tam müfredat içeriği.",
            "LGS zaman yönetimi ve sınav kaygısıyla baş etme taktikleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Türkçe (Sözcükte, Cümlede ve Paragrafta Anlam, Dil Bilgisi, Edebi Türler)", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 2: Matematik (Çarpanlar ve Katlar, Üslü-Köklü İfadeler, Olasılık, Cebir, Denklemler, Geometri)", "lessonCount": 0, "duration": "80 saat", "items": []},
            {"title": "Bölüm 3: Fen Bilimleri (Mevsimler, DNA, Basınç, Madde ve Endüstri, Basit Makineler, Canlılar)", "lessonCount": 0, "duration": "70 saat", "items": []},
            {"title": "Bölüm 4: T.C. İnkılap Tarihi ve Atatürkçülük (Bir Kahraman Doğuyor, Milli Uyanış, Atatürkçülük)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 5: İngilizce (Friendship, Teen Life, In the Kitchen, On the Phone, Internet, Tourism)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 6: Din Kültürü ve Ahlak Bilgisi (Kader İnancı, Zekat ve Sadaka, Din ve Hayat)", "lessonCount": 0, "duration": "30 saat", "items": []}
        ],
        "faqs": [
            {"q": "LGS kaynak kitapları dahil mi?", "a": "Programla birlikte indirebileceğiniz zengin PDF ders notları ve soru föyleri sisteme dahildir."}
        ],
        "reviews": [
            {"name": "Gökhan S.", "score": 5, "role": "Veli", "text": "Oğlum Galatasaray Lisesi'ni kazandı. Sonsuz teşekkürler.", "date": "1 ay önce"}
        ],
        "active": True
    },
    # ── 6. TYT + AYT SAYISAL ──
    {
        "title": "TYT + AYT Sayısal Eğitim Programı",
        "slug": "yks-sayisal",
        "category": "YKS",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 6999900,
        "original_price": 8300000,
        "rating": 4.9,
        "review_count": 1640,
        "students": 13900,
        "hours": 440,
        "lessons": 0,
        "badge": "Sayısal Özel",
        "description": "YKS Sayısal alanında derece yapmak isteyen öğrencilere özel; ileri seviye AYT Matematik, Geometri, Fizik, Kimya, Biyoloji ve tüm TYT derslerini harmanlayan elit hazırlık paketi.",
        "what_you_learn": [
            "TYT ve AYT Matematik/Fen derslerinin eksiksiz teorik ve pratik anlatımları.",
            "En zorlu fizik mekanik/elektromanyetizma, organik kimya ve sistem fizyolojisi sorularını saniyeler içinde çözebilme becerisi.",
            "LMS portalında binlerce çözümlü video soru ve PDF deneme desteği."
        ],
        "curriculum": [
            {"title": "Bölüm 1: TYT Sayısal Dersler (Matematik, Geometri, Fizik, Kimya, Biyoloji, Türkçe)", "lessonCount": 0, "duration": "100 saat", "items": []},
            {"title": "Bölüm 2: AYT İleri Matematik (Polinomlar, Trigonometri, Logaritma, Limit, Türev, İntegral)", "lessonCount": 0, "duration": "90 saat", "items": []},
            {"title": "Bölüm 3: AYT İleri Geometri (Çemberler, Analitik Geometri, Katı Cisimler)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 4: AYT Fizik (Kuvvet ve Hareket, Elektrik ve Manyetizma, Modern Fizik)", "lessonCount": 0, "duration": "70 saat", "items": []},
            {"title": "Bölüm 5: AYT Kimya (Sıvı Çözeltiler, Kinetik, Kimyasal Denge, Elektrokimya, Organik Kimya)", "lessonCount": 0, "duration": "70 saat", "items": []},
            {"title": "Bölüm 6: AYT Biyoloji (İnsan Fizyolojisi, Hücresel Solunum, Bitki Biyolojisi, Komünite)", "lessonCount": 0, "duration": "70 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 7. TYT + AYT SÖZEL ──
    {
        "title": "TYT + AYT Sözel Eğitim Programı",
        "slug": "yks-sozel",
        "category": "YKS",
        "gradient": "from-teal-900 via-emerald-800 to-slate-900",
        "price": 6999900,
        "original_price": 8300000,
        "rating": 4.8,
        "review_count": 520,
        "students": 3200,
        "hours": 360,
        "lessons": 0,
        "badge": "Sözel Özel",
        "description": "YKS Sözel puan türünden ilk 1000'e girmeyi hedefleyen adaylar için; AYT Edebiyat, Tarih, Coğrafya, Felsefe Grubu ve tüm TYT derslerini içeren genişletilmiş sözel hazırlık programı.",
        "what_you_learn": [
            "Edebiyat eser-özet ve yazar taktik ezber yöntemleri.",
            "Tarih ve coğrafya harita okuma ve kronoloji mantığı.",
            "Felsefe, Psikoloji, Sosyoloji ve Mantık testlerinin püf noktaları."
        ],
        "curriculum": [
            {"title": "Bölüm 1: TYT Türkçe ve Sosyal Bilimler Ağırlıklı Çalışma", "lessonCount": 0, "duration": "80 saat", "items": []},
            {"title": "Bölüm 2: TYT Matematik ve Geometri Başlangıç Kampı", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 3: AYT Türk Dili ve Edebiyatı", "lessonCount": 0, "duration": "60 saat", "items": []},
            {"title": "Bölüm 4: AYT Tarih-1 ve Tarih-2", "lessonCount": 0, "duration": "60 saat", "items": []},
            {"title": "Bölüm 5: AYT Coğrafya-1 ve Coğrafya-2", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 6: AYT Felsefe Grubu (Felsefe, Psikoloji, Sosyoloji, Mantık)", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 7: AYT Din Kültürü ve Ahlak Bilgisi (İlave Sözel Soruları)", "lessonCount": 0, "duration": "30 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 8. TYT + YDT ──
    {
        "title": "TYT + YDT Eğitim Programı",
        "slug": "yks-ydt",
        "category": "YKS",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 6999900,
        "original_price": 8200000,
        "rating": 4.9,
        "review_count": 680,
        "students": 4900,
        "hours": 380,
        "lessons": 0,
        "badge": "Dil Özel",
        "description": "YKS Yabancı Dil Testi (YDT) adayları için; TYT ortak derslerinin yanı sıra dil bilgisi (grammar), kelime (vocabulary), okuma (reading) ve YDT soru türlerine özel stratejiler içeren benzersiz paket.",
        "what_you_learn": [
            "İleri seviye İngilizce dil bilgisi kuralları ve zaman uyuşmaları.",
            "YDT sınavında en çok çıkan kelimeler ve phrasal verbler.",
            "Çeviri, diyalog, paragraf tamamlama sorularında zaman kazandıran taktikler.",
            "TYT Türkçe ve Sosyal Bilimler netlerini zirveye taşıyacak programlar."
        ],
        "curriculum": [
            {"title": "Bölüm 1: TYT Türkçe ve Dil Bilgisi", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 2: TYT Matematik ve Geometri", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 3: TYT Sosyal ve Fen Bilimleri Temelleri", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 4: YDT Dil Bilgisi (Grammar: Tenses, Modals, Passive, Conjunctions)", "lessonCount": 0, "duration": "90 saat", "items": []},
            {"title": "Bölüm 5: YDT Kelime Bilgisi (Vocabulary: Phrasal Verbs, Collocations)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 6: YDT Soru Tipleri (Paragraph, Dialogue, Sentence Completion, Translation)", "lessonCount": 0, "duration": "100 saat", "items": []},
            {"title": "Bölüm 7: YDT Deneme Sınavları ve Taktik Çalışmaları", "lessonCount": 0, "duration": "40 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 9. LGS T.C. İNKILAP TARİHİ ──
    {
        "title": "LGS T.C. İnkılap Tarihi ve Atatürkçülük Eğitim Programı",
        "slug": "lgs-inkilap-tarihi",
        "category": "LGS",
        "gradient": "from-red-900 via-rose-800 to-slate-900",
        "price": 4999900,
        "original_price": 6000000,
        "rating": 4.9,
        "review_count": 310,
        "students": 2800,
        "hours": 150,
        "lessons": 0,
        "badge": "LGS Sosyal",
        "description": "LGS T.C. İnkılap Tarihi ve Atatürkçülük dersi müfredatındaki tüm üniteleri kavramsal haritalar, tarihi kronolojiler ve yoruma dayalı yeni nesil LGS soru tipleriyle analiz eden hazırlık programı.",
        "what_you_learn": [
            "Atatürk ilkeleri, inkılapları ve dönem kronolojisi.",
            "LGS'de çıkan paragraf analizi ve kavram eşleştirme becerileri.",
            "Milli Mücadele dönemi, cepheler ve kongreler kronolojisi."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Bir Kahraman Doğuyor (Mustafa Kemal'in Hayatı, Eğitimi, Görevleri)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 2: Milli Uyanış: Bağımsızlık Yolunda Atılan Adımlar (I. Dünya Savaşı, Cemiyetler, Kongreler)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 3: Ya İstiklal Ya Ölüm! (Doğu, Güney ve Batı Cepheleri, Mudanya, Lozan)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 4: Atatürkçülük ve Çağdaşlaşan Türkiye (İlkeler, Siyasi, Hukuk, Eğitim, Sosyal, Ekonomi İnkılapları)", "lessonCount": 0, "duration": "35 saat", "items": []},
            {"title": "Bölüm 5: Demokratikleşme Çabaları ve Dış Politika (Çok Partili Hayat, Dış Siyaset)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 6: Atatürk'ün Ölümü ve Sonrası (II. Dünya Savaşı ve Türkiye)", "lessonCount": 0, "duration": "15 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 10. LGS İNGİLİZCE ──
    {
        "title": "LGS İngilizce Eğitim Programı",
        "slug": "lgs-ingilizce",
        "category": "LGS",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 4999900,
        "original_price": 6000000,
        "rating": 4.9,
        "review_count": 420,
        "students": 3800,
        "hours": 160,
        "lessons": 0,
        "badge": "LGS Dil",
        "description": "LGS İngilizce sınavında 10'da 10 yapmayı hedefleyen öğrenciler için; tüm kelime listeleri (vocabulary lists), konu kavrama egzersizleri ve LGS soru çözümleri içeren uzmanlık programı.",
        "what_you_learn": [
            "LGS İngilizce ünitelerinin tüm önemli kelimeleri ve eş anlamlıları.",
            "Okuma anlama ve soru köklerindeki yönergeleri doğru yorumlama taktikleri.",
            "LGS deneme çözümleri ve süre yönetim stratejileri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Unit 1 - Friendship (Making Offers, Refusing, Words of Friendship)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 2: Unit 2 - Teen Life (Daily Routines, Preferences, Adverbs of Frequency)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 3: Unit 3 - In the Kitchen (Cooking Methods, Process, Imperatives)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 4: Unit 4 - On the Phone (Phone Conversations, Leave a Message)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 5: Unit 5 - The Internet (Internet Vocabulary, Rules, Accept/Refuse Requests)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 6: Unit 6 - Tourism (Describing Places, Accommodation, Activities)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 7: Unit 7 - Adventures (Extreme Sports, Preferences, Comparisons)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 8: Unit 8 - Chores (Expressing Obligations, Household Chores)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 9: Unit 9 - Science (Scientific Achievements, Describing Ongoing Actions)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 10: Unit 10 - Natural Forces (Natural Disasters, Suggestions)", "lessonCount": 0, "duration": "15 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 11. LGS TÜRKÇE ──
    {
        "title": "LGS Türkçe Eğitim Programı",
        "slug": "lgs-turkce",
        "category": "LGS",
        "gradient": "from-red-900 via-rose-800 to-slate-900",
        "price": 4999900,
        "original_price": 6000000,
        "rating": 4.9,
        "review_count": 890,
        "students": 6900,
        "hours": 180,
        "lessons": 0,
        "badge": "LGS Ana Ders",
        "description": "LGS Türkçe testinde çıkan mantık-muhakeme, sözel mantık, tablo ve grafik okuma, fiilimsiler, cümlenin ögeleri ve zengin paragraf tekniklerini eksiksiz şekilde öğreten lider program.",
        "what_you_learn": [
            "Sözel mantık ve muhakeme sorularının pratik çözüm yolları.",
            "LGS Türkçe dil bilgisi kuralları ve cümlenin ögeleri.",
            "Okuma anlama, paragrafta yapı ve ana düşünce analizleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Anlam Bilgisi (Sözcükte Anlam, Cümlede Anlam, Paragrafta Anlam)", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 2: Dil Bilgisi (Fiilimsiler, Cümlenin Ögeleri, Cümle Türleri, Anlatım Bozuklukları)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 3: Yazım ve Noktalama (Yazım Kuralları, Noktalama İşaretleri)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 4: Metin Türleri ve Söz Sanatları (Edebi Metinler, Şiir, Karşılaştırma, Abartma vb.)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 5: Sözsel Mantık ve Muhakeme (Tablo/Grafik Yorumlama, Akıl Yürütme)", "lessonCount": 0, "duration": "30 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 12. LGS MATEMATİK ──
    {
        "title": "LGS Matematik Eğitim Programı",
        "slug": "lgs-matematik",
        "category": "LGS",
        "gradient": "from-teal-900 via-emerald-800 to-slate-900",
        "price": 4999900,
        "original_price": 6000000,
        "rating": 4.9,
        "review_count": 1050,
        "students": 8450,
        "hours": 240,
        "lessons": 0,
        "badge": "LGS Sayısal",
        "description": "LGS'nin en belirleyici testi olan Matematikte sıfırdan zirveye yeni nesil beceri temelli soru çözümleri, cebirsel ifadeler, denklemler ve LGS geometri konularını içeren kapsamlı çalışma paketi.",
        "what_you_learn": [
            "EBOB-EKOK, üslü-köklü sayılarda pratik beceriler.",
            "Cebirsel ifadeler ve özdeşlikler, birinci dereceden doğrusal denklemler.",
            "Üçgen kuralları, benzerlik, eğim ve geometrik cisimlerin analizleri.",
            "MEB tadında yeni nesil hikayeli matematik sorularının çözüm taktikleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Sayılar ve İşlemler (Çarpanlar ve Katlar, EBOB-EKOK, Üslü İfadeler, Kareköklü İfadeler)", "lessonCount": 0, "duration": "60 saat", "items": []},
            {"title": "Bölüm 2: Veri Analizi (Sütun, Çizgi ve Daire Grafikleri)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 3: Olasılık ve Cebir (Basit Olayların Olasılığı, Cebirsel İfadeler ve Özdeşlikler)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 4: Denklemler ve Eşitsizlikler (Doğrusal Denklemler, Eğim, Birinci Dereceden Eşitsizlikler)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 5: Geometri (Üçgenler: Kenarortay, Açıortay, Yükseklik, Eşlik ve Benzerlik, Trigonometriye Giriş)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 6: Dönüşüm Geometrisi ve Geometrik Cisimler (Öteleme, Yansıma, Prizmalar, Silindir, Koni, Küre)", "lessonCount": 0, "duration": "40 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 13. AYT TARİH ──
    {
        "title": "AYT Tarih Eğitim Programı",
        "slug": "ayt-tarih",
        "category": "AYT",
        "gradient": "from-orange-700 via-amber-600 to-red-800",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 280,
        "students": 2400,
        "hours": 160,
        "lessons": 0,
        "badge": "AYT Sözel",
        "description": "AYT Tarih (Sosyal Bilimler-1 ve Sosyal Bilimler-2) testlerindeki tüm üniteleri detaylı kavrayış haritaları ve ÖSYM tipi seçici sorularla ele alan mükemmel tarih eğitimi.",
        "what_you_learn": [
            "Tarih bilimine girişten çağdaş dünya tarihine tüm konular.",
            "AYT'de fark yaratan yoruma dayalı seçici soru tipleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Tarih Bilimi ve İlk Çağ Medeniyetleri", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 2: İslam Tarihi ve İlk Türk-İslam Devletleri", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 3: Orta Çağ ve Yeni Çağ Avrupa Tarihi", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 4: Osmanlı Devleti Kuruluş, Yükselme, Duraklama ve Gerileme Dönemleri", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 5: XX. Yüzyıl Başlarında Osmanlı Devleti ve I. Dünya Savaşı", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 6: Kurtuluş Savaşı Hazırlık Dönemi ve Cepheler", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 7: Atatürk İlke ve İnkılapları", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 8: Çağdaş Türk ve Dünya Tarihi", "lessonCount": 0, "duration": "15 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 14. AYT GEOMETRİ ──
    {
        "title": "AYT Geometri Eğitim Programı",
        "slug": "ayt-geometri",
        "category": "AYT",
        "gradient": "from-red-900 via-rose-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 340,
        "students": 2900,
        "hours": 180,
        "lessons": 0,
        "badge": "AYT Sayısal",
        "description": "AYT Geometrinin belirleyici konuları olan Çember, Daire, Analitik Geometri ve Katı Cisimleri vizyoner yöntemlerle öğreten ileri seviye geometri eğitim programı.",
        "what_you_learn": [
            "Çemberin ve doğrunun analitik incelenmesi.",
            "Katı cisimlerde hacim ve alan formüllerinin pratik çıkarımları."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Üçgende Açı ve Kenar Bağıntıları (Temel Tekrar)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 2: Çokgenler ve Dörtgenler (Kare, Dikdörtgen, Paralelkenar, Yamuk, Deltoid)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 3: Çemberde Açı ve Çemberde Uzunluk", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 4: Dairenin Çevresi ve Alanı", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 5: Analitik Geometri (Noktanın ve Doğrunun Analitiği, Simetri)", "lessonCount": 0, "duration": "35 saat", "items": []},
            {"title": "Bölüm 6: Çemberin Analitik İncelenmesi", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 7: Katı Cisimler (Prizma, Piramit, Silindir, Koni, Küre)", "lessonCount": 0, "duration": "25 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 15. AYT BİYOLOJİ ──
    {
        "title": "AYT Biyoloji Eğitim Programı",
        "slug": "ayt-biyoloji",
        "category": "AYT",
        "gradient": "from-orange-700 via-amber-600 to-red-800",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 410,
        "students": 3100,
        "hours": 190,
        "lessons": 0,
        "badge": "AYT Sayısal",
        "description": "İnsan fizyolojisi, sistemler, hücresel solunum, fotosentez ve bitki biyolojisi gibi AYT Biyolojinin can alıcı konularını ezberletmeden, mantığıyla öğreten mükemmel program.",
        "what_you_learn": [
            "İnsan vücudundaki tüm sistemlerin işleyiş mekanizması.",
            "Fotosentez, kemosentez ve solunumun kimyasal dengeleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: İnsan Fizyolojisi (Denetleyici ve Düzenleyici Sistemler, Duyu Organları, Destek ve Hareket, Sindirim, Dolaşım, Solunum, Boşaltım, Üreme)", "lessonCount": 0, "duration": "70 saat", "items": []},
            {"title": "Bölüm 2: Genden Proteine (Nükleik Asitler, DNA Eşlenmesi, Protein Sentezi)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 3: Canlılarda Enerji Dönüşümleri (Fotosentez, Kemosentez, Hücresel Solunum)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 4: Bitki Biyolojisi (Bitkisel Dokular, Organlar, Taşıma, Beslenme, Büyüme, Hareket, Üreme)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 5: Canlılar ve Çevre (Komünite ve Popülasyon Ekolojisi)", "lessonCount": 0, "duration": "20 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 16. AYT KİMYA ──
    {
        "title": "AYT Kimya Eğitim Programı",
        "slug": "ayt-kimya",
        "category": "AYT",
        "gradient": "from-teal-900 via-emerald-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 480,
        "students": 3900,
        "hours": 180,
        "lessons": 0,
        "badge": "AYT Sayısal",
        "description": "Modern atom teorisi, sıvı çözeltiler, piller, elektrokimya ve organik kimya gibi AYT Kimyada zirveye oynamanızı sağlayacak ileri düzey hazırlık programı.",
        "what_you_learn": [
            "Organik bileşiklerin hibritleşme ve izomerlik yapıları.",
            "Tepkime hızı, enerji ve kimyasal denge kurallarının tam kavranışı."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Modern Atom Teorisi (Kuantum Sayıları, Periyodik Özellikler)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 2: Gazlar (Gaz Yasaları, Kinetik Teori, Gerçek Gazlar, Gaz Karışımları)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 3: Sıvı Çözeltiler ve Çözünürlük (Derişim Birimleri, Koligatif Özellikler, Çözünürlüğe Etki Eden Faktörler)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 4: Kimyasal Tepkimelerde Enerji (Entalpi, Oluşum Isıları, Hess Yasası)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 5: Kimyasal Tepkimelerde Hız (Tepkime Hızını Etkileyen Faktörler)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 6: Kimyasal Tepkimelerde Denge (Zayıf Asit/Baz Dengesi, KÇÇ, Çözünürlük Dengesi)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 7: Kimya ve Elektrik (Redoks, Aktiflik, Piller, Elektroliz)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 8: Organik Kimyaya Giriş ve Organik Bileşikler (Hibritleşme, Fonksiyonel Gruplar, İzomerlik)", "lessonCount": 0, "duration": "30 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 17. AYT FİZİK ──
    {
        "title": "AYT Fizik Eğitim Programı",
        "slug": "ayt-fizik",
        "category": "AYT",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 510,
        "students": 4200,
        "hours": 210,
        "lessons": 0,
        "badge": "AYT Sayısal",
        "description": "AYT'de sayısal öğrencilerini en çok zorlayan Fizik dersindeki tüm ağır üniteleri (manyetizma, dairesel hareket, dalga mekaniği, modern fizik) görsel animasyonlar ve şematik çözümlerle kolaylaştıran şampiyonların paketi.",
        "what_you_learn": [
            "Modern fiziğin teknolojik uygulamaları ve nükleer fizik temelleri.",
            "Kepler kanunları, açısal momentum ve harmonik hareket formülsüz çözümleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Vektörler, Bağıl Hareket ve Newton'ın Hareket Yasaları", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 2: Bir Boyutta Sabit İvmeli Hareket (Atışlar) ve İki Boyutta Hareket", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 3: İş, Güç, Enerji, İtme ve Çizgisel Momentum", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 4: Tork, Denge, Ağırlık Merkezi ve Basit Makineler", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 5: Elektriksel Kuvvet, Elektriksel Alan, Potansiyel, Kondansatörler", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 6: Manyetizma, Elektromanyetik İndüklenme, Alternatif Akım ve Transformatörler", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 7: Düzgün Çembersel Hareket, Açısal Momentum, Kütle Çekim ve Kepler Kanunları", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 8: Basit Harmonik Hareket ve Dalga Mekaniği (Girişim, Doppler, Elektromanyetik Dalgalar)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 9: Atom Fiziğine Giriş, Radyoaktivite ve Modern Fizik (Rölativite, Fotoelektrik, Compton, X-Işınları)", "lessonCount": 0, "duration": "25 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 18. AYT COĞRAFYA ──
    {
        "title": "AYT Coğrafya Eğitim Programı",
        "slug": "ayt-cografya",
        "category": "AYT",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 210,
        "students": 1600,
        "hours": 110,
        "lessons": 0,
        "badge": "AYT Sözel",
        "description": "Ekosistemler, jeopolitik, Türkiye ekonomisi ve küresel bölgeler gibi sözel/eşit ağırlık öğrencilerinin AYT'de fark yaratmasını sağlayan seçkin coğrafya hazırlık programı.",
        "what_you_learn": [
            "Türkiye'nin tüm tarım, sanayi ve bölgesel kalkınma projeleri coğrafi analizleri.",
            "Dünyadaki önemli kanallar, boğazlar ve küresel jeopolitik konum teorileri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Ekosistem, Biyoçeşitlilik ve Madde Döngüleri", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 2: Beşeri Sistemler (Nüfus Politikaları, Şehirlerin Fonksiyonları, Türkiye'de Nüfus ve Yerleşme)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 3: Küresel Ortam: Bölgeler ve Ülkeler (Ulaşım, Ticaret, Turizm, Jeopolitik Konum)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 4: Türkiye'nin Ekonomik Coğrafyası (Tarım, Hayvancılık, Madenler, Sanayi, Bölgesel Kalkınma Projeleri)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 5: Çevre ve Toplum (Doğal Afetler, Çevre Sorunları, Kaynakların Sürdürülebilir Kullanımı)", "lessonCount": 0, "duration": "15 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 19. AYT MATEMATİK ──
    {
        "title": "AYT Matematik Eğitim Programı",
        "slug": "ayt-matematik",
        "category": "AYT",
        "gradient": "from-teal-900 via-emerald-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 890,
        "students": 7100,
        "hours": 260,
        "lessons": 0,
        "badge": "AYT Temel Ders",
        "description": "AYT'de puan türünü belirleyen en kritik ders olan Matematikte; trigonometri, logaritma, limit, türev ve integral ünitelerini en sade ve öğretici yöntemlerle ele alan ana hazırlık programı.",
        "what_you_learn": [
            "Limit ve süreklilik kuralları, türev alma kuralları ve maksimum-minimum problemleri.",
            "Belirli/belirsiz integral mantığı ve integral yardımıyla alan hesabı pratikleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: İleri Cebir (Fonksiyonlar, Polinomlar, İkinci Dereceden Denklemler, Eşitsizlikler)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 2: Dizi ve Seriler (Aritmetik ve Geometrik Diziler)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 3: Permütasyon, Kombinasyon, Binom Açılımı ve İleri Olasılık", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 4: Trigonometri (Yarım Açı Formülleri, Trigonometrik Denklemler)", "lessonCount": 0, "duration": "35 saat", "items": []},
            {"title": "Bölüm 5: Logaritma (Logaritma Fonksiyonu ve Özellikleri, Logaritmik Eşitsizlikler)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 6: Limit ve Süreklilik", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 7: Türev ve Uygulamaları (Maksimum-Minimum Problemleri, Grafik Çizimi)", "lessonCount": 0, "duration": "45 saat", "items": []},
            {"title": "Bölüm 8: İntegral ve Uygulamaları (Belirsiz İntegral, Belirli İntegral, Alan Hesabı)", "lessonCount": 0, "duration": "45 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 20. AYT TÜRK DİLİ VE EDEBİYATI ──
    {
        "title": "AYT Türk Dili ve Edebiyatı Eğitim Programı",
        "slug": "ayt-turk-dili-ve-edebiyati",
        "category": "AYT",
        "gradient": "from-teal-900 via-emerald-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 780,
        "students": 5900,
        "hours": 190,
        "lessons": 0,
        "badge": "AYT Edebiyat",
        "description": "AYT edebiyatta 24'te 24 yapmayı hedefleyen öğrenciler için; divan edebiyatı, halk edebiyatı, cumhuriyet edebiyatı, tüm edebi akımlar ve yazar-eser ezber kartlarını içeren zengin program.",
        "what_you_learn": [
            "Divan ve Cumhuriyet dönemi yazar, şair ve en önemli eserlerinin analitik ezber yöntemleri.",
            "Şiir bilgisi, kafiye/redif tespiti ve tüm edebi sanatların örneklerle kavranışı."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Güzel Sanatlar ve Edebiyat, Şiir Bilgisi (Kafiye, Ölçü, Sanatlar)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 2: İslamiyet Öncesi ve Geçiş Dönemi Türk Edebiyatı (Koşuk, Sagu, Divan-ı Lügati't-Türk)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 3: Halk Edebiyatı (Anonim, Aşık ve Tekke Edebiyatı)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 4: Klasik Türk Edebiyatı (Divan Edebiyatı: Gazel, Kaside, Mesnevi, Sanatçılar)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 5: Tanzimat ve Servet-i Fünun Edebiyatı", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 6: Fecr-i Ati ve Milli Edebiyat Dönemi", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 7: Cumhuriyet Dönemi Türk Edebiyatı (Saf Şiir, Toplumcu Gerçekçiler, Garip, İkinci Yeni, Roman ve Tiyatro)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 8: Batı Edebiyatı Akımları (Klasisizm, Romantizm, Realizm, Naturalizm)", "lessonCount": 0, "duration": "10 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 21. YDT İNGİLİZCE ──
    {
        "title": "YDT İngilizce Eğitim Programı",
        "slug": "ydt-ingilizce",
        "category": "YDT",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 640,
        "students": 4800,
        "hours": 220,
        "lessons": 0,
        "badge": "YDT Dil",
        "description": "YKS Yabancı Dil Sınavına hazırlanan adaylar için; dil bilgisi yapısı, ileri kelime bilgisi, paragraf anlama metotları ve tüm YDT soru türlerini içeren lider İngilizce programı.",
        "what_you_learn": [
            "YDT'ye özel ileri düzey İngilizce gramer kuralları.",
            "Hızlı paragraf okuma ve doğru seçeneği işaretleme teknikleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Grammar Mastery (Tenses, Modals, Passive, Conjunctions, Clauses)", "lessonCount": 0, "duration": "60 saat", "items": []},
            {"title": "Bölüm 2: Advanced Vocabulary & Phrasal Verbs", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 3: Question Types - Part 1 (Cloze Test, Sentence Completion, Reading)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 4: Question Types - Part 2 (Dialogue, Restatement, Situational, Paragraph)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 5: Translation Techniques (English-Turkish, Turkish-English)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 6: Full Length YDT Mock Exams & Performance Strategy", "lessonCount": 0, "duration": "30 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 22. AYT SÖZEL ──
    {
        "title": "AYT Sözel Eğitim Programı",
        "slug": "ayt-sozel",
        "category": "AYT",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.8,
        "review_count": 210,
        "students": 1900,
        "hours": 170,
        "lessons": 0,
        "badge": "AYT Sözel",
        "description": "AYT sözel puan türündeki tüm alan derslerini (Edebiyat, Tarih, Coğrafya, Felsefe Grubu) ÖSYM müfredatına tam uyumlu bölümler halinde toplayan sözel uzmanlık eğitimi.",
        "what_you_learn": [
            "AYT sözel sınavında çıkan tüm testlerin konu ve ünite başlıkları."
        ],
        "curriculum": [
            {"title": "Bölüm 1: AYT Edebiyat Konuları", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 2: AYT Tarih-1 ve Tarih-2 Konuları", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 3: AYT Coğrafya-1 ve Coğrafya-2 Konuları", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 4: AYT Felsefe Grubu (Felsefe, Psikoloji, Sosyoloji, Mantık)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 5: AYT Din Kültürü Sözel Ek Alanı", "lessonCount": 0, "duration": "20 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 23. AYT SAYISAL ──
    {
        "title": "AYT Sayısal Eğitim Programı",
        "slug": "ayt-sayisal",
        "category": "AYT",
        "gradient": "from-emerald-800 via-teal-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 670,
        "students": 5900,
        "hours": 240,
        "lessons": 0,
        "badge": "AYT Sayısal",
        "description": "AYT Sayısal puan türünden Türkiye derecesi hedefleyen öğrenciler için; en kritik Matematik, Geometri, Fizik, Kimya ve Biyoloji derslerinin ileri seviye bölümleri.",
        "what_you_learn": [
            "AYT Sayısal derslerinin tamamında ÖSYM tipi sorulara tam hakimiyet."
        ],
        "curriculum": [
            {"title": "Bölüm 1: AYT Matematik (Türev, İntegral, Limit, Trigonometri, Logaritma)", "lessonCount": 0, "duration": "70 saat", "items": []},
            {"title": "Bölüm 2: AYT Geometri (Çemberler, Analitik, Katı Cisimler)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 3: AYT Fizik (Mekanik, Elektrik, Modern Fizik)", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 4: AYT Kimya (Denge, Hız, Piller, Organik Kimya)", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 5: AYT Biyoloji (Sistemler, Enerji Dönüşümleri, Bitki Biyolojisi)", "lessonCount": 0, "duration": "40 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 24. AYT EŞİT AĞIRLIK ──
    {
        "title": "AYT Eşit Ağırlık Eğitim Programı",
        "slug": "ayt-esit-agirlik",
        "category": "AYT",
        "gradient": "from-red-900 via-rose-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 450,
        "students": 3800,
        "hours": 180,
        "lessons": 0,
        "badge": "AYT EA",
        "description": "AYT Eşit Ağırlık öğrencilerine özel; AYT Matematik, Geometri, Edebiyat, Tarih-1 ve Coğrafya-1 derslerinin tamamını kapsayan hedefe odaklı çalışma programı.",
        "what_you_learn": [
            "Eşit ağırlık puan türünden en yüksek hedeflere ulaşma planlaması."
        ],
        "curriculum": [
            {"title": "Bölüm 1: AYT Matematik ve Geometri (EA Ortak Konular)", "lessonCount": 0, "duration": "70 saat", "items": []},
            {"title": "Bölüm 2: AYT Türk Dili ve Edebiyatı", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 3: AYT Tarih-1", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 4: AYT Coğrafya-1", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 5: Eşit Ağırlık Sınav Stratejileri ve Denemeleri", "lessonCount": 0, "duration": "20 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 25. TYT BİYOLOJİ ──
    {
        "title": "TYT Biyoloji Eğitim Programı",
        "slug": "tyt-biyoloji",
        "category": "TYT",
        "gradient": "from-teal-900 via-emerald-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 480,
        "students": 3200,
        "hours": 120,
        "lessons": 0,
        "badge": "TYT Fen",
        "description": "TYT Biyoloji sınav konularının tamamını (hücre, canlılar dünyası, kalıtım, ekoloji) görsel tablolar, zihin haritaları ve yeni nesil MEB örnek sorularıyla ele alan hazırlık programı.",
        "what_you_learn": [
            "Hücre bölünmeleri (mitoz ve mayoz) arasındaki temel farklar.",
            "Mendel genetiği ve kan grupları soyağacı pratik çözüm yolları."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Biyoloji Bilimi, Canlıların Ortak Özellikleri ve Temel Bileşenler (Karbonhidratlar, Yağlar, Proteinler, Enzimler)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 2: Hücrenin Yapısı, Hücre Organelleri ve Hücre Zarından Madde Geçişleri", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 3: Canlıların Çeşitliliği ve Sınıflandırılması (Bakteriler, Protistalar, Mantarlar, Bitkiler, Hayvanlar, Virüsler)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 4: Hücre Bölünmeleri (Mitoz ve Mayoz Bölünme)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 5: Kalıtım Temel İlkeleri (Mendel Genetiği, Kan Grupları, Eşeye Bağlı Kalıtım, Soyağaçları)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 6: Ekosistem Ekolojisi ve Güncel Çevre Sorunları", "lessonCount": 0, "duration": "15 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 26. TYT FELSEFE ──
    {
        "title": "TYT Felsefe Eğitim Programı",
        "slug": "tyt-felsefe",
        "category": "TYT",
        "gradient": "from-orange-700 via-amber-600 to-red-800",
        "price": 2999900,
        "original_price": 3500000,
        "rating": 4.9,
        "review_count": 150,
        "students": 1400,
        "hours": 80,
        "lessons": 0,
        "badge": "TYT Sosyal",
        "description": "TYT Felsefe testindeki tüm soruları (bilgi, varlık, ahlak, din, siyaset, bilim felsefesi) felsefi terimler sözlüğü ve kavram haritalarıyla öğreten pratik hazırlık programı.",
        "what_you_learn": [
            "Felsefenin temel kavramları ve ÖSYM'nin en çok sorduğu filozof görüşleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Felsefeyi Tanıma (Felsefenin Anlamı, Özellikleri, Soruları)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 2: Felsefe ile Düşünme (Görüş, Argüman, Dil ve Düşünce)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 3: Felsefenin Temel Konuları ve Problemleri (Bilgi, Varlık, Ahlak, Sanat, Din, Siyaset, Bilim Felsefesi)", "lessonCount": 0, "duration": "35 saat", "items": []},
            {"title": "Bölüm 4: Felsefi Okuma ve Yazma (Metin Analizi, Felsefi Deneme)", "lessonCount": 0, "duration": "10 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 27. TYT KİMYA ──
    {
        "title": "TYT Kimya Eğitim Programı",
        "slug": "tyt-kimya",
        "category": "TYT",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 430,
        "students": 3600,
        "hours": 140,
        "lessons": 0,
        "badge": "TYT Fen",
        "description": "Kimya bilimi, atomun yapısı, kimyasal türler arası etkileşimler ve asit-baz-tuz üniteleri dahil tüm TYT kimya müfredatını pratik yöntemlerle sunan lider çalışma paketi.",
        "what_you_learn": [
            "Maddenin halleri ve asit-baz nötrleşme hesaplamaları.",
            "Kimya her yerde ünitesi günlük hayat kimyası detayları."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Kimya Bilimi (Simyadan Kimyaya, Kimya Disiplinleri, Güvenlik Logoları)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 2: Atomun Yapısı ve Periyodik Sistem (Atom Modelleri, Elementlerin Sınıflandırılması)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 3: Kimyasal Türler Arası Etkileşimler (Güçlü ve Zayıf Etkileşimler)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 4: Maddenin Halleri (Katılar, Sıvılar, Gazlar, Plazma)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 5: Kimyanın Temel Kanunları ve Kimyasal Hesaplamalar (Mol Kavramı, Tepkime Türleri)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 6: Karışımlar (Homojen/Heterojen Karışımlar, Çözünürlük, Ayırma Teknikleri)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 7: Asitler, Bazlar ve Tuzlar (pH Kavramı, Nötrleşme Tepkimeleri)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 8: Kimya Her Yerde (Temizlik Maddeleri, Polimerler, Kozmetikler)", "lessonCount": 0, "duration": "15 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 28. TYT COĞRAFYA ──
    {
        "title": "TYT Coğrafya Eğitim Programı",
        "slug": "tyt-cografya",
        "category": "TYT",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 390,
        "students": 2900,
        "hours": 150,
        "lessons": 0,
        "badge": "TYT Sosyal",
        "description": "Harita bilgisi, iklim elemanları, dünyanın şekli ve hareketleri, nüfus piramitleri ve doğal afetler dahil tüm TYT coğrafya müfredatını görsel haritalarla pekiştiren benzersiz program.",
        "what_you_learn": [
            "İzohipsler, ölçek hesaplamaları ve projeksiyon yöntemleri.",
            "Dünyadaki iklim tipleri, rüzgarlar ve nem oranları coğrafi analizi."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Doğa ve İnsan (Coğrafyanın Konusu, Bölümleri, Koordinat Sistemi)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 2: Harita Bilgisi (Ölçekler, Projeksiyonlar, İzohipsler)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 3: Dünyanın Şekli ve Hareketleri (Eksen Eğikliği, Mevsimler)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 4: Atmosfer ve İklim (Sıcaklık, Basınç, Rüzgarlar, Nem, Yağış, İklim Tipleri)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 5: Dünyanın Tektonik Yapısı ve İç/Dış Kuvvetler (Depremler, Volkanizma, Akarsular)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 6: Su, Toprak ve Bitki Varlığı (Toprak Tipleri, Göller, Akarsular)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 7: Beşeri Sistemler (Nüfus Piramitleri, Göçler, Yerleşme Türleri)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 8: Bölge Kavramı, Jeopolitik ve Ulaşım Yolları (Boğazlar ve Kanallar)", "lessonCount": 0, "duration": "10 saat", "items": []},
            {"title": "Bölüm 9: Doğal Afetler ve Çevre Sorunları", "lessonCount": 0, "duration": "15 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 29. TYT FİZİK ──
    {
        "title": "TYT Fizik Eğitim Programı",
        "slug": "tyt-fizik",
        "category": "TYT",
        "gradient": "from-purple-900 via-indigo-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 480,
        "students": 3700,
        "hours": 160,
        "lessons": 0,
        "badge": "TYT Fen",
        "description": "Fizik bilimine giriş, madde ve özellikleri, özkütle, hareket-kuvvet, optik ve dalgalar gibi TYT fiziğin tamamını formülsüz mantık modelleriyle öğreten üstün hazırlık programı.",
        "what_you_learn": [
            "Optik kırılma, mercekler ve aynaların temel kuralları.",
            "Katı/sıvı/gaz basıncı ve kaldırma kuvveti mantığı."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Fizik Bilimine Giriş (Fizik Alt Dalları, Nicelikler)", "lessonCount": 0, "duration": "10 saat", "items": []},
            {"title": "Bölüm 2: Madde ve Özellikleri (Özkütle, Dayanıklılık, Adezyon-Kohezyon)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 3: Hareket ve Kuvvet (Sürat, Hız, İvme, Newton Yasaları)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 4: İş, Enerji ve Güç (Kinetik ve Potansiyel Enerji, Enerji Korunumu)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 5: Isı, Sıcaklık ve Genleşme (Hal Değişimi, Genleşme)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 6: Basinç ve Kaldırma Kuvveti (Katı, Sıvı, Gaz Basıncı, Sıvı Kaldırma Kuvveti)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 7: Elektrostatik (Elektrik Yükleri, Elektroskop, Coulomb Yasası)", "lessonCount": 0, "duration": "10 saat", "items": []},
            {"title": "Bölüm 8: Elektrik Akımı, Direnç, Potansiyel Fark ve Elektriksel Güç (Ohm Kanunu)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 9: Optik (Aydınlanma, Aynalar, Kırılma, Mercekler, Renk)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 10: Dalgalar (Temel Kavramlar, Yay, Su, Ses, Deprem Dalgaları)", "lessonCount": 0, "duration": "15 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 30. TYT TARİH ──
    {
        "title": "TYT Tarih Eğitim Programı",
        "slug": "tyt-tarih",
        "category": "TYT",
        "gradient": "from-orange-700 via-amber-600 to-red-800",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 320,
        "students": 2800,
        "hours": 150,
        "lessons": 0,
        "badge": "TYT Sosyal",
        "description": "Tarih bilimine girişten ilk Türk devletlerine, Osmanlı İmparatorluğu'ndan Atatürk ilkeleri ve inkılaplarına kadar tüm TYT Tarih müfredatını kapsayan, yoruma dayalı soru tipleriyle zenginleştirilmiş program.",
        "what_you_learn": [
            "Osmanlı kuruluş, yükselme ve dağılma dönemleri jeopolitik süreçleri.",
            "Milli mücadele hazırlık dönemi ve Atatürk inkılapları tam kavranışı."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Tarih Bilimi ve İlk Çağ Medeniyetleri (Mezopotamya, Anadolu)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 2: İlk ve Orta Çağlarda Türk Dünyası (Hunlar, Göktürkler, Uygurlar)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 3: İslam Medeniyetinin Doğuşu ve İlk İslam Devletleri", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 4: İlk Türk-İslam Devletleri (Karahanlılar, Selçuklular)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 5: Orta Çağ ve Yeni Çağ'da Avrupa ile Osmanlı Siyasi Tarihi", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 6: Arayış Yılları ve Değişim Çağında Osmanlı (Duraklama, Gerileme)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 7: XX. Yüzyıl Başlarında Osmanlı Devleti, I. Dünya Savaşı ve Mondros", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 8: Milli Mücadele Hazırlık Dönemi (Kongreler, Genelgeler)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 9: Birinci TBMM Dönemi, Sevr Antlaşması ve Kurtuluş Savaşı Cepheleri", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 10: Atatürk İlke ve İnkılapları (İlkeler ve Alan İnkılapları)", "lessonCount": 0, "duration": "15 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 31. TYT TÜRKÇE ──
    {
        "title": "TYT Türkçe Eğitim Programı",
        "slug": "tyt-turkce",
        "category": "TYT",
        "gradient": "from-red-900 via-rose-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 1150,
        "students": 9200,
        "hours": 180,
        "lessons": 0,
        "badge": "TYT Temel Ders",
        "description": "TYT'de 40 soruluk Türkçe testinde tam başarı elde etmek için; sözcükte, cümlede, paragrafta anlam teknikleri, hızlı okuma taktikleri ve tüm dil bilgisi ünitelerini eksiksiz içeren temel program.",
        "what_you_learn": [
            "Paragraf yapı analizi ve ana fikir çıkarma teknikleri.",
            "Ses olayları, sözcükte yapı, türler ve cümlenin ögeleri dil bilgisi tam hakimiyeti."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Sözcükte Anlam (Gerçek, Mecaz, Terim Anlam, Deyimler)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 2: Cümlede Anlam (Öznel/Nesnel Yargı, Neden-Sonuç, Cümle Yorumu)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 3: Paragrafta Anlam (Paragrafın Yapısı, Ana Düşünce, Paragrafı İkiye Bölme)", "lessonCount": 0, "duration": "40 saat", "items": []},
            {"title": "Bölüm 4: Ses Bilgisi (Ünlü Düşmesi, Ünsüz Yumuşaması, Ses Olayları)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 5: Sözcükte Yapı (Kökler, Yapım ve Çekim Ekleri)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 6: Sözcük Türleri (İsim, Sıfat, Zamir, Zarf, Edat, Bağlaç, Fiil)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 7: Fiilde Çatı ve Fiilimsiler (İsim-Fiil, Sıfat-Fiil, Zarf-Fiil)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 8: Cümlenin Ögeleri (Özne, Yüklem, Nesne, Tümleçler)", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 9: Cümle Türleri ve Anlatım Bozuklukları", "lessonCount": 0, "duration": "15 saat", "items": []},
            {"title": "Bölüm 10: Yazım Kuralları ve Noktalama İşaretleri", "lessonCount": 0, "duration": "15 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 32. TYT MATEMATİK ──
    {
        "title": "TYT Matematik Eğitim Programı",
        "slug": "tyt-matematik",
        "category": "TYT",
        "gradient": "from-teal-900 via-emerald-800 to-slate-900",
        "price": 3999900,
        "original_price": 4700000,
        "rating": 4.9,
        "review_count": 1280,
        "students": 10500,
        "hours": 260,
        "lessons": 0,
        "badge": "TYT Temel Ders",
        "description": "Sayı kümeleri, bölünebilme, mutlak değer, üslü-köklü sayılardan başlayıp sınavın omurgasını oluşturan yeni nesil hikayeli problemler ve temel fonksiyon/olasılık konularını kapsayan dev hazırlık programı.",
        "what_you_learn": [
            "TYT matematiğin tüm sayı kümeleri ve işlem öncelikleri.",
            "Yeni nesil problem tipleri (yaş, işçi, hız, kar-zarar, yüzde) pratik denklemlerle hızlı çözüm yolları."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Temel Kavramlar ve Sayı Kümeleri (Doğal, Tam, Rasyonel, Tek-Çift, Asal Sayılar)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 2: Bölme ve Bölünebilme Kuralları, EBOB-EKOK", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 3: Rasyonel Sayılar, Ondalık Sayılar ve Birinci Dereceden Denklemler", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 4: Basit Eşitsizlikler ve Mutlak Değer", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 5: Üslü Sayılar ve Köklü Sayılar", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 6: Çarpanlara Ayırma ve Oran-Orantı", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 7: Matematiksel Problemler (Sayı, Kesir, Yaş, İşçi, Hız, Kar-Zarar, Grafik)", "lessonCount": 0, "duration": "50 saat", "items": []},
            {"title": "Bölüm 8: Kümeler, Kartezyen Çarpım ve Fonksiyonlar", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 9: Polinomlar ve İkinci Dereceden Denklemler", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 10: Permütasyon, Kombinasyon, Binom Açılımı ve Olasılık", "lessonCount": 0, "duration": "20 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    },
    # ── 33. LGS FEN BİLİMLERİ ──
    {
        "title": "LGS Fen Bilimleri Eğitim Programı",
        "slug": "lgs-fen-bilimleri",
        "category": "LGS",
        "gradient": "from-orange-700 via-amber-600 to-red-800",
        "price": 4999900,
        "original_price": 6000000,
        "rating": 4.9,
        "review_count": 870,
        "students": 6100,
        "hours": 190,
        "lessons": 0,
        "badge": "LGS Sayısal",
        "description": "LGS Fen Bilimleri dersinin tüm ünitelerini (mevsimler, DNA, basınç, madde-endüstri, basit makineler, elektrik yükleri) yeni nesil LGS tipi beceri temelli soru çözümleri ve görsel şemalarla sunan program.",
        "what_you_learn": [
            "Mevsimlerin oluşumu, eksen eğikliği ve hava hareketleri.",
            "DNA, genetik kod, kalıtım soyağaçları ve mutasyon kuralları.",
            "Katı, sıvı ve gaz basıncı ile kaldıraç, makara basit makine sistemleri pratik analizleri."
        ],
        "curriculum": [
            {"title": "Bölüm 1: Mevsimler ve İklim (Dünyanın Hareketi, Eksen Eğikliği, İklim ve Hava)", "lessonCount": 0, "duration": "20 saat", "items": []},
            {"title": "Bölüm 2: DNA ve Genetik Kod (DNA Yapısı, Eşlenmesi, Mutasyon, Kalıtım)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 3: Basınç (Katı Basıncı, Sıvı Basıncı, Gaz/Açık Hava Basıncı)", "lessonCount": 0, "duration": "25 saat", "items": []},
            {"title": "Bölüm 4: Madde ve Endüstri (Periyodik Sistem, Fiziksel/Kimyasal Değişimler, Asitler/Bazlar)", "lessonCount": 0, "duration": "35 saat", "items": []},
            {"title": "Bölüm 5: Basit Makineler (Kaldıraçlar, Makaralar, Eğik Düzlem, Dişliler, Kasnaklar)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 6: Enerji Dönüşümleri ve Çevre Bilimi (Fotosentez, Solunum, Besin Zinciri, Döngüler)", "lessonCount": 0, "duration": "30 saat", "items": []},
            {"title": "Bölüm 7: Elektrik Yükleri ve Elektrik Enerjisi (Statik Elektrik, Topraklama, Akım)", "lessonCount": 0, "duration": "20 saat", "items": []}
        ],
        "faqs": [],
        "reviews": [],
        "active": True
    }
]

async def seed_programs():
    print("Database seeding started...")
    async with AsyncSessionLocal() as session:
        try:
            # 1. Silme işlemi (temiz bir başlangıç için)
            print("Deleting existing education programs...")
            await session.execute(delete(EducationProgram))
            
            # 2. Insert işlemi
            print(f"Inserting {len(PROGRAMS_DATA)} premium education programs...")
            for p_data in PROGRAMS_DATA:
                program = EducationProgram(**p_data)
                session.add(program)
                
            await session.commit()
            print("Database successfully seeded with 33 premium education programs!")
        except Exception as e:
            await session.rollback()
            print(f"Error during seeding: {e}")
            raise e

if __name__ == "__main__":
    asyncio.run(seed_programs())
