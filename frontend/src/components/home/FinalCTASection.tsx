"use client";

import { motion } from "framer-motion";
import { ArrowRight, BookOpen, Clock, PlusCircle, School, ShieldCheck, Sparkles, Users } from "lucide-react";
import Link from "next/link";

export default function FinalCTASection() {
  return (
    <section className="py-16 sm:py-20 lg:py-24 bg-white border-t border-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-emerald-50/80 via-teal-50/50 to-slate-50 p-8 sm:p-12 lg:p-16 border border-emerald-200/80 shadow-xl">
          
          {/* Subtle Ambient Radial Glows */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden select-none"
          >
            <div className="absolute -top-24 -left-24 h-72 w-72 rounded-full bg-emerald-200/40 blur-3xl" />
            <div className="absolute -bottom-24 -right-24 h-72 w-72 rounded-full bg-teal-200/40 blur-3xl" />
          </div>

          <div className="relative z-10 grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            
            {/* ── Left Column (5 Cols) ── */}
            <div className="lg:col-span-5 space-y-4 text-left">
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-white/90 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-800 shadow-xs">
                <School className="h-4 w-4 text-emerald-600 shrink-0" />
                Hemen Başlayın
              </span>

              <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-black text-slate-900 font-display tracking-tight leading-[1.12]">
                BiHocam ile Eğitime{" "}
                <span className="relative inline-block text-emerald-700">
                  Bugün
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 160 20"
                    className="absolute -bottom-2 left-0 w-full h-3 text-emerald-400/80 -z-10"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M3 15 Q 80 0 157 12"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                      strokeLinecap="round"
                    />
                  </svg>
                </span>{" "}
                Başlayın
              </h2>

              <p className="text-base text-slate-600 font-normal leading-relaxed max-w-md">
                Binlerce öğrenci ve veli gibi siz de güvenli, şeffaf ve sonuç odaklı özel ders ayrıcalığını keşfedin.
              </p>
            </div>

            {/* ── Middle Column (3 Value Pillars - 4 Cols) ── */}
            <div className="lg:col-span-4 grid grid-cols-1 gap-6 border-y sm:border-y-0 sm:border-x border-emerald-200/80 py-6 sm:py-0 sm:px-6">
              {/* Item 1 */}
              <div className="flex items-start gap-3.5">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200">
                  <Users className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Seçkin Eğitmen Kadrosu</h3>
                  <p className="text-xs text-slate-600 leading-snug font-normal mt-0.5">
                    Diploma ve mülakat onayından geçmiş, alanında uzman eğitimciler.
                  </p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="flex items-start gap-3.5">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center border border-teal-200">
                  <BookOpen className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Birebir Pratik Yaklaşım</h3>
                  <p className="text-xs text-slate-600 leading-snug font-normal mt-0.5">
                    Ezber değil; anlama, yeni nesil soru çözümü ve koçluk odaklı seanslar.
                  </p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="flex items-start gap-3.5">
                <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center border border-indigo-200">
                  <Clock className="w-5 h-5" />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Esnek Saat & Havuz Güvencesi</h3>
                  <p className="text-xs text-slate-600 leading-snug font-normal mt-0.5">
                    Dilediğiniz saatte bağlanın, onay vermeden ücret aktarılmasın.
                  </p>
                </div>
              </div>
            </div>

            {/* ── Right Column (Action Card - 3 Cols) ── */}
            <div className="lg:col-span-3">
              <div className="rounded-3xl bg-white p-6 sm:p-7 border border-slate-200 shadow-lg flex flex-col justify-between space-y-5 text-center">
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 border border-emerald-200 flex items-center justify-center mx-auto">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-lg font-bold text-slate-900 font-display">
                    Hedefiniz İçin İlk Adım
                  </h3>
                  <p className="text-xs text-slate-500 font-normal leading-relaxed">
                    İster ücretsiz özel ders talebi açın, ister öğretmenleri anında filtreleyin.
                  </p>
                </div>

                <div className="space-y-2.5">
                  <Link
                    href="/tenders/new"
                    className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm py-3.5 shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 transition-all"
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Ders Talebi Aç</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>

                  <Link
                    href="/teachers"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-800 border border-slate-200 font-semibold text-xs py-3 transition-colors"
                  >
                    <span>Eğitmenleri Keşfet</span>
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
