"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Info,
  Gift,
  Megaphone,
  AlertTriangle,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import { PopupAnnouncement as PopupAnnouncementType } from "@/lib/api";

interface PopupAnnouncementProps {
  popup: PopupAnnouncementType;
  onClose: () => void;
  onDismiss: (popupId: string, dontShowAgain: boolean) => void;
}

// Icon configuration for each popup type
const POPUP_CONFIG = {
  info: {
    icon: Info,
    gradient: "from-cyan-500 via-blue-500 to-indigo-600",
    lightGradient: "from-cyan-50 via-blue-50 to-indigo-50",
    accent: "text-cyan-600",
    accentBg: "bg-cyan-500",
    accentLight: "bg-cyan-100",
    border: "border-cyan-200",
    button: "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-600 hover:to-blue-700",
    glow: "shadow-cyan-500/50",
  },
  promotion: {
    icon: Gift,
    gradient: "from-amber-500 via-orange-500 to-rose-500",
    lightGradient: "from-amber-50 via-orange-50 to-rose-50",
    accent: "text-amber-600",
    accentBg: "bg-amber-500",
    accentLight: "bg-amber-100",
    border: "border-amber-200",
    button: "bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700",
    glow: "shadow-amber-500/50",
  },
  announcement: {
    icon: Megaphone,
    gradient: "from-emerald-500 via-teal-500 to-cyan-500",
    lightGradient: "from-emerald-50 via-teal-50 to-cyan-50",
    accent: "text-emerald-600",
    accentBg: "bg-emerald-500",
    accentLight: "bg-emerald-100",
    border: "border-emerald-200",
    button: "bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700",
    glow: "shadow-emerald-500/50",
  },
  warning: {
    icon: AlertTriangle,
    gradient: "from-rose-500 via-red-500 to-orange-500",
    lightGradient: "from-rose-50 via-red-50 to-orange-50",
    accent: "text-rose-600",
    accentBg: "bg-rose-500",
    accentLight: "bg-rose-100",
    border: "border-rose-200",
    button: "bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700",
    glow: "shadow-rose-500/50",
  },
};

export default function PopupAnnouncement({
  popup,
  onClose,
  onDismiss,
}: PopupAnnouncementProps) {
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const config =
    POPUP_CONFIG[popup.popup_type as keyof typeof POPUP_CONFIG] ||
    POPUP_CONFIG.info;
  const IconComponent = config.icon;
  const overlayOpacity = popup.overlay_opacity || 0.5;

  const positionStyles: Record<string, string> = {
    center: "items-center justify-center",
    top: "items-start justify-center pt-12",
    bottom: "items-end justify-center pb-12",
    top_left: "items-start justify-start pt-12 pl-12",
    top_right: "items-start justify-end pt-12 pr-12",
    bottom_left: "items-end justify-start pb-12 pl-12",
    bottom_right: "items-end justify-end pb-12 pr-12",
  };

  const widthStyle = popup.width ? { width: `${popup.width}px` } : {};
  const heightStyle = popup.height ? { height: `${popup.height}px` } : {};

  const handleDismiss = () => {
    onDismiss(popup.id, dontShowAgain);
    onClose();
  };

  const handleButtonClick = () => {
    if (popup.button_link_url) {
      // P3-05: Open redirect koruması - sadece aynı origin veya relative URL'lere izin ver
      const url = popup.button_link_url;
      let isSafeUrl = false;
      if (url.startsWith("/")) {
        isSafeUrl = true;
      } else {
        try {
          const parsed = new URL(url);
          isSafeUrl = parsed.origin === window.location.origin;
        } catch {
          isSafeUrl = false;
        }
      }

      if (isSafeUrl) {
        if (popup.button_link_target === "_blank") {
          window.open(url, "_blank", "noopener,noreferrer");
        } else {
          window.location.href = url;
        }
      }
    }
    handleDismiss();
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: overlayOpacity }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-black z-[9998] cursor-pointer"
            onClick={handleDismiss}
          />

          {/* Popup Container */}
          <div
            className={`fixed inset-0 z-[9999] flex ${
              positionStyles[popup.position] || positionStyles.center
            } pointer-events-none`}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{
                type: "spring",
                stiffness: 400,
                damping: 30,
                duration: 0.5,
              }}
              className={`relative bg-gradient-to-br ${config.lightGradient} backdrop-blur-xl border-2 ${config.border} rounded-3xl shadow-2xl pointer-events-auto max-w-[90vw] max-h-[90vh] overflow-hidden`}
              style={{
                ...widthStyle,
                ...heightStyle,
                boxShadow: `0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 0 60px -15px ${config.glow}`,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Decorative Background Elements */}
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                {/* Gradient Orbs */}
                <div
                  className={`absolute -top-20 -right-20 w-64 h-64 bg-gradient-to-br ${config.gradient} rounded-full opacity-20 blur-3xl animate-pulse`}
                />
                <div
                  className={`absolute -bottom-20 -left-20 w-64 h-64 bg-gradient-to-br ${config.gradient} rounded-full opacity-20 blur-3xl animate-pulse`}
                  style={{ animationDelay: "1s" }}
                />

                {/* Grid Pattern */}
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #000 1px, transparent 1px), linear-gradient(to bottom, #000 1px, transparent 1px)",
                    backgroundSize: "20px 20px",
                  }}
                />
              </div>

              {/* Close Button */}
              {popup.is_dismissible && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ scale: 1.1, rotate: 90 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={handleDismiss}
                  className="absolute top-5 right-5 z-20 w-10 h-10 rounded-full bg-white/90 hover:bg-white backdrop-blur-sm flex items-center justify-center shadow-lg hover:shadow-xl transition-all duration-200 border border-white/40"
                  aria-label="Kapat"
                >
                  <X className="w-5 h-5 text-gray-700" />
                </motion.button>
              )}

              {/* Content */}
              <div className="relative z-10 p-8 md:p-10 lg:p-12">
                {/* Icon Hero Section */}
                <div className="flex flex-col items-center text-center mb-8">
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 20,
                      delay: 0.2,
                    }}
                    className={`relative mb-6 p-6 rounded-3xl bg-gradient-to-br ${config.gradient} shadow-2xl ${config.glow}`}
                    style={{
                      boxShadow: `0 20px 40px -12px ${config.glow}, 0 0 0 1px rgba(255, 255, 255, 0.1) inset`,
                    }}
                  >
                    {/* Icon Glow Effect */}
                    <div
                      className={`absolute inset-0 bg-gradient-to-br ${config.gradient} rounded-3xl blur-xl opacity-50 animate-pulse`}
                    />

                    {/* Icon */}
                    <IconComponent className="w-16 h-16 md:w-20 md:h-20 text-white relative z-10" />
                  </motion.div>

                  {/* Title */}
                  <motion.h2
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className={`text-3xl md:text-4xl lg:text-5xl font-bold ${config.accent} mb-4 leading-tight tracking-tight`}
                    style={{
                      fontFamily:
                        "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                      fontWeight: 800,
                      letterSpacing: "-0.02em",
                    }}
                  >
                    {popup.title}
                  </motion.h2>

                  {/* Decorative Line */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: "80px" }}
                    transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
                    className={`h-1 bg-gradient-to-r from-transparent via-current to-transparent ${config.accent} opacity-40 rounded-full`}
                  />
                </div>

                {/* Image */}
                {popup.image_url && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.4, duration: 0.5 }}
                    className="mb-8 rounded-2xl overflow-hidden shadow-xl border-2 border-white/50"
                  >
                    <img
                      src={popup.image_url}
                      alt={popup.title}
                      className="w-full h-auto object-cover"
                    />
                  </motion.div>
                )}

                {/* Message - Plain text only */}
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.5 }}
                  className="text-base md:text-lg lg:text-xl text-gray-700 mb-8 leading-relaxed font-medium text-center px-2"
                  style={{
                    fontFamily:
                      "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                    lineHeight: "1.7",
                  }}
                >
                  {popup.message}
                </motion.p>

                {/* CTA Button */}
                {popup.button_text && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6, duration: 0.5 }}
                    className="flex justify-center mb-6"
                  >
                    <motion.button
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={handleButtonClick}
                      className={`${config.button} text-white font-bold text-lg px-8 py-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center gap-3 group`}
                      style={{
                        fontFamily:
                          "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
                        letterSpacing: "0.01em",
                      }}
                    >
                      <span>{popup.button_text}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </motion.button>
                  </motion.div>
                )}

                {/* Don't Show Again Checkbox */}
                {popup.show_once_per_user && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7, duration: 0.5 }}
                    className="flex justify-center pt-6 border-t border-gray-200/50"
                  >
                    <label className="flex items-center gap-3 cursor-pointer group">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        className="relative"
                      >
                        <input
                          type="checkbox"
                          checked={dontShowAgain}
                          onChange={(e) => setDontShowAgain(e.target.checked)}
                          className="w-5 h-5 rounded-md border-2 border-gray-300 text-cyan-600 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 transition-all appearance-none checked:bg-cyan-600 checked:border-cyan-600"
                        />
                        {dontShowAgain && (
                          <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="absolute inset-0 flex items-center justify-center"
                          >
                            <CheckCircle2 className="w-5 h-5 text-white" />
                          </motion.div>
                        )}
                      </motion.div>
                      <span className="text-sm text-gray-600 group-hover:text-gray-800 transition-colors font-medium">
                        Bu mesajı tekrar gösterme
                      </span>
                    </label>
                  </motion.div>
                )}
              </div>

              {/* Bottom Accent Line */}
              <div
                className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-current to-transparent ${config.accent} opacity-30`}
              />
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
