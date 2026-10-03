import React from "react";
import Link from "next/link";

interface LogoProps {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "dark" | "light" | "auto";
  iconOnly?: boolean;
  href?: string;
  priority?: boolean;
}

export default function Logo({
  className = "",
  size = "md",
  variant = "light",
  iconOnly = false,
  href = "/",
  priority = true,
}: LogoProps) {
  // BiHocam SVG Aspect Ratio: 436 x 114 (~3.82:1)
  // Icon Aspect Ratio: 92 x 102 (~0.90:1)
  const dimensions = {
    sm: { height: 32, width: iconOnly ? 29 : 122 },
    md: { height: 44, width: iconOnly ? 40 : 168 },
    lg: { height: 54, width: iconOnly ? 49 : 206 },
    xl: { height: 68, width: iconOnly ? 61 : 260 },
  }[size] || { height: 44, width: iconOnly ? 40 : 168 };

  const src = iconOnly
    ? "/logo-icon.svg"
    : variant === "dark"
    ? "/logo-dark.svg"
    : "/logo.svg";

  const content = (
    <img
      src={src}
      alt="BiHocam - Online Eğitim Platformu"
      width={dimensions.width}
      height={dimensions.height}
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      decoding="async"
      className={`shrink-0 object-contain transition-transform duration-200 group-hover:scale-[1.02] ${className}`}
      style={{ height: `${dimensions.height}px`, width: "auto" }}
    />
  );

  if (href) {
    return (
      <Link
        href={href}
        aria-label="BiHocam Ana Sayfa"
        className="inline-flex items-center group cursor-pointer select-none"
      >
        {content}
      </Link>
    );
  }

  return content;
}

