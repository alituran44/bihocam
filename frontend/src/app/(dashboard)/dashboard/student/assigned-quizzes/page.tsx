"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { quizzesApi } from "@/lib/api";

export default function StudentAssignedQuizzesPage() {
  const { data: assignments, isLoading, error } = useQuery({
    queryKey: ["my-assigned-quizzes"],
    queryFn: () => quizzesApi.listMyAssignments(),
  });

  const list = assignments || [];

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto space-y-8 animate-pulse">
        <div className="h-12 w-64 bg-gray-200 rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-44 bg-gray-200 rounded-2xl border border-gray-150" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <h2 className="text-2xl font-bold text-gray-900">Atanan Testlerim & Sınavlar</h2>
        <p className="text-gray-500 text-sm mt-1">
          Eğitmenleriniz tarafından size veya kayıtlı olduğunuz kurslara gönderilen deneme sınavları ve testleri buradan takip edip çözebilirsiniz.
        </p>
      </div>

      {list.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-16 text-center max-w-xl mx-auto shadow-sm">
          <div className="w-16 h-16 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <h3 className="text-lg font-bold text-gray-900 mb-1">Henüz Atanmış Testiniz Yok</h3>
          <p className="text-gray-500 text-sm">
            Eğitmenleriniz sınav tanımlayıp gönderdiğinde burada listelenecektir.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {list.map((a) => {
            const quiz = a.quiz;
            const attempt = a.my_attempt;
            const isCompleted = attempt?.status === "completed";
            const isInProgress = attempt?.status === "in_progress";
            
            // Check if past due date
            const isOverdue = a.due_date && new Date(a.due_date) < new Date() && !isCompleted;

            return (
              <div
                key={a.id}
                className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md hover:border-teal-200 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <span className="text-[10px] font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2 py-0.5 rounded">
                      {a.course_id ? "Kurs Testi" : "Kişisel Sınav"}
                    </span>
                    
                    {/* Status Badge */}
                    {isCompleted ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${
                        attempt.score_percentage >= (quiz?.passing_score || 70)
                          ? "bg-green-50 border-green-200 text-green-700"
                          : "bg-red-50 border-red-200 text-red-700"
                      }`}>
                        {attempt.score_percentage >= (quiz?.passing_score || 70) ? "Başarılı" : "Başarısız"} (%{attempt.score_percentage})
                      </span>
                    ) : isOverdue ? (
                      <span className="text-[10px] font-bold bg-red-50 border border-red-200 text-red-700 px-2 py-0.5 rounded">
                        Süresi Geçti
                      </span>
                    ) : isInProgress ? (
                      <span className="text-[10px] font-bold bg-amber-50 border border-amber-200 text-amber-700 px-2 py-0.5 rounded">
                        Devam Ediyor
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold bg-gray-50 border border-gray-200 text-gray-500 px-2 py-0.5 rounded">
                        Çözülmedi
                      </span>
                    )}
                  </div>

                  <h3 className="font-bold text-base text-gray-900 leading-snug mb-1.5">{quiz?.title || "Test"}</h3>
                  {quiz?.description && (
                    <p className="text-gray-500 text-xs line-clamp-2 mb-4 leading-relaxed">{quiz.description}</p>
                  )}

                  {/* Sınav Özellikleri */}
                  <div className="grid grid-cols-3 gap-2 border-y border-gray-50 py-3 mb-4 text-center">
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Geçme Notu</p>
                      <p className="text-xs font-semibold text-gray-700">%{quiz?.passing_score}%</p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Süre Sınırı</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {quiz?.time_limit_minutes ? `${quiz.time_limit_minutes} dk` : "Sınırsız"}
                      </p>
                    </div>
                    <div className="space-y-0.5">
                      <p className="text-[10px] text-gray-400 font-bold uppercase">Maks Deneme</p>
                      <p className="text-xs font-semibold text-gray-700">
                        {quiz?.max_attempts ? `${quiz.max_attempts} Hak` : "Sınırsız"}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4 mt-2">
                  <div className="flex flex-col text-[10px] text-gray-400 font-bold">
                    {a.due_date ? (
                      <span className={isOverdue ? "text-red-500" : "text-gray-500"}>
                        Son Tarih: {new Date(a.due_date).toLocaleDateString("tr-TR")}
                      </span>
                    ) : (
                      <span>Son Tarih: Yok</span>
                    )}
                    <span>Tarih: {new Date(a.created_at).toLocaleDateString("tr-TR")}</span>
                  </div>

                  {isCompleted ? (
                    <Link
                      href={`/dashboard/student/assigned-quizzes/${a.id}`}
                      className="px-4 py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold rounded-xl border border-gray-200 transition-all"
                    >
                      Sonucu Gör
                    </Link>
                  ) : (
                    <Link
                      href={`/dashboard/student/assigned-quizzes/${a.id}`}
                      disabled={isOverdue}
                      className={`px-4 py-2 text-xs font-bold rounded-xl text-white shadow-md transition-all ${
                        isOverdue
                          ? "bg-gray-300 shadow-none cursor-not-allowed"
                          : isInProgress
                          ? "bg-gradient-to-r from-amber-500 to-amber-600 shadow-amber-500/10 hover:shadow-lg"
                          : "bg-gradient-to-r from-teal-500 to-teal-600 shadow-teal-500/10 hover:shadow-lg"
                      }`}
                    >
                      {isInProgress ? "Devam Et" : "Sınavı Başlat"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
