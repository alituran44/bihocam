"use client";

/**
 * EPIC-10-QUIZ: Quiz Management Component
 * 
 * Modern, clean quiz management interface for teachers
 */

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizzesApi, type Quiz, type QuizQuestion, type QuizCreate, type QuizUpdate, type QuizQuestionCreate, type QuizQuestionUpdate } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { motion, AnimatePresence } from "framer-motion";
import { X, Plus, Trash2, GripVertical, Edit2, Save, AlertCircle, CheckCircle2, Settings, FileText, Clock, Target, RotateCcw } from "lucide-react";
import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

interface QuizManagerProps {
  lessonId: string;
  courseId: string;
  onClose: () => void;
}

interface QuestionFormData {
  question_type: "multiple_choice" | "true_false" | "short_answer";
  question_text: string;
  options?: Record<string, string>;
  correct_answer: string;
  points: number;
  explanation?: string;
}

function QuestionCard({ 
  question, 
  index, 
  onEdit, 
  onDelete
}: { 
  question: QuizQuestion; 
  index: number; 
  onEdit: () => void;
  onDelete: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: question.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`group relative bg-gradient-to-br from-white to-gray-50 border-2 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all ${
        isDragging ? "border-teal-400 shadow-xl scale-[1.02]" : "border-gray-200"
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing mt-1 text-gray-400 hover:text-teal-600 transition-colors"
        >
          <GripVertical size={20} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg text-xs font-bold shadow-sm">
                #{index + 1}
              </span>
              <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold capitalize">
                {question.question_type === "multiple_choice" ? "Çoktan Seçmeli" : 
                 question.question_type === "true_false" ? "Doğru/Yanlış" : "Kısa Cevap"}
              </span>
              <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-xs font-bold">
                {question.points} puan
              </span>
            </div>
            
            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={onEdit}
                className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-all"
                title="Düzenle"
              >
                <Edit2 size={18} />
              </button>
              <button
                onClick={onDelete}
                className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all"
                title="Sil"
              >
                <Trash2 size={18} />
              </button>
            </div>
          </div>
          
          <p className="text-gray-900 font-semibold text-base leading-relaxed mb-4">
            {question.question_text}
          </p>
          
          {question.question_type === "multiple_choice" && question.options && (
            <div className="space-y-2">
              {Object.entries(question.options).map(([key, value]) => (
                <div
                  key={key}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                    key === question.correct_answer
                      ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300 shadow-sm"
                      : "bg-gray-50 border-gray-200"
                  }`}
                >
                  <span className="font-bold text-gray-700 w-8 text-center">{key.toUpperCase()}</span>
                  <span className="text-gray-900 flex-1">{value}</span>
                  {key === question.correct_answer && (
                    <CheckCircle2 size={18} className="text-green-600 flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          )}
          
          {question.question_type === "true_false" && (
            <div className={`inline-flex items-center gap-3 px-4 py-3 rounded-xl border-2 ${
              question.correct_answer === "true"
                ? "bg-gradient-to-r from-green-50 to-emerald-50 border-green-300"
                : "bg-gray-50 border-gray-200"
            }`}>
              <span className="font-semibold text-gray-700">Doğru Cevap:</span>
              <span className="text-gray-900 font-medium">
                {question.correct_answer === "true" ? "Doğru" : "Yanlış"}
              </span>
              {question.correct_answer === "true" && (
                <CheckCircle2 size={18} className="text-green-600" />
              )}
            </div>
          )}
          
          {question.question_type === "short_answer" && (
            <div className="bg-gray-50 border-2 border-gray-200 rounded-xl p-4">
              <span className="text-sm text-gray-600 block mb-2 font-medium">Doğru Cevap:</span>
              <span className="text-gray-900 font-semibold text-base">{question.correct_answer}</span>
            </div>
          )}
          
          {question.explanation && (
            <div className="mt-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
              <span className="text-sm text-blue-700 font-semibold block mb-2">Açıklama:</span>
              <span className="text-blue-900 text-sm leading-relaxed">{question.explanation}</span>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}

export function QuizManager({ lessonId, courseId, onClose }: QuizManagerProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"settings" | "questions">("settings");
  const [isEditingQuiz, setIsEditingQuiz] = useState(false);
  const [isAddingQuestion, setIsAddingQuestion] = useState(false);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  
  // Quiz settings form
  const [quizTitle, setQuizTitle] = useState("");
  const [quizDescription, setQuizDescription] = useState("");
  const [passingScore, setPassingScore] = useState(70);
  const [timeLimitMinutes, setTimeLimitMinutes] = useState<number | null>(null);
  const [maxAttempts, setMaxAttempts] = useState<number | null>(null);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);
  const [showCorrectAnswers, setShowCorrectAnswers] = useState(true);
  
  // Question form
  const [questionForm, setQuestionForm] = useState<QuestionFormData>({
    question_type: "multiple_choice",
    question_text: "",
    options: { a: "", b: "", c: "", d: "" },
    correct_answer: "a",
    points: 1,
    explanation: "",
  });

  // Fetch quiz
  const { data: quizData, isLoading: isLoadingQuiz } = useQuery<Quiz | null>({
    queryKey: ["quiz", lessonId],
    queryFn: async () => {
      const quizzes = await quizzesApi.list({ lesson_id: lessonId });
      if (quizzes.length > 0) {
        const quiz = await quizzesApi.get(quizzes[0].id);
        return quiz;
      }
      return null;
    },
    enabled: !!lessonId,
    retry: false,
  });

  useEffect(() => {
    if (quizData) {
      setQuiz(quizData);
      setQuizTitle(quizData.title);
      setQuizDescription(quizData.description || "");
      setPassingScore(quizData.passing_score);
      setTimeLimitMinutes(quizData.time_limit_minutes || null);
      setMaxAttempts(quizData.max_attempts || null);
      setShuffleQuestions(quizData.shuffle_questions);
      setShowCorrectAnswers(quizData.show_correct_answers);
      setIsEditingQuiz(false);
    }
  }, [quizData]);

  const [quiz, setQuiz] = useState<Quiz | null>(null);

  // Create quiz mutation
  const createQuizMutation = useMutation({
    mutationFn: async (data: QuizCreate) => {
      return quizzesApi.create(data);
    },
    onSuccess: (newQuiz) => {
      setQuiz(newQuiz);
      queryClient.invalidateQueries({ queryKey: ["quiz", lessonId] });
      setIsEditingQuiz(false);
    },
  });

  // Update quiz mutation
  const updateQuizMutation = useMutation({
    mutationFn: async (data: QuizUpdate) => {
      if (!quiz) throw new Error("Quiz bulunamadı");
      return quizzesApi.update(quiz.id, data);
    },
    onSuccess: (updatedQuiz) => {
      setQuiz(updatedQuiz);
      setIsEditingQuiz(false);
      queryClient.invalidateQueries({ queryKey: ["quiz", lessonId] });
    },
  });

  // Add question mutation
  const addQuestionMutation = useMutation({
    mutationFn: async (data: QuizQuestionCreate) => {
      if (!quiz) throw new Error("Quiz bulunamadı");
      return quizzesApi.addQuestion(quiz.id, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", lessonId] });
      setIsAddingQuestion(false);
      resetQuestionForm();
    },
  });

  // Update question mutation
  const updateQuestionMutation = useMutation({
    mutationFn: async ({ questionId, data }: { questionId: string; data: QuizQuestionUpdate }) => {
      if (!quiz) throw new Error("Quiz bulunamadı");
      return quizzesApi.updateQuestion(quiz.id, questionId, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", lessonId] });
      setEditingQuestionId(null);
      setIsAddingQuestion(false);
      resetQuestionForm();
    },
  });

  // Delete question mutation
  const deleteQuestionMutation = useMutation({
    mutationFn: async (questionId: string) => {
      if (!quiz) throw new Error("Quiz bulunamadı");
      return quizzesApi.deleteQuestion(quiz.id, questionId);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", lessonId] });
    },
  });

  // Reorder questions mutation
  const reorderQuestionsMutation = useMutation({
    mutationFn: async (questionIds: string[]) => {
      if (!quiz) throw new Error("Quiz bulunamadı");
      return quizzesApi.reorderQuestions(quiz.id, questionIds);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz", lessonId] });
    },
  });

  const resetQuestionForm = () => {
    setQuestionForm({
      question_type: "multiple_choice",
      question_text: "",
      options: { a: "", b: "", c: "", d: "" },
      correct_answer: "a",
      points: 1,
      explanation: "",
    });
    setEditingQuestionId(null);
  };

  const handleSaveQuiz = async () => {
    if (!quizTitle.trim()) {
      alert("Quiz başlığı gereklidir");
      return;
    }

    if (!quiz) {
      await createQuizMutation.mutateAsync({
        lesson_id: lessonId,
        title: quizTitle,
        description: quizDescription || null,
        passing_score: passingScore,
        time_limit_minutes: timeLimitMinutes,
        max_attempts: maxAttempts,
        shuffle_questions: shuffleQuestions,
        show_correct_answers: showCorrectAnswers,
      });
    } else {
      await updateQuizMutation.mutateAsync({
        title: quizTitle,
        description: quizDescription || null,
        passing_score: passingScore,
        time_limit_minutes: timeLimitMinutes,
        max_attempts: maxAttempts,
        shuffle_questions: shuffleQuestions,
        show_correct_answers: showCorrectAnswers,
      });
    }
  };

  const handleSaveQuestion = async () => {
    if (!questionForm.question_text.trim()) {
      alert("Soru metni gereklidir");
      return;
    }

    if (questionForm.question_type === "multiple_choice") {
      if (!questionForm.options || Object.keys(questionForm.options).length < 2) {
        alert("En az 2 seçenek gereklidir");
        return;
      }
      if (!questionForm.options || Object.values(questionForm.options).some(v => !v.trim())) {
        alert("Tüm seçenekler doldurulmalıdır");
        return;
      }
      if (!questionForm.correct_answer || !questionForm.options[questionForm.correct_answer]) {
        alert("Doğru cevap seçilmelidir");
        return;
      }
    }

    if (editingQuestionId) {
      await updateQuestionMutation.mutateAsync({
        questionId: editingQuestionId,
        data: questionForm,
      });
    } else {
      await addQuestionMutation.mutateAsync(questionForm);
    }
  };

  const handleEditQuestion = (question: QuizQuestion) => {
    setEditingQuestionId(question.id);
    setQuestionForm({
      question_type: question.question_type,
      question_text: question.question_text,
      options: question.options || { a: "", b: "", c: "", d: "" },
      correct_answer: question.correct_answer,
      points: question.points,
      explanation: question.explanation || "",
    });
    setIsAddingQuestion(true);
    setActiveTab("questions");
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm("Bu soruyu silmek istediğinize emin misiniz?")) {
      await deleteQuestionMutation.mutateAsync(questionId);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || !quiz || !quiz.questions) return;

    const oldIndex = quiz.questions.findIndex((q) => q.id === active.id);
    const newIndex = quiz.questions.findIndex((q) => q.id === over.id);

    if (oldIndex !== newIndex && oldIndex !== -1 && newIndex !== -1) {
      const newQuestions = arrayMove(quiz.questions, oldIndex, newIndex);
      setQuiz({ ...quiz, questions: newQuestions });
      reorderQuestionsMutation.mutate(newQuestions.map((q) => q.id));
    }
  };

  if (isLoadingQuiz) {
    return (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-3xl p-12 shadow-2xl">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-teal-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-center">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  const questions = quiz?.questions ? [...quiz.questions].sort((a, b) => a.order - b.order) : [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl w-full max-w-6xl max-h-[95vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-600 via-teal-500 to-teal-600 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-1">Quiz Yönetimi</h2>
            <p className="text-teal-100 text-sm">
              {quiz ? `${questions.length} soru • ${quiz.title}` : "Yeni quiz oluştur"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/20 rounded-xl transition-colors"
          >
            <X size={24} className="text-white" />
          </button>
        </div>

        {/* Tabs */}
        <div className="border-b-2 border-gray-200 bg-gray-50 px-8">
          <div className="flex gap-1">
            <button
              onClick={() => setActiveTab("settings")}
              className={`px-6 py-4 font-semibold text-sm transition-all relative ${
                activeTab === "settings"
                  ? "text-teal-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <Settings size={18} />
                <span>Ayarlar</span>
              </div>
              {activeTab === "settings" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
                />
              )}
            </button>
            <button
              onClick={() => setActiveTab("questions")}
              className={`px-6 py-4 font-semibold text-sm transition-all relative ${
                activeTab === "questions"
                  ? "text-teal-600"
                  : "text-gray-600 hover:text-gray-900"
              }`}
            >
              <div className="flex items-center gap-2">
                <FileText size={18} />
                <span>Sorular</span>
                {questions.length > 0 && (
                  <span className="px-2 py-0.5 bg-teal-100 text-teal-700 rounded-full text-xs font-bold">
                    {questions.length}
                  </span>
                )}
              </div>
              {activeTab === "questions" && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600"
                />
              )}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            {activeTab === "settings" ? (
              <motion.div
                key="settings"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="space-y-6"
              >
                {/* Quiz Settings */}
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border-2 border-gray-200 shadow-lg">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                      <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                        <Settings size={20} className="text-teal-600" />
                      </div>
                      Quiz Ayarları
                    </h3>
                    {quiz && !isEditingQuiz && (
                      <Button
                        onClick={() => setIsEditingQuiz(true)}
                        variant="outline"
                        size="sm"
                      >
                        <Edit2 size={16} className="mr-2" />
                        Düzenle
                      </Button>
                    )}
                  </div>

                  {(!quiz || isEditingQuiz) ? (
                    <div className="space-y-6">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Quiz Başlığı <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={quizTitle}
                          onChange={(e) => setQuizTitle(e.target.value)}
                          placeholder="Örn: Bölüm 1 Değerlendirme Sınavı"
                          className="w-full text-lg"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Açıklama
                        </label>
                        <textarea
                          value={quizDescription}
                          onChange={(e) => setQuizDescription(e.target.value)}
                          placeholder="Quiz hakkında açıklama..."
                          rows={4}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                        />
                      </div>

                      <div className="grid md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Target size={16} className="text-orange-600" />
                            Geçme Notu (%)
                          </label>
                          <Input
                            type="number"
                            min="0"
                            max="100"
                            value={passingScore}
                            onChange={(e) => setPassingScore(parseInt(e.target.value) || 70)}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                            <Clock size={16} className="text-blue-600" />
                            Süre (dakika) - Opsiyonel
                          </label>
                          <Input
                            type="number"
                            min="1"
                            value={timeLimitMinutes || ""}
                            onChange={(e) => setTimeLimitMinutes(e.target.value ? parseInt(e.target.value) : null)}
                            placeholder="Sınırsız"
                            className="w-full"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                          <RotateCcw size={16} className="text-purple-600" />
                          Maksimum Deneme Sayısı - Opsiyonel
                        </label>
                        <Input
                          type="number"
                          min="1"
                          value={maxAttempts || ""}
                          onChange={(e) => setMaxAttempts(e.target.value ? parseInt(e.target.value) : null)}
                          placeholder="Sınırsız"
                          className="w-full"
                        />
                      </div>

                      <div className="space-y-4 pt-4 border-t-2 border-gray-200">
                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={shuffleQuestions}
                            onChange={(e) => setShuffleQuestions(e.target.checked)}
                            className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                            Soruları karıştır
                          </span>
                        </label>

                        <label className="flex items-center gap-3 cursor-pointer group">
                          <input
                            type="checkbox"
                            checked={showCorrectAnswers}
                            onChange={(e) => setShowCorrectAnswers(e.target.checked)}
                            className="w-5 h-5 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                          />
                          <span className="text-sm font-semibold text-gray-700 group-hover:text-gray-900">
                            Doğru cevapları göster
                          </span>
                        </label>
                      </div>

                      <div className="flex gap-3 pt-4">
                        <Button
                          onClick={handleSaveQuiz}
                          disabled={createQuizMutation.isPending || updateQuizMutation.isPending}
                          className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                        >
                          <Save size={18} className="mr-2" />
                          {quiz ? "Güncelle" : "Oluştur"}
                        </Button>
                        {quiz && isEditingQuiz && (
                          <Button
                            onClick={() => {
                              setIsEditingQuiz(false);
                              if (quiz) {
                                setQuizTitle(quiz.title);
                                setQuizDescription(quiz.description || "");
                                setPassingScore(quiz.passing_score);
                                setTimeLimitMinutes(quiz.time_limit_minutes || null);
                                setMaxAttempts(quiz.max_attempts || null);
                                setShuffleQuestions(quiz.shuffle_questions);
                                setShowCorrectAnswers(quiz.show_correct_answers);
                              }
                            }}
                            variant="outline"
                          >
                            İptal
                          </Button>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                          <span className="text-xs text-gray-600 font-medium block mb-1">Başlık</span>
                          <p className="text-gray-900 font-bold text-lg">{quiz.title}</p>
                        </div>
                        {quiz.description && (
                          <div className="bg-white rounded-xl p-4 border-2 border-gray-200">
                            <span className="text-xs text-gray-600 font-medium block mb-1">Açıklama</span>
                            <p className="text-gray-900">{quiz.description}</p>
                          </div>
                        )}
                      </div>
                      <div className="grid md:grid-cols-3 gap-4">
                        <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 border-2 border-orange-200">
                          <span className="text-xs text-orange-700 font-medium block mb-1">Geçme Notu</span>
                          <p className="text-orange-900 font-bold text-2xl">{quiz.passing_score}%</p>
                        </div>
                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border-2 border-blue-200">
                          <span className="text-xs text-blue-700 font-medium block mb-1">Süre</span>
                          <p className="text-blue-900 font-bold text-xl">
                            {quiz.time_limit_minutes ? `${quiz.time_limit_minutes} dk` : "Sınırsız"}
                          </p>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border-2 border-purple-200">
                          <span className="text-xs text-purple-700 font-medium block mb-1">Maksimum Deneme</span>
                          <p className="text-purple-900 font-bold text-xl">
                            {quiz.max_attempts || "Sınırsız"}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 pt-2">
                        <div className="flex items-center gap-2">
                          {quiz.shuffle_questions ? (
                            <CheckCircle2 size={20} className="text-green-600" />
                          ) : (
                            <X size={20} className="text-gray-400" />
                          )}
                          <span className="text-sm text-gray-700 font-medium">Sorular karıştırılır</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {quiz.show_correct_answers ? (
                            <CheckCircle2 size={20} className="text-green-600" />
                          ) : (
                            <X size={20} className="text-gray-400" />
                          )}
                          <span className="text-sm text-gray-700 font-medium">Doğru cevaplar gösterilir</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="questions"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                {!quiz ? (
                  <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-12 text-center">
                    <AlertCircle size={48} className="text-yellow-600 mx-auto mb-4" />
                    <p className="text-gray-700 font-semibold text-lg mb-2">Önce quiz ayarlarını kaydedin</p>
                    <p className="text-gray-600 text-sm">Sorular eklemek için önce quiz ayarlarını oluşturmalısınız</p>
                  </div>
                ) : (
                  <>
                    {/* Add Question Button */}
                    <div className="flex items-center justify-between">
                      <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                        <div className="w-10 h-10 bg-teal-100 rounded-xl flex items-center justify-center">
                          <FileText size={20} className="text-teal-600" />
                        </div>
                        Sorular ({questions.length})
                      </h3>
                      <Button
                        onClick={() => {
                          setIsAddingQuestion(true);
                          setEditingQuestionId(null);
                          resetQuestionForm();
                        }}
                        disabled={isAddingQuestion}
                        className="bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                      >
                        <Plus size={18} className="mr-2" />
                        Soru Ekle
                      </Button>
                    </div>

                    {/* Question Form */}
                    <AnimatePresence>
                      {isAddingQuestion && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-2xl p-8 shadow-lg"
                        >
                          <h4 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                            <Plus size={20} className="text-blue-600" />
                            {editingQuestionId ? "Soru Düzenle" : "Yeni Soru"}
                          </h4>

                          <div className="space-y-6">
                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                Soru Tipi
                              </label>
                              <select
                                value={questionForm.question_type}
                                onChange={(e) => {
                                  const newType = e.target.value as "multiple_choice" | "true_false" | "short_answer";
                                  setQuestionForm({
                                    ...questionForm,
                                    question_type: newType,
                                    options: newType === "multiple_choice" ? { a: "", b: "", c: "", d: "" } : undefined,
                                    correct_answer: newType === "true_false" ? "true" : newType === "multiple_choice" ? "a" : "",
                                  });
                                }}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
                              >
                                <option value="multiple_choice">Çoktan Seçmeli</option>
                                <option value="true_false">Doğru/Yanlış</option>
                                <option value="short_answer">Kısa Cevap</option>
                              </select>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                Soru Metni <span className="text-red-500">*</span>
                              </label>
                              <textarea
                                value={questionForm.question_text}
                                onChange={(e) => setQuestionForm({ ...questionForm, question_text: e.target.value })}
                                placeholder="Soru metnini girin..."
                                rows={4}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                              />
                            </div>

                            {questionForm.question_type === "multiple_choice" && (
                              <div className="space-y-3">
                                <div className="flex items-center justify-between mb-2">
                                  <label className="block text-sm font-bold text-gray-700">
                                    Seçenekler <span className="text-red-500">*</span>
                                  </label>
                                  <Button
                                    type="button"
                                    onClick={() => {
                                      const currentOptions = questionForm.options || {};
                                      const keys = Object.keys(currentOptions);
                                      if (keys.length < 10) {
                                        // Find next available letter
                                        const letters = "abcdefghijklmnopqrstuvwxyz";
                                        const usedLetters = keys.map(k => k.toLowerCase());
                                        let nextLetter = "";
                                        for (let i = 0; i < letters.length; i++) {
                                          if (!usedLetters.includes(letters[i])) {
                                            nextLetter = letters[i];
                                            break;
                                          }
                                        }
                                        if (nextLetter) {
                                          setQuestionForm({
                                            ...questionForm,
                                            options: {
                                              ...currentOptions,
                                              [nextLetter]: "",
                                            },
                                          });
                                        }
                                      }
                                    }}
                                    variant="outline"
                                    size="sm"
                                    disabled={Object.keys(questionForm.options || {}).length >= 10}
                                  >
                                    <Plus size={16} className="mr-1" />
                                    Şık Ekle
                                  </Button>
                                </div>
                                {Object.entries(questionForm.options || {}).map(([key, value]) => (
                                  <div key={key} className="flex items-center gap-3 group">
                                    <span className="font-bold text-gray-700 w-8 text-center flex-shrink-0">{key.toUpperCase()}</span>
                                    <Input
                                      value={value}
                                      onChange={(e) => {
                                        const newOptions = { ...questionForm.options };
                                        newOptions[key] = e.target.value;
                                        setQuestionForm({
                                          ...questionForm,
                                          options: newOptions,
                                        });
                                      }}
                                      placeholder={`Seçenek ${key.toUpperCase()}`}
                                      className="flex-1"
                                    />
                                    <input
                                      type="radio"
                                      name="correct_answer"
                                      checked={questionForm.correct_answer === key}
                                      onChange={() => setQuestionForm({ ...questionForm, correct_answer: key })}
                                      className="w-5 h-5 text-teal-600 cursor-pointer flex-shrink-0"
                                      title="Doğru cevap"
                                    />
                                    {Object.keys(questionForm.options || {}).length > 2 && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          const newOptions = { ...questionForm.options };
                                          delete newOptions[key];
                                          // If deleted option was correct answer, set first remaining as correct
                                          let newCorrectAnswer = questionForm.correct_answer;
                                          if (key === questionForm.correct_answer) {
                                            const remainingKeys = Object.keys(newOptions);
                                            newCorrectAnswer = remainingKeys.length > 0 ? remainingKeys[0] : "";
                                          }
                                          setQuestionForm({
                                            ...questionForm,
                                            options: newOptions,
                                            correct_answer: newCorrectAnswer,
                                          });
                                        }}
                                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-all opacity-0 group-hover:opacity-100 flex-shrink-0"
                                        title="Şıkkı Sil"
                                      >
                                        <X size={18} />
                                      </button>
                                    )}
                                  </div>
                                ))}
                                {(!questionForm.options || Object.keys(questionForm.options).length < 2) && (
                                  <p className="text-sm text-red-600 font-medium">
                                    En az 2 seçenek gereklidir
                                  </p>
                                )}
                              </div>
                            )}

                            {questionForm.question_type === "true_false" && (
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                  Doğru Cevap <span className="text-red-500">*</span>
                                </label>
                                <div className="flex gap-4">
                                  <label className="flex items-center gap-2 cursor-pointer p-4 border-2 border-gray-300 rounded-xl hover:border-teal-500 transition-all flex-1">
                                    <input
                                      type="radio"
                                      name="correct_answer_tf"
                                      checked={questionForm.correct_answer === "true"}
                                      onChange={() => setQuestionForm({ ...questionForm, correct_answer: "true" })}
                                      className="w-5 h-5 text-teal-600"
                                    />
                                    <span className="text-gray-700 font-semibold">Doğru</span>
                                  </label>
                                  <label className="flex items-center gap-2 cursor-pointer p-4 border-2 border-gray-300 rounded-xl hover:border-teal-500 transition-all flex-1">
                                    <input
                                      type="radio"
                                      name="correct_answer_tf"
                                      checked={questionForm.correct_answer === "false"}
                                      onChange={() => setQuestionForm({ ...questionForm, correct_answer: "false" })}
                                      className="w-5 h-5 text-teal-600"
                                    />
                                    <span className="text-gray-700 font-semibold">Yanlış</span>
                                  </label>
                                </div>
                              </div>
                            )}

                            {questionForm.question_type === "short_answer" && (
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                  Doğru Cevap <span className="text-red-500">*</span>
                                </label>
                                <Input
                                  value={questionForm.correct_answer}
                                  onChange={(e) => setQuestionForm({ ...questionForm, correct_answer: e.target.value })}
                                  placeholder="Doğru cevabı girin..."
                                  className="w-full"
                                />
                              </div>
                            )}

                            <div className="grid md:grid-cols-2 gap-6">
                              <div>
                                <label className="block text-sm font-bold text-gray-700 mb-2">
                                  Puan
                                </label>
                                <Input
                                  type="number"
                                  min="1"
                                  value={questionForm.points}
                                  onChange={(e) => setQuestionForm({ ...questionForm, points: parseInt(e.target.value) || 1 })}
                                  className="w-full"
                                />
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-bold text-gray-700 mb-2">
                                Açıklama (Opsiyonel)
                              </label>
                              <textarea
                                value={questionForm.explanation || ""}
                                onChange={(e) => setQuestionForm({ ...questionForm, explanation: e.target.value })}
                                placeholder="Soru açıklaması..."
                                rows={3}
                                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
                              />
                            </div>

                            <div className="flex gap-3 pt-2">
                              <Button
                                onClick={handleSaveQuestion}
                                disabled={addQuestionMutation.isPending || updateQuestionMutation.isPending}
                                className="flex-1 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800"
                              >
                                <Save size={18} className="mr-2" />
                                {editingQuestionId ? "Güncelle" : "Ekle"}
                              </Button>
                              <Button
                                onClick={() => {
                                  setIsAddingQuestion(false);
                                  resetQuestionForm();
                                }}
                                variant="outline"
                              >
                                İptal
                              </Button>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Questions List */}
                    {questions.length === 0 ? (
                      <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl p-16 text-center">
                        <AlertCircle size={64} className="text-gray-400 mx-auto mb-6" />
                        <p className="text-gray-700 font-bold text-xl mb-2">Henüz soru eklenmemiş</p>
                        <p className="text-gray-600 text-sm">Yukarıdaki "Soru Ekle" butonuna tıklayarak soru ekleyebilirsiniz</p>
                      </div>
                    ) : (
                      <DndContext onDragEnd={handleDragEnd}>
                        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
                          <div className="space-y-4">
                            {questions.map((question, index) => (
                              <QuestionCard
                                key={question.id}
                                question={question}
                                index={index}
                                onEdit={() => handleEditQuestion(question)}
                                onDelete={() => handleDeleteQuestion(question.id)}
                              />
                            ))}
                          </div>
                        </SortableContext>
                      </DndContext>
                    )}
                  </>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
