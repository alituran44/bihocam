"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { teachersApi, blogPublicApi, homeworksApi, quizzesApi, courseReviewsApi, popcastsApi } from "@/lib/api";
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
  promo_images?: string[] | null;
  promo_video?: string | null;
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

const DISCOUNT_MAP: Record<number, number> = { 4: 0, 12: 10, 24: 15, 36: 20 };

const WEEK_OPTIONS = [
  { weeks: 4,  label: "4 Hafta",  sub: "1 Ay" },
  { weeks: 12, label: "12 Hafta", sub: "3 Ay" },
  { weeks: 24, label: "24 Hafta", sub: "6 Ay" },
  { weeks: 36, label: "36 Hafta", sub: "Eğitim Dönemi" },
];

function calcPackage(hourlyPrice: number, hours: number, weeks: number) {
  const discount = DISCOUNT_MAP[weeks] ?? 0;
  const total = hourlyPrice * hours * weeks * (1 - discount / 100);
  return { total: Math.round(total), discount };
}

export default function TeacherProfilePage() {
  const queryClient = useQueryClient();
  const params = useParams();
  const router = useRouter();
  const teacherId = params.teacherId as string;

  const { isAuthenticated, user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"about" | "courses" | "book" | "blog" | "library" | "homeworks" | "quizzes" | "videos" | "popcasts">("about");

  // Selected date for calendar: "YYYY-MM-DD"
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-01");
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [studentNotes, setStudentNotes] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const getDaysInMonth = (y: number, m: number) => {
    return new Date(y, m, 0).getDate();
  };

  const getFirstDayOffset = (y: number, m: number) => {
    const firstDay = new Date(y, m - 1, 1).getDay(); // 0: Sun, 1: Mon, ...
    return firstDay === 0 ? 6 : firstDay - 1; // Map Sunday to 6, Monday to 0
  };

  const handlePrevMonth = () => {
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear((prev) => prev - 1);
    } else {
      setCurrentMonth((prev) => prev - 1);
    }
    setSelectedSlotId("");
  };

  const handleNextMonth = () => {
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear((prev) => prev + 1);
    } else {
      setCurrentMonth((prev) => prev + 1);
    }
    setSelectedSlotId("");
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const offset = getFirstDayOffset(currentYear, currentMonth);

  const MONTH_NAMES = [
    "Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran",
    "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"
  ];

  const [isFollowing, setIsFollowing] = useState(false);

  // Homework & Quiz course selection
  const [selectedCourseId, setSelectedCourseId] = useState<string>("");

  // Student Homework submission states
  const [activeHomeworkForSubmit, setActiveHomeworkForSubmit] = useState<any | null>(null);
  const [submittingText, setSubmittingText] = useState("");
  const [isSubmittingHomework, setIsSubmittingHomework] = useState(false);

  // New UI & Review states
  const [openAccordions, setOpenAccordions] = useState<Record<string, boolean>>({
    facilities: true,
    whyPrivate: false,
    faq: false
  });
  const [reviewRating, setReviewRating] = useState<number>(5);
  const [reviewTitle, setReviewTitle] = useState<string>("");
  const [reviewComment, setReviewComment] = useState<string>("");
  const [selectedEmoji, setSelectedEmoji] = useState<string>("😍");
  const [selectedHours, setSelectedHours] = useState<number>(4);
  const [selectedWeeks, setSelectedWeeks] = useState<number>(4);

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
    enabled: !!teacherId && (activeTab === "library" || activeTab === "videos"),
  });

  // Fetch teacher's popcasts
  const { data: popcastsData = [], isLoading: popcastsLoading } = useQuery({
    queryKey: ["teacher-popcasts", teacherId],
    queryFn: () => popcastsApi.list({ teacher_id: teacherId }),
    enabled: !!teacherId && activeTab === "popcasts",
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

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: (payload: { rating: number; title?: string; comment?: string }) => {
      const targetCourseId = selectedCourseId || (data?.courses?.[0]?.id);
      if (!targetCourseId) {
        throw new Error("Değerlendirme yapmak için eğitmenin en az bir yayında eğitimi olmalıdır.");
      }
      return courseReviewsApi.create(targetCourseId, payload);
    },
    onSuccess: () => {
      toast.success("Yorumunuz başarıyla gönderildi.");
      setReviewComment("");
      setReviewTitle("");
      queryClient.invalidateQueries({ queryKey: ["teacher", teacherId] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Yorum gönderilirken bir hata oluştu.");
    }
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

  const handleIntroBooking = () => {
    setActiveTab("book");
    setTimeout(() => {
      const element = document.getElementById("live-class-section");
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
      }
    }, 100);
  };

  const handleBuyPackage = () => {
    if (selectedSlotId) {
      router.push(`/checkout?type=package&teacher_id=${teacherId}&weeks=${selectedWeeks}&hours=${selectedHours}&slot_id=${selectedSlotId}`);
    } else {
      setActiveTab("book");
      toast.info("Lütfen takvimden ders saati seçerek paketinizi rezerve edin.");
      setTimeout(() => {
        const element = document.getElementById("live-class-section");
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }, 100);
    }
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
            
            {/* LEFT MAIN CONTENT AREA */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* Teacher Header Card */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 sm:p-8 relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6">
                  <Avatar
                    src={data.teacher.avatar_url}
                    name={data.teacher.full_name}
                    size="xl"
                    className="w-24 h-24 ring-4 ring-slate-50 shadow-md flex-shrink-0"
                  />
                  <div className="space-y-3 text-center sm:text-left flex-1">
                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-2xl font-black text-slate-800 tracking-tight uppercase leading-snug">{data.teacher.full_name}</h2>
                      <span className="w-5 h-5 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm select-none" title="Dogrulanmıs Uzman">✓</span>
                      <span className="text-[10px] font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md uppercase tracking-wider">Premium Egitmen</span>
                    </div>
                    <p className="text-teal-600 font-bold text-sm flex items-center justify-center sm:justify-start gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-teal-500 inline-block animate-pulse" />
                      {data.teacher.expertise_tags?.[0] ? `${data.teacher.expertise_tags[0]} Öğretmeni / Eğitim Koçu` : "Eğitmen"}
                    </p>

                    {/* Badge list */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 text-[11px] font-bold text-slate-500 pt-1">
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-1">📍 Ankara / Çankaya</span>
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-1">🏆 12 Yıl Deneyim</span>
                      <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg flex items-center gap-1">🎓 Ankara Universitesi</span>
                    </div>

                    {/* Status badges */}
                    <div className="flex flex-wrap justify-center sm:justify-start gap-2 pt-2">
                      <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        ⚡ Hızlı cevap veriyor
                      </span>
                      <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        🔥 Son 48 saatte 268 saat ders yaptı
                      </span>
                    </div>
                  </div>
                </div>

                {/* Follower Stats */}
                <div className="flex items-center gap-6 py-4 border-t border-slate-50 w-full mt-6">
                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-base font-black text-slate-800">{isFollowing ? 1 : 0}</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Takipçiler</div>
                  </div>
                  <div className="w-px h-6 bg-slate-100"></div>
                  <div className="flex-1 text-center sm:text-left">
                    <div className="text-base font-black text-slate-800">0</div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Takip edilenler</div>
                  </div>
                  <div className="w-px h-6 bg-slate-100"></div>
                  <div className="flex-[2] flex justify-center sm:justify-end gap-2">
                    <button
                      onClick={() => setIsFollowing(!isFollowing)}
                      className={`px-4 py-2 font-bold rounded-xl text-xs transition-all shadow-sm ${
                        isFollowing 
                          ? "bg-slate-100 hover:bg-slate-200 text-slate-700" 
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-500/10"
                      }`}
                    >
                      {isFollowing ? "Takibi Bırak" : "Takip et"}
                    </button>
                    <Link
                      href={`/dashboard/messages?recipient_id=${data.teacher.id}`}
                      className="w-10 h-10 rounded-xl bg-white hover:bg-slate-50 text-slate-400 hover:text-slate-600 flex items-center justify-center border border-slate-200/60 shadow-sm transition-all flex-shrink-0"
                      title="Mesaj Gönder"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Tabs selection header */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm px-6 py-2 overflow-x-auto">
                <div className="flex border-b border-transparent min-w-[500px] whitespace-nowrap">
                  {[
                    { key: "about", label: "👤 Hakkında" },
                    { key: "courses", label: "📚 Kurslar" },
                    { key: "book", label: "📅 Canlı Ders" },
                    { key: "videos", label: "🎥 Videolar" },
                    { key: "popcasts", label: "🎙️ Popcastler" },
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

              {/* TAB CONTENT: ABOUT */}
              {activeTab === "about" && (
                <div className="space-y-6">
                  
                  {/* Four Counters Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { value: totalStudents, label: "Öğrenci", color: "text-red-500", bg: "bg-red-50", icon: "🎓" },
                      { value: data.courses?.length || 0, label: "Kurslar", color: "text-blue-500", bg: "bg-blue-50", icon: "▶️" },
                      { value: blogPosts.length, label: "Makaleler", color: "text-emerald-500", bg: "bg-emerald-50", icon: "✍️" },
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

                  {/* Main Bio Content */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Öğretmen Hakkında</h3>
                      
                      {/* Structured highlights */}
                      <ul className="space-y-3 text-sm font-semibold text-slate-600">
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-black text-base">✓</span>
                          <span><strong>12 yıllık özel ders tecrübesi</strong> ile binlerce öğrenciyi hedeflerine ulaştırdı.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-black text-base">✓</span>
                          <span><strong>YKS (TYT-AYT) ve LGS hazırlık</strong> alanlarında kendini kanıtlamış özel sınav müfredatı.</span>
                        </li>
                        <li className="flex items-start gap-2">
                          <span className="text-blue-600 font-black text-base">✓</span>
                          <span><strong>Pedagojik yaklaşımla</strong> öğrencilerin ders korkularını aşmasını ve motivasyon kazanmasını sağlar.</span>
                        </li>
                      </ul>

                      <div className="border-t border-slate-50 pt-4">
                        <p className="text-slate-500 text-xs font-semibold leading-relaxed whitespace-pre-wrap">
                          {data.teacher.bio || "Merhaba! Platformumuzun seçkin eğitmenlerinden biri olarak öğrencilerimin hedeflerine ulaşmasında rehberlik ediyorum."}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Collapsible Accordions (Sundugu Imkanlar, Neden Ozel Ders, SSS) */}
                  <div className="space-y-3">
                    {/* Accordion 1 */}
                    <div className="bg-white border border-slate-100 rounded-[1.5rem] shadow-sm overflow-hidden">
                      <button
                        onClick={() => setOpenAccordions(prev => ({ ...prev, facilities: !prev.facilities }))}
                        className="w-full px-6 py-4 flex items-center justify-between font-black text-slate-800 text-sm uppercase tracking-wide bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <span>🎒 Öğretmenin Sunduğu İmkânlar</span>
                        <span>{openAccordions.facilities ? "▲" : "▼"}</span>
                      </button>
                      {openAccordions.facilities && (
                        <div className="p-6 border-t border-slate-100 text-xs font-semibold text-slate-600 space-y-2">
                          <p>• <strong>Zengin Dijital Kaynak Desteği:</strong> Ders dışında çözülmesi için haftalık PDF testler ve soru bankası desteği sağlanır.</p>
                          <p>• <strong>Öğrenci Ödev Takibi:</strong> Platformumuz üzerinden atanan ödevlerin çözümleri ders öncesinde eğitmen tarafından kontrol edilir.</p>
                          <p>• <strong>Haftalık İlerleme Raporu:</strong> Öğrencinin gelişim grafiği düzenli olarak analiz edilerek veli ile paylaşılır.</p>
                        </div>
                      )}
                    </div>

                    {/* Accordion 2 */}
                    <div className="bg-white border border-slate-100 rounded-[1.5rem] shadow-sm overflow-hidden">
                      <button
                        onClick={() => setOpenAccordions(prev => ({ ...prev, whyPrivate: !prev.whyPrivate }))}
                        className="w-full px-6 py-4 flex items-center justify-between font-black text-slate-800 text-sm uppercase tracking-wide bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <span>❓ Neden Özel Ders Almalısınız?</span>
                        <span>{openAccordions.whyPrivate ? "▲" : "▼"}</span>
                      </button>
                      {openAccordions.whyPrivate && (
                        <div className="p-6 border-t border-slate-100 text-xs font-semibold text-slate-600 leading-relaxed">
                          Birebir odaklanma sayesinde sınıf içi dikkat dağınıklığı ortadan kalkar. Öğrencinin anlamadığı konular anında tespit edilerek o bölgelere yoğunlaşılır. Bu sayede öğrenme hızı ve başarı oranı katlanır.
                        </div>
                      )}
                    </div>

                    {/* Accordion 3 */}
                    <div className="bg-white border border-slate-100 rounded-[1.5rem] shadow-sm overflow-hidden">
                      <button
                        onClick={() => setOpenAccordions(prev => ({ ...prev, faq: !prev.faq }))}
                        className="w-full px-6 py-4 flex items-center justify-between font-black text-slate-800 text-sm uppercase tracking-wide bg-slate-50/50 hover:bg-slate-50 transition-colors"
                      >
                        <span>💬 Sıkça Sorulan Sorular</span>
                        <span>{openAccordions.faq ? "▲" : "▼"}</span>
                      </button>
                      {openAccordions.faq && (
                        <div className="p-6 border-t border-slate-100 text-xs font-semibold text-slate-600 space-y-3">
                          <div>
                            <h5 className="font-bold text-slate-800 mb-1">Dersler nasıl işleniyor?</h5>
                            <p className="text-slate-500">Dersler platformumuzun entegre canlı sınıf modülü üzerinden kesintisiz video ve interaktif yazı tahtası eşliğinde işlenmektedir.</p>
                          </div>
                          <div>
                            <h5 className="font-bold text-slate-800 mb-1">Ders saatini erteleyebilir miyim?</h5>
                            <p className="text-slate-500">Evet, planlanan ders saatine en geç 24 saat kala eğitmeninize bildirerek veya sistem üzerinden dersinizi erteleyebilirsiniz.</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Ders Verdigi Konumlar */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Ders Verdiği Konumlar</h3>
                    <div className="flex flex-wrap gap-2 text-xs font-bold text-slate-600">
                      {["Ankara (Çevrimiçi)", "Çankaya", "Yenimahalle", "Etimesgut", "Mamak", "Keçiören"].map((loc, idx) => (
                        <span key={idx} className="px-3.5 py-1.5 bg-slate-50 border border-slate-100 rounded-xl">
                          📍 {loc}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Verdiği Ders ve Saat Ücretleri */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase border-b border-slate-50 pb-3">Verdiği Dersler ve Fiyatlar</h3>
                    <div className="space-y-3 text-xs font-bold text-slate-700">
                      {[
                        { branch: "Matematik Özel Ders / Canlı Canlı", duration: "45 Dakika", price: data.teacher.live_class_price ? `${data.teacher.live_class_price} TL` : "Anlaşmalı" },
                        { branch: "Sınav Koçluğu / Birebir Görüşme", duration: "45 Dakika", price: data.teacher.live_class_price ? `${Math.round(data.teacher.live_class_price * 0.9)} TL` : "Anlaşmalı" },
                        { branch: "Hızlı Soru Çözüm Paketi", duration: "30 Soru", price: "Ücretsiz" },
                      ].map((item, idx) => (
                        <div key={idx} className="flex justify-between items-center p-3.5 bg-slate-50/50 border border-slate-100/50 rounded-2xl">
                          <div className="space-y-0.5">
                            <div className="text-slate-800 font-extrabold">{item.branch}</div>
                            <div className="text-slate-400 text-[10px] font-semibold">{item.duration}</div>
                          </div>
                          <div className="text-blue-600 font-black text-sm">{item.price}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Değerlendirme & Yorumlar */}
                  <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                    <h3 className="text-lg font-black text-slate-800 tracking-tight uppercase">Öğrenci Değerlendirmeleri</h3>
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 pb-6 border-b border-slate-50">
                      <div className="text-center space-y-1">
                        <div className="text-5xl font-black text-slate-800">4.9</div>
                        <div className="text-amber-400 text-lg">★★★★★</div>
                        <div className="text-[10px] text-slate-400 font-bold uppercase">{data.reviews?.length || 0} DEĞERLENDİRME</div>
                      </div>
                      <div className="flex-1 w-full space-y-2">
                        {[
                          { stars: 5, pct: 92 },
                          { stars: 4, pct: 6 },
                          { stars: 3, pct: 2 },
                          { stars: 2, pct: 0 },
                          { stars: 1, pct: 0 },
                        ].map((row, idx) => (
                          <div key={idx} className="flex items-center gap-3 text-xs font-bold text-slate-500">
                            <span className="w-12 text-right">{row.stars} Yıldız</span>
                            <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                              <div className="h-full bg-blue-600" style={{ width: `${row.pct}%` }} />
                            </div>
                            <span className="w-8">%{row.pct}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Reviews List */}
                    <div className="space-y-4 pt-4">
                      {!data.reviews?.length ? (
                        <div className="text-center py-6 text-slate-400 font-bold text-xs bg-slate-50 rounded-2xl">
                          Henüz değerlendirme yapılmamıştır. İlk yorumu siz yapın!
                        </div>
                      ) : (
                        <div className="space-y-4">
                          {data.reviews.map((rev) => (
                            <div key={rev.id} className="bg-slate-50/50 border border-slate-100/50 p-5 rounded-2xl space-y-3">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <Avatar src={rev.user?.avatar_url} name={rev.user?.full_name || "Öğrenci"} size="sm" />
                                  <div>
                                    <div className="text-slate-800 font-black text-xs uppercase">{rev.user?.full_name || "Öğrenci"}</div>
                                    <div className="text-amber-400 text-[10px]">{"★".repeat(rev.rating)}{"☆".repeat(5 - rev.rating)}</div>
                                  </div>
                                </div>
                                <span className="text-[10px] text-slate-400 font-bold">
                                  {new Date(rev.created_at).toLocaleDateString("tr-TR")}
                                </span>
                              </div>
                              <p className="text-slate-600 text-xs font-medium leading-relaxed">{rev.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Write a comment form */}
                    <div className="pt-6 border-t border-slate-50 space-y-4">
                      <h4 className="text-sm font-black text-slate-800 uppercase tracking-wide">
                        {data.teacher.full_name} Hakkındaki Görüşlerinizi Yazın
                      </h4>

                      {/* Emoji reaction selector */}
                      <div className="flex justify-center gap-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                        {[
                          { emoji: "😡", label: "Kötü", val: 1 },
                          { emoji: "😐", label: "Normal", val: 3 },
                          { emoji: "😊", label: "İyi", val: 4 },
                          { emoji: "😍", label: "Harika", val: 5 },
                        ].map((reaction) => {
                          const isSelected = selectedEmoji === reaction.emoji;
                          return (
                            <button
                              key={reaction.emoji}
                              type="button"
                              onClick={() => {
                                setSelectedEmoji(reaction.emoji);
                                setReviewRating(reaction.val);
                              }}
                              className={`text-3xl p-2 rounded-xl transition-all ${
                                isSelected ? "bg-white shadow-md scale-110 border border-slate-100" : "opacity-50 hover:opacity-100"
                              }`}
                              title={reaction.label}
                            >
                              {reaction.emoji}
                            </button>
                          );
                        })}
                      </div>

                      <form onSubmit={(e) => {
                        e.preventDefault();
                        if (!isAuthenticated) {
                          toast.error("Yorum göndermek için lütfen önce giriş yapınız.");
                          return;
                        }
                        reviewMutation.mutate({
                          rating: reviewRating,
                          title: reviewTitle || "Eğitmen Değerlendirmesi",
                          comment: reviewComment
                        });
                      }} className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input
                            type="text"
                            placeholder="Başlık (örn. Mükemmel bir ders tecrübesi)"
                            value={reviewTitle}
                            onChange={(e) => setReviewTitle(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 text-xs font-semibold"
                          />
                          <input
                            type="text"
                            placeholder="Adınız Soyadınız (Giriş yapılmış olmalıdır)"
                            disabled
                            value={user?.full_name || "Giriş Yapılmamış"}
                            className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-xl text-slate-400 text-xs font-semibold"
                          />
                        </div>
                        <textarea
                          placeholder="Eğitmen hakkında görüşlerinizi yazın, ders işleyişini, anlatım dilini vb. değerlendirin..."
                          rows={4}
                          value={reviewComment}
                          onChange={(e) => setReviewComment(e.target.value)}
                          required
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-slate-700 text-xs font-semibold"
                        />
                        <button
                          type="submit"
                          disabled={reviewMutation.isPending}
                          className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-lg transition-colors"
                        >
                          {reviewMutation.isPending ? "Gönderiliyor..." : "Yorumu Gönder"}
                        </button>
                      </form>
                    </div>

                  </div>

                </div>
              )}

              {/* TAB CONTENT: KURSLAR */}
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
                                {Number(course.price) === 0
                                  ? "Ücretsiz"
                                  : course.discount_price
                                  ? `₺${Number(course.discount_price).toFixed(0)}`
                                  : `₺${Number(course.price).toFixed(0)}`}
                              </span>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB CONTENT: CANLI DERS TAKVİMİ */}
              {activeTab === "book" && (
                <div id="live-class-section" className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                  
                  {isAuthenticated && user?.id === teacherId && (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="text-xs font-black text-blue-800 flex items-center gap-1.5">
                          <span>👤</span> KENDİ PROFİLİNİZİ GÖRÜNTÜLÜYORSUNUZ
                        </div>
                        <p className="text-[11px] text-blue-600 font-semibold leading-relaxed">
                          Öğrencilerin sizden ders randevusu alabilmesi için takviminize müsait olduğunuz gün ve saatleri eklemelisiniz.
                        </p>
                      </div>
                      <Link
                        href="/dashboard/teacher/live-classes"
                        className="flex-shrink-0 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm shadow-blue-500/10 transition-all text-center"
                      >
                        Takvime Müsaitlik Ekle
                      </Link>
                    </div>
                  )}

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
                    
                    {/* Left: Calendar view */}
                    <div className="md:col-span-5 bg-slate-50/50 border border-slate-100/50 p-4 rounded-3xl space-y-4">
                      
                      <div className="flex items-center justify-between px-2">
                        <button 
                          onClick={handlePrevMonth}
                          className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 transition-colors"
                        >
                          &lt;
                        </button>
                        <span className="font-extrabold text-slate-800 text-sm">{currentYear} {MONTH_NAMES[currentMonth - 1]}</span>
                        <button 
                          onClick={handleNextMonth}
                          className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 text-xs font-black hover:bg-blue-100 transition-colors"
                        >
                          &gt;
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center">
                        {["Pt", "Sa", "Çr", "Pe", "Cu", "Ct", "Pa"].map((day) => (
                          <span key={day} className="text-[10px] font-black text-slate-400 py-1 uppercase">{day}</span>
                        ))}

                        {[...Array(offset)].map((_, i) => (
                          <span key={`empty-${i}`} className="py-2 text-[10px] text-slate-300 font-bold"></span>
                        ))}

                        {[...Array(daysInMonth)].map((_, i) => {
                          const dayNum = i + 1;
                          const dayStr = dayNum < 10 ? `0${dayNum}` : `${dayNum}`;
                          const monthStr = currentMonth < 10 ? `0${currentMonth}` : `${currentMonth}`;
                          const fullDateStr = `${currentYear}-${monthStr}-${dayStr}`;

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

                    {/* Right: Selected slot form */}
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
                            <div className="text-center py-8 text-slate-400 font-bold text-xs bg-slate-50 rounded-2xl px-4 space-y-4">
                              <p>Bu tarihte tanımlı boş canlı ders saati bulunmamaktadır. Lütfen takvimden yeşil renkli tarihleri seçiniz.</p>
                              {isAuthenticated && user?.id === teacherId && (
                                <div className="border-t border-slate-200/50 pt-4 space-y-2">
                                  <p className="text-blue-600 font-extrabold text-[10px] uppercase tracking-wide">Eğitmen İpucu</p>
                                  <p className="text-slate-500 font-medium text-[11px] leading-relaxed">
                                    Bu güne ders saati ekleyerek öğrencilerin rezervasyon yapmasını sağlayabilirsiniz.
                                  </p>
                                  <Link
                                    href="/dashboard/teacher/live-classes"
                                    className="inline-flex px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] font-black uppercase tracking-wider shadow-sm transition-all"
                                  >
                                    Bu Güne Saat Ekle
                                  </Link>
                                </div>
                              )}
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

              {/* TAB CONTENT: VİDEOLAR */}
              {activeTab === "videos" && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-5">🎥 Öğretmenin Tanıtım ve Ders Videoları</h3>

                  {/* Promo Video */}
                  {data.teacher.promo_video && (
                    <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-teal-50 text-teal-700 border border-teal-100">
                        🎬 Tanıtım Videosu
                      </span>
                      <h4 className="font-bold text-slate-800">{data.teacher.full_name} Tanıtım Videosu</h4>
                      <div className="aspect-video w-full rounded-xl overflow-hidden bg-black shadow-inner border border-slate-200">
                        {data.teacher.promo_video.includes("youtube.com") || data.teacher.promo_video.includes("youtu.be") ? (
                          <iframe
                            src={getYoutubeEmbedUrl(data.teacher.promo_video)}
                            title="Tanıtım Videosu"
                            className="w-full h-full border-0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                          ></iframe>
                        ) : (
                          <video
                            src={`http://localhost:8000/media/${data.teacher.promo_video}`}
                            controls
                            className="w-full h-full object-cover"
                          ></video>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Library Video & Youtube Items */}
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-800 tracking-tight mb-4">Ders ve Hazırlık Videoları</h4>
                    
                    {libraryLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                    ) : libraryItems.filter(item => item.item_type === "video" || item.item_type === "youtube").length === 0 ? (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl">
                        <p className="text-slate-400 font-bold text-sm">Eğitmen henüz ders videosu eklememiştir.</p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {libraryItems.filter(item => item.item_type === "video" || item.item_type === "youtube").map((item) => (
                          <div
                            key={item.id}
                            className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
                          >
                            <div className="space-y-3">
                              <span
                                className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase ${
                                  item.item_type === "video"
                                    ? "bg-purple-50 text-purple-700 border border-purple-100"
                                    : "bg-red-50 text-red-700 border border-red-100"
                                }`}
                              >
                                {item.item_type === "video" ? "🎥 Video" : "🔗 YouTube"}
                              </span>

                              <h4 className="font-bold text-slate-800 line-clamp-1">{item.title}</h4>
                              {item.description && (
                                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                                  {item.description}
                                </p>
                              )}

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

                            <div className="mt-4 pt-3 border-t border-slate-50 text-[10px] text-slate-400 font-bold">
                              <span>Eklendi: {new Date(item.created_at).toLocaleDateString("tr-TR")}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* TAB CONTENT: POPCASTLER */}
              {activeTab === "popcasts" && (
                <div className="bg-white rounded-[2rem] border border-slate-100 p-6 sm:p-8 shadow-sm space-y-6">
                  <h3 className="text-xl font-bold text-slate-800 tracking-tight mb-5">🎙️ Öğretmenin Popcast Yayınları</h3>

                  {popcastsLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : popcastsData.length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                      <p className="text-slate-400 font-bold text-sm">Eğitmen henüz podcast yayını eklememiştir.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {popcastsData.map((popcast: any) => (
                        <div
                          key={popcast.id}
                          className="bg-white border border-slate-100 rounded-2xl p-5 hover:shadow-md transition-all flex flex-col justify-between"
                        >
                          <div className="space-y-3">
                            <div className="flex gap-4">
                              {popcast.cover_image_url ? (
                                <img
                                  src={`http://localhost:8000${popcast.cover_image_url}`}
                                  alt={popcast.title}
                                  className="w-16 h-16 rounded-xl object-cover border border-slate-100 flex-shrink-0"
                                />
                              ) : (
                                <div className="w-16 h-16 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center text-3xl flex-shrink-0">
                                  🎙️
                                </div>
                              )}
                              <div>
                                <h4 className="font-bold text-slate-800 line-clamp-1">{popcast.title}</h4>
                                <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mt-1">
                                  {popcast.description || "Açıklama bulunmuyor."}
                                </p>
                              </div>
                            </div>

                            {popcast.audio_url && (
                              <div className="pt-2">
                                <audio
                                  src={`http://localhost:8000${popcast.audio_url}`}
                                  controls
                                  className="w-full mt-2"
                                ></audio>
                              </div>
                            )}
                          </div>

                          <div className="mt-4 pt-3 border-t border-slate-50 flex items-center justify-between text-[10px] text-slate-400 font-bold">
                            <span>Süre: {Math.round(popcast.duration / 60)} dk</span>
                            <span>Yayınlanma: {new Date(popcast.created_at).toLocaleDateString("tr-TR")}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* RIGHT STICKY SIDEBAR */}
            <div className="lg:col-span-4 space-y-6 sticky top-24">
              
              {/* Promo Video Card */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-4 relative overflow-hidden">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-100 shadow-inner flex items-center justify-center">
                  {data.teacher.promo_video ? (
                    data.teacher.promo_video.includes("youtube.com") || data.teacher.promo_video.includes("youtu.be") ? (
                      <iframe
                        src={`https://www.youtube.com/embed/${
                          data.teacher.promo_video.includes("youtu.be/")
                            ? data.teacher.promo_video.split("youtu.be/")[1]?.split("?")[0]
                            : data.teacher.promo_video.split("v=")[1]?.split("&")[0]
                        }`}
                        className="w-full h-full border-0"
                        allowFullScreen
                      />
                    ) : (
                      <video
                        src={`http://localhost:8000/media/${data.teacher.promo_video}`}
                        controls
                        className="w-full h-full object-cover"
                      />
                    )
                  ) : (
                    /* Video placeholder with custom overlay */
                    <div className="text-center space-y-2 p-6">
                      <div className="w-12 h-12 rounded-full bg-orange-500 text-white flex items-center justify-center text-xl mx-auto shadow-lg shadow-orange-500/20 cursor-pointer animate-pulse">
                        ▶
                      </div>
                      <div className="text-xs text-slate-300 font-bold">Tanıtım Videosu</div>
                      <div className="text-[10px] text-slate-400">Eğitmen tarafından hazırlanıyor</div>
                    </div>
                  )}
                </div>
              </div>

              {/* Pricing & Booking Card */}
              <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm p-6 space-y-5">
                <div className="flex justify-between items-baseline border-b border-slate-50 pb-4">
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest block leading-none">Ders Ücreti</span>
                    <span className="text-3xl font-black text-slate-800 leading-none">
                      {data.teacher.live_class_price ? `${data.teacher.live_class_price} TL` : "Anlaşmalı"}
                    </span>
                    <span className="text-[10px] font-bold text-slate-400">/ 45 Dakika</span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-bold text-slate-700 flex items-center gap-1 justify-end">⭐ 4.9</span>
                    <span className="text-[10px] text-slate-400 font-bold">{data.reviews?.length || 0} Değerlendirme</span>
                  </div>
                </div>

                {/* Package selector inside the sidebar */}
                {data.teacher.live_class_price && (
                  <div className="space-y-4">
                    {/* Hour slider input */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Haftalık Saat</label>
                        <span className="text-blue-600 font-black text-xs">{selectedHours} Saat</span>
                      </div>
                      <input 
                        type="range" 
                        min={1} 
                        max={10} 
                        value={selectedHours}
                        onChange={(e) => setSelectedHours(parseInt(e.target.value))}
                        className="w-full h-1.5 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                      />
                    </div>

                    {/* Weeks options button cards */}
                    <div className="space-y-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Paketler & İndirimler</label>
                      {WEEK_OPTIONS.map((opt) => {
                        const disc = DISCOUNT_MAP[opt.weeks];
                        const active = selectedWeeks === opt.weeks;
                        const packageCost = calcPackage(data.teacher.live_class_price || 0, selectedHours, opt.weeks);

                        return (
                          <button
                            key={opt.weeks}
                            type="button"
                            onClick={() => setSelectedWeeks(opt.weeks)}
                            className={`w-full flex items-center justify-between p-3.5 rounded-2xl border-2 transition-all text-left ${
                              active 
                                ? "border-blue-600 bg-gradient-to-r from-blue-50/50 to-white shadow-sm" 
                                : "border-slate-100 bg-white hover:border-slate-200"
                            }`}
                          >
                            <div className="space-y-0.5">
                              <div className={`text-xs font-black ${active ? "text-blue-700" : "text-slate-700"}`}>
                                {opt.label} <span className="font-semibold text-slate-400">({opt.sub})</span>
                              </div>
                              {disc > 0 && <span className="inline-block text-[9px] font-black text-rose-500 bg-rose-50 px-1.5 py-px rounded-md">%{disc} indirim</span>}
                            </div>
                            <div className="text-right">
                              <div className={`text-xs font-black ${active ? "text-blue-700" : "text-slate-700"}`}>
                                {packageCost.total.toLocaleString("tr-TR")} TL
                              </div>
                              <div className="text-[9px] text-slate-400 leading-none mt-0.5">
                                ~{Math.round(packageCost.total / 6).toLocaleString("tr-TR")} TL/ay
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* CTA Action Buttons */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={handleIntroBooking}
                    className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs rounded-2xl shadow-lg shadow-blue-500/10 hover:shadow-blue-500/20 transform hover:-translate-y-0.5 transition-all text-center uppercase tracking-wider"
                  >
                    BİREBİR TANITIM ALIN
                  </button>
                  <button
                    onClick={handleBuyPackage}
                    className="w-full py-4 bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-xs rounded-2xl hover:shadow-lg transition-all text-center uppercase tracking-wider"
                  >
                    DERS PAKETİ SATIN AL
                  </button>
                </div>

                {/* Trust Badges */}
                <div className="pt-3 border-t border-slate-50 space-y-2 text-[10px] font-bold text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500">🛡️</span>
                    <span>Satın alma ve ders güvencesi</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-emerald-500">💳</span>
                    <span>Kredi kartı ile 12 taksit seçeneği</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
