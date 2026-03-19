"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Edit,
  Trash2,
  X,
  MapPin,
  Monitor,
  Layout,
  Image as ImageIcon,
  Maximize2,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  adPlacementsApi,
  type AdPlacement,
  type PlacementType,
} from "@/lib/api";
import { toast } from "sonner";

const PLACEMENT_TYPE_ICONS: Record<PlacementType, typeof Monitor> = {
  banner: ImageIcon,
  featured_course: Layout,
  sidebar: Monitor,
  inline: Layout,
  popup: Maximize2,
};

const PLACEMENT_TYPE_LABELS: Record<PlacementType, string> = {
  banner: "Banner",
  featured_course: "Öne Çıkan Kurs",
  sidebar: "Sidebar",
  inline: "Inline",
  popup: "Popup",
};

export default function AdminPlacementsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPlacement, setEditingPlacement] = useState<AdPlacement | null>(null);

  const initialForm: Partial<AdPlacement> = {
    name: "",
    code: "",
    description: "",
    placement_type: "banner",
    location: "",
    width: 728,
    height: 90,
    max_ads: 1,
    is_active: true,
    priority: 0,
    targeting_options: {},
  };

  const [form, setForm] = useState<Partial<AdPlacement>>(initialForm);

  const { data: placements, isLoading } = useQuery<AdPlacement[]>({
    queryKey: ["admin-placements"],
    queryFn: () => adPlacementsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adPlacementsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-placements"] });
      setShowForm(false);
      setForm(initialForm);
      toast.success("Yerleşim başarıyla oluşturuldu");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Yerleşim oluşturulurken bir hata oluştu");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<AdPlacement> }) =>
      adPlacementsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-placements"] });
      setShowForm(false);
      setEditingPlacement(null);
      setForm(initialForm);
      toast.success("Yerleşim başarıyla güncellendi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Yerleşim güncellenirken bir hata oluştu");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adPlacementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-placements"] });
      toast.success("Yerleşim başarıyla silindi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Yerleşim silinirken bir hata oluştu");
    },
  });

  const handleEdit = (placement: AdPlacement) => {
    setEditingPlacement(placement);
    setForm(placement);
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlacement) {
      updateMutation.mutate({ id: editingPlacement.id, data: form });
    } else {
      createMutation.mutate(form);
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reklam Yerleşimleri</h1>
          <p className="text-gray-600">Reklamların gösterileceği yerleşimleri yönetin</p>
        </div>
        <button
          onClick={() => {
            setEditingPlacement(null);
            setForm(initialForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Yeni Yerleşim
        </button>
      </div>

      {/* Placements List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      ) : placements && placements.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {placements.map((placement, index) => {
            const TypeIcon = PLACEMENT_TYPE_ICONS[placement.placement_type];
            return (
              <motion.div
                key={placement.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border-2 border-gray-200 bg-white/90 backdrop-blur-sm p-6 shadow-lg hover:shadow-2xl hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-2xl"></div>
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-100 to-emerald-100 flex items-center justify-center">
                      <TypeIcon className="w-6 h-6 text-teal-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-gray-900">{placement.name}</h3>
                      <p className="text-xs text-gray-500">{placement.code}</p>
                    </div>
                  </div>
                  {placement.is_active ? (
                    <CheckCircle2 className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span>{placement.location}</span>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-semibold">{placement.width}×{placement.height}px</span>
                    {" • "}
                    <span>Max {placement.max_ads} reklam</span>
                  </div>
                  {placement.pricing && (
                    <div className="text-sm text-teal-600 font-medium">
                      {(placement.pricing as any)?.price_per_day ? Number((placement.pricing as any).price_per_day).toFixed(2) : (placement.pricing?.fixed_daily ? Number(placement.pricing.fixed_daily).toFixed(2) : "N/A")} TRY/gün
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => handleEdit(placement)}
                    className="flex-1 px-4 py-2 bg-teal-100 text-teal-700 rounded-xl hover:bg-teal-200 transition-colors font-medium text-sm"
                  >
                    <Edit className="w-4 h-4 inline mr-2" />
                    Düzenle
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Bu yerleşimi silmek istediğinize emin misiniz?")) {
                        deleteMutation.mutate(placement.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium text-sm"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border-2 border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPin className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">Henüz yerleşim bulunmuyor</p>
          <p className="text-gray-500 text-sm mt-2">
            Yeni bir yerleşim oluşturmak için yukarıdaki butona tıklayın
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-3xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-emerald-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingPlacement ? "Yerleşim Düzenle" : "Yeni Yerleşim"}
                </h2>
                <button
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlacement(null);
                    setForm(initialForm);
                  }}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Ad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    required
                    maxLength={100}
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Kod <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.code}
                    onChange={(e) => setForm({ ...form, code: e.target.value.toLowerCase().replace(/\s+/g, "_") })}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    required
                    maxLength={50}
                    pattern="^[a-z0-9_]+$"
                  />
                  <p className="text-xs text-gray-500 mt-1">Küçük harf, rakam ve alt çizgi</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">Açıklama</label>
                <textarea
                  value={form.description || ""}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Tip <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.placement_type}
                    onChange={(e) => setForm({ ...form, placement_type: e.target.value as PlacementType })}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    required
                  >
                    {Object.entries(PLACEMENT_TYPE_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Konum <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    required
                    maxLength={100}
                    placeholder="homepage, category_page, vb."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Genişlik (px) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.width}
                    onChange={(e) => setForm({ ...form, width: parseInt(e.target.value) || 0 })}
                    min={1}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Yükseklik (px) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.height}
                    onChange={(e) => setForm({ ...form, height: parseInt(e.target.value) || 0 })}
                    min={1}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    Max Reklam <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={form.max_ads}
                    onChange={(e) => setForm({ ...form, max_ads: parseInt(e.target.value) || 1 })}
                    min={1}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">Öncelik</label>
                  <input
                    type="number"
                    value={form.priority || 0}
                    onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                    min={0}
                    className="w-full px-4 py-3.5 rounded-xl border-2 border-gray-200 bg-white font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
                  />
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
              </div>

              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowForm(false);
                    setEditingPlacement(null);
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
                    : editingPlacement
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
