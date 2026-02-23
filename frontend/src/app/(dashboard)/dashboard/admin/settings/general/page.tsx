"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteSettingsApi, type SiteSettingsData } from "@/lib/api";

export default function AdminSettingsGeneralPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [message, setMessage] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => siteSettingsApi.get(),
  });

  useEffect(() => {
    if (settings?.general) {
      setFormData(settings.general as Record<string, string>);
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
    updateMutation.mutate({ general: formData });
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
                Genel Site Ayarları
              </h1>
              <p className="text-teal-100 text-lg">
                Site başlığı, logo, iletişim bilgileri ve diğer genel ayarları yönetin
              </p>
            </div>
            <div className="hidden md:block">
              <svg className="w-32 h-32 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
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

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 px-8 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Genel Bilgiler</h2>
              <p className="text-teal-100 text-sm mt-0.5">Site kimliği ve temel bilgiler</p>
            </div>
          </div>
        </div>

        <div className="p-8 space-y-6">
          {/* Site Title & URL */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Başlığı <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.site_title || ""}
                onChange={(e) => setFormData({ ...formData, site_title: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site URL <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={formData.site_url || ""}
                onChange={(e) => setFormData({ ...formData, site_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="https://example.com"
                required
              />
            </div>
          </div>

          {/* Meta Description & Keywords */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Açıklama
              </label>
              <textarea
                value={formData.meta_description || ""}
                onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                rows={4}
                maxLength={160}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Site açıklaması (SEO için önemli)"
              />
              <p className="text-xs text-gray-500 mt-1">
                {formData.meta_description?.length || 0}/160 karakter
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Meta Anahtar Kelimeler
              </label>
              <input
                type="text"
                value={formData.meta_keywords || ""}
                onChange={(e) => setFormData({ ...formData, meta_keywords: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="kelime1, kelime2, kelime3"
              />
              <p className="text-xs text-gray-500 mt-1">Virgülle ayrılmış anahtar kelimeler</p>
            </div>
          </div>

          {/* Site Author & Footer */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site Yazarı
              </label>
              <input
                type="text"
                value={formData.site_author || ""}
                onChange={(e) => setFormData({ ...formData, site_author: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Footer Yazısı
              </label>
              <input
                type="text"
                value={formData.footer_text || ""}
                onChange={(e) => setFormData({ ...formData, footer_text: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="© 2025 BiHocam. Tüm hakları saklıdır."
              />
            </div>
          </div>

          {/* Logo & Favicon */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Logo URL
              </label>
              <input
                type="url"
                value={formData.logo_url || ""}
                onChange={(e) => setFormData({ ...formData, logo_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="https://example.com/logo.png"
              />
              {formData.logo_url && (
                <div className="mt-3">
                  <img src={formData.logo_url} alt="Logo Preview" className="h-16 object-contain" />
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Favicon URL
              </label>
              <input
                type="url"
                value={formData.favicon_url || ""}
                onChange={(e) => setFormData({ ...formData, favicon_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="https://example.com/favicon.ico"
              />
              {formData.favicon_url && (
                <div className="mt-3">
                  <img src={formData.favicon_url} alt="Favicon Preview" className="h-8 w-8 object-contain" />
                </div>
              )}
            </div>
          </div>

          {/* Contact Info */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İletişim E-posta
              </label>
              <input
                type="email"
                value={formData.contact_email || ""}
                onChange={(e) => setFormData({ ...formData, contact_email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="info@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                İletişim Telefonu
              </label>
              <input
                type="tel"
                value={formData.contact_phone || ""}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="+90 212 000 00 00"
              />
            </div>
          </div>

          {/* Submit Button */}
          <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
            <button
              type="submit"
              disabled={updateMutation.isPending}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {updateMutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
