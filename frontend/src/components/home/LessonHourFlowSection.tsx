"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Clock, FileText, Lightbulb, Target, Video } from "lucide-react";
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
      iconBg: "bg-emerald-100/70 border-emerald-200/80 text-emerald-700",
      activeBorder: "border-emerald-400 bg-emerald-50/40",
    },
    {
      step: "02",
      icon: Video,
      title: "İnteraktif Konu Anlatımı",
      duration: "20 Dk",
      desc: "Kurulumsuz WebRTC dijital beyaz tahta üzerinde görsel materyallerle kavramsal ve mantıksal derinlemesine anlatım.",
      iconBg: "bg-teal-50 border-teal-200/70 text-teal-600",
      activeBorder: "border-teal-400 bg-teal-50/40",
    },
    {
      step: "03",
      icon: Lightbulb,
      title: "Birlikte Soru Çözümü & Taktik",
      duration: "20 Dk",
      desc: "Hoca eşliğinde yeni nesil sorular, sınav taktikleri ve öğrencinin bizzat ekranda çözdüğü uygulamalı pratik seansı.",
      iconBg: "bg-amber-50 border-amber-200/70 text-amber-600",
      activeBorder: "border-amber-400 bg-amber-50/40",
    },
    {
      step: "04",
      icon: FileText,
      title: "Ödev, Kayıt & Veli Raporu",
      duration: "Son 10 Dk",
      desc: "Bireysel çalışma ödevinin tanımlanması, ders video kaydının arşive alınması ve veliye anlık gelişim notunun iletilmesi.",
      iconBg: "bg-indigo-50 border-indigo-200/70 text-indigo-600",
      activeBorder: "border-indigo-400 bg-indigo-50/40",
    },
  ];

  return (
    <section className="py-20 sm:py-28 bg-slate-50/60 border-b border-slate-200/80 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="max-w-3xl mb-12 sm:mb-16 space-y-3">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Clock className="w-3.5 h-3.5 text-emerald-600" />
            <span>BİR SEANSIN İÇİNDE</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]">
            BiHocam&apos;da Bir Saatin <br className="hidden sm:inline" />
            <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
              Gerçekte Nasıl Göründüğü
            </span>
          </h2>
          <p className="text-slate-600 font-normal text-base sm:text-lg leading-relaxed">
            Her modül aynı yapıyı izler: hedefi belirleyin, derinlemesine kavrayın, soru çözün ve gelişimi veliyle anında paylaşın.
          </p>
        </div>

        {/* 2-Column Grid: Left 4 Standalone Cards / Right Clock Dial Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          {/* Left: 4 Interactive Step Cards (7 Cols) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-3.5 sm:space-y-4">
            {steps.map((s, idx) => {
              const IconComp = s.icon;
              const isActive = activeStep === idx;

              return (
                <motion.div
                  key={s.step}
                  onClick={() => setActiveStep(idx)}
                  whileHover={{ x: 4 }}
                  transition={{ duration: 0.15 }}
                  className={`flex items-start gap-4 p-5 rounded-2xl border transition-all duration-200 cursor-pointer ${
                    isActive
                      ? `${s.activeBorder} shadow-sm border-2`
                      : "bg-white border-slate-200/90 hover:border-slate-300 hover:bg-slate-50/50 shadow-xs"
                  }`}
                >
                  {/* Step Icon Badge */}
                  <div
                    className={`w-11 h-11 rounded-xl flex items-center justify-center border font-display font-black text-base shrink-0 ${s.iconBg}`}
                  >
                    <IconComp className="w-5 h-5" />
                  </div>

                  {/* Step Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold font-mono text-slate-400 tracking-wider">
                        ADIM {s.step}
                      </span>
                      <span className="text-xs font-bold px-3 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                        {s.duration}
                      </span>
                    </div>

                    <h3 className="text-base font-bold tracking-tight text-slate-900 font-display">
                      {s.title}
                    </h3>

                    <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-normal mt-1">
                      {s.desc}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>

          {/* Right: Clock Dial White Card (5 Cols) */}
          <div className="lg:col-span-5 flex flex-col">
            <div className="w-full h-full bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm flex flex-col items-center justify-between">
              <AnimatedClockDial
                activeStep={activeStep}
                onStepSelect={(step) => setActiveStep(step)}
              />
              <p className="text-xs text-slate-400 mt-6 text-center leading-relaxed">
                💡 Sol taraftaki adımlara tıklayarak saat kadranındaki seans dilimlerini görebilirsiniz.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
