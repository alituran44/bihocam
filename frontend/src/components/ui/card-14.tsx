"use client";

import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  ArrowRight,
  Bath,
  BedDouble,
  Expand,
  MapPin,
  Sparkles,
  Zap,
  Star,
  Clock,
  Users,
  FileText,
  GraduationCap,
  BookOpen,
  CheckCircle2,
} from "lucide-react";

export interface PerspectiveFlipCardProps {
  className?: string;
  front: React.ReactNode;
  back: React.ReactNode;
  h?: string;
  w?: string;
}

/**
 * Card 14 - Perspective Flip Card
 * Uses standard rounded-2xl border radius and optimized 3D depth.
 * Allows Z-translation to create true perspective elevation.
 */
export function PerspectiveFlipCard({
  className,
  front,
  back,
  h = "h-[500px]",
  w = "w-[360px]",
}: PerspectiveFlipCardProps) {
  return (
    <div className={cn("group/p-card [perspective:2000px]", h, w, className)}>
      <div
        className={cn(
          "relative h-full w-full transition-all duration-700 [transform-style:preserve-3d] group-hover/p-card:[transform:rotateY(180deg)]",
          "rounded-2xl"
        )}
      >
        {/* Front Face */}
        <div className="absolute inset-0 size-full rounded-2xl border border-slate-200 bg-white text-slate-900 shadow-sm [transform-style:preserve-3d] [backface-visibility:hidden]">
          <div className="size-full [transform-style:preserve-3d] p-3">
            {front}
          </div>
        </div>

        {/* Back Face */}
        <div className="absolute inset-0 size-full rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-900 text-slate-100 shadow-xl [transform-style:preserve-3d] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <div className="size-full [transform-style:preserve-3d] p-6 text-center flex flex-col items-center justify-between">
            {back}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Generic Real Estate Front (Default Demo) ──
export const PerspectiveFront = () => (
  <div className="size-full flex flex-col [transform-style:preserve-3d]">
    {/* Image Section (Z: 50px) */}
    <div className="relative h-60 w-full [transform-style:preserve-3d] [transform:translateZ(50px)]">
      <div className="absolute inset-0 rounded-xl bg-slate-100 overflow-hidden border border-slate-200/80">
        <img
          src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"
          alt="Serenity Residential"
          className="h-full w-full object-cover transition duration-700 group-hover/p-card:scale-110"
        />
      </div>

      {/* Floating Rating Badge (Z: 80px) */}
      <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-[11px] font-semibold tracking-tight text-slate-800 shadow-md [transform:translateZ(80px)]">
        <Star className="size-3.5 fill-amber-400 text-amber-400" />
        <span>4.9 (120 İnceleme)</span>
      </div>
    </div>

    {/* Content Section (Z: 60px) */}
    <div className="flex flex-col justify-between flex-grow p-4 pt-6 [transform-style:preserve-3d]">
      <div className="space-y-2 [transform-style:preserve-3d] [transform:translateZ(60px)]">
        <div className="flex items-center gap-2 text-emerald-600 text-xs font-semibold tracking-wide">
          <Sparkles className="size-4" />
          <span>Öne Çıkan İlan</span>
        </div>
        <h3 className="text-xl font-bold tracking-tight text-slate-900 transition duration-300 group-hover/p-card:text-emerald-600 leading-snug">
          Serenity Residential Home
        </h3>
        <p className="text-[13px] font-medium text-slate-500 flex items-center gap-1.5 leading-none mt-1">
          <MapPin className="size-3.5 text-emerald-600" />
          15 S Aurora Ave, Miami
        </p>
      </div>

      <div className="flex items-center justify-between text-xs font-semibold tracking-wider text-slate-400 [transform:translateZ(40px)] pt-3 border-t border-slate-100">
        <span className="group-hover/p-card:text-emerald-600 group-hover/p-card:translate-x-1 transition-all">
          Detaylar için kartı çevirin
        </span>
        <ArrowRight className="size-4 group-hover/p-card:text-emerald-600" />
      </div>
    </div>
  </div>
);

// ── Generic Real Estate Back (Default Demo) ──
export const PerspectiveBack = () => (
  <div className="size-full flex flex-col items-center justify-between [transform-style:preserve-3d]">
    {/* Feature Icons (Z: 130px) */}
    <div className="w-full [transform-style:preserve-3d] flex justify-center gap-3 pt-2">
      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 [transform:translateZ(130px)] min-w-[80px] [transform-style:preserve-3d]">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 [transform:translateZ(20px)] shadow-sm">
          <BedDouble className="size-5" />
        </div>
        <p className="text-[11px] font-bold text-white [transform:translateZ(10px)] tracking-tight">
          5 Oda
        </p>
      </div>
      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 [transform:translateZ(150px)] min-w-[80px] [transform-style:preserve-3d]">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 [transform:translateZ(25px)] shadow-sm">
          <Bath className="size-5" />
        </div>
        <p className="text-[11px] font-bold text-white [transform:translateZ(10px)] tracking-tight">
          3 Banyo
        </p>
      </div>
      <div className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-white/5 border border-white/10 [transform:translateZ(130px)] min-w-[80px] [transform-style:preserve-3d]">
        <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 [transform:translateZ(20px)] shadow-sm">
          <Expand className="size-5" />
        </div>
        <p className="text-[11px] font-bold text-white [transform:translateZ(10px)] tracking-tight">
          120m²
        </p>
      </div>
    </div>

    {/* Description (Z: 80px) */}
    <div className="space-y-2 [transform-style:preserve-3d] px-2 text-center">
      <h4 className="text-lg font-bold tracking-tight text-white [transform:translateZ(80px)]">
        Özellikler & Detaylar
      </h4>
      <p className="text-xs font-normal text-slate-300 leading-relaxed [transform:translateZ(40px)]">
        Akıllı güvenlik altyapısı, merkezi konum ve huzurlu bir yaşam alanı sunan ödüllü mimari.
      </p>
    </div>

    {/* Action (Z: 100px) */}
    <div className="w-full [transform-style:preserve-3d] pb-2">
      <button 
        type="button"
        aria-label="Randevu Talep Et"
        className="h-11 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wider shadow-lg shadow-emerald-900/40 transition-all hover:scale-[1.02] active:scale-95 [transform:translateZ(100px)] flex items-center justify-center gap-2"
      >
        <Zap className="size-3.5 fill-current" />
        <span>Randevu Talep Et</span>
      </button>
    </div>
  </div>
);

// ══════════════════════════════════════════════════════════════════
// 🎓 BIHOCAM DERS KARTI UYARLAMASI (Ders Kartları İçin Özel Versiyon)
// ══════════════════════════════════════════════════════════════════
export interface LessonPerspectiveCardProps {
  id: string;
  title: string;
  category: string;
  teacherName: string;
  teacherAvatar?: string | null;
  rating?: number;
  reviewCount?: number;
  duration?: string;
  format?: string;
  materials?: string;
  price: number;
  discountPrice?: number | null;
  imageUrl?: string | null;
  slug: string;
  summary?: string;
  className?: string;
}

export function LessonPerspectiveCard({
  id,
  title,
  category,
  teacherName,
  teacherAvatar,
  rating = 4.9,
  reviewCount = 38,
  duration = "32 Saat",
  format = "Canlı 1:1",
  materials = "PDF + Kayıt",
  price,
  discountPrice,
  imageUrl,
  slug,
  summary = "Müfredata tam uyumlu, yeni nesil sınav soruları ve birebir soru çözüm analizleriyle hedefinize emin adımlarla ilerleyin.",
  className,
}: LessonPerspectiveCardProps) {
  const fallbackImage = "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=800&q=80";
  const displayImage = imageUrl || fallbackImage;

  const frontNode = (
    <div className="size-full flex flex-col justify-between [transform-style:preserve-3d]">
      {/* Cover Image + Badges */}
      <div className="relative h-56 w-full [transform-style:preserve-3d] [transform:translateZ(50px)]">
        <div className="absolute inset-0 rounded-xl bg-slate-100 overflow-hidden border border-slate-200">
          <img
            src={displayImage}
            alt={title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover/p-card:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
        </div>

        {/* Category Badge (Top Left) */}
        <div className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-emerald-600/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider shadow-md [transform:translateZ(70px)]">
          {category}
        </div>

        {/* Rating Badge (Bottom Left) */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-slate-200 text-[11px] font-bold text-slate-900 shadow-md [transform:translateZ(80px)]">
          <Star className="size-3 fill-amber-400 text-amber-400" />
          <span>{rating.toFixed(1)}</span>
          <span className="text-slate-500 font-normal text-[10px]">({reviewCount})</span>
        </div>

        {/* Price Tag (Bottom Right) */}
        <div className="absolute bottom-3 right-3 px-3 py-1 rounded-xl bg-slate-950/90 text-white text-xs font-black [transform:translateZ(85px)] shadow-lg border border-white/10">
          {discountPrice ? (
            <div className="flex items-center gap-1.5">
              <span className="line-through text-slate-400 text-[10px]">₺{price}</span>
              <span className="text-emerald-400 font-bold">₺{discountPrice}</span>
            </div>
          ) : (
            <span className="text-emerald-400">₺{price}</span>
          )}
        </div>
      </div>

      {/* Course Info */}
      <div className="p-4 space-y-3 [transform-style:preserve-3d]">
        <div className="space-y-1.5 [transform-style:preserve-3d] [transform:translateZ(60px)]">
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2 group-hover/p-card:text-emerald-600 transition-colors">
            {title}
          </h3>
          <div className="flex items-center gap-2 pt-1">
            {teacherAvatar ? (
              <img
                src={teacherAvatar}
                alt={teacherName}
                className="w-5 h-5 rounded-full object-cover border border-slate-200"
              />
            ) : (
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-[10px] font-bold">
                {teacherName.charAt(0)}
              </div>
            )}
            <span className="text-xs text-slate-600 font-medium truncate">{teacherName}</span>
          </div>
        </div>

        {/* Card Flip Hint */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] font-semibold text-emerald-700 [transform:translateZ(40px)]">
          <span>Kazanımları Gör (Çevir)</span>
          <ArrowRight className="size-3.5 group-hover/p-card:translate-x-1 transition-transform" />
        </div>
      </div>
    </div>
  );

  const backNode = (
    <div className="size-full flex flex-col justify-between [transform-style:preserve-3d]">
      {/* Top Header */}
      <div className="space-y-1 [transform-style:preserve-3d] [transform:translateZ(70px)]">
        <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-bold uppercase tracking-wider">
          <Sparkles className="size-3" />
          <span>Ders Detayları</span>
        </div>
        <h4 className="text-base font-bold text-white line-clamp-1">
          {title}
        </h4>
      </div>

      {/* 3D Floating Feature Chips */}
      <div className="grid grid-cols-3 gap-2 w-full [transform-style:preserve-3d] my-3">
        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 [transform:translateZ(110px)] [transform-style:preserve-3d]">
          <Clock className="size-4 text-emerald-400 [transform:translateZ(20px)]" />
          <span className="text-[10px] font-bold text-white [transform:translateZ(10px)]">{duration}</span>
          <span className="text-[9px] text-slate-400">Süre</span>
        </div>

        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 [transform:translateZ(130px)] [transform-style:preserve-3d]">
          <Users className="size-4 text-teal-400 [transform:translateZ(25px)]" />
          <span className="text-[10px] font-bold text-white [transform:translateZ(10px)]">{format}</span>
          <span className="text-[9px] text-slate-400">Format</span>
        </div>

        <div className="flex flex-col items-center gap-1 p-2 rounded-xl bg-white/5 border border-white/10 [transform:translateZ(110px)] [transform-style:preserve-3d]">
          <FileText className="size-4 text-emerald-400 [transform:translateZ(20px)]" />
          <span className="text-[10px] font-bold text-white [transform:translateZ(10px)]">{materials}</span>
          <span className="text-[9px] text-slate-400">Kaynak</span>
        </div>
      </div>

      {/* Summary Description */}
      <div className="space-y-1.5 [transform-style:preserve-3d] [transform:translateZ(60px)] px-1">
        <p className="text-xs text-slate-300 leading-relaxed line-clamp-3 text-center">
          {summary}
        </p>
      </div>

      {/* CTA Button */}
      <div className="w-full [transform-style:preserve-3d] pt-3">
        <Link
          href={`/courses/${slug}`}
          className="h-10 w-full rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold tracking-wider shadow-lg shadow-emerald-950/50 transition-all hover:scale-[1.02] active:scale-95 [transform:translateZ(90px)] flex items-center justify-center gap-2"
        >
          <Zap className="size-3.5 fill-current" />
          <span>Derse Katıl / İncele</span>
        </Link>
      </div>
    </div>
  );

  return (
    <PerspectiveFlipCard
      className={className}
      front={frontNode}
      back={backNode}
      h="h-[430px]"
      w="w-full max-w-[340px]"
    />
  );
}

export default function Card14Demo() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-8 min-h-[500px] p-6 bg-slate-900 rounded-3xl">
      {/* Standart Real Estate Demo */}
      <PerspectiveFlipCard
        front={<PerspectiveFront />}
        back={<PerspectiveBack />}
      />

      {/* Özel BiHocam Ders Kartı Demo */}
      <LessonPerspectiveCard
        id="demo-1"
        title="YKS Matematik: Türev & İntegral Ustalık Kampı"
        category="YKS & AYT"
        teacherName="Mustafa Hoca (Boğaziçi Mezunu)"
        rating={4.9}
        reviewCount={94}
        duration="48 Saat"
        format="Canlı 1:1"
        materials="250 Soru PDF"
        price={1200}
        discountPrice={890}
        slug="yks-matematik-turev-integral"
      />
    </div>
  );
}
