"use client";

import { motion } from "framer-motion";
import { ArrowRight, Briefcase, GraduationCap, Sparkles, Star, Users } from "lucide-react";
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
  },
];

export default function InstructorsShowcaseSection() {
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

        {/* Instructors 4-Column Grid (Aniq-UI Portrait Style) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {FEATURED_INSTRUCTORS.map((teacher, idx) => (
            <motion.div
              key={teacher.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative h-full flex flex-col"
            >
              <article className="relative rounded-3xl bg-white p-3.5 border border-slate-200/90 shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 flex flex-col justify-between h-full">
                <div>
                  {/* Portrait 3:4 Aspect Image Container */}
                  <div className="relative aspect-[3/4] select-none overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                    <img
                      alt={teacher.name}
                      loading="lazy"
                      width="600"
                      height="800"
                      decoding="async"
                      className="h-full w-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
                      src={teacher.image}
                    />

                    {/* Gradient Overlay for Text Readability */}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />

                    {/* Top Badge */}
                    <div className="absolute top-3 right-3 z-10">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border backdrop-blur-md ${teacher.accentColor}`}>
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

                {/* Bottom Row: Rating & Profile Action */}
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between px-1">
                  <div className="flex items-center gap-1 text-xs font-bold text-slate-700">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>{teacher.rating.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({teacher.reviewsCount})</span>
                  </div>

                  <Link
                    href={`/teachers`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>Profili İncele</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </article>
            </motion.div>
          ))}
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
