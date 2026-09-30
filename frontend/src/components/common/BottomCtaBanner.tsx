"use client";

import Link from "next/link";

export default function BottomCtaBanner() {
  return (
    <section className="relative w-full py-12 md:py-16">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#FFF5F1] border border-[#FDE4DE] p-6 sm:p-10 lg:p-14 shadow-sm">
        {/* Background ambient radial gradients & accents */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 select-none overflow-hidden">
          <div className="absolute -top-24 -start-24 h-72 w-72 rounded-full bg-orange-500/[0.08] blur-2xl" />
          <div className="absolute -bottom-32 -start-16 h-80 w-80 rounded-full bg-orange-500/[0.06] blur-2xl" />
          <div className="absolute -bottom-24 -end-24 h-72 w-72 rounded-full bg-orange-500/[0.08] blur-2xl" />

          {/* Dot grids */}
          <div
            className="absolute bottom-[10%] start-[2%] hidden h-24 w-28 lg:block opacity-40"
            style={{
              backgroundImage: "radial-gradient(circle, #FF6A3D 1.5px, transparent 1.5px)",
              backgroundSize: "14px 14px",
            }}
          />
          <div
            className="absolute top-[8%] end-[6%] hidden h-20 w-24 lg:block opacity-40"
            style={{
              backgroundImage: "radial-gradient(circle, #FF6A3D 1.5px, transparent 1.5px)",
              backgroundSize: "14px 14px",
            }}
          />

          {/* Floating Stars */}
          <img
            alt=""
            src="/assets/images/home/star.png"
            className="absolute top-[16%] end-[30%] hidden h-auto w-6 lg:block animate-pulse opacity-90"
          />
          <img
            alt=""
            src="/assets/images/home/star.png"
            className="absolute top-[26%] end-[24%] hidden h-auto w-4 lg:block animate-pulse opacity-75"
          />
        </div>

        {/* 3-Column Content Grid: Left Text | Center 3 Pillars | Right Action Card */}
        <div className="relative z-10 grid items-center gap-10 lg:grid-cols-[1.05fr_1.25fr_0.95fr] lg:gap-12">
          {/* 1. Left Text Column */}
          <div className="text-start space-y-4">
            <span className="inline-flex items-center gap-2 rounded-full border border-orange-300/80 bg-white/90 px-4 py-1.5 text-xs font-bold uppercase tracking-[0.16em] text-orange-700 shadow-2xs">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-600">
                <path d="M22 9l-10 -4l-10 4l10 4l10 -4v6" />
                <path d="M6 10.6v5.4a6 3 0 0 0 12 0v-5.4" />
              </svg>
              Öğrenmeye Başlayın
            </span>

            <h2 className="text-3xl sm:text-4xl lg:text-[2.65rem] font-black text-slate-900 leading-[1.15] font-display tracking-tight">
              BiHocam ile <br />
              öğrenmeye <br />
              <span className="text-orange-600">bugün başlayın.</span>
            </h2>

            <p className="max-w-md text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
              Pratik kursları keşfedin, uzmanlardan bilgi edinin ve daha hızlı büyümenize yardımcı olacak beceriler kazanın.
            </p>

            {/* Subtle dot matrix below description */}
            <div
              className="mt-4 w-28 h-10 hidden sm:block opacity-35"
              style={{
                backgroundImage: "radial-gradient(circle, #FF6A3D 1.5px, transparent 1.5px)",
                backgroundSize: "12px 12px",
              }}
            />
          </div>

          {/* 2. Middle 3-Pillar Column */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-3 lg:gap-5 text-center sm:text-left">
            {/* Pillar 1 */}
            <div className="space-y-2">
              <span
                aria-hidden="true"
                className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15 text-orange-600 shadow-2xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M8 7a4 4 0 1 0 8 0a4 4 0 0 0 -8 0" />
                  <path d="M6 21v-2a4 4 0 0 1 4 -4h4a4 4 0 0 1 4 4v2" />
                </svg>
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                Uzmanlar tarafından verilen kurslar
              </h3>
              <p className="text-xs leading-relaxed text-slate-500 font-normal">
                Gerçek dünya deneyimine sahip sektör uzmanlarından bilgi edinin.
              </p>
            </div>

            {/* Pillar 2 */}
            <div className="space-y-2">
              <span
                aria-hidden="true"
                className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15 text-orange-600 shadow-2xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 19a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                  <path d="M3 6a9 9 0 0 1 9 0a9 9 0 0 1 9 0" />
                  <path d="M3 6l0 13" />
                  <path d="M12 6l0 13" />
                  <path d="M21 6l0 13" />
                </svg>
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                Pratik öğrenme
              </h3>
              <p className="text-xs leading-relaxed text-slate-500 font-normal">
                Anında uygulayabileceğiniz uygulamalı dersler ve projeler.
              </p>
            </div>

            {/* Pillar 3 */}
            <div className="space-y-2">
              <span
                aria-hidden="true"
                className="mx-auto sm:mx-0 flex h-12 w-12 items-center justify-center rounded-full bg-orange-500/15 text-orange-600 shadow-2xs"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 12a9 9 0 1 0 18 0a9 9 0 0 0 -18 0" />
                  <path d="M12 7v5l3 3" />
                </svg>
              </span>
              <h3 className="text-sm font-bold text-slate-900 leading-snug">
                Esnek erişim
              </h3>
              <p className="text-xs leading-relaxed text-slate-500 font-normal">
                İstediğiniz zaman, istediğiniz yerde ve kendi hızınızda öğrenin.
              </p>
            </div>
          </div>

          {/* 3. Right White Card with 3D Study Kit */}
          <div className="rounded-3xl bg-white p-6 sm:p-7 shadow-xl shadow-orange-950/5 border border-slate-100 flex flex-col items-center text-center max-w-[340px] mx-auto w-full">
            <img
              alt="Eğitim Seti"
              src="/assets/images/home/cta/study-kit.webp"
              className="mx-auto h-auto w-full max-w-[240px] object-contain drop-shadow-sm transition-transform duration-300 hover:scale-105"
            />
            <h3 className="mt-4 text-lg font-bold text-slate-900 leading-tight">
              Bir sonraki beceriniz sizi bekliyor.
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-slate-500 font-normal">
              Kurslarımızı keşfedin ve hedeflerinize doğru bir sonraki adımı atın.
            </p>
            <Link
              href="/courses"
              className="mt-5 w-full py-3.5 px-6 rounded-xl bg-orange-600 hover:bg-orange-700 text-white font-bold text-sm shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all transform hover:-translate-y-0.5"
            >
              <span>Kursları keşfedin</span>
              <span className="text-base font-black">→</span>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
