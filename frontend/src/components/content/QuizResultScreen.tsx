"use client";

/**
 * EPIC-10-QUIZ: Quiz Result Screen Component (EP10-QUIZ-FE-02)
 * 
 * Component to display quiz results after submission
 */

import { useQuery } from "@tanstack/react-query";
import { quizzesApi, type Quiz, type QuizAttempt, type QuizQuestion } from "@/lib/api";
import { motion } from "framer-motion";
import Link from "next/link";

interface QuizResultScreenProps {
  quizId: string;
  attemptId: string;
  lessonId: string;
  courseId: string;
  onRetry?: () => void;
  className?: string;
}

export function QuizResultScreen({
  quizId,
  attemptId,
  lessonId,
  courseId,
  onRetry,
  className,
}: QuizResultScreenProps) {
  // Fetch quiz with questions
  const { data: quiz } = useQuery<Quiz>({
    queryKey: ["quiz", quizId],
    queryFn: () => quizzesApi.get(quizId),
    enabled: !!quizId,
  });

  // Fetch attempt with questions
  const { data: attempt } = useQuery<QuizAttempt>({
    queryKey: ["quiz-attempt", attemptId],
    queryFn: () => quizzesApi.getAttempt(attemptId, true),
    enabled: !!attemptId,
  });

  if (!quiz || !attempt) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Sonuçlar yükleniyor...</p>
        </div>
      </div>
    );
  }

  const passed = attempt.score_percentage >= quiz.passing_score;
  const showCorrectAnswers = quiz.show_correct_answers || attempt.status === "completed";

  // Create a map of questions by ID for quick lookup
  const questionsMap = new Map<string, QuizQuestion>();
  quiz.questions?.forEach((q) => {
    questionsMap.set(q.id, q);
  });

  // Create a map of answers by question ID
  const answersMap = new Map<string, string>();
  attempt.answers?.forEach((ans) => {
    answersMap.set(ans.question_id, ans.answer_text);
  });

  const formatTime = (seconds: number | null | undefined) => {
    if (!seconds) return "N/A";
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className={`bg-white rounded-lg border-2 border-gray-200 ${className}`}>
      {/* Result Header */}
      <div className={`p-8 text-center ${
        passed ? "bg-gradient-to-r from-green-50 to-emerald-50" : "bg-gradient-to-r from-red-50 to-orange-50"
      }`}>
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className={`w-24 h-24 mx-auto mb-4 rounded-full flex items-center justify-center ${
            passed ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {passed ? (
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-12 h-12 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
        </motion.div>

        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          {passed ? "Tebrikler! Quiz'i Geçtiniz" : "Quiz'i Geçemediniz"}
        </h2>
        <div className="text-5xl font-bold mb-2" style={{ color: passed ? "#10b981" : "#ef4444" }}>
          %{attempt.score_percentage}
        </div>
        <p className="text-gray-600">
          {attempt.correct_answers} / {attempt.total_questions} soru doğru
        </p>
        <p className="text-gray-500 text-sm mt-2">
          {attempt.points_earned} / {attempt.total_points} puan
        </p>
        {attempt.time_taken_seconds && (
          <p className="text-gray-500 text-sm mt-1">
            Süre: {formatTime(attempt.time_taken_seconds)}
          </p>
        )}
      </div>

      {/* Questions Review */}
      {showCorrectAnswers && quiz.questions && (
        <div className="p-6 border-t border-gray-200">
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Soru Değerlendirmesi</h3>
          <div className="space-y-4">
            {quiz.questions.map((question, index) => {
              const userAnswer = answersMap.get(question.id) || "";
              const attemptAnswer = attempt.answers?.find((a) => a.question_id === question.id);
              const isCorrect = attemptAnswer?.is_correct || false;

              return (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-4 border-2 rounded-lg ${
                    isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"
                  }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <div className={`flex-shrink-0 w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold ${
                      isCorrect ? "bg-green-500" : "bg-red-500"
                    }`}>
                      {isCorrect ? "✓" : "✗"}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">
                        Soru {index + 1}: {question.question_text}
                      </h4>
                      <div className="text-sm text-gray-600 mb-2">
                        {question.points} puan
                      </div>
                    </div>
                  </div>

                  <div className="ml-11 space-y-2">
                    <div>
                      <span className="text-sm font-medium text-gray-700">Cevabınız: </span>
                      <span className={`text-sm font-semibold ${
                        isCorrect ? "text-green-700" : "text-red-700"
                      }`}>
                        {question.question_type === "multiple_choice" && question.options
                          ? `${userAnswer}. ${question.options[userAnswer] || userAnswer}`
                          : question.question_type === "true_false"
                          ? userAnswer === "true" ? "Doğru" : "Yanlış"
                          : userAnswer || "Cevap verilmedi"}
                      </span>
                    </div>
                    {!isCorrect && (
                      <div>
                        <span className="text-sm font-medium text-gray-700">Doğru Cevap: </span>
                        <span className="text-sm font-semibold text-green-700">
                          {question.question_type === "multiple_choice" && question.options
                            ? `${question.correct_answer}. ${question.options[question.correct_answer] || question.correct_answer}`
                            : question.question_type === "true_false"
                            ? question.correct_answer === "true" ? "Doğru" : "Yanlış"
                            : question.correct_answer}
                        </span>
                      </div>
                    )}
                    {question.explanation && (
                      <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <span className="text-sm font-medium text-blue-900">Açıklama: </span>
                        <span className="text-sm text-blue-700">{question.explanation}</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="p-6 border-t border-gray-200 flex items-center justify-between">
        <Link
          href={`/dashboard/courses/${courseId}`}
          className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          Derse Dön
        </Link>
        {onRetry && (!quiz.max_attempts || (attempt.status === "completed" && quiz.max_attempts && quiz.max_attempts > 0)) && (
          <button
            onClick={onRetry}
            className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:from-teal-600 hover:to-teal-700 transition-all font-semibold"
          >
            Tekrar Dene
          </button>
        )}
      </div>
    </div>
  );
}
