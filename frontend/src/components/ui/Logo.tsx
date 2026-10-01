import React from "react";
import Link from "next/link";
import Image from "next/image";

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
  // Main logo aspect ratio: 969 x 284 (~3.41:1)
  const dimensions = {
    sm: { height: 28, width: iconOnly ? 28 : 96 },
    md: { height: 38, width: iconOnly ? 38 : 130 },
    lg: { height: 48, width: iconOnly ? 48 : 164 },
    xl: { height: 60, width: iconOnly ? 60 : 205 },
  }[size] || { height: 38, width: iconOnly ? 38 : 130 };

  const src = iconOnly
    ? "/logo-icon.png"
    : variant === "dark"
    ? "/logo-dark.png"
    : "/logo.png";

  const content = (
    <Image
      src={src}
      alt="BiHocam - Online Eğitim Platformu"
      width={dimensions.width}
      height={dimensions.height}
      priority={priority}
      unoptimized
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
