"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient, useQueries } from "@tanstack/react-query";
import { coursesApi, lessonProgressApi, mediaApi, notificationsApi, type Notification, type LessonResponse, type LessonType } from "@/lib/api";
import { ContentRenderer } from "@/components/content/ContentRenderer";

// Lesson type configuration for sidebar icons
const lessonTypeIcons: Record<LessonType, string> = {
  video: "🎬",
  pdf: "📄",
  document: "📝",
  presentation: "📊",
  live_lesson: "🔴",
  text: "✍️",
  quiz: "❓",
};

// Use LessonResponse from API types
type Lesson = LessonResponse;

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_path: string | null;
  lessons: Lesson[];
  teacher?: {
    id: string;
    full_name: string;
  } | null;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "Süre belirtilmemiş";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")} saat`;
  }
  return `${minutes} dakika`;
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

// Helper functions moved to VideoPlayer component

interface LessonProgress {
  id: string;
  watched_seconds: number;
  is_completed: boolean;
  completed_at: string | null;
}

export default function LessonWatchPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const courseId = params.courseId as string;
  const lessonId = params.lessonId as string;
  const [watchTime, setWatchTime] = useState(0);

  const { data: course, isLoading: isLoadingCourse } = useQuery<Course>({
    queryKey: ["course", courseId],
    queryFn: () => coursesApi.get(courseId),
    enabled: !!courseId,
  });

  const { data: lesson, isLoading: isLoadingLesson } = useQuery<Lesson>({
    queryKey: ["lesson", courseId, lessonId],
    queryFn: () => coursesApi.getLesson(courseId, lessonId),
    enabled: !!courseId && !!lessonId,
  });

  // Get lesson progress
  const { data: progress, isLoading: isLoadingProgress } = useQuery<LessonProgress>({
    queryKey: ["lesson-progress", courseId, lessonId],
    queryFn: () => lessonProgressApi.get(courseId, lessonId),
    enabled: !!courseId && !!lessonId,
  });

  const updateProgressMutation = useMutation({
    mutationFn: (progressData: { watched_seconds?: number; is_completed?: boolean }) =>
      lessonProgressApi.update(courseId, lessonId, progressData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["lesson-progress", courseId, lessonId] });
      queryClient.invalidateQueries({ queryKey: ["my-enrollments"] });
    },
    onError: (error: any) => {
      console.error("İlerleme kaydedilemedi:", error);
      // Hata durumunda sessizce devam et (kullanıcı deneyimini bozmamak için)
    },
  });

  const completed = progress?.is_completed || false;

  const sortedLessons = course?.lessons
    ? [...course.lessons].sort((a, b) => a.order - b.order)
    : [];

  // Tüm derslerin progress'ini paralel olarak al
  const lessonProgressQueries = useQueries({
    queries: sortedLessons.map((l) => ({
      queryKey: ["lesson-progress", courseId, l.id],
      queryFn: () => lessonProgressApi.get(courseId, l.id),
      enabled: !!courseId && !!l.id,
    })),
  });

  const lessonProgressMap = new Map<string, boolean>();
  sortedLessons.forEach((l, index) => {
    const progressData = lessonProgressQueries[index]?.data as LessonProgress | undefined;
    lessonProgressMap.set(l.id, progressData?.is_completed || false);
  });

  const currentLessonIndex = sortedLessons.findIndex((l) => l.id === lessonId);
  const previousLesson = currentLessonIndex > 0 ? sortedLessons[currentLessonIndex - 1] : null;
  const nextLesson =
    currentLessonIndex < sortedLessons.length - 1 ? sortedLessons[currentLessonIndex + 1] : null;

  // Kursa özel duyurular & canlı ders bildirimleri
  const { data: notificationList } = useQuery({
    queryKey: ["course-notifications", courseId],
    queryFn: () => notificationsApi.list({ skip: 0, limit: 50 }),
    enabled: !!courseId,
  });

  const courseNotifications: Notification[] =
    notificationList?.notifications.filter(
      (n) =>
        n.data &&
        (n.data as any).course_id === courseId &&
        [
          "course_announcement",
          "live_lesson_reminder",
          "live_lesson_starting",
          "live_lesson_cancelled",
        ].includes(n.notification_type)
    ) || [];

  // Progress tracking for video content
  const handleProgress = (seconds: number) => {
    setWatchTime(seconds);
  };

  const handleCompleteLesson = () => {
    updateProgressMutation.mutate({
      is_completed: true,
      watched_seconds: watchTime || progress?.watched_seconds || 0,
    });
  };

  // Auto-save progress (every 30 seconds)
  useEffect(() => {
    if (!lesson || lesson.lesson_type !== "video") return;

    let lastSavedTime = watchTime || progress?.watched_seconds || 0;

    const interval = setInterval(() => {
      const currentTime = watchTime || progress?.watched_seconds || 0;
      
      // Save if 30+ seconds progress
      if (currentTime - lastSavedTime >= 30) {
        updateProgressMutation.mutate({
          watched_seconds: currentTime,
        });
        lastSavedTime = currentTime;
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [lesson, watchTime, progress?.watched_seconds, updateProgressMutation]);

  const handleNextLesson = () => {
    if (nextLesson) {
      router.push(`/dashboard/courses/${courseId}/${nextLesson.id}`);
    }
  };

  const handlePreviousLesson = () => {
    if (previousLesson) {
      router.push(`/dashboard/courses/${courseId}/${previousLesson.id}`);
    }
  };

  if (isLoadingCourse || isLoadingLesson || isLoadingProgress) {
    return (
      <div>
        <div className="h-8 w-64 bg-gray-200 rounded mb-4 animate-pulse" />
        <div className="grid md:grid-cols-4 gap-6">
          <div className="md:col-span-3">
            <div className="h-96 bg-gray-200 rounded-lg animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-64 bg-gray-200 rounded-lg animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!course || !lesson) {
    return (
      <div className="text-center py-16">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Ders bulunamadı</h1>
        <p className="text-gray-600 mb-6">
          Bu ders silinmiş olabilir veya erişim yetkiniz olmayabilir.
        </p>
        <button
          onClick={() => router.push("/dashboard/courses")}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white px-5 py-2.5 rounded-lg font-medium transition-colors"
        >
          Kurslarıma Dön
        </button>
      </div>
    );
  }

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-6">
        <nav className="flex items-center gap-2 text-sm text-gray-600 mb-4">
          <Link href="/dashboard/courses" className="hover:text-teal-600">
            Kurslarım
          </Link>
          <span>/</span>
          <Link href={`/courses/${course.slug}`} className="hover:text-teal-600">
            {course.title}
          </Link>
          <span>/</span>
          <span className="text-gray-900">{lesson.title}</span>
        </nav>
        <h1 className="text-2xl font-bold text-gray-900">{lesson.title}</h1>
      </div>

      <div className="grid md:grid-cols-4 gap-6">
        {/* Main Content - Content Renderer */}
        <div className="md:col-span-3 space-y-6">
          {/* EPIC-10: Content Renderer (supports all lesson types) */}
          <ContentRenderer
            lesson={lesson}
            watchedSeconds={progress?.watched_seconds || 0}
            onProgress={handleProgress}
            onComplete={handleCompleteLesson}
          />

          {/* Lesson Info */}
          <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Ders Açıklaması</h2>
              {lesson.duration_seconds && (
                <span className="text-sm text-gray-600">
                  <svg
                    className="w-4 h-4 inline mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatDuration(lesson.duration_seconds)}
                </span>
              )}
            </div>
            {lesson.description ? (
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{lesson.description}</p>
            ) : (
              <p className="text-gray-500 italic">Bu ders için açıklama eklenmemiş.</p>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between gap-4">
            <button
              onClick={handlePreviousLesson}
              disabled={!previousLesson}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Önceki Ders
            </button>

            <button
              onClick={handleCompleteLesson}
              disabled={completed || updateProgressMutation.isPending}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-colors ${
                completed
                  ? "bg-green-100 text-green-700 cursor-not-allowed"
                  : "bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white disabled:bg-teal-400"
              }`}
            >
              {completed ? (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  Tamamlandı
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  {updateProgressMutation.isPending ? "Kaydediliyor..." : "Dersi Tamamla"}
                </>
              )}
            </button>

            <button
              onClick={handleNextLesson}
              disabled={!nextLesson}
              className="flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-700 rounded-lg font-medium transition-colors"
            >
              Sonraki Ders
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Sidebar - Course Lessons List & Duyurular */}
        <div className="md:col-span-1 space-y-4">
          <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm sticky top-24">
            <h3 className="font-semibold text-gray-900 mb-4">Kurs İçeriği</h3>
            <div className="space-y-2 max-h-[360px] overflow-y-auto">
              {sortedLessons.map((l, index) => {
                const isActive = l.id === lessonId;
                const isCompleted = lessonProgressMap.get(l.id) || (isActive ? completed : false);

                return (
                  <Link
                    key={l.id}
                    href={`/dashboard/courses/${courseId}/${l.id}`}
                    className={`block p-3 rounded-lg transition-colors ${
                      isActive
                        ? "bg-teal-50 border-2 border-teal-300 shadow-sm"
                        : isCompleted
                          ? "bg-emerald-50/50 border border-emerald-200 hover:bg-emerald-50"
                          : "hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {/* EPIC-10: Lesson Type Icon */}
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <div className="text-lg" title={l.lesson_type}>
                          {lessonTypeIcons[l.lesson_type as LessonType] || "📄"}
                        </div>
                        <div
                          className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
                            isActive
                              ? "bg-gradient-to-br from-teal-500 to-teal-600 text-white shadow-lg shadow-teal-500/30"
                              : isCompleted
                                ? "bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-md shadow-emerald-500/20"
                                : "bg-gray-200 text-gray-600"
                          }`}
                        >
                          {isCompleted ? (
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          ) : (
                            <span className="text-sm">{index + 1}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div
                          className={`text-sm font-medium line-clamp-2 ${
                            isActive ? "text-teal-600" : "text-gray-900"
                          }`}
                        >
                          {l.title}
                        </div>
                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                          {l.duration_seconds && (
                            <div className="text-xs text-gray-500">
                              ⏱ {formatDuration(l.duration_seconds)}
                            </div>
                          )}
                          {/* EPIC-10: File size for documents */}
                          {l.file_size_bytes && (l.lesson_type === "pdf" || l.lesson_type === "document" || l.lesson_type === "presentation") && (
                            <div className="text-xs text-gray-500">
                              📦 {formatFileSize(l.file_size_bytes)}
                            </div>
                          )}
                          {/* EPIC-10: Live lesson status */}
                          {l.lesson_type === "live_lesson" && l.live_lesson_at && (
                            <div className="text-xs">
                              {(() => {
                                const liveDate = new Date(l.live_lesson_at);
                                const now = new Date();
                                if (liveDate > now) {
                                  return <span className="text-purple-600">📅 {liveDate.toLocaleDateString("tr-TR")}</span>;
                                } else if (!l.is_live_lesson_ended) {
                                  return <span className="text-red-600 font-semibold animate-pulse">🔴 CANLI</span>;
                                } else {
                                  return <span className="text-gray-500">✓ Bitti</span>;
                                }
                              })()}
                            </div>
                          )}
                        </div>
                        {l.is_preview && (
                          <span className="inline-block mt-1 text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded">
                            Önizleme
                          </span>
                        )}
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Kurs Duyuruları & Canlı Dersler */}
            <div className="mt-6 pt-4 border-t border-gray-200">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                Duyurular & Canlı Dersler
              </h3>
              {courseNotifications.length === 0 ? (
                <p className="text-xs text-gray-500">
                  Henüz duyuru yok. Eğitmeniniz buradan canlı ders ve önemli gelişmeleri paylaşacak.
                </p>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {courseNotifications.map((n) => {
                    const isLive =
                      n.notification_type === "live_lesson_reminder" ||
                      n.notification_type === "live_lesson_starting" ||
                      n.notification_type === "live_lesson_cancelled";
                    const data = (n.data || {}) as any;
                    const liveAt = data.live_at as string | undefined;

                    return (
                      <div
                        key={n.id}
                        className={`p-2.5 rounded-lg border text-xs ${
                          isLive ? "bg-emerald-50 border-emerald-100" : "bg-gray-50 border-gray-100"
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="mt-0.5">
                            {isLive ? "📺" : "📢"}
                          </span>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-2 mb-0.5">
                              <p className="font-semibold text-gray-900 truncate">{n.title}</p>
                              {isLive && (
                                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-semibold">
                                  Canlı Ders
                                </span>
                              )}
                            </div>
                            <p className="text-gray-700 line-clamp-2">{n.message}</p>
                            {isLive && liveAt && (
                              <p className="mt-1 text-[11px] text-emerald-700 font-medium">
                                Tarih: {new Date(liveAt).toLocaleString("tr-TR")}
                              </p>
                            )}
                            {n.action_url && (
                              <Link
                                href={n.action_url}
                                className="mt-1 inline-flex items-center gap-1 text-[11px] font-semibold text-teal-600 hover:text-teal-700"
                              >
                                {n.action_label || (isLive ? "Detayları gör" : "Detaya git")}
                                <svg
                                  className="w-3 h-3"
                                  fill="none"
                                  viewBox="0 0 24 24"
                                  stroke="currentColor"
                                >
                                  <path
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    strokeWidth={2}
                                    d="M9 5l7 7-7 7"
                                  />
                                </svg>
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
