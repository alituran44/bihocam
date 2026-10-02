"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";
import { Video, Play, Pause, Sparkles, CheckCircle2 } from "lucide-react";

export default function LiveClassVideoSection() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  return (
    <section className="py-20 sm:py-28 bg-slate-50 border-b border-slate-200/80 relative overflow-hidden">
      {/* Subtle Ambient Background Gradients */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[400px] bg-emerald-100/30 rounded-full blur-[160px] pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-4">
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider"
          >
            <Video className="w-3.5 h-3.5 text-emerald-600" />
            <span>CANLI DERS DENEYİMİ</span>
          </motion.div>

          <motion.h2
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]"
          >
            Yüksek Kaliteli ve İnteraktif{" "}
            <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
              Canlı Ders Deneyimi
            </span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal"
          >
            Gelişmiş dijital sınıf araçları, interaktif beyaz tahta ve anında eğitmen geri bildirimi ile birebir canlı derslerin gücünü hemen keşfet.
          </motion.p>
        </div>

        {/* Video Player Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: 20 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
          className="relative rounded-3xl sm:rounded-[2.5rem] overflow-hidden shadow-2xl border border-slate-200 bg-slate-950 aspect-[16/10] sm:aspect-[16/9] group"
        >
          {/* Native HTML5 Video Element */}
          <video
            ref={videoRef}
            src="/assets/videos/bihocam-live-demo.mp4"
            className="w-full h-full object-cover"
            playsInline
            controls={isPlaying}
            onEnded={() => setIsPlaying(false)}
            onPause={() => setIsPlaying(false)}
            onPlay={() => setIsPlaying(true)}
          />

          {/* Custom Play Overlay (shown when not playing) */}
          {!isPlaying && (
            <div
              onClick={togglePlay}
              className="absolute inset-0 bg-slate-950/20 hover:bg-slate-950/30 backdrop-blur-[1px] transition-all cursor-pointer flex items-center justify-center z-20"
            >
              {/* Rotating Circular Border Badge */}
              <div className="relative flex items-center justify-center">
                <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full border border-white/30 animate-spin-slow flex items-center justify-center">
                  <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border border-white/20 border-dashed" />
                </div>

                {/* Central Play Button */}
                <div className="absolute w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white shadow-2xl shadow-emerald-500/50 flex items-center justify-center transform transition-transform duration-300 group-hover:scale-110">
                  <Play className="w-7 h-7 sm:w-8 sm:h-8 fill-white translate-x-0.5" />
                </div>
              </div>

              {/* Floating Bottom-Right Badge matching inspiration */}
              <div className="absolute bottom-5 right-5 sm:bottom-8 sm:right-8 -rotate-2 hover:rotate-0 transition-transform">
                <div className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-2xl bg-emerald-600 text-white font-bold text-xs sm:text-sm shadow-xl flex items-center gap-2 border border-emerald-400/40">
                  <Sparkles className="w-4 h-4 fill-white" />
                  <span>Canlı Dersleri Keşfet!</span>
                </div>
              </div>

              {/* Top-Left Trust Badge */}
              <div className="absolute top-5 left-5 sm:top-8 sm:left-8 hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-slate-900/80 backdrop-blur-md text-white text-xs font-semibold border border-white/10">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Web Üzerinden Tek Tıkla Bağlan</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
}
