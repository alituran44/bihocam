"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { quizzesApi } from "@/lib/api";
import { QuizTakingInterface } from "@/components/content/QuizTakingInterface";
import { QuizResultScreen } from "@/components/content/QuizResultScreen";
import Link from "next/link";

export default function StudentAssignmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const assignmentId = params.assignmentId as string;
  const [forceShowTakeInterface, setForceShowTakeInterface] = useState(false);

  const { data: assignment, isLoading, error, refetch } = useQuery({
    queryKey: ["assignment", assignmentId],
    queryFn: () => quizzesApi.getAssignment(assignmentId),
    enabled: !!assignmentId,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-8 animate-pulse p-4">
        <div className="h-6 w-32 bg-gray-200 rounded-lg" />
        <div className="bg-white border border-gray-200 rounded-2xl p-8 space-y-6">
          <div className="h-10 w-2/3 bg-gray-200 rounded-xl" />
          <div className="h-20 w-full bg-gray-200 rounded-xl" />
          <div className="h-40 w-full bg-gray-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="max-w-md mx-auto text-center py-16 px-4">
        <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-1">Sınav Yüklenemedi</h3>
        <p className="text-gray-500 text-sm mb-6">Sınav bulunamadı veya bu sınava erişim yetkiniz yok.</p>
        <Link
          href="/dashboard/student/assigned-quizzes"
          className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl border border-gray-200 transition-all text-sm"
        >
          Atanan Testlere Dön
        </Link>
      </div>
    );
  }

  const quiz = assignment.quiz;
  const attempt = assignment.my_attempt;
  const isCompleted = attempt?.status === "completed";

  const handleComplete = () => {
    setForceShowTakeInterface(false);
    refetch();
    // Invalidate main assignments list
    queryClient.invalidateQueries({ queryKey: ["my-assigned-quizzes"] });
  };

  const handleRetry = () => {
    setForceShowTakeInterface(true);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 p-4">
      {/* Breadcrumbs / Header */}
      <div className="flex items-center gap-2 text-xs font-bold text-gray-400">
        <Link href="/dashboard/student/assigned-quizzes" className="hover:text-teal-600 transition-colors">
          ATANAN TESTLER
        </Link>
        <span>/</span>
        <span className="text-gray-600 truncate max-w-xs">{quiz?.title || "Test Detayı"}</span>
      </div>

      {isCompleted && !forceShowTakeInterface ? (
        <QuizResultScreen
          quizId={assignment.quiz_id}
          attemptId={attempt.id}
          lessonId="standalone"
          courseId={assignment.course_id || ""}
          onRetry={handleRetry}
        />
      ) : (
        <QuizTakingInterface
          lessonId="standalone"
          quizId={assignment.quiz_id}
          assignmentId={assignment.id}
          onComplete={handleComplete}
        />
      )}
    </div>
  );
}
