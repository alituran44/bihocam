"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { BookOpen, GraduationCap, Sparkles, Star, Users, Video } from "lucide-react";
import React, { useRef } from "react";

export default function Hero3DFloatingVisual() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse tilt / parallax values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for natural 3D physics
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [12, -12]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-14, 14]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width - 0.5;
    const y = (e.clientY - rect.top) / rect.height - 0.5;
    mouseX.set(x);
    mouseY.set(y);
  };

  const handleMouseLeave = () => {
    mouseX.set(0);
    mouseY.set(0);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="relative w-full max-w-[480px] sm:max-w-[540px] aspect-square mx-auto flex items-center justify-center select-none"
      style={{ perspective: 1200 }}
    >
      {/* ── AMBIENT GLOW BACKDROP ── */}
      <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/10 via-amber-500/10 to-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* ── 1. ROTATING ORBITAL RINGS (Yörünge Halkaları) ── */}
      {/* Outer Dashed Orbit */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 40, ease: "linear" }}
        className="absolute w-[86%] h-[86%] rounded-full border border-dashed border-emerald-500/25 pointer-events-none"
      >
        {/* Orbiting Satellite Particle 1 */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-gradient-to-br from-amber-400 to-amber-500 shadow-lg shadow-amber-500/50 flex items-center justify-center">
          <Sparkles className="w-2.5 h-2.5 text-white" />
        </div>
        {/* Orbiting Satellite Particle 2 */}
        <div className="absolute -bottom-2 left-1/3 -translate-x-1/2 w-3 h-3 rounded-full bg-emerald-500 shadow-md shadow-emerald-500/50" />
      </motion.div>

      {/* Inner Elliptical Orbit */}
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ repeat: Infinity, duration: 32, ease: "linear" }}
        className="absolute w-[70%] h-[70%] rounded-full border border-teal-500/20 pointer-events-none"
      >
        <div className="absolute top-1/4 -right-1.5 w-3.5 h-3.5 rounded-full bg-teal-400 shadow-md shadow-teal-500/40" />
      </motion.div>

      {/* ── 2. 3D TILT CONTAINER (Fareyle hareket eden katman) ── */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* ── 3. MAIN LEVITATING HERO ILLUSTRATION (3D Kitap & Kep) ── */}
        <motion.div
          animate={{
            y: [-12, 10, -12],
            rotateZ: [-1, 1.5, -1],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          }}
          className="relative z-10 flex items-center justify-center"
          style={{ transform: "translateZ(40px)" }}
        >
          {/* Stylized 3D Open Book Vector Graphic */}
          <div className="relative w-64 sm:w-80 h-48 sm:h-60 filter drop-shadow-[0_24px_36px_rgba(16,185,129,0.22)]">
            <svg
              viewBox="0 0 320 240"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="w-full h-full"
            >
              {/* Book Base Shadow */}
              <ellipse cx="160" cy="220" rx="130" ry="18" fill="rgba(15, 23, 42, 0.12)" />

              {/* Book Blue Hard Cover (Left Page) */}
              <path
                d="M160 195 C110 185 45 190 20 205 L22 85 C48 70 110 65 160 80 Z"
                fill="url(#blueCoverGradient)"
                stroke="#1e3a8a"
                strokeWidth="2"
              />

              {/* Book Blue Hard Cover (Right Page) */}
              <path
                d="M160 195 C210 185 275 190 300 205 L298 85 C272 70 210 65 160 80 Z"
                fill="url(#blueCoverGradient)"
                stroke="#1e3a8a"
                strokeWidth="2"
              />

              {/* Book Spine Center Glow */}
              <path d="M160 80 L160 195" stroke="#3b82f6" strokeWidth="3" strokeLinecap="round" />

              {/* Left Pages Stack */}
              <path
                d="M158 190 C112 178 52 182 30 196 L32 78 C54 64 112 60 158 74 Z"
                fill="url(#pageLeftGradient)"
              />
              {/* Left Page Reading Lines */}
              <line x1="50" y1="95" x2="135" y2="90" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
              <line x1="50" y1="112" x2="140" y2="107" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
              <line x1="50" y1="129" x2="130" y2="124" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />
              <line x1="50" y1="146" x2="120" y2="142" stroke="#93c5fd" strokeWidth="2.5" strokeLinecap="round" opacity="0.6" />

              {/* Right Pages Stack */}
              <path
                d="M162 190 C208 178 268 182 290 196 L288 78 C266 64 208 60 162 74 Z"
                fill="url(#pageRightGradient)"
              />
              {/* Right Page Reading Lines */}
              <line x1="185" y1="90" x2="270" y2="95" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <line x1="180" y1="107" x2="270" y2="112" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <line x1="185" y1="124" x2="265" y2="129" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />
              <line x1="190" y1="142" x2="255" y2="146" stroke="#cbd5e1" strokeWidth="2.5" strokeLinecap="round" opacity="0.7" />

              {/* Page Bookmark Ribbon */}
              <path
                d="M160 74 C162 110 166 140 170 180 L163 174 L156 180 C158 140 159 110 160 74 Z"
                fill="#f59e0b"
              />

              {/* Gradients */}
              <defs>
                <linearGradient id="blueCoverGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#2563eb" />
                  <stop offset="50%" stopColor="#1d4ed8" />
                  <stop offset="100%" stopColor="#1e3a8a" />
                </linearGradient>
                <linearGradient id="pageLeftGradient" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#f8fafc" />
                  <stop offset="100%" stopColor="#e2e8f0" />
                </linearGradient>
                <linearGradient id="pageRightGradient" x1="1" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#f1f5f9" />
                </linearGradient>
              </defs>
            </svg>

            {/* ── 4. FLOATING 3D GRADUATION CAP (Kep) ── */}
            <motion.div
              animate={{
                y: [-6, 8, -6],
                rotate: [-3, 4, -3],
              }}
              transition={{
                repeat: Infinity,
                duration: 4.8,
                ease: "easeInOut",
              }}
              className="absolute -top-8 -right-4 sm:-top-10 sm:-right-6 w-28 sm:w-36 h-28 sm:h-36 filter drop-shadow-[0_16px_20px_rgba(245,158,11,0.35)]"
            >
              <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Cap Top Diamond */}
                <polygon points="60,20 110,42 60,64 10,42" fill="url(#capGoldGradient)" stroke="#d97706" strokeWidth="2" />
                {/* Cap Skull Base */}
                <path d="M35 52 L35 72 C35 84 85 84 85 72 L85 52" fill="#d97706" stroke="#b45309" strokeWidth="2" />
                {/* Golden Button & Tassel */}
                <circle cx="60" cy="42" r="4.5" fill="#fef08a" stroke="#d97706" strokeWidth="1.5" />
                <path d="M60 42 C78 48 88 64 90 85" stroke="#fef08a" strokeWidth="2.5" strokeLinecap="round" />
                <rect x="86" y="84" width="8" height="14" rx="2" fill="#fbbf24" stroke="#d97706" strokeWidth="1" />
                <defs>
                  <linearGradient id="capGoldGradient" x1="0" y1="0" x2="1" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" />
                    <stop offset="60%" stopColor="#d97706" />
                    <stop offset="100%" stopColor="#b45309" />
                  </linearGradient>
                </defs>
              </svg>
            </motion.div>

            {/* ── 5. FLOATING 3D PLAY MEDALLION (Turuncu Play Butonu) ── */}
            <motion.div
              animate={{
                y: [8, -8, 8],
                scale: [0.98, 1.04, 0.98],
              }}
              transition={{
                repeat: Infinity,
                duration: 5.2,
                ease: "easeInOut",
              }}
              className="absolute -bottom-4 right-6 sm:right-10 w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-amber-400 via-amber-500 to-amber-600 p-1 shadow-xl shadow-amber-500/40 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform"
            >
              <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center border-2 border-white/40">
                <div className="w-0 h-0 border-t-[10px] border-t-transparent border-b-[10px] border-b-transparent border-l-[16px] border-l-blue-900 ml-1 drop-shadow-md" />
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* ── 6. FLOATING BIHOCAM LIVE BADGES (Aniq-UI Rozetleri) ── */}
        {/* Badge 1: 1:1 Canlı Sınıf */}
        <motion.div
          animate={{ y: [-4, 6, -4] }}
          transition={{ repeat: Infinity, duration: 4.2, ease: "easeInOut" }}
          style={{ transform: "translateZ(60px)" }}
          className="absolute top-6 left-2 sm:-left-4 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-emerald-500/10 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 z-20"
        >
          <div className="w-7 h-7 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600">
            <Video className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-slate-800 leading-tight">1:1 Canlı Sınıf</div>
            <div className="text-[9px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              Şu An Aktif
            </div>
          </div>
        </motion.div>

        {/* Badge 2: Onaylı Akademisyenler */}
        <motion.div
          animate={{ y: [6, -6, 6] }}
          transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
          style={{ transform: "translateZ(70px)" }}
          className="absolute bottom-8 -left-2 sm:-left-6 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 z-20"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <span>850+ Hoca</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Doğrulanmış Kadro</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
