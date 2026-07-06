"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { mockExamsApi, mediaApi, coursesApi, teachersApi, reviewsApi, type MockExam, type MockExamQuestion } from "@/lib/api";
import { toast } from "sonner";

interface SubjectSection {
  subjectName: string;
  questionCount: number;
}

export default function MockExamsPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Form states
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [examType, setExamType] = useState<"LGS" | "YKS">("LGS");
  const [durationMinutes, setDurationMinutes] = useState(120);
  const [pdfPath, setPdfPath] = useState("");
  const [isUploadingPdf, setIsUploadingPdf] = useState(false);

  // Scheduling & Assignment states
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [assignType, setAssignType] = useState<"all" | "course" | "student">("all");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [selectedStudentId, setSelectedStudentId] = useState("");

  // Dynamic Subject Sections state
  const [subjectSections, setSubjectSections] = useState<SubjectSection[]>([
    { subjectName: "Türkçe", questionCount: 20 },
    { subjectName: "Matematik", questionCount: 20 },
  ]);

  // Key answers state: question_number -> option (A/B/C/D/E)
  const [answerKey, setAnswerKey] = useState<Record<number, string>>({});
  const [editId, setEditId] = useState<string | null>(null);

  // Fetch list
  const { data: mockExams, isLoading } = useQuery<MockExam[]>({
    queryKey: ["mock-exams"],
    queryFn: () => mockExamsApi.list(),
  });

  // Fetch teacher's courses
  const { data: courses } = useQuery<any[]>({
    queryKey: ["teacher-courses"],
    queryFn: () => coursesApi.getMyCourses(),
  });

  // Fetch teacher's students
  const { data: studentsData } = useQuery<any>({
    queryKey: ["teacher-students"],
    queryFn: () => reviewsApi.getTeacherStudents(),
  });
  const students = studentsData?.items || [];

  // Create mutation
  const createMutation = useMutation({
    mutationFn: (payload: any) => mockExamsApi.create(payload),
    onSuccess: () => {
      toast.success("Deneme sınavı başarıyla oluşturuldu.");
      queryClient.invalidateQueries({ queryKey: ["mock-exams"] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Deneme sınavı oluşturulamadı.");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => mockExamsApi.delete(id),
    onSuccess: () => {
      toast.success("Deneme sınavı başarıyla silindi.");
      queryClient.invalidateQueries({ queryKey: ["mock-exams"] });
    },
    onError: () => {
      toast.error("Deneme sınavı silinirken bir hata oluştu.");
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: any }) => mockExamsApi.update(id, payload),
    onSuccess: () => {
      toast.success("Deneme sınavı başarıyla güncellendi.");
      queryClient.invalidateQueries({ queryKey: ["mock-exams"] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Deneme sınavı güncellenemedi.");
    },
  });

  const startEdit = (exam: MockExam) => {
    setEditId(exam.id);
    setTitle(exam.title);
    setDescription(exam.description || "");
    setExamType(exam.exam_type as "LGS" | "YKS");
    setDurationMinutes(exam.duration_minutes);
    setPdfPath(exam.pdf_path);
    setStartDate(exam.start_date ? new Date(exam.start_date).toISOString().slice(0, 16) : "");
    setEndDate(exam.end_date ? new Date(exam.end_date).toISOString().slice(0, 16) : "");
    setAssignType(exam.student_id ? "student" : (exam.course_id ? "course" : "all"));
    setSelectedCourseId(exam.course_id || "");
    setSelectedStudentId(exam.student_id || "");
    
    // Reconstruct subject sections and answer keys from exam questions
    if (exam.questions && exam.questions.length > 0) {
      const sortedQuestions = [...exam.questions].sort((a, b) => a.question_number - b.question_number);
      const sections: SubjectSection[] = [];
      const keys: Record<number, string> = {};
      
      let currentSection: SubjectSection | null = null;
      sortedQuestions.forEach((q) => {
        const subject = q.subject_name || "Genel";
        if (!currentSection || currentSection.subjectName !== subject) {
          currentSection = { subjectName: subject, questionCount: 1 };
          sections.push(currentSection);
        } else {
          currentSection.questionCount += 1;
        }
        if (q.correct_answer) {
          keys[q.question_number] = q.correct_answer;
        }
      });
      
      setSubjectSections(sections);
      setAnswerKey(keys);
    } else {
      setSubjectSections([]);
      setAnswerKey({});
    }
    
    setShowAddForm(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Handle PDF upload
  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type !== "application/pdf") {
        toast.error("Lütfen sadece PDF formatında bir dosya yükleyin.");
        return;
      }
      setIsUploadingPdf(true);
      try {
        const result = await mediaApi.uploadGeneralFile(file);
        setPdfPath(result.path);
        toast.success("Deneme kitapçığı PDF'i başarıyla yüklendi.");
      } catch (err: any) {
        toast.error("PDF dosyası yüklenirken hata oluştu.");
      } finally {
        setIsUploadingPdf(false);
      }
    }
  };

  // Add a new empty subject section
  const addSubjectSection = () => {
    setSubjectSections([...subjectSections, { subjectName: "", questionCount: 10 }]);
  };

  // Remove a subject section
  const removeSubjectSection = (index: number) => {
    const updated = [...subjectSections];
    updated.splice(index, 1);
    setSubjectSections(updated);
  };

  // Update subject section values
  const updateSubjectSection = (index: number, key: keyof SubjectSection, value: any) => {
    const updated = [...subjectSections];
    updated[index] = { ...updated[index], [key]: value };
    setSubjectSections(updated);
  };

  // Calculate question mapping dynamically
  // Returns: list of question objects with question number and subject name
  const generateQuestionsList = () => {
    const list: { questionNumber: number; subjectName: string }[] = [];
    let currentNumber = 1;
    subjectSections.forEach((sec) => {
      const count = sec.questionCount || 0;
      const name = sec.subjectName.trim() || "Genel";
      for (let i = 0; i < count; i++) {
        list.push({
          questionNumber: currentNumber,
          subjectName: name,
        });
        currentNumber++;
      }
    });
    return list;
  };

  const questionsList = generateQuestionsList();
  const totalQuestions = questionsList.length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Lütfen deneme sınavı başlığı girin.");
      return;
    }
    if (!pdfPath) {
      toast.error("Lütfen sınav kitapçığı PDF'ini yükleyin.");
      return;
    }
    if (subjectSections.length === 0) {
      toast.error("Lütfen en az bir ders bölümü ekleyin.");
      return;
    }
    if (subjectSections.some((s) => !s.subjectName.trim() || s.questionCount <= 0)) {
      toast.error("Lütfen ders adlarını ve soru sayılarını eksiksiz girin.");
      return;
    }

    // Build API payload
    const payloadQuestions = questionsList.map((q) => ({
      question_number: q.questionNumber,
      subject_name: q.subjectName,
      correct_answer: answerKey[q.questionNumber] || null,
      points: 1.0,
    }));

    const payload = {
      title,
      description: description || null,
      exam_type: examType,
      pdf_path: pdfPath,
      duration_minutes: durationMinutes,
      number_of_options: examType === "LGS" ? 4 : 5,
      is_active: true,
      start_date: startDate ? new Date(startDate).toISOString() : null,
      end_date: endDate ? new Date(endDate).toISOString() : null,
      course_id: assignType === "course" && selectedCourseId ? selectedCourseId : null,
      student_id: assignType === "student" && selectedStudentId ? selectedStudentId : null,
      questions: payloadQuestions,
    };

    if (editId) {
      updateMutation.mutate({ id: editId, payload });
    } else {
      createMutation.mutate(payload);
    }
  };

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setDescription("");
    setExamType("LGS");
    setDurationMinutes(120);
    setPdfPath("");
    setStartDate("");
    setEndDate("");
    setAssignType("all");
    setSelectedCourseId("");
    setSelectedStudentId("");
    setSubjectSections([
      { subjectName: "Türkçe", questionCount: 20 },
      { subjectName: "Matematik", questionCount: 20 },
    ]);
    setAnswerKey({});
    setShowAddForm(false);
  };

  const filteredExams = mockExams?.filter(
    (exam) =>
      !search ||
      exam.title.toLowerCase().includes(search.toLowerCase()) ||
      exam.exam_type.toLowerCase().includes(search.toLowerCase())
  ) || [];

  const number_of_options = examType === "LGS" ? 4 : 5;
  const optionsList = ["A", "B", "C", "D", "E"].slice(0, number_of_options);

  return (
    <div className="space-y-8 pb-12">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-purple-700 via-indigo-600 to-indigo-500 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-3 tracking-tight">
              Deneme Sınavı Yönetimi
            </h1>
            <p className="text-purple-100 text-lg">
              YKS ve LGS formatında PDF tabanlı ortak deneme sınavları oluşturun, optik cevap anahtarı tanımlayın ve raporlayın.
            </p>
          </div>
          <button
            onClick={() => {
              if (showAddForm) {
                resetForm();
              } else {
                setShowAddForm(true);
              }
            }}
            className="px-6 py-3.5 bg-white text-indigo-700 font-bold rounded-2xl shadow-lg hover:shadow-xl transition-all hover:scale-105 active:scale-95 text-sm shrink-0 flex items-center justify-center gap-2"
          >
            {showAddForm ? "Vazgeç ve Kapat" : "Yeni Deneme Sınavı Ekle"}
          </button>
        </div>
      </div>

      {/* Creation form */}
      {showAddForm && (
        <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8 max-w-5xl mx-auto animate-slideDown">
          <h3 className="text-2xl font-bold text-gray-900 border-b border-gray-100 pb-4 mb-6">
            {editId ? "Deneme Sınavını Düzenle" : "Yeni Deneme Sınavı Tanımla"}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Left Column Fields */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Deneme Sınavı Başlığı *</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: LGS Genel Deneme Sınavı - 2"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Açıklama (İsteğe bağlı)</label>
                  <textarea
                    rows={3}
                    placeholder="Sınav kuralları veya öğrenciye notları girin..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all text-sm resize-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Deneme Formatı</label>
                    <select
                      value={examType}
                      onChange={(e) => {
                        const val = e.target.value as "LGS" | "YKS";
                        setExamType(val);
                        // Reset answer keys if options count changed
                        setAnswerKey({});
                      }}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="LGS">LGS (4 Şık - 3Y 1D Götürür)</option>
                      <option value="YKS">YKS (5 Şık - 4Y 1D Götürür)</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Süre (Dakika)</label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(parseInt(e.target.value) || 120)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                {/* Date & Time Fields */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Başlangıç Tarih & Saat</label>
                    <input
                      type="datetime-local"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-gray-700">Bitiş Tarih & Saat</label>
                    <input
                      type="datetime-local"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm bg-white"
                    />
                  </div>
                </div>

                {/* Assignment Fields */}
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">Deneme Sınavı Ataması</label>
                  <div className="grid grid-cols-3 gap-2">
                    <button
                      type="button"
                      onClick={() => setAssignType("all")}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        assignType === "all"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Tüm Öğrenciler
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignType("course")}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        assignType === "course"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Sınıfa (Kursa) Ata
                    </button>
                    <button
                      type="button"
                      onClick={() => setAssignType("student")}
                      className={`py-2 px-3 text-xs font-bold rounded-xl border transition-all ${
                        assignType === "student"
                          ? "bg-indigo-600 text-white border-indigo-600 shadow-md"
                          : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      Öğrenciye Özel
                    </button>
                  </div>

                  {assignType === "course" && (
                    <div className="space-y-2 animate-fadeIn">
                      <select
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="">-- Sınıf (Kurs) Seçin --</option>
                        {courses?.map((course: any) => (
                          <option key={course.id} value={course.id}>
                            {course.title}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  {assignType === "student" && (
                    <div className="space-y-2 animate-fadeIn">
                      <select
                        value={selectedStudentId}
                        onChange={(e) => setSelectedStudentId(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-300 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                      >
                        <option value="">-- Öğrenci Seçin --</option>
                        {students.map((student: any) => (
                          <option key={student.id} value={student.id}>
                            {student.full_name} ({student.email})
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>

                {/* PDF Uploader */}
                <div className="space-y-2">
                  <label className="text-sm font-bold text-gray-700">Deneme Soru Kitapçığı PDF *</label>
                  <div className="border-2 border-dashed border-gray-300 hover:border-indigo-500 transition-colors rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer relative bg-gray-50">
                    <input
                      type="file"
                      accept=".pdf"
                      required={!pdfPath}
                      onChange={handlePdfUpload}
                      disabled={isUploadingPdf}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <svg className="w-8 h-8 text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    <span className="text-xs font-semibold text-gray-600">
                      {isUploadingPdf ? "Yükleniyor, lütfen bekleyin..." : "PDF dosyasını sürükleyin veya seçin"}
                    </span>
                  </div>
                  {pdfPath && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2 text-emerald-800 text-xs font-bold flex items-center justify-between animate-fadeIn">
                      <span>✓ Kitapçık PDF'i başarıyla yüklendi</span>
                      <a href={`/api/v1/media/documents/${pdfPath.split("/").pop()}`} target="_blank" rel="noreferrer" className="underline hover:text-emerald-950">
                        Görüntüle
                      </a>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Dynamic Subject Sections */}
              <div className="space-y-4 bg-gray-50 p-6 rounded-2xl border border-gray-150">
                <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                  <h4 className="text-base font-bold text-gray-900">Ders & Soru Dağılımları</h4>
                  <button
                    type="button"
                    onClick={addSubjectSection}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>+</span> Ders Ekle
                  </button>
                </div>

                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                  {subjectSections.map((sec, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-sm animate-fadeIn">
                      <div className="flex-1">
                        <input
                          type="text"
                          required
                          placeholder="Ders Adı (Örn: Matematik)"
                          value={sec.subjectName}
                          onChange={(e) => updateSubjectSection(idx, "subjectName", e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs focus:outline-none"
                        />
                      </div>
                      <div className="w-24">
                        <input
                          type="number"
                          required
                          min={1}
                          max={100}
                          placeholder="Soru Sayısı"
                          value={sec.questionCount || ""}
                          onChange={(e) => updateSubjectSection(idx, "questionCount", parseInt(e.target.value) || 0)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg text-xs text-center focus:outline-none"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={() => removeSubjectSection(idx)}
                        className="text-red-500 hover:text-red-700 text-xs font-bold px-1"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>

                {/* Soru Aralığı Bilgi Özeti */}
                <div className="border-t border-gray-200 pt-3 space-y-1.5">
                  <div className="flex justify-between text-xs font-bold text-gray-500">
                    <span>Toplam Ders Sayısı:</span>
                    <span>{subjectSections.length}</span>
                  </div>
                  <div className="flex justify-between text-xs font-extrabold text-gray-900">
                    <span>Toplam Soru Sayısı:</span>
                    <span>{totalQuestions}</span>
                  </div>

                  {totalQuestions > 0 && (
                    <div className="bg-white border border-gray-200 rounded-xl p-3 mt-2 text-[10px] text-gray-600 space-y-1">
                      <div className="font-bold text-gray-800 mb-1">Dinamik Soru Sıralaması:</div>
                      {(() => {
                        let currentStart = 1;
                        return subjectSections.map((sec, idx) => {
                          const count = sec.questionCount || 0;
                          if (count <= 0) return null;
                          const rangeStr = `Soru ${currentStart} - ${currentStart + count - 1}`;
                          currentStart += count;
                          return (
                            <div key={idx} className="flex justify-between">
                              <span>{sec.subjectName || "Ders Belirtilmemiş"}</span>
                              <span className="font-semibold text-indigo-600">{rangeStr}</span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Answer Key Grid Section */}
            {totalQuestions > 0 && (
              <div className="border-t border-gray-100 pt-6 space-y-4">
                <div>
                  <h4 className="text-lg font-bold text-gray-900">Cevap Anahtarı Girişi</h4>
                  <p className="text-xs text-gray-500">Öğrencilerin doğru cevapları eşleştirebilmesi için lütfen cevap anahtarını doldurun.</p>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 max-h-[400px] overflow-y-auto p-2 bg-gray-50 rounded-2xl border border-gray-250">
                  {questionsList.map((q) => {
                    const num = q.questionNumber;
                    return (
                      <div key={num} className="bg-white border border-gray-200 rounded-xl p-3 flex flex-col items-center gap-1.5 shadow-sm">
                        <div className="flex flex-col items-center">
                          <span className="text-xs font-bold text-gray-900">Soru {num}</span>
                          <span className="text-[9px] text-indigo-500 font-semibold">{q.subjectName}</span>
                        </div>
                        <div className="flex gap-1">
                          {optionsList.map((lettr) => (
                            <button
                              type="button"
                              key={lettr}
                              onClick={() => setAnswerKey((prev) => ({ ...prev, [num]: lettr }))}
                              className={`w-6 h-6 rounded-full text-[10px] font-bold border flex items-center justify-center transition-all ${
                                answerKey[num] === lettr
                                  ? "bg-indigo-600 border-indigo-600 text-white"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-50"
                              }`}
                            >
                              {lettr}
                            </button>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Form actions */}
            <div className="flex items-center justify-end gap-3 border-t border-gray-150 pt-5">
              <button
                type="button"
                onClick={resetForm}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-sm transition-all"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={createMutation.isPending || updateMutation.isPending}
                className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl font-bold text-sm shadow-md transition-all disabled:opacity-50"
              >
                {editId
                  ? (updateMutation.isPending ? "Güncelleniyor..." : "Değişiklikleri Kaydet")
                  : (createMutation.isPending ? "Deneme Oluşturuluyor..." : "Deneme Sınavını Oluştur")
                }
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Mock Exams List Section */}
      <div className="bg-white rounded-3xl border border-gray-200 shadow-xl p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <h3 className="text-2xl font-bold text-gray-900">Aktif Deneme Sınavları</h3>
          <div className="w-full md:w-80">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Deneme adı veya türü ara..."
              className="w-full px-4 py-2 text-sm border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            />
          </div>
        </div>

        {/* Exams Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="py-4 px-4">Deneme Adı</th>
                <th className="py-4 px-4 text-center">Format</th>
                <th className="py-4 px-4 text-center">Soru Sayısı</th>
                <th className="py-4 px-4 text-center">Süre</th>
                <th className="py-4 px-4">Oluşturulma Tarihi</th>
                <th className="py-4 px-4 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-gray-500">Yükleniyor...</td>
                </tr>
              ) : filteredExams.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-12 text-sm text-gray-500">
                    {search ? "Aramayla eşleşen deneme sınavı bulunamadı." : "Henüz deneme sınavı eklenmemiş."}
                  </td>
                </tr>
              ) : (
                filteredExams.map((exam) => (
                  <tr key={exam.id} className="border-b border-gray-100 hover:bg-indigo-50/20 transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-gray-900">{exam.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{exam.description || "Açıklama girilmemiş"}</div>
                    </td>
                    <td className="py-4 px-4 text-center">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-extrabold ${
                        exam.exam_type === "LGS" ? "bg-purple-100 text-purple-800" : "bg-indigo-100 text-indigo-800"
                      }`}>
                        {exam.exam_type}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gray-700">
                      {exam.questions?.length || 0} Soru
                    </td>
                    <td className="py-4 px-4 text-center font-bold text-gray-700">
                      {exam.duration_minutes} Dk
                    </td>
                    <td className="py-4 px-4 text-sm text-gray-600">
                      {new Date(exam.created_at).toLocaleDateString("tr-TR", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </td>
                    <td className="py-4 px-4 text-right flex items-center justify-end gap-2">
                      <button
                        onClick={() => startEdit(exam)}
                        className="px-3.5 py-2 text-xs font-bold text-indigo-600 hover:text-white border border-indigo-200 hover:bg-indigo-600 rounded-xl transition-all"
                      >
                        Düzenle
                      </button>
                      <button
                        onClick={() => {
                          if (confirm("Bu deneme sınavını ve ilgili tüm öğrenci sonuçlarını silmek istediğinize emin misiniz?")) {
                            deleteMutation.mutate(exam.id);
                          }
                        }}
                        className="px-3.5 py-2 text-xs font-bold text-red-600 hover:text-white border border-red-200 hover:bg-red-600 rounded-xl transition-all"
                      >
                        Sil
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
