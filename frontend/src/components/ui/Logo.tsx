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
    sm: { height: 28, width: iconOnly ? 28 : 101 },
    md: { height: 38, width: iconOnly ? 38 : 138 },
    lg: { height: 48, width: iconOnly ? 48 : 174 },
    xl: { height: 60, width: iconOnly ? 60 : 217 },
  }[size];

  const content = (
    <img
      src="/logo.png"
      alt="BiHocam Online Eğitim Platformu"
      width={dimensions.width}
      height={dimensions.height}
      fetchPriority="high"
      decoding="async"
      className={`object-contain transition-transform duration-200 group-hover:scale-[1.02] ${className}`}
      style={{ height: dimensions.height, width: "auto" }}
    />
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center gap-2 group cursor-pointer">
        {content}
      </Link>
    );
  }

  return content;
}
