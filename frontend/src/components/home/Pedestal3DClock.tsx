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
            <stop offset="0%" stopColor="#10B981" stopOpacity="0.22" />
            <stop offset="60%" stopColor="#A7F3D0" stopOpacity="0.10" />
            <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ambient Glow behind clock */}
        <circle cx="250" cy="220" r="200" fill="url(#clockAmbientGlow)" />

        {/* Faint Concentric Orbital Arcs */}
        <path
          d="M 80 220 A 170 170 0 0 1 420 220"
          stroke="#6EE7B7"
          strokeWidth="1.2"
          strokeDasharray="4 6"
          strokeOpacity="0.55"
          fill="none"
        />
        <path
          d="M 50 220 A 200 200 0 0 1 450 220"
          stroke="#6EE7B7"
          strokeWidth="1"
          strokeOpacity="0.35"
          fill="none"
        />

        {/* 4-Point Sparkle Star Top-Right */}
        <g transform="translate(410, 80) scale(0.9)">
          <path
            d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z"
            fill="#10B981"
            opacity="0.8"
          />
        </g>

        {/* 4-Point Sparkle Star Top-Center */}
        <g transform="translate(260, 45) scale(0.65)">
          <path
            d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z"
            fill="#059669"
            opacity="0.7"
          />
        </g>

        {/* 4-Point Sparkle Star Top-Left */}
        <g transform="translate(90, 110) scale(0.7)">
          <path
            d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z"
            fill="#10B981"
            opacity="0.65"
          />
        </g>

        {/* 4-Point Sparkle Star Bottom-Right */}
        <g transform="translate(435, 340) scale(0.75)">
          <path
            d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z"
            fill="#10B981"
            opacity="0.75"
          />
        </g>

        {/* 4-Point Sparkle Star Bottom-Left */}
        <g transform="translate(70, 360) scale(0.6)">
          <path
            d="M 0 -14 Q 0 0 14 0 Q 0 0 0 14 Q 0 0 -14 0 Q 0 0 0 -14 Z"
            fill="#059669"
            opacity="0.6"
          />
        </g>
      </svg>

      {/* ── 3D CLOCK & DUAL-TIER PEDESTAL CONTAINER ── */}
      <div className="relative w-full h-full flex flex-col items-center justify-center">
        {/* SVG Render for Pedestal & Clock Dial */}
        <svg
          viewBox="0 0 400 400"
          className="w-full h-full drop-shadow-[0_25px_35px_rgba(5,150,105,0.18)] overflow-visible"
        >
          <defs>
            {/* Pedestal Bottom Base Gradient */}
            <linearGradient id="pedestalLowerGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F0FDF4" />
              <stop offset="40%" stopColor="#DCFCE7" />
              <stop offset="100%" stopColor="#A7F3D0" />
            </linearGradient>

            {/* Pedestal Upper Tier Gradient */}
            <linearGradient id="pedestalUpperGrad" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#F0FDF4" />
              <stop offset="50%" stopColor="#BBF7D0" />
              <stop offset="100%" stopColor="#34D399" />
            </linearGradient>

            {/* Clock Outer Rim 3D Bevel Gradient */}
            <linearGradient id="clockBevelGrad" x1="20%" y1="0%" x2="80%" y2="100%">
              <stop offset="0%" stopColor="#6EE7B7" />
              <stop offset="25%" stopColor="#10B981" />
              <stop offset="70%" stopColor="#059669" />
              <stop offset="100%" stopColor="#047857" />
            </linearGradient>

            {/* Clock Inner Face Gradient */}
            <radialGradient id="clockFaceGrad" cx="45%" cy="40%" r="60%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="80%" stopColor="#F8FAFC" />
              <stop offset="100%" stopColor="#DCFCE7" />
            </radialGradient>

            {/* Inner Rim Shadow */}
            <filter id="innerRimShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="2" dy="4" stdDeviation="4" floodColor="#047857" floodOpacity="0.35" />
            </filter>

            {/* Soft Ambient Pedestal Shadow */}
            <radialGradient id="groundShadow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#059669" stopOpacity="0.22" />
              <stop offset="70%" stopColor="#059669" stopOpacity="0.06" />
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
          <ellipse cx="200" cy="330" rx="150" ry="22" fill="#F0FDF4" stroke="#BBF7D0" strokeWidth="1" />

          {/* ── UPPER PEDESTAL TIER (3D Cylinder) ── */}
          {/* Upper Tier Body */}
          <path
            d="M 85 295 C 85 278, 315 278, 315 295 L 315 315 C 315 332, 85 332, 85 315 Z"
            fill="url(#pedestalUpperGrad)"
          />
          {/* Upper Tier Top Surface */}
          <ellipse cx="200" cy="295" rx="115" ry="18" fill="#F8FAFC" stroke="#A7F3D0" strokeWidth="1" />

          {/* ── CLOCK SHADOW ON PEDESTAL ── */}
          <ellipse cx="200" cy="296" rx="90" ry="10" fill="#047857" opacity="0.30" />

          {/* ── CLOCK BODY (Diameter: ~210px, Center: 200, 180) ── */}
          {/* Clock Outer Rim */}
          <circle
            cx="200"
            cy="180"
            r="105"
            fill="url(#clockBevelGrad)"
            filter="drop-shadow(0px 10px 18px rgba(4, 120, 87, 0.35))"
          />

          {/* Clock Inner Bevel Ring */}
          <circle
            cx="200"
            cy="180"
            r="92"
            fill="#064E3B"
            opacity="0.25"
          />

          {/* Clock Dial Face */}
          <circle
            cx="200"
            cy="180"
            r="86"
            fill="url(#clockFaceGrad)"
            stroke="#A7F3D0"
            strokeWidth="1.5"
          />

          {/* Inner Depth Rim Shadow */}
          <circle
            cx="200"
            cy="180"
            r="86"
            fill="none"
            stroke="#10B981"
            strokeWidth="4"
            opacity="0.20"
          />

          {/* ── 12 CLOCK TICK MARKS & NUMERAL ACCENTS ── */}
          {Array.from({ length: 12 }).map((_, i) => {
            const angle = i * 30;
            const isQuarter = i % 3 === 0;
            const tickLength = isQuarter ? 8 : 4.5;
            const strokeWidth = isQuarter ? 2.5 : 1.2;
            const strokeColor = isQuarter ? "#059669" : "#6EE7B7";

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
                fill="#A7F3D0"
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
              background: "linear-gradient(to top, #047857, #10B981)",
              boxShadow: "0 4px 8px rgba(4,120,87,0.35)",
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
              background: "linear-gradient(to top, #064E3B, #059669)",
              boxShadow: "0 6px 12px rgba(4,120,87,0.40)",
            }}
          />

          {/* 3D Center Hub / Pin */}
          <div className="relative w-6 h-6 rounded-full bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-300 border-2 border-white shadow-md flex items-center justify-center z-20">
            <div className="w-2 h-2 rounded-full bg-white shadow-xs" />
          </div>
        </div>
      </div>
    </div>
  );
}
