"use client";

import { motion } from "framer-motion";
import { CheckCircle2, Clock, Download, Laptop, Sparkles } from "lucide-react";

export default function HowYouLearnSection() {
  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white border-b border-slate-100">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-slate-950 px-6 sm:px-10 lg:px-16 xl:px-20 py-12 sm:py-16 lg:py-20 text-white shadow-2xl border border-white/10">
          
          {/* Subtle Ambient Radial Dots */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden select-none opacity-20"
          >
            <div
              className="absolute top-10 right-10 hidden h-32 w-40 lg:block"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(16, 185, 129, 0.4) 1.5px, transparent 1.5px)",
                backgroundSize: "16px 16px",
              }}
            />
            <div
              className="absolute bottom-10 left-10 hidden h-32 w-40 lg:block"
              style={{
                backgroundImage:
                  "radial-gradient(circle, rgba(16, 185, 129, 0.4) 1.5px, transparent 1.5px)",
                backgroundSize: "16px 16px",
              }}
            />
          </div>

          <div className="relative z-10 grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            
            {/* ── Left Column: Value Copy ── */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
              className="order-2 lg:order-1 space-y-6"
            >
              <div>
                <p className="text-xs sm:text-sm font-bold uppercase tracking-widest text-emerald-400 flex items-center gap-2">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                  NASIL ÖĞRENİRSİNİZ?
                </p>
                <span
                  aria-hidden="true"
                  className="mt-2.5 block h-0.5 w-16 rounded-full bg-gradient-to-r from-emerald-500 to-transparent"
                />
              </div>

              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black font-display tracking-tight text-white leading-[1.12]">
                Bir masa, bir tarayıcı ve size özel bir{" "}
                <span className="text-emerald-400">ders saati.</span>
              </h2>

              <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed max-w-xl">
                BiHocam canlı dersleri tamamen tarayıcınız üzerinden çalışır. Zoom veya Skype gibi harici program indirme karmaşası olmadan, tek tıkla interaktif beyaz tahtaya bağlanır ve eğitmeninizle derse başlarsınız.
              </p>

              <ul className="mt-6 flex flex-col space-y-2">
                {/* Fact 01 */}
                <li className="flex items-start gap-4 py-3">
                  <span className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-emerald-400">
                    <Laptop className="w-5 h-5" />
                  </span>
                  <div className="border-s border-dotted border-emerald-500/40 ps-4 sm:ps-5">
                    <p className="text-xs font-black font-mono tracking-wider text-emerald-400 uppercase">
                      01
                    </p>
                    <p className="mt-0.5 font-bold text-white text-base">
                      Tüm Cihazlardan Tek Tıkla Bağlantı
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400 leading-snug font-normal">
                      Masaüstü, dizüstü veya tabletten tek tıkla yüksek çözünürlüklü WebRTC canlı sınıfa bağlanın.
                    </p>
                  </div>
                </li>

                {/* Fact 02 */}
                <li className="flex items-start gap-4 py-3 border-t border-white/10">
                  <span className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-emerald-400">
                    <Download className="w-5 h-5" />
                  </span>
                  <div className="border-s border-dotted border-emerald-500/40 ps-4 sm:ps-5">
                    <p className="text-xs font-black font-mono tracking-wider text-emerald-400 uppercase">
                      02
                    </p>
                    <p className="mt-0.5 font-bold text-white text-base">
                      Ders Kayıtları & Dijital Kaynak Arşivi
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400 leading-snug font-normal">
                      İşlenen her dersin video kaydını dilediğiniz zaman tekrar izleyin; paylaşılan PDF ve notlar panelinizde saklanır.
                    </p>
                  </div>
                </li>

                {/* Fact 03 */}
                <li className="flex items-start gap-4 py-3 border-t border-white/10">
                  <span className="flex-shrink-0 w-11 h-11 rounded-2xl bg-white/[0.08] border border-white/10 flex items-center justify-center text-emerald-400">
                    <Clock className="w-5 h-5" />
                  </span>
                  <div className="border-s border-dotted border-emerald-500/40 ps-4 sm:ps-5">
                    <p className="text-xs font-black font-mono tracking-wider text-emerald-400 uppercase">
                      03
                    </p>
                    <p className="mt-0.5 font-bold text-white text-base">
                      Kendi Temponuzda, Esnek Planlama
                    </p>
                    <p className="mt-0.5 text-sm text-slate-400 leading-snug font-normal">
                      Ders saatlerinizi öğretmeninizle birlikte okul veya iş programınıza göre esnekçe planlayın.
                    </p>
                  </div>
                </li>
              </ul>
            </motion.div>

            {/* ── Right Column: Visual Artwork & Floating Badges ── */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7, delay: 0.2 }}
              className="order-1 lg:order-2 w-full flex justify-center lg:justify-end"
            >
              <div className="relative w-full max-w-[440px] lg:max-w-[480px]">
                {/* Border Frame Outline */}
                <div className="relative rounded-3xl overflow-hidden border-2 border-emerald-500/30 p-2 bg-slate-900/60 shadow-2xl backdrop-blur-md">
                  <div className="relative aspect-[4/3] sm:aspect-square overflow-hidden rounded-2xl bg-slate-800">
                    <img
                      alt="BiHocam online canlı derste çalışan öğrenci"
                      loading="lazy"
                      width="896"
                      height="896"
                      decoding="async"
                      className="w-full h-full object-cover"
                      src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=900&q=80"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent" />
                  </div>
                </div>

                {/* Floating Progress Badge (Aniq-UI Style) */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="absolute -bottom-6 -left-4 sm:-bottom-8 sm:-left-8 rounded-2xl bg-slate-900/95 border border-emerald-500/30 p-4 sm:p-5 shadow-2xl backdrop-blur-xl w-52 sm:w-60"
                >
                  <p className="text-xs text-slate-400 font-medium">Haftalık Kazanım İlerlemesi</p>
                  <p className="mt-1 text-2xl sm:text-3xl font-black font-mono tabular-nums text-white">
                    %85
                  </p>
                  <div aria-hidden="true" className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-slate-800">
                    <div className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400 w-[85%]" />
                  </div>
                </motion.div>

                {/* Floating Success Notification Badge */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.6, delay: 0.5 }}
                  className="absolute -top-4 -right-2 sm:-top-6 sm:-right-6 rounded-2xl bg-slate-900/95 border border-emerald-500/30 px-4 py-3 sm:px-5 sm:py-3.5 shadow-2xl backdrop-blur-xl flex items-center gap-3"
                >
                  <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/30">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white leading-tight">Harika Gidiyorsun!</p>
                    <p className="text-[11px] text-slate-400 leading-snug">Bu haftaki hedefin tamamlandı.</p>
                  </div>
                </motion.div>

              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  );
}
