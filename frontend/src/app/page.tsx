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
import { Play, Pause, Headphones, Heart, Download } from "lucide-react";
import PayTRTaksitWidget from "@/components/payment/PayTRTaksitWidget";
import Hero3DCanvas from "@/components/3d/Hero3DCanvas";
import TiltCard3D from "@/components/3d/TiltCard3D";

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
      badgeColor: "bg-rose-500",
      title: "Yeni Döneme Özel %20 İndirim!",
      description: "12, 24 ve 36 haftalık canlı ders programlarında büyük indirimler başladı. Ayrıca tüm kredi kartlarına peşin fiyatına 6 taksit avantajıyla bütçenizi zorlamadan başlayın.",
      actionText: "Hemen Hesapla",
      actionLink: "#calculator",
      bgGradient: "from-slate-950 via-indigo-950/80 to-slate-950",
      icon: "🎯"
    },
    {
      badge: "ÜCRETSİZ TANISMA DERSI",
      badgeColor: "bg-teal-500",
      title: "İlk Canlı Tanışma Dersiniz Bizden!",
      description: "Hangi branşta olursa olsun, dilediğiniz öğretmenle 15 dakikalık tanışma ve seviye tespit dersinizi tamamen ücretsiz gerçekleştirin.",
      actionText: "Eğitmenleri İncele",
      actionLink: "/teachers",
      bgGradient: "from-slate-950 via-teal-950/80 to-slate-950",
      icon: "🎁"
    },
    {
      badge: "YENİLİK",
      badgeColor: "bg-indigo-500",
      title: "Yapay Zeka Destekli Akıllı Öğrenim",
      description: "BiHocam AI koçluk modülü sayesinde hedeflerinize en uygun çalışma yol haritasını dakikalar içinde oluşturun, performansınızı anlık takip edin.",
      actionText: "AI Test Et",
      actionLink: "/tanisma-dersi",
      bgGradient: "from-indigo-950 via-slate-950 to-indigo-950",
      icon: "🤖"
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
  const EXAM_SUBJECTS: Record<string, { label: string; emoji: string; subjects: string[] }> = {
    yks: {
      label: "YKS Hazirlik", emoji: "🎓",
      subjects: ["Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Edebiyat", "Tarih", "Coğrafya", "İngilizce", "Felsefe", "Din Kültürü"],
    },
    lgs: {
      label: "LGS Hazirlik", emoji: "🎯",
      subjects: ["Matematik", "Fen Bilimleri", "Türkçe", "İnkılap Tarihi", "Din Kültürü", "İngilizce"],
    },
    takviye: {
      label: "Okul Takviye", emoji: "📚",
      subjects: ["Matematik", "Fen Bilimleri", "Türkçe", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "İngilizce", "Edebiyat"],
    },
    yabanci_dil: {
      label: "Yabancı Dil", emoji: "🌍",
      subjects: ["İngilizce", "Almanca", "Fransızca", "İspanyolca", "İtalyanca", "Rusça"],
    },
    beceri: {
      label: "Beceri Gelistirme", emoji: "🎨",
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

  return (
    <div className="min-h-screen bg-slate-50/50">
      {activePopup && (
        <PopupAnnouncement
          popup={activePopup}
          onClose={() => dismissPopup(activePopup.id, false)}
          onDismiss={dismissPopup}
        />
      )}

      <Header />

      {/* ══════════════════════════════════════════════════════ */}
      {/* HERO - ANIMATED PREMIUM REDESIGN                     */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 overflow-hidden">
        {/* Animated Mesh Gradient Background with 3D Spatial Canvas */}
        <div className="absolute inset-0 -z-10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-teal-50/60 to-indigo-50/40" />
          
          {/* Interactive 3D Spatial Canvas */}
          <Hero3DCanvas className="absolute inset-0 z-0 opacity-80" />

          {/* Morphing Blob 1 */}
          <motion.div
            className="absolute -top-32 -left-32 w-[600px] h-[600px] bg-teal-300/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1], x: [0, 40, 0], y: [0, -20, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Morphing Blob 2 */}
          <motion.div
            className="absolute -bottom-20 -right-20 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-3xl"
            animate={{ scale: [1, 1.15, 1], x: [0, -30, 0], y: [0, 20, 0] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          />
          {/* Morphing Blob 3 */}
          <motion.div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-rose-200/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.3, 1] }}
            transition={{ duration: 12, repeat: Infinity, ease: "easeInOut", delay: 4 }}
          />
          {/* Dot grid pattern */}
          <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: 'radial-gradient(circle, #0d9488 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        </div>

        {/* Floating Education Icons */}
        <div className="absolute inset-0 overflow-hidden -z-10 pointer-events-none">
          {[
            { emoji: '📚', top: '10%', left: '5%', delay: 0, duration: 5 },
            { emoji: '🎓', top: '15%', right: '8%', delay: 1, duration: 6 },
            { emoji: '✏️', top: '60%', left: '3%', delay: 2, duration: 4.5 },
            { emoji: '🔬', bottom: '20%', right: '5%', delay: 0.5, duration: 7 },
            { emoji: '📐', top: '35%', left: '8%', delay: 3, duration: 5.5 },
            { emoji: '🧮', bottom: '30%', right: '10%', delay: 1.5, duration: 6 },
            { emoji: '🌟', top: '75%', left: '15%', delay: 2.5, duration: 4 },
            { emoji: '💡', top: '25%', right: '15%', delay: 1, duration: 5 },
          ].map((item, i) => (
            <motion.div
              key={i}
              className="absolute text-3xl select-none"
              style={{ top: item.top, left: (item as any).left, right: (item as any).right, bottom: (item as any).bottom }}
              animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0], opacity: [0.5, 0.9, 0.5] }}
              transition={{ duration: item.duration, repeat: Infinity, ease: 'easeInOut', delay: item.delay }}
            >
              {item.emoji}
            </motion.div>
          ))}
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 items-center">
            
            {/* ── LEFT COLUMN ── */}
            <div className="lg:col-span-6 space-y-8 text-center lg:text-left">

              {/* Badge */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
                className="inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full bg-gradient-to-r from-teal-500/10 to-indigo-500/10 border border-teal-300/40 text-teal-700 text-xs font-bold uppercase tracking-wider shadow-sm"
              >
                <motion.span
                  animate={{ rotate: [0, 20, -10, 0] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  🚀
                </motion.span>
                Türkiye'nin En İyi Eğitim Platformu
                <span className="flex w-2 h-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500"></span>
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                className="text-5xl md:text-6xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.05]"
              >
                Geleceğinizi{" "}
                <br className="hidden lg:block" />
                Şekillendirecek{" "}
                <span className="relative inline-block">
                  <span className="text-shimmer">Eğitmenler</span>
                  {/* Underline wave */}
                  <motion.svg
                    className="absolute -bottom-2 left-0 w-full"
                    viewBox="0 0 300 12"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1.2, delay: 0.8 }}
                  >
                    <motion.path
                      d="M0,8 Q75,0 150,8 Q225,16 300,8"
                      fill="none"
                      stroke="url(#waveGrad)"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <defs>
                      <linearGradient id="waveGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#0d9488" />
                        <stop offset="100%" stopColor="#6366f1" />
                      </linearGradient>
                    </defs>
                  </motion.svg>
                </span>
                {" "}Burada!
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.4 }}
                className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed"
              >
                YKS, LGS, Lise, İlkokul ve tüm branşlarda Türkiye'nin en seçkin eğitmen kadrosuyla{" "}
                <span className="font-bold text-teal-700">birebir canlı dersler</span>,{" "}
                <span className="font-bold text-indigo-700">interaktif testler</span> ve{" "}
                <span className="font-bold text-rose-600">yapay zeka desteği</span>'ne hemen ulaşın.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.6 }}
                className="flex flex-col sm:flex-row flex-wrap justify-start items-center gap-3 pt-6 pb-3 w-full"
              >
                <Link
                  href="/register"
                  className="group relative w-full sm:w-auto px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 xl:py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-2xl text-sm lg:text-base overflow-hidden shadow-lg shadow-teal-500/25 hover:shadow-xl hover:shadow-teal-500/40 transform hover:-translate-y-1 transition-all duration-300 whitespace-nowrap text-center"
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    Ücretsiz Başla
                    <motion.span animate={{ x: [0, 4, 0] }} transition={{ duration: 1.5, repeat: Infinity }}>
                      →
                    </motion.span>
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>

                <Link
                  href="/become-instructor"
                  className="w-full sm:w-auto px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 xl:py-4 bg-white text-gray-800 font-bold rounded-2xl border-2 border-gray-200 hover:border-teal-500 hover:text-teal-600 transform hover:-translate-y-1 transition-all duration-300 text-sm lg:text-base shadow-sm whitespace-nowrap text-center"
                >
                  Eğitmen Olmak İstiyorum
                </Link>

                <Link
                  href="/tanisma-dersi"
                  className="inline-flex w-full sm:w-auto items-center justify-center gap-2 px-4 sm:px-5 lg:px-6 py-3 sm:py-3.5 xl:py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-blue-600/25 hover:shadow-xl hover:shadow-blue-600/40 transform hover:-translate-y-1 transition-all duration-300 text-sm lg:text-base whitespace-nowrap text-center"
                >
                  🎯 Tanışma Dersi Al
                </Link>
              </motion.div>

              {/* ── Animated Stats ── */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1 }}
                className="pt-8 border-t border-gray-200/60"
              >
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-2xl mx-auto lg:mx-0">
                  {[
                    { end: 15000, suffix: '+', label: 'Aktif Öğrenci', color: 'text-teal-600', bg: 'bg-teal-50', emoji: '👨‍🎓', decimals: 0, formattingFn: (v: number) => v >= 1000 ? `${(v/1000).toFixed(0)}K+` : `${v}` },
                    { end: 500, suffix: '+', label: 'Premium Ders', color: 'text-indigo-600', bg: 'bg-indigo-50', emoji: '📚', decimals: 0, formattingFn: (v: number) => `${Math.round(v)}+` },
                    { end: 100, suffix: '+', label: 'Seçkin Eğitmen', color: 'text-rose-600', bg: 'bg-rose-50', emoji: '👨‍🏫', decimals: 0, formattingFn: (v: number) => `${Math.round(v)}+` },
                    { end: 4.9, suffix: '', label: 'Ort. Puan', color: 'text-amber-600', bg: 'bg-amber-50', emoji: '⭐', decimals: 1, formattingFn: (v: number) => v.toFixed(1) },
                  ].map((stat) => (
                    <motion.div
                      key={stat.label}
                      whileHover={{ scale: 1.05 }}
                      className={`${stat.bg} rounded-2xl p-4 text-center lg:text-left flex flex-col items-center lg:items-start gap-1 border border-white shadow-sm`}
                    >
                      <span className="text-2xl">{stat.emoji}</span>
                      <div className={`text-2xl font-black ${stat.color} tracking-tight`}>
                        <CountUp
                          end={stat.end}
                          duration={2.5}
                          delay={1.2}
                          decimals={stat.decimals}
                          formattingFn={stat.formattingFn}
                        />
                      </div>
                      <div className="text-xs font-bold text-gray-500">{stat.label}</div>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            {/* ── RIGHT COLUMN – Animated Visual ── */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 1, delay: 0.3 }}
              className="lg:col-span-6 flex justify-center relative lg:-mt-16"
            >
              {/* Outer glow ring */}
              <div className="relative w-full max-w-[680px]">
                {/* Spinning orbit ring 1 */}
                <motion.div
                  className="absolute inset-0 rounded-full border-2 border-dashed border-teal-300/40"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 30, repeat: Infinity, ease: 'linear' }}
                />
                {/* Spinning orbit ring 2 */}
                <motion.div
                  className="absolute -inset-8 rounded-full border border-dashed border-indigo-300/30"
                  animate={{ rotate: -360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
                />

                {/* Floating badge cards */}
                <motion.div
                  className="absolute -top-6 -left-8 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3 z-20"
                  animate={{ y: [0, -8, 0] }}
                  transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
                >
                  <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center text-xl">✅</div>
                  <div>
                    <p className="text-xs font-black text-gray-800">Ders Tamamlandı!</p>
                    <p className="text-[10px] text-gray-400">Matematik • 45 dk</p>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute -bottom-4 -right-6 bg-white rounded-2xl shadow-xl border border-gray-100 px-4 py-3 flex items-center gap-3 z-20"
                  animate={{ y: [0, 8, 0] }}
                  transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                >
                  <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center text-xl">⭐</div>
                  <div>
                    <p className="text-xs font-black text-gray-800">Harika İlerleme!</p>
                    <p className="text-[10px] text-gray-400">Bu haftaki performans</p>
                  </div>
                </motion.div>

                <motion.div
                  className="absolute top-1/2 -right-10 -translate-y-1/2 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl shadow-xl px-4 py-3 flex items-center gap-2 z-20"
                  animate={{ x: [0, 6, 0] }}
                  transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: 0.5 }}
                >
                  <span className="text-2xl">🤖</span>
                  <div>
                    <p className="text-xs font-black text-white">AI Asistan</p>
                    <p className="text-[10px] text-teal-100">Hazır & Aktif</p>
                  </div>
                </motion.div>

                {/* Main Visual: 3D Tilt Premium Campaigns & Announcements Slider Banner */}
                <TiltCard3D maxTilt={7} glareOpacity={0.25} depth={20} className="w-full">
                  <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border-4 border-white bg-slate-950 aspect-video w-full flex flex-col justify-between p-6 sm:p-10 group/banner">
                    {/* Backdrop glowing background */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${campaigns[activeCampaignSlide].bgGradient} transition-all duration-700 ease-in-out`} />
                    
                    {/* Decorative mesh/grid pattern overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1px,transparent_1px)] [background-size:16px_16px] opacity-60 z-10" />

                    {/* Slide Content */}
                    <AnimatePresence mode="wait">
                      <motion.div
                        key={activeCampaignSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.4 }}
                        className="relative z-10 flex flex-col justify-between h-full space-y-6"
                      >
                        {/* Top Row: Badge & Large Icon */}
                        <div className="flex items-center justify-between">
                          <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-black text-white tracking-widest uppercase ${campaigns[activeCampaignSlide].badgeColor} shadow-md`}>
                            {campaigns[activeCampaignSlide].badge}
                          </span>
                          <span className="text-4xl filter drop-shadow-md select-none">{campaigns[activeCampaignSlide].icon}</span>
                        </div>

                        {/* Main Copy */}
                        <div className="space-y-3 text-left">
                          <h3 className="text-xl sm:text-2xl md:text-3xl font-black text-white leading-tight tracking-tight">
                            {campaigns[activeCampaignSlide].title}
                          </h3>
                          <p className="text-slate-300 text-xs sm:text-sm font-medium leading-relaxed max-w-xl">
                            {campaigns[activeCampaignSlide].description}
                          </p>
                        </div>

                        {/* Call to Action Button */}
                        <div className="text-left">
                          <Link
                            href={campaigns[activeCampaignSlide].actionLink}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white text-slate-900 font-bold rounded-xl text-xs hover:bg-teal-50 transition-all shadow-lg hover:scale-105 active:scale-95"
                          >
                            <span>{campaigns[activeCampaignSlide].actionText}</span>
                            <span className="text-base">→</span>
                          </Link>
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    {/* Slide controls: Dots */}
                    <div className="absolute bottom-4 right-6 flex items-center gap-2 z-20">
                      {campaigns.map((_, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveCampaignSlide(idx)}
                          className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                            idx === activeCampaignSlide
                              ? "bg-teal-400 w-6"
                              : "bg-white/30 hover:bg-white/50"
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </TiltCard3D>

                {/* Online indicator */}
                <div className="absolute top-4 right-4 bg-white/90 backdrop-blur rounded-full px-3 py-1.5 flex items-center gap-2 shadow-md z-20">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                  </span>
                  <span className="text-xs font-bold text-gray-700">Canlı Ders Aktif</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* ANIMATED MARQUEE TICKER                              */}
      {/* ══════════════════════════════════════════════════════ */}
      <div className="relative bg-gradient-to-r from-teal-600 via-teal-500 to-emerald-600 text-white py-4 overflow-hidden border-y border-teal-700/30 shadow-inner">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-24 bg-gradient-to-r from-teal-600 to-transparent z-10" />
        <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-emerald-600 to-transparent z-10" />
        <motion.div
          className="flex whitespace-nowrap"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
        >
          {[...Array(2)].map((_, ri) => (
            <div key={ri} className="flex items-center gap-10 px-6 text-sm md:text-base font-semibold tracking-wide">
              {[
                { icon: '🚀', text: '15.000+ Aktif Öğrenci' },
                { icon: '⭐', text: '4.9 Ortalama Memnuniyet' },
                { icon: '👨‍🏫', text: '100+ Seçkin Eğitmen' },
                { icon: '🎯', text: "YKS'de Yüksek Başarı" },
                { icon: '💻', text: 'Kişiselleştirilmiş Eğitim' },
                { icon: '🏆', text: "Türkiye'nin #1 Eğitim Platformu" },
                { icon: '📱', text: 'Her Cihazdan Erişim' },
                { icon: '🤖', text: 'Yapay Zeka Destekli' },
              ].map((item, i) => (
                <span key={i} className="flex items-center gap-3">
                  <span className="text-lg">{item.icon}</span>
                  <span>{item.text}</span>
                  <span className="text-teal-300/60 text-xl font-thin">|</span>
                </span>
              ))}
            </div>
          ))}
        </motion.div>
      </div>


      {/* ══════════════════════════════════════════════════════ */}
      {/* ANIMATED CATEGORY CARDS                              */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">Kategoriler</span>
            <h2 className="text-4xl md:text-5xl font-black text-slate-900 mb-4">Eğitim Kategorileri</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-lg">
              Size en uygun eğitimi seçin ve hemen başarıya adım atın.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { id: 'ilkokul', title: 'İlkokul', desc: 'Takviye dersler ve bursluluk sınavı hazırlığı', emoji: '🌱', gradient: 'from-pink-400 via-rose-400 to-pink-500', shadowColor: 'shadow-pink-300/50' },
              { id: 'ortaokul', title: 'Ortaokul', desc: 'LGS hazırlık ve takviye dersler', emoji: '📖', gradient: 'from-amber-400 via-yellow-400 to-orange-400', shadowColor: 'shadow-amber-300/50' },
              { id: 'lise', title: 'Lise', desc: 'YKS hazırlık ve takviye dersler', emoji: '🎯', gradient: 'from-teal-400 via-emerald-400 to-cyan-500', shadowColor: 'shadow-teal-300/50' },
              { id: 'yabanci-dil', title: 'Yabancı Dil', desc: 'Sınav hazırlığı ve dil becerileri', emoji: '🌍', gradient: 'from-red-400 via-rose-500 to-pink-500', shadowColor: 'shadow-red-300/50' },
              { id: 'kocluk', title: 'Koçluk', desc: 'Eğitim ve öğrenci koçluğu', emoji: '🧭', gradient: 'from-blue-500 via-indigo-500 to-violet-500', shadowColor: 'shadow-blue-300/50' },
              { id: 'beceri', title: 'Beceri', desc: 'Hızlı okuma, robotik, müzik, vb.', emoji: '💡', gradient: 'from-violet-500 via-purple-500 to-fuchsia-500', shadowColor: 'shadow-violet-300/50' },
            ].map((cat, i) => (
              <motion.div
                key={cat.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
              >
                <TiltCard3D maxTilt={10} glareOpacity={0.2} depth={15} className="h-full">
                  <Link
                    href={`/tanisma-dersi?category=${cat.id}`}
                    className="group block rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full"
                  >
                    {/* Card top gradient area */}
                    <div className={`relative h-44 bg-gradient-to-br ${cat.gradient} flex items-center justify-center overflow-hidden`}>
                      {/* Animated circles */}
                      <motion.div
                        className="absolute -top-8 -right-8 w-32 h-32 bg-white/20 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut', delay: i * 0.3 }}
                      />
                      <motion.div
                        className="absolute -bottom-4 -left-4 w-20 h-20 bg-white/15 rounded-full"
                        animate={{ scale: [1, 1.3, 1] }}
                        transition={{ duration: 3.5, repeat: Infinity, ease: 'easeInOut', delay: i * 0.2 }}
                      />
                      {/* Sparkle particles */}
                      {[...Array(4)].map((_, pi) => (
                        <motion.div
                          key={pi}
                          className="absolute w-1.5 h-1.5 bg-white/60 rounded-full"
                          style={{
                            top: `${20 + pi * 18}%`,
                            left: `${10 + pi * 22}%`,
                          }}
                          animate={{ opacity: [0, 1, 0], scale: [0, 1.5, 0] }}
                          transition={{ duration: 2, repeat: Infinity, delay: pi * 0.5 + i * 0.3 }}
                        />
                      ))}
                      {/* Central emoji */}
                      <motion.div
                        className="relative z-10 flex flex-col items-center"
                        whileHover={{ scale: 1.2, rotate: 5 }}
                      >
                        <motion.span
                          className="text-7xl drop-shadow-lg select-none"
                          animate={{ y: [0, -8, 0] }}
                          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut', delay: i * 0.4 }}
                        >
                          {cat.emoji}
                        </motion.span>
                      </motion.div>
                    </div>

                    {/* Card body */}
                    <div className="bg-white px-6 py-5 flex items-center justify-between border-t-0">
                      <div>
                        <h3 className="text-xl font-black text-slate-900 group-hover:text-teal-600 transition-colors">{cat.title}</h3>
                        <p className="text-slate-500 text-sm font-medium mt-0.5">{cat.desc}</p>
                      </div>
                      <motion.div
                        className="flex-shrink-0 w-10 h-10 rounded-full bg-gray-100 group-hover:bg-teal-500 flex items-center justify-center transition-all duration-300"
                        whileHover={{ scale: 1.1 }}
                      >
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </motion.div>
                    </div>
                  </Link>
                </TiltCard3D>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
      {/* ══════════════════════════════════════════════════════ */}
      {/* PRICING CALCULATOR - BUDGET PLANNER                    */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50 relative overflow-hidden border-y border-slate-100">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(20,184,166,0.05),transparent_50%)] pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">Şeffaf Fiyatlandırma</span>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Eğitim Bütçenizi Kolayca Planlayın</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-base">
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
                <div className="lg:col-span-7 bg-white rounded-3xl p-8 shadow-xl border border-slate-100/50 flex flex-col justify-between space-y-8">
                  {/* Step 1: Sınav / Program Seçimi */}
                  <div className="space-y-3">
                    <label className="text-lg font-bold text-slate-800">Sınav / Program Seçin</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                      {Object.entries(EXAM_SUBJECTS).map(([key, val]) => (
                        <button
                          key={key}
                          type="button"
                          onClick={() => {
                            setCalcExam(key === calcExam ? "" : key);
                            setCalcSubjects([]);
                          }}
                          className={`flex items-center gap-2 px-3 py-2.5 rounded-2xl border-2 font-bold text-xs transition-all text-left ${
                            calcExam === key
                              ? "border-teal-500 bg-teal-50 text-teal-800 shadow-sm"
                              : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200 hover:bg-slate-100"
                          }`}
                        >
                          <span className="text-lg flex-shrink-0">{val.emoji}</span>
                          <span className="leading-tight">{val.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Step 2: Ders Seçimi (Sınav seçiliyse görünür) */}
                  {calcExam && EXAM_SUBJECTS[calcExam] && (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <label className="text-sm font-bold text-slate-800">Ders / Branş Tercihiniz</label>
                        {calcSubjects.length > 0 && (
                          <button
                            type="button"
                            onClick={() => setCalcSubjects([])}
                            className="text-xs text-rose-500 font-bold hover:underline"
                          >
                            Temizle ✕
                          </button>
                        )}
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {EXAM_SUBJECTS[calcExam].subjects.map((s) => (
                          <button
                            key={s}
                            type="button"
                            onClick={() => toggleCalcSubject(s)}
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              calcSubjects.includes(s)
                                ? "bg-teal-500 text-white border-teal-500 shadow-sm"
                                : "bg-slate-50 text-slate-600 border-slate-100 hover:border-teal-300 hover:text-teal-600"
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
                      <label htmlFor="calc-hours-slider" className="text-lg font-bold text-slate-800">Haftalık Birebir Ders Saati</label>
                      <span className="text-2xl font-black text-teal-600 font-mono">{calcHours} Saat</span>
                    </div>
                    <input
                      id="calc-hours-slider"
                      type="range"
                      min="1"
                      max="10"
                      value={calcHours}
                      onChange={(e) => setCalcHours(parseInt(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-semibold">
                      <span>1 Saat (Minimum)</span>
                      <span>5 Saat (Önerilen)</span>
                      <span>10 Saat (Yoğun)</span>
                    </div>
                  </div>

                  {/* Slider 2: Duration in Weeks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="calc-weeks-select" className="text-lg font-bold text-slate-800">Toplam Program Süresi</label>
                      <span className="text-2xl font-black text-teal-600 font-mono">{calcWeeks} Hafta</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {[
                        { label: "4 Hafta (1 Ay)", value: 4, discount: 0 },
                        { label: "12 Hafta (3 Ay)", value: 12, discount: discount12 },
                        { label: "24 Hafta (6 Ay)", value: 24, discount: discount24 },
                        { label: "36 Hafta (Eğitim Dönemi)", value: 36, discount: discount36 },
                      ].map((item) => (
                        <button
                          key={item.value}
                          id={`calc-weeks-select-${item.value}`}
                          type="button"
                          onClick={() => setCalcWeeks(item.value)}
                          className={`p-4 rounded-2xl border-2 font-bold text-xs transition-all relative flex flex-col items-center justify-center gap-1.5 ${
                            calcWeeks === item.value
                              ? "border-teal-500 bg-teal-50/20 text-teal-800"
                              : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"
                          }`}
                        >
                          {item.discount > 0 && (
                            <span className="absolute -top-2.5 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                              %{item.discount} İndirim
                            </span>
                          )}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="bg-teal-50/30 rounded-2xl p-4 border border-teal-100/30 flex items-start gap-3">
                    <span className="text-xl">💡</span>
                    <p className="text-xs text-teal-800 leading-relaxed font-medium">
                      Uzun vadeli programlarda <strong>peşin fiyatına taksit</strong> ve <strong>%{discount36}'ye varan ek saat indirimleri</strong> otomatik olarak bütçenize yansıtılır. Memnun kalınmadığı takdirde kalan saatlerin ücreti koşulsuz iade edilir.
                    </p>
                  </div>
                </div>

                {/* Calculations Card Area */}
                <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 to-slate-950 text-white rounded-3xl p-8 shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(20,184,166,0.15),transparent_60%)] pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <h3 className="text-xl font-bold text-slate-200">Planlama Özeti</h3>
                    
                    <div className="space-y-4 border-b border-slate-800 pb-6 text-sm font-semibold">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Toplam Canlı Ders</span>
                        <span>{totalHours} Saat</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Saatlik Taban Ücret</span>
                        <span>{hourlyRate.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                      </div>
                      {selectedDiscount > 0 && (
                        <div className="flex justify-between text-rose-400 font-bold">
                          <span>Süreye Özel İndirim</span>
                          <span>-%{selectedDiscount}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Tahmini Toplam Tutar</span>
                      <div className="text-4xl font-black tracking-tight text-white font-mono">
                        {Math.round(netPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL
                      </div>
                      <p className="text-[10px] text-slate-500 font-semibold mt-1">
                        *Fiyatlar öğretmenlerin tecrübe seviyesine göre değişiklik gösterebilir.
                      </p>
                    </div>

                    {/* PayTR Taksit Tablosu */}
                    <div className="bg-slate-800/50 rounded-2xl p-4 border border-slate-800/30">
                      <div className="text-xs font-bold text-slate-400 uppercase mb-3">Taksit Seçenekleri</div>
                      <PayTRTaksitWidget amount={calcNetPrice} />
                    </div>
                  </div>

                  <div className="mt-8 relative z-10">
                    <Link
                      href={`/teachers?hours=${calcHours}&weeks=${calcWeeks}&budget=${Math.round(netPrice)}&discount=${selectedDiscount}&branch=${calcExam}&subjects=${encodeURIComponent(calcSubjects.join(','))}`}
                      className="w-full block text-center bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold py-4 rounded-2xl transition-all shadow-lg shadow-teal-500/20 hover:shadow-teal-500/30 text-sm"
                    >
                      Bu Planla Eğitmen Keşfet
                    </Link>
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      </section>




      {/* Ads placements Banners */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-8 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <AdBanner placementCode="homepage_banner" />
        </div>
      </motion.section>

      {/* "Seni Neler Bekliyor?" Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-20 bg-white relative overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-teal-500/5 rounded-full filter blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-4">
            <h2 className="text-4xl font-black text-gray-900 tracking-tight">Seni Neler Bekliyor?</h2>
            <p className="text-gray-600 font-semibold text-base">
              bihocam.com ayrıcalıklarıyla çevrimiçi öğrenme deneyimine hazır mısın?
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Card 1 - Kişiselleştirilmiş Öğretim Planı */}
            <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm hover:shadow-xl hover:border-teal-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-purple-50 flex items-center justify-center text-purple-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 11a3 3 0 106 0a3 3 0 00-6 0z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Kişiselleştirilmiş Öğretim Planı</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Öğrencilerimizin ihtiyaç duydukları derslere başlamadan önce uzmanlarımız tarafından hazırlanan ön testlerin sonuçlarına göre hangi konuda neler bildiğine dair bir değerlendirme süreci gerçekleştirilir.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/courses" className="text-rose-500 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <span className="text-lg">→</span>
                </Link>
              </div>
            </div>

            {/* Card 2 - Birebir veya Grup Dersleri */}
            <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm hover:shadow-xl hover:border-teal-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-500 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Birebir veya Grup Dersleri</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Birebir veya grup dersleri, öğrencilerin öğrenme hızlarına, öğrenme stillerine ve ihtiyaçlarına uygun özelleştirilmiş bir öğrenme deneyimi sunar.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/courses" className="text-rose-500 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <span className="text-lg">→</span>
                </Link>
              </div>
            </div>

            {/* Card 3 - Her Derse Özel Kaynaklar */}
            <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm hover:shadow-xl hover:border-teal-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Her Derse Özel Kaynaklar</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Dijital kaynaklar, öğrencilerin internet erişimi olan herhangi bir yerden ders materyallerine erişmelerine ve öğrenmelerine yardımcı olur.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/courses" className="text-rose-500 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <span className="text-lg">→</span>
                </Link>
              </div>
            </div>

            {/* Card 4 - Ders Sonu Öğrenme Raporları */}
            <div className="bg-white rounded-3xl border border-gray-200/60 p-8 shadow-sm hover:shadow-xl hover:border-teal-300/50 hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group">
              <div className="space-y-6">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center text-emerald-600 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div className="space-y-3">
                  <h3 className="text-xl font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Ders Sonu Öğrenme Raporları</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">
                    Ders raporları ve ölçme değerlendirme, öğrencilerin öğrenme sürecini değerlendirmek için önemli bir araçtır.
                  </p>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/courses" className="text-rose-500 font-bold text-sm inline-flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                  Daha Fazla Öğren <span className="text-lg">→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* WHY BIHOCAM? - COMPARISON TABLE                       */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">Şeffaf Karşılaştırma</span>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Neden BiHocam'ı Tercih Etmelisiniz?</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-base">
              Geleneksel yöntemlerin kısıtlamalarından kurtulun. BiHocam ile geleceğin eğitimini bugünden yaşayın.
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-100 shadow-xl">
            <table className="w-full text-left border-collapse bg-white">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100">
                  <th className="p-6 text-sm font-bold text-slate-400 uppercase tracking-wider w-1/4">Özellikler</th>
                  <th className="p-6 text-sm font-black text-teal-600 uppercase tracking-wider w-1/4 bg-teal-50/30 border-x border-teal-100/50 text-center">BiHocam Birebir</th>
                  <th className="p-6 text-sm font-bold text-slate-500 uppercase tracking-wider w-1/4 text-center">Fiziksel Özel Ders</th>
                  <th className="p-6 text-sm font-bold text-slate-500 uppercase tracking-wider w-1/4 text-center">Geleneksel Dershane</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 font-medium">
                {[
                  { name: "Saatlik Ders Ücreti", bihocam: "Ekonomik & Esnek Ödeme", ozel: "Çok Yüksek & Peşin", dershane: "Yıllık Sabit Yüksek Paket" },
                  { name: "Eğitmen Seçimi", bihocam: "✓ 100+ Onaylı Hoca Arasından Özgürce", ozel: "✗ Referansla Sınırlı Tanıdık Hocalar", dershane: "✗ Atanmış Öğretmen (Seçim Yok)" },
                  { name: "Ders Kaydı ve Tekrarı", bihocam: "✓ Sınırsız & İstediğin Zaman Tekrar İzle", ozel: "✗ Ders Anında Biter, Tekrarı Yok", dershane: "✗ Kaçırılan Dersin Telafisi Yok" },
                  { name: "Yapay Zeka Destekli Rapor", bihocam: "✓ Haftalık Detaylı Gelişim Raporları", ozel: "✗ Sadece Sözlü Geri Bildirim", dershane: "✗ Yılda Birkaç Kez Toplu Sınav Raporu" },
                  { name: "Ulaşım / Zaman Kaybı", bihocam: "✓ 0 Dakika (Ev Konforunda Online)", ozel: "✗ Trafikte Günde 1-2 Saat Kayıp", dershane: "✗ Her Gün Git-Gel Yol Yorgunluğu" },
                  { name: "Güvenlik & Doğrulama", bihocam: "✓ Diploma, Sabıka ve Mülakat Kontrollü", ozel: "✗ Belgesiz / Kontrolsüz Güven İlişkisi", dershane: "✓ Kurumsal Denetimli Öğretmen" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/30 transition-colors">
                    <td className="p-6 text-slate-900 font-bold text-sm">{row.name}</td>
                    <td className="p-6 text-teal-700 font-black text-sm bg-teal-50/20 border-x border-teal-100/30 text-center">{row.bihocam}</td>
                    <td className="p-6 text-slate-500 text-sm text-center">{row.ozel}</td>
                    <td className="p-6 text-slate-500 text-sm text-center">{row.dershane}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:hidden">
            {/* BiHocam Card */}
            <div className="bg-gradient-to-b from-teal-50/50 to-white rounded-3xl p-6 border-2 border-teal-500 shadow-lg relative overflow-hidden">
              <div className="absolute right-0 top-0 bg-teal-500 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider">Önerilen</div>
              <h3 className="text-xl font-black text-teal-800 mb-4">BiHocam Birebir</h3>
              <ul className="space-y-3.5 text-sm font-semibold text-slate-700">
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-500 text-lg leading-none">✓</span>
                  <span><strong>Ekonomik & Esnek:</strong> Bütçenize en uygun saat paketini kendiniz belirleyin.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-500 text-lg leading-none">✓</span>
                  <span><strong>Seçim Özgürlüğü:</strong> 100+ onaylı, tecrübeli öğretmen arasından dilediğinizi seçin.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-500 text-lg leading-none">✓</span>
                  <span><strong>Sınırsız Tekrar:</strong> İşlenen tüm dersleri kaydedip dilediğiniz an tekrar izleyin.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-500 text-lg leading-none">✓</span>
                  <span><strong>Yapay Zeka Takibi:</strong> Haftalık gelişim raporlarıyla ilerlemenizi adım adım izleyin.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-teal-500 text-lg leading-none">✓</span>
                  <span><strong>Ev Konforu:</strong> Yol stresi, yorgunluk ve ulaşım maliyeti olmadan ders yapın.</span>
                </li>
              </ul>
            </div>

            {/* Fiziksel Ozel Ders Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Fiziksel Özel Ders</h3>
              <ul className="space-y-3.5 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 text-lg leading-none">✗</span>
                  <span><strong>Çok Yüksek Maliyet:</strong> Saatlik ders ücretleri ve ulaşım maliyetleri yüksektir.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 text-lg leading-none">✗</span>
                  <span><strong>Kısıtlı Seçim:</strong> Sadece yakın çevreden tavsiye ile öğretmen bulabilirsiniz.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 text-lg leading-none">✗</span>
                  <span><strong>Tekrar İzleme Yok:</strong> Ders bittiği an her şey unutulur, tekrar izleme şansı yoktur.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 text-lg leading-none">✗</span>
                  <span><strong>Yol Yorgunluğu:</strong> Öğretmenin veya öğrencinin git-gel yapması vakit kaybettirir.</span>
                </li>
              </ul>
            </div>

            {/* Geleneksel Dershane Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-md">
              <h3 className="text-xl font-bold text-slate-800 mb-4">Geleneksel Dershane</h3>
              <ul className="space-y-3.5 text-sm text-slate-600 font-medium">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 text-lg leading-none">✗</span>
                  <span><strong>Katı Yıllık Senetler:</strong> Memnun kalmasanız dahi yıllık taahhüt ödemek zorundasınız.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 text-lg leading-none">✗</span>
                  <span><strong>Atanmış Eğitmen:</strong> Hangi hocanın derse gireceğini kurum belirler, seçemezsiniz.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 text-lg leading-none">✗</span>
                  <span><strong>Kalabalık Sınıflar:</strong> 15-20 kişilik sınıflarda soru sorma şansı oldukça düşüktür.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 text-lg leading-none">✗</span>
                  <span><strong>Zaman Kaybı:</strong> Her gün dershaneye gidiş-dönüş saatler sürer ve fiziksel yorgunluk verir.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Popular Categories Grid */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-gray-900 tracking-tight">Branşlara Göre Keşfedin</h2>
              <p className="text-gray-500 font-semibold text-sm">Hangi alanda yardıma ihtiyacınız varsa uzman eğitmenimiz hazır.</p>
            </div>
            <Link
              href="/courses"
              className="text-teal-600 hover:text-teal-700 font-bold text-sm inline-flex items-center gap-1 group"
            >
              Tümünü Gör <span className="group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[
              { icon: "🎯", name: "YKS", color: "from-orange-400 to-red-500", desc: "Üniversite Hazırlık" },
              { icon: "📖", name: "LGS", color: "from-teal-400 to-cyan-500", desc: "Lise Hazırlık" },
              { icon: "🔢", name: "Matematik", color: "from-blue-400 to-indigo-500", desc: "Analiz & Geometri" },
              { icon: "⚛️", name: "Fizik", color: "from-purple-400 to-pink-500", desc: "Mekanik & Optik" },
              { icon: "🧪", name: "Kimya", color: "from-emerald-400 to-green-500", desc: "Organik & Temel" },
              { icon: "🧬", name: "Biyoloji", color: "from-yellow-400 to-orange-500", desc: "Genetik & Canlı" },
            ].map((cat) => (
              <Link
                key={cat.name}
                href={`/courses?category=${cat.name.toLowerCase()}`}
                className="group relative p-6 bg-white rounded-2xl border border-gray-200/60 shadow-sm hover:shadow-xl hover:border-teal-300 transition-all duration-300 flex flex-col justify-between overflow-hidden"
              >
                {/* Accent line */}
                <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${cat.color}`}></div>
                <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-300">{cat.icon}</div>
                <div>
                  <h3 className="font-bold text-gray-900 text-lg mb-1">{cat.name}</h3>
                  <p className="text-xs font-semibold text-gray-400">{cat.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Courses placements */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedCourses limit={6} showTitle={true} />
        </div>
      </motion.section>

      {/* Popular Courses list */}
      {((featuredCourses && featuredCourses.length > 0) || (courses && courses.length > 0)) && (
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Popüler Kurslar</h2>
                <p className="text-gray-500 font-semibold text-sm">
                  {featuredCourses && featuredCourses.length > 0
                    ? "Öne çıkan seçili kurslarımız"
                    : "En çok tercih edilen kurslarımız"}
                </p>
              </div>
              <Link
                href="/courses"
                className="text-teal-600 hover:text-teal-700 font-bold text-sm inline-flex items-center gap-1 group"
              >
                Tümünü Keşfet <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {(featuredCourses && featuredCourses.length > 0 ? featuredCourses : courses || []).slice(0, 8).map((course) => (
                <Link key={course.id} href={`/courses/${course.slug}`} className="group">
                  <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between h-full">
                    <div>
                      {/* Image / Thumbnail placeholder */}
                      <div className="aspect-video bg-gradient-to-br from-teal-500 to-indigo-600 relative overflow-hidden">
                        {course.thumbnail_path ? (
                          <img
                            src={course.thumbnail_path}
                            alt={course.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white/50 text-5xl font-black">📚</div>
                        )}
                        {course.discount_price && (
                          <span className="absolute top-3 left-3 px-2 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-md">
                            %{Math.round((1 - course.discount_price / course.price) * 100)} İNDİRİM
                          </span>
                        )}
                      </div>
                      
                      {/* Card Content */}
                      <div className="p-5 space-y-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 leading-tight">
                          {course.title}
                        </h3>
                        <p className="text-sm font-semibold text-gray-400">{course.teacher?.full_name || "Seçkin Eğitmen"}</p>
                      </div>
                    </div>

                    <div className="p-5 border-t border-gray-100 flex items-center justify-between">
                      <div className="flex items-center gap-1 text-sm font-bold text-gray-700">
                        <span className="text-yellow-500 text-base">★</span>
                        <span>4.8</span>
                        <span className="text-gray-400 font-semibold text-xs">(84)</span>
                      </div>
                      <div className="font-black text-gray-900 text-lg">
                        {course.discount_price ? (
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-400 line-through font-semibold">₺{course.price}</span>
                            <span className="text-teal-600">₺{course.discount_price}</span>
                          </div>
                        ) : course.price === 0 ? (
                          <span className="text-teal-600 font-bold">Ücretsiz</span>
                        ) : (
                          <span>₺{course.price}</span>
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
          className="py-24 bg-gradient-to-b from-slate-50 to-slate-100 relative overflow-hidden"
        >
          {/* Animated Background blobs */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
            <div className="absolute top-20 left-10 w-72 h-72 bg-teal-200 rounded-full filter blur-3xl animate-blob"></div>
            <div className="absolute bottom-20 right-10 w-72 h-72 bg-indigo-200 rounded-full filter blur-3xl animate-blob animation-delay-2000"></div>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-50 border border-teal-100 rounded-full text-teal-600 text-xs font-bold uppercase tracking-wider">
                  <Headphones className="w-3.5 h-3.5" /> BiHocam Popcast
                </div>
                <h2 className="text-4xl font-black text-gray-900 tracking-tight">Popcast ile Dinleyerek Öğren</h2>
                <p className="text-gray-500 font-semibold text-base max-w-2xl">
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
                    className="relative group bg-white/70 backdrop-blur-md rounded-3xl border border-white/40 p-6 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover Image / Audio Visualizer */}
                      <div className="relative aspect-video rounded-2xl bg-gradient-to-br from-teal-400 to-indigo-500 overflow-hidden mb-6 flex items-center justify-center shadow-inner">
                        {popcast.cover_image_url ? (
                          <img 
                            src={popcast.cover_image_url} 
                            alt={popcast.title} 
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                        ) : (
                          <Headphones className="w-16 h-16 text-white/30 relative z-10" />
                        )}
                        <div className="absolute inset-0 bg-black/35 transition-opacity group-hover:bg-black/45" />

                        {/* Floating Duration */}
                        <span className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md text-white text-[11px] font-black px-2.5 py-1 rounded-lg">
                          {Math.floor(popcast.duration / 60)}:{(Math.floor(popcast.duration % 60)).toString().padStart(2, '0')}
                        </span>

                        {/* Play/Pause overlay */}
                        <button 
                          onClick={() => handlePlayPause(popcast)}
                          className="absolute w-14 h-14 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 hover:bg-teal-600 transition-all duration-200 z-10"
                        >
                          {isPlayingThis ? (
                            <Pause className="w-6 h-6 fill-white" />
                          ) : (
                            <Play className="w-6 h-6 fill-white translate-x-0.5" />
                          )}
                        </button>

                        {/* Playing Visualizer Wave */}
                        {isPlayingThis && (
                          <div className="absolute bottom-3 left-3 flex items-end gap-0.5 h-6 z-10">
                            <span className="w-1 bg-teal-400 animate-audio-bar-1 rounded-t"></span>
                            <span className="w-1 bg-teal-400 animate-audio-bar-2 rounded-t"></span>
                            <span className="w-1 bg-teal-400 animate-audio-bar-3 rounded-t"></span>
                            <span className="w-1 bg-teal-400 animate-audio-bar-4 rounded-t"></span>
                          </div>
                        )}
                      </div>

                      {/* Title & Desc */}
                      <div className="space-y-2">
                        <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors text-lg line-clamp-1">
                          {popcast.title}
                        </h3>
                        <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                          {popcast.description || "Bu popcast için açıklama bulunmamaktadır."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-gray-100 flex items-center justify-between">
                      {/* Teacher Profile */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-200 overflow-hidden">
                          {popcast.teacher?.avatar_url ? (
                            <img src={popcast.teacher.avatar_url} alt={popcast.teacher.full_name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">
                              {popcast.teacher?.full_name?.charAt(0) || "E"}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-gray-700">{popcast.teacher?.full_name || "Eğitmen"}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={(e) => handleToggleFavorite(e, popcast.id, popcast.is_favorited)}
                          disabled={favoriteMutation.isPending}
                          className={`w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center transition-colors ${popcast.is_favorited ? 'bg-rose-50 border-rose-100 text-rose-500 hover:bg-rose-100' : 'bg-white hover:bg-slate-50 text-gray-400 hover:text-gray-600'}`}
                        >
                          <Heart className={`w-4 h-4 ${popcast.is_favorited ? 'fill-rose-500' : ''}`} />
                        </button>
                        <button 
                          onClick={(e) => handleDownload(e, popcast.audio_url, popcast.title)}
                          className="w-9 h-9 bg-white hover:bg-slate-50 border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
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
                className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-xl w-[calc(100%-2rem)] bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-2xl flex items-center justify-between gap-4 z-50 text-white"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0 border border-teal-500/30 overflow-hidden">
                    {currentPlayingPopcast.cover_image_url ? (
                      <img src={currentPlayingPopcast.cover_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Headphones className="w-5 h-5 text-teal-400" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <h4 className="font-bold text-sm truncate leading-snug">{currentPlayingPopcast.title}</h4>
                    <p className="text-[11px] text-teal-400/90 font-semibold truncate mt-0.5">{currentPlayingPopcast.teacher?.full_name || "Eğitmen"}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  {/* Timeline progress indicator */}
                  <div className="hidden sm:block text-xs font-semibold text-slate-400 tabular-nums">
                    {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
                  </div>
                  <div className="w-20 sm:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                    <div className="bg-teal-400 h-full transition-all duration-100" style={{ width: `${audioProgress}%` }}></div>
                  </div>
                  <div className="hidden sm:block text-xs font-semibold text-slate-400 tabular-nums">
                    {Math.floor(audioDuration / 60)}:{(Math.floor(audioDuration % 60)).toString().padStart(2, '0')}
                  </div>

                  <button 
                    onClick={() => handlePlayPause(currentPlayingPopcast)}
                    className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center hover:scale-105 hover:bg-teal-600 transition-transform flex-shrink-0"
                  >
                    {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.section>
      )}

      {/* Popular Education Programs list */}
      {educationPrograms && educationPrograms.length > 0 && (
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Popüler Eğitim Programları</h2>
                <p className="text-gray-500 font-semibold text-sm">
                  Geleceğinizi şekillendiren kapsamlı hazırlık paketlerimiz
                </p>
              </div>
              <Link
                href="/egitim-programlari"
                className="text-teal-600 hover:text-teal-700 font-bold text-sm inline-flex items-center gap-1 group"
              >
                Tümünü Keşfet <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {educationPrograms.slice(0, 3).map((rp) => {
                const cardGradient = getGradientBySlug(rp.slug);
                return (
                  <Link key={rp.slug} href={`/egitim-programlari/${rp.slug}`} className="group flex flex-col h-full">
                    <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
                      <div>
                        {/* Banner */}
                        <div className={`h-40 bg-gradient-to-br ${cardGradient} flex items-center justify-center p-4 relative`}>
                          {getBannerContent(rp.slug, rp.title)}
                        </div>
                        
                        {/* Content */}
                        <div className="p-6">
                          <h3 className="font-extrabold text-gray-900 text-lg mb-2 group-hover:text-teal-600 transition-colors leading-tight line-clamp-1">
                            {rp.title}
                          </h3>
                          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-4">
                            {rp.short_description || "BiHocam uzman kadrosuyla hazırlanan LGS ve YKS programları; canlı ders, deneme ve rehberlik desteğiyle tek platformda kolaylaşıyor."}
                          </p>
                          
                          <div className="flex items-center gap-1 text-sm font-bold text-gray-700 mb-2">
                            <span className="text-yellow-500 text-base">★</span>
                            <span>{rp.rating || 4.8}</span>
                            <span className="text-gray-400 font-semibold text-xs">({rp.review_count || 84})</span>
                          </div>
                        </div>
                      </div>

                      {/* Footer Info */}
                      <div className="px-6 pb-6 pt-4 flex items-center justify-between border-t border-gray-50 bg-slate-50/20">
                        <div>
                          <p className="text-rose-500 font-black text-xl">{formatProgramPrice(rp.price)}</p>
                          <p className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest">+ KDV</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="bg-rose-50 text-rose-500 text-[10px] font-extrabold px-2.5 py-1 rounded-lg border border-rose-100">
                            %95
                          </span>
                          <span 
                            className="px-5 py-2.5 bg-rose-500 text-white text-xs font-bold rounded-xl hover:bg-rose-600 transition-colors shadow-sm hover:shadow cursor-pointer"
                          >
                            Detay
                          </span>
                        </div>
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
        className="py-12 bg-slate-50"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gray-200/50 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between">
            <div className="space-y-4 md:w-1/2">
               <div className="text-blue-600 font-bold uppercase tracking-wider text-sm">SİZİ ARAYABİLİRİZ</div>
               <h3 className="text-3xl font-black text-slate-900">Numaranızı bırakabilirsiniz.</h3>
               <p className="text-slate-700 text-sm font-medium">
                 Size aşağıdaki kurumsal iletişim hattımızdan ulaşacağız: <br />
                 <span className="font-bold text-slate-900">+90 (850) 840 55 43</span>
               </p>
            </div>
            <div className="w-full md:w-1/2 space-y-4">
               <input type="text" placeholder="Adınız ve soyadınız" className="w-full px-5 py-4 rounded-xl border border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
               <input type="tel" placeholder="Telefon 5xx xxx xx xx" className="w-full px-5 py-4 rounded-xl border border-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500" />
               <button className="w-full bg-orange-400 hover:bg-orange-500 text-white font-bold py-4 rounded-xl shadow-md transition-colors">
                 Arama Talebi Oluştur
               </button>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Become an Instructor Dedicated Promo Section (dersheryerde.com Vibe) */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-24 bg-white relative overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[30rem] h-[30rem] bg-indigo-50 rounded-full blur-3xl -z-10"></div>
        <div className="absolute -bottom-32 -left-32 w-[30rem] h-[30rem] bg-teal-50 rounded-full blur-3xl -z-10"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-br from-slate-900 to-indigo-950 rounded-[3rem] p-8 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PHBhdGggZD0iTTM2IDM0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-30"></div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center relative z-10">
              <div className="space-y-6">
                <div className="inline-flex px-4 py-1.5 rounded-full bg-indigo-500/20 border border-indigo-400/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
                  Eğitmen Kadromuza Katılın
                </div>
                <h2 className="text-4xl md:text-5xl font-black tracking-tight leading-tight">
                  Bilginizi Kazanca Dönüştürün!
                </h2>
                <p className="text-indigo-100/80 leading-relaxed font-medium">
                  BiHocam çatısı altında ders vererek binlerce öğrenciye ulaşabilir, kendi çalışma saatlerinizi belirleyebilir, modern yapay zeka araçlarıyla ders planlarınızı kolayca hazırlayabilirsiniz.
                </p>
                <div className="space-y-3 pt-2">
                  {[
                    "Kendi ders saatlerinizi ve ücretinizi serbestçe belirleyin.",
                    "Öğrenci eşleştirme sistemimiz ile derslerinizi anında başlatın.",
                    "Yapay zeka asistanı desteği ile ders hazırlığı ve takibini kolaylaştırın.",
                    "Haftalık kazanç ödemeleri ve şeffaf IBAN hesap yönetimi.",
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-start gap-3">
                      <span className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-xs text-white font-bold flex-shrink-0 mt-0.5">✓</span>
                      <span className="text-sm font-semibold text-slate-100">{item}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-6">
                  <Link
                    href="/become-instructor"
                    className="inline-flex px-8 py-4 bg-gradient-to-r from-teal-400 to-teal-500 text-slate-900 font-bold rounded-2xl hover:shadow-xl hover:shadow-teal-400/20 transform hover:-translate-y-0.5 transition-all"
                  >
                    Hemen Başvuruda Bulun →
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
                  className="w-full h-[320px] md:h-[400px] object-cover drop-shadow-2xl rounded-[2.5rem] border border-white/10 shadow-2xl"
                />
              </div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Blog Posts Section */}
      {blogPosts && blogPosts.length > 0 && (
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-20 bg-slate-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-gray-900 tracking-tight">Son Yazılarımız</h2>
                <p className="text-gray-500 font-semibold text-sm">
                  Eğitim dünyasındaki güncel gelişmeler, çalışma taktikleri ve rehberlik içeriklerimiz
                </p>
              </div>
              <Link
                href="/blog"
                className="text-teal-600 hover:text-teal-700 font-bold text-sm inline-flex items-center gap-1 group"
              >
                Tüm Blog Yazıları <span className="group-hover:translate-x-1 transition-transform">→</span>
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.slice(0, 3).map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col h-full">
                  <div className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
                    <div>
                      {/* Featured Image */}
                      <div className="aspect-video bg-gradient-to-br from-teal-500 to-indigo-600 relative overflow-hidden">
                        <img
                          src={post.featured_image_url || getFallbackBlogImage(post.slug)}
                          alt={post.title}
                          onError={(e) => {
                            e.currentTarget.src = getFallbackBlogImage(post.slug);
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {post.categories && post.categories.length > 0 && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-teal-500 text-white text-[10px] font-bold rounded-lg shadow-md uppercase tracking-wider">
                            {post.categories[0].name}
                          </span>
                        )}
                      </div>

                      {/* Card Body */}
                      <div className="p-6 space-y-3">
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                          {post.published_at
                            ? new Date(post.published_at).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                              })
                            : ""}
                        </p>
                        <h3 className="font-extrabold text-gray-900 group-hover:text-teal-600 transition-colors leading-snug line-clamp-2 text-lg">
                          {post.title}
                        </h3>
                        <p className="text-xs text-gray-500 line-clamp-3 leading-relaxed">
                          {post.excerpt || "BiHocam rehberlik ekibinin en güncel analizlerini ve eğitim tavsiyelerini hemen inceleyin."}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-6 border-t border-gray-100 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-teal-50 flex items-center justify-center text-teal-600 font-bold text-xs shadow-inner flex-shrink-0">
                        {post.author?.avatar_url ? (
                          <img src={post.author.avatar_url} alt={post.author.full_name} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <span>{post.author?.full_name ? post.author.full_name[0] : "B"}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-gray-900 leading-none">{post.author?.full_name || "BiHocam Yazar"}</p>
                        <p className="text-[9px] text-gray-400 font-semibold mt-0.5">Yazar</p>
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
      {/* FAQ SECTION - OBJECTION BUSTER ACCORDION                */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-slate-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16">
            <span className="inline-block px-4 py-1.5 bg-teal-100 text-teal-700 text-xs font-bold uppercase tracking-widest rounded-full mb-4">Aklınızdaki Sorular</span>
            <h2 className="text-4xl font-black text-slate-900 mb-4">Sıkça Sorulan Sorular</h2>
            <p className="text-slate-500 font-medium max-w-2xl mx-auto text-base">
              Canlı ders süreçleri, ödemeler ve eğitmenler hakkında merak ettiğiniz tüm detaylar.
            </p>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "Canlı dersler için bilgisayarıma ek bir uygulama kurmam gerekiyor mu?",
                a: "Hayır. BiHocam canlı dersleri tamamen tarayıcınız üzerinden çalışacak şekilde geliştirilmiştir. Zoom, Skype veya benzeri herhangi bir ek program indirmenize veya kurmanıza gerek kalmadan, tek tıkla derse bağlanır, interaktif beyaz tahtayı ve kaynakları kullanırsınız."
              },
              {
                q: "Eğitmenlerinizin kalitesinden ve tecrübesinden nasıl emin oluyorsunuz?",
                a: "Platformumuzda ders veren her öğretmen; kimlik, diploma/öğretmenlik belgesi doğrulaması, adli sicil kaydı kontrolü ve BiHocam eğitim kurulunun gerçekleştirdiği deneme dersi mülakatı aşamalarını başarıyla geçmek zorundadır. Sadece bu süreçleri geçen seçkin öğretmenler platformda yer alabilir."
              },
              {
                q: "Memnun kalmadığım takdirde ders ücretimi iade alabilir miyim?",
                a: "Evet, kesinlikle. İlk 15 dakikalık ücretsiz tanışma dersi ile öğretmeninizle uyumu test edersiniz. Eğer herhangi bir sebeple devam etmek istemezseniz veya aldığınız saat paketlerinden memnun kalmazsanız, kalan ders saatleriniz için koşulsuz ve kesintisiz %100 ücret iadesi talep edebilirsiniz."
              },
              {
                q: "Ödemeler nasıl yapılıyor? Taksit seçeneği var mı?",
                a: "Ödemeleriniz BDDK onaylı İyzico altyapısı üzerinden 3D Secure güvencesiyle gerçekleştirilir. Tüm kredi kartları ile peşin fiyatına taksit veya banka kartlarıyla güvenli peşin ödeme yapabilirsiniz."
              },
              {
                q: "Satın aldığım ders saatlerini ne kadar süre içinde kullanmalıyım?",
                a: "Satın aldığınız ders saatleri eğitim-öğretim yılı sonuna kadar dilediğiniz gün ve saatte kullanılabilir. Saatlerinizde herhangi bir haftalık veya aylık zorunlu yanma süresi bulunmamaktadır, planlamayı öğretmeninizle esnekçe yapabilirsiniz."
              }
            ].map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-100 rounded-2xl overflow-hidden bg-white shadow-sm hover:shadow-md transition-all duration-200"
              >
                <button
                  type="button"
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-800 hover:text-teal-600 transition-colors"
                >
                  <span>{faq.q}</span>
                  <span className="text-xl text-teal-600 font-mono select-none">
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
                      <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-50 pt-4 font-medium bg-slate-50/20">
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

      {/* Teal/Emerald Registration CTA Banner Section */}
      <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-12 bg-gradient-to-r from-teal-600 to-emerald-600 border-y border-teal-700/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight leading-none">
            Eğitim Yolculuğunuza Bugün Başlayın
          </h2>
          <p className="text-white/90 font-medium text-sm md:text-base max-w-xl mx-auto">
            Binlerce öğrenci ile birlikte öğrenmeye başlayın
          </p>
          <div className="pt-2">
            <Link
              href="/register"
              className="inline-flex px-8 py-3.5 bg-white text-teal-600 hover:text-teal-700 font-bold rounded-full hover:shadow-xl hover:shadow-teal-950/20 transform hover:-translate-y-0.5 hover:scale-[1.03] transition-all text-sm"
            >
              Ücretsiz Kayıt Ol →
            </Link>
          </div>
        </div>
      </motion.section>


      <Footer />
    </div>
  );
}
