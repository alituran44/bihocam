"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { coursesApi, enrollmentsApi, courseReviewsApi, notificationsApi, categoriesApi, usersApi, ordersApi, bankAccountsApi, reportsApi, blogAdminApi, mockExamsApi, popcastsApi, socialApi, type Notification, type CourseStudent, type BankAccount } from "@/lib/api";

// Öğretmen Dashboard Component
function TeacherDashboard() {
  const queryClient = useQueryClient();
  const { data: myCourses, isLoading: coursesLoading } = useQuery({
    queryKey: ["my-courses"],
    queryFn: () => coursesApi.getMyCourses(0, 10),
  });

  const { data: recentReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["my-course-reviews"],
    queryFn: async () => {
      if (!myCourses?.length) return [];
      const reviews = await Promise.all(
        myCourses.slice(0, 5).map(async (course: any) => {
          // course.id beklenmedik şekilde undefined ise backend'e "undefined" UUID göndermemek için koruma
          if (!course?.id) {
            return null;
          }

          try {
            const courseReviews = await courseReviewsApi.list(course.id, 0, 1);
            return courseReviews.length > 0
              ? { ...courseReviews[0], course_title: course.title }
              : null;
          } catch {
            return null;
          }
        })
      );
      return reviews.filter((r) => r !== null).slice(0, 5);
    },
    enabled: !!myCourses?.length,
  });

  const totalCourses = myCourses?.length || 0;
  const activeCourses = myCourses?.filter((c: any) => c.status === "PUBLISHED").length || 0;
  const pendingCourses = myCourses?.filter((c: any) => c.status === "DRAFT").length || 0;
  const totalStudents = myCourses?.reduce((sum: number, course: any) => {
    return sum + (course.enrollments_count || 0);
  }, 0) || 0;

  const monthlyEarnings = 0;
  const totalEarnings = 1055.0;

  const avgRating = recentReviews?.length
    ? recentReviews.reduce((sum: number, r: any) => sum + (r.rating || 0), 0) / recentReviews.length
    : 0;

  const stats = [
    {
      label: "Toplam Kurs",
      value: totalCourses,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
    },
    {
      label: "Toplam Öğrenci",
      value: totalStudents,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Bu Ay Kazanç",
      value: `${monthlyEarnings.toFixed(2)} ₺`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "from-orange-500 to-orange-600",
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
    {
      label: "Toplam Kazanç",
      value: `${totalEarnings.toFixed(2)} ₺`,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-violet-500 to-violet-600",
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
  ];

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "dashboard-teacher-preview"],
    queryFn: () => notificationsApi.list({ skip: 0, limit: 5 }),
  });

  // Get upcoming live lessons for teacher's courses
  const teacherCourseIds = myCourses?.map((c: any) => c.id) || [];
  const { data: upcomingLiveLessons, isLoading: liveLessonsLoading } = useQuery({
    queryKey: ["upcoming-live-lessons-teacher", teacherCourseIds],
    queryFn: async () => {
      if (teacherCourseIds.length === 0) return [];
      const promises = teacherCourseIds.map((courseId: string) =>
        coursesApi.getLiveLessons(courseId, "upcoming").catch(() => [])
      );
      const results = await Promise.all(promises);
      const allLessons: any[] = [];
      results.forEach((lessons, index) => {
        const course = myCourses![index];
        lessons.forEach((lesson: any) => {
          allLessons.push({ ...lesson, course });
        });
      });
      return allLessons
        .filter((l) => l.live_lesson_at && new Date(l.live_lesson_at) > new Date())
        .sort((a, b) => new Date(a.live_lesson_at).getTime() - new Date(b.live_lesson_at).getTime())
        .slice(0, 3);
    },
    enabled: teacherCourseIds.length > 0 && !!myCourses,
  });

  // Öğrencilere Bildirim Gönder (kurs + öğrenci seçerek)
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [notifyType, setNotifyType] = useState<"announcement" | "live_lesson">("announcement");
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [liveLessonAt, setLiveLessonAt] = useState("");
  const [liveLessonUrl, setLiveLessonUrl] = useState("");

  const selectedCourse = myCourses?.find((c: any) => c.id === selectedCourseId);

  const { data: selectedCourseStudents, isLoading: studentsLoading } = useQuery<CourseStudent[]>({
    queryKey: ["course-students", selectedCourseId, "teacher-dashboard"],
    queryFn: () => coursesApi.getCourseStudents(selectedCourseId),
    enabled: !!selectedCourseId,
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedCourse || selectedStudentIds.length === 0 || !notifyMessage.trim()) return;

      const baseData: Record<string, any> = {
        course_id: selectedCourse.id,
        course_title: selectedCourse.title,
        course_slug: selectedCourse.slug,
      };
      if (notifyType === "live_lesson") {
        baseData.live_at = liveLessonAt || null;
        baseData.live_url = liveLessonUrl || null;
      }

      await notificationsApi.create({
        notification_type:
          notifyType === "live_lesson" ? "live_lesson_reminder" : "course_announcement",
        title:
          notifyTitle ||
          (notifyType === "live_lesson"
            ? `${selectedCourse.title} canlı ders duyurusu`
            : `${selectedCourse.title} hakkında duyuru`),
        message: notifyMessage,
        user_ids: selectedStudentIds,
        role: null,
        data: baseData,
        priority: "medium",
        delivery_channels: ["in_app"],
        action_url:
          notifyType === "live_lesson" && liveLessonUrl
            ? liveLessonUrl
            : `/dashboard/courses/${selectedCourse.id}`,
        action_label: notifyType === "live_lesson" ? "Canlı derse git" : "Kursa git",
      });
    },
    onSuccess: () => {
      setNotifyTitle("");
      setNotifyMessage("");
      setSelectedStudentIds([]);
      setLiveLessonAt("");
      setLiveLessonUrl("");
      setNotifyType("announcement");
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      alert("Öğrencilerine bildirim gönderildi.");
    },
  });

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  return (
    <div className="space-y-8">
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.textColor}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol: Son Kurslarım ve Bildirimler */}
        <div className="lg:col-span-2 space-y-6">
          {/* Yaklaşan Canlı Dersler */}
          {upcomingLiveLessons && upcomingLiveLessons.length > 0 && (
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 shadow-sm border border-teal-100">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">Yaklaşan Canlı Derslerim</h2>
                </div>
                <Link href="/dashboard/my-courses" className="text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
                  Tümünü Gör
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
              <div className="space-y-3">
                {upcomingLiveLessons.map((lesson: any) => {
                  const lessonDate = new Date(lesson.live_lesson_at);
                  const now = new Date();
                  const diffMs = lessonDate.getTime() - now.getTime();
                  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
                  const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
                  const isSoon = diffHours < 24;
                  
                  return (
                    <Link
                      key={lesson.id}
                      href={`/dashboard/my-courses/${lesson.course.id}?tab=live-lessons`}
                      className="block bg-white rounded-xl p-4 border border-teal-200 hover:border-teal-300 hover:shadow-md transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className="text-xs font-medium text-teal-600 bg-teal-100 px-2 py-1 rounded-full">
                              {lesson.course.title}
                            </span>
                            {isSoon && (
                              <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-1 rounded-full">
                                Yakında
                              </span>
                            )}
                          </div>
                          <h3 className="font-semibold text-gray-900 mb-1">{lesson.title}</h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {lessonDate.toLocaleDateString("tr-TR", {
                              day: "2-digit",
                              month: "long",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </p>
                          {diffHours > 0 ? (
                            <p className="text-xs text-gray-500">
                              {diffHours} saat {diffMinutes} dakika sonra
                            </p>
                          ) : diffMinutes > 0 ? (
                            <p className="text-xs text-orange-600 font-medium">
                              {diffMinutes} dakika sonra başlıyor!
                            </p>
                          ) : (
                            <p className="text-xs text-emerald-600 font-medium">Şimdi başlıyor!</p>
                          )}
                        </div>
                        <svg className="w-5 h-5 text-teal-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Son Kurslarım</h2>
              <Link href="/dashboard/my-courses" className="text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
                Tümünü Gör
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {coursesLoading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !myCourses?.length ? (
              <div className="text-center py-12 bg-gray-50 rounded-xl">
                <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                </div>
                <p className="text-gray-600 mb-4">Henüz kurs eklenmemiş</p>
                <Link href="/dashboard/my-courses/new" className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  İlk Kursunu Oluştur
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {myCourses.slice(0, 5).map((course: any) => (
                  <Link
                    key={course.id}
                    href={`/dashboard/my-courses/${course.id}`}
                    className="flex items-center justify-between p-4 bg-gray-50 hover:bg-teal-50 rounded-xl transition-all group border border-transparent hover:border-teal-200"
                  >
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <div className="w-14 h-14 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center shrink-0 overflow-hidden">
                        {course.thumbnail_path ? (
                          <img src={course.thumbnail_path} alt={course.title} className="w-14 h-14 object-cover" />
                        ) : (
                          <svg className="w-7 h-7 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                          {course.title}
                        </div>
                        <div className="flex items-center gap-3 mt-1.5">
                          <span
                            className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                              course.status === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-700"
                                : course.status === "DRAFT"
                                ? "bg-amber-100 text-amber-700"
                                : "bg-gray-100 text-gray-700"
                            }`}
                          >
                            {course.status === "PUBLISHED" ? "Yayında" : course.status === "DRAFT" ? "Taslak" : "Arşivli"}
                          </span>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                            </svg>
                            {course.enrollments_count || 0} öğrenci
                          </span>
                        </div>
                      </div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-600 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Son Bildirimler */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Son Bildirimler</h2>
              <Link
                href="/dashboard/notifications"
                className="text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
              >
                Tümünü Gör
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {!notifications ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : notifications.notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl">
                Henüz bildirim yok.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.notifications.slice(0, 5).map((n: Notification) => {
                  const data = (n.data || {}) as any;
                  const liveAtText =
                    data?.live_at &&
                    new Date(data.live_at).toLocaleString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                  return (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-sm ${
                        n.is_read ? "bg-gray-50 border-gray-100" : "bg-teal-50 border-teal-100"
                      }`}
                    >
                      <div className="flex items-start gap-2">
                        <div className="mt-1 w-1.5 h-1.5 rounded-full bg-teal-500" />
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900 truncate">{n.title}</div>
                          <div className="text-xs text-gray-600 line-clamp-2">{n.message}</div>

                          {(data?.course_title || liveAtText || n.action_url) && (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                              {data?.course_title && (
                                <span className="inline-flex items-center gap-1 truncate max-w-full">
                                  <svg
                                    className="w-3 h-3 text-teal-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                  </svg>
                                  <span className="truncate">
                                    {data.course_title}
                                  </span>
                                </span>
                              )}

                              {liveAtText && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-100">
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
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span>{liveAtText}</span>
                                </span>
                              )}

                              {n.action_url && (
                                <Link
                                  href={n.action_url}
                                  className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-semibold"
                                >
                                  {n.notification_type === "live_lesson_reminder"
                                    ? "Canlı derse git"
                                    : "Kursa git"}
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
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Kazanç Trend */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Son 6 Ay Kazanç Trend</h2>
            <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <p className="text-sm text-gray-500">Grafik yakında eklenecek</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sağ: Hızlı İşlemler ve Yorumlar */}
        <div className="space-y-6">
          {/* Hızlı İşlemler */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
            <div className="space-y-2">
              {[
                { href: "/dashboard/my-courses/new", label: "Yeni Kurs Ekle", icon: "M12 4v16m8-8H4" },
                { href: "/dashboard/my-courses", label: "Kursları Düzenle", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
                { href: "/dashboard/settings", label: "Profil Ayarları", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 hover:bg-teal-50 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-teal-100 rounded-lg flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-teal-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors">{item.label}</span>
                </Link>
              ))}

              {/* Bildirim Gönder - Modal Açan Hızlı İşlem */}
              <button
                type="button"
                onClick={() => setShowNotifyModal(true)}
                className="w-full flex items-center gap-3 p-3 hover:bg-emerald-50 rounded-xl transition-colors group text-left"
              >
                <div className="w-10 h-10 bg-emerald-50 group-hover:bg-emerald-100 rounded-lg flex items-center justify-center transition-colors">
                  <svg className="w-5 h-5 text-emerald-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </div>
                <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-700 transition-colors">
                  Öğrencilerine Bildirim Gönder
                </span>
              </button>
            </div>
          </div>

          {/* Son Yorumlar */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Son Yorumlar</h2>
            {reviewsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !recentReviews?.length ? (
              <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl">
                <p>Henüz yorum yok</p>
              </div>
            ) : (
              <div className="space-y-4">
                {recentReviews.slice(0, 5).map((review: any, index: number) => (
                  <div key={index} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                        {review.user?.full_name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {review.user?.full_name || "Anonim"}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3.5 h-3.5 ${i < review.rating ? "text-amber-400 fill-current" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-gray-500 mb-1 truncate">{review.course_title || "Kurs"}</div>
                        <p className="text-sm text-gray-600 line-clamp-2">{review.comment || review.title || "Yorum yok"}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Kurs İstatistikleri */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Kurs Özeti</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <span className="text-sm font-medium text-emerald-700">Aktif Kurslar</span>
                <span className="text-xl font-bold text-emerald-700">{activeCourses}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <span className="text-sm font-medium text-amber-700">Bekleyen Kurslar</span>
                <span className="text-xl font-bold text-amber-700">{pendingCourses}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-violet-50 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-violet-700">Ortalama Puan</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold text-violet-700">{avgRating.toFixed(1)}</span>
                  <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bildirim Gönder Modal */}
      {showNotifyModal && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-xl mx-4 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
              <div>
                <h2 className="text-base font-semibold text-gray-900">Öğrencilerine Bildirim Gönder</h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Bir kurs seç, öğrencileri işaretle ve duyuru / canlı ders bildirimi gönder.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowNotifyModal(false)}
                className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              >
                <span className="sr-only">Kapat</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="px-5 py-4 overflow-y-auto">
              {!myCourses?.length ? (
                <p className="text-sm text-gray-500">
                  Bildirim göndermek için önce en az bir kurs oluşturmalısın.
                </p>
              ) : (
                <div className="space-y-4 text-xs">
                  <div className="space-y-1">
                    <label className="font-semibold text-gray-800 text-xs">Kurs Seç</label>
                    <select
                      value={selectedCourseId}
                      onChange={(e) => {
                        setSelectedCourseId(e.target.value);
                        setSelectedStudentIds([]);
                      }}
                      className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                    >
                      <option value="">Bir kurs seçin...</option>
                      {myCourses.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.title}
                        </option>
                      ))}
                    </select>
                  </div>

                  {selectedCourseId && (
                    <>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-semibold text-gray-800 text-xs">Öğrenciler</span>
                          <span className="text-[11px] text-gray-500">
                            Seçili: {selectedStudentIds.length} / {selectedCourseStudents?.length || 0}
                          </span>
                        </div>
                        <div className="max-h-32 overflow-y-auto border border-gray-100 rounded-lg bg-gray-50/60 p-2 space-y-1">
                          {studentsLoading && (
                            <p className="text-[11px] text-gray-500">Öğrenciler yükleniyor...</p>
                          )}
                          {!studentsLoading &&
                            (!selectedCourseStudents || selectedCourseStudents.length === 0) && (
                              <p className="text-[11px] text-gray-500">
                                Bu kursa kayıtlı öğrenci yok.
                              </p>
                            )}
                          {selectedCourseStudents?.map((s) => (
                            <label
                              key={s.id}
                              className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white cursor-pointer"
                            >
                              <input
                                type="checkbox"
                                checked={selectedStudentIds.includes(s.id)}
                                onChange={() => toggleStudentSelection(s.id)}
                                className="w-3.5 h-3.5 text-teal-600 border-teal-300 rounded"
                              />
                              <span className="font-medium text-gray-800 truncate">{s.full_name}</span>
                              <span className="text-[10px] text-gray-500 truncate">{s.email}</span>
                            </label>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-[11px] font-semibold text-teal-800">
                          <button
                            type="button"
                            onClick={() => setNotifyType("announcement")}
                            className={`px-2.5 py-1 rounded-full border ${
                              notifyType === "announcement"
                                ? "bg-teal-50 border-teal-400 text-teal-700"
                                : "bg-teal-50/40 border-transparent text-teal-600"
                            }`}
                          >
                            Duyuru
                          </button>
                          <button
                            type="button"
                            onClick={() => setNotifyType("live_lesson")}
                            className={`px-2.5 py-1 rounded-full border ${
                              notifyType === "live_lesson"
                                ? "bg-emerald-50 border-emerald-400 text-emerald-700"
                                : "bg-emerald-50/40 border-transparent text-emerald-600"
                            }`}
                          >
                            Canlı Ders
                          </button>
                        </div>
                        <input
                          type="text"
                          value={notifyTitle}
                          onChange={(e) => setNotifyTitle(e.target.value)}
                          placeholder={
                            notifyType === "live_lesson"
                              ? "Canlı ders başlığı (ör: Matematik canlı ders - Perşembe 20:00)"
                              : "Bildirim başlığı"
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                        <textarea
                          rows={3}
                          value={notifyMessage}
                          onChange={(e) => setNotifyMessage(e.target.value)}
                          placeholder={
                            notifyType === "live_lesson"
                              ? "Canlı ders detayı (tarih, saat, platform bilgisi vb.)"
                              : "Kısa bir mesaj yaz (ör: yeni ders yüklendi, ödev hatırlatması vb.)"
                          }
                          className="w-full px-3 py-2 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 resize-none"
                        />

                        {notifyType === "live_lesson" && (
                          <div className="grid grid-cols-1 gap-2 text-[11px] text-gray-700">
                            <div className="space-y-1">
                              <label className="font-semibold text-teal-800">
                                Canlı Ders Tarih/Saat
                              </label>
                              <input
                                type="datetime-local"
                                value={liveLessonAt}
                                onChange={(e) => setLiveLessonAt(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="font-semibold text-teal-800">
                                Canlı Ders Linki (Zoom/Meet vb.)
                              </label>
                              <input
                                type="url"
                                value={liveLessonUrl}
                                onChange={(e) => setLiveLessonUrl(e.target.value)}
                                placeholder="https://..."
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowNotifyModal(false)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-100"
              >
                İptal
              </button>
              <button
                onClick={() => sendNotificationMutation.mutate()}
                disabled={
                  sendNotificationMutation.isPending ||
                  !selectedCourse ||
                  selectedStudentIds.length === 0 ||
                  !notifyMessage.trim()
                }
                className="px-4 py-1.5 text-xs font-semibold rounded-lg bg-gradient-to-r from-teal-500 to-teal-600 text-white disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {sendNotificationMutation.isPending ? "Gönderiliyor..." : "Bildirim Gönder"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Öğrenci Dashboard Component
function StudentDashboard() {
  const queryClient = useQueryClient();
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
    }
  });

  const unfollowMutation = useMutation({
    mutationFn: (userId: string) => socialApi.unfollowUser(userId),
    onSuccess: () => {
      refetchFollowing();
      queryClient.invalidateQueries({ queryKey: ["student-following"] });
    }
  });

  // Calendar strip state
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());

  // Audio player state and hooks
  const [activePopcast, setActivePopcast] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioElRef = useState(() => {
    if (typeof window !== "undefined") return new Audio();
    return null;
  })[0];

  useEffect(() => {
    if (!audioElRef) return;
    const handleTimeUpdate = () => {
      setAudioProgress((audioElRef.currentTime / audioElRef.duration) * 100 || 0);
    };
    const handleLoadedMetadata = () => {
      setAudioDuration(audioElRef.duration);
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
    };
    audioElRef.addEventListener("timeupdate", handleTimeUpdate);
    audioElRef.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioElRef.addEventListener("ended", handleEnded);

    return () => {
      audioElRef.pause();
      audioElRef.removeEventListener("timeupdate", handleTimeUpdate);
      audioElRef.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audioElRef.removeEventListener("ended", handleEnded);
    };
  }, [audioElRef]);

  const handlePlayPause = (popcast: any) => {
    if (!audioElRef) return;
    if (activePopcast?.id === popcast.id) {
      if (isPlaying) {
        audioElRef.pause();
        setIsPlaying(false);
      } else {
        audioElRef.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      audioElRef.pause();
      audioElRef.src = popcast.audio_url;
      setActivePopcast(popcast);
      audioElRef.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const enrolledCount = enrollments?.length || 0;
  const completedCount = enrollments?.filter((e: any) => e.progress_percentage === 100).length || 0;
  const inProgressCount = enrollments?.filter((e: any) => e.progress_percentage > 0 && e.progress_percentage < 100).length || 0;
  const totalWatchTime = 0;

  const continueLearning = enrollments?.filter(
    (e: any) => e.progress_percentage > 0 && e.progress_percentage < 100
  ) || [];

  const recentlyCompleted = enrollments?.filter((e: any) => e.progress_percentage === 100).slice(0, 3) || [];

  const stats = [
    {
      label: "Kayıtlı Kurs",
      value: enrolledCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
    },
    {
      label: "Tamamlanan",
      value: completedCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
    },
    {
      label: "Toplam İzleme",
      value: totalWatchTime > 0 ? `${Math.round(totalWatchTime / 3600)} saat` : "0 saat",
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      bgColor: "bg-violet-50",
      textColor: "text-violet-600",
    },
    {
      label: "Sertifika",
      value: completedCount,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      bgColor: "bg-orange-50",
      textColor: "text-orange-600",
    },
  ];

  const { data: notifications } = useQuery({
    queryKey: ["notifications", "dashboard-student-preview"],
    queryFn: () => notificationsApi.list({ skip: 0, limit: 5 }),
  });

  // Get upcoming live lessons
  const courseIds = enrollments?.map((e: any) => e.course.id) || [];
  const { data: upcomingLiveLessons, isLoading: liveLessonsLoading } = useQuery({
    queryKey: ["upcoming-live-lessons", courseIds],
    queryFn: async () => {
      if (courseIds.length === 0) return [];
      const promises = courseIds.map((courseId: string) =>
        coursesApi.getLiveLessons(courseId, "upcoming").catch(() => [])
      );
      const results = await Promise.all(promises);
      const allLessons: any[] = [];
      results.forEach((lessons, index) => {
        const course = enrollments![index].course;
        lessons.forEach((lesson: any) => {
          allLessons.push({ ...lesson, course });
        });
      });
      return allLessons
        .filter((l) => l.live_lesson_at && new Date(l.live_lesson_at) > new Date())
        .sort((a, b) => new Date(a.live_lesson_at).getTime() - new Date(b.live_lesson_at).getTime())
        .slice(0, 3);
    },
    enabled: courseIds.length > 0 && !!enrollments,
  });

  const getWeekDays = () => {
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
  };
  const weekDays = getWeekDays();

  const selectedDayLessons = upcomingLiveLessons?.filter((lesson: any) => {
    if (!lesson.live_lesson_at) return false;
    const d = new Date(lesson.live_lesson_at);
    return d.toDateString() === selectedDate.toDateString();
  }) || [];

  const selectedDayExams = mockExams?.filter((exam: any) => {
    if (!exam.start_date) return false;
    const d = new Date(exam.start_date);
    return d.toDateString() === selectedDate.toDateString();
  }) || [];

  const selectedDayEvents = [
    ...selectedDayLessons.map(l => ({ type: "live_class", time: new Date(l.live_lesson_at), data: l })),
    ...selectedDayExams.map(e => ({ type: "mock_exam", time: new Date(e.start_date), data: e }))
  ].sort((a, b) => a.time.getTime() - b.time.getTime());

  return (
    <div className="space-y-8">
      {/* Eğitmen Popcast Hikayeleri */}
      {popcasts && popcasts.length > 0 && (
        <div className="bg-white/80 backdrop-blur-xl rounded-[2rem] p-6 border border-gray-150 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <span className="flex h-2.5 w-2.5 rounded-full bg-pink-500 animate-pulse"></span>
              Eğitmen Paylaşımları & Popcast
            </h3>
            <span className="text-xs text-gray-500 font-semibold">{popcasts.length} aktif sesli hikaye</span>
          </div>

          <div className="flex items-center gap-6 overflow-x-auto pb-2 scrollbar-hide">
            {popcasts.map((popcast) => {
              const teacherName = popcast.teacher?.full_name || "Eğitmen";
              const isPlayingThis = activePopcast?.id === popcast.id && isPlaying;

              return (
                <div
                  key={popcast.id}
                  onClick={() => handlePlayPause(popcast)}
                  className="flex flex-col items-center gap-1.5 cursor-pointer shrink-0 group select-none"
                >
                  <div className="relative">
                    <div className={`absolute -inset-1 rounded-full bg-gradient-to-tr from-pink-500 via-purple-500 to-indigo-500 transition-all ${
                      isPlayingThis ? "animate-spin" : "group-hover:scale-105"
                    }`}></div>
                    
                    <div className="relative w-16 h-16 rounded-full bg-white p-0.5 overflow-hidden">
                      {popcast.teacher?.avatar_url ? (
                        <img
                          src={popcast.teacher.avatar_url}
                          alt={teacherName}
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-50 to-indigo-100 flex items-center justify-center text-indigo-600 font-black text-lg">
                          {teacherName.slice(0, 1).toUpperCase()}
                        </div>
                      )}
                    </div>

                    <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow border-2 border-white">
                      {isPlayingThis ? (
                        <svg className="w-3 h-3 fill-white" viewBox="0 0 24 24">
                          <rect x="4" y="4" width="4" height="16" />
                          <rect x="16" y="4" width="4" height="16" />
                        </svg>
                      ) : (
                        <svg className="w-3 h-3 fill-white ml-0.5" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </div>
                  </div>

                  <span className="text-xs font-bold text-gray-700 max-w-[85px] truncate text-center group-hover:text-indigo-600 transition-colors">
                    {teacherName}
                  </span>
                  <span className="text-[10px] text-gray-400 font-semibold max-w-[85px] truncate text-center">
                    {popcast.title}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4">
              <div className={`w-14 h-14 ${stat.bgColor} rounded-xl flex items-center justify-center ${stat.textColor}`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sol: Devam Et ve Program */}
        <div className="lg:col-span-2 space-y-6">
          {/* Haftalık Ders & Sınav Takvimi */}
          <div className="bg-white rounded-[2rem] p-6 border border-gray-150 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-lg font-extrabold text-gray-900 tracking-tight">Haftalık Program</h2>
                  <p className="text-xs text-gray-500 font-semibold">Derslerinizi ve sınavlarınızı gün gün takip edin</p>
                </div>
              </div>
              
              <Link href="/dashboard/live-lessons" className="text-xs text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1">
                Tüm Programı Gör
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>

            {/* Weekly Days Strip */}
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
                        ? "bg-gradient-to-br from-indigo-600 to-indigo-700 text-white shadow-lg shadow-indigo-600/25 scale-105"
                        : "bg-gray-50 text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <span className={`text-[10px] uppercase font-bold tracking-wider ${
                      isSelected ? "text-indigo-100" : "text-gray-400"
                    }`}>
                      {dayName}
                    </span>
                    <span className="text-base font-extrabold mt-1">
                      {dayNum}
                    </span>
                    {isToday && !isSelected && (
                      <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full mt-1.5"></span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Daily Events List */}
            <div className="space-y-3 pt-2">
              {selectedDayEvents.length === 0 ? (
                <div className="text-center py-10 bg-slate-50 border border-dashed border-slate-150 rounded-2xl flex flex-col items-center justify-center space-y-2">
                  <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-400">
                    ☕
                  </div>
                  <div className="text-xs font-bold text-gray-800">
                    Planlanmış ders veya sınav bulunmuyor
                  </div>
                  <div className="text-[10px] text-gray-400 font-semibold">
                    Dinlenmek veya geçmiş konuları tekrar etmek için harika bir gün!
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
                        className="bg-teal-50/40 border border-teal-100/60 rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-all animate-fadeIn"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center text-teal-600 text-sm font-bold shrink-0">
                            {timeStr}
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold text-teal-600 tracking-wider bg-teal-100/60 px-2 py-0.5 rounded-full uppercase">
                              Canlı Ders
                            </span>
                            <h4 className="font-bold text-gray-900 text-sm mt-1">{lesson.title}</h4>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5">{lesson.course.title}</p>
                          </div>
                        </div>

                        <Link
                          href={lesson.live_lesson_url || `/dashboard/courses/${lesson.course.id}`}
                          className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-sm hover:shadow transition-all shrink-0"
                        >
                          Katıl
                        </Link>
                      </div>
                    );
                  } else {
                    const exam = event.data;
                    return (
                      <div
                        key={`exam-${exam.id}-${idx}`}
                        className="bg-purple-50/40 border border-purple-100/60 rounded-2xl p-4 flex items-center justify-between hover:shadow-sm transition-all animate-fadeIn"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600 text-sm font-bold shrink-0">
                            {timeStr}
                          </div>
                          <div>
                            <span className="text-[10px] font-extrabold text-purple-600 tracking-wider bg-purple-100/60 px-2 py-0.5 rounded-full uppercase">
                              Deneme Sınavı ({exam.exam_type})
                            </span>
                            <h4 className="font-bold text-gray-900 text-sm mt-1">{exam.title}</h4>
                            <p className="text-xs text-gray-500 font-semibold mt-0.5">Süre: {exam.duration_minutes} dk | {exam.number_of_options} Şık</p>
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

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Devam Et</h2>
              <Link href="/dashboard/courses" className="text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1">
                Tümünü Gör
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {enrollmentsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : continueLearning.length === 0 ? (
              <div className="text-center py-12 bg-gradient-to-br from-gray-50 to-teal-50/30 rounded-xl">
                <div className="w-20 h-20 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {enrolledCount === 0 ? "Henüz kurs kaydın yok" : "Devam eden kursun yok"}
                </h3>
                <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                  {enrolledCount === 0
                    ? "Kursları keşfet ve öğrenmeye başla!"
                    : "Kayıtlı kurslarına devam edebilir veya yeni kurslar keşfedebilirsin."}
                </p>
                <Link
                  href={enrolledCount === 0 ? "/courses" : "/dashboard/courses"}
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                  {enrolledCount === 0 ? "Kursları Keşfet" : "Kurslarıma Git"}
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {continueLearning.slice(0, 4).map((enrollment: any) => (
                  <Link
                    key={enrollment.id}
                    href={`/dashboard/courses/${enrollment.course.id}`}
                    className="bg-gray-50 hover:bg-teal-50 border border-gray-100 hover:border-teal-200 rounded-xl p-4 transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      {enrollment.course.thumbnail_path ? (
                        <img
                          src={enrollment.course.thumbnail_path}
                          alt={enrollment.course.title}
                          className="w-16 h-16 object-cover rounded-xl flex-shrink-0"
                        />
                      ) : (
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex items-center justify-center flex-shrink-0">
                          <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                          </svg>
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                          {enrollment.course.title}
                        </h3>
                        <div className="mb-2">
                          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                            <div
                              className="h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full transition-all"
                              style={{ width: `${enrollment.progress_percentage}%` }}
                            />
                          </div>
                          <div className="text-xs text-gray-500 mt-1">%{enrollment.progress_percentage} tamamlandı</div>
                        </div>
                        <div className="text-sm text-teal-600 font-semibold flex items-center gap-1">
                          Devam et
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Son Bildirimler */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Son Bildirimler</h2>
              <Link
                href="/dashboard/notifications"
                className="text-sm text-teal-600 hover:text-teal-700 font-semibold flex items-center gap-1"
              >
                Tümünü Gör
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {!notifications ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : notifications.notifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500 text-sm bg-gray-50 rounded-xl">
                Henüz bildirim yok.
              </div>
            ) : (
              <div className="space-y-3">
                {notifications.notifications.slice(0, 5).map((n: Notification) => {
                  const data = (n.data || {}) as any;
                  const liveAtText =
                    data?.live_at &&
                    new Date(data.live_at).toLocaleString("tr-TR", {
                      day: "2-digit",
                      month: "2-digit",
                      hour: "2-digit",
                      minute: "2-digit",
                    });

                  const courseUrl =
                    n.action_url ||
                    (data?.course_id
                      ? `/dashboard/courses/${data.course_id}`
                      : data?.course_slug
                      ? `/courses/${data.course_slug}`
                      : null);

                  const isLive = n.notification_type === "live_lesson_reminder";

                  return (
                    <div
                      key={n.id}
                      className={`p-3 rounded-xl border text-sm transition-all ${
                        n.is_read
                          ? "bg-gray-50 border-gray-100 hover:border-teal-100"
                          : "bg-teal-50/70 border-teal-100 hover:bg-teal-50"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`mt-0.5 w-8 h-8 rounded-full flex items-center justify-center ${
                            isLive ? "bg-emerald-100 text-emerald-700" : "bg-teal-100 text-teal-700"
                          }`}
                        >
                          {isLive ? (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 8h8a2 2 0 012 2v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4a2 2 0 012-2z"
                              />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                              />
                            </svg>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <div className="font-semibold text-gray-900 truncate">{n.title}</div>
                            {!n.is_read && (
                              <span className="inline-flex items-center rounded-full bg-teal-100 px-2 py-0.5 text-[10px] font-semibold text-teal-700">
                                Yeni
                              </span>
                            )}
                          </div>
                          <div className="text-xs text-gray-600 line-clamp-2">{n.message}</div>

                          {(data?.course_title || liveAtText || courseUrl) && (
                            <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-gray-500">
                              {data?.course_title && (
                                <span className="inline-flex items-center gap-1 truncate max-w-full">
                                  <svg
                                    className="w-3 h-3 text-teal-500"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                  >
                                    <path
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                      strokeWidth={2}
                                      d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                                    />
                                  </svg>
                                  <span className="truncate">
                                    Kurs: {data.course_title}
                                  </span>
                                </span>
                              )}

                              {liveAtText && (
                                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700 border border-emerald-100">
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
                                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                                    />
                                  </svg>
                                  <span>{liveAtText}</span>
                                </span>
                              )}

                              {courseUrl && (
                                <Link
                                  href={courseUrl}
                                  className="inline-flex items-center gap-1 text-teal-600 hover:text-teal-700 font-semibold"
                                >
                                  {isLive ? "Canlı derse git" : "Kursa git"}
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
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Son Tamamlanan Kurslar */}
          {recentlyCompleted.length > 0 && (
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Son Tamamlanan Kurslar</h2>
              <div className="space-y-3">
                {recentlyCompleted.map((enrollment: any) => (
                  <Link
                    key={enrollment.id}
                    href={`/courses/${enrollment.course.slug}`}
                    className="flex items-center gap-4 p-4 bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 rounded-xl transition-colors group"
                  >
                    <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-gray-900 truncate group-hover:text-emerald-700 transition-colors">
                        {enrollment.course.title}
                      </div>
                      <div className="text-sm text-emerald-600 font-medium">Tamamlandı ✓</div>
                    </div>
                    <svg className="w-5 h-5 text-gray-400 group-hover:text-emerald-600 shrink-0 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sağ: Hızlı İşlemler */}
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Hızlı İşlemler</h2>
            <div className="space-y-2">
              {[
                { href: "/courses", label: "Kursları Keşfet", icon: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" },
                { href: "/dashboard/courses", label: "Kurslarım", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
                { href: "/dashboard/orders", label: "Siparişlerim", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
                { href: "/dashboard/settings", label: "Ayarlar", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="flex items-center gap-3 p-3 hover:bg-teal-50 rounded-xl transition-colors group">
                  <div className="w-10 h-10 bg-gray-100 group-hover:bg-teal-100 rounded-lg flex items-center justify-center transition-colors">
                    <svg className="w-5 h-5 text-gray-500 group-hover:text-teal-600 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-teal-600 transition-colors">{item.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* İstatistikler */}
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">İstatistikler</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-amber-50 rounded-xl">
                <span className="text-sm font-medium text-amber-700">Devam Ediyor</span>
                <span className="text-xl font-bold text-amber-700">{inProgressCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-emerald-50 rounded-xl">
                <span className="text-sm font-medium text-emerald-700">Tamamlanan</span>
                <span className="text-xl font-bold text-emerald-700">{completedCount}</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-teal-50 rounded-xl">
                <span className="text-sm font-medium text-teal-700">Toplam Kurs</span>
                <span className="text-xl font-bold text-teal-700">{enrolledCount}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Popcast Audio Player Modal */}
      {activePopcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fadeIn">
          <div className="bg-white rounded-[2.5rem] border border-gray-100 shadow-2xl overflow-hidden max-w-md w-full animate-scaleUp">
            <div className="relative aspect-video bg-gradient-to-br from-indigo-900 via-slate-800 to-indigo-950 overflow-hidden flex flex-col justify-between p-6">
              {activePopcast.cover_image_url && (
                <img
                  src={activePopcast.cover_image_url}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay"
                />
              )}
              <div className="flex items-center justify-between z-10">
                <span className="text-xs font-bold bg-white/20 text-white backdrop-blur px-3 py-1 rounded-full">
                  Popcast Dinle
                </span>
                <button
                  onClick={() => {
                    if (audioElRef) audioElRef.pause();
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
                <h4 className="text-xl font-extrabold tracking-tight">
                  {activePopcast.title}
                </h4>
              </div>
            </div>
            <div className="p-6 space-y-6 bg-white">
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-150">
                    {activePopcast.teacher?.avatar_url ? (
                      <img src={activePopcast.teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-lg">
                        {activePopcast.teacher?.full_name?.slice(0,1).toUpperCase() || "E"}
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
                    {Math.floor((audioElRef?.currentTime || 0) / 60)}:
                    {String(Math.floor((audioElRef?.currentTime || 0) % 60)).padStart(2, "0")}
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
                    if (audioElRef) audioElRef.pause();
                    setIsPlaying(false);
                    setActivePopcast(null);
                  }}
                  className="w-12 h-12 rounded-full border border-gray-200 text-gray-600 flex items-center justify-center hover:bg-gray-50 hover:text-indigo-600 transition-colors shadow-sm"
                  title="Mesaj Gönder"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
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

// Admin Dashboard Component
function AdminDashboard() {
  const { data: pendingCourses, isLoading: pendingLoading } = useQuery({
    queryKey: ["admin-pending-courses"],
    queryFn: () => coursesApi.listPendingCourses(0, 10),
  });

  // Tüm yorumları çek
  const { data: allReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ["admin-all-reviews"],
    queryFn: () => courseReviewsApi.listAll(0, 10),
  });

  // Tüm bildirimleri çek
  const { data: allNotifications, isLoading: notificationsLoading } = useQuery({
    queryKey: ["admin-all-notifications"],
    queryFn: () => notificationsApi.listAll(0, 10),
  });

  // Bekleyen banka hesabı taleplerini çek
  const { data: pendingBankAccounts, isLoading: bankAccountsLoading } = useQuery({
    queryKey: ["admin-pending-bank-accounts"],
    queryFn: () => bankAccountsApi.listAll({ status: "pending" }),
  });

  // Onay bekleyen blog yazılarını çek
  const { data: pendingBlogPosts, isLoading: blogPostsLoading } = useQuery({
    queryKey: ["admin-pending-blog-posts"],
    queryFn: () => blogAdminApi.listPendingPosts({ limit: 10 }),
  });

  // Kategorileri çek
  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  // Kullanıcıları çek
  const { data: users } = useQuery({
    queryKey: ["users"],
    queryFn: () => usersApi.list({ skip: 0, limit: 1 }),
  });

  // Kursları çek
  const { data: allCourses } = useQuery({
    queryKey: ["all-courses"],
    queryFn: () => coursesApi.list(0, 1),
  });

  // Overview stats API'den çek
  const { data: overviewStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-overview-stats"],
    queryFn: () => reportsApi.getOverview(),
    refetchInterval: 5 * 60 * 1000, // 5 dakikada bir otomatik yenileme
  });

  const pendingCount = pendingCourses?.length || 0;
  const totalCategories = categories?.length || 0;
  const totalCourses = overviewStats?.total_courses || allCourses?.length || 0;
  const totalUsers = (overviewStats?.active_students || 0) + (overviewStats?.active_teachers || 0) || users?.total || 0;
  const pendingBankAccountsCount = pendingBankAccounts?.length || 0;
  const pendingBlogPostsCount = pendingBlogPosts?.length || 0;
  const totalRevenue = overviewStats?.total_revenue || 0;
  const last30DaysRevenue = overviewStats?.last_30_days_revenue || 0;
  const revenueChange = overviewStats?.last_30_days_revenue_change || null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const stats = [
    {
      label: "Toplam Ciro",
      value: statsLoading ? "..." : formatCurrency(totalRevenue),
      change: null,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: "from-emerald-500 to-emerald-600",
      bgColor: "bg-emerald-50",
      textColor: "text-emerald-600",
      href: "/dashboard/admin/analytics",
    },
    {
      label: "Bu Ay Ciro",
      value: statsLoading ? "..." : formatCurrency(last30DaysRevenue),
      change: revenueChange,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
      color: "from-teal-500 to-teal-600",
      bgColor: "bg-teal-50",
      textColor: "text-teal-600",
      href: "/dashboard/admin/analytics",
    },
    {
      label: "Aktif Öğrenci",
      value: statsLoading ? "..." : overviewStats?.active_students || 0,
      change: null,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: "from-blue-500 to-blue-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      href: "/dashboard/admin/students",
    },
    {
      label: "Aktif Eğitmen",
      value: statsLoading ? "..." : overviewStats?.active_teachers || 0,
      change: null,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      color: "from-purple-500 to-purple-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      href: "/dashboard/admin/teachers",
    },
    {
      label: "Toplam Kurs",
      value: statsLoading ? "..." : totalCourses,
      change: null,
      icon: (
        <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      ),
      color: "from-amber-500 to-amber-600",
      bgColor: "bg-amber-50",
      textColor: "text-amber-600",
      href: "/dashboard/admin/courses/pending",
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-10">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Admin Kontrol Paneli</h1>
              <p className="text-teal-100 text-lg">Platform yönetimi ve istatistikler</p>
            </div>
            <div className="hidden md:flex items-center gap-4">
              <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30">
                <div className="text-white/80 text-sm font-medium mb-1">Toplam Ciro</div>
                <div className="text-2xl font-bold text-white">
                  {statsLoading ? "..." : formatCurrency(totalRevenue)}
                </div>
              </div>
              <div className="bg-white/20 backdrop-blur-md rounded-2xl px-6 py-4 border border-white/30">
                <div className="text-white/80 text-sm font-medium mb-1">Bu Ay Ciro</div>
                <div className="text-2xl font-bold text-white">
                  {statsLoading ? "..." : formatCurrency(last30DaysRevenue)}
                </div>
                {revenueChange !== null && (
                  <div className={`text-xs font-semibold mt-1 ${
                    revenueChange > 0 ? "text-emerald-200" : revenueChange < 0 ? "text-rose-200" : "text-white/60"
                  }`}>
                    {revenueChange > 0 ? "+" : ""}{revenueChange.toFixed(1)}%
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        {stats.map((stat, idx) => {
          if (stat.href) {
            return (
              <Link
                key={idx}
                href={stat.href}
                className="relative group overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50 hover:shadow-2xl hover:scale-[1.02] transition-all duration-300 cursor-pointer"
                style={{
                  animationDelay: `${idx * 100}ms`,
                }}
              >
                <div className="absolute inset-0 bg-gradient-to-br opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                  background: `linear-gradient(135deg, ${stat.color.split(' ')[1]}20, ${stat.color.split(' ')[3]}20)`
                }}></div>
                <div className="relative flex items-center justify-between mb-4">
                  <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-xl group-hover:scale-110 transition-transform duration-300`}>
                    {stat.icon}
                  </div>
                  <div className="w-2 h-2 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                </div>
                <div className="relative">
                  <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{stat.value}</div>
                  {stat.change !== null && (
                    <div className={`text-xs font-semibold flex items-center gap-1 ${
                      stat.change && stat.change > 0 ? "text-emerald-600" : stat.change && stat.change < 0 ? "text-rose-600" : "text-gray-500"
                    }`}>
                      {stat.change && stat.change > 0 ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                          </svg>
                          +{stat.change.toFixed(1)}%
                        </>
                      ) : stat.change && stat.change < 0 ? (
                        <>
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                          </svg>
                          {stat.change.toFixed(1)}%
                        </>
                      ) : null}
                    </div>
                  )}
                </div>
                <div className={`text-sm font-semibold ${stat.textColor} uppercase tracking-wide`}>{stat.label}</div>
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-teal-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </Link>
            );
          }
          return (
            <div
              key={idx}
              className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-lg border border-white/50"
              style={{
                animationDelay: `${idx * 100}ms`,
              }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-xl`}>
                  {stat.icon}
                </div>
              </div>
              <div>
                <div className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">{stat.value}</div>
                {stat.change !== null && (
                  <div className={`text-xs font-semibold flex items-center gap-1 ${
                    stat.change && stat.change > 0 ? "text-emerald-600" : stat.change && stat.change < 0 ? "text-rose-600" : "text-gray-500"
                  }`}>
                    {stat.change && stat.change > 0 ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                        +{stat.change.toFixed(1)}%
                      </>
                    ) : stat.change && stat.change < 0 ? (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                        </svg>
                        {stat.change.toFixed(1)}%
                      </>
                    ) : null}
                  </div>
                )}
              </div>
              <div className={`text-sm font-semibold ${stat.textColor} uppercase tracking-wide`}>{stat.label}</div>
            </div>
          );
        })}
      </div>

      {/* Ana İçerik Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sol: Bekleyen Kurslar ve Son Yorumlar */}
        <div className="lg:col-span-2 space-y-6">
          {/* Bekleyen Kurslar */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-orange-500/10 to-amber-500/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Bekleyen Onaylar</h2>
                  <p className="text-xs text-gray-500 font-medium">Onay bekleyen kurslar</p>
                </div>
              </div>
              <Link
                href="/dashboard/admin/courses/pending"
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 text-sm font-semibold"
              >
                Tümünü Gör
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {pendingLoading ? (
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            ) : pendingCount === 0 ? (
              <div className="text-center py-8 text-gray-500">Bekleyen onay bulunmuyor.</div>
            ) : (
              <div className="space-y-3">
                {pendingCourses?.slice(0, 5).map((course: any) => (
                  <Link
                    key={course.id}
                    href={`/dashboard/admin/courses/${course.id}`}
                    className="relative group/item flex items-center gap-4 p-4 bg-gradient-to-r from-orange-50/80 to-amber-50/80 hover:from-orange-100 hover:to-amber-100 border border-orange-200/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-orange-500/5 to-amber-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                    <div className="relative w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover/item:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate group-hover/item:text-orange-700 transition-colors">
                        {course.title}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Eğitmen: {course.teacher?.full_name || "Bilinmiyor"}</div>
                    </div>
                    <svg className="relative w-5 h-5 text-gray-400 group-hover/item:text-orange-600 group-hover/item:translate-x-1 shrink-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Bekleyen Blog Yazıları */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Bekleyen Blog Yazıları</h2>
                  <p className="text-xs text-gray-500 font-medium">Onay bekleyen blog yazıları</p>
                </div>
              </div>
              <Link
                href="/dashboard/admin/blog/pending"
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 text-sm font-semibold"
              >
                Tümünü Gör
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {blogPostsLoading ? (
              <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
            ) : pendingBlogPostsCount === 0 ? (
              <div className="text-center py-8 text-gray-500">Bekleyen blog yazısı bulunmuyor.</div>
            ) : (
              <div className="space-y-3">
                {pendingBlogPosts?.slice(0, 5).map((post: any) => (
                  <Link
                    key={post.id}
                    href={`/dashboard/blog/posts/${post.id}/edit`}
                    className="relative group/item flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-50/80 to-orange-50/80 hover:from-yellow-100 hover:to-orange-100 border border-yellow-200/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 to-orange-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                    <div className="relative w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover/item:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate group-hover/item:text-orange-700 transition-colors">
                        {post.title}
                      </div>
                      <div className="text-sm text-gray-600 font-medium">Yazar: {post.author?.full_name || "Bilinmiyor"}</div>
                    </div>
                    <svg className="relative w-5 h-5 text-gray-400 group-hover/item:text-orange-600 group-hover/item:translate-x-1 shrink-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Son Yorumlar */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-amber-500/10 to-yellow-500/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-amber-500 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Son Yorumlar</h2>
                  <p className="text-xs text-gray-500 font-medium">Kurs yorumları ve değerlendirmeler</p>
                </div>
              </div>
              <Link
                href="/dashboard/admin/reviews"
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 text-sm font-semibold"
              >
                Tümünü Gör
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {reviewsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !allReviews || allReviews.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Henüz yorum yok.</div>
            ) : (
              <div className="space-y-4">
                {allReviews.slice(0, 5).map((review: any) => (
                  <div key={review.id} className="border-b border-gray-100 last:border-0 pb-4 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-orange-500 text-white flex items-center justify-center text-sm font-semibold shrink-0">
                        {review.user?.full_name?.charAt(0) || "?"}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-semibold text-gray-900 truncate">
                            {review.user?.full_name || "Anonim"}
                          </span>
                          <div className="flex items-center gap-0.5">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-3.5 h-3.5 ${i < review.rating ? "text-amber-400 fill-current" : "text-gray-300"}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                          {!review.is_approved && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                              Onay Bekliyor
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500 mb-1 truncate">
                          {review.course?.title || "Kurs silinmiş"}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-2">{review.comment || review.title || "Yorum yok"}</p>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(review.created_at).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Bekleyen Banka Hesabı Talepleri */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Bekleyen Banka Hesabı</h2>
                  <p className="text-xs text-gray-500 font-medium">Onay bekleyen banka hesapları</p>
                </div>
              </div>
              <Link
                href="/dashboard/admin/bank-accounts"
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 text-sm font-semibold"
              >
                Tümünü Gör
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {bankAccountsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !pendingBankAccounts || pendingBankAccounts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <svg className="w-12 h-12 text-gray-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <p>Bekleyen banka hesabı talebi bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pendingBankAccounts
                  .filter((account: BankAccount) => account.status === "pending")
                  .slice(0, 5)
                  .map((account: BankAccount) => (
                  <Link
                    key={account.id}
                    href={`/dashboard/admin/bank-accounts${account.teacher_id ? `?teacher=${account.teacher_id}` : ""}`}
                    className="relative group/item flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50/80 to-pink-50/80 hover:from-purple-100 hover:to-pink-100 border border-purple-200/50 rounded-xl transition-all duration-300 hover:shadow-lg hover:scale-[1.02]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-pink-500/5 rounded-xl opacity-0 group-hover/item:opacity-100 transition-opacity"></div>
                    <div className="relative w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shrink-0 shadow-md group-hover/item:scale-110 transition-transform">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div className="relative flex-1 min-w-0">
                      <div className="font-bold text-gray-900 truncate group-hover/item:text-purple-700 transition-colors">
                        {account.bank_name}
                      </div>
                      <div className="text-sm text-gray-600 font-medium truncate">
                        {account.iban ? `${account.iban.slice(0, 8)}...${account.iban.slice(-4)}` : account.iban_masked || "-"}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">Hesap Sahibi: {account.account_holder_name}</div>
                    </div>
                    <svg className="relative w-5 h-5 text-gray-400 group-hover/item:text-purple-600 group-hover/item:translate-x-1 shrink-0 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Son Bildirimler */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-500/10 to-indigo-500/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-lg">
                  <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                  </svg>
                </div>
                <div>
                  <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Son Bildirimler</h2>
                  <p className="text-xs text-gray-500 font-medium">Sistem bildirimleri</p>
                </div>
              </div>
              <Link
                href="/dashboard/admin/notifications"
                className="group flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 text-sm font-semibold"
              >
                Tümünü Gör
                <svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            </div>
            {notificationsLoading ? (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : !allNotifications || allNotifications.length === 0 ? (
              <div className="text-center py-8 text-gray-500">Henüz bildirim gönderilmemiş.</div>
            ) : (
              <div className="space-y-3">
                {allNotifications.slice(0, 5).map((n: Notification) => (
                  <div
                    key={n.id}
                    className={`p-3 rounded-xl border text-sm ${
                      n.is_read ? "bg-gray-50 border-gray-100" : "bg-teal-50 border-teal-100"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className="mt-1 w-1.5 h-1.5 rounded-full bg-teal-500" />
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 truncate">{n.title}</div>
                        <div className="text-xs text-gray-600 line-clamp-2">{n.message}</div>
                        <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                          <span>Gönderen: {n.sender_name || "Sistem"}</span>
                          <span>•</span>
                          <span>
                            {new Date(n.created_at).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sağ: Hızlı İşlemler ve Özet */}
        <div className="space-y-6">
          {/* Hızlı İşlemler */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-teal-500/10 to-blue-500/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Hızlı İşlemler</h2>
                <p className="text-xs text-gray-500 font-medium">Sık kullanılan işlemler</p>
              </div>
            </div>
            <div className="relative space-y-2">
              {[
                { href: "/dashboard/admin/courses/pending", label: "Bekleyen Eğitimler", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", color: "from-orange-500 to-amber-500" },
                { href: "/dashboard/admin/bank-accounts", label: "Banka Hesabı Talepleri", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z", color: "from-purple-500 to-pink-500" },
                { href: "/dashboard/admin/withdrawals", label: "Çekim Talepleri", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z", color: "from-emerald-500 to-teal-500" },
                { href: "/dashboard/admin/notifications", label: "Bildirim Gönder", icon: "M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9", color: "from-blue-500 to-indigo-500" },
                { href: "/dashboard/settings", label: "Ayarlar", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z", color: "from-gray-500 to-slate-500" },
              ].map((item, idx) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="group relative flex items-center gap-3 p-3.5 bg-gradient-to-r from-gray-50/80 to-white/80 hover:from-teal-50 hover:to-blue-50 rounded-xl transition-all duration-300 hover:shadow-md hover:scale-[1.02] border border-gray-200/50 hover:border-teal-300/50"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className={`w-10 h-10 bg-gradient-to-br ${item.color} rounded-xl flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                    </svg>
                  </div>
                  <span className="text-sm font-semibold text-gray-700 group-hover:text-teal-700 transition-colors">{item.label}</span>
                  <svg className="w-4 h-4 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 ml-auto transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </Link>
              ))}
            </div>
          </div>

          {/* Platform Özeti */}
          <div className="relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/10 to-teal-500/10 rounded-full blur-3xl"></div>
            <div className="relative flex items-center gap-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">Platform Özeti</h2>
                <p className="text-xs text-gray-500 font-medium">Genel istatistikler</p>
              </div>
            </div>
            <div className="relative space-y-3">
              {[
                { label: "Bekleyen Kurslar", value: pendingCount, color: "from-orange-500 to-amber-500", bg: "from-orange-50 to-amber-50" },
                { label: "Bekleyen Blog Yazıları", value: pendingBlogPostsCount, color: "from-yellow-500 to-orange-500", bg: "from-yellow-50 to-orange-50" },
                { label: "Bekleyen Banka Hesapları", value: pendingBankAccountsCount, color: "from-purple-500 to-pink-500", bg: "from-purple-50 to-pink-50" },
                { label: "Toplam Kategoriler", value: totalCategories, color: "from-teal-500 to-cyan-500", bg: "from-teal-50 to-cyan-50" },
                { label: "Toplam Kurslar", value: totalCourses, color: "from-emerald-500 to-green-500", bg: "from-emerald-50 to-green-50" },
                { label: "Toplam Kullanıcılar", value: totalUsers, color: "from-blue-500 to-indigo-500", bg: "from-blue-50 to-indigo-50" },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="group relative flex items-center justify-between p-4 bg-gradient-to-r rounded-xl border border-gray-200/50 hover:shadow-md transition-all duration-300 hover:scale-[1.02]"
                  style={{
                    background: `linear-gradient(135deg, ${item.bg.split(' ')[1]}80, ${item.bg.split(' ')[3]}80)`,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 bg-gradient-to-br ${item.color} rounded-lg flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                    <span className="text-sm font-semibold text-gray-700">{item.label}</span>
                  </div>
                  <span className={`text-2xl font-bold bg-gradient-to-r ${item.color} bg-clip-text text-transparent`}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Ana Dashboard Component
export default function DashboardPage() {
  const user = useAuthStore((state) => state.user);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Hoş Geldin, {user?.full_name?.split(" ")[0]}! 👋
        </h1>
        <p className="text-gray-600 mt-2">
          {user?.role === "admin"
            ? "Platform yönetimi ve moderasyon işlemleri"
            : user?.role === "teacher"
            ? "Eğitimlerini yönet ve öğrencilerine ulaş"
            : "Bugün neler öğrenmek istersin?"}
        </p>
      </div>

      {user?.role === "admin" ? (
        <AdminDashboard />
      ) : user?.role === "teacher" ? (
        <TeacherDashboard />
      ) : (
        <StudentDashboard />
      )}
    </div>
  );
}
