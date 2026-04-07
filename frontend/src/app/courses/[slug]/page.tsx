"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { coursesApi, cartApi, enrollmentsApi, courseReviewsApi, mediaApi, type Category, type LessonResponse } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { CategoryBadge } from "@/components/CategoryBadge";
import { ContentRenderer } from "@/components/content/ContentRenderer";
import AdBanner from "@/components/ads/AdBanner";
import FeaturedCourses from "@/components/ads/FeaturedCourses";

// Use LessonResponse from API types
type Lesson = LessonResponse;

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_path: string | null;
  price: number;
  discount_price: number | null;
  teacher?: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  categories?: Category[];
  lessons: Lesson[];
  created_at: string;
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  user: {
    id: string;
    full_name: string;
  };
  created_at: string;
  teacher_reply?: string | null;
  teacher_reply_at?: string | null;
}

interface ReviewStats {
  average_rating: number;
  total_reviews: number;
}

export default function CourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { isAuthenticated, user } = useAuthStore();
  const queryClient = useQueryClient();
  const [addingToCart, setAddingToCart] = useState(false);
  const [expandedLessons, setExpandedLessons] = useState<Set<string>>(new Set());
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [reviewError, setReviewError] = useState<string | null>(null);

  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["course", slug],
    queryFn: () => coursesApi.getBySlug(slug),
    enabled: !!slug,
  });

  const { data: enrollments } = useQuery({
    queryKey: ["my-enrollments"],
    queryFn: () => enrollmentsApi.myEnrollments(),
    enabled: isAuthenticated,
  });

  const { data: reviews, isLoading: isLoadingReviews } = useQuery<Review[]>({
    queryKey: ["course-reviews", course?.id],
    queryFn: () => courseReviewsApi.list(course!.id),
    enabled: !!course?.id,
  });

  const { data: reviewStats } = useQuery<ReviewStats>({
    queryKey: ["course-review-stats", course?.id],
    queryFn: () => courseReviewsApi.getStats(course!.id),
    enabled: !!course?.id,
  });

  const { data: similarCourses } = useQuery<Course[]>({
    queryKey: ["similar-courses", course?.id],
    queryFn: () => coursesApi.getSimilar(course!.id),
    enabled: !!course?.id,
  });

  const { data: myReview } = useQuery({
    queryKey: ["my-review", course?.id],
    queryFn: () => courseReviewsApi.getMyReview(course!.id),
    enabled: !!course?.id && isAuthenticated,
  });

  const isEnrolled = course
    ? enrollments?.some((e: any) => e.course_id === course.id)
    : false;

  const createReviewMutation = useMutation({
    mutationFn: (review: { rating: number; title?: string; comment?: string }) =>
      courseReviewsApi.create(course!.id, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["course-reviews", course?.id] });
      queryClient.invalidateQueries({ queryKey: ["course-review-stats", course?.id] });
      queryClient.invalidateQueries({ queryKey: ["my-review", course?.id] });
      setShowReviewForm(false);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
      setReviewError(null);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || "Yorum eklenirken bir hata oluştu.";
      setReviewError(typeof errorMessage === "string" ? errorMessage : "Bir hata oluştu.");
    },
  });

  const handleSubmitReview = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    createReviewMutation.mutate({
      rating: reviewRating,
      title: reviewTitle || undefined,
      comment: reviewComment || undefined,
    });
  };

  const toggleLesson = (lessonId: string) => {
    const newExpanded = new Set(expandedLessons);
    if (newExpanded.has(lessonId)) {
      newExpanded.delete(lessonId);
    } else {
      newExpanded.add(lessonId);
    }
    setExpandedLessons(newExpanded);
  };

  const [cartError, setCartError] = useState<string | null>(null);

  const addToCartMutation = useMutation({
    mutationFn: (courseId: string) => cartApi.addToCart(courseId),
    onSuccess: () => {
      setCartError(null);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      router.push("/cart");
    },
    onError: (err: any) => {
      setAddingToCart(false);
      const detail = err?.response?.data?.detail || "Sepete eklenemedi";
      setCartError(detail);
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      router.push("/login");
      return;
    }
    if (!course) return;
    setAddingToCart(true);
    addToCartMutation.mutate(course.id);
  };

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Süre belirtilmemiş";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")} saat`;
    }
    return `${minutes} dakika`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="animate-pulse">
            <div className="h-10 bg-gray-200 rounded-xl w-3/4 mb-4"></div>
            <div className="h-5 bg-gray-200 rounded-lg w-1/2 mb-8"></div>
            <div className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                <div className="h-80 bg-gray-200 rounded-2xl"></div>
                <div className="h-4 bg-gray-200 rounded"></div>
              </div>
              <div className="h-[500px] bg-gray-200 rounded-2xl"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="text-center py-20">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Kurs bulunamadı</h1>
            <p className="text-gray-600 mb-8">Aradığınız kurs mevcut değil veya kaldırılmış olabilir.</p>
            <Link href="/courses" className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Kurslara Dön
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Hero Section with Gradient */}
      <div className="bg-gradient-to-br from-teal-600 via-teal-700 to-teal-800 text-white pt-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Breadcrumb */}
          <div className="mb-6 flex items-center gap-2 text-sm text-teal-100">
            <Link href="/" className="hover:text-white transition-colors">Ana Sayfa</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/courses" className="hover:text-white transition-colors">Kurslar</Link>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <span className="text-white font-medium truncate max-w-xs">{course.title}</span>
          </div>

          <div className="max-w-4xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">{course.title}</h1>

            {/* Kategoriler */}
            {course.categories && course.categories.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-4">
                {course.categories.map((category) => (
                  <CategoryBadge
                    key={category.id}
                    category={category}
                    size="sm"
                    asLink
                    showCount={false}
                  />
                ))}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4 text-teal-100 mb-4">
              {course.teacher && (
                <div className="flex items-center gap-3">
                  <Avatar
                    src={course.teacher.avatar_url}
                    name={course.teacher.full_name}
                    size="md"
                    className="bg-white/20"
                  />
                  <Link href={`/teachers/${course.teacher.id}`} className="hover:text-white transition-colors font-medium">
                    {course.teacher.full_name}
                  </Link>
                </div>
              )}
              <span className="hidden sm:block w-1 h-1 bg-teal-300 rounded-full"></span>
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                </svg>
                {course.lessons.length} ders
              </span>
              <span className="hidden sm:block w-1 h-1 bg-teal-300 rounded-full"></span>
              <span className="flex items-center gap-1">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {formatDuration(course.lessons.reduce((t, l) => t + (l.duration_seconds || 0), 0))}
              </span>
              {reviewStats && (
                <>
                  <span className="hidden sm:block w-1 h-1 bg-teal-300 rounded-full"></span>
                  <div className="flex items-center gap-1">
                    <svg className="w-5 h-5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-white font-semibold">{reviewStats.average_rating.toFixed(1)}</span>
                    <span className="text-teal-200">({reviewStats.total_reviews} değerlendirme)</span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-6">
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Ana İçerik */}
          <div className="lg:col-span-2 space-y-8">

            {/* Video Önizleme */}
            {(() => {
              const previewLesson = course.lessons.find((l) => l.is_preview);
              if (!previewLesson) return null;

              return (
                <div className="bg-white rounded-2xl overflow-hidden shadow-2xl border-2 border-gray-200">
                  <div className="relative">
                    <div className="absolute top-4 left-4 z-10">
                      <div className="bg-emerald-500 text-white text-xs px-3 py-1.5 rounded-md font-semibold shadow-lg">
                        Önizleme
                      </div>
                    </div>
                    <ContentRenderer
                      lesson={previewLesson}
                      watchedSeconds={0}
                      className="rounded-2xl"
                    />
                  </div>
                </div>
              );
            })()}

            {/* Kurs Açıklaması */}
            {course.description && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-4">Kurs Hakkında</h2>
                <div className="prose prose-gray max-w-none">
                  <p className="text-gray-600 leading-relaxed whitespace-pre-line">{course.description}</p>
                </div>
              </div>
            )}

            {/* Dersler Listesi */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Kurs İçeriği</h2>
                <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-lg">
                  {course.lessons.length} ders • {formatDuration(course.lessons.reduce((t, l) => t + (l.duration_seconds || 0), 0))}
                </span>
              </div>
              <div className="space-y-2">
                {course.lessons.length > 0 ? (
                  course.lessons
                    .sort((a, b) => a.order - b.order)
                    .map((lesson, index) => {
                      const isExpanded = expandedLessons.has(lesson.id);
                      return (
                        <div
                          key={lesson.id}
                          className="border border-gray-100 rounded-xl overflow-hidden hover:border-teal-200 transition-all bg-gray-50 hover:bg-teal-50/30"
                        >
                          <button
                            onClick={() => toggleLesson(lesson.id)}
                            className="w-full flex items-center justify-between p-4 text-left transition-colors"
                          >
                            <div className="flex items-center gap-4 flex-1">
                              <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm shadow-lg shadow-teal-500/20">
                                {index + 1}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1 flex-wrap">
                                  <h3 className="font-semibold text-gray-900">{lesson.title}</h3>
                                  {lesson.is_preview && (
                                    <span className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded-md font-medium">
                                      Önizleme
                                    </span>
                                  )}
                                  <span className="text-xs text-gray-500 px-2 py-0.5 bg-white rounded-md border border-gray-200">
                                    {lesson.lesson_type === "video" 
                                      ? "📹 Video" 
                                      : lesson.lesson_type === "pdf" 
                                      ? "📄 PDF" 
                                      : lesson.lesson_type === "document"
                                      ? "📝 Doküman"
                                      : lesson.lesson_type === "presentation"
                                      ? "📊 Sunum"
                                      : lesson.lesson_type === "live_lesson"
                                      ? "🔴 Canlı Ders"
                                      : lesson.lesson_type === "text"
                                      ? "✍️ Metin"
                                      : lesson.lesson_type === "quiz"
                                      ? "❓ Quiz"
                                      : "📄 İçerik"}
                                  </span>
                                </div>
                                {lesson.description && isExpanded && (
                                  <p className="text-sm text-gray-600 mt-2">{lesson.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-4">
                              {lesson.duration_seconds && (
                                <span className="text-sm text-gray-500 font-medium">
                                  {formatDuration(lesson.duration_seconds)}
                                </span>
                              )}
                              <svg
                                className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? "rotate-180" : ""}`}
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </div>
                          </button>
                        </div>
                      );
                    })
                ) : (
                  <div className="text-center py-12 bg-gray-50 rounded-xl">
                    <p className="text-gray-600">Bu kurs için henüz ders eklenmemiş.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Eğitmen Bilgisi */}
            {course.teacher && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Eğitmen Hakkında</h2>
                <div className="flex items-start gap-5">
                  <Avatar
                    src={course.teacher.avatar_url}
                    name={course.teacher.full_name}
                    size="xl"
                    className="shadow-lg shadow-teal-500/30 flex-shrink-0"
                  />
                  <div className="flex-1">
                    <Link
                      href={`/teachers/${course.teacher.id}`}
                      className="text-xl font-bold text-gray-900 hover:text-teal-600 transition-colors mb-2 inline-block"
                    >
                      {course.teacher.full_name}
                    </Link>
                    <p className="text-gray-600 mb-4 leading-relaxed">
                      Alanında uzman eğitmen. {course.teacher.full_name} ile öğrenmeye başlayın ve kariyerinizde ilerleyin.
                    </p>
                    <Link
                      href={`/teachers/${course.teacher.id}`}
                      className="inline-flex items-center gap-2 text-teal-600 hover:text-teal-700 font-semibold text-sm"
                    >
                      Tüm kurslarını gör
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>
            )}

            {/* Öğrenci Yorumları */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Öğrenci Yorumları</h2>
                  {reviewStats && (
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <svg
                            key={i}
                            className={`w-5 h-5 ${i < Math.round(reviewStats.average_rating) ? "text-amber-400 fill-current" : "text-gray-300"}`}
                            viewBox="0 0 20 20"
                          >
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                          </svg>
                        ))}
                      </div>
                      <span className="text-lg font-bold text-gray-900">{reviewStats.average_rating.toFixed(1)}</span>
                      <span className="text-gray-500">({reviewStats.total_reviews} değerlendirme)</span>
                    </div>
                  )}
                </div>
                {isAuthenticated && !myReview && isEnrolled && (
                  <button
                    onClick={() => setShowReviewForm(!showReviewForm)}
                    className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white rounded-xl font-semibold transition-all"
                  >
                    Yorum Yap
                  </button>
                )}
              </div>

              {/* Review Form */}
              {showReviewForm && (
                <div className="mb-6 p-5 bg-teal-50 rounded-xl border border-teal-100">
                  <h3 className="font-bold text-gray-900 mb-4">Yorumunuzu Yazın</h3>
                  {reviewError && (
                    <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm">
                      {reviewError}
                    </div>
                  )}
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Puan</label>
                      <div className="flex items-center gap-2">
                        {[...Array(5)].map((_, i) => (
                          <button
                            key={i}
                            type="button"
                            onClick={() => setReviewRating(i + 1)}
                            className={`w-10 h-10 ${i < reviewRating ? "text-amber-400" : "text-gray-300"} hover:text-amber-400 transition-colors`}
                          >
                            <svg fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                            </svg>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Başlık (Opsiyonel)</label>
                      <input
                        type="text"
                        value={reviewTitle}
                        onChange={(e) => setReviewTitle(e.target.value)}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        placeholder="Yorum başlığı"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Yorum</label>
                      <textarea
                        value={reviewComment}
                        onChange={(e) => setReviewComment(e.target.value)}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white"
                        placeholder="Yorumunuzu buraya yazın..."
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={handleSubmitReview}
                        disabled={createReviewMutation.isPending}
                        className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
                      >
                        {createReviewMutation.isPending ? "Gönderiliyor..." : "Yorumu Gönder"}
                      </button>
                      <button
                        onClick={() => {
                          setShowReviewForm(false);
                          setReviewTitle("");
                          setReviewComment("");
                          setReviewRating(5);
                          setReviewError(null);
                        }}
                        className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                      >
                        İptal
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews List */}
              {isLoadingReviews ? (
                <div className="space-y-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="h-24 bg-gray-100 rounded-xl" />
                    </div>
                  ))}
                </div>
              ) : reviews && reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.slice(0, 5).map((review) => (
                    <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-start gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-orange-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/20">
                          {review.user.full_name.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2 flex-wrap">
                            <span className="font-semibold text-gray-900">{review.user.full_name}</span>
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, j) => (
                                <svg
                                  key={j}
                                  className={`w-4 h-4 ${j < review.rating ? "text-amber-400 fill-current" : "text-gray-300"}`}
                                  viewBox="0 0 20 20"
                                >
                                  <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                </svg>
                              ))}
                            </div>
                            <span className="text-xs text-gray-400">
                              {new Date(review.created_at).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })}
                            </span>
                          </div>
                          {review.title && (
                            <h4 className="font-semibold text-gray-900 mb-1">{review.title}</h4>
                          )}
                          {review.comment && <p className="text-gray-600 leading-relaxed">{review.comment}</p>}
                          
                          {/* Eğitmen Cevabı */}
                          {review.teacher_reply && (
                            <div className="mt-4 p-4 bg-teal-50 border-l-4 border-teal-500 rounded-r-lg">
                              <div className="flex items-center gap-2 mb-2">
                                <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-sm font-semibold text-teal-800">Eğitmen Cevabı</span>
                                {review.teacher_reply_at && (
                                  <span className="text-xs text-teal-600 ml-auto">
                                    {new Date(review.teacher_reply_at).toLocaleDateString("tr-TR", {
                                      year: "numeric",
                                      month: "long",
                                      day: "numeric",
                                    })}
                                  </span>
                                )}
                              </div>
                              <p className="text-sm text-teal-700 leading-relaxed">{review.teacher_reply}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                    </svg>
                  </div>
                  <p className="text-gray-600">Henüz yorum yapılmamış. İlk yorumu siz yapın!</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar - Pricing Card */}
          <div className="lg:col-span-1">
            <div className="sticky top-24 space-y-4">
              {/* Sidebar Ad */}
              <div className="mb-4">
                <AdBanner placementCode="sidebar_course_detail" categoryId={course.categories?.[0]?.id} />
              </div>

              <div className="bg-white rounded-2xl p-6 shadow-xl border border-gray-100">
                {course.thumbnail_path ? (
                  <img
                    src={course.thumbnail_path}
                    alt={course.title}
                    className="w-full h-48 object-cover rounded-xl mb-6"
                  />
                ) : (
                  <div className="w-full h-48 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl mb-6 flex items-center justify-center">
                    <svg className="w-16 h-16 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                )}

                <div className="mb-6">
                  <div className="flex items-baseline gap-3 mb-6">
                    {course.discount_price ? (
                      <>
                        <span className="text-4xl font-bold text-gray-900">₺{course.discount_price}</span>
                        <span className="text-xl text-gray-400 line-through">₺{course.price}</span>
                        <span className="ml-auto bg-orange-100 text-orange-600 text-sm font-bold px-3 py-1 rounded-lg">
                          %{Math.round(((course.price - course.discount_price) / course.price) * 100)} İndirim
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold text-gray-900">
                        {course.price === 0 ? "Ücretsiz" : `₺${course.price}`}
                      </span>
                    )}
                  </div>

                  {isEnrolled ? (
                    <Link
                      href={`/dashboard/courses/${course.id}`}
                      className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 text-white py-4 rounded-xl font-bold transition-all mb-4 flex items-center justify-center gap-2"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Kursa Git
                    </Link>
                  ) : (
                    <>
                      <button
                        onClick={handleAddToCart}
                        disabled={addingToCart || addToCartMutation.isPending}
                        className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 text-white py-4 rounded-xl font-bold transition-all mb-3"
                      >
                        {addingToCart || addToCartMutation.isPending ? "Ekleniyor..." : "Sepete Ekle"}
                      </button>
                      {cartError && (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-3 text-sm text-amber-800 text-center">
                          {cartError}
                        </div>
                      )}
                      {course.price === 0 && (
                        <button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg hover:shadow-emerald-500/30 text-white py-4 rounded-xl font-bold transition-all mb-3">
                          Hemen Kaydol
                        </button>
                      )}
                    </>
                  )}

                  <div className="space-y-3 text-sm">
                    {[
                      { icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253", text: `${course.lessons.length} ders içeriği` },
                      { icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z", text: formatDuration(course.lessons.reduce((t, l) => t + (l.duration_seconds || 0), 0)) },
                      { icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z", text: "Ömür boyu erişim" },
                      { icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4", text: "Mobil ve TV'den erişim" },
                      { icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z", text: "Sertifika" },
                    ].map((item, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <svg className="w-5 h-5 text-teal-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={item.icon} />
                        </svg>
                        <span className="text-gray-700 font-medium">{item.text}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-6 pt-6 border-t border-gray-100">
                    <p className="text-xs text-gray-500 text-center font-medium">
                      🔒 30 gün para iade garantisi
                    </p>
                  </div>
                </div>
              </div>

              {/* Sosyal Paylaşım */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
                <p className="text-sm font-semibold text-gray-700 mb-3">Bu kursu paylaş</p>
                <div className="flex items-center gap-3">
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl transition-colors text-sm font-semibold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    Facebook
                  </button>
                  <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl transition-colors text-sm font-semibold">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                    </svg>
                    WhatsApp
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Featured Courses (Ad Campaigns) */}
        <div className="mt-12 mb-12">
          <FeaturedCourses 
            limit={3} 
            categoryId={course.categories?.[0]?.id}
            showTitle={true}
            title="Öne Çıkan Kurslar"
          />
        </div>

        {/* İlgili Kurslar */}
        {similarCourses && similarCourses.length > 0 && (
          <div className="mt-12 mb-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">İlgili Kurslar</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {similarCourses.map((similarCourse) => (
                <Link
                  key={similarCourse.id}
                  href={`/courses/${similarCourse.slug}`}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-teal-200 hover:shadow-lg transition-all group"
                >
                  <div className="h-40 bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center relative overflow-hidden">
                    {similarCourse.thumbnail_path ? (
                      <img
                        src={similarCourse.thumbnail_path}
                        alt={similarCourse.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <svg className="w-16 h-16 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    )}
                  </div>
                  <div className="p-5">
                    <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">{similarCourse.title}</h3>
                    <p className="text-sm text-gray-500 mb-3">
                      {similarCourse.teacher?.full_name || "Eğitmen"}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-900">
                        {similarCourse.price === 0
                          ? "Ücretsiz"
                          : similarCourse.discount_price
                            ? `₺${similarCourse.discount_price}`
                            : `₺${similarCourse.price}`}
                      </span>
                      <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-lg">{similarCourse.lessons.length} ders</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
