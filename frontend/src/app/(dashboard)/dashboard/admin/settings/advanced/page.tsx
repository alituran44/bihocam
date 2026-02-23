"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteSettingsApi, type SiteSettingsData } from "@/lib/api";

export default function AdminSettingsAdvancedPage() {
  const queryClient = useQueryClient();
  const [seoData, setSeoData] = useState<Record<string, string>>({});
  const [customCodeData, setCustomCodeData] = useState<Record<string, string>>({});
  const [platformData, setPlatformData] = useState<Record<string, string | number | boolean>>({});
  const [message, setMessage] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => siteSettingsApi.get(),
  });

  useEffect(() => {
    if (settings) {
      if (settings.seo) {
        setSeoData(settings.seo as Record<string, string>);
      }
      if (settings.custom_code) {
        setCustomCodeData(settings.custom_code as Record<string, string>);
      }
      if (settings.platform) {
        setPlatformData(settings.platform as Record<string, string | number | boolean>);
      }
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<SiteSettingsData>) => siteSettingsApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      setMessage("Ayarlar başarıyla güncellendi!");
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      seo: seoData,
      custom_code: customCodeData,
      platform: platformData,
    });
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
                Gelişmiş Ayarlar
              </h1>
              <p className="text-teal-100 text-lg">
                SEO, Analytics kodları, özel HTML/JS ve platform ayarları
              </p>
            </div>
            <div className="hidden md:block">
              <svg className="w-32 h-32 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {message && (
        <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl shadow-lg">
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Platform Settings */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Platform & Finansal Ayarlar</h2>
                <p className="text-teal-100 text-sm mt-0.5">Komisyon oranı, para birimi ve bakım modu</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Platform Komisyon Oranı (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={platformData.platform_commission_rate ? (Number(platformData.platform_commission_rate) * 100).toFixed(2) : ""}
                  onChange={(e) =>
                    setPlatformData({
                      ...platformData,
                      platform_commission_rate: e.target.value ? parseFloat(e.target.value) / 100 : 0,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="35"
                />
                <p className="text-xs text-gray-500 mt-1">Örn: 35 = %35 komisyon</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Para Birimi
                </label>
                <select
                  value={(platformData.currency as string) || "TRY"}
                  onChange={(e) => setPlatformData({ ...platformData, currency: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="TRY">TRY (₺)</option>
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Vergi Oranı (%)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={platformData.tax_rate ? (Number(platformData.tax_rate) * 100).toFixed(2) : ""}
                  onChange={(e) =>
                    setPlatformData({
                      ...platformData,
                      tax_rate: e.target.value ? parseFloat(e.target.value) / 100 : null,
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="20"
                />
                <p className="text-xs text-gray-500 mt-1">Örn: 20 = %20 KDV</p>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={(platformData.maintenance_mode as boolean) ?? false}
                  onChange={(e) => setPlatformData({ ...platformData, maintenance_mode: e.target.checked })}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                />
                <div>
                  <span className="font-medium text-gray-900">Bakım Modu</span>
                  <p className="text-xs text-gray-600 mt-1">
                    Aktif edildiğinde sadece admin kullanıcılar siteye erişebilir
                  </p>
                </div>
              </label>

              {(platformData.maintenance_mode as boolean) && (
                <div className="mt-4 space-y-4 pt-4 border-t border-yellow-300">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Bakım Mesajı
                    </label>
                    <textarea
                      value={(platformData.maintenance_message as string) || ""}
                      onChange={(e) => setPlatformData({ ...platformData, maintenance_message: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      rows={3}
                      placeholder="Site bakım modundadır. Lütfen daha sonra tekrar deneyin."
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Kullanıcılara gösterilecek bakım mesajı
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Tahmini Bitiş Zamanı
                    </label>
                    <input
                      type="datetime-local"
                      value={
                        platformData.maintenance_estimated_end
                          ? new Date(platformData.maintenance_estimated_end as string).toISOString().slice(0, 16)
                          : ""
                      }
                      onChange={(e) => {
                        const dateValue = e.target.value ? new Date(e.target.value).toISOString() : null;
                        setPlatformData({ ...platformData, maintenance_estimated_end: dateValue });
                      }}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Bakımın tahmini bitiş zamanı (opsiyonel)
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEO & Analytics */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">SEO & Analytics</h2>
                <p className="text-teal-100 text-sm mt-0.5">Arama motoru optimizasyonu ve analitik kodları</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Analytics Kodu
              </label>
              <input
                type="text"
                value={seoData.google_analytics_code || ""}
                onChange={(e) => setSeoData({ ...seoData, google_analytics_code: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                placeholder="G-XXXXXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Tag Manager (GTM) Kodu
              </label>
              <input
                type="text"
                value={seoData.gtm_code || ""}
                onChange={(e) => setSeoData({ ...seoData, gtm_code: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                placeholder="GTM-XXXXXXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Google Search Console Kodu
              </label>
              <input
                type="text"
                value={seoData.google_search_console_code || ""}
                onChange={(e) => setSeoData({ ...seoData, google_search_console_code: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                placeholder="google-site-verification=..."
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Bing Webmaster Kodu
                </label>
                <input
                  type="text"
                  value={seoData.bing_webmaster_code || ""}
                  onChange={(e) => setSeoData({ ...seoData, bing_webmaster_code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Yandex Metrica Kodu
                </label>
                <input
                  type="text"
                  value={seoData.yandex_metrica_code || ""}
                  onChange={(e) => setSeoData({ ...seoData, yandex_metrica_code: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Custom Code */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Özel Kod</h2>
                <p className="text-teal-100 text-sm mt-0.5">HTML, CSS ve JavaScript kodları</p>
              </div>
            </div>
          </div>

          <div className="p-8 space-y-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-sm text-red-800 font-medium">
                ⚠️ Dikkat: Yanlış kod girişi siteyi bozabilir. Sadece güvendiğiniz kodları ekleyin.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Head Kodları (HTML)
              </label>
              <textarea
                value={customCodeData.custom_head_html || ""}
                onChange={(e) => setCustomCodeData({ ...customCodeData, custom_head_html: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                placeholder="<!-- Özel head kodları -->"
              />
              <p className="text-xs text-gray-500 mt-1">Sayfa başlığından önce eklenir</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Kodları (HTML)
              </label>
              <textarea
                value={customCodeData.custom_footer_html || ""}
                onChange={(e) => setCustomCodeData({ ...customCodeData, custom_footer_html: e.target.value })}
                rows={8}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                placeholder="<!-- Özel footer kodları -->"
              />
              <p className="text-xs text-gray-500 mt-1">Sayfa sonunda eklenir</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Canlı Destek JS Kodu
              </label>
              <textarea
                value={customCodeData.live_chat_js || ""}
                onChange={(e) => setCustomCodeData({ ...customCodeData, live_chat_js: e.target.value })}
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-mono text-sm"
                placeholder="<script>/* Canlı destek kodu */</script>"
              />
              <p className="text-xs text-gray-500 mt-1">Canlı destek widget'ı için JavaScript kodu</p>
            </div>
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex items-center justify-end gap-4 pt-4">
          <button
            type="submit"
            disabled={updateMutation.isPending}
            className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {updateMutation.isPending ? "Kaydediliyor..." : "Tüm Ayarları Kaydet"}
          </button>
        </div>
      </form>
    </div>
  );
}
