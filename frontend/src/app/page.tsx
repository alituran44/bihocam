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

  // Public settings'ten maintenance mode kontrolü
  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => publicApi.getPublicSettings(),
    retry: false, // Maintenance mode'da API çalışmayabilir
    refetchInterval: 30000, // 30 saniyede bir kontrol et
  });

  useEffect(() => {
    // Platform settings'ten maintenance mode kontrolü
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

  // Get featured courses (admin-selected)
  const { data: featuredCourses } = useQuery<Course[]>({
    queryKey: ["featured-courses-public"],
    queryFn: () => coursesApi.getFeaturedPublic(8),
    enabled: !maintenanceMode || user?.role === "admin", // Maintenance mode'da sadece admin için kursları göster
    staleTime: 5 * 60 * 1000, // 5 dakika
  });

  // Fallback: regular courses if no featured courses
  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses", "fallback"],
    queryFn: () => coursesApi.list(0, 8),
    enabled: (!featuredCourses || featuredCourses.length === 0) && (!maintenanceMode || user?.role === "admin"),
    staleTime: 5 * 60 * 1000,
  });

  // Popup announcement
  const { activePopup, dismissPopup } = usePopupAnnouncement();

  // Eğer maintenance mode aktifse ve kullanıcı admin değilse, maintenance sayfasını direkt göster
  if (maintenanceMode && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        {/* Geometric Pattern Overlay */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>

        <div className="relative w-full max-w-4xl">
          {/* Main Card */}
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-emerald-100/50 p-8 md:p-16 overflow-hidden">
            {/* Decorative Gradient Border */}
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-cyan-400/20 opacity-50 pointer-events-none"></div>
            <div className="absolute inset-[1px] rounded-[2.5rem] bg-white/80 backdrop-blur-2xl"></div>

            <div className="relative z-10">
              {/* Logo Section */}
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

              {/* Animated Maintenance Icon */}
              <div className="mb-12 flex justify-center">
                <div className="relative">
                  {/* Outer Glow */}
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                  
                  {/* Main Icon Container */}
                  <div className="relative w-48 h-48 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-200/50">
                    <svg className="w-24 h-24 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                      />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>

                  {/* Spinning Rings */}
                  <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-4 border-4 border-transparent border-t-teal-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-6xl md:text-7xl font-black text-center mb-8 tracking-tight">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                  Bakım Modu
                </span>
              </h1>

              {/* Main Message */}
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-2xl p-8 mb-8 shadow-lg">
                <p className="text-xl md:text-2xl text-gray-800 leading-relaxed text-center font-medium">
                  {maintenanceMessage || "Site bakım modundadır. Lütfen daha sonra tekrar deneyin."}
                </p>
              </div>

              {/* Estimated End Time */}
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

              {/* Info Box */}
              <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 rounded-2xl p-8 shadow-lg">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                    <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-base text-blue-900 leading-relaxed font-medium">
                      Site şu anda bakım çalışmaları nedeniyle geçici olarak kullanılamıyor. 
                      Lütfen birkaç dakika sonra tekrar deneyin. Sorun devam ederse bizimle iletişime geçebilirsiniz.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Popup Announcement */}
      {activePopup && (
        <PopupAnnouncement
          popup={activePopup}
          onClose={() => dismissPopup(activePopup.id, false)}
          onDismiss={dismissPopup}
        />
      )}

      <Header />

      {/* Hero */}
      <section className="pt-24 pb-20 lg:pt-32 lg:pb-28 bg-dots">
        <div className="container-custom">
          <div className="max-w-4xl mx-auto text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-orange-100 text-orange-700 text-sm font-medium mb-8">
              🎉 Yeni: AI destekli öğrenme özelliği!
            </div>

            {/* Heading */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 tracking-tight">
              Öğrenmek hiç bu kadar
              <br />
              <span className="text-teal-600">kolay olmamıştı</span>
            </h1>

            {/* Subheading */}
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              YKS, LGS ve tüm dersler için uzman eğitmenler, canlı dersler ve 
              yapay zeka destekli kişisel öğrenme asistanı.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap justify-center gap-4 mb-16">
              <Link href="/register" className="btn-accent text-base px-8 py-4">
                Ücretsiz Başla
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
              <Link href="/courses" className="btn-outline text-base px-8 py-4">
                Kursları Keşfet
              </Link>
            </div>

            {/* Stats */}
            <div className="flex flex-wrap justify-center gap-12">
              {[
                { value: "10K+", label: "Öğrenci" },
                { value: "200+", label: "Ders" },
                { value: "50+", label: "Eğitmen" },
                { value: "4.9", label: "Puan" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-3xl font-bold text-gray-900">{stat.value}</div>
                  <div className="text-sm text-gray-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Neden bihocam?
            </h2>
            <p className="text-gray-600 max-w-xl mx-auto">
              Modern eğitim araçlarıyla öğrenme deneyimini bir üst seviyeye taşı.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: "🎥", title: "Canlı Dersler", desc: "Gerçek zamanlı etkileşimli derslerle sorularını anında sor.", color: "bg-teal-50 text-teal-600" },
              { icon: "🤖", title: "AI Asistan", desc: "Yapay zeka destekli öğrenme asistanı ile 7/24 destek al.", color: "bg-orange-50 text-orange-600" },
              { icon: "📊", title: "İlerleme Takibi", desc: "Detaylı analiz ve raporlarla gelişimini takip et.", color: "bg-blue-50 text-blue-600" },
              { icon: "🎯", title: "Kişisel Plan", desc: "Seviyene ve hedeflerine özel öğrenme planı.", color: "bg-purple-50 text-purple-600" },
              { icon: "📱", title: "Her Yerden Eriş", desc: "Mobil uyumlu platform ile istediğin yerden öğren.", color: "bg-green-50 text-green-600" },
              { icon: "🏆", title: "Sertifika", desc: "Tamamladığın kurslar için sertifika al.", color: "bg-yellow-50 text-yellow-600" },
            ].map((feature) => (
              <div key={feature.title} className="p-6 bg-white rounded-2xl border border-gray-200 hover:border-teal-200 hover:shadow-lg transition-all">
                <div className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center text-2xl mb-4`}>
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-sm text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Homepage Banner Ad */}
      <section className="py-12">
        <div className="container-custom">
          <AdBanner placementCode="homepage_banner" />
        </div>
      </section>

      {/* Categories */}
      <section className="py-24">
        <div className="container-custom">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Popüler Kategoriler</h2>
              <p className="text-gray-600">İlgi alanına göre keşfet</p>
            </div>
            <Link href="/courses" className="text-teal-600 hover:text-teal-700 font-medium text-sm hidden md:block">
              Tümünü Gör →
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { icon: "🎯", name: "YKS", color: "from-orange-400 to-red-500" },
              { icon: "📖", name: "LGS", color: "from-teal-400 to-cyan-500" },
              { icon: "🔢", name: "Matematik", color: "from-blue-400 to-indigo-500" },
              { icon: "⚛️", name: "Fizik", color: "from-purple-400 to-pink-500" },
              { icon: "🧪", name: "Kimya", color: "from-green-400 to-emerald-500" },
              { icon: "🧬", name: "Biyoloji", color: "from-yellow-400 to-orange-500" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/courses?category=${cat.name.toLowerCase()}`}
                className="group relative p-6 rounded-2xl overflow-hidden"
              >
                <div className={`absolute inset-0 bg-gradient-to-br ${cat.color} opacity-90 group-hover:opacity-100 transition-opacity`} />
                <div className="relative text-center text-white">
                  <div className="text-4xl mb-2">{cat.icon}</div>
                  <h3 className="font-semibold">{cat.name}</h3>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Courses (Ad Campaigns) */}
      <section className="py-24 bg-gray-50">
        <div className="container-custom">
          <FeaturedCourses limit={6} showTitle={true} />
        </div>
      </section>

      {/* Popular Courses (Admin-selected featured courses) */}
      {(featuredCourses && featuredCourses.length > 0) || (courses && courses.length > 0) ? (
        <section className="py-24">
          <div className="container-custom">
            <div className="flex items-end justify-between mb-12">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-2">Popüler Kurslar</h2>
                <p className="text-gray-600">
                  {featuredCourses && featuredCourses.length > 0 
                    ? "Öne çıkan seçili kurslarımız" 
                    : "En çok tercih edilen kurslarımız"}
                </p>
              </div>
              <Link href="/courses" className="text-teal-600 hover:text-teal-700 font-medium text-sm hidden md:block">
                Tümünü Gör →
              </Link>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(featuredCourses && featuredCourses.length > 0 ? featuredCourses : courses || []).slice(0, 8).map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden card-hover">
                    <div className="aspect-video bg-gradient-to-br from-teal-500 to-cyan-600 relative">
                      {course.thumbnail_path ? (
                        <img src={course.thumbnail_path} alt={course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-white/60 text-5xl">📚</div>
                      )}
                      {course.discount_price && (
                        <span className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-semibold rounded-lg">
                          %{Math.round((1 - course.discount_price / course.price) * 100)} İndirim
                        </span>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 mb-2">
                        {course.title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-3">{course.teacher?.full_name || "Eğitmen"}</p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1 text-sm">
                          <span className="text-yellow-500">★</span>
                          <span className="text-gray-700 font-medium">4.8</span>
                          <span className="text-gray-400">(120)</span>
                        </div>
                        <div className="font-bold text-gray-900">
                          {course.discount_price ? (
                            <span>₺{course.discount_price}</span>
                          ) : course.price === 0 ? (
                            <span className="text-teal-600">Ücretsiz</span>
                          ) : (
                            <span>₺{course.price}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      ) : null}

      {/* CTA */}
      <section className="py-24 bg-teal-600">
        <div className="container-custom text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Öğrenmeye bugün başla
          </h2>
          <p className="text-teal-100 mb-8 max-w-xl mx-auto">
            Binlerce öğrenci ile birlikte hedeflerine ulaş.
          </p>
          <Link href="/register" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-teal-600 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
            Ücretsiz Hesap Oluştur
          </Link>
        </div>
      </section>

      <Footer />
    </div>
  );
}
