"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { notificationsApi, usersApi, NotificationCreatePayload, type UserSummary } from "@/lib/api";

const NOTIFICATION_TYPES: NotificationCreatePayload["notification_type"][] = [
  "admin_to_teacher",
  "system_announcement",
  "maintenance",
  "org_announcement",
];

const PRIORITIES: NotificationCreatePayload["priority"][] = [
  "low",
  "medium",
  "high",
  "urgent",
];

const ROLES: NonNullable<NotificationCreatePayload["role"]>[] = [
  "student",
  "teacher",
  "organization",
  "admin",
];

export default function AdminNotificationsPage() {
  const { user } = useAuthStore();
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const [form, setForm] = useState<NotificationCreatePayload>({
    notification_type: "system_announcement",
    title: "",
    message: "",
    priority: "medium",
    role: "student",
    delivery_channels: ["in_app"],
    data: null,
    action_url: "",
    action_label: "",
    user_ids: null,
    organization_id: null,
  });

  const [targetMode, setTargetMode] = useState<"role" | "users">("role");
  const [selectedRoleForUsers, setSelectedRoleForUsers] =
    useState<NonNullable<NotificationCreatePayload["role"]>>("student");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [userSearch, setUserSearch] = useState("");

  const {
    data: userList,
    isLoading: usersLoading,
    refetch: refetchUsers,
  } = useQuery<UserSummary[]>({
    queryKey: ["admin-users-selection", selectedRoleForUsers, userSearch],
    queryFn: () =>
      usersApi.list({
        role: selectedRoleForUsers,
        limit: 200,
        search: userSearch || undefined,
      }),
    enabled: targetMode === "users",
  });

  useEffect(() => {
    if (targetMode === "users") {
      refetchUsers();
    }
  }, [targetMode, selectedRoleForUsers, userSearch, refetchUsers]);

  const mutation = useMutation({
    mutationFn: (body: NotificationCreatePayload) => notificationsApi.create(body),
    onSuccess: () => {
      setSuccessMessage("Bildirim başarıyla gönderildi.");
      setErrorMessage(null);
    },
    onError: (err: any) => {
      console.error(err);
      setSuccessMessage(null);
      setErrorMessage("Bildirim gönderilirken bir hata oluştu.");
    },
  });

  if (!user || (user.role !== "admin" && user.role !== "organization" && user.role !== "staff")) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Yetkisiz Erişim</h1>
        <p className="text-sm text-gray-600">
          Bu sayfa sadece yönetici/kurum yetkilileri içindir. Lütfen sistem yöneticinle iletişime geç.
        </p>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMessage(null);
    setErrorMessage(null);
    const payload: NotificationCreatePayload = { ...form };

    if (targetMode === "users") {
      payload.user_ids = selectedUserIds.length ? selectedUserIds : null;
      payload.role = null;
    } else {
      payload.user_ids = null;
    }

    mutation.mutate(payload);
  };

  const toggleChannel = (channel: string) => {
    setForm((prev) => {
      const channels = prev.delivery_channels || [];
      if (channels.includes(channel)) {
        return { ...prev, delivery_channels: channels.filter((c) => c !== channel) };
      }
      return { ...prev, delivery_channels: [...channels, channel] };
    });
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Bildirim Gönder (Admin)</h1>
        <p className="text-sm text-gray-600">
          Öğrencilere, eğitmenlere veya kurum üyelerine sistem içi ve e-posta bildirimleri gönder.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-white border border-gray-200 rounded-2xl p-8 shadow-sm space-y-8"
      >
        <section className="space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-gray-100 p-1 text-xs font-medium">
            <button
              type="button"
              onClick={() => setTargetMode("role")}
              className={`px-3 py-1.5 rounded-full ${
                targetMode === "role" ? "bg-white text-teal-700 shadow-sm" : "text-gray-600"
              }`}
            >
              Role göre gönder
            </button>
            <button
              type="button"
              onClick={() => setTargetMode("users")}
              className={`px-3 py-1.5 rounded-full ${
                targetMode === "users" ? "bg-white text-teal-700 shadow-sm" : "text-gray-600"
              }`}
            >
              Seçili kullanıcılara gönder
            </button>
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          {targetMode === "role" ? (
            <div>
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Hedef Rol
              </label>
              <select
                value={form.role ?? "student"}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, role: e.target.value as any, user_ids: null }))
                }
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
              >
                {ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r === "student"
                      ? "Öğrenciler"
                      : r === "teacher"
                      ? "Eğitmenler"
                      : r === "organization"
                      ? "Kurum Kullanıcıları"
                      : "Adminler"}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-500">
                Seçilen roldeki tüm aktif kullanıcılara gönderilir.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
                Kullanıcı Seç
              </label>
              <div className="flex items-center gap-2 text-xs mb-1">
                {ROLES.map((r) => (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setSelectedRoleForUsers(r)}
                    className={`px-3 py-1.5 rounded-full border ${
                      selectedRoleForUsers === r
                        ? "bg-teal-100 text-teal-700 border-teal-300"
                        : "bg-gray-50 text-gray-600 border-gray-200"
                    }`}
                  >
                    {r === "student"
                      ? "Öğrenciler"
                      : r === "teacher"
                      ? "Eğitmenler"
                      : r === "organization"
                      ? "Kurum"
                      : "Admin"}
                  </button>
                ))}
              </div>
              <input
                type="text"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                placeholder="İsim veya e-posta ile ara"
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
              />
              <div className="mt-2 max-h-52 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 text-xs space-y-1">
                {usersLoading && <div className="text-gray-500 text-xs">Kullanıcılar yükleniyor...</div>}
                {!usersLoading && (!userList || userList.length === 0) && (
                  <div className="text-gray-500 text-xs">Kayıtlı kullanıcı bulunamadı.</div>
                )}
                {!usersLoading &&
                  userList &&
                  userList.map((u) => (
                    <label
                      key={u.id}
                      className="flex items-center gap-2 px-2 py-1 rounded hover:bg-white cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUserIds.includes(u.id)}
                        onChange={() =>
                          setSelectedUserIds((prev) =>
                            prev.includes(u.id)
                              ? prev.filter((id) => id !== u.id)
                              : [...prev, u.id]
                          )
                        }
                        className="w-3.5 h-3.5 text-teal-600 border-teal-300 rounded"
                      />
                      <span className="font-medium text-gray-800 truncate">{u.full_name}</span>
                      <span className="text-[10px] text-gray-500 truncate">{u.email}</span>
                    </label>
                  ))}
              </div>
              <p className="mt-1 text-[11px] text-gray-500">
                Farklı rollerden kullanıcıları karışık seçebilirsin; seçimler rol değiştirdiğinde de
                korunur.
              </p>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Bildirim Tipi
            </label>
            <select
              value={form.notification_type}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  notification_type: e.target.value as NotificationCreatePayload["notification_type"],
                }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
            >
              {NOTIFICATION_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
            <p className="mt-1 text-[11px] text-gray-500">
              Log ve tercih yönetimi için tip seçimi önemlidir.
            </p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Öncelik
            </label>
            <select
              value={form.priority ?? "medium"}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, priority: e.target.value as any }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
            >
              {PRIORITIES.map((p) => (
                <option key={p} value={p}>
                  {p === "low"
                    ? "Düşük"
                    : p === "medium"
                    ? "Normal"
                    : p === "high"
                    ? "Yüksek"
                    : "Acil"}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Kanallar
            </label>
            <div className="flex flex-wrap gap-2">
              {["in_app", "email"].map((channel) => (
                <button
                  key={channel}
                  type="button"
                  onClick={() => toggleChannel(channel)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border ${
                    form.delivery_channels?.includes(channel)
                      ? "bg-teal-100 text-teal-700 border-teal-300"
                      : "bg-gray-50 text-gray-600 border-gray-200"
                  }`}
                >
                  {channel === "in_app" ? "Uygulama içi" : "E-posta"}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Başlık
            </label>
            <input
              type="text"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
              placeholder="Örn: Yeni dönem kampanyası"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Mesaj
            </label>
            <textarea
              value={form.message}
              onChange={(e) => setForm((prev) => ({ ...prev, message: e.target.value }))}
              rows={5}
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
              placeholder="Kısa ama açıklayıcı bir mesaj yaz."
              required
            />
          </div>
        </section>

        <section className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Aksiyon URL (opsiyonel)
            </label>
            <input
              type="url"
              value={form.action_url ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, action_url: e.target.value || null }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
              placeholder="https://... veya /courses/slug"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 uppercase mb-1">
              Aksiyon Buton Metni (opsiyonel)
            </label>
            <input
              type="text"
              value={form.action_label ?? ""}
              onChange={(e) =>
                setForm((prev) => ({ ...prev, action_label: e.target.value || null }))
              }
              className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-500"
              placeholder="Örn: Detaylara git"
            />
          </div>
        </section>

        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <div className="text-xs text-gray-500">
            Gönderilen bildirimler kullanıcıların bildirim tercihleri ve sessiz saat ayarlarına
            saygı duyar.
          </div>
          <button
            type="submit"
            disabled={mutation.isLoading}
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 transition-all"
          >
            {mutation.isLoading ? "Gönderiliyor..." : "Bildirim Gönder"}
          </button>
        </div>

        {(successMessage || errorMessage) && (
          <div className="pt-2">
            {successMessage && (
              <div className="text-xs font-medium text-emerald-600">{successMessage}</div>
            )}
            {errorMessage && (
              <div className="text-xs font-medium text-red-600">{errorMessage}</div>
            )}
          </div>
        )}
      </form>
    </div>
  );
}

