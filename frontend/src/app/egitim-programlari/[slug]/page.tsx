"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { educationProgramsApi, EducationProgram } from "@/lib/api";

// ─── Shared Mock/Fallback Data (Loaded if program is not in DB yet) ───────────
const fallbackPrograms: Record<string, any> = {
  "tyt-tum-dersler": {
    slug: "tyt-tum-dersler",
    title: "TYT Tüm Dersler Eğitim Programı",
    category: "TYT",
    gradient: "from-gray-900 via-gray-800 to-gray-700",
    price: 6499500,
    original_price: 8999500,
    rating: 4.9,
    review_count: 1389,
    students: 12450,
    hours: 280,
    lessons: 420,
    description: "Bu eğitim programı kapsamında TYT'deki tüm dersler (Matematik, Türkçe, Sosyal Bilimler, Fen Bilimleri, Felsefe ve Dil Grupları) eksiksiz şekilde işlenmektedir. Her konu, alanında uzman eğitmenler tarafından sistematik ve anlaşılır bir şekilde anlatılmaktadır. Kurs boyunca 280 saatin üzerinde ders videosu, 5.000'den fazla soru çözümü ve kişiselleştirilmiş öğrenme desteği sunulmaktadır. Program, her seviyedeki öğrenciye uygun olup sıfırdan başlayan ile konuları pekiştirmek isteyen öğrencilere hitap etmektedir.",
    what_you_learn: [
      "TYT Matematik: Sayılar, Sayı Basamakları, Bölünebilme, Permütasyon ve Olasılık, Geometri, Analitik ve İstatistik konularını sıfırdan gelişmiş düzeye kadar ele alır.",
      "TYT Türkçe: Dil Bilgisi, Yazım Kuralları, Sözcük Bilgisi, Anlam Bilgisi, Okuma ve Anlam düzeylerinde kapsamlı içerik sunar.",
      "TYT Fen Bilimleri: Fizik, Kimya ve Biyoloji derslerinden sınav odaklı soru çözümleri ve güncel müfredat içeriği.",
      "Sosyal Bilimler: Tarih, Coğrafya ve Felsefe grup derslerinde temel kavramlardan sınav tekniklerine kapsamlı anlatım.",
      "Soru Çözümleri: 5.000'den fazla çözümlü soru ve güncel TYT formatına uygun deneme sınavları.",
      "Sınav Stratejisi: Zaman yönetimi, soru atlama teknikleri ve sınav psikolojisi konusunda uzman rehberliği.",
      "Anlık Soru Çözümü: 7/24 öğrencilere yönelik canlı destek ve soru-cevap bölümleri aracılığıyla hızlı yanıtlar.",
      "Deneme Sınavları: 20 tüm konuları kapsayan deneme sınavı ile öğrenilen bilgilerin pekiştirilmesi sağlanır.",
    ],
    curriculum: [
      { title: "Başlangıç ve Oryantasyon", lessonCount: 12, duration: "3 saat", items: ["Programa Giriş", "Sınav Sistemi Tanıtımı", "Öğrenme Yöntemleri", "Zaman Planlaması"] },
      { title: "TYT Matematik", lessonCount: 120, duration: "80 saat", items: ["Sayılar ve İşlemler", "Kesirler ve Yüzdeler", "Denklemler", "Geometri Temelleri", "İstatistik ve Olasılık"] },
      { title: "TYT Türkçe", lessonCount: 95, duration: "65 saat", items: ["Ses Bilgisi", "Yazım Kuralları", "Sözcük Türleri", "Cümle Yapısı", "Paragraf ve Metin Türleri"] },
      { title: "TYT Fen Bilimleri", lessonCount: 110, duration: "75 saat", items: ["Fizik: Kuvvet ve Hareket", "Kimya: Atomun Yapısı", "Biyoloji: Hücre", "Fen Soru Çözümleri"] },
      { title: "TYT Sosyal Bilimler", lessonCount: 83, duration: "55 saat", items: ["Tarih: Osmanlı'dan Cumhuriyet'e", "Coğrafya: Türkiye", "Felsefe Grubu", "Sosyal Bilimler Soru Çözümleri"] },
      { title: "Deneme Sınavları & Analiz", lessonCount: 20, duration: "10 saat", items: ["Tam TYT Denemeleri", "Hata Analizi", "Son Tekrar Stratejisi"] },
    ],
    faqs: [
      { q: "Yapay Zeka Destekli Eğitim Sistemi Nasıl Çalışıyor?", a: "AI sistemimiz her öğrencinin güçlü ve zayıf yönlerini analiz ederek kişiselleştirilmiş öğrenme yolu oluşturur. Hangi konulara daha fazla çalışmanız gerektiğini otomatik olarak belirler." },
      { q: "Öğretmenlerimizin deneyimi ve konuları nedir?", a: "Tüm eğitmenlerimiz alanlarında en az 5 yıl deneyimlidir ve TYT/AYT sınavına hazırlık konusunda uzmanlaşmıştır. Her eğitmenin profili ve referansları platforma yüklüdür." },
      { q: "Canlı dersler nasıl işliyor?", a: "Haftalık programlarla belirlenen canlı derslere katılabilir, aynı zamanda kayıtlarına daha sonra erişebilirsiniz. Canlı derslerde eğitmenle anlık soru-cevap yapabilirsiniz." },
      { q: "Deneme ve soru sayısı nasıl başlıyor?", a: "Programa kaydolduğunuzda 5.000+ soru havuzuna ve 20 tam deneme sınavına erişim sağlarsınız. Yeni içerikler düzenli olarak eklenmektedir." },
      { q: "Eğitim programına nasıl katılabilirim?", a: "Sayfanın üstündeki 'Satın Al' butonuna tıklayarak kredi kartı veya havale/EFT yöntemiyle ödeme yapabilirsiniz. Ödeme onaylandıktan sonra tüm içeriklere anında erişim sağlarsınız." },
    ],
    reviews: [
      { name: "Mehmet Ö.", score: 5, role: "Öğrenci", text: "Konu anlatımları çok başarılı ve anlaşılır. Eğitmenler her soruya cevap veriyor. Sınav öncesi güvenimi yerine getirdi.", date: "2 gün önce" },
      { name: "Sena Ö.", score: 5, role: "Öğrenci", text: "Canlı Destek Platformu olarak mükemmel! Anlık sorularıma hızla yanıt verildi. Çok memnunum.", date: "1 hafta önce" },
      { name: "Zehra T.", score: 5, role: "Öğrenci", text: "Birçok platform denedim ama bu program en kapsamlısı. Video kalitesi ve ders anlatımı çok iyi.", date: "2 hafta önce" },
    ],
  },
};

const defaultFallback = fallbackPrograms["tyt-tum-dersler"];

function Stars({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sz = size === "md" ? "w-5 h-5" : "w-4 h-4";
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(s => (
        <svg key={s} className={`${sz} ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-200"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

function formatPrice(p: number) {
  return (p / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 });
}

export default function ProgramDetailPage() {
  const params = useParams();
  const slug = params.slug as string;

  const [prog, setProg] = useState<EducationProgram | null>(null);
  const [loading, setLoading] = useState(true);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openSection, setOpenSection] = useState<number | null>(0);
  const [videoPlaying, setVideoPlaying] = useState(false);

  // Fetch Program
  useEffect(() => {
    const fetchDetail = async () => {
      try {
        setLoading(true);
        const data = await educationProgramsApi.getBySlug(slug);
        setProg(data);
      } catch (error) {
        console.warn("Program API ile bulunamadı, fallback mock veri yükleniyor...");
        const matchedFallback = fallbackPrograms[slug] || {
          ...defaultFallback,
          slug,
          title: slug.split("-").map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(" ") + " Eğitim Programı",
        };
        setProg(matchedFallback as any);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchDetail();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex items-center justify-center min-h-[400px]">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        </div>
        <Footer />
      </div>
    );
  }

  if (!prog) {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center p-6">
          <p className="text-xl font-bold text-gray-800">Program Bulunamadı</p>
          <Link href="/egitim-programlari" className="mt-4 px-6 py-2.5 bg-teal-600 text-white rounded-xl text-sm font-semibold shadow-md">
            Programlara Geri Dön
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      <Header />

      {/* Breadcrumb */}
      <div className="bg-gray-50 border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-teal-600 transition-colors">Ana Sayfa</Link>
          <span>/</span>
          <Link href="/egitim-programlari" className="hover:text-teal-600 transition-colors">Eğitim Programları</Link>
          <span>/</span>
          <span className="text-gray-900 font-medium truncate">{prog.title}</span>
        </div>
      </div>

      <main className="flex-1 bg-slate-50/30 pb-16">
        {/* Hero Section: 2 Columns */}
        <section className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Video Player & Green Banner */}
            <div className="lg:col-span-2 space-y-6">
              {/* Video Player */}
              <div 
                className="rounded-3xl overflow-hidden shadow-xl bg-gray-900 aspect-video relative group cursor-pointer border border-gray-200/50" 
                onClick={() => setVideoPlaying(!videoPlaying)}
              >
                <div className={`w-full h-full bg-gradient-to-br ${prog.gradient || "from-emerald-600 via-teal-600 to-green-700"} flex items-center justify-center`}>
                  <div className="text-center">
                    <div className={`w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-white/30 transition-all ${videoPlaying ? "opacity-0" : "opacity-100"}`}>
                      <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                    <p className="text-white/70 text-sm font-semibold">{videoPlaying ? "▶ Oynatılıyor..." : "Birebir Tanıtım Dersi Alın / Kaydı İzleyin"}</p>
                  </div>
                  {/* Program badge overlay */}
                  <div className="absolute top-4 left-4 bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow">
                    ÖN İZLEME
                  </div>
                </div>
              </div>

              {/* Green Image Banner */}
              <div className="w-full aspect-[21/9] bg-gradient-to-br from-emerald-600 via-teal-600 to-green-600 rounded-3xl flex items-center justify-center shadow-lg border border-teal-500/20 p-8 select-none">
                <div className="text-center">
                  <h2 className="text-white text-3xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase mb-2 drop-shadow-md">
                    {prog.slug === "tyt-biyoloji" ? "TYT BİYOLOJİ EĞİTİM PROGRAMI" : prog.title.toUpperCase()}
                  </h2>
                </div>
              </div>
            </div>

            {/* Right: Title Card & Program Bilgileri Card */}
            <div className="lg:col-span-1 space-y-6">
              {/* Title Card */}
              <div className="bg-white rounded-3xl border border-gray-150 shadow-md p-6 space-y-3 hover:shadow-lg transition-all duration-300">
                <h1 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">
                  {prog.title}
                </h1>
                <div className="inline-block px-3 py-1 bg-slate-100 text-gray-600 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                  {prog.subtitle || "okuldaveevde"}
                </div>
                <p className="text-xs text-gray-500 leading-relaxed font-semibold">
                  {prog.short_description || "Derslerimizin tüm verimiyle başlamasıyla hazırlanan LGS ve YKS programları; canlı ders, deneme ve rehberlik desteğiyle tek platformda kolaylaşıyor."}
                </p>
              </div>

              {/* Program Bilgileri Card */}
              <div className="bg-white rounded-3xl shadow-xl border border-gray-150 overflow-hidden hover:shadow-2xl transition-all duration-300">
                <div className="p-6 space-y-5">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <h3 className="font-extrabold text-gray-800 text-xs tracking-wide uppercase">Program Bilgileri</h3>
                    <span className="bg-rose-50 text-rose-600 text-[10px] font-bold px-2.5 py-1 rounded-lg border border-rose-100">
                      Başarı Oranı %96
                    </span>
                  </div>

                  {/* Price */}
                  <div className="text-center bg-slate-50/30 py-3 rounded-2xl border border-gray-100">
                    <p className="text-3xl font-black text-rose-500">{formatPrice(prog.price)} TL</p>
                    {prog.original_price && (
                      <p className="text-gray-400 line-through text-xs font-semibold">{formatPrice(prog.original_price)} TL</p>
                    )}
                    <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-wider">+ KDV</p>
                  </div>

                  {/* Table details */}
                  <div className="space-y-3.5 text-xs font-semibold text-gray-700 bg-slate-50/50 p-4 rounded-2xl border border-gray-100/80">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-bold">Kontenjan:</span>
                      <span className="text-gray-900 font-black">{prog.kontenjan || 20}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-bold">Tarih:</span>
                      <span className="text-gray-900 font-black">{prog.start_date || "05.01.2026 20:00"}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400 font-bold">Düzey:</span>
                      <span className="text-gray-900 font-black">{prog.category || "TYT"}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-3 pt-2">
                    <Link
                      href={`/checkout?program=${prog.slug}`}
                      className="w-full flex items-center justify-center gap-2 py-3.5 bg-rose-500 text-white font-bold rounded-2xl hover:bg-rose-600 transition-all text-sm cursor-pointer shadow-md hover:shadow-lg"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                      Satın Al
                    </Link>

                    <Link
                      href="/egitim-programlari"
                      className="w-full flex items-center justify-center gap-2 py-2.5 border-2 border-slate-200 text-slate-700 font-bold rounded-2xl hover:border-teal-300 hover:text-teal-700 transition-all text-xs cursor-pointer"
                    >
                      Tüm Programlar
                    </Link>
                  </div>

                  <p className="text-[10px] text-gray-400 text-center font-semibold">
                    Satın alma işleminden sonra sistem görevlendirmeniz yapılır.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Full Width Dynamic Sections */}
        <section className="max-w-7xl mx-auto px-4 space-y-8">
          {/* 1. Açıklama Card */}
          <div className="bg-white rounded-3xl border border-gray-150 shadow-md p-6 sm:p-8">
            <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-4">Açıklama</h2>
            <p className="text-gray-600 leading-relaxed font-semibold text-xs sm:text-sm whitespace-pre-wrap">{prog.description}</p>
          </div>

          {/* 2. Bu eğitimde neler öğreneceksiniz? */}
          {prog.what_you_learn && prog.what_you_learn.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-150 shadow-md p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-5">Bu eğitimde neler öğreneceksiniz?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prog.what_you_learn.map((item: string, i: number) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 bg-teal-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm">
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3.5} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-semibold">{item}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Eğitim içeriği */}
          {prog.curriculum && prog.curriculum.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-150 shadow-md p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-5">Eğitim içeriği</h2>
              
              {/* Premium Welcome Box */}
              {prog.curriculum_intro && (
                <div className="bg-slate-50 border border-gray-150 rounded-2xl p-5 mb-6 text-xs sm:text-sm text-gray-700 leading-relaxed font-semibold">
                  <h4 className="font-extrabold text-gray-900 mb-2">Bu Eğitim Programında sizi neler bekliyor?</h4>
                  <p>{prog.curriculum_intro}</p>
                </div>
              )}

              {/* Accordion Modules */}
              <div className="space-y-3.5">
                {prog.curriculum.map((section: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white hover:border-gray-300 transition-colors">
                    <button
                      onClick={() => setOpenSection(openSection === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 bg-gray-50 hover:bg-gray-100 transition-colors text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <svg className={`w-4 h-4 text-gray-500 transition-transform ${openSection === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                        <span className="font-black text-gray-900 text-xs sm:text-sm">{section.title}</span>
                      </div>
                      <span className="text-[10px] text-gray-400 font-bold flex-shrink-0">{section.lessonCount || section.items?.length || 0} ders · {section.duration}</span>
                    </button>
                    {openSection === i && section.items && (
                      <div className="px-5 py-3 bg-white">
                        <ul className="space-y-2">
                          {section.items.map((item: any, j: number) => {
                            const title = typeof item === "string" ? item : (item?.title || "");
                            const lessonType = typeof item === "string" ? "video" : (item?.lesson_type || "video");
                            const contentUrl = typeof item === "string" ? "" : (item?.content_url || "");
                            return (
                              <li key={j} className="flex items-center justify-between gap-3 text-xs sm:text-sm text-gray-600 py-3 border-b border-gray-50 last:border-0 font-semibold group hover:bg-gray-50/30 px-2 rounded-lg transition-colors">
                                <div className="flex items-center gap-3">
                                  {lessonType === "live_class" && (
                                    <div className="relative flex items-center justify-center flex-shrink-0">
                                      <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-red-400 opacity-75"></span>
                                      <svg className="w-4 h-4 text-red-500 relative flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15.536a5 5 0 000-7.072m-2.828 9.9a9 0 000-12.728M12 14a2 2 0 100-4 2 2 0 000 4z" />
                                      </svg>
                                    </div>
                                  )}
                                  {lessonType === "pdf" && (
                                    <svg className="w-4 h-4 text-emerald-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                                    </svg>
                                  )}
                                  {lessonType === "text" && (
                                    <svg className="w-4 h-4 text-indigo-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                    </svg>
                                  )}
                                  {lessonType === "video" && (
                                    <svg className="w-4 h-4 text-blue-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                  )}
                                  <span className="text-gray-700 group-hover:text-teal-600 transition-colors font-semibold">{title}</span>
                                </div>
                                <div className="flex-shrink-0">
                                  {contentUrl ? (
                                    <a
                                      href={contentUrl}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className={`px-2.5 py-1 rounded text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${
                                        lessonType === "live_class" ? "bg-red-500 hover:bg-red-600 text-white" :
                                        lessonType === "pdf" ? "bg-emerald-600 hover:bg-emerald-700 text-white" :
                                        lessonType === "text" ? "bg-indigo-600 hover:bg-indigo-700 text-white" :
                                        "bg-blue-600 hover:bg-blue-700 text-white"
                                      }`}
                                    >
                                      {lessonType === "live_class" && (
                                        <>
                                          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                          Canlı Derse Katıl
                                        </>
                                      )}
                                      {lessonType === "pdf" && "📄 PDF Dokümanını Aç"}
                                      {lessonType === "text" && "✍️ Yazıyı Oku"}
                                      {lessonType === "video" && "🎥 Videoyu İzle"}
                                    </a>
                                  ) : (
                                    <>
                                      {lessonType === "live_class" && (
                                        <span className="bg-red-50 text-red-700 border border-red-100 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase flex items-center gap-1 shadow-sm">
                                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                                          Canlı Ders
                                        </span>
                                      )}
                                      {lessonType === "pdf" && (
                                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shadow-sm">
                                          PDF Dosyası
                                        </span>
                                      )}
                                      {lessonType === "text" && (
                                        <span className="bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shadow-sm">
                                          Yazılı Ders
                                        </span>
                                      )}
                                      {lessonType === "video" && (
                                        <span className="bg-blue-50 text-blue-700 border border-blue-100 px-2 py-0.5 rounded text-[10px] font-bold tracking-wide uppercase shadow-sm">
                                          Video Ders
                                        </span>
                                      )}
                                    </>
                                  )}
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Sıkça Sorulan Sorular */}
          {prog.faqs && prog.faqs.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-150 shadow-md p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-5 flex items-center gap-2">
                Sıkça Sorulan Sorular
              </h2>
              <div className="space-y-3.5">
                {prog.faqs.map((faq: any, i: number) => (
                  <div key={i} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm bg-white hover:border-gray-300 transition-colors">
                    <button
                      onClick={() => setOpenFaq(openFaq === i ? null : i)}
                      className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors cursor-pointer"
                    >
                      <span className="font-extrabold text-gray-900 text-xs sm:text-sm pr-4">{faq.q}</span>
                      <svg className={`w-5 h-5 text-teal-500 flex-shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    {openFaq === i && (
                      <div className="px-5 pb-4 text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold bg-slate-50/50 border-t border-gray-100 pt-3.5">
                        {faq.a}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Öğrenci Yorumları */}
          {prog.reviews && prog.reviews.length > 0 && (
            <div className="bg-white rounded-3xl border border-gray-150 shadow-md p-6 sm:p-8">
              <h2 className="text-lg font-black text-gray-900 border-b border-gray-100 pb-3 mb-6">Öğrenci Yorumları</h2>
              <div className="flex items-center gap-4 mb-6">
                <div className="text-center flex-shrink-0 bg-slate-50 p-4 rounded-2xl border border-gray-100 shadow-inner">
                  <p className="text-4xl font-black text-gray-900">{prog.rating}</p>
                  <Stars rating={prog.rating} size="sm" />
                  <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider mt-1">Eğitim Puanı</p>
                </div>
                <div className="flex-1 hidden sm:block">
                  {[5, 4, 3, 2, 1].map(star => (
                    <div key={star} className="flex items-center gap-2 mb-1">
                      <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                        <div className="bg-yellow-400 rounded-full h-1.5" style={{ width: star === 5 ? "85%" : star === 4 ? "12%" : "3%" }} />
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0 w-8">
                        <span className="text-xs text-gray-400 font-bold">{star}</span>
                        <svg className="w-3.5 h-3.5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {prog.reviews.map((rev: any, i: number) => (
                  <div key={i} className="bg-slate-50/50 border border-gray-200/50 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start gap-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-sm flex-shrink-0 shadow shadow-teal-500/20">
                        {rev.name[0]}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-gray-900 text-sm leading-none mb-1">{rev.name}</p>
                        <div className="flex items-center gap-2">
                          <Stars rating={rev.score} />
                          <span className="text-[10px] text-gray-400 font-bold">{rev.role} · {rev.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-600 leading-relaxed font-semibold">{rev.text}</p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
