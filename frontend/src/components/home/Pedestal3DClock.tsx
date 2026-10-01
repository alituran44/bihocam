"use client";

import React from "react";
import { motion } from "framer-motion";

interface Pedestal3DClockProps {
  activeStep: number;
  onStepSelect?: (step: number) => void;
}

export default function Pedestal3DClock({ activeStep }: Pedestal3DClockProps) {
  // Step rotations for minute hand:
  // Step 0: 60 deg (10th minute mark)
  // Step 1: 180 deg (30th minute mark)
  // Step 2: 300 deg (50th minute mark)
  // Step 3: 360 deg (60th minute mark)
  const minuteRotations = [60, 180, 300, 360];
  const hourRotations = [-35, -20, 0, 15];

  const currentMinuteRotation = minuteRotations[activeStep] ?? 60;
  const currentHourRotation = hourRotations[activeStep] ?? -35;

  return (
    <div className="relative w-full max-w-[420px] aspect-square flex items-center justify-center select-none mx-auto">
      {/* ── BACKGROUND ORBITAL RAYS & SPARKLE STARS (✦) ── */}
      <svg
        aria-hidden="true"
        viewBox="0 0 500 500"
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible"
      >
        <defs>
          <radialGradient id="clockAmbientGlow" cx="50%" cy="45%" r="50%">
            <stop offset="0%" stopColor="#FB923C" stopOpacity="0.25" />
            <stop offset="60%" stopColor="#FED7AA" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow behind clock */}
        <circle cx="250" cy="220" r="200" fill="url(#clockAmbientGlow)" />

        {/* Faint Concentric Orbital Arcs */}
        <path
          d="M 80 220 A 170 170 0 0 1 420 220"
          stroke="#FDBA74"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          strokeOpacity="0.55"
          fill="none"
        />
        <path
          d="M 50 220 A 200 200 0 0 1 450 220"
          stroke="#FDBA74"
          strokeWidth="1"
          strokeOpacity="0.35"
          fill="none"
        />

        {/* 4-Point Sparkle Star Top-Right */}
        <g transform="translate(410, 80) scale(0.9)">
          <path
            d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z"
            fill="#FB923C"
            opacity="0.8"
          />
        </g>

        {/* 4-Point Sparkle Star Top-Center */}
        <g transform="translate(260, 45) scale(0.65)">
          <path
            d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z"
            fill="#F97316"
            opacity="0.7"
          />
        </g>

        {/* 4-Point Sparkle Star Top-Left */}
        <g transform="translate(90, 110) scale(0.7)">
          <path
            d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z"
            fill="#FB923C"
            opacity="0.65"
          />
        </g>

        {/* 4-Point Sparkle Star Bottom-Right */}
        <g transform="translate(435, 340) scale(0.75)">
          <path
            d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z"
            fill="#FB923C"
            opacity="0.75"
          />
        </g>

        {/* 4-Point Sparkle Star Bottom-Left */}
        <g transform="translate(70, 360) scale(0.6)">
          <path
            d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z"
            fill="#F97316"
            opacity="0.6"
          />
        </g>
      </svg>

      {/* ── 3D CLOCK & DUAL-TIER PEDESTAL CONTAINER ── */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* SVG Render for Pedestal & Clock Dial */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-[0_25px_35px_rgba(249,115,22,0.18)] overflow-visible"
        >
          <defs>
            {/* Pedestal Bottom Base Gradient */}
            <linearGradient id="pedestalLowerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF1E6" />
              <stop offset="40%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#FDBA74" />
            </linearGradient>

            {/* Pedestal Upper Tier Gradient */}
            <linearGradient id="pedestalUpperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFF8F3" />
              <stop offset="50%" stopColor="#FED7AA" />
              <stop offset="100%" stopColor="#FB923C" />
            </linearGradient>

            {/* Clock Outer Rim 3D Bevel Gradient */}
            <linearGradient id="clockBevelGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#FDBA74" />
              <stop offset="25%" stopColor="#FB923C" />
              <stop offset="70%" stopColor="#EA580C" />
              <stop offset="100%" stopColor="#C2410C" />
            </linearGradient>

            {/* Clock Inner Face Gradient */}
            <radialGradient id="clockFaceGrad" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="80%" stopColor="#FFFBF7" />
              <stop offset="100%" stopColor="#FED7AA" />
            </radialGradient>

            {/* Inner Rim Shadow */}
            <filter id="innerRimShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#C2410C" floodOpacity="0.35" />
            </filter>

            {/* Soft Ambient Pedestal Shadow */}
            <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#EA580C" stopOpacity="0.25" />
              <stop offset="70%" stopColor="#EA580C" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* ── GROUND SHADOW BENEATH PEDESTAL ── */}
          <ellipse cx="200" cy="365" rx="170" ry="24" fill="url(#groundShadow)" />

          {/* ── LOWER PEDESTAL TIER (3D Cylinder) ── */}
          {/* Lower Tier Body */}
          <path
            d="M 50 330 C 50 310, 350 310, 350 330 L 350 350 C 350 370, 50 370, 50 350 Z"
            fill="url(#pedestalLowerGrad)"
          />
          {/* Lower Tier Top Surface */}
          <ellipse cx="200" cy="330" rx="150" ry="22" fill="#FFF7EE" stroke="#FED7AA" strokeWidth="1" />

          {/* ── UPPER PEDESTAL TIER (3D Cylinder) ── */}
          {/* Upper Tier Body */}
          <path
            d="M 85 295 C 85 278, 315 278, 315 295 L 315 315 C 315 332, 85 332, 85 315 Z"
            fill="url(#pedestalUpperGrad)"
          />
          {/* Upper Tier Top Surface */}
          <ellipse cx="200" cy="295" rx="115" ry="18" fill="#FFFBF7" stroke="#FED7AA" strokeWidth="1" />

          {/* ── CLOCK SHADOW ON PEDESTAL ── */}
          <ellipse cx="200" cy="296" rx="90" ry="10" fill="#EA580C" opacity="0.35" />

          {/* ── CLOCK BODY (Diameter: ~210px, Center: 200, 180) ── */}
          {/* Clock Outer Rim */}
          <circle
            cx="200"
            cy="180"
            r="105"
            fill="url(#clockBevelGrad)"
            filter="drop-shadow(0px 10px 18px rgba(194, 65, 12, 0.35))"
          />

          {/* Clock Inner Bevel Ring */}
          <circle
            cx="200"
            cy="180"
            r="92"
            fill="#C2410C"
            opacity="0.3"
          />

          {/* Clock Dial Face */}
          <circle
            cx="200"
            cy="180"
            r="86"
            fill="url(#clockFaceGrad)"
            stroke="#FED7AA"
            strokeWidth="1.5"
          />

          {/* Inner Depth Rim Shadow */}
          <circle
            cx="200"
            cy="180"
            r="86"
            fill="none"
            stroke="#FB923C"
            strokeWidth="4"
            opacity="0.25"
          />

          {/* ── 12 CLOCK TICK MARKS & NUMERAL ACCENTS ── */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = i * 30;
            const isQuarter = i % 3 === 0;
            const tickLength = isQuarter ? 8 : 4.5;
            const strokeWidth = isQuarter ? 2.5 : 1.2;
            const strokeColor = isQuarter ? "#EA580C" : "#FDBA74";

            return (
              <line
                key={i}
                x1="200"
                y1={180 - 80}
                x2="200"
                y2={180 - 80 + tickLength}
                stroke={strokeColor}
                strokeWidth={strokeWidth}
                strokeLinecap="round"
                transform={`rotate(${angle} 200 180)`}
              />
            );
          })}

          {/* Minute dots around perimeter */}
          {Array.from({ length: 60 }).map((_, i) => {
            if (i % 5 === 0) return null;
            const angle = i * 6;
            return (
              <circle
                key={`min-${i}`}
                cx="200"
                cy={180 - 79}
                r="0.8"
                fill="#FED7AA"
                transform={`rotate(${angle} 200 180)`}
              />
            );
          })}
        </svg>

        {/* ── ANIMATED HANDS & CENTER CAP (Overlayed DOM with Framer Motion) ── */}
        <div
          className="absolute inset-0 flex items-center justify-center pointer-events-none"
          style={{ transform: "translateY(-20px)" }}
        >
          {/* Animated Hour Hand */}
          <motion.div
            className="absolute w-2.5 h-16 origin-bottom rounded-full shadow-md"
            animate={{ rotate: currentHourRotation }}
            transition={{ type: "spring", stiffness: 85, damping: 16 }}
            style={{
              bottom: "50%",
              left: "calc(50% - 5px)",
              background: "linear-gradient(to top, #EA580C, #F97316)",
              boxShadow: "0 4px 8px rgba(194,65,12,0.4)",
            }}
          />

          {/* Animated Minute Hand */}
          <motion.div
            className="absolute w-2 h-24 origin-bottom rounded-full shadow-lg"
            animate={{ rotate: currentMinuteRotation }}
            transition={{ type: "spring", stiffness: 95, damping: 15 }}
            style={{
              bottom: "50%",
              left: "calc(50% - 4px)",
              background: "linear-gradient(to top, #C2410C, #EA580C)",
              boxShadow: "0 6px 12px rgba(194,65,12,0.45)",
            }}
          />

          {/* 3D Center Hub / Pin */}
          <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-amber-600 via-orange-500 to-amber-200 border-2 border-white shadow-md flex items-center justify-center z-20">
            <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
