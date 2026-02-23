"use client";

import { useState } from "react";
import { getAvatarUrl, getUserInitials } from "@/lib/utils/avatar";

interface AvatarProps {
  src?: string | null;
  alt?: string;
  name?: string | null;
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  className?: string;
  showBorder?: boolean;
  borderColor?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-xs",
  sm: "w-8 h-8 text-sm",
  md: "w-12 h-12 text-base",
  lg: "w-16 h-16 text-lg",
  xl: "w-24 h-24 text-2xl",
  "2xl": "w-32 h-32 text-3xl",
};

const borderRadiusClasses = {
  xs: "rounded",
  sm: "rounded-md",
  md: "rounded-lg",
  lg: "rounded-xl",
  xl: "rounded-2xl",
  "2xl": "rounded-3xl",
};

export default function Avatar({
  src,
  alt,
  name,
  size = "md",
  className = "",
  showBorder = false,
  borderColor = "border-white",
}: AvatarProps) {
  const [imageError, setImageError] = useState(false);
  const avatarUrl = src ? getAvatarUrl(src) : null;
  const initials = getUserInitials(name || alt || "");

  const sizeClass = sizeClasses[size];
  const borderRadiusClass = borderRadiusClasses[size];
  const borderClass = showBorder ? `border-4 ${borderColor}` : "";

  // Eğer avatar URL yoksa veya hata varsa placeholder göster
  if (!avatarUrl || imageError) {
    return (
      <div
        className={`${sizeClass} ${borderRadiusClass} ${borderClass} bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-lg ${className}`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={avatarUrl}
      alt={alt || name || "Avatar"}
      className={`${sizeClass} ${borderRadiusClass} ${borderClass} object-cover shadow-lg ${className}`}
      onError={() => setImageError(true)}
    />
  );
}
