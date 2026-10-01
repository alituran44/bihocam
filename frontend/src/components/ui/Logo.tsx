import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "dark" | "light" | "auto";
  iconOnly?: boolean;
  href?: string;
}

export default function Logo({
  className = "",
  size = "md",
  variant = "light",
  iconOnly = false,
  href = "/",
}: LogoProps) {
  const dimensions = {
    sm: { height: 28, width: iconOnly ? 28 : 110 },
    md: { height: 38, width: iconOnly ? 38 : 150 },
    lg: { height: 48, width: iconOnly ? 48 : 190 },
    xl: { height: 60, width: iconOnly ? 60 : 236 },
  }[size];

  const isDark = variant === "dark";
  const textColor = isDark ? "#F8FAFC" : "#132B4F";
  const subtextColor = isDark ? "#94A3B8" : "#64748B";

  const content = iconOnly ? (
    <svg
      width={dimensions.height}
      height={dimensions.height}
      viewBox="0 0 44 44"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 group-hover:scale-105 ${className}`}
    >
      <rect x="2" y="2" width="11" height="40" rx="5.5" fill="#132B4F" />
      <path
        d="M10 18C10 18 15 13 24 13C33 13 38 18 38 27V42H29V28C29 23.5 26 21 21.5 21C17 21 13.5 24 11 28V42H2V23C2 21 3.5 19 5.5 19H10V18Z"
        fill="#10B981"
      />
    </svg>
  ) : (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox="0 0 220 56"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`shrink-0 transition-transform duration-200 group-hover:scale-[1.02] ${className}`}
      style={{ height: dimensions.height, width: "auto" }}
    >
      <defs>
        <linearGradient id="bhBlueStem" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1E3A8A" />
          <stop offset="100%" stopColor="#0F2848" />
        </linearGradient>
        <linearGradient id="bhGreenArch" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10B981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>

      {/* Left Monogram Symbol */}
      <g transform="translate(6, 6)">
        <rect x="0" y="2" width="10" height="38" rx="5" fill="url(#bhBlueStem)" />
        <path
          d="M8 17C8 17 13 13 20.5 13C28 13 32.5 17.5 32.5 25V37C32.5 38.6569 31.1569 40 29.5 40H26C24.3431 40 23 38.6569 23 37V27C23 23.134 19.866 20 16 20C12.134 20 9 23.134 9 27V37C9 38.6569 7.65685 40 6 40H4.5C2.84315 40 1.5 38.6569 1.5 37V24.5C1.5 22.8431 2.84315 21.5 4.5 21.5H8V17Z"
          fill="url(#bhGreenArch)"
        />
      </g>

      {/* Wordmark: "BiHocam" */}
      <g transform="translate(50, 32)">
        <text
          x="0"
          y="0"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="28"
          fill={textColor}
          letterSpacing="-0.03em"
        >
          Bi
        </text>
        <text
          x="32"
          y="0"
          fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
          fontWeight="900"
          fontSize="28"
          fill="#10B981"
          letterSpacing="-0.02em"
        >
          Hocam
        </text>
      </g>

      {/* Subtitle: "ONLİNE EĞİTİM PLATFORMU" */}
      <text
        x="52"
        y="45"
        fontFamily="'Inter', system-ui, -apple-system, sans-serif"
        fontWeight="600"
        fontSize="7.5"
        fill={subtextColor}
        letterSpacing="0.22em"
      >
        ONLİNE EĞİTİM PLATFORMU
      </text>
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center gap-2 group cursor-pointer select-none">
        {content}
      </Link>
    );
  }

  return content;
}
