"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { announcementsApi, type SiteAnnouncement } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  info: {
    bg: "bg-blue-50",
    text: "text-blue-800",
    border: "border-blue-200",
  },
  warning: {
    bg: "bg-yellow-50",
    text: "text-yellow-800",
    border: "border-yellow-200",
  },
  maintenance: {
    bg: "bg-red-50",
    text: "text-red-800",
    border: "border-red-200",
  },
};

export default function AnnouncementBanner() {
  const user = useAuthStore((state) => state.user);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Dismissed IDs'leri localStorage'dan yükle
  useEffect(() => {
    const stored = localStorage.getItem("dismissed_announcements");
    if (stored) {
      try {
        setDismissedIds(new Set(JSON.parse(stored)));
      } catch {
        // Ignore parse errors
      }
    }
  }, []);

  // Hedef kitleyi belirle
  // Backend zaten hem target_audience hem de "all" duyurularını döndürüyor
  const targetAudience = user?.role === "admin" ? "admins" : user?.role === "teacher" ? "teachers" : user?.role === "student" ? "students" : "all";

  const { data: announcements } = useQuery({
    queryKey: ["active-announcements", targetAudience, user?.id],
    queryFn: () => announcementsApi.getActive(targetAudience),
    enabled: true, // Her zaman aktif (user yoksa "all" duyuruları gösterilir)
    refetchInterval: 5 * 60 * 1000, // 5 dakikada bir yenile
  });

  const handleDismiss = (id: string) => {
    const newDismissed = new Set(dismissedIds);
    newDismissed.add(id);
    setDismissedIds(newDismissed);
    localStorage.setItem("dismissed_announcements", JSON.stringify(Array.from(newDismissed)));
  };

  if (!announcements || announcements.length === 0) {
    return null;
  }

  // Dismissed olmayanları filtrele
  const visibleAnnouncements = announcements.filter((ann) => !dismissedIds.has(ann.id));

  if (visibleAnnouncements.length === 0) {
    return null;
  }

  // İlk görünür duyuruyu göster (birden fazla varsa carousel yapılabilir)
  const announcement = visibleAnnouncements[0];
  const colors = TYPE_COLORS[announcement.type] || TYPE_COLORS.info;

  return (
    <div
      className={`${colors.bg} ${colors.border} border-b-2 shadow-md relative`}
      style={{ animation: "fadeInDown 0.5s ease-out" }}
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className={`font-bold text-lg ${colors.text}`}>{announcement.title}</h3>
              <span className={`px-2 py-1 rounded text-xs font-semibold ${colors.text} ${colors.bg} border ${colors.border}`}>
                {announcement.type === "info" ? "Bilgi" : announcement.type === "warning" ? "Uyarı" : "Bakım"}
              </span>
            </div>
            <p className={`${colors.text} text-sm leading-relaxed`}>{announcement.message}</p>
          </div>
          {announcement.is_dismissible && (
            <button
              onClick={() => handleDismiss(announcement.id)}
              className={`${colors.text} hover:opacity-70 transition-opacity p-1`}
              aria-label="Duyuruyu kapat"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
