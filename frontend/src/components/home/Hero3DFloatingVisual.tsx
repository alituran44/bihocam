"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { GraduationCap, Sparkles, Star, Video, Zap } from "lucide-react";
import React, { useRef } from "react";

export default function Hero3DFloatingVisual() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse tilt / parallax values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for natural 3D physics
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-12, 12]), springConfig);

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
      className="relative w-full max-w-[380px] sm:max-w-[460px] lg:max-w-[540px] mx-auto flex items-center justify-center select-none"
      style={{ perspective: 1200 }}
    >
      {/* ── 3D TILT CONTAINER ── */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* ── BACKGROUND ORBITAL SVG ARCS & PARTICLES (Aniq-UI Native Geometry) ── */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1120 840"
          fill="none"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible opacity-75"
        >
          {/* Main Primary Arc */}
          <path
            d="M 52.6 183.4 A 560 560 0 0 1 1067.4 183.4"
            stroke="#059669"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Lower Arc */}
          <path
            d="M 1085.6 665.1 A 580 580 0 0 1 227 895"
            stroke="#0d9488"
            strokeOpacity="0.35"
            strokeWidth="1.5"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Dashed Secondary Arc */}
          <path
            d="M 325 13 A 470 470 0 0 0 8.6 322.6"
            stroke="#94a3b8"
            strokeOpacity="0.45"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="12 16"
            vectorEffect="non-scaling-stroke"
          />

          {/* Orbital Satellite Dots */}
          <circle cx="966.6" cy="13.4" r="6" fill="#059669" fillOpacity="0.6" />
          <circle cx="8.6" cy="517.2" r="5" fill="#059669" fillOpacity="0.5" />
          <circle cx="892.7" cy="895" r="7" fill="#059669" fillOpacity="0.45" />
          <circle cx="135.7" cy="175" r="3.5" fill="#059669" fillOpacity="0.6" />

          {/* Matrix Dot Grid on Bottom Left */}
          {[-60, -36, -12, 12, 36].map((x) =>
            [470, 494, 518, 542].map((y) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="#94a3b8" fillOpacity="0.35" />
            ))
          )}

          {/* Floating Ring & Geometric Accents */}
          <circle cx="1160" cy="250" r="16" stroke="#059669" strokeOpacity="0.4" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <path d="M -15 645 L 0 675 L -30 675 Z" stroke="#94a3b8" strokeOpacity="0.45" strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
          
          {/* Sparkle 8-point Star */}
          <path
            d="M 170 62 L 175.5 72.5 L 186 78 L 175.5 83.5 L 170 94 L 164.5 83.5 L 154 78 L 164.5 72.5 Z"
            stroke="#059669"
            strokeOpacity="0.6"
            strokeWidth="1.5"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
          />
        </svg>

        {/* ── MAIN 3D LOOPING ANIMATION (Aniq-UI Book, Cap & Play Disc 3D Render) ── */}
        <motion.div
          animate={{
            y: [-8, 8, -8],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          }}
          className="relative z-10 w-full flex items-center justify-center"
          style={{ transform: "translateZ(30px)" }}
        >
          <video
            className="aspect-[4/3] w-full pointer-events-none mix-blend-multiply object-contain drop-shadow-[0_20px_35px_rgba(5,150,105,0.18)]"
            src="/assets/images/home/hero/illustration-loop-light.mp4"
            poster="/assets/images/home/hero/illustration-loop-light-poster.webp"
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            aria-hidden="true"
            tabIndex={-1}
          />
        </motion.div>

        {/* ── FLOATING COMPLEMENTARY BIHOCAM BADGES ── */}
        {/* Top-Left: 1:1 Canlı Sınıf */}
        <motion.div
          animate={{ y: [-4, 6, -4] }}
          transition={{ repeat: Infinity, duration: 4.5, ease: "easeInOut" }}
          style={{ transform: "translateZ(60px)" }}
          className="absolute top-2 -left-2 sm:-left-6 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-emerald-500/10 rounded-2xl px-3.5 py-2 flex items-center gap-2.5 z-20 pointer-events-none"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-500/15 flex items-center justify-center text-emerald-600">
            <Video className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 leading-tight">1:1 Canlı Sınıf</div>
            <div className="text-[10px] text-emerald-600 font-semibold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping" />
              WebRTC Canlı Bağlantı
            </div>
          </div>
        </motion.div>

        {/* Bottom-Left: Doğrulanmış Eğitmenler */}
        <motion.div
          animate={{ y: [6, -6, 6] }}
          transition={{ repeat: Infinity, duration: 5.2, ease: "easeInOut", delay: 0.5 }}
          style={{ transform: "translateZ(70px)" }}
          className="absolute -bottom-2 -left-2 sm:-left-4 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10 rounded-2xl px-3.5 py-2.5 flex items-center gap-2.5 z-20 pointer-events-none"
        >
          <div className="w-8 h-8 rounded-xl bg-amber-500/15 flex items-center justify-center text-amber-600">
            <GraduationCap className="w-4 h-4" />
          </div>
          <div className="text-left">
            <div className="text-xs font-bold text-slate-800 flex items-center gap-1">
              <span>Uzman Eğitmen</span>
              <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
            </div>
            <div className="text-[10px] text-slate-500 font-medium">Birebir & Grup Dersi</div>
          </div>
        </motion.div>

        {/* Bottom-Right: 7/24 AI Asistan & Başarı */}
        <motion.div
          animate={{ y: [-5, 5, -5] }}
          transition={{ repeat: Infinity, duration: 4.8, ease: "easeInOut", delay: 1 }}
          style={{ transform: "translateZ(55px)" }}
          className="absolute -bottom-4 right-2 sm:right-0 bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-teal-500/10 rounded-2xl px-3 py-2 flex items-center gap-2 z-20 pointer-events-none"
        >
          <div className="w-7 h-7 rounded-xl bg-teal-500/15 flex items-center justify-center text-teal-600">
            <Sparkles className="w-3.5 h-3.5" />
          </div>
          <div className="text-left">
            <div className="text-[11px] font-bold text-slate-800 leading-tight">Yapay Zeka Destekli</div>
            <div className="text-[9px] text-teal-600 font-semibold">Kişiselleştirilmiş Müfredat</div>
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}
