"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Play, BookOpen, Code2, Puzzle } from "lucide-react";
import Pedestal3DClock from "./Pedestal3DClock";

export default function LessonHourFlowSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      id: 0,
      step: "01",
      icon: Play,
      iconWrapClass: "bg-orange-50/80 border-orange-200/90 text-orange-500",
      activeRing: "ring-2 ring-orange-500/40 shadow-lg shadow-orange-500/15",
      dotColor: "bg-orange-300",
      pillClass: "bg-orange-100 text-orange-600 border border-orange-200",
      title: "Hazırlık & Keşif",
      duration: "10 Dk",
      subtitle: "Eksik tespiti & ders hedefi",
      actionWord: "İzle & Keşfet",
    },
    {
      id: 1,
      step: "02",
      icon: BookOpen,
      iconWrapClass: "bg-indigo-50/80 border-indigo-200/90 text-indigo-500",
      activeRing: "ring-2 ring-indigo-500/40 shadow-lg shadow-indigo-500/15",
      dotColor: "bg-indigo-300",
      pillClass: "bg-indigo-100 text-indigo-600 border border-indigo-200",
      title: "Konu Anlatımı",
      duration: "20 Dk",
      subtitle: "Kavram haritası & mantık",
      actionWord: "Derinlemesine Kavra",
    },
    {
      id: 2,
      step: "03",
      icon: Code2,
      iconWrapClass: "bg-emerald-50/80 border-emerald-200/90 text-emerald-500",
      activeRing: "ring-2 ring-emerald-500/40 shadow-lg shadow-emerald-500/15",
      dotColor: "bg-emerald-300",
      pillClass: "bg-emerald-100 text-emerald-600 border border-emerald-200",
      title: "Yeni Nesil Çözüm",
      duration: "20 Dk",
      subtitle: "Birlikte soru & taktik",
      actionWord: "Uygulamalı Pratik",
    },
    {
      id: 3,
      step: "04",
      icon: Puzzle,
      iconWrapClass: "bg-amber-50/80 border-amber-200/90 text-amber-500",
      activeRing: "ring-2 ring-amber-500/40 shadow-lg shadow-amber-500/15",
      dotColor: "bg-amber-300",
      pillClass: "bg-amber-100 text-amber-600 border border-amber-200",
      title: "Pekiştirme & Rapor",
      duration: "10 Dk",
      subtitle: "Ödev & veli gelişim notu",
      actionWord: "Gelişimi Sağlamlaştır",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-white border-b border-slate-100 relative overflow-hidden">
      {/* Subtle Warm Ambient Background Accents */}
      <div className="absolute top-1/3 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[450px] bg-orange-100/30 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[400px] bg-amber-100/25 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          {/* ── LEFT COLUMN: TITLE, INTRO & 4-STEP TIMELINE (7 COLS) ── */}
          <div className="lg:col-span-7 space-y-10 text-center lg:text-left">
            {/* Top Category Badge */}
            <div className="space-y-3.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-[#EA580C] uppercase tracking-wider">
                <span>CANLI DERSİN İÇİNDE</span>
                <span className="text-orange-400">✦</span>
              </div>

              {/* Main Headline */}
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]">
                BiHocam&apos;da{" "}
                <span className="text-[#EA580C]">
                  Bir Saatlik Ders
                </span>{" "}
                <br className="hidden sm:inline" />
                Gerçekte Nasıl Geçer?
              </h2>

              {/* Subtitle */}
              <p className="text-slate-600 font-normal text-base sm:text-lg max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Her canlı seans kanıtlanmış aynı pedagojik akışı takip eder: hazırlıkla başla, konuyu derinlemesine kavra, yeni nesil soru çözerek pekiştir ve veli raporu al.
              </p>
            </div>

            {/* ── 4-STEP HORIZONTAL FLOW WITH DOTTED CONNECTORS ── */}
            <div className="pt-2">
              <div className="flex flex-col sm:flex-row items-center sm:items-start justify-between gap-6 sm:gap-2">
                {steps.map((s, idx) => {
                  const IconComp = s.icon;
                  const isCurrent = activeStep === idx;

                  return (
                    <div
                      key={s.id}
                      onClick={() => setActiveStep(idx)}
                      className="group flex-1 flex flex-col items-center text-center cursor-pointer transition-transform duration-200 hover:-translate-y-1"
                    >
                      {/* Icon Circle & Horizontal Connector Row */}
                      <div className="w-full flex items-center justify-center relative mb-4">
                        {/* Circle Badge */}
                        <div
                          className={`w-16 h-16 sm:w-18 sm:h-18 rounded-full border-2 flex items-center justify-center transition-all duration-300 z-10 ${s.iconWrapClass} ${
                            isCurrent ? s.activeRing : "shadow-xs group-hover:shadow-md"
                          }`}
                        >
                          <IconComp className="w-7 h-7" />
                        </div>

                        {/* Dotted Connector Line (Only between consecutive items on desktop) */}
                        {idx < steps.length - 1 && (
                          <div className="hidden sm:flex items-center justify-center gap-1 absolute left-[calc(50%+36px)] right-[calc(-50%+36px)] top-1/2 -translate-y-1/2 z-0 pointer-events-none">
                            {[0, 1, 2, 3, 4].map((dot) => (
                              <span
                                key={dot}
                                className={`w-1 h-1 rounded-full transition-colors duration-300 ${
                                  activeStep > idx ? "bg-orange-400" : "bg-slate-300"
                                }`}
                              />
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Number Badge Pill */}
                      <div className="mb-2">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-mono font-bold transition-all ${s.pillClass}`}
                        >
                          {s.step}
                        </span>
                      </div>

                      {/* Step Title & Duration */}
                      <h3 className="text-base font-bold text-slate-900 group-hover:text-orange-600 transition-colors">
                        {s.title}
                      </h3>

                      {/* Subtitle */}
                      <p className="text-xs text-slate-500 leading-snug mt-1 max-w-[130px] font-normal">
                        {s.subtitle}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── RIGHT COLUMN: 3D CLOCK ON PEDESTAL (5 COLS) ── */}
          <div className="lg:col-span-5 w-full flex items-center justify-center">
            <Pedestal3DClock activeStep={activeStep} onStepSelect={(step) => setActiveStep(step)} />
          </div>
        </div>
      </div>
    </section>
  );
}
