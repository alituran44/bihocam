"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { notificationsApi, usersApi, type Notification, type UserSummary } from "@/lib/api";
import Avatar from "@/components/Avatar";

export default function AdminNotificationLogsPage() {
  const [filter, setFilter] = useState<{
    notification_type?: string;
    priority?: string;
    sender_id?: string;
    user_id?: string;
  }>({});

  const [page, setPage] = useState(0);
  const limit = 50;

  // Tüm bildirimleri çek
  const { data: allNotifications, isLoading } = useQuery({
    queryKey: ["admin-notification-logs", filter, page],
    queryFn: () =>
      notificationsApi.listAll(
        page * limit,
        limit,
        filter.notification_type,
        filter.priority
      ),
  });

  // Gönderenleri çek (filtre için) - sadece ilk 100 bildirimden
  const { data: senders } = useQuery({
    queryKey: ["admin-notification-senders"],
    queryFn: async () => {
      try {
        const notifications = await notificationsApi.listAll(0, 100);
        const senderIds = new Set(
          notifications
            .map((n) => n.sender_id)
            .filter((id): id is string => !!id)
        );
        const users = await Promise.all(
          Array.from(senderIds).slice(0, 20).map((id) => usersApi.get(id).catch(() => null))
        );
        return users.filter((u): u is NonNullable<typeof u> => u !== null);
      } catch {
        return [];
      }
    },
  });

  // Alıcıları çek (filtre için) - sadece ilk 100 bildirimden
  const { data: receivers } = useQuery({
    queryKey: ["admin-notification-receivers"],
    queryFn: async () => {
      try {
        const notifications = await notificationsApi.listAll(0, 100);
        const receiverIds = new Set(notifications.map((n) => n.user_id));
        const users = await Promise.all(
          Array.from(receiverIds).slice(0, 20).map((id) => usersApi.get(id).catch(() => null))
        );
        return users.filter((u): u is NonNullable<typeof u> => u !== null);
      } catch {
        return [];
      }
    },
  });

  const getNotificationTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      course_update: "Kurs Güncelleme",
      new_lesson: "Yeni Ders",
      course_announcement: "Kurs Duyurusu",
      org_announcement: "Kurum Duyurusu",
      admin_to_teacher: "Admin → Eğitmen",
      system_announcement: "Sistem Duyurusu",
      maintenance: "Bakım",
      order_confirmed: "Sipariş Onaylandı",
      payment_success: "Ödeme Başarılı",
      course_submitted: "Kurs Gönderildi",
      course_approved: "Kurs Onaylandı",
      course_rejected: "Kurs Reddedildi",
      password_reset: "Şifre Sıfırlama",
      bank_account_pending: "Banka Hesabı Beklemede",
      bank_account_approved: "Banka Hesabı Onaylandı",
      bank_account_rejected: "Banka Hesabı Reddedildi",
      withdrawal_request_created: "Çekim Talebi Oluşturuldu",
      withdrawal_approved: "Çekim Onaylandı",
      withdrawal_rejected: "Çekim Reddedildi",
    };
    return labels[type] || type;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "urgent":
        return "from-red-500 to-red-600";
      case "high":
        return "from-orange-500 to-orange-600";
      case "medium":
        return "from-amber-500 to-amber-600";
      case "low":
        return "from-blue-500 to-blue-600";
      default:
        return "from-gray-500 to-gray-600";
    }
  };

  const getPriorityLabel = (priority: string) => {
    const labels: Record<string, string> = {
      urgent: "Acil",
      high: "Yüksek",
      medium: "Normal",
      low: "Düşük",
    };
    return labels[priority] || priority;
  };

  const filteredNotifications = allNotifications?.filter((n) => {
    if (filter.sender_id && n.sender_id !== filter.sender_id) return false;
    if (filter.user_id && n.user_id !== filter.user_id) return false;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 rounded-3xl shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Bildirim Logları</h1>
              <p className="text-teal-100 text-lg">Sistemdeki tüm bildirimleri görüntüle ve takip et</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filtreler */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50">
        <div className="flex items-center gap-3 mb-6">
          <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
          </svg>
          <h2 className="text-lg font-bold text-gray-900">Filtreler</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Bildirim Tipi</label>
            <select
              value={filter.notification_type || ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  notification_type: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
            >
              <option value="">Tümü</option>
              <option value="course_update">Kurs Güncelleme</option>
              <option value="new_lesson">Yeni Ders</option>
              <option value="course_announcement">Kurs Duyurusu</option>
              <option value="admin_to_teacher">Admin → Eğitmen</option>
              <option value="system_announcement">Sistem Duyurusu</option>
              <option value="order_confirmed">Sipariş Onaylandı</option>
              <option value="course_approved">Kurs Onaylandı</option>
              <option value="bank_account_approved">Banka Hesabı Onaylandı</option>
              <option value="withdrawal_approved">Çekim Onaylandı</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Öncelik</label>
            <select
              value={filter.priority || ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  priority: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
            >
              <option value="">Tümü</option>
              <option value="urgent">Acil</option>
              <option value="high">Yüksek</option>
              <option value="medium">Normal</option>
              <option value="low">Düşük</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Gönderen</label>
            <select
              value={filter.sender_id || ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  sender_id: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
            >
              <option value="">Tümü</option>
              <option value="system">Sistem</option>
              {senders?.map((sender) => (
                <option key={sender.id} value={sender.id}>
                  {sender.full_name} ({sender.email})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Alıcı</label>
            <select
              value={filter.user_id || ""}
              onChange={(e) =>
                setFilter((prev) => ({
                  ...prev,
                  user_id: e.target.value || undefined,
                }))
              }
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
            >
              <option value="">Tümü</option>
              {receivers?.map((receiver) => (
                <option key={receiver.id} value={receiver.id}>
                  {receiver.full_name} ({receiver.email})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Bildirim Listesi */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/50">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-gray-900">
              Bildirimler ({filteredNotifications.length})
            </h2>
          </div>
        </div>

        {isLoading ? (
          <div className="p-6 space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center">
            <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>
            <p className="text-gray-600 text-lg">Bildirim bulunamadı.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {filteredNotifications.map((notification: Notification) => {
              const sender = senders?.find((s) => s.id === notification.sender_id);
              const receiver = receivers?.find((r) => r.id === notification.user_id);

              return (
                <div
                  key={notification.id}
                  className={`p-6 hover:bg-gray-50/50 transition-colors ${
                    !notification.is_read ? "bg-teal-50/30" : ""
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {/* Gönderen Avatar */}
                    <div className="flex-shrink-0">
                      {notification.sender_id && sender ? (
                        <Avatar
                          src={sender.avatar_url}
                          name={sender.full_name}
                          size="md"
                          className="ring-2 ring-teal-500/20"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-400 to-gray-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* İçerik */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-gray-900">{notification.title}</h3>
                            <span
                              className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getPriorityColor(
                                notification.priority
                              )} text-white shadow-sm`}
                            >
                              {getPriorityLabel(notification.priority)}
                            </span>
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              {getNotificationTypeLabel(notification.notification_type)}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-3">{notification.message}</p>
                        </div>
                        <div className="flex-shrink-0 text-right">
                          <div className="text-xs text-gray-500 font-medium">
                            {new Date(notification.created_at).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </div>
                          {notification.is_read && notification.read_at && (
                            <div className="text-xs text-gray-400 mt-1">
                              {new Date(notification.read_at).toLocaleDateString("tr-TR", {
                                day: "numeric",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Gönderen/Alıcı Bilgisi */}
                      <div className="flex items-center gap-4 text-xs text-gray-600 mb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Gönderen:</span>
                          {notification.sender_id && sender ? (
                            <Link
                              href={`/dashboard/admin/users/${sender.id}`}
                              className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                              {sender.full_name} ({sender.email})
                            </Link>
                          ) : (
                            <span className="text-gray-500">Sistem</span>
                          )}
                        </div>
                        <span>→</span>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-700">Alıcı:</span>
                          {receiver ? (
                            <Link
                              href={`/dashboard/admin/users/${receiver.id}`}
                              className="text-teal-600 hover:text-teal-700 font-medium"
                            >
                              {receiver.full_name} ({receiver.email})
                            </Link>
                          ) : (
                            <span className="text-gray-500">Bilinmiyor</span>
                          )}
                        </div>
                      </div>

                      {/* Ek Bilgiler */}
                      {notification.action_url && (
                        <div className="mt-3">
                          <Link
                            href={notification.action_url}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-teal-600 hover:text-teal-700"
                          >
                            {notification.action_label || "Detaya Git"}
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                            </svg>
                          </Link>
                        </div>
                      )}
                    </div>

                    {/* Durum İkonu */}
                    <div className="flex-shrink-0">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          notification.is_read ? "bg-gray-300" : "bg-teal-500"
                        }`}
                        title={notification.is_read ? "Okundu" : "Okunmadı"}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
