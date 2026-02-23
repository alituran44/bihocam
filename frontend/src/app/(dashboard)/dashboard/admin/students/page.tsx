"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { studentsApi, type StudentListItem } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

export default function AdminStudentsPage() {
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

  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [searchQuery, setSearchQuery] = useState("");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-students", page, searchQuery],
    queryFn: () =>
      studentsApi.list({
        skip: (page - 1) * limit,
        limit,
        q: searchQuery || undefined,
      }),
  });

  const students = data?.items || [];
  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleDateString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-emerald-50/20">
      {/* Hero Header - Editorial Magazine Style */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
        <div className="relative px-8 py-16">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
                Öğrenci Yönetimi
              </h1>
              <p className="text-teal-100 text-xl font-medium max-w-2xl">
                {data?.total ? `${data.total} öğrenci` : "Tüm öğrencileri görüntüle ve yönet"}
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center transform rotate-6 hover:rotate-0 transition-transform duration-500">
                <svg className="w-20 h-20 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards - Asymmetric Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-teal-50/50 to-emerald-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-teal-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:border-teal-300">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-teal-200/40 to-emerald-200/40 blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Toplam Öğrenci</p>
              <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-4xl font-black text-teal-900">{data?.total || 0}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-emerald-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:border-emerald-300">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/40 blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Aktif Öğrenci</p>
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-4xl font-black text-emerald-900">
              {students.filter((s) => s.is_active).length}
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-amber-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:border-amber-300">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/40 blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Toplam Kayıt</p>
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <p className="text-4xl font-black text-amber-900">
              {students.reduce((sum, s) => sum + s.enrollment_count, 0)}
            </p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-rose-50/50 to-pink-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-rose-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl hover:border-rose-300">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-rose-200/40 to-pink-200/40 blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-rose-600">Toplam Sipariş</p>
              <svg className="w-6 h-6 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <p className="text-4xl font-black text-rose-900">
              {students.reduce((sum, s) => sum + s.order_count, 0)}
            </p>
          </div>
        </div>
      </div>

      {/* Search Bar - Glassmorphism */}
      <div className="mb-8">
        <div className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-teal-100/50">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Öğrenci adı veya e-posta ara..."
              className="w-full pl-14 pr-5 py-4 bg-gradient-to-r from-teal-50/50 to-emerald-50/50 border-2 border-teal-200/50 rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-300 text-gray-900 placeholder-teal-400 font-medium text-lg"
            />
          </div>
        </div>
      </div>

      {/* Students Table - Modern Card Design */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Yükleniyor...</p>
          </div>
        </div>
      ) : error ? (
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <p className="text-red-800 font-semibold">Bir hata oluştu. Lütfen tekrar deneyin.</p>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center border-2 border-teal-100/50 shadow-xl">
          <svg className="w-16 h-16 text-teal-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-600 text-lg font-medium">Öğrenci bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student, index) => (
            <Link
              key={student.id}
              href={`/dashboard/admin/students/${student.id}`}
              className="group block"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards` }}
            >
              <div className="relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-teal-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-2xl"></div>
                <div className="relative flex items-center justify-between gap-6">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {student.full_name.charAt(0).toUpperCase()}
                      </div>
                      {student.is_active && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-400 rounded-full border-2 border-white shadow-sm"></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-teal-600 transition-colors">
                        {student.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{student.email}</p>
                    </div>
                  </div>
                  <div className="hidden md:flex items-center gap-6">
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Kayıt</p>
                      <p className="text-sm font-bold text-gray-900">{student.enrollment_count}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Sipariş</p>
                      <p className="text-sm font-bold text-gray-900">{student.order_count}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">Kayıt Tarihi</p>
                      <p className="text-sm font-bold text-gray-900">{formatDate(student.created_at)}</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <div className={`px-3 py-1.5 rounded-lg text-xs font-bold ${
                      student.is_active
                        ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                        : "bg-gray-100 text-gray-800 border border-gray-300"
                    }`}>
                      {student.is_active ? "Aktif" : "Pasif"}
                    </div>
                  </div>
                </div>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none"></div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-xl border-2 border-teal-200/50 text-teal-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-50 transition-all duration-200"
          >
            Önceki
          </button>
          <span className="px-4 py-2 text-gray-700 font-semibold">
            Sayfa {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 rounded-xl bg-white/80 backdrop-blur-xl border-2 border-teal-200/50 text-teal-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-teal-50 transition-all duration-200"
          >
            Sonraki
          </button>
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
