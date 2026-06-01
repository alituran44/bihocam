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


interface Course {
  id: string;
  title: string;
  slug: string;
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
  const [sort, setSort] = useState("");

  // Kategorileri API'den çek
  const { data: categoriesData, isLoading: categoriesLoading } = useQuery<Category[]>({
    queryKey: ["categories"],
    queryFn: () => categoriesApi.list({ is_active: true }),
  });

  const { data: courses, isLoading } = useQuery<Course[]>({
    queryKey: ["courses"],
    queryFn: () => coursesApi.list(),
  });

  // URL'den kategori parametresini oku ve state ile sync et
  useEffect(() => {
    const categorySlug = searchParams.get("category");
    if (!categorySlug || !categoriesData) {
      setSelectedCategory(null);
      return;
    }

    const match = categoriesData.find((c) => c.slug === categorySlug);
    setSelectedCategory(match ? match.id : null);
  }, [searchParams, categoriesData]);

  // Kategoriler geldikten sonra: child'ı olan parent kategorileri varsayılan açık yap
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
    // parent -> child hiyerarşisini yukarıdan aşağı kur
    while (node) {
      chain.unshift(node);
      node = node.parent_id ? map.get(node.parent_id) || null : null;
    }
    return chain;
  }, [categoriesData, currentCategory]);

  // Seçili kategori + alt kategoriler için ID set'i
  const selectedCategoryIds = useMemo(() => {
    if (!categoriesData || !selectedCategory) return null;
    const ids = new Set<string>([selectedCategory]);

    // Basit: tek seviye child'ları ekle (YKS -> Matematik/Fizik/...)
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

    // Kategori filtresi - kursun kategorileri içinde seçili kategori veya alt kategoriler var mı?
    if (selectedCategoryIds) {
      result = result.filter((c) =>
        c.categories?.some((cat) => selectedCategoryIds.has(cat.id))
      );
    }

    // Diğer filtreler
    if (filter.free) result = result.filter((c) => c.price === 0);
    if (filter.discount) result = result.filter((c) => c.discount_price !== null);

    // Sıralama
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
  }, [courses, selectedCategoryIds, filter, sort]);

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

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      {/* Cart Error Toast */}
      {cartError && (
        <div className="fixed top-4 right-4 z-50 bg-amber-50 border border-amber-300 rounded-xl px-5 py-3 shadow-lg text-amber-800 font-medium text-sm animate-in fade-in">
          {cartError}
        </div>
      )}

      {/* Hero Header */}
      <div className="relative bg-gradient-to-br from-teal-900 via-slate-900 to-teal-950 pt-32 pb-20 min-h-[420px] flex items-center overflow-hidden border-b border-teal-800/10">
        {/* Background Image Overlay */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-35 mix-blend-overlay pointer-events-none"
          style={{ backgroundImage: "url('/courses_banner_bg.png')" }}
        />
        {/* Glowing Gradient Highlights */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_left,rgba(20,184,166,0.12),transparent_60%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(13,148,136,0.18),transparent_60%)]" />
        
        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-4 flex items-center gap-2 text-sm text-teal-300/80 font-semibold">
            <Link href="/" className="hover:text-white transition-colors">
              Ana Sayfa
            </Link>
            <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            <Link href="/courses" className="hover:text-white transition-colors">
              Kurslar
            </Link>
            {categoryBreadcrumb.map((cat) => (
              <span key={cat.id} className="flex items-center gap-2">
                <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
                <Link
                  href={`/courses?category=${cat.slug}`}
                  className="hover:text-white transition-colors"
                >
                  {cat.name}
                </Link>
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-3 tracking-tight">
            {currentCategory ? currentCategory.name : "Tüm Kurslar"}
          </h1>
          <p className="text-teal-100/80 text-base md:text-lg font-medium max-w-2xl mb-4 leading-relaxed">
            {currentCategory
              ? `${currentCategory.name} alanında uzman eğitmenlerden birebir ve grup dersleri. Kendi hızında öğren, hedefine ulaş.`
              : "Türkiye'nin en seçkin eğitmenlerinden YKS, LGS, lise ve üniversite derslerinde birebir canlı dersler al. Seviyene ve hedefine uygun kursu hemen bul."}
          </p>
          <p className="text-teal-300/90 text-sm font-semibold">
            {isLoading ? "Yükleniyor..." : `${filtered.length} kurs mevcut`}
          </p>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-8">
        {/* Category Banner Ad */}
        {currentCategory && (
          <div className="mb-8">
            <AdBanner placementCode="category_banner" categoryId={currentCategory.id} />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-4 items-start gap-8">
          {/* Sol kategori sidebar'ı */}
          <aside className="mb-8 lg:mb-0 md:col-span-1">
            {/* Sidebar Ad */}
            <div className="mb-6">
              <AdBanner placementCode="sidebar_courses" categoryId={currentCategory?.id} />
            </div>
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 sticky top-24 max-h-[70vh] overflow-y-auto">
              <h2 className="text-xs font-semibold text-gray-500 mb-3 uppercase tracking-wide">
                Kategoriler
              </h2>
              {categoriesLoading ? (
                <div className="space-y-2">
                  {[...Array(8)].map((_, i) => (
                    <div key={i} className="h-8 w-full bg-gray-200 rounded-lg animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => {
                      setSelectedCategory(null);
                      router.push("/courses");
                    }}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all text-left ${
                      selectedCategory === null
                        ? "bg-teal-50 text-teal-700 border border-teal-200"
                        : "text-gray-700 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    <span>
                      <span className="mr-2">📚</span>
                      Tümü
                    </span>
                  </button>

                  {/* Parent kategoriler + altları */}
                  {categoriesData
                    ?.filter((c) => !c.parent_id)
                    .map((parent) => {
                      const children = categoriesData.filter(
                        (c) => c.parent_id === parent.id
                      );
                      const isExpanded = expandedParents.includes(parent.id);

                      return (
                        <div key={parent.id}>
                          <button
                            onClick={() => {
                              // Parent satırında tıklama: hem seç, hem expand toggle
                              setSelectedCategory(parent.id);
                              router.push(`/courses?category=${parent.slug}`);

                              setExpandedParents((prev) =>
                                prev.includes(parent.id)
                                  ? prev.filter((id) => id !== parent.id)
                                  : [...prev, parent.id]
                              );
                            }}
                            className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all text-left w-full ${
                              selectedCategory === parent.id
                                ? "bg-teal-50 text-teal-700 border border-teal-200"
                                : "text-gray-700 hover:bg-gray-50 border border-transparent"
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <span>{parent.icon || "📦"}</span>
                              {parent.name}
                            </span>
                            <span className="flex items-center gap-2">
                              {parent.course_count !== undefined &&
                                parent.course_count > 0 && (
                                  <span className="text-xs text-gray-500">
                                    {parent.course_count}
                                  </span>
                                )}
                              {/* açılır/kapanır ok ikonu */}
                              {children.length > 0 && (
                                <svg
                                  className={`w-3 h-3 text-gray-400 transition-transform ${
                                    isExpanded ? "rotate-90" : ""
                                  }`}
                                  viewBox="0 0 20 20"
                                  fill="currentColor"
                                >
                                  <path
                                    fillRule="evenodd"
                                    d="M7.21 4.21a.75.75 0 011.06 0l4.5 4.5a.75.75 0 010 1.06l-4.5 4.5a.75.75 0 11-1.06-1.06L10.44 10 7.21 6.27a.75.75 0 010-1.06z"
                                    clipRule="evenodd"
                                  />
                                </svg>
                              )}
                            </span>
                          </button>

                          {/* Alt kategoriler */}
                          {isExpanded &&
                            children.map((child) => (
                              <button
                                key={child.id}
                                onClick={() => {
                                  setSelectedCategory(child.id);
                                  router.push(`/courses?category=${child.slug}`);
                                }}
                                className={`flex items-center justify-between pl-7 pr-3 py-1.5 rounded-lg text-xs font-medium transition-all text-left w-full ${
                                  selectedCategory === child.id
                                    ? "bg-teal-50 text-teal-700 border border-teal-200"
                                    : "text-gray-600 hover:bg-gray-50 border border-transparent"
                                }`}
                              >
                                <span className="flex items-center gap-2">
                                  <span>{child.icon || "📦"}</span>
                                  {child.name}
                                </span>
                                {child.course_count !== undefined &&
                                  child.course_count > 0 && (
                                    <span className="text-[0.7rem] text-gray-400">
                                      {child.course_count}
                                    </span>
                                  )}
                              </button>
                            ))}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          </aside>

          {/* Sağ taraf: hızlı filtreler + grid */}
          <section className="md:col-span-3">
            {/* Hızlı filtreler */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-8">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setFilter((f) => ({ ...f, free: !f.free }))}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      filter.free
                        ? "bg-teal-100 text-teal-700 border-2 border-teal-200"
                        : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    <span className="mr-1">🆓</span> Ücretsiz
                  </button>
                  <button
                    onClick={() => setFilter((f) => ({ ...f, discount: !f.discount }))}
                    className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      filter.discount
                        ? "bg-orange-100 text-orange-700 border-2 border-orange-200"
                        : "bg-gray-100 text-gray-600 border-2 border-transparent hover:bg-gray-200"
                    }`}
                  >
                    <span className="mr-1">🏷️</span> İndirimli
                  </button>
                </div>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="px-4 py-2.5 bg-gray-100 border-2 border-transparent rounded-xl text-sm text-gray-700 focus:outline-none focus:border-teal-300 cursor-pointer"
                >
                  <option value="">Sırala</option>
                  <option value="az">İsim (A-Z)</option>
                  <option value="price-low">Fiyat (Artan)</option>
                  <option value="price-high">Fiyat (Azalan)</option>
                </select>
              </div>
            </div>

            {/* Grid */}
            {isLoading ? (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm animate-pulse">
                    <div className="aspect-video bg-gray-200" />
                    <div className="p-5 space-y-3">
                      <div className="h-5 bg-gray-200 rounded w-3/4" />
                      <div className="h-4 bg-gray-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filtered.length > 0 ? (
              <>
                {/* İlk 4 kurs */}
                <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filtered.slice(0, 4).map((course) => (
                    <div key={course.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all">
                    <Link href={`/courses/${course.slug}`}>
                      <div className="aspect-video bg-gradient-to-br from-teal-100 to-teal-200 relative overflow-hidden">
                        {course.thumbnail_path ? (
                          <img src={course.thumbnail_path} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <svg className="w-12 h-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                            </svg>
                          </div>
                        )}
                        {course.discount_price && (
                          <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-lg">
                            %{Math.round((1 - course.discount_price / course.price) * 100)} İndirim
                          </span>
                        )}
                      </div>
                    </Link>
                    <div className="p-5">
                      {/* Kurs kategorileri */}
                      {course.categories && course.categories.length > 0 && (
                        <div className="mb-3 flex flex-wrap gap-2">
                          <CategoryBadge
                            category={course.categories[0]}
                            size="sm"
                            asLink
                          />
                          {course.categories.length > 1 && (
                            <span className="text-[0.65rem] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                              +{course.categories.length - 1} kategori daha
                            </span>
                          )}
                        </div>
                      )}
                      <Link href={`/courses/${course.slug}`}>
                        <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 mb-2 min-h-[48px]">
                          {course.title}
                        </h3>
                      </Link>
                      <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                        {course.teacher?.full_name || "Eğitmen"}
                      </p>
                      <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                        <div className="font-bold text-gray-900">
                          {course.discount_price ? (
                            <span>
                              ₺{course.discount_price}{" "}
                              <span className="text-sm text-gray-400 line-through font-normal">₺{course.price}</span>
                            </span>
                          ) : course.price === 0 ? (
                            <span className="text-teal-600">Ücretsiz</span>
                          ) : (
                            <span>₺{course.price}</span>
                          )}
                        </div>
                        <button
                          onClick={() => handleAdd(course.id)}
                          disabled={addingId === course.id}
                          className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-teal-100 text-teal-600 hover:bg-teal-50 hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/20 disabled:opacity-50 transition-all"
                          aria-label="Sepete ekle"
                        >
                          {addingId === course.id ? (
                            <svg
                              className="w-4 h-4 animate-spin text-teal-500"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                              />
                            </svg>
                          ) : (
                            <svg
                              className="w-4 h-4"
                              viewBox="0 0 24 24"
                              fill="none"
                              xmlns="http://www.w3.org/2000/svg"
                            >
                              <path
                                d="M3 4h2l1 2m0 0h13l-1.5 9h-11L6 6zm3 13a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z"
                                stroke="currentColor"
                                strokeWidth="1.8"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
                </div>

                {/* Inline Ad - İlk 4 kurstan sonra */}
                {filtered.length > 4 && (
                  <div className="mb-6">
                    <AdBanner placementCode="inline_courses" categoryId={currentCategory?.id} />
                  </div>
                )}

                {/* Kalan kurslar */}
                {filtered.length > 4 && (
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filtered.slice(4).map((course) => (
                      <div key={course.id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-lg hover:border-teal-200 transition-all">
                        <Link href={`/courses/${course.slug}`}>
                          <div className="aspect-video bg-gradient-to-br from-teal-100 to-teal-200 relative overflow-hidden">
                            {course.thumbnail_path ? (
                              <img src={course.thumbnail_path} alt={course.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <svg className="w-12 h-12 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                                </svg>
                              </div>
                            )}
                            {course.discount_price && (
                              <span className="absolute top-3 left-3 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-lg shadow-lg">
                                %{Math.round((1 - course.discount_price / course.price) * 100)} İndirim
                              </span>
                            )}
                          </div>
                        </Link>
                        <div className="p-5">
                          {/* Kurs kategorileri */}
                          {course.categories && course.categories.length > 0 && (
                            <div className="mb-3 flex flex-wrap gap-2">
                              <CategoryBadge
                                category={course.categories[0]}
                                size="sm"
                                asLink
                              />
                              {course.categories.length > 1 && (
                                <span className="text-[0.65rem] text-gray-500 bg-gray-50 px-2 py-0.5 rounded-full">
                                  +{course.categories.length - 1} kategori daha
                                </span>
                              )}
                            </div>
                          )}
                          <Link href={`/courses/${course.slug}`}>
                            <h3 className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-2 mb-2 min-h-[48px]">
                              {course.title}
                            </h3>
                          </Link>
                          <p className="text-sm text-gray-500 mb-4 flex items-center gap-1">
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {course.teacher?.full_name || "Eğitmen"}
                          </p>
                          <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                            <div className="font-bold text-gray-900">
                              {course.discount_price ? (
                                <span>
                                  ₺{course.discount_price}{" "}
                                  <span className="text-sm text-gray-400 line-through font-normal">₺{course.price}</span>
                                </span>
                              ) : course.price === 0 ? (
                                <span className="text-teal-600">Ücretsiz</span>
                              ) : (
                                <span>₺{course.price}</span>
                              )}
                            </div>
                            <button
                              onClick={() => handleAdd(course.id)}
                              disabled={addingId === course.id}
                              className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-white border border-teal-100 text-teal-600 hover:bg-teal-50 hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/20 disabled:opacity-50 transition-all"
                              aria-label="Sepete ekle"
                            >
                              {addingId === course.id ? (
                                <svg
                                  className="w-4 h-4 animate-spin text-teal-500"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <circle
                                    className="opacity-25"
                                    cx="12"
                                    cy="12"
                                    r="10"
                                    stroke="currentColor"
                                    strokeWidth="4"
                                  />
                                  <path
                                    className="opacity-75"
                                    fill="currentColor"
                                    d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                                  />
                                </svg>
                              ) : (
                                <svg
                                  className="w-4 h-4"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  xmlns="http://www.w3.org/2000/svg"
                                >
                                  <path
                                    d="M3 4h2l1 2m0 0h13l-1.5 9h-11L6 6zm3 13a1 1 0 11-2 0 1 1 0 012 0zm10 0a1 1 0 11-2 0 1 1 0 012 0z"
                                    stroke="currentColor"
                                    strokeWidth="1.8"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                  />
                                </svg>
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-sm">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Kurs bulunamadı</h3>
                <p className="text-gray-600 mb-6">Filtreleri değiştirmeyi deneyin.</p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setFilter({ free: false, discount: false });
                    router.push("/courses");
                  }}
                  className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                >
                  Filtreleri Temizle
                </button>
              </div>
            )}
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
