"use client";

/**
 * EPIC-10: Live Lesson Card Component (EP10-FE-03)
 * 
 * Displays live lesson with countdown, join button, and recording playback
 */

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { VideoPlayer } from "./VideoPlayer";

interface LiveLessonCardProps {
  title: string;
  description: string | null;
  liveLessonUrl: string | null;
  liveLessonAt: string | null;  // ISO datetime string
  isEnded: boolean;
  recordingUrl: string | null;
  className?: string;
}

function formatTimeRemaining(targetDate: Date): { days: number; hours: number; minutes: number; seconds: number; isPast: boolean } {
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  
  if (diff <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, isPast: false };
}

function isLiveNow(liveLessonAt: string | null): boolean {
  if (!liveLessonAt) return false;
  const targetDate = new Date(liveLessonAt);
  const now = new Date();
  const diff = targetDate.getTime() - now.getTime();
  // Consider "live" if within 2 hours of start time and not ended
  return diff <= 0 && diff >= -2 * 60 * 60 * 1000;
}

export function LiveLessonCard({
  title,
  description,
  liveLessonUrl,
  liveLessonAt,
  isEnded,
  recordingUrl,
  className,
}: LiveLessonCardProps) {
  const [timeRemaining, setTimeRemaining] = useState<{ days: number; hours: number; minutes: number; seconds: number; isPast: boolean } | null>(null);
  const [isLive, setIsLive] = useState(false);

  useEffect(() => {
    if (!liveLessonAt) return;

    const updateTimer = () => {
      const targetDate = new Date(liveLessonAt);
      const remaining = formatTimeRemaining(targetDate);
      setTimeRemaining(remaining);
      setIsLive(isLiveNow(liveLessonAt) && !isEnded);
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [liveLessonAt, isEnded]);

  const handleJoin = () => {
    if (liveLessonUrl) {
      window.open(liveLessonUrl, "_blank", "noopener,noreferrer");
    }
  };

  const handleAddToCalendar = () => {
    if (!liveLessonAt) return;
    
    const startDate = new Date(liveLessonAt);
    const endDate = new Date(startDate.getTime() + 60 * 60 * 1000); // 1 hour duration
    
    const formatDate = (date: Date) => date.toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
    
    const calendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(title)}&dates=${formatDate(startDate)}/${formatDate(endDate)}&details=${encodeURIComponent(description || "")}&location=${encodeURIComponent(liveLessonUrl || "")}`;
    
    window.open(calendarUrl, "_blank");
  };

  // Ended with recording
  if (isEnded && recordingUrl) {
    return (
      <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 ${className}`}>
        <div className="mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full text-sm font-bold">
              ⏰ GEÇTİ
            </span>
            <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold">
              📹 Kayıt
            </span>
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          {description && <p className="text-gray-700 mb-3">{description}</p>}
          {liveLessonAt && (
            <div className="mb-4 p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-1">📅 Ders Saati:</p>
              <p className="text-base text-gray-900 font-medium">
                {new Date(liveLessonAt).toLocaleString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>
        <VideoPlayer
          videoUrl={null}
          contentUrl={recordingUrl}
          contentPath={null}
          title={title}
          watchedSeconds={0}
        />
      </div>
    );
  }

  // Ended without recording
  if (isEnded && !recordingUrl) {
    return (
      <div className={`bg-gradient-to-br from-gray-50 to-gray-100 border-2 border-gray-200 rounded-xl p-8 ${className}`}>
        <div className="text-center">
          <div className="mb-4">
            <span className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full text-sm font-bold">
              ⏰ GEÇTİ
            </span>
          </div>
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          {liveLessonAt && (
            <div className="mb-4 p-3 bg-white rounded-lg inline-block">
              <p className="text-sm font-semibold text-gray-700 mb-1">📅 Ders Saati:</p>
              <p className="text-base text-gray-900 font-medium">
                {new Date(liveLessonAt).toLocaleString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
          <p className="text-gray-600 mb-2 font-semibold">Canlı ders sona erdi</p>
          <p className="text-sm text-gray-500">Kayıt henüz yüklenmedi</p>
        </div>
      </div>
    );
  }

  // Live now
  if (isLive) {
    return (
      <motion.div
        initial={{ scale: 0.95 }}
        animate={{ scale: 1 }}
        className={`bg-gradient-to-br from-red-50 via-pink-50 to-orange-50 border-2 border-red-300 rounded-xl p-6 ${className}`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <motion.div
              animate={{ opacity: [1, 0.5, 1] }}
              transition={{ repeat: Infinity, duration: 1.5 }}
              className="w-4 h-4 bg-red-600 rounded-full"
            />
            <span className="px-4 py-1.5 bg-red-600 text-white rounded-full text-sm font-bold animate-pulse">
              🔴 CANLI
            </span>
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
        {description && <p className="text-gray-700 mb-3">{description}</p>}
        {liveLessonAt && (
          <div className="mb-4 p-3 bg-white/50 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 mb-1">📅 Ders Saati:</p>
            <p className="text-base text-gray-900 font-medium">
              {new Date(liveLessonAt).toLocaleString("tr-TR", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              })}
            </p>
          </div>
        )}
        <button
          onClick={handleJoin}
          className="w-full px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 hover:from-red-700 hover:to-pink-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          Canlı Derse Katıl
        </button>
      </motion.div>
    );
  }

  // Past (not ended but time passed)
  if (timeRemaining && timeRemaining.isPast && !isEnded) {
    return (
      <div className={`bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-300 rounded-xl p-6 ${className}`}>
        <div className="mb-4">
          <span className="px-4 py-2 bg-orange-500 text-white rounded-full text-sm font-bold mb-3 inline-block">
            ⏰ GEÇTİ
          </span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          {description && <p className="text-gray-700 mb-3">{description}</p>}
          {liveLessonAt && (
            <div className="mb-4 p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-1">📅 Ders Saati:</p>
              <p className="text-base text-gray-900 font-medium">
                {new Date(liveLessonAt).toLocaleString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
          <p className="text-orange-700 font-semibold mb-4">Bu ders zamanı geçti ancak henüz sonlandırılmadı.</p>
          {liveLessonUrl && (
            <button
              onClick={handleJoin}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Derse Katılmayı Dene
            </button>
          )}
        </div>
      </div>
    );
  }

  // Upcoming
  if (timeRemaining && !timeRemaining.isPast) {
    return (
      <div className={`bg-gradient-to-br from-purple-50 to-indigo-50 border-2 border-purple-200 rounded-xl p-6 ${className}`}>
        <div className="mb-4">
          <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-semibold mb-3 inline-block">
            📅 Yaklaşan
          </span>
          <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
          {description && <p className="text-gray-700 mb-3">{description}</p>}
          {liveLessonAt && (
            <div className="mb-4 p-3 bg-white rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-1">📅 Ders Saati:</p>
              <p className="text-base text-gray-900 font-medium">
                {new Date(liveLessonAt).toLocaleString("tr-TR", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          )}
        </div>

        {/* Countdown */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {timeRemaining.days > 0 && (
            <div className="bg-white rounded-lg p-3 text-center border-2 border-purple-200">
              <div className="text-2xl font-bold text-purple-600">{timeRemaining.days}</div>
              <div className="text-xs text-gray-600 mt-1">Gün</div>
            </div>
          )}
          <div className="bg-white rounded-lg p-3 text-center border-2 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{timeRemaining.hours}</div>
            <div className="text-xs text-gray-600 mt-1">Saat</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{timeRemaining.minutes}</div>
            <div className="text-xs text-gray-600 mt-1">Dakika</div>
          </div>
          <div className="bg-white rounded-lg p-3 text-center border-2 border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{timeRemaining.seconds}</div>
            <div className="text-xs text-gray-600 mt-1">Saniye</div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleJoin}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Katıl
          </button>
          <button
            onClick={handleAddToCalendar}
            className="px-4 py-3 bg-white border-2 border-purple-300 text-purple-700 rounded-lg font-semibold hover:bg-purple-50 transition-colors"
            title="Takvime ekle"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
        </div>
      </div>
    );
  }

  // Fallback
  return (
    <div className={`bg-white rounded-lg border-2 border-gray-200 p-6 ${className}`}>
      <h3 className="text-xl font-bold text-gray-900 mb-2">{title}</h3>
      {description && <p className="text-gray-700">{description}</p>}
    </div>
  );
}
