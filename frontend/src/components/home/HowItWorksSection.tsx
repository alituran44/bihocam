"use client";

import { motion } from "framer-motion";
import { ArrowRight, School, ShieldCheck, CheckCircle2, Clock, Sparkles } from "lucide-react";
import Link from "next/link";

interface StepItem {
  number: string;
  numberColor: string;
  badgeBorder: string;
  title: string;
  description: string;
  link: string;
  buttonText: string;
  buttonAria: string;
}

const STEPS: StepItem[] = [
  {
    number: "01",
    numberColor: "text-emerald-600",
    badgeBorder: "border-emerald-500/30",
    title: "Ders Talebini Aç veya Eğitmen Seç",
    description:
      "İhtiyaç duyduğun branşı, sınıf düzeyini ve bütçe aralığını belirterek ders talebi aç veya doğrulanmış eğitmenleri listeleyerek profillerini incele.",
    link: "/tenders/new",
    buttonText: "Ders Talebi Aç",
    buttonAria: "Ders Talebi Aç Adımına Git",
  },
  {
    number: "02",
    numberColor: "text-teal-600",
    badgeBorder: "border-teal-500/30",
    title: "Teklifleri Karşılaştır & Eğitmenini Seç",
    description:
      "Talebine gelen saatlik ders tekliflerini incele. Eğitmenin tecrübesi, uzmanlık alanları ve fiyatlarına göre sana en uygun olanı seçerek iletişime geç.",
    link: "/teachers",
    buttonText: "Eğitmenleri Keşfet",
    buttonAria: "Eğitmenleri Keşfet Adımına Git",
  },
  {
    number: "03",
    numberColor: "text-indigo-600",
    badgeBorder: "border-indigo-500/30",
    title: "Güvenli Ödeme ile Canlı Derse Başla",
    description:
      "{{ODEME_KURULUSU_ADI}} güvencesindeki emanet havuz ile ödemeni yap. Sen dersini tamamlayıp onay vermeden ücret eğitmene aktarılmaz.",
    link: "/tanisma-dersi",
    buttonText: "Canlı Derse Başla",
    buttonAria: "Canlı Derse Başla Adımına Git",
  },
];

export default function HowItWorksSection() {
  return (
    <section className="relative overflow-hidden bg-slate-50/70 py-20 sm:py-24 lg:py-28 border-b border-slate-200/80">
      {/* Background Subtle Ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none opacity-40"
      >
        <div className="absolute top-20 right-10 w-72 h-72 bg-emerald-100/40 rounded-full blur-[120px]" />
        <div className="absolute bottom-10 left-10 w-72 h-72 bg-teal-100/40 rounded-full blur-[120px]" />
      </div>

      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20 space-y-3">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-800">
              <School className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              3 Basit Adımda
            </span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.15]"
          >
            BiHocam Nasıl{" "}
            <span className="relative inline-block text-emerald-700">
              Çalışır?
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
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Hedeflerine ulaşman için tasarlanmış şeffaf, güvenli ve esnek online özel ders süreci.
          </motion.p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              className="group relative h-full flex flex-col"
            >
              <div className="relative bg-white transition-all duration-300 hover:shadow-xl hover:border-emerald-500/40 overflow-hidden rounded-3xl p-6 sm:p-8 flex h-full flex-col justify-between border border-slate-200/90 shadow-sm">
                <div>
                  {/* Step Number & Header */}
                  <div className="flex items-center justify-between mb-6">
                    <span className={`text-4xl sm:text-5xl font-black font-mono tracking-tighter ${step.numberColor}`}>
                      {step.number}
                    </span>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                      Adım {idx + 1}
                    </span>
                  </div>

                  {/* Title & Description */}
                  <h3 className="text-xl font-bold text-slate-900 mb-3 leading-snug tracking-tight font-display group-hover:text-emerald-700 transition-colors">
                    {step.title}
                  </h3>
                  <p className="text-sm text-slate-600 leading-relaxed font-normal">
                    {step.description}
                  </p>
                </div>

                {/* Bottom Action Link */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
                  <Link
                    href={step.link}
                    aria-label={step.buttonAria}
                    className="inline-flex items-center gap-2 text-xs font-bold text-emerald-700 hover:text-emerald-800 transition-colors"
                  >
                    <span>{step.buttonText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

      </div>
    </section>
  );
}
