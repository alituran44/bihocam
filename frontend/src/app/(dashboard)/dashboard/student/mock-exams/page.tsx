"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { mockExamsApi, type MockExam, type MockExamAttemptListItem } from "@/lib/api";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function StudentMockExamsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"exams" | "history">("exams");
  const [search, setSearch] = useState("");

  // Fetch available mock exams
  const { data: exams, isLoading: isLoadingExams } = useQuery<MockExam[]>({
    queryKey: ["student-mock-exams"],
    queryFn: () => mockExamsApi.list(),
  });

  // Fetch attempt history
  const { data: history, isLoading: isLoadingHistory } = useQuery<MockExamAttemptListItem[]>({
    queryKey: ["student-mock-attempts"],
    queryFn: () => mockExamsApi.listMyAttempts(),
    enabled: activeTab === "history",
  });

  // Start attempt mutation
  const startAttemptMutation = useMutation({
    mutationFn: (examId: string) => mockExamsApi.startAttempt(examId),
    onSuccess: (data) => {
      toast.success("Deneme sınavı başlatıldı. Başarılar dileriz!");
      router.push(`/dashboard/student/mock-exams/${data.mock_exam_id}/take?attempt_id=${data.id}`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Sınav başlatılırken bir hata oluştu.");
    },
  });

  const filteredExams = exams?.filter(
    (exam) =>
      !search ||
      exam.title.toLowerCase().includes(search.toLowerCase()) ||
      exam.exam_type.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const filteredHistory = history?.filter(
    (item) =>
      !search ||
      item.mock_exam_title.toLowerCase().includes(search.toLowerCase()) ||
      item.mock_exam_type.toLowerCase().includes(search.toLowerCase())
  ) || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Banner */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 via-purple-600 to-indigo-500 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-10">
          <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 tracking-tight">
            Deneme Sınavları
          </h1>
          <p className="text-indigo-100 text-base max-w-2xl">
            LGS ve YKS formatındaki PDF kitapçıklı deneme sınavlarına katılarak seviyenizi ölçün ve ders bazlı detaylı analizinizi anında görün.
          </p>
        </div>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/90 backdrop-blur-sm p-4 rounded-2xl border border-gray-200/60 shadow-lg">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("exams")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "exams"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Aktif Sınavlar
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "history"
                ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/10"
                : "text-gray-600 hover:bg-gray-100"
            }`}
          >
            Geçmiş Sonuçlarım
          </button>
        </div>
        <div className="w-full md:w-80">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Sınav veya format ara..."
            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm bg-white"
          />
        </div>
      </div>

      {/* Active Exams Grid */}
      {activeTab === "exams" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fadeIn">
          {isLoadingExams ? (
            <div className="col-span-full text-center py-12 text-gray-500 font-medium">Sınavlar yükleniyor...</div>
          ) : filteredExams.length === 0 ? (
            <div className="col-span-full text-center py-12 text-gray-500 font-medium bg-white border border-gray-200 rounded-2xl">
              {search ? "Aramayla eşleşen deneme sınavı bulunamadı." : "Şu anda yayında olan deneme sınavı bulunmuyor."}
            </div>
          ) : (
            filteredExams.map((exam) => (
              <div
                key={exam.id}
                className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 relative overflow-hidden group"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-purple-600"></div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold ${
                    exam.exam_type === "LGS" ? "bg-purple-100 text-purple-800" : "bg-indigo-100 text-indigo-800"
                  }`}>
                    {exam.exam_type}
                  </span>
                  <span className="text-xs font-semibold text-gray-500 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    {exam.duration_minutes} Dk
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-1 mb-2">
                  {exam.title}
                </h3>
                <p className="text-xs text-gray-500 mb-6 line-clamp-2 min-h-[32px]">
                  {exam.description || "Bu deneme sınavı için ek açıklama bulunmuyor."}
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-xs font-bold text-gray-700">
                    {exam.questions?.length || 0} Soru
                  </span>
                  <button
                    onClick={() => startAttemptMutation.mutate(exam.id)}
                    disabled={startAttemptMutation.isPending}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-md hover:shadow-lg transition-all"
                  >
                    Sınava Başla
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* History / Results Table */}
      {activeTab === "history" && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6 overflow-hidden animate-fadeIn">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="py-4 px-4">Sınav Adı</th>
                  <th className="py-4 px-4 text-center">Format</th>
                  <th className="py-4 px-4 text-center">Doğru / Yanlış / Boş</th>
                  <th className="py-4 px-4 text-center">Toplam Net</th>
                  <th className="py-4 px-4 text-center">Başarı %</th>
                  <th className="py-4 px-4">Tarih</th>
                  <th className="py-4 px-4 text-right">Detaylar</th>
                </tr>
              </thead>
              <tbody>
                {isLoadingHistory ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm text-gray-500">Sonuçlarınız yükleniyor...</td>
                  </tr>
                ) : filteredHistory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-12 text-sm text-gray-500">
                      {search ? "Aramayla eşleşen sınav sonucunuz bulunmuyor." : "Henüz tamamladığınız deneme sınavı bulunmuyor."}
                    </td>
                  </tr>
                ) : (
                  filteredHistory.map((item) => (
                    <tr key={item.id} className="border-b border-gray-100 hover:bg-indigo-50/20 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-gray-900">{item.mock_exam_title}</div>
                        <div className="text-[10px] text-gray-400 mt-0.5">Attempt ID: {item.id.slice(0, 8)}...</div>
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                          item.mock_exam_type === "LGS" ? "bg-purple-100 text-purple-800" : "bg-indigo-100 text-indigo-800"
                        }`}>
                          {item.mock_exam_type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-center text-xs font-semibold text-gray-700">
                        {item.status === "completed" ? (
                          <div className="flex items-center justify-center gap-1.5">
                            <span className="text-green-600 font-bold">{item.total_correct} D</span>
                            <span>/</span>
                            <span className="text-red-600 font-bold">{item.total_wrong} Y</span>
                            <span>/</span>
                            <span className="text-gray-500 font-bold">{item.total_empty} B</span>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-bold animate-pulse">Devam Ediyor</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center">
                        {item.status === "completed" ? (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-extrabold bg-indigo-100 text-indigo-800">
                            {item.total_net} Net
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="py-4 px-4 text-center font-extrabold text-gray-800">
                        {item.status === "completed" ? `% ${item.score}` : "-"}
                      </td>
                      <td className="py-4 px-4 text-sm text-gray-600">
                        {new Date(item.completed_at || item.started_at).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </td>
                      <td className="py-4 px-4 text-right">
                        {item.status === "completed" ? (
                          <button
                            onClick={() => router.push(`/dashboard/student/mock-exams/attempts/${item.id}/result`)}
                            className="px-3.5 py-2 text-xs font-bold text-indigo-600 hover:text-white border border-indigo-200 hover:bg-indigo-600 rounded-xl transition-all"
                          >
                            Analiz Raporu
                          </button>
                        ) : (
                          <button
                            onClick={() => router.push(`/dashboard/student/mock-exams/${item.mock_exam_id}/take?attempt_id=${item.id}`)}
                            className="px-3.5 py-2 text-xs font-bold text-amber-600 hover:text-white border border-amber-200 hover:bg-amber-600 rounded-xl transition-all animate-pulse"
                          >
                            Devam Et
                          </button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
