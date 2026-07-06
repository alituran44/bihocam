"use client";

import { useQuery } from "@tanstack/react-query";
import { mockExamsApi, type MockExamAttemptAnalysis } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { toast } from "sonner";

export default function MockExamResultPage() {
  const router = useRouter();
  const params = useParams();
  const attemptId = params.attemptId as string;

  // Fetch attempt analysis
  const { data: analysis, isLoading, error } = useQuery<MockExamAttemptAnalysis>({
    queryKey: ["mock-attempt-analysis", attemptId],
    queryFn: () => mockExamsApi.getAttemptAnalysis(attemptId),
    enabled: !!attemptId,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-600">Karne analizi yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (error || !analysis) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-red-800 text-sm font-bold max-w-xl mx-auto text-center">
          Analiz verileri yüklenirken bir hata oluştu. Lütfen sınav geçmişinizi kontrol edin.
        </div>
      </div>
    );
  }

  const { attempt, mock_exam_title, mock_exam_type, subjects_analysis, comparisons } = analysis;

  return (
    <div className="space-y-8 pb-16 max-w-6xl mx-auto">
      {/* Header bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
              mock_exam_type === "LGS" ? "bg-purple-100 text-purple-800" : "bg-indigo-100 text-indigo-800"
            }`}>
              {mock_exam_type} Formatı
            </span>
            <span className="text-xs font-semibold text-gray-400">
              Sınav Tarihi: {new Date(attempt.completed_at || attempt.started_at).toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit"
              })}
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">{mock_exam_title}</h1>
          <p className="text-sm text-gray-500 mt-1">Sınavı başarıyla tamamladınız. Karne detaylarınız aşağıdadır.</p>
        </div>
        <button
          onClick={() => router.push("/dashboard/student/mock-exams")}
          className="px-5 py-2.5 border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-sm"
        >
          ← Deneme Listesine Dön
        </button>
      </div>

      {/* Main Scorecards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
        {[
          {
            label: "Toplam Doğru",
            value: attempt.total_correct,
            color: "from-green-500 to-emerald-600",
            bg: "bg-green-50/50 border-green-100 text-green-700",
          },
          {
            label: "Toplam Yanlış",
            value: attempt.total_wrong,
            color: "from-red-500 to-rose-600",
            bg: "bg-red-50/50 border-red-100 text-red-700",
          },
          {
            label: "Toplam Boş",
            value: attempt.total_empty,
            color: "from-gray-400 to-gray-500",
            bg: "bg-gray-50/80 border-gray-150 text-gray-500",
          },
          {
            label: "Toplam Net",
            value: `${attempt.total_net} Net`,
            color: "from-blue-500 to-indigo-600",
            bg: "bg-blue-50/50 border-blue-100 text-blue-700",
          },
          {
            label: "Başarı Yüzdesi",
            value: `% ${attempt.score}`,
            color: "from-purple-500 to-indigo-600",
            bg: "bg-purple-50/50 border-purple-100 text-purple-700",
          },
        ].map((card, index) => (
          <div
            key={index}
            className={`border rounded-2xl p-5 shadow-sm flex flex-col justify-between min-h-[110px] ${card.bg}`}
          >
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">{card.label}</span>
            <span className="text-2xl font-black">{card.value}</span>
          </div>
        ))}
      </div>

      {/* Subject Statistics Card */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Ders Bazlı Performans Raporu</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-3 px-4">Ders Adı</th>
                <th className="py-3 px-4 text-center">Soru Sayısı</th>
                <th className="py-3 px-4 text-center text-green-600">Doğru</th>
                <th className="py-3 px-4 text-center text-red-600">Yanlış</th>
                <th className="py-3 px-4 text-center text-gray-400">Boş</th>
                <th className="py-3 px-4 text-center text-indigo-600">Net</th>
                <th className="py-3 px-4 text-right">Başarı Yüzdesi</th>
              </tr>
            </thead>
            <tbody>
              {subjects_analysis.map((sub, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="py-3.5 px-4 font-bold text-gray-900">{sub.subject_name}</td>
                  <td className="py-3.5 px-4 text-center font-bold text-gray-600">{sub.total_questions}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-green-600">{sub.correct}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-red-600">{sub.wrong}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-gray-400">{sub.empty}</td>
                  <td className="py-3.5 px-4 text-center font-extrabold text-indigo-600">{sub.net}</td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2.5">
                      <span className="font-extrabold text-gray-700">% {sub.accuracy_percentage}</span>
                      <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-indigo-600 rounded-full"
                          style={{ width: `${sub.accuracy_percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Answer Key Comparison Grid */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-lg p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-2">Detaylı Soru Karşılaştırma Matrisi</h3>
        <p className="text-xs text-gray-500 mb-6">İşaretlemelerinizin doğru cevap anahtarı ile karşılaştırılması.</p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {comparisons.map((c) => {
            let rowColor = "bg-gray-50/50 border-gray-150 text-gray-500";
            let statusText = "BOŞ";
            if (c.selected_answer) {
              if (c.is_correct) {
                rowColor = "bg-green-50/40 border-green-200 text-green-700";
                statusText = "DOĞRU";
              } else {
                rowColor = "bg-red-50/40 border-red-200 text-red-700";
                statusText = "YANLIŞ";
              }
            }

            return (
              <div
                key={c.question_number}
                className={`border rounded-2xl p-4 flex flex-col justify-between gap-3 shadow-sm ${rowColor}`}
              >
                <div className="flex justify-between items-start">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold">Soru {c.question_number}</span>
                    <span className="text-[10px] opacity-80">{c.subject_name}</span>
                  </div>
                  <span className="text-[9px] font-extrabold tracking-wider px-2 py-0.5 rounded-md bg-white/70 border border-white/20">
                    {statusText}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs font-extrabold border-t border-black/5 pt-2.5">
                  <div className="flex flex-col">
                    <span className="text-[9px] opacity-75 font-semibold">Cevabınız:</span>
                    <span className="text-sm">{c.selected_answer || "-"}</span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-[9px] opacity-75 font-semibold">Doğru Cevap:</span>
                    <span className="text-sm text-indigo-700">{c.correct_answer}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
