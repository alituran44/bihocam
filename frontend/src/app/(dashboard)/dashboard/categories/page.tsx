"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { categoriesApi, type Category, type CategoryCreate, type CategoryUpdate } from "@/lib/api";
import { CategoryBadge } from "@/components/CategoryBadge";
import { Button } from "@/components/ui";
import { CategoryFormModal } from "@/components/categories/CategoryFormModal";

export default function CategoriesAdminPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const isAdmin = user?.role === "admin";

  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list({ is_active: undefined }),
    enabled: isAdmin,
  });

  const createMutation = useMutation({
    mutationFn: (payload: CategoryCreate) => categoriesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setModalOpen(false);
    },
  });

  const updateMutation = useMutation({
    mutationFn: (payload: { id: string; data: CategoryUpdate }) =>
      categoriesApi.update(payload.id, payload.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setModalOpen(false);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => categoriesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
      setDeletingId(null);
    },
    onError: () => setDeletingId(null),
  });

  if (!isAdmin) {
    return (
      <div className="max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-3">Erişim Yok</h1>
        <p className="text-gray-600">
          Bu sayfaya sadece yönetici (admin) rolüne sahip kullanıcılar erişebilir.
        </p>
      </div>
    );
  }

  const openCreate = () => {
    setSelectedCategory(null);
    setModalMode("create");
    setModalOpen(true);
  };

  const openEdit = (category: Category) => {
    setSelectedCategory(category);
    setModalMode("edit");
    setModalOpen(true);
  };

  const handleToggleActive = (category: Category) => {
    updateMutation.mutate({
      id: category.id,
      data: { is_active: !category.is_active },
    });
  };

  const handleSubmitModal = (payload: CategoryCreate | CategoryUpdate) => {
    if (modalMode === "create") {
      createMutation.mutate(payload as CategoryCreate);
    } else if (selectedCategory) {
      updateMutation.mutate({
        id: selectedCategory.id,
        data: payload as CategoryUpdate,
      });
    }
  };

  return (
    <div>
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-1">Kategoriler</h1>
          <p className="text-gray-600">
            Kurs kategorilerini yönet, yeni kategoriler ekle ve hiyerarşiyi düzenle.
          </p>
        </div>
        <Button onClick={openCreate}>Yeni Kategori</Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl border border-gray-100 p-5 animate-pulse space-y-3"
            >
              <div className="h-5 bg-gray-200 rounded w-2/3" />
              <div className="h-4 bg-gray-200 rounded w-1/2" />
              <div className="h-4 bg-gray-200 rounded w-1/3" />
              <div className="h-8 bg-gray-200 rounded w-full" />
            </div>
          ))}
        </div>
      ) : !categories || categories.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center shadow-sm">
          <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-teal-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 4v16m8-8H4"
              />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Henüz kategori oluşturulmamış
          </h2>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Kategoriler kursları gruplamanı ve kullanıcılar için daha iyi bir keşif deneyimi
            sunmanı sağlar.
          </p>
          <Button onClick={openCreate}>İlk Kategorini Oluştur</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {categories.map((category) => (
            <div
              key={category.id}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md hover:border-teal-200 transition-all flex flex-col"
            >
              <div className="p-5 flex-1">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <CategoryBadge category={category} size="md" showCount />
                  <button
                    onClick={() => handleToggleActive(category)}
                    className={`px-2.5 py-1 rounded-full text-[0.65rem] font-semibold border ${
                      category.is_active
                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                        : "bg-gray-50 text-gray-500 border-gray-200"
                    }`}
                  >
                    {category.is_active ? "Aktif" : "Pasif"}
                  </button>
                </div>
                <p className="text-xs text-gray-500 font-mono mb-2">/{category.slug}</p>
                {category.description && (
                  <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                    {category.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                  <span className="px-2 py-1 bg-gray-50 rounded-full">
                    Sıra: <span className="font-semibold">{category.order ?? 0}</span>
                  </span>
                  {category.parent && (
                    <span className="px-2 py-1 bg-gray-50 rounded-full">
                      Üst: <span className="font-semibold">{category.parent.name}</span>
                    </span>
                  )}
                </div>
              </div>
              <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between bg-gray-50/60">
                <Button
                  variant="ghost"
                  size="sm"
                  asMotion={false}
                  onClick={() => openEdit(category)}
                >
                  Düzenle
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  asMotion={false}
                  isLoading={deletingId === category.id && deleteMutation.isPending}
                  onClick={() => {
                    setDeletingId(category.id);
                    deleteMutation.mutate(category.id);
                  }}
                >
                  Sil
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <CategoryFormModal
        open={modalOpen}
        mode={modalMode}
        loading={createMutation.isPending || updateMutation.isPending}
        category={selectedCategory ?? undefined}
        parentOptions={categories || []}
        onClose={() => setModalOpen(false)}
        onSubmit={handleSubmitModal}
      />
    </div>
  );
}

