"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { reviewsApi, type ReviewListItem } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

export default function AdminReviewsPage() {
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  const [statusFilter, setStatusFilter] = useState<"all" | "pending" | "approved" | "rejected">("all");
  const [selectedReview, setSelectedReview] = useState<ReviewListItem | null>(null);
  const [moderationNote, setModerationNote] = useState("");
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

  const { data: reviews, isLoading } = useQuery({
    queryKey: ["admin-reviews", statusFilter],
    queryFn: () =>
      reviewsApi.listAdmin({
        limit: 100,
        is_approved:
          statusFilter === "pending" ? false : statusFilter === "approved" ? true : statusFilter === "rejected" ? false : undefined,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.approve(reviewId, { moderation_note: moderationNote || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Yorum onaylandı");
      setShowApproveModal(false);
      setSelectedReview(null);
      setModerationNote("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Bir hata oluştu");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.reject(reviewId, { moderation_note: moderationNote || null }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Yorum reddedildi");
      setShowRejectModal(false);
      setSelectedReview(null);
      setModerationNote("");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Bir hata oluştu");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (reviewId: string) => reviewsApi.delete(reviewId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-reviews"] });
      toast.success("Yorum silindi");
    },
    onError: (error: any) => {
      toast.error(error?.message || "Bir hata oluştu");
    },
  });

  const filteredReviews = reviews || [];
  const pendingCount = filteredReviews.filter((r) => !r.is_approved && !r.approved_at).length;
  const approvedCount = filteredReviews.filter((r) => r.is_approved).length;
  const rejectedCount = filteredReviews.filter((r) => !r.is_approved && r.approved_at === null && r.moderation_note).length;

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }).map((_, i) => (
      <svg
        key={i}
        className={`w-5 h-5 ${i < rating ? "text-amber-400 fill-current" : "text-gray-300"}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20">
      {/* Hero Header - Vibrant Teal/Emerald Gradient */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative px-8 py-16">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
                Yorum Yönetimi
              </h1>
              <p className="text-teal-100 text-xl font-medium max-w-2xl">
                Kurs yorumlarını onayla, reddet veya sil
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <svg className="w-20 h-20 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-amber-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/40 blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Bekleyen</p>
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-black text-amber-900">{pendingCount}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-emerald-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/40 blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Onaylanan</p>
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-black text-emerald-900">{approvedCount}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-rose-50/50 to-pink-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-rose-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-200/40 blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-600">Reddedilen</p>
              <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <p className="text-4xl font-black text-rose-900">{rejectedCount}</p>
          </div>
        </div>
      </div>

      {/* Filter Chips */}
      <div className="mb-8">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-teal-100/50">
          <div className="flex flex-wrap gap-3">
            {[
              { value: "all", label: "Tümü", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
              { value: "pending", label: "Bekleyen", color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
              { value: "approved", label: "Onaylanan", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
              { value: "rejected", label: "Reddedilen", color: "bg-rose-100 text-rose-700 hover:bg-rose-200" },
            ].map((filter) => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value as any)}
                className={`px-5 py-2.5 rounded-full text-sm font-bold transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                  statusFilter === filter.value
                    ? `${filter.color} ring-2 ring-offset-2 ring-teal-400 shadow-md`
                    : `${filter.color}`
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Yükleniyor...</p>
          </div>
        </div>
      ) : filteredReviews.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center border-2 border-teal-100/50 shadow-xl">
          <svg className="w-16 h-16 text-teal-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
          <p className="text-gray-600 text-lg font-medium">Yorum bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredReviews.map((review, index) => (
            <div
              key={review.id}
              className="group relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-teal-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards` }}
            >
              <div className={`absolute top-0 left-0 right-0 h-1.5 rounded-t-2xl ${
                !review.is_approved && !review.approved_at
                  ? "bg-gradient-to-r from-amber-500 to-orange-500"
                  : review.is_approved
                  ? "bg-gradient-to-r from-emerald-500 to-teal-500"
                  : "bg-gradient-to-r from-rose-500 to-pink-500"
              }`}></div>
              
              <div className="relative">
                <div className="flex items-start justify-between gap-6 mb-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900 truncate">
                        {review.course?.title || "Kurs silinmiş"}
                      </h3>
                      {review.course?.slug && (
                        <Link
                          href={`/courses/${review.course.slug}`}
                          className="text-xs text-teal-600 hover:text-teal-800 font-semibold"
                          target="_blank"
                        >
                          Kursu Gör →
                        </Link>
                      )}
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex items-center gap-2">
                        <div className="flex">{renderStars(review.rating)}</div>
                        <span className="text-sm font-bold text-gray-700">({review.rating}/5)</span>
                      </div>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-600 font-medium">{review.user.full_name}</span>
                      <span className="text-sm text-gray-500">•</span>
                      <span className="text-sm text-gray-500">{formatDate(review.created_at)}</span>
                    </div>
                    {review.title && (
                      <h4 className="text-base font-semibold text-gray-900 mb-2">{review.title}</h4>
                    )}
                    <p className="text-gray-700 leading-relaxed mb-3 line-clamp-3">{review.comment || "Yorum metni yok"}</p>
                    
                    {review.teacher_reply && (
                      <div className="mt-4 p-4 rounded-xl bg-gradient-to-r from-teal-50/50 to-emerald-50/50 border-2 border-teal-100/50">
                        <p className="text-xs font-bold text-teal-600 uppercase tracking-wider mb-2">Eğitmen Cevabı</p>
                        <p className="text-sm text-gray-700">{review.teacher_reply}</p>
                        {review.teacher_reply_at && (
                          <p className="text-xs text-gray-500 mt-2">{formatDate(review.teacher_reply_at)}</p>
                        )}
                      </div>
                    )}
                  </div>
                  
                  <div className="flex flex-col items-end gap-2">
                    <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      !review.is_approved && !review.approved_at
                        ? "bg-amber-100 text-amber-800 border border-amber-300"
                        : review.is_approved
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-rose-100 text-rose-800 border border-rose-300"
                    }`}>
                      {!review.is_approved && !review.approved_at
                        ? "Beklemede"
                        : review.is_approved
                        ? "Onaylandı"
                        : "Reddedildi"}
                    </span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  {!review.is_approved && !review.approved_at && (
                    <>
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowApproveModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        Onayla
                      </button>
                      <button
                        onClick={() => {
                          setSelectedReview(review);
                          setShowRejectModal(true);
                        }}
                        className="px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold hover:shadow-lg hover:scale-105 transition-all duration-200"
                      >
                        Reddet
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Bu yorumu silmek istediğinize emin misiniz?")) {
                        deleteMutation.mutate(review.id);
                      }
                    }}
                    className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200 hover:scale-105 transition-all duration-200"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Approve Modal */}
      {showApproveModal && selectedReview && (
        <div             className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-teal-200">
            <h3 className="text-2xl font-black text-gray-900 mb-4">Yorumu Onayla</h3>
            <p className="text-gray-600 mb-4">
              <strong>{selectedReview.user.full_name}</strong> tarafından yazılan yorumu onaylamak istediğinize emin misiniz?
            </p>
            <textarea
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              placeholder="Moderasyon notu (opsiyonel)"
              className="w-full p-3 rounded-xl border-2 border-gray-200 mb-4 focus:border-teal-400 focus:ring-4 focus:ring-teal-100"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowApproveModal(false);
                  setSelectedReview(null);
                  setModerationNote("");
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={() => approveMutation.mutate(selectedReview.id)}
                disabled={approveMutation.isPending}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold hover:shadow-lg disabled:opacity-50"
              >
                {approveMutation.isPending ? "Onaylanıyor..." : "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && selectedReview && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border-2 border-rose-200">
            <h3 className="text-2xl font-black text-gray-900 mb-4">Yorumu Reddet</h3>
            <p className="text-gray-600 mb-4">
              <strong>{selectedReview.user.full_name}</strong> tarafından yazılan yorumu reddetmek istediğinize emin misiniz?
            </p>
            <textarea
              value={moderationNote}
              onChange={(e) => setModerationNote(e.target.value)}
              placeholder="Red sebebi (önerilir)"
              className="w-full p-3 rounded-xl border-2 border-gray-200 mb-4 focus:border-rose-400 focus:ring-4 focus:ring-rose-100"
              rows={3}
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRejectModal(false);
                  setSelectedReview(null);
                  setModerationNote("");
                }}
                className="flex-1 px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-semibold hover:bg-gray-200"
              >
                İptal
              </button>
              <button
                onClick={() => rejectMutation.mutate(selectedReview.id)}
                disabled={rejectMutation.isPending}
                className="flex-1 px-4 py-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 text-white font-semibold hover:shadow-lg disabled:opacity-50"
              >
                {rejectMutation.isPending ? "Reddediliyor..." : "Reddet"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}
