"use client";

import Link from "next/link";
import { Badge } from "./ui";
import type { Category } from "@/lib/api";
import { cn } from "@/lib/utils";

interface CategoryBadgeProps {
  category: Category;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  asLink?: boolean;
  className?: string;
}

export function CategoryBadge({
  category,
  size = "sm",
  showCount = false,
  asLink = false,
  className,
}: CategoryBadgeProps) {
  const content = (
    <Badge
      variant="ghost"
      size={size}
      className={cn(
        "rounded-full border border-teal-100 bg-teal-50/60 text-teal-800 hover:bg-teal-100/80 transition-colors",
        className
      )}
    >
      <span className="mr-1.5">{category.icon || "🏷️"}</span>
      <span className="font-medium">{category.name}</span>
      {showCount && typeof category.course_count === "number" && (
        <span className="ml-1 text-[0.65rem] opacity-80">({category.course_count})</span>
      )}
    </Badge>
  );

  if (asLink) {
    return (
      <Link href={`/courses?category=${category.slug}`} className="inline-flex">
        {content}
      </Link>
    );
  }

  return content;
}

