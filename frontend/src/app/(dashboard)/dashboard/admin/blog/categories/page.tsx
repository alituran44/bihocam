"use client";

/**
 * EPIC-BLOG: Blog Category Management Page (EP13-FE-07)
 * 
 * Admin-only page for managing blog categories with tree view
 * Aesthetic: "Editorial Magazine / Luxury Refined" - Tree structure with elegant hierarchy
 */

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  FolderOpen,
  ChevronRight,
  ChevronDown,
  X,
  Save,
  Loader2,
  FolderTree,
} from "lucide-react";
import { blogCategoriesApi, type BlogCategory } from "@/lib/api";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryTreeNode extends BlogCategory {
  children: CategoryTreeNode[];
  level: number;
}

export default function BlogCategoriesPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<BlogCategory>>({});
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [createForm, setCreateForm] = useState({
    name: "",
    description: "",
    icon: "",
    color: "#10b981",
    order: 0,
    parent_id: null as string | null,
  });

  const { data: categories, isLoading } = useQuery({
    queryKey: ["blogCategories"],
    queryFn: () => blogCategoriesApi.list(),
  });

  // Build tree structure
  const categoryTree = useMemo(() => {
    if (!categories) return [];
    
    const categoryMap = new Map<string, CategoryTreeNode>();
    const rootCategories: CategoryTreeNode[] = [];
    
    // First pass: create all nodes
    categories.forEach((cat) => {
      categoryMap.set(cat.id, {
        ...cat,
        children: [],
        level: 0,
      });
    });
    
    // Second pass: build tree
    categories.forEach((cat) => {
      const node = categoryMap.get(cat.id)!;
      if (cat.parent_id && categoryMap.has(cat.parent_id)) {
        const parent = categoryMap.get(cat.parent_id)!;
        parent.children.push(node);
        node.level = parent.level + 1;
      } else {
        rootCategories.push(node);
      }
    });
    
    // Sort by order
    const sortByOrder = (a: CategoryTreeNode, b: CategoryTreeNode) => {
      if (a.order !== b.order) return a.order - b.order;
      return a.name.localeCompare(b.name);
    };
    
    const sortTree = (nodes: CategoryTreeNode[]) => {
      nodes.sort(sortByOrder);
      nodes.forEach((node) => sortTree(node.children));
    };
    
    sortTree(rootCategories);
    return rootCategories;
  }, [categories]);

  // Filter tree based on search
  const filteredTree = useMemo(() => {
    if (!searchQuery) return categoryTree;
    
    const filterTree = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
      return nodes
        .filter((node) => 
          node.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          node.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        .map((node) => ({
          ...node,
          children: filterTree(node.children),
        }));
    };
    
    return filterTree(categoryTree);
  }, [categoryTree, searchQuery]);

  const createMutation = useMutation({
    mutationFn: (data: typeof createForm) => blogCategoriesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogCategories"] });
      toast.success("Kategori başarıyla oluşturuldu");
      setShowCreateForm(false);
      setCreateForm({
        name: "",
        description: "",
        icon: "",
        color: "#10b981",
        order: 0,
        parent_id: null,
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Kategori oluşturulamadı");
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<BlogCategory> }) =>
      blogCategoriesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogCategories"] });
      toast.success("Kategori başarıyla güncellendi");
      setEditingId(null);
      setEditForm({});
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Kategori güncellenemedi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => blogCategoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogCategories"] });
      toast.success("Kategori başarıyla silindi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Kategori silinemedi");
    },
  });

  const toggleExpand = (categoryId: string) => {
    setExpandedCategories((prev) => {
      const next = new Set(prev);
      if (next.has(categoryId)) {
        next.delete(categoryId);
      } else {
        next.add(categoryId);
      }
      return next;
    });
  };

  const handleEdit = (category: BlogCategory) => {
    setEditingId(category.id);
    setEditForm({
      name: category.name,
      description: category.description || "",
      icon: category.icon || "",
      color: category.color || "#10b981",
      order: category.order || 0,
      parent_id: category.parent_id,
    });
  };

  const handleSave = () => {
    if (editingId) {
      updateMutation.mutate({ id: editingId, data: editForm });
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (confirm(`"${name}" kategorisini silmek istediğinize emin misiniz?`)) {
      deleteMutation.mutate(id);
    }
  };

  const CategoryTreeItem = ({ category, level = 0 }: { category: CategoryTreeNode; level?: number }) => {
    const hasChildren = category.children.length > 0;
    const isExpanded = expandedCategories.has(category.id);
    const isEditing = editingId === category.id;
    const indent = level * 24;

    return (
      <div>
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-2 py-2 group hover:bg-gray-50 rounded-lg transition-colors"
          style={{ paddingLeft: `${indent}px` }}
        >
          {/* Expand/Collapse Button */}
          <button
            onClick={() => hasChildren && toggleExpand(category.id)}
            className={`w-6 h-6 flex items-center justify-center rounded transition-colors ${
              hasChildren
                ? "hover:bg-gray-200 cursor-pointer"
                : "cursor-default opacity-0"
            }`}
          >
            {hasChildren && (
              isExpanded ? (
                <ChevronDown className="w-4 h-4 text-gray-500" />
              ) : (
                <ChevronRight className="w-4 h-4 text-gray-500" />
              )
            )}
          </button>

          {/* Category Icon/Color */}
          <div className="flex items-center gap-2 min-w-[40px]">
            {category.icon ? (
              <span className="text-xl">{category.icon}</span>
            ) : (
              <FolderOpen className="w-5 h-5 text-gray-400" />
            )}
            {category.color && (
              <div
                className="w-3 h-3 rounded-full border border-gray-300"
                style={{ backgroundColor: category.color }}
              />
            )}
          </div>

          {/* Category Content */}
          {isEditing ? (
            <div className="flex-1 flex items-center gap-2">
              <input
                type="text"
                value={editForm.name || ""}
                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                className="flex-1 px-3 py-1.5 border-2 border-teal-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 font-semibold text-gray-900 text-sm"
                placeholder="Kategori adı"
              />
              <input
                type="color"
                value={editForm.color || "#10b981"}
                onChange={(e) => setEditForm({ ...editForm, color: e.target.value })}
                className="w-8 h-8 border-2 border-gray-300 rounded cursor-pointer"
              />
              <button
                onClick={handleSave}
                disabled={updateMutation.isPending}
                className="px-3 py-1.5 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors text-sm font-medium disabled:opacity-50"
              >
                {updateMutation.isPending ? "..." : "Kaydet"}
              </button>
              <button
                onClick={() => {
                  setEditingId(null);
                  setEditForm({});
                }}
                className="px-3 py-1.5 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
              >
                İptal
              </button>
            </div>
          ) : (
            <>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{category.name}</h3>
                  {category.parent && (
                    <span className="text-xs text-gray-400">
                      (Alt kategori: {category.parent.name})
                    </span>
                  )}
                </div>
                {category.description && (
                  <p className="text-xs text-gray-500 line-clamp-1 mt-0.5">
                    {category.description}
                  </p>
                )}
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-400">
                  <span>/{category.slug}</span>
                  <span>•</span>
                  <span>Sıra: {category.order}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => handleEdit(category)}
                  className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"
                  title="Düzenle"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(category.id, category.name)}
                  className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                  title="Sil"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
        </motion.div>

        {/* Children */}
        <AnimatePresence>
          {hasChildren && isExpanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              {category.children.map((child) => (
                <CategoryTreeItem key={child.id} category={child} level={level + 1} />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <FolderTree className="w-8 h-8 text-teal-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
              Blog Kategorileri
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Kategori hiyerarşisini yönetin ve düzenleyin</p>
        </div>

        {/* Actions Bar */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 mb-6 shadow-lg">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kategorilerde ara..."
                className="w-full pl-12 pr-4 py-3 border-2 border-gray-300/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50 backdrop-blur-sm"
              />
            </div>
            <button
              onClick={() => setShowCreateForm(true)}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 via-teal-600 to-emerald-600 text-white rounded-xl hover:shadow-xl hover:shadow-teal-500/30 transition-all font-semibold flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Yeni Kategori
            </button>
          </div>
        </div>

        {/* Create Form */}
        <AnimatePresence>
          {showCreateForm && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-teal-200/50 p-6 mb-6 shadow-xl"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Yeni Kategori Oluştur</h2>
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 transition-colors rounded-lg hover:bg-gray-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Kategori Adı *
                  </label>
                  <input
                    type="text"
                    value={createForm.name}
                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50"
                    placeholder="Örn: Teknoloji"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Üst Kategori
                  </label>
                  <select
                    value={createForm.parent_id || ""}
                    onChange={(e) => setCreateForm({ ...createForm, parent_id: e.target.value || null })}
                    className="w-full px-4 py-2 border-2 border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50"
                  >
                    <option value="">Ana Kategori (Üst kategori yok)</option>
                    {categories?.map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sıra
                  </label>
                  <input
                    type="number"
                    value={createForm.order}
                    onChange={(e) => setCreateForm({ ...createForm, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 border-2 border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Renk
                  </label>
                  <div className="flex items-center gap-3">
                    <input
                      type="color"
                      value={createForm.color}
                      onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                      className="w-16 h-10 border-2 border-gray-300/50 rounded-lg cursor-pointer"
                    />
                    <input
                      type="text"
                      value={createForm.color}
                      onChange={(e) => setCreateForm({ ...createForm, color: e.target.value })}
                      className="flex-1 px-4 py-2 border-2 border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50"
                      placeholder="#10b981"
                    />
                  </div>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Açıklama
                  </label>
                  <textarea
                    value={createForm.description}
                    onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50"
                    rows={3}
                    placeholder="Kategori açıklaması..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    İkon (Emoji veya İkon Adı)
                  </label>
                  <input
                    type="text"
                    value={createForm.icon}
                    onChange={(e) => setCreateForm({ ...createForm, icon: e.target.value })}
                    className="w-full px-4 py-2 border-2 border-gray-300/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 bg-white/50"
                    placeholder="📱 veya folder"
                  />
                </div>
              </div>
              <div className="flex items-center justify-end gap-3 mt-6">
                <button
                  onClick={() => setShowCreateForm(false)}
                  className="px-6 py-2 border-2 border-gray-300/50 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
                >
                  İptal
                </button>
                <button
                  onClick={() => createMutation.mutate(createForm)}
                  disabled={!createForm.name || createMutation.isPending}
                  className="px-6 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:shadow-lg transition-all font-medium flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
        </AnimatePresence>

        {/* Categories Tree */}
        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-12 text-center shadow-lg">
            <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Kategoriler yükleniyor...</p>
          </div>
        ) : filteredTree.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-12 text-center shadow-lg">
            <FolderOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz Kategori Yok</h3>
            <p className="text-gray-600 mb-6">İlk kategoriyi oluşturmak için yukarıdaki butona tıklayın</p>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 shadow-lg">
            <div className="space-y-1">
              {filteredTree.map((category) => (
                <CategoryTreeItem key={category.id} category={category} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
