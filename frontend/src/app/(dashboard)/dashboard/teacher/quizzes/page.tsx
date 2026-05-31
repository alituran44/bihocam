"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi, quizzesApi, mediaApi } from "@/lib/api";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface Lesson {
  id: string;
  course_id: string;
  title: string;
  lesson_type: string;
}

interface QuizListItem {
  id: string;
  lesson_id: string;
  lesson_title: string;
  title: string;
  description?: string;
  pdf_path?: string;
  passing_score: number;
  time_limit_minutes?: number;
  max_attempts?: number;
  created_at: string;
}

interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_type: "multiple_choice" | "true_false" | "short_answer";
  question_text: string;
  options?: Record<string, string> | null;
  correct_answer: string;
  points: number;
  explanation?: string | null;
}

export default function TeacherQuizzesPage() {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  
  // Quizzes list & lessons
  const [quizzesList, setQuizzesList] = useState<QuizListItem[]>([]);
  const [lessonsList, setLessonsList] = useState<Lesson[]>([]);
  const [loadingLists, setLoadingLists] = useState(false);

  // Form states for creating/editing quiz
  const [showAddForm, setShowAddForm] = useState(false);
  const [selectedLessonId, setSelectedLessonId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimit, setTimeLimit] = useState<string>("");
  const [maxAttempts, setMaxAttempts] = useState<string>("");
  const [pdfPath, setPdfPath] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Question management states
  const [activeQuizForQuestions, setActiveQuizForQuestions] = useState<QuizListItem | null>(null);
  const [questionsList, setQuestionsList] = useState<QuizQuestion[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [showAddQuestionForm, setShowAddQuestionForm] = useState(false);

  // Form states for adding question
  const [questionText, setQuestionText] = useState("");
  const [questionType, setQuestionType] = useState<"multiple_choice" | "true_false" | "short_answer">("multiple_choice");
  const [optionA, setOptionA] = useState("");
  const [optionB, setOptionB] = useState("");
  const [optionC, setOptionC] = useState("");
  const [optionD, setOptionD] = useState("");
  const [correctAnswer, setCorrectAnswer] = useState("");
  const [points, setPoints] = useState(10);
  const [explanation, setExplanation] = useState("");

  // Fetch teacher's courses
  const { data: coursesData } = useQuery({
    queryKey: ["teacher-courses-quizzes"],
    queryFn: () => coursesApi.getMyCourses(),
  });

  const courses: Course[] = coursesData?.courses || [];

  // Automatically select first course
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // Load quizzes and lessons when selected course changes
  const loadCourseData = async () => {
    if (!selectedCourseId) return;
    setLoadingLists(true);
    try {
      // 1. Load course lessons
      const lessons = await coursesApi.getLessons(selectedCourseId);
      setLessonsList(lessons);

      // 2. Load quizzes in this course
      const quizzes = await quizzesApi.list({ course_id: selectedCourseId });
      setQuizzesList(quizzes);
    } catch (err: any) {
      toast.error("Kurs verileri yüklenirken bir hata oluştu.");
    } finally {
      setLoadingLists(false);
    }
  };

  useEffect(() => {
    loadCourseData();
  }, [selectedCourseId]);

  // Quiz creation mutation
  const createQuizMutation = useMutation({
    mutationFn: (payload: any) => quizzesApi.create(payload),
    onSuccess: () => {
      toast.success("Test başarıyla oluşturuldu.");
      loadCourseData();
      resetQuizForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Test oluşturulurken bir hata oluştu.");
    },
  });

  // Quiz deletion mutation
  const deleteQuizMutation = useMutation({
    mutationFn: (quizId: string) => quizzesApi.delete(quizId),
    onSuccess: () => {
      toast.success("Test başarıyla silindi.");
      loadCourseData();
      if (activeQuizForQuestions?.id) {
        setActiveQuizForQuestions(null);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Test silinirken bir hata oluştu.");
    },
  });

  // Fetch questions for active quiz
  const fetchQuestions = async (quiz: QuizListItem) => {
    setActiveQuizForQuestions(quiz);
    setLoadingQuestions(true);
    setShowAddQuestionForm(false);
    try {
      const data = await quizzesApi.getQuestions(quiz.id);
      setQuestionsList(data);
    } catch (err: any) {
      toast.error("Sorular yüklenirken bir hata oluştu.");
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: (payload: any) => quizzesApi.addQuestion(activeQuizForQuestions!.id, payload),
    onSuccess: () => {
      toast.success("Soru başarıyla eklendi.");
      if (activeQuizForQuestions) {
        fetchQuestions(activeQuizForQuestions);
      }
      resetQuestionForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Soru eklenirken bir hata oluştu.");
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: (questionId: string) => quizzesApi.deleteQuestion(activeQuizForQuestions!.id, questionId),
    onSuccess: () => {
      toast.success("Soru silindi.");
      if (activeQuizForQuestions) {
        fetchQuestions(activeQuizForQuestions);
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Soru silinirken bir hata oluştu.");
    },
  });

  const resetQuizForm = () => {
    setQuizTitle("");
    setQuizDescription("");
    setSelectedLessonId("");
    setPassingScore(70);
    setTimeLimit("");
    setMaxAttempts("");
    setPdfPath("");
    setShowAddForm(false);
  };

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && selectedLessonId) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Lütfen sadece PDF formatında bir sınav kağıdı yükleyin.");
        return;
      }
      setIsUploadingPdf(true);
      try {
        const result = await mediaApi.uploadDocument(selectedLessonId, file);
        setPdfPath(result.path);
        toast.success("Sınav PDF'i başarıyla yüklendi.");
      } catch (err: any) {
         toast.error("PDF yüklenirken bir hata oluştu.");
      } finally {
        setIsUploadingPdf(false);
      }
    } else if (!selectedLessonId) {
      toast.error("Lütfen önce ilişkili dersi seçin.");
      e.target.value = "";
    }
  };

  const resetQuestionForm = () => {
    setQuestionText("");
    setQuestionType("multiple_choice");
    setOptionA("");
    setOptionB("");
    setOptionC("");
    setOptionD("");
    setCorrectAnswer("");
    setPoints(10);
    setExplanation("");
    setShowAddQuestionForm(false);
  };

  const handleCreateQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLessonId) {
      toast.error("Lütfen testin ekleneceği dersi seçin.");
      return;
    }
    if (!quizTitle.trim()) {
      toast.error("Lütfen bir test başlığı girin.");
      return;
    }

    createQuizMutation.mutate({
      lesson_id: selectedLessonId,
      title: quizTitle,
      description: quizDescription || null,
      pdf_path: pdfPath || null,
      passing_score: passingScore,
      time_limit_minutes: timeLimit ? parseInt(timeLimit) : null,
      max_attempts: maxAttempts ? parseInt(maxAttempts) : null,
    });
  };

  const handleAddQuestionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!questionText.trim()) {
      toast.error("Lütfen soru metnini yazın.");
      return;
    }
    if (!correctAnswer.trim()) {
      toast.error("Lütfen doğru cevabı belirtin.");
      return;
    }

    let optionsPayload: any = null;
    if (questionType === "multiple_choice") {
      if (!optionA.trim() || !optionB.trim()) {
        toast.error("Çoktan seçmeli soru için en az A ve B seçeneklerini doldurmalısınız.");
        return;
      }
      optionsPayload = {
        A: optionA,
        B: optionB,
      };
      if (optionC.trim()) optionsPayload.C = optionC;
      if (optionD.trim()) optionsPayload.D = optionD;
    }

    addQuestionMutation.mutate({
      question_type: questionType,
      question_text: questionText,
      options: optionsPayload,
      correct_answer: correctAnswer,
      points,
      explanation: explanation || null,
    });
  };

  const handleDeleteQuiz = (quizId: string) => {
    if (confirm("Bu testi ve içindeki tüm soruları silmek istediğinize emin misiniz? Öğrencilerin tüm sınav denemeleri de silinecektir.")) {
      deleteQuizMutation.mutate(quizId);
    }
  };

  const handleDeleteQuestion = (questionId: string) => {
    if (confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      deleteQuestionMutation.mutate(questionId);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Test Yönetimi</h2>
          <p className="text-gray-500 text-sm mt-1">
            Derslerinize testler (quiz) tanımlayın, çoktan seçmeli, doğru/yanlış veya kısa cevaplı sorular ekleyerek öğrencileri değerlendirin.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <select
            value={selectedCourseId}
            onChange={(e) => setSelectedCourseId(e.target.value)}
            className="px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-700 rounded-xl font-semibold text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all cursor-pointer"
          >
            {courses.length === 0 ? (
              <option value="">Kurs Bulunmamaktadır</option>
            ) : (
              courses.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))
            )}
          </select>

          {selectedCourseId && lessonsList.length > 0 && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200"
            >
              {showAddForm ? "İptal" : "Yeni Test Oluştur"}
            </button>
          )}
        </div>
      </div>

      {/* Add New Quiz Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-md p-6 animate-slideDown">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">
            Ders İçin Yeni Test Tanımla
          </h3>
          <form onSubmit={handleCreateQuizSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">İlişkili Ders *</label>
                <select
                  required
                  value={selectedLessonId}
                  onChange={(e) => setSelectedLessonId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                >
                  <option value="">Ders Seçiniz...</option>
                  {lessonsList.map((l) => (
                    <option key={l.id} value={l.id}>
                      {l.title} ({l.lesson_type === "video" ? "Video" : "Döküman"})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-semibold text-gray-700">Test Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Limit Kavramı Konu Tarama Testi"
                  value={quizTitle}
                  onChange={(e) => setQuizTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <label className="text-sm font-semibold text-gray-700">Sınav PDF'i / Test Kitapçığı (İsteğe bağlı - Deneme Sınavı Formatı)</label>
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdfUpload}
                  disabled={isUploadingPdf}
                  className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-semibold text-gray-700 focus:outline-none focus:border-teal-500"
                />
                {isUploadingPdf && (
                  <p className="text-[10px] text-teal-600 animate-pulse font-semibold">PDF Yükleniyor, lütfen bekleyin...</p>
                )}
                {pdfPath && (
                  <p className="text-[10px] text-green-600 font-extrabold flex items-center gap-1">
                    <span>✓</span> Sınav PDF'i Başarıyla Yüklendi!
                  </p>
                )}
              </div>

              <div className="md:col-span-3 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Test Açıklaması (İsteğe bağlı)</label>
                <textarea
                  rows={2}
                  placeholder="Test başlamadan önce öğrencilerinize sınav hakkında bilgi verin..."
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
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Süre Sınırı (Dakika - İsteğe bağlı)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Süre sınırı yok"
                  value={timeLimit}
                  onChange={(e) => setTimeLimit(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Maksimum Deneme Sayısı (İsteğe bağlı)</label>
                <input
                  type="number"
                  min={1}
                  placeholder="Sınırsız deneme"
                  value={maxAttempts}
                  onChange={(e) => setMaxAttempts(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={resetQuizForm}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={createQuizMutation.isPending}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-teal-500/10 transition-all duration-200"
              >
                {createQuizMutation.isPending ? "Oluşturuluyor..." : "Testi Oluştur"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Quizzes & Question Management panels */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column: Quizzes list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Aktif Testler</h3>

            {loadingLists ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : quizzesList.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-100 rounded-xl bg-gray-50/20">
                <p className="text-gray-400 text-sm font-semibold">Bu kursta tanımlı test bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {quizzesList.map((q) => (
                  <div
                    key={q.id}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 relative ${
                      activeQuizForQuestions?.id === q.id
                        ? "bg-teal-50/40 border-teal-300 shadow-sm"
                        : "bg-white border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <button
                      onClick={() => fetchQuestions(q)}
                      className="w-full text-left flex flex-col gap-1.5"
                    >
                      <span className="text-[10px] font-bold text-gray-400 bg-gray-100 px-2 py-0.5 rounded border border-gray-200/50 self-start">
                        Ders: {q.lesson_title}
                      </span>
                      <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{q.title}</h4>
                      <div className="flex flex-wrap gap-2 text-[10px] text-gray-400 font-bold mt-1">
                        <span>Geçme: %{q.passing_score}</span>
                        {q.time_limit_minutes && <span>Süre: {q.time_limit_minutes} dk</span>}
                        {q.max_attempts && <span>Hak: {q.max_attempts}</span>}
                      </div>
                    </button>

                    <button
                      onClick={() => handleDeleteQuiz(q.id)}
                      className="absolute top-4 right-4 p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded transition-all duration-200"
                      title="Sil"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column: Questions list / management */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[450px] flex flex-col">
            {activeQuizForQuestions ? (
              <>
                <div className="border-b border-gray-100 pb-4 mb-6 flex flex-col sm:flex-row justify-between sm:items-start gap-4">
                  <div>
                    <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-md">
                      Test Detayı & Sorular
                    </span>
                    <h3 className="text-lg font-bold text-gray-900 mt-2">{activeQuizForQuestions.title}</h3>
                    {activeQuizForQuestions.description && (
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                        {activeQuizForQuestions.description}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => setShowAddQuestionForm(!showAddQuestionForm)}
                    className="flex items-center justify-center gap-1.5 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-xl font-semibold text-xs shadow-md shadow-teal-500/10 transition-all duration-200 shrink-0 self-start"
                  >
                    {showAddQuestionForm ? "İptal" : "Yeni Soru Ekle"}
                  </button>
                </div>

                {/* Add question form inside right panel */}
                {showAddQuestionForm && (
                  <div className="bg-gray-50/50 border border-gray-200/50 rounded-xl p-5 mb-6 animate-slideDown">
                    <h4 className="font-bold text-sm text-gray-800 border-b border-gray-100 pb-2 mb-4">
                      Yeni Soru Ekle
                    </h4>
                    <form onSubmit={handleAddQuestionSubmit} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div className="space-y-1 sm:col-span-2">
                          <label className="text-[10px] font-bold text-gray-500">Soru Tipi *</label>
                          <select
                            value={questionType}
                            onChange={(e) => {
                              setQuestionType(e.target.value as any);
                              setCorrectAnswer("");
                            }}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          >
                            <option value="multiple_choice">Çoktan Seçmeli (Multiple Choice)</option>
                            <option value="true_false">Doğru / Yanlış (True / False)</option>
                            <option value="short_answer">Kısa Cevap (Short Answer)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500">Puan Değeri *</label>
                          <input
                            type="number"
                            min={1}
                            value={points}
                            onChange={(e) => setPoints(parseInt(e.target.value) || 10)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500">Soru Metni *</label>
                        <input
                          type="text"
                          required
                          placeholder="Örn: 2x + 5 = 15 ise x kaçtır?"
                          value={questionText}
                          onChange={(e) => setQuestionText(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500"
                        />
                      </div>

                      {/* Options block for Multiple Choice */}
                      {questionType === "multiple_choice" && (
                        <div className="bg-white border border-gray-150 rounded-xl p-4 space-y-3">
                          <h5 className="font-bold text-[10px] text-gray-400 uppercase tracking-wider">Seçenekleri Doldurun</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border">A</span>
                              <input
                                type="text"
                                required
                                placeholder="Seçenek A"
                                value={optionA}
                                onChange={(e) => setOptionA(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border">B</span>
                              <input
                                type="text"
                                required
                                placeholder="Seçenek B"
                                value={optionB}
                                onChange={(e) => setOptionB(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border">C</span>
                              <input
                                type="text"
                                placeholder="Seçenek C (Opsiyonel)"
                                value={optionC}
                                onChange={(e) => setOptionC(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-teal-500"
                              />
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded border">D</span>
                              <input
                                type="text"
                                placeholder="Seçenek D (Opsiyonel)"
                                value={optionD}
                                onChange={(e) => setOptionD(e.target.value)}
                                className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none focus:border-teal-500"
                              />
                            </div>
                          </div>

                          <div className="space-y-1 mt-2">
                            <label className="text-[10px] font-bold text-gray-500">Doğru Cevap Seçeneği *</label>
                            <select
                              required
                              value={correctAnswer}
                              onChange={(e) => setCorrectAnswer(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg border border-gray-300 text-xs focus:outline-none"
                            >
                              <option value="">Seçiniz...</option>
                              <option value="A">A</option>
                              <option value="B">B</option>
                              {optionC.trim() && <option value="C">C</option>}
                              {optionD.trim() && <option value="D">D</option>}
                            </select>
                          </div>
                        </div>
                      )}

                      {/* True/False correct answer selection */}
                      {questionType === "true_false" && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500">Doğru Yanıt Seçimi *</label>
                          <select
                            required
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                          >
                            <option value="">Seçiniz...</option>
                            <option value="true">Doğru (True)</option>
                            <option value="false">Yanlış (False)</option>
                          </select>
                        </div>
                      )}

                      {/* Short answer input */}
                      {questionType === "short_answer" && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-500">Doğru Kelime / Yanıt *</label>
                          <input
                            type="text"
                            required
                            placeholder="Örn: 5"
                            value={correctAnswer}
                            onChange={(e) => setCorrectAnswer(e.target.value)}
                            className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                          />
                          <p className="text-[10px] text-gray-400">Öğrencilerin sınavda bu kutuya tam olarak yazması gereken yanıtı girin (harf duyarsız kontrol edilir).</p>
                        </div>
                      )}

                      <div className="space-y-1">
                        <label className="text-[10px] font-bold text-gray-500">Açıklama / Çözüm (Öğrenci sınavı bitirdikten sonra gösterilir - İsteğe bağlı)</label>
                        <input
                          type="text"
                          placeholder="Örn: Denklemin her iki tarafından 5 çıkarılır: 2x = 10, sonra 2'ye bölünür: x = 5."
                          value={explanation}
                          onChange={(e) => setExplanation(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none"
                        />
                      </div>

                      <div className="flex justify-end gap-2 text-xs pt-2">
                        <button
                          type="button"
                          onClick={resetQuestionForm}
                          className="px-3.5 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                        >
                          Vazgeç
                        </button>
                        <button
                          type="submit"
                          disabled={addQuestionMutation.isPending}
                          className="px-3.5 py-1.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 shadow-sm transition-all"
                        >
                          {addQuestionMutation.isPending ? "Ekleniyor..." : "Soruyu Ekle"}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Questions List */}
                {loadingQuestions ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : questionsList.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-gray-400">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="font-semibold text-sm">Bu testte henüz soru bulunmuyor.</p>
                    <p className="text-xs text-gray-400 mt-1">Öğrencilerin çözebilmesi için yukarıdaki "Yeni Soru Ekle" butonuna tıklayarak ilk sorunuzu yazın.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {questionsList.map((q, idx) => (
                      <div
                        key={q.id}
                        className="border border-gray-200/80 rounded-xl p-5 hover:border-teal-500/20 hover:shadow-md hover:shadow-gray-100 transition-all space-y-4 relative"
                      >
                        <div className="flex justify-between items-start gap-4 pr-10 border-b border-gray-50 pb-2">
                          <div>
                            <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded border border-teal-100">
                              Soru {idx + 1}
                            </span>
                            <span className="text-[10px] font-bold text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200/60 ml-2">
                              Değer: {q.points} Puan
                            </span>
                            <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded border border-purple-100 ml-2 capitalize">
                              {q.question_type === "multiple_choice"
                                ? "Çoktan Seçmeli"
                                : q.question_type === "true_false"
                                ? "Doğru/Yanlış"
                                : "Kısa Cevap"}
                            </span>
                          </div>
                        </div>

                        <p className="font-bold text-sm text-gray-900 leading-relaxed">
                          {q.question_text}
                        </p>

                        {/* Options preview for multiple choice */}
                        {q.question_type === "multiple_choice" && q.options && (
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                            {Object.entries(q.options).map(([key, val]) => (
                              <div
                                key={key}
                                className={`flex items-center gap-2 p-2 rounded-lg border ${
                                  q.correct_answer === key
                                    ? "bg-green-50/50 border-green-200 font-semibold text-green-700"
                                    : "bg-white border-gray-100 text-gray-600"
                                }`}
                              >
                                <span className={`w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold ${
                                  q.correct_answer === key
                                    ? "bg-green-600 text-white shadow-sm"
                                    : "bg-gray-100 text-gray-500"
                                }`}>
                                  {key}
                                </span>
                                <span>{val}</span>
                              </div>
                            ))}
                          </div>
                        )}

                        <div className="text-xs space-y-1.5 bg-gray-50/80 p-3 rounded-lg border border-gray-100">
                          <p className="font-semibold text-gray-700">
                            Doğru Yanıt:{" "}
                            <span className="text-green-600 font-bold bg-green-50 border border-green-100 px-2 py-0.5 rounded">
                              {q.question_type === "true_false"
                                ? q.correct_answer === "true"
                                  ? "Doğru (True)"
                                  : "Yanlış (False)"
                                : q.correct_answer}
                            </span>
                          </p>
                          {q.explanation && (
                            <p className="text-gray-500 italic">
                              <span className="font-semibold text-gray-600 not-italic">Açıklama:</span> "{q.explanation}"
                            </p>
                          )}
                        </div>

                        <button
                          onClick={() => handleDeleteQuestion(q.id)}
                          className="absolute top-4 right-4 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                          title="Soruyu Sil"
                        >
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <svg className="w-16 h-16 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                </svg>
                <h4 className="font-bold text-base text-gray-700">Test Seçilmedi</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Sol taraftaki listeden bir test seçerek soru ekleyebilir, mevcut soruları görüntüleyebilir veya silebilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
