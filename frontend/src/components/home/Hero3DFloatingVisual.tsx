"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
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
        {/* ── BACKGROUND ORBITAL SVG ARCS & PARTICLES ── */}
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
        </svg>

        {/* ── MAIN 3D VISUAL (Poster on mobile / Lazy video on desktop) ── */}
        <motion.div
          animate={{
            y: [-6, 6, -6],
          }}
          transition={{
            repeat: Infinity,
            duration: 6,
            ease: "easeInOut",
          }}
          className="relative z-10 w-full flex items-center justify-center"
          style={{ transform: "translateZ(30px)" }}
        >
          {/* Mobile Fallback: static poster image (zero video battery drain on mobile) */}
          <div className="block sm:hidden w-full aspect-[4/3] relative">
            <img
              src="/assets/images/home/hero/illustration-loop-light-poster.webp"
              alt="BiHocam Canlı Ders Deneyimi"
              className="w-full h-full object-contain mix-blend-multiply"
              loading="lazy"
            />
          </div>

          {/* Desktop & Tablet: Video with poster and lazy load */}
          <video
            className="hidden sm:block aspect-[4/3] w-full pointer-events-none mix-blend-multiply object-contain drop-shadow-[0_20px_35px_rgba(5,150,105,0.18)]"
            src="/assets/images/home/hero/illustration-loop-light.mp4"
            poster="/assets/images/home/hero/illustration-loop-light-poster.webp"
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            aria-hidden="true"
            tabIndex={-1}
          />
        </motion.div>
      </motion.div>
    </div>
  );
}
