"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import {
  ArrowRight,
  Briefcase,
  CheckCircle2,
  GraduationCap,
  RotateCw,
  Sparkles,
  Star,
  Target,
} from "lucide-react";
import Link from "next/link";

interface TeacherApiItem {
  id: string;
  full_name: string;
  avatar_url?: string | null;
  bio?: string | null;
  expertise_tags?: string[] | string | null;
  live_class_price?: number | null;
  rating?: number | null;
  review_count?: number | null;
}

export default function InstructorsShowcaseSection() {
  const [flippedCardId, setFlippedCardId] = useState<string | null>(null);

  const { data: teachers, isLoading } = useQuery<TeacherApiItem[]>({
    queryKey: ["showcase-teachers"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/v1/teachers");
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        }
      } catch (err) {
        console.error("Teachers fetch error:", err);
      }
      return [];
    },
    staleTime: 60 * 1000,
  });

  const toggleCardFlip = (id: string) => {
    setFlippedCardId((prev) => (prev === id ? null : id));
  };

  // Denetim kuralı: Gerçek veri yoksa bölümü gizle. Uydurma profil veya stok görsel kullanma.
  if (!isLoading && (!teachers || teachers.length === 0)) {
    return null;
  }

  const displayTeachers = (teachers || []).slice(0, 4);

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
                <Sparkles className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                ÖNE ÇIKAN EĞİTMENLER
              </span>
            </motion.div>

            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]"
            >
              Doğrulanmış{" "}
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
              Tanış
            </motion.h2>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed"
            >
              Kimlik ve diploma doğrulaması tamamlanmış, öğrencilerine hem konu anlatımı hem de çalışma rehberliği sunan tecrübeli eğitmen kadrosu.
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
              <span>Tüm Eğitmenleri Keşfet</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </motion.div>
        </div>

        {/* Instructors Interactive Flip Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {displayTeachers.map((teacher, idx) => {
            const isFlipped = flippedCardId === teacher.id;

            // Parse expertise tags
            let tags: string[] = [];
            if (Array.isArray(teacher.expertise_tags)) {
              tags = teacher.expertise_tags;
            } else if (typeof teacher.expertise_tags === "string") {
              try {
                tags = JSON.parse(teacher.expertise_tags);
              } catch {
                tags = teacher.expertise_tags.split(",").map((s) => s.trim());
              }
            }

            return (
              <motion.div
                key={teacher.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="group [perspective:1200px] h-full"
              >
                {/* 3D Flipper Box with touch flip support */}
                <div
                  onClick={() => toggleCardFlip(teacher.id)}
                  className={`relative w-full h-full min-h-[380px] transition-transform duration-700 [transform-style:preserve-3d] cursor-pointer ${
                    isFlipped ? "[transform:rotateY(180deg)]" : ""
                  } group-hover:[transform:rotateY(180deg)]`}
                >
                  {/* FRONT FACE */}
                  <article className="relative rounded-3xl bg-white p-4 border border-slate-200/90 shadow-sm group-hover:shadow-xl transition-all duration-300 flex flex-col justify-between h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                    <div>
                      {/* Portrait Container */}
                      <div className="relative aspect-[3/4] select-none overflow-hidden rounded-2xl bg-slate-100 border border-slate-100 flex items-center justify-center">
                        {teacher.avatar_url ? (
                          <img
                            alt={teacher.full_name}
                            loading="lazy"
                            width="400"
                            height="533"
                            className="h-full w-full object-cover object-top transition-transform duration-500"
                            src={teacher.avatar_url}
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-50 to-teal-100 text-emerald-800">
                            <GraduationCap className="w-16 h-16 text-emerald-600 mb-2" />
                            <span className="text-xl font-bold font-display">{teacher.full_name}</span>
                          </div>
                        )}

                        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-transparent to-transparent pointer-events-none" />

                        {/* Flip Hint */}
                        <div className="absolute top-3 left-3 z-10">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-slate-900/80 text-white backdrop-blur-md border border-white/20">
                            <RotateCw className="w-3 h-3" />
                            <span>Bilgi Kartı</span>
                          </span>
                        </div>

                        {/* Bottom Name & Headline overlay */}
                        <div className="absolute bottom-3 left-3 right-3 z-10 text-white">
                          <h3 className="font-bold text-lg font-display leading-tight">{teacher.full_name}</h3>
                          <p className="text-xs text-emerald-300 font-medium truncate mt-0.5">
                            {tags.length > 0 ? tags.join(" • ") : "BiHocam Eğitmeni"}
                          </p>
                        </div>
                      </div>

                      {/* Brief Info below image */}
                      <div className="pt-3 px-1">
                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {teacher.bio || "Doğrulanmış alan eğitmeni. Birebir canlı seanslarla hedeflerinize destek sunar."}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 px-1 border-t border-slate-100 flex items-center justify-between mt-3">
                      <div className="text-xs font-mono font-bold text-slate-900">
                        {teacher.live_class_price ? (
                          <span>₺{teacher.live_class_price} <span className="text-[10px] font-normal text-slate-500">/ saatlik</span></span>
                        ) : (
                          <span className="text-emerald-700">Teklife Açık</span>
                        )}
                      </div>
                      {teacher.review_count && teacher.review_count > 0 && teacher.rating ? (
                        <div className="flex items-center gap-1 text-xs font-bold text-amber-500">
                          <Star className="w-3.5 h-3.5 fill-amber-500" />
                          <span>{teacher.rating.toFixed(1)}</span>
                          <span className="text-[10px] text-slate-400">({teacher.review_count})</span>
                        </div>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md">
                          Doğrulanmış
                        </span>
                      )}
                    </div>
                  </article>

                  {/* BACK FACE */}
                  <article className="absolute inset-0 rounded-3xl bg-slate-900 text-white p-6 border border-slate-700 shadow-xl flex flex-col justify-between [transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <h4 className="font-bold text-sm text-emerald-400">{teacher.full_name}</h4>
                        <span className="text-[10px] text-slate-400 uppercase tracking-wider">Eğitmen Profili</span>
                      </div>

                      <div className="space-y-2">
                        <p className="text-xs text-slate-300 leading-relaxed">
                          {teacher.bio || "Alanında tecrübeli, modern yöntemlerle özel ders veren eğitmenimiz."}
                        </p>
                      </div>

                      {tags.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
                            Uzmanlık Branşları
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {tags.map((tag, tIdx) => (
                              <span
                                key={tIdx}
                                className="px-2 py-0.5 bg-slate-800 text-slate-200 border border-slate-700 rounded-lg text-[10px] font-medium"
                              >
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="pt-4 border-t border-slate-800">
                      <Link
                        href={`/teachers/${teacher.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md"
                      >
                        <span>Profili & Dersleri Gör</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>
                  </article>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
