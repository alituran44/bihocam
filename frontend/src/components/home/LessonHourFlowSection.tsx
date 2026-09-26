"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, CheckCircle, Clock, Code, FileText, Lightbulb, Play, Sparkles, Target, Video } from "lucide-react";
import AnimatedClockDial from "./AnimatedClockDial";

export default function LessonHourFlowSection() {
  const [activeStep, setActiveStep] = useState(0);

  const steps = [
    {
      step: "01",
      icon: Target,
      title: "Keşif & Hedef Tespiti",
      duration: "İlk 10 Dk",
      desc: "Önceki dersin kontrolü, öğrencinin takıldığı noktaların belirlenmesi ve günün ders hedefinin netleştirilmesi.",
      color: "text-emerald-700 bg-emerald-100/70 border-emerald-300",
      activeBg: "bg-emerald-50 border-emerald-500/50 shadow-emerald-500/10",
    },
    {
      step: "02",
      icon: Video,
      title: "İnteraktif Konu Anlatımı",
      duration: "20 Dk",
      desc: "Kurulumsuz WebRTC dijital beyaz tahta üzerinde görsel materyallerle kavramsal ve mantıksal derinlemesine anlatım.",
      color: "text-teal-700 bg-teal-100/70 border-teal-300",
      activeBg: "bg-teal-50 border-teal-500/50 shadow-teal-500/10",
    },
    {
      step: "03",
      icon: Lightbulb,
      title: "Birlikte Soru Çözümü & Taktik",
      duration: "20 Dk",
      desc: "Hoca eşliğinde yeni nesil sorular, sınav taktikleri ve öğrencinin bizzat ekranda çözdüğü uygulamalı pratik seansı.",
      color: "text-amber-700 bg-amber-100/70 border-amber-300",
      activeBg: "bg-amber-50 border-amber-500/50 shadow-amber-500/10",
    },
    {
      step: "04",
      icon: FileText,
      title: "Ödev, Kayıt & Veli Raporu",
      duration: "Son 10 Dk",
      desc: "Bireysel çalışma ödevinin tanımlanması, ders video kaydının arşive alınması ve veliye anlık gelişim notunun iletilmesi.",
      color: "text-indigo-700 bg-indigo-100/70 border-indigo-300",
      activeBg: "bg-indigo-50 border-indigo-500/50 shadow-indigo-500/10",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Section Header */}
        <div className="max-w-3xl mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>CANLI SINIF METODOLOJİSİ</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]">
            1 Saatlik BiHocam Dersi <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Nasıl Geçer?
            </span>
          </h2>
          <p className="text-slate-600 font-normal text-base sm:text-lg leading-relaxed">
            Her seans, öğrenciyi sıkmadan maksimum verim sağlayan 4 aşamalı mikro-metodoloji ile işlenir. Adımlara tıklayarak ders akışını inceleyin:
          </p>
        </div>

        {/* 2-Column Grid: Left 4 Steps / Right 3D Clock Dial */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Left: 4 Interconnected Interactive Steps (7 Cols) */}
          <div className="lg:col-span-7 space-y-4 relative">
            
            {steps.map((s, idx) => {
              const IconComp = s.icon;
              const isActive = activeStep === idx;

              return (
                <div key={idx} className="relative">
                  {/* Connecting Vertical Line between steps */}
                  {idx < steps.length - 1 && (
                    <div className="absolute left-7 top-14 w-0.5 h-8 border-l-2 border-dashed border-slate-300 z-0" />
                  )}

                  <motion.div
                    onClick={() => setActiveStep(idx)}
                    whileHover={{ x: 4 }}
                    className={`relative z-10 flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                      isActive
                        ? `${s.activeBg} shadow-md`
                        : "bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/80"
                    }`}
                  >
                    {/* Step Icon Badge */}
                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center border font-display font-black text-base shrink-0 ${s.color}`}>
                      <IconComp className="w-5 h-5" />
                    </div>

                    {/* Step Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold font-mono text-slate-400">
                          ADIM {s.step}
                        </span>
                        <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                          {s.duration}
                        </span>
                      </div>

                      <h3 className={`text-base font-bold tracking-tight mb-1 font-display ${isActive ? "text-slate-900" : "text-slate-800"}`}>
                        {s.title}
                      </h3>

                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-normal">
                        {s.desc}
                      </p>
                    </div>
                  </motion.div>
                </div>
              );
            })}
          </div>

          {/* Right: Interactive 3D Clock Dial (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="w-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm text-center">
              <AnimatedClockDial
                activeStep={activeStep}
                onStepSelect={(step) => setActiveStep(step)}
              />
              <p className="text-xs text-slate-400 mt-4">
                💡 Sol taraftaki adımlara tıklayarak saat kadranındaki seans dilimlerini görebilirsiniz.
              </p>
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
