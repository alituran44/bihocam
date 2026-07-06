"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { mockExamsApi, type MockExam } from "@/lib/api";
import { useRouter, useSearchParams, useParams } from "next/navigation";
import { toast } from "sonner";

export default function TakeMockExamPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  const examId = params.examId as string;
  const attemptId = searchParams.get("attempt_id");

  // Fetch the mock exam structure
  const { data: exam, isLoading } = useQuery<MockExam>({
    queryKey: ["mock-exam", examId],
    queryFn: () => mockExamsApi.get(examId),
    enabled: !!examId,
  });

  // State to store student answers: question_number -> selected option
  const [answers, setAnswers] = useState<Record<number, string | null>>({});

  // Active subject tab state
  const [activeSubject, setActiveSubject] = useState<string>("");

  // Timer states
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number | null>(null);

  // Group questions by subject
  const getQuestionsBySubject = () => {
    if (!exam || !exam.questions) return {};
    const grouped: Record<string, typeof exam.questions> = {};
    // Sort questions by number first
    const sorted = [...exam.questions].sort((a, b) => a.question_number - b.question_number);
    sorted.forEach((q) => {
      if (!grouped[q.subject_name]) {
        grouped[q.subject_name] = [];
      }
      grouped[q.subject_name].push(q);
    });
    return grouped;
  };

  const groupedQuestions = getQuestionsBySubject();
  const subjects = Object.keys(groupedQuestions);

  // Set default active subject
  useEffect(() => {
    if (subjects.length > 0 && !activeSubject) {
      setActiveSubject(subjects[0]);
    }
  }, [subjects, activeSubject]);

  // Initialize timer
  useEffect(() => {
    if (exam && timeLeftSeconds === null) {
      // Check if attempt started earlier (we can compute elapsed time, but simple countdown is fine)
      setTimeLeftSeconds(exam.duration_minutes * 60);
    }
  }, [exam, timeLeftSeconds]);

  // Countdown effect
  useEffect(() => {
    if (timeLeftSeconds === null) return;
    if (timeLeftSeconds <= 0) {
      toast.warning("Süre doldu! Cevaplarınız otomatik olarak gönderiliyor.");
      handleAutoSubmit();
      return;
    }

    const timer = setTimeout(() => {
      setTimeLeftSeconds(timeLeftSeconds - 1);
    }, 1000);

    return () => clearTimeout(timer);
  }, [timeLeftSeconds]);

  // Submit attempt mutation
  const submitMutation = useMutation({
    mutationFn: (payload: { answers: { question_number: number; selected_answer: string | null }[] }) =>
      mockExamsApi.submitAttempt(attemptId!, payload),
    onSuccess: (data) => {
      toast.success("Sınavınız başarıyla teslim edildi. Karne analiziniz hazırlanıyor...");
      router.push(`/dashboard/student/mock-exams/attempts/${data.id}/result`);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Sınav teslim edilirken bir hata oluştu.");
    },
  });

  const handleSelectAnswer = (questionNumber: number, option: string) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: prev[questionNumber] === option ? null : option,
    }));
  };

  const handleClearAnswer = (questionNumber: number) => {
    setAnswers((prev) => ({
      ...prev,
      [questionNumber]: null,
    }));
  };

  const buildPayload = () => {
    if (!exam || !exam.questions) return [];
    return exam.questions.map((q) => ({
      question_number: q.question_number,
      selected_answer: answers[q.question_number] || null,
    }));
  };

  const handleManualSubmit = () => {
    const totalQuestions = exam?.questions?.length || 0;
    const answeredCount = Object.values(answers).filter(Boolean).length;
    const emptyCount = totalQuestions - answeredCount;

    if (confirm(`Sınavı bitirmek istediğinize emin misiniz?\n\nToplam Soru: ${totalQuestions}\nİşaretlenen: ${answeredCount}\nBoş Bırakılan: ${emptyCount}`)) {
      submitMutation.mutate({ answers: buildPayload() });
    }
  };

  const handleAutoSubmit = () => {
    submitMutation.mutate({ answers: buildPayload() });
  };

  // Format time (seconds -> HH:MM:SS)
  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  if (isLoading || !exam) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm font-bold text-gray-600">Sınav kitapçığı yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Get filename from path
  const pdfFilename = exam.pdf_path.split("/").pop();
  const pdfUrl = `/api/v1/media/documents/${pdfFilename}#toolbar=0&navpanes=0&scrollbar=0`;
  const optionsCount = exam.number_of_options || 4;
  const optionLetters = ["A", "B", "C", "D", "E"].slice(0, optionsCount);

  return (
    <div className="fixed inset-0 flex flex-col bg-gray-150 z-50 overflow-hidden">
      {/* Header bar */}
      <div className="h-16 bg-white border-b border-gray-200 px-6 flex items-center justify-between shadow-sm shrink-0">
        <div className="flex items-center gap-3">
          <span className="bg-indigo-100 text-indigo-800 text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase">
            {exam.exam_type} Formatı
          </span>
          <h2 className="text-base font-bold text-gray-900 line-clamp-1">{exam.title}</h2>
        </div>

        <div className="flex items-center gap-6">
          {/* Timer Display */}
          <div className="flex items-center gap-2 bg-indigo-50 border border-indigo-150 px-4 py-2 rounded-xl">
            <span className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-wider">Kalan Süre:</span>
            <span className="font-mono text-sm font-bold text-indigo-700">
              {timeLeftSeconds !== null ? formatTime(timeLeftSeconds) : "00:00:00"}
            </span>
          </div>

          <button
            onClick={handleManualSubmit}
            disabled={submitMutation.isPending}
            className="px-6 py-2.5 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white font-bold rounded-xl text-xs shadow-md transition-all disabled:opacity-50"
          >
            {submitMutation.isPending ? "Teslim Ediliyor..." : "Sınavı Bitir"}
          </button>
        </div>
      </div>

      {/* Main split viewport */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Viewport: PDF Viewer */}
        <div className="w-1/2 h-full border-r border-gray-200 bg-gray-800 flex items-center justify-center relative">
          <iframe
            src={pdfUrl}
            className="w-full h-full border-none"
            title="Sınav Kitapçığı PDF"
          />
        </div>

        {/* Right Viewport: Subject Optical Forms */}
        <div className="w-1/2 h-full bg-white flex flex-col overflow-hidden">
          {/* Subject Tab Selectors */}
          <div className="flex border-b border-gray-200 bg-gray-50 overflow-x-auto shrink-0">
            {subjects.map((subj) => (
              <button
                key={subj}
                onClick={() => setActiveSubject(subj)}
                className={`px-5 py-4 border-b-2 font-extrabold text-xs transition-all shrink-0 ${
                  activeSubject === subj
                    ? "border-indigo-600 text-indigo-600 bg-white"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-100"
                }`}
              >
                {subj}
              </button>
            ))}
          </div>

          {/* Optical rows list */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6">
            <div className="max-w-xl mx-auto space-y-4">
              <div className="flex items-center justify-between text-xs font-bold text-gray-400 border-b border-gray-100 pb-2">
                <span>SORU NUMARASI & DERS</span>
                <span className="pr-12">İŞARETLEME ALANI</span>
              </div>

              {activeSubject && groupedQuestions[activeSubject] ? (
                groupedQuestions[activeSubject].map((q) => {
                  const num = q.question_number;
                  const selected = answers[num] || null;
                  return (
                    <div
                      key={num}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border transition-all ${
                        selected
                          ? "bg-indigo-50/40 border-indigo-200 shadow-sm"
                          : "border-gray-150 hover:bg-gray-50/50"
                      }`}
                    >
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold text-gray-900">Soru {num}</span>
                        <span className="text-[10px] text-gray-400 font-semibold">{activeSubject}</span>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5">
                          {optionLetters.map((lettr) => (
                            <button
                              key={lettr}
                              onClick={() => handleSelectAnswer(num, lettr)}
                              className={`w-9 h-9 rounded-full text-xs font-bold border-2 flex items-center justify-center transition-all ${
                                selected === lettr
                                  ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20"
                                  : "border-gray-200 text-gray-600 hover:bg-gray-100 bg-white"
                              }`}
                            >
                              {lettr}
                            </button>
                          ))}
                        </div>

                        {selected && (
                          <button
                            onClick={() => handleClearAnswer(num)}
                            className="text-[10px] font-bold text-gray-400 hover:text-red-500 transition-colors pl-2"
                          >
                            Temizle
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center py-12 text-sm text-gray-400 font-medium">Bölüm soruları bulunamadı.</div>
              )}
            </div>
          </div>

          {/* Quick status summary footer */}
          <div className="h-14 bg-gray-50 border-t border-gray-200 px-8 flex items-center justify-between text-xs font-bold text-gray-500 shrink-0">
            <div className="flex gap-4">
              <span>Toplam Soru: {exam.questions?.length || 0}</span>
              <span>•</span>
              <span className="text-indigo-600">İşaretlenen: {Object.values(answers).filter(Boolean).length}</span>
              <span>•</span>
              <span className="text-gray-400">Boş: {(exam.questions?.length || 0) - Object.values(answers).filter(Boolean).length}</span>
            </div>
            <span>Bitirmek için sağ üstteki butona tıklayın</span>
          </div>
        </div>
      </div>
    </div>
  );
}
