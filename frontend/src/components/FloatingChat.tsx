"use client";

import { useState, useRef, useEffect } from "react";

const BOT_NAME = "BiBot";
const BOT_AVATAR = "🤖";
const WHATSAPP_NUMBER = "905321234567";
const WHATSAPP_MESSAGE = "Merhaba! BiHocam hakkında bilgi almak istiyorum.";

// ─── Message Types ────────────────────────────────────────────────────────────
interface ActionButton {
  label: string;
  href?: string;
  action?: string;
  style?: "primary" | "secondary" | "green";
}

interface Message {
  id: number;
  role: "bot" | "user";
  text: string;
  time: string;
  buttons?: ActionButton[];
}

function getTime() {
  return new Date().toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });
}

// ─── Sales-Oriented AI Brain ──────────────────────────────────────────────────
interface BotResponse {
  text: string;
  buttons?: ActionButton[];
}

function getAIResponse(input: string, messageCount: number): BotResponse {
  const q = input.toLowerCase().trim();

  // ── GREETING ──────────────────────────────────────────────────────────────
  if (/^(merhaba|selam|hey|hello|hi|iyi günler|günaydın|iyi akşam)/.test(q)) {
    return {
      text: "Merhaba! 👋 BiHocam'a hoş geldiniz! Türkiye'nin en kapsamlı online eğitim platformundayım.\n\nSize nasıl yardımcı olabilirim?",
      buttons: [
        { label: "🎓 Kurslara Bak", href: "/courses", style: "primary" },
        { label: "💰 Fiyatlar", action: "fiyat", style: "secondary" },
        { label: "🆓 Ücretsiz Dene", href: "/register", style: "green" },
      ],
    };
  }

  // ── COURSE / KURS ─────────────────────────────────────────────────────────
  if (/kurs|eğitim|ders|öğren|program|sınıf/.test(q)) {
    if (/yks|lgs|tyt|ayt|sınav|hazırlık/.test(q)) {
      return {
        text: "🎯 Sınav hazırlığı için mükemmel bir seçim yapıyorsunuz!\n\nBiHocam'da **YKS, TYT, AYT ve LGS** için:\n✅ Türkiye'nin en iyi eğitmenleri\n✅ 500+ konu anlatımı videosu\n✅ Canlı soru çözüm dersleri\n✅ Kişiselleştirilmiş öğrenme planı\n\nÜcretsiz deneme dersiyle başlayabilirsiniz! 🚀",
        buttons: [
          { label: "🎓 Sınav Kurslarını Gör", href: "/courses?category=sinav-hazirlik", style: "primary" },
          { label: "🆓 Ücretsiz Dene", href: "/register", style: "green" },
        ],
      };
    }
    return {
      text: "📚 Harika! BiHocam'da 200+ kurs ile her seviyeye uygun eğitimler var.\n\nEn popüler kategorilerimiz:\n🎯 Sınav Hazırlığı (YKS, LGS)\n💻 Yazılım & Teknoloji\n🌍 Yabancı Dil\n📊 İş & Kariyer\n🎨 Sanat & Tasarım\n\nHangi konuda eğitim almak istersiniz?",
      buttons: [
        { label: "📚 Tüm Kurslar", href: "/courses", style: "primary" },
        { label: "🔥 Popüler Kurslar", href: "/courses?sort=popular", style: "secondary" },
        { label: "🆓 Ücretsiz Kurslar", href: "/courses?price=free", style: "green" },
      ],
    };
  }

  // ── PRICE / FİYAT ─────────────────────────────────────────────────────────
  if (/fiyat|ücret|para|kaç lira|ne kadar|pahalı|ucuz|indirim|kupon/.test(q)) {
    if (/kupon|indirim|kampanya|kod/.test(q)) {
      return {
        text: "🎁 İndirim kuponu mu arıyorsunuz?\n\nŞu anda özel kampanyalarımız aktif! E-posta listemize kayıt olursanız **%20 indirim kodu** anında gönderilir.\n\nAyrıca ilk kayıtta **7 gün ücretsiz** tüm içeriklere erişebilirsiniz!",
        buttons: [
          { label: "🎁 İndirimi Al", href: "/register", style: "green" },
          { label: "📧 Kampanya Listesi", href: "/register?newsletter=1", style: "secondary" },
        ],
      };
    }
    return {
      text: "💰 BiHocam'da her bütçeye uygun seçenek var!\n\n📌 **Tek Kurs:** 99₺'den başlayan fiyatlar\n📌 **Aylık Plan:** 199₺/ay — sınırsız erişim\n📌 **Yıllık Plan:** 999₺/yıl — **%58 tasarruf!** ⭐\n\n✨ İlk 7 gün **ücretsiz** deneyin, beğenmezseniz para iadesi garantisi!",
      buttons: [
        { label: "⭐ Yıllık Plan Al", href: "/checkout?plan=yearly", style: "primary" },
        { label: "🆓 7 Gün Ücretsiz", href: "/register", style: "green" },
        { label: "📋 Tüm Planlar", href: "/courses", style: "secondary" },
      ],
    };
  }

  // ── FREE TRIAL / ÜCRETSIZ ─────────────────────────────────────────────────
  if (/ücretsiz|bedava|free|deneme|dene/.test(q)) {
    return {
      text: "🆓 Evet, BiHocam'ı **7 gün tamamen ücretsiz** deneyebilirsiniz!\n\n✅ Kredi kartı gerekmez\n✅ 200+ kursa tam erişim\n✅ Canlı dersler dahil\n✅ İstediğiniz zaman iptal\n\nHemen kaydolun, 2 dakikada başlayın! 🚀",
      buttons: [
        { label: "🚀 Ücretsiz Başla", href: "/register", style: "green" },
        { label: "📚 Kurslara Bak", href: "/courses", style: "secondary" },
      ],
    };
  }

  // ── CERTIFICATE / SERTİFİKA ───────────────────────────────────────────────
  if (/sertifika|belge|diploma|bitirme/.test(q)) {
    return {
      text: "🏆 BiHocam sertifikaları iş başvurularında fark yaratıyor!\n\nKursu **%80 tamamladığınızda:**\n✅ Dijital sertifika anında e-postanıza gelir\n✅ LinkedIn profilinize ekleyebilirsiniz\n✅ QR kodlu doğrulama sistemi\n✅ İşverenler için doğrulanabilir\n\nHangi alanda sertifika almak istiyorsunuz?",
      buttons: [
        { label: "🏆 Sertifikalı Kurslar", href: "/courses?certificate=true", style: "primary" },
        { label: "✅ Sertifika Doğrula", href: "/verify-certificate", style: "secondary" },
      ],
    };
  }

  // ── INSTRUCTOR / EĞİTMEN ──────────────────────────────────────────────────
  if (/eğitmen|öğretmen|hoca|instructor|anlat|kimler/.test(q)) {
    if (/ol|başvur|olmak|kayıt/.test(q)) {
      return {
        text: "🎓 Eğitmen olmak için harika bir karar!\n\nBiHocam'da eğitmen olarak:\n💰 Satışlardan **%70 komisyon** alırsınız\n📈 1 milyon+ öğrenciye ulaşırsınız\n🛠️ Ücretsiz kurs oluşturma araçları\n📊 Detaylı analiz & raporlama\n\nBaşvurunuz genellikle **3 iş günü** içinde değerlendirilir.",
        buttons: [
          { label: "📝 Eğitmen Başvurusu", href: "/become-instructor", style: "primary" },
          { label: "💰 Komisyon Detayları", href: "/become-instructor#benefits", style: "secondary" },
        ],
      };
    }
    return {
      text: "⭐ BiHocam eğitmenleri Türkiye'nin en iyileri!\n\nTüm eğitmenlerimiz:\n✅ Alanında en az 5 yıl deneyimli\n✅ Sıkı seçim sürecinden geçiyor\n✅ Sürekli öğrenci değerlendirmesi\n✅ Ortalama **4.8/5** puan\n\nEğitmenleri incelemeye ne dersiniz?",
      buttons: [
        { label: "👩‍🏫 Eğitmenleri Gör", href: "/teachers", style: "primary" },
        { label: "⭐ En İyi Eğitmenler", href: "/teachers?sort=rating", style: "secondary" },
      ],
    };
  }

  // ── LIVE LESSONS / CANLI DERS ─────────────────────────────────────────────
  if (/canlı|live|zoom|video call|görüntülü|bire bir/.test(q)) {
    return {
      text: "🎥 Canlı dersler çok popüler!\n\nBiHocam Canlı Ders özellikleri:\n✅ Birebir veya grup dersleri\n✅ Gerçek zamanlı soru-cevap\n✅ Ders kaydı sonradan izlenebilir\n✅ Eğitmenle doğrudan iletişim\n✅ Haftalık ve aylık programlar\n\nBu hafta müsait dersler var! 🚀",
      buttons: [
        { label: "🎥 Canlı Derslere Bak", href: "/live-lessons", style: "primary" },
        { label: "📅 Programa Bak", href: "/live-lessons?tab=schedule", style: "secondary" },
      ],
    };
  }

  // ── REFUND / İADE ────────────────────────────────────────────────────────
  if (/iade|para iadesi|geri ödeme|iptal|beğenmedim/.test(q)) {
    return {
      text: "💯 BiHocam'da **30 gün para iadesi garantisi** var!\n\nEğitimden memnun kalmazsanız:\n✅ 30 gün içinde tam iade\n✅ Sorgusuz sualsiz\n✅ 5 iş günü içinde hesabınıza\n\nRiski sıfır, denemeye ne engel? 😊",
      buttons: [
        { label: "🚀 Şimdi Dene", href: "/courses", style: "primary" },
        { label: "📞 Destek Hattı", action: "whatsapp", style: "secondary" },
      ],
    };
  }

  // ── PASSWORD / ŞİFRE ────────────────────────────────────────────────────
  if (/şifre|password|giriş yapamıyorum|hesabım|unutt/.test(q)) {
    return {
      text: "🔐 Şifrenizi sıfırlamak çok kolay!\n\n1️⃣ **Giriş Yap** sayfasına gidin\n2️⃣ **\"Şifremi Unuttum\"** linkine tıklayın\n3️⃣ E-posta adresinizi girin\n4️⃣ Gelen maildeki linke tıklayın\n\nSorun devam ederse destek ekibimiz yardımcı olur!",
      buttons: [
        { label: "🔐 Şifremi Sıfırla", href: "/forgot-password", style: "primary" },
        { label: "💬 Destek Al", action: "whatsapp", style: "secondary" },
      ],
    };
  }

  // ── CONTACT / İLETİŞİM ─────────────────────────────────────────────────
  if (/iletişim|telefon|mail|email|ulaş|destek|yardım/.test(q)) {
    return {
      text: "📞 Bize birçok kanaldan ulaşabilirsiniz:\n\n📧 **E-posta:** iletisim@bihocam.com\n📱 **WhatsApp:** +90 532 123 4567\n⏰ **Çalışma saatleri:** Pzt-Cum 09:00-18:00\n\nWhatsApp ile anlık destek alabilirsiniz! 💬",
      buttons: [
        { label: "💬 WhatsApp'ta Yaz", action: "whatsapp", style: "green" },
        { label: "📧 İletişim Sayfası", href: "/iletisim", style: "secondary" },
      ],
    };
  }

  // ── PURCHASE PUSH (after 3+ messages with no purchase) ────────────────────
  if (messageCount >= 5) {
    return {
      text: "💡 Görünüşe göre biraz araştırıyorsunuz — bu akıllıca! 😊\n\nSize özel teklifimiz:\n🎁 Şu an kayıt olursanız **ilk ay %30 indirim** + **7 gün ücretsiz deneme!**\n\nBu teklif sadece bugün geçerli! ⏰",
      buttons: [
        { label: "🎁 Teklifi Al", href: "/register?offer=30off", style: "green" },
        { label: "📚 Kurslara Bak", href: "/courses", style: "primary" },
        { label: "💬 WhatsApp Destek", action: "whatsapp", style: "secondary" },
      ],
    };
  }

  // ── DEFAULT / FALLBACK ────────────────────────────────────────────────────
  return {
    text: "Anladım! 🤔 Bu konuda size en iyi şekilde yardımcı olmak istiyorum.\n\nŞunlardan biri ilginizi çekiyor mu?",
    buttons: [
      { label: "📚 Tüm Kurslar", href: "/courses", style: "primary" },
      { label: "💰 Fiyatlar", action: "fiyat", style: "secondary" },
      { label: "💬 WhatsApp Destek", action: "whatsapp", style: "green" },
    ],
  };
}

const QUICK_REPLIES = [
  "Kurs fiyatları nedir?",
  "Ücretsiz deneme var mı?",
  "Sertifika alabilir miyim?",
  "YKS hazırlık kursları",
];

// ─── Component ────────────────────────────────────────────────────────────────
export default function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [activeView, setActiveView] = useState<"menu" | "chat">("menu");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      role: "bot",
      text: "Merhaba! 👋 Ben BiBot, BiHocam'ın AI asistanıyım.\n\nSize doğru kursu bulmada yardımcı olabilirim! Nasıl başlamak istersiniz?",
      time: getTime(),
      buttons: [
        { label: "📚 Kurslara Bak", href: "/courses", style: "primary" },
        { label: "💰 Fiyat & Planlar", action: "fiyat", style: "secondary" },
        { label: "🆓 Ücretsiz Dene", href: "/register", style: "green" },
      ],
    },
  ]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [pulse, setPulse] = useState(true);
  const [userMsgCount, setUserMsgCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100);
  }, [open, activeView]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  useEffect(() => {
    const t = setTimeout(() => setPulse(false), 6000);
    return () => clearTimeout(t);
  }, []);

  const sendMessage = async (text: string) => {
    if (!text.trim()) return;

    const newCount = userMsgCount + 1;
    setUserMsgCount(newCount);

    const userMsg: Message = { id: Date.now(), role: "user", text, time: getTime() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTyping(true);

    const thinkTime = 700 + Math.random() * 800;
    await new Promise((r) => setTimeout(r, thinkTime));

    const response = getAIResponse(text, newCount);
    setTyping(false);
    setMessages((prev) => [
      ...prev,
      {
        id: Date.now() + 1,
        role: "bot",
        text: response.text,
        time: getTime(),
        buttons: response.buttons,
      },
    ]);
  };

  const handleButtonClick = (btn: ActionButton) => {
    if (btn.action === "whatsapp") {
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`, "_blank");
    } else if (btn.action && btn.action !== "whatsapp") {
      sendMessage(btn.action === "fiyat" ? "Fiyatlar hakkında bilgi verir misin?" : btn.label);
    } else if (btn.href) {
      window.location.href = btn.href;
    }
  };

  const handleWhatsApp = () => {
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`, "_blank");
  };

  const buttonStyle = (style?: string) => {
    if (style === "primary") return "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:shadow-md hover:shadow-teal-500/30";
    if (style === "green") return "bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:shadow-md hover:shadow-green-500/30";
    return "bg-gray-100 text-gray-700 hover:bg-gray-200";
  };

  const formatText = (text: string) => {
    return text.split("\n").map((line, i) => {
      const bold = line.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
      return (
        <span key={i} className="block" dangerouslySetInnerHTML={{ __html: bold || "&nbsp;" }} />
      );
    });
  };

  return (
    <>
      {/* WhatsApp Floating Button */}
      <div className="fixed bottom-24 right-6 z-50">
        <div
          className="relative group cursor-pointer hover:scale-110 transition-transform duration-200"
          onClick={handleWhatsApp}
          title="WhatsApp ile Yaz"
        >
          {pulse && (
            <>
              <span className="absolute inset-0 rounded-full bg-green-400 animate-ping opacity-25" />
              <span className="absolute inset-0 rounded-full bg-green-400 animate-pulse opacity-15" />
            </>
          )}
          <div className="relative w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-2xl shadow-green-500/40">
            <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
          </div>
          {/* Tooltip */}
          <div className="absolute right-16 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs font-medium px-3 py-1.5 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none shadow-xl">
            WhatsApp ile Yaz
            <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1 w-2 h-2 bg-gray-900 rotate-45" />
          </div>
        </div>
      </div>

      {/* AI Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        {/* Chat Panel */}
        <div
          className={`absolute bottom-20 right-0 w-[370px] bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden transition-all duration-300 origin-bottom-right ${
            open ? "opacity-100 scale-100 translate-y-0" : "opacity-0 scale-95 translate-y-4 pointer-events-none"
          }`}
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-teal-500 to-teal-600 px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-xl border border-white/30">
                    {BOT_AVATAR}
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-teal-500" />
                </div>
                <div>
                  <p className="text-white font-bold text-sm">{BOT_NAME} — Satış Asistanı</p>
                  <p className="text-teal-100 text-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block animate-pulse" />
                    AI Destekli · Anlık Yanıt
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {activeView === "chat" && (
                  <button
                    onClick={() => setActiveView("menu")}
                    className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                    title="Ana Menü"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                    </svg>
                  </button>
                )}
                <button
                  onClick={() => setOpen(false)}
                  className="p-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>

          {/* ── MENU VIEW ── */}
          {activeView === "menu" && (
            <div className="p-4 space-y-3">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-1">Nasıl yardımcı olabiliriz?</p>

              <button
                onClick={() => setActiveView("chat")}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-teal-50 to-cyan-50 hover:from-teal-100 hover:to-cyan-100 border border-teal-200 rounded-2xl transition-all group"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-xl shadow-lg shadow-teal-500/30 flex-shrink-0 group-hover:scale-110 transition-transform">
                  🤖
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-gray-900 text-sm">AI Satış Asistanı</p>
                  <p className="text-xs text-gray-500 mt-0.5">Kursu bul, satın al — anında rehberlik</p>
                  <div className="flex items-center gap-1 mt-1">
                    <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-xs text-green-600 font-medium">Şu an çevrimiçi</span>
                  </div>
                </div>
                <svg className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button
                onClick={handleWhatsApp}
                className="w-full flex items-center gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 border border-green-200 rounded-2xl transition-all group"
              >
                <div className="w-12 h-12 bg-[#25D366] rounded-xl flex items-center justify-center shadow-lg shadow-green-500/30 flex-shrink-0 group-hover:scale-110 transition-transform">
                  <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div className="text-left flex-1">
                  <p className="font-bold text-gray-900 text-sm">WhatsApp Destek</p>
                  <p className="text-xs text-gray-500 mt-0.5">Uzman ekibimizle konuşun</p>
                  <p className="text-xs text-gray-400 mt-1">Pzt–Cum 09:00–18:00</p>
                </div>
                <svg className="w-5 h-5 text-green-400 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              {/* Quick action buttons */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <a href="/courses" className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 hover:bg-teal-50 border border-gray-200 hover:border-teal-200 rounded-xl transition-all text-left group">
                  <span className="text-lg">📚</span>
                  <span className="text-xs font-semibold text-gray-700 group-hover:text-teal-700">Tüm Kurslar</span>
                </a>
                <a href="/register" className="flex items-center gap-2 px-3 py-2.5 bg-green-50 hover:bg-green-100 border border-green-200 rounded-xl transition-all text-left group">
                  <span className="text-lg">🆓</span>
                  <span className="text-xs font-semibold text-green-700">Ücretsiz Dene</span>
                </a>
              </div>
            </div>
          )}

          {/* ── CHAT VIEW ── */}
          {activeView === "chat" && (
            <div className="flex flex-col" style={{ height: "460px" }}>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                {messages.map((msg) => (
                  <div key={msg.id} className={`flex items-end gap-2 ${msg.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                    {msg.role === "bot" && (
                      <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                        {BOT_AVATAR}
                      </div>
                    )}
                    <div className={`max-w-[82%] ${msg.role === "user" ? "items-end" : "items-start"} flex flex-col gap-2`}>
                      {/* Bubble */}
                      <div
                        className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm ${
                          msg.role === "bot"
                            ? "bg-white text-gray-800 rounded-tl-none border border-gray-100"
                            : "bg-gradient-to-br from-teal-500 to-teal-600 text-white rounded-tr-none"
                        }`}
                      >
                        <div className="space-y-0.5">{formatText(msg.text)}</div>
                      </div>

                      {/* Action Buttons */}
                      {msg.buttons && msg.buttons.length > 0 && (
                        <div className="flex flex-wrap gap-2 w-full">
                          {msg.buttons.map((btn, idx) => (
                            <button
                              key={idx}
                              onClick={() => handleButtonClick(btn)}
                              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md ${buttonStyle(btn.style)}`}
                            >
                              {btn.label}
                            </button>
                          ))}
                        </div>
                      )}

                      <p className={`text-[10px] text-gray-400 ${msg.role === "user" ? "text-right self-end" : "text-left"}`}>
                        {msg.time}
                      </p>
                    </div>
                  </div>
                ))}

                {typing && (
                  <div className="flex items-end gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-xs flex-shrink-0 shadow-sm">
                      {BOT_AVATAR}
                    </div>
                    <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1">
                        {[0, 1, 2].map((i) => (
                          <div key={i} className="w-2 h-2 bg-teal-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                        ))}
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Replies — only first 2 messages */}
              {messages.length <= 2 && (
                <div className="px-3 py-2 border-t border-gray-100 bg-white/80 flex gap-2 overflow-x-auto scrollbar-none">
                  {QUICK_REPLIES.map((q) => (
                    <button
                      key={q}
                      onClick={() => sendMessage(q)}
                      className="flex-shrink-0 px-3 py-1.5 bg-teal-50 hover:bg-teal-100 text-teal-700 text-xs font-medium rounded-full border border-teal-200 transition-colors whitespace-nowrap"
                    >
                      {q}
                    </button>
                  ))}
                </div>
              )}

              {/* Input */}
              <div className="p-3 border-t border-gray-100 bg-white">
                <form
                  onSubmit={(e) => { e.preventDefault(); sendMessage(input); }}
                  className="flex items-center gap-2"
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Sorunuzu yazın..."
                    className="flex-1 px-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                  <button
                    type="submit"
                    disabled={!input.trim()}
                    className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center text-white hover:shadow-lg hover:shadow-teal-500/30 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
                  >
                    <svg className="w-4 h-4 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </button>
                </form>
                <p className="text-center text-[10px] text-gray-400 mt-2">AI destekli · BiHocam tarafından sağlanır</p>
              </div>
            </div>
          )}
        </div>

        {/* Toggle Button */}
        <button
          id="floating-chat-toggle"
          onClick={() => setOpen(!open)}
          className="relative w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-full flex items-center justify-center shadow-2xl shadow-teal-500/40 hover:shadow-teal-500/60 hover:scale-110 transition-all duration-200"
        >
          {open ? (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          )}
        </button>
      </div>
    </>
  );
}
