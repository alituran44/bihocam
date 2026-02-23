"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Award, Download, Share2, PartyPopper, Sparkles, Trophy, Star, X } from "lucide-react";
import confetti from "canvas-confetti";

/**
 * AESTHETIC DIRECTION: Celebration Explosion / Gamification Party
 * 
 * Design Philosophy:
 * - Maximum joy and excitement
 * - Bright, vibrant, saturated colors (party palette)
 * - Explosive animations and confetti
 * - Gamification elements (badges, stars, achievements)
 * - Playful, bouncy micro-interactions
 * - Celebration emoji and party icons
 * - Comic book style with bold outlines
 * - Sound-effect visual language (POW!, BOOM!)
 * - Multiple animation layers for depth
 */

interface CompletionCelebrationProps {
  isOpen: boolean;
  onClose: () => void;
  courseTitle: string;
  completionPercentage: number;
  certificateId?: string;
  onViewCertificate: () => void;
  onDownloadCertificate: () => void;
  onShareCertificate: () => void;
}

export default function CompletionCelebration({
  isOpen,
  onClose,
  courseTitle,
  completionPercentage,
  certificateId,
  onViewCertificate,
  onDownloadCertificate,
  onShareCertificate,
}: CompletionCelebrationProps) {
  const [showContent, setShowContent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Delay content reveal for dramatic effect
      setTimeout(() => setShowContent(true), 500);

      // Fire confetti cannons!
      const duration = 4000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 100 };

      function randomInRange(min: number, max: number) {
        return Math.random() * (max - min) + min;
      }

      const interval: any = setInterval(function () {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);

        // Left cannon
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
          colors: ["#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6"],
        });

        // Right cannon
        confetti({
          ...defaults,
          particleCount,
          origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
          colors: ["#10b981", "#f59e0b", "#8b5cf6", "#ec4899", "#3b82f6"],
        });
      }, 250);

      // Firework confetti
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#F7DC6F"],
        });
      }, 800);

      return () => clearInterval(interval);
    } else {
      setShowContent(false);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop - Party Mode */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-gradient-to-br from-purple-900/95 via-pink-900/95 to-orange-900/95 backdrop-blur-sm z-[60]"
          />

          {/* Celebration Modal */}
          <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.5, rotate: -10, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              exit={{ scale: 0.5, rotate: 10, opacity: 0 }}
              transition={{ type: "spring", damping: 15, stiffness: 200 }}
              className="relative w-full max-w-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                className="absolute -top-12 right-0 text-white/80 hover:text-white transition-colors p-2 z-10"
              >
                <X className="w-8 h-8" strokeWidth={2} />
              </button>

              {/* Main Card - Comic Book Style */}
              <div className="relative bg-white rounded-3xl shadow-2xl overflow-hidden border-8 border-yellow-400">
                {/* Animated Border Glow */}
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 opacity-20 animate-pulse" />

                {/* Floating Emojis */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  {[...Array(12)].map((_, i) => (
                    <motion.div
                      key={i}
                      initial={{ y: "100%", x: Math.random() * 100 + "%", opacity: 0 }}
                      animate={{
                        y: "-100%",
                        x: Math.random() * 100 + "%",
                        opacity: [0, 1, 1, 0],
                        rotate: Math.random() * 360,
                      }}
                      transition={{
                        duration: 3 + Math.random() * 2,
                        delay: Math.random() * 2,
                        repeat: Infinity,
                        repeatDelay: Math.random() * 3,
                      }}
                      className="absolute text-4xl"
                    >
                      {["🎉", "🎊", "⭐", "🏆", "🎯", "🔥"][Math.floor(Math.random() * 6)]}
                    </motion.div>
                  ))}
                </div>

                {/* Content */}
                <div className="relative p-8 md:p-12 text-center space-y-6">
                  {/* Trophy Animation */}
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: "spring", damping: 10, stiffness: 100, delay: 0.2 }}
                    className="relative inline-block"
                  >
                    {/* Glow Effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full blur-3xl opacity-60 animate-pulse" />
                    
                    {/* Trophy */}
                    <div className="relative">
                      <div className="w-32 h-32 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-2xl border-4 border-yellow-300">
                        <Trophy className="w-20 h-20 text-white" strokeWidth={2} />
                      </div>
                      
                      {/* Sparkle Stars */}
                      {[...Array(4)].map((_, i) => (
                        <motion.div
                          key={i}
                          animate={{
                            scale: [1, 1.5, 1],
                            rotate: [0, 180, 360],
                            opacity: [0.5, 1, 0.5],
                          }}
                          transition={{
                            duration: 2,
                            delay: i * 0.5,
                            repeat: Infinity,
                          }}
                          className="absolute"
                          style={{
                            top: i === 0 ? "-10px" : i === 1 ? "50%" : i === 2 ? "100%" : "50%",
                            left: i === 0 ? "50%" : i === 1 ? "-10px" : i === 2 ? "50%" : "100%",
                          }}
                        >
                          <Star className="w-6 h-6 text-yellow-400 fill-yellow-400" />
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {showContent && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="space-y-6"
                    >
                      {/* Main Title - Bold and Playful */}
                      <div className="space-y-2">
                        <motion.h2
                          initial={{ scale: 0.8 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                          className="text-5xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600"
                        >
                          🎉 TEBRIKLER! 🎉
                        </motion.h2>
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: "100%" }}
                          transition={{ delay: 0.8, duration: 0.6 }}
                          className="h-2 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 rounded-full mx-auto max-w-xs"
                        />
                      </div>

                      {/* Achievement Message */}
                      <div className="space-y-3">
                        <p className="text-xl md:text-2xl font-bold text-gray-800 leading-tight">
                          Kursu Başarıyla Tamamladınız!
                        </p>
                        <div className="inline-block bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-300 rounded-2xl px-6 py-3">
                          <p className="text-lg font-semibold text-purple-900 line-clamp-2">
                            {courseTitle}
                          </p>
                        </div>
                      </div>

                      {/* Completion Stats - Gamification */}
                      <div className="flex items-center justify-center gap-4 flex-wrap">
                        <motion.div
                          whileHover={{ scale: 1.1, rotate: 5 }}
                          className="bg-gradient-to-br from-green-400 to-emerald-500 text-white px-6 py-3 rounded-2xl shadow-lg"
                        >
                          <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5" />
                            <span className="font-black text-lg">{completionPercentage}%</span>
                          </div>
                          <p className="text-xs font-semibold uppercase tracking-wide">Başarı</p>
                        </motion.div>

                        {certificateId && (
                          <motion.div
                            whileHover={{ scale: 1.1, rotate: -5 }}
                            className="bg-gradient-to-br from-yellow-400 to-orange-500 text-white px-6 py-3 rounded-2xl shadow-lg"
                          >
                            <div className="flex items-center gap-2">
                              <Award className="w-5 h-5" />
                              <span className="font-black text-lg">Sertifika</span>
                            </div>
                            <p className="text-xs font-semibold uppercase tracking-wide">Hazır!</p>
                          </motion.div>
                        )}
                      </div>

                      {/* Motivational Message */}
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 1 }}
                        className="bg-gradient-to-r from-purple-50 to-pink-50 border-l-4 border-purple-500 p-4 rounded-xl"
                      >
                        <p className="text-sm text-purple-900 font-semibold">
                          💪 Harika bir iş çıkardınız! Sertifikanızı indirin ve başarınızı paylaşın!
                        </p>
                      </motion.div>

                      {/* Action Buttons - Bold CTAs */}
                      <div className="space-y-3 pt-4">
                        {certificateId && (
                          <>
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={onViewCertificate}
                              className="w-full flex items-center justify-center gap-3 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white py-4 px-6 rounded-2xl font-black text-lg shadow-2xl hover:shadow-purple-900/50 transition-all"
                            >
                              <Award className="w-6 h-6" />
                              🏆 Sertifikamı Görüntüle
                            </motion.button>

                            <div className="grid grid-cols-2 gap-3">
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onDownloadCertificate}
                                className="flex items-center justify-center gap-2 bg-white border-2 border-purple-300 text-purple-700 py-3 px-4 rounded-xl font-bold hover:bg-purple-50 transition-all"
                              >
                                <Download className="w-5 h-5" />
                                İndir
                              </motion.button>
                              <motion.button
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                onClick={onShareCertificate}
                                className="flex items-center justify-center gap-2 bg-white border-2 border-pink-300 text-pink-700 py-3 px-4 rounded-xl font-bold hover:bg-pink-50 transition-all"
                              >
                                <Share2 className="w-5 h-5" />
                                Paylaş
                              </motion.button>
                            </div>
                          </>
                        )}
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Bottom Decoration */}
                <div className="h-4 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500" />
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
