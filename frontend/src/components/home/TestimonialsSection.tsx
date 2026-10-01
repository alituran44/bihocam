"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, MessageSquare, Quote, Star } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

interface ReviewItem {
  id: string | number;
  content: string;
  user_name: string;
  role_label?: string;
  avatar_url?: string;
  rating: number;
}

export default function TestimonialsSection() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Denetim kuralı: Yorumlar gerçek verilerle dolsun. Gerçek veri yoksa bölümü gizle.
  // Stok Unsplash görselleri ve sahte istatistikler (12K+ / %98) kaldırılmıştır.
  const { data: reviews, isLoading } = useQuery<ReviewItem[]>({
    queryKey: ["home-real-testimonials"],
    queryFn: async () => {
      try {
        const res = await fetch("/api/v1/reviews/public");
        if (res.ok) {
          const data = await res.json();
          return Array.isArray(data) ? data : [];
        }
      } catch (err) {
        console.error("Testimonials fetch error:", err);
      }
      return [];
    },
    staleTime: 60 * 1000,
  });

  // Gerçek veri yoksa bölümü gösterme (Kullanıcı TODO: {{TODO_GERCEK_KULLANICI_YORUMLARI}})
  if (!isLoading && (!reviews || reviews.length === 0)) {
    return null;
  }

  if (!reviews || reviews.length === 0) {
    return null;
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % reviews.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
  };

  const currentReview = reviews[currentIndex];

  return (
    <section className="relative overflow-hidden bg-white py-20 sm:py-24 lg:py-28 border-b border-slate-100">
      <div className="relative z-10 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 border border-emerald-200/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-800 mb-3">
            <MessageSquare className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
            GERÇEK DENEYİMLER
          </span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 font-display tracking-tight">
            Öğrenci ve Velilerimizin Yorumları
          </h2>
        </div>

        <div className="max-w-3xl mx-auto bg-slate-50 rounded-3xl p-8 sm:p-12 border border-slate-200 relative">
          <Quote className="w-10 h-10 text-emerald-200 mb-4" />
          <p className="text-base sm:text-lg text-slate-800 leading-relaxed font-medium mb-6">
            &ldquo;{currentReview.content}&rdquo;
          </p>

          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <div>
              <p className="font-bold text-slate-900 text-sm sm:text-base">{currentReview.user_name}</p>
              <p className="text-xs text-slate-500">{currentReview.role_label || "BiHocam Öğrencisi / Velisi"}</p>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex text-amber-400">
                {Array.from({ length: currentReview.rating || 5 }).map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-amber-400" />
                ))}
              </div>

              {reviews.length > 1 && (
                <div className="flex items-center gap-1 ml-4">
                  <button
                    onClick={handlePrev}
                    aria-label="Önceki Yorum"
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleNext}
                    aria-label="Sonraki Yorum"
                    className="p-1.5 rounded-lg border border-slate-300 hover:bg-white text-slate-700"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
