"use client";

/**
 * EPIC-10: Live Lesson Manager Component (EP10-FE-04)
 * 
 * Component for teachers to create, manage, and upload recordings for live lessons
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { coursesApi, mediaApi, type LessonResponse } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { FileUpload } from "@/components/ui/FileUpload";

interface LiveLessonManagerProps {
  courseId: string;
}

export function LiveLessonManager({ courseId }: LiveLessonManagerProps) {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonResponse | null>(null);
  const [showUploadRecording, setShowUploadRecording] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [liveLessonUrl, setLiveLessonUrl] = useState("");
  const [liveLessonAt, setLiveLessonAt] = useState("");
  const [notifyStudents, setNotifyStudents] = useState(true);

  // Fetch live lessons
  const { data: liveLessons, isLoading } = useQuery<LessonResponse[]>({
    queryKey: ["live-lessons", courseId],
    queryFn: () => coursesApi.getLiveLessons(courseId, "all"),
    enabled: !!courseId,
  });

  // Create live lesson mutation
  const createMutation = useMutation({
    mutationFn: () =>
      coursesApi.createLiveLesson(courseId, {
        title,
        description: description || undefined,
        live_lesson_url: liveLessonUrl,
        live_lesson_at: liveLessonAt,
        notify_students: notifyStudents,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
      setShowCreateForm(false);
      resetForm();
    },
  });

  // Reschedule mutation
  const rescheduleMutation = useMutation({
    mutationFn: (data: { live_lesson_url?: string; live_lesson_at: string; notify_students?: boolean }) =>
      coursesApi.rescheduleLiveLesson(courseId, editingLesson!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
      setEditingLesson(null);
      resetForm();
    },
  });

  // Cancel mutation
  const cancelMutation = useMutation({
    mutationFn: () => coursesApi.cancelLiveLesson(courseId, editingLesson!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
      setEditingLesson(null);
    },
  });

  // End live lesson mutation
  const endMutation = useMutation({
    mutationFn: () => coursesApi.endLiveLesson(courseId, editingLesson!.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
      setEditingLesson(null);
    },
  });

  // Upload recording mutation
  const uploadRecordingMutation = useMutation({
    mutationFn: (file: File) => mediaApi.uploadRecording(showUploadRecording!, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["live-lessons", courseId] });
      queryClient.invalidateQueries({ queryKey: ["my-course", courseId] });
      setShowUploadRecording(null);
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setLiveLessonUrl("");
    setLiveLessonAt("");
    setNotifyStudents(true);
  };

  const handleEdit = (lesson: LessonResponse) => {
    setEditingLesson(lesson);
    setTitle(lesson.title);
    setDescription(lesson.description || "");
    setLiveLessonUrl(lesson.live_lesson_url || "");
    setLiveLessonAt(lesson.live_lesson_at ? new Date(lesson.live_lesson_at).toISOString().slice(0, 16) : "");
    setShowCreateForm(true);
    // Scroll to form
    setTimeout(() => {
      const formElement = document.getElementById("live-lesson-form");
      if (formElement) {
        formElement.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !liveLessonUrl.trim() || !liveLessonAt) return;

    // Validate URL
    try {
      const url = new URL(liveLessonUrl);
      if (!["https:"].includes(url.protocol)) {
        alert("URL https ile başlamalıdır.");
        return;
      }
      // Check for known meeting domains
      const allowedDomains = ["zoom.us", "zoom.com", "meet.google.com", "teams.microsoft.com", "webex.com"];
      const isAllowed = allowedDomains.some((domain) => url.hostname.includes(domain));
      if (!isAllowed) {
        if (!confirm("Bu URL bilinen bir toplantı platformu değil. Devam etmek istiyor musunuz?")) {
          return;
        }
      }
    } catch {
      alert("Geçerli bir URL giriniz.");
      return;
    }

    if (editingLesson) {
      rescheduleMutation.mutate({
        live_lesson_url: liveLessonUrl,
        live_lesson_at: liveLessonAt,
        notify_students: notifyStudents,
      });
    } else {
      createMutation.mutate();
    }
  };

  const getLessonStatus = (lesson: LessonResponse): "upcoming" | "live" | "past" | "ended" => {
    if (lesson.is_live_lesson_ended) return "ended";
    if (!lesson.live_lesson_at) return "upcoming";
    const targetDate = new Date(lesson.live_lesson_at);
    const now = new Date();
    const diff = targetDate.getTime() - now.getTime();
    // Live if within 2 hours of start time
    if (diff <= 0 && diff >= -2 * 60 * 60 * 1000) return "live";
    // Past if time has passed but not ended
    if (diff < 0) return "past";
    return "upcoming";
  };

  const formatDateTime = (dateString: string | null): string => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleString("tr-TR", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <span className="text-2xl">🔴</span>
            Canlı Dersler
          </h2>
          <p className="text-sm text-gray-600 mt-1">Canlı derslerinizi oluşturun, yönetin ve kayıtlarını yükleyin</p>
        </div>
        <Button
          onClick={() => {
            resetForm();
            setEditingLesson(null);
            setShowCreateForm(!showCreateForm);
          }}
          variant="primary"
        >
          {showCreateForm ? "İptal" : "+ Canlı Ders Oluştur"}
        </Button>
      </div>

      {/* Create/Edit Form */}
      <AnimatePresence>
        {showCreateForm && (
          <motion.div
            id="live-lesson-form"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {editingLesson ? "Canlı Dersi Düzenle" : "Yeni Canlı Ders Oluştur"}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Başlık <span className="text-red-500">*</span>
                </label>
                <Input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Örn: Python Temelleri - Canlı Ders"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Açıklama</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  placeholder="Canlı ders hakkında bilgi..."
                  className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-gray-900 placeholder-gray-400 transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Toplantı URL <span className="text-red-500">*</span>
                </label>
                <Input
                  type="url"
                  value={liveLessonUrl}
                  onChange={(e) => setLiveLessonUrl(e.target.value)}
                  placeholder="https://zoom.us/j/... veya https://meet.google.com/..."
                  required
                />
                <p className="text-xs text-gray-500 mt-1">
                  Zoom, Google Meet, Microsoft Teams veya Webex linki
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
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={notifyStudents}
                    onChange={(e) => setNotifyStudents(e.target.checked)}
                    className="w-5 h-5 text-purple-600 border-2 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    Öğrencilere bildirim gönder
                  </span>
                </label>
              </div>

              <div className="flex items-center gap-3 pt-2">
                <Button
                  type="submit"
                  disabled={!title.trim() || !liveLessonUrl.trim() || !liveLessonAt || createMutation.isPending || rescheduleMutation.isPending}
                  isLoading={createMutation.isPending || rescheduleMutation.isPending}
                >
                  {editingLesson ? "Güncelle" : "Canlı Ders Oluştur"}
                </Button>
                {editingLesson && (
                  <>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateForm(false);
                        setEditingLesson(null);
                        resetForm();
                      }}
                    >
                      İptal
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => {
                        if (confirm("Bu canlı dersi iptal etmek istediğinize emin misiniz? Öğrencilere bildirim gönderilecek.")) {
                          cancelMutation.mutate();
                        }
                      }}
                      disabled={cancelMutation.isPending}
                      isLoading={cancelMutation.isPending}
                    >
                      Dersi İptal Et
                    </Button>
                  </>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Live Lessons List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : !liveLessons || liveLessons.length === 0 ? (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-12 text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 font-medium mb-2">Henüz canlı ders oluşturulmamış</p>
          <p className="text-sm text-gray-500">Yukarıdaki butona tıklayarak ilk canlı dersinizi oluşturun</p>
        </div>
      ) : (
        <div className="space-y-4">
          {liveLessons.map((lesson) => {
            const status = getLessonStatus(lesson);
            const isUpcoming = status === "upcoming";
            const isLive = status === "live";
            const isPast = status === "past";
            const isEnded = status === "ended";

            return (
              <motion.div
                key={lesson.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-6 border-2 ${
                  isLive
                    ? "bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 border-red-300"
                    : isUpcoming
                      ? "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200"
                      : isPast
                        ? "bg-gradient-to-br from-orange-50 to-red-50 border-orange-300"
                        : "bg-white border-gray-200"
                }`}
              >
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-bold text-gray-900">{lesson.title}</h3>
                      {isLive && (
                        <motion.span
                          animate={{ opacity: [1, 0.5, 1] }}
                          transition={{ repeat: Infinity, duration: 1.5 }}
                          className="px-3 py-1 bg-red-600 text-white rounded-full text-xs font-bold"
                        >
                          🔴 CANLI
                        </motion.span>
                      )}
                      {isUpcoming && (
                        <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-semibold">
                          📅 Yaklaşan
                        </span>
                      )}
                      {isPast && (
                        <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-xs font-bold">
                          ⏰ GEÇTİ
                        </span>
                      )}
                      {isEnded && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-semibold">
                          ✓ Sona Erdi
                        </span>
                      )}
                    </div>
                    {lesson.description && (
                      <p className="text-gray-700 mb-3">{lesson.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      {lesson.live_lesson_at && (
                        <span className="flex items-center gap-1">
                          📅 {formatDateTime(lesson.live_lesson_at)}
                        </span>
                      )}
                      {lesson.live_lesson_url && (
                        <a
                          href={lesson.live_lesson_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-700 font-medium flex items-center gap-1"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                          </svg>
                          Toplantı Linki
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {isUpcoming && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEdit(lesson)}
                        >
                          Düzenle
                        </Button>
                        <Button
                          variant="danger"
                          size="sm"
                          onClick={() => {
                            if (confirm("Bu canlı dersi iptal etmek istediğinize emin misiniz?")) {
                              cancelMutation.mutate();
                              setEditingLesson(lesson);
                            }
                          }}
                          disabled={cancelMutation.isPending}
                        >
                          İptal Et
                        </Button>
                      </>
                    )}
                    {(isLive || isPast) && (
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => {
                          if (confirm("Canlı dersi sonlandırmak istediğinize emin misiniz?")) {
                            endMutation.mutate();
                            setEditingLesson(lesson);
                          }
                        }}
                        disabled={endMutation.isPending}
                        isLoading={endMutation.isPending}
                      >
                        Sonlandır
                      </Button>
                    )}
                    {isEnded && !lesson.live_lesson_recording_url && (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => setShowUploadRecording(lesson.id)}
                      >
                        Kayıt Yükle
                      </Button>
                    )}
                    {isEnded && lesson.live_lesson_recording_url && (
                      <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">
                        ✓ Kayıt Yüklendi
                      </span>
                    )}
                  </div>
                </div>

                {/* Upload Recording Form */}
                {showUploadRecording === lesson.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t-2 border-gray-200"
                  >
                    <FileUpload
                      accept="video/mp4,video/webm,video/quicktime"
                      maxSizeMB={500}
                      onUpload={async (file) => {
                        await uploadRecordingMutation.mutateAsync(file);
                      }}
                      onRemove={() => setShowUploadRecording(null)}
                      label="Canlı Ders Kaydı Yükle"
                      description="Maksimum: 500 MB"
                    />
                  </motion.div>
                )}
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
