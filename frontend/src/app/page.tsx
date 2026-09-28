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
  Globe, Compass, Lightbulb, Zap, Clock, ChevronRight, Check, X, HelpCircle, PlusCircle, Bookmark
} from "lucide-react";
import PayTRTaksitWidget from "@/components/payment/PayTRTaksitWidget";
import Hero3DCanvas from "@/components/3d/Hero3DCanvas";
import TiltCard3D from "@/components/3d/TiltCard3D";
import BentoGridSection from "@/components/ui/BentoGrid";
import LiveDemandTicker from "@/components/home/LiveDemandTicker";
import HeroSearchCapsule from "@/components/home/HeroSearchCapsule";
import Hero3DFloatingVisual from "@/components/home/Hero3DFloatingVisual";
import HeroWaveRibbon from "@/components/home/HeroWaveRibbon";
import WhyBiHocamSection from "@/components/home/WhyBiHocamSection";
import LessonHourFlowSection from "@/components/home/LessonHourFlowSection";
import HowItWorksSection from "@/components/home/HowItWorksSection";
import HowYouLearnSection from "@/components/home/HowYouLearnSection";
import InstructorsShowcaseSection from "@/components/home/InstructorsShowcaseSection";
import TestimonialsSection from "@/components/home/TestimonialsSection";
import FinalCTASection from "@/components/home/FinalCTASection";
import { FaqJsonLd } from "@/components/seo/JsonLd";

export const HOME_FAQS = [
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
];

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

  // Callback (Sizi Ücretsiz Arayalım) Form State & Fetch Handler
  const [callbackName, setCallbackName] = useState("");
  const [callbackPhone, setCallbackPhone] = useState("");
  const [callbackConsent, setCallbackConsent] = useState(false);
  const [callbackStatus, setCallbackStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [callbackError, setCallbackError] = useState("");

  const handleCallbackSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!callbackName.trim() || !callbackPhone.trim()) {
      return;
    }
    if (!callbackConsent) {
      setCallbackError("Lütfen Kullanım Şartları ve KVKK Aydınlatma Metnini onaylayınız.");
      return;
    }
    setCallbackStatus("submitting");
    setCallbackError("");
    try {
      const response = await fetch("/api/v1/call-requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          name: callbackName.trim(),
          phone: callbackPhone.trim(),
        }),
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.detail || "Arama talebi oluşturulurken bir hata oluştu.");
      }

      setCallbackStatus("success");
      setCallbackName("");
      setCallbackPhone("");
      setCallbackConsent(false);
    } catch (err: any) {
      setCallbackStatus("error");
      setCallbackError(err.message || "Bağlantı hatası oluştu, lütfen daha sonra tekrar deneyiniz.");
    }
  };

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

  // Aniq-UI Inspired Course Categories and Filtering
  const COURSE_CATEGORIES = [
    { id: "all", label: "Tüm Branşlar" },
    { id: "yks-lgs", label: "YKS & LGS" },
    { id: "matematik", label: "Matematik" },
    { id: "dil", label: "İngilizce & Dil" },
    { id: "yazilim", label: "Yazılım & Kodlama" },
    { id: "fen", label: "Fen Bilimleri" },
  ];
  const [selectedCourseCategory, setSelectedCourseCategory] = useState("all");

  const filteredCourses = useMemo(() => {
    const rawList = featuredCourses && featuredCourses.length > 0 ? featuredCourses : courses || [];
    if (selectedCourseCategory === "all") return rawList;
    return rawList.filter((c) => {
      const targetText = `${c.title} ${c.slug} ${c.short_description || ""}`.toLowerCase();
      if (selectedCourseCategory === "yks-lgs") return targetText.includes("yks") || targetText.includes("lgs") || targetText.includes("tyt") || targetText.includes("ayt");
      if (selectedCourseCategory === "matematik") return targetText.includes("matematik") || targetText.includes("geometri");
      if (selectedCourseCategory === "dil") return targetText.includes("ingilizce") || targetText.includes("ielts") || targetText.includes("toefl") || targetText.includes("dil");
      if (selectedCourseCategory === "yazilim") return targetText.includes("yazılım") || targetText.includes("python") || targetText.includes("kod") || targetText.includes("algoritma");
      if (selectedCourseCategory === "fen") return targetText.includes("fen") || targetText.includes("fizik") || targetText.includes("kimya") || targetText.includes("biyoloji");
      return true;
    });
  }, [featuredCourses, courses, selectedCourseCategory]);

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
                    <img 
                      src={publicSettings.logo_url} 
                      alt="BiHocam Logo" 
                      width="120"
                      height="112"
                      loading="lazy"
                      decoding="async"
                      className="h-28 object-contain drop-shadow-lg" 
                    />
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
        const res = await fetch("/api/v1/stats/public");
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

      <main id="main-content" role="main" className="flex-1">
        <FaqJsonLd faqs={HOME_FAQS} />

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

              {/* ── Aniq-UI Inspired Fast Search Capsule ── */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.25 }}
                className="w-full"
              >
                <HeroSearchCapsule />
              </motion.div>

              {/* Dual Action CTA Buttons */}
              {/* Tri Action Hero CTA Buttons - All on one row */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.3 }}
                className="flex flex-col sm:flex-row sm:flex-nowrap justify-center lg:justify-start items-center gap-2.5 sm:gap-3 pt-2 w-full max-w-2xl"
              >
                <Link
                  href="/tenders/new"
                  className="w-full sm:w-auto shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 whitespace-nowrap"
                >
                  <PlusCircle className="w-4 h-4" />
                  <span>Ders Talebi Aç</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  href="/teachers"
                  className="w-full sm:w-auto shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-sm shadow-sm hover:-translate-y-0.5 transition-all flex items-center justify-center gap-1.5 whitespace-nowrap"
                >
                  <span>Eğitmenleri Keşfet</span>
                </Link>

                <Link
                  href="/become-instructor"
                  className="w-full sm:w-auto shrink-0 px-4 sm:px-5 py-3 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-amber-600 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-extrabold text-sm shadow-lg shadow-amber-500/25 hover:shadow-xl hover:shadow-amber-500/35 hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center gap-2 group whitespace-nowrap"
                >
                  <GraduationCap className="w-4 h-4 text-white group-hover:rotate-12 transition-transform duration-300" />
                  <span>Eğitmen Ol</span>
                  <ArrowRight className="w-4 h-4 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all" />
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

            {/* ── RIGHT COLUMN (Asymmetric 5 Cols - 3D Floating Visual & Live Demand Ticker) ── */}
            <motion.aside
              aria-label="3D Canlı Sınıf & Özel Ders Talepleri"
              initial={{ opacity: 0, x: 30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-5 w-full flex flex-col items-center justify-center space-y-6"
            >
              <Hero3DFloatingVisual />
              <div className="w-full">
                <LiveDemandTicker />
              </div>
            </motion.aside>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* HERO WAVE RIBBON - ORGANIC RUNNING STRIP (Aniq-UI)     */}
      {/* ══════════════════════════════════════════════════════ */}
      <HeroWaveRibbon customItems={(publicSettings?.platform as Record<string, any>)?.marquee_items} />

      {/* ══════════════════════════════════════════════════════ */}
      {/* WHY BIHOCAM 3-CARD VALUE PROPOSITION (Aniq-UI Style)   */}
      {/* ══════════════════════════════════════════════════════ */}
      <WhyBiHocamSection />

      {/* ══════════════════════════════════════════════════════ */}
      {/* LAUNCH YOUR GOAL: CATEGORY TABS & POPULAR COURSES       */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          
          {/* Section Header */}
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>TÜM SEVİYELER İÇİN</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.15]">
              Hedefinize Uygun{" "}
              <span className="relative inline-block text-emerald-700">
                Ders & Kursları
                <svg
                  aria-hidden="true"
                  viewBox="0 0 250 20"
                  className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400/80 -z-10"
                  preserveAspectRatio="none"
                >
                  <path
                    d="M3 15 Q 125 0 247 12"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              Keşfedin
            </h2>
            <p className="text-slate-600 font-normal text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
              YKS, LGS, yabancı dil ve tüm okul branşlarında alanında uzman doğrulanmış öğretmenlerle başarıya ulaşın.
            </p>
          </div>

          {/* Aniq-UI Category Filter Pills */}
          <div className="flex items-center justify-start sm:justify-center gap-2 overflow-x-auto pb-6 pt-1 no-scrollbar mb-10">
            {COURSE_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCourseCategory(cat.id)}
                className={`px-5 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap border cursor-pointer ${
                  selectedCourseCategory === cat.id
                    ? "bg-emerald-600 text-white border-emerald-600 shadow-md shadow-emerald-600/20 scale-105"
                    : "bg-white text-slate-700 border-slate-200/90 hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Aniq-UI Course Cards Grid (5:3 Aspect Anatomy) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredCourses.slice(0, 8).map((course) => (
              <Link key={course.id} href={`/courses/${course.slug}`} className="group/card block h-full">
                <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between p-3 shadow-xs">
                  <div>
                    {/* 5:3 Aspect Image Thumbnail */}
                    <div className="relative w-full aspect-[5/3] overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                      {course.thumbnail_path ? (
                        <img
                          src={course.thumbnail_path}
                          alt={course.title}
                          loading="lazy"
                          className="object-cover w-full h-full group-hover/card:scale-105 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-50">
                          <BookOpen className="w-10 h-10" />
                        </div>
                      )}

                      {/* Top Left Badge */}
                      <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 shadow-xs">
                        <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                        <span>{course.discount_price ? "İndirimli" : "Popüler"}</span>
                      </span>

                      {/* Top Right Bookmark Button */}
                      <div className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 text-slate-700 hover:text-emerald-700 flex items-center justify-center shadow-xs transition-colors">
                        <Bookmark className="w-4 h-4" />
                      </div>
                    </div>

                    {/* Instructor Info */}
                    <div className="px-2 pt-3 pb-1">
                      <div className="flex items-center gap-2.5 mb-2.5">
                        <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                          {course.teacher?.avatar_url ? (
                            <img
                              src={course.teacher.avatar_url}
                              alt={course.teacher.full_name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-xs font-bold text-emerald-700 bg-emerald-50">
                              {course.teacher?.full_name?.charAt(0) || "E"}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-slate-900 truncate">
                            {course.teacher?.full_name || "Seçkin Eğitmen"}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate">BiHocam Eğitmeni</p>
                        </div>
                      </div>

                      {/* Title & Description */}
                      <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-2 min-h-[3rem] group-hover/card:text-emerald-700 transition-colors leading-snug">
                        {course.title}
                      </h3>
                      <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                        {course.short_description || "Birebir canlı anlatım, yeni nesil soru çözümleri ve interaktif dijital kaynaklarla hedefinize ulaşın."}
                      </p>
                    </div>
                  </div>

                  {/* Card Price & Rating Footer */}
                  <div className="px-2 pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      {course.discount_price ? (
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-base font-black text-slate-900 font-mono">₺{course.discount_price}</span>
                          <span className="text-xs text-slate-400 line-through font-mono">₺{course.price}</span>
                        </div>
                      ) : course.price === 0 ? (
                        <span className="text-sm font-bold text-emerald-700">Ücretsiz</span>
                      ) : (
                        <span className="text-base font-black text-slate-900 font-mono">₺{course.price}</span>
                      )}
                    </div>

                    <div className="flex items-center gap-1">
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                      <span className="text-xs font-bold text-slate-800">4.9</span>
                      <span className="text-[11px] text-slate-400">(48)</span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Education Programs Section (Preparation Packages) */}
          {educationPrograms && educationPrograms.length > 0 && (
            <div className="mt-20 pt-16 border-t border-slate-100">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-10 gap-4">
                <div className="space-y-2">
                  <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                    Kapsamlı Hazırlık Programları
                  </h3>
                  <p className="text-slate-600 font-normal text-sm">
                    LGS ve YKS hedeflerinize özel hazırlanmış tüm dersler eğitim paketleri
                  </p>
                </div>
                <Link
                  href="/egitim-programlari"
                  className="text-emerald-700 hover:text-emerald-800 font-bold text-sm inline-flex items-center gap-1 group"
                >
                  Tüm Programları Keşfet <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              </div>

              <div className="grid md:grid-cols-3 gap-8">
                {educationPrograms.slice(0, 3).map((rp) => {
                  const cardGradient = getGradientBySlug(rp.slug);
                  return (
                    <Link key={rp.slug} href={`/egitim-programlari/${rp.slug}`} className="group flex flex-col h-full">
                      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
                        <div>
                          {/* Banner */}
                          <div className={`h-40 bg-gradient-to-br ${cardGradient} flex items-center justify-center p-4 relative`}>
                            {getBannerContent(rp.slug, rp.title)}
                          </div>
                          
                          {/* Content */}
                          <div className="p-6">
                            <h4 className="font-extrabold text-slate-900 text-lg mb-2 group-hover:text-emerald-700 transition-colors leading-tight line-clamp-1">
                              {rp.title}
                            </h4>
                            <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed mb-4 font-normal">
                              {rp.short_description || "BiHocam uzman kadrosuyla hazırlanan LGS ve YKS programları; canlı ders, deneme ve rehberlik desteğiyle tek platformda kolaylaşıyor."}
                            </p>
                            
                            <div className="flex items-center gap-1 text-sm font-bold text-slate-700 mb-2">
                              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                              <span>{rp.rating || 4.8}</span>
                              <span className="text-slate-400 font-normal text-xs">({rp.review_count || 84})</span>
                            </div>
                          </div>
                        </div>

                        {/* Footer Info */}
                        <div className="px-6 pb-6 pt-4 flex items-center justify-between border-t border-slate-100 bg-slate-50/50">
                          <div>
                            <p className="text-emerald-800 font-black font-mono text-xl">{formatProgramPrice(rp.price)}</p>
                            <p className="text-[9px] text-slate-500 font-mono uppercase tracking-widest">+ KDV</p>
                          </div>
                          <span className="px-4 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-colors">
                            İncele →
                          </span>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* Quick Branch Explore Cards */}
          <div className="mt-20 pt-16 border-t border-slate-100">
            <div className="text-center mb-10 space-y-2">
              <h3 className="text-2xl font-black text-slate-900 font-display">Branşlara Göre Keşfedin</h3>
              <p className="text-slate-500 text-sm font-normal">Dilediğiniz alanda hemen eğitmenleri ve programları listeleyin.</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
              {[
                { id: 'ilkokul', title: 'İlkokul', icon: Sprout, iconColor: 'text-emerald-600', badge: 'Temel' },
                { id: 'ortaokul', title: 'Ortaokul & LGS', icon: BookOpen, iconColor: 'text-teal-600', badge: 'LGS' },
                { id: 'lise', title: 'Lise & YKS', icon: Target, iconColor: 'text-indigo-600', badge: 'YKS' },
                { id: 'yabanci-dil', title: 'Yabancı Dil', icon: Globe, iconColor: 'text-rose-600', badge: 'Dil' },
                { id: 'kocluk', title: 'Eğitim Koçluğu', icon: Compass, iconColor: 'text-purple-600', badge: 'Koçluk' },
                { id: 'beceri', title: 'Yazılım & Beceri', icon: Lightbulb, iconColor: 'text-amber-600', badge: 'Kodlama' },
              ].map((cat) => {
                const IconComp = cat.icon;
                return (
                  <Link
                    key={cat.id}
                    href={`/tanisma-dersi?category=${cat.id}`}
                    className="group rounded-2xl border border-slate-200/90 bg-slate-50/60 p-4 text-center hover:bg-white hover:border-emerald-500/40 hover:shadow-md transition-all flex flex-col items-center justify-between"
                  >
                    <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex items-center justify-center group-hover:scale-110 transition-transform mb-2">
                      <IconComp className={`w-5 h-5 ${cat.iconColor}`} />
                    </div>
                    <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-tight">
                      {cat.title}
                    </p>
                    <span className="text-[10px] text-slate-500 mt-1 font-medium">{cat.badge}</span>
                  </Link>
                );
              })}
            </div>
          </div>

        </div>
      </section>

      {/* ══════════════════════════════════════════════════════ */}
      {/* LESSON HOUR FLOW - 4 STEPS & ANIMATED CLOCK DIAL       */}
      {/* ══════════════════════════════════════════════════════ */}
      <LessonHourFlowSection />

      {/* ══════════════════════════════════════════════════════ */}
      {/* HOW IT WORKS - 3 SIMPLE STEPS & TRUST BAR (Aniq-UI)    */}
      {/* ══════════════════════════════════════════════════════ */}
      <HowItWorksSection />

      {/* ══════════════════════════════════════════════════════ */}
      {/* HOW YOU LEARN - SLAB WORKSPACE & PROGRESS (Aniq-UI)    */}
      {/* ══════════════════════════════════════════════════════ */}
      <HowYouLearnSection />

      {/* ══════════════════════════════════════════════════════ */}
      {/* OUR INSTRUCTORS - PORTRAIT SHOWCASE (Aniq-UI Style)    */}
      {/* ══════════════════════════════════════════════════════ */}
      <InstructorsShowcaseSection />

      {/* ══════════════════════════════════════════════════════ */}
      {/* TESTIMONIALS - 3 STATS & QUOTE CARD (Aniq-UI Style)    */}
      {/* ══════════════════════════════════════════════════════ */}
      <TestimonialsSection />

      {/* ══════════════════════════════════════════════════════ */}
      {/* PLATFORM ADVANTAGES BENTO GRID                         */}
      {/* ══════════════════════════════════════════════════════ */}
      <BentoGridSection />

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
                    <label className="text-sm font-black text-slate-900 uppercase tracking-wider">1. Sınav / Program Seçin</label>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                      {Object.entries(EXAM_SUBJECTS).map(([key, val]) => (
                        <button
                          key={key}
                          type="button"
                          aria-pressed={calcExam === key}
                          onClick={() => {
                            setCalcExam(key === calcExam ? "" : key);
                            setCalcSubjects([]);
                          }}
                          className={`flex items-center justify-between px-3.5 py-3 rounded-2xl border font-bold text-xs transition-all text-left ${
                            calcExam === key
                              ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm"
                              : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50 shadow-xs"
                          }`}
                        >
                          <span className="leading-tight">{val.label}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-bold font-mono">
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
                        <label className="text-sm font-black text-slate-900 uppercase tracking-wider">2. Ders / Branş Tercihiniz</label>
                        {calcSubjects.length > 0 && (
                          <button
                            type="button"
                            aria-label="Seçilen dersleri temizle"
                            onClick={() => setCalcSubjects([])}
                            className="text-xs text-rose-600 font-bold hover:underline flex items-center gap-1"
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
                            aria-pressed={calcSubjects.includes(s)}
                            onClick={() => toggleCalcSubject(s)}
                            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                              calcSubjects.includes(s)
                                ? "bg-emerald-600 text-white font-black border-emerald-600 shadow-sm"
                                : "bg-white text-slate-800 border-slate-300 hover:border-emerald-500 hover:bg-emerald-50"
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
                      <label htmlFor="calc-hours-slider" className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Haftalık Birebir Ders Saati
                      </label>
                      <span className="text-2xl font-black text-emerald-800 font-mono">{calcHours} Saat</span>
                    </div>
                    <input
                      id="calc-hours-slider"
                      type="range"
                      min="1"
                      max="10"
                      value={calcHours}
                      onChange={(e) => setCalcHours(parseInt(e.target.value))}
                      className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                    />
                    <div className="flex justify-between text-xs text-slate-700 font-bold">
                      <span>1 Saat (Temel)</span>
                      <span>5 Saat (Önerilen)</span>
                      <span>10 Saat (Yoğun)</span>
                    </div>
                  </div>

                  {/* Slider 2: Duration in Weeks */}
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <label htmlFor="calc-weeks-select" className="text-sm font-black text-slate-900 uppercase tracking-wider">
                        Toplam Program Süresi
                      </label>
                      <span className="text-2xl font-black text-emerald-800 font-mono">{calcWeeks} Hafta</span>
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
                          aria-pressed={calcWeeks === item.value}
                          onClick={() => setCalcWeeks(item.value)}
                          className={`p-3.5 rounded-2xl border font-bold text-xs transition-all relative flex flex-col items-center justify-center gap-1.5 ${
                            calcWeeks === item.value
                              ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm"
                              : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:text-slate-950 shadow-xs"
                          }`}
                        >
                          {item.discount > 0 && (
                            <span className="absolute -top-2.5 bg-emerald-700 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-xs">
                              %{item.discount} İndirim
                            </span>
                          )}
                          <span>{item.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-2xl p-4 border border-emerald-300 bg-emerald-50/90 flex items-start gap-3">
                    <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                    <p className="text-xs text-emerald-900 leading-relaxed font-medium">
                      Uzun vadeli programlarda <strong>peşin fiyatına taksit</strong> ve <strong>%{discount36}&apos;ye varan ek saat indirimleri</strong> otomatik yansıtılır. Memnun kalınmadığında kalan saatler koşulsuz iade edilir.
                    </p>
                  </div>
                </div>

                {/* Calculations Card Area */}
                <div className="lg:col-span-5 bg-white rounded-3xl p-8 border border-slate-300 shadow-xl flex flex-col justify-between relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className="space-y-6 relative z-10">
                    <h3 className="text-xl font-black text-slate-900 flex items-center justify-between">
                      <span>Planlama Özeti</span>
                      <span className="text-xs font-mono text-emerald-800 font-bold px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300">
                        {totalHours} Saat Canlı
                      </span>
                    </h3>
                    
                    <div className="space-y-3.5 border-b border-slate-200 pb-6 text-sm">
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-600 font-medium">Toplam Canlı Ders</span>
                        <span className="font-bold text-slate-900">{totalHours} Saat</span>
                      </div>
                      <div className="flex justify-between text-slate-700">
                        <span className="text-slate-600 font-medium">Saatlik Taban Ücret</span>
                        <span className="font-mono font-bold text-slate-900">{hourlyRate.toLocaleString("tr-TR", { minimumFractionDigits: 2 })} TL</span>
                      </div>
                      {selectedDiscount > 0 && (
                        <div className="flex justify-between text-emerald-800 font-bold">
                          <span>Süreye Özel İndirim</span>
                          <span className="font-mono font-black">-%{selectedDiscount}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">Tahmini Toplam Tutar</span>
                      <div className="text-4xl font-black tracking-tight text-slate-900 font-mono">
                        {Math.round(netPrice).toLocaleString("tr-TR", { minimumFractionDigits: 2 })} <span className="text-emerald-700 text-2xl">TL</span>
                      </div>
                      <p className="text-[11px] text-slate-600 font-medium">
                        *Eğitmen tecrübesine ve öğrenci talebine göre tekliflerde fiyat esnekliği sağlanır.
                      </p>
                    </div>

                    {/* PayTR Taksit Tablosu */}
                    <div className="bg-slate-50 rounded-2xl p-4 border border-slate-300">
                      <div className="text-xs font-black text-slate-900 uppercase mb-3 tracking-wider flex items-center justify-between">
                        <span>Taksit Seçenekleri</span>
                        <span className="text-[10px] text-emerald-800 font-bold bg-emerald-100 px-2 py-0.5 rounded border border-emerald-200">Vade Farksız</span>
                      </div>
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


      {/* ══════════════════════════════════════════════════════ */}
      {/* WHY BIHOCAM? - COMPARISON TABLE (LIGHT THEME)          */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-slate-50/70 relative overflow-hidden border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>ŞEFFAF KARŞILAŞTIRMA</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight">
              Neden BiHocam&apos;ı Tercih Etmelisiniz?
            </h2>
            <p className="text-slate-600 font-normal max-w-2xl mx-auto text-base sm:text-lg">
              Geleneksel dershane ve verimsiz yol kayıplarından kurtulun; birebir odaklı modern eğitim standardına geçin.
            </p>
          </div>

          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-hidden rounded-3xl border border-slate-200 shadow-xl bg-white">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200">
                  <th className="p-6 text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4">Özellikler</th>
                  <th className="p-6 text-xs font-black text-emerald-950 uppercase tracking-wider w-1/4 bg-emerald-50/90 border-x border-emerald-200 text-center">BiHocam Birebir</th>
                  <th className="p-6 text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4 text-center">Fiziksel Özel Ders</th>
                  <th className="p-6 text-xs font-bold text-slate-600 uppercase tracking-wider w-1/4 text-center">Geleneksel Dershane</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700 text-sm">
                {[
                  { name: "Saatlik Ders Ücreti", bihocam: "Ekonomik & Esnek Paketler", ozel: "Yüksek & Peşin Zorunluluğu", dershane: "Yıllık Katı Senetler" },
                  { name: "Eğitmen Seçimi", bihocam: "✓ 100+ Onaylı Hoca & Teklif Alabilme", ozel: "✗ Referansla Sınırlı Çevre", dershane: "✗ Atanmış Öğretmen (Seçim Yok)" },
                  { name: "Ders Kaydı ve Tekrarı", bihocam: "✓ Sınırsız & İstediğin Zaman Tekrar İzle", ozel: "✗ Ders Biter, Tekrarı Yok", dershane: "✗ Kaçırılan Ders Telafi Edilemez" },
                  { name: "Yapay Zeka Destekli Rapor", bihocam: "✓ Haftalık Detaylı Gelişim Karnesi", ozel: "✗ Yalnızca Sözlü Geri Bildirim", dershane: "✗ Dönemlik Genel Toplu Sınav" },
                  { name: "Ulaşım / Zaman Kaybı", bihocam: "✓ 0 Dakika (Ev Konforunda Online)", ozel: "✗ Trafikte Günde 1-2 Saat Kayıp", dershane: "✗ Her Gün Git-Gel Yol Yorgunluğu" },
                  { name: "Güvenlik & Doğrulama", bihocam: "✓ Diploma, Sabıka ve Mülakat Onaylı", ozel: "✗ Belgesiz / Kontrolsüz Güven", dershane: "✓ Kurumsal Denetimli Öğretmen" },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-6 text-slate-900 font-bold text-sm">{row.name}</td>
                    <td className="p-6 text-emerald-900 font-black text-sm bg-emerald-50/50 border-x border-emerald-200 text-center">{row.bihocam}</td>
                    <td className="p-6 text-slate-600 font-medium text-sm text-center">{row.ozel}</td>
                    <td className="p-6 text-slate-600 font-medium text-sm text-center">{row.dershane}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card Grid View */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:hidden">
            {/* BiHocam Card */}
            <div className="bg-white rounded-3xl p-6 border-2 border-emerald-500 shadow-xl relative overflow-hidden">
              <div className="absolute right-0 top-0 bg-emerald-600 text-white text-[10px] font-black uppercase px-4 py-1.5 rounded-bl-2xl tracking-wider">Önerilen</div>
              <h3 className="text-xl font-black text-slate-900 mb-4">BiHocam Birebir</h3>
              <ul className="space-y-3.5 text-sm font-medium text-slate-700">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Ekonomik & Esnek:</strong> Bütçenize en uygun saat paketini kendiniz belirleyin.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Seçim Özgürlüğü:</strong> 100+ onaylı, tecrübeli öğretmen arasından dilediğinizi seçin veya teklif toplayın.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Sınırsız Tekrar:</strong> İşlenen tüm dersleri kaydedip dilediğiniz an tekrar izleyin.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Yapay Zeka Takibi:</strong> Haftalık gelişim raporlarıyla ilerlemenizi adım adım izleyin.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                  <span><strong>Ev Konforu:</strong> Yol stresi, yorgunluk ve ulaşım maliyeti olmadan ders yapın.</span>
                </li>
              </ul>
            </div>

            {/* Fiziksel Ozel Ders Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Fiziksel Özel Ders</h3>
              <ul className="space-y-3.5 text-sm text-slate-600 font-normal">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Yüksek Maliyet:</strong> Saatlik ders ücretleri ve ulaşım maliyetleri yüksektir.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Kısıtlı Seçim:</strong> Sadece yakın çevreden tavsiye ile öğretmen bulabilirsiniz.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Tekrar İzleme Yok:</strong> Ders bittiği an her şey unutulur, tekrar izleme şansı yoktur.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Yol Yorgunluğu:</strong> Öğretmenin veya öğrencinin git-gel yapması vakit kaybettirir.</span>
                </li>
              </ul>
            </div>

            {/* Geleneksel Dershane Card */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm">
              <h3 className="text-xl font-bold text-slate-900 mb-4">Geleneksel Dershane</h3>
              <ul className="space-y-3.5 text-sm text-slate-600 font-normal">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Katı Yıllık Senetler:</strong> Memnun kalmasanız dahi yıllık taahhüt ödemek zorundasınız.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Atanmış Eğitmen:</strong> Hangi hocanın derse gireceğini kurum belirler, seçemezsiniz.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Kalabalık Sınıflar:</strong> 15-20 kişilik sınıflarda soru sorma şansı oldukça düşüktür.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold">✕</span>
                  <span><strong>Zaman Kaybı:</strong> Her gün dershaneye gidiş-dönüş saatler sürer ve fiziksel yorgunluk verir.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>



      {/* Popcast Section */}
      {popcasts && popcasts.length > 0 && (
        <motion.section 
          initial="hidden" 
          whileInView="visible" 
          viewport={{ once: true, amount: 0.1 }} 
          variants={fadeUpVariants} 
          className="py-24 bg-slate-50/70 relative overflow-hidden border-t border-slate-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-4">
              <div className="space-y-3">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                  <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                  <span>BİHOCAM POPCAST</span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight">
                  Popcast ile Dinleyerek Öğren
                </h2>
                <p className="text-slate-600 font-normal text-base max-w-2xl">
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
                    className="relative group bg-white rounded-3xl border border-slate-200/90 p-6 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between"
                  >
                    <div>
                      {/* Cover Image / Audio Visualizer */}
                      <div className="relative aspect-video rounded-2xl bg-slate-100 overflow-hidden mb-6 flex items-center justify-center border border-slate-200">
                        {popcast.cover_image_url ? (
                          <img 
                            src={popcast.cover_image_url} 
                            alt={popcast.title} 
                            width="400"
                            height="225"
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
                          />
                        ) : (
                          <Headphones className="w-16 h-16 text-slate-400 relative z-10" />
                        )}
                        <div className="absolute inset-0 bg-slate-900/20 transition-opacity group-hover:bg-slate-900/40" />

                        {/* Floating Duration */}
                        <span className="absolute bottom-3 right-3 bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg">
                          {Math.floor(popcast.duration / 60)}:{(Math.floor(popcast.duration % 60)).toString().padStart(2, '0')}
                        </span>

                        {/* Play/Pause overlay */}
                        <button 
                          type="button"
                          onClick={() => handlePlayPause(popcast)}
                          aria-label={isPlayingThis ? `${popcast.title} popcastini duraklat` : `${popcast.title} popcastini oynat`}
                          className="absolute w-14 h-14 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 transition-all duration-200 z-10"
                        >
                          {isPlayingThis ? (
                            <Pause className="w-6 h-6 fill-white text-white" />
                          ) : (
                            <Play className="w-6 h-6 fill-white text-white translate-x-0.5" />
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
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors text-lg line-clamp-1">
                          {popcast.title}
                        </h3>
                        <p className="text-slate-600 text-sm line-clamp-2 leading-relaxed font-normal">
                          {popcast.description || "Bu popcast için açıklama bulunmamaktadır."}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between">
                      {/* Teacher Profile */}
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden border border-slate-200">
                          {popcast.teacher?.avatar_url ? (
                            <img 
                              src={popcast.teacher.avatar_url} 
                              alt={popcast.teacher.full_name} 
                              width="32"
                              height="32"
                              loading="lazy"
                              decoding="async"
                              className="w-full h-full object-cover" 
                            />
                          ) : (
                            <div className="w-full h-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold font-mono">
                              {popcast.teacher?.full_name?.charAt(0) || "E"}
                            </div>
                          )}
                        </div>
                        <span className="text-xs font-bold text-slate-800">{popcast.teacher?.full_name || "Eğitmen"}</span>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-2">
                        <button 
                          type="button"
                          onClick={(e) => handleToggleFavorite(e, popcast.id, popcast.is_favorited)}
                          disabled={favoriteMutation.isPending}
                          aria-label={popcast.is_favorited ? "Favorilerden Çıkar" : "Favorilere Ekle"}
                          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-colors ${popcast.is_favorited ? 'bg-rose-50 border-rose-200 text-rose-600' : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'}`}
                        >
                          <Heart className={`w-4 h-4 ${popcast.is_favorited ? 'fill-rose-500 text-rose-500' : ''}`} />
                        </button>
                        <button 
                          type="button"
                          onClick={(e) => handleDownload(e, popcast.audio_url, popcast.title)}
                          aria-label={`${popcast.title} ses dosyasını indir`}
                          className="w-9 h-9 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl flex items-center justify-center text-slate-600 hover:text-slate-900 transition-colors"
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
                      <img 
                        src={currentPlayingPopcast.cover_image_url} 
                        alt={currentPlayingPopcast.title || "Popcast Kapak Görseli"} 
                        width="40"
                        height="40"
                        loading="lazy"
                        decoding="async"
                        className="w-full h-full object-cover" 
                      />
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
                    type="button"
                    aria-label={isPlaying ? "Oynatmayı duraklat" : "Oynatmayı başlat"}
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



      {/* SİZİ ARAYABİLİRİZ (Light Theme) */}
      <motion.section 
        initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.2 }} variants={fadeUpVariants}
        className="py-16 bg-slate-50/70 border-t border-slate-200"
      >
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-slate-200/90 rounded-3xl p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center justify-between shadow-xl">
            <div className="space-y-3 md:w-1/2">
               <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                 <span>BİZE DANIŞIN</span>
               </div>
               <h3 className="text-2xl sm:text-3xl font-black text-slate-900 font-display">Sizi Ücretsiz Arayalım</h3>
               <p className="text-slate-600 text-sm font-normal leading-relaxed">
                 Hedeflerinize en uygun eğitmen ve program planlamasını eğitim uzmanlarımızla birlikte yapın: <br />
                 <span className="font-mono font-bold text-emerald-700 text-base">+90 (850) 840 55 43</span>
               </p>
            </div>
            {callbackStatus === "success" ? (
              <div className="w-full md:w-1/2 p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-3 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h4 className="text-lg font-black text-emerald-950 font-display">Talebiniz Başarıyla Alındı!</h4>
                <p className="text-xs text-emerald-800 font-medium leading-relaxed">
                  Eğitim uzmanlarımız en kısa sürede belirttiğiniz telefon numarasından sizinle iletişime geçecektir.
                </p>
                <button
                  type="button"
                  onClick={() => setCallbackStatus("idle")}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
                >
                  Yeni Talep İlet
                </button>
              </div>
            ) : (
              <form 
                action="/api/v1/call-requests"
                method="POST"
                onSubmit={handleCallbackSubmit}
                className="w-full md:w-1/2 space-y-3"
              >
                {callbackStatus === "error" && (
                  <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center justify-between">
                    <span>{callbackError}</span>
                    <button type="button" onClick={() => setCallbackStatus("idle")} className="text-rose-900 font-bold ml-2">✕</button>
                  </div>
                )}
                <div>
                  <label htmlFor="callback-fullname" className="sr-only">
                    Adınız ve Soyadınız
                  </label>
                  <input 
                    id="callback-fullname"
                    name="name"
                    type="text" 
                    value={callbackName}
                    onChange={(e) => setCallbackName(e.target.value)}
                    aria-label="Adınız ve Soyadınız"
                    autoComplete="name"
                    required
                    placeholder="Adınız ve Soyadınız" 
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium" 
                  />
                </div>

                <div>
                  <label htmlFor="callback-phone" className="sr-only">
                    Telefon Numaranız
                  </label>
                  <input 
                    id="callback-phone"
                    name="phone"
                    type="tel" 
                    value={callbackPhone}
                    onChange={(e) => setCallbackPhone(e.target.value)}
                    aria-label="Telefon Numaranız"
                    autoComplete="tel"
                    required
                    placeholder="Telefon (05xx xxx xx xx)" 
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-300 bg-slate-50 text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:border-emerald-600 focus:bg-white transition-all font-medium" 
                  />
                </div>

                <div className="flex items-start gap-2.5 pt-1">
                  <input
                    id="callback-consent"
                    name="consent"
                    type="checkbox"
                    required
                    checked={callbackConsent}
                    onChange={(e) => setCallbackConsent(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-emerald-600 border-slate-300 focus:ring-emerald-500 cursor-pointer accent-emerald-600"
                  />
                  <label htmlFor="callback-consent" className="text-xs text-slate-600 leading-snug cursor-pointer select-none">
                    <Link href="/pages/uyelik-sozlesmesi" target="_blank" className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2">
                      Kullanım Şartları
                    </Link>{" "}
                    ve{" "}
                    <Link href="/pages/KVKK-aydinlatma-metni" target="_blank" className="font-semibold text-emerald-700 hover:text-emerald-800 underline underline-offset-2">
                      KVKK Aydınlatma Metnini
                    </Link>{" "}
                    okudum, kabul ediyorum.
                  </label>
                </div>

                <button 
                  type="submit"
                  disabled={callbackStatus === "submitting" || !callbackConsent}
                  aria-label="Ücretsiz arama talebi gönder"
                  className="w-full py-3.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white rounded-xl shadow-md shadow-emerald-600/20 transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  {callbackStatus === "submitting" ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>İletiliyor...</span>
                    </>
                  ) : (
                    <span>Arama Talebi Gönder →</span>
                  )}
                </button>
              </form>
            )}
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
                  width="600"
                  height="400"
                  loading="lazy"
                  decoding="async"
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

      {/* Blog Posts Section (Light Theme) */}
      {blogPosts && blogPosts.length > 0 && (
        <motion.section initial="hidden" whileInView="visible" viewport={{ once: true, amount: 0.1 }} variants={fadeUpVariants} className="py-24 bg-slate-50/70 border-t border-slate-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900 font-display tracking-tight">Rehberlik & Blog</h2>
                <p className="text-slate-600 font-normal text-sm">
                  Eğitim dünyasındaki güncel gelişmeler, çalışma taktikleri ve sınav analizleri.
                </p>
              </div>
              <Link
                href="/blog"
                className="text-emerald-700 hover:text-emerald-800 font-bold text-sm inline-flex items-center gap-1 group"
              >
                Tüm Yazılar <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              {blogPosts.slice(0, 3).map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col h-full">
                  <article className="bg-white rounded-3xl border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/40 hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between h-full">
                    <div>
                      {/* Featured Image */}
                      <div className="aspect-video bg-slate-100 relative overflow-hidden">
                        <img
                          src={post.featured_image_url || getFallbackBlogImage(post.slug)}
                          alt={post.title}
                          width="400"
                          height="225"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            e.currentTarget.src = getFallbackBlogImage(post.slug);
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {post.categories && post.categories.length > 0 && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-white/95 backdrop-blur-md border border-slate-200 text-emerald-800 text-[10px] font-bold rounded-lg uppercase tracking-wider shadow-xs">
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
                        <h3 className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors leading-snug line-clamp-2 text-base sm:text-lg">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed font-normal">
                          {post.excerpt || "BiHocam rehberlik ekibinin en güncel analizlerini ve eğitim tavsiyelerini hemen inceleyin."}
                        </p>
                      </div>
                    </div>

                    {/* Card Footer */}
                    <div className="p-6 border-t border-slate-100 flex items-center gap-3 bg-slate-50/40">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 font-bold text-xs border border-emerald-200 flex-shrink-0">
                        {post.author?.avatar_url ? (
                          <img 
                            src={post.author.avatar_url} 
                            alt={post.author.full_name} 
                            width="32"
                            height="32"
                            loading="lazy"
                            decoding="async"
                            className="w-full h-full rounded-full object-cover" 
                          />
                        ) : (
                          <span>{post.author?.full_name ? post.author.full_name[0] : "B"}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-slate-900 leading-none">{post.author?.full_name || "BiHocam Yazar"}</p>
                        <p className="text-[10px] text-slate-500 mt-0.5 font-medium">Eğitim Danışmanı</p>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* ══════════════════════════════════════════════════════ */}
      {/* FAQ SECTION - ACCORDION (LIGHT THEME)                  */}
      {/* ══════════════════════════════════════════════════════ */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-16 space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
              <HelpCircle className="w-3.5 h-3.5 text-emerald-600" />
              <span>AKLINIZDAKİ SORULAR</span>
            </div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-slate-600 font-normal max-w-2xl mx-auto text-base sm:text-lg">
              Canlı ders süreçleri, ödemeler, özel ders talepleri ve eğitmenler hakkında tüm detaylar.
            </p>
          </div>

          <div className="space-y-4">
            {HOME_FAQS.map((faq, idx) => (
              <div
                key={idx}
                className="border border-slate-200/90 rounded-2xl overflow-hidden bg-slate-50/70 hover:border-emerald-300 hover:bg-slate-50 transition-all duration-200"
              >
                <button
                  type="button"
                  id={`faq-button-${idx}`}
                  aria-expanded={activeFaq === idx}
                  aria-controls={`faq-answer-${idx}`}
                  onClick={() => setActiveFaq(activeFaq === idx ? null : idx)}
                  className="w-full p-6 text-left flex items-center justify-between gap-4 font-bold text-slate-900 hover:text-emerald-700 transition-colors"
                >
                  <span className="text-sm sm:text-base">{faq.q}</span>
                  <span className="text-lg text-emerald-600 font-mono font-bold select-none flex-shrink-0">
                    {activeFaq === idx ? "−" : "+"}
                  </span>
                </button>
                <AnimatePresence initial={false}>
                  {activeFaq === idx && (
                    <motion.div
                      id={`faq-answer-${idx}`}
                      role="region"
                      aria-labelledby={`faq-button-${idx}`}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                    >
                      <div className="px-6 pb-6 text-slate-600 text-sm leading-relaxed border-t border-slate-200/70 pt-4 font-normal bg-white">
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

      {/* ANIQ UI FINAL CTA BANNER */}
      <FinalCTASection />
      </main>

      <Footer />
    </div>
  );
}
