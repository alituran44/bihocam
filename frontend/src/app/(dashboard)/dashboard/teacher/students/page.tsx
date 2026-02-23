"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reviewsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

interface TeacherStudent {
  id: string;
  full_name: string;
  email: string;
  enrolled_at: string;
  last_activity_at: string | null;
  completion_rate: number;
  total_lessons: number;
  completed_lessons: number;
  course: {
    id: string;
    title: string;
  } | null;
}

interface TeacherStudentsResponse {
  total: number;
  items: TeacherStudent[];
  skip: number;
  limit: number;
  stats: {
    total_students: number;
    average_completion: number;
    new_this_month: number;
  };
}

export default function TeacherStudentsPage() {
  const user = useAuthStore((state) => state.user);

  if (user?.role !== "teacher") {
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
  const [courseFilter, setCourseFilter] = useState<string>("");

  const { data, isLoading } = useQuery<TeacherStudentsResponse>({
    queryKey: ["teacher-students", page, courseFilter],
    queryFn: () =>
      reviewsApi.getTeacherStudents({
        skip: (page - 1) * limit,
        limit,
        course_id: courseFilter || undefined,
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
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-teal-600 via-emerald-600 to-green-600 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xNSI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
        <div className="relative px-8 py-16">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-5xl md:text-6xl font-black text-white mb-4 tracking-tight leading-tight">
                Öğrencilerim
              </h1>
              <p className="text-teal-100 text-xl font-medium max-w-2xl">
                Kurslarınıza kayıtlı öğrencileri görüntüleyin ve ilerlemelerini takip edin
              </p>
            </div>
            <div className="hidden lg:block">
              <div className="w-40 h-40 rounded-3xl bg-white/10 backdrop-blur-md border-2 border-white/20 flex items-center justify-center transform -rotate-6 hover:rotate-0 transition-transform duration-500">
                <svg className="w-20 h-20 text-white/90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      {data?.stats && (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <div className="group relative overflow-hidden bg-gradient-to-br from-white via-teal-50/50 to-emerald-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-teal-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-teal-200/40 to-emerald-200/40 blur-2xl"></div>
          <div className="relative">
            <div className="flex items-center justify-between mb-2">
              <p className="text-xs font-bold uppercase tracking-widest text-teal-600">Toplam Öğrenci</p>
              <svg className="w-6 h-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <p className="text-4xl font-black text-teal-900">{data.stats.total_students}</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-white via-emerald-50/50 to-teal-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-emerald-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-emerald-200/40 to-teal-200/40 blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-emerald-600">Ortalama İlerleme</p>
                <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-4xl font-black text-emerald-900">{data.stats.average_completion}%</p>
            </div>
          </div>

          <div className="group relative overflow-hidden bg-gradient-to-br from-white via-amber-50/50 to-orange-50/30 backdrop-blur-xl rounded-2xl p-6 shadow-xl border-2 border-amber-100/50 transition-all duration-300 hover:scale-[1.03] hover:shadow-2xl">
            <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br from-amber-200/40 to-orange-200/40 blur-2xl"></div>
            <div className="relative">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-bold uppercase tracking-widest text-amber-600">Bu Ay Yeni</p>
                <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <p className="text-4xl font-black text-amber-900">{data.stats.new_this_month}</p>
            </div>
          </div>
        </div>
      )}

      {/* Students List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-teal-500 border-t-transparent mb-4"></div>
            <p className="text-gray-600 font-medium">Yükleniyor...</p>
          </div>
        </div>
      ) : students.length === 0 ? (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-12 text-center border-2 border-teal-100/50 shadow-xl">
          <svg className="w-16 h-16 text-teal-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
          <p className="text-gray-600 text-lg font-medium">Henüz öğrenci yok</p>
        </div>
      ) : (
        <div className="space-y-4">
          {students.map((student, index) => (
            <div
              key={student.id}
              className="group relative overflow-hidden bg-white/90 backdrop-blur-xl rounded-2xl p-6 shadow-lg border-2 border-transparent hover:border-teal-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-2xl"></div>
              
              <div className="relative">
                <div className="flex items-start justify-between gap-6 mb-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="relative">
                      <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                        {student.full_name.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-bold text-gray-900 mb-1 truncate group-hover:text-teal-600 transition-colors">
                        {student.full_name}
                      </h3>
                      <p className="text-sm text-gray-600 truncate">{student.email}</p>
                      {student.course && (
                        <p className="text-xs text-gray-500 mt-1">Kurs: {student.course.title}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-xs font-semibold text-gray-500 mb-1">İlerleme</p>
                    <p className="text-2xl font-black text-teal-600">{student.completion_rate}%</p>
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                  <div
                    className="bg-gradient-to-r from-teal-500 to-emerald-600 h-3 rounded-full transition-all duration-500"
                    style={{ width: `${student.completion_rate}%` }}
                  ></div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-600">
                  <span>{student.completed_lessons} / {student.total_lessons} ders tamamlandı</span>
                  <div className="flex items-center gap-4">
                    <span>Kayıt: {formatDate(student.enrolled_at)}</span>
                    {student.last_activity_at && (
                      <span>Son Aktivite: {formatDate(student.last_activity_at)}</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
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
