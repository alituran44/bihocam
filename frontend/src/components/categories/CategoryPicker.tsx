"use client";

import { useMemo, useState } from "react";
import type { Category } from "@/lib/api";
import { Input } from "@/components/ui";
import { cn } from "@/lib/utils";

export interface CategoryPickerProps {
  categories: Category[];
  selectedCategories: string[];
  onChange: (categoryIds: string[]) => void;
  multiple?: boolean;
  showSearch?: boolean;
  className?: string;
}

export function CategoryPicker({
  categories,
  selectedCategories,
  onChange,
  multiple = true,
  showSearch = true,
  className,
}: CategoryPickerProps) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.slug && c.slug.toLowerCase().includes(q))
    );
  }, [categories, search]);

  const toggle = (id: string) => {
    if (multiple) {
      if (selectedCategories.includes(id)) {
        onChange(selectedCategories.filter((cid) => cid !== id));
      } else {
        onChange([...selectedCategories, id]);
      }
    } else {
      onChange(selectedCategories.includes(id) ? [] : [id]);
    }
  };

  return (
    <div className={cn("space-y-3", className)}>
      {showSearch && (
        <Input
          placeholder="Kategori ara..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          variant="filled"
          inputSize="sm"
        />
      )}
      <div className="max-h-64 overflow-y-auto space-y-1">
        {filtered.map((category) => {
          const selected = selectedCategories.includes(category.id);
          const indent =
            category.parent_id && categories.some((c) => c.id === category.parent_id);
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => toggle(category.id)}
              className={cn(
                "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm border transition-all",
                selected
                  ? "bg-teal-50 border-teal-300 text-teal-700"
                  : "bg-white border-gray-200 hover:bg-gray-50"
              )}
            >
              <div className="flex items-center gap-2">
                <span className="text-lg">
                  {category.icon || "🏷️"}
                </span>
                <span
                  className={cn(
                    "font-medium text-gray-800 truncate",
                    indent && "pl-3 border-l border-dashed border-gray-300"
                  )}
                >
                  {category.name}
                </span>
              </div>
              {typeof category.course_count === "number" && category.course_count > 0 && (
                <span className="text-[0.65rem] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                  {category.course_count}
                </span>
              )}
            </button>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-xs text-gray-400 text-center py-4">
            Eşleşen kategori bulunamadı.
          </div>
        )}
      </div>
    </div>
  );
}

