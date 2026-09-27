"use client";

import { motion } from "framer-motion";
import { ArrowRight, ChartBar, School, ShieldCheck } from "lucide-react";
import Link from "next/link";

interface StepItem {
  number: string;
  numberColor: string;
  badgeBorder: string;
  title: string;
  description: string;
  image: string;
  link: string;
  buttonAria: string;
}

const STEPS: StepItem[] = [
  {
    number: "01",
    numberColor: "text-[#5B37F5] dark:text-[#A78BFA]",
    badgeBorder: "border-[#5D3BFF]/30",
    title: "Talebinizi Açın veya Eğitmen Seçin",
    description:
      "İhtiyaç duyduğunuz branşı, sınıf düzeyini veya sınav hedefinizi belirtin. İster yüzlerce doğrulanmış eğitmeni filtreleyip hemen seçin, ister ücretsiz özel ders talebi açın.",
    image:
      "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=700&q=80",
    link: "/tenders/new",
    buttonAria: "Ders Talebi Aç Adımına Git",
  },
  {
    number: "02",
    numberColor: "text-[#C2410C] dark:text-[#FF8A3D]",
    badgeBorder: "border-[#FF6A3D]/30",
    title: "Teklifleri Değerlendirin & Tanışın",
    description:
      "Alanında uzman eğitimcilerden gelen bütçenize uygun saatlik ders tekliflerini inceleyin. Dilerseniz ilk 15 dakikalık ücretsiz tanışma seansıyla öğretmeninizle karşılıklı uyumunuzu test edin.",
    image:
      "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80",
    link: "/teachers",
    buttonAria: "Eğitmenleri Keşfet Adımına Git",
  },
  {
    number: "03",
    numberColor: "text-[#127A3B] dark:text-[#4ADE80]",
    badgeBorder: "border-[#149447]/30",
    title: "Güvenli Ödeme ile Canlı Derse Başlayın",
    description:
      "BDDK lisanslı güvenli ödeme ve emanet havuz korumasıyla dersinizi başlatın. Ders başarıyla tamamlanıp onay vermediğiniz sürece ücret eğitmeninize aktarılmaz.",
    image:
      "https://images.unsplash.com/photo-1522202176988-66273c2fd55f?auto=format&fit=crop&w=700&q=80",
    link: "/tanisma-dersi",
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
            Hedeflerinize ulaşmanız için tasarlanmış en yalın, şeffaf ve güvenli online özel ders deneyimi.
          </motion.p>
        </div>

        {/* 3 Step Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {STEPS.map((step, idx) => (
            <motion.div
              key={step.number}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: idx * 0.15 }}
              whileHover={{ y: -6, transition: { duration: 0.2 } }}
              className="group relative h-full flex flex-col"
            >
              <div className="relative bg-white transition-all duration-300 hover:shadow-xl hover:border-emerald-500/40 overflow-hidden rounded-3xl p-6 sm:p-8 flex h-full flex-col border border-slate-200/90 shadow-sm">
                {/* Accent Top Border Bar on Hover */}
                <div className="absolute -top-px inset-x-0 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                {/* Aspect 4:3 Image Container */}
                <div className="relative -mx-2 -mt-2 aspect-[4/3] mb-6 sm:-mx-3 sm:-mt-3 rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
                  <img
                    alt={step.title}
                    loading="lazy"
                    width="600"
                    height="450"
                    decoding="async"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    src={step.image}
                  />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/0 transition-colors" />
                </div>

                {/* Step Header with Number Circle */}
                <h3 className="flex items-center gap-3 text-lg sm:text-xl font-bold text-slate-900 font-display">
                  <span
                    className={`inline-flex shrink-0 items-center justify-center w-10 h-10 rounded-full border text-sm font-black font-mono tabular-nums ${step.badgeBorder} ${step.numberColor} bg-slate-50`}
                  >
                    {step.number}
                  </span>
                  <span>{step.title}</span>
                </h3>

                {/* Step Description */}
                <p className="mt-4 flex-1 text-sm leading-relaxed text-slate-600 font-normal">
                  {step.description}
                </p>

                {/* Step Action Button */}
                <div className="mt-6 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-400">Adımı İncele</span>
                  <Link
                    href={step.link}
                    aria-label={step.buttonAria}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white transition-all shadow-xs group-hover:scale-110"
                  >
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Aniq-UI Inspired Trust Bar Underneath */}
        <motion.ul
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-12 sm:mt-16 grid grid-cols-1 sm:grid-cols-3 gap-4 rounded-3xl bg-white border border-slate-200/90 px-6 py-5 shadow-sm divide-y sm:divide-y-0 sm:divide-x divide-slate-100"
        >
          <li className="flex items-center justify-center gap-3 text-center py-2 sm:py-0">
            <ShieldCheck className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">
              BDDK Lisanslı Emanet Havuz Güvencesi
            </span>
          </li>
          <li className="flex items-center justify-center gap-3 text-center py-2 sm:py-0">
            <School className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">
              4 Aşamalı Doğrulanmış Uzman Eğitmenler
            </span>
          </li>
          <li className="flex items-center justify-center gap-3 text-center py-2 sm:py-0">
            <ChartBar className="w-5 h-5 flex-shrink-0 text-emerald-600" />
            <span className="text-sm font-semibold text-slate-700">
              Kendi Hızınızda ve Esnek Saatlerde
            </span>
          </li>
        </motion.ul>
      </div>
    </section>
  );
}
