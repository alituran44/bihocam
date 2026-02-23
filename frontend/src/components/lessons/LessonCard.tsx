"use client";

/**
 * EPIC-10: Lesson Card Component (EP10-FE-02)
 * 
 * Displays a lesson card with type-specific styling and actions
 */

import { useState } from "react";
import { motion } from "framer-motion";
import { LessonResponse, LessonType } from "@/lib/api";
import { FileUpload } from "@/components/ui/FileUpload";
import { mediaApi, coursesApi } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { QuizManager } from "./QuizManager";

interface LessonCardProps {
  lesson: LessonResponse;
  courseId: string;
  index: number;
  onEdit?: (lesson: LessonResponse) => void;
  onDelete?: (lessonId: string) => void;
  isDragging?: boolean;
  dragHandleProps?: any; // dnd-kit listeners and attributes
}

// Lesson type configuration
const lessonTypeConfig: Record<LessonType, { icon: string; color: string; bgColor: string; label: string }> = {
  video: { icon: "🎬", color: "text-blue-700", bgColor: "bg-blue-100", label: "Video" },
  pdf: { icon: "📄", color: "text-red-700", bgColor: "bg-red-100", label: "PDF" },
  document: { icon: "📝", color: "text-green-700", bgColor: "bg-green-100", label: "Doküman" },
  presentation: { icon: "📊", color: "text-orange-700", bgColor: "bg-orange-100", label: "Sunum" },
  live_lesson: { icon: "🔴", color: "text-purple-700", bgColor: "bg-purple-100", label: "Canlı Ders" },
  text: { icon: "✍️", color: "text-gray-700", bgColor: "bg-gray-100", label: "Metin" },
  quiz: { icon: "❓", color: "text-yellow-700", bgColor: "bg-yellow-100", label: "Quiz" },
};

export function LessonCard({ lesson, courseId, index, onEdit, onDelete, isDragging = false, dragHandleProps }: LessonCardProps) {
  const queryClient = useQueryClient();
  const [showUpload, setShowUpload] = useState(false);
  const [showQuizManager, setShowQuizManager] = useState(false);
  const config = lessonTypeConfig[lesson.lesson_type] || lessonTypeConfig.video;

  // Format file size
  const formatFileSize = (bytes: number | null): string => {
    if (!bytes) return "";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Format duration
  const formatDuration = (seconds: number | null): string => {
    if (!seconds) return "";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) return `${hours}s ${minutes}dk`;
    return `${minutes}dk`;
  };

  // Upload mutations (without progress tracking, for simple cases)
  const uploadVideoMutation = useMutation({
    mutationFn: (file: File) => mediaApi.uploadVideo(lesson.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
      setShowUpload(false);
    },
  });

  const uploadDocumentMutation = useMutation({
    mutationFn: (file: File) => mediaApi.uploadDocument(lesson.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
      setShowUpload(false);
    },
  });

  const uploadContentMutation = useMutation({
    mutationFn: (file: File) => mediaApi.uploadContent(lesson.id, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
      setShowUpload(false);
    },
  });

  // Delete mutation
  const deleteLessonMutation = useMutation({
    mutationFn: () => coursesApi.deleteLesson(courseId, lesson.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
      onDelete?.(lesson.id);
    },
  });

  // Get upload handler based on lesson type (with progress support)
  const getUploadHandler = (onProgress?: (progress: number) => void) => {
    switch (lesson.lesson_type) {
      case "video":
        return async (file: File) => {
          await mediaApi.uploadVideo(lesson.id, file, onProgress);
          queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
          setShowUpload(false);
        };
      case "pdf":
      case "document":
        return async (file: File) => {
          await mediaApi.uploadDocument(lesson.id, file, onProgress);
          queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
          setShowUpload(false);
        };
      case "presentation":
        return async (file: File) => {
          await mediaApi.uploadContent(lesson.id, file, onProgress);
          queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
          setShowUpload(false);
        };
      default:
        return undefined;
    }
  };

  // Get accept string based on lesson type
  const getAcceptString = (): string | undefined => {
    switch (lesson.lesson_type) {
      case "video":
        return "video/mp4,video/webm,video/ogg,video/quicktime,video/x-msvideo";
      case "pdf":
        return ".pdf";
      case "document":
        return ".docx,.doc";
      case "presentation":
        return ".pptx,.ppt";
      default:
        return undefined;
    }
  };

  const hasContent = lesson.content_url || lesson.content_path || lesson.video_url || lesson.content_text;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: isDragging ? 0.5 : 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-gradient-to-br from-white to-gray-50 border-2 rounded-xl p-6 hover:border-teal-300 hover:shadow-lg transition-all ${
        isDragging ? "border-teal-500 shadow-xl" : "border-gray-200"
      }`}
    >
      <div className="flex items-start justify-between gap-4 mb-4">
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Drag Handle */}
          <div 
            {...dragHandleProps}
            className="flex-shrink-0 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 transition-colors touch-none"
            aria-label="Sürükle"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
            </svg>
          </div>

          {/* Lesson Number & Type Icon */}
          <div className="flex-shrink-0">
            <div className={`w-12 h-12 rounded-xl ${config.bgColor} ${config.color} flex items-center justify-center text-2xl font-bold shadow-sm`}>
              {config.icon}
            </div>
          </div>

          {/* Lesson Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <h3 className="font-bold text-gray-900 text-lg truncate">{lesson.title}</h3>
              <span className={`text-xs px-2 py-1 ${config.bgColor} ${config.color} rounded-full font-medium`}>
                {config.label}
              </span>
              {lesson.is_preview && (
                <span className="text-xs px-2 py-1 bg-green-100 text-green-700 rounded-full font-medium">
                  👁 Önizleme
                </span>
              )}
            </div>
            {lesson.description && (
              <p className="text-sm text-gray-600 mb-3 line-clamp-2">{lesson.description}</p>
            )}
            <div className="flex items-center gap-3 flex-wrap text-xs text-gray-500">
              {lesson.duration_seconds && (
                <span className="flex items-center gap-1">
                  ⏱ {formatDuration(lesson.duration_seconds)}
                </span>
              )}
              {lesson.file_size_bytes && (
                <span className="flex items-center gap-1">
                  📦 {formatFileSize(lesson.file_size_bytes)}
                </span>
              )}
              {lesson.original_filename && (
                <span className="flex items-center gap-1 truncate max-w-[200px]">
                  📄 {lesson.original_filename}
                </span>
              )}
              {lesson.live_lesson_at && (
                <span className="flex items-center gap-1">
                  📅 {new Date(lesson.live_lesson_at).toLocaleString("tr-TR")}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {lesson.lesson_type === "quiz" && (
            <button
              onClick={() => setShowQuizManager(true)}
              className="p-2 text-gray-600 hover:text-yellow-600 hover:bg-yellow-50 rounded-lg transition-colors"
              title="Quiz Yönet"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
              </svg>
            </button>
          )}
          {onEdit && (
            <button
              onClick={() => onEdit(lesson)}
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
              title="Düzenle"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          )}
          {onDelete && (
            <button
              onClick={() => {
                if (confirm(`"${lesson.title}" dersini silmek istediğinize emin misiniz?`)) {
                  deleteLessonMutation.mutate();
                }
              }}
              disabled={deleteLessonMutation.isPending}
              className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Sil"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Content Upload Section */}
      {!hasContent && (lesson.lesson_type === "video" || lesson.lesson_type === "pdf" || lesson.lesson_type === "document" || lesson.lesson_type === "presentation") && (
        <div className="pt-4 border-t-2 border-gray-200">
          {!showUpload ? (
            <button
              onClick={() => setShowUpload(true)}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-sm rounded-lg transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
              </svg>
              {lesson.lesson_type === "video" ? "Video Yükle" : "Dosya Yükle"}
            </button>
          ) : (
            <div className="space-y-3">
              <FileUpload
                accept={getAcceptString()}
                maxSizeMB={lesson.lesson_type === "video" ? 500 : 50}
                onUpload={async (file, onProgress) => {
                  const handler = getUploadHandler(onProgress);
                  if (handler) {
                    try {
                      await handler(file);
                    } catch (error) {
                      console.error("Upload error:", error);
                      throw error; // Re-throw to let FileUpload handle the error
                    }
                  }
                }}
                onRemove={() => setShowUpload(false)}
                label={`${config.label} Dosyası Yükle`}
                description={`Maksimum: ${lesson.lesson_type === "video" ? "500" : "50"} MB`}
              />
            </div>
          )}
        </div>
      )}

      {/* Content Status */}
      {hasContent && (
        <div className="pt-4 border-t-2 border-gray-200">
          <div className="flex items-center justify-between p-3 bg-green-50 border-2 border-green-200 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-sm font-semibold text-green-700">
                {lesson.lesson_type === "video" ? "Video" : lesson.lesson_type === "text" ? "Metin içerik" : "Dosya"} yüklendi
              </span>
            </div>
            {lesson.content_url && (
              <a
                href={lesson.content_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-teal-600 hover:text-teal-700 font-medium px-3 py-1 hover:bg-teal-50 rounded transition-colors"
              >
                Görüntüle
              </a>
            )}
          </div>
        </div>
      )}

      {/* Quiz Manager Modal */}
      {showQuizManager && (
        <QuizManager
          lessonId={lesson.id}
          courseId={courseId}
          onClose={() => setShowQuizManager(false)}
        />
      )}
    </motion.div>
  );
}
