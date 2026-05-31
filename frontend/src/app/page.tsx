"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PopupAnnouncement from "@/components/PopupAnnouncement";
import AdBanner from "@/components/ads/AdBanner";
import FeaturedCourses from "@/components/ads/FeaturedCourses";
import { coursesApi, publicApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { usePopupAnnouncement } from "@/hooks/usePopupAnnouncement";

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail_path: string | null;
  price: number;
  discount_price: number | null;
  teacher?: { id: string; full_name: string } | null;
}

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);
  const [estimatedEnd, setEstimatedEnd] = useState<string | null>(null);

  // Public settings for maintenance mode check
  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => publicApi.getPublicSettings(),
    retry: false,
    refetchInterval: 30000,
  });

  useEffect(() => {
    if (publicSettings?.platform) {
      const platform = publicSettings.platform as Record<string, unknown>;
      const isMaintenance = platform.maintenance_mode === true;
      if (isMaintenance) {
        setMaintenanceMode(true);
        setMaintenanceMessage(
          (platform.maintenance_message as string) || "Site bakım modundadır. Lütfen daha sonra tekrar deneyin."
        );
        if (platform.maintenance_estimated_end) {
          setEstimatedEnd(platform.maintenance_estimated_end as string);
        }
      } else {
        setMaintenanceMode(false);
      }
    }
  }, [publicSettings]);

  // Get featured courses
  const { data: featuredCourses } = useQuery<Course[]>({
    queryKey: ["featured-courses-public"],
    queryFn: () => coursesApi.getFeaturedPublic(8),
    enabled: !maintenanceMode || user?.role === "admin",
    staleTime: 5 * 60 * 1000,
  });

  // Fallback: regular courses
  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses", "fallback"],
    queryFn: () => coursesApi.list(0, 8),
    enabled: (!featuredCourses || featuredCourses.length === 0) && (!maintenanceMode || user?.role === "admin"),
    staleTime: 5 * 60 * 1000,
  });

  // Popup announcement
  const { activePopup, dismissPopup } = usePopupAnnouncement();

  if (maintenanceMode && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative w-full max-w-4xl">
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-emerald-100/50 p-8 md:p-16 overflow-hidden">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-cyan-400/20 opacity-50 pointer-events-none"></div>
            <div className="absolute inset-[1px] rounded-[2.5rem] bg-white/80 backdrop-blur-2xl"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-12">
                {publicSettings?.logo_url ? (
                  <div className="relative">
                    <img src={publicSettings.logo_url} alt="Logo" className="h-28 object-contain drop-shadow-lg" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl -z-10"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                      <span className="text-white font-bold text-5xl">B</span>
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-3xl blur-xl animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="mb-12 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                  <div className="relative w-48 h-48 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-200/50">
                    <svg className="w-24 h-24 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-4 border-4 border-transparent border-t-teal-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                </div>
              </div>

              <h1 className="text-6xl md:text-7xl font-black text-center mb-8 tracking-tight">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Bakım Modu</span>
              </h1>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-2xl p-8 mb-8 shadow-lg">
                <p className="text-xl md:text-2xl text-gray-800 leading-relaxed text-center font-medium">
                  {maintenanceMessage || "Site bakım modundadır. Lütfen daha sonra tekrar deneyin."}
                </p>
              </div>

              {estimatedEnd && (
                <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 border-2 border-teal-300/50 rounded-2xl p-8 mb-8 text-center shadow-lg backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-teal-800 uppercase tracking-wider">Tahmini Bitiş</p>
                  </div>
                  <p className="text-2xl font-bold text-teal-900">
                    {new Date(estimatedEnd).toLocaleString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/50">
      {activePopup && (
        <PopupAnnouncement
          popup={activePopup}
          onClose={() => dismissPopup(activePopup.id, false)}
          onDismiss={dismissPopup}
        />
      )}

      <Header />

      {/* Modern Sleek Hero (DersHerYerde Vibe) */}
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-36 bg-gradient-to-b from-teal-500/10 via-white to-transparent overflow-hidden">
        {/* Glow Spheres */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-teal-200/30 rounded-full filter blur-3xl -z-10"></div>
        <div className="absolute top-1/3 right-1/4 w-[25rem] h-[25rem] bg-indigo-200/20 rounded-full filter blur-3xl -z-10"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Column Text */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-100 text-teal-800 text-xs font-bold uppercase tracking-wider animate-bounce">
                🚀 Türkiye'nin En İyi Eğitim Platformu!
              </div>

              <h1 className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-none">
                Geleceğinizi Şekillendirecek{" "}
                <span className="bg-gradient-to-r from-teal-600 via-emerald-600 to-indigo-600 bg-clip-text text-transparent">
                  Eğitmenler
                </span>{" "}
                Burada!
              </h1>

              <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-medium">
                YKS, LGS, Lise, İlkokul ve tüm branşlarda Türkiye'nin en seçkin eğitmen kadrosuyla birebir canlı derslere, interaktif testlere ve yapay zeka asistanı desteğine hemen ulaşın.
              </p>

              <div className="flex flex-wrap justify-center lg:justify-start gap-4">
                <Link
                  href="/register"
                  className="px-8 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-2xl hover:shadow-xl hover:shadow-teal-500/20 transform hover:-translate-y-0.5 transition-all text-base"
                >
                  Ücretsiz Başla →
                </Link>
                <Link
                  href="/become-instructor"
                  className="px-8 py-4 bg-white text-gray-800 font-bold rounded-2xl border-2 border-gray-200 hover:border-teal-500 hover:text-teal-600 transform hover:-translate-y-0.5 transition-all text-base shadow-sm"
                >
                  Eğitmen Olmak İstiyorum
                </Link>
              </div>

              {/* Mini Stats Banner */}
              <div className="pt-8 grid grid-cols-2 sm:grid-cols-4 gap-6 border-t border-gray-200/60 max-w-lg mx-auto lg:mx-0">
                {[
                  { value: "15K+", label: "Aktif Öğrenci" },
                  { value: "500+", label: "Premium Ders" },
                  { value: "100+", label: "Seçkin Eğitmen" },
                  { value: "4.9", label: "Ort. Puan" },
                ].map((stat) => (
                  <div key={stat.label} className="text-center lg:text-left">
                    <div className="text-2xl font-black text-gray-900 tracking-tight">{stat.value}</div>
                    <div className="text-xs font-semibold text-gray-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Column Image */}
            <div className="lg:col-span-5 flex justify-center relative">
              {/* Animated Floating Frame */}
              <div className="relative w-full max-w-md transform hover:rotate-2 transition-transform duration-500">
                <div className="absolute -inset-4 bg-gradient-to-tr from-teal-400 to-indigo-500 rounded-[2.5rem] blur-2xl opacity-30 -z-10 animate-pulse"></div>
                <img
                  src="/teacher_matching.png"
                  alt="BiHocam Eğitim Asistanı"
                  className="w-full object-contain rounded-[2rem] drop-shadow-2xl bg-white border border-gray-100 p-4"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefit Cards Section (From screenshot) */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Kariyerinizi ve Eğitiminizi Zirveye Taşıyın</h2>
            <p className="text-gray-500 font-semibold text-sm">BiHocam'ın sunduğu ayrıcalıklı eğitmenlik ve öğrenme araçları ile dersleriniz çok daha verimli.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1 - Pink */}
            <div className="relative overflow-hidden bg-gradient-to-br from-pink-500 via-pink-600 to-rose-600 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
              <div className="space-y-4">
                <h3 className="text-2xl font-black leading-tight">Senin en iyi öğrencileri bulmanı sağlıyoruz.</h3>
                <p className="text-pink-50 text-sm font-medium leading-relaxed">
                  Böylece en iyi yaptığınız işi ders öğretmenliği yapabilirsiniz. istediğiniz zaman, istediğiniz yerde ders verebilirsiniz. Özgeçmişinizi güçlendirerek mesleki deneyim kazanabilirsiniz.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <img
                  src="/teacher_matching.png"
                  alt="Student Matching"
                  className="h-40 object-contain drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Card 2 - Green */}
            <div className="relative overflow-hidden bg-gradient-to-br from-emerald-500 via-teal-600 to-teal-700 rounded-[2rem] p-8 text-white shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
              <div className="space-y-4">
                <h3 className="text-2xl font-black leading-tight">Yoğun İşlerle Biz İlgileneceğiz</h3>
                <p className="text-emerald-50 text-sm font-medium leading-relaxed">
                  Yapay zeka destekleri araçlarımız ile ders hazırlığı ve tekrarında size destek olurken siz öğrencileriniz ile daha yakından ilgilenebilirsiniz.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <img
                  src="/ai_helper.png"
                  alt="AI helpers"
                  className="h-40 object-contain drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>

            {/* Card 3 - Yellow */}
            <div className="relative overflow-hidden bg-gradient-to-br from-amber-400 via-orange-500 to-amber-500 rounded-[2rem] p-8 text-gray-900 shadow-xl flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
              <div className="space-y-4">
                <h3 className="text-2xl font-black leading-tight">Mükemmel Yarı zamanlı iş ve kariyer başlangıcı</h3>
                <p className="text-orange-950 text-sm font-medium leading-relaxed">
                  Öğretmenlerimizin çoğunluğu halihazırda yarı zamanlı bir işte çalışıyor. Bu da ders vermeyi yan iş olarak harika bir seçenek haline getiriyor.
                </p>
              </div>
              <div className="mt-8 flex justify-center">
                <img
                  src="/parttime_career.png"
                  alt="Part-time Career"
                  className="h-40 object-contain drop-shadow-2xl rounded-2xl group-hover:scale-105 transition-transform duration-300"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ads placements Banners */}
      <section className="py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBanner placementCode="homepage_banner" />
        </div>
      </section>

      {/* "Seni Neler Bekliyor?" Section */}
      <section className="py-20 bg-white relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-teal-500/5 rounded-full filter blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Seni Neler Bekliyor?</h2>
            <p className="text-gray-600 font-semibold text-base">
              bihocam.com ayrıcalıklarıyla çevrimiçi öğrenme deneyimine hazır mısın?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 - Kişiselleştirilmiş Öğretim Planı */}
            <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm hover:shadow-xl hover:border-teal-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a3 3 0 106 0a3 3 0 00-6 0z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Kişiselleştirilmiş Öğretim Planı</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Öğrencilerimizin ihtiyaç duydukları derslere başlamadan önce uzmanlarımız tarafından hazırlanan ön testlerin sonuçlarına göre hangi konuda neler bildiğine dair bir değerlendirme süreci gerçekleştirilir.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/courses" className="text-rose-500 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <span className="text-lg">→</span>
                </Link>
              </div>
            </div>

            {/* Card 2 - Birebir veya Grup Dersleri */}
            <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm hover:shadow-xl hover:border-teal-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Birebir veya Grup Dersleri</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Birebir veya grup dersleri, öğrencilerin öğrenme hızlarına, öğrenme stillerine ve ihtiyaçlarına uygun özelleştirilmiş bir öğrenme deneyimi sunar.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/courses" className="text-rose-500 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <span className="text-lg">→</span>
                </Link>
              </div>
            </div>

            {/* Card 3 - Her Derse Özel Kaynaklar */}
            <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm hover:shadow-xl hover:border-teal-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Her Derse Özel Kaynaklar</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Dijital kaynaklar, öğrencilerin internet erişimi olan herhangi bir yerden ders materyallerine erişmelerine ve öğrenmelerine yardımcı olur.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/courses" className="text-rose-500 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <span className="text-lg">→</span>
                </Link>
              </div>
            </div>

            {/* Card 4 - Ders Sonu Öğrenme Raporları */}
            <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm hover:shadow-xl hover:border-teal-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Ders Sonu Öğrenme Raporları</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Ders raporları ve ölçme değerlendirme, öğrencilerin öğrenme sürecini değerlendirmek için önemli bir araçtır.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/courses" className="text-rose-500 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Branşlara Göre Keşfedin</h2>
              <p className="text-gray-500 font-semibold text-sm">Hangi alanda yardıma ihtiyacınız varsa uzman eğitmenimiz hazır.</p>
            </div>
            <Link
              href="/courses"
              className="text-teal-600 hover:text-teal-700 font-bold text-sm inline-flex items-center gap-1 group"
            >
              Tümünü Gör <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: "🎯", name: "YKS", color: "from-orange-400 to-red-500", desc: "Üniversite Hazırlık" },
              { icon: "📖", name: "LGS", color: "from-teal-400 to-cyan-500", desc: "Lise Hazırlık" },
              { icon: "🔢", name: "Matematik", color: "from-blue-400 to-indigo-500", desc: "Analiz & Geometri" },
              { icon: "⚛️", name: "Fizik", color: "from-purple-400 to-pink-500", desc: "Mekanik & Optik" },
              { icon: "🧪", name: "Kimya", color: "from-emerald-400 to-green-500", desc: "Organik & Temel" },
              { icon: "🧬", name: "Biyoloji", color: "from-yellow-400 to-orange-500", desc: "Genetik & Canlı" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/courses?category=${cat.name.toLowerCase()}`}
                className="group relative p-6 bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cat.color}`}></div>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
                  <p className="text-xs font-semibold text-gray-400">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses placements */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedCourses limit={6} showTitle={true} />
        </div>
      </section>

      {/* Popular Courses list */}
      {((featuredCourses && featuredCourses.length > 0) || (courses && courses.length > 0)) && (
        <section className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Popüler Kurslar</h2>
                <p className="text-gray-500 font-semibold text-sm">
                  {featuredCourses && featuredCourses.length > 0
                    ? "Öne çıkan seçili kurslarımız"
                    : "En çok tercih edilen kurslarımız"}
                </p>
              </div>
              <Link
                href="/courses"
                className="text-teal-600 hover:text-teal-700 font-bold text-sm inline-flex items-center gap-1 group"
              >
                Tümünü Keşfet <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {(featuredCourses && featuredCourses.length > 0 ? featuredCourses : courses || []).slice(0, 8).map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div>
                      {/* Image / Thumbnail placeholder */}
                      <div className="aspect-video bg-gradient-to-br from-teal-500 to-indigo-600 relative overflow-hidden">
                        {course.thumbnail_path ? (
                          <img
                            src={course.thumbnail_path}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50 text-5xl font-black">📚</div>
                        )}
                        {course.discount_price && (
                          <span className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md">
                            %{Math.round((1 - course.discount_price / course.price) * 100)} İNDİRİM
                          </span>
                        )}
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-5 space-y-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-sm font-semibold text-gray-400">{course.teacher?.full_name || "Seçkin Eğitmen"}</p>
                      </div>
                    </div>

                    <div className="p-5 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                        <span className="text-yellow-500 text-base">★</span>
                        <span>4.8</span>
                        <span className="text-gray-400 font-semibold text-xs">(84)</span>
                      </div>
                      <div className="font-black text-gray-900 text-lg">
                        {course.discount_price ? (
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 line-through font-semibold">₺{course.price}</span>
                            <span className="text-teal-600">₺{course.discount_price}</span>
                          </div>
                        ) : course.price === 0 ? (
                          <span className="text-teal-600 font-bold">Ücretsiz</span>
                        ) : (
                          <span>₺{course.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Become an Instructor Dedicated Promo Section (dersheryerde.com Vibe) */}
      <section className="py-24 bg-white relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-indigo-50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-teal-50 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6">
                <div className="inline-flex px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  Eğitmen Kadromuza Katılın
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Bilginizi Kazanca Dönüştürün!
                </h2>
                <p className="text-indigo-100/80 leading-relaxed font-medium">
                  BiHocam çatısı altında ders vererek binlerce öğrenciye ulaşabilir, kendi çalışma saatlerinizi belirleyebilir, modern yapay zeka araçlarıyla ders planlarınızı kolayca hazırlayabilirsiniz.
                </p>
                <div className="space-y-3 pt-2">
                  {[
                    "Kendi ders saatlerinizi ve ücretinizi serbestçe belirleyin.",
                    "Öğrenci eşleştirme sistemimiz ile derslerinizi anında başlatın.",
                    "Yapay zeka asistanı desteği ile ders hazırlığı ve takibini kolaylaştırın.",
                    "Haftalık kazanç ödemeleri ve şeffaf IBAN hesap yönetimi.",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0 mt-0.5">✓</span>
                      <span className="text-sm font-semibold text-slate-100">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6">
                  <Link
                    href="/become-instructor"
                    className="inline-flex px-8 py-4 bg-gradient-to-r from-teal-400 to-teal-500 text-slate-900 font-bold rounded-2xl hover:shadow-xl hover:shadow-teal-400/20 transform hover:-translate-y-0.5 transition-all"
                  >
                    Hemen Başvuruda Bulun →
                  </Link>
                </div>
              </div>

              <div className="flex justify-center">
                <img
                  src="/parttime_career.png"
                  alt="Öğretmen Ol"
                  className="max-h-96 object-contain drop-shadow-2xl rounded-3xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </section>


      <Footer />
    </div>
  );
}
