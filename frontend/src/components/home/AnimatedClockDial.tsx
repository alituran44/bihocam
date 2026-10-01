"use client";

import { motion } from "framer-motion";
import React from "react";

interface AnimatedClockDialProps {
  activeStep: number;
  onStepSelect?: (step: number) => void;
}

export default function AnimatedClockDial({ activeStep }: AnimatedClockDialProps) {
  // Step angles:
  // Step 0: 0 to 60 deg (0 - 10 min) -> minute hand points to 60 deg (2 o'clock)
  // Step 1: 60 to 180 deg (10 - 30 min) -> minute hand points to 180 deg (6 o'clock)
  // Step 2: 180 to 300 deg (30 - 50 min) -> minute hand points to 300 deg (10 o'clock)
  // Step 3: 300 to 360 deg (50 - 60 min) -> minute hand points to 360 deg (12 o'clock)
  const stepRotations = [60, 180, 300, 360];
  const currentRotation = stepRotations[activeStep] || 60;

  const stepInfos = [
    { title: "İlk 10 Dk: Hedef & Eksik Tespiti", color: "#10b981", range: "00 - 10 dk" },
    { title: "20 Dk: İnteraktif Konu Anlatımı", color: "#0d9488", range: "10 - 30 dk" },
    { title: "20 Dk: Birlikte Soru Çözümü & Taktik", color: "#f59e0b", range: "30 - 50 dk" },
    { title: "Son 10 Dk: Ödev & Veli Raporlaması", color: "#6366f1", range: "50 - 60 dk" },
  ];

  const currentInfo = stepInfos[activeStep] || stepInfos[0];

  return (
    <div className="relative w-full flex flex-col items-center justify-between select-none">
      {/* Top Badge: 60 DK CANLI SEANS */}
      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-600 text-white text-[11px] font-bold shadow-xs uppercase tracking-wider mb-6">
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
        <span>60 DK CANLI SEANS</span>
      </div>

      {/* Clock Dial Container */}
      <div className="relative w-56 h-56 sm:w-64 sm:h-64 rounded-full bg-slate-50/80 border-4 border-slate-100 shadow-[0_12px_32px_-8px_rgba(0,0,0,0.08)] flex items-center justify-center p-3">
        {/* Ambient Subtle Radial Glow */}
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/5 via-teal-500/5 to-amber-500/5 rounded-full blur-xl pointer-events-none" />

        {/* 12 Hour Tick Marks */}
        <div className="absolute inset-3 rounded-full pointer-events-none">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <div
              key={deg}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-slate-300 origin-bottom"
              style={{
                transform: `rotate(${deg}deg) translateY(0px)`,
                transformOrigin: "50% 112px",
              }}
            />
          ))}
        </div>

        {/* 4 Colored Sector Arcs on the Clock */}
        <svg viewBox="0 0 200 200" className="absolute inset-4 w-auto h-auto pointer-events-none">
          {/* Sector 1: 0 - 60 deg (0 - 10 min) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#10b981"
            strokeWidth={activeStep === 0 ? "10" : "5"}
            strokeDasharray="86 430"
            strokeDashoffset="0"
            className="transition-all duration-500"
            style={{ opacity: activeStep === 0 ? 1 : 0.4 }}
          />
          {/* Sector 2: 60 - 180 deg (10 - 30 min) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#0d9488"
            strokeWidth={activeStep === 1 ? "10" : "5"}
            strokeDasharray="172 344"
            strokeDashoffset="-86"
            className="transition-all duration-500"
            style={{ opacity: activeStep === 1 ? 1 : 0.4 }}
          />
          {/* Sector 3: 180 - 300 deg (30 - 50 min) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#f59e0b"
            strokeWidth={activeStep === 2 ? "10" : "5"}
            strokeDasharray="172 344"
            strokeDashoffset="-258"
            className="transition-all duration-500"
            style={{ opacity: activeStep === 2 ? 1 : 0.4 }}
          />
          {/* Sector 4: 300 - 360 deg (50 - 60 min) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#6366f1"
            strokeWidth={activeStep === 3 ? "10" : "5"}
            strokeDasharray="86 430"
            strokeDashoffset="-430"
            className="transition-all duration-500"
            style={{ opacity: activeStep === 3 ? 1 : 0.4 }}
          />
        </svg>

        {/* Center Clock Hands with Framer Motion Animation */}
        <div className="relative w-full h-full flex items-center justify-center">
          {/* Hour Hand (Fixed pointing towards ~11:00) */}
          <div
            className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-1.5 h-12 bg-slate-800 rounded-full origin-bottom shadow-xs"
            style={{ transform: "rotate(-30deg)" }}
          />

          {/* Animated Minute Hand pointing to current step */}
          <motion.div
            className="absolute inset-0 flex items-center justify-center pointer-events-none"
            animate={{ rotate: currentRotation }}
            transition={{ type: "spring", stiffness: 90, damping: 14 }}
          >
            <div
              className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-1.5 h-20 rounded-full origin-bottom shadow-sm"
              style={{ backgroundColor: currentInfo.color }}
            />
          </motion.div>

          {/* Center Hub */}
          <div className="w-4 h-4 rounded-full bg-slate-900 border-2 border-white shadow-sm z-10" />
        </div>
      </div>

      {/* Dynamic Active Step Caption */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="mt-6 text-center"
      >
        <span className="inline-block px-3 py-1 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200 mb-2">
          {currentInfo.range}
        </span>
        <h4 className="text-sm font-bold text-slate-900 font-display">
          {currentInfo.title}
        </h4>
      </motion.div>
    </div>
  );
}
