"use client";

import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { popupAnnouncementsApi, PopupAnnouncement } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

const DISMISSED_POPUPS_KEY = "dismissed_popups";
const SHOWN_POPUPS_ONCE_KEY = "shown_popups_once";
const POPUP_DISMISSED_UNTIL_PREFIX = "popup_dismissed_until_";

interface UsePopupAnnouncementReturn {
  activePopup: PopupAnnouncement | null;
  dismissPopup: (popupId: string, dontShowAgain: boolean) => void;
  isLoading: boolean;
  error: Error | null;
}

export function usePopupAnnouncement(): UsePopupAnnouncementReturn {
  const user = useAuthStore((state) => state.user);
  const [dismissedIds, setDismissedIds] = useState<string[]>([]);

  // Load dismissed popups from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;

    const dismissed = localStorage.getItem(DISMISSED_POPUPS_KEY);
    if (dismissed) {
      try {
        const parsed = JSON.parse(dismissed);
        setDismissedIds(Array.isArray(parsed) ? parsed : []);
      } catch {
        setDismissedIds([]);
      }
    }

    // Check for expired dismissals
    const dismissedUntilKeys = Object.keys(localStorage).filter((key) =>
      key.startsWith(POPUP_DISMISSED_UNTIL_PREFIX)
    );

    const now = Date.now();
    dismissedUntilKeys.forEach((key) => {
      const timestamp = parseInt(localStorage.getItem(key) || "0", 10);
      if (timestamp < now) {
        localStorage.removeItem(key);
      }
    });
  }, []);

  // Get user role for targeting
  const targetAudience = user?.role
    ? user.role === "student"
      ? "students"
      : user.role === "teacher"
      ? "teachers"
      : user.role === "admin" || user.role === "staff"
      ? "admins"
      : undefined
    : undefined;

  // Fetch active popup
  const { data: activePopup, isLoading, error } = useQuery({
    queryKey: ["popup-announcement", targetAudience, dismissedIds.join(",")],
    queryFn: async () => {
      const dismissedIdsStr = dismissedIds.length > 0 ? dismissedIds.join(",") : undefined;
      return popupAnnouncementsApi.getActive({
        target_audience: targetAudience,
        dismissed_ids: dismissedIdsStr,
      });
    },
    enabled: true,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  // Check if popup should be shown (show_once_per_user check)
  const shouldShowPopup = useCallback(
    (popup: PopupAnnouncement | null): boolean => {
      if (!popup) return false;

      // 1. Check temporary dismiss duration
      const dismissedUntilKey = `${POPUP_DISMISSED_UNTIL_PREFIX}${popup.id}`;
      const dismissedUntil = typeof window !== "undefined" ? localStorage.getItem(dismissedUntilKey) : null;
      if (dismissedUntil) {
        const timestamp = parseInt(dismissedUntil, 10);
        if (Date.now() < timestamp) {
          return false; // Still in dismiss period
        }
      }

      // 2. Check if permanently dismissed
      if (dismissedIds.includes(popup.id)) {
        return false;
      }

      // 3. Check show_once_per_user
      if (popup.show_once_per_user && typeof window !== "undefined") {
        const shownOnce = localStorage.getItem(SHOWN_POPUPS_ONCE_KEY);
        if (shownOnce) {
          try {
            const parsed = JSON.parse(shownOnce);
            if (Array.isArray(parsed) && parsed.includes(popup.id)) {
              return false; // Already shown once
            }
          } catch {
            // Invalid data, ignore
          }
        }
      }

      return true;
    },
    [dismissedIds]
  );

  const dismissPopup = useCallback(
    (popupId: string, dontShowAgain: boolean) => {
      if (typeof window === "undefined") return;

      if (dontShowAgain) {
        // Permanently dismiss
        setDismissedIds((prev) => {
          const updated = [...prev, popupId];
          localStorage.setItem(DISMISSED_POPUPS_KEY, JSON.stringify(updated));
          return updated;
        });
      } else {
        // Temporary dismiss (check dismiss_duration_days)
        const popup = activePopup;
        if (popup && popup.dismiss_duration_days) {
          const dismissedUntil = Date.now() + popup.dismiss_duration_days * 24 * 60 * 60 * 1000;
          localStorage.setItem(
            `${POPUP_DISMISSED_UNTIL_PREFIX}${popupId}`,
            dismissedUntil.toString()
          );
        } else {
          // No duration specified, dismiss permanently
          setDismissedIds((prev) => {
            const updated = [...prev, popupId];
            localStorage.setItem(DISMISSED_POPUPS_KEY, JSON.stringify(updated));
            return updated;
          });
        }
      }

      // Mark as shown once if show_once_per_user
      const currentPopup = activePopup;
      if (currentPopup && currentPopup.show_once_per_user) {
        const shownOnce = localStorage.getItem(SHOWN_POPUPS_ONCE_KEY);
        let parsed: string[] = [];
        if (shownOnce) {
          try {
            parsed = JSON.parse(shownOnce);
            if (!Array.isArray(parsed)) parsed = [];
          } catch {
            parsed = [];
          }
        }
        if (!parsed.includes(popupId)) {
          parsed.push(popupId);
          localStorage.setItem(SHOWN_POPUPS_ONCE_KEY, JSON.stringify(parsed));
        }
      }
    },
    [activePopup]
  );

  const popupToShow = shouldShowPopup(activePopup) ? activePopup : null;

  return {
    activePopup: popupToShow,
    dismissPopup,
    isLoading,
    error: error as Error | null,
  };
}
