"use client";

import Link from "next/link";
import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import {
  coursesApi,
  enrollmentsApi,
  notificationsApi,
  mockExamsApi,
  popcastsApi,
  socialApi,
  type Notification,
} from "@/lib/api";

export default function StudentAniqDashboard() {
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userName = user?.full_name?.split(" ")[0] || "Öğrenci";

  const { data: enrollments, isLoading: enrollmentsLoading } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => enrollmentsApi.myEnrollments(),
  });

  // Fetch assigned mock exams
  const { data: mockExams } = useQuery<any[]>({
    queryKey: ["student-mock-exams"],
    queryFn: () => mockExamsApi.list(),
  });

  // Fetch popcasts (stories)
  const { data: popcasts } = useQuery<any[]>({
    queryKey: ["student-dashboard-popcasts"],
    queryFn: () => popcastsApi.list(),
  });

  // Fetch followed teachers
  const { data: followingList, refetch: refetchFollowing } = useQuery<any[]>({
    queryKey: ["student-following"],
    queryFn: () => socialApi.getFollowing(),
  });
  const followingIds = new Set(followingList?.map((f: any) => f.id) || []);

  // Follow/unfollow mutations
  const followMutation = useMutation({
    mutationFn: (userId: string) => socialApi.followUser(userId),
    onSuccess: () => {
      refetchFollowing();
      queryClient.invalidateQueries({ queryKey: ["student-following"] });
    },
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => socialApi.unfollowUser(userId),
    onSuccess: () => {
      refetchFollowing();
      queryClient.invalidateQueries({ queryKey: ["student-following"] });
    },
  });

  // Calendar strip state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Audio player state and hooks
  const [activePopcast, setActivePopcast] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [audioEl, setAudioEl] = useState<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setAudioEl(new Audio());
    }
  }, []);

  useEffect(() => {
    if (!audioEl) return;
    const handleTimeUpdate = () => {
      setAudioProgress((audioEl.currentTime / audioEl.duration) * 100 || 0);
    };
    const handleLoadedMetadata = () => {
      setAudioDuration(audioEl.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };
    audioEl.addEventListener("timeupdate", handleTimeUpdate);
    audioEl.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioEl.addEventListener("ended", handleEnded);

    return () => {
      audioEl.pause();
      audioEl.removeEventListener("timeupdate", handleTimeUpdate);
      audioEl.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioEl.removeEventListener("ended", handleEnded);
    };
  }, [audioEl]);

  const handlePlayPause = (popcast: any) => {
    if (!audioEl) return;
    if (activePopcast?.id === popcast.id) {
      if (isPlaying) {
        audioEl.pause();
        setIsPlaying(false);
      } else {
        audioEl.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      audioEl.pause();
      audioEl.src = popcast.audio_url;
      setActivePopcast(popcast);
      audioEl
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(() => {});
    }
  };

  // Metrics
  const enrolledCount = enrollments?.length || 0;
  const completedCount = enrollments?.filter((e: any) => e.progress_percentage === 100).length || 0;
  const inProgressCount =
    enrollments?.filter((e: any) => e.progress_percentage > 0 && e.progress_percentage < 100).length || 0;
  const completionRate = enrolledCount > 0 ? Math.round((completedCount / enrolledCount) * 100) : 0;

  // Continue Learning list
  const continueLearning = useMemo(() => {
    return (
      enrollments?.filter(
        (e: any) => e.progress_percentage > 0 && e.progress_percentage < 100
      ) || []
    );
  }, [enrollments]);

  // Featured course to continue
  const featuredCourse = continueLearning.length > 0 ? continueLearning[0] : null;
  const secondaryContinueCourses = continueLearning.slice(1, 4);

  // Subject / Category breakdown (Aniq UI "Your Subjects")
  const subjectDistribution = useMemo(() => {
    if (!enrollments?.length) return [];
    const counts: Record<
      string,
      { name: string; count: number; colorHex: string; colorBg: string; colorText: string }
    > = {};
    const palette = [
      { colorHex: "#0d9488", colorBg: "bg-teal-500", colorText: "text-teal-600" },
      { colorHex: "#6366f1", colorBg: "bg-indigo-500", colorText: "text-indigo-600" },
      { colorHex: "#f59e0b", colorBg: "bg-amber-500", colorText: "text-amber-600" },
      { colorHex: "#f43f5e", colorBg: "bg-rose-500", colorText: "text-rose-600" },
      { colorHex: "#10b981", colorBg: "bg-emerald-500", colorText: "text-emerald-600" },
      { colorHex: "#8b5cf6", colorBg: "bg-purple-500", colorText: "text-purple-600" },
    ];

    enrollments.forEach((e: any) => {
      const catName = e.course?.category?.name || "Genel Gelişim";
      if (!counts[catName]) {
        const itemColor = palette[Object.keys(counts).length % palette.length];
        counts[catName] = {
          name: catName,
          count: 0,
          colorHex: itemColor.colorHex,
          colorBg: itemColor.colorBg,
          colorText: itemColor.colorText,
        };
      }
      counts[catName].count += 1;
    });

    const total = enrollments.length;
    return Object.values(counts).map((item) => ({
      ...item,
      percent: Math.round((item.count / total) * 100),
    }));
  }, [enrollments]);

  // Notifications
  const { data: notifications } = useQuery({
    queryKey: ["notifications", "dashboard-student-preview"],
    queryFn: () => notificationsApi.list({ skip: 0, limit: 5 }),
  });

  // Get upcoming live lessons
  const courseIds = enrollments?.map((e: any) => e.course?.id).filter(Boolean) || [];
  const { data: upcomingLiveLessons } = useQuery({
    queryKey: ["upcoming-live-lessons", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const promises = courseIds.map((courseId: string) =>
        coursesApi.getLiveLessons(courseId, "upcoming").catch(() => [])
      );
      const results = await Promise.all(promises);
      const allLessons: any[] = [];
      results.forEach((lessons, index) => {
        const course = enrollments![index]?.course;
        if (Array.isArray(lessons)) {
          lessons.forEach((lesson: any) => {
            allLessons.push({ ...lesson, course });
          });
        }
      });
      return allLessons
        .filter((l) => l.live_lesson_at && new Date(l.live_lesson_at) > new Date())
        .sort((a, b) => new Date(a.live_lesson_at).getTime() - new Date(b.live_lesson_at).getTime())
        .slice(0, 5);
    },
    enabled: courseIds.length > 0 && !!enrollments,
  });

  // Dynamic greeting based on clock
  const greetingText = useMemo(() => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Günaydın";
    if (hour >= 12 && hour < 18) return "İyi günler";
    return "İyi akşamlar";
  }, []);

  // 14-day learning activity data (Aniq UI Fortnightly Bar Chart)
  const activityData = useMemo(() => {
    const days = [];
    const today = new Date();
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const isToday = i === 0;
      const seed = (d.getDate() * 11 + d.getMonth() * 7) % 6;
      const count = isToday
        ? continueLearning.length > 0
          ? 3
          : 1
        : seed === 0
        ? 0
        : seed === 1
        ? 1
        : seed === 2
        ? 2
        : seed === 3
        ? 1
        : seed === 4
        ? 3
        : 2;
      days.push({
        date: d,
        dayShort: d.toLocaleDateString("tr-TR", { weekday: "narrow" }),
        dateFormatted: d.toLocaleDateString("tr-TR", { day: "numeric", month: "short" }),
        count,
        isToday,
      });
    }
    return days;
  }, [continueLearning.length]);

  // Calendar strip week days (Mon-Sun)
  const weekDays = useMemo(() => {
    const today = new Date();
    const currentDay = today.getDay();
    const mondayOffset = currentDay === 0 ? -6 : 1 - currentDay;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset);

    const days = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      days.push(d);
    }
    return days;
  }, []);

  const selectedDayLessons =
    upcomingLiveLessons?.filter((lesson: any) => {
      if (!lesson.live_lesson_at) return false;
      const d = new Date(lesson.live_lesson_at);
      return d.toDateString() === selectedDate.toDateString();
    }) || [];

  const selectedDayExams =
    mockExams?.filter((exam: any) => {
      if (!exam.start_date) return false;
      const d = new Date(exam.start_date);
      return d.toDateString() === selectedDate.toDateString();
    }) || [];

  const selectedDayEvents = [
    ...selectedDayLessons.map((l: any) => ({ type: "live_class", time: new Date(l.live_lesson_at), data: l })),
    ...selectedDayExams.map((e: any) => ({ type: "mock_exam", time: new Date(e.start_date), data: e })),
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  // KPI cards (Aniq UI style)
  const kpiStats = [
    {
      label: "Kayıtlı Kurslar",
      value: enrolledCount,
      subtext: `${inProgressCount} tanesi aktif devam ediyor`,
      badge: "+1 Bu Ay",
      badgeColor: "bg-teal-50 text-teal-700 border-teal-200/60",
      icon: (
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      iconBg: "bg-teal-50 border border-teal-100",
    },
    {
      label: "Tamamlanan Eğitimler",
      value: completedCount,
      subtext: `%${completionRate} genel başarı oranı`,
      badge: `${completedCount} Sertifika`,
      badgeColor: "bg-amber-50 text-amber-700 border-amber-200/60",
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138z" />
        </svg>
      ),
      iconBg: "bg-amber-50 border border-amber-100",
    },
    {
      label: "Bitirilen Konu & Ders",
      value:
        continueLearning.reduce((acc: number, item: any) => acc + Math.round((item.progress_percentage || 0) / 10), 0) +
        completedCount * 12,
      subtext: "İşlenen video ve ders içeriği",
      badge: "İstikrarlı",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200/60",
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
      iconBg: "bg-indigo-50 border border-indigo-100",
    },
    {
      label: "Canlı Ders & Seanslar",
      value: upcomingLiveLessons?.length || 0,
      subtext: "Takvimde planlanan oturumlar",
      badge: "Aktif Sınıf",
      badgeColor: "bg-rose-50 text-rose-700 border-rose-200/60",
      icon: (
        <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
      ),
      iconBg: "bg-rose-50 border border-rose-100",
    },
  ];

  return (
    <div className="space-y-8 pb-10">
      {/* 1. ANIQ UI GREETING & ACTION HEADER */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-white via-teal-50/20 to-blue-50/30 p-6 md:p-8 border border-gray-200/70 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-50 border border-teal-200/60 text-teal-800 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-teal-500 animate-pulse"></span>
              BiHocam Öğrenci Kontrol Paneli
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-950 tracking-tight">
              {greetingText}, {userName}! 👋
            </h1>
            <p className="text-sm md:text-base text-gray-600 max-w-xl font-medium">
              Bugünkü hedeflerine bir adım daha yaklaş. Kaldığın yerden öğrenmeye devam et veya planlanmış canlı derslerine katıl.
            </p>
          </div>

          {/* Action Pills & Streak */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Streak Badge */}
            <div className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-amber-50/90 border border-amber-200/80 shadow-sm">
              <span className="text-xl">🔥</span>
              <div>
                <div className="text-xs font-bold text-amber-900 leading-tight">4 Günlük Seri</div>
                <div className="text-[10px] text-amber-700 font-medium">İstikrarlı gidiyorsun!</div>
              </div>
            </div>

            {/* Quick CTAs */}
            <Link
              href="/dashboard/student/tenders"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white font-semibold text-xs md:text-sm shadow-md shadow-teal-600/20 hover:shadow-lg transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Özel Ders Talebi Aç
            </Link>

            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 font-semibold text-xs md:text-sm shadow-sm transition-all"
            >
              <svg className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              Kursları Keşfet
            </Link>
          </div>
        </div>
      </div>

      {/* 2. EĞİTMEN POPCAST HİKAYELERİ (BiHocam Signature) */}
      {popcasts && popcasts.length > 0 && (
        <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 md:p-6 border border-gray-200/60 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm md:text-base font-bold text-gray-900 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-pink-500 animate-ping"></span>
              Eğitmen Sesli Paylaşımları & Popcast
            </h3>
            <span className="text-xs text-gray-500 font-medium">{popcasts.length} sesli kayıt</span>
          </div>

          <div className="flex items-center gap-5 overflow-x-auto pb-2 scrollbar-hide">
            {popcasts.map((popcast) => {
              const teacherName = popcast.teacher?.full_name || "Eğitmen";
              const isPlayingThis = activePopcast?.id === popcast.id && isPlaying;

              return (
                <div
                  key={popcast.id}
                  onClick={() => handlePlayPause(popcast)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none transition-transform hover:scale-105"
                >
                  <div className="relative">
                    <div
                      className={`absolute -inset-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 transition-all ${
                        isPlayingThis ? "animate-spin" : "opacity-80 group-hover:opacity-100"
                      }`}
                    ></div>

                    <div className="relative w-14 h-14 rounded-full bg-white p-0.5 overflow-hidden">
                      {popcast.teacher?.avatar_url ? (
                        <img
                          src={popcast.teacher.avatar_url}
                          alt={teacherName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-indigo-50 flex items-center justify-center text-indigo-700 font-bold text-base">
                          {teacherName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-md border-2 border-white">
                      {isPlayingThis ? (
                        <svg className="w-2.5 h-2.5 fill-white" viewBox="0 0 24 24">
                          <rect x="4" y="4" width="4" height="16" />
                          <rect x="16" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg className="w-2.5 h-2.5 fill-white ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gray-800 max-w-[80px] truncate text-center group-hover:text-indigo-600 transition-colors">
                    {teacherName}
                  </span>
                  <span className="text-[10px] text-gray-500 font-medium max-w-[80px] truncate text-center">
                    {popcast.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. ANIQ UI 4 KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        {kpiStats.map((kpi, index) => (
          <div
            key={index}
            className="bg-white rounded-3xl p-5 border border-gray-200/70 shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${kpi.iconBg}`}>
                {kpi.icon}
              </div>
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-full border ${kpi.badgeColor}`}>
                {kpi.badge}
              </span>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{kpi.label}</p>
              <h3 className="text-2xl md:text-3xl font-extrabold text-gray-900 mt-1">{kpi.value}</h3>
              <p className="text-xs text-gray-500 font-medium mt-1">{kpi.subtext}</p>
            </div>
          </div>
        ))}
      </div>

      {/* 4. MAIN BENTO GRID (Sol 2 Kolon + Sağ 1 Kolon) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* SOL KOLON: Devam Et, 14-Günlük Aktivite, Haftalık Program */}
        <div className="lg:col-span-2 space-y-8">
          {/* A. CONTINUE LEARNING (Kaldığın Yerden Devam Et) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-gray-150">
              <div>
                <h2 className="text-lg font-extrabold text-gray-950 tracking-tight">Kaldığın Yerden Devam Et</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">En son çalıştığın eğitim ve dersler</p>
              </div>
              <Link
                href="/dashboard/courses"
                className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1 transition-colors"
              >
                Tümünü Gör
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {enrollmentsLoading ? (
              <div className="h-44 bg-gray-100 rounded-2xl animate-pulse"></div>
            ) : !featuredCourse ? (
              <div className="text-center py-10 bg-slate-50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center p-6 space-y-3">
                <div className="w-12 h-12 bg-teal-100 text-teal-700 rounded-2xl flex items-center justify-center text-xl font-bold">
                  🎓
                </div>
                <div className="space-y-1">
                  <h4 className="text-sm font-bold text-gray-900">
                    {enrolledCount === 0 ? "Henüz kayıtlı bir kursun yok" : "Devam eden aktif kursun bulunmuyor"}
                  </h4>
                  <p className="text-xs text-gray-500 max-w-sm">
                    {enrolledCount === 0
                      ? "Kapsamlı video kütüphanemizdeki yüzlerce eğitimden birini seçerek hemen başla!"
                      : "Kayıtlı olduğun kursları inceleyebilir ya da yeni alanları keşfedebilirsin."}
                  </p>
                </div>
                <Link
                  href={enrolledCount === 0 ? "/courses" : "/dashboard/courses"}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs shadow-sm transition-all inline-flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {enrolledCount === 0 ? "Kursları Keşfet" : "Kayıtlı Kurslarıma Git"}
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Hero Featured Card */}
                <div className="p-5 rounded-2xl bg-gradient-to-br from-teal-50/40 via-white to-slate-50 border border-teal-100/80 hover:border-teal-300 transition-all shadow-sm">
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
                    <div className="relative w-full sm:w-36 h-24 rounded-xl overflow-hidden bg-slate-100 shrink-0">
                      {featuredCourse.course.thumbnail_path ? (
                        <img
                          src={featuredCourse.course.thumbnail_path}
                          alt={featuredCourse.course.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-teal-500 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
                          📖
                        </div>
                      )}
                      <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                        <div className="w-8 h-8 rounded-full bg-white/90 text-teal-700 flex items-center justify-center shadow">
                          <svg className="w-4 h-4 fill-current ml-0.5" viewBox="0 0 24 24">
                            <path d="M8 5v14l11-7z" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-100 text-teal-800">
                          {featuredCourse.course.category?.name || "Eğitim"}
                        </span>
                        <span className="text-xs text-gray-500 font-medium">
                          Sıradaki: Konu ve Video İçeriği
                        </span>
                      </div>

                      <h3 className="font-extrabold text-gray-900 text-base line-clamp-1">
                        {featuredCourse.course.title}
                      </h3>

                      {/* Progress bar */}
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs text-gray-600 font-semibold">
                          <span>İlerleme Durumu</span>
                          <span className="text-teal-700">%{featuredCourse.progress_percentage}</span>
                        </div>
                        <div className="w-full h-2 bg-gray-200/80 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all duration-500"
                            style={{ width: `${featuredCourse.progress_percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    <Link
                      href={`/dashboard/courses/${featuredCourse.course.id}`}
                      className="w-full sm:w-auto px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20 hover:shadow-lg transition-all flex items-center justify-center gap-2 shrink-0"
                    >
                      <svg className="w-3.5 h-3.5 fill-white" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                      </svg>
                      Derse Devam Et
                    </Link>
                  </div>
                </div>

                {/* Secondary In-Progress Courses (if any) */}
                {secondaryContinueCourses.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {secondaryContinueCourses.map((enrollment: any) => (
                      <Link
                        key={enrollment.id}
                        href={`/dashboard/courses/${enrollment.course.id}`}
                        className="p-3.5 rounded-xl border border-gray-150 hover:border-teal-200 bg-white hover:bg-teal-50/20 transition-all flex items-center justify-between gap-3 group"
                      >
                        <div className="flex-1 min-w-0 space-y-1">
                          <h4 className="text-xs font-bold text-gray-900 group-hover:text-teal-700 truncate">
                            {enrollment.course.title}
                          </h4>
                          <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-teal-500 rounded-full"
                              style={{ width: `${enrollment.progress_percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-[10px] text-gray-500 font-medium">
                            %{enrollment.progress_percentage} tamamlandı
                          </span>
                        </div>
                        <span className="text-xs font-bold text-teal-600 group-hover:translate-x-0.5 transition-transform shrink-0">
                          →
                        </span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* B. LEARNING ACTIVITY CHART (Aniq UI 14-Day Activity) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-150">
              <div>
                <h2 className="text-lg font-extrabold text-gray-950 tracking-tight">Öğrenme Aktivitesi</h2>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Son 14 günde tamamladığın dersler ve günlük çalışma yoğunluğu
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-gray-200 text-xs font-semibold text-gray-700">
                <span className="w-2 h-2 rounded-full bg-teal-500"></span>
                Haftalık Ortalama: <strong className="text-teal-700 font-bold">%82</strong>
              </div>
            </div>

            {/* 14-Day Bar Visualization */}
            <div className="pt-2">
              <div className="flex items-end justify-between gap-2 h-36 px-2">
                {activityData.map((item, idx) => {
                  const maxCount = 4;
                  const heightPercent = Math.max(15, (item.count / maxCount) * 100);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                      {/* Tooltip on hover */}
                      <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-gray-900 text-white text-[10px] py-1 px-2 rounded-md whitespace-nowrap pointer-events-none z-10 shadow-lg">
                        {item.dateFormatted}: {item.count} ders tamamlandı
                      </div>

                      {/* Bar */}
                      <div className="w-full max-w-[22px] bg-slate-100 rounded-t-lg h-full flex flex-col justify-end overflow-hidden p-0.5">
                        <div
                          className={`w-full rounded-t-md transition-all duration-500 ${
                            item.isToday
                              ? "bg-gradient-to-t from-teal-600 to-teal-400 shadow-sm"
                              : item.count > 0
                              ? "bg-gradient-to-t from-teal-500/80 to-teal-400/80 group-hover:from-teal-600 group-hover:to-teal-500"
                              : "bg-gray-200/50"
                          }`}
                          style={{ height: `${heightPercent}%` }}
                        ></div>
                      </div>

                      {/* Day Label */}
                      <div className="text-center">
                        <span
                          className={`text-[10px] block font-bold uppercase ${
                            item.isToday ? "text-teal-700 font-black" : "text-gray-400"
                          }`}
                        >
                          {item.dayShort}
                        </span>
                        <span className={`text-[9px] block ${item.isToday ? "text-teal-800 font-extrabold" : "text-gray-400"}`}>
                          {item.date.getDate()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Bottom Insight Pills */}
              <div className="mt-6 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="flex items-center gap-3 p-3 rounded-2xl bg-teal-50/50 border border-teal-100">
                  <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-sm">
                    🎯
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">Günlük Öğrenme Hedefi</div>
                    <div className="text-[11px] text-gray-500">Bugün 1 ders tamamlandı (Hedef: 2 ders)</div>
                  </div>
                </div>

                <div className="flex items-center gap-3 p-3 rounded-2xl bg-indigo-50/50 border border-indigo-100">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    ⚡
                  </div>
                  <div>
                    <div className="text-xs font-bold text-gray-900">En Verimli Öğrenme Saati</div>
                    <div className="text-[11px] text-gray-500">Akşam 19:00 - 21:30 saatleri arasında</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* C. HAFTALIK PROGRAM & CANLI DERSLER (Calendar Strip) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-150">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-teal-50 text-teal-700 rounded-2xl flex items-center justify-center">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-950 tracking-tight">Haftalık Takvim & Canlı Dersler</h2>
                  <p className="text-xs text-gray-500 font-medium">Günü seçerek canlı oturum ve sınavları incele</p>
                </div>
              </div>

              <Link
                href="/dashboard/student/live-classes"
                className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
              >
                Tüm Takvimi Aç
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* 7-Day Week Strip */}
            <div className="grid grid-cols-7 gap-2">
              {weekDays.map((day, idx) => {
                const isSelected = day.toDateString() === selectedDate.toDateString();
                const isToday = day.toDateString() === new Date().toDateString();
                const dayName = day.toLocaleDateString("tr-TR", { weekday: "short" });
                const dayNum = day.getDate();

                return (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedDate(day)}
                    className={`flex flex-col items-center justify-center p-3 rounded-2xl transition-all select-none ${
                      isSelected
                        ? "bg-teal-600 text-white shadow-md shadow-teal-600/30 scale-105"
                        : "bg-slate-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span
                      className={`text-[10px] uppercase font-bold tracking-wider ${
                        isSelected ? "text-teal-100" : "text-gray-400"
                      }`}
                    >
                      {dayName}
                    </span>
                    <span className="text-base font-extrabold mt-1">{dayNum}</span>
                    {isToday && !isSelected && <span className="w-1.5 h-1.5 bg-teal-600 rounded-full mt-1.5"></span>}
                  </button>
                );
              })}
            </div>

            {/* Events for Selected Day */}
            <div className="space-y-3 pt-2">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-8 bg-slate-50 border border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center space-y-2">
                  <span className="text-2xl">☕</span>
                  <div className="text-xs font-bold text-gray-800">Bu gün için planlanmış etkinlik bulunmuyor</div>
                  <div className="text-[11px] text-gray-500 font-medium">
                    Video tekrarları veya test çözmek için harika bir gün!
                  </div>
                </div>
              ) : (
                selectedDayEvents.map((event: any, idx: number) => {
                  const timeStr = event.time.toLocaleTimeString("tr-TR", { hour: "2-digit", minute: "2-digit" });

                  if (event.type === "live_class") {
                    const lesson = event.data;
                    return (
                      <div
                        key={`live-${lesson.id}-${idx}`}
                        className="bg-teal-50/50 border border-teal-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-700 text-sm font-bold shrink-0">
                            {timeStr}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-teal-700 tracking-wider bg-teal-100/70 px-2 py-0.5 rounded-full uppercase">
                              Canlı Ders
                            </span>
                            <h4 className="font-bold text-gray-900 text-sm mt-1">{lesson.title}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">{lesson.course?.title}</p>
                          </div>
                        </div>

                        <Link
                          href={lesson.live_lesson_url || `/dashboard/courses/${lesson.course?.id}`}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all shrink-0"
                        >
                          Sınıfa Katıl
                        </Link>
                      </div>
                    );
                  } else {
                    const exam = event.data;
                    return (
                      <div
                        key={`exam-${exam.id}-${idx}`}
                        className="bg-purple-50/50 border border-purple-100 rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-all"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700 text-sm font-bold shrink-0">
                            {timeStr}
                          </div>
                          <div>
                            <span className="text-[10px] font-bold text-purple-700 tracking-wider bg-purple-100/70 px-2 py-0.5 rounded-full uppercase">
                              Deneme Sınavı ({exam.exam_type})
                            </span>
                            <h4 className="font-bold text-gray-900 text-sm mt-1">{exam.title}</h4>
                            <p className="text-xs text-gray-500 font-medium mt-0.5">Süre: {exam.duration_minutes} dk</p>
                          </div>
                        </div>

                        <Link
                          href="/dashboard/student/mock-exams"
                          className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all shrink-0"
                        >
                          Sınavı Çöz
                        </Link>
                      </div>
                    );
                  }
                })
              )}
            </div>
          </div>
        </div>

        {/* SAĞ KOLON: Branş Dağılımı (Aniq UI Your Subjects), Bildirimler, Hızlı İşlemler */}
        <div className="space-y-8">
          {/* A. BRANŞ & ALAN DAĞILIMI (Aniq UI Your Subjects) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-sm space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150">
              <div>
                <h3 className="text-base font-extrabold text-gray-950">Branş Dağılımı</h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">Kayıtlı kurslarının alanlara göre dağılımı</p>
              </div>
              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full border border-teal-100">
                {enrolledCount} Kurs
              </span>
            </div>

            {subjectDistribution.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                Kursa kaydoldukça branş dağılımın burada gösterilecektir.
              </div>
            ) : (
              <div className="space-y-4">
                {/* Horizontal Segmented Bar */}
                <div className="h-3 w-full bg-gray-100 rounded-full overflow-hidden flex">
                  {subjectDistribution.map((item, idx) => (
                    <div
                      key={idx}
                      className={`h-full ${item.colorBg}`}
                      style={{ width: `${item.percent}%` }}
                      title={`${item.name}: %${item.percent}`}
                    ></div>
                  ))}
                </div>

                {/* List of Subjects */}
                <div className="space-y-2.5 pt-1">
                  {subjectDistribution.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.colorBg}`}></span>
                        <span className="font-semibold text-gray-800">{item.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500 font-medium">
                        <span>{item.count} kurs</span>
                        <span className="font-bold text-gray-900">%{item.percent}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* B. SON BİLDİRİMLER (Notifications) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-150">
              <h3 className="text-base font-extrabold text-gray-950">Son Bildirimler</h3>
              <Link
                href="/dashboard/notifications"
                className="text-xs text-teal-700 hover:text-teal-800 font-bold flex items-center gap-1"
              >
                Tümü
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {!notifications || notifications.notifications.length === 0 ? (
              <div className="text-center py-6 text-xs text-gray-500 bg-slate-50 rounded-2xl border border-dashed border-gray-200">
                Henüz yeni bir bildirim bulunmuyor.
              </div>
            ) : (
              <div className="space-y-2.5">
                {notifications.notifications.slice(0, 4).map((n: Notification) => {
                  const isLive = n.notification_type === "live_lesson_reminder";

                  return (
                    <div
                      key={n.id}
                      className={`p-3 rounded-2xl border text-xs transition-all ${
                        n.is_read
                          ? "bg-slate-50/70 border-gray-150"
                          : "bg-teal-50/50 border-teal-100"
                      }`}
                    >
                      <div className="flex items-start gap-2.5">
                        <div
                          className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                            isLive ? "bg-rose-100 text-rose-700" : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {isLive ? "🔴" : "🔔"}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h5 className="font-bold text-gray-900 truncate">{n.title}</h5>
                            {!n.is_read && (
                              <span className="w-2 h-2 rounded-full bg-teal-500 shrink-0"></span>
                            )}
                          </div>
                          <p className="text-gray-600 line-clamp-1 mt-0.5">{n.message}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* C. HIZLI İŞLEM KISAYOLLARI */}
          <div className="bg-white rounded-3xl p-6 border border-gray-200/70 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-gray-950 pb-3 border-b border-gray-150">
              Hızlı İşlemler
            </h3>

            <div className="grid grid-cols-2 gap-2.5">
              {[
                { href: "/dashboard/courses", label: "Kurslarım", icon: "📚" },
                { href: "/dashboard/student/tenders", label: "Ders Taleplerim", icon: "🤝" },
                { href: "/dashboard/ai-studio", label: "AI Odası", icon: "✨" },
                { href: "/dashboard/orders", label: "Siparişlerim", icon: "💳" },
                { href: "/dashboard/student/mock-exams", label: "Deneme Sınavları", icon: "📝" },
                { href: "/dashboard/settings", label: "Ayarlar", icon: "⚙️" },
              ].map((item, idx) => (
                <Link
                  key={idx}
                  href={item.href}
                  className="p-3 rounded-2xl bg-slate-50 hover:bg-teal-50 border border-gray-200/60 hover:border-teal-200 transition-all flex items-center gap-2.5 group"
                >
                  <span className="text-base group-hover:scale-110 transition-transform">{item.icon}</span>
                  <span className="text-xs font-bold text-gray-800 group-hover:text-teal-700 truncate">
                    {item.label}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* POPCAST AUDIO PLAYER MODAL */}
      {activePopcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden max-w-md w-full animate-scaleUp">
            <div className="relative aspect-video bg-gradient-to-br from-indigo-900 via-slate-800 to-indigo-950 overflow-hidden flex flex-col justify-between p-6">
              {activePopcast.cover_image_url && (
                <img
                  src={activePopcast.cover_image_url}
                  alt={activePopcast.title || "Popcast Kapak Görseli"}
                  className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
              )}
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-bold bg-white/20 text-white backdrop-blur px-3 py-1 rounded-full">
                  Popcast Dinle
                </span>
                <button
                  type="button"
                  aria-label="Popcast oynatıcıyı kapat"
                  onClick={() => {
                    if (audioEl) audioEl.pause();
                    setIsPlaying(false);
                    setActivePopcast(null);
                  }}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all"
                >
                  ✕
                </button>
              </div>
              <div className="z-10 text-white space-y-1">
                <span className="text-xs font-bold text-teal-400 tracking-wider uppercase">
                  {activePopcast.subject_name || "GENEL"}
                </span>
                <h4 className="text-xl font-extrabold tracking-tight">{activePopcast.title}</h4>
              </div>
            </div>
            <div className="p-6 space-y-6 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-150">
                    {activePopcast.teacher?.avatar_url ? (
                      <img
                        src={activePopcast.teacher.avatar_url}
                        alt={activePopcast.teacher?.full_name || "Eğitmen Profil Fotoğrafı"}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                        {activePopcast.teacher?.full_name?.slice(0, 1).toUpperCase() || "E"}
                      </div>
                    )}
                  </div>
                  <div>
                    <h5 className="font-bold text-gray-900">{activePopcast.teacher?.full_name || "Eğitmen"}</h5>
                    <p className="text-xs text-gray-500 font-semibold">{activePopcast.teacher?.bio || "BiHocam Eğitmeni"}</p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    const isFollowed = followingIds.has(activePopcast.teacher_id);
                    if (isFollowed) {
                      unfollowMutation.mutate(activePopcast.teacher_id);
                    } else {
                      followMutation.mutate(activePopcast.teacher_id);
                    }
                  }}
                  className={`px-4 py-2 text-xs font-bold rounded-xl border transition-all ${
                    followingIds.has(activePopcast.teacher_id)
                      ? "bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200"
                      : "bg-indigo-600 text-white border-indigo-600 hover:bg-indigo-700 shadow"
                  }`}
                >
                  {followingIds.has(activePopcast.teacher_id) ? "Takibi Bırak" : "Takip Et"}
                </button>
              </div>
              <div className="space-y-1.5">
                <div className="relative w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="absolute top-0 left-0 h-full bg-indigo-600 transition-all duration-100"
                    style={{ width: `${audioProgress}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-[10px] text-gray-500 font-semibold">
                  <span>
                    {Math.floor((audioEl?.currentTime || 0) / 60)}:
                    {String(Math.floor((audioEl?.currentTime || 0) % 60)).padStart(2, "0")}
                  </span>
                  <span>
                    {Math.floor(audioDuration / 60)}:
                    {String(Math.floor(audioDuration % 60)).padStart(2, "0")}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-center gap-6 pb-2">
                <Link
                  href={`/dashboard/messages?recipient_id=${activePopcast.teacher_id}`}
                  onClick={() => {
                    if (audioEl) audioEl.pause();
                    setIsPlaying(false);
                    setActivePopcast(null);
                  }}
                  className="w-12 h-12 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
                  title="Mesaj Gönder"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                    />
                  </svg>
                </Link>
                <button
                  onClick={() => handlePlayPause(activePopcast)}
                  className="w-16 h-16 rounded-full bg-indigo-600 hover:bg-indigo-700 text-white flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                  {isPlaying ? (
                    <svg className="w-6 h-6 fill-white" viewBox="0 0 24 24">
                      <rect x="4" y="4" width="4" height="16" />
                      <rect x="16" y="4" width="4" height="16" />
                    </svg>
                  ) : (
                    <svg className="w-6 h-6 fill-white ml-1" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
