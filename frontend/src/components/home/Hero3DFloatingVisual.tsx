"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import React, { useRef } from "react";
import { ShieldCheck } from "lucide-react";

export default function Hero3DFloatingVisual() {
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Mouse tilt / parallax values
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  // Smooth springs for natural 3D physics
  const springConfig = { damping: 25, stiffness: 150 };
  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [8, -8]), springConfig);
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), springConfig);

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
      className="relative w-full max-w-[390px] sm:max-w-[480px] lg:max-w-[540px] mx-auto flex items-center justify-center select-none"
      style={{ perspective: 1200 }}
    >
      {/* ── 3D TILT CONTAINER ── */}
      <motion.div
        style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* ── BACKGROUND ORBITAL SVG ARCS & PARTICLES (Navy + Green Hybrid) ── */}
        <svg
          aria-hidden="true"
          viewBox="0 0 1120 840"
          fill="none"
          className="pointer-events-none absolute inset-0 -z-10 h-full w-full overflow-visible opacity-80"
        >
          {/* Main Primary Arc - Deep Navy */}
          <path
            d="M 52.6 183.4 A 560 560 0 0 1 1067.4 183.4"
            stroke="#1b2559"
            strokeOpacity="0.30"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Lower Arc - Fresh Emerald / Lime */}
          <path
            d="M 1085.6 665.1 A 580 580 0 0 1 227 895"
            stroke="#8bc32a"
            strokeOpacity="0.45"
            strokeWidth="2"
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
          {/* Dashed Secondary Arc - Navy & Slate */}
          <path
            d="M 325 13 A 470 470 0 0 0 8.6 322.6"
            stroke="#1b2559"
            strokeOpacity="0.25"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeDasharray="10 14"
            vectorEffect="non-scaling-stroke"
          />

          {/* Orbital Satellite Dots (Brand Colors) */}
          <circle cx="966.6" cy="13.4" r="6" fill="#8bc32a" fillOpacity="0.75" />
          <circle cx="8.6" cy="517.2" r="5" fill="#1b2559" fillOpacity="0.55" />
          <circle cx="892.7" cy="895" r="7" fill="#10b981" fillOpacity="0.6" />
          <circle cx="135.7" cy="175" r="4" fill="#1b2559" fillOpacity="0.5" />

          {/* Matrix Dot Grid on Bottom Left */}
          {[-60, -36, -12, 12, 36].map((x) =>
            [470, 494, 518, 542].map((y) => (
              <circle key={`${x}-${y}`} cx={x} cy={y} r="2.5" fill="#64748b" fillOpacity="0.25" />
            ))
          )}

          {/* Floating Ring & Geometric Accents */}
          <circle cx="1160" cy="250" r="18" stroke="#8bc32a" strokeOpacity="0.5" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
          <path d="M -15 645 L 0 675 L -30 675 Z" stroke="#1b2559" strokeOpacity="0.35" strokeWidth="1.5" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
        </svg>

        {/* ── FLOATING TRUST BADGE 1: TOP RIGHT (Deep Navy Glass Pill) ── */}
        <motion.div
          animate={{
            y: [-6, 6, -6],
            x: [0, 3, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 4.5,
            ease: "easeInOut",
          }}
          style={{ transform: "translateZ(55px)" }}
          className="absolute -top-3 -right-2 sm:-top-5 sm:right-2 z-20 pointer-events-none"
        >
          <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#1b2559]/95 backdrop-blur-md border border-[#2e3b79] shadow-xl text-white">
            <span className="w-2 h-2 rounded-full bg-[#8bc32a] animate-pulse" />
            <span className="text-[11px] font-bold tracking-tight">Canlı Birebir Seans</span>
          </div>
        </motion.div>

        {/* ── FLOATING TRUST BADGE 2: BOTTOM LEFT (Emanet Havuz Card) ── */}
        <motion.div
          animate={{
            y: [6, -6, 6],
            x: [0, -3, 0],
          }}
          transition={{
            repeat: Infinity,
            duration: 5.2,
            ease: "easeInOut",
          }}
          style={{ transform: "translateZ(50px)" }}
          className="absolute -bottom-3 -left-3 sm:-bottom-4 sm:left-0 z-20 pointer-events-none"
        >
          <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-white/95 backdrop-blur-md border border-slate-200/90 shadow-xl shadow-slate-900/10">
            <div className="w-7 h-7 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-[9px] font-bold uppercase tracking-wider text-slate-400 leading-none">Ödeme Koruması</p>
              <p className="text-xs font-bold text-slate-900 leading-tight">Emanet Havuz</p>
            </div>
          </div>
        </motion.div>

        {/* ── MAIN 3D VISUAL (Smooth Framer Motion Float & Parallax) ── */}
        <motion.div
          animate={{
            y: [-8, 8, -8],
            rotate: [-0.6, 0.6, -0.6],
          }}
          transition={{
            repeat: Infinity,
            duration: 5.5,
            ease: "easeInOut",
          }}
          className="relative z-10 w-full flex items-center justify-center"
          style={{ transform: "translateZ(30px)" }}
        >
          <div className="w-full aspect-[4/3] relative flex items-center justify-center">
            <img
              src="/assets/images/home/hero/illustration-3d-transparent.webp"
              alt="BiHocam Canlı Özel Ders Deneyimi"
              className="w-full h-full object-contain drop-shadow-[0_20px_35px_rgba(27,37,89,0.22)] drop-shadow-[0_8px_20px_rgba(139,195,42,0.18)]"
              loading="eager"
            />
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
}

