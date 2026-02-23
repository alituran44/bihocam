"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Avatar from "@/components/Avatar";
import { coursesApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

// Confirmation Modal Component
function ConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText,
  confirmColor,
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText: string;
  confirmColor: string;
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex gap-3 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            İptal
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg hover:shadow-lg transition-all font-medium ${confirmColor}`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function PendingCoursesPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string; action: "approve" | "reject" } | null>(null);
  const [rejectNote, setRejectNote] = useState("");

  // Admin kontrolü
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  // Bekleyen kursları çek
  const { data: pendingCourses, isLoading, error } = useQuery({
    queryKey: ["admin-pending-courses"],
    queryFn: () => coursesApi.listPendingCourses(0, 100),
  });

  // Onaylama mutation
  const approveMutation = useMutation({
    mutationFn: async (courseId: string) => {
      return await coursesApi.approveCourse(courseId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-courses"] });
      setSelectedCourse(null);
    },
  });

  // Reddetme mutation
  const rejectMutation = useMutation({
    mutationFn: async ({ courseId, note }: { courseId: string; note: string }) => {
      return await coursesApi.rejectCourse(courseId, note);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pending-courses"] });
      setSelectedCourse(null);
      setRejectNote("");
    },
  });

  const handleApprove = (course: any) => {
    setSelectedCourse({ id: course.id, title: course.title, action: "approve" });
  };

  const handleReject = (course: any) => {
    setSelectedCourse({ id: course.id, title: course.title, action: "reject" });
  };

  const confirmApprove = () => {
    if (selectedCourse) {
      approveMutation.mutate(selectedCourse.id);
    }
  };

  const confirmReject = () => {
    if (selectedCourse && rejectNote.trim().length >= 10) {
      rejectMutation.mutate({ courseId: selectedCourse.id, note: rejectNote });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600 mb-4">Kurslar yüklenirken bir hata oluştu.</p>
          <button
            onClick={() => queryClient.invalidateQueries({ queryKey: ["admin-pending-courses"] })}
            className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

  // İstatistikler
  const stats = {
    total: pendingCourses?.length || 0,
    today: pendingCourses?.filter((c: any) => {
      const today = new Date();
      const courseDate = new Date(c.created_at);
      return courseDate.toDateString() === today.toDateString();
    }).length || 0,
    thisWeek: pendingCourses?.filter((c: any) => {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      return new Date(c.created_at) >= weekAgo;
    }).length || 0,
  };

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Bekleyen Eğitimler</h1>
        <p className="text-gray-600">Onay bekleyen kursları inceleyin ve onaylayın veya reddedin.</p>
      </div>

      {/* İstatistikler */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Toplam Bekleyen</p>
              <p className="text-3xl font-bold text-gray-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Bugün Eklenen</p>
              <p className="text-3xl font-bold text-gray-900">{stats.today}</p>
            </div>
            <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 mb-1">Bu Hafta</p>
              <p className="text-3xl font-bold text-gray-900">{stats.thisWeek}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Empty State */}
      {!pendingCourses || pendingCourses.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-gray-100">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Bekleyen kurs bulunmuyor</h3>
          <p className="text-gray-600">Şu anda onay bekleyen kurs yok.</p>
        </div>
      ) : (
        /* Courses Grid/Table */
        <div className="bg-white rounded-2xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kurs</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Eğitmen</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Kategoriler</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Ders Sayısı</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Fiyat</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase tracking-wider">Tarih</th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-700 uppercase tracking-wider">İşlemler</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingCourses.map((course: any) => (
                  <tr key={course.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {course.thumbnail_path ? (
                          <img
                            src={course.thumbnail_path}
                            alt={course.title}
                            className="w-16 h-16 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-teal-100 to-teal-200 flex items-center justify-center">
                            <svg className="w-8 h-8 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        <div>
                          <Link
                            href={`/dashboard/admin/courses/${course.id}`}
                            className="font-semibold text-gray-900 hover:text-teal-600 transition-colors block mb-1"
                          >
                            {course.title}
                          </Link>
                          {course.description && (
                            <p className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                              {course.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Avatar
                          src={(course.teacher as any)?.avatar_url}
                          name={course.teacher?.full_name || "?"}
                          size="sm"
                        />
                        <span className="text-gray-700 font-medium">{course.teacher?.full_name || "Bilinmiyor"}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {course.categories && course.categories.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {course.categories.slice(0, 2).map((cat: any) => (
                            <span
                              key={cat.id}
                              className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-teal-50 text-teal-700"
                            >
                              {cat.name}
                            </span>
                          ))}
                          {course.categories.length > 2 && (
                            <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600">
                              +{course.categories.length - 2}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">Kategori yok</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                        <span className="text-gray-700 font-medium">{course.lessons?.length || 0} ders</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        {course.discount_price ? (
                          <>
                            <span className="text-gray-900 font-semibold">₺{Number(course.discount_price).toFixed(2)}</span>
                            <span className="text-sm text-gray-400 line-through">₺{Number(course.price).toFixed(2)}</span>
                          </>
                        ) : (
                          <span className="text-gray-900 font-semibold">
                            {Number(course.price) === 0 ? "Ücretsiz" : `₺${Number(course.price).toFixed(2)}`}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col">
                        <span className="text-sm text-gray-700 font-medium">
                          {new Date(course.created_at).toLocaleDateString("tr-TR", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                        <span className="text-xs text-gray-500">
                          {new Date(course.created_at).toLocaleTimeString("tr-TR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/admin/courses/${course.id}`}
                          className="px-3 py-1.5 text-sm font-medium text-teal-600 bg-teal-50 rounded-lg hover:bg-teal-100 transition-colors"
                        >
                          İncele
                        </Link>
                        <button
                          onClick={() => handleApprove(course)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-teal-500 to-teal-600 rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                        >
                          Onayla
                        </button>
                        <button
                          onClick={() => handleReject(course)}
                          className="px-3 py-1.5 text-sm font-medium text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all"
                        >
                          Reddet
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Approve Confirmation Modal */}
      <ConfirmationModal
        isOpen={selectedCourse?.action === "approve"}
        onClose={() => setSelectedCourse(null)}
        onConfirm={confirmApprove}
        title="Kursu Onayla"
        message={`"${selectedCourse?.title}" adlı kursu onaylamak istediğinize emin misiniz? Kurs yayınlanacak ve öğrenciler tarafından görülebilecek.`}
        confirmText="Evet, Onayla"
        confirmColor="bg-gradient-to-r from-teal-500 to-teal-600"
      />

      {/* Reject Confirmation Modal */}
      {selectedCourse?.action === "reject" && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Kursu Reddet</h3>
            <p className="text-gray-600 mb-4">"{selectedCourse.title}" adlı kursu reddetmek istediğinize emin misiniz?</p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">Red Sebebi *</label>
              <textarea
                value={rejectNote}
                onChange={(e) => setRejectNote(e.target.value)}
                placeholder="Kursun neden reddedildiğini açıklayın (en az 10 karakter)"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
                rows={4}
              />
              {rejectNote.trim().length > 0 && rejectNote.trim().length < 10 && (
                <p className="text-sm text-red-600 mt-1">Red sebebi en az 10 karakter olmalıdır.</p>
              )}
            </div>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => {
                  setSelectedCourse(null);
                  setRejectNote("");
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={confirmReject}
                disabled={rejectNote.trim().length < 10 || rejectMutation.isPending}
                className="px-4 py-2 text-white bg-gradient-to-r from-orange-500 to-orange-600 rounded-lg hover:shadow-lg transition-all font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {rejectMutation.isPending ? "Reddediliyor..." : "Evet, Reddet"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
