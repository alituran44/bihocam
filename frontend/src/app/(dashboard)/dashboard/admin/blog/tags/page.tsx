"use client";

/**
 * EPIC-BLOG: Blog Tag Management Page
 * 
 * Admin/Teacher page for managing blog tags
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Tag,
  X,
  Save,
  Loader2,
} from "lucide-react";
import { blogTagsApi, type BlogTag } from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function BlogTagsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BlogTag>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
  });

  const { data: tags, isLoading } = useQuery({
    queryKey: ["blogTags"],
    queryFn: () => blogTagsApi.list(),
  });

  const createMutation = useMutation({
    mutationFn: (data: typeof createForm) => blogTagsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogTags"] });
      toast.success("Etiket başarıyla oluşturuldu");
      setShowCreateForm(false);
      setCreateForm({ name: "", description: "" });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Etiket oluşturulamadı");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogTag> }) =>
      blogTagsApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogTags"] });
      toast.success("Etiket başarıyla güncellendi");
      setEditingId(null);
      setEditForm({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Etiket güncellenemedi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogTagsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogTags"] });
      toast.success("Etiket başarıyla silindi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Etiket silinemedi");
    },
  });

  const filteredTags = tags?.filter((tag) =>
    tag.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const handleEdit = (tag: BlogTag) => {
    setEditingId(tag.id);
    setEditForm({
      name: tag.name,
      description: tag.description || "",
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: editForm });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" etiketini silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate(id);
    }
  };

  // Sort by usage count (most used first)
  const sortedTags = [...filteredTags].sort((a, b) => (b.usage_count || 0) - (a.usage_count || 0));

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Blog Etiketleri</h1>
        <p className="text-gray-600">Blog etiketlerini yönetin</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-xl border-2 border-gray-200 p-6 mb-6 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Etiketlerde ara..."
              className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <button
            onClick={() => setShowCreateForm(true)}
            className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all font-semibold flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Yeni Etiket
          </button>
        </div>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl border-2 border-teal-200 p-6 mb-6 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">Yeni Etiket Oluştur</h2>
            <button
              onClick={() => setShowCreateForm(false)}
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Etiket Adı *
              </label>
              <input
                type="text"
                value={createForm.name}
                onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="Örn: React, Python, Eğitim"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Açıklama
              </label>
              <textarea
                value={createForm.description}
                onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                className="w-full px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                rows={3}
                placeholder="Etiket açıklaması..."
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 mt-6">
            <button
              onClick={() => setShowCreateForm(false)}
              className="px-6 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              onClick={() => createMutation.mutate(createForm)}
              disabled={!createForm.name || createMutation.isPending}
              className="px-6 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Oluşturuluyor...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Oluştur
                </>
              )}
            </button>
          </div>
        </motion.div>
      )}

      {/* Tags List */}
      {isLoading ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Etiketler yükleniyor...</p>
        </div>
      ) : sortedTags.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz Etiket Yok</h3>
          <p className="text-gray-600 mb-6">İlk etiketi oluşturmak için yukarıdaki butona tıklayın</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sortedTags.map((tag, index) => (
            <motion.div
              key={tag.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.03 }}
              className="bg-white rounded-xl border-2 border-gray-200 p-5 hover:shadow-lg transition-all"
            >
              {editingId === tag.id ? (
                <div className="space-y-4">
                  <input
                    type="text"
                    value={editForm.name || ""}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-gray-900"
                  />
                  <textarea
                    value={editForm.description || ""}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm text-gray-600"
                    rows={2}
                  />
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleSave}
                      disabled={updateMutation.isPending}
                      className="flex-1 px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50"
                    >
                      {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
                    </button>
                    <button
                      onClick={() => {
                        setEditingId(null);
                        setEditForm({});
                      }}
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Tag className="w-5 h-5 text-teal-600" />
                      <div>
                        <h3 className="font-bold text-gray-900">{tag.name}</h3>
                        {tag.slug && (
                          <p className="text-xs text-gray-500">/{tag.slug}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleEdit(tag)}
                        className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(tag.id, tag.name)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  {tag.description && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                      {tag.description}
                    </p>
                  )}
                  <div className="flex items-center gap-2 text-xs">
                    <span className="px-2 py-1 bg-teal-50 text-teal-700 rounded-full font-medium">
                      {tag.usage_count || 0} kullanım
                    </span>
                  </div>
                </>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
