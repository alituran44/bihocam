"use client";

/**
 * EPIC-10: Content Renderer Component (EP10-FE-03)
 * 
 * Main switch component that renders the appropriate viewer based on lesson type
 */

import { LessonResponse } from "@/lib/api";
import { VideoPlayer } from "./VideoPlayer";
import dynamic from "next/dynamic";
import { DocumentViewer } from "./DocumentViewer";
import { PresentationViewer } from "./PresentationViewer";
import { TextContent } from "./TextContent";
import { LiveLessonCard } from "./LiveLessonCard";
import { QuizTakingInterface } from "./QuizTakingInterface";
import { QuizResultScreen } from "./QuizResultScreen";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { quizzesApi, coursesApi } from "@/lib/api";
import { useLazyLoad } from "@/hooks/useLazyLoad";

// Dynamic import for PDFViewer to avoid SSR issues with react-pdf
const PDFViewer = dynamic(() => import("./PDFViewer").then((mod) => ({ default: mod.PDFViewer })), {
  ssr: false,
  loading: () => (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-8">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
        <p className="text-gray-600">PDF görüntüleyici yükleniyor...</p>
      </div>
    </div>
  ),
});

interface ContentRendererProps {
  lesson: LessonResponse;
  watchedSeconds?: number;
  onProgress?: (seconds: number) => void;
  onComplete?: () => void;
  className?: string;
}

export function ContentRenderer({
  lesson,
  watchedSeconds = 0,
  onProgress,
  onComplete,
  className,
}: ContentRendererProps) {
  // EP10-FE-12: Lazy loading - only load content when visible
  const [containerRef, isVisible] = useLazyLoad<HTMLDivElement>({
    rootMargin: "100px", // Start loading 100px before visible
    threshold: 0.1,
    triggerOnce: true,
  });

  // Check access - but allow preview lessons for everyone
  const isPreview = lesson.is_preview || false;
  if (!isPreview && !lesson.can_access && lesson.requires_enrollment) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Bu içeriğe erişim yetkiniz yok</h3>
          <p className="text-gray-600">
            Bu derse erişmek için kursa kayıt olmanız gerekiyor.
          </p>
        </div>
      </div>
    );
  }

  // EP10-FE-12: Lazy load content - show placeholder until visible
  if (!isVisible) {
    return (
      <div ref={containerRef} className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  // Render based on lesson type
  switch (lesson.lesson_type) {
    case "video":
      return (
        <div ref={containerRef}>
          <VideoPlayer
            videoUrl={lesson.video_url}
            contentUrl={lesson.content_url}
            contentPath={lesson.content_path}
            title={lesson.title}
            watchedSeconds={watchedSeconds}
            onProgress={onProgress}
            onComplete={onComplete}
            className={className}
          />
        </div>
      );

    case "pdf":
      return (
        <div ref={containerRef}>
          <PDFViewer
            pdfUrl={lesson.content_url}
            filename={lesson.original_filename}
            className={className}
          />
        </div>
      );

    case "document":
      return (
        <div ref={containerRef}>
          <DocumentViewer
            documentUrl={lesson.content_url}
            filename={lesson.original_filename}
            className={className}
          />
        </div>
      );

    case "presentation":
      return (
        <div ref={containerRef}>
          <PresentationViewer
            presentationUrl={lesson.content_url}
            filename={lesson.original_filename}
            className={className}
          />
        </div>
      );

    case "text":
      return (
        <div ref={containerRef}>
          <TextContent
            content={lesson.content_text}
            className={className}
          />
        </div>
      );

    case "live_lesson":
      return (
        <div ref={containerRef}>
          <LiveLessonCard
            title={lesson.title}
            description={lesson.description}
            liveLessonUrl={lesson.live_lesson_url}
            liveLessonAt={lesson.live_lesson_at}
            isEnded={lesson.is_live_lesson_ended}
            recordingUrl={lesson.live_lesson_recording_url}
            className={className}
          />
        </div>
      );

    case "quiz":
      return (
        <QuizContentRenderer
          lesson={lesson}
          onComplete={onComplete}
          className={className}
        />
      );

    default:
      return (
        <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
          <div className="text-center text-gray-500">
            <p>Bilinmeyen içerik tipi: {lesson.lesson_type}</p>
          </div>
        </div>
      );
  }
}

/**
 * Quiz Content Renderer - Handles quiz state (taking vs results)
 */
function QuizContentRenderer({
  lesson,
  onComplete,
  className,
}: {
  lesson: LessonResponse;
  onComplete?: () => void;
  className?: string;
}) {
  const [completedAttemptId, setCompletedAttemptId] = useState<string | null>(null);
  const [showResults, setShowResults] = useState(false);

  // Fetch quiz for this lesson
  const { data: course } = useQuery({
    queryKey: ["course", lesson.course_id],
    queryFn: () => coursesApi.get(lesson.course_id),
    enabled: !!lesson.course_id,
  });

  // Try to find quiz ID from lesson (if backend returns it)
  // Otherwise, we need to fetch quiz by lesson_id
  const { data: quiz } = useQuery({
    queryKey: ["quiz-by-lesson", lesson.id],
    queryFn: async () => {
      // List quizzes for this lesson
      const quizzes = await quizzesApi.list({ lesson_id: lesson.id });
      return quizzes.length > 0 ? quizzesApi.get(quizzes[0].id) : null;
    },
    enabled: !!lesson.id && lesson.lesson_type === "quiz",
  });

  // Check for completed attempts
  const { data: myAttempts } = useQuery({
    queryKey: ["quiz-attempts", quiz?.id],
    queryFn: () => (quiz?.id ? quizzesApi.listMyAttempts(quiz.id) : Promise.resolve([])),
    enabled: !!quiz?.id,
  });

  useEffect(() => {
    if (myAttempts && myAttempts.length > 0) {
      const latestCompleted = myAttempts
        .filter((a) => a.status === "completed")
        .sort((a, b) => new Date(b.completed_at || 0).getTime() - new Date(a.completed_at || 0).getTime())[0];
      
      if (latestCompleted) {
        setCompletedAttemptId(latestCompleted.id);
        setShowResults(true);
      }
    }
  }, [myAttempts]);

  if (!quiz) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Quiz yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (showResults && completedAttemptId) {
    return (
      <QuizResultScreen
        quizId={quiz.id}
        attemptId={completedAttemptId}
        lessonId={lesson.id}
        courseId={lesson.course_id}
        onRetry={() => {
          setShowResults(false);
          setCompletedAttemptId(null);
        }}
        className={className}
      />
    );
  }

  return (
    <QuizTakingInterface
      lessonId={lesson.id}
      quizId={quiz.id}
      onComplete={(attempt) => {
        setCompletedAttemptId(attempt.id);
        setShowResults(true);
        if (onComplete) {
          onComplete();
        }
      }}
      className={className}
    />
  );
}
