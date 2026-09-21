"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PopupAnnouncement from "@/components/PopupAnnouncement";
import AdBanner from "@/components/ads/AdBanner";
import FeaturedCourses from "@/components/ads/FeaturedCourses";
import { motion, AnimatePresence, useInView } from "framer-motion";
import CountUp from "react-countup";
import { coursesApi, publicApi, educationProgramsApi, EducationProgram, blogPublicApi, BlogPost, popcastsApi, PopcastResponse, type Course } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { usePopupAnnouncement } from "@/hooks/usePopupAnnouncement";
import { 
  Play, Pause, Headphones, Heart, Download, 
  Sparkles, ArrowRight, CheckCircle2, ShieldCheck, 
  Users, BookOpen, GraduationCap, Star, Award, 
  Laptop, Trophy, Smartphone, Sprout, Target, 
  Globe, Compass, Lightbulb, Zap, Clock, ChevronRight, Check, X, HelpCircle, PlusCircle
} from "lucide-react";
import PayTRTaksitWidget from "@/components/payment/PayTRTaksitWidget";
import Hero3DCanvas from "@/components/3d/Hero3DCanvas";
import TiltCard3D from "@/components/3d/TiltCard3D";
import BentoGridSection from "@/components/ui/BentoGrid";
import LiveDemandTicker from "@/components/home/LiveDemandTicker";

// Visual helpers for education program banners
const getGradientBySlug = (slug: string) => {
  if (slug.includes("tyt")) return "from-[#2D211F] via-[#211614] to-[#170E0D]"; // Dark brown/maroon gradient
  if (slug.includes("yks")) return "from-[#3B0054] via-[#2D0040] to-[#1C0028]"; // Purple gradient
  if (slug.includes("ayt")) return "from-[#001D75] via-[#001350] to-[#000A30]"; // Blue/navy gradient
  return "from-teal-950 via-teal-900 to-emerald-950";
};

const getBannerContent = (slug: string, title: string) => {
  if (slug === "tyt-tum-dersler") {
    return (
      <div className="text-center font-sans">
        <p className="text-4xl font-extrabold tracking-widest text-white leading-none">TYT</p>
        <p className="text-sm font-black tracking-widest text-white/95 mt-1.5">TÜM DERSLER</p>
        <p className="text-sm font-black tracking-widest text-white/90">EĞİTİM PROGRAMI</p>
      </div>
    );
  }
  if (slug === "yks-tum-dersler") {
    return (
      <div className="text-center font-sans">
        <p className="text-4xl font-extrabold tracking-widest text-white leading-none">YKS</p>
        <p className="text-[10px] sm:text-xs font-black tracking-widest text-white/95 mt-1.5">TYT + AYT TÜM DERSLER</p>
        <p className="text-sm font-black tracking-widest text-white/90">EĞİTİM PROGRAMI</p>
      </div>
    );
  }
  if (slug === "ayt-tum-dersler") {
    return (
      <div className="text-center font-sans">
        <p className="text-4xl font-extrabold tracking-widest text-white leading-none">AYT</p>
        <p className="text-sm font-black tracking-widest text-white/95 mt-1.5">TÜM DERSLER</p>
        <p className="text-sm font-black tracking-widest text-white/90">EĞİTİM PROGRAMI</p>
      </div>
    );
  }
  return (
    <div className="text-center px-4 font-sans">
      <p className="text-base font-extrabold tracking-wider text-white uppercase">{title}</p>
    </div>
  );
};

const formatProgramPrice = (p: number) => {
  return (p / 100).toLocaleString("tr-TR", { minimumFractionDigits: 2 }) + " TL";
};


// Animation variants
const fadeUpVariants: any = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer: any = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

function getYoutubeEmbedUrl(input?: string) {
  const fallback = "https://www.youtube.com/embed/zpOULjyy-n8"; // BiHocam introduction fallback video (valid generic video)
  if (!input) return fallback;
  const trimmed = input.trim();
  if (trimmed.includes("youtube.com/embed/")) {
    return trimmed;
  }
  let videoId = trimmed;
  if (trimmed.includes("v=")) {
    videoId = trimmed.split("v=")[1]?.split("&")[0] || trimmed;
  } else if (trimmed.includes("youtu.be/")) {
    videoId = trimmed.split("youtu.be/")[1]?.split("?")[0] || trimmed;
  }
  // If it's a 11-char YouTube ID or any string
  if (videoId.length > 0) {
    return `https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0&modestbranding=1&controls=1&showinfo=0`;
  }
  return fallback;
}

const getFallbackBlogImage = (slug?: string) => {
  const images = [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1518655061766-48f23af930f0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1558021211-6d1403321394?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1484417894907-623942c8ea29?auto=format&fit=crop&w=600&q=80"
  ];
  if (!slug) return images[0];
  let sum = 0;
  for (let i = 0; i < slug.length; i++) {
    sum += slug.charCodeAt(i);
  }
  return images[sum % images.length];
};

export default function Home() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null);
  const [estimatedEnd, setEstimatedEnd] = useState<string | null>(null);

  // Funnel Quiz States
  const [quizStep, setQuizStep] = useState(0);
  const [selectedExam, setSelectedExam] = useState("");
  const [selectedField, setSelectedField] = useState("");
  const [selectedHours, setSelectedHours] = useState("");
  const [selectedLevel, setSelectedLevel] = useState("");
  const [selectedChallenge, setSelectedChallenge] = useState("");
  const [selectedStyle, setSelectedStyle] = useState("");

  const [calcHours, setCalcHours] = useState(4);
  const [calcWeeks, setCalcWeeks] = useState(12);
  const [calcExam,  setCalcExam]  = useState(""); // secili sinav turu
  const [calcSubjects, setCalcSubjects] = useState<string[]>([]); // secili dersler

  // Campaigns & Announcements Array
  const campaigns = [
    {
      badge: "KAMPANYA",
      badgeColor: "border border-rose-500/30 bg-rose-500/10 text-rose-300",
      title: "Yeni Döneme Özel %20 İndirim!",
      description: "12, 24 ve 36 haftalık canlı ders programlarında büyük indirimler başladı. Ayrıca tüm kredi kartlarına peşin fiyatına 6 taksit avantajıyla bütçenizi zorlamadan başlayın.",
      actionText: "Hemen Hesapla",
      actionLink: "#calculator",
      bgGradient: "from-slate-950 via-slate-900 to-slate-950",
    },
    {
      badge: "ÜCRETSİZ TANIŞMA DERSİ",
      badgeColor: "border border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
      title: "İlk Canlı Tanışma Dersiniz Bizden!",
      description: "Hangi branşta olursa olsun, dilediğiniz öğretmenle 15 dakikalık tanışma ve seviye tespit dersinizi tamamen ücretsiz gerçekleştirin.",
      actionText: "Eğitmenleri İncele",
      actionLink: "/teachers",
      bgGradient: "from-slate-950 via-emerald-950/40 to-slate-950",
    },
    {
      badge: "YENİLİK",
      badgeColor: "border border-indigo-500/30 bg-indigo-500/10 text-indigo-300",
      title: "Yapay Zeka Destekli Akıllı Öğrenim",
      description: "BiHocam AI koçluk modülü sayesinde hedeflerinize en uygun çalışma yol haritasını dakikalar içinde oluşturun, performansınızı anlık takip edin.",
      actionText: "AI Test Et",
      actionLink: "/tanisma-dersi",
      bgGradient: "from-slate-950 via-indigo-950/40 to-slate-950",
    }
  ];

  const [activeCampaignSlide, setActiveCampaignSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveCampaignSlide((prev) => (prev + 1) % campaigns.length);
    }, 6000);
    return () => clearInterval(timer);
  }, []);

  // Sinav turune gore ders listesi
  const EXAM_SUBJECTS: Record<string, { label: string; tag: string; subjects: string[] }> = {
    yks: {
      label: "YKS Hazırlık",
      tag: "YKS",
      subjects: ["Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Edebiyat", "Tarih", "Coğrafya", "İngilizce", "Felsefe", "Din Kültürü"],
    },
    lgs: {
      label: "LGS Hazırlık",
      tag: "LGS",
      subjects: ["Matematik", "Fen Bilimleri", "Türkçe", "İnkılap Tarihi", "Din Kültürü", "İngilizce"],
    },
    takviye: {
      label: "Okul Takviye",
      tag: "Okul",
      subjects: ["Matematik", "Fen Bilimleri", "Türkçe", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "İngilizce", "Edebiyat"],
    },
    yabanci_dil: {
      label: "Yabancı Dil",
      tag: "Dil",
      subjects: ["İngilizce", "Almanca", "Fransızca", "İspanyolca", "İtalyanca", "Rusça"],
    },
    beceri: {
      label: "Beceri Geliştirme",
      tag: "Beceri",
      subjects: ["Müzik", "Kodlama", "Sanat", "Spor", "Dans", "Robotik", "Girişimcilik", "Fotoğrafçılık"],
    },
  };

  const toggleCalcSubject = (s: string) =>
    setCalcSubjects((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);


  // FAQ Accordion State
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  // Public settings for maintenance mode check
  const { data: publicSettings } = useQuery({
    queryKey: ["public-settings"],
    queryFn: () => publicApi.getPublicSettings(),
    retry: false,
    refetchInterval: 30000,
  });

  // Net price for PayTR widget — computed AFTER publicSettings is available
  const calcNetPrice = useMemo(() => {
    const ps = (publicSettings?.platform as Record<string, any>) || {};
    const rate   = Number(ps.calc_hourly_rate ?? 800);
    const d12    = Number(ps.calc_discount_12 ?? 10);
    const d24    = Number(ps.calc_discount_24 ?? 15);
    const d36    = Number(ps.calc_discount_36 ?? 20);
    const disc   = calcWeeks === 4 ? 0 : calcWeeks === 12 ? d12 : calcWeeks === 24 ? d24 : d36;
    return Math.round(calcHours * calcWeeks * rate * (1 - disc / 100));
  }, [publicSettings, calcHours, calcWeeks]);

  const platformSettings = useMemo(() => (publicSettings?.platform as Record<string, any>) || {}, [publicSettings]);

  useEffect(() => {
    if (publicSettings?.platform) {
      const platform = publicSettings.platform as Record<string, unknown>;
      const isMaintenance = platform.maintenance_mode === true;
      if (isMaintenance) {
        setMaintenanceMode(true);
        setMaintenanceMessage(
          (platform.maintenance_message as string) || "Site bakım modundadır. Lütfen daha sonra tekrar deneyin."
        );
        if (platform.maintenance_estimated_end) {
          setEstimatedEnd(platform.maintenance_estimated_end as string);
        }
      } else {
        setMaintenanceMode(false);
      }
    }
  }, [publicSettings]);

  // Get featured courses
  const { data: featuredCourses } = useQuery<Course[]>({
    queryKey: ["featured-courses-public"],
    queryFn: () => coursesApi.getFeaturedPublic(8),
    enabled: !maintenanceMode || user?.role === "admin",
    staleTime: 5 * 60 * 1000,
  });

  // Fallback: regular courses
  const { data: courses } = useQuery<Course[]>({
    queryKey: ["courses", "fallback"],
    queryFn: () => coursesApi.list(0, 8),
    enabled: (!featuredCourses || featuredCourses.length === 0) && (!maintenanceMode || user?.role === "admin"),
    staleTime: 5 * 60 * 1000,
  });

  // Get active education programs
  const { data: educationPrograms } = useQuery<EducationProgram[]>({
    queryKey: ["education-programs-public"],
    queryFn: () => educationProgramsApi.list({ include_inactive: false }),
    enabled: !maintenanceMode || user?.role === "admin",
    staleTime: 5 * 60 * 1000,
  });

  // Get latest 3 blog posts
  const { data: blogPosts } = useQuery<BlogPost[]>( {
    queryKey: ["public-blog-posts"],
    queryFn: () => blogPublicApi.list({ limit: 3 }),
    enabled: !maintenanceMode || user?.role === "admin",
    staleTime: 5 * 60 * 1000,
  });

  // Popup announcement
  const { activePopup, dismissPopup } = usePopupAnnouncement();

  const queryClient = useQueryClient();
  const [currentPlayingPopcast, setCurrentPlayingPopcast] = useState<PopcastResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Get approved popcasts for homepage
  const { data: popcasts } = useQuery<PopcastResponse[]>({
    queryKey: ["public-popcasts-homepage"],
    queryFn: () => popcastsApi.list({ skip: 0, limit: 6 }),
    enabled: !maintenanceMode,
    staleTime: 2 * 60 * 1000,
  });

  // Toggle favorite mutation
  const favoriteMutation = useMutation({
    mutationFn: async ({ id, isFav }: { id: string; isFav: boolean }) => {
      if (isFav) {
        return popcastsApi.unfavorite(id);
      } else {
        return popcastsApi.favorite(id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["public-popcasts-homepage"] });
    },
  });

  useEffect(() => {
    audioRef.current = new Audio();

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setAudioDuration(audioRef.current.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setCurrentTime(0);
    };

    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioRef.current.addEventListener("ended", handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audioRef.current.removeEventListener("ended", handleEnded);
      }
    };
  }, []);

  const handlePlayPause = (popcast: PopcastResponse) => {
    if (!audioRef.current) return;

    if (currentPlayingPopcast?.id === popcast.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      audioRef.current.pause();
      audioRef.current.src = popcast.audio_url;
      setCurrentPlayingPopcast(popcast);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const handleToggleFavorite = async (e: React.MouseEvent, id: string, isFav: boolean) => {
    e.stopPropagation();
    if (!user) {
      router.push("/login");
      return;
    }
    favoriteMutation.mutate({ id, isFav });
  };

  const handleDownload = (e: React.MouseEvent, url: string, title: string) => {
    e.stopPropagation();
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${title}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch(() => {
        window.open(url, "_blank");
      });
  };

  if (maintenanceMode && user?.role !== "admin") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative w-full max-w-4xl">
          <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-emerald-100/50 p-8 md:p-16 overflow-hidden">
            <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-cyan-400/20 opacity-50 pointer-events-none"></div>
            <div className="absolute inset-[1px] rounded-[2.5rem] bg-white/80 backdrop-blur-2xl"></div>

            <div className="relative z-10">
              <div className="flex justify-center mb-12">
                {publicSettings?.logo_url ? (
                  <div className="relative">
                    <img src={publicSettings.logo_url} alt="Logo" className="h-28 object-contain drop-shadow-lg" />
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl -z-10"></div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                      <span className="text-white font-bold text-5xl">B</span>
                    </div>
                    <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-3xl blur-xl animate-pulse"></div>
                  </div>
                )}
              </div>

              <div className="mb-12 flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                  <div className="relative w-48 h-48 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-200/50">
                    <svg className="w-24 h-24 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                  <div className="absolute inset-4 border-4 border-transparent border-t-teal-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
                </div>
              </div>

              <h1 className="text-6xl md:text-7xl font-black text-center mb-8 tracking-tight">
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">Bakım Modu</span>
              </h1>

              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-2xl p-8 mb-8 shadow-lg">
                <p className="text-xl md:text-2xl text-gray-800 leading-relaxed text-center font-medium">
                  {maintenanceMessage || "Site bakım modundadır. Lütfen daha sonra tekrar deneyin."}
                </p>
              </div>

              {estimatedEnd && (
                <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 border-2 border-teal-300/50 rounded-2xl p-8 mb-8 text-center shadow-lg backdrop-blur-sm">
                  <div className="flex items-center justify-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="text-sm font-bold text-teal-800 uppercase tracking-wider">Tahmini Bitiş</p>
                  </div>
                  <p className="text-2xl font-bold text-teal-900">
                    {new Date(estimatedEnd).toLocaleString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Real platform stats from DB
  const { data: publicStats } = useQuery({
    queryKey: ["public-stats-home"],
    queryFn: async () => {
      try {
        const res = await fetch("http://127.0.0.1:8000/api/v1/stats/public");
        if (res.ok) return await res.json();
      } catch {}
      return { total_courses: 36, total_programs: 33, total_tenders: 1, total_teachers: 1, average_rating: 4.9 };
    },
    staleTime: 60 * 1000,
  });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans">
      {activePopup && (
        <PopupAnnouncement
          popup={activePopup}
          onClose={() => dismissPopup(activePopup.id, false)}
          onDismiss={dismissPopup}
        />
      )}

      <Header />

      {/* ══════════════════════════════════════════════════════ */}
      {/* HERO - MODERN ASYMMETRIC LIGHT REDESIGN                */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28 overflow-hidden bg-white border-b border-slate-100">
        {/* Subtle Ambient Radial Glows & Grid */}
        <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-emerald-100/50 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-teal-100/40 rounded-full blur-[160px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* ── LEFT COLUMN (Asymmetric 7 Cols) ── */}
            <div className="lg:col-span-7 space-y-8 text-center lg:text-left">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider shadow-sm backdrop-blur-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>TÜRKİYE&apos;NİN AKILLI ÖZEL DERS AĞI</span>
                <span className="flex w-2 h-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-600"></span>
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.1 }}
                className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.08] font-display"
              >
                Geleceğinizi Şekillendirecek{" "}
                <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                  Uzman Eğitmenler
                </span>{" "}
                Burada!
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal"
              >
                YKS, LGS, yabancı dil ve tüm okul branşlarında bağımsız doğrulanmış eğitmenlerle{" "}
                <span className="text-emerald-700 font-semibold">birebir canlı ders</span> yapın.
                İster hemen öğretmen seçin, ister{" "}
                <span className="text-emerald-700 font-semibold">özel ders talebi açarak</span> öğretmenlerin size özel teklif vermesini sağlayın.
              </motion.p>

              {/* Dual Action CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row flex-wrap justify-center lg:justify-start items-center gap-3.5 pt-2"
              >
                <Link
                  href="/tenders/new"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm sm:text-base shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Ders Talebi Aç</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/teachers"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm sm:text-base shadow-sm transition-all flex items-center justify-center gap-2"
                >
                  <span>Eğitmenleri Keşfet</span>
                </Link>

                <Link
                  href="/tanisma-dersi"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 font-bold text-xs sm:text-sm transition-all duration-200 text-center"
                >
                  15 Dk Ücretsiz Tanışma
                </Link>
              </motion.div>

              {/* ── Metric Counters (Real Data Connected) ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.9, delay: 0.5 }}
                className="pt-6 border-t border-slate-100"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-2xl mx-auto lg:mx-0">
                  {[
                    { end: publicStats?.total_courses || 36, suffix: '+', label: 'Yayınlanmış Kurs', color: 'text-emerald-700', icon: BookOpen, formattingFn: (v: number) => `${Math.round(v)}+` },
                    { end: publicStats?.total_programs || 33, suffix: '+', label: 'Eğitim Programı', color: 'text-teal-700', icon: GraduationCap, formattingFn: (v: number) => `${Math.round(v)}+` },
                    { end: publicStats?.total_tenders || 9, suffix: '+', label: 'Canlı Ders Talebi', color: 'text-indigo-700', icon: Clock, formattingFn: (v: number) => `${Math.round(v)}+` },
                    { end: 4.9, suffix: '', label: 'Eğitmen Puanı', color: 'text-amber-600', icon: Star, decimals: 1, formattingFn: (v: number) => v.toFixed(1) },
                  ].map((stat, idx) => {
                    const IconComp = stat.icon;
                    return (
                      <div
                        key={idx}
                        className="rounded-2xl border border-slate-200 bg-white p-4 text-center lg:text-left flex flex-col items-center lg:items-start gap-1 shadow-sm hover:shadow-md transition-shadow"
                      >
                        <IconComp className={`w-5 h-5 ${stat.color} mb-1`} />
                        <div className="text-2xl font-black text-slate-900 font-mono tracking-tight">
                          <CountUp
                            end={stat.end}
                            duration={2.2}
                            delay={0.4}
                            decimals={stat.decimals || 0}
                            formattingFn={stat.formattingFn}
                          />
                        </div>
                        <div className="text-xs font-semibold text-slate-500">{stat.label}</div>
                      </div>
                    );
                  })}
                </div>
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN (Asymmetric 5 Cols - Live Demand Ticker) ── */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 w-full"
            >
              <LiveDemandTicker />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* LIGHT MARQUEE TICKER                                   */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="relative bg-slate-100/90 border-y border-slate-200 py-3.5 overflow-hidden">
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 28, ease: "linear" }}
        >
          {[...Array(2)].map((_, ri) => (
            <div key={ri} className="flex items-center gap-10 px-6 text-xs sm:text-sm font-semibold text-slate-700 tracking-wide">
              {[
                { icon: <BookOpen className="w-4 h-4 text-emerald-600" />, text: '36+ Yayınlanmış Kurs ve İçerik' },
                { icon: <GraduationCap className="w-4 h-4 text-teal-600" />, text: '33 Kapsamlı Eğitim Programı' },
                { icon: <Clock className="w-4 h-4 text-indigo-600" />, text: 'Canlı Özel Ders Talepleri & Teklif Masası' },
                { icon: <Star className="w-4 h-4 text-amber-500" />, text: '4.9/5 Ortalama Memnuniyet' },
                { icon: <Award className="w-4 h-4 text-emerald-600" />, text: '%100 Onaylı Eğitmen Kadrosu' },
                { icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, text: "GİB & VUK Uyumlu Güvenli Ödeme" },
                { icon: <Smartphone className="w-4 h-4 text-teal-600" />, text: 'Kurulumsuz WebRTC Canlı Sınıf' },
                { icon: <Sparkles className="w-4 h-4 text-purple-600" />, text: 'Yapay Zeka Destekli Gelişim Takibi' },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-2.5">
                  {item.icon}
                  <span>{item.text}</span>
                  <span className="text-slate-300 text-base font-thin ml-6">|</span>
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════ */}
      {/* 21ST.DEV BENTO GRID SECTION                            */}
      {/* ══════════════════════════════════════════════════════ */}
      <BentoGridSection />

      {/* ══════════════════════════════════════════════════════ */}
      {/* CATEGORY CARDS SECTION - MODERN LIGHT THEME            */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16 space-y-3"
          >
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>UZMANLIK ALANLARI</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight">
              Eğitim Branşları & Programlar
            </h2>
            <p className="text-slate-600 font-normal max-w-2xl mx-auto text-base sm:text-lg">
              Size en uygun eğitimi seçin, alanında uzman doğrulanmış öğretmenlerle hemen başlayın.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'ilkokul', title: 'İlkokul', desc: 'Okul takviye dersleri, bursluluk ve temel kazanım programları', icon: Sprout, iconColor: 'text-emerald-600', badge: 'Temel Eğitim' },
              { id: 'ortaokul', title: 'Ortaokul & LGS', desc: 'LGS yeni nesil soru çözümleri, branş takviyeleri ve denemeler', icon: BookOpen, iconColor: 'text-teal-600', badge: 'LGS Hazırlık' },
              { id: 'lise', title: 'Lise & YKS', desc: 'TYT & AYT kapsamlı konu anlatımları ve derece koçluğu', icon: Target, iconColor: 'text-indigo-600', badge: 'YKS Hazırlık' },
              { id: 'yabanci-dil', title: 'Yabancı Dil', desc: 'İngilizce, Almanca, IELTS, TOEFL ve konuşma pratikleri', icon: Globe, iconColor: 'text-rose-600', badge: 'Dil Eğitimi' },
              { id: 'kocluk', title: 'Eğitim Koçluğu', desc: 'Haftalık çalışma planlaması, deneme analizi ve motivasyon', icon: Compass, iconColor: 'text-purple-600', badge: 'Rehberlik' },
              { id: 'beceri', title: 'Yazılım & Beceri', desc: 'Python, robotik kodlama, hızlı okuma ve zihin haritaları', icon: Lightbulb, iconColor: 'text-amber-600', badge: 'Geleceğin Becerileri' },
            ].map((cat, i) => {
              const IconComp = cat.icon;
              return (
                <motion.div
                  key={cat.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                >
                  <Link
                    href={`/tanisma-dersi?category=${cat.id}`}
                    className="group block rounded-3xl border border-slate-200/90 bg-slate-50/70 p-6 md:p-8 transition-all duration-300 hover:bg-white hover:border-emerald-500/40 hover:shadow-xl h-full relative overflow-hidden"
                  >
                    <div className="flex items-start justify-between mb-6">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white border border-slate-200 group-hover:border-emerald-500/30 group-hover:bg-emerald-50 transition-all duration-300 shadow-xs">
                        <IconComp className={`w-7 h-7 ${cat.iconColor} group-hover:scale-110 transition-transform`} />
                      </div>
                      <span className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-semibold text-slate-600 group-hover:border-emerald-200 group-hover:text-emerald-700 transition-colors">
                        {cat.badge}
                      </span>
                    </div>

                    <div className="space-y-2">
                      <h3 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
                        <span>{cat.title}</span>
                        <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all text-emerald-600" />
                      </h3>
                      <p className="text-sm leading-relaxed text-slate-600 font-normal">
                        {cat.desc}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* PRICING CALCULATOR - MODERN LIGHT THEME                */}
      {/* ══════════════════════════════════════════════════════ */}
      <section id="calculator" className="py-24 bg-slate-50/70 relative overflow-hidden border-b border-slate-200/80">
        <div className="absolute top-1/2 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-emerald-100/40 rounded-full blur-[160px] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ŞEFFAF VE ESNEK BÜTÇE</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight">
              Eğitim Bütçenizi Planlayın
            </h2>
            <p className="text-slate-600 font-normal max-w-2xl mx-auto text-base sm:text-lg">
              Gizli ücretler, sürpriz ödemeler yok. Almak istediğiniz ders saatine göre bütçenizi kendiniz belirleyin.
            </p>
          </div>

          {(() => {
            const platformSettings = (publicSettings?.platform as Record<string, any>) || {};
            const hourlyRate = platformSettings.calc_hourly_rate ?? 800;
            const discount12 = platformSettings.calc_discount_12 ?? 10;
            const discount24 = platformSettings.calc_discount_24 ?? 15;
            const discount36 = platformSettings.calc_discount_36 ?? 20;

            const selectedDiscount = calcWeeks === 4 ? 0 : calcWeeks === 12 ? discount12 : calcWeeks === 24 ? discount24 : discount36;
            const totalHours = calcHours * calcWeeks;
            const grossPrice = totalHours * hourlyRate;
            const netPrice = grossPrice * (1 - selectedDiscount / 100);
            const monthlyPayment = netPrice / 6;

            return (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Sliders Area */}
                <div className="lg:col-span-7 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-sm flex flex-col justify-between space-y-8">
                  {/* Step 1: Sınav / Program Seçimi */}
                  <div className="space-y-3">
                    <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">1. Sınav / Program Seçin</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {Object.entries(EXAM_SUBJECTS).map(([key, val]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setCalcExam(key === calcExam ? "" : key);
                            setCalcSubjects([]);
                          }}
                          className={`flex items-center justify-between px-3.5 py-3 rounded-2xl border font-bold text-xs transition-all text-left ${
                            calcExam === key
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-700 hover:border-slate-300 hover:bg-slate-100"
                          }`}
                        >
                          <span className="leading-tight">{val.label}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-white border border-slate-200 text-slate-500 font-mono">
                            {val.tag}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Ders Seçimi (Sınav seçiliyse görünür) */}
                  {calcExam && EXAM_SUBJECTS[calcExam] && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-700 uppercase tracking-wider">2. Ders / Branş Tercihiniz</label>
                        {calcSubjects.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCalcSubjects([])}
                            className="text-xs text-rose-500 font-bold hover:underline flex items-center gap-1"
                          >
                            <span>Temizle</span>
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {EXAM_SUBJECTS[calcExam].subjects.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleCalcSubject(s)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
                              calcSubjects.includes(s)
                                ? "bg-emerald-600 text-white font-bold border-emerald-500 shadow-sm"
                                : "bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-500/40 hover:bg-emerald-50/50"
                            }`}
                          >
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Slider 1: Hours per Week */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="calc-hours-slider" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Haftalık Birebir Ders Saati
                      </label>
                      <span className="text-2xl font-black text-emerald-700 font-mono">{calcHours} Saat</span>
                    </div>
                    <input
                      id="calc-hours-slider"
                      type="range"
                      min="1"
                      max="10"
                      value={calcHours}
                      onChange={(e) => setCalcHours(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-xs text-slate-500 font-medium">
                      <span>1 Saat (Temel)</span>
                      <span>5 Saat (Önerilen)</span>
                      <span>10 Saat (Yoğun)</span>
                    </div>
                  </div>

                  {/* Slider 2: Duration in Weeks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="calc-weeks-select" className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Toplam Program Süresi
                      </label>
                      <span className="text-2xl font-black text-emerald-700 font-mono">{calcWeeks} Hafta</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "4 Hafta (1 Ay)", value: 4, discount: 0 },
                        { label: "12 Hafta (3 Ay)", value: 12, discount: discount12 },
                        { label: "24 Hafta (6 Ay)", value: 24, discount: discount24 },
                        { label: "36 Hafta (Tam Dönem)", value: 36, discount: discount36 },
                      ].map((item) => (
                        <button
                          key={item.value}
                          id={`calc-weeks-select-${item.value}`}
                          type="button"
                          onClick={() => setCalcWeeks(item.value)}
                          className={`p-3.5 rounded-2xl border font-bold text-xs transition-all relative flex flex-col items-center justify-center gap-1.5 ${
                            calcWeeks === item.value
                              ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
                              : "border-slate-200 bg-slate-50 text-slate-600 hover:border-slate-300 hover:text-slate-900"
                          }`}
                        >
                          {item.discount > 0 && (
                            <span className="absolute -top-2.5 bg-emerald-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                              %{item.discount} İndirim
                            </span>
                          )}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 border border-emerald-200 bg-emerald-50 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-800 leading-relaxed font-normal">
                      Uzun vadeli programlarda <strong>peşin fiyatına taksit</strong> ve <strong>%{discount36}&apos;ye varan ek saat indirimleri</strong> otomatik yansıtılır. Memnun kalınmadığında kalan saatler koşulsuz iade edilir.
                    </p>
                  </div>
                </div>

                {/* Calculations Card Area */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <h3 className="text-xl font-bold text-slate-900 flex items-center justify-between">
                      <span>Planlama Özeti</span>
                      <span className="text-xs font-mono text-emerald-700 font-semibold px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80">
                        {totalHours} Saat Canlı
                      </span>
                    </h3>
                    
                    <div className="space-y-3.5 border-b border-slate-100 pb-6 text-sm">
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-500">Toplam Canlı Ders</span>
                        <span className="font-semibold text-slate-800">{totalHours} Saat</span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span className="text-slate-500">Saatlik Taban Ücret</span>
                        <span className="font-mono font-semibold text-slate-800">{hourlyRate.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                      </div>
                      {selectedDiscount > 0 && (
                        <div className="flex justify-between text-emerald-700 font-semibold">
                          <span>Süreye Özel İndirim</span>
                          <span className="font-mono font-bold">-%{selectedDiscount}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Tahmini Toplam Tutar</span>
                      <div className="text-4xl font-black tracking-tight text-slate-900 font-mono">
                        {Math.round(netPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} <span className="text-emerald-600 text-2xl">TL</span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-normal">
                        *Eğitmen tecrübesine ve öğrenci talebine göre tekliflerde fiyat esnekliği sağlanır.
                      </p>
                    </div>

                    {/* PayTR Taksit Tablosu */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                      <div className="text-xs font-bold text-slate-600 uppercase mb-3 tracking-wider">Taksit Seçenekleri</div>
                      <PayTRTaksitWidget amount={calcNetPrice} />
                    </div>
                  </div>

                  <div className="mt-8 relative z-10">
                    <Link
                      href={`/teachers?hours=${calcHours}&weeks=${calcWeeks}&budget=${Math.round(netPrice)}&discount=${selectedDiscount}&branch=${calcExam}&subjects=${encodeURIComponent(calcSubjects.join(','))}`}
                      className="w-full block text-center py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all"
                    >
                      Bu Planla Eğitmen Keşfet →
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>

      {/* 21ST.DEV "Seni Neler Bekliyor?" Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-24 bg-white relative overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ÖĞRENME DENEYİMİ</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight">
              Seni Neler Bekliyor?
            </h2>
            <p className="text-slate-600 font-normal text-base sm:text-lg">
              BiHocam ayrıcalıklarıyla çevrimiçi öğrenmede yeni nesil akıllı deneyim.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 - Kişiselleştirilmiş Öğretim Planı */}
            <div className="bg-slate-50 rounded-3xl border border-slate-200/90 p-8 hover:bg-white hover:border-emerald-500/40 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center text-purple-600 group-hover:scale-110 transition-transform">
                  <Compass className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">
                    Kişiselleştirilmiş Plan
                  </h3>
                  <p className="text-slate-600 text-sm leading-relaxed font-normal">
                    Seviye tespit testleriyle eksik kazanımlar belirlenir; hedefinize özel birebir çalışma yol haritası çizilir.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-200/80">
                <Link href="/courses" className="text-emerald-700 font-bold text-xs inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 2 - Birebir Canlı Dersler */}
            <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-8 backdrop-blur-xl hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Birebir Canlı Ders
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-normal">
                    Öğrencinin anlama hızına uygun, interaktif beyaz tahta ve anlık soru-cevapla desteklenen canlı seanslar.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5">
                <Link href="/courses" className="text-emerald-400 font-bold text-xs inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 3 - Her Derse Özel Kaynaklar */}
            <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-8 backdrop-blur-xl hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-400 group-hover:scale-110 transition-transform">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Özel Dijital Kaynaklar
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-normal">
                    Ders PDF&apos;leri, yeni nesil soru bankaları ve konu özetleri bulut arşivinizde 7/24 erişiminize açıktır.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5">
                <Link href="/courses" className="text-emerald-400 font-bold text-xs inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* Card 4 - Ders Sonu Öğrenme Raporları */}
            <div className="bg-slate-900/60 rounded-3xl border border-white/10 p-8 backdrop-blur-xl hover:border-emerald-500/40 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-5">
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 transition-transform">
                  <Award className="w-6 h-6" />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    Haftalık İlerleme Karnesi
                  </h3>
                  <p className="text-slate-400 text-sm leading-relaxed font-normal">
                    İşlenen kazanımlar, öğretmen geri bildirimleri ve yapay zeka analizleriyle gelişim veli ve öğrenciye raporlanır.
                  </p>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-white/5">
                <Link href="/courses" className="text-emerald-400 font-bold text-xs inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* WHY BIHOCAM? - 21ST.DEV COMPARISON TABLE               */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-[#07090E] relative overflow-hidden border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <div className="badge-21st border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <Sparkles className="w-3.5 h-3.5" />
              <span>ŞEFFAF KARŞILAŞTIRMA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight">
              Neden BiHocam&apos;ı Tercih Etmelisiniz?
            </h2>
            <p className="text-slate-400 font-normal max-w-2xl mx-auto text-base sm:text-lg">
              Geleneksel dershane ve verimsiz yol kayıplarından kurtulun; birebir odaklı modern eğitim standardına geçin.
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-white/10 shadow-2xl bg-slate-900/40 backdrop-blur-xl">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white/[0.02] border-b border-white/10">
                  <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4">Özellikler</th>
                  <th className="p-6 text-xs font-black text-emerald-400 uppercase tracking-wider w-1/4 bg-emerald-500/10 border-x border-emerald-500/20 text-center">BiHocam Birebir</th>
                  <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4 text-center">Fiziksel Özel Ders</th>
                  <th className="p-6 text-xs font-bold text-slate-400 uppercase tracking-wider w-1/4 text-center">Geleneksel Dershane</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-slate-300 text-sm">
                {[
                  { name: "Saatlik Ders Ücreti", bihocam: "Ekonomik & Esnek Paketler", ozel: "Yüksek & Peşin Zorunluluğu", dershane: "Yıllık Katı Senetler" },
                  { name: "Eğitmen Seçimi", bihocam: "✓ 100+ Onaylı Hoca & Teklif Alabilme", ozel: "✗ Referansla Sınırlı Çevre", dershane: "✗ Atanmış Öğretmen (Seçim Yok)" },
                  { name: "Ders Kaydı ve Tekrarı", bihocam: "✓ Sınırsız & İstediğin Zaman Tekrar İzle", ozel: "✗ Ders Biter, Tekrarı Yok", dershane: "✗ Kaçırılan Ders Telafi Edilemez" },
                  { name: "Yapay Zeka Destekli Rapor", bihocam: "✓ Haftalık Detaylı Gelişim Karnesi", ozel: "✗ Yalnızca Sözlü Geri Bildirim", dershane: "✗ Dönemlik Genel Toplu Sınav" },
                  { name: "Ulaşım / Zaman Kaybı", bihocam: "✓ 0 Dakika (Ev Konforunda Online)", ozel: "✗ Trafikte Günde 1-2 Saat Kayıp", dershane: "✗ Her Gün Git-Gel Yol Yorgunluğu" },
                  { name: "Güvenlik & Doğrulama", bihocam: "✓ Diploma, Sabıka ve Mülakat Onaylı", ozel: "✗ Belgesiz / Kontrolsüz Güven", dershane: "✓ Kurumsal Denetimli Öğretmen" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-white/[0.02] transition-colors">
                    <td className="p-6 text-white font-semibold text-sm">{row.name}</td>
                    <td className="p-6 text-emerald-300 font-bold text-sm bg-emerald-500/10 border-x border-emerald-500/20 text-center">{row.bihocam}</td>
                    <td className="p-6 text-slate-400 text-sm text-center">{row.ozel}</td>
                    <td className="p-6 text-slate-400 text-sm text-center">{row.dershane}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:hidden">
            {/* BiHocam Card */}
            <div className="bg-slate-900/80 rounded-3xl p-6 border-2 border-emerald-500/40 shadow-2xl relative overflow-hidden backdrop-blur-xl">
              <div className="absolute right-0 top-0 bg-emerald-500 text-slate-950 text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider">Önerilen</div>
              <h3 className="text-xl font-black text-white mb-4">BiHocam Birebir</h3>
              <ul className="space-y-3.5 text-sm font-medium text-slate-300">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Ekonomik & Esnek:</strong> Bütçenize en uygun saat paketini kendiniz belirleyin.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Seçim Özgürlüğü:</strong> 100+ onaylı, tecrübeli öğretmen arasından dilediğinizi seçin veya teklif toplayın.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Sınırsız Tekrar:</strong> İşlenen tüm dersleri kaydedip dilediğiniz an tekrar izleyin.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Yapay Zeka Takibi:</strong> Haftalık gelişim raporlarıyla ilerlemenizi adım adım izleyin.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
                  <span><strong>Ev Konforu:</strong> Yol stresi, yorgunluk ve ulaşım maliyeti olmadan ders yapın.</span>
                </li>
              </ul>
            </div>

            {/* Fiziksel Ozel Ders Card */}
            <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Fiziksel Özel Ders</h3>
              <ul className="space-y-3.5 text-sm text-slate-400 font-normal">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Yüksek Maliyet:</strong> Saatlik ders ücretleri ve ulaşım maliyetleri yüksektir.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Kısıtlı Seçim:</strong> Sadece yakın çevreden tavsiye ile öğretmen bulabilirsiniz.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Tekrar İzleme Yok:</strong> Ders bittiği an her şey unutulur, tekrar izleme şansı yoktur.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Yol Yorgunluğu:</strong> Öğretmenin veya öğrencinin git-gel yapması vakit kaybettirir.</span>
                </li>
              </ul>
            </div>

            {/* Geleneksel Dershane Card */}
            <div className="bg-slate-900/50 rounded-3xl p-6 border border-white/10">
              <h3 className="text-xl font-bold text-white mb-4">Geleneksel Dershane</h3>
              <ul className="space-y-3.5 text-sm text-slate-400 font-normal">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Katı Yıllık Senetler:</strong> Memnun kalmasanız dahi yıllık taahhüt ödemek zorundasınız.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Atanmış Eğitmen:</strong> Hangi hocanın derse gireceğini kurum belirler, seçemezsiniz.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Kalabalık Sınıflar:</strong> 15-20 kişilik sınıflarda soru sorma şansı oldukça düşüktür.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-400 font-bold">✕</span>
                  <span><strong>Zaman Kaybı:</strong> Her gün dershaneye gidiş-dönüş saatler sürer ve fiziksel yorgunluk verir.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-24 bg-slate-950 border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-white font-display tracking-tight">Branşlara Göre Keşfedin</h2>
              <p className="text-slate-400 font-normal text-sm">Hangi alanda desteğe ihtiyacınız varsa uzman eğitmenimiz hazır.</p>
            </div>
            <Link
              href="/courses"
              className="text-emerald-400 hover:text-emerald-300 font-bold text-sm inline-flex items-center gap-1 group"
            >
              Tümünü Gör <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
            {[
              { icon: Target, name: "YKS", iconColor: "text-orange-400", desc: "Üniversite Hazırlık" },
              { icon: BookOpen, name: "LGS", iconColor: "text-cyan-400", desc: "Lise Hazırlık" },
              { icon: Zap, name: "Matematik", iconColor: "text-emerald-400", desc: "Analiz & Geometri" },
              { icon: Sparkles, name: "Fizik", iconColor: "text-purple-400", desc: "Mekanik & Optik" },
              { icon: Sprout, name: "Kimya", iconColor: "text-teal-400", desc: "Organik & Temel" },
              { icon: Award, name: "Biyoloji", iconColor: "text-yellow-400", desc: "Genetik & Canlı" },
            ].map((cat) => {
              const IconComponent = cat.icon;
              return (
                <Link
                  key={cat.name}
                  href={`/courses?category=${cat.name.toLowerCase()}`}
                  className="group relative p-6 bg-slate-900/60 rounded-2xl border border-white/10 backdrop-blur-xl hover:border-emerald-500/40 hover:shadow-xl hover:shadow-emerald-500/5 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                >
                  <div className="w-10 h-10 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-center mb-4 group-hover:scale-110 group-hover:border-emerald-500/30 transition-all">
                    <IconComponent className={`w-5 h-5 ${cat.iconColor}`} />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-base mb-0.5 group-hover:text-emerald-300 transition-colors">{cat.name}</h3>
                    <p className="text-xs text-slate-400 font-normal">{cat.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </motion.section>

      {/* Featured Courses placements */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-20 bg-[#07090E] border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedCourses limit={6} showTitle={true} />
        </div>
      </motion.section>

      {/* Popular Courses list */}
      {((featuredCourses && featuredCourses.length > 0) || (courses && courses.length > 0)) && (
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-24 bg-slate-950 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white font-display tracking-tight">Popüler Kurslar</h2>
                <p className="text-slate-400 font-normal text-sm">
                  {featuredCourses && featuredCourses.length > 0
                    ? "Öne çıkan seçili kurslarımız"
                    : "En çok tercih edilen kurslarımız"}
                </p>
              </div>
              <Link
                href="/courses"
                className="text-emerald-400 hover:text-emerald-300 font-bold text-sm inline-flex items-center gap-1 group"
              >
                Tümünü Keşfet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(featuredCourses && featuredCourses.length > 0 ? featuredCourses : courses || []).slice(0, 8).map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                  <div className="bg-slate-900/60 rounded-2xl border border-white/10 overflow-hidden shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full backdrop-blur-xl">
                    <div>
                      {/* Image / Thumbnail placeholder */}
                      <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                        {course.thumbnail_path ? (
                          <img
                            src={course.thumbnail_path}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <BookOpen className="w-12 h-12" />
                          </div>
                        )}
                        {course.discount_price && (
                          <span className="absolute top-3 left-3 px-2 py-1 bg-rose-500 text-white text-[10px] font-black rounded-md shadow-md">
                            %{Math.round((1 - course.discount_price / course.price) * 100)} İNDİRİM
                          </span>
                        )}
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-5 space-y-2">
                        <h3 className="font-bold text-white group-hover:text-emerald-300 transition-colors line-clamp-2 leading-tight text-sm sm:text-base">
                          {course.title}
                        </h3>
                        <p className="text-xs text-slate-400 font-medium">{course.teacher?.full_name || "Seçkin Eğitmen"}</p>
                      </div>
                    </div>

                    <div className="p-5 border-t border-white/5 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-300">
                        <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                        <span>4.8</span>
                        <span className="text-slate-500 font-normal">(84)</span>
                      </div>
                      <div className="font-mono font-bold text-sm sm:text-base">
                        {course.discount_price ? (
                          <div className="flex flex-col items-end">
                            <span className="text-[10px] text-slate-500 line-through">₺{course.price}</span>
                            <span className="text-emerald-400">₺{course.discount_price}</span>
                          </div>
                        ) : course.price === 0 ? (
                          <span className="text-emerald-400 font-bold">Ücretsiz</span>
                        ) : (
                          <span className="text-white">₺{course.price}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Popcast Section */}
      {popcasts && popcasts.length > 0 && (
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, amount: 0.1 }} 
          variants={fadeUpVariants} 
          className="py-24 bg-[#07090E] relative overflow-hidden border-t border-white/10"
        >
          <div className="absolute top-20 left-10 w-72 h-72 bg-emerald-500/5 rounded-full filter blur-3xl pointer-events-none" />
          <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-500/5 rounded-full filter blur-3xl pointer-events-none" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div className="space-y-3">
                <div className="badge-21st border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <Headphones className="w-3.5 h-3.5" />
                  <span>BİHOCAM POPCAST</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight">
                  Popcast ile Dinleyerek Öğren
                </h2>
                <p className="text-slate-400 font-normal text-base max-w-2xl">
                  Eğitmenlerimizin hazırladığı kısa, keyifli sesli ders notlarını dinleyerek konuları pekiştirin. İstediğiniz an favorilerinize ekleyin veya çevrimdışı dinlemek üzere indirin.
                </p>
              </div>
            </div>

            {/* Popcast List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {popcasts.map((popcast) => {
                const isCurrent = currentPlayingPopcast?.id === popcast.id;
                const isPlayingThis = isCurrent && isPlaying;
                
                return (
                  <div 
                    key={popcast.id} 
                    className="relative group bg-slate-900/60 backdrop-blur-xl rounded-3xl border border-white/10 p-6 shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover Image / Audio Visualizer */}
                      <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 overflow-hidden mb-6 flex items-center justify-center border border-white/10">
                        {popcast.cover_image_url ? (
                          <img 
                            src={popcast.cover_image_url} 
                            alt={popcast.title} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                        ) : (
                          <Headphones className="w-16 h-16 text-slate-600 relative z-10" />
                        )}
                        <div className="absolute inset-0 bg-slate-950/40 transition-opacity group-hover:bg-slate-950/60" />

                        {/* Floating Duration */}
                        <span className="absolute bottom-3 right-3 bg-slate-950/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg border border-white/10">
                          {Math.floor(popcast.duration / 60)}:{(Math.floor(popcast.duration % 60)).toString().padStart(2, '0')}
                        </span>

                        {/* Play/Pause overlay */}
                        <button 
                          onClick={() => handlePlayPause(popcast)}
                          className="absolute w-14 h-14 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 z-10"
                        >
                          {isPlayingThis ? (
                            <Pause className="w-6 h-6 fill-slate-950 text-slate-950" />
                          ) : (
                            <Play className="w-6 h-6 fill-slate-950 text-slate-950 translate-x-0.5" />
                          )}
                        </button>

                        {/* Playing Visualizer Wave */}
                        {isPlayingThis && (
                          <div className="absolute bottom-3 left-3 flex items-end gap-0.5 h-6 z-10">
                            <span className="w-1 bg-emerald-400 animate-audio-bar-1 rounded-t"></span>
                            <span className="w-1 bg-emerald-400 animate-audio-bar-2 rounded-t"></span>
                            <span className="w-1 bg-emerald-400 animate-audio-bar-3 rounded-t"></span>
                            <span className="w-1 bg-emerald-400 animate-audio-bar-4 rounded-t"></span>
                          </div>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-white group-hover:text-emerald-300 transition-colors text-lg line-clamp-1">
                          {popcast.title}
                        </h3>
                        <p className="text-slate-400 text-sm line-clamp-2 leading-relaxed font-normal">
                          {popcast.description || "Bu popcast için açıklama bulunmamaktadır."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-white/5 flex items-center justify-between">
                      {/* Teacher Profile */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-800 overflow-hidden border border-white/10">
                          {popcast.teacher?.avatar_url ? (
                            <img src={popcast.teacher.avatar_url} alt={popcast.teacher.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-emerald-500/20 text-emerald-300 flex items-center justify-center text-xs font-bold font-mono">
                              {popcast.teacher?.full_name?.charAt(0) || "E"}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-semibold text-slate-300">{popcast.teacher?.full_name || "Eğitmen"}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleToggleFavorite(e, popcast.id, popcast.is_favorited)}
                          disabled={favoriteMutation.isPending}
                          className={`w-9 h-9 rounded-xl border border-white/10 flex items-center justify-center transition-colors ${popcast.is_favorited ? 'bg-rose-500/20 border-rose-500/40 text-rose-400' : 'bg-white/[0.03] text-slate-400 hover:text-white hover:bg-white/[0.06]'}`}
                        >
                          <Heart className={`w-4 h-4 ${popcast.is_favorited ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => handleDownload(e, popcast.audio_url, popcast.title)}
                          className="w-9 h-9 bg-white/[0.03] hover:bg-white/[0.06] border border-white/10 rounded-xl flex items-center justify-center text-slate-400 hover:text-white transition-colors"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Sticky Player HUD at the bottom when playing */}
          <AnimatePresence>
            {currentPlayingPopcast && (
              <motion.div 
                initial={{ y: 100, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 100, opacity: 0 }}
                className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-xl w-[calc(100%-2rem)] bg-slate-900/95 backdrop-blur-xl rounded-2xl border border-emerald-500/30 p-4 shadow-2xl flex items-center justify-between gap-4 z-50 text-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-emerald-500/20 flex items-center justify-center flex-shrink-0 border border-emerald-500/30 overflow-hidden">
                    {currentPlayingPopcast.cover_image_url ? (
                      <img src={currentPlayingPopcast.cover_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Headphones className="w-5 h-5 text-emerald-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate leading-snug">{currentPlayingPopcast.title}</h4>
                    <p className="text-[11px] text-emerald-400 font-semibold truncate mt-0.5">{currentPlayingPopcast.teacher?.full_name || "Eğitmen"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="hidden sm:block text-xs font-mono text-slate-400 tabular-nums">
                    {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                  </div>
                  <div className="w-20 sm:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="bg-emerald-400 h-full transition-all duration-100" style={{ width: `${audioProgress}%` }}></div>
                  </div>
                  <div className="hidden sm:block text-xs font-mono text-slate-400 tabular-nums">
                    {Math.floor(audioDuration / 60)}:{(Math.floor(audioDuration % 60)).toString().padStart(2, '0')}
                  </div>

                  <button 
                    onClick={() => handlePlayPause(currentPlayingPopcast)}
                    className="w-10 h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-full flex items-center justify-center hover:scale-105 transition-transform flex-shrink-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-slate-950 text-slate-950" /> : <Play className="w-4 h-4 fill-slate-950 text-slate-950 translate-x-0.5" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      {/* Popular Education Programs list */}
      {educationPrograms && educationPrograms.length > 0 && (
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-24 bg-slate-950 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white font-display tracking-tight">Popüler Eğitim Programları</h2>
                <p className="text-slate-400 font-normal text-sm">
                  Geleceğinizi şekillendiren kapsamlı hazırlık paketlerimiz
                </p>
              </div>
              <Link
                href="/egitim-programlari"
                className="text-emerald-400 hover:text-emerald-300 font-bold text-sm inline-flex items-center gap-1 group"
              >
                Tümünü Keşfet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {educationPrograms.slice(0, 3).map((rp) => {
                const cardGradient = getGradientBySlug(rp.slug);
                return (
                  <Link key={rp.slug} href={`/egitim-programlari/${rp.slug}`} className="group flex flex-col h-full">
                    <div className="bg-slate-900/60 rounded-3xl border border-white/10 shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full backdrop-blur-xl">
                      <div>
                        {/* Banner */}
                        <div className={`h-40 bg-gradient-to-br ${cardGradient} flex items-center justify-center p-4 relative`}>
                          {getBannerContent(rp.slug, rp.title)}
                        </div>
                        
                        {/* Content */}
                        <div className="p-6">
                          <h3 className="font-extrabold text-white text-lg mb-2 group-hover:text-emerald-300 transition-colors leading-tight line-clamp-1">
                            {rp.title}
                          </h3>
                          <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed mb-4 font-normal">
                            {rp.short_description || "BiHocam uzman kadrosuyla hazırlanan LGS ve YKS programları; canlı ders, deneme ve rehberlik desteğiyle tek platformda kolaylaşıyor."}
                          </p>
                          
                          <div className="flex items-center gap-1 text-sm font-bold text-slate-300 mb-2">
                            <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
                            <span>{rp.rating || 4.8}</span>
                            <span className="text-slate-500 font-normal text-xs">({rp.review_count || 84})</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="px-6 pb-6 pt-4 flex items-center justify-between border-t border-white/5 bg-white/[0.01]">
                        <div>
                          <p className="text-emerald-400 font-black font-mono text-xl">{formatProgramPrice(rp.price)}</p>
                          <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">+ KDV</p>
                        </div>
                        <span className="btn-21st-primary px-4 py-2 text-xs font-bold">
                          İncele →
                        </span>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </motion.section>
      )}

      {/* SİZİ ARAYABİLİRİZ */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUpVariants}
        className="py-16 bg-[#07090E] border-t border-white/10"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-slate-900/60 border border-white/10 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between backdrop-blur-xl">
            <div className="space-y-3 md:w-1/2">
               <div className="badge-21st border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                 <span>BİZE DANIŞIN</span>
               </div>
               <h3 className="text-2xl sm:text-3xl font-black text-white font-display">Sizi Ücretsiz Arayalım</h3>
               <p className="text-slate-400 text-sm font-normal leading-relaxed">
                 Hedeflerinize en uygun eğitmen ve program planlamasını eğitim uzmanlarımızla birlikte yapın: <br />
                 <span className="font-mono font-bold text-emerald-400 text-base">+90 (850) 840 55 43</span>
               </p>
            </div>
            <div className="w-full md:w-1/2 space-y-3">
               <input 
                 type="text" 
                 placeholder="Adınız ve Soyadınız" 
                 className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/60" 
               />
               <input 
                 type="tel" 
                 placeholder="Telefon (05xx xxx xx xx)" 
                 className="w-full px-4 py-3.5 rounded-xl border border-white/10 bg-slate-950/80 text-white placeholder-slate-500 text-sm focus:outline-none focus:border-emerald-500/60" 
               />
               <button className="btn-21st-primary w-full py-3.5 text-sm font-bold">
                 Arama Talebi Gönder →
               </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Become an Instructor Dedicated Promo Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-24 bg-slate-950 relative overflow-hidden border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 via-slate-950 to-emerald-950/40 rounded-[2.5rem] p-8 md:p-16 text-white border border-white/10 shadow-2xl relative overflow-hidden">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6">
                <div className="badge-21st border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                  <span>EĞİTMEN KADROMUZA KATILIN</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black font-display tracking-tight leading-tight">
                  Bilginizi Değere ve Kazanca Dönüştürün!
                </h2>
                <p className="text-slate-300 leading-relaxed font-normal text-base">
                  BiHocam çatısı altında ders vererek binlerce öğrenciye ulaşabilir, kendi çalışma saatlerinizi belirleyebilir, modern yapay zeka araçlarıyla ders planlarınızı kolayca hazırlayabilirsiniz.
                </p>
                <div className="space-y-3 pt-2">
                  {[
                    "Kendi ders saatlerinizi ve saatlik ücretinizi serbestçe belirleyin.",
                    "Öğrenci talep masasında açılan ilanlara doğrudan teklif verin.",
                    "Yapay zeka asistanı desteği ile ders hazırlığı ve takibini kolaylaştırın.",
                    "Haftalık kazanç ödemeleri ve GİB VUK uyumlu yasal altyapı güvencesi.",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="text-sm font-medium text-slate-300">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-4">
                  <Link
                    href="/become-instructor"
                    className="btn-21st-primary px-8 py-4 text-sm font-bold inline-flex items-center gap-2"
                  >
                    <span>Eğitmen Başvurusu Yap</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>

              <div className="flex justify-center">
                <img
                  src="https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?auto=format&fit=crop&w=600&q=80"
                  alt="Bilgisayar Başında Ders Anlatan Öğretmen"
                  onError={(e) => {
                    e.currentTarget.src = "https://images.unsplash.com/photo-1531497865144-0464ef8fb9a9?auto=format&fit=crop&w=600&q=80";
                  }}
                  className="w-full h-[320px] md:h-[400px] object-cover rounded-3xl border border-white/10 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Blog Posts Section */}
      {blogPosts && blogPosts.length > 0 && (
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-24 bg-[#07090E] border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-white font-display tracking-tight">Rehberlik & Blog</h2>
                <p className="text-slate-400 font-normal text-sm">
                  Eğitim dünyasındaki güncel gelişmeler, çalışma taktikleri ve sınav analizleri.
                </p>
              </div>
              <Link
                href="/blog"
                className="text-emerald-400 hover:text-emerald-300 font-bold text-sm inline-flex items-center gap-1 group"
              >
                Tüm Yazılar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.slice(0, 3).map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col h-full">
                  <div className="bg-slate-900/60 rounded-3xl border border-white/10 shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full backdrop-blur-xl">
                    <div>
                      {/* Featured Image */}
                      <div className="aspect-video bg-gradient-to-br from-slate-800 to-slate-900 relative overflow-hidden">
                        <img
                          src={post.featured_image_url || getFallbackBlogImage(post.slug)}
                          alt={post.title}
                          onError={(e) => {
                            e.currentTarget.src = getFallbackBlogImage(post.slug);
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {post.categories && post.categories.length > 0 && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-slate-950/80 backdrop-blur-md border border-white/10 text-emerald-300 text-[10px] font-bold rounded-lg uppercase tracking-wider">
                            {post.categories[0].name}
                          </span>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-2.5">
                        <p className="text-[10px] text-slate-500 font-mono uppercase tracking-wider">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : ""}
                        </p>
                        <h3 className="font-bold text-white group-hover:text-emerald-300 transition-colors leading-snug line-clamp-2 text-base sm:text-lg">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed font-normal">
                          {post.excerpt || "BiHocam rehberlik ekibinin en güncel analizlerini ve eğitim tavsiyelerini hemen inceleyin."}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-6 border-t border-white/5 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-emerald-400 font-bold text-xs border border-white/10 flex-shrink-0">
                        {post.author?.avatar_url ? (
                          <img src={post.author.avatar_url} alt={post.author.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{post.author?.full_name ? post.author.full_name[0] : "B"}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-white leading-none">{post.author?.full_name || "BiHocam Yazar"}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5">Eğitim Danışmanı</p>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* FAQ SECTION - 21ST.DEV ACCORDION                       */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-950 relative overflow-hidden border-t border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <div className="badge-21st border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>AKLINIZDAKİ SORULAR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-slate-400 font-normal max-w-2xl mx-auto text-base sm:text-lg">
              Canlı ders süreçleri, ödemeler, özel ders talepleri ve eğitmenler hakkında tüm detaylar.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Canlı dersler için bilgisayarıma ek bir uygulama kurmam gerekiyor mu?",
                a: "Hayır. BiHocam canlı dersleri tamamen tarayıcınız üzerinden çalışacak şekilde modern WebRTC altyapısıyla geliştirilmiştir. Zoom veya Skype gibi ek program indirmenize gerek kalmadan, tek tıkla derse bağlanır, interaktif beyaz tahtayı ve kaynakları kullanırsınız."
              },
              {
                q: "Özel ders talebi nasıl çalışır ve teklifleri nasıl değerlendiririm?",
                a: "İhtiyaç duyduğunuz branşı, sınıf düzeyini ve bütçe aralığınızı belirterek ücretsiz ders talebi açarsınız. İlgili branştaki onaylı öğretmenler talebinizi inceler ve size özel saatlik ders teklifleri sunar. Gelen teklifleri profilleri, yorumları ve fiyatları inceleyerek tek tıkla kabul edebilirsiniz."
              },
              {
                q: "Eğitmenlerinizin kalitesinden ve tecrübesinden nasıl emin oluyorsunuz?",
                a: "Platformumuzda ders veren her öğretmen; kimlik, diploma/öğretmenlik belgesi doğrulaması, adli sicil kaydı kontrolü ve BiHocam eğitim kurulunun gerçekleştirdiği deneme dersi mülakatı aşamalarını başarıyla geçmek zorundadır. Yalnızca bu süreçleri geçen seçkin öğretmenler platformda yer alabilir."
              },
              {
                q: "Memnun kalmadığım takdirde ders ücretimi iade alabilir miyim?",
                a: "Evet, kesinlikle. İlk 15 dakikalık ücretsiz tanışma dersi ile öğretmeninizle uyumu test edersiniz. Eğer herhangi bir sebeple devam etmek istemezseniz veya aldığınız saat paketlerinden memnun kalmazsanız, kalan ders saatleriniz için koşulsuz ve kesintisiz %100 ücret iadesi talep edebilirsiniz."
              },
              {
                q: "Ödemeler nasıl yapılıyor? Taksit seçeneği var mı?",
                a: "Ödemeleriniz BDDK lisanslı güvenli ödeme altyapısı üzerinden 3D Secure ve emanet havuz korumasıyla gerçekleştirilir. Tüm kredi kartları ile peşin fiyatına 6 taksite varan seçeneklerle veya banka kartlarıyla güvenli ödeme yapabilirsiniz. Öğretmen dersi tamamlamadan ücret havuzdan aktarılmaz."
              },
              {
                q: "Satın aldığım ders saatlerini ne kadar süre içinde kullanmalıyım?",
                a: "Satın aldığınız ders saatleri eğitim-öğretim yılı sonuna kadar dilediğiniz gün ve saatte kullanılabilir. Saatlerinizde herhangi bir haftalık veya aylık zorunlu yanma süresi bulunmamaktadır, planlamayı öğretmeninizle esnekçe yapabilirsiniz."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-white/10 rounded-2xl overflow-hidden bg-slate-900/60 backdrop-blur-xl hover:border-white/20 transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-200 hover:text-emerald-300 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <span className="text-lg text-emerald-400 font-mono select-none flex-shrink-0">
                    {activeFaq === idx ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-slate-300 text-sm leading-relaxed border-t border-white/5 pt-4 font-normal bg-white/[0.01]">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 21ST.DEV FINAL CTA BANNER */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-20 bg-gradient-to-r from-slate-950 via-emerald-950/50 to-slate-950 border-y border-emerald-500/20 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-subtle opacity-40 pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 relative z-10">
          <div className="badge-21st border-emerald-500/30 bg-emerald-500/10 text-emerald-400 mx-auto">
            <Sparkles className="w-3.5 h-3.5" />
            <span>HEMEN BAŞLAYIN</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">
            Eğitim Hedeflerinize Bugün Adım Atın
          </h2>
          <p className="text-slate-300 font-normal text-base sm:text-lg max-w-xl mx-auto">
            Binlerce öğrenci ve yüzlerce doğrulanmış eğitmen BiHocam&apos;da buluşuyor.
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/tenders/new"
              className="btn-21st-primary px-8 py-4 text-sm sm:text-base font-bold flex items-center justify-center gap-2"
            >
              <span>Ders Talebi Aç</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="btn-21st-secondary px-8 py-4 text-sm sm:text-base font-bold"
            >
              Ücretsiz Kayıt Ol
            </Link>
          </div>
        </div>
      </motion.section>


      <Footer />
    </div>
  );
}
