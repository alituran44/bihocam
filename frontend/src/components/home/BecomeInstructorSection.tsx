"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { GraduationCap, Check, ArrowRight, ShieldCheck, Sparkles, TrendingUp } from "lucide-react";

export default function BecomeInstructorSection() {
  const benefits = [
    {
      title: "Esnek Ders Takvimi",
      desc: "Kendi uygun olduğun gün ve çalışma saatlerini serbestçe belirle.",
    },
    {
      title: "Geniş Öğrenci Ağı",
      desc: "YKS, LGS, yabancı dil ve tüm branşlarda canlı ders taleplerine doğrudan teklif ilet.",
    },
    {
      title: "Güvenli Hak Ediş & Emanet Havuz",
      desc: "Ders tamamlandığında ücretin emanet havuz güvencesiyle kesintisiz hesabına aktarılsın.",
    },
    {
      title: "Kişisel Eğitmen Profilini Büyüt",
      desc: "Uzmanlığını, diplomalarını ve referanslarını sergileyerek kendi öğrenci kitleni oluştur.",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-200/80 relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="absolute top-1/4 right-10 w-96 h-96 bg-indigo-50/50 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-50/50 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ── LEFT COLUMN: VISUAL WITH FLOATING GLASS CARD ── */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 relative"
          >
            {/* Main Instructor Image Container */}
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-100 bg-slate-100 aspect-[4/3] sm:aspect-[16/11]">
              <Image
                src="/parttime_career.png"
                alt="BiHocam Eğitmen Kadrosu"
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover object-center transform hover:scale-105 transition-transform duration-700"
                priority={false}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/20 via-transparent to-transparent pointer-events-none" />
            </div>

            {/* Floating Glass Pill Card */}
            <motion.div
              initial={{ opacity: 0, y: 20, scale: 0.95 }}
              whileInView={{ opacity: 1, y: 0, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="absolute -bottom-6 -right-2 sm:-bottom-8 sm:-right-6 w-full max-w-[280px] sm:max-w-[320px] bg-white/95 backdrop-blur-xl p-5 rounded-3xl shadow-2xl border border-slate-200/90 z-20"
            >
              <div className="flex items-center gap-3 mb-2.5">
                <div className="w-10 h-10 rounded-full bg-emerald-100 border border-emerald-300 flex items-center justify-center shrink-0">
                  <TrendingUp className="w-5 h-5 text-emerald-700" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                    Hemen Kazanmaya Başla!
                  </h4>
                  <p className="text-[11px] font-semibold text-emerald-700">
                    Kendi Saatlik Ücretini Belirle
                  </p>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 leading-relaxed">
                BiHocam onaylı eğitmenlerimiz kendi belirledikleri saatlik seans ücretleriyle serbest ve düzenli gelir elde ediyor.
              </p>

              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[10px] font-bold">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Emanet Havuz Güvencesi
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  %100 Güvenli
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* ── RIGHT COLUMN: COPY, BENEFIT CHECKLIST & CTA ── */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
            className="lg:col-span-6 space-y-6 pt-6 lg:pt-0"
          >
            {/* Category Pill */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200/90 text-indigo-700 text-xs font-bold uppercase tracking-wider">
              <GraduationCap className="w-4 h-4 text-indigo-600" />
              <span>EĞİTMEN KADROMUZA KATILIN</span>
            </div>

            {/* Main Headline */}
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]">
              Uzmanlığını Paylaş,{" "}
              <span className="text-indigo-600">Canlı Ders Ver</span>,{" "}
              <br className="hidden sm:inline" />
              Düzenli Gelir Elde Et
            </h2>

            {/* Subtitle */}
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              BiHocam eğitmen ağına katılarak Türkiye genelindeki binlerce öğrenciye ulaş. Ders takvimini, haftalık çalışma saatlerini ve saatlik seans ücretini tamamen kendin yönet.
            </p>

            {/* 4 Feature Checklist Items */}
            <div className="space-y-3.5 pt-2">
              {benefits.map((b, idx) => (
                <div key={idx} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 leading-tight">
                      {b.title}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5 leading-snug">
                      {b.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Primary Action Button */}
            <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
              <Link
                href="/become-instructor"
                className="px-8 py-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm sm:text-base shadow-xl shadow-indigo-600/25 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-5 h-5" />
                <span>Eğitmen Ol</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>

              <span className="text-xs text-slate-400 font-medium text-center sm:text-left">
                Kimlik & diploma doğrulaması ile hızlı onay
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
