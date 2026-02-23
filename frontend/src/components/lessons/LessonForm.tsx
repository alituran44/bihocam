"use client";

/**
 * EPIC-10: Dynamic Lesson Form Component (EP10-FE-02)
 * 
 * Form for creating/editing lessons with type-specific fields
 */

import { useState, useEffect, useRef } from "react";
import { LessonType, LessonResponse } from "@/lib/api";
import { FileUpload } from "@/components/ui/FileUpload";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { QuizManager } from "./QuizManager";
import { validateVideoUrl, validateLiveLessonUrl, setupUnsavedChangesWarning, hasUnsavedChanges } from "@/lib/security";

interface LessonFormProps {
  courseId: string;
  lesson?: LessonResponse | null;
  onSave: (data: {
    title: string;
    description?: string;
    lesson_type: LessonType;
    is_preview?: boolean;
    video_url?: string;
    duration_seconds?: number;
    content_text?: string;
    live_lesson_url?: string;
    live_lesson_at?: string;
  }) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

const lessonTypeOptions: { value: LessonType; label: string; icon: string; description: string }[] = [
  { value: "video", label: "Video", icon: "🎬", description: "Video dosyası veya YouTube/Vimeo linki" },
  { value: "pdf", label: "PDF", icon: "📄", description: "PDF doküman" },
  { value: "document", label: "Doküman", icon: "📝", description: "DOCX/DOC dosyası" },
  { value: "presentation", label: "Sunum", icon: "📊", description: "PPTX/PPT sunum dosyası" },
  { value: "live_lesson", label: "Canlı Ders", icon: "🔴", description: "Canlı ders (Zoom/Meet/Teams)" },
  { value: "text", label: "Metin", icon: "✍️", description: "Zengin metin içerik" },
  { value: "quiz", label: "Quiz", icon: "❓", description: "Sınav/Quiz" },
];

export function LessonForm({ courseId, lesson, onSave, onCancel, isLoading = false }: LessonFormProps) {
  const [title, setTitle] = useState(lesson?.title || "");
  const [description, setDescription] = useState(lesson?.description || "");
  const [lessonType, setLessonType] = useState<LessonType>(lesson?.lesson_type || "video");
  const [isPreview, setIsPreview] = useState(lesson?.is_preview || false);
  const [showQuizManager, setShowQuizManager] = useState(false);
  
  // Video-specific fields
  const [videoUrl, setVideoUrl] = useState(lesson?.video_url || "");
  const [videoUrlError, setVideoUrlError] = useState<string | null>(null);
  const [durationSeconds, setDurationSeconds] = useState(lesson?.duration_seconds?.toString() || "");
  
  // Text content field
  const [contentText, setContentText] = useState(lesson?.content_text || "");
  
  // Live lesson fields
  const [liveLessonUrl, setLiveLessonUrl] = useState(lesson?.live_lesson_url || "");
  const [liveLessonUrlError, setLiveLessonUrlError] = useState<string | null>(null);
  const [liveLessonAt, setLiveLessonAt] = useState(
    lesson?.live_lesson_at ? new Date(lesson.live_lesson_at).toISOString().slice(0, 16) : ""
  );

  // Store original data for unsaved changes detection
  const originalDataRef = useRef({
    title: lesson?.title || "",
    description: lesson?.description || "",
    lesson_type: lesson?.lesson_type || "video",
    is_preview: lesson?.is_preview || false,
    video_url: lesson?.video_url || "",
    content_text: lesson?.content_text || "",
    live_lesson_url: lesson?.live_lesson_url || "",
    live_lesson_at: lesson?.live_lesson_at ? new Date(lesson.live_lesson_at).toISOString().slice(0, 16) : "",
  });

  useEffect(() => {
    if (lesson) {
      setTitle(lesson.title);
      setDescription(lesson.description || "");
      setLessonType(lesson.lesson_type);
      setIsPreview(lesson.is_preview);
      setVideoUrl(lesson.video_url || "");
      setDurationSeconds(lesson.duration_seconds?.toString() || "");
      setContentText(lesson.content_text || "");
      setLiveLessonUrl(lesson.live_lesson_url || "");
      setLiveLessonAt(lesson.live_lesson_at ? new Date(lesson.live_lesson_at).toISOString().slice(0, 16) : "");
      
      // Update original data ref
      originalDataRef.current = {
        title: lesson.title,
        description: lesson.description || "",
        lesson_type: lesson.lesson_type,
        is_preview: lesson.is_preview,
        video_url: lesson.video_url || "",
        content_text: lesson.content_text || "",
        live_lesson_url: lesson.live_lesson_url || "",
        live_lesson_at: lesson.live_lesson_at ? new Date(lesson.live_lesson_at).toISOString().slice(0, 16) : "",
      };
    }
  }, [lesson]);

  // Unsaved changes warning
  useEffect(() => {
    const currentData = {
      title,
      description,
      lesson_type: lessonType,
      is_preview: isPreview,
      video_url: videoUrl,
      content_text: contentText,
      live_lesson_url: liveLessonUrl,
      live_lesson_at: liveLessonAt,
    };

    const hasChanges = hasUnsavedChanges(originalDataRef.current, currentData);
    const cleanup = setupUnsavedChangesWarning(hasChanges);
    return cleanup;
  }, [title, description, lessonType, isPreview, videoUrl, contentText, liveLessonUrl, liveLessonAt]);

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    if (url.trim()) {
      const validation = validateVideoUrl(url);
      if (!validation.valid) {
        setVideoUrlError(validation.error || "Geçersiz URL");
      } else {
        setVideoUrlError(null);
      }
    } else {
      setVideoUrlError(null);
    }
  };

  const handleLiveLessonUrlChange = (url: string) => {
    setLiveLessonUrl(url);
    if (url.trim()) {
      const validation = validateLiveLessonUrl(url);
      if (!validation.valid) {
        setLiveLessonUrlError(validation.error || "Geçersiz URL");
      } else {
        setLiveLessonUrlError(null);
      }
    } else {
      setLiveLessonUrlError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    // Validate URLs before submit
    if (lessonType === "video" && videoUrl) {
      const validation = validateVideoUrl(videoUrl);
      if (!validation.valid) {
        setVideoUrlError(validation.error || "Geçersiz URL");
        return;
      }
    }

    if (lessonType === "live_lesson" && liveLessonUrl) {
      const validation = validateLiveLessonUrl(liveLessonUrl);
      if (!validation.valid) {
        setLiveLessonUrlError(validation.error || "Geçersiz URL");
        return;
      }
    }

    const data: any = {
      title: title.trim(),
      description: description.trim() || undefined,
      lesson_type: lessonType,
      is_preview: isPreview,
    };

    // Type-specific fields
    if (lessonType === "video") {
      if (videoUrl) data.video_url = videoUrl;
      if (durationSeconds) data.duration_seconds = parseInt(durationSeconds, 10);
    } else if (lessonType === "text") {
      if (contentText) data.content_text = contentText;
    } else if (lessonType === "live_lesson") {
      if (liveLessonUrl) data.live_lesson_url = liveLessonUrl;
      if (liveLessonAt) data.live_lesson_at = new Date(liveLessonAt).toISOString();
    }

    await onSave(data);
  };

  return (
    <form 
      onSubmit={handleSubmit} 
      className="space-y-6 p-6 bg-gradient-to-br from-gray-50 to-teal-50 border-2 border-teal-200 rounded-xl"
      aria-label={lesson ? "Ders düzenleme formu" : "Yeni ders ekleme formu"}
    >
      <div className="flex items-center gap-3 mb-4">
        <h3 className="font-bold text-gray-900 text-lg flex items-center gap-2" id="lesson-form-title">
          {lesson ? "Ders Düzenle" : "Yeni Ders Ekle"}
        </h3>
      </div>

      {/* Lesson Type Selection */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-3">
          İçerik Tipi <span className="text-red-500">*</span>
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {lessonTypeOptions.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => setLessonType(option.value)}
              className={`p-4 rounded-xl border-2 transition-all text-left ${
                lessonType === option.value
                  ? "border-teal-500 bg-teal-50 shadow-md"
                  : "border-gray-200 hover:border-gray-300 bg-white"
              }`}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <div className="font-semibold text-sm text-gray-900">{option.label}</div>
              <div className="text-xs text-gray-500 mt-1">{option.description}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Basic Fields */}
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Ders Başlığı <span className="text-red-500">*</span>
        </label>
        <Input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Örn: Giriş - Temel Kavramlar"
          required
          aria-label="Ders başlığı"
          aria-describedby="lesson-title-desc"
        />
        <p id="lesson-title-desc" className="sr-only">
          Ders başlığı zorunlu alandır
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Açıklama</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Ders açıklaması (opsiyonel)"
          className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 placeholder-gray-400 transition-all resize-none"
        />
      </div>

      {/* Type-Specific Fields */}
      {lessonType === "video" && (
        <div className="space-y-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              YouTube/Vimeo URL (Opsiyonel)
            </label>
            <Input
              type="url"
              value={videoUrl}
              onChange={(e) => handleVideoUrlChange(e.target.value)}
              placeholder="https://www.youtube.com/watch?v=..."
              aria-label="Video URL"
              aria-invalid={!!videoUrlError}
              aria-describedby={videoUrlError ? "video-url-error" : "video-url-desc"}
            />
            {videoUrlError && (
              <p id="video-url-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
                {videoUrlError}
              </p>
            )}
            <p id="video-url-desc" className="sr-only">
              YouTube veya Vimeo video linki
            </p>
            <p className="text-xs text-gray-500 mt-1">
              Video dosyası yüklemek yerine YouTube veya Vimeo linki ekleyebilirsiniz
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Süre (saniye)</label>
            <Input
              type="number"
              value={durationSeconds}
              onChange={(e) => setDurationSeconds(e.target.value)}
              placeholder="Örn: 3600 (1 saat)"
              min="0"
            />
          </div>
        </div>
      )}

      {lessonType === "text" && (
        <div className="p-4 bg-gray-50 border-2 border-gray-200 rounded-lg">
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Metin İçeriği
          </label>
          <textarea
            value={contentText}
            onChange={(e) => setContentText(e.target.value)}
            rows={10}
            placeholder="Zengin metin içeriğinizi buraya yazın..."
            className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900 placeholder-gray-400 transition-all resize-none"
          />
          <p className="text-xs text-gray-500 mt-1">
            HTML etiketleri kullanabilirsiniz. Güvenlik için backend tarafında sanitize edilecektir.
          </p>
        </div>
      )}

      {lessonType === "live_lesson" && (
        <div className="space-y-4 p-4 bg-purple-50 border-2 border-purple-200 rounded-lg">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Canlı Ders URL <span className="text-red-500">*</span>
            </label>
            <Input
              type="url"
              value={liveLessonUrl}
              onChange={(e) => handleLiveLessonUrlChange(e.target.value)}
              placeholder="https://zoom.us/j/... veya https://meet.google.com/..."
              required={lessonType === "live_lesson"}
              aria-label="Canlı ders URL"
              aria-invalid={!!liveLessonUrlError}
              aria-describedby={liveLessonUrlError ? "live-lesson-url-error" : "live-lesson-url-desc"}
            />
            {liveLessonUrlError && (
              <p id="live-lesson-url-error" className="text-xs text-red-600 mt-1" role="alert" aria-live="polite">
                {liveLessonUrlError}
              </p>
            )}
            <p id="live-lesson-url-desc" className="sr-only">
              Zoom, Google Meet veya Microsoft Teams canlı ders linki
            </p>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Tarih ve Saat <span className="text-red-500">*</span>
            </label>
            <Input
              type="datetime-local"
              value={liveLessonAt}
              onChange={(e) => setLiveLessonAt(e.target.value)}
              required={lessonType === "live_lesson"}
            />
          </div>
        </div>
      )}

      {lessonType === "quiz" && lesson && (
        <div className="p-4 bg-yellow-50 border-2 border-yellow-200 rounded-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-gray-900 mb-1">
                Quiz Yönetimi
              </p>
              <p className="text-xs text-gray-600">
                Quiz ayarlarını ve soruları yönetmek için butona tıklayın
              </p>
            </div>
            <Button
              type="button"
              onClick={() => setShowQuizManager(true)}
              variant="outline"
            >
              Quiz Yönet
            </Button>
          </div>
        </div>
      )}

      {/* Preview Toggle */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPreview}
            onChange={(e) => setIsPreview(e.target.checked)}
            className="w-5 h-5 text-teal-600 border-2 border-gray-300 rounded focus:ring-teal-500"
          />
          <span className="text-sm font-medium text-gray-900">Önizleme dersi (herkes görebilir)</span>
        </label>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-2">
        <Button
          type="submit"
          disabled={!title.trim() || isLoading}
          isLoading={isLoading}
        >
          {lesson ? "Güncelle" : "Ders Ekle"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isLoading}
        >
          İptal
        </Button>
      </div>

      {/* Quiz Manager Modal */}
      {showQuizManager && lesson && (
        <QuizManager
          lessonId={lesson.id}
          courseId={courseId}
          onClose={() => setShowQuizManager(false)}
        />
      )}
    </form>
  );
}
