"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teacherApplicationsApi, type TeacherApplication } from "@/lib/api";
import Link from "next/link";

export default function AdminTeacherApplicationsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | "">("pending");
  const [selectedApplication, setSelectedApplication] = useState<TeacherApplication | null>(null);
  const [adminNote, setAdminNote] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewActionType, setReviewActionType] = useState<"approved" | "rejected" | null>(null);

  // Fetch applications list
  const { data: applications, isLoading, error } = useQuery({
    queryKey: ["admin-teacher-applications", statusFilter],
    queryFn: () => teacherApplicationsApi.listApplications({ status: statusFilter || undefined }),
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: "approved" | "rejected"; note?: string }) =>
      teacherApplicationsApi.reviewApplication(id, { status, admin_note: note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-teacher-applications"] });
      setShowReviewModal(false);
      setSelectedApplication(null);
      setAdminNote("");
      alert("Başvuru değerlendirmesi başarıyla kaydedildi.");
    },
    onError: (error: any) => {
      alert("İşlem gerçekleştirilemedi: " + (error.response?.data?.detail || error.message));
    },
  });

  const handleReviewAction = (status: "approved" | "rejected") => {
    if (!selectedApplication) return;
    setReviewActionType(status);
    setShowReviewModal(true);
  };

  const submitReview = () => {
    if (!selectedApplication || !reviewActionType) return;
    if (reviewActionType === "rejected" && !adminNote.trim()) {
      alert("Lütfen reddetme sebebini yazın.");
      return;
    }
    reviewMutation.mutate({
      id: selectedApplication.id,
      status: reviewActionType,
      note: adminNote || undefined,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
          Eğitmen Başvuruları
        </h1>
        <p className="text-gray-600 mt-1">Platforma eğitmen olmak için yapılan başvuruları inceleyin, evrakları kontrol edin ve onaylayın.</p>
      </div>

      {/* Status Filters */}
      <div className="flex border-b border-gray-200">
        {[
          { id: "pending", label: "⏳ Bekleyen Başvurular" },
          { id: "approved", label: "✅ Onaylananlar" },
          { id: "rejected", label: "❌ Reddedilenler" },
          { id: "", label: "🔍 Tümü" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => {
              setStatusFilter(tab.id as any);
              setSelectedApplication(null);
            }}
            className={`px-6 py-4 text-sm font-bold border-b-2 transition-colors -mb-px ${
              statusFilter === tab.id
                ? "border-teal-500 text-teal-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Applications List */}
        <div className={`${selectedApplication ? "lg:col-span-6" : "lg:col-span-12"} space-y-4`}>
          {isLoading ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center">
              <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-500 mt-4 font-semibold">Başvurular yükleniyor...</p>
            </div>
          ) : error ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-700 font-semibold">
              Başvurular listelenirken bir sorun oluştu.
            </div>
          ) : applications?.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 border border-gray-100 shadow-sm text-center text-gray-500 font-semibold">
              Kriterlere uygun başvuru bulunamadı.
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden divide-y divide-gray-100">
              {applications?.map((app) => (
                <div
                  key={app.id}
                  onClick={() => setSelectedApplication(app)}
                  className={`p-6 cursor-pointer hover:bg-slate-50 transition-colors flex items-center justify-between ${
                    selectedApplication?.id === app.id ? "bg-teal-50/40 hover:bg-teal-50/50" : ""
                  }`}
                >
                  <div className="space-y-1">
                    <h3 className="font-bold text-gray-900 text-base">{app.full_name}</h3>
                    <p className="text-xs font-semibold text-gray-500">📧 {app.phone} | 📞 {app.birth_date}</p>
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {app.branches.slice(0, 3).map((b) => (
                        <span key={b} className="px-2 py-0.5 bg-teal-50 text-teal-700 rounded-md text-[10px] font-bold">
                          {b}
                        </span>
                      ))}
                      {app.branches.length > 3 && (
                        <span className="text-[10px] text-gray-400 font-bold self-center">+{app.branches.length - 3}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        app.status === "approved"
                          ? "bg-emerald-100 text-emerald-700"
                          : app.status === "rejected"
                          ? "bg-red-100 text-red-700"
                          : "bg-amber-100 text-amber-700"
                      }`}
                    >
                      {app.status === "approved" ? "Onaylandı" : app.status === "rejected" ? "Reddedildi" : "Beklemede"}
                    </span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Detailed Application View */}
        {selectedApplication && (
          <div className="lg:col-span-6 bg-white rounded-3xl p-8 border border-gray-100 shadow-xl space-y-6 self-start relative">
            <button
              onClick={() => setSelectedApplication(null)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 font-bold text-xl"
            >
              ×
            </button>

            <div>
              <h2 className="text-2xl font-black text-gray-900">{selectedApplication.full_name}</h2>
              <p className="text-sm font-semibold text-gray-500">Başvuru Detayları</p>
            </div>

            {/* Kişisel Bilgiler */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Kişisel Bilgiler</h3>
              <div className="grid grid-cols-2 gap-4 text-sm bg-slate-50 p-4 rounded-xl border border-gray-150">
                <div>
                  <span className="text-gray-500 font-semibold block text-xs">Telefon</span>
                  <span className="font-bold text-gray-900">{selectedApplication.phone}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-xs">Doğum Tarihi</span>
                  <span className="font-bold text-gray-900">{selectedApplication.birth_date}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-xs">Cinsiyet</span>
                  <span className="font-bold text-gray-900">{selectedApplication.gender}</span>
                </div>
                <div>
                  <span className="text-gray-500 font-semibold block text-xs">Deneyim Yılı</span>
                  <span className="font-bold text-gray-900">{selectedApplication.experience_years} Yıl</span>
                </div>
                <div className="col-span-2">
                  <span className="text-gray-500 font-semibold block text-xs">Adres</span>
                  <span className="font-medium text-gray-800">{selectedApplication.address}</span>
                </div>
              </div>
            </div>

            {/* Branşlar ve Kademeler */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Seçilen Branşlar</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplication.branches.map((b) => (
                    <span key={b} className="px-3 py-1.5 bg-teal-50 text-teal-700 rounded-xl text-xs font-bold border border-teal-100">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Eğitim Kademeleri</h3>
                <div className="flex flex-wrap gap-1.5">
                  {selectedApplication.levels.map((l) => (
                    <span key={l} className="px-3 py-1.5 bg-indigo-50 text-indigo-700 rounded-xl text-xs font-bold border border-indigo-100">
                      {l}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Kendinizi Tanıtınız */}
            <div className="space-y-1.5">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Öğretmen Tanıtımı</h3>
              <div className="bg-slate-50 p-4 rounded-xl border border-gray-150 text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedApplication.bio}
              </div>
            </div>

            {/* Evraklar */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Yüklenen Belgeler</h3>
              <div className="space-y-2">
                {[
                  { label: "📄 Özgeçmiş (CV)", path: selectedApplication.cv_path },
                  { label: "🎓 Mezuniyet Belgesi", path: selectedApplication.graduation_cert_path },
                  { label: "🛡️ Adli Sicil Belgesi", path: selectedApplication.criminal_record_path },
                ].map((doc) => (
                  <a
                    key={doc.label}
                    href={`http://127.0.0.1:8000/api/v1/media/documents/${doc.path.split("/").pop()}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3.5 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-300 hover:bg-teal-50/20 transition-all font-semibold text-gray-700 text-sm"
                  >
                    <span>{doc.label}</span>
                    <span className="text-teal-600 text-xs font-bold">İndir / Görüntüle 📥</span>
                  </a>
                ))}
              </div>
            </div>

            {/* Admin İnceleme Sonucu / Notu */}
            {selectedApplication.status !== "pending" && (
              <div className="p-4 rounded-xl border-2 text-sm space-y-1.5 bg-slate-50 border-gray-200">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block">İnceleme Sonucu</span>
                <p className="font-bold text-gray-900">
                  Karar: {selectedApplication.status === "approved" ? "✅ Onaylandı" : "❌ Reddedildi"}
                </p>
                {selectedApplication.admin_note && (
                  <p className="text-gray-700 font-medium leading-relaxed">Gerekçe: "{selectedApplication.admin_note}"</p>
                )}
              </div>
            )}

            {/* Actions for Pending Applications */}
            {selectedApplication.status === "pending" && (
              <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
                <button
                  onClick={() => handleReviewAction("rejected")}
                  disabled={reviewMutation.isPending}
                  className="flex-1 py-3 bg-red-50 text-red-600 rounded-xl hover:bg-red-100 font-bold transition-all text-sm"
                >
                  Başvuruyu Reddet
                </button>
                <button
                  onClick={() => handleReviewAction("approved")}
                  disabled={reviewMutation.isPending}
                  className="flex-1 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg font-bold transition-all text-sm"
                >
                  Başvuruyu Onayla
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Review Modal (Approval/Rejection Dialog) */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 space-y-6 animate-scaleUp">
            <h3 className="text-2xl font-black text-gray-900">
              {reviewActionType === "approved" ? "Eğitmen Başvurusunu Onayla" : "Eğitmen Başvurusunu Reddet"}
            </h3>

            <p className="text-gray-600 text-sm font-semibold leading-relaxed">
              {reviewActionType === "approved"
                ? "Bu başvuruyu onayladığınızda kullanıcının hesabı anında doğrulanmış eğitmen rolüne yükseltilecek ve ders vermeye (kurs oluşturmaya) başlayabilecektir."
                : "Başvuruyu reddettiğinizde eğitmen adayına gerekçe notu bildirilecektir. Lütfen aşağıya reddetme sebebini detaylıca yazın."}
            </p>

            <div className="space-y-2">
              <label className="block text-sm font-bold text-gray-700">Admin Gerekçe Notu</label>
              <textarea
                value={adminNote}
                onChange={(e) => setAdminNote(e.target.value)}
                rows={4}
                required={reviewActionType === "rejected"}
                placeholder={reviewActionType === "approved" ? "Eklemek istediğiniz not (isteğe bağlı)..." : "Reddetme gerekçesini girin (zorunlu)..."}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium text-gray-900"
              />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setAdminNote("");
                }}
                className="flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-all text-sm"
              >
                Vazgeç
              </button>
              <button
                onClick={submitReview}
                disabled={reviewMutation.isPending}
                className={`flex-1 py-3 text-white rounded-xl font-bold transition-all text-sm ${
                  reviewActionType === "approved"
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:shadow-lg"
                    : "bg-red-600 hover:bg-red-700 hover:shadow-lg"
                }`}
              >
                {reviewMutation.isPending ? "İşlem yapılıyor..." : "Kararı Uygula"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
