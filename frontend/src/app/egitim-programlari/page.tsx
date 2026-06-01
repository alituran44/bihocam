"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/ads/AdBanner";
import { educationProgramsApi, EducationProgram } from "@/lib/api";

// ─── Demo Data Fallback ────────────────────────────────────────────────────────
const demoPrograms: any[] = [
  { id: "1", slug: "tyt-tum-dersler", title: "TYT Tüm Dersler Eğitim Programı", price: 6499500, original_price: 8999500, rating: 4.9, review_count: 1389, students: 12450, category: "TYT", gradient: "from-gray-900 via-gray-800 to-gray-700", hours: 280, lessons: 420, active: true },
  { id: "2", slug: "yks-tyt-ayt-tum-dersler", title: "YKS TYT+AYT Tüm Dersler Eğitim Programı", price: 7999500, original_price: 10999500, rating: 4.9, review_count: 1389, students: 9870, category: "YKS", gradient: "from-purple-900 via-purple-800 to-indigo-800", badge: "En Çok Satan", hours: 450, lessons: 680, active: true },
  { id: "3", slug: "ayt-tum-dersler", title: "AYT Tüm Dersler Eğitim Programı", price: 5999500, original_price: 8499500, rating: 4.8, review_count: 1389, students: 8320, category: "AYT", gradient: "from-blue-900 via-blue-800 to-cyan-800", hours: 360, lessons: 540, active: true },
  { id: "4", slug: "tyt-ayt-esit-agirlik", title: "TYT+AYT Eşit Ağırlık Eğitim Programı", price: 6999500, original_price: 9499500, rating: 4.8, review_count: 1389, students: 6740, category: "AYT", gradient: "from-green-900 via-green-800 to-emerald-800", hours: 390, lessons: 580, active: true },
  { id: "5", slug: "lgs-tum-dersler", title: "LGS Tüm Dersler Eğitim Programı", price: 7599500, original_price: 9999500, rating: 4.9, review_count: 1389, students: 11200, category: "LGS", gradient: "from-orange-700 via-orange-600 to-amber-600", badge: "Yeni", hours: 320, lessons: 480, active: true },
  { id: "6", slug: "tyt-ayt-saysal", title: "TYT+AYT Sayısal Eğitim Programı", price: 6999500, original_price: 9499500, rating: 4.8, review_count: 1389, students: 7560, category: "AYT", gradient: "from-teal-900 via-teal-800 to-cyan-900", hours: 400, lessons: 600, active: true },
];

const categories = ["Tüm Programlar", "TYT", "AYT", "YKS", "LGS", "YDT"];

function formatPrice(p: number) {
  return (p / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 });
}

function Stars({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => (
        <svg key={s} className={`w-3 h-3 ${s <= Math.round(rating) ? "text-yellow-400" : "text-gray-300"}`} fill="currentColor" viewBox="0 0 20 20">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  );
}

export default function EgitimProgramlariPage() {
  const [programs, setPrograms] = useState<EducationProgram[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState("Tüm Programlar");
  const [currentPage, setCurrentPage] = useState(1);
  const PER_PAGE = 9;

  // Fetch from backend, fall back to seed/mock if database has none
  useEffect(() => {
    const loadPrograms = async () => {
      try {
        setLoading(true);
        const data = await educationProgramsApi.list();
        if (data && data.length > 0) {
          setPrograms(data);
        } else {
          setPrograms(demoPrograms as any[]);
        }
      } catch (error) {
        console.error("Programlar yüklenirken hata, mock data yükleniyor:", error);
        setPrograms(demoPrograms as any[]);
      } finally {
        setLoading(false);
      }
    };
    loadPrograms();
  }, []);

  const filtered = activeCategory === "Tüm Programlar"
    ? programs.filter(p => p.active)
    : programs.filter((p) => p.category === activeCategory && p.active);

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((currentPage - 1) * PER_PAGE, currentPage * PER_PAGE);

  const handleCategory = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Header />

      <main className="flex-1">
        {/* Hero Banner */}
        <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 pt-32 pb-24 overflow-hidden border-b border-teal-900/10">
          {/* Background Image Overlay */}
          <div 
            className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 mix-blend-overlay pointer-events-none"
            style={{ backgroundImage: "url('/courses_banner_bg.png')" }}
          />
          {/* Premium Glowing Gradients */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(20,184,166,0.18),transparent_70%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(13,148,136,0.12),transparent_60%)]" />
          
          <div className="relative max-w-7xl mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 rounded-full px-4 py-1.5 mb-6">
              <span className="w-2 h-2 bg-teal-400 rounded-full animate-pulse" />
              <span className="text-teal-300 text-sm font-semibold">BiHocam Başarı Odaklı Hazırlık</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">
              Eğitim Programları
            </h1>
            <p className="text-gray-300 text-lg max-w-2xl mx-auto mb-8 font-medium leading-relaxed">
              Konu anlatımları, soru çözümleri, zengin müfredatlar ve 7/24 AI desteğiyle hedefinize emin adımlarla yürüyün.
            </p>

            {/* Stats */}
            <div className="flex items-center justify-center gap-8 flex-wrap">
              {[
                { val: `${programs.length}+`, label: "Eğitim Paketi" },
                { val: "12K+", label: "Aktif Öğrenci" },
                { val: "4.9★", label: "Ortalama Memnuniyet" },
                { val: "%100", label: "Online & Canlı Ulaşım" },
              ].map((s) => (
                <div key={s.label} className="text-center">
                  <p className="text-2xl font-bold text-teal-400">{s.val}</p>
                  <p className="text-gray-400 text-sm font-semibold">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="bg-gradient-to-r from-teal-600 to-teal-500 py-5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <p className="text-white font-bold text-lg">🚀 Eğitim Yolculuğunuza Hemen Başlayın!</p>
              <p className="text-teal-100 text-sm mt-0.5 flex items-center gap-4 flex-wrap">
                <span className="flex items-center gap-1 font-medium">
                  ✓ Uzman Eğitmenler
                </span>
                <span className="flex items-center gap-1 font-medium">
                  ✓ Ömür Boyu Erişim
                </span>
                <span className="flex items-center gap-1 font-medium">
                  ✓ 30 Gün Para İadesi Garantisi
                </span>
              </p>
            </div>
            <Link href="/register" className="flex-shrink-0 flex items-center gap-2 bg-white text-teal-700 font-bold px-6 py-3 rounded-xl hover:bg-teal-50 transition-all shadow-lg text-sm">
              Hemen Başla
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
            </Link>
          </div>
        </section>

        {/* Category Filter */}
        <section className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center gap-2 overflow-x-auto py-3 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => handleCategory(cat)}
                  className={`flex-shrink-0 px-4 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    activeCategory === cat
                      ? "bg-teal-600 text-white shadow-md shadow-teal-500/20"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Programs Grid */}
        <section className="max-w-7xl mx-auto px-4 py-10">
          {/* Ad Banner placement */}
          <AdBanner placementCode="education_programs_banner" className="mb-8" />

          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-gray-500 font-medium">
              Toplam <span className="font-bold text-gray-900">{filtered.length}</span> program gösteriliyor
            </p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="bg-white rounded-2xl h-80 border border-gray-100 shadow-sm animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginated.map((prog) => (
                <div key={prog.id} className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1.5 group flex flex-col h-full">
                  {/* Thumbnail */}
                  <div className={`relative h-44 bg-gradient-to-br ${prog.gradient || "from-gray-900 to-gray-700"} flex items-center justify-center p-6 flex-shrink-0`}>
                    {prog.badge && (
                      <div className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full shadow">
                        {prog.badge}
                      </div>
                    )}
                    <div className="text-center">
                      <p className="text-white/60 text-xs font-semibold uppercase tracking-widest mb-1">{prog.category}</p>
                      <h3 className="text-white font-black text-xl leading-tight text-center drop-shadow-lg max-w-[240px] mx-auto">
                        {prog.title.replace(" Eğitim Programı", "").replace(" Tüm Dersler", "\nTÜM DERSLER")}
                      </h3>
                      <p className="text-white/70 text-xs mt-2 font-semibold uppercase tracking-wider">EĞİTİM PROGRAMI</p>
                    </div>
                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300" />
                  </div>

                  {/* Content */}
                  <div className="p-5 flex flex-col flex-1">
                    <h3 className="font-bold text-gray-900 text-sm mb-2 line-clamp-2 leading-snug flex-1">{prog.title}</h3>

                    <div className="flex items-center gap-2 mb-3">
                      <Stars rating={prog.rating} />
                      <span className="text-yellow-600 font-bold text-xs">{prog.rating}</span>
                      <span className="text-gray-400 text-xs">({(prog.review_count || 1200).toLocaleString("tr-TR")} yorum)</span>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-gray-500 mb-4 font-semibold">
                      <span className="flex items-center gap-1">
                        ⏱ {prog.hours} saat
                      </span>
                      <span className="flex items-center gap-1">
                        📚 {prog.lessons} ders
                      </span>
                      <span className="flex items-center gap-1">
                        👥 {(prog.students || 1000).toLocaleString("tr-TR")} öğrenci
                      </span>
                    </div>

                    {/* Price */}
                    <div className="flex items-center gap-2 mb-4">
                      <span className="text-xl font-black text-gray-900">{formatPrice(prog.price)} TL</span>
                      {prog.original_price && (
                        <span className="text-sm text-gray-400 line-through">{formatPrice(prog.original_price)} TL</span>
                      )}
                      <span className="text-xs text-gray-400 font-medium">+ KDV</span>
                    </div>

                    <div className="flex gap-2 mt-auto">
                      <Link
                        href={`/egitim-programlari/${prog.slug}`}
                        className="flex-1 text-center py-2.5 border-2 border-gray-200 text-gray-700 text-sm font-semibold rounded-xl hover:border-teal-300 hover:text-teal-700 transition-all cursor-pointer"
                      >
                        İncele
                      </Link>
                      <Link
                        href={`/checkout?program=${prog.slug}`}
                        className="flex-1 text-center py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all cursor-pointer"
                      >
                        Satın Al
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {!loading && totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-12">
              <button
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                disabled={currentPage === 1}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ‹
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-semibold transition-all cursor-pointer ${
                    currentPage === page
                      ? "bg-teal-600 text-white shadow-md"
                      : "border border-gray-200 text-gray-600 hover:bg-gray-100"
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
                className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                ›
              </button>
            </div>
          )}
        </section>
      </main>

      <Footer />
    </div>
  );
}
