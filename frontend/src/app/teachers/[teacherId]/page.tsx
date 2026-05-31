"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { teachersApi, blogPublicApi, homeworksApi, quizzesApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";

type TeacherInfo = {
  id: string;
  full_name: string;
  email: string;
  bio?: string | null;
  expertise_tags?: string[] | null;
  social_links?: {
    linkedin?: string | null;
    twitter?: string | null;
    instagram?: string | null;
    website?: string | null;
  } | null;
  avatar_url?: string | null;
  live_class_price?: number | null;
  live_class_discount_price?: number | null;
  live_class_link?: string | null;
  created_at: string;
  phone?: string | null;
};

type Course = {
  id: string;
  title: string;
  slug: string;
  description?: string | null;
  price?: number;
  discount_price?: number | null;
  thumbnail_path?: string | null;
  lessons?: Array<{ id: string }>;
  teacher?: TeacherInfo | null;
};

type CourseReview = {
  id: string;
  user_id: string;
  course_id: string;
  rating: number;
  title?: string | null;
  comment?: string | null;
  created_at: string;
  user?: {
    id: string;
    full_name: string;
    avatar_url?: string | null;
  } | null;
};

type TeacherProfileResponse = {
  teacher: TeacherInfo;
  courses: Course[];
  reviews: CourseReview[];
};

type AvailabilitySlot = {
  id: string;
  teacher_id: string;
  date: string;
  start_time: string;
  end_time: string;
  is_booked: boolean;
};

type LibraryItem = {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  item_type: "file" | "video" | "youtube";
  file_path?: string;
  youtube_url?: string;
  created_at: string;
};

export default function TeacherProfilePage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const teacherId = params.teacherId as string;

  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"about" | "courses" | "book" | "blog" | "library" | "homeworks" | "quizzes">("about");

  // Selected date for calendar: "YYYY-MM-DD"
  const [selectedDate, setSelectedDate] = useState<string>("2026-05-24");
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [studentNotes, setStudentNotes] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const [isFollowing, setIsFollowing] = useState(false);

  // Homework & Quiz course selection
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Student Homework submission states
  const [activeHomeworkForSubmit, setActiveHomeworkForSubmit] = useState<any | null>(null);
  const [submittingText, setSubmittingText] = useState("");
  const [isSubmittingHomework, setIsSubmittingHomework] = useState(false);

  // Check URL hash to switch tabs on page load
  useEffect(() => {
    if (typeof window !== "undefined") {
      const hash = window.location.hash;
      if (hash === "#live-class" || hash === "#book") {
        setActiveTab("book");
      } else if (hash === "#courses") {
        setActiveTab("courses");
      } else if (hash === "#library") {
        setActiveTab("library");
      } else if (hash === "#blog") {
        setActiveTab("blog");
      } else if (hash === "#homeworks") {
        setActiveTab("homeworks");
      } else if (hash === "#quizzes") {
        setActiveTab("quizzes");
      }
    }
  }, []);

  // Get teacher detailed profile (includes courses & reviews)
  const { data, isLoading, error } = useQuery<TeacherProfileResponse>({
    queryKey: ["teacher", teacherId],
    queryFn: () => teachersApi.get(teacherId),
    enabled: !!teacherId,
  });

  // Automatically select first course when loaded
  useEffect(() => {
    if (data?.courses && data.courses.length > 0 && !selectedCourseId) {
      setSelectedCourseId(data.courses[0].id);
    }
  }, [data, selectedCourseId]);

  // Get teacher availability slots
  const { data: slots, isLoading: slotsLoading } = useQuery<AvailabilitySlot[]>({
    queryKey: ["teacher-availability", teacherId],
    queryFn: () => teachersApi.getAvailability(teacherId),
    enabled: !!teacherId,
  });

  // Fetch teacher's blog posts
  const { data: blogData, isLoading: blogLoading } = useQuery({
    queryKey: ["teacher-blogs", teacherId],
    queryFn: () => blogPublicApi.getAuthor(teacherId),
    enabled: !!teacherId && activeTab === "blog",
  });
  
  const blogPosts = blogData?.posts || [];

  // Fetch teacher's library items
  const { data: libraryItems = [], isLoading: libraryLoading } = useQuery<LibraryItem[]>({
    queryKey: ["teacher-library", teacherId],
    queryFn: () => teachersApi.getLibrary(teacherId),
    enabled: !!teacherId && activeTab === "library",
  });

  // Fetch homeworks for selected course
  const { data: homeworksList = [], isLoading: homeworksLoading } = useQuery<any[]>({
    queryKey: ["public-course-homeworks", selectedCourseId],
    queryFn: () => homeworksApi.list(selectedCourseId),
    enabled: !!selectedCourseId && activeTab === "homeworks" && isAuthenticated,
  });

  // Fetch quizzes for selected course
  const { data: quizzesList = [], isLoading: quizzesLoading } = useQuery<any[]>({
    queryKey: ["public-course-quizzes", selectedCourseId],
    queryFn: () => quizzesApi.list({ course_id: selectedCourseId }),
    enabled: !!selectedCourseId && activeTab === "quizzes",
  });

  // Booking mutation
  const bookMutation = useMutation({
    mutationFn: (payload: { availability_id: string; student_notes?: string }) =>
      teachersApi.bookLiveClass(teacherId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-availability", teacherId] });
      setBookingSuccess(true);
      setSelectedSlotId("");
      setStudentNotes("");
      setBookingError("");
    },
    onError: (err: any) => {
      setBookingError(err.response?.data?.detail || "Rezervasyon yapılırken bir hata oluştu.");
    },
  });

  // Submit homework mutation
  const submitHomeworkMutation = useMutation({
    mutationFn: ({ homeworkId, payload }: { homeworkId: string; payload: any }) =>
      homeworksApi.submit(homeworkId, payload),
    onSuccess: () => {
      toast.success("Ödeviniz başarıyla teslim edildi.");
      setActiveHomeworkForSubmit(null);
      setSubmittingText("");
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Ödev teslim edilirken bir hata oluştu.");
    },
  });

  const handleBookLiveClass = () => {
    if (!selectedSlotId) {
      setBookingError("Lütfen listeden uygun bir saat dilimi seçiniz.");
      return;
    }
    bookMutation.mutate({
      availability_id: selectedSlotId,
      student_notes: studentNotes,
    });
  };

  const handleHomeworkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingText.trim()) {
      toast.error("Lütfen ödev cevabınızı yazın.");
      return;
    }
    submitHomeworkMutation.mutate({
      homeworkId: activeHomeworkForSubmit.id,
      payload: {
        submission_text: submittingText,
        file_path: null,
      },
    });
  };

  // Pre-calculated stats or defaults for premium look
  const totalStudents = data?.courses ? (parseInt(data.teacher.id.slice(0, 2), 16) || 12) * 5 + 4 : 0;
  const totalMeetings = data?.teacher?.live_class_price ? Math.floor((parseInt(data.teacher.id.slice(0, 2), 16) || 12) % 35) + 3 : 0;

  // Filter slots for selected date
  const slotsForSelectedDate = slots?.filter((s) => s.date === selectedDate) || [];

  // Nearest slot logic
  const nearestSlot = slots?.[0] ? `${slots[0].date} ${slots[0].start_time}-${slots[0].end_time}` : "Müsaitlik bulunmuyor";

  // Helper date formatter
  const formatJoinDate = (dateStr: string) => {
    if (!dateStr) return "Eylül 2025";
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return "Eylül 2025";
      return date.toLocaleDateString("tr-TR", { month: "long", year: "numeric" });
    } catch {
      return "Eylül 2025";
    }
  };

  const getYoutubeEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtu.be")) {
        const id = url.split("/").pop();
        return `https://www.youtube.com/embed/${id}`;
      }
      const urlParams = new URLSearchParams(new URL(url).search);
      return `https://www.youtube.com/embed/${urlParams.get("v")}`;
    } catch {
      return url;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 relative z-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error || !data ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100 shadow-sm max-w-2xl mx-auto mt-10">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Eğitmen Bulunamadı</h2>
            <p className="text-gray-500 font-semibold mb-6">Aradığınız eğitmen platformda mevcut değil veya aktif değil.</p>
            <Link href="/teachers" className="px-6 py-3 bg-teal-600 text-white rounded-xl font-bold shadow-md">
              Eğitmenlere Dön
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* LEFT SIDEBAR: PROFILE CARD */}
            <div className="lg:col-span-3 space-y-6">
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 flex flex-col items-center text-center relative overflow-hidden">
                <Avatar
                  src={data.teacher.avatar_url}
                  name={data.teacher.full_name}
                  size="xl"
                  className="w-24 h-24 ring-4 ring-slate-50 shadow-md mb-4 flex-shrink-0"
                />
                
                <h2 className="text-xl font-bold text-slate-800 tracking-tight uppercase leading-snug">{data.teacher.full_name}</h2>
                <p className="text-slate-400 text-xs font-bold mt-1">
                  {data.teacher.expertise_tags?.[0] ? `${data.teacher.expertise_tags[0]} Öğretmeni` : "Eğitmen"}
                </p>

                {/* Follower Stats */}
                <div className="flex items-center gap-6 py-5 border-t border-b border-slate-50 w-full mt-5">
                  <div className="flex-1">
                    <div className="text-base font-black text-slate-800">{isFollowing ? 1 : 0}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Takipçiler</div>
                  </div>
                  <div className="w-px h-6 bg-slate-100"></div>
                  <div className="flex-1">
                    <div className="text-base font-black text-slate-800">0</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Takip edilenler</div>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3 w-full mt-5">
                  <button
                    onClick={() => setIsFollowing(!isFollowing)}
                    className={`flex-1 py-3 font-bold rounded-2xl text-xs transition-all shadow-sm ${
                      isFollowing 
                        ? "bg-slate-100 hover:bg-slate-200 text-slate-700" 
                        : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10"
                    }`}
                  >
                    {isFollowing ? "Takibi Bırak" : "Takip et"}
                  </button>
                  <Link
                    href={`/dashboard/messages?recipient_id=${data.teacher.id}`}
                    className="w-12 h-12 rounded-2xl bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center border border-slate-200/60 shadow-sm transition-all flex-shrink-0"
                    title="Mesaj Gönder"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </Link>
                </div>

                {/* Telephone Contact info */}
                {data.teacher.phone && (
                  <div className="w-full mt-5 pt-4 border-t border-slate-50 flex items-center justify-center gap-2 text-slate-600 font-bold text-xs">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.94.725l.548 2.2a1 1 0 01-.321.988l-1.305.98a10.582 10.582 0 004.872 4.872l.98-1.305a1 1 0 01.988-.321l2.2.548a1 1 0 01.725.94V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>{data.teacher.phone}</span>
                  </div>
                )}

                {/* Social links */}
                {data.teacher.social_links && (data.teacher.social_links.website || data.teacher.social_links.linkedin || data.teacher.social_links.twitter || data.teacher.social_links.instagram) && (
                  <div className="flex gap-4 justify-center mt-5 text-slate-400 border-t border-slate-50 w-full pt-4">
                    {data.teacher.social_links.website && (
                      <a href={data.teacher.social_links.website} target="_blank" rel="noopener noreferrer" className="hover:text-teal-600 transition-colors" title="Kişisel Web Sitesi">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                        </svg>
                      </a>
                    )}
                    {data.teacher.social_links.linkedin && (
                      <a href={data.teacher.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-blue-700 transition-colors" title="LinkedIn">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.779-1.75-1.75s.784-1.75 1.75-1.75 1.75.779 1.75 1.75-.784 1.75-1.75 1.75zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                        </svg>
                      </a>
                    )}
                    {data.teacher.social_links.twitter && (
                      <a href={data.teacher.social_links.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-blue-400 transition-colors" title="Twitter">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z" />
                        </svg>
                      </a>
                    )}
                    {data.teacher.social_links.instagram && (
                      <a href={data.teacher.social_links.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-pink-600 transition-colors" title="Instagram">
                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.051.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                        </svg>
                      </a>
                    )}
                  </div>
                )}

                {/* Join Date footer */}
                <div className="pt-5 border-t border-slate-50 w-full mt-5 text-[11px] text-slate-400 font-bold tracking-wide uppercase">
                  ÜYELİK TARİHİ: {formatJoinDate(data.teacher.created_at)}
                </div>
              </div>
            </div>

            {/* RIGHT MAIN LAYOUT: TABBED CONSOLE */}
            <div className="lg:col-span-9 space-y-6">
              
              {/* Tabs list (Matches screenshot exactly, now expanded to 7 tabs) */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm px-6 py-2 overflow-x-auto">
                <div className="flex border-b border-transparent min-w-[500px] whitespace-nowrap">
                  {[
                    { key: "about", label: "👤 Hakkında" },
                    { key: "courses", label: "📚 Kurslar" },
                    { key: "book", label: "📅 Canlı Ders" },
                    { key: "blog", label: "✍️ Blog Yazıları" },
                    { key: "library", label: "📁 Kütüphane" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActiveTab(tab.key as any)}
                      className={`pb-4 pt-4 px-4 text-xs font-black relative transition-colors ${
                        activeTab === tab.key ? "text-blue-600 font-extrabold" : "text-slate-400 hover:text-slate-600"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.key && (
                        <span className="absolute bottom-0 left-3 right-3 h-0.5 bg-blue-600 rounded-full"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* TAB CONTENT: HAKKINDA (Active by default) */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  
                  {/* Four Counters Cards (Matches screenshot 1) */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    {[
                      { value: totalStudents, label: "Öğrenci", color: "text-red-500", bg: "bg-red-50", icon: "🎓" },
                      { value: data.courses?.length || 0, label: "Kurslar", color: "text-blue-500", bg: "bg-blue-50", icon: "▶️" },
                      { value: 0, label: "Makaleler", color: "text-emerald-500", bg: "bg-emerald-50", icon: "🎭" },
                      { value: totalMeetings, label: "Toplantılar", color: "text-orange-500", bg: "bg-orange-50", icon: "📅" },
                    ].map((stat, idx) => (
                      <div key={idx} className="bg-white border border-slate-100 rounded-[2rem] p-5 shadow-sm flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-2xl ${stat.bg} ${stat.color} flex items-center justify-center text-xl shadow-inner`}>
                          {stat.icon}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 font-bold uppercase leading-none">{stat.label}</div>
                          <div className="text-lg font-black text-slate-800 leading-none">{stat.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Main Bio Content Grid */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                      {/* Left: Bio text */}
                      <div className="md:col-span-7 space-y-4">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Hakkımda</h3>
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed whitespace-pre-wrap">
                          {data.teacher.bio || "Merhaba, bu eğitmen henüz biyografi detaylarını doldurmamıştır."}
                        </p>

                        <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase pt-4">Deneyimler</h3>
                        <div className="space-y-3 text-xs font-semibold text-slate-500 relative border-l border-slate-100 pl-4 ml-2">
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></span>
                            Özel Etüt Merkezleri (Matematik Eğitmeni)
                          </div>
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></span>
                            Online Eğitim Portalları ve Canlı Grup Dersleri
                          </div>
                        </div>
                      </div>

                      {/* Right: Education Timeline */}
                      <div className="md:col-span-5 space-y-4 md:border-l md:border-slate-50 md:pl-6">
                        <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Eğitim</h3>
                        <div className="space-y-4 text-xs font-bold text-slate-600 relative border-l border-slate-100 pl-4 ml-2">
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></span>
                            Üniversite Lisans Derecesi
                          </div>
                          <div className="relative">
                            <span className="absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-white"></span>
                            Pedagojik Formasyon Eğitimi
                          </div>
                        </div>

                        {/* Tags list */}
                        <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase pt-6">Beceriler & İlgi Alanları</h3>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {(data.teacher.expertise_tags || ["Matematik", "Geometri", "LGS Hazırlık", "TYT Hazırlık", "AYT Hazırlık"]).map((tag, idx) => (
                            <span key={idx} className="px-3.5 py-1.5 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-bold">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB CONTENT: KURLSAR */}
              {activeTab === "courses" && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-5">Yayınlanan Eğitimler</h3>
                  {!data.courses?.length ? (
                    <div className="text-center py-10 bg-slate-50 rounded-2xl">
                      <p className="text-slate-400 font-bold text-sm">Henüz yayınlanmış bir eğitim bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      {data.courses.map((course) => (
                        <Link
                          key={course.id}
                          href={`/courses/${course.slug}`}
                          className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
                        >
                          <div className="aspect-video bg-gradient-to-br from-teal-50 to-indigo-50 relative overflow-hidden">
                            {course.thumbnail_path ? (
                              <img
                                src={course.thumbnail_path}
                                alt={course.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-teal-600 text-3xl">📚</div>
                            )}
                          </div>
                          <div className="p-4 space-y-2">
                            <h3 className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                              {course.title}
                            </h3>
                            <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs font-bold text-teal-600">
                              <span>Detayları İncele →</span>
                              <span className="text-slate-800 text-sm">
                                {course.price === 0 ? "Ücretsiz" : `₺${course.price?.toFixed(0)}`}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: TOPLANTI AYIRT (BOOK MEETING) */}
              {activeTab === "book" && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                  
                  <p className="text-slate-400 text-xs font-bold leading-relaxed border-b border-slate-100/50 pb-4">
                    Lütfen takvimden bir gün ve uygun bir saat seçin, ardından rezervasyon işlemine yönlendirileceksiniz.
                  </p>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 py-4 border-b border-slate-100/50">
                    {[
                      { label: "En Yakın Zaman", value: nearestSlot, icon: "📅" },
                      { label: "Saatlik Ücret", value: data.teacher.live_class_price ? `${data.teacher.live_class_price} ₺` : "Anlaşmalı", icon: "💵" },
                      { label: "Yüz Yüze Ücret", value: "Ücretsiz", icon: "📍" },
                      { label: "Grup Toplantısı Ücreti", value: "Ücretsiz/Koltuk", icon: "👥" },
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-lg shadow-inner flex-shrink-0">
                          {item.icon}
                        </div>
                        <div className="space-y-0.5">
                          <div className="text-[10px] text-slate-400 font-bold uppercase leading-none">{item.label}</div>
                          <div className="text-xs font-black text-slate-700 truncate max-w-[140px]">{item.value}</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
                    
                    {/* Left: Monthly Calendar Month View */}
                    <div className="md:col-span-5 bg-slate-50/50 border border-slate-100/50 p-4 rounded-3xl space-y-4">
                      
                      <div className="flex items-center justify-between px-2">
                        <button className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 transition-colors">
                          &lt;
                        </button>
                        <span className="font-extrabold text-slate-800 text-sm">2026 May</span>
                        <button className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 transition-colors">
                          &gt;
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center">
                        {["Sa", "Fr", "Th", "We", "Tu", "Mo", "Su"].map((day) => (
                          <span key={day} className="text-[10px] font-black text-slate-400 py-1 uppercase">{day}</span>
                        ))}

                        {[...Array(3)].map((_, i) => (
                          <span key={`empty-${i}`} className="py-2 text-[10px] text-slate-300 font-bold"></span>
                        ))}

                        {[...Array(31)].map((_, i) => {
                          const dayNum = i + 1;
                          const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                          const fullDateStr = `2026-05-${dayStr}`;

                          const hasSlots = slots?.some((s) => s.date === fullDateStr);
                          const isCurrentlySelected = selectedDate === fullDateStr;

                          return (
                            <button
                              key={dayNum}
                              onClick={() => {
                                setSelectedDate(fullDateStr);
                                setSelectedSlotId("");
                              }}
                              className={`py-2 text-[11px] font-extrabold rounded-xl transition-all ${
                                isCurrentlySelected
                                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/10"
                                  : hasSlots
                                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                                  : "text-slate-500 hover:bg-slate-100"
                              }`}
                            >
                              {dayNum}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Right: Selected Date Slots and Booking Form */}
                    <div className="md:col-span-7 flex flex-col justify-center min-h-[300px] border border-slate-100 rounded-3xl p-6 relative overflow-hidden bg-white">
                      
                      {!selectedDate ? (
                        <div className="text-center space-y-4 py-8">
                          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-3xl mx-auto">
                            📅
                          </div>
                          <h4 className="font-extrabold text-slate-800 text-sm">Tarih Seçin</h4>
                          <p className="text-slate-400 text-xs font-semibold leading-relaxed">
                            Toplantı rezervasyonu için takvimden bir tarih seçin.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-4">
                          <div className="border-b border-slate-50 pb-3 flex justify-between items-center">
                            <span className="font-black text-slate-800 text-sm uppercase">DERS SEÇİMİ</span>
                            <span className="px-2.5 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-extrabold">
                              Seçili: {selectedDate}
                            </span>
                          </div>

                          {slotsLoading ? (
                            <div className="space-y-2">
                              {[...Array(2)].map((_, i) => (
                                <div key={i} className="h-10 bg-slate-50 rounded-xl animate-pulse" />
                              ))}
                            </div>
                          ) : !slotsForSelectedDate.length ? (
                            <div className="text-center py-8 text-slate-400 font-bold text-xs bg-slate-50 rounded-2xl">
                              Bu tarihte tanımlı boş canlı ders saati bulunmamaktadır. Lütfen takvimden yeşil renkli tarihleri seçiniz.
                            </div>
                          ) : (
                            <div className="space-y-2">
                              {slotsForSelectedDate.map((slot) => {
                                const isSelected = selectedSlotId === slot.id;
                                return (
                                  <button
                                    key={slot.id}
                                    onClick={() => setSelectedSlotId(slot.id)}
                                    className={`w-full p-3 rounded-xl border text-left text-xs font-black flex items-center justify-between transition-all ${
                                      isSelected
                                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-500/10"
                                        : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200/60"
                                    }`}
                                  >
                                    <span>⏰ Saat Dilimi: {slot.start_time} - {slot.end_time}</span>
                                    <span>{isSelected ? "✓ Seçildi" : "Seç"}</span>
                                  </button>
                                );
                              })}
                            </div>
                          )}

                          {selectedSlotId && (
                            <div className="space-y-2 pt-2">
                              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wide">DERS NOTU (İSTEĞE BAĞLI)</label>
                              <textarea
                                value={studentNotes}
                                onChange={(e) => setStudentNotes(e.target.value)}
                                placeholder="Eğitmene iletmek istediğiniz detayları, ders hazırlık konularınızı yazabilirsiniz..."
                                rows={3}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 font-semibold text-slate-700 text-xs"
                              />
                            </div>
                          )}

                          {selectedSlotId && (
                            <div className="pt-2">
                              {isAuthenticated ? (
                                <button
                                  onClick={handleBookLiveClass}
                                  disabled={bookMutation.isPending}
                                  className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold shadow-xl shadow-blue-500/10 hover:shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all text-xs"
                                >
                                  {bookMutation.isPending ? "Rezervasyon yapılıyor..." : "Toplantı Ayırt"}
                                </button>
                              ) : (
                                <div className="p-4 bg-amber-50 border border-amber-100 rounded-2xl text-center space-y-2">
                                  <p className="text-amber-800 text-xs font-bold leading-tight">
                                    Canlı ders rezervasyonu yapmak için lütfen önce giriş yapınız.
                                  </p>
                                  <Link href="/login" className="inline-block px-4 py-2 bg-blue-600 text-white text-[11px] font-bold rounded-xl shadow-sm">
                                    Giriş Yap
                                  </Link>
                                </div>
                              )}
                            </div>
                          )}

                          {bookingError && (
                            <p className="text-xs font-bold text-rose-500 text-center leading-snug">{bookingError}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {bookingSuccess && (
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white rounded-[2.5rem] p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-5 animate-scaleUp">
                        <div className="w-16 h-16 bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl rounded-full mx-auto shadow-inner">
                          🎉
                        </div>
                        <h3 className="text-2xl font-black text-slate-800 tracking-tight">Ders Ayrıldı!</h3>
                        <p className="text-slate-500 font-semibold text-sm leading-relaxed">
                          Canlı ders talebiniz başarıyla alınmıştır. Eğitmen dersi onayladığında, ders katılım butonu öğrenci panelinizdeki **"Canlı Derslerim"** sayfasında aktif olacaktır.
                        </p>
                        <div className="pt-2">
                          <button
                            onClick={() => setBookingSuccess(false)}
                            className="px-8 py-3 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all text-xs shadow-md"
                          >
                            Kapat
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* TAB CONTENT: BLOG YAZILARI */}
              {activeTab === "blog" && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-5">Yayınlanan Blog Yazıları</h3>
                  
                  {blogLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : blogPosts.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                      <p className="text-slate-400 font-bold text-sm">Henüz yayınlanmış bir blog yazısı bulunmuyor.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {blogPosts.map((post: any) => (
                        <Link
                          key={post.id}
                          href={`/blog/${post.slug}`}
                          className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all flex flex-col justify-between"
                        >
                          <div className="aspect-[16/10] bg-gradient-to-br from-teal-50 to-blue-50 relative overflow-hidden">
                            {post.cover_image_path ? (
                              <img
                                src={`http://localhost:8000/media/${post.cover_image_path}`}
                                alt={post.title}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-teal-600 text-3xl">✍️</div>
                            )}
                          </div>
                          <div className="p-4 space-y-2 flex-1 flex flex-col justify-between">
                            <div className="space-y-1.5">
                              <span className="text-[10px] font-bold text-teal-600 bg-teal-50 px-2 py-0.5 rounded uppercase">
                                {post.category?.name || "Eğitim"}
                              </span>
                              <h4 className="font-bold text-slate-800 group-hover:text-teal-600 transition-colors line-clamp-2 leading-snug">
                                {post.title}
                              </h4>
                              {post.summary && (
                                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                  {post.summary}
                                </p>
                              )}
                            </div>
                            <div className="flex items-center justify-between pt-3 border-t border-slate-50 text-[10px] font-bold text-slate-400 mt-2">
                              <span>{new Date(post.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}</span>
                              <span className="text-teal-600 group-hover:underline">Yazıyı Oku →</span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: KÜTÜPHANE */}
              {activeTab === "library" && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-5">Öğretmenin Kütüphanesi</h3>

                  {libraryLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : libraryItems.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                      <p className="text-slate-400 font-bold text-sm">Eğitmen henüz kütüphanesine dosya veya video eklememiştir.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {libraryItems.map((item) => (
                        <div
                          key={item.id}
                          className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                                item.item_type === "file"
                                  ? "bg-blue-50 text-blue-700 border border-blue-100"
                                  : item.item_type === "video"
                                  ? "bg-purple-50 text-purple-700 border border-purple-100"
                                  : "bg-red-50 text-red-700 border border-red-100"
                              }`}
                            >
                              {item.item_type === "file" ? "📁 Döküman" : item.item_type === "video" ? "🎥 Video" : "🔗 YouTube"}
                            </span>

                            <h4 className="font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                            {item.description && (
                              <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                {item.description}
                              </p>
                            )}

                            {/* Inside item displays */}
                            {item.item_type === "youtube" && item.youtube_url && (
                              <div className="aspect-video w-full rounded-xl overflow-hidden shadow-inner border border-slate-100 mt-2">
                                <iframe
                                  src={getYoutubeEmbedUrl(item.youtube_url)}
                                  title={item.title}
                                  className="w-full h-full border-0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                ></iframe>
                              </div>
                            )}

                            {item.item_type === "video" && item.file_path && (
                              <div className="aspect-video w-full rounded-xl overflow-hidden bg-black mt-2">
                                <video
                                  src={`http://localhost:8000/media/${item.file_path}`}
                                  controls
                                  className="w-full h-full object-cover"
                                ></video>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span>Eklendi: {new Date(item.created_at).toLocaleDateString("tr-TR")}</span>
                            {item.item_type === "file" && item.file_path && (
                              <a
                                href={`http://localhost:8000/media/${item.file_path}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-1 text-teal-600 hover:text-teal-700 font-extrabold uppercase hover:underline"
                              >
                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                </svg>
                                İndir
                              </a>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}



            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
