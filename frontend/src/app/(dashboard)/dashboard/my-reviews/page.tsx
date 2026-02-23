"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { courseReviewsApi, enrollmentsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import Avatar from "@/components/Avatar";

interface Enrollment {
  id: string;
  course_id: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_path: string | null;
    teacher?: {
      id: string;
      full_name: string;
    } | null;
  };
  enrolled_at: string;
}

interface MyReview {
  id: string;
  course_id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  is_approved: boolean;
  approved_at: string | null;
  moderation_note: string | null;
  teacher_reply: string | null;
  teacher_reply_at: string | null;
  created_at: string;
  updated_at: string;
}

export default function MyReviewsPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState("");
  const [reviewComment, setReviewComment] = useState("");
  const [showReviewForm, setShowReviewForm] = useState(false);

  const { data: enrollments, isLoading: isLoadingEnrollments } = useQuery<Enrollment[]>({
    queryKey: ["my-enrollments"],
    queryFn: () => enrollmentsApi.myEnrollments(),
  });

  const enrolledCourses = enrollments || [];
  const courseIds = enrolledCourses.map((e) => e.course_id);

  // Her kurs için yorumu çek
  const { data: reviewsData, isLoading: isLoadingReviews } = useQuery({
    queryKey: ["my-reviews-all", courseIds.sort().join(",")],
    queryFn: async () => {
      if (courseIds.length === 0) return {};
      const reviews: Record<string, MyReview | null> = {};
      const reviewPromises = courseIds.map(async (courseId) => {
        try {
          const review = await courseReviewsApi.getMyReview(courseId);
          return { courseId, review };
        } catch (error: any) {
          if (error?.response?.status === 404) {
            return { courseId, review: null };
          }
          return { courseId, review: null };
        }
      });
      const results = await Promise.all(reviewPromises);
      results.forEach(({ courseId, review }) => {
        reviews[courseId] = review;
      });
      return reviews;
    },
    enabled: courseIds.length > 0,
  });

  const createReviewMutation = useMutation({
    mutationFn: ({ courseId, review }: { courseId: string; review: { rating: number; title?: string; comment?: string } }) =>
      courseReviewsApi.create(courseId, review),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-reviews-all"] });
      queryClient.invalidateQueries({ queryKey: ["my-reviews"] });
      queryClient.invalidateQueries({ queryKey: ["course-reviews"] });
      toast.success("Yorumunuz gönderildi. Onay bekliyor.");
      setShowReviewForm(false);
      setSelectedCourseId(null);
      setReviewTitle("");
      setReviewComment("");
      setReviewRating(5);
    },
    onError: (error: any) => {
      const errorMessage = error?.response?.data?.detail || "Yorum eklenirken bir hata oluştu.";
      toast.error(typeof errorMessage === "string" ? errorMessage : "Bir hata oluştu.");
    },
  });

  const handleOpenReviewForm = (courseId: string) => {
    const existingReview = reviewsData?.[courseId];
    if (existingReview) {
      toast.info("Bu kurs için zaten yorum yaptınız.");
      return;
    }
    setSelectedCourseId(courseId);
    setShowReviewForm(true);
  };

  const handleSubmitReview = () => {
    if (!selectedCourseId) return;
    createReviewMutation.mutate({
      courseId: selectedCourseId,
      review: {
        rating: reviewRating,
        title: reviewTitle || undefined,
        comment: reviewComment || undefined,
      },
    });
  };

  const formatDate = (value: string | null | undefined) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? "text-amber-400 fill-current" : "text-gray-300"}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  if (isLoadingEnrollments || isLoadingReviews) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-10 bg-gray-200 rounded-xl w-1/3 mb-6"></div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-100 rounded-xl"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const coursesWithReviews = enrolledCourses
    .map((enrollment) => {
      const review = reviewsData?.[enrollment.course_id];
      return {
        enrollment,
        review,
      };
    })
    .filter((item) => item.review !== undefined); // Sadece yorumu olan veya yorum yapabilecek kursları göster

  return (
    <div>
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Yorumlarım
              </h1>
              <p className="text-teal-100 text-lg">
                Kurslarınıza yaptığınız yorumları görüntüleyin ve eğitmen cevaplarını okuyun
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Review Form Modal */}
      {showReviewForm && selectedCourseId && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Yorum Yap</h2>
              <button
                onClick={() => {
                  setShowReviewForm(false);
                  setSelectedCourseId(null);
                  setReviewTitle("");
                  setReviewComment("");
                  setReviewRating(5);
                }}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {enrolledCourses.find((e) => e.course_id === selectedCourseId) && (
              <div className="mb-6 p-4 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-1">
                  {enrolledCourses.find((e) => e.course_id === selectedCourseId)?.course.title}
                </h3>
                <p className="text-sm text-gray-600">
                  {enrolledCourses.find((e) => e.course_id === selectedCourseId)?.course.teacher?.full_name || "Eğitmen"}
                </p>
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
              <div className="flex items-center gap-3 pt-4">
                <button
                  onClick={handleSubmitReview}
                  disabled={createReviewMutation.isPending}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 text-white rounded-xl font-semibold transition-all"
                >
                  {createReviewMutation.isPending ? "Gönderiliyor..." : "Yorumu Gönder"}
                </button>
                <button
                  onClick={() => {
                    setShowReviewForm(false);
                    setSelectedCourseId(null);
                    setReviewTitle("");
                    setReviewComment("");
                    setReviewRating(5);
                  }}
                  className="px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      {coursesWithReviews.length === 0 ? (
        <div className="text-center py-20 bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
          <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
            </svg>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz yorum yapmadınız</h3>
          <p className="text-gray-600 mb-6">Kayıtlı olduğunuz kurslara yorum yaparak deneyiminizi paylaşın.</p>
          <Link
            href="/dashboard/courses"
            className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
          >
            Kurslarıma Git
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {coursesWithReviews.map(({ enrollment, review }, index) => (
            <div
              key={enrollment.id}
              className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl group"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              <div className="flex items-start gap-6">
                {/* Course Thumbnail */}
                <div className="w-32 h-32 rounded-xl overflow-hidden flex-shrink-0">
                  {enrollment.course.thumbnail_path ? (
                    <img
                      src={enrollment.course.thumbnail_path}
                      alt={enrollment.course.title}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-teal-100 to-emerald-200 flex items-center justify-center">
                      <svg className="w-12 h-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* Course Info */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <Link
                        href={`/courses/${enrollment.course.slug}`}
                        className="text-xl font-bold text-gray-900 hover:text-teal-700 transition-colors mb-1 block"
                      >
                        {enrollment.course.title}
                      </Link>
                      <p className="text-sm text-gray-600">
                        {enrollment.course.teacher?.full_name || "Eğitmen"}
                      </p>
                    </div>
                    {!review && (
                      <button
                        onClick={() => handleOpenReviewForm(enrollment.course_id)}
                        className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white rounded-xl font-semibold text-sm transition-all whitespace-nowrap"
                      >
                        Yorum Yap
                      </button>
                    )}
                  </div>

                  {/* Review Content */}
                  {review ? (
                    <div className="space-y-4">
                      {/* Review Status */}
                      <div className="flex items-center gap-3">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm font-bold text-gray-700">({review.rating}/5)</span>
                        <span className="text-xs text-gray-500">•</span>
                        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
                          review.is_approved
                            ? "bg-emerald-100 text-emerald-700"
                            : review.moderation_note && !review.is_approved
                            ? "bg-rose-100 text-rose-700"
                            : "bg-amber-100 text-amber-700"
                        }`}>
                          {review.is_approved
                            ? "✓ Onaylandı"
                            : review.moderation_note && !review.is_approved
                            ? "✗ Reddedildi"
                            : "⏳ Onay Bekliyor"}
                        </span>
                        <span className="text-xs text-gray-500">
                          {formatDate(review.created_at)}
                        </span>
                      </div>

                      {/* Review Text */}
                      {review.title && (
                        <h4 className="text-base font-semibold text-gray-900">{review.title}</h4>
                      )}
                      {review.comment && (
                        <p className="text-gray-700 leading-relaxed">{review.comment}</p>
                      )}

                      {/* Moderation Note */}
                      {review.moderation_note && !review.is_approved && (
                        <div className="p-3 bg-rose-50 border-l-4 border-rose-500 rounded-r-lg">
                          <p className="text-sm font-semibold text-rose-800 mb-1">Reddetme Nedeni:</p>
                          <p className="text-sm text-rose-700">{review.moderation_note}</p>
                        </div>
                      )}

                      {/* Teacher Reply */}
                      {review.teacher_reply && (
                        <div className="mt-4 p-4 bg-teal-50 border-l-4 border-teal-500 rounded-r-lg">
                          <div className="flex items-center gap-2 mb-2">
                            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span className="text-sm font-semibold text-teal-800">Eğitmen Cevabı</span>
                            {review.teacher_reply_at && (
                              <span className="text-xs text-teal-600 ml-auto">
                                {formatDate(review.teacher_reply_at)}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-teal-700 leading-relaxed">{review.teacher_reply}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500 italic">
                      Bu kurs için henüz yorum yapmadınız.
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
