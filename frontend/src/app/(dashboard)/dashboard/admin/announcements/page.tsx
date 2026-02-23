"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { announcementsApi, type SiteAnnouncement, type SiteAnnouncementCreate } from "@/lib/api";

const TYPE_COLORS: Record<string, string> = {
  info: "bg-blue-100 text-blue-800 border-blue-200",
  warning: "bg-yellow-100 text-yellow-800 border-yellow-200",
  maintenance: "bg-red-100 text-red-800 border-red-200",
};

const TYPE_LABELS: Record<string, string> = {
  info: "Bilgi",
  warning: "Uyarı",
  maintenance: "Bakım",
};

export default function AdminAnnouncementsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<SiteAnnouncement | null>(null);
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterType, setFilterType] = useState<string>("");

  const initialForm: SiteAnnouncementCreate = {
    title: "",
    message: "",
    type: "info",
    is_active: true,
    starts_at: null,
    expires_at: null,
    target_audience: "all",
    priority: 0,
    is_dismissible: true,
  };

  const [form, setForm] = useState<SiteAnnouncementCreate>(initialForm);

  const { data: announcements, isLoading } = useQuery({
    queryKey: ["announcements", filterActive, filterType],
    queryFn: () =>
      announcementsApi.list({
        is_active: filterActive ?? undefined,
        type: filterType ? (filterType as "info" | "warning" | "maintenance") : undefined,
      }),
  });

  const createMutation = useMutation({
    mutationFn: (payload: SiteAnnouncementCreate) => announcementsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setShowForm(false);
      setForm(initialForm);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: Partial<SiteAnnouncementCreate> }) =>
      announcementsApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
      setShowForm(false);
      setEditingAnnouncement(null);
      setForm(initialForm);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => announcementsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["announcements"] });
    },
  });

  const handleEdit = (announcement: SiteAnnouncement) => {
    setEditingAnnouncement(announcement);
    setForm({
      title: announcement.title,
      message: announcement.message,
      type: announcement.type,
      is_active: announcement.is_active,
      starts_at: announcement.starts_at || null,
      expires_at: announcement.expires_at || null,
      target_audience: announcement.target_audience || "all",
      priority: announcement.priority,
      is_dismissible: announcement.is_dismissible,
    });
    setShowForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAnnouncement) {
      updateMutation.mutate({ id: editingAnnouncement.id, payload: form });
    } else {
      createMutation.mutate(form);
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingAnnouncement(null);
    setForm(initialForm);
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Sınırsız";
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Duyuru Yönetimi
              </h1>
              <p className="text-teal-100 text-lg">
                Site genelinde gösterilecek duyuruları oluşturun ve yönetin
              </p>
            </div>
            <div className="hidden md:block">
              <svg className="w-32 h-32 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Durum:</label>
            <select
              value={filterActive === null ? "" : filterActive ? "active" : "inactive"}
              onChange={(e) => setFilterActive(e.target.value === "" ? null : e.target.value === "active")}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Tip:</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="">Tümü</option>
              <option value="info">Bilgi</option>
              <option value="warning">Uyarı</option>
              <option value="maintenance">Bakım</option>
            </select>
          </div>
          <div className="ml-auto">
            <button
              onClick={() => {
                setShowForm(true);
                setEditingAnnouncement(null);
                setForm(initialForm);
              }}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni Duyuru
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
          <div className="bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 px-8 py-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
                </svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {editingAnnouncement ? "Duyuruyu Düzenle" : "Yeni Duyuru Oluştur"}
                </h2>
                <p className="text-teal-100 text-sm mt-0.5">
                  {editingAnnouncement ? "Mevcut duyuru bilgilerini güncelle" : "Site genelinde gösterilecek yeni duyuru oluştur"}
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-6">
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
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as "info" | "warning" | "maintenance" })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  required
                >
                  <option value="info">Bilgi</option>
                  <option value="warning">Uyarı</option>
                  <option value="maintenance">Bakım</option>
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
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
                <input
                  type="datetime-local"
                  value={form.starts_at ? new Date(form.starts_at).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa hemen aktif olur</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
                <input
                  type="datetime-local"
                  value={form.expires_at ? new Date(form.expires_at).toISOString().slice(0, 16) : ""}
                  onChange={(e) => setForm({ ...form, expires_at: e.target.value ? new Date(e.target.value).toISOString() : null })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Boş bırakılırsa süresiz aktif kalır</p>
              </div>
            </div>

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
                  onChange={(e) => setForm({ ...form, priority: parseInt(e.target.value) || 0 })}
                  min={0}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Yüksek sayı = öncelikli</p>
              </div>

              <div className="flex items-center gap-4 pt-8">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_active ?? true}
                    onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Aktif</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.is_dismissible ?? true}
                    onChange={(e) => setForm({ ...form, is_dismissible: e.target.checked })}
                    className="w-5 h-5 text-teal-600 rounded focus:ring-teal-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Kapatılabilir</span>
                </label>
              </div>
            </div>

            <div className="flex items-center justify-end gap-4 pt-4">
              <button
                type="button"
                onClick={handleCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
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
                  : editingAnnouncement
                  ? "Güncelle"
                  : "Oluştur"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Announcements List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      ) : announcements && announcements.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {announcements.map((announcement, index) => (
            <div
              key={announcement.id}
              className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white/90 backdrop-blur-sm p-6 shadow-lg hover:shadow-2xl hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1"
              style={{ animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards` }}
            >
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-2xl"></div>
              <div className="relative flex items-start justify-between gap-6">
                <div className="flex-1">
                  <div className="mb-3 flex items-center gap-3">
                    <span className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 ${TYPE_COLORS[announcement.type]}`}>
                      {TYPE_LABELS[announcement.type]}
                    </span>
                    {announcement.is_active ? (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                        Aktif
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800 border border-gray-200">
                        Pasif
                      </span>
                    )}
                    {announcement.priority > 0 && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-800 border border-purple-200">
                        Öncelik: {announcement.priority}
                      </span>
                    )}
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">{announcement.title}</h3>
                  <p className="text-gray-700 leading-relaxed mb-4 whitespace-pre-wrap">{announcement.message}</p>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                      <span>Hedef: {announcement.target_audience === "all" ? "Herkes" : announcement.target_audience}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Başlangıç: {formatDate(announcement.starts_at)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Bitiş: {formatDate(announcement.expires_at)}</span>
                    </div>
                    {announcement.is_dismissible && (
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                        Kapatılabilir
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleEdit(announcement)}
                    className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-semibold"
                  >
                    Düzenle
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Bu duyuruyu silmek istediğinize emin misiniz?")) {
                        deleteMutation.mutate(announcement.id);
                      }
                    }}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-semibold"
                  >
                    Sil
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border border-gray-200">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3v14c-1.543-1.766-5.067-3-9.168-3H7a3.988 3.988 0 01-1.564-.317z" />
          </svg>
          <p className="text-gray-600 text-lg">Henüz duyuru bulunmuyor</p>
          <p className="text-gray-500 text-sm mt-2">Yeni bir duyuru oluşturmak için yukarıdaki butona tıklayın</p>
        </div>
      )}
    </div>
  );
}
