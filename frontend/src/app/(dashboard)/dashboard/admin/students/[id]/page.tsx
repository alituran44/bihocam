"use client";

import { use } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { studentsApi, type StudentDetail } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function AdminStudentDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const user = useAuthStore((state) => state.user);

  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  const { data: student, isLoading, error } = useQuery({
    queryKey: ["admin-student", resolvedParams.id],
    queryFn: () => studentsApi.get(resolvedParams.id),
  });

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

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !student) {
    return (
      <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
        <p className="text-red-800 font-semibold">Öğrenci bulunamadı veya bir hata oluştu.</p>
        <Link href="/dashboard/admin/students" className="mt-4 inline-block text-indigo-600 hover:text-indigo-800 font-semibold">
          ← Geri Dön
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20">
      {/* Back Button */}
      <div className="mb-6">
        <Link
          href="/dashboard/admin/students"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/80 backdrop-blur-xl border-2 border-teal-200/50 text-teal-700 font-semibold hover:bg-teal-50 transition-all duration-200"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Geri Dön
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center gap-6">
            <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-white font-black text-4xl shadow-xl">
              {student.full_name.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tight">
                {student.full_name}
              </h1>
              <p className="text-teal-100 text-lg">{student.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 mb-8">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-teal-100/50">
          <p className="text-xs font-bold uppercase tracking-widest text-teal-600 mb-2">Toplam Kayıt</p>
          <p className="text-3xl font-black text-teal-900">{student.stats.total_enrollments}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-emerald-100/50">
          <p className="text-xs font-bold uppercase tracking-widest text-emerald-600 mb-2">Tamamlanan</p>
          <p className="text-3xl font-black text-emerald-900">{student.stats.completed_courses}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-amber-100/50">
          <p className="text-xs font-bold uppercase tracking-widest text-amber-600 mb-2">Ortalama İlerleme</p>
          <p className="text-3xl font-black text-amber-900">{student.stats.average_completion_rate}%</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-rose-100/50">
          <p className="text-xs font-bold uppercase tracking-widest text-rose-600 mb-2">Toplam Sipariş</p>
          <p className="text-3xl font-black text-rose-900">{student.stats.total_orders}</p>
        </div>
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-purple-100/50">
          <p className="text-xs font-bold uppercase tracking-widest text-purple-600 mb-2">Toplam Harcama</p>
          <p className="text-3xl font-black text-purple-900">{formatMoney(student.stats.total_spent)}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Enrollments */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-teal-100/50">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Kayıtlı Kurslar</h2>
            {student.enrollments.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz kayıtlı kurs yok</p>
            ) : (
              <div className="space-y-4">
                {student.enrollments.map((enrollment) => (
                  <div
                    key={enrollment.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-teal-50/50 to-emerald-50/50 border-2 border-teal-100/50 hover:border-teal-300 transition-all duration-200"
                  >
                    <div className="flex items-start justify-between gap-4 mb-3">
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 mb-1">
                          {enrollment.course?.title || "Kurs silinmiş"}
                        </h3>
                        {enrollment.course?.teacher_name && (
                          <p className="text-sm text-gray-600">Eğitmen: {enrollment.course.teacher_name}</p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold text-gray-500 mb-1">İlerleme</p>
                        <p className="text-lg font-black text-teal-600">{enrollment.completion_rate}%</p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                      <div
                        className="bg-gradient-to-r from-teal-500 to-emerald-600 h-2.5 rounded-full transition-all duration-500"
                        style={{ width: `${enrollment.completion_rate}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center justify-between text-xs text-gray-600">
                      <span>{enrollment.completed_lessons} / {enrollment.total_lessons} ders tamamlandı</span>
                      <span>{formatDate(enrollment.enrolled_at)}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Orders & Info */}
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-indigo-100/50">
            <h2 className="text-2xl font-black text-gray-900 mb-6">Siparişler</h2>
            {student.orders.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Henüz sipariş yok</p>
            ) : (
              <div className="space-y-3">
                {student.orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl bg-gradient-to-r from-rose-50/50 to-pink-50/50 border-2 border-rose-100/50"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-mono text-gray-600">{order.order_number}</span>
                      <span className={`px-2 py-1 rounded-lg text-xs font-bold ${
                        order.status === "paid" ? "bg-emerald-100 text-emerald-800" :
                        order.status === "pending" ? "bg-amber-100 text-amber-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {order.status}
                      </span>
                    </div>
                    <p className="text-lg font-black text-gray-900">{formatMoney(order.total_amount)}</p>
                    <p className="text-xs text-gray-500 mt-1">{formatDate(order.created_at)}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-teal-100/50">
            <h2 className="text-xl font-black text-gray-900 mb-4">Bilgiler</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Telefon</p>
                <p className="text-sm font-medium text-gray-900">{student.phone || "-"}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Kayıt Tarihi</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(student.created_at)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Son Giriş</p>
                <p className="text-sm font-medium text-gray-900">{formatDate(student.last_login_at)}</p>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">Durum</p>
                <span className={`inline-block px-3 py-1 rounded-lg text-xs font-bold ${
                  student.is_active
                    ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                    : "bg-gray-100 text-gray-800 border border-gray-300"
                }`}>
                  {student.is_active ? "Aktif" : "Pasif"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
