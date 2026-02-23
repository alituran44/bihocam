"use client";

import { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { authApi, notificationsApi, api } from "@/lib/api";

interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  phone?: string | null;
  avatar_url?: string | null;
  bio?: string | null;
  role: string;
  is_active: boolean;
  created_at: string;
}

export default function SettingsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"profile" | "password" | "notifications">("profile");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Profile form state
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");

  // Password form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const { data: user, isLoading } = useQuery<UserProfile>({
    queryKey: ["me"],
    queryFn: () => authApi.getMe(),
  });

  const { data: notifPrefs } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => notificationsApi.getPreferences(),
  });

  useEffect(() => {
    if (user) {
      setFullName(user.full_name || "");
      setPhone(user.phone || "");
      setBio(user.bio || "");
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.put("/auth/me", {
        full_name: fullName,
        phone: phone || null,
        bio: bio || null,
      });
      return data;
    },
    onSuccess: () => {
      setMessage("Profil başarıyla güncellendi!");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
    onError: () => {
      setError("Profil güncellenirken bir hata oluştu");
      setMessage(null);
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: async () => {
      if (newPassword !== confirmPassword) throw new Error("Şifreler eşleşmiyor");
      if (newPassword.length < 8) throw new Error("Şifre en az 8 karakter olmalıdır");
      const { data } = await api.put("/auth/me/password", {
        current_password: currentPassword,
        new_password: newPassword,
      });
      return data;
    },
    onSuccess: () => {
      setMessage("Şifre başarıyla değiştirildi!");
      setError(null);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    },
    onError: (err: Error) => {
      setError(err.message || "Şifre değiştirilirken bir hata oluştu");
      setMessage(null);
    },
  });

  const updateNotifPrefsMutation = useMutation({
    mutationFn: async (prefs: Record<string, boolean>) => {
      return notificationsApi.updatePreferences(prefs);
    },
    onSuccess: () => {
      setMessage("Bildirim tercihleri güncellendi!");
      setError(null);
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    },
    onError: () => {
      setError("Bildirim tercihleri güncellenirken bir hata oluştu");
      setMessage(null);
    },
  });

  // Role-based notification preferences
  const notificationOptions = useMemo(() => {
    const isTeacher = user?.role === "teacher";
    const isAdmin = user?.role === "admin" || user?.role === "staff";

    const common = [
      { key: "push_notifications", label: "Push bildirimleri", desc: "Tarayıcı üzerinden anlık bildirimler alın" },
      { key: "email_marketing", label: "Pazarlama e-postaları", desc: "Kampanya ve duyurular hakkında bilgi alın" },
    ];

    const studentPrefs = [
      { key: "email_on_course_update", label: "Kurs güncellemelerinde e-posta", desc: "Kayıtlı olduğunuz kursa yeni içerik eklendiğinde" },
      { key: "email_on_announcement", label: "Duyurularda e-posta", desc: "Platform duyuruları ve haberler hakkında" },
    ];

    const teacherPrefs = [
      { key: "email_on_new_enrollment", label: "Yeni kayıtta e-posta", desc: "Bir öğrenci kursunuza kayıt olduğunda" },
      { key: "email_on_new_review", label: "Yeni yorumda e-posta", desc: "Kursunuza yeni bir yorum yazıldığında" },
      { key: "email_on_new_sale", label: "Yeni satışta e-posta", desc: "Kursunuz satıldığında bildirim alın" },
    ];

    const adminPrefs = [
      { key: "email_on_new_enrollment", label: "Yeni kayıtta e-posta", desc: "Platforma yeni bir kayıt olduğunda" },
      { key: "email_on_new_review", label: "Yeni yorumda e-posta", desc: "Onay bekleyen yeni bir yorum geldiğinde" },
      { key: "email_on_new_sale", label: "Yeni satışta e-posta", desc: "Platformda yeni bir satış gerçekleştiğinde" },
      { key: "email_on_withdrawal_request", label: "Çekim talebinde e-posta", desc: "Eğitmen yeni bir çekim talebi oluşturduğunda" },
    ];

    if (isAdmin) return [...adminPrefs, ...common];
    if (isTeacher) return [...teacherPrefs, ...common];
    return [...studentPrefs, ...common];
  }, [user?.role]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-pulse text-gray-400">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-full bg-white/20 backdrop-blur-sm border-2 border-white/30 flex items-center justify-center text-white text-3xl font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-2 tracking-tight">
                Hesap Ayarları
              </h1>
              <p className="text-teal-100 text-lg">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 text-emerald-700 text-sm font-medium">
          {message}
        </div>
      )}
      {error && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4 border border-red-200 text-red-700 text-sm font-medium">
          {error}
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="border-b border-gray-200 px-6">
          <nav className="flex gap-6">
            {[
              { key: "profile" as const, label: "Profil Bilgileri" },
              { key: "password" as const, label: "Şifre Değiştir" },
              { key: "notifications" as const, label: "Bildirim Tercihleri" },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => { setActiveTab(tab.key); setMessage(null); setError(null); }}
                className={`py-4 text-sm font-semibold border-b-2 transition-colors ${
                  activeTab === tab.key
                    ? "border-teal-600 text-teal-700"
                    : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6 md:p-8">
          {/* Profile Tab */}
          {activeTab === "profile" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Ad Soyad</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">E-posta</label>
                <input
                  type="email"
                  value={user?.email || ""}
                  disabled
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-500 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">E-posta adresi değiştirilemez</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Telefon</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+90 5XX XXX XX XX"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Hakkında</label>
                <textarea
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={4}
                  placeholder="Kendinizi kısaca tanıtın..."
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                />
              </div>

              <div className="flex items-center gap-4 pt-2">
                <button
                  onClick={() => updateProfileMutation.mutate()}
                  disabled={updateProfileMutation.isPending}
                  className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
                >
                  {updateProfileMutation.isPending ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
                <div className="text-sm text-gray-500">
                  Rol: <span className="font-semibold text-teal-700 capitalize">{user?.role}</span>
                </div>
              </div>
            </div>
          )}

          {/* Password Tab */}
          {activeTab === "password" && (
            <div className="max-w-2xl space-y-6">
              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Mevcut Şifre</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                />
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Yeni Şifre</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">En az 8 karakter</p>
              </div>

              <div>
                <label className="text-sm font-semibold text-gray-700 mb-1 block">Yeni Şifre (Tekrar)</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
                />
                {confirmPassword && newPassword !== confirmPassword && (
                  <p className="text-xs text-red-500 mt-1 font-medium">Şifreler eşleşmiyor</p>
                )}
              </div>

              <button
                onClick={() => changePasswordMutation.mutate()}
                disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isPending}
                className="px-6 py-2.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-semibold rounded-xl hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 transition-all shadow-lg hover:shadow-xl"
              >
                {changePasswordMutation.isPending ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
              </button>
            </div>
          )}

          {/* Notifications Tab */}
          {activeTab === "notifications" && (
            <div className="max-w-2xl space-y-1">
              {notificationOptions.map((pref, index) => (
                <div
                  key={pref.key}
                  className="flex items-center justify-between py-4 border-b border-gray-100 last:border-0"
                  style={{ animation: `fadeInUp 0.3s ease-out ${index * 30}ms forwards` }}
                >
                  <div>
                    <div className="text-sm font-semibold text-gray-900">{pref.label}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{pref.desc}</div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={(notifPrefs as Record<string, boolean>)?.[pref.key] ?? true}
                      onChange={(e) => {
                        updateNotifPrefsMutation.mutate({ [pref.key]: e.target.checked });
                      }}
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300/50 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                  </label>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
