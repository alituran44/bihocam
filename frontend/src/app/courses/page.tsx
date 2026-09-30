"use client";

import { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useSearchParams } from "next/navigation";
import { coursesApi, cartApi, categoriesApi, Category } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { CategoryBadge } from "@/components/CategoryBadge";
import AdBanner from "@/components/ads/AdBanner";
import {
  BookOpen,
  Star,
  Bookmark,
  ShoppingCart,
  ArrowRight,
  PlusCircle,
  Users,
  Search,
  SlidersHorizontal,
  ChevronRight,
  RotateCcw,
  Sparkles,
  Tag,
  Percent,
  GraduationCap,
  CheckCircle2,
  Layers,
  School,
  Check
} from "lucide-react";

interface Course {
  id: string;
  title: string;
  slug: string;
  short_description?: string | null;
  thumbnail_path: string | null;
  price: number;
  discount_price: number | null;
  teacher?: { id: string; full_name: string; avatar_url?: string | null } | null;
  categories?: Category[];
}

export default function CoursesPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();
  const [addingId, setAddingId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [expandedParents, setExpandedParents] = useState<string[]>([]);
  const [filter, setFilter] = useState({ free: false, discount: false });
  const [searchQuery, setSearchQuery] = useState("");
  const [sort, setSort] = useState("");
  const [savedCourses, setSavedCourses] = useState<Record<string, boolean>>({});

  // Fetch categories from API
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list({ is_active: true }),
  });

  // Fetch courses from API
  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: () => coursesApi.list(),
  });

  // Sync category param from URL
  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (!categorySlug || !categoriesData) {
      setSelectedCategory(null);
      return;
    }

    const match = categoriesData.find((c) => c.slug === categorySlug);
    setSelectedCategory(match ? match.id : null);
  }, [searchParams, categoriesData]);

  // Expand parent categories by default
  useEffect(() => {
    if (!categoriesData) return;
    const parentsWithChildren = categoriesData
      .filter((parent) => !parent.parent_id)
      .filter((parent) =>
        categoriesData.some((c) => c.parent_id === parent.id)
      )
      .map((p) => p.id);
    setExpandedParents(parentsWithChildren);
  }, [categoriesData]);

  const currentCategory = useMemo(() => {
    if (!categoriesData || !selectedCategory) return null;
    return categoriesData.find((c) => c.id === selectedCategory) || null;
  }, [categoriesData, selectedCategory]);

  const categoryBreadcrumb = useMemo(() => {
    if (!categoriesData || !currentCategory) return [];
    const map = new Map(categoriesData.map((c) => [c.id, c]));
    const chain: Category[] = [];
    let node: Category | undefined | null = currentCategory;
    while (node) {
      chain.unshift(node);
      node = node.parent_id ? map.get(node.parent_id) || null : null;
    }
    return chain;
  }, [categoriesData, currentCategory]);

  const selectedCategoryIds = useMemo(() => {
    if (!categoriesData || !selectedCategory) return null;
    const ids = new Set<string>([selectedCategory]);

    categoriesData.forEach((cat) => {
      if (cat.parent_id === selectedCategory) {
        ids.add(cat.id);
      }
    });

    return ids;
  }, [categoriesData, selectedCategory]);

  const filtered = useMemo(() => {
    if (!courses) return [];
    let result = [...courses];

    // Category filter
    if (selectedCategoryIds) {
      result = result.filter((c) =>
        c.categories?.some((cat) => selectedCategoryIds.has(cat.id))
      );
    }

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter((c) =>
        c.title.toLowerCase().includes(q) ||
        (c.short_description && c.short_description.toLowerCase().includes(q)) ||
        (c.teacher?.full_name && c.teacher.full_name.toLowerCase().includes(q))
      );
    }

    // Toggle filters
    if (filter.free) result = result.filter((c) => c.price === 0);
    if (filter.discount) result = result.filter((c) => c.discount_price !== null);

    // Sorting
    if (sort === "price-low")
      result.sort(
        (a, b) => (a.discount_price ?? a.price) - (b.discount_price ?? b.price)
      );
    if (sort === "price-high")
      result.sort(
        (a, b) => (b.discount_price ?? b.price) - (a.discount_price ?? a.price)
      );
    if (sort === "az") result.sort((a, b) => a.title.localeCompare(b.title, "tr"));

    return result;
  }, [courses, selectedCategoryIds, searchQuery, filter, sort]);

  const [cartError, setCartError] = useState<string | null>(null);

  const addMutation = useMutation({
    mutationFn: (id: string) => cartApi.addToCart(id),
    onSuccess: () => {
      setCartError(null);
      queryClient.invalidateQueries({ queryKey: ["cart"] });
      setAddingId(null);
    },
    onError: (err: any) => {
      setAddingId(null);
      const detail = err?.response?.data?.detail || "Sepete eklenemedi";
      setCartError(detail);
      setTimeout(() => setCartError(null), 4000);
    },
  });

  const handleAdd = (id: string) => {
    if (!isAuthenticated) return router.push("/login");
    setAddingId(id);
    addMutation.mutate(id);
  };

  const toggleBookmark = (id: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSavedCourses((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const resetAllFilters = () => {
    setSelectedCategory(null);
    setSearchQuery("");
    setFilter({ free: false, discount: false });
    setSort("");
    router.push("/courses");
  };

  const hasActiveFilters = Boolean(
    selectedCategory || searchQuery || filter.free || filter.discount || sort
  );

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white font-sans flex flex-col justify-between">
      <div>
        <Header />

        {/* Cart Error Toast */}
        {cartError && (
          <div className="fixed top-5 right-5 z-50 bg-red-50 border border-red-200 rounded-2xl px-5 py-3.5 shadow-xl text-red-800 font-semibold text-sm animate-in fade-in flex items-center gap-2.5">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            <span>{cartError}</span>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════ */}
        {/* HERO HEADER - ANIQ UI MODERN DARK SLAB BANNER          */}
        {/* ══════════════════════════════════════════════════════ */}
        <section className="relative pt-32 pb-16 md:pt-36 md:pb-20 bg-gradient-to-br from-slate-950 via-emerald-950/80 to-slate-950 text-white overflow-hidden border-b border-emerald-500/20">
          <div className="absolute inset-0 bg-grid-subtle opacity-30 pointer-events-none" />
          <div className="pointer-events-none absolute -top-24 -left-24 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-teal-500/10 blur-3xl" />

          <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Breadcrumb */}
            <nav className="mb-4 flex items-center gap-2 text-xs font-semibold text-emerald-300/80">
              <Link href="/" className="hover:text-white transition-colors">
                Ana Sayfa
              </Link>
              <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
              <Link href="/courses" className="hover:text-white transition-colors">
                Kurslar
              </Link>
              {categoryBreadcrumb.map((cat) => (
                <span key={cat.id} className="flex items-center gap-2">
                  <ChevronRight className="w-3.5 h-3.5 text-emerald-500" />
                  <Link
                    href={`/courses?category=${cat.slug}`}
                    className="hover:text-white transition-colors text-white font-bold"
                  >
                    {cat.name}
                  </Link>
                </span>
              ))}
            </nav>

            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div className="space-y-3 max-w-2xl">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-emerald-400/30 bg-emerald-500/10 text-emerald-300 text-xs font-bold uppercase tracking-wider">
                  <School className="w-3.5 h-3.5 text-emerald-400" />
                  <span>BiHocam Video ve Canlı Kurs Kataloğu</span>
                </span>

                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white font-display tracking-tight leading-tight">
                  {currentCategory ? (
                    <span>
                      {currentCategory.name}{" "}
                      <span className="text-emerald-400">Kursları</span>
                    </span>
                  ) : (
                    <span>
                      Tüm <span className="text-emerald-400">Kurslar</span> & İçerikler
                    </span>
                  )}
                </h1>

                <p className="text-slate-300 text-sm sm:text-base font-normal leading-relaxed">
                  {currentCategory
                    ? `${currentCategory.name} alanında uzman eğitmenlerden birebir ve grup dersleri. Kendi hızınızda öğrenin, hedefinize ulaşın.`
                    : "Türkiye'nin en seçkin eğitmenlerinden YKS, LGS, lise ve üniversite derslerinde birebir canlı dersler ve video eğitim paketleri."}
                </p>
              </div>

              {/* Quick Counter Capsule */}
              <div className="flex-shrink-0 inline-flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-white/10 backdrop-blur-md border border-white/15 text-sm font-semibold text-emerald-200">
                <BookOpen className="w-4 h-4 text-emerald-400" />
                <span>
                  {isLoading ? "Yükleniyor..." : `${filtered.length} Kurs Listeleniyor`}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════ */}
        {/* MAIN BODY: SIDEBAR + GRID                            */}
        {/* ══════════════════════════════════════════════════════ */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          {/* Category Banner Ad */}
          {currentCategory && (
            <div className="mb-8">
              <AdBanner placementCode="category_banner" categoryId={currentCategory.id} />
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 items-start gap-8">
            {/* ── Left Category Sidebar (1 Col) ── */}
            <aside className="lg:col-span-1">
              <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-200/90 sticky top-24 max-h-[80vh] overflow-y-auto space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm">
                    <Layers className="w-4 h-4 text-emerald-600" />
                    <span>Kategoriler</span>
                  </div>
                  {selectedCategory && (
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        router.push("/courses");
                      }}
                      className="text-xs text-emerald-700 hover:text-emerald-800 font-semibold"
                    >
                      Sıfırla
                    </button>
                  )}
                </div>

                {categoriesLoading ? (
                  <div className="space-y-2">
                    {[...Array(6)].map((_, i) => (
                      <div key={i} className="h-9 w-full bg-slate-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => {
                        setSelectedCategory(null);
                        router.push("/courses");
                      }}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left ${
                        selectedCategory === null
                          ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                          : "text-slate-700 hover:bg-slate-100/80"
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <BookOpen className="w-3.5 h-3.5" />
                        <span>Tüm Branşlar</span>
                      </span>
                      {courses && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono ${
                          selectedCategory === null ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                        }`}>
                          {courses.length}
                        </span>
                      )}
                    </button>

                    {/* Parent Categories */}
                    {categoriesData
                      ?.filter((c) => !c.parent_id)
                      .map((parent) => {
                        const children = categoriesData.filter(
                          (c) => c.parent_id === parent.id
                        );
                        const isExpanded = expandedParents.includes(parent.id);
                        const isSelected = selectedCategory === parent.id;

                        return (
                          <div key={parent.id} className="space-y-1">
                            <button
                              onClick={() => {
                                setSelectedCategory(parent.id);
                                router.push(`/courses?category=${parent.slug}`);

                                setExpandedParents((prev) =>
                                  prev.includes(parent.id)
                                    ? prev.filter((id) => id !== parent.id)
                                    : [...prev, parent.id]
                                );
                              }}
                              className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all text-left w-full ${
                                isSelected
                                  ? "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30"
                                  : "text-slate-700 hover:bg-slate-100/80"
                              }`}
                            >
                              <span className="flex items-center gap-2 truncate">
                                <GraduationCap className="w-3.5 h-3.5 shrink-0 opacity-80" />
                                <span className="truncate">{parent.name}</span>
                              </span>
                              <span className="flex items-center gap-1.5 shrink-0">
                                {parent.course_count !== undefined && parent.course_count > 0 && (
                                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                                    isSelected ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
                                  }`}>
                                    {parent.course_count}
                                  </span>
                                )}
                                {children.length > 0 && (
                                  <ChevronRight
                                    className={`w-3.5 h-3.5 transition-transform duration-200 ${
                                      isExpanded ? "rotate-90" : ""
                                    } ${isSelected ? "text-white" : "text-slate-400"}`}
                                  />
                                )}
                              </span>
                            </button>

                            {/* Sub Categories */}
                            {isExpanded &&
                              children.map((child) => {
                                const isChildSelected = selectedCategory === child.id;
                                return (
                                  <button
                                    key={child.id}
                                    onClick={() => {
                                      setSelectedCategory(child.id);
                                      router.push(`/courses?category=${child.slug}`);
                                    }}
                                    className={`flex items-center justify-between pl-8 pr-3 py-2 rounded-xl text-xs font-medium transition-all text-left w-full ${
                                      isChildSelected
                                        ? "bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
                                        : "text-slate-600 hover:bg-slate-50"
                                    }`}
                                  >
                                    <span className="truncate">{child.name}</span>
                                    {child.course_count !== undefined && child.course_count > 0 && (
                                      <span className="text-[10px] text-slate-400 font-mono">
                                        {child.course_count}
                                      </span>
                                    )}
                                  </button>
                                );
                              })}
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>

              {/* Sidebar Ad */}
              <div className="mt-6">
                <AdBanner placementCode="sidebar_courses" categoryId={currentCategory?.id} />
              </div>
            </aside>

            {/* ── Right Content Area (3 Cols) ── */}
            <section className="lg:col-span-3 space-y-6">
              
              {/* Filter Toolbar (Search + Fast Toggles + Sorting) */}
              <div className="bg-white rounded-3xl p-4 sm:p-5 shadow-xs border border-slate-200/90 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
                
                {/* Search Input */}
                <div className="relative flex-1">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Kurs, konu veya eğitmen ara..."
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-hidden focus:border-emerald-500 focus:bg-white transition-all font-medium"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => setSearchQuery("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600"
                    >
                      Temizle
                    </button>
                  )}
                </div>

                {/* Filter Badges & Sort Select */}
                <div className="flex flex-wrap items-center gap-2.5">
                  <button
                    onClick={() => setFilter((f) => ({ ...f, discount: !f.discount }))}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      filter.discount
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent"
                    }`}
                  >
                    <Percent className="w-3.5 h-3.5" />
                    <span>İndirimli</span>
                  </button>

                  <button
                    onClick={() => setFilter((f) => ({ ...f, free: !f.free }))}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                      filter.free
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "bg-slate-100 text-slate-700 hover:bg-slate-200/80 border border-transparent"
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>Ücretsiz</span>
                  </button>

                  <div className="relative">
                    <select
                      id="course-sort-select"
                      name="courseSort"
                      aria-label="Kursları sıralama kriteri"
                      value={sort}
                      onChange={(e) => setSort(e.target.value)}
                      className="px-3.5 py-2.5 bg-slate-100 border border-slate-200/80 rounded-2xl text-xs font-bold text-slate-700 focus:outline-hidden focus:border-emerald-500 cursor-pointer transition-all"
                    >
                      <option value="">Sıralama: Önerilen</option>
                      <option value="az">İsim (A-Z)</option>
                      <option value="price-low">Fiyat: Artan</option>
                      <option value="price-high">Fiyat: Azalan</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ── Courses Grid or Empty State ── */}
              {isLoading ? (
                /* Skeleton Loader */
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="bg-white rounded-3xl p-3 border border-slate-200/80 shadow-xs animate-pulse space-y-3"
                    >
                      <div className="aspect-[5/3] bg-slate-200 rounded-2xl w-full" />
                      <div className="px-2 space-y-2">
                        <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                        <div className="h-3 bg-slate-200 rounded-md w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filtered.length > 0 ? (
                /* ── Aniq UI Course Cards Grid (5:3 Aspect) ── */
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filtered.slice(0, 6).map((course) => (
                      <Link
                        key={course.id}
                        href={`/courses/${course.slug}`}
                        className="group/card block h-full"
                      >
                        <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between p-3.5 shadow-xs">
                          <div>
                            {/* 5:3 Aspect Image Thumbnail */}
                            <div className="relative w-full aspect-[5/3] overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                              {course.thumbnail_path ? (
                                <img
                                  src={course.thumbnail_path}
                                  alt={course.title}
                                  loading="lazy"
                                  className="object-cover w-full h-full group-hover/card:scale-105 transition-transform duration-500"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                                  <BookOpen className="w-10 h-10 text-emerald-600/40" />
                                </div>
                              )}

                              {/* Top Left Badge */}
                              <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 shadow-xs">
                                <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                                <span>{course.discount_price ? "İndirimli" : "Popüler"}</span>
                              </span>

                              {/* Top Right Bookmark Button */}
                              <button
                                type="button"
                                onClick={(e) => toggleBookmark(course.id, e)}
                                aria-label="Favorilere ekle"
                                className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 text-slate-700 hover:text-emerald-700 flex items-center justify-center shadow-xs transition-colors"
                              >
                                <Bookmark
                                  className={`w-4 h-4 ${
                                    savedCourses[course.id] ? "fill-emerald-600 text-emerald-600" : ""
                                  }`}
                                />
                              </button>
                            </div>

                            {/* Instructor Info */}
                            <div className="px-2 pt-3.5 pb-1">
                              <div className="flex items-center gap-2.5 mb-2.5">
                                <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                  {course.teacher?.avatar_url ? (
                                    <img
                                      src={course.teacher.avatar_url}
                                      alt={course.teacher.full_name}
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-xs font-bold text-emerald-700 bg-emerald-50">
                                      {course.teacher?.full_name?.charAt(0) || "E"}
                                    </div>
                                  )}
                                </div>
                                <div className="min-w-0 flex-1">
                                  <p className="text-xs font-bold text-slate-900 truncate">
                                    {course.teacher?.full_name || "Seçkin Eğitmen"}
                                  </p>
                                  <p className="text-[11px] text-slate-500 truncate">BiHocam Eğitmeni</p>
                                </div>
                              </div>

                              {/* Title & Description */}
                              <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-2 min-h-[3rem] group-hover/card:text-emerald-700 transition-colors leading-snug font-display">
                                {course.title}
                              </h3>
                              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                                {course.short_description || "Birebir canlı anlatım, yeni nesil soru çözümleri ve interaktif dijital kaynaklarla hedefinize ulaşın."}
                              </p>
                            </div>
                          </div>

                          {/* Card Price & Cart Action Footer */}
                          <div className="px-2 pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                            <div>
                              {course.discount_price ? (
                                <div className="flex items-baseline gap-1.5">
                                  <span className="text-base font-black text-slate-900 font-mono">
                                    ₺{course.discount_price}
                                  </span>
                                  <span className="text-xs text-slate-400 line-through font-mono">
                                    ₺{course.price}
                                  </span>
                                </div>
                              ) : course.price === 0 ? (
                                <span className="text-sm font-bold text-emerald-700">Ücretsiz</span>
                              ) : (
                                <span className="text-base font-black text-slate-900 font-mono">
                                  ₺{course.price}
                                </span>
                              )}
                            </div>

                            <button
                              type="button"
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleAdd(course.id);
                              }}
                              disabled={addingId === course.id}
                              aria-label="Sepete ekle"
                              className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 font-bold text-xs transition-all shadow-xs"
                            >
                              <ShoppingCart className="w-3.5 h-3.5" />
                              <span>{addingId === course.id ? "Ekleniyor..." : "Sepete Ekle"}</span>
                            </button>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>

                  {/* Inline Ad */}
                  {filtered.length > 6 && (
                    <div className="my-8">
                      <AdBanner placementCode="inline_courses" categoryId={currentCategory?.id} />
                    </div>
                  )}

                  {/* Remaining Courses if more than 6 */}
                  {filtered.length > 6 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filtered.slice(6).map((course) => (
                        <Link
                          key={course.id}
                          href={`/courses/${course.slug}`}
                          className="group/card block h-full"
                        >
                          <div className="bg-white rounded-3xl overflow-hidden border border-slate-200/90 hover:border-emerald-500/50 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 h-full flex flex-col justify-between p-3.5 shadow-xs">
                            <div>
                              <div className="relative w-full aspect-[5/3] overflow-hidden rounded-2xl bg-slate-100 border border-slate-100">
                                {course.thumbnail_path ? (
                                  <img
                                    src={course.thumbnail_path}
                                    alt={course.title}
                                    loading="lazy"
                                    className="object-cover w-full h-full group-hover/card:scale-105 transition-transform duration-500"
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-slate-400 bg-gradient-to-br from-emerald-50/50 to-teal-50/50">
                                    <BookOpen className="w-10 h-10 text-emerald-600/40" />
                                  </div>
                                )}

                                <span className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 rounded-full bg-white/95 backdrop-blur-md px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-emerald-800 shadow-xs">
                                  <Star className="w-3 h-3 fill-emerald-600 text-emerald-600" />
                                  <span>{course.discount_price ? "İndirimli" : "Popüler"}</span>
                                </span>

                                <button
                                  type="button"
                                  onClick={(e) => toggleBookmark(course.id, e)}
                                  aria-label="Favorilere ekle"
                                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/95 text-slate-700 hover:text-emerald-700 flex items-center justify-center shadow-xs transition-colors"
                                >
                                  <Bookmark
                                    className={`w-4 h-4 ${
                                      savedCourses[course.id] ? "fill-emerald-600 text-emerald-600" : ""
                                    }`}
                                  />
                                </button>
                              </div>

                              <div className="px-2 pt-3.5 pb-1">
                                <div className="flex items-center gap-2.5 mb-2.5">
                                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-slate-100 border border-slate-200 shrink-0">
                                    {course.teacher?.avatar_url ? (
                                      <img
                                        src={course.teacher.avatar_url}
                                        alt={course.teacher.full_name}
                                        className="w-full h-full object-cover"
                                      />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xs font-bold text-emerald-700 bg-emerald-50">
                                        {course.teacher?.full_name?.charAt(0) || "E"}
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-xs font-bold text-slate-900 truncate">
                                      {course.teacher?.full_name || "Seçkin Eğitmen"}
                                    </p>
                                    <p className="text-[11px] text-slate-500 truncate">BiHocam Eğitmeni</p>
                                  </div>
                                </div>

                                <h3 className="text-base font-bold text-slate-900 mb-1.5 line-clamp-2 min-h-[3rem] group-hover/card:text-emerald-700 transition-colors leading-snug font-display">
                                  {course.title}
                                </h3>
                                <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed font-normal">
                                  {course.short_description || "Birebir canlı anlatım, yeni nesil soru çözümleri ve interaktif dijital kaynaklarla hedefinize ulaşın."}
                                </p>
                              </div>
                            </div>

                            <div className="px-2 pt-3 mt-3 border-t border-slate-100 flex items-center justify-between">
                              <div>
                                {course.discount_price ? (
                                  <div className="flex items-baseline gap-1.5">
                                    <span className="text-base font-black text-slate-900 font-mono">
                                      ₺{course.discount_price}
                                    </span>
                                    <span className="text-xs text-slate-400 line-through font-mono">
                                      ₺{course.price}
                                    </span>
                                  </div>
                                ) : course.price === 0 ? (
                                  <span className="text-sm font-bold text-emerald-700">Ücretsiz</span>
                                ) : (
                                  <span className="text-base font-black text-slate-900 font-mono">
                                    ₺{course.price}
                                  </span>
                                )}
                              </div>

                              <button
                                type="button"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  handleAdd(course.id);
                                }}
                                disabled={addingId === course.id}
                                aria-label="Sepete ekle"
                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200 font-bold text-xs transition-all shadow-xs"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>{addingId === course.id ? "Ekleniyor..." : "Sepete Ekle"}</span>
                              </button>
                            </div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              ) : hasActiveFilters ? (
                /* ── Filtered Empty State ── */
                <div className="bg-white rounded-3xl p-10 sm:p-14 text-center border border-slate-200/90 shadow-xs space-y-4">
                  <div className="w-16 h-16 bg-slate-100 text-slate-400 rounded-3xl flex items-center justify-center mx-auto border border-slate-200">
                    <Search className="w-8 h-8" />
                  </div>
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 font-display">Aramanıza Uygun Kurs Bulunamadı</h3>
                    <p className="text-sm text-slate-500 font-normal max-w-md mx-auto">
                      Seçili kriterlerle eşleşen kurs bulunamadı. Filtreleri temizleyerek tüm içeriklere göz atabilirsiniz.
                    </p>
                  </div>
                  <button
                    onClick={resetAllFilters}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-2xl shadow-md shadow-emerald-600/20 hover:-translate-y-0.5 transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Filtreleri Sıfırla</span>
                  </button>
                </div>
              ) : (
                /* ── ANIQ UI ZERO STATE CARD (Clean Database State) ── */
                <div className="relative overflow-hidden rounded-3xl sm:rounded-[2.5rem] bg-gradient-to-br from-emerald-50/80 via-teal-50/40 to-slate-50 p-8 sm:p-12 border border-emerald-200/80 shadow-md text-center space-y-8">
                  {/* Subtle Glows */}
                  <div className="pointer-events-none absolute -top-20 -left-20 h-64 w-64 rounded-full bg-emerald-200/40 blur-3xl" />
                  <div className="pointer-events-none absolute -bottom-20 -right-20 h-64 w-64 rounded-full bg-teal-200/40 blur-3xl" />

                  <div className="relative z-10 max-w-2xl mx-auto space-y-4">
                    <div className="w-16 h-16 rounded-3xl bg-white text-emerald-700 border border-emerald-200 flex items-center justify-center mx-auto shadow-sm">
                      <Sparkles className="w-8 h-8 text-emerald-600" />
                    </div>

                    <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300/80 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
                      <span>Yeni İçerikler Hazırlanıyor</span>
                    </div>

                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 font-display tracking-tight leading-tight">
                      BiHocam Kurs Kataloğu Yenileniyor
                    </h2>

                    <p className="text-sm sm:text-base text-slate-600 font-normal leading-relaxed">
                      Uzman eğitim kadromuz en güncel müfredata uygun yeni video kursları ve dijital kaynakları hazırlıyor. Bu süreçte dilediğiniz branşta ücretsiz özel ders talebi açarak hocalardan anında teklif alabilir veya onaylı öğretmenlerimizi keşfedebilirsiniz.
                    </p>
                  </div>

                  {/* 3 Value Actions */}
                  <div className="relative z-10 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-3xl mx-auto pt-2">
                    <Link
                      href="/tenders/new"
                      className="group p-5 bg-white rounded-2xl border border-emerald-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-left flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                          <PlusCircle className="w-5 h-5" />
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          Ders Talebi Aç
                        </h4>
                        <p className="text-xs text-slate-500 font-normal leading-snug">
                          İhtiyacınızı ve bütçenizi yazın, onaylı öğretmenler size özel teklif versin.
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-emerald-700">
                        <span>Hemen Başla</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>

                    <Link
                      href="/teachers"
                      className="group p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-left flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="w-9 h-9 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
                          <Users className="w-5 h-5" />
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          Eğitmenleri Keşfet
                        </h4>
                        <p className="text-xs text-slate-500 font-normal leading-snug">
                          Yüzlerce doğrulanmış öğretmeni branş, puan ve saatlik ücretine göre filtreleyin.
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                        <span>İncele</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>

                    <Link
                      href="/teachers"
                      className="group p-5 bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all text-left flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <span className="w-9 h-9 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                          <GraduationCap className="w-5 h-5" />
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm group-hover:text-emerald-700 transition-colors">
                          Canlı & Grup Dersleri
                        </h4>
                        <p className="text-xs text-slate-500 font-normal leading-snug">
                          Uzman öğretmenlerle birebir veya avantajlı mini grup canlı derslerine katılın.
                        </p>
                      </div>
                      <div className="mt-4 flex items-center gap-1 text-xs font-bold text-slate-700 group-hover:text-emerald-700">
                        <span>Dersleri Keşfet</span>
                        <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </Link>
                  </div>
                </div>
              )}
            </section>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
