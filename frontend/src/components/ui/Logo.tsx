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
  // Dimension scales
  const dimensions = {
    sm: { height: 28, width: iconOnly ? 28 : 130, viewBox: iconOnly ? "0 0 44 48" : "0 0 220 54" },
    md: { height: 38, width: iconOnly ? 38 : 168, viewBox: iconOnly ? "0 0 44 48" : "0 0 220 54" },
    lg: { height: 48, width: iconOnly ? 48 : 210, viewBox: iconOnly ? "0 0 44 48" : "0 0 220 54" },
    xl: { height: 60, width: iconOnly ? 60 : 260, viewBox: iconOnly ? "0 0 44 48" : "0 0 220 54" },
  }[size];

  // Dynamic text coloring based on theme variant
  const biTextColor = variant === "light" ? "#0F172A" : "#FFFFFF";
  const subtitleColor = variant === "light" ? "#64748B" : "#94A3B8";

  const content = (
    <svg
      width={dimensions.width}
      height={dimensions.height}
      viewBox={dimensions.viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`transition-transform duration-200 group-hover:scale-[1.02] ${className}`}
    >
      <defs>
        <linearGradient id="bihocamStemGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38BDF8" />
          <stop offset="100%" stopColor="#2563EB" />
        </linearGradient>
        <linearGradient id="bihocamArchGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
        <linearGradient id="bihocamHocamGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#34D399" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>
      </defs>

      {/* Modern 'bh' Monogram */}
      <g transform="translate(4, 5)">
        {/* Left 'b' Stem in Vibrant Sapphire/Cyan Gradient */}
        <rect x="0" y="2" width="10" height="38" rx="5" fill="url(#bihocamStemGrad)" />

        {/* Right 'h' Arch in 21st.dev Emerald Gradient */}
        <path
          d="M8 17C8 17 13 13 20.5 13C28 13 32.5 17.5 32.5 25V37C32.5 38.6569 31.1569 40 29.5 40H26C24.3431 40 23 38.6569 23 37V27C23 23.134 19.866 20 16 20C12.134 20 9 23.134 9 27V37C9 38.6569 7.65685 40 6 40H4.5C2.84315 40 1.5 38.6569 1.5 37V24.5C1.5 22.8431 2.84315 21.5 4.5 21.5H8V17Z"
          fill="url(#bihocamArchGrad)"
        />
      </g>

      {/* Full Wordmark */}
      {!iconOnly && (
        <>
          <g transform="translate(48, 32)">
            {/* "Bi" in High-Contrast Typography */}
            <text
              x="0"
              y="0"
              fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              fontWeight="900"
              fontSize="27"
              fill={biTextColor}
              letterSpacing="-0.03em"
            >
              Bi
            </text>

            {/* "Hocam" in Emerald Gradient */}
            <text
              x="31"
              y="0"
              fontFamily="'Plus Jakarta Sans', system-ui, -apple-system, sans-serif"
              fontWeight="800"
              fontSize="27"
              fill="url(#bihocamHocamGrad)"
              letterSpacing="-0.02em"
            >
              Hocam
            </text>
          </g>

          {/* Subtitle */}
          <text
            x="50"
            y="45"
            fontFamily="'Inter', system-ui, -apple-system, sans-serif"
            fontWeight="600"
            fontSize="7.5"
            fill={subtitleColor}
            letterSpacing="0.22em"
          >
            ONLİNE EĞİTİM PLATFORMU
          </text>
        </>
      )}
    </svg>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center group">
        {content}
      </Link>
    );
  }

  return content;
}
