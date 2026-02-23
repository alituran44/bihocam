"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import type { Category, CategoryCreate, CategoryUpdate } from "@/lib/api";
import { Button, Input } from "@/components/ui";
import { cn } from "@/lib/utils";

type Mode = "create" | "edit";

interface CategoryFormModalProps {
  open: boolean;
  mode: Mode;
  loading?: boolean;
  category?: Category | null;
  parentOptions?: Category[];
  onClose: () => void;
  onSubmit: (payload: CategoryCreate | CategoryUpdate) => void;
}

export function CategoryFormModal({
  open,
  mode,
  loading,
  category,
  parentOptions = [],
  onClose,
  onSubmit,
}: CategoryFormModalProps) {
  const [mounted, setMounted] = useState(false);

  const [form, setForm] = useState<{
    name: string;
    description: string;
    icon: string;
    color: string;
    parent_id: string;
    order: number;
  }>({
    name: "",
    description: "",
    icon: "",
    color: "#0d9488",
    parent_id: "",
    order: 0,
  });

  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (open) {
      setError(null);
      if (mode === "edit" && category) {
        setForm({
          name: category.name,
          description: category.description || "",
          icon: category.icon || "",
          color: category.color || "#0d9488",
          parent_id: category.parent_id || "",
          order: category.order ?? 0,
        });
      } else if (mode === "create") {
        setForm((prev) => ({
          ...prev,
          name: "",
          description: "",
          icon: "",
          color: "#0d9488",
          parent_id: "",
          order: 0,
        }));
      }
    }
  }, [open, mode, category]);

  const slugPreview = useMemo(() => {
    if (!form.name.trim()) return "";
    return form.name
      .toLowerCase()
      .replace(/ğ/g, "g")
      .replace(/ü/g, "u")
      .replace(/ş/g, "s")
      .replace(/ı/g, "i")
      .replace(/ö/g, "o")
      .replace(/ç/g, "c")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, [form.name]);

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setError("Kategori adı zorunludur.");
      return;
    }

    const payload: CategoryCreate | CategoryUpdate = {
      name: form.name.trim(),
      description: form.description.trim() || undefined,
      icon: form.icon.trim() || undefined,
      color: form.color || undefined,
      parent_id: form.parent_id || undefined,
      order: form.order || 0,
    };

    onSubmit(payload);
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 w-full max-w-lg mx-4">
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {mode === "create" ? "Yeni Kategori Oluştur" : "Kategori Düzenle"}
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Kategori adı, ikon ve renk ile modern bir görünüm ver.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-4 max-h-[70vh] overflow-y-auto">
          {error && (
            <div className="text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-xl px-4 py-2.5 flex items-start gap-2">
              <svg className="w-4 h-4 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 9v2m0 4h.01M4.93 4.93a10.003 10.003 0 0114.14 0 10.003 10.003 0 010 14.14 10.003 10.003 0 01-14.14 0 10.003 10.003 0 010-14.14z"
                />
              </svg>
              <span>{error}</span>
            </div>
          )}

          <Input
            label="Kategori Adı"
            placeholder="Örn: Programlama"
            value={form.name}
            onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="İkon (Emoji)"
              placeholder="Örn: 💻"
              value={form.icon}
              onChange={(e) => setForm((prev) => ({ ...prev, icon: e.target.value }))}
              maxLength={2}
            />
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Renk</label>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                  className="w-10 h-10 rounded-lg border border-gray-200 cursor-pointer"
                />
                <Input
                  value={form.color}
                  onChange={(e) => setForm((prev) => ({ ...prev, color: e.target.value }))}
                  className="flex-1"
                  placeholder="#0d9488"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Üst Kategori</label>
              <select
                value={form.parent_id}
                onChange={(e) => setForm((prev) => ({ ...prev, parent_id: e.target.value }))}
                className="w-full px-4 py-2.5 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              >
                <option value="">Yok (Ana Kategori)</option>
                {parentOptions
                  .filter((c) => !category || c.id !== category.id)
                  .map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
              </select>
            </div>
            <Input
              label="Sıra"
              type="number"
              value={form.order}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  order: Number.isNaN(parseInt(e.target.value, 10)) ? 0 : parseInt(e.target.value, 10),
                }))
              }
              hint="Listede görüntülenme sırası"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Açıklama</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
              rows={3}
              placeholder="Kategori hakkında kısa bir açıklama yazın..."
              className="w-full px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 resize-none"
            />
          </div>

          {/* Slug Preview */}
          <div className="text-xs text-gray-500 bg-gray-50 border border-dashed border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between">
            <span className="font-semibold text-gray-600">Slug önizleme:</span>
            <span className="font-mono text-xs text-gray-800">
              /categories/
              {slugPreview || <span className="text-gray-400">kategori-adi</span>}
            </span>
          </div>
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50/60">
          <Button variant="ghost" asMotion={false} onClick={onClose}>
            İptal
          </Button>
          <Button
            asMotion={false}
            onClick={handleSubmit}
            isLoading={loading}
            disabled={loading}
          >
            {mode === "create" ? "Kategoriyi Oluştur" : "Kaydet"}
          </Button>
        </div>
      </div>
    </div>,
    document.body
  );
}

