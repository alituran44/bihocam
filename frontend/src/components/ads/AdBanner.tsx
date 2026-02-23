"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { X, ExternalLink, Star, ArrowRight, User, BookOpen } from "lucide-react";
import { adDisplayApi, type AdCampaign } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Image from "next/image";
import Link from "next/link";
import AdPlaceholder from "./AdPlaceholder";

interface AdBannerProps {
  placementCode: string;
  categoryId?: string;
  className?: string;
}

export default function AdBanner({ placementCode, categoryId, className = "" }: AdBannerProps) {
  const [dismissedAds, setDismissedAds] = useState<Set<string>>(new Set());
  const [currentAdIndex, setCurrentAdIndex] = useState(0);
  const user = useAuthStore((state) => state.user);
  const isAdminOrTeacher = user?.role === "admin" || user?.role === "teacher";

  const { data: ads, isLoading } = useQuery({
    queryKey: ["ads", placementCode, categoryId],
    queryFn: () =>
      adDisplayApi.getAdsForPlacement({
        placement_code: placementCode,
        category_id: categoryId,
        limit: 5,
      }),
    staleTime: 5 * 60 * 1000, // 5 dakika
  });

  // Get placement info for placeholder (public endpoint)
  const { data: placement, isError: placementError } = useQuery({
    queryKey: ["placement-info", placementCode],
    queryFn: () => adDisplayApi.getPlacementInfo(placementCode),
    staleTime: 10 * 60 * 1000, // 10 dakika
    retry: false, // Don't retry if not found
  });

  const clickMutation = useMutation({
    mutationFn: (campaignId: string) => adDisplayApi.trackClick(campaignId),
  });

  useEffect(() => {
    // Load dismissed ads from localStorage
    const stored = localStorage.getItem(`dismissed_ads_${placementCode}`);
    if (stored) {
      try {
        setDismissedAds(new Set(JSON.parse(stored)));
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, [placementCode]);

  useEffect(() => {
    // Rotate ads every 10 seconds if multiple ads
    if (ads && ads.length > 1) {
      const interval = setInterval(() => {
        setCurrentAdIndex((prev) => (prev + 1) % ads.length);
      }, 10000);
      return () => clearInterval(interval);
    }
  }, [ads]);

  // Show placeholder for admin/teacher if no ads
  if (isLoading) {
    return null;
  }

  if (!ads || ads.length === 0) {
    // Only show placeholder for admin/teacher
    if (!isAdminOrTeacher) {
      return null;
    }
    
    // Show placeholder if placement info is available
    if (placement) {
      // Get pricing info (backend returns pricing summary with all models)
      const pricing = placement.pricing;

      return (
        <AdPlaceholder
          placementCode={placementCode}
          placementName={placement.name}
          placementType={placement.placement_type}
          width={placement.width}
          height={placement.height}
          className={className}
          pricing={pricing}
        />
      );
    }
    // If no placement info (404 or not loaded), show a simple placeholder for admin/teacher
    if (!placementError) {
      // Still loading, don't show yet
      return null;
    }
    // Placement not found or error, show basic placeholder
    return (
      <AdPlaceholder
        placementCode={placementCode}
        placementName="Reklam Alanı"
        placementType="banner"
        className={className}
      />
    );
  }

  // Filter out dismissed ads
  const activeAds = ads.filter((ad) => !dismissedAds.has(ad.campaign_id));
  if (activeAds.length === 0) {
    return null;
  }

  const currentAd = activeAds[currentAdIndex % activeAds.length];

  const handleDismiss = () => {
    setDismissedAds((prev) => {
      const newSet = new Set(prev);
      newSet.add(currentAd.campaign_id);
      localStorage.setItem(`dismissed_ads_${placementCode}`, JSON.stringify(Array.from(newSet)));
      return newSet;
    });
  };

  const handleClick = () => {
    clickMutation.mutate(currentAd.campaign_id);
  };

  // Check if this is an inline placement
  const isInlinePlacement = placementCode === "inline_courses" || placement?.placement_type === "inline";

  if (currentAd.campaign_type === "banner_ad" && currentAd.banner_image_url) {
    // Inline reklamlar için özel render
    if (isInlinePlacement) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-lg overflow-hidden shadow-md ${className}`}
        >
          <button
            onClick={handleDismiss}
            className="absolute top-1 right-1 z-10 p-1.5 bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Kapat"
          >
            <X className="w-3 h-3 text-white" />
          </button>
          {currentAd.banner_link_url ? (
            <Link
              href={currentAd.banner_link_url}
              target={currentAd.banner_link_url.startsWith("http") ? "_blank" : "_self"}
              onClick={handleClick}
              className="block relative w-full h-full"
            >
              <div className="relative w-full" style={{ minHeight: placement?.height ? `${placement.height}px` : "60px", maxHeight: placement?.height ? `${placement.height}px` : "150px" }}>
                <Image
                  src={currentAd.banner_image_url}
                  alt={currentAd.banner_alt_text || "Reklam"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 1200px"
                />
              </div>
            </Link>
          ) : (
            <div className="relative w-full" style={{ minHeight: placement?.height ? `${placement.height}px` : "60px", maxHeight: placement?.height ? `${placement.height}px` : "150px" }}>
              <Image
                src={currentAd.banner_image_url}
                alt={currentAd.banner_alt_text || "Reklam"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
            </div>
          )}
        </motion.div>
      );
    }

    // Normal banner reklamlar
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative rounded-2xl overflow-hidden shadow-lg ${className}`}
      >
        {activeAds.length > 1 && (
          <div className="absolute top-4 right-4 z-10 flex gap-2">
            {activeAds.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === currentAdIndex % activeAds.length ? "bg-white" : "bg-white/50"
                }`}
              />
            ))}
          </div>
        )}
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-10 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        {currentAd.banner_link_url ? (
          <Link
            href={currentAd.banner_link_url}
            target={currentAd.banner_link_url.startsWith("http") ? "_blank" : "_self"}
            onClick={handleClick}
            className="block relative w-full h-full"
          >
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
              <Image
                src={currentAd.banner_image_url}
                alt={currentAd.banner_alt_text || "Reklam"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              {currentAd.banner_link_url.startsWith("http") && (
                <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-lg flex items-center gap-2 text-xs font-semibold text-gray-900">
                  <ExternalLink className="w-3 h-3" />
                  Dış Bağlantı
                </div>
              )}
            </div>
          </Link>
        ) : (
          <div className="relative w-full aspect-[16/9] md:aspect-[21/9]">
            <Image
              src={currentAd.banner_image_url}
              alt={currentAd.banner_alt_text || "Reklam"}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 1200px"
            />
          </div>
        )}
      </motion.div>
    );
  }

  if ((currentAd.campaign_type === "course_promotion" || currentAd.campaign_type === "featured_course") && currentAd.course) {
    // Eğer özel banner görseli varsa, büyük banner olarak göster
    if (currentAd.banner_image_url) {
      return (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`relative rounded-2xl overflow-hidden shadow-2xl group ${className}`}
        >
          {activeAds.length > 1 && (
            <div className="absolute top-4 right-4 z-20 flex gap-2">
              {activeAds.map((_, idx) => (
                <div
                  key={idx}
                  className={`w-2 h-2 rounded-full ${
                    idx === currentAdIndex % activeAds.length ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          )}
          <button
            onClick={handleDismiss}
            className="absolute top-2 right-2 z-20 p-2 bg-black/30 hover:bg-black/50 rounded-full transition-colors backdrop-blur-sm"
            aria-label="Kapat"
          >
            <X className="w-4 h-4 text-white" />
          </button>
          <Link
            href={`/courses/${currentAd.course.slug}`}
            onClick={handleClick}
            className="block relative w-full h-full"
          >
            <div className="relative w-full aspect-[16/9] md:aspect-[21/9] overflow-hidden">
              <Image
                src={currentAd.banner_image_url}
                alt={currentAd.banner_alt_text || currentAd.course.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
                sizes="(max-width: 768px) 100vw, 1200px"
              />
              {/* Gradient overlay for better text readability */}
              <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/50 to-transparent" />
              
              {/* Course info overlay */}
              <div className="absolute inset-0 flex items-center p-6 md:p-12">
                <div className="max-w-2xl">
                  {/* Badge */}
                  <div className="inline-flex items-center gap-2 px-4 py-2 mb-4 bg-gradient-to-r from-amber-400 to-orange-500 rounded-full shadow-lg">
                    <Star className="w-4 h-4 text-white fill-white" />
                    <span className="text-xs font-bold text-white uppercase tracking-wide">
                      {currentAd.campaign_type === "featured_course" ? "ÖNE ÇIKAN KURS" : "KAMPANYALI KURS"}
                    </span>
                  </div>
                  
                  {/* Course title */}
                  <h3 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight drop-shadow-lg">
                    {currentAd.course.title}
                  </h3>
                  
                  {/* Course info (teacher, lessons, description) */}
                  <div className="flex flex-wrap items-center gap-4 mb-4 text-white/90">
                    {currentAd.course.teacher?.full_name && (
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        <span className="text-sm md:text-base font-medium">{currentAd.course.teacher.full_name}</span>
                      </div>
                    )}
                    {currentAd.course.lesson_count !== undefined && currentAd.course.lesson_count > 0 && (
                      <div className="flex items-center gap-2">
                        <BookOpen className="w-4 h-4" />
                        <span className="text-sm md:text-base font-medium">{currentAd.course.lesson_count} Ders</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Description */}
                  {currentAd.course.description && (
                    <p className="text-sm md:text-base text-white/80 mb-4 line-clamp-2 drop-shadow">
                      {currentAd.course.description}
                    </p>
                  )}
                  
                  {/* Price */}
                  <div className="flex items-center gap-3 flex-wrap">
                    {currentAd.course.discount_price ? (
                      <>
                        <span className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
                          {Number(currentAd.course.discount_price).toFixed(2)} TRY
                        </span>
                        <span className="text-lg md:text-2xl text-white/70 line-through drop-shadow">
                          {Number(currentAd.course.price).toFixed(2)} TRY
                        </span>
                        <span className="px-3 py-1 bg-red-500 text-white text-xs md:text-sm font-bold rounded-lg">
                          %{Math.round((1 - Number(currentAd.course.discount_price) / Number(currentAd.course.price)) * 100)} İNDİRİM
                        </span>
                      </>
                    ) : (
                      <span className="text-3xl md:text-5xl font-black text-white drop-shadow-lg">
                        {Number(currentAd.course.price).toFixed(2)} TRY
                      </span>
                    )}
                  </div>
                  
                  {/* CTA Button */}
                  <div className="mt-6">
                    <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 font-bold rounded-xl shadow-xl hover:bg-teal-50 transition-all duration-300 group-hover:scale-105">
                      Kursu İncele
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        </motion.div>
      );
    }
    
    // Banner görseli yoksa, modern kart tasarımı
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`relative bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl overflow-hidden shadow-2xl group ${className}`}
      >
        <button
          onClick={handleDismiss}
          className="absolute top-2 right-2 z-20 p-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full transition-colors"
          aria-label="Kapat"
        >
          <X className="w-4 h-4 text-white" />
        </button>
        <Link
          href={`/courses/${currentAd.course.slug}`}
          onClick={handleClick}
          className="block relative"
        >
          {/* Background pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.3),transparent_50%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_48%,rgba(255,255,255,0.1)_49%,rgba(255,255,255,0.1)_51%,transparent_52%)] bg-[length:40px_40px]" />
          </div>
          
          <div className="relative p-8 md:p-12">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Course thumbnail */}
              {currentAd.course.thumbnail_path && (
                <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-2xl overflow-hidden flex-shrink-0 shadow-2xl ring-4 ring-white/20">
                  <Image
                    src={currentAd.course.thumbnail_path}
                    alt={currentAd.course.title}
                    fill
                    className="object-cover group-hover:scale-110 transition-transform duration-300"
                    sizes="(max-width: 768px) 128px, 160px"
                  />
                </div>
              )}
              
              {/* Course info */}
              <div className="flex-1">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-4 py-2 mb-3 bg-white/20 backdrop-blur-sm rounded-full">
                  <Star className="w-4 h-4 text-white fill-white" />
                  <span className="text-xs font-bold text-white uppercase tracking-wide">
                    {currentAd.campaign_type === "featured_course" ? "ÖNE ÇIKAN KURS" : "KAMPANYALI KURS"}
                  </span>
                </div>
                
                {/* Title */}
                <h3 className="text-2xl md:text-4xl font-black text-white mb-3 leading-tight drop-shadow-lg">
                  {currentAd.course.title}
                </h3>
                
                {/* Course info (teacher, lessons) */}
                <div className="flex flex-wrap items-center gap-4 mb-3 text-white/90">
                  {currentAd.course.teacher?.full_name && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      <span className="text-sm md:text-base font-medium">{currentAd.course.teacher.full_name}</span>
                    </div>
                  )}
                  {currentAd.course.lesson_count !== undefined && currentAd.course.lesson_count > 0 && (
                    <div className="flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      <span className="text-sm md:text-base font-medium">{currentAd.course.lesson_count} Ders</span>
                    </div>
                  )}
                </div>
                
                {/* Description */}
                {currentAd.course.description && (
                  <p className="text-sm md:text-base text-white/80 mb-4 line-clamp-2 drop-shadow">
                    {currentAd.course.description}
                  </p>
                )}
                
                {/* Price */}
                <div className="flex items-center gap-3 flex-wrap">
                  {currentAd.course.discount_price ? (
                    <>
                      <span className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                        {Number(currentAd.course.discount_price).toFixed(2)} TRY
                      </span>
                      <span className="text-lg text-white/80 line-through drop-shadow">
                        {Number(currentAd.course.price).toFixed(2)} TRY
                      </span>
                      <span className="px-3 py-1.5 bg-red-500 text-white text-sm font-bold rounded-lg shadow-lg">
                        %{Math.round((1 - Number(currentAd.course.discount_price) / Number(currentAd.course.price)) * 100)} İNDİRİM
                      </span>
                    </>
                  ) : (
                    <span className="text-3xl md:text-4xl font-black text-white drop-shadow-lg">
                      {Number(currentAd.course.price).toFixed(2)} TRY
                    </span>
                  )}
                </div>
                
                {/* CTA */}
                <div className="mt-6">
                  <span className="inline-flex items-center gap-2 px-6 py-3 bg-white text-teal-600 font-bold rounded-xl shadow-xl hover:bg-teal-50 transition-all duration-300 group-hover:scale-105">
                    Kursu İncele
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        </Link>
      </motion.div>
    );
  }

  return null;
}
