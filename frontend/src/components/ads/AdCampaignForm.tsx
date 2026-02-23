"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Sparkles,
  Image as ImageIcon,
  Link as LinkIcon,
  Target,
  Calendar,
  TrendingUp,
  Info,
  AlertCircle,
  CheckCircle2,
  Loader2,
} from "lucide-react";
import {
  adCampaignsApi,
  coursesApi,
  type AdCampaignCreate,
  type AdCampaign,
  type AdPlacement,
  type CampaignType,
  type PricingModel,
  type CampaignCostCalculation,
} from "@/lib/api";
import { toast } from "sonner";

interface AdCampaignFormProps {
  campaign?: AdCampaign | null;
  onSave: (data: AdCampaignCreate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function AdCampaignForm({
  campaign,
  onSave,
  onCancel,
  isLoading = false,
}: AdCampaignFormProps) {
  const [form, setForm] = useState<AdCampaignCreate>({
    name: campaign?.name || "",
    campaign_type: campaign?.campaign_type || "featured_course",
    placement_id: campaign?.placement_id || "",
    course_id: campaign?.course_id || "",
    banner_image_url: campaign?.banner_image_url || "",
    banner_link_url: campaign?.banner_link_url || "",
    banner_alt_text: campaign?.banner_alt_text || "",
    start_date: campaign?.start_date
      ? new Date(campaign.start_date).toISOString().slice(0, 16)
      : "",
    end_date: campaign?.end_date
      ? new Date(campaign.end_date).toISOString().slice(0, 16)
      : "",
    daily_budget: campaign?.daily_budget || undefined,
    total_budget: campaign?.total_budget || 0,
    pricing_model: campaign?.pricing_model || "fixed_daily",
    target_categories: campaign?.target_categories || [],
    target_tags: campaign?.target_tags || [],
    is_targeted: campaign?.is_targeted || false,
  });

  const [placements, setPlacements] = useState<AdPlacement[]>([]);
  const [courses, setCourses] = useState<Array<{ id: string; title: string; slug: string }>>([]);
  const [selectedPlacement, setSelectedPlacement] = useState<AdPlacement | null>(null);
  const [costCalculation, setCostCalculation] = useState<CampaignCostCalculation | null>(null);
  const [balance, setBalance] = useState<{ available_balance: number; pending_amounts: number } | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Load placements
  useEffect(() => {
    adCampaignsApi.getPlacements().then(setPlacements).catch(() => {
      toast.error("Yerleşimler yüklenirken bir hata oluştu");
    });
  }, []);

  // Load courses
  useEffect(() => {
    coursesApi.getMyCourses().then((data: any[]) => {
      setCourses(
        data.map((c: any) => ({
          id: c.id,
          title: c.title,
          slug: c.slug,
        }))
      );
    }).catch(() => {
      toast.error("Kurslar yüklenirken bir hata oluştu");
    });
  }, []);

  // Load balance
  useEffect(() => {
    adCampaignsApi.getBalance().then(setBalance).catch(() => {
      // Ignore errors
    });
  }, []);

  // Calculate cost when dates or placement changes
  useEffect(() => {
    if (form.placement_id && form.start_date && form.end_date) {
      const startDate = new Date(form.start_date);
      const endDate = new Date(form.end_date);

      if (endDate > startDate) {
        setIsCalculating(true);
        adCampaignsApi
          .getPlacementPricing(form.placement_id, {
            start_date: startDate.toISOString(),
            end_date: endDate.toISOString(),
          })
          .then((calc) => {
            setCostCalculation(calc);
            setForm((prev) => ({
              ...prev,
              total_budget: calc.calculated_cost,
            }));
          })
          .catch(() => {
            // Ignore errors
          })
          .finally(() => {
            setIsCalculating(false);
          });
      }
    }
  }, [form.placement_id, form.start_date, form.end_date]);

  // Update selected placement
  useEffect(() => {
    if (form.placement_id) {
      const placement = placements.find((p) => p.id === form.placement_id);
      setSelectedPlacement(placement || null);
    }
  }, [form.placement_id, placements]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = "Kampanya adı gereklidir";
    }
    if (!form.placement_id) {
      newErrors.placement_id = "Yerleşim seçilmelidir";
    }
    // Course is required for featured_course and course_promotion
    if ((form.campaign_type === "featured_course" || form.campaign_type === "course_promotion") && !form.course_id) {
      newErrors.course_id = "Kurs seçilmelidir";
    }
    if (!form.start_date) {
      newErrors.start_date = "Başlangıç tarihi gereklidir";
    }
    if (!form.end_date) {
      newErrors.end_date = "Bitiş tarihi gereklidir";
    }
    if (form.start_date && form.end_date) {
      const start = new Date(form.start_date);
      const end = new Date(form.end_date);
      if (end <= start) {
        newErrors.end_date = "Bitiş tarihi başlangıç tarihinden sonra olmalıdır";
      }
      if (start < new Date()) {
        newErrors.start_date = "Başlangıç tarihi gelecekte olmalıdır";
      }
    }
    if (form.campaign_type === "banner_ad") {
      if (!form.banner_image_url) {
        newErrors.banner_image_url = "Banner görsel URL gereklidir";
      }
      if (!form.banner_link_url) {
        newErrors.banner_link_url = "Banner link URL gereklidir";
      }
    }
    if (form.total_budget <= 0) {
      newErrors.total_budget = "Toplam bütçe 0'dan büyük olmalıdır";
    }
    if (balance && form.total_budget > Number(balance.available_balance)) {
      newErrors.total_budget = `Yetersiz bakiye. Mevcut: ${Number(balance.available_balance).toFixed(2)} TRY`;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Lütfen form hatalarını düzeltin");
      return;
    }

    const submitData: AdCampaignCreate = {
      ...form,
      start_date: new Date(form.start_date).toISOString(),
      end_date: new Date(form.end_date).toISOString(),
      // Boş string'leri null'a çevir
      course_id: form.course_id && form.course_id.trim() ? form.course_id : undefined,
      banner_image_url: form.banner_image_url && form.banner_image_url.trim() ? form.banner_image_url : undefined,
      banner_link_url: form.banner_link_url && form.banner_link_url.trim() ? form.banner_link_url : undefined,
      banner_alt_text: form.banner_alt_text && form.banner_alt_text.trim() ? form.banner_alt_text : undefined,
    };

    console.log("Submitting campaign data:", submitData);
    await onSave(submitData);
  };

  const days = form.start_date && form.end_date
    ? Math.ceil(
        (new Date(form.end_date).getTime() - new Date(form.start_date).getTime()) /
          (1000 * 60 * 60 * 24)
      ) + 1
    : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-500 via-emerald-500 to-cyan-500 p-6 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-2xl font-bold">
                  {campaign ? "Kampanya Düzenle" : "Yeni Reklam Kampanyası"}
                </h2>
                <p className="text-teal-100 text-sm mt-0.5">
                  Kursunuzu öne çıkarın ve daha fazla öğrenciye ulaşın
                </p>
              </div>
            </div>
            <button
              onClick={onCancel}
              className="p-2 rounded-xl bg-white/20 hover:bg-white/30 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Balance Card */}
        {balance && (
          <div className="px-6 pt-6">
            <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-4 border-2 border-amber-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-amber-700 mb-1">Kullanılabilir Bakiye</p>
                  <p className="text-3xl font-bold text-amber-900">
                    {Number(balance.available_balance).toFixed(2)} TRY
                  </p>
                  {balance.pending_amounts > 0 && (
                    <p className="text-xs text-amber-600 mt-1">
                      Bekleyen: {Number(balance.pending_amounts).toFixed(2)} TRY
                    </p>
                  )}
                </div>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                  <span className="text-3xl font-bold text-amber-600">₺</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Campaign Type */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-3">
              Kampanya Tipi <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                {
                  value: "featured_course" as CampaignType,
                  label: "Öne Çıkan Kurs",
                  icon: TrendingUp,
                  desc: "Kursunuz ana sayfada öne çıkarılır",
                },
                {
                  value: "course_promotion" as CampaignType,
                  label: "Kurs Promosyonu",
                  icon: Target,
                  desc: "Kursunuzu özel kampanya ile tanıtın",
                },
                {
                  value: "banner_ad" as CampaignType,
                  label: "Banner Reklam",
                  icon: ImageIcon,
                  desc: "Özel banner görseli ile reklam",
                },
              ].map((type) => {
                const Icon = type.icon;
                return (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setForm({ ...form, campaign_type: type.value })}
                    className={`relative p-5 rounded-2xl border-2 transition-all ${
                      form.campaign_type === type.value
                        ? "border-teal-500 bg-teal-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-gray-300"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          form.campaign_type === type.value
                            ? "bg-teal-500 text-white"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1 text-left">
                        <h3 className="font-bold text-gray-900 mb-1">{type.label}</h3>
                        <p className="text-xs text-gray-600">{type.desc}</p>
                      </div>
                      {form.campaign_type === type.value && (
                        <CheckCircle2 className="w-5 h-5 text-teal-500" />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Placement & Course */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Yerleşim <span className="text-red-500">*</span>
              </label>
              <select
                value={form.placement_id}
                onChange={(e) => setForm({ ...form, placement_id: e.target.value })}
                className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                required
              >
                <option value="">Yerleşim Seçin</option>
                {placements.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.location})
                    {p.pricing?.fixed_daily && ` - ${Number(p.pricing.fixed_daily).toFixed(2)} TRY/gün`}
                  </option>
                ))}
              </select>
              {errors.placement_id && (
                <p className="text-xs text-red-500 mt-1">{errors.placement_id}</p>
              )}
              {selectedPlacement && selectedPlacement.pricing && (
                <div className="mt-2 p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-lg border border-teal-200">
                  <div className="flex items-start gap-2 mb-2">
                    <Info className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-gray-900 mb-1">Fiyatlandırma Modelleri:</p>
                      <div className="space-y-1 text-xs text-gray-700">
                        {selectedPlacement.pricing.fixed_daily && (
                          <p>
                            <span className="font-medium">Günlük Sabit:</span> ₺{Number(selectedPlacement.pricing.fixed_daily).toFixed(2)}/gün 
                            <span className="text-gray-500 ml-1">(Kampanya süresi × günlük fiyat)</span>
                          </p>
                        )}
                        {selectedPlacement.pricing.per_impression && (
                          <p>
                            <span className="font-medium">Gösterim Başına:</span> ₺{Number(selectedPlacement.pricing.per_impression).toFixed(3)}/gösterim
                            <span className="text-gray-500 ml-1">(Gerçek gösterim sayısına göre)</span>
                          </p>
                        )}
                        {selectedPlacement.pricing.per_click && (
                          <p>
                            <span className="font-medium">Tıklama Başına:</span> ₺{Number(selectedPlacement.pricing.per_click).toFixed(2)}/tıklama
                            <span className="text-gray-500 ml-1">(Gerçek tıklama sayısına göre)</span>
                          </p>
                        )}
                      </div>
                      <p className="text-xs text-teal-700 mt-2 font-medium">
                        💡 Varsayılan olarak "Günlük Sabit" modeli kullanılır. Kampanya oluşturulduktan sonra maliyet otomatik hesaplanır.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Course Selection - Required for featured_course and course_promotion */}
            {(form.campaign_type === "featured_course" || form.campaign_type === "course_promotion") && (
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Kurs <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.course_id}
                  onChange={(e) => setForm({ ...form, course_id: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  required
                >
                  <option value="">Kurs Seçin</option>
                  {courses.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.title}
                    </option>
                  ))}
                </select>
                {errors.course_id && (
                  <p className="text-xs text-red-500 mt-1">{errors.course_id}</p>
                )}
                {form.course_id && (
                  <div className="mt-2 p-3 bg-teal-50 rounded-lg border border-teal-200">
                    <p className="text-xs font-medium text-teal-800">
                      Seçili kurs: {courses.find((c) => c.id === form.course_id)?.title}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Campaign Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Kampanya Adı <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
              placeholder="Örn: YKS Hazırlık Kampanyası"
              required
              maxLength={255}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Dates */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Başlangıç Tarihi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  value={form.start_date}
                  onChange={(e) => setForm({ ...form, start_date: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  required
                />
              </div>
              {errors.start_date && (
                <p className="text-xs text-red-500 mt-1">{errors.start_date}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Bitiş Tarihi <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Calendar className="w-5 h-5 text-gray-400" />
                </div>
                <input
                  type="datetime-local"
                  value={form.end_date}
                  onChange={(e) => setForm({ ...form, end_date: e.target.value })}
                  min={form.start_date || new Date().toISOString().slice(0, 16)}
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  required
                />
              </div>
              {errors.end_date && (
                <p className="text-xs text-red-500 mt-1">{errors.end_date}</p>
              )}
              {days > 0 && (
                <p className="text-xs text-gray-500 mt-1">
                  Süre: {days} gün
                </p>
              )}
            </div>
          </div>

          {/* Cost Calculation */}
          {costCalculation && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-5 border-2 border-teal-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold text-teal-600">₺</span>
                  <span className="font-bold text-teal-900">Tahmini Maliyet</span>
                </div>
                {isCalculating ? (
                  <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                ) : (
                  <span className="text-2xl font-bold text-teal-900">
                    {Number(costCalculation.calculated_cost).toFixed(2)} TRY
                  </span>
                )}
              </div>
              <div className="text-sm text-teal-700 space-y-1">
                <p>
                  {days} gün × {costCalculation.breakdown.price_per_day ? Number(costCalculation.breakdown.price_per_day).toFixed(2) : "N/A"} TRY/gün
                </p>
                {Number(costCalculation.breakdown.discount_percentage) > 0 && (
                  <p className="text-emerald-600 font-medium">
                    %{Number(costCalculation.breakdown.discount_percentage).toFixed(0)} indirim uygulandı
                  </p>
                )}
              </div>
            </motion.div>
          )}

          {/* Budget */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Toplam Bütçe <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-lg font-bold text-gray-400">₺</span>
                </div>
                <input
                  type="number"
                  value={form.total_budget}
                  onChange={(e) =>
                    setForm({ ...form, total_budget: parseFloat(e.target.value) || 0 })
                  }
                  min={0}
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  required
                  readOnly={!!costCalculation}
                />
              </div>
              {errors.total_budget && (
                <p className="text-xs text-red-500 mt-1">{errors.total_budget}</p>
              )}
              {costCalculation && (
                <p className="text-xs text-gray-500 mt-1">
                  Otomatik hesaplanan maliyet (değiştirilemez)
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Günlük Bütçe (Opsiyonel)
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <span className="text-lg font-bold text-gray-400">₺</span>
                </div>
                <input
                  type="number"
                  value={form.daily_budget || ""}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      daily_budget: e.target.value ? parseFloat(e.target.value) : undefined,
                    })
                  }
                  min={0}
                  step="0.01"
                  className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Günlük harcama limiti (boş bırakılabilir)
              </p>
            </div>
          </div>

          {/* Banner Ad Fields */}
          {form.campaign_type === "banner_ad" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="space-y-4 p-5 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-200"
            >
              <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-purple-900">Banner Reklam Ayarları</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Banner Görsel URL <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <ImageIcon className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="url"
                    value={form.banner_image_url}
                    onChange={(e) => setForm({ ...form, banner_image_url: e.target.value })}
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    placeholder="https://example.com/banner.jpg"
                    required
                  />
                </div>
                {errors.banner_image_url && (
                  <p className="text-xs text-red-500 mt-1">{errors.banner_image_url}</p>
                )}
                {form.banner_image_url && (
                  <div className="mt-3 rounded-xl overflow-hidden border-2 border-gray-200">
                    <img
                      src={form.banner_image_url}
                      alt="Banner preview"
                      className="w-full h-auto max-h-48 object-cover"
                      onError={(e) => {
                        (e.target as HTMLImageElement).style.display = "none";
                      }}
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Banner Link URL <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <LinkIcon className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="url"
                      value={form.banner_link_url}
                      onChange={(e) => setForm({ ...form, banner_link_url: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                      placeholder="https://example.com"
                      required
                    />
                  </div>
                  {errors.banner_link_url && (
                    <p className="text-xs text-red-500 mt-1">{errors.banner_link_url}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Banner Alt Text
                  </label>
                  <input
                    type="text"
                    value={form.banner_alt_text}
                    onChange={(e) => setForm({ ...form, banner_alt_text: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    placeholder="Banner açıklaması (SEO)"
                    maxLength={255}
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* Targeting (Optional) */}
          <div className="p-5 bg-gray-50 rounded-2xl border-2 border-gray-200">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-gray-600" />
              <h3 className="font-bold text-gray-900">Hedefleme (Opsiyonel)</h3>
            </div>

            <label className="flex items-center gap-3 mb-4 cursor-pointer">
              <input
                type="checkbox"
                checked={form.is_targeted}
                onChange={(e) => setForm({ ...form, is_targeted: e.target.checked })}
                className="w-5 h-5 rounded-md border-2 border-gray-300 text-teal-600 focus:ring-2 focus:ring-teal-500"
              />
              <span className="text-sm font-medium text-gray-700">Hedefleme aktif</span>
            </label>

            {form.is_targeted && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="space-y-4"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hedef Kategoriler
                  </label>
                  <input
                    type="text"
                    value={form.target_categories?.join(", ") || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        target_categories: e.target.value
                          .split(",")
                          .map((c) => c.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    placeholder="Kategori1, Kategori2 (virgülle ayırın)"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hedef Etiketler
                  </label>
                  <input
                    type="text"
                    value={form.target_tags?.join(", ") || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        target_tags: e.target.value
                          .split(",")
                          .map((t) => t.trim())
                          .filter(Boolean),
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    placeholder="Etiket1, Etiket2 (virgülle ayırın)"
                  />
                </div>
              </motion.div>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-5 h-5" />
                  {campaign ? "Güncelle" : "Kampanya Oluştur"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
