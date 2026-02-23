"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  X,
  DollarSign,
  Calendar,
  TrendingUp,
  Percent,
  CheckCircle2,
  XCircle,
  Calculator,
} from "lucide-react";
import {
  adPricingApi,
  adPlacementsApi,
  type AdPricing,
  type AdPlacement,
  type PricingModel,
} from "@/lib/api";
import { toast } from "sonner";

const PRICING_MODEL_LABELS: Record<PricingModel, string> = {
  fixed_daily: "Günlük Sabit",
  per_impression: "Görüntülenme Başına",
  per_click: "Tıklama Başına",
  hybrid: "Karma",
};

export default function AdminPricingPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPricing, setEditingPricing] = useState<AdPricing | null>(null);
  const [selectedPlacementId, setSelectedPlacementId] = useState<string>("all");

  const initialForm: Partial<AdPricing> = {
    placement_id: "",
    pricing_model: "fixed_daily",
    price_per_day: undefined,
    price_per_impression: undefined,
    price_per_click: undefined,
    min_daily_budget: undefined,
    max_daily_budget: undefined,
    min_campaign_duration_days: 1,
    max_campaign_duration_days: undefined,
    discount_percentage: 0,
    is_active: true,
    effective_from: new Date().toISOString().slice(0, 16),
    effective_until: undefined,
  };

  const [form, setForm] = useState<Partial<AdPricing>>(initialForm);

  const { data: placements } = useQuery<AdPlacement[]>({
    queryKey: ["admin-placements"],
    queryFn: () => adPlacementsApi.list(),
  });

  const { data: pricingList, isLoading } = useQuery<AdPricing[]>({
    queryKey: ["admin-pricing", selectedPlacementId],
    queryFn: () =>
      adPricingApi.list({
        placement_id: selectedPlacementId !== "all" ? selectedPlacementId : undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adPricingApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      setShowForm(false);
      setForm(initialForm);
      toast.success("Fiyatlandırma başarıyla oluşturuldu");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Fiyatlandırma oluşturulurken bir hata oluştu");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdPricing> }) =>
      adPricingApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      setShowForm(false);
      setEditingPricing(null);
      setForm(initialForm);
      toast.success("Fiyatlandırma başarıyla güncellendi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Fiyatlandırma güncellenirken bir hata oluştu");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adPricingApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-pricing"] });
      toast.success("Fiyatlandırma başarıyla silindi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Fiyatlandırma silinirken bir hata oluştu");
    },
  });

  const handleEdit = (pricing: AdPricing) => {
    setEditingPricing(pricing);
    setForm({
      ...pricing,
      effective_from: pricing.effective_from
        ? new Date(pricing.effective_from).toISOString().slice(0, 16)
        : "",
      effective_until: pricing.effective_until
        ? new Date(pricing.effective_until).toISOString().slice(0, 16)
        : undefined,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submitData = {
      ...form,
      effective_from: form.effective_from
        ? new Date(form.effective_from as string).toISOString()
        : new Date().toISOString(),
      effective_until: form.effective_until
        ? new Date(form.effective_until as string).toISOString()
        : undefined,
    };

    if (editingPricing) {
      updateMutation.mutate({ id: editingPricing.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  // Group pricing by placement
  const groupedPricing = pricingList?.reduce((acc, pricing) => {
    if (!acc[pricing.placement_id]) {
      acc[pricing.placement_id] = [];
    }
    acc[pricing.placement_id].push(pricing);
    return acc;
  }, {} as Record<string, AdPricing[]>) || {};

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reklam Fiyatlandırması</h1>
          <p className="text-gray-600">Yerleşimler için fiyatlandırma modellerini yönetin</p>
        </div>
        <button
          onClick={() => {
            setEditingPricing(null);
            setForm(initialForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Yeni Fiyatlandırma
        </button>
      </div>

      {/* Filter */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Yerleşim Filtresi</label>
        <select
          value={selectedPlacementId}
          onChange={(e) => setSelectedPlacementId(e.target.value)}
          className="w-full md:w-auto px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
        >
          <option value="all">Tüm Yerleşimler</option>
          {placements?.map((p) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>

      {/* Pricing List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      ) : Object.keys(groupedPricing).length > 0 ? (
        <div className="space-y-6">
          {Object.entries(groupedPricing).map(([placementId, pricings]) => {
            const placement = placements?.find((p) => p.id === placementId);
            return (
              <motion.div
                key={placementId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{placement?.name || "Bilinmeyen"}</h3>
                    <p className="text-sm text-gray-600">{placement?.code}</p>
                  </div>
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                    {pricings.length} fiyatlandırma
                  </span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {pricings.map((pricing) => (
                    <div
                      key={pricing.id}
                      className="p-4 rounded-xl border-2 border-gray-200 bg-gradient-to-br from-gray-50 to-white hover:border-teal-300 transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="px-3 py-1 rounded-lg text-xs font-semibold bg-teal-100 text-teal-800">
                          {PRICING_MODEL_LABELS[pricing.pricing_model]}
                        </span>
                        {pricing.is_active ? (
                          <CheckCircle2 className="w-5 h-5 text-green-500" />
                        ) : (
                          <XCircle className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                      <div className="space-y-2 text-sm">
                        {pricing.price_per_day && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <DollarSign className="w-4 h-4" />
                            <span>
                              <span className="font-semibold">{Number(pricing.price_per_day).toFixed(2)}</span> TRY/gün
                            </span>
                          </div>
                        )}
                        {pricing.price_per_impression && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <TrendingUp className="w-4 h-4" />
                            <span>
                              <span className="font-semibold">{Number(pricing.price_per_impression).toFixed(4)}</span> TRY/görüntülenme
                            </span>
                          </div>
                        )}
                        {pricing.price_per_click && (
                          <div className="flex items-center gap-2 text-gray-700">
                            <TrendingUp className="w-4 h-4" />
                            <span>
                              <span className="font-semibold">{Number(pricing.price_per_click).toFixed(2)}</span> TRY/tıklama
                            </span>
                          </div>
                        )}
                        {pricing.discount_percentage > 0 && (
                          <div className="flex items-center gap-2 text-emerald-600">
                            <Percent className="w-4 h-4" />
                            <span className="font-semibold">%{Number(pricing.discount_percentage).toFixed(0)} indirim</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-gray-200 flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(pricing)}
                          className="flex-1 px-3 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-medium text-sm"
                        >
                          <Edit className="w-4 h-4 inline mr-1" />
                          Düzenle
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Bu fiyatlandırmayı silmek istediğinize emin misiniz?")) {
                              deleteMutation.mutate(pricing.id);
                            }
                          }}
                          className="px-3 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border-2 border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <DollarSign className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">Henüz fiyatlandırma bulunmuyor</p>
          <p className="text-gray-500 text-sm mt-2">
            Yeni bir fiyatlandırma oluşturmak için yukarıdaki butona tıklayın
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-emerald-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingPricing ? "Fiyatlandırma Düzenle" : "Yeni Fiyatlandırma"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPricing(null);
                    setForm(initialForm);
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Yerleşim <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.placement_id}
                  onChange={(e) => setForm({ ...form, placement_id: e.target.value })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  required
                  disabled={!!editingPricing}
                >
                  <option value="">Yerleşim Seçin</option>
                  {placements?.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({p.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Fiyatlandırma Modeli <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.pricing_model}
                  onChange={(e) => setForm({ ...form, pricing_model: e.target.value as PricingModel })}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  required
                >
                  {Object.entries(PRICING_MODEL_LABELS).map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Conditional pricing fields */}
              {(form.pricing_model === "fixed_daily" || form.pricing_model === "hybrid") && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Günlük Fiyat (TRY) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <DollarSign className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={form.price_per_day || ""}
                      onChange={(e) =>
                        setForm({ ...form, price_per_day: e.target.value ? parseFloat(e.target.value) : undefined })
                      }
                      min={0}
                      step="0.01"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                      required={form.pricing_model === "fixed_daily" || form.pricing_model === "hybrid"}
                    />
                  </div>
                </div>
              )}

              {form.pricing_model === "per_impression" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Görüntülenme Başına Fiyat (TRY) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={form.price_per_impression || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price_per_impression: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      min={0}
                      step="0.0001"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                      required
                    />
                  </div>
                </div>
              )}

              {form.pricing_model === "per_click" && (
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tıklama Başına Fiyat (TRY) <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <TrendingUp className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="number"
                      value={form.price_per_click || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          price_per_click: e.target.value ? parseFloat(e.target.value) : undefined,
                        })
                      }
                      min={0}
                      step="0.01"
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                      required
                    />
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Min Günlük Bütçe (TRY)
                  </label>
                  <input
                    type="number"
                    value={form.min_daily_budget || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        min_daily_budget: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    min={0}
                    step="0.01"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Max Günlük Bütçe (TRY)
                  </label>
                  <input
                    type="number"
                    value={form.max_daily_budget || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        max_daily_budget: e.target.value ? parseFloat(e.target.value) : undefined,
                      })
                    }
                    min={0}
                    step="0.01"
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Min Kampanya Süresi (gün)
                  </label>
                  <input
                    type="number"
                    value={form.min_campaign_duration_days || 1}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        min_campaign_duration_days: parseInt(e.target.value) || 1,
                      })
                    }
                    min={1}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Max Kampanya Süresi (gün)
                  </label>
                  <input
                    type="number"
                    value={form.max_campaign_duration_days || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        max_campaign_duration_days: e.target.value ? parseInt(e.target.value) : undefined,
                      })
                    }
                    min={1}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  İndirim Yüzdesi (%)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Percent className="w-5 h-5 text-gray-400" />
                  </div>
                  <input
                    type="number"
                    value={form.discount_percentage || 0}
                    onChange={(e) =>
                      setForm({ ...form, discount_percentage: parseFloat(e.target.value) || 0 })
                    }
                    min={0}
                    max={100}
                    step="0.01"
                    className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Geçerlilik Başlangıç <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      value={form.effective_from || ""}
                      onChange={(e) => setForm({ ...form, effective_from: e.target.value })}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Geçerlilik Bitiş
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <Calendar className="w-5 h-5 text-gray-400" />
                    </div>
                    <input
                      type="datetime-local"
                      value={form.effective_until || ""}
                      onChange={(e) => setForm({ ...form, effective_until: e.target.value || undefined })}
                      className="w-full pl-12 pr-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active ?? true}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-semibold text-gray-900">Aktif</span>
                </label>
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPricing(null);
                    setForm(initialForm);
                  }}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Kaydediliyor..."
                    : editingPricing
                    ? "Güncelle"
                    : "Oluştur"}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
