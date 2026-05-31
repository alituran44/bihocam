"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { coursesApi, homeworksApi } from "@/lib/api";
import { toast } from "sonner";

interface Course {
  id: string;
  title: string;
  slug: string;
}

interface Homework {
  id: string;
  course_id: string;
  teacher_id: string;
  title: string;
  description: string;
  due_date: string;
  created_at: string;
}

interface Submission {
  id: string;
  homework_id: string;
  student_id: string;
  submission_text?: string;
  file_path?: string;
  grade?: number;
  feedback?: string;
  submitted_at: string;
  graded_at?: string;
  student?: {
    full_name: string;
    email: string;
  };
}

export default function TeacherHomeworksPage() {
  const queryClient = useQueryClient();
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");

  // Submission grading states
  const [selectedHomeworkForSubmissions, setSelectedHomeworkForSubmissions] = useState<Homework | null>(null);
  const [submissionsList, setSubmissionsList] = useState<Submission[]>([]);
  const [loadingSubmissions, setLoadingSubmissions] = useState(false);
  const [gradingSubmissionId, setGradingSubmissionId] = useState<string | null>(null);
  const [gradeValue, setGradeValue] = useState<number>(100);
  const [feedbackValue, setFeedbackValue] = useState("");

  // Fetch teacher's courses
  const { data: coursesData } = useQuery({
    queryKey: ["teacher-courses"],
    queryFn: () => coursesApi.getMyCourses(),
  });

  const courses: Course[] = coursesData?.courses || [];

  // Automatically select first course when loaded
  useEffect(() => {
    if (courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(courses[0].id);
    }
  }, [courses, selectedCourseId]);

  // Fetch homeworks for selected course
  const { data: homeworks = [], isLoading: loadingHomeworks } = useQuery<Homework[]>({
    queryKey: ["course-homeworks", selectedCourseId],
    queryFn: () => homeworksApi.list(selectedCourseId),
    enabled: !!selectedCourseId,
  });

  // Create homework mutation
  const createHomeworkMutation = useMutation({
    mutationFn: (payload: any) => homeworksApi.create(payload),
    onSuccess: () => {
      toast.success("Ödev başarıyla oluşturuldu.");
      queryClient.invalidateQueries({ queryKey: ["course-homeworks", selectedCourseId] });
      setTitle("");
      setDescription("");
      setDueDate("");
      setShowAddForm(false);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Ödev oluşturulurken bir hata oluştu.");
    },
  });

  // Fetch submissions helper
  const fetchSubmissions = async (homework: Homework) => {
    setSelectedHomeworkForSubmissions(homework);
    setLoadingSubmissions(true);
    try {
      const data = await homeworksApi.getSubmissions(homework.id);
      setSubmissionsList(data);
    } catch (err: any) {
      toast.error("Ödev teslimleri yüklenirken bir hata oluştu.");
    } finally {
      setLoadingSubmissions(false);
    }
  };

  // Grade submission mutation
  const gradeMutation = useMutation({
    mutationFn: ({ submissionId, grade, feedback }: { submissionId: string; grade: number; feedback: string }) =>
      homeworksApi.grade(submissionId, { grade, feedback }),
    onSuccess: () => {
      toast.success("Ödev başarıyla notlandırıldı.");
      if (selectedHomeworkForSubmissions) {
        fetchSubmissions(selectedHomeworkForSubmissions);
      }
      setGradingSubmissionId(null);
      setGradeValue(100);
      setFeedbackValue("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Notlandırılırken bir hata oluştu.");
    },
  });

  const handleCreateHomework = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
      toast.error("Lütfen önce bir kurs seçin.");
      return;
    }
    if (!title.trim() || !description.trim() || !dueDate) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.");
      return;
    }
    createHomeworkMutation.mutate({
      course_id: selectedCourseId,
      title,
      description,
      due_date: new Date(dueDate).toISOString(),
    });
  };

  const handleGradeSubmit = (submissionId: string) => {
    if (gradeValue < 0 || gradeValue > 100) {
      toast.error("Not değeri 0 ile 100 arasında olmalıdır.");
      return;
    }
    gradeMutation.mutate({
      submissionId,
      grade: gradeValue,
      feedback: feedbackValue,
    });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Ödev Yönetimi</h2>
          <p className="text-gray-500 text-sm mt-1">
            Kurslarınızdaki öğrencilere ödevler tanımlayın, teslimleri inceleyin ve geribildirim vererek notlandırın.
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

          {selectedCourseId && (
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200"
            >
              {showAddForm ? "İptal" : "Yeni Ödev Tanımla"}
            </button>
          )}
        </div>
      </div>

      {/* Add New Homework Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-md p-6 animate-slideDown">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">
            Yeni Ödev Oluştur
          </h3>
          <form onSubmit={handleCreateHomework} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ödev Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Bölüm Sonu Değerlendirme Ödevi"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Son Teslim Tarihi *</label>
                <input
                  type="datetime-local"
                  required
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Ödev Detayları & Talimatları *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Öğrencilerinizin ödevi tamamlamak için yapması gerekenleri ve beklentilerinizi buraya ayrıntılı olarak yazın..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={createHomeworkMutation.isPending}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-teal-500/10 transition-all duration-200"
              >
                {createHomeworkMutation.isPending ? "Kaydediliyor..." : "Ödevi Yayınla"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Grid: Homeworks list & Submissions list */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 1/3 or 2/3 Homework list */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Ödev Listesi</h3>

            {loadingHomeworks ? (
              <div className="flex justify-center py-8">
                <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : homeworks.length === 0 ? (
              <div className="text-center py-10 border border-dashed border-gray-100 rounded-xl bg-gray-50/20">
                <p className="text-gray-400 text-sm font-semibold">Bu kurs için ödev bulunmuyor.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {homeworks.map((h) => (
                  <button
                    key={h.id}
                    onClick={() => fetchSubmissions(h)}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
                      selectedHomeworkForSubmissions?.id === h.id
                        ? "bg-teal-50/50 border-teal-300 shadow-sm"
                        : "bg-white border-gray-100 hover:border-gray-300"
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <h4 className="font-bold text-sm text-gray-800 line-clamp-1">{h.title}</h4>
                    </div>
                    <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">
                      {h.description}
                    </p>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 font-semibold mt-1">
                      <span>Son Gün: {new Date(h.due_date).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right 2/3 Submissions list */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 min-h-[400px] flex flex-col">
            {selectedHomeworkForSubmissions ? (
              <>
                <div className="border-b border-gray-100 pb-4 mb-6">
                  <span className="text-xs font-bold text-teal-600 bg-teal-50 border border-teal-100 px-2.5 py-1 rounded-md">
                    Seçili Ödev
                  </span>
                  <h3 className="text-lg font-bold text-gray-900 mt-2">{selectedHomeworkForSubmissions.title}</h3>
                  <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                    {selectedHomeworkForSubmissions.description}
                  </p>
                </div>

                <h4 className="text-sm font-bold text-gray-800 mb-4">Öğrenci Teslimleri ({submissionsList.length})</h4>

                {loadingSubmissions ? (
                  <div className="flex-1 flex items-center justify-center">
                    <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : submissionsList.length === 0 ? (
                  <div className="flex-1 flex flex-col items-center justify-center py-12 text-center">
                    <svg className="w-12 h-12 text-gray-300 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p className="text-gray-400 font-semibold text-sm">Henüz teslim eden öğrenci olmadı.</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {submissionsList.map((sub) => (
                      <div
                        key={sub.id}
                        className="border border-gray-200/80 rounded-xl p-5 hover:border-gray-300 transition-all space-y-4"
                      >
                        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-50 pb-3">
                          <div>
                            <p className="font-bold text-sm text-gray-900">
                              {sub.student?.full_name || "Bilinmeyen Öğrenci"}
                            </p>
                            <p className="text-[10px] text-gray-400 font-semibold">
                              Teslim Edildi: {new Date(sub.submitted_at).toLocaleString("tr-TR")}
                            </p>
                          </div>
                          <div className="flex items-center gap-2">
                            {sub.grade !== undefined && sub.grade !== null ? (
                              <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-700 rounded-lg text-xs font-bold">
                                Not: {sub.grade} / 100
                              </span>
                            ) : (
                              <span className="px-3 py-1 bg-amber-50 border border-amber-200 text-amber-700 rounded-lg text-xs font-bold">
                                Değerlendirilmedi
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Submission text & attachment */}
                        <div className="space-y-3">
                          {sub.submission_text && (
                            <div className="bg-gray-50 p-4 rounded-xl text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                              {sub.submission_text}
                            </div>
                          )}

                          {sub.file_path && (
                            <a
                              href={`http://localhost:8000/media/${sub.file_path}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-2 px-3 py-2 bg-blue-50 text-blue-700 rounded-xl text-xs font-bold border border-blue-100 hover:bg-blue-100 transition-all"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>
                              Öğrencinin Yüklediği Dosyayı İndir
                            </a>
                          )}
                        </div>

                        {/* Grading Action / Feedback Display */}
                        {gradingSubmissionId === sub.id ? (
                          <div className="bg-teal-50/20 border border-teal-200/50 rounded-xl p-4 space-y-4 animate-slideDown">
                            <h5 className="font-bold text-xs text-teal-800">Ödevi Notlandır ve Geribildirim Ver</h5>
                            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                              <div className="space-y-1">
                                <label className="text-[10px] font-bold text-gray-500">Puan (0-100) *</label>
                                <input
                                  type="number"
                                  min={0}
                                  max={100}
                                  value={gradeValue}
                                  onChange={(e) => setGradeValue(parseInt(e.target.value) || 0)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-teal-500"
                                />
                              </div>
                              <div className="sm:col-span-3 space-y-1">
                                <label className="text-[10px] font-bold text-gray-500">Geribildirim / Tavsiyeler *</label>
                                <input
                                  type="text"
                                  placeholder="Örn: Tebrikler, harika bir analiz olmuş. Ancak son bölümdeki denklemleri daha detaylı açıklayabilirdin."
                                  value={feedbackValue}
                                  onChange={(e) => setFeedbackValue(e.target.value)}
                                  className="w-full px-3 py-2 rounded-lg border border-gray-300 text-sm focus:outline-none focus:border-teal-500"
                                />
                              </div>
                            </div>
                            <div className="flex justify-end gap-2 text-xs">
                              <button
                                onClick={() => setGradingSubmissionId(null)}
                                className="px-3 py-1.5 bg-gray-100 text-gray-600 rounded-lg font-semibold hover:bg-gray-200 transition-all"
                              >
                                İptal
                              </button>
                              <button
                                onClick={() => handleGradeSubmit(sub.id)}
                                disabled={gradeMutation.isPending}
                                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg font-semibold hover:bg-teal-700 shadow-sm transition-all"
                              >
                                {gradeMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <>
                            {sub.feedback && (
                              <div className="border-t border-gray-50 pt-3">
                                <span className="text-[10px] font-bold text-gray-400">Eğitmen Geribildirimi:</span>
                                <p className="text-xs text-gray-600 italic mt-1 bg-gray-50/50 p-2.5 rounded-lg border border-gray-100">
                                  "{sub.feedback}"
                                </p>
                              </div>
                            )}

                            <div className="flex justify-end pt-2">
                              <button
                                onClick={() => {
                                  setGradingSubmissionId(sub.id);
                                  setGradeValue(sub.grade || 100);
                                  setFeedbackValue(sub.feedback || "");
                                }}
                                className="px-4 py-1.5 border border-teal-500 text-teal-600 hover:bg-teal-50 rounded-lg text-xs font-bold transition-all"
                              >
                                {sub.grade !== undefined && sub.grade !== null ? "Notu Güncelle" : "Notlandır"}
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center text-gray-400">
                <svg className="w-16 h-16 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
                <h4 className="font-bold text-base text-gray-700">Ödev Seçilmedi</h4>
                <p className="text-xs text-gray-400 mt-1 max-w-xs">
                  Sol taraftaki listeden bir ödev seçerek öğrenci teslimatlarını görüntüleyebilir ve değerlendirebilirsiniz.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
