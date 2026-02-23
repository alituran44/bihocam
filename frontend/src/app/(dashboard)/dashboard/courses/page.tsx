"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { enrollmentsApi, reviewsApi } from "@/lib/api";

interface Lesson {
  id: string;
  title: string;
  duration_seconds: number | null;
  order: number;
}

interface Course {
  id: string;
  title: string;
  slug: string;
  thumbnail_path: string | null;
  price: number;
  discount_price: number | null;
  teacher?: {
    full_name: string;
  } | null;
  lessons: Lesson[];
}

interface Enrollment {
  id: string;
  course_id: string;
  progress_percentage: number;
  enrolled_at: string;
  course: Course;
}

function formatDuration(seconds: number | null) {
  if (!seconds) return "Süre belirtilmemiş";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours} sa ${minutes} dk`;
  }
  return `${minutes} dk`;
}

export default function DashboardCoursesPage() {
  const { data: enrollments, isLoading } = useQuery<Enrollment[]>({
    queryKey: ["my-enrollments"],
    queryFn: () => enrollmentsApi.myEnrollments(),
  });

  const enrolledCourses = enrollments || [];
  
  // Her kurs için yorum durumunu çek (optimize edilmiş - paralel çağrılar)
  const courseIds = enrolledCourses.map((e) => e.course_id);
  const { data: reviewsData } = useQuery({
    queryKey: ["my-reviews", courseIds.sort().join(",")],
    queryFn: async () => {
      if (courseIds.length === 0) return {};
      const reviews: Record<string, any> = {};
      // Paralel olarak tüm yorumları çek
      const reviewPromises = courseIds.map(async (courseId) => {
        try {
          const review = await reviewsApi.getMyReview(courseId);
          return { courseId, review };
        } catch (error) {
          // Yorum yoksa null döner
          return { courseId, review: null };
        }
      });
      
      const results = await Promise.all(reviewPromises);
      results.forEach(({ courseId, review }) => {
        if (review) {
          reviews[courseId] = review;
        }
      });
      
      return reviews;
    },
    enabled: courseIds.length > 0,
    staleTime: 30000, // 30 saniye cache
  });

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Kurslarım</h1>
          <p className="text-gray-600">Kayıtlı olduğun kursları buradan yönetebilirsin.</p>
        </div>
        <Link
          href="/courses"
          className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition-all"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Kurs Keşfet
        </Link>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {[...Array(4)].map((_, i) => (
            <div
              key={i}
              className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm animate-pulse"
            >
              <div className="h-32 bg-gray-200" />
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-200 rounded w-1/2" />
                <div className="h-2 bg-gray-200 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : enrolledCourses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <svg
            className="w-16 h-16 text-gray-300 mx-auto mb-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
            />
          </svg>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Henüz kayıtlı kursun yok</h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Kursları inceleyip sepetine ekleyerek kolayca kaydolabilir ve ilerlemeni buradan takip edebilirsin.
          </p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white px-6 py-3 rounded-xl font-semibold transition-all"
          >
            Kursları Keşfet
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {enrolledCourses.map((enrollment) => {
            const course = enrollment.course;
            const totalSeconds = course.lessons.reduce(
              (sum, l) => sum + (l.duration_seconds || 0),
              0
            );
            // İlk dersi bul (order'a göre sıralanmış)
            const sortedLessons = [...course.lessons].sort((a, b) => a.order - b.order);
            const firstLesson = sortedLessons[0];
            const courseLink = firstLesson
              ? `/dashboard/courses/${course.id}/${firstLesson.id}`
              : `/courses/${course.slug}`;

            const myReview = reviewsData?.[course.id];
            const reviewStatus = myReview
              ? myReview.is_approved
                ? "approved"
                : myReview.moderation_note && !myReview.is_approved
                ? "rejected"
                : "pending"
              : null;

            return (
              <Link
                key={enrollment.id}
                href={courseLink}
                className="group bg-white border border-gray-200 rounded-2xl overflow-hidden hover:border-teal-300 hover:shadow-lg transition-all flex flex-col"
              >
                <div className="h-32 bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center relative overflow-hidden">
                  {course.thumbnail_path ? (
                    <img
                      src={course.thumbnail_path}
                      alt={course.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  ) : (
                    <svg
                      className="w-12 h-12 text-teal-500"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                      />
                    </svg>
                  )}
                  {course.discount_price && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-semibold">
                      İndirim
                    </div>
                  )}
                </div>
                <div className="p-4 flex-1 flex flex-col">
                  <h3 className="font-semibold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 mb-1">
                    {course.title}
                  </h3>
                  <p className="text-sm text-gray-600 mb-3">
                    {course.teacher?.full_name || "Eğitmen"}
                  </p>
                  <div className="mt-auto">
                    {/* Progress bar */}
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-gray-500">İlerleme</span>
                      <span className="text-xs font-medium text-gray-700">
                        %{enrollment.progress_percentage}
                      </span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden mb-2">
                      <div
                        className="h-2 bg-gradient-to-r from-teal-500 to-teal-600 rounded-full"
                        style={{ width: `${enrollment.progress_percentage}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{course.lessons.length} ders</span>
                      <span>{formatDuration(totalSeconds)}</span>
                    </div>
                    
                    {/* Review Status Badge */}
                    {reviewStatus && (
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                          </svg>
                          <span className={`text-xs font-semibold ${
                            reviewStatus === "approved"
                              ? "text-emerald-600"
                              : reviewStatus === "rejected"
                              ? "text-rose-600"
                              : "text-amber-600"
                          }`}>
                            {reviewStatus === "approved"
                              ? "✓ Yorumunuz onaylandı"
                              : reviewStatus === "rejected"
                              ? "✗ Yorumunuz reddedildi"
                              : "⏳ Yorumunuz inceleniyor"}
                          </span>
                        </div>
                        {reviewStatus === "rejected" && myReview?.moderation_note && (
                          <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                            {myReview.moderation_note}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}