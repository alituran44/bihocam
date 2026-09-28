"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { siteSettingsApi, type SiteSettingsData } from "@/lib/api";
import { DEFAULT_MARQUEE_ITEMS, renderMarqueeIcon, type MarqueeItem } from "@/components/home/HeroWaveRibbon";
import { Sparkles, Plus, Trash2, ArrowUp, ArrowDown, RotateCcw } from "lucide-react";

export default function AdminSettingsGeneralPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [platformData, setPlatformData] = useState<Record<string, any>>({});
  const [marqueeItems, setMarqueeItems] = useState<MarqueeItem[]>([]);
  const [message, setMessage] = useState<string | null>(null);

  const { data: settings, isLoading } = useQuery({
    queryKey: ["site-settings"],
    queryFn: () => siteSettingsApi.get(),
  });

  useEffect(() => {
    if (settings?.general) {
      setFormData(settings.general as Record<string, string>);
    }
    if (settings?.platform) {
      const p = settings.platform as Record<string, any>;
      setPlatformData(p);
      if (Array.isArray(p.marquee_items) && p.marquee_items.length > 0) {
        setMarqueeItems(p.marquee_items);
      } else {
        setMarqueeItems(DEFAULT_MARQUEE_ITEMS);
      }
    } else {
      setMarqueeItems(DEFAULT_MARQUEE_ITEMS);
    }
  }, [settings]);

  const updateMutation = useMutation({
    mutationFn: (payload: Partial<SiteSettingsData>) => siteSettingsApi.update(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      queryClient.invalidateQueries({ queryKey: ["public-settings"] });
      setMessage("Ayarlar başarıyla güncellendi!");
      setTimeout(() => setMessage(null), 3000);
    },
  });

  const handleAddMarqueeItem = () => {
    setMarqueeItems((prev) => [
      ...prev,
      { icon: "sparkles", text: "Yeni Kayan Duyuru Metni" },
    ]);
  };

  const handleUpdateMarqueeItem = (index: number, field: "icon" | "text", value: string) => {
    setMarqueeItems((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleDeleteMarqueeItem = (index: number) => {
    setMarqueeItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMoveMarqueeItem = (index: number, direction: "up" | "down") => {
    setMarqueeItems((prev) => {
      const targetIndex = direction === "up" ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const [moved] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, moved);
      return updated;
    });
  };

  const handleResetMarqueeDefaults = () => {
    setMarqueeItems(DEFAULT_MARQUEE_ITEMS);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate({
      general: formData,
      platform: {
        ...platformData,
        marquee_items: marqueeItems,
      },
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

          {/* Pricing Calculator Settings */}
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 px-8 py-6 rounded-t-2xl -mx-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Akıllı Ücret Hesaplayıcı Ayarları</h2>
                <p className="text-teal-100 text-sm mt-0.5">Ana sayfadaki bütçe hesaplama motoru değerleri</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Saatlik Taban Ücret (TL) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={platformData.calc_hourly_rate ?? 800}
                onChange={(e) => setPlatformData({ ...platformData, calc_hourly_rate: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min="0"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                12 Haftalık Paket İndirim Oranı (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={platformData.calc_discount_12 ?? 10}
                onChange={(e) => setPlatformData({ ...platformData, calc_discount_12: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min="0"
                max="100"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                24 Haftalık Paket İndirim Oranı (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={platformData.calc_discount_24 ?? 15}
                onChange={(e) => setPlatformData({ ...platformData, calc_discount_24: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min="0"
                max="100"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                36 Haftalık Paket İndirim Oranı (%) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                value={platformData.calc_discount_36 ?? 20}
                onChange={(e) => setPlatformData({ ...platformData, calc_discount_36: parseFloat(e.target.value) })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                min="0"
                max="100"
                required
              />
            </div>
          </div>

          {/* Introduction Video Settings */}
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 px-8 py-6 rounded-t-2xl -mx-8">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Tanıtım Videosu Ayarları</h2>
                <p className="text-teal-100 text-sm mt-0.5">Ana sayfadaki tanıtım videosunun bağlantısını yönetin</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 pb-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                YouTube Video ID veya Embed Bağlantısı
              </label>
              <input
                type="text"
                value={platformData.intro_video_url ?? "xYDScJqsj9k"}
                onChange={(e) => setPlatformData({ ...platformData, intro_video_url: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Örn: xYDScJqsj9k veya https://www.youtube.com/embed/xYDScJqsj9k"
              />
              <p className="text-xs text-gray-500 mt-1">
                Video çalışmıyorsa geçerli bir YouTube Video ID'si (11 haneli kod) veya doğrudan YouTube embed URL'si girin.
              </p>
            </div>
          </div>

          {/* Marquee Ticker Settings */}
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 px-8 py-6 rounded-t-2xl -mx-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Kayan Yazı Bandı (Marquee Ticker)</h2>
                  <p className="text-teal-100 text-sm mt-0.5">Ana sayfa hero altındaki kayan rozet ve duyuru yazılarını yönetin</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={handleResetMarqueeDefaults}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-sm border border-white/20 transition-all"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Varsayılanları Yükle</span>
                </button>
                <button
                  type="button"
                  onClick={handleAddMarqueeItem}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-white text-emerald-800 hover:bg-emerald-50 text-xs font-bold shadow-sm transition-all"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Yeni Yazı Ekle</span>
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-3 pb-6">
            {marqueeItems.length === 0 ? (
              <div className="p-8 text-center bg-slate-50 border border-slate-200 rounded-2xl">
                <p className="text-slate-500 text-sm font-medium mb-3">Henüz kayan yazı maddesi eklenmemiş.</p>
                <button
                  type="button"
                  onClick={handleResetMarqueeDefaults}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-500 transition-colors"
                >
                  Varsayılan Listeyi Yükle
                </button>
              </div>
            ) : (
              marqueeItems.map((item, index) => (
                <div
                  key={index}
                  className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 p-3.5 bg-slate-50 hover:bg-slate-100/80 border border-slate-200 rounded-2xl transition-all"
                >
                  {/* Sequence badge & Icon preview */}
                  <div className="flex items-center gap-2.5 shrink-0">
                    <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 text-xs font-mono font-bold flex items-center justify-center">
                      {index + 1}
                    </span>
                    <div className="w-9 h-9 rounded-xl bg-white border border-slate-200 shadow-xs flex items-center justify-center">
                      {renderMarqueeIcon(item.icon)}
                    </div>
                  </div>

                  {/* Icon Selector */}
                  <div className="shrink-0 sm:w-48">
                    <select
                      value={item.icon || "sparkles"}
                      onChange={(e) => handleUpdateMarqueeItem(index, "icon", e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="shield">🛡️ Kalkan (Güvenlik)</option>
                      <option value="graduation">🎓 Kep (Akademisyen/Hoca)</option>
                      <option value="star">⭐ Yıldız (Memnuniyet/Puan)</option>
                      <option value="zap">⚡ Şimşek (Hızlı İhale)</option>
                      <option value="smartphone">📱 Telefon (Canlı Sınıf)</option>
                      <option value="sparkles">✨ Parıltı (Fırsat/Öne Çıkan)</option>
                      <option value="book">📖 Kitap (Eğitim/Ders)</option>
                      <option value="users">👥 Kullanıcılar (Topluluk)</option>
                      <option value="award">🏆 Kupa (Başarı/Sertifika)</option>
                      <option value="clock">⏱️ Saat (Esneklik)</option>
                      <option value="heart">❤️ Kalp (Memnuniyet)</option>
                    </select>
                  </div>

                  {/* Text Input */}
                  <div className="flex-1">
                    <input
                      type="text"
                      value={item.text}
                      onChange={(e) => handleUpdateMarqueeItem(index, "text", e.target.value)}
                      placeholder="Rozet veya duyuru metni..."
                      className="w-full px-3.5 py-2 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                      required
                    />
                  </div>

                  {/* Reorder and Delete Actions */}
                  <div className="flex items-center gap-1 shrink-0 self-end sm:self-center">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => handleMoveMarqueeItem(index, "up")}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Yukarı Taşı"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      disabled={index === marqueeItems.length - 1}
                      onClick={() => handleMoveMarqueeItem(index, "down")}
                      className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                      title="Aşağı Taşı"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteMarqueeItem(index)}
                      className="p-2 rounded-xl bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all ml-1"
                      title="Sil"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
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
