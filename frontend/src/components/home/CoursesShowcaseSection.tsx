"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { coursesApi } from "@/lib/api";
import {
  BookOpen,
  Star,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  GraduationCap,
  PlayCircle,
  Video
} from "lucide-react";

interface DisplayCourse {
  id: string;
  title: string;
  slug: string;
  category: string;
  categorySlug: string;
  instructorName: string;
  instructorTitle: string;
  rating: number;
  studentCount: number;
  duration: string;
  lessonCount: number;
  price: number;
  discountPrice?: number | null;
  image: string;
  badge?: string;
  isLive?: boolean;
}

const CURATED_COURSES: DisplayCourse[] = [
  {
    id: "c-yks-mat",
    title: "YKS Matematik: Fonksiyonlar, Limit ve Türev Ustalık Kampı",
    slug: "yks-matematik-fonksiyonlar-limit-kamp",
    category: "YKS / LGS",
    categorySlug: "yks-lgs",
    instructorName: "Ali Turan",
    instructorTitle: "Matematik Zümre Başkanı",
    rating: 4.9,
    studentCount: 340,
    duration: "24 Saat",
    lessonCount: 16,
    price: 1850,
    discountPrice: 1450,
    image: "/assets/images/home/instructor-3d-showcase.jpg",
    badge: "Çok Satan",
    isLive: true,
  },
  {
    id: "c-lgs-fen",
    title: "LGS Fen Bilimleri: Yeni Nesil Beceri Temelli Soru Kampı",
    slug: "lgs-fen-bilimleri-yeni-nesil-kamp",
    category: "YKS / LGS",
    categorySlug: "yks-lgs",
    instructorName: "Merve Yılmaz",
    instructorTitle: "Fen Bilimleri Eğitmeni",
    rating: 4.95,
    studentCount: 285,
    duration: "18 Saat",
    lessonCount: 12,
    price: 1600,
    discountPrice: 1250,
    image: "/parttime_career.png",
    badge: "Popüler",
    isLive: true,
  },
  {
    id: "c-ing-konusma",
    title: "B1-B2 Konuşma Odaklı Birebir Pratik İngilizce Atölyesi",
    slug: "b1-b2-pratik-ingilizce-atolyesi",
    category: "Yabancı Dil",
    categorySlug: "yabanci-dil",
    instructorName: "Zeynep Aksoy",
    instructorTitle: "CELTA Sertifikalı Eğitmen",
    rating: 4.92,
    studentCount: 420,
    duration: "20 Saat",
    lessonCount: 14,
    price: 2200,
    discountPrice: 1750,
    image: "/assets/images/home/instructor-3d-showcase.jpg",
    badge: "Öne Çıkan",
    isLive: true,
  },
  {
    id: "c-yazilim-python",
    title: "Python ile Sıfırdan İleri Düzey Algoritma ve Proje Geliştirme",
    slug: "python-sifirdan-ileri-duzey-algoritma",
    category: "Yazılım",
    categorySlug: "yazilim",
    instructorName: "Caner Aydın",
    instructorTitle: "Kıdemli Yazılım Mühendisi",
    rating: 4.88,
    studentCount: 510,
    duration: "30 Saat",
    lessonCount: 22,
    price: 1950,
    discountPrice: 1550,
    image: "/parttime_career.png",
    badge: "Kariyer",
    isLive: false,
  },
  {
    id: "c-tyt-turkce",
    title: "TYT Türkçe: Paragraf Taktikleri ve Hızlı Okuma Teknikleri",
    slug: "tyt-turkce-paragraf-taktikleri",
    category: "YKS / LGS",
    categorySlug: "yks-lgs",
    instructorName: "Selin Demir",
    instructorTitle: "Türk Dili ve Edebiyatı Uzmanı",
    rating: 4.94,
    studentCount: 390,
    duration: "16 Saat",
    lessonCount: 10,
    price: 1400,
    discountPrice: 1100,
    image: "/assets/images/home/instructor-3d-showcase.jpg",
    badge: "Yeni",
    isLive: true,
  },
  {
    id: "c-ilkokul-okuma",
    title: "İlkokul Temel Matematik ve Akılcı Problem Çözme Becerileri",
    slug: "ilkokul-temel-matematik-problem-cozme",
    category: "İlkokul & Ortaokul",
    categorySlug: "ilkokul-ortaokul",
    instructorName: "Elif Koç",
    instructorTitle: "Sınıf Eğitimi Uzmanı",
    rating: 4.97,
    studentCount: 220,
    duration: "14 Saat",
    lessonCount: 10,
    price: 1350,
    discountPrice: 990,
    image: "/parttime_career.png",
    badge: "Temel Eğitim",
    isLive: true,
  },
];

const CATEGORY_TABS = [
  { id: "all", label: "Tüm Kurslar" },
  { id: "yks-lgs", label: "YKS & LGS" },
  { id: "yabanci-dil", label: "Yabancı Dil" },
  { id: "yazilim", label: "Yazılım & Kodlama" },
  { id: "ilkokul-ortaokul", label: "İlkokul & Ortaokul" },
];

export default function CoursesShowcaseSection() {
  const [activeTab, setActiveTab] = useState("all");

  // Query actual backend courses
  const { data: apiCourses } = useQuery({
    queryKey: ["homepage-courses-showcase"],
    queryFn: async () => {
      try {
        const data = await coursesApi.list(0, 12);
        return Array.isArray(data) && data.length > 0 ? data : null;
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000,
  });

  // If backend returns populated courses with titles and instructors, map them; otherwise use curated list
  const allCourses: DisplayCourse[] =
    apiCourses && apiCourses.length > 0
      ? apiCourses.map((c: any, idx: number) => ({
          id: c.id || `course-${idx}`,
          title: c.title,
          slug: c.slug || `course-${idx}`,
          category: c.categories?.[0]?.name || "Genel Gelişim",
          categorySlug: c.categories?.[0]?.slug || "genel",
          instructorName: c.teacher?.full_name || "BiHocam Eğitmeni",
          instructorTitle: "Alan Uzmanı",
          rating: 4.9,
          studentCount: 150 + idx * 35,
          duration: "20 Saat",
          lessonCount: 12,
          price: c.price || 1500,
          discountPrice: c.discount_price || null,
          image: c.thumbnail_path || (idx % 2 === 0 ? "/assets/images/home/instructor-3d-showcase.jpg" : "/parttime_career.png"),
          badge: c.is_featured ? "Öne Çıkan" : undefined,
          isLive: true,
        }))
      : CURATED_COURSES;

  const filteredCourses =
    activeTab === "all"
      ? allCourses
      : allCourses.filter((c) => c.categorySlug === activeTab);

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80 relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute top-1/4 left-10 w-96 h-96 bg-emerald-50/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-teal-50/50 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header with Title and "Tümünü Gör" Button */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-6">
          <div className="space-y-3 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-800">
                <BookOpen className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ÖNE ÇIKAN DERS PROGRAMLARI
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]"
            >
              Hedefine Uygun{" "}
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                Canlı ve Kapsamlı Kurslar
              </span>
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal"
            >
              Alanında uzman öğretmenlerle hazırlanmış, canlı soru çözümleri ve interaktif seanslarla desteklenen kurs programlarını incele.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="shrink-0"
          >
            <Link
              href="/courses"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 text-slate-800 font-bold text-sm border border-slate-200 hover:border-emerald-300 transition-all shadow-2xs group"
            >
              <span>Tüm Kursları İncele</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Category Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {CATEGORY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                    : "bg-slate-100 hover:bg-slate-200/80 text-slate-700 border border-slate-200/60"
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          <AnimatePresence mode="popLayout">
            {filteredCourses.slice(0, 6).map((course, idx) => (
              <motion.div
                key={course.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className="group flex flex-col bg-white rounded-3xl border border-slate-200/90 overflow-hidden shadow-xs hover:shadow-xl hover:border-emerald-300/80 transition-all duration-300 hover:-translate-y-1"
              >
                {/* Thumbnail Container */}
                <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
                  <Image
                    src={course.image}
                    alt={course.title}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover object-center group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent pointer-events-none" />

                  {/* Top Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between">
                    <span className="px-3 py-1 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-[11px] font-bold border border-white/20">
                      {course.category}
                    </span>
                    {course.isLive && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 text-white text-[10px] font-bold shadow-xs">
                        <Video className="w-3 h-3" />
                        Canlı Sınıf
                      </span>
                    )}
                  </div>

                  {/* Bottom Duration Badge on Image */}
                  <div className="absolute bottom-3 left-3 flex items-center gap-3 text-white text-xs font-medium">
                    <span className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-sm px-2.5 py-0.5 rounded-lg text-[11px]">
                      <Clock className="w-3 h-3 text-emerald-400" />
                      {course.duration}
                    </span>
                    <span className="flex items-center gap-1 bg-slate-950/60 backdrop-blur-sm px-2.5 py-0.5 rounded-lg text-[11px]">
                      <BookOpen className="w-3 h-3 text-teal-400" />
                      {course.lessonCount} Seans
                    </span>
                  </div>
                </div>

                {/* Content Area */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    {/* Instructor Info */}
                    <div className="flex items-center justify-between text-xs text-slate-500">
                      <div className="flex items-center gap-1.5 font-semibold text-slate-700">
                        <GraduationCap className="w-4 h-4 text-emerald-600" />
                        <span>{course.instructorName}</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                      </div>
                      <div className="flex items-center gap-1 text-amber-600 font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{course.rating}</span>
                      </div>
                    </div>

                    {/* Course Title */}
                    <h3 className="text-base sm:text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 leading-snug">
                      <Link href={`/courses/${course.slug}`}>
                        {course.title}
                      </Link>
                    </h3>
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] text-slate-400 font-medium">Toplam Ücret</p>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl font-black text-slate-900">
                          ₺{(course.discountPrice || course.price).toLocaleString("tr-TR")}
                        </span>
                        {course.discountPrice && (
                          <span className="text-xs text-slate-400 line-through">
                            ₺{course.price.toLocaleString("tr-TR")}
                          </span>
                        )}
                      </div>
                    </div>

                    <Link
                      href={`/courses/${course.slug}`}
                      className="px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-600 text-emerald-700 hover:text-white font-bold text-xs transition-all flex items-center gap-1.5 group-hover:bg-emerald-600 group-hover:text-white shadow-2xs"
                    >
                      <span>İncele</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
