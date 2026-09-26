"use client";

import { motion } from "framer-motion";
import { BookOpen, GraduationCap, ShieldCheck, Smartphone, Sparkles, Star, Users, Zap } from "lucide-react";

export default function HeroWaveRibbon() {
  const items = [
    { icon: <BookOpen className="w-4 h-4 text-emerald-600" />, text: "36+ Yayınlanmış Kurs & Program" },
    { icon: <GraduationCap className="w-4 h-4 text-amber-500" />, text: "850+ Doğrulanmış Akademisyen Hoca" },
    { icon: <Smartphone className="w-4 h-4 text-teal-600" />, text: "Kurulumsuz WebRTC 1:1 Canlı Sınıf" },
    { icon: <ShieldCheck className="w-4 h-4 text-emerald-600" />, text: "Emanet Havuz Korumalı Güvenli Ödeme" },
    { icon: <Star className="w-4 h-4 text-amber-400 fill-amber-400" />, text: "4.98 / 5 Öğrenci Memnuniyeti" },
    { icon: <Zap className="w-4 h-4 text-indigo-600" />, text: "30 Saniyede Ücretsiz İhale Talebi" },
    { icon: <Sparkles className="w-4 h-4 text-purple-600" />, text: "İlk 15 Dk Ücretsiz Tanışma Dersi" },
  ];

  return (
    <div className="relative w-full overflow-hidden bg-gradient-to-b from-white via-slate-50 to-white py-4 sm:py-6 border-y border-slate-200/70 shadow-xs">
      {/* Background Soft Wave Curves */}
      <div className="absolute inset-0 pointer-events-none opacity-40">
        <svg
          className="w-full h-full preserve-3d"
          viewBox="0 0 1440 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M0 20C240 5 480 35 720 20C960 5 1200 35 1440 20V80H0V20Z"
            fill="url(#waveGradient)"
            opacity="0.3"
          />
          <defs>
            <linearGradient id="waveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#10b981" />
              <stop offset="50%" stopColor="#f59e0b" />
              <stop offset="100%" stopColor="#0d9488" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {/* Marquee Track */}
      <motion.div
        className="flex whitespace-nowrap relative z-10"
        animate={{ x: ["0%", "-50%"] }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
      >
        {[...Array(2)].map((_, ri) => (
          <div key={ri} className="flex items-center gap-8 sm:gap-12 px-6">
            {items.map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2.5 text-xs sm:text-sm font-semibold text-slate-700 hover:text-emerald-700 transition-colors"
              >
                <div className="p-1 rounded-lg bg-slate-100/80 border border-slate-200/60 shadow-xs">
                  {item.icon}
                </div>
                <span>{item.text}</span>
                <span className="text-slate-300 ml-6 select-none font-thin">•</span>
              </div>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
