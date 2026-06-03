"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizzesApi, mediaApi, type QuizListItem } from "@/lib/api";
import { toast } from "sonner";

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

  // Creation form states
  const [showAddForm, setShowAddForm] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<string>("");
  const [maxAttempts, setMaxAttempts] = useState<string>("");
  const [pdfPath, setPdfPath] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);
  const [numberOfOptions, setNumberOfOptions] = useState<number>(4);
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [useAnswerKey, setUseAnswerKey] = useState<boolean>(false);
  const [questionCount, setQuestionCount] = useState<number>(10);
  const [answerKey, setAnswerKey] = useState<Record<number, string>>({});

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
      toast.success("Quiz başarıyla silindi.");
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
    onError: () => {
      toast.error("Quiz silinirken bir hata oluştu.");
    }
  });

  const approveMutation = useMutation({
    mutationFn: (quizId: string) => quizzesApi.approve(quizId),
    onSuccess: () => {
      toast.success("Sınav onaylandı ve öğrencilerin erişimine açıldı.");
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
    onError: () => {
      toast.error("Onaylama işlemi başarısız oldu.");
    }
  });

  const rejectMutation = useMutation({
    mutationFn: (quizId: string) => quizzesApi.reject(quizId),
    onSuccess: () => {
      toast.success("Sınav onayı kaldırıldı. Artık öğrenciler bu sınava erişemez.");
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
    },
    onError: () => {
      toast.error("İşlem başarısız oldu.");
    }
  });

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Lütfen sadece PDF formatında bir dosya yükleyin.");
        return;
      }
      setIsUploadingPdf(true);
      try {
        const result = await mediaApi.uploadDocument("standalone", file);
        setPdfPath(result.path);
        toast.success("Sınav PDF'i başarıyla yüklendi.");
      } catch (err: any) {
        toast.error("PDF yüklenirken bir hata oluştu.");
      } finally {
        setIsUploadingPdf(false);
      }
    }
  };

  const handleCreateQuizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizTitle.trim()) {
      toast.error("Lütfen bir test başlığı girin.");
      return;
    }

    try {
      const payload: any = {
        lesson_id: null, // Admin only creates standalone exams
        title: quizTitle,
        description: quizDescription || null,
        pdf_path: pdfPath || null,
        passing_score: passingScore,
        time_limit_minutes: timeLimit ? parseInt(timeLimit) : null,
        max_attempts: maxAttempts ? parseInt(maxAttempts) : null,
        number_of_options: numberOfOptions,
        start_date: startDate ? new Date(startDate).toISOString() : null,
        end_date: endDate ? new Date(endDate).toISOString() : null,
      };

      const createdQuiz = await quizzesApi.create(payload);

      // If answer key template option is checked, bulk create questions
      if (useAnswerKey && questionCount > 0) {
        const questionsToCreate = Array.from({ length: questionCount }, (_, i) => {
          const qNum = i + 1;
          const correctAns = answerKey[qNum] || "A";
          const optionsPayload: Record<string, string> = {};
          const optionLetters = ["A", "B", "C", "D", "E"].slice(0, numberOfOptions);
          optionLetters.forEach((lettr) => {
            optionsPayload[lettr] = lettr;
          });

          return {
            question_type: "multiple_choice" as const,
            question_text: `${qNum}. Soru`,
            correct_answer: correctAns,
            options: optionsPayload,
            points: Math.round(100 / questionCount),
          };
        });

        await quizzesApi.bulkAddQuestions(createdQuiz.id, questionsToCreate);
      }

      toast.success("Sınav başarıyla tanımlandı (Admin olarak otomatik onaylandı).");
      queryClient.invalidateQueries({ queryKey: ["admin-quizzes"] });
      resetQuizForm();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Sınav tanımlanırken bir hata oluştu.");
    }
  };

  const resetQuizForm = () => {
    setQuizTitle("");
    setQuizDescription("");
    setPassingScore(70);
    setTimeLimit("");
    setMaxAttempts("");
    setPdfPath("");
    setNumberOfOptions(4);
    setStartDate("");
    setEndDate("");
    setUseAnswerKey(false);
    setQuestionCount(10);
    setAnswerKey({});
    setShowAddForm(false);
  };

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
                Quiz & Sınav Yönetimi
              </h1>
              <p className="text-teal-100 text-lg">
                Platformdaki tüm sınavları denetleyin, onaylayın ve yeni bağımsız deneme sınavları tanımlayın.
              </p>
            </div>
            <div className="flex flex-col gap-3">
              <button
                onClick={() => setShowAddForm(!showAddForm)}
                className="px-6 py-3 bg-white text-teal-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-sm shrink-0 flex items-center justify-center gap-2"
              >
                {showAddForm ? "İptal" : "Yeni Sınav Tanımla"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Add New Sınav Form (Admin) */}
      {showAddForm && (
        <div className="bg-white rounded-3xl border border-gray-200/60 shadow-xl p-8 animate-slideDown max-w-4xl mx-auto">
          <h3 className="text-xl font-bold text-gray-900 border-b border-gray-100 pb-3 mb-6">
            Yeni Bağımsız Deneme Sınavı Tanımla
          </h3>
          <form onSubmit={handleCreateQuizSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Sınav Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: YKS Genel Deneme Sınavı - 1"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-semibold text-gray-700">Sınav PDF'i / Test Kitapçığı (İsteğe bağlı)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  disabled={isUploadingPdf}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none"
                />
                {isUploadingPdf && (
                  <p className="text-[10px] text-teal-600 animate-pulse font-semibold">PDF yükleniyor, lütfen bekleyin...</p>
                )}
                {pdfPath && (
                  <p className="text-[10px] text-green-600 font-extrabold flex items-center gap-1">
                    <span>✓</span> Sınav PDF'i Başarıyla Yüklendi!
                  </p>
                )}
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Sınav Açıklaması (İsteğe bağlı)</label>
                <textarea
                  rows={2}
                  placeholder="Sınav yönergelerini girin..."
                  value={quizDescription}
                  onChange={(e) => setQuizDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Geçme Skoru (% - 0-100) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  max={100}
                  value={passingScore}
                  onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Süre Sınırı (Dakika)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Süre sınırı yok"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Maksimum Deneme Sayısı</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Sınırsız deneme"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Şık Sayısı</label>
                <select
                  value={numberOfOptions}
                  onChange={(e) => setNumberOfOptions(parseInt(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm bg-white"
                >
                  <option value={4}>4 Şık (A, B, C, D)</option>
                  <option value={5}>5 Şık (A, B, C, D, E)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Başlangıç Tarih/Saat</label>
                <input
                  type="datetime-local"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Bitiş Tarih/Saat</label>
                <input
                  type="datetime-local"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm"
                />
              </div>

              {/* Cevap Anahtarı Girişi Blok */}
              <div className="md:col-span-3 border-t border-gray-100 pt-4">
                <div className="flex items-center gap-2 mb-3">
                  <input
                    type="checkbox"
                    id="adminUseAnswerKey"
                    checked={useAnswerKey}
                    onChange={(e) => setUseAnswerKey(e.target.checked)}
                    className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                  />
                  <label htmlFor="adminUseAnswerKey" className="text-sm font-bold text-gray-800 cursor-pointer">
                    Cevap Anahtarı Girişi ile Soruları Otomatik Üret
                  </label>
                </div>

                {useAnswerKey && (
                  <div className="bg-gray-50 border border-gray-150 rounded-2xl p-5 space-y-4 animate-slideDown">
                    <div className="flex items-center gap-4 max-w-xs">
                      <div className="space-y-1">
                        <label className="text-xs font-semibold text-gray-500">Soru Sayısı</label>
                        <input
                          type="number"
                          min={1}
                          max={100}
                          value={questionCount}
                          onChange={(e) => setQuestionCount(Math.min(100, Math.max(1, parseInt(e.target.value) || 1)))}
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-300 text-xs bg-white focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3 max-h-60 overflow-y-auto p-1">
                      {Array.from({ length: questionCount }, (_, i) => {
                        const qNum = i + 1;
                        const optionLetters = ["A", "B", "C", "D", "E"].slice(0, numberOfOptions);
                        return (
                          <div key={qNum} className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm">
                            <span className="text-xs font-bold text-gray-700">Soru {qNum}</span>
                            <div className="flex gap-1">
                              {optionLetters.map((lettr) => (
                                <button
                                  type="button"
                                  key={lettr}
                                  onClick={() => setAnswerKey(prev => ({ ...prev, [qNum]: lettr }))}
                                  className={`w-6 h-6 rounded-full text-[10px] font-bold border flex items-center justify-center transition-all ${
                                    answerKey[qNum] === lettr
                                      ? "bg-teal-500 border-teal-500 text-white"
                                      : "border-gray-200 text-gray-600 hover:bg-gray-50"
                                  }`}
                                >
                                  {lettr}
                                </button>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={resetQuizForm}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm shadow-md transition-all"
              >
                Testi Tanımla & Onayla
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            label: "Toplam Sınav",
            value: isLoading ? "..." : quizzes?.length || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            ),
            color: "from-teal-500 to-teal-600",
          },
          {
            label: "Onay Bekleyenler",
            value: isLoading ? "..." : quizzes?.filter(q => !q.is_approved).length || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            ),
            color: "from-amber-500 to-amber-600",
          },
          {
            label: "Toplam Sınav Girişi",
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
              placeholder="Quiz veya deneme sınavı başlığı ara..."
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
            />
          </div>
        </div>
      </div>

      {/* Quiz Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Quiz & Sınav Listesi</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Sınav Adı</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Şık</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Soru</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Deneme</th>
                <th className="text-center py-3 px-4 font-semibold text-gray-700">Onay Durumu</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Oluşturulma</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Yükleniyor...</td>
                </tr>
              ) : filteredQuizzes.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">
                    {search ? "Aramayla eşleşen sınav bulunamadı" : "Henüz sınav oluşturulmamış"}
                  </td>
                </tr>
              ) : (
                filteredQuizzes.map((quiz) => (
                  <tr
                    key={quiz.id}
                    className="border-b border-gray-100 hover:bg-teal-50/50 transition-colors"
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{quiz.title}</div>
                      <div className="text-xs text-gray-500 mt-1">ID: {quiz.id.slice(0, 8)}...</div>
                    </td>
                    <td className="py-3 px-4 text-center text-sm font-semibold text-gray-700">
                      {quiz.number_of_options || 4} Şık
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-teal-100 text-teal-800">
                        {quiz.question_count} soru
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                        {quiz.attempt_count} deneme
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      {quiz.is_approved ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-green-50 border border-green-200 text-green-700">
                          Onaylandı
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-50 border border-amber-200 text-amber-700 animate-pulse">
                          Onay Bekliyor
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(quiz.created_at)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {quiz.is_approved ? (
                          <button
                            onClick={() => rejectMutation.mutate(quiz.id)}
                            disabled={rejectMutation.isPending}
                            className="px-3 py-1.5 text-xs font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-lg hover:bg-amber-100 transition-colors"
                          >
                            Onayı Kaldır
                          </button>
                        ) : (
                          <button
                            onClick={() => approveMutation.mutate(quiz.id)}
                            disabled={approveMutation.isPending}
                            className="px-3 py-1.5 text-xs font-bold text-green-700 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            Onayla
                          </button>
                        )}
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
