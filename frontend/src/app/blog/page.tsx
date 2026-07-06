"use client";

/**
 * EPIC-BLOG: Public Blog List Page (EP13-FE-08)
 * 
 * Redesigned with a beautiful, high-end "Editorial Magazine" layout.
 * Includes Header/Footer integration for easy navigation, clickable category pills,
 * and a category-grouped section view.
 */

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Search,
  Calendar,
  Eye,
  User,
  Tag,
  FolderOpen,
  ArrowRight,
  Sparkles,
  BookOpen,
  ChevronRight,
} from "lucide-react";
import { blogPublicApi, type BlogPost } from "@/lib/api";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { SEOHead } from "@/components/blog/SEOHead";
import AdBanner from "@/components/ads/AdBanner";

const getFallbackBlogImage = (slug?: string) => {
  const images = [
    "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1518655061766-48f23af930f0?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1558021211-6d1403321394?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1532094349884-543bc11b234d?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1506784983877-45594efa4cbe?auto=format&fit=crop&w=600&q=80",
    "https://images.unsplash.com/photo-1484417894907-623942c8ea29?auto=format&fit=crop&w=600&q=80"
  ];
  if (!slug) return images[0];
  let sum = 0;
  for (let i = 0; i < slug.length; i++) {
    sum += slug.charCodeAt(i);
  }
  return images[sum % images.length];
};

export default function BlogListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "views">("latest");

  // Get public blog posts
  const { data: posts, isLoading: postsLoading } = useQuery<BlogPost[]>({
    queryKey: ["publicBlogPosts", selectedCategory, selectedTag],
    queryFn: () =>
      blogPublicApi.list({
        category_slug: selectedCategory || undefined,
        tag_slug: selectedTag || undefined,
        limit: 100,
      }),
    enabled: true,
  });

  // Get categories for navigation pills
  const { data: categories } = useQuery<any[]>({
    queryKey: ["publicBlogCategories"],
    queryFn: () => blogPublicApi.getCategories(),
  });

  // Get popular tags
  const { data: popularTags } = useQuery<any[]>({
    queryKey: ["publicBlogTags"],
    queryFn: () => blogPublicApi.getTags({ popular: true, limit: 12 }),
  });

  // Client side search filter
  const filteredPosts = useMemo(() => {
    return posts?.filter((post) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          post.title.toLowerCase().includes(query) ||
          post.excerpt?.toLowerCase().includes(query)
        );
      }
      return true;
    }) || [];
  }, [posts, searchQuery]);

  // Client side sort
  const sortedPosts = useMemo(() => {
    const list = [...filteredPosts];
    if (sortBy === "views") {
      return list.sort((a, b) => b.view_count - a.view_count);
    }
    if (sortBy === "popular") {
      return list.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
    }
    // latest (default)
    return list.sort(
      (a, b) =>
        new Date(b.published_at || b.created_at).getTime() -
        new Date(a.published_at || a.created_at).getTime()
    );
  }, [filteredPosts, sortBy]);

  // Featured Posts
  const featuredPosts = useMemo(() => {
    return sortedPosts.filter((p) => p.is_featured).slice(0, 3);
  }, [sortedPosts]);

  // Regular (Non-featured) posts
  const regularPosts = useMemo(() => {
    return sortedPosts.filter((p) => !p.is_featured);
  }, [sortedPosts]);

  // Group regular posts dynamically by their categories
  const postsByCategory = useMemo(() => {
    const groups: Record<string, { slug: string; list: BlogPost[] }> = {};
    if (selectedCategory) return {}; // Skip grouping if a category filter is already active

    regularPosts.forEach((post) => {
      post.categories.forEach((cat) => {
        if (!groups[cat.name]) {
          groups[cat.name] = { slug: cat.slug, list: [] };
        }
        groups[cat.name].list.push(post);
      });
    });
    return groups;
  }, [regularPosts, selectedCategory]);

  return (
    <>
      <SEOHead
        title="BiHocam Blog - Eğitim, Teknoloji ve Gelişim"
        description="Eğitim, teknoloji, LGS/YKS hazırlık ve kişisel gelişim konularında öğretmenlerimizin kaleme aldığı güncel blog yazıları."
        canonicalUrl="/blog"
      />
      
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div>
          {/* Header Integration for complete navigation back and forth */}
          <Header />

          {/* Hero Section */}
          <div className="relative bg-slate-950 text-white pt-32 pb-20 min-h-[420px] flex items-center overflow-hidden border-b border-white/5">
            {/* Background Image with custom blend and scaling */}
            <div 
              className="absolute inset-0 bg-cover bg-center opacity-30 mix-blend-screen transform scale-105"
              style={{ backgroundImage: "url('/blog_banner_bg.png')" }}
            ></div>

            {/* Premium Radial and Linear Dark Overlays */}
            <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/80 to-slate-950"></div>
            
            {/* Elegant Dotted Grid pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1.5px,transparent_1.5px)] [background-size:32px_32px] opacity-40"></div>
            
            {/* Beautiful Colorful light flares */}
            <div className="absolute -top-12 left-1/4 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none animate-pulse"></div>
            <div className="absolute -bottom-12 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

            <div className="relative w-full max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 25 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7 }}
                className="space-y-6"
              >
                {/* Premium Badge */}
                <div className="inline-flex items-center gap-2 px-4.5 py-2 bg-white/5 border border-white/10 rounded-full text-teal-300 text-xs font-black tracking-widest uppercase backdrop-blur-md shadow-inner">
                  <span>🎓</span> Bilgi & Paylaşım Köprüsü
                </div>
                
                {/* Taller, heavier font size */}
                <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-tight">
                  BiHocam <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 via-teal-300 to-indigo-400">Blog</span>
                </h1>
                
                {/* Wider, highly legible typography */}
                <p className="text-slate-300 text-lg md:text-xl max-w-3xl mx-auto font-medium leading-relaxed">
                  Eğitim, teknoloji, sınav hazırlık yöntemleri ve kişisel gelişim üzerine uzman eğitmenlerimizden rehber içerikler.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Main Content Area */}
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">
            
            {/* Filters Bar & Clickable Categories pills */}
            <div className="space-y-6 mb-12">
              
              {/* Category selector pills - Very aesthetic & responsive */}
              <div className="bg-white rounded-[2rem] border border-slate-100 p-5 shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                  <span className="text-xs font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5">
                    <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block"></span>
                    Kategorilere Göre Keşfedin
                  </span>
                  {selectedCategory && (
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className="text-xs font-bold text-rose-500 hover:text-rose-600 transition-colors"
                    >
                      Filtreyi Temizle ×
                    </button>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-2.5">
                  <button
                    onClick={() => { setSelectedCategory(null); setSelectedTag(null); }}
                    className={`px-4.5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5 ${
                      selectedCategory === null
                        ? "bg-blue-600 text-white shadow-blue-500/15"
                        : "bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-100"
                    }`}
                  >
                    ✨ Tüm Yazılar
                  </button>
                  {categories?.map((cat) => {
                    const isActive = selectedCategory === cat.slug;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => { setSelectedCategory(cat.slug); setSelectedTag(null); }}
                        className={`px-4.5 py-2.5 rounded-2xl text-xs font-black transition-all shadow-sm flex items-center gap-1.5 ${
                          isActive
                            ? "bg-blue-600 text-white shadow-blue-500/15"
                            : "bg-white hover:bg-slate-50 text-slate-600 border border-slate-200/60"
                        }`}
                      >
                        📂 {cat.name}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Search, Tag filter and Sort controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Search */}
                <div className="md:col-span-6 relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Yazı başlığı veya içeriğinde arayın..."
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-700 text-xs font-semibold shadow-sm placeholder-slate-400"
                  />
                </div>

                {/* Tag Dropdown filter */}
                <div className="md:col-span-3">
                  <select
                    value={selectedTag || ""}
                    onChange={(e) => setSelectedTag(e.target.value || null)}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-600 text-xs font-semibold shadow-sm"
                  >
                    <option value="">Tüm Etiketler</option>
                    {popularTags?.map((tag) => (
                      <option key={tag.id} value={tag.slug}>
                        🏷️ {tag.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort */}
                <div className="md:col-span-3">
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="w-full px-4 py-3.5 bg-white border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-600/10 focus:border-blue-600 text-slate-600 text-xs font-semibold shadow-sm"
                  >
                    <option value="latest">⏰ En Yeni Yazılar</option>
                    <option value="popular">⭐️ Öne Çıkanlar</option>
                    <option value="views">🔥 En Çok Okunanlar</option>
                  </select>
                </div>
              </div>

            </div>

            <AdBanner placementCode="blog_page_banner" className="mb-12" />

            {postsLoading ? (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-20 text-center shadow-sm">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                <p className="text-slate-400 font-bold text-xs">Yazılar yükleniyor, lütfen bekleyin...</p>
              </div>
            ) : sortedPosts.length === 0 ? (
              <div className="bg-white rounded-[2rem] border border-slate-100 p-16 text-center shadow-sm">
                <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-2xl">
                  📭
                </div>
                <h3 className="text-base font-black text-slate-800 mb-1">Eşleşen Yazı Bulunamadı</h3>
                <p className="text-slate-400 text-xs font-semibold max-w-sm mx-auto leading-relaxed">
                  Arama kriterlerinize veya seçili kategoriye uygun herhangi bir blog yazısı bulunmamaktadır.
                </p>
              </div>
            ) : (
              <div className="space-y-16">
                
                {/* 1. FEATURED SECTION (Only displayed if no category filter or search is active) */}
                {!selectedCategory && !searchQuery && featuredPosts.length > 0 && (
                  <div className="space-y-6">
                    <h2 className="text-xl font-black text-slate-800 tracking-wider uppercase flex items-center gap-1.5 leading-none">
                      <Sparkles className="w-5 h-5 text-amber-500" />
                      ÖNE ÇIKAN REHBERLER
                    </h2>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      {/* Left: Big Featured Post Card */}
                      <div className="lg:col-span-8">
                        {featuredPosts[0] && (
                          <div
                            onClick={() => router.push(`/blog/${featuredPosts[0].slug}`)}
                            className="bg-white border border-slate-100 rounded-[2.5rem] overflow-hidden shadow-sm hover:shadow-xl hover:border-slate-200/80 transition-all cursor-pointer group flex flex-col justify-between min-h-[460px]"
                          >
                            <div className="aspect-[21/9] bg-slate-100 relative overflow-hidden flex-shrink-0">
                              <img
                                src={featuredPosts[0].featured_image_url || getFallbackBlogImage(featuredPosts[0].slug)}
                                alt={featuredPosts[0].title}
                                onError={(e) => {
                                  e.currentTarget.src = getFallbackBlogImage(featuredPosts[0].slug);
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <span className="absolute top-4 left-4 px-3 py-1.5 bg-slate-900/85 text-white text-[10px] font-black rounded-lg uppercase tracking-wider flex items-center gap-1">
                                <Sparkles className="w-3 h-3 text-amber-400" /> ÖNE ÇIKAN
                              </span>
                            </div>
                            
                            <div className="p-6 sm:p-8 flex-1 flex flex-col justify-between">
                              <div className="space-y-3">
                                <div className="flex gap-2">
                                  {featuredPosts[0].categories.map((c) => (
                                    <span key={c.id} className="text-[10px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2.5 py-1 rounded-md">
                                      {c.name}
                                    </span>
                                  ))}
                                </div>
                                
                                <h3 className="text-2xl sm:text-3xl font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-tight font-serif">
                                  {featuredPosts[0].title}
                                </h3>
                                
                                <p className="text-slate-500 text-xs sm:text-sm leading-relaxed line-clamp-3">
                                  {featuredPosts[0].excerpt || "Eğitim yolculuğunuzda başarıyı yakalamak için uzman ipuçlarını ve makale detaylarını okuyun..."}
                                </p>
                              </div>

                              <div className="flex items-center justify-between pt-6 border-t border-slate-50 text-xs text-slate-400 font-bold mt-6">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1">
                                    <User className="w-3.5 h-3.5 text-slate-400" /> {featuredPosts[0].author.full_name}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Calendar className="w-3.5 h-3.5 text-slate-400" /> 
                                    {featuredPosts[0].published_at ? new Date(featuredPosts[0].published_at).toLocaleDateString("tr-TR") : "Eyl 2025"}
                                  </span>
                                </div>
                                <span className="text-blue-600 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                  Devamını Oku <ArrowRight className="w-3.5 h-3.5" />
                                </span>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>

                      {/* Right: Smaller Grid of Next 2 Featured Posts */}
                      <div className="lg:col-span-4 space-y-6">
                        {featuredPosts.slice(1, 3).map((post) => (
                          <div
                            key={post.id}
                            onClick={() => router.push(`/blog/${post.slug}`)}
                            className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-slate-200/50 transition-all cursor-pointer group space-y-3"
                          >
                            <div className="aspect-[21/9] rounded-2xl overflow-hidden bg-slate-50">
                              <img
                                src={post.featured_image_url || getFallbackBlogImage(post.slug)}
                                alt={post.title}
                                onError={(e) => {
                                  e.currentTarget.src = getFallbackBlogImage(post.slug);
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>
                            <span className="text-[9px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded inline-block">
                              {post.categories?.[0]?.name || "Eğitim"}
                            </span>
                            <h4 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug">
                              {post.title}
                            </h4>
                            <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-2 border-t border-slate-50">
                              <span>👤 {post.author.full_name}</span>
                              <span className="text-blue-600 flex items-center gap-0.5">Oku →</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* 2. DYNAMIC CATEGORY-BASED ROWS (Displayed on default index page) */}
                {(!selectedCategory && !searchQuery) ? (
                  <div className="space-y-16">
                    {Object.entries(postsByCategory).map(([catName, data]) => {
                      if (data.list.length === 0) return null;
                      return (
                        <div key={catName} className="space-y-6">
                          
                          {/* Row Header */}
                          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                            <h3 className="text-lg font-black text-slate-800 tracking-wider uppercase flex items-center gap-2">
                              <span className="w-1.5 h-4.5 bg-blue-600 rounded-full inline-block"></span>
                              {catName}
                            </h3>
                            <button
                              onClick={() => setSelectedCategory(data.slug)}
                              className="text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-colors flex items-center gap-0.5"
                            >
                              Tümünü Gör <ChevronRight className="w-4 h-4" />
                            </button>
                          </div>

                          {/* Row Cards (Max 3) */}
                          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {data.list.slice(0, 3).map((post) => (
                              <div
                                key={post.id}
                                onClick={() => router.push(`/blog/${post.slug}`)}
                                className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:border-slate-200/50 transition-all cursor-pointer group flex flex-col justify-between min-h-[360px]"
                              >
                                <div>
                                  <div className="aspect-video bg-slate-50 rounded-2xl overflow-hidden mb-4">
                                    <img
                                      src={post.featured_image_url || getFallbackBlogImage(post.slug)}
                                      alt={post.title}
                                      onError={(e) => {
                                        e.currentTarget.src = getFallbackBlogImage(post.slug);
                                      }}
                                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-350"
                                    />
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-wider block">
                                      {post.categories?.[0]?.name || catName}
                                    </span>
                                    <h4 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug font-serif">
                                      {post.title}
                                    </h4>
                                    <p className="text-slate-500 text-xs leading-relaxed line-clamp-2">
                                      {post.excerpt || "Ders anlatımları, püf noktaları ve daha fazlası için tıklayın..."}
                                    </p>
                                  </div>
                                </div>

                                <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-4 border-t border-slate-50 mt-4 flex-shrink-0">
                                  <span className="flex items-center gap-1">
                                    <Eye className="w-3.5 h-3.5" /> {post.view_count.toLocaleString()}
                                  </span>
                                  <span className="text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                                    Oku →
                                  </span>
                                </div>
                              </div>
                            ))}
                          </div>

                        </div>
                      );
                    })}
                  </div>
                ) : (
                  
                  // 3. FILTERED GRID VIEW (Displayed when a specific category, tag or search is active)
                  <div className="space-y-6">
                    <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                      <h2 className="text-lg font-black text-slate-800 tracking-wider uppercase flex items-center gap-2">
                        <span className="w-1.5 h-4.5 bg-blue-600 rounded-full inline-block"></span>
                        {selectedCategory ? `Kategori: ${selectedCategory.toUpperCase()}` : selectedTag ? `Etiket: #${selectedTag.toUpperCase()}` : "Arama Sonuçları"}
                      </h2>
                      <button
                        onClick={() => { setSelectedCategory(null); setSelectedTag(null); setSearchQuery(""); }}
                        className="text-xs font-extrabold text-blue-600 hover:text-blue-700 transition-colors"
                      >
                        ← Tümüne Dön
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {sortedPosts.map((post) => (
                        <div
                          key={post.id}
                          onClick={() => router.push(`/blog/${post.slug}`)}
                          className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm hover:shadow-lg hover:border-slate-200/50 transition-all cursor-pointer group flex flex-col justify-between min-h-[380px]"
                        >
                          <div>
                            <div className="aspect-video bg-slate-50 rounded-2xl overflow-hidden mb-4">
                              <img
                                src={post.featured_image_url || getFallbackBlogImage(post.slug)}
                                alt={post.title}
                                onError={(e) => {
                                  e.currentTarget.src = getFallbackBlogImage(post.slug);
                                }}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              />
                            </div>

                            <div className="space-y-2">
                              <div className="flex gap-1.5">
                                {post.categories.slice(0, 2).map((cat) => (
                                  <span key={cat.id} className="text-[9px] font-black text-blue-600 uppercase tracking-wider bg-blue-50 px-2 py-0.5 rounded">
                                    {cat.name}
                                  </span>
                                ))}
                              </div>
                              <h3 className="text-base font-black text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug font-serif">
                                {post.title}
                              </h3>
                              <p className="text-slate-500 text-xs leading-relaxed line-clamp-3">
                                {post.excerpt || "Eğitmen rehberlik detaylarını ve konu anlatımını incelemek için yazının devamını okuyun..."}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center justify-between text-[10px] text-slate-400 font-bold pt-4 border-t border-slate-50 mt-4 flex-shrink-0">
                            <span className="flex items-center gap-1">
                              👤 {post.author.full_name}
                            </span>
                            <span className="text-blue-600 flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform">
                              Oku →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}

          </main>
        </div>

        {/* Footer Integration */}
        <Footer />
      </div>
    </>
  );
}
