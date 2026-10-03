"use client";

import { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PopupAnnouncement from "@/components/PopupAnnouncement";
import { usePopupAnnouncement } from "@/hooks/usePopupAnnouncement";
import { FaqJsonLd } from "@/components/seo/JsonLd";
import HeroSearchCapsule from "@/components/home/HeroSearchCapsule";
import Hero3DFloatingVisual from "@/components/home/Hero3DFloatingVisual";
import LiveClassVideoSection from "@/components/home/LiveClassVideoSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import LessonHourFlowSection from "@/components/home/LessonHourFlowSection";
import WhyBiHocamSection from "@/components/home/WhyBiHocamSection";
import InstructorsShowcaseSection from "@/components/home/InstructorsShowcaseSection";
import BecomeInstructorSection from "@/components/home/BecomeInstructorSection";
import CoursesShowcaseSection from "@/components/home/CoursesShowcaseSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import {
  Sparkles,
  ArrowRight,
  CheckCircle2,
  ShieldCheck,
  PlusCircle,
  GraduationCap,
  Check,
  HelpCircle,
  Sprout,
  BookOpen,
  Target,
  Globe,
  Compass,
  Lightbulb,
  Video,
} from "lucide-react";

export const HOME_FAQS = [
  {
    q: "Canlı dersler için bilgisayarıma ek bir uygulama kurmam gerekiyor mu?",
    a: "Hayır. Canlı dersler tamamen web tarayıcın üzerinden çalışır. Zoom veya benzeri ek bir program indirmene gerek kalmadan, tek tıkla derse bağlanabilir, interaktif beyaz tahta ve çalışma kaynaklarını kullanabilirsin.",
  },
  {
    q: "Özel ders talebi nasıl çalışır ve teklifleri nasıl değerlendiririm?",
    a: "İhtiyaç duyduğun branşı, sınıf düzeyini ve bütçe aralığını belirterek ücretsiz ders talebi açarsın. Onaylı eğitmenler talebini inceler ve sana özel saatlik ders tekliflerini iletir. Gelen teklifleri profilleri, uzmanlık alanları ve fiyatları karşılaştırarak tek tıkla değerlendirebilirsin.",
  },
  {
    q: "Eğitmenlerin uzmanlık ve tecrübesinden nasıl emin oluyorsunuz?",
    a: "Platformumuzda yer alan her eğitmen; kimlik doğrulaması ve diploma/öğretmenlik belgesi kontrolü aşamalarından geçer. Yalnızca bu kontrolleri başarıyla tamamlayan eğitmenler platformda ders verebilir.",
  },
  {
    q: "Derslerden memnun kalmazsam iptal ve iade süreci nasıl işler?",
    a: "Ders planlamalarında memnuniyet esastır. Henüz işlenmemiş ve mesafeli satış sözleşmesi kapsamında iptal süresi dolmamış ders saatlerin için sözleşme koşullarına uygun olarak kesintisiz iade talebinde bulunabilirsin.",
  },
  {
    q: "Ödemeler nasıl yapılıyor ve taksit seçeneği var mı?",
    a: "Ödemeler {{ODEME_KURULUSU_ADI}} altyapısı üzerinden 3D Secure ve emanet havuz güvencesiyle gerçekleştirilir. Anlaşmalı kredi kartlarına 6 aya varan taksit imkanından yararlanabilirsin. Sen dersini tamamlayıp onaylamadan ücret eğitmene aktarılmaz.",
  },
  {
    q: "Satın aldığım ders saatlerini ne kadar süre içinde kullanmalıyım?",
    a: "Satın aldığın ders saatlerini eğitim-öğretim yılı boyunca dilediğin gün ve saatte eğitmeninle planlayarak kullanabilirsin. Saatlerinde haftalık zorunlu yanma süresi bulunmaz.",
  },
];

const COMPARISON_ROWS = [
  {
    feature: "Saatlik Ders Modeli",
    bihocam: "İhtiyaca göre serbest saatlik seans",
    ozel: "Genellikle sabit ve peşin seans ücreti",
    dershane: "Dönemlik/yıllık toplu kayıt taahhüdü",
  },
  {
    feature: "Eğitmen Seçimi",
    bihocam: "Profilleri inceleme & teklif toplama",
    ozel: "Yakın çevre veya tavsiye ile sınırlı",
    dershane: "Kurum tarafından belirlenen sınıf öğretmeni",
  },
  {
    feature: "Ders Tekrarı & Materyal",
    bihocam: "Ders notlarına dijital arşiv erişimi",
    ozel: "Fiziksel not alma ile sınırlı",
    dershane: "Kaçırılan ders telafisi kısıtlı",
  },
  {
    feature: "Geri Bildirim & Takip",
    bihocam: "Her ders sonrası eğitmen notu, düzenli rapor",
    ozel: "Birebir görüşmede sözlü geri bildirim",
    dershane: "Dönemlik toplu deneme sınavı sonuçları",
  },
  {
    feature: "Ulaşım & Zaman Maliyeti",
    bihocam: "0 dk yol (Ev konforunda canlı online seans)",
    ozel: "Öğrenci veya eğitmen için yol süresi",
    dershane: "Haftalık sabit günlerde dershaneye gidiş-dönüş",
  },
  {
    feature: "Profil & Belge Doğrulama",
    bihocam: "Kimlik ve diploma kontrolü yapılmış eğitmen",
    ozel: "Kişisel referanslara dayalı güven",
    dershane: "Kurumsal denetimli eğitmen kadrosu",
  },
];

const LEVEL_CARDS = [
  { id: "ilkokul", title: "İlkokul", icon: Sprout, iconColor: "text-emerald-600", badge: "Temel Seviye" },
  { id: "ortaokul", title: "Ortaokul", icon: BookOpen, iconColor: "text-teal-600", badge: "LGS Hazırlık" },
  { id: "lise", title: "Lise", icon: Target, iconColor: "text-indigo-600", badge: "YKS / TYT / AYT" },
  { id: "yabanci-dil", title: "Yabancı Dil", icon: Globe, iconColor: "text-rose-600", badge: "Genel & Sınav" },
  { id: "kocluk", title: "Koçluk", icon: Compass, iconColor: "text-purple-600", badge: "Öğrenci & Kariyer" },
  { id: "yazilim", title: "Yazılım", icon: Lightbulb, iconColor: "text-amber-600", badge: "Kodlama & Algoritma" },
];

export default function HomePage() {
  const { activePopup, dismissPopup } = usePopupAnnouncement();
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Callback (Sizi Ücretsiz Arayalım) Form State
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackConsent, setCallbackConsent] = useState(false);
  const [callbackStatus, setCallbackStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [callbackError, setCallbackError] = useState("");

  const handleCallbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!callbackName.trim() || !callbackPhone.trim()) return;
    if (!callbackConsent) {
      setCallbackError("Lütfen Kullanım Şartları ve KVKK Aydınlatma Metnini onaylayınız.");
      return;
    }
    setCallbackStatus("submitting");
    setCallbackError("");
    try {
      const response = await fetch("/api/v1/call-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ name: callbackName.trim(), phone: callbackPhone.trim() }),
      });
      if (!response.ok) {
        throw new Error("Talep kaydedilemedi.");
      }
      setCallbackStatus("success");
      setCallbackName("");
      setCallbackPhone("");
    } catch {
      setCallbackError("Arama talebi iletilemedi. Lütfen doğrudan telefon numaramızdan bize ulaşın.");
      setCallbackStatus("error");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-emerald-500 selection:text-white">
      {activePopup && (
        <PopupAnnouncement
          popup={activePopup}
          onClose={() => dismissPopup(activePopup.id, false)}
          onDismiss={dismissPopup}
        />
      )}

      <Header />

      <main id="main-content" role="main" className="flex-1">
        <FaqJsonLd faqs={HOME_FAQS} />

        {/* ══════════════════════════════════════════════════════ */}
        {/* 1. HERO - MODERN ASYMMETRIC LIGHT REDESIGN            */}
        {/* ══════════════════════════════════════════════════════ */}
        <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden bg-white border-b border-slate-100">
          <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none" />
          <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-teal-100/40 rounded-full blur-[160px] pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
              {/* LEFT COLUMN */}
              <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
                {/* Unified Slogan Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-xs"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>TÜRKİYE&apos;NİN YENİ NESİL ÖZEL DERS PLATFORMU</span>
                </motion.div>

                {/* Single H1 Headline */}
                <motion.h1
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.1 }}
                  className="text-4xl sm:text-5xl lg:text-6xl font-black text-[#1b2559] tracking-tight leading-[1.08] font-display"
                >
                  Geleceğini Şekillendirecek{" "}
                  <span className="text-[#5a8a10]">
                    Uzman Eğitmenler
                  </span>{" "}
                  Burada!
                </motion.h1>

                {/* Subtitle in "sen" voice */}
                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.2 }}
                  className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
                >
                  YKS, LGS, yabancı dil ve tüm okul derslerinde doğrulanmış eğitmenlerle{" "}
                  <span className="text-emerald-700 font-semibold">birebir canlı ders</span> yap.
                  İster hemen eğitmenini seç, ister{" "}
                  <span className="text-emerald-700 font-semibold">özel ders talebi açarak</span> eğitmenlerin sana özel teklif vermesini sağla.
                </motion.p>

                {/* Search Capsule */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.25 }}
                  className="w-full"
                >
                  <HeroSearchCapsule />
                </motion.div>

                {/* Dual CTA Buttons (Hero has only these 2 buttons; Eğitmen Ol moved to nav/footer/strip) */}
                <motion.div
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.3 }}
                  className="flex flex-col sm:flex-row justify-center lg:justify-start items-center gap-3 pt-2 w-full max-w-xl"
                >
                  <Link
                    href="/tenders/new"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-[#1b2559] hover:bg-[#252f6e] text-white font-bold text-sm shadow-lg shadow-[#1b2559]/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Ders Talebi Aç</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/teachers"
                    className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm shadow-xs hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5"
                  >
                    <span>Eğitmenleri Keşfet</span>
                  </Link>
                </motion.div>

                {/* Max 3 Concise Trust Bullets (Replacing 4 fake stat counters) */}
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                  className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-4 sm:gap-6 text-xs text-slate-600 font-medium"
                >
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Doğrulanmış Branş Eğitmenleri</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-teal-600 shrink-0" />
                    <span>Emanet Havuz Ödeme Koruması</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-indigo-600 shrink-0" />
                    <span>Kurulumsuz Canlı Sanal Sınıf</span>
                  </div>
                </motion.div>
              </div>

              {/* RIGHT COLUMN: 3D Visual */}
              <div className="lg:col-span-5 w-full flex items-center justify-center">
                <Hero3DFloatingVisual />
              </div>
            </div>

            {/* Quick Level Navigation Cards (Retained per audit specification) */}
            <div className="mt-14 pt-10 border-t border-slate-100">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3.5">
                {LEVEL_CARDS.map((cat) => {
                  const IconComp = cat.icon;
                  return (
                    <Link
                      key={cat.id}
                      href={`/teachers?category=${cat.id}`}
                      className="group rounded-2xl border border-slate-200/90 bg-slate-50/70 p-3.5 text-center hover:bg-white hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col items-center justify-between"
                    >
                      <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                        <IconComp className={`w-4 h-4 ${cat.iconColor}`} />
                      </div>
                      <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                        {cat.title}
                      </p>
                      <span className="text-[10px] text-slate-500 mt-1 font-medium">{cat.badge}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════ */}
        {/* 2. CANLI DERS VİDEO VİTRİNİ                             */}
        {/* ══════════════════════════════════════════════════════ */}
        <LiveClassVideoSection />

        {/* ══════════════════════════════════════════════════════ */}
        {/* 3. NASIL ÇALIŞIR                                       */}
        {/* ══════════════════════════════════════════════════════ */}
        <HowItWorksSection />

        {/* ══════════════════════════════════════════════════════ */}
        {/* 3.1 DERS SAATİ AKIŞI & 3D SAAT KADRANI                */}
        {/* ══════════════════════════════════════════════════════ */}
        <LessonHourFlowSection />

        {/* ══════════════════════════════════════════════════════ */}
        {/* 4. NEDEN BIHOCAM (3 GÜVEN BLOĞU)                       */}
        {/* ══════════════════════════════════════════════════════ */}
        <WhyBiHocamSection />

        {/* ══════════════════════════════════════════════════════ */}
        {/* 5. EĞİTMENLER (GERÇEK VERİ İLE DOLAR, BOŞSA GİZLENİR)   */}
        {/* ══════════════════════════════════════════════════════ */}
        <InstructorsShowcaseSection />

        {/* ══════════════════════════════════════════════════════ */}
        {/* 5.1 EĞİTMEN KADROMUZA KATILIN (3D SHOWCASE)           */}
        {/* ══════════════════════════════════════════════════════ */}
        <BecomeInstructorSection />

        {/* ══════════════════════════════════════════════════════ */}
        {/* 5.2 CANLI VE KAPSAMLI KURSLAR VİTRİNİ                 */}
        {/* ══════════════════════════════════════════════════════ */}
        <CoursesShowcaseSection />

        {/* ══════════════════════════════════════════════════════ */}
        {/* 6. FİYAT ÖZETİ (2-3 SATIRLIK ÖZET & /fiyatlar LİNKİ)   */}
        {/* ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-slate-50 border-b border-slate-200/80 relative overflow-hidden">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ŞEFFAF FİYATLANDIRMA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
              Bütçene Uygun Özel Ders Planlaması
            </h2>
            <p className="text-slate-600 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              Fiyatlar eğitmene göre değişir; ihtiyacına uygun ders saatini belirleyip gelen teklifleri karşılaştırarak seçersin.
              Paket sürelerinde avantajlı indirimler ve anlaşmalı kartlara 6 aya varan taksit seçenekleri mevcuttur.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/fiyatlar"
                className="px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md shadow-emerald-600/20 transition-all flex items-center gap-2"
              >
                <span>Detaylı Bütçe Hesaplayıcı & Taksit Seçenekleri</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tenders/new"
                className="px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-100 text-slate-800 border border-slate-300 font-bold text-sm transition-all"
              >
                Ders Talebi Aç
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════ */}
        {/* 7. KARŞILAŞTIRMA TABLOSU (SADECE TABLO, KARTLAR SİLİNDİ) */}
        {/* ══════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 bg-white border-b border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>ŞEFFAF KARŞILAŞTIRMA</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
                Eğitim Seçeneklerinin Karşılaştırması
              </h2>
              <p className="text-slate-600 font-normal max-w-2xl mx-auto text-sm sm:text-base">
                Özel ders ihtiyacın için farklı modelleri objektif kriterlere göre incele.
              </p>
            </div>

            {/* Responsive Comparison Table */}
            <div className="overflow-x-auto rounded-3xl border border-slate-200 shadow-sm bg-white">
              <table className="w-full text-left border-collapse min-w-[640px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200">
                    <th className="p-5 text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4">Kriter</th>
                    <th className="p-5 text-xs font-black text-emerald-950 uppercase tracking-wider w-1/4 bg-emerald-50/90 border-x border-emerald-200 text-center">
                      BiHocam Canlı Birebir
                    </th>
                    <th className="p-5 text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4 text-center">
                      Fiziksel Özel Ders
                    </th>
                    <th className="p-5 text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4 text-center">
                      Geleneksel Dershane
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                  {COMPARISON_ROWS.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                      <td className="p-5 text-slate-900 font-bold text-xs sm:text-sm">{row.feature}</td>
                      <td className="p-5 text-emerald-900 font-black text-xs sm:text-sm bg-emerald-50/40 border-x border-emerald-200 text-center">
                        {row.bihocam}
                      </td>
                      <td className="p-5 text-slate-600 font-medium text-xs sm:text-sm text-center">{row.ozel}</td>
                      <td className="p-5 text-slate-600 font-medium text-xs sm:text-sm text-center">{row.dershane}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════ */}
        {/* 8. YORUMLAR (GERÇEK VERİ YOKSA OTOMATİK GİZLENİR)       */}
        {/* ══════════════════════════════════════════════════════ */}
        <TestimonialsSection />

        {/* ══════════════════════════════════════════════════════ */}
        {/* 9. SSS (SIKÇA SORULAN SORULAR)                         */}
        {/* ══════════════════════════════════════════════════════ */}
        <section className="py-20 sm:py-24 bg-slate-50 border-b border-slate-200">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-14 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
                <span>AKLINDAKİ SORULAR</span>
              </div>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
                Sıkça Sorulan Sorular
              </h2>
              <p className="text-slate-600 font-normal max-w-2xl mx-auto text-sm sm:text-base">
                Canlı ders süreçleri, ödemeler, özel ders talepleri ve eğitmenler hakkında tüm merak edilenler.
              </p>
            </div>

            <div className="space-y-3.5">
              {HOME_FAQS.map((faq, idx) => (
                <div
                  key={idx}
                  className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-2xs transition-all"
                >
                  <button
                    type="button"
                    id={`faq-button-${idx}`}
                    aria-expanded={activeFaq === idx}
                    aria-controls={`faq-answer-${idx}`}
                    onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                    className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-emerald-700 transition-colors text-sm sm:text-base"
                  >
                    <span>{faq.q}</span>
                    <span className="text-lg text-emerald-600 font-mono font-bold select-none shrink-0">
                      {activeFaq === idx ? "−" : "+"}
                    </span>
                  </button>
                  <AnimatePresence initial={false}>
                    {activeFaq === idx && (
                      <motion.div
                        id={`faq-answer-${idx}`}
                        role="region"
                        aria-labelledby={`faq-button-${idx}`}
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-slate-600 text-xs sm:text-sm leading-relaxed border-t border-slate-100 pt-3">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════ */}
        {/* 10. ARA-BENİ FORMU + TEK KAPANIŞ CTA                  */}
        {/* ══════════════════════════════════════════════════════ */}
        <section className="py-20 bg-white border-b border-slate-200">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-50 border border-slate-200 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row gap-8 items-center justify-between shadow-sm">
              <div className="space-y-3 md:w-1/2 text-left">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                  <span>BİZE DANIŞIN</span>
                </div>
                <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">Sizi Ücretsiz Arayalım</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Hedeflerine en uygun eğitmen ve ders planlamasını eğitim uzmanlarımızla birlikte yap: <br />
                  <span className="font-mono font-bold text-emerald-700 text-base">+90 (850) 840 55 43</span>
                </p>
              </div>

              {callbackStatus === "success" ? (
                <div className="w-full md:w-1/2 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto" />
                  <h4 className="text-base font-bold text-emerald-950">Talebin Başarıyla Alındı!</h4>
                  <p className="text-xs text-emerald-800">
                    Eğitim danışmanlarımız en kısa sürede belirttiğin telefon numarasından sana ulaşacaktır.
                  </p>
                  <button
                    type="button"
                    onClick={() => setCallbackStatus("idle")}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                  >
                    Yeni Talep İlet
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCallbackSubmit} className="w-full md:w-1/2 space-y-3">
                  {callbackStatus === "error" && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {callbackError}
                    </div>
                  )}

                  <input
                    type="text"
                    required
                    value={callbackName}
                    onChange={(e) => setCallbackName(e.target.value)}
                    placeholder="Adın ve Soyadın"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                  />

                  <input
                    type="tel"
                    required
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    placeholder="Telefon (05xx xxx xx xx)"
                    className="w-full px-4 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600"
                  />

                  <div className="flex items-start gap-2 pt-1">
                    <input
                      id="home-consent"
                      type="checkbox"
                      required
                      checked={callbackConsent}
                      onChange={(e) => setCallbackConsent(e.target.checked)}
                      className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-slate-300 accent-emerald-600 cursor-pointer"
                    />
                    <label htmlFor="home-consent" className="text-xs text-slate-600 leading-snug cursor-pointer">
                      <Link href="/pages/uyelik-sozlesmesi" target="_blank" className="font-semibold text-emerald-700 underline">
                        Kullanım Şartları
                      </Link>{" "}
                      ve{" "}
                      <Link href="/pages/KVKK-aydinlatma-metni" target="_blank" className="font-semibold text-emerald-700 underline">
                        KVKK Metnini
                      </Link>{" "}
                      okudum, onaylıyorum.
                    </label>
                  </div>

                  <button
                    type="submit"
                    disabled={callbackStatus === "submitting" || !callbackConsent}
                    className="w-full py-3 text-xs sm:text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    {callbackStatus === "submitting" ? "İletiliyor..." : "Arama Talebi Gönder →"}
                  </button>
                </form>
              )}
            </div>

            {/* Single Closing CTA Block (Ders Talebi Aç) */}
            <div className="mt-12 text-center">
              <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-r from-emerald-600 to-teal-700 text-white shadow-xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="text-left space-y-1">
                  <h3 className="text-2xl font-black font-display">Hedefine Ulaşmak İçin İlk Adımı At</h3>
                  <p className="text-emerald-100 text-sm">Ücretsiz özel ders talebi oluştur, eğitmenlerden bütçene uygun teklifler al.</p>
                </div>
                <Link
                  href="/tenders/new"
                  className="shrink-0 px-6 py-3.5 rounded-2xl bg-white text-emerald-950 font-bold text-sm hover:bg-emerald-50 shadow-md transition-all flex items-center gap-2"
                >
                  <PlusCircle className="w-4 h-4 text-emerald-600" />
                  <span>Ders Talebi Aç</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 12. FOOTER                                             */}
      {/* ══════════════════════════════════════════════════════ */}
      <Footer />
    </div>
  );
}
