"use client";

import { useState, useEffect } from "react";
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

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-gray-500">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-gray-700 via-gray-800 to-gray-900 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-10">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-white/20 flex items-center justify-center text-white text-2xl font-bold">
              {user?.full_name?.charAt(0)?.toUpperCase() || "?"}
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white tracking-tight">Hesap Ayarları</h1>
              <p className="text-gray-300">{user?.email}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm border border-emerald-200">
          ✅ {message}
        </div>
      )}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">
          ❌ {error}
        </div>
      )}

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-4">
          {[
            { key: "profile" as const, label: "Profil", icon: "👤" },
            { key: "password" as const, label: "Şifre", icon: "🔒" },
            { key: "notifications" as const, label: "Bildirimler", icon: "🔔" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setMessage(null); setError(null); }}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.key
                  ? "border-teal-600 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Profile Tab */}
      {activeTab === "profile" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg space-y-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900">Profil Bilgileri</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Ad Soyad</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">E-posta</label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="w-full px-4 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500"
            />
            <p className="text-xs text-gray-500 mt-1">E-posta adresi değiştirilemez</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Telefon</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+90 5XX XXX XX XX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hakkında</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              placeholder="Kendinizi kısaca tanıtın..."
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="flex items-center gap-4 pt-2">
            <button
              onClick={() => updateProfileMutation.mutate()}
              disabled={updateProfileMutation.isLoading}
              className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
            >
              {updateProfileMutation.isLoading ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <div className="text-sm text-gray-500">
              Rol: <span className="font-medium text-gray-700 capitalize">{user?.role}</span>
            </div>
          </div>
        </div>
      )}

      {/* Password Tab */}
      {activeTab === "password" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg space-y-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900">Şifre Değiştir</h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Mevcut Şifre</label>
            <input
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            <p className="text-xs text-gray-500 mt-1">En az 8 karakter</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Yeni Şifre (Tekrar)</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Şifreler eşleşmiyor</p>
            )}
          </div>

          <button
            onClick={() => changePasswordMutation.mutate()}
            disabled={!currentPassword || !newPassword || !confirmPassword || changePasswordMutation.isLoading}
            className="px-6 py-2.5 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 transition-colors"
          >
            {changePasswordMutation.isLoading ? "Değiştiriliyor..." : "Şifreyi Değiştir"}
          </button>
        </div>
      )}

      {/* Notifications Tab */}
      {activeTab === "notifications" && (
        <div className="bg-white rounded-2xl border border-gray-200 p-6 shadow-lg space-y-6 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-900">Bildirim Tercihleri</h2>
          <p className="text-sm text-gray-600">Hangi durumlarda bildirim almak istediğinizi seçin.</p>

          <div className="space-y-4">
            {[
              { key: "email_on_new_enrollment", label: "Yeni kayıt olduğunda e-posta", desc: "Bir öğrenci kursunuza kayıt olduğunda" },
              { key: "email_on_new_review", label: "Yeni yorum geldiğinde e-posta", desc: "Kursunuza yeni bir yorum yazıldığında" },
              { key: "email_on_new_sale", label: "Yeni satış olduğunda e-posta", desc: "Kursunuz satıldığında" },
              { key: "push_notifications", label: "Push bildirimleri", desc: "Tarayıcı bildirimleri alın" },
              { key: "email_marketing", label: "Pazarlama e-postaları", desc: "Kampanya ve duyurular hakkında bilgi alın" },
            ].map((pref) => (
              <div key={pref.key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
                <div>
                  <div className="text-sm font-medium text-gray-900">{pref.label}</div>
                  <div className="text-xs text-gray-500">{pref.desc}</div>
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
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-teal-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-teal-600"></div>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
