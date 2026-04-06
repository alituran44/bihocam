"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi, mediaApi, notificationsApi, categoriesApi, type CourseStudent, type Category, type LessonResponse, type LessonType } from "@/lib/api";
import { CategoryPicker } from "@/components/categories/CategoryPicker";
import { LessonForm } from "@/components/lessons/LessonForm";
import { SortableLessonList } from "@/components/lessons/SortableLessonList";
import { LiveLessonManager } from "@/components/lessons/LiveLessonManager";
import { ContentStatsCard } from "@/components/courses/ContentStatsCard";

// Use LessonResponse from API types
type Lesson = LessonResponse;

interface Course {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  thumbnail_path: string | null;
  price: number;
  discount_price: number | null;
  status: string;
  lessons: Lesson[];
  categories?: Array<{ id: string; name: string; slug: string }>;
  created_at: string;
}

export default function MyCourseDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const id = params.id as string;
  const isNew = id === "new";

  // Yeni kurs olusturma mutation (hook'lar kosullu return'den once olmali)
  const createCourseMutation = useMutation({
    mutationFn: (data: { title: string; slug: string; description: string; price: number; category_ids?: string[] }) =>
      coursesApi.create(data),
    onSuccess: (newCourse: any) => {
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      router.push(`/dashboard/my-courses/${newCourse.id}`);
    },
  });

  const [showAddLessonForm, setShowAddLessonForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState<LessonResponse | null>(null);
  const [showEditForm, setShowEditForm] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editPrice, setEditPrice] = useState(0);
  const [editCategoryIds, setEditCategoryIds] = useState<string[]>([]);
  const [showNotifyPanel, setShowNotifyPanel] = useState(false);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [notifyTitle, setNotifyTitle] = useState("");
  const [notifyMessage, setNotifyMessage] = useState("");
  const [notifyType, setNotifyType] = useState<"announcement" | "live_lesson">("announcement");
  const [liveLessonAt, setLiveLessonAt] = useState("");
  const [liveLessonUrl, setLiveLessonUrl] = useState("");


  const { data: course, isLoading } = useQuery<Course>({
    queryKey: ["my-course", id],
    queryFn: () => coursesApi.get(id),
    enabled: !!id && !isNew,
  });

  const { data: students } = useQuery<CourseStudent[]>({
    queryKey: ["course-students", id],
    queryFn: () => coursesApi.getCourseStudents(id),
    enabled: !!id && !isNew,
  });

  // Review history çek (REJECTED durumunda admin notunu göstermek için)
  const { data: reviewHistory } = useQuery({
    queryKey: ["course-review-history", id],
    queryFn: () => coursesApi.getCourseReviewHistory(id),
    enabled: !!id && !isNew && course?.status === "rejected",
  });

  // Son reddetme notunu bul
  const lastRejectionNote = reviewHistory?.find((record: any) => record.action_type === "reject" && record.note)?.note;

  // Kategorileri çek
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list(),
  });

  // Edit form'u course data ile doldur
  useEffect(() => {
    if (course) {
      setEditTitle(course.title);
      setEditDescription(course.description || "");
      setEditPrice(Number(course.price || 0));
      // Kategorileri doldur
      if (course.categories && Array.isArray(course.categories)) {
        setEditCategoryIds(course.categories.map((cat: any) => cat.id));
      }
    }
  }, [course]);

  // Kurs güncelleme mutation
  const updateCourseMutation = useMutation({
    mutationFn: (updateData: { title?: string; description?: string; price?: number; status?: string; category_ids?: string[] }) =>
      coursesApi.update(id, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-course", id] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      setShowEditForm(false);
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      if (typeof detail === "string") {
        alert(detail);
      } else if (detail?.message) {
        alert(detail.message);
      } else {
        alert("Kurs güncellenirken bir hata oluştu. Lütfen tekrar deneyin.");
      }
    },
  });

  // Status değiştirme
  const changeStatusMutation = useMutation({
    mutationFn: (newStatus: string) => coursesApi.update(id, { status: newStatus }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-course", id] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
    },
  });

  // Arşivden çıkarma mutation (özel endpoint kullanıyor)
  const unarchiveMutation = useMutation({
    mutationFn: () => coursesApi.unarchiveCourse(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-course", id] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      alert("Kurs başarıyla arşivden çıkarıldı ve yayınlandı!");
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      if (typeof detail === "string") {
        alert(detail);
      } else if (detail?.message) {
        alert(detail.message);
      } else {
        alert("Kurs arşivden çıkarılırken bir hata oluştu.");
      }
    },
  });

  // Onaya gönderme mutation
  const submitForReviewMutation = useMutation({
    mutationFn: () => coursesApi.submitForReview(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-course", id] });
      queryClient.invalidateQueries({ queryKey: ["my-courses"] });
      alert("Kursunuz başarıyla onaya gönderildi. İnceleme tamamlandığında bilgilendirileceksiniz.");
    },
    onError: (err: any) => {
      const detail = err?.response?.data?.detail;
      console.error("Onaya gönderme hatası:", err);
      
      if (typeof detail === "string") {
        alert(detail);
      } else if (detail?.message) {
        // Eksik alanları göster
        if (detail.errors && Array.isArray(detail.errors) && detail.errors.length > 0) {
          const errorList = detail.errors.map((e: string, i: number) => `${i + 1}. ${e}`).join("\n");
          alert(`${detail.message}\n\n${errorList}`);
        } else {
          // Detaylı hata mesajı göster
          let errorMsg = detail.message;
          if (detail.error) {
            errorMsg += `\n\nTeknik Detay: ${detail.error}`;
          }
          if (detail.details) {
            errorMsg += `\n\nEk Bilgi: ${detail.details}`;
          }
          alert(errorMsg);
        }
      } else {
        // Genel hata - backend'den gelen tüm bilgileri göster
        const errorMsg = detail?.error || detail?.message || err?.message || "Bilinmeyen bir hata oluştu";
        alert(`Kurs onaya gönderilirken bir hata oluştu:\n\n${errorMsg}\n\nLütfen konsolu kontrol edin veya tekrar deneyin.`);
      }
    },
  });

  const sendNotificationMutation = useMutation({
    mutationFn: async () => {
      if (!course) return;

       const baseData: Record<string, any> = {
        course_id: course.id,
        course_title: course.title,
        course_slug: course.slug,
      };

      if (notifyType === "live_lesson") {
        baseData.live_at = liveLessonAt || null;
        baseData.live_url = liveLessonUrl || null;
      }

      await notificationsApi.create({
        notification_type: notifyType === "live_lesson" ? "live_lesson_reminder" : "course_announcement",
        title:
          notifyTitle ||
          (notifyType === "live_lesson"
            ? `${course.title} canlı ders duyurusu`
            : `${course.title} hakkında duyuru`),
        message: notifyMessage,
        user_ids: selectedStudentIds,
        role: null,
        data: baseData,
        priority: "medium",
        delivery_channels: ["in_app"],
        action_url: notifyType === "live_lesson" && liveLessonUrl ? liveLessonUrl : `/dashboard/courses/${course.id}`,
        action_label: notifyType === "live_lesson" ? "Canlı derse git" : "Kursa git",
      });
    },
    onSuccess: () => {
      setNotifyTitle("");
      setNotifyMessage("");
      setSelectedStudentIds([]);
      setLiveLessonAt("");
      setLiveLessonUrl("");
      setNotifyType("announcement");
      setShowNotifyPanel(false);
      alert("Öğrencilerine bildirim gönderildi.");
    },
  });

  const formatDuration = (seconds: number | null) => {
    if (!seconds) return "Süre belirtilmemiş";
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    if (hours > 0) {
      return `${hours} sa ${minutes} dk`;
    }
    return `${minutes} dk`;
  };

  // EPIC-10: Lesson create/update mutation
  const saveLessonMutation = useMutation({
    mutationFn: async (data: {
      title: string;
      description?: string;
      lesson_type: LessonType;
      is_preview?: boolean;
      video_url?: string;
      duration_seconds?: number;
      content_text?: string;
      live_lesson_url?: string;
      live_lesson_at?: string;
    }) => {
      if (editingLesson) {
        // Update existing lesson
        return coursesApi.updateLesson(id, editingLesson.id, data);
      } else {
        // Create new lesson
        return coursesApi.addLesson(id, {
          ...data,
          order: (course?.lessons.length || 0) + 1,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-course", id] });
      setShowAddLessonForm(false);
      setEditingLesson(null);
    },
  });

  const handleSaveLesson = async (data: any) => {
    await saveLessonMutation.mutateAsync(data);
  };

  const handleEditLesson = (lesson: LessonResponse) => {
    setEditingLesson(lesson);
    setShowAddLessonForm(true);
  };

  const handleDeleteLesson = (lessonId: string) => {
    // Deletion is handled in LessonCard component
  };

  const toggleStudentSelection = (studentId: string) => {
    setSelectedStudentIds((prev) =>
      prev.includes(studentId) ? prev.filter((id) => id !== studentId) : [...prev, studentId]
    );
  };

  if (isNew) {
    return (
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.push("/dashboard/my-courses")}
          className="text-sm text-teal-600 hover:text-teal-700 mb-6 flex items-center gap-2 font-medium"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Egitimlerime don
        </button>

        <div className="bg-white rounded-2xl border-2 border-gray-200 p-8 shadow-lg">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Yeni Kurs Olustur</h1>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const title = formData.get("title") as string;
              const slug = title
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .replace(/-+/g, "-")
                .trim();
              createCourseMutation.mutate({
                title,
                slug: slug || `kurs-${Date.now()}`,
                description: formData.get("description") as string,
                price: Number(formData.get("price") || 0),
                category_ids: editCategoryIds.length > 0 ? editCategoryIds : undefined,
              });
            }}
            className="space-y-5"
          >
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Kurs Adi <span className="text-red-500">*</span>
              </label>
              <input
                name="title"
                type="text"
                required
                placeholder="Ornek: Python ile Web Gelistirme"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Aciklama</label>
              <textarea
                name="description"
                rows={4}
                placeholder="Kursunuzu kisaca tanitin..."
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                Fiyat (TL) <span className="text-red-500">*</span>
              </label>
              <input
                name="price"
                type="number"
                min="0"
                step="0.01"
                defaultValue="0"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-xs text-gray-400 mt-1">0 girerseniz kurs ucretsiz olur</p>
            </div>

            {categories && categories.length > 0 && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Kategori</label>
                <select
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  onChange={(e) => setEditCategoryIds(e.target.value ? [e.target.value] : [])}
                  defaultValue=""
                >
                  <option value="">Kategori secin (opsiyonel)</option>
                  {categories.map((cat: any) => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>
            )}

            {createCourseMutation.isError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {(createCourseMutation.error as any)?.response?.data?.detail || "Kurs olusturulamadi"}
              </div>
            )}

            <button
              type="submit"
              disabled={createCourseMutation.isPending}
              className="w-full py-3.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-semibold text-lg disabled:opacity-50"
            >
              {createCourseMutation.isPending ? "Olusturuluyor..." : "Kurs Olustur"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-64 bg-gray-200 rounded animate-pulse" />
        <div className="grid md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded-xl animate-pulse" />
            ))}
          </div>
          <div className="h-64 bg-gray-200 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-2xl p-12 text-center shadow-lg">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Kursunuz bulunamadi</h1>
        <p className="text-gray-600 mb-6">Bu kurs silinmis olabilir veya erisim yetkiniz olmayabilir.</p>
        <button onClick={() => router.push("/dashboard/my-courses")} className="px-6 py-3 bg-blue-600 text-white rounded-lg font-medium">
          Egitimlerime Don
        </button>
      </div>
    );
  }

  const totalDurationSeconds = course.lessons.reduce((total: number, lesson: any) => total + (lesson.duration_seconds || 0), 0);

  return (
    <div className="max-w-7xl mx-auto">
      {/* Header Section */}
      <div className="mb-8">
        <button
          onClick={() => router.push("/dashboard/my-courses")}
          className="text-sm text-teal-600 hover:text-teal-700 mb-4 flex items-center gap-2 font-medium transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Eğitimlerime dön
        </button>

        {/* REJECTED Durumunda Admin Notu Alert Bloğu */}
        {course.status === "rejected" && lastRejectionNote && (
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-red-900 mb-2">Kursunuz Reddedildi</h3>
                <p className="text-red-800 font-medium mb-3">Admin Notu:</p>
                <p className="text-red-700 bg-white p-4 rounded-lg border border-red-200 mb-4">{lastRejectionNote}</p>
                <p className="text-sm text-red-600">
                  Lütfen yukarıdaki notları dikkate alarak kursunuzu düzenleyin ve tekrar onaya gönderin.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* PENDING_REVIEW Durumunda Bilgilendirme */}
        {course.status === "pending_review" && (
          <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6 mb-6 shadow-lg">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-bold text-orange-900 mb-2">Kursunuz İncelemede</h3>
                <p className="text-orange-800">
                  Kursunuz admin tarafından inceleniyor. İnceleme tamamlandığında bilgilendirileceksiniz. Genellikle 1-3 iş günü içinde sonuçlanır.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg p-6 mb-6">
          {/* Arşivlenmiş Kurs Uyarısı */}
          {course.status === "archived" && (
            <div className="mb-4 p-4 bg-amber-50 border-2 border-amber-200 rounded-lg">
              <div className="flex items-center gap-2 text-amber-800 font-semibold mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Bu kurs arşivlenmiş durumda
              </div>
              <p className="text-sm text-amber-700 mb-3">
                Arşivlenmiş kurslar yayınlanmaz ve öğrenciler tarafından görülemez. Kursu tekrar yayınlamak için "Arşivden Çıkar" butonuna tıklayın.
              </p>
            </div>
          )}

          {/* Onaya Göndermek İçin Eksik Alanlar Uyarısı - Draft ve Rejected durumlarında */}
          {(course.status === "draft" || course.status === "rejected") && (
            <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg">
              <div className="flex items-center gap-2 text-blue-800 font-semibold mb-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Onaya göndermek için kontrol edin
              </div>
              <ul className="text-sm text-blue-700 space-y-1 mb-3">
                {(!course.description || course.description.length < 50) && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Kurs açıklaması en az 50 karakter olmalıdır (şu an: {course.description?.length || 0} karakter)</span>
                  </li>
                )}
                {course.description && course.description.length >= 50 && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Kurs açıklaması tamamlandı</span>
                  </li>
                )}
                {(!course.categories || course.categories.length === 0) && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Kurs en az 1 kategoriye atanmalıdır</span>
                  </li>
                )}
                {course.categories && course.categories.length > 0 && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Kategori ataması tamamlandı ({course.categories.length} kategori)</span>
                  </li>
                )}
                {course.lessons.length === 0 && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Kurs en az 1 ders içermelidir</span>
                  </li>
                )}
                {course.lessons.length > 0 && (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Ders sayısı yeterli ({course.lessons.length} ders)</span>
                  </li>
                )}
                {course.price === null || course.price === undefined ? (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span>Kurs fiyatı belirtilmelidir</span>
                  </li>
                ) : (
                  <li className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span>Fiyat belirtilmiş (₺{Number(course.price || 0).toFixed(2)})</span>
                  </li>
                )}
              </ul>
              <p className="text-xs text-blue-600 mt-2">
                Tüm gereksinimler tamamlandığında "Onaya Gönder" butonunu kullanabilirsiniz.
              </p>
            </div>
          )}
          
          <div className="flex items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3 flex-wrap">
                <h1 className="text-3xl font-bold text-gray-900">{course.title}</h1>
                {course.status === "published" ? (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Yayında
                  </span>
                ) : course.status === "pending_review" ? (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    İncelemede
                  </span>
                ) : course.status === "rejected" ? (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reddedildi
                  </span>
                ) : course.status === "archived" ? (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-slate-500 to-slate-600 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    Arşivlendi
                  </span>
                ) : (
                  <span className="px-4 py-1.5 bg-gradient-to-r from-gray-500 to-gray-600 text-white rounded-lg text-sm font-bold shadow-md flex items-center gap-2">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    Taslak
                  </span>
                )}
              </div>
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                  {course.lessons.length} ders
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {formatDuration(totalDurationSeconds)}
                </span>
                <span className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  ₺{Number(course.price || 0).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Onaya Gönder Butonu - Draft ve Rejected durumlarında göster */}
              {(course.status === "draft" || course.status === "rejected") && (
                <button
                  onClick={() => {
                    if (course.lessons.length === 0) {
                      alert("Kursu onaya göndermek için en az 1 ders eklemeniz gerekiyor.");
                      return;
                    }
                    if (confirm("Kursunuzu onaya göndermek istediğinize emin misiniz? İnceleme tamamlandığında bilgilendirileceksiniz.")) {
                      submitForReviewMutation.mutate();
                    }
                  }}
                  disabled={submitForReviewMutation.isPending || course.lessons.length === 0}
                  className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 disabled:bg-gray-400 text-white text-sm rounded-lg transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg disabled:shadow-none"
                >
                  {submitForReviewMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Gönderiliyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Onaya Gönder
                    </>
                  )}
                </button>
              )}
              {course.status === "published" && (
                <>
                  <button
                    onClick={() => {
                      if (confirm("Kursu taslağa almak istediğinize emin misiniz?")) {
                        changeStatusMutation.mutate("draft");
                      }
                    }}
                    disabled={changeStatusMutation.isPending}
                    className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    {changeStatusMutation.isPending ? "Taslağa Alınıyor..." : "Taslağa Al"}
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Kursu arşivlemek istediğinize emin misiniz?")) {
                        changeStatusMutation.mutate("archived");
                      }
                    }}
                    disabled={changeStatusMutation.isPending}
                    className="px-4 py-2 bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white text-sm rounded-lg transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                    </svg>
                    {changeStatusMutation.isPending ? "Arşivleniyor..." : "Arşivle"}
                  </button>
                </>
              )}
              {(course.status === "archived" || course?.status === "archived") && (
                <button
                  onClick={() => {
                    if (confirm("Kursu arşivden çıkarmak istediğinize emin misiniz? Kurs yayınlanacak.")) {
                      unarchiveMutation.mutate();
                    }
                  }}
                  disabled={unarchiveMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 disabled:bg-gray-400 text-white text-base rounded-lg transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
                >
                  {unarchiveMutation.isPending ? (
                    <>
                      <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Çıkarılıyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Arşivden Çıkar
                    </>
                  )}
                </button>
              )}
              <button
                onClick={() => setShowEditForm(!showEditForm)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-lg transition-all flex items-center gap-2 font-medium shadow-md hover:shadow-lg"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                {showEditForm ? "İptal" : "Düzenle"}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kurs Düzenleme Formu - Modern Design */}
      {showEditForm && (
        <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-8 shadow-xl">
          <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-teal-600 flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-gray-900">Kurs Bilgilerini Düzenle</h2>
          </div>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Kurs Başlığı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all shadow-sm"
                placeholder="Kurs başlığını girin"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Açıklama</label>
              <textarea
                value={editDescription}
                onChange={(e) => setEditDescription(e.target.value)}
                rows={5}
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all resize-none shadow-sm"
                placeholder="Kurs açıklamasını girin"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">Fiyat (₺)</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-600 font-semibold">₺</span>
                <input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                  min="0"
                  step="0.01"
                  className="w-full pl-10 pr-4 py-3 bg-white border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all shadow-sm"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-900 mb-2">
                Kategoriler <span className="text-red-500">*</span>
              </label>
              {categories ? (
                <CategoryPicker
                  categories={categories}
                  selectedCategories={editCategoryIds}
                  onChange={setEditCategoryIds}
                  multiple={true}
                  showSearch={true}
                />
              ) : (
                <p className="text-gray-500 text-sm">Kategoriler yükleniyor...</p>
              )}
              {editCategoryIds.length === 0 && (
                <p className="text-red-600 text-sm mt-2">En az 1 kategori seçmelisiniz.</p>
              )}
            </div>
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (editCategoryIds.length === 0) {
                    alert("Lütfen en az 1 kategori seçin.");
                    return;
                  }
                  // Her durumda price gönder (backend kontrol edecek)
                  const updateData: any = {
                    title: editTitle,
                    description: editDescription || undefined,
                    category_ids: editCategoryIds,
                    price: editPrice,
                  };
                  updateCourseMutation.mutate(updateData);
                }}
                disabled={!editTitle.trim() || editCategoryIds.length === 0 || updateCourseMutation.isPending}
                className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl disabled:shadow-none flex items-center gap-2"
              >
                {updateCourseMutation.isPending ? (
                  <>
                    <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Kaydediliyor...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Kaydet
                  </>
                )}
              </button>
              <button
                onClick={() => {
                  setShowEditForm(false);
                  if (course) {
                    setEditTitle(course.title);
                    setEditDescription(course.description || "");
                    setEditPrice(Number(course.price || 0));
                    if (course.categories && Array.isArray(course.categories)) {
                      setEditCategoryIds(course.categories.map((cat: any) => cat.id));
                    } else {
                      setEditCategoryIds([]);
                    }
                  }
                }}
                className="px-6 py-3 bg-white border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold shadow-md hover:shadow-lg"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-8">
        {/* Sol: Kurs açıklaması ve içerik */}
        <div className="md:col-span-2 space-y-6">
          {/* Kurs Açıklaması */}
          {course.description && (
            <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Kurs Açıklaması
              </h2>
              <p className="text-gray-700 whitespace-pre-line leading-relaxed">{course.description}</p>
            </div>
          )}

          {/* Kurs İçeriği */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                Kurs İçeriği
              </h2>
              <button
                onClick={() => setShowAddLessonForm(!showAddLessonForm)}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all flex items-center gap-2 font-semibold shadow-md hover:shadow-lg"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                {showAddLessonForm ? "İptal" : "Ders Ekle"}
              </button>
            </div>

            {/* EPIC-10: Dynamic Lesson Form */}
            {showAddLessonForm && (
              <div className="mb-6">
                <LessonForm
                  courseId={id}
                  lesson={editingLesson}
                  onSave={handleSaveLesson}
                  onCancel={() => {
                    setShowAddLessonForm(false);
                    setEditingLesson(null);
                  }}
                  isLoading={saveLessonMutation.isPending}
                />
              </div>
            )}

            {/* EPIC-10: Sortable Lesson List */}
            <SortableLessonList
              lessons={course.lessons.slice().sort((a, b) => a.order - b.order)}
              courseId={id}
              onEdit={handleEditLesson}
              onDelete={handleDeleteLesson}
            />
          </div>

          {/* EPIC-10: Live Lesson Manager */}
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg mt-6">
            <LiveLessonManager courseId={id} />
          </div>
        </div>

        {/* Sağ: Özet kartı */}
        <div>
          <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg sticky top-8 space-y-6">
            {course.thumbnail_path ? (
              <img
                src={course.thumbnail_path}
                alt={course.title}
                className="w-full h-48 object-cover rounded-xl mb-6 border-2 border-gray-200"
              />
            ) : (
              <div className="w-full h-48 bg-gradient-to-br from-teal-100 via-cyan-100 to-emerald-100 rounded-xl mb-6 flex items-center justify-center border-2 border-gray-200">
                <svg className="w-16 h-16 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            )}

            <div className="space-y-4">
              {/* EPIC-10: Content Statistics Card */}
              <ContentStatsCard courseId={id} />

              <div>
                <div className="text-sm font-semibold text-gray-700 mb-2">Kurs Bilgileri</div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Fiyat</span>
                    <span className="font-bold text-gray-900">₺{Number(course.price || 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t-2 border-gray-200">
                {(course.status === "archived" || course?.status === "archived") ? (
                  <button
                    onClick={() => {
                      if (confirm("Kursu arşivden çıkarmak istediğinize emin misiniz? Kurs yayınlanacak.")) {
                        unarchiveMutation.mutate();
                      }
                    }}
                    disabled={unarchiveMutation.isPending}
                    className="block text-center w-full bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 disabled:bg-gray-400 text-white py-3 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg mb-3 flex items-center justify-center gap-2"
                  >
                    {unarchiveMutation.isPending ? (
                      <>
                        <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Çıkarılıyor...
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                        Arşivden Çıkar
                      </>
                    )}
                  </button>
                ) : (
                  <Link
                    href={`/courses/${course.slug}`}
                    className="block text-center w-full bg-teal-600 hover:bg-teal-700 text-white py-3 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg mb-3"
                  >
                    Kurs Sayfasına Git
                  </Link>
                )}
                <Link
                  href="/dashboard/my-courses"
                  className="block text-center w-full text-sm text-teal-600 hover:text-teal-700 font-medium transition-colors"
                >
                  Diğer eğitimlerimi gör
                </Link>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
