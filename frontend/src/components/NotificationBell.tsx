"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, Notification } from "@/lib/api";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const { data: unreadData } = useQuery({
    queryKey: ["notifications", "unread-count"],
    queryFn: () => notificationsApi.getUnreadCount(),
    refetchInterval: 30000,
  });

  const { data: listData, isLoading } = useQuery({
    queryKey: ["notifications", { limit: 10 }],
    queryFn: () => notificationsApi.list({ skip: 0, limit: 10 }),
    enabled: open,
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationsApi.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationsApi.markAllAsRead(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const totalUnread = unreadData?.total ?? 0;
  const notifications: Notification[] = listData?.notifications ?? [];

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Bildirimler"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {totalUnread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-[10px] font-bold text-white rounded-full flex items-center justify-center">
            {totalUnread > 9 ? "9+" : totalUnread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-50">
          <div className="px-4 py-2 flex items-center justify-between border-b border-gray-100">
            <span className="text-sm font-semibold text-gray-900">Bildirimler</span>
            {totalUnread > 0 && (
              <button
                onClick={() => {
                  markAllAsReadMutation.mutate();
                }}
                className="text-[11px] font-medium text-teal-600 hover:text-teal-700"
              >
                Tümünü okundu işaretle
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-4 text-sm text-gray-500">Yükleniyor...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-6 text-sm text-gray-500 text-center">
                Henüz bildiriminiz yok.
              </div>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markAsReadMutation.mutate(n.id)}
                  className={`w-full text-left px-4 py-3 flex items-start gap-3 hover:bg-gray-50 transition-colors ${
                    !n.is_read ? "bg-teal-50/40" : ""
                  }`}
                >
                  <div className="mt-0.5">
                    <span
                      className={`w-2 h-2 rounded-full inline-block ${
                        n.is_read ? "bg-gray-300" : "bg-teal-500"
                      }`}
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-0.5">
                      <p className="text-xs font-semibold text-gray-800 truncate">
                        {n.title}
                      </p>
                    </div>
                    <p className="text-xs text-gray-600 line-clamp-2">{n.message}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

