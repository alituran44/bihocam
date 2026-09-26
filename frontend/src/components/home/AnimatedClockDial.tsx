"use client";

import { motion } from "framer-motion";
import { Clock, Play, Sparkles } from "lucide-react";
import React from "react";

interface AnimatedClockDialProps {
  activeStep: number;
  onStepSelect: (step: number) => void;
}

export default function AnimatedClockDial({ activeStep, onStepSelect }: AnimatedClockDialProps) {
  // Step angles:
  // Step 0: 0 to 60 deg (0 - 10 min)
  // Step 1: 60 to 180 deg (10 - 30 min)
  // Step 2: 180 to 300 deg (30 - 50 min)
  // Step 3: 300 to 360 deg (50 - 60 min)
  const stepRotations = [30, 120, 240, 330];
  const currentRotation = stepRotations[activeStep] || 30;

  const stepInfos = [
    { title: "İlk 10 Dk: Hedef & Eksik Tespiti", color: "#10b981", range: "00 - 10 dk" },
    { title: "20 Dk: İnteraktif Konu Anlatımı", color: "#0d9488", range: "10 - 30 dk" },
    { title: "20 Dk: Birlikte Soru Çözümü & Taktik", color: "#f59e0b", range: "30 - 50 dk" },
    { title: "Son 10 Dk: Ödev & Veli Raporlaması", color: "#6366f1", range: "50 - 60 dk" },
  ];

  const currentInfo = stepInfos[activeStep] || stepInfos[0];

  return (
    <div className="relative w-full max-w-[420px] aspect-square mx-auto flex flex-col items-center justify-center p-4 select-none">
      {/* Ambient Radial Glow */}
      <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-emerald-500/10 to-teal-500/10 rounded-full blur-2xl pointer-events-none" />

      {/* 3D Outer Clock Pedestal */}
      <div className="relative w-64 sm:w-72 h-64 sm:h-72 rounded-full bg-gradient-to-b from-white via-slate-50 to-slate-100 border-8 border-slate-200/90 shadow-[0_24px_50px_-12px_rgba(15,23,42,0.18)] p-4 flex items-center justify-center">
        
        {/* Decorative Dial Tick Marks */}
        <div className="absolute inset-4 rounded-full border border-slate-200 pointer-events-none">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <div
              key={deg}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-2 bg-slate-300 origin-bottom"
              style={{
                transform: `rotate(${deg}deg) translateY(0px)`,
                transformOrigin: "50% 120px",
              }}
            />
          ))}
        </div>

        {/* 4 Colored Sector Arcs on the Clock */}
        <svg viewBox="0 0 200 200" className="absolute inset-6 w-auto h-auto pointer-events-none">
          {/* Sector 1: 0 - 60 deg (0 - 10 min) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#10b981"
            strokeWidth={activeStep === 0 ? "12" : "6"}
            strokeDasharray="86 430"
            strokeDashoffset="0"
            className="transition-all duration-500 opacity-80"
          />
          {/* Sector 2: 60 - 180 deg (10 - 30 min) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#0d9488"
            strokeWidth={activeStep === 1 ? "12" : "6"}
            strokeDasharray="172 344"
            strokeDashoffset="-86"
            className="transition-all duration-500 opacity-80"
          />
          {/* Sector 3: 180 - 300 deg (30 - 50 min) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#f59e0b"
            strokeWidth={activeStep === 2 ? "12" : "6"}
            strokeDasharray="172 344"
            strokeDashoffset="-258"
            className="transition-all duration-500 opacity-80"
          />
          {/* Sector 4: 300 - 360 deg (50 - 60 min) */}
          <circle
            cx="100"
            cy="100"
            r="82"
            fill="none"
            stroke="#6366f1"
            strokeWidth={activeStep === 3 ? "12" : "6"}
            strokeDasharray="86 430"
            strokeDashoffset="-430"
            className="transition-all duration-500 opacity-80"
          />
        </svg>

        {/* Center Clock Hands (Framer Motion Animation) */}
        <motion.div
          className="relative w-full h-full flex items-center justify-center"
          animate={{ rotate: currentRotation }}
          transition={{ type: "spring", stiffness: 80, damping: 14 }}
        >
          {/* Minute Hand pointing to current step */}
          <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-1.5 h-20 bg-gradient-to-t from-slate-800 to-emerald-600 rounded-full origin-bottom shadow-md" />
          {/* Hour Hand */}
          <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-2 h-14 bg-slate-800 rounded-full origin-bottom" style={{ transform: "rotate(-60deg)" }} />
          {/* Center Nut */}
          <div className="w-5 h-5 rounded-full bg-slate-900 border-2 border-white shadow-md z-10" />
        </motion.div>

        {/* Floating Real-time Seans Badge */}
        <div className="absolute -top-3 bg-emerald-600 text-white text-[10px] font-bold px-3 py-1 rounded-full shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 uppercase tracking-wider">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          <span>60 Dk Canlı Seans</span>
        </div>
      </div>

      {/* Dynamic Active Step Caption */}
      <motion.div
        key={activeStep}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="mt-6 text-center"
      >
        <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-bold font-mono bg-slate-100 text-slate-700 border border-slate-200 mb-1.5">
          {currentInfo.range}
        </span>
        <h4 className="text-sm font-bold text-slate-800 font-display">
          {currentInfo.title}
        </h4>
      </motion.div>
    </div>
  );
}
