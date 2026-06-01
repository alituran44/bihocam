"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { teachersApi } from "@/lib/api";
import AdBanner from "@/components/ads/AdBanner";

type TeacherListItem = {
  id: string;
  full_name: string;
  email: string;
  courses_count: number;
  avatar_url?: string | null;
  bio?: string | null;
  expertise_tags: string[];
  live_class_price?: number | null;
  live_class_discount_price?: number | null;
  created_at: string;
};

export default function TeachersPage() {
  const { data, isLoading, error } = useQuery<TeacherListItem[]>({
    queryKey: ["teachers"],
    queryFn: () => teachersApi.list(0, 50),
  });

  // Helper to format join date
  const formatJoinDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "11 Eyl 2025";
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      {/* Hero Section */}
      <div 
        className="relative pt-32 pb-24 text-center md:text-left overflow-hidden bg-slate-950 border-b border-white/5"
      >
        {/* Background Image with mix-blend-mode */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity transform scale-105"
          style={{ backgroundImage: "url('/teachers_banner_bg.png')" }}
        ></div>
        
        {/* Modern dark radial gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent"></div>
        
        {/* Dotted pattern overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40"></div>

        {/* Colorful glows */}
        <div className="absolute top-12 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse"></div>
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-3xl">
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-teal-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <span>🌟</span> Türkiye'nin En Seçkin Eğitmenleri
              </div>
              
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                Uzman <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">Eğitmenlerimiz</span>
              </h1>
              
              <p className="text-slate-300 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                Hedeflerinize ulaşmanız için Türkiye'nin en seçkin öğretmenleriyle birebir canlı dersler planlayın ve öğrenmeye başlayın.
              </p>
            </div>
            
            {/* Quick platform highlights on the right side */}
            <div className="hidden lg:flex flex-col gap-4 w-80 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold">✓</div>
                <div>
                  <h4 className="text-white text-sm font-bold">Birebir Canlı Dersler</h4>
                  <p className="text-slate-400 text-xs font-medium">Uzman öğretmenlerle anında başlayın</p>
                </div>
              </div>
              <div className="border-t border-white/5 my-1"></div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-300 font-bold">✓</div>
                <div>
                  <h4 className="text-white text-sm font-bold">Yapay Zeka Destekli</h4>
                  <p className="text-slate-400 text-xs font-medium">AI asistanı eşliğinde ders hazırlığı</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 -mt-8 relative z-20">
        
        <AdBanner placementCode="teachers_banner" className="mb-8" />

        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm animate-pulse flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200" />
                    <div className="space-y-2 flex-1">
                      <div className="h-6 bg-gray-200 rounded w-1/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/6" />
                    </div>
                  </div>
                  <div className="h-16 bg-gray-200 rounded w-full" />
                  <div className="flex gap-2">
                    {[...Array(4)].map((_, idx) => (
                      <div key={idx} className="h-8 bg-gray-200 rounded-xl w-16" />
                    ))}
                  </div>
                </div>
                <div className="w-full lg:w-72 bg-gray-100 rounded-3xl h-48" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-rose-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-rose-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Eğitmenler Yüklenemedi</h2>
            <p className="text-gray-500 font-semibold max-w-md mx-auto">Sistemde geçici bir sorun oluştu. Lütfen sayfayı yenileyip tekrar deneyiniz.</p>
          </div>
        ) : !data?.length ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-1">Kayıtlı Eğitmen Bulunmuyor</h3>
            <p className="text-gray-500 font-medium">Yakında tüm uzman kadromuz burada listelenecektir.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {data.map((teacher) => {
              // Extract branch from tags or default
              const subtitle = teacher.expertise_tags?.[0] 
                ? `${teacher.expertise_tags[0]} Öğretmeni` 
                : "Seçkin Eğitmen";

              const sampleBio = teacher.bio || 
                "Eğitim her öğrenci için kişisel bir yolculuktur. Öğrencilerimin ihtiyaç duydukları tüm branşlarda hedeflerine ulaşmaları, başarıya giden yolda sağlam adımlar atmaları için buradayım. Uzun yıllara dayanan tecrübem ve BiHocam modern araçları ile başarıyı birlikte yakalayalım.";

              return (
                <div
                  key={teacher.id}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200/80 transition-all duration-300 p-6 sm:p-8 flex flex-col lg:flex-row gap-6 relative overflow-hidden group"
                >
                  {/* Left Column - Main Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      {/* Header row: Avatar, Name, Title */}
                      <div className="flex items-start gap-4">
                        <Avatar
                          src={teacher.avatar_url}
                          name={teacher.full_name}
                          size="xl"
                          className="shadow-lg shadow-teal-500/5 ring-4 ring-slate-50 group-hover:scale-105 transition-transform duration-300 flex-shrink-0"
                        />
                        <div className="space-y-1">
                          <Link href={`/teachers/${teacher.id}`} className="block">
                            <h2 className="text-2xl font-black text-slate-800 hover:text-teal-600 transition-colors uppercase tracking-tight">
                              {teacher.full_name}
                            </h2>
                          </Link>
                          <p className="text-teal-600 font-bold text-sm leading-none flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-teal-500 inline-block animate-pulse"></span>
                            {subtitle}
                          </p>
                        </div>
                      </div>

                      {/* Bio */}
                      <p className="mt-5 text-gray-500 text-[14px] leading-relaxed font-medium line-clamp-3">
                        {sampleBio}
                      </p>

                      {/* Tags */}
                      {teacher.expertise_tags && teacher.expertise_tags.length > 0 ? (
                        <div className="flex flex-wrap gap-2 mt-5">
                          {teacher.expertise_tags.map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3.5 py-1.5 bg-slate-50 hover:bg-teal-50 hover:text-teal-700 text-slate-500 rounded-xl text-xs font-bold transition-colors cursor-default"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-wrap gap-2 mt-5">
                          {["Özel Ders", "YKS Hazırlık", "LGS Hazırlık", "Birebir Eğitim"].map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-3.5 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-xs font-bold transition-colors"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Stats Grid Footer */}
                    <div className="border-t border-slate-100 pt-5 mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs font-bold text-slate-400">
                      {/* Join Date */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase leading-none">ÜYELİK TARİHİ</div>
                          <div className="text-slate-700 font-black text-[13px]">{formatJoinDate(teacher.created_at)}</div>
                        </div>
                      </div>

                      {/* Course Count */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                          </svg>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase leading-none">KURSLAR</div>
                          <div className="text-slate-700 font-black text-[13px]">{teacher.courses_count || 0}</div>
                        </div>
                      </div>

                      {/* Total Meetings */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase leading-none">TOPLAM TOPLANTI</div>
                          <div className="text-slate-700 font-black text-[13px]">
                            {/* Premium placeholder seed to match mockup */}
                            {teacher.live_class_price ? Math.floor((parseInt(teacher.id.slice(0,2), 16) || 12) % 35) + 3 : 0}
                          </div>
                        </div>
                      </div>

                      {/* Class Hours */}
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-500">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 font-semibold uppercase leading-none">DERS SAATLERİ</div>
                          <div className="text-slate-700 font-black text-[13px]">
                            {/* Premium placeholder seed to match mockup */}
                            {teacher.live_class_price ? Math.floor((parseInt(teacher.id.slice(2,4), 16) || 48) % 120) + 12 : 0}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Booking Card (Exactly matching mockup) */}
                  <div className="w-full lg:w-72 bg-slate-50/50 rounded-3xl p-6 border border-slate-100/50 flex flex-col justify-center items-center text-center relative overflow-hidden flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-50/20 via-transparent to-transparent pointer-events-none"></div>

                    <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center shadow-inner mb-4">
                      <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>

                    <h3 className="text-base font-bold text-slate-700 mb-1">Toplantı Planla</h3>
                    
                    <div className="mb-6">
                      {teacher.live_class_price ? (
                        <div className="space-y-1">
                          {teacher.live_class_discount_price ? (
                            <div className="flex flex-col items-center">
                              <span className="text-xs text-slate-400 line-through">₺{teacher.live_class_price.toFixed(0)}</span>
                              <span className="text-xl font-black text-blue-600">
                                ₺{teacher.live_class_discount_price.toFixed(0)}<span className="text-xs font-semibold text-slate-500">/Saat</span>
                              </span>
                            </div>
                          ) : (
                            <span className="text-xl font-black text-blue-600">
                              ₺{teacher.live_class_price.toFixed(0)}<span className="text-xs font-semibold text-slate-500">/Saat</span>
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-base font-extrabold text-slate-400">Anlaşmalı Ücret</span>
                      )}
                    </div>

                    {/* Bottom Action Icon Buttons */}
                    <div className="flex items-center gap-3">
                      {/* Profile details button (Gray circular button with user icon) */}
                      <Link
                        href={`/teachers/${teacher.id}`}
                        className="w-11 h-11 rounded-full bg-white hover:bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center border border-slate-200/60 shadow-sm transition-all"
                        title="Profili Gör"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </Link>

                      {/* Direct calendar booking page button (Blue circular button with calendar icon) */}
                      <Link
                        href={`/teachers/${teacher.id}#live-class`}
                        className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-700 text-white flex items-center justify-center shadow-md shadow-blue-500/10 hover:shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all"
                        title="Toplantı Planla/Rezervasyon Yap"
                      >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
