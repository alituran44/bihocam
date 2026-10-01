"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  Award,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  RotateCw,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import Link from "next/link";

interface InstructorItem {
  id: string;
  name: string;
  title: string;
  bio: string;
  rating: number;
  reviewsCount: number;
  image: string;
  badge: string;
  accentColor: string;
  education: string;
  experience: string;
  studentsCount: string;
  successRate: string;
  specialties: string[];
  quote: string;
}

const FEATURED_INSTRUCTORS: InstructorItem[] = [
  {
    id: "ayse-yilmaz",
    name: "Ayşe Yılmaz",
    title: "YKS & TYT Matematik Koçu",
    bio: "ODTÜ mezunu, 10+ yıl dershane ve online derece hazırlık tecrübesiyle yeni nesil soru kalıplarında uzman.",
    rating: 4.9,
    reviewsCount: 148,
    image:
      "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=600&q=80",
    badge: "Popüler Eğitmen",
    accentColor: "text-emerald-700 bg-emerald-50 border-emerald-200",
    education: "ODTÜ Matematik Öğretmenliği (Y. Lisans)",
    experience: "10+ Yıl Derece & Sınav Koçluğu",
    studentsCount: "350+ Başarılı Öğrenci",
    successRate: "%98 Hedef Kazandırma",
    specialties: ["TYT-AYT", "Yeni Nesil Problem", "Derece Koçluğu", "Geometri"],
    quote: "Matematik formül ezberi değil; mantık, strateji ve sistematik problem çözme sanatıdır.",
  },
  {
    id: "mehmet-can",
    name: "Mehmet Can",
    title: "LGS Fen Bilimleri & Fizik",
    bio: "Deney odaklı, görsel hafıza ve mantık yürütme teknikleriyle fen sorularını çocukların en sevdiği derse dönüştürüyor.",
    rating: 4.8,
    reviewsCount: 112,
    image:
      "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=600&q=80",
    badge: "LGS Uzmanı",
    accentColor: "text-teal-700 bg-teal-50 border-teal-200",
    education: "Hacettepe Üniv. Fen Bilgisi Eğitimi",
    experience: "8 Yıl Deneyim (LGS & TÜBİTAK Proje)",
    studentsCount: "280+ Mutlu Öğrenci",
    successRate: "%96 LGS Fen Net Artışı",
    specialties: ["LGS Fen", "Fizik Temelleri", "Görsel Deneyler", "Mantık Muhakeme"],
    quote: "Soyut fen kavramlarını deney ve görsel simülasyonla somutlaştırıp kalıcı hafızaya dönüştürüyoruz.",
  },
  {
    id: "elif-kaya",
    name: "Dr. Elif Kaya",
    title: "İngilizce & IELTS / TOEFL",
    bio: "Yurtdışı sınav hazırlığı ve akıcı konuşma pratiğinde yüzlerce öğrenciyi hedeflediği skora ulaştırdı.",
    rating: 4.9,
    reviewsCount: 164,
    image:
      "https://images.unsplash.com/photo-1580894732444-8ecded7900cd?auto=format&fit=crop&w=600&q=80",
    badge: "Akademik Dil",
    accentColor: "text-indigo-700 bg-indigo-50 border-indigo-200",
    education: "Boğaziçi Üniv. İngiliz Dili & PhD",
    experience: "12 Yıl Uluslararası Dil Koçluğu",
    studentsCount: "420+ Mezun",
    successRate: "7.5+ IELTS Ortalama Skoru",
    specialties: ["IELTS / TOEFL", "Akıcı Konuşma", "Akademik Yazım", "Genel İngilizce"],
    quote: "Dili ezberlemek yerine dünyaya açılan özgüvenli bir iletişim köprüsüne dönüştürmek esastır.",
  },
  {
    id: "burak-demir",
    name: "Burak Demir",
    title: "Python, Algoritma & Kodlama",
    bio: "Yazılım mühendisi, genç yaşta algoritma mantığı ve proje odaklı kodlama dersleriyle geleceğin mühendislerini yetiştiriyor.",
    rating: 4.9,
    reviewsCount: 96,
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80",
    badge: "Yazılım & Yapay Zeka",
    accentColor: "text-amber-700 bg-amber-50 border-amber-200",
    education: "İTÜ Bilgisayar Mühendisliği",
    experience: "7 Yıl Yazılım & Genç Kodlama",
    studentsCount: "190+ Genç Geliştirici",
    successRate: "%100 Proje Tamamlama",
    specialties: ["Python", "Algoritma Temelleri", "Yapay Zeka Giriş", "Proje İnşası"],
    quote: "Her genç sadece teknoloji tüketicisi değil; kendi hayalindeki dünyayı kodlayan bir mimar olabilir.",
  },
];

export default function InstructorsShowcaseSection() {
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  const toggleCardFlip = (id: string) => {
    setFlippedCardId((prev) => (prev === id ? null : id));
  };

  return (
    <section className="relative overflow-hidden bg-slate-50/60 py-20 sm:py-24 lg:py-28 border-b border-slate-200/80">
      {/* Background Ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none opacity-30"
      >
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-100/40 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-teal-100/40 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-14 gap-6">
          <div className="space-y-3 max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-800">
                <Users className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                EĞİTMEN KADROMUZ
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]"
            >
              Alanında Uzman{" "}
              <span className="relative inline-block text-emerald-700">
                Eğitmenlerimizle
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
              Tanışın
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed"
            >
              4 aşamalı titiz denetim ve mülakat sürecinden geçmiş, öğrencilerine sadece ders değil rehberlik sunan seçkin eğitimciler.
            </motion.p>
          </div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Link
              href="/teachers"
              className="inline-flex items-center gap-2 text-emerald-700 hover:text-emerald-800 font-bold text-sm group"
            >
              <span>Tüm Eğitmenleri Gör</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Instructors 4-Column 3D Interactive Flip Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_INSTRUCTORS.map((teacher, idx) => {
            const isFlipped = flippedCardId === teacher.id;

            return (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.2 } }}
                className="group [perspective:1200px] h-full"
              >
                {/* 3D Flipper Box */}
                <div
                  onClick={() => toggleCardFlip(teacher.id)}
                  className={`relative w-full h-full transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer ${
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                  } group-hover:[transform:rotateY(180deg)]`}
                >
                  {/* =========================================
                      FRONT FACE: Portrait & Signature Look
                     ========================================= */}
                  <article className="relative rounded-3xl bg-white p-3.5 border border-slate-200/90 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                    <div>
                      {/* Portrait 3:4 Aspect Image Container */}
                      <div className="relative aspect-[3/4] select-none overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                        <img
                          alt={teacher.name}
                          loading="lazy"
                          width="600"
                          height="800"
                          decoding="async"
                          className="h-full w-full object-cover object-top transition-transform duration-500"
                          src={teacher.image}
                        />

                        {/* Gradient Overlay for Text Readability */}
                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent" />

                        {/* Flip Hint Indicator (Top Left) */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-900/75 backdrop-blur-md text-slate-200 border border-white/15 group-hover:border-emerald-400/50 group-hover:text-emerald-300 transition-colors shadow">
                            <RotateCw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-700" />
                            <span>Bilgi Kartı</span>
                          </span>
                        </div>

                        {/* Top Badge (Top Right) */}
                        <div className="absolute top-3 right-3 z-10">
                          <span
                            className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${teacher.accentColor}`}
                          >
                            {teacher.badge}
                          </span>
                        </div>

                        {/* Bottom Name Pill (Aniq-UI Signature) */}
                        <div className="absolute bottom-4 left-0 z-10">
                          <span className="relative inline-block px-4 py-1.5 text-base sm:text-lg font-bold tracking-tight text-white">
                            <span
                              aria-hidden="true"
                              className="absolute inset-0 rounded-e-xl bg-slate-900/90 backdrop-blur-md border-y border-r border-white/10"
                            />
                            <span className="relative">{teacher.name}</span>
                          </span>
                        </div>
                      </div>

                      {/* Branch & Title */}
                      <div className="mt-4 px-1 space-y-1.5">
                        <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700">
                          <Briefcase className="w-3.5 h-3.5 shrink-0" />
                          <span>{teacher.title}</span>
                        </p>
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed font-normal">
                          {teacher.bio}
                        </p>
                      </div>
                    </div>

                    {/* Bottom Row: Rating & Flip Action */}
                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between px-1">
                      <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                        <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                        <span>{teacher.rating.toFixed(1)}</span>
                        <span className="text-slate-400 font-normal">
                          ({teacher.reviewsCount})
                        </span>
                      </div>

                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 group-hover:text-emerald-800 transition-colors">
                        <span>Detaylar &rarr;</span>
                      </span>
                    </div>
                  </article>

                  {/* =========================================
                      BACK FACE: Structured Teacher Info & Specs
                     ========================================= */}
                  <article className="absolute inset-0 rounded-3xl bg-gradient-to-br from-slate-950 via-[#0a1222] to-slate-950 text-white p-5 border border-slate-700/70 shadow-2xl flex flex-col justify-between h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden select-none">
                    {/* Ambient Glow Effects */}
                    <div
                      aria-hidden="true"
                      className="absolute -top-16 -right-16 w-36 h-36 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none"
                    />
                    <div
                      aria-hidden="true"
                      className="absolute -bottom-16 -left-16 w-36 h-36 bg-teal-500/15 rounded-full blur-2xl pointer-events-none"
                    />

                    {/* Top: Header with Avatar & Name */}
                    <div className="relative z-10 flex items-center justify-between pb-3 border-b border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="relative">
                          <img
                            src={teacher.image}
                            alt={teacher.name}
                            className="w-11 h-11 rounded-full object-cover object-top border-2 border-emerald-500/50 shadow-md"
                          />
                          <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 border-2 border-slate-900" />
                        </div>
                        <div>
                          <div className="flex items-center gap-1.5">
                            <h4 className="font-bold text-white text-sm tracking-tight leading-tight">
                              {teacher.name}
                            </h4>
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          </div>
                          <p className="text-[11px] font-semibold text-emerald-400 leading-tight mt-0.5">
                            {teacher.badge}
                          </p>
                        </div>
                      </div>

                      {/* Flip Back Button */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleCardFlip(teacher.id);
                        }}
                        className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors border border-white/10"
                        title="Karta Dön"
                      >
                        <RotateCw className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    {/* Middle: 4-Cell Quick Info Grid */}
                    <div className="relative z-10 grid grid-cols-2 gap-2 my-auto py-2">
                      <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Eğitim</span>
                        </div>
                        <p className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">
                          {teacher.education}
                        </p>
                      </div>

                      <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">
                          <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                          <span>Deneyim</span>
                        </div>
                        <p className="text-xs font-bold text-slate-100 line-clamp-2 leading-snug">
                          {teacher.experience}
                        </p>
                      </div>

                      <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">
                          <Users className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                          <span>Öğrenci</span>
                        </div>
                        <p className="text-xs font-bold text-slate-100 leading-snug">
                          {teacher.studentsCount}
                        </p>
                      </div>

                      <div className="bg-white/[0.04] border border-white/5 rounded-xl p-2.5 flex flex-col justify-between">
                        <div className="flex items-center gap-1 text-slate-400 text-[10px] font-medium uppercase tracking-wider mb-1">
                          <Target className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                          <span>Başarı</span>
                        </div>
                        <p className="text-xs font-bold text-slate-100 leading-snug">
                          {teacher.successRate}
                        </p>
                      </div>
                    </div>

                    {/* Teacher Quote / Philosophy */}
                    <div className="relative z-10 bg-white/[0.03] border border-white/5 rounded-xl p-2.5 my-1">
                      <div className="flex items-start gap-2">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                        <p className="text-[11px] text-slate-300 italic leading-relaxed line-clamp-2">
                          &ldquo;{teacher.quote}&rdquo;
                        </p>
                      </div>
                    </div>

                    {/* Specialties Badges */}
                    <div className="relative z-10 my-1">
                      <p className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">
                        Öne Çıkan Uzmanlıklar
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {teacher.specialties.map((spec) => (
                          <span
                            key={spec}
                            className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          >
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Bottom CTA Action Button */}
                    <div className="relative z-10 pt-3 border-t border-white/10 mt-auto">
                      <Link
                        href="/teachers"
                        onClick={(e) => e.stopPropagation()}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-950/50 hover:shadow-emerald-950/80 transition-all group/btn"
                      >
                        <span>Profili İncele & Randevu Al</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-0.5 transition-transform" />
                      </Link>
                    </div>
                  </article>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Center Bottom View All Action */}
        <div className="mt-12 sm:mt-14 flex justify-center">
          <Link
            href="/teachers"
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm px-8 py-4 shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all"
          >
            <GraduationCap className="w-4 h-4" />
            <span>Tüm Eğitmenleri Keşfet</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  );
}
