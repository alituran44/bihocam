"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteSettingsApi, type SiteSettingsData } from "@/lib/api";

export default function AdminSettingsEmailPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string | number | boolean>>({});
  const [testEmail, setTestEmail] = useState("");
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => siteSettingsApi.get(),
  });

  useEffect(() => {
    if (settings?.smtp) {
      const smtp = settings.smtp as Record<string, unknown>;
      setFormData({
        host: smtp.host || "",
        port: smtp.port || 587,
        username: smtp.username || "",
        password_encrypted: smtp.password_encrypted === "********" ? "" : (smtp.password_encrypted || ""),
        use_tls: smtp.use_tls ?? true,
        use_ssl: smtp.use_ssl ?? false,
        from_email: smtp.from_email || "",
      });
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<SiteSettingsData>) => siteSettingsApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setTestResult({ success: true, message: "SMTP ayarları başarıyla güncellendi!" });
      setTimeout(() => setTestResult(null), 3000);
    },
  });

  const testMutation = useMutation({
    mutationFn: (to_email: string) =>
      siteSettingsApi.sendTestEmail({
        to_email,
        subject: "BiHocam SMTP Test E-postası",
      }),
    onSuccess: (data) => {
      setTestResult(data);
      setTimeout(() => setTestResult(null), 5000);
    },
    onError: (error: any) => {
      setTestResult({
        success: false,
        message: error?.response?.data?.detail || "Test e-postası gönderilemedi",
      });
      setTimeout(() => setTestResult(null), 5000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Record<string, unknown> = { ...formData };
    if (!payload.password_encrypted) {
      delete payload.password_encrypted;
    }
    updateMutation.mutate({ smtp: payload });
  };

  const handleTestEmail = () => {
    if (!testEmail) {
      setTestResult({ success: false, message: "Lütfen bir e-posta adresi girin" });
      return;
    }
    testMutation.mutate(testEmail);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-gray-600">Yükleniyor...</div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                E-posta Sunucu Ayarları
              </h1>
              <p className="text-teal-100 text-lg">
                SMTP sunucu yapılandırması ve test e-postası gönderimi
              </p>
            </div>
            <div className="hidden md:block">
              <svg className="w-32 h-32 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.945a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {testResult && (
        <div
          className={`border px-6 py-4 rounded-xl shadow-lg ${
            testResult.success
              ? "bg-green-50 border-green-200 text-green-800"
              : "bg-red-50 border-red-200 text-red-800"
          }`}
        >
          {testResult.message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.945a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">SMTP Yapılandırması</h2>
              <p className="text-teal-100 text-sm mt-0.5">E-posta gönderimi için sunucu ayarları</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* SMTP Server */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                SMTP Sunucu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={(formData.host as string) || ""}
                onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="smtp.example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Port <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={(formData.port as number) || 587}
                onChange={(e) => setFormData({ ...formData, port: parseInt(e.target.value) || 587 })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min={1}
                max={65535}
                required
              />
              <p className="text-xs text-gray-500 mt-1">Genellikle 587 (TLS) veya 465 (SSL)</p>
            </div>
          </div>

          {/* Username & Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kullanıcı Adı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={(formData.username as string) || ""}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="user@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Şifre <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={(formData.password_encrypted as string) || ""}
                  onChange={(e) => setFormData({ ...formData, password_encrypted: e.target.value })}
                  className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder={formData.password_encrypted ? "••••••••" : "Yeni şifre girin"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa mevcut şifre korunur</p>
            </div>
          </div>

          {/* From Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gönderen E-posta
            </label>
            <input
              type="email"
              value={(formData.from_email as string) || ""}
              onChange={(e) => setFormData({ ...formData, from_email: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="noreply@example.com"
            />
            <p className="text-xs text-gray-500 mt-1">E-postaların gönderileceği adres</p>
          </div>

          {/* TLS/SSL Options */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={(formData.use_tls as boolean) ?? false}
                onChange={(e) => setFormData({ ...formData, use_tls: e.target.checked })}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
              <div>
                <span className="font-medium text-gray-700">TLS Kullan</span>
                <p className="text-xs text-gray-500">Port 587 için genellikle aktif</p>
              </div>
            </label>

            <label className="flex items-center gap-3 cursor-pointer p-4 border border-gray-300 rounded-lg hover:bg-gray-50">
              <input
                type="checkbox"
                checked={(formData.use_ssl as boolean) ?? false}
                onChange={(e) => setFormData({ ...formData, use_ssl: e.target.checked })}
                className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
              />
              <div>
                <span className="font-medium text-gray-700">SSL Kullan</span>
                <p className="text-xs text-gray-500">Port 465 için genellikle aktif</p>
              </div>
            </label>
          </div>

          {/* Test Email Section */}
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-6 border border-teal-200">
            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Test E-postası Gönder
            </h3>
            <div className="flex items-center gap-4">
              <input
                type="email"
                value={testEmail}
                onChange={(e) => setTestEmail(e.target.value)}
                placeholder="test@example.com"
                className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <button
                type="button"
                onClick={handleTestEmail}
                disabled={testMutation.isPending || !testEmail}
                className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {testMutation.isPending ? "Gönderiliyor..." : "Test Gönder"}
              </button>
            </div>
            <p className="text-xs text-gray-600 mt-3">
              SMTP ayarlarınızı kaydettikten sonra test e-postası gönderebilirsiniz
            </p>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? "Kaydediliyor..." : "SMTP Ayarlarını Kaydet"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
