"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquare, Quote, Star, Trophy, Users } from "lucide-react";

interface TestimonialItem {
  id: number;
  quote: string;
  name: string;
  role: string;
  avatar: string;
  rating: number;
}

const TESTIMONIALS: TestimonialItem[] = [
  {
    id: 1,
    quote:
      "BiHocam ile tanışmadan önce kızımın YKS matematik netleri 15 bandında takılmıştı. Ayşe Hoca ile başladığımız haftalık 2 saatlik birebir çalışma ve eksik kazanım takibi sayesinde netleri 34'e çıktı. Sadece ders değil, haftalık koçluk ve moral desteği başarının anahtarı oldu.",
    name: "Selin & Aysel Yılmaz",
    role: "YKS Sayısal Öğrenci & Velisi",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80",
    rating: 5,
  },
  {
    id: 2,
    quote:
      "LGS maratonunda oğlum için doğru öğretmeni bulmak büyük endişemizdi. Platform üzerinden talep açtıktan 1 saat sonra 5 farklı fen öğretmeninden teklif geldi. Tanışma dersiyle Mehmet Hoca ile anlaştık. Deneme sınavlarında fen bilimlerinde full çekmeye başladı.",
    name: "Murat Demir",
    role: "LGS 8. Sınıf Velisi",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80",
    rating: 5,
  },
  {
    id: 3,
    quote:
      "İngilizce konuşma bariyerimi aşmak ve IELTS'ten 7.5 almak için Dr. Elif Hoca ile çalıştık. Ders kayıtlarını istediğim zaman geriye dönüp tekrar izleyebilmek ve interaktif materyaller harikaydı. İlk sınavımda hedeflediğim skoru aldım.",
    name: "Emre Aktaş",
    role: "Yüksek Lisans Adayı & IELTS Öğrencisi",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80",
    rating: 5,
  },
  {
    id: 4,
    quote:
      "Dershane yollarında saatler kaybetmek yerine, ev konforunda Türkiye'nin en iyi öğretmenleriyle birebir çalışabilmek büyük bir lüks ve verimlilik. PayTR ile peşin fiyatına taksit imkanı da bütçemizi çok rahatlattı.",
    name: "Canan Özkan",
    role: "11. Sınıf Eşit Ağırlık Velisi",
    avatar:
      "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=120&q=80",
    rating: 5,
  },
];

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
  };

  const currentReview = TESTIMONIALS[currentIndex];

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28 border-b border-slate-100">
      {/* Background Ambience */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden select-none opacity-40"
      >
        <div className="absolute top-1/3 left-10 w-80 h-80 bg-emerald-100/30 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-teal-100/30 rounded-full blur-[140px]" />
      </div>

      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-12 lg:gap-16">
          
          {/* ── Left Column: Headline & 3 Stats (Aniq-UI Layout) ── */}
          <div className="lg:col-span-5 space-y-8">
            <header className="space-y-3">
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
              >
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-800">
                  <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  GERÇEK DENEYİMLER
                </span>
              </motion.div>

              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 font-display tracking-tight leading-[1.12]"
              >
                Gerçek İlerleme İsteyen{" "}
                <span className="relative inline-block text-emerald-700">
                  Öğrenci & Velilerin
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 250 20"
                    className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400/80 -z-10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M3 15 Q 125 0 247 12"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                Tercihi
              </motion.h2>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="text-base sm:text-lg text-slate-600 font-normal leading-relaxed"
              >
                Binlerce öğrenci ve veli BiHocam ile hedeflerine ulaştı. İşte onların kendi deneyimleriyle anlattıkları:
              </motion.p>
            </header>

            {/* 3 Metric Stat Boxes */}
            <motion.ul
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="grid grid-cols-3 gap-3 sm:gap-4"
            >
              <li className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-700 mb-2">
                  <Star className="w-5 h-5 fill-emerald-600" />
                </span>
                <p className="text-xl sm:text-2xl font-black font-mono text-slate-900">4.9/5</p>
                <p className="mt-0.5 text-xs text-slate-500 font-medium">Ortalama Puan</p>
              </li>

              <li className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-700 mb-2">
                  <Users className="w-5 h-5" />
                </span>
                <p className="text-xl sm:text-2xl font-black font-mono text-slate-900">12K+</p>
                <p className="mt-0.5 text-xs text-slate-500 font-medium">Mutlu Öğrenci</p>
              </li>

              <li className="rounded-2xl bg-slate-50 border border-slate-200/90 p-4 text-center">
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-full bg-emerald-100/70 text-emerald-700 mb-2">
                  <Trophy className="w-5 h-5" />
                </span>
                <p className="text-xl sm:text-2xl font-black font-mono text-slate-900">%98</p>
                <p className="mt-0.5 text-xs text-slate-500 font-medium">Başarı Oranı</p>
              </li>
            </motion.ul>
          </div>

          {/* ── Right Column: Interactive Testimonial Card (Aniq-UI Style) ── */}
          <div className="lg:col-span-7">
            <div className="relative">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentReview.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.35, ease: "easeInOut" }}
                  className="relative rounded-3xl bg-slate-50 border border-slate-200/90 p-6 sm:p-10 shadow-sm"
                >
                  <div className="flex items-start gap-4 sm:gap-6">
                    <Quote className="h-10 w-10 sm:h-12 sm:w-12 shrink-0 text-emerald-600 fill-emerald-600/20" />
                    <div className="min-w-0 flex-1">
                      {/* 5 Stars */}
                      <div className="flex items-center gap-1 text-amber-500 mb-4">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-4 h-4 fill-amber-500 text-amber-500" />
                        ))}
                      </div>

                      {/* Quote text */}
                      <blockquote className="text-slate-800 text-base sm:text-lg leading-relaxed font-medium">
                        &ldquo;{currentReview.quote}&rdquo;
                      </blockquote>
                    </div>
                  </div>

                  {/* Author profile row */}
                  <div className="mt-8 pt-6 border-t border-slate-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-emerald-500/30 bg-white shrink-0">
                        <img
                          src={currentReview.avatar}
                          alt={currentReview.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 text-base leading-tight font-display">
                          {currentReview.name}
                        </p>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">
                          {currentReview.role}
                        </p>
                      </div>
                    </div>

                    <Quote className="h-8 w-8 text-emerald-600/20 rotate-180 hidden sm:block" />
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Navigation Controls: Arrows & Indicators */}
              <div className="mt-8 flex items-center justify-center sm:justify-start gap-4">
                <button
                  type="button"
                  onClick={handlePrev}
                  aria-label="Önceki yorumu göster"
                  className="w-10 h-10 rounded-full border border-slate-300 bg-white hover:bg-slate-50 text-slate-700 flex items-center justify-center transition-all shadow-xs"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  aria-label="Sonraki yorumu göster"
                  className="w-10 h-10 rounded-full border border-emerald-600 bg-emerald-600 hover:bg-emerald-500 text-white flex items-center justify-center transition-all shadow-xs"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>

                {/* Dot Indicators */}
                <div className="flex items-center gap-1.5 ms-2">
                  {TESTIMONIALS.map((t, idx) => (
                    <button
                      key={t.id}
                      type="button"
                      aria-label={`${t.name} yorumunu göster`}
                      onClick={() => setCurrentIndex(idx)}
                      className={`h-2 rounded-full transition-all duration-300 ${
                        currentIndex === idx ? "w-6 bg-emerald-600" : "w-2 bg-slate-300 hover:bg-slate-400"
                      }`}
                    />
                  ))}
                </div>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
