"use client";

import React, { useState } from "react";
import Link from "next/link";
import { 
  GraduationCap, 
  ShieldCheck, 
  Sparkles, 
  Video, 
  Clock, 
  TrendingUp, 
  ArrowUpRight,
  Lock,
  ArrowRight
} from "lucide-react";

interface BentoCardProps {
  className?: string;
  title: string;
  description: string;
  badge?: string;
  icon: React.ReactNode;
  children?: React.ReactNode;
  href?: string;
}

export function BentoCard({
  className = "",
  title,
  description,
  badge,
  icon,
  children,
  href,
}: BentoCardProps) {
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
  };

  const CardContent = (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative overflow-hidden rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-sm transition-all duration-300 hover:border-emerald-500/40 hover:shadow-xl h-full flex flex-col justify-between ${className}`}
    >
      {/* Subtle Radial Spotlight on Hover */}
      <div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: `radial-gradient(400px circle at ${mousePos.x}px ${mousePos.y}px, rgba(16, 185, 129, 0.08), transparent 80%)`,
        }}
      />

      {/* Top Content Area */}
      <div className="relative z-10 flex-1 flex flex-col">
        {/* Card Header / Icon & Badge */}
        <div className="flex items-center justify-between gap-2 mb-6">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-700 group-hover:bg-emerald-100 group-hover:scale-105 transition-all duration-300 flex-shrink-0">
            {icon}
          </div>
          {badge && (
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-600 animate-pulse" />
              {badge}
            </span>
          )}
        </div>

        {/* Content */}
        <div className="space-y-3 flex-1">
          <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-700 transition-colors flex items-center justify-between">
            <span>{title}</span>
            {href && (
              <ArrowUpRight className="h-5 w-5 opacity-0 group-hover:opacity-100 transition-opacity text-emerald-600 flex-shrink-0 ml-2" />
            )}
          </h3>
          <p className="text-sm sm:text-base leading-relaxed text-slate-600 font-normal">
            {description}
          </p>
        </div>
      </div>

      {/* Bottom Custom Slot (pinned cleanly at the bottom) */}
      {children && (
        <div className="relative z-10 mt-6 pt-5 border-t border-slate-100">
          {children}
        </div>
      )}
    </div>
  );

  return href ? (
    <Link href={href} className="block h-full">
      {CardContent}
    </Link>
  ) : (
    <div className="h-full">
      {CardContent}
    </div>
  );
}

export default function BentoGridSection() {
  return (
    <section className="py-24 relative overflow-hidden bg-slate-50/70 border-b border-slate-200/70">
      {/* Background Subtle Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[500px] bg-emerald-100/40 rounded-full blur-[140px] pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header - Human-centric and clear copy */}
        <div className="max-w-3xl mx-auto text-center mb-16 space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-emerald-600" />
            <span>BIHOCAM FARKI</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-slate-900 font-display">
            Eğitimde Yeni Standart: <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">Akıllı Öğrenme Deneyimi</span>
          </h2>
          <p className="text-slate-600 text-base sm:text-lg leading-relaxed max-w-2xl mx-auto">
            Özel ders talebinden uzman tekliflerine, canlı dersten yapay zeka başarı karnesine kadar her aşama şeffaf, güvenli ve sonuç odaklı.
          </p>
        </div>

        {/* 3x2 Balanced Grid - Equal Heights & Zero Mess */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-fr">
          
          {/* Card 1: Özel Ders Talep Masası */}
          <BentoCard
            title="Özel Ders Talep Masası"
            description="İhtiyacın olan dersi, bütçeni ve hedefini belirt. Branş öğretmenlerinden 24 saat içinde teklifler al, en uygun olanı seç."
            badge="Akıllı Teklif Masası"
            icon={<Clock className="w-6 h-6" />}
            href="/tenders"
          />

          {/* Card 2: Doğrulanmış Eğitmenler */}
          <BentoCard
            title="Onaylı Eğitmen Ağı"
            description="Diploması, adli sicil kaydı ve MEB/ÖSYM tecrübesi bağımsız eğitim kurulumuzca teyit edilmiş seçkin öğretmen kadrosu."
            badge="%100 Doğrulanmış"
            icon={<ShieldCheck className="w-6 h-6" />}
            href="/teachers"
          />

          {/* Card 3: Canlı Etkileşimli Ders Odaları */}
          <BentoCard
            title="HD Canlı Sanal Sınıf"
            description="Ek uygulama indirmeden tarayıcınızdan tek tıkla bağlanın; interaktif beyaz tahta ve materyallerle derse katılın."
            badge="WebRTC Gücü"
            icon={<Video className="w-6 h-6" />}
            href="/courses"
          />

          {/* Card 4: Yapay Zeka Analiz & Gelişim Takibi */}
          <BentoCard
            title="Yapay Zeka Gelişim Takibi"
            description="Öğrencinin deneme ve soru çözümlerini analiz eden, eksik kazanımlara göre kişiye özel ders ve soru planı çıkaran sistem."
            badge="AI Koçluk"
            icon={<TrendingUp className="w-6 h-6" />}
            href="/tanisma-dersi"
          />

          {/* Card 5: GİB & VUK Yasal Güvence */}
          <BentoCard
            title="Emanet Havuz & Yasal Güvence"
            description="Ödemeniz ders tamamlanıp onay verene kadar BDDK lisanslı emanet havuzda güvende kalır. 12 taksit ve resmi e-fatura desteği."
            badge="GİB & VUK Uyumlu"
            icon={<Lock className="w-6 h-6" />}
          />

          {/* Card 6: Hemen Başla CTA */}
          <BentoCard
            className="!bg-gradient-to-br !from-emerald-600 !to-teal-700 !border-emerald-500 text-white"
            title="Hedefine Bugün Başla"
            description="İster hemen öğretmenini seç, ister ücretsiz talep açarak branş hocalarının sana özel teklif vermesini sağla."
            badge="Hemen Başla"
            icon={<Sparkles className="w-6 h-6 text-emerald-200" />}
            href="/tenders/new"
          >
            <div className="pt-2">
              <span className="w-full py-3.5 px-4 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg transition-all">
                <span>Ücretsiz Talep Oluştur</span>
                <ArrowRight className="w-4 h-4 text-emerald-700" />
              </span>
            </div>
          </BentoCard>

        </div>
      </div>
    </section>
  );
}
