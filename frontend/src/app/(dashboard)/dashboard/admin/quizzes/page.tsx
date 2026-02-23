"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizzesApi, type QuizListItem } from "@/lib/api";

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export default function AdminQuizzesPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const pageSize = 20;

  const { data: quizzes, isLoading, error } = useQuery({
    queryKey: ["admin-quizzes", page],
    queryFn: () =>
      quizzesApi.list({
        skip: page * pageSize,
        limit: pageSize,
      }),
  });

  const deleteMutation = useMutation({
    mutationFn: (quizId: string) => quizzesApi.delete(quizId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
  });

  const filteredQuizzes = quizzes?.filter(
    (q) =>
      !search ||
      q.title.toLowerCase().includes(search.toLowerCase())
  ) || [];

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Quiz verileri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Quiz Yönetimi
              </h1>
              <p className="text-teal-100 text-lg">
                Platformdaki tüm quizleri görüntüleyin, düzenleyin ve yönetin
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Toplam Quiz",
            value: isLoading ? "..." : quizzes?.length || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ),
            color: "from-teal-500 to-teal-600",
          },
          {
            label: "Toplam Soru",
            value: isLoading ? "..." : quizzes?.reduce((sum, q) => sum + q.question_count, 0) || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: "from-emerald-500 to-emerald-600",
          },
          {
            label: "Toplam Deneme",
            value: isLoading ? "..." : quizzes?.reduce((sum, q) => sum + q.attempt_count, 0) || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: "from-blue-500 to-blue-600",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
            style={{ animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Quiz ara..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Quiz Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz Listesi</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Quiz Adı</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Soru</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Deneme</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Oluşturulma</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">Yükleniyor...</td>
                </tr>
              ) : filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gray-500">
                    {search ? "Aramayla eşleşen quiz bulunamadı" : "Henüz quiz oluşturulmamış"}
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz, index) => (
                  <tr
                    key={quiz.id}
                    className="border-b border-gray-100 hover:bg-teal-50/50 transition-colors"
                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 20}ms forwards` }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{quiz.title}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {quiz.id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {quiz.question_count} soru
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {quiz.attempt_count} deneme
                      </span>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(quiz.created_at)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            if (confirm("Bu quizi silmek istediğinize emin misiniz?")) {
                              deleteMutation.mutate(quiz.id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-medium text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                        >
                          Sil
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {quizzes && quizzes.length >= pageSize && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200">
            <button
              onClick={() => setPage(Math.max(0, page - 1))}
              disabled={page === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              ← Önceki
            </button>
            <span className="text-sm text-gray-600">Sayfa {page + 1}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={quizzes.length < pageSize}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              Sonraki →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
