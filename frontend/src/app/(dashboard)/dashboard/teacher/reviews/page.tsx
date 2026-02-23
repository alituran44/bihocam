"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi } from "@/lib/api";

interface ReviewItem {
  id: string;
  course_id: string;
  course_title?: string;
  user_id: string;
  student_name?: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  is_approved: boolean;
  teacher_reply?: string | null;
  teacher_reply_at?: string | null;
  created_at: string;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const StarRating = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <svg
        key={star}
        className={`w-4 h-4 ${star <= rating ? "text-yellow-400" : "text-gray-300"}`}
        fill="currentColor"
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ))}
  </div>
);

export default function TeacherReviewsPage() {
  const queryClient = useQueryClient();
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [message, setMessage] = useState<string | null>(null);

  const { data: reviews, isLoading, error } = useQuery<ReviewItem[]>({
    queryKey: ["teacher-reviews"],
    queryFn: () => reviewsApi.getTeacherReviews({ limit: 100 }),
  });

  const replyMutation = useMutation({
    mutationFn: ({ courseId, reviewId, reply }: { courseId: string; reviewId: string; reply: string }) =>
      reviewsApi.reply(courseId, reviewId, { reply }),
    onSuccess: () => {
      setMessage("Yanıtınız başarıyla gönderildi!");
      setReplyingTo(null);
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["teacher-reviews"] });
    },
    onError: () => {
      setMessage(null);
    },
  });

  const approvedReviews = reviews?.filter((r) => r.is_approved) || [];
  const pendingReviews = reviews?.filter((r) => !r.is_approved) || [];
  const averageRating = reviews?.length
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : "0.0";

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Yorumlar yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-amber-500 via-orange-500 to-red-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Kurs Yorumları
              </h1>
              <p className="text-amber-100 text-lg">
                Öğrencilerinizin kurslarınız hakkındaki geri bildirimlerini görüntüleyin ve yanıtlayın
              </p>
            </div>
            <div className="hidden md:block">
              <svg className="w-32 h-32 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm border border-emerald-200">
          ✅ {message}
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-600">Toplam Yorum</span>
          <div className="text-3xl font-bold text-gray-900 mt-1">{isLoading ? "..." : reviews?.length || 0}</div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-600">Ortalama Puan</span>
          <div className="text-3xl font-bold text-yellow-600 mt-1 flex items-center gap-2">
            {isLoading ? "..." : averageRating}
            <svg className="w-7 h-7 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-600">Onaylanmış</span>
          <div className="text-3xl font-bold text-emerald-600 mt-1">{isLoading ? "..." : approvedReviews.length}</div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <span className="text-sm font-medium text-gray-600">Onay Bekleyen</span>
          <div className="text-3xl font-bold text-orange-600 mt-1">{isLoading ? "..." : pendingReviews.length}</div>
        </div>
      </div>

      {/* Reviews List */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-6">Tüm Yorumlar</h3>

        {isLoading ? (
          <div className="text-center py-8 text-gray-500">Yükleniyor...</div>
        ) : !reviews?.length ? (
          <div className="text-center py-12">
            <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
            </svg>
            <p className="text-gray-500 text-lg">Henüz yorum yok</p>
            <p className="text-gray-400 text-sm mt-1">Öğrencileriniz kurslarınızı değerlendirdiğinde burada görünecek</p>
          </div>
        ) : (
          <div className="space-y-6">
            {reviews.map((review) => (
              <div key={review.id} className="border border-gray-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-500 flex items-center justify-center text-white font-bold text-sm">
                        {review.student_name?.charAt(0)?.toUpperCase() || "?"}
                      </div>
                      <div>
                        <div className="font-semibold text-gray-900">{review.student_name || "Anonim"}</div>
                        <div className="text-xs text-gray-500">{formatDate(review.created_at)}</div>
                      </div>
                    </div>
                    {review.course_title && (
                      <div className="text-xs text-teal-600 font-medium mb-2">📚 {review.course_title}</div>
                    )}
                    <StarRating rating={review.rating} />
                    {review.title && <h4 className="font-semibold text-gray-800 mt-2">{review.title}</h4>}
                    {review.comment && <p className="text-gray-600 text-sm mt-1">{review.comment}</p>}
                  </div>
                  <div>
                    {review.is_approved ? (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        ✅ Onaylı
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                        ⏳ Bekliyor
                      </span>
                    )}
                  </div>
                </div>

                {/* Teacher Reply */}
                {review.teacher_reply && (
                  <div className="mt-4 bg-teal-50 rounded-lg p-4 border-l-4 border-teal-500">
                    <div className="text-xs text-teal-700 font-medium mb-1">
                      Yanıtınız {review.teacher_reply_at ? `• ${formatDate(review.teacher_reply_at)}` : ""}
                    </div>
                    <p className="text-sm text-teal-900">{review.teacher_reply}</p>
                  </div>
                )}

                {/* Reply Form */}
                {!review.teacher_reply && review.is_approved && (
                  <>
                    {replyingTo === review.id ? (
                      <div className="mt-4 space-y-3">
                        <textarea
                          value={replyText}
                          onChange={(e) => setReplyText(e.target.value)}
                          rows={3}
                          placeholder="Yanıtınızı yazın..."
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={() => {
                              if (replyText.trim()) {
                                replyMutation.mutate({
                                  courseId: review.course_id,
                                  reviewId: review.id,
                                  reply: replyText,
                                });
                              }
                            }}
                            disabled={!replyText.trim() || replyMutation.isLoading}
                            className="px-4 py-2 bg-teal-600 text-white text-sm font-medium rounded-lg hover:bg-teal-700 disabled:opacity-50"
                          >
                            {replyMutation.isLoading ? "Gönderiliyor..." : "Yanıtla"}
                          </button>
                          <button
                            onClick={() => { setReplyingTo(null); setReplyText(""); }}
                            className="px-4 py-2 text-gray-600 text-sm font-medium bg-gray-100 rounded-lg hover:bg-gray-200"
                          >
                            İptal
                          </button>
                        </div>
                      </div>
                    ) : (
                      <button
                        onClick={() => setReplyingTo(review.id)}
                        className="mt-3 text-sm text-teal-600 hover:text-teal-700 font-medium"
                      >
                        💬 Yanıtla
                      </button>
                    )}
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
