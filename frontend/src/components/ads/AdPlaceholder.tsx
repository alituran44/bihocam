"use client";

import { motion } from "framer-motion";
import { Megaphone, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { useAuthStore } from "@/lib/store";

interface AdPlaceholderProps {
  placementCode: string;
  placementName: string;
  placementType: "banner" | "sidebar" | "inline" | "featured_course" | "popup";
  width?: number;
  height?: number;
  className?: string;
  pricing?: {
    fixed_daily?: number;
    per_impression?: number;
    per_click?: number;
  };
}

export default function AdPlaceholder({
  placementCode,
  placementName,
  placementType,
  width,
  height,
  className = "",
  pricing,
}: AdPlaceholderProps) {
  const user = useAuthStore((state) => state.user);
  const isAdminOrTeacher = user?.role === "admin" || user?.role === "teacher";
  
  // Öğrenci dummy reklam alanlarını görmemeli
  if (!isAdminOrTeacher) {
    return null;
  }

  const getAspectRatio = () => {
    if (width && height && height > 0) {
      return `${width} / ${height}`;
    }
    switch (placementType) {
      case "banner":
        return "21 / 9";
      case "sidebar":
        return "6 / 5";
      case "inline":
        return "8 / 1";
      case "popup":
        return "4 / 3";
      default:
        return "16 / 9";
    }
  };

  const getMinHeight = () => {
    if (height && height > 0) {
      return `${height}px`;
    }
    switch (placementType) {
      case "banner":
        return "120px";
      case "sidebar":
        return "200px";
      case "inline":
        return "60px"; // Çizgi gibi ince
      case "popup":
        return "400px";
      default:
        return "200px";
    }
  };

  // Compact layout for banner/inline types
  const isCompact = placementType === "banner" || placementType === "inline";
  
  // Inline için özel çizgi görünümü
  const isInline = placementType === "inline";
  
  // Sidebar-specific styling - check both placement type and code
  const isSidebar = placementType === "sidebar" || placementCode.includes("sidebar");

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className={`relative overflow-hidden border-2 border-dashed border-teal-300 bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 ${
        isInline ? "rounded-lg" : "rounded-2xl"
      } ${className}`}
      style={{
        aspectRatio: width && height && height > 0 ? getAspectRatio() : undefined,
        minHeight: getMinHeight(),
      }}
    >
      {/* Animated Background Pattern */}
      <div className="absolute inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(20,184,166,0.1),transparent_50%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(20,184,166,0.05)_49%,rgba(20,184,166,0.05)_51%,transparent_52%)] bg-[length:20px_20px]" />
      </div>

      {/* Content */}
      <div
        className={`relative z-10 h-full flex ${
          isInline
            ? "flex-row items-center justify-between px-4"
            : isCompact 
            ? "flex-row items-center justify-between px-6" 
            : isSidebar
            ? "flex-col items-center justify-center p-5 text-center"
            : "flex-col items-center justify-center p-6 text-center"
        }`}
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className={isCompact || isInline ? "" : "mb-4"}
        >
          <div className="relative">
            {!isInline && (
              <div className="absolute inset-0 bg-gradient-to-r from-teal-400 to-emerald-500 rounded-2xl blur-xl opacity-50 animate-pulse" />
            )}
            <div className={`relative bg-gradient-to-br from-teal-500 to-emerald-600 shadow-xl flex items-center justify-center ${
              isInline ? "rounded-lg p-2" : isSidebar ? "rounded-2xl p-3" : "rounded-2xl p-4"
            }`}>
              <Megaphone className={`text-white ${
                isInline ? "w-4 h-4" : isSidebar ? "w-5 h-5" : "w-8 h-8"
              }`} />
            </div>
          </div>
        </motion.div>

        {/* Title */}
        {!isInline && (
          <motion.h3
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`font-bold text-gray-900 ${
              isCompact 
                ? "text-base mb-1" 
                : isSidebar
                ? "text-base mb-2"
                : "text-xl mb-2"
            }`}
          >
            {placementName}
          </motion.h3>
        )}

        {/* Description */}
        {!isCompact && !isInline && (
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className={`text-gray-600 mb-4 max-w-md ${
              isSidebar ? "text-xs" : "text-sm"
            }`}
          >
            Bu alan şu anda boş. Reklam vererek binlerce öğrenciye ulaşın!
          </motion.p>
        )}
        
        {/* Inline için kısa text */}
        {isInline && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-medium text-gray-700"
          >
            {placementName}
          </motion.span>
        )}
        
        {/* Inline için kısa text */}
        {isInline && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-sm font-medium text-gray-700"
          >
            {placementName}
          </motion.span>
        )}

        {/* Pricing Info */}
        {pricing && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className={`flex flex-wrap items-center justify-center ${
              isInline ? "gap-1.5 my-1" : isCompact ? "gap-2 my-1.5" : isSidebar ? "gap-2 my-2" : "gap-3 mb-4"
            }`}
          >
            {pricing.fixed_daily && (
              <div className={`bg-white/80 backdrop-blur-sm rounded-lg border border-teal-200 flex items-center ${
                isInline ? "px-2 py-0.5" : isCompact || isSidebar ? "px-2.5 py-1" : "px-3 py-1.5"
              }`}>
                <span className="text-[10px] text-gray-500">Günlük:</span>
                <span className={`ml-1 font-extrabold text-teal-600 ${
                  isInline ? "text-[11px]" : isCompact || isSidebar ? "text-xs" : "text-sm"
                }`}>
                  ₺{Number(pricing.fixed_daily).toFixed(2)}
                </span>
              </div>
            )}
            {pricing.per_impression && (
              <div className={`bg-white/80 backdrop-blur-sm rounded-lg border border-teal-200 flex items-center ${
                isInline ? "px-2 py-0.5" : isCompact || isSidebar ? "px-2.5 py-1" : "px-3 py-1.5"
              }`}>
                <span className="text-[10px] text-gray-500">Gösterim:</span>
                <span className={`ml-1 font-extrabold text-teal-600 ${
                  isInline ? "text-[11px]" : isCompact || isSidebar ? "text-xs" : "text-sm"
                }`}>
                  ₺{Number(pricing.per_impression).toFixed(3)}
                </span>
              </div>
            )}
            {pricing.per_click && (
              <div className={`bg-white/80 backdrop-blur-sm rounded-lg border border-teal-200 flex items-center ${
                isInline ? "px-2 py-0.5" : isCompact || isSidebar ? "px-2.5 py-1" : "px-3 py-1.5"
              }`}>
                <span className="text-[10px] text-gray-500">Tıklama:</span>
                <span className={`ml-1 font-extrabold text-teal-600 ${
                  isInline ? "text-[11px]" : isCompact || isSidebar ? "text-xs" : "text-sm"
                }`}>
                  ₺{Number(pricing.per_click).toFixed(2)}
                </span>
              </div>
            )}
          </motion.div>
        )}

        {/* CTA Button - Only for admin/teacher */}
        {isAdminOrTeacher && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <Link
              href={
                user?.role === "admin"
                  ? "/dashboard/admin/ads/campaigns"
                  : `/dashboard/teacher/ads?placement_code=${placementCode}`
              }
              className={`group inline-flex items-center gap-2 ${
                isInline
                  ? "px-3 py-1.5 text-xs"
                  : isCompact 
                  ? "px-4 py-2.5 text-sm" 
                  : isSidebar
                  ? "px-4 py-2.5 text-sm w-full justify-center"
                  : "px-6 py-3"
              } bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300`}
            >
              {!isInline && <Sparkles className={isSidebar ? "w-4 h-4" : "w-4 h-4"} />}
              <span>Reklam Ver</span>
              {!isCompact && !isSidebar && !isInline && (
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              )}
            </Link>
          </motion.div>
        )}
        
        {/* Info message for non-admin/teacher users */}
        {!isAdminOrTeacher && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className={`px-4 py-2 bg-white/60 backdrop-blur-sm rounded-lg border border-teal-200 ${
              isCompact ? "text-xs" : isSidebar ? "text-xs" : "text-sm"
            }`}
          >
            <p className="text-gray-600 text-center">
              {isCompact ? "Reklam Alanı" : "Bu alan reklam için ayrılmıştır"}
            </p>
          </motion.div>
        )}

        {/* Placement Code Badge */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="absolute bottom-3 right-3"
        >
          <div className="px-2 py-1 bg-white/60 backdrop-blur-sm rounded-lg border border-teal-200">
            <span className="text-xs font-mono text-gray-500">{placementCode}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
