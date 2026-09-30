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
  face_to_face_price?: number | null;
  group_lesson_prices?: Array<{
    tier_id: string;
    title: string;
    min_students: number;
    max_students: number;
    price_per_student: number;
    discount_price?: number | null;
    is_active: boolean;
  }> | null;
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
  { weeks: 4, label: "4 Hafta", sub: "1 Ay" },
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
  const [activeTab, setActiveTab] = useState<
    "about" | "courses" | "book" | "blog" | "library" | "homeworks" | "quizzes" | "videos" | "popcasts" | "reviews"
  >("about");

  // Selected date for calendar: "YYYY-MM-DD"
  const [selectedDate, setSelectedDate] = useState<string>("2026-07-01");
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(7);
  const [selectedSlotId, setSelectedSlotId] = useState<string>("");
  const [lessonFormat, setLessonFormat] = useState<"online" | "face_to_face">("online");
  const [lessonMode, setLessonMode] = useState<"individual" | "group">("individual");
  const [selectedGroupTierId, setSelectedGroupTierId] = useState<string>("");
  const [studentNotes, setStudentNotes] = useState<string>("");
  const [bookingSuccess, setBookingSuccess] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const getDaysInMonth = (y: number, m: number) => new Date(y, m, 0).getDate();

  const getFirstDayOffset = (y: number, m: number) => {
    const firstDay = new Date(y, m - 1, 1).getDay();
    return firstDay === 0 ? 6 : firstDay - 1;
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

  // Accordion states
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
      } else if (hash === "#reviews") {
        setActiveTab("reviews");
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

  // Automatically select first active group tier when loaded
  useEffect(() => {
    if (data?.teacher?.group_lesson_prices && data.teacher.group_lesson_prices.length > 0 && !selectedGroupTierId) {
      const active = data.teacher.group_lesson_prices.filter((t) => t.is_active);
      if (active.length > 0) {
        setSelectedGroupTierId(active[0].tier_id);
      }
    }
  }, [data, selectedGroupTierId]);

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
    mutationFn: (payload: {
      availability_id: string;
      lesson_type?: "online" | "face_to_face";
      lesson_mode?: "individual" | "group";
      group_size?: number;
      group_tier_id?: string;
      student_notes?: string;
    }) => teachersApi.bookLiveClass(teacherId, payload),
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
      const targetCourseId = selectedCourseId || data?.courses?.[0]?.id;
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

    if (lessonMode === "group") {
      const activeTiers = data?.teacher?.group_lesson_prices?.filter((t) => t.is_active) || [];
      const selectedTier = activeTiers.find((t) => t.tier_id === selectedGroupTierId) || activeTiers[0];
      if (!selectedTier) {
        setBookingError("Lütfen bir grup dersi kademesi seçiniz.");
        return;
      }
      bookMutation.mutate({
        availability_id: selectedSlotId,
        lesson_type: lessonFormat,
        lesson_mode: "group",
        group_size: selectedTier.max_students,
        group_tier_id: selectedTier.tier_id,
        student_notes: studentNotes,
      });
    } else {
      bookMutation.mutate({
        availability_id: selectedSlotId,
        lesson_type: lessonFormat,
        lesson_mode: "individual",
        student_notes: studentNotes,
      });
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Eğitmen profil bağlantısı kopyalandı!");
    }
  };

  const handleToggleFollow = () => {
    setIsFollowing((prev) => {
      const next = !prev;
      if (next) {
        toast.success(`${data?.teacher.full_name || "Eğitmen"} takip ediliyor.`);
      } else {
        toast.info("Takip bırakıldı.");
      }
      return next;
    });
  };

  const totalStudents = data?.courses ? (parseInt(data.teacher.id.slice(0, 2), 16) || 12) * 5 + 4 : 55;
  const slotsForSelectedDate = slots?.filter((s) => s.date === selectedDate) || [];

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
    <div className="min-h-screen bg-[#FDFBF9] text-slate-800">
      <Header />

      <main className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16 relative z-20">
        {/* Breadcrumb Navigation */}
        <nav aria-label="Breadcrumb" className="flex items-center gap-x-2 text-xs font-semibold text-slate-400 mb-6">
          <Link href="/" className="hover:text-slate-700 transition-colors flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
              <path d="M5 12l-2 0l9 -9l9 9l-2 0"></path>
              <path d="M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2 -2v-7"></path>
              <path d="M9 21v-6a2 2 0 0 1 2 -2h2a2 2 0 0 1 2 2v6"></path>
            </svg>
            Ana Sayfa
          </Link>
          <span>/</span>
          <Link href="/teachers" className="hover:text-slate-700 transition-colors">Eğitmenler</Link>
          <span>/</span>
          <span className="text-slate-800 font-bold">{data?.teacher?.full_name || "Eğitmen Profili"}</span>
        </nav>

        {isLoading ? (
          <div className="flex items-center justify-center py-28">
            <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error || !data ? (
          <div className="bg-white rounded-3xl p-16 text-center border border-slate-200/80 shadow-sm max-w-xl mx-auto my-12">
            <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto text-2xl mb-4 font-bold">!</div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Eğitmen Bulunamadı</h2>
            <p className="text-slate-500 font-medium mb-6">Aradığınız eğitmen platformda mevcut değil veya aktif değil.</p>
            <Link href="/teachers" className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-xl font-bold shadow-md transition-all">
              Eğitmen Listesine Dön
            </Link>
          </div>
        ) : (
          <>
            {/* ============================================================ */}
            {/* ANIQ UI INSTRUCTOR HERO CARD (Pixel-Perfect Blended)         */}
            {/* ============================================================ */}
            <div className="relative mb-8 overflow-hidden rounded-[2.5rem] bg-white border border-slate-100 shadow-sm">
              {/* Background ambient decorative shapes & radial dot matrix */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 hidden overflow-hidden lg:block">
                <span className="absolute top-[23%] end-[8%] h-28 w-28 rounded-full bg-orange-500/[0.08]" />
                <span className="absolute top-[6.5rem] end-6 h-[4.75rem] w-[4.75rem] text-orange-500/80 [background-image:radial-gradient(circle,currentColor_2.5px,transparent_2.5px)] [background-size:20px_20px]" />
                <span className="absolute -bottom-[22rem] -end-[27.5rem] h-[40rem] w-[40rem] rounded-full border border-orange-500/20" />
                <span className="absolute -bottom-[24rem] -end-[31rem] h-[46rem] w-[46rem] rounded-full border border-orange-500/10" />
              </div>

              <div className="relative grid gap-0 lg:grid-cols-[minmax(0,27rem)_minmax(0,1fr)]">
                {/* LEFT COLUMN: Dark Navy Slab, Portrait, Award Ribbon, Top Instructor Chip */}
                <div className="relative flex flex-col items-center justify-between overflow-hidden bg-[#0c1322] p-6 sm:p-8 lg:bg-[#0c1322] lg:py-16 lg:px-10">
                  {/* Decorative curved SVG border visible on large screens */}
                  <svg viewBox="0 0 400 700" preserveAspectRatio="none" aria-hidden="true" className="pointer-events-none absolute inset-0 hidden h-full w-full text-[#0c1322] lg:block">
                    <path d="M0 0 H400 C400 95 336 170 334 280 C332 420 390 560 396 700 H0 Z" fill="currentColor" />
                  </svg>
                  
                  {/* Decorative light dot grid & circle accents inside dark slab */}
                  <span aria-hidden="true" className="pointer-events-none absolute top-8 start-6 h-20 w-36 text-white/20 [background-image:radial-gradient(circle,currentColor_2px,transparent_2px)] [background-size:18px_18px]" />
                  <span aria-hidden="true" className="pointer-events-none absolute top-[26%] start-[3.5rem] h-6 w-6 rounded-full border border-white/20" />
                  <span aria-hidden="true" className="pointer-events-none absolute top-[43%] start-6 h-[5.75rem] w-2 text-orange-500 [background-image:radial-gradient(circle,currentColor_3.5px,transparent_3.5px)] [background-size:8px_22px]" />
                  <span aria-hidden="true" className="pointer-events-none absolute -bottom-40 -start-24 h-80 w-80 rounded-full border border-white/10" />

                  {/* Instructor Portrait Image Frame */}
                  <div className="relative mx-auto w-full max-w-[16.5rem]">
                    <div className="relative aspect-square w-full overflow-hidden rounded-3xl bg-slate-900 ring-4 ring-white/10 shadow-2xl">
                      {data.teacher.avatar_url ? (
                        <img
                          src={data.teacher.avatar_url}
                          alt={data.teacher.full_name}
                          className="h-full w-full object-cover object-top"
                        />
                      ) : (
                        <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900 text-white font-black text-6xl">
                          {data.teacher.full_name?.charAt(0) || "E"}
                        </div>
                      )}
                    </div>

                    {/* Verified Award Rosette Badge pinned at bottom-right of avatar */}
                    <span
                      aria-hidden="true"
                      className="absolute -bottom-4 -right-3 grid h-14 w-14 place-items-center rounded-full bg-white shadow-[0_10px_26px_-10px_rgba(17,24,39,0.5)] border border-slate-100"
                      title="Doğrulanmış Uzman Eğitmen"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-orange-600">
                        <path d="M6 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" />
                        <path d="M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889" />
                        <path d="M6.802 12l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889" />
                      </svg>
                    </span>
                  </div>

                  {/* "Top Instructor" Floating Chip Card */}
                  <div className="relative mt-8 flex w-full max-w-[17rem] items-center gap-3 rounded-2xl bg-[#FFF1EC] p-3.5 shadow-md">
                    <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-orange-600 shadow-sm">
                      <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-5 w-5 text-white">
                        <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                      </svg>
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-bold text-slate-900 leading-tight">En İyi Eğitmen</span>
                      <span className="block text-[11px] text-slate-600/90 leading-tight mt-0.5">Binlerce öğrenci tarafından güvenilen</span>
                    </span>
                  </div>
                </div>

                {/* RIGHT COLUMN: Name, Subtitle, Bio, Skill Pills, Action Buttons, and 4 Stat Cards */}
                <div className="p-6 sm:p-8 lg:p-10 flex flex-col justify-between">
                  <div>
                    {/* Top Action Bar: [Takip Et] [Mesaj] [Paylaş] + [Canlı Ders Al] */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                          Hızlı Yanıt Veriyor
                        </span>
                        <span className="px-3 py-1 bg-orange-50 text-orange-700 border border-orange-100 rounded-full text-[11px] font-black uppercase tracking-wider">
                          BiHocam Onaylı
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
                        <button
                          type="button"
                          onClick={handleToggleFollow}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-200 hover:bg-slate-800 shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                            <path d="M16 19h6" />
                            <path d="M19 16v6" />
                            <path d="M6 21v-2a4 4 0 0 1 4 -4h4" />
                          </svg>
                          {isFollowing ? "Takibi Bırak" : "Takip Et"}
                        </button>

                        <Link
                          href={`/dashboard/messages?recipient_id=${data.teacher.id}`}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-orange-500 hover:text-orange-600 shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M8 9h8" />
                            <path d="M8 13h6" />
                            <path d="M9 18h-3a3 3 0 0 1 -3 -3v-8a3 3 0 0 1 3 -3h12a3 3 0 0 1 3 3v8a3 3 0 0 1 -3 3h-3l-3 3l-3 -3" />
                          </svg>
                          Mesaj
                        </Link>

                        <button
                          type="button"
                          onClick={handleShare}
                          className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-colors duration-200 hover:border-orange-500 hover:text-orange-600 shadow-sm"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M13 4v4c-6.575 1.028 -9.02 6.788 -10 12c-.037 .206 5.384 -5.962 10 -6v4l8 -7l-8 -7" />
                          </svg>
                          Paylaş
                        </button>
                      </div>
                    </div>

                    {/* Teacher Full Name + Rosette Check Badge */}
                    <h1 className="mt-2 flex flex-wrap items-center gap-3 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
                      {data.teacher.full_name}
                      <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-7 w-7 text-orange-600 sm:h-8 sm:w-8" aria-label="Doğrulanmış Eğitmen">
                        <path d="M12.01 2.011a3.2 3.2 0 0 1 2.113 .797l.154 .145l.698 .698a1.2 1.2 0 0 0 .71 .341l.135 .008h1a3.2 3.2 0 0 1 3.195 3.018l.005 .182v1c0 .27 .092 .533 .258 .743l.09 .1l.697 .698a3.2 3.2 0 0 1 .147 4.382l-.145 .154l-.698 .698a1.2 1.2 0 0 0 -.341 .71l-.008 .135v1a3.2 3.2 0 0 1 -3.018 3.195l-.182 .005h-1a1.2 1.2 0 0 0 -.743 .258l-.1 .09l-.698 .697a3.2 3.2 0 0 1 -4.382 .147l-.154 -.145l-.698 -.698a1.2 1.2 0 0 0 -.71 -.341l-.135 -.008h-1a3.2 3.2 0 0 1 -3.195 -3.018l-.005 -.182v-1a1.2 1.2 0 0 0 -.258 -.743l-.09 -.1l-.697 -.698a3.2 3.2 0 0 1 -.147 -4.382l.145 -.154l.698 -.698a1.2 1.2 0 0 0 .341 -.71l.008 -.135v-1l.005 -.182a3.2 3.2 0 0 1 3.013 -3.013l.182 -.005h1a1.2 1.2 0 0 0 .743 -.258l.1 -.09l.698 -.697a3.2 3.2 0 0 1 2.269 -.944zm3.697 7.282a1 1 0 0 0 -1.414 0l-3.293 3.292l-1.293 -1.292l-.094 -.083a1 1 0 0 0 -1.32 1.497l2 2l.094 .083a1 1 0 0 0 1.32 -.083l4 -4l.083 -.094a1 1 0 0 0 -.083 -1.32z" />
                      </svg>
                    </h1>

                    {/* Teacher Title / Expertise in Coral */}
                    <p className="mt-2 text-lg sm:text-xl font-bold text-orange-600">
                      {data.teacher.expertise_tags?.[0] ? `${data.teacher.expertise_tags[0]} Öğretmeni / Kıdemli Eğitmen` : "Kıdemli Branş Öğretmeni"}
                    </p>

                    {/* Short Teacher Bio Excerpt */}
                    <p className="mt-3 max-w-2xl text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
                      {data.teacher.bio ? (data.teacher.bio.length > 200 ? data.teacher.bio.slice(0, 200) + "..." : data.teacher.bio) : "BiHocam platformunda öğrencilerinin hedeflerine ulaşmasında rehberlik eden, kanıtlanmış pedagojik yöntemlerle ders veren uzman öğretmen."}
                    </p>

                    {/* Skill Pills */}
                    <div className="mt-5 flex flex-wrap gap-2">
                      {(data.teacher.expertise_tags && data.teacher.expertise_tags.length > 0
                        ? data.teacher.expertise_tags
                        : ["Birebir Canlı Ders", "YKS Hazırlık", "LGS Soru Çözümü", "Konu Anlatımı", "Sınav Koçluğu"]
                      ).map((skill, idx) => (
                        <span
                          key={idx}
                          className="inline-flex items-center rounded-full border border-slate-200/80 bg-white px-4 py-1.5 text-xs font-semibold text-slate-700 shadow-2xs hover:border-orange-300 transition-colors"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* 4 STAT BENTO CARDS (Exact Pastel Tints + Giant Watermark SVGs) */}
                  <div className="mt-7 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
                    {/* Card 1: Rating */}
                    <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-start bg-[#FFF6F4] border border-[#FDE4DE]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute -end-6 top-[55%] h-28 w-28 -translate-y-1/2 opacity-[0.08] text-[#FF6A3D]" aria-hidden="true">
                        <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" />
                      </svg>
                      <div className="relative">
                        <span className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-orange-500/15">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-orange-600">
                            <path d="M12 17.75l-6.172 3.245l1.179 -6.873l-5 -4.867l6.9 -1l3.086 -6.253l3.086 6.253l6.9 1l-5 4.867l1.179 6.873l-6.158 -3.245" />
                          </svg>
                        </span>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Değerlendirme</p>
                        <div className="mt-1 flex items-baseline gap-1 text-2xl font-black text-slate-900">
                          4.9
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none" className="h-4 w-4 text-amber-500">
                            <path d="M8.243 7.34l-6.38 .925l-.113 .023a1 1 0 0 0 -.44 1.684l4.622 4.499l-1.09 6.355l-.013 .11a1 1 0 0 0 1.464 .944l5.706 -3l5.693 3l.1 .046a1 1 0 0 0 1.352 -1.1l-1.091 -6.355l4.624 -4.5l.078 -.085a1 1 0 0 0 -.633 -1.62l-6.38 -.926l-2.852 -5.78a1 1 0 0 0 -1.794 0l-2.853 5.78z" />
                          </svg>
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-500">{data.reviews?.length || 35} Yorum</p>
                      </div>
                    </div>

                    {/* Card 2: Courses */}
                    <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-start bg-[#F0F9FF] border border-[#E0F2FE]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute -end-6 top-[55%] h-28 w-28 -translate-y-1/2 opacity-[0.08] text-[#3B82F6]" aria-hidden="true">
                        <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                        <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                        <path d="M3 6l0 13" />
                        <path d="M12 6l0 13" />
                        <path d="M21 6l0 13" />
                      </svg>
                      <div className="relative">
                        <span className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-blue-500/15">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-blue-600">
                            <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                            <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                            <path d="M3 6l0 13" />
                            <path d="M12 6l0 13" />
                            <path d="M21 6l0 13" />
                          </svg>
                        </span>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Kurslar</p>
                        <div className="mt-1 text-2xl font-black text-slate-900">
                          {data.courses?.length || 1}
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-500">Yayınlandı</p>
                      </div>
                    </div>

                    {/* Card 3: Experience */}
                    <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-start bg-[#F0FDF4] border border-[#DCFCE7]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute -end-6 top-[55%] h-28 w-28 -translate-y-1/2 opacity-[0.08] text-[#16A34A]" aria-hidden="true">
                        <path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" />
                        <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
                        <path d="M12 12l0 .01" />
                        <path d="M3 13a20 20 0 0 0 18 0" />
                      </svg>
                      <div className="relative">
                        <span className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-emerald-500/15">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-emerald-600">
                            <path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" />
                            <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
                            <path d="M12 12l0 .01" />
                            <path d="M3 13a20 20 0 0 0 18 0" />
                          </svg>
                        </span>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Deneyim</p>
                        <div className="mt-1 text-2xl font-black text-slate-900">
                          10+ yıl
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-500">Öğretim & Koçluk</p>
                      </div>
                    </div>

                    {/* Card 4: Students */}
                    <div className="relative overflow-hidden rounded-2xl p-4 sm:p-5 text-start bg-[#FAF5FF] border border-[#F3E8FF]">
                      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="pointer-events-none absolute -end-6 top-[55%] h-28 w-28 -translate-y-1/2 opacity-[0.08] text-[#8B5CF6]" aria-hidden="true">
                        <path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                        <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                      </svg>
                      <div className="relative">
                        <span className="mb-4 grid h-10 w-10 place-items-center rounded-full bg-purple-500/15">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5 text-purple-600">
                            <path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                            <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                            <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                          </svg>
                        </span>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Öğrenciler</p>
                        <div className="mt-1 text-2xl font-black text-slate-900">
                          {totalStudents}
                        </div>
                        <p className="mt-1 text-xs font-semibold text-slate-500">Kayıtlı Öğrenci</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================ */}
            {/* TABS NAVIGATION BAR (Harmanlama)                              */}
            {/* ============================================================ */}
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-2 mb-8 overflow-x-auto">
              <div className="flex items-center gap-1.5 min-w-max">
                {[
                  { key: "about", label: "Hakkında & Deneyim", icon: "👤" },
                  { key: "book", label: "Canlı Ders Rezervasyonu", icon: "📅", badge: "Hızlı Randevu" },
                  { key: "courses", label: `Kurslar (${data.courses?.length || 0})`, icon: "📚" },
                  { key: "videos", label: "Videolar & Tanıtım", icon: "🎥" },
                  { key: "popcasts", label: "Popcastler", icon: "🎙️" },
                  { key: "blog", label: "Blog Yazıları", icon: "✍️" },
                  { key: "library", label: "Kütüphane", icon: "📁" },
                  { key: "reviews", label: `Yorumlar (${data.reviews?.length || 0})`, icon: "⭐" },
                ].map((tab) => (
                  <button
                    key={tab.key}
                    onClick={() => setActiveTab(tab.key as any)}
                    className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                      activeTab === tab.key
                        ? "bg-slate-900 text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-50"
                    }`}
                  >
                    <span>{tab.icon}</span>
                    <span>{tab.label}</span>
                    {tab.badge && (
                      <span className={`px-1.5 py-0.5 text-[9px] rounded-full font-black ${
                        activeTab === tab.key ? "bg-orange-500 text-white" : "bg-orange-100 text-orange-700"
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* ============================================================ */}
            {/* TAB CONTENT 1: HAKKINDA & DENEYİM (ANIQ UI 2-COLUMN HARMONY)  */}
            {/* ============================================================ */}
            {activeTab === "about" && (
              <div className="space-y-8">
                {/* 2-Column Aniq UI Section: Left "Hakkında", Right "Deneyim" */}
                <section className="rounded-[2.5rem] bg-white border border-slate-100 shadow-sm p-6 sm:p-8 lg:px-10 lg:py-12">
                  <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)] lg:gap-12">
                    {/* LEFT COLUMN: ABOUT ("Hakkında") */}
                    <div>
                      {/* Section Heading with Peach Icon + Underline */}
                      <div className="flex items-center gap-4">
                        <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-orange-500/15 sm:h-16 sm:w-16">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-orange-600">
                            <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                            <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                          </svg>
                        </span>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">Hakkında</h2>
                          <span aria-hidden="true" className="mt-2 block h-1 w-12 rounded-full bg-orange-600 sm:w-14" />
                        </div>
                      </div>

                      {/* Bio Blocks in Soft Peach Tints */}
                      <div className="mt-7 space-y-4 sm:mt-8">
                        <div className="rounded-2xl bg-[#FFF6F4]/60 border border-[#FDE4DE]/70 p-5 sm:p-6">
                          <p className="text-sm sm:text-base leading-[1.8] text-slate-700 font-normal">
                            {data.teacher.bio ||
                              `${data.teacher.full_name}, eğitim ve öğretim süreçlerinde her öğrencinin potansiyelini en üst seviyeye çıkarmaya odaklanan deneyimli bir eğitmendir. Konu anlatımlarını ezberden uzak, mantık temelli ve yeni nesil sınav sorularıyla destekleyerek kalıcı öğrenme sağlar.`}
                          </p>
                        </div>

                        <div className="rounded-2xl bg-[#FFF6F4]/60 border border-[#FDE4DE]/70 p-5 sm:p-6">
                          <p className="text-sm sm:text-base leading-[1.8] text-slate-700 font-normal">
                            Dersleri şu sırayla işliyor: Önce öğrencinin eksik olduğu temel kazanımlar tespit edilir, ardından görsel ve interaktif materyallerle konunun mantığı oturtulur. Son aşamada ise çıkmış sınav soruları ve yeni nesil soru tipleri üzerinde yoğunlaşarak öğrencinin hız ve güven kazanması sağlanır.
                          </p>
                        </div>

                        {/* 3 Figures Highlight Box (Years of Impact, Learners Taught, Courses) */}
                        <ul className="grid grid-cols-1 rounded-2xl bg-[#FFF6F4]/60 border border-[#FDE4DE]/70 p-4 sm:grid-cols-3 sm:p-6 gap-y-6 sm:gap-y-0">
                          <li className="px-2 text-center sm:px-4">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-8 w-8 text-orange-600" aria-hidden="true">
                              <path d="M6 9a6 6 0 1 0 12 0a6 6 0 1 0 -12 0" />
                              <path d="M12 15l3.4 5.89l1.598 -3.233l3.598 .232l-3.4 -5.889" />
                              <path d="M6.802 12l-3.4 5.89l3.598 -.233l1.598 3.232l3.4 -5.889" />
                            </svg>
                            <p className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">10+</p>
                            <p className="mt-1 text-xs font-bold text-slate-600 uppercase">Yılların Etkisi</p>
                            <span aria-hidden="true" className="my-3 block h-px w-full bg-orange-200/60" />
                            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">Binlerce öğrenciyi hayallerindeki bölümlere ulaştıran tecrübe.</p>
                          </li>

                          <li className="px-2 text-center sm:px-4 border-t sm:border-t-0 sm:border-l border-orange-200/60 pt-4 sm:pt-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-8 w-8 text-orange-600" aria-hidden="true">
                              <path d="M5 7a4 4 0 1 0 8 0a4 4 0 1 0 -8 0" />
                              <path d="M3 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                              <path d="M21 21v-2a4 4 0 0 0 -3 -3.85" />
                            </svg>
                            <p className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">125K</p>
                            <p className="mt-1 text-xs font-bold text-slate-600 uppercase">Öğretilen Öğrenciler</p>
                            <span aria-hidden="true" className="my-3 block h-px w-full bg-orange-200/60" />
                            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">Birebir özel ders ve grup sınıflarında sayısız başarılı mezun.</p>
                          </li>

                          <li className="px-2 text-center sm:px-4 border-t sm:border-t-0 sm:border-l border-orange-200/60 pt-4 sm:pt-0">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mx-auto h-8 w-8 text-orange-600" aria-hidden="true">
                              <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                              <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                              <path d="M3 6l0 13" />
                              <path d="M12 6l0 13" />
                              <path d="M21 6l0 13" />
                            </svg>
                            <p className="mt-3 text-2xl font-black text-slate-900 sm:text-3xl">8</p>
                            <p className="mt-1 text-xs font-bold text-slate-600 uppercase">Yayınlanan Kurslar</p>
                            <span aria-hidden="true" className="my-3 block h-px w-full bg-orange-200/60" />
                            <p className="text-[11px] leading-relaxed text-slate-500 font-medium">Önce analiz, sonra konu kavrama, sonra yeni nesil soru teknikleri.</p>
                          </li>
                        </ul>
                      </div>
                    </div>

                    {/* RIGHT COLUMN: EXPERIENCE ("Deneyim") */}
                    <div>
                      {/* Section Heading with Peach Icon + Underline */}
                      <div className="flex items-center gap-4">
                        <span aria-hidden="true" className="grid h-14 w-14 shrink-0 place-items-center rounded-full bg-orange-500/15 sm:h-16 sm:w-16">
                          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7 text-orange-600">
                            <path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" />
                            <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
                            <path d="M12 12l0 .01" />
                            <path d="M3 13a20 20 0 0 0 18 0" />
                          </svg>
                        </span>
                        <div>
                          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl lg:text-4xl">Deneyim</h2>
                          <span aria-hidden="true" className="mt-2 block h-1 w-12 rounded-full bg-orange-600 sm:w-14" />
                        </div>
                      </div>

                      {/* Timeline with Vertical Rail */}
                      <div className="mt-7 sm:mt-8">
                        <div className="relative">
                          <span aria-hidden="true" className="pointer-events-none absolute inset-y-8 start-[1.5rem] w-px bg-slate-200" />
                          <ol className="relative space-y-4">
                            {/* Step 01: Peach tint */}
                            <li className="relative flex items-center gap-3 sm:gap-5">
                              <span className="relative z-10 grid h-10 w-11 shrink-0 place-items-center rounded-xl text-sm font-black bg-orange-100/80 text-orange-700 border border-orange-200">
                                01
                              </span>
                              <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl p-4 sm:p-5 bg-[#FFF6F4] border border-[#FDE4DE]">
                                <div className="relative flex gap-3.5 pe-16 sm:pe-20">
                                  <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-orange-500/15">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-orange-600">
                                      <path d="M3 9a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v9a2 2 0 0 1 -2 2h-14a2 2 0 0 1 -2 -2l0 -9" />
                                      <path d="M8 7v-2a2 2 0 0 1 2 -2h4a2 2 0 0 1 2 2v2" />
                                      <path d="M12 12l0 .01" />
                                      <path d="M3 13a20 20 0 0 0 18 0" />
                                    </svg>
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-bold leading-snug text-slate-900 text-sm sm:text-base">Kıdemli Branş Sorumlusu & Zümre Başkanı</p>
                                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600">YKS & LGS sınav gruplarında soru bankası komisyonu, deneme sınavı analizi ve rehberlik programları yönetimi.</p>
                                  </div>
                                </div>
                                <span className="absolute bottom-4 end-4 rounded-lg px-2.5 py-1 text-xs font-bold bg-orange-100/90 text-orange-800">
                                  4 yıl
                                </span>
                              </div>
                            </li>

                            {/* Step 02: Blue tint */}
                            <li className="relative flex items-center gap-3 sm:gap-5">
                              <span className="relative z-10 grid h-10 w-11 shrink-0 place-items-center rounded-xl text-sm font-black bg-blue-100/80 text-blue-700 border border-blue-200">
                                02
                              </span>
                              <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl p-4 sm:p-5 bg-[#F0F9FF] border border-[#E0F2FE]">
                                <div className="relative flex gap-3.5 pe-16 sm:pe-20">
                                  <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-blue-500/15">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-blue-600">
                                      <path d="M11 12a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
                                      <path d="M12 7a5 5 0 1 0 5 5" />
                                      <path d="M13 3.055a9 9 0 1 0 7.941 7.945" />
                                      <path d="M15 6v3h3l3 -3h-3v-3l-3 3" />
                                      <path d="M15 9l-3 3" />
                                    </svg>
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-bold leading-snug text-slate-900 text-sm sm:text-base">Özel Okul ve Kurs Merkezi Kıdemli Eğitmeni</p>
                                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600">Üç yıl boyunca derece sınıflarında birebir etüt, soru çözüm kampları ve kişiye özel başarı planlaması.</p>
                                  </div>
                                </div>
                                <span className="absolute bottom-4 end-4 rounded-lg px-2.5 py-1 text-xs font-bold bg-blue-100/90 text-blue-800">
                                  3 yıl
                                </span>
                              </div>
                            </li>

                            {/* Step 03: Green tint */}
                            <li className="relative flex items-center gap-3 sm:gap-5">
                              <span className="relative z-10 grid h-10 w-11 shrink-0 place-items-center rounded-xl text-sm font-black bg-emerald-100/80 text-emerald-700 border border-emerald-200">
                                03
                              </span>
                              <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl p-4 sm:p-5 bg-[#F0FDF4] border border-[#DCFCE7]">
                                <div className="relative flex gap-3.5 pe-16 sm:pe-20">
                                  <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-emerald-500/15">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-emerald-600">
                                      <path d="M5 5a5 5 0 0 1 7 0a5 5 0 0 0 7 0v9a5 5 0 0 1 -7 0a5 5 0 0 0 -7 0v-9" />
                                      <path d="M5 21v-7" />
                                    </svg>
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-bold leading-snug text-slate-900 text-sm sm:text-base">Birebir Özel Ders & Online Koçluk</p>
                                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600">Öğrencilerin netlerini sıfırdan zirveye taşıyan, soru çözümü ve motivasyon odaklı birebir çalışma modeli.</p>
                                  </div>
                                </div>
                                <span className="absolute bottom-4 end-4 rounded-lg px-2.5 py-1 text-xs font-bold bg-emerald-100/90 text-emerald-800">
                                  3 yıl
                                </span>
                              </div>
                            </li>

                            {/* Step 04: Purple tint */}
                            <li className="relative flex items-center gap-3 sm:gap-5">
                              <span className="relative z-10 grid h-10 w-11 shrink-0 place-items-center rounded-xl text-sm font-black bg-purple-100/80 text-purple-700 border border-purple-200">
                                04
                              </span>
                              <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl p-4 sm:p-5 bg-[#FAF5FF] border border-[#F3E8FF]">
                                <div className="relative flex gap-3.5 pe-16 sm:pe-20">
                                  <span aria-hidden="true" className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-purple-500/15">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6 text-purple-600">
                                      <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
                                      <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
                                    </svg>
                                  </span>
                                  <div className="min-w-0">
                                    <p className="font-bold leading-snug text-slate-900 text-sm sm:text-base">Üniversite Eğitimi & Pedagojik Formasyon</p>
                                    <p className="mt-1 text-xs sm:text-sm leading-relaxed text-slate-600">Eğitim Fakültesi Lisans & Yüksek Lisans / Pedagojik Formasyon Belgesi ve Öğretmenlik Sertifikasyonu.</p>
                                  </div>
                                </div>
                                <span className="absolute bottom-4 end-4 rounded-lg px-2.5 py-1 text-xs font-bold bg-purple-100/90 text-purple-800">
                                  Yüksek Lisans
                                </span>
                              </div>
                            </li>
                          </ol>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* HARMONIZED BIHOCAM SECTIONS: Facilities, Locations, and Quick Booking Bar */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  {/* Left sub-column: Teacher Facilities & Locations */}
                  <div className="lg:col-span-7 space-y-6">
                    {/* Facilities Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-lg">🎒</span>
                        <h3 className="text-lg font-bold text-slate-900">Öğretmenin Sunduğu İmkânlar</h3>
                      </div>
                      <div className="space-y-3 text-xs sm:text-sm font-medium text-slate-600 pt-2">
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100/80">
                          <span className="text-emerald-600 font-bold text-base mt-0.5">✓</span>
                          <div>
                            <strong className="text-slate-900 block font-bold">Zengin Dijital Kaynak Desteği</strong>
                            <span>Ders dışında çözülmesi için haftalık PDF testler, yeni nesil soru bankaları ve konu özetleri ücretsiz iletilir.</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100/80">
                          <span className="text-emerald-600 font-bold text-base mt-0.5">✓</span>
                          <div>
                            <strong className="text-slate-900 block font-bold">Öğrenci Ödev & Soru Takibi</strong>
                            <span>Platformumuz üzerinden atanan ödevlerin çözümleri ve yapılamayan sorular ders öncesinde incelenir.</span>
                          </div>
                        </div>
                        <div className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100/80">
                          <span className="text-emerald-600 font-bold text-base mt-0.5">✓</span>
                          <div>
                            <strong className="text-slate-900 block font-bold">Haftalık İlerleme & Veli Bilgilendirmesi</strong>
                            <span>Öğrencinin net grafiği ve konu başarı yüzdesi düzenli olarak analiz edilerek veliyle paylaşılır.</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Locations Card */}
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-4">
                      <div className="flex items-center gap-3">
                        <span className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">📍</span>
                        <h3 className="text-lg font-bold text-slate-900">Ders Verdiği Konumlar</h3>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs font-semibold text-slate-700 pt-1">
                        {["Online (Tüm Türkiye & Yurt Dışı)", "Ankara (Çankaya, Çayyolu, Ümitköy)", "Yenimahalle", "Etimesgut", "Batıkent", "Keçiören"].map((loc, idx) => (
                          <span key={idx} className="px-3.5 py-2 bg-slate-50 border border-slate-200/70 rounded-xl flex items-center gap-1.5">
                            <span className="text-orange-500">📍</span> {loc}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right sub-column: Rates & Quick Booking CTA Card */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="bg-white rounded-3xl border border-slate-100 p-6 sm:p-8 shadow-sm space-y-5">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                        <h3 className="text-lg font-bold text-slate-900">Ders Ücret Tarifesi</h3>
                        <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg">Şeffaf Fiyat</span>
                      </div>

                      <div className="space-y-3">
                        {/* Online Individual */}
                        <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                          <div>
                            <div className="text-slate-900 font-bold text-sm">🌐 Birebir Online Canlı Ders</div>
                            <div className="text-slate-500 text-xs font-medium">45 Dakika / İnteraktif Tahta</div>
                          </div>
                          <div className="text-orange-600 font-black text-base">
                            {data.teacher.live_class_price ? `${data.teacher.live_class_price} TL` : "Anlaşmalı"}
                          </div>
                        </div>

                        {/* Face to Face */}
                        {data.teacher.face_to_face_price && (
                          <div className="flex justify-between items-center p-3.5 bg-slate-50 border border-slate-100 rounded-2xl">
                            <div>
                              <div className="text-slate-900 font-bold text-sm">📍 Yüz Yüze Görüşme</div>
                              <div className="text-slate-500 text-xs font-medium">45 Dakika / Eğitmen veya Öğrenci Evi</div>
                            </div>
                            <div className="text-slate-900 font-black text-base">
                              {data.teacher.face_to_face_price} TL
                            </div>
                          </div>
                        )}

                        {/* Group Lesson Tiers */}
                        {data.teacher.group_lesson_prices
                          ?.filter((t) => t.is_active)
                          .map((tier) => (
                            <div key={tier.tier_id} className="flex justify-between items-center p-3.5 bg-amber-50/60 border border-amber-100 rounded-2xl">
                              <div>
                                <div className="text-amber-900 font-bold text-sm">👥 {tier.title} ({tier.min_students}-{tier.max_students} Kişi)</div>
                                <div className="text-amber-700 text-xs font-medium">45 Dakika / Kişi Başı Avantajlı</div>
                              </div>
                              <div className="text-amber-700 font-black text-base">
                                {tier.discount_price || tier.price_per_student} TL
                              </div>
                            </div>
                          ))}

                        {/* Free Intro */}
                        <div className="flex justify-between items-center p-3.5 bg-emerald-50/60 border border-emerald-100 rounded-2xl">
                          <div>
                            <div className="text-emerald-900 font-bold text-sm">🎯 15 Dk Tanışma & Sınav Koçluğu</div>
                            <div className="text-emerald-700 text-xs font-medium">Seviye Tespiti ve Ders Planı</div>
                          </div>
                          <div className="text-emerald-600 font-black text-xs uppercase px-2 py-1 bg-emerald-100 rounded-lg">
                            Ücretsiz
                          </div>
                        </div>
                      </div>

                      <div className="pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("book");
                            window.scrollTo({ top: 400, behavior: "smooth" });
                          }}
                          className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold shadow-lg shadow-orange-500/20 transition-all text-sm flex items-center justify-center gap-2"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span>Hemen Canlı Ders Ayır</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 2: CANLI DERS REZERVASYONU TAKVİMİ              */}
            {/* ============================================================ */}
            {activeTab === "book" && (
              <div id="live-class-section" className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
                {isAuthenticated && user?.id === teacherId && (
                  <div className="bg-blue-50 border border-blue-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="text-xs font-black text-blue-800 flex items-center gap-1.5">
                        <span>👤</span> KENDİ PROFİLİNİZİ GÖRÜNTÜLÜYORSUNUZ
                      </div>
                      <p className="text-xs text-blue-600 font-medium">
                        Öğrencilerin sizden ders randevusu alabilmesi için takviminize müsait gün ve saatleri eklemelisiniz.
                      </p>
                    </div>
                    <Link
                      href="/dashboard/teacher/live-classes"
                      className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
                    >
                      Takvime Müsaitlik Ekle
                    </Link>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  {/* Left Part: Calendar & Format Switcher */}
                  <div className="lg:col-span-7 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">1. Ders Formatı ve Tarih Seçiniz</h3>
                      <p className="text-xs text-slate-500">Müsaitlik olan günlerin altında yeşil işaret bulunmaktadır.</p>
                    </div>

                    {/* Mode switcher: Birebir vs Grup */}
                    {data.teacher.group_lesson_prices && data.teacher.group_lesson_prices.some((t) => t.is_active) && (
                      <div className="grid grid-cols-2 gap-2 p-1.5 bg-slate-100 rounded-2xl">
                        <button
                          type="button"
                          onClick={() => setLessonMode("individual")}
                          className={`py-2 text-xs font-bold rounded-xl transition-all ${
                            lessonMode === "individual" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          🧑 Birebir Ders
                        </button>
                        <button
                          type="button"
                          onClick={() => setLessonMode("group")}
                          className={`py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
                            lessonMode === "group" ? "bg-white text-orange-700 shadow-sm" : "text-slate-500 hover:text-slate-800"
                          }`}
                        >
                          <span>👥 Grup Dersi</span>
                          <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-black">Avantajlı</span>
                        </button>
                      </div>
                    )}

                    {/* Format switcher: Online vs Face-to-Face */}
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setLessonFormat("online")}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          lessonFormat === "online"
                            ? "bg-orange-50/70 border-orange-500 ring-2 ring-orange-500/20 shadow-sm"
                            : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-slate-900">🌐 Online Canlı</span>
                          {lessonFormat === "online" && <span className="w-2.5 h-2.5 rounded-full bg-orange-600" />}
                        </div>
                        <div className="text-sm font-black text-orange-600 mt-1">
                          {data.teacher.live_class_price ? `${data.teacher.live_class_price} ₺/ders` : "Anlaşmalı"}
                        </div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setLessonFormat("face_to_face")}
                        className={`p-4 rounded-2xl border text-left transition-all ${
                          lessonFormat === "face_to_face"
                            ? "bg-slate-900 text-white border-slate-900 shadow-md"
                            : "bg-slate-50 border-slate-200/80 hover:bg-slate-100"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className={`text-xs font-bold ${lessonFormat === "face_to_face" ? "text-white" : "text-slate-900"}`}>📍 Yüz Yüze</span>
                          {lessonFormat === "face_to_face" && <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />}
                        </div>
                        <div className={`text-sm font-black mt-1 ${lessonFormat === "face_to_face" ? "text-orange-400" : "text-slate-900"}`}>
                          {data.teacher.face_to_face_price ? `${data.teacher.face_to_face_price} ₺/ders` : (data.teacher.face_to_face_price === 0 ? "Ücretsiz" : "Belirtilmedi")}
                        </div>
                      </button>
                    </div>

                    {/* Interactive Month Calendar */}
                    <div className="border border-slate-200/80 rounded-3xl p-5 bg-white shadow-2xs">
                      <div className="flex items-center justify-between mb-4">
                        <button onClick={handlePrevMonth} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 font-bold">
                          ←
                        </button>
                        <div className="text-sm font-black text-slate-800">
                          {MONTH_NAMES[currentMonth - 1]} {currentYear}
                        </div>
                        <button onClick={handleNextMonth} className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 font-bold">
                          →
                        </button>
                      </div>

                      <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-400 mb-2">
                        {["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"].map((day, i) => (
                          <div key={i}>{day}</div>
                        ))}
                      </div>

                      <div className="grid grid-cols-7 gap-1">
                        {Array.from({ length: offset }).map((_, i) => (
                          <div key={`empty-${i}`} className="h-10" />
                        ))}
                        {Array.from({ length: daysInMonth }).map((_, i) => {
                          const dayNum = i + 1;
                          const dateStr = `${currentYear}-${String(currentMonth).padStart(2, "0")}-${String(dayNum).padStart(2, "0")}`;
                          const isSelected = selectedDate === dateStr;
                          const hasSlots = slots?.some((s) => s.date === dateStr && !s.is_booked);

                          return (
                            <button
                              key={dayNum}
                              type="button"
                              onClick={() => {
                                setSelectedDate(dateStr);
                                setSelectedSlotId("");
                              }}
                              className={`h-10 rounded-xl text-xs font-bold relative flex items-center justify-center transition-all ${
                                isSelected
                                  ? "bg-orange-600 text-white shadow-sm"
                                  : hasSlots
                                  ? "bg-emerald-50 text-emerald-800 hover:bg-emerald-100"
                                  : "text-slate-700 hover:bg-slate-50"
                              }`}
                            >
                              <span>{dayNum}</span>
                              {hasSlots && !isSelected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 absolute bottom-1.5" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  {/* Right Part: Available Slots & Booking Confirm */}
                  <div className="lg:col-span-5 space-y-6">
                    <div className="space-y-2">
                      <h3 className="text-xl font-bold text-slate-900">2. Saat Dilimi Seçin</h3>
                      <p className="text-xs text-slate-500">Seçilen Tarih: <strong className="text-slate-800">{selectedDate}</strong></p>
                    </div>

                    {slotsLoading ? (
                      <div className="space-y-2">
                        {[...Array(3)].map((_, i) => (
                          <div key={i} className="h-12 bg-slate-100 rounded-xl animate-pulse" />
                        ))}
                      </div>
                    ) : slotsForSelectedDate.length === 0 ? (
                      <div className="p-8 text-center bg-slate-50 border border-slate-100 rounded-3xl space-y-3">
                        <div className="text-3xl">🗓️</div>
                        <p className="text-xs font-bold text-slate-600">Bu tarihte müsait saat dilimi bulunmamaktadır.</p>
                        <p className="text-[11px] text-slate-400">Lütfen takvimden yeşil işaretli günleri seçiniz.</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {slotsForSelectedDate.map((slot) => {
                          const isSelected = selectedSlotId === slot.id;
                          return (
                            <button
                              key={slot.id}
                              type="button"
                              onClick={() => setSelectedSlotId(slot.id)}
                              className={`w-full p-4 rounded-2xl border text-left text-xs font-bold flex items-center justify-between transition-all ${
                                isSelected
                                  ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                                  : "bg-white hover:bg-slate-50 text-slate-800 border-slate-200/80"
                              }`}
                            >
                              <span className="flex items-center gap-2">
                                <span>⏰</span>
                                <span>{slot.start_time} - {slot.end_time}</span>
                              </span>
                              <span>{isSelected ? "✓ Seçildi" : "Seç"}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}

                    {selectedSlotId && (
                      <div className="space-y-4 pt-2">
                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Ders Notu (İsteğe Bağlı)</label>
                          <textarea
                            value={studentNotes}
                            onChange={(e) => setStudentNotes(e.target.value)}
                            placeholder="Eğitmene iletmek istediğiniz soru veya konuları yazabilirsiniz..."
                            rows={3}
                            className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                          />
                        </div>

                        {isAuthenticated ? (
                          <button
                            type="button"
                            onClick={handleBookLiveClass}
                            disabled={bookMutation.isPending}
                            className="w-full py-4 bg-orange-600 hover:bg-orange-700 text-white rounded-2xl font-bold text-sm shadow-lg shadow-orange-500/20 transition-all flex items-center justify-center gap-2"
                          >
                            {bookMutation.isPending ? "Rezervasyon Yapılıyor..." : "Rezervasyonu Tamamla →"}
                          </button>
                        ) : (
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-center space-y-2">
                            <p className="text-xs font-bold text-amber-900">Canlı ders rezervasyonu için giriş yapmalısınız.</p>
                            <Link href="/login" className="inline-block px-4 py-2 bg-orange-600 text-white text-xs font-bold rounded-xl shadow-sm">
                              Giriş Yap
                            </Link>
                          </div>
                        )}

                        {bookingError && (
                          <p className="text-xs font-bold text-rose-600 text-center">{bookingError}</p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                {/* Booking Success Modal */}
                {bookingSuccess && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl p-8 max-w-md w-full border border-slate-100 shadow-2xl text-center space-y-4">
                      <div className="w-16 h-16 bg-emerald-50 text-emerald-500 flex items-center justify-center text-3xl rounded-full mx-auto">
                        🎉
                      </div>
                      <h3 className="text-2xl font-black text-slate-900">Ders Ayrıldı!</h3>
                      <p className="text-slate-600 font-medium text-xs leading-relaxed">
                        Canlı ders talebiniz başarıyla alındı. Eğitmen onayladığında ders katılım butonu panelinizdeki **"Canlı Derslerim"** sayfasında aktif olacaktır.
                      </p>
                      <button
                        onClick={() => setBookingSuccess(false)}
                        className="px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold text-xs hover:bg-slate-800 transition-all"
                      >
                        Kapat
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 3: KURSLAR                                       */}
            {/* ============================================================ */}
            {activeTab === "courses" && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Yayınlanan Eğitimler</h3>
                {!data.courses?.length ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <p className="text-slate-400 font-bold text-sm">Henüz yayınlanmış bir video eğitimi bulunmuyor.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {data.courses.map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all"
                      >
                        <div className="aspect-video bg-slate-100 relative overflow-hidden">
                          {course.thumbnail_path ? (
                            <img
                              src={course.thumbnail_path}
                              alt={course.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-orange-600 text-3xl">📚</div>
                          )}
                        </div>
                        <div className="p-4 space-y-2">
                          <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2 leading-snug">
                            {course.title}
                          </h4>
                          <div className="flex items-center justify-between pt-2 border-t border-slate-50 text-xs font-bold text-orange-600">
                            <span>Detayları İncele →</span>
                            <span className="text-slate-900 text-sm font-black">
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

            {/* ============================================================ */}
            {/* TAB CONTENT 4: VİDEOLAR & TANITIM                            */}
            {/* ============================================================ */}
            {activeTab === "videos" && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
                {data.teacher.promo_video && (
                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 space-y-3">
                    <span className="px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold uppercase bg-orange-50 text-orange-700 border border-orange-100">
                      🎬 Tanıtım Videosu
                    </span>
                    <h4 className="font-bold text-slate-900">{data.teacher.full_name} Tanıtım Videosu</h4>
                    <div className="aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-inner border border-slate-200">
                      {data.teacher.promo_video.includes("youtube.com") || data.teacher.promo_video.includes("youtu.be") ? (
                        <iframe
                          src={getYoutubeEmbedUrl(data.teacher.promo_video)}
                          title="Tanıtım Videosu"
                          className="w-full h-full border-0"
                          allowFullScreen
                        />
                      ) : (
                        <video
                          src={`http://localhost:8000/media/${data.teacher.promo_video}`}
                          controls
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                )}

                <div>
                  <h4 className="text-lg font-bold text-slate-900 mb-4">Ders ve Hazırlık Videoları</h4>
                  {libraryLoading ? (
                    <div className="flex justify-center py-10">
                      <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  ) : libraryItems.filter(item => item.item_type === "video" || item.item_type === "youtube").length === 0 ? (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl">
                      <p className="text-slate-400 font-bold text-sm">Eğitmen henüz ek video eklememiştir.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {libraryItems.filter(item => item.item_type === "video" || item.item_type === "youtube").map((item) => (
                        <div key={item.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs space-y-3">
                          <h4 className="font-bold text-slate-900 line-clamp-1">{item.title}</h4>
                          {item.item_type === "youtube" && item.youtube_url && (
                            <div className="aspect-video w-full rounded-xl overflow-hidden shadow-inner border border-slate-100">
                              <iframe
                                src={getYoutubeEmbedUrl(item.youtube_url)}
                                title={item.title}
                                className="w-full h-full border-0"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 5: POPCASTLER                                    */}
            {/* ============================================================ */}
            {activeTab === "popcasts" && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-900">🎙️ Öğretmenin Popcast Yayınları</h3>
                {popcastsLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : popcastsData.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <p className="text-slate-400 font-bold text-sm">Eğitmen henüz podcast yayını eklememiştir.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {popcastsData.map((popcast: any) => (
                      <div key={popcast.id} className="bg-white border border-slate-100 rounded-2xl p-5 shadow-2xs space-y-3">
                        <div className="flex gap-4">
                          <div className="w-16 h-16 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center text-3xl flex-shrink-0">
                            🎙️
                          </div>
                          <div>
                            <h4 className="font-bold text-slate-900 line-clamp-1">{popcast.title}</h4>
                            <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed mt-1">
                              {popcast.description || "Açıklama bulunmuyor."}
                            </p>
                          </div>
                        </div>
                        {popcast.audio_url && (
                          <audio src={`http://localhost:8000${popcast.audio_url}`} controls className="w-full mt-2" />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 6: BLOG YAZILARI                                 */}
            {/* ============================================================ */}
            {activeTab === "blog" && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Yayınlanan Blog Yazıları</h3>
                {blogLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
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
                        className="group bg-white rounded-2xl border border-slate-100 overflow-hidden hover:shadow-lg transition-all p-5 space-y-3 block"
                      >
                        <h4 className="font-bold text-slate-900 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {post.title}
                        </h4>
                        {post.summary && (
                          <p className="text-slate-500 text-xs line-clamp-2 leading-relaxed">
                            {post.summary}
                          </p>
                        )}
                        <span className="text-orange-600 text-xs font-bold block pt-2">Yazıyı Oku →</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 7: KÜTÜPHANE                                     */}
            {/* ============================================================ */}
            {activeTab === "library" && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-sm space-y-6">
                <h3 className="text-xl font-bold text-slate-900">Öğretmenin Kütüphanesi & Çalışma Kağıtları</h3>
                {libraryLoading ? (
                  <div className="flex justify-center py-10">
                    <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                  </div>
                ) : libraryItems.length === 0 ? (
                  <div className="text-center py-12 bg-slate-50 rounded-2xl">
                    <p className="text-slate-400 font-bold text-sm">Eğitmen henüz kütüphanesine dosya eklememiştir.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {libraryItems.map((item) => (
                      <div key={item.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between">
                        <div>
                          <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
                          <span className="text-[11px] text-slate-400">{item.item_type}</span>
                        </div>
                        {item.file_path && (
                          <a
                            href={`http://localhost:8000/media/${item.file_path}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-3 py-1.5 bg-orange-600 text-white rounded-xl text-xs font-bold"
                          >
                            İndir
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================ */}
            {/* TAB CONTENT 8: ÖĞRENCİ DEĞERLENDİRMELERİ & YORUMLAR          */}
            {/* ============================================================ */}
            {activeTab === "reviews" && (
              <div className="bg-white rounded-[2.5rem] border border-slate-100 p-6 sm:p-8 lg:p-10 shadow-sm space-y-8">
                <div className="flex flex-col sm:flex-row items-center gap-8 pb-8 border-b border-slate-100">
                  <div className="text-center space-y-1">
                    <div className="text-5xl font-black text-slate-900">4.9</div>
                    <div className="text-amber-500 text-xl">★★★★★</div>
                    <div className="text-xs text-slate-400 font-bold uppercase">{data.reviews?.length || 35} Değerlendirme</div>
                  </div>
                  <div className="flex-1 w-full space-y-2">
                    {[5, 4, 3, 2, 1].map((stars) => (
                      <div key={stars} className="flex items-center gap-3 text-xs font-semibold text-slate-500">
                        <span className="w-12">{stars} Yıldız</span>
                        <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div className={`h-full bg-orange-500 rounded-full ${stars === 5 ? "w-[92%]" : stars === 4 ? "w-[8%]" : "w-0"}`} />
                        </div>
                        <span className="w-8 text-right">{stars === 5 ? "92%" : stars === 4 ? "8%" : "0%"}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Review Form */}
                <div className="space-y-4">
                  <h4 className="text-base font-bold text-slate-900">{data.teacher.full_name} Hakkındaki Görüşlerinizi Yazın</h4>
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      if (!isAuthenticated) {
                        toast.error("Yorum göndermek için lütfen önce giriş yapınız.");
                        return;
                      }
                      reviewMutation.mutate({
                        rating: reviewRating,
                        title: reviewTitle || "Eğitmen Değerlendirmesi",
                        comment: reviewComment,
                      });
                    }}
                    className="space-y-4"
                  >
                    <input
                      type="text"
                      placeholder="Başlık (örn. Harika bir ders tecrübesi)"
                      value={reviewTitle}
                      onChange={(e) => setReviewTitle(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    <textarea
                      placeholder="Ders işleyişi ve anlatım hakkında görüşlerinizi paylaşın..."
                      rows={4}
                      value={reviewComment}
                      onChange={(e) => setReviewComment(e.target.value)}
                      required
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    />
                    <button
                      type="submit"
                      disabled={reviewMutation.isPending}
                      className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white font-bold text-xs rounded-xl shadow-md transition-all"
                    >
                      {reviewMutation.isPending ? "Gönderiliyor..." : "Yorumu Gönder"}
                    </button>
                  </form>
                </div>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
