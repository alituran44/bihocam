"use client";

/**
 * EPIC-10-QUIZ: Quiz Taking Interface Component (EP10-QUIZ-FE-02)
 * 
 * Component for students to take quizzes
 */

import { useState, useEffect, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { quizzesApi, type Quiz, type QuizQuestion, type QuizAttempt } from "@/lib/api";
import { motion, AnimatePresence } from "framer-motion";

interface QuizTakingInterfaceProps {
  lessonId: string;
  quizId: string;
  assignmentId?: string;
  onComplete?: (attempt: QuizAttempt) => void;
  className?: string;
}

export function QuizTakingInterface({
  lessonId,
  quizId,
  assignmentId,
  onComplete,
  className,
}: QuizTakingInterfaceProps) {
  const queryClient = useQueryClient();
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch quiz
  const { data: quiz, isLoading: isLoadingQuiz } = useQuery<Quiz>({
    queryKey: ["quiz", quizId],
    queryFn: () => quizzesApi.get(quizId),
    enabled: !!quizId,
  });

  // Fetch or create attempt
  const { data: myAttempts } = useQuery({
    queryKey: ["quiz-attempts", quizId],
    queryFn: () => quizzesApi.listMyAttempts(quizId),
    enabled: !!quizId,
  });

  // Check for in-progress attempt
  useEffect(() => {
    if (myAttempts && myAttempts.length > 0) {
      const inProgress = myAttempts.find((a) => a.status === "in_progress");
      if (inProgress) {
        setActiveAttempt(inProgress);
        // Load existing answers
        if (inProgress.answers) {
          const answerMap: Record<string, string> = {};
          inProgress.answers.forEach((ans) => {
            answerMap[ans.question_id] = ans.answer_text;
          });
          setAnswers(answerMap);
        }
      }
    }
  }, [myAttempts]);

  // Start attempt mutation
  const startAttemptMutation = useMutation({
    mutationFn: () => quizzesApi.startAttempt(quizId, assignmentId),
    onSuccess: (attempt) => {
      setActiveAttempt(attempt);
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", quizId] });
    },
  });

  // Save progress mutation
  const saveProgressMutation = useMutation({
    mutationFn: (answersToSave: Array<{ question_id: string; answer_text: string }>) =>
      quizzesApi.saveAttemptProgress(activeAttempt!.id, answersToSave),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", quizId] });
    },
  });

  // Submit attempt mutation
  const submitAttemptMutation = useMutation({
    mutationFn: (answersToSubmit: Array<{ question_id: string; answer_text: string }>) =>
      quizzesApi.submitAttempt(activeAttempt!.id, answersToSubmit),
    onSuccess: (attempt) => {
      if (onComplete) {
        onComplete(attempt);
      }
      queryClient.invalidateQueries({ queryKey: ["quiz-attempts", quizId] });
      queryClient.invalidateQueries({ queryKey: ["lesson-progress"] });
    },
  });

  // Timer effect
  useEffect(() => {
    if (!quiz?.time_limit_minutes || !activeAttempt) return;

    const startTime = new Date(activeAttempt.started_at).getTime();
    const timeLimitMs = quiz.time_limit_minutes * 60 * 1000;

    const updateTimer = () => {
      const now = Date.now();
      const elapsed = now - startTime;
      const remaining = Math.max(0, timeLimitMs - elapsed);
      setTimeRemaining(Math.floor(remaining / 1000));

      if (remaining <= 0) {
        // Time's up - auto submit
        handleSubmit();
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [quiz?.time_limit_minutes, activeAttempt]);

  // Auto-save progress
  useEffect(() => {
    if (!activeAttempt || Object.keys(answers).length === 0) return;

    const timeoutId = setTimeout(() => {
      const answersArray = Object.entries(answers).map(([question_id, answer_text]) => ({
        question_id,
        answer_text,
      }));
      saveProgressMutation.mutate(answersArray);
    }, 2000); // Auto-save after 2 seconds of inactivity

    return () => clearTimeout(timeoutId);
  }, [answers, activeAttempt]);

  const handleStart = () => {
    startAttemptMutation.mutate();
  };

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }));
  };

  const handleNext = () => {
    if (quiz?.questions && currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
    }
  };

  const handleSubmit = () => {
    if (!activeAttempt || !quiz?.questions) return;

    setIsSubmitting(true);
    const answersArray = quiz.questions.map((q) => ({
      question_id: q.id,
      answer_text: answers[q.id] || "",
    }));

    submitAttemptMutation.mutate(answersArray);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoadingQuiz) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Quiz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center text-red-600">
          <p>Quiz bulunamadı</p>
        </div>
      </div>
    );
  }

  // Start screen
  if (!activeAttempt) {
    const hasCompletedAttempts = myAttempts?.some((a) => a.status === "completed") || false;
    const canAttempt = !quiz.max_attempts || (myAttempts?.filter((a) => a.status === "completed").length || 0) < quiz.max_attempts;

    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
            {quiz.description && (
              <p className="text-gray-600 mb-6">{quiz.description}</p>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-6 mb-6 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Soru Sayısı:</span>
              <span className="font-semibold text-gray-900">{quiz.questions?.length || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Geçme Notu:</span>
              <span className="font-semibold text-gray-900">%{quiz.passing_score}</span>
            </div>
            {quiz.time_limit_minutes && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Süre Limiti:</span>
                <span className="font-semibold text-gray-900">{quiz.time_limit_minutes} dakika</span>
              </div>
            )}
            {quiz.max_attempts && (
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Maksimum Deneme:</span>
                <span className="font-semibold text-gray-900">{quiz.max_attempts}</span>
              </div>
            )}
          </div>

          {hasCompletedAttempts && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-blue-900 mb-2">Önceki Denemeleriniz:</h3>
              <div className="space-y-2">
                {myAttempts
                  ?.filter((a) => a.status === "completed")
                  .slice(0, 3)
                  .map((attempt) => (
                    <div key={attempt.id} className="flex items-center justify-between text-sm">
                      <span className="text-blue-700">
                        {new Date(attempt.completed_at || "").toLocaleDateString("tr-TR")}
                      </span>
                      <span className="font-semibold text-blue-900">%{attempt.score_percentage}</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {!canAttempt ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
              <p className="text-red-700 font-semibold">Maksimum deneme sayısına ulaştınız</p>
            </div>
          ) : (
            <button
              onClick={handleStart}
              disabled={startAttemptMutation.isPending}
              className="w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white font-semibold py-4 px-6 rounded-lg transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {startAttemptMutation.isPending ? "Başlatılıyor..." : "Quiz'e Başla"}
            </button>
          )}
        </div>
      </div>
    );
  }

  // Quiz taking interface
  if (!quiz.questions || quiz.questions.length === 0) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center text-red-600">
          <p>Quiz'de henüz soru yok</p>
        </div>
      </div>
    );
  }

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const answeredCount = Object.keys(answers).filter((k) => answers[k]?.trim()).length;
  const progress = (answeredCount / quiz.questions.length) * 100;

  return (
    <div className={`bg-white rounded-lg border-2 border-gray-200 ${className}`}>
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-teal-50 to-blue-50">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900">{quiz.title}</h3>
          {timeRemaining !== null && (
            <div className={`px-4 py-2 rounded-lg font-mono font-bold ${
              timeRemaining < 60 ? "bg-red-100 text-red-700" : "bg-gray-100 text-gray-700"
            }`}>
              {formatTime(timeRemaining)}
            </div>
          )}
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <span>Soru {currentQuestionIndex + 1} / {quiz.questions.length}</span>
          <span>•</span>
          <span>{answeredCount} cevaplandı</span>
        </div>
        <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-gradient-to-r from-teal-500 to-teal-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Body: Split grid if PDF exists */}
      <div className={`grid grid-cols-1 ${quiz.pdf_path ? "lg:grid-cols-2" : ""} gap-6 p-6`}>
        
        {/* Left Column: PDF Sınav Kitapçığı Viewer */}
        {quiz.pdf_path && (
          <div className="w-full flex flex-col space-y-3">
            <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-150 px-3 py-1.5 rounded-lg self-start flex items-center gap-1.5">
              <span>📄</span> Sınav Kitapçığı (PDF)
            </span>
            <iframe
              src={`http://localhost:8000/media/${quiz.pdf_path}#toolbar=0`}
              className="w-full h-[550px] rounded-2xl border border-gray-200 shadow-inner bg-slate-100"
            />
          </div>
        )}

        {/* Right Column: Question & Answers */}
        <div className="flex flex-col justify-between">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div className="mb-6">
                <div className="flex items-start gap-3 mb-4">
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-lg flex items-center justify-center text-white font-bold">
                    {currentQuestionIndex + 1}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-semibold text-gray-900 mb-2">
                      {currentQuestion.question_text}
                    </h4>
                    {currentQuestion.image_path && (
                      <div className="my-4 border border-gray-200 rounded-xl overflow-hidden max-w-full">
                        <img 
                          src={`http://localhost:8000/api/v1/media/thumbnails/${currentQuestion.image_path.split('/').pop()}`} 
                          alt="Soru Görseli" 
                          className="w-full object-contain max-h-[300px]" 
                        />
                      </div>
                    )}
                    <div className="text-sm text-gray-500">
                      {currentQuestion.points} puan • {currentQuestion.question_type === "multiple_choice" ? "Çoktan Seçmeli" : currentQuestion.question_type === "true_false" ? "Doğru/Yanlış" : "Kısa Cevap"}
                    </div>
                  </div>
                </div>


                {/* Answer Input */}
                <div className="mt-6">
                  {currentQuestion.question_type === "multiple_choice" && currentQuestion.options ? (
                    <div className="space-y-3">
                      {Object.entries(currentQuestion.options).map(([key, value]) => (
                        <label
                          key={key}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            answers[currentQuestion.id] === key
                              ? "border-teal-500 bg-teal-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={key}
                            checked={answers[currentQuestion.id] === key}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-3 font-medium text-gray-900">{key}. {value}</span>
                        </label>
                      ))}
                    </div>
                  ) : currentQuestion.question_type === "true_false" ? (
                    <div className="space-y-3">
                      {["true", "false"].map((option) => (
                        <label
                          key={option}
                          className={`flex items-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                            answers[currentQuestion.id] === option
                              ? "border-teal-500 bg-teal-50"
                              : "border-gray-200 hover:border-gray-300"
                          }`}
                        >
                          <input
                            type="radio"
                            name={`question-${currentQuestion.id}`}
                            value={option}
                            checked={answers[currentQuestion.id] === option}
                            onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                            className="w-5 h-5 text-teal-600 focus:ring-teal-500"
                          />
                          <span className="ml-3 font-medium text-gray-900">
                            {option === "true" ? "Doğru" : "Yanlış"}
                          </span>
                        </label>
                      ))}
                    </div>
                  ) : (
                    <textarea
                      value={answers[currentQuestion.id] || ""}
                      onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
                      placeholder="Cevabınızı buraya yazın..."
                      className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-teal-500 focus:ring-2 focus:ring-teal-200 outline-none resize-none"
                      rows={4}
                    />
                  )}
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <button
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Önceki
            </button>

            <div className="flex items-center gap-2">
              {quiz.questions.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentQuestionIndex(idx)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    idx === currentQuestionIndex
                      ? "border-teal-500 bg-teal-500 text-white"
                      : answers[quiz.questions![idx].id]
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-300 text-gray-600 hover:border-gray-400"
                  }`}
                >
                  {idx + 1}
                </button>
              ))}
            </div>

            {currentQuestionIndex === quiz.questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                disabled={isSubmitting || answeredCount < quiz.questions.length}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
              >
                {isSubmitting ? "Gönderiliyor..." : "Gönder"}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-semibold"
              >
                Sonraki
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
