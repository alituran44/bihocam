"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  popupAnnouncementsApi,
  type PopupAnnouncement,
  type PopupAnnouncementCreate,
  type PopupAnnouncementListResponse,
  type PopupType,
} from "@/lib/api";
import { toast } from "sonner";
import { Eye, Edit, Trash2, Power, PowerOff, Plus, Calendar, Users, Star, X } from "lucide-react";
import PopupAnnouncementComponent from "@/components/PopupAnnouncement";

const TYPE_COLORS: Record<string, string> = {
  info: "bg-cyan-100 text-cyan-800 border-cyan-200",
  promotion: "bg-amber-100 text-amber-800 border-amber-200",
  announcement: "bg-emerald-100 text-emerald-800 border-emerald-200",
  warning: "bg-rose-100 text-rose-800 border-rose-200",
};

const TYPE_LABELS: Record<string, string> = {
  info: "Bilgi",
  promotion: "Promosyon",
  announcement: "Duyuru",
  warning: "Uyarı",
};

function formatDate(date: string | null): string {
  if (!date) return "Süresiz";
  return new Date(date).toLocaleString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminPopupsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingPopup, setEditingPopup] = useState<PopupAnnouncement | null>(null);
  const [previewPopup, setPreviewPopup] = useState<PopupAnnouncement | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterType, setFilterType] = useState<PopupType | "">("");
  const [filterAudience, setFilterAudience] = useState<string>("");

  const initialForm: PopupAnnouncementCreate = {
    title: "",
    message: "",
    popup_type: "info",
    is_active: true,
    starts_at: null,
    expires_at: null,
    target_audience: "all",
    priority: 0,
    is_dismissible: true,
    show_once_per_user: false,
    dismiss_duration_days: null,
    image_url: null,
    button_text: null,
    button_link_url: null,
    button_link_target: "_self",
    width: 500,
    height: null,
    position: "center",
    overlay_opacity: 0.5,
  };

  const [form, setForm] = useState<PopupAnnouncementCreate>(initialForm);

  const { data: popups, isLoading } = useQuery<PopupAnnouncementListResponse[]>({
    queryKey: ["popups", filterActive, filterType, filterAudience],
    queryFn: () =>
      popupAnnouncementsApi.list({
        is_active: filterActive ?? undefined,
        popup_type: filterType || undefined,
        target_audience: filterAudience || undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: PopupAnnouncementCreate) => popupAnnouncementsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popups"] });
      setShowForm(false);
      setForm(initialForm);
      toast.success("Pop-up başarıyla oluşturuldu");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Pop-up oluşturulurken bir hata oluştu");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<PopupAnnouncementCreate> }) =>
      popupAnnouncementsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popups"] });
      setShowForm(false);
      setEditingPopup(null);
      setForm(initialForm);
      toast.success("Pop-up başarıyla güncellendi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Pop-up güncellenirken bir hata oluştu");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => popupAnnouncementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popups"] });
      toast.success("Pop-up başarıyla silindi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Pop-up silinirken bir hata oluştu");
    },
  });

  const activateMutation = useMutation({
    mutationFn: (id: string) => popupAnnouncementsApi.activate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popups"] });
      toast.success("Pop-up aktif edildi");
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: (id: string) => popupAnnouncementsApi.deactivate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["popups"] });
      toast.success("Pop-up deaktif edildi");
    },
  });

  const handleEdit = (popup: PopupAnnouncementListResponse) => {
    // Fetch full popup details
    popupAnnouncementsApi.get(popup.id).then((fullPopup) => {
      setEditingPopup(fullPopup);
      setForm({
        title: fullPopup.title,
        message: fullPopup.message,
        popup_type: fullPopup.popup_type,
        is_active: fullPopup.is_active,
        starts_at: fullPopup.starts_at || null,
        expires_at: fullPopup.expires_at || null,
        target_audience: fullPopup.target_audience,
        priority: fullPopup.priority,
        is_dismissible: fullPopup.is_dismissible,
        show_once_per_user: fullPopup.show_once_per_user,
        dismiss_duration_days: fullPopup.dismiss_duration_days,
        image_url: fullPopup.image_url,
        button_text: fullPopup.button_text,
        button_link_url: fullPopup.button_link_url,
        button_link_target: fullPopup.button_link_target,
        width: fullPopup.width,
        height: fullPopup.height,
        position: fullPopup.position,
        overlay_opacity: fullPopup.overlay_opacity,
      });
      setShowForm(true);
    });
  };

  const handlePreview = (popup: PopupAnnouncementListResponse) => {
    popupAnnouncementsApi.get(popup.id).then((fullPopup) => {
      setPreviewPopup(fullPopup);
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPopup) {
      updateMutation.mutate({ id: editingPopup.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingPopup(null);
    setForm(initialForm);
  };

  // Stats
  const stats = {
    total: popups?.length || 0,
    active: popups?.filter((p) => p.is_active).length || 0,
    scheduled: popups?.filter((p) => p.starts_at && new Date(p.starts_at) > new Date()).length || 0,
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Pop-up Duyuruları</h1>
          <p className="text-gray-600">Landing page'de gösterilecek pop-up'ları yönetin</p>
        </div>
        <button
          onClick={() => {
            setEditingPopup(null);
            setForm(initialForm);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Yeni Pop-up
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-200/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-teal-700 mb-1">Toplam Pop-up</p>
              <p className="text-3xl font-bold text-teal-900">{stats.total}</p>
            </div>
            <div className="w-12 h-12 bg-teal-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-teal-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-emerald-50 to-green-50 rounded-2xl p-6 border border-emerald-200/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-emerald-700 mb-1">Aktif Pop-up</p>
              <p className="text-3xl font-bold text-emerald-900">{stats.active}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-500/20 rounded-xl flex items-center justify-center">
              <Power className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border border-amber-200/50 shadow-lg">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">Zamanlanmış</p>
              <p className="text-3xl font-bold text-amber-900">{stats.scheduled}</p>
            </div>
            <div className="w-12 h-12 bg-amber-500/20 rounded-xl flex items-center justify-center">
              <Calendar className="w-6 h-6 text-amber-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border border-gray-200 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={filterActive === null ? "" : filterActive ? "active" : "inactive"}
              onChange={(e) =>
                setFilterActive(
                  e.target.value === "" ? null : e.target.value === "active" ? true : false
                )
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tip</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as PopupType | "")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Tümü</option>
              <option value="info">Bilgi</option>
              <option value="promotion">Promosyon</option>
              <option value="announcement">Duyuru</option>
              <option value="warning">Uyarı</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Kitle</label>
            <select
              value={filterAudience}
              onChange={(e) => setFilterAudience(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Tümü</option>
              <option value="all">Herkes</option>
              <option value="students">Öğrenciler</option>
              <option value="teachers">Eğitmenler</option>
              <option value="admins">Adminler</option>
            </select>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-emerald-600 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {editingPopup ? "Pop-up Düzenle" : "Yeni Pop-up Oluştur"}
                  </h2>
                  <p className="text-teal-100 text-sm mt-0.5">
                    {editingPopup
                      ? "Mevcut pop-up bilgilerini güncelle"
                      : "Landing page'de gösterilecek yeni pop-up oluştur"}
                  </p>
                </div>
                <button
                  onClick={handleCancel}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <X className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              {/* Basic Fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlık <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                    maxLength={255}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tip <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={form.popup_type}
                    onChange={(e) =>
                      setForm({ ...form, popup_type: e.target.value as PopupType })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    required
                  >
                    <option value="info">Bilgi</option>
                    <option value="promotion">Promosyon</option>
                    <option value="announcement">Duyuru</option>
                    <option value="warning">Uyarı</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mesaj <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                  placeholder="HTML içerik desteklenir"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Rich text içerik için HTML kullanabilirsiniz
                </p>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Başlangıç Tarihi
                  </label>
                  <input
                    type="datetime-local"
                    value={
                      form.starts_at
                        ? new Date(form.starts_at).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        starts_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa hemen aktif olur</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
                  <input
                    type="datetime-local"
                    value={
                      form.expires_at
                        ? new Date(form.expires_at).toISOString().slice(0, 16)
                        : ""
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        expires_at: e.target.value ? new Date(e.target.value).toISOString() : null,
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa süresiz aktif kalır</p>
                </div>
              </div>

              {/* Targeting */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Hedef Kitle</label>
                  <select
                    value={form.target_audience || "all"}
                    onChange={(e) => setForm({ ...form, target_audience: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="all">Herkes</option>
                    <option value="students">Öğrenciler</option>
                    <option value="teachers">Eğitmenler</option>
                    <option value="admins">Adminler</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Öncelik</label>
                  <input
                    type="number"
                    value={form.priority || 0}
                    onChange={(e) =>
                      setForm({ ...form, priority: parseInt(e.target.value) || 0 })
                    }
                    min={0}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Yüksek sayı = öncelikli</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Pozisyon</label>
                  <select
                    value={form.position || "center"}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        position: e.target.value as "center" | "top" | "bottom" | "top_left" | "top_right" | "bottom_left" | "bottom_right",
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="center">Ortada</option>
                    <option value="top">Üstte</option>
                    <option value="bottom">Altta</option>
                    <option value="top_left">Sol Üst</option>
                    <option value="top_right">Sağ Üst</option>
                    <option value="bottom_left">Sol Alt</option>
                    <option value="bottom_right">Sağ Alt</option>
                  </select>
                </div>
              </div>

              {/* Display Options */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Genişlik (px)</label>
                  <input
                    type="number"
                    value={form.width || 500}
                    onChange={(e) => setForm({ ...form, width: parseInt(e.target.value) || 500 })}
                    min={300}
                    max={1200}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Yükseklik (px, opsiyonel)
                  </label>
                  <input
                    type="number"
                    value={form.height || ""}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        height: e.target.value ? parseInt(e.target.value) : null,
                      })
                    }
                    min={200}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  />
                  <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa otomatik ayarlanır</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Overlay Opaklığı (0-1)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="1"
                  value={form.overlay_opacity || 0.5}
                  onChange={(e) =>
                    setForm({ ...form, overlay_opacity: parseFloat(e.target.value) || 0.5 })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              {/* Image & CTA */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Görsel URL</label>
                <input
                  type="url"
                  value={form.image_url || ""}
                  onChange={(e) => setForm({ ...form, image_url: e.target.value || null })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="https://example.com/image.jpg"
                />
                {form.image_url && (
                  <img
                    src={form.image_url}
                    alt="Preview"
                    className="mt-4 rounded-lg max-w-xs border border-gray-200"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buton Metni</label>
                  <input
                    type="text"
                    value={form.button_text || ""}
                    onChange={(e) => setForm({ ...form, button_text: e.target.value || null })}
                    maxLength={100}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="Örn: Hemen Keşfet"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Buton Link URL</label>
                  <input
                    type="url"
                    value={form.button_link_url || ""}
                    onChange={(e) =>
                      setForm({ ...form, button_link_url: e.target.value || null })
                    }
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="https://example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Link Target</label>
                <select
                  value={form.button_link_target || "_self"}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      button_link_target: e.target.value as "_self" | "_blank",
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                >
                  <option value="_self">Aynı Sekmede</option>
                  <option value="_blank">Yeni Sekmede</option>
                </select>
              </div>

              {/* Behavior Options */}
              <div className="space-y-4 p-6 bg-gray-50 rounded-xl">
                <h3 className="font-semibold text-gray-900 mb-4">Davranış Ayarları</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_active ?? true}
                      onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Aktif</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.is_dismissible ?? true}
                      onChange={(e) => setForm({ ...form, is_dismissible: e.target.checked })}
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">Kapatılabilir</span>
                  </label>
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.show_once_per_user ?? false}
                      onChange={(e) =>
                        setForm({ ...form, show_once_per_user: e.target.checked })
                      }
                      className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm font-medium text-gray-700">
                      Kullanıcı başına bir kez göster
                    </span>
                  </label>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Gizleme Süresi (gün)
                    </label>
                    <input
                      type="number"
                      value={form.dismiss_duration_days || ""}
                      onChange={(e) =>
                        setForm({
                          ...form,
                          dismiss_duration_days: e.target.value ? parseInt(e.target.value) : null,
                        })
                      }
                      min={0}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                      placeholder="Boş = kalıcı gizleme"
                    />
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                <button
                  type="button"
                  onClick={handleCancel}
                  className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  İptal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    // Preview functionality - create temporary popup object
                    const previewData: PopupAnnouncement = {
                      ...form,
                      id: "preview",
                      created_by_id: null,
                      created_at: new Date().toISOString(),
                      updated_at: new Date().toISOString(),
                    } as PopupAnnouncement;
                    setPreviewPopup(previewData);
                    setShowForm(false);
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
                >
                  Önizle
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {createMutation.isPending || updateMutation.isPending
                    ? "Kaydediliyor..."
                    : editingPopup
                    ? "Güncelle"
                    : "Oluştur"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewPopup && (
        <div className="fixed inset-0 z-[10000]">
          <PopupAnnouncementComponent
            popup={previewPopup}
            onClose={() => setPreviewPopup(null)}
            onDismiss={() => setPreviewPopup(null)}
          />
        </div>
      )}

      {/* Popups List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      ) : popups && popups.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {popups.map((popup, index) => (
            <div
              key={popup.id}
              className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white/90 backdrop-blur-sm p-6 shadow-lg hover:shadow-2xl hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-2xl"></div>
              <div className="relative flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3 flex-wrap">
                    <span
                      className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 ${TYPE_COLORS[popup.popup_type]}`}
                    >
                      {TYPE_LABELS[popup.popup_type]}
                    </span>
                    {popup.is_active ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                        Pasif
                      </span>
                    )}
                    {popup.priority > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200 flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        Öncelik: {popup.priority}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{popup.title}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4" />
                      <span>
                        Hedef:{" "}
                        {popup.target_audience === "all"
                          ? "Herkes"
                          : popup.target_audience === "students"
                          ? "Öğrenciler"
                          : popup.target_audience === "teachers"
                          ? "Eğitmenler"
                          : "Adminler"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Başlangıç: {formatDate(popup.starts_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      <span>Bitiş: {formatDate(popup.expires_at)}</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => handlePreview(popup)}
                    className="p-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
                    title="Önizle"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleEdit(popup)}
                    className="p-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors"
                    title="Düzenle"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  {popup.is_active ? (
                    <button
                      onClick={() => deactivateMutation.mutate(popup.id)}
                      className="p-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                      title="Deaktif Et"
                    >
                      <PowerOff className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => activateMutation.mutate(popup.id)}
                      className="p-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors"
                      title="Aktif Et"
                    >
                      <Power className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Bu pop-up'ı silmek istediğinize emin misiniz?")) {
                        deleteMutation.mutate(popup.id);
                      }
                    }}
                    className="p-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                    title="Sil"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">Henüz pop-up bulunmuyor</p>
          <p className="text-gray-500 text-sm mt-2">
            Yeni bir pop-up oluşturmak için yukarıdaki butona tıklayın
          </p>
        </div>
      )}
    </div>
  );
}
