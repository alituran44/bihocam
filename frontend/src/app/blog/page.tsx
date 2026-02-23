"use client";

/**
 * EPIC-BLOG: Public Blog List Page (EP13-FE-08)
 * 
 * SEO-optimized public blog listing with modern, distinctive design
 * Aesthetic: "Editorial Magazine / Luxury Refined" - Asymmetric layouts, elegant typography, sophisticated color palette
 */

import { useState } from "react";
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
  TrendingUp,
} from "lucide-react";
import { blogPublicApi, type BlogPost, type BlogCategory, type BlogTag } from "@/lib/api";
import Link from "next/link";
import { SEOHead } from "@/components/blog/SEOHead";
import BlogSidebar from "@/components/blog/BlogSidebar";

export default function BlogListPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<"latest" | "popular" | "views">("latest");

  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["publicBlogPosts", selectedCategory, selectedTag, sortBy],
    queryFn: () =>
      blogPublicApi.list({
        category_slug: selectedCategory || undefined,
        tag_slug: selectedTag || undefined,
        featured: sortBy === "popular" ? true : undefined,
        limit: 50,
      }),
    enabled: true,
  });

  const { data: categories } = useQuery({
    queryKey: ["publicBlogCategories"],
    queryFn: () => blogPublicApi.getCategories(),
  });

  const { data: popularTags } = useQuery({
    queryKey: ["publicBlogTags"],
    queryFn: () => blogPublicApi.getTags({ popular: true, limit: 20 }),
  });

  const filteredPosts = posts?.filter((post) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        post.title.toLowerCase().includes(query) ||
        post.excerpt?.toLowerCase().includes(query)
      );
    }
    return true;
  }) || [];

  const sortedPosts = [...(filteredPosts || [])].sort((a, b) => {
    if (sortBy === "views") {
      return b.view_count - a.view_count;
    }
    if (sortBy === "popular") {
      return (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0);
    }
    // latest
    return new Date(b.published_at || b.created_at).getTime() - new Date(a.published_at || a.created_at).getTime();
  });

  const featuredPosts = sortedPosts.filter((p) => p.is_featured).slice(0, 3);
  const regularPosts = sortedPosts.filter((p) => !p.is_featured);

  return (
    <>
      <SEOHead
        title="Blog - BiHocam"
        description="Eğitim, teknoloji ve kişisel gelişim konularında güncel blog yazıları"
        canonicalUrl="/blog"
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/10 to-amber-50/10">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white py-20 overflow-hidden">
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.05'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
            }}
          ></div>
          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center"
            >
              <h1 className="text-6xl md:text-7xl font-serif font-bold mb-6 tracking-tight">
                BiHocam Blog
              </h1>
              <p className="text-xl md:text-2xl text-teal-100 max-w-2xl mx-auto leading-relaxed">
                Eğitim, teknoloji ve kişisel gelişim konularında güncel içerikler
              </p>
            </motion.div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-3">
          {/* Filters & Search */}
          <div className="mb-12">
            <div className="bg-white rounded-2xl border-2 border-gray-200 p-6 shadow-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Yazılarda ara..."
                    className="w-full pl-12 pr-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                  />
                </div>
                <select
                  value={selectedCategory || ""}
                  onChange={(e) => setSelectedCategory(e.target.value || null)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                >
                  <option value="">Tüm Kategoriler</option>
                  {categories?.map((cat) => (
                    <option key={cat.id} value={cat.slug}>
                      {cat.name}
                    </option>
                  ))}
                </select>
                <select
                  value={selectedTag || ""}
                  onChange={(e) => setSelectedTag(e.target.value || null)}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                >
                  <option value="">Tüm Etiketler</option>
                  {popularTags?.map((tag) => (
                    <option key={tag.id} value={tag.slug}>
                      {tag.name}
                    </option>
                  ))}
                </select>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "latest" | "popular" | "views")}
                  className="px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-gray-900"
                >
                  <option value="latest">En Yeni</option>
                  <option value="popular">Popüler</option>
                  <option value="views">En Çok Okunan</option>
                </select>
              </div>
            </div>
          </div>

          {/* Featured Posts */}
          {featuredPosts.length > 0 && (
            <div className="mb-16">
              <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-teal-600" />
                Öne Çıkan Yazılar
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {featuredPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="group relative bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl hover:border-teal-300 transition-all cursor-pointer"
                    onClick={() => router.push(`/blog/${post.slug}`)}
                  >
                    {post.featured_image_url && (
                      <div className="relative h-48 overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute top-4 left-4">
                          <span className="px-3 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Öne Çıkan
                          </span>
                        </div>
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-xl font-serif font-bold text-gray-900 mb-3 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {post.author.full_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString("tr-TR")
                              : "Yayınlanmadı"}
                          </div>
                        </div>
                        <div className="flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          {post.view_count.toLocaleString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-4">
                        {post.categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat.id}
                            className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium"
                          >
                            <FolderOpen className="w-3 h-3" />
                            {cat.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-3 transition-all">
                        Devamını Oku
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            </div>
          )}

          {/* Regular Posts Grid */}
          <div>
            <h2 className="text-3xl font-serif font-bold text-gray-900 mb-6 flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-teal-600" />
              Tüm Yazılar
            </h2>
            {postsLoading ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Yazılar yükleniyor...</p>
              </div>
            ) : regularPosts.length === 0 ? (
              <div className="bg-white rounded-2xl border-2 border-gray-200 p-12 text-center">
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz Blog Yazısı Yok</h3>
                <p className="text-gray-600">Yakında içerikler eklenecek</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {regularPosts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="group bg-white rounded-2xl border-2 border-gray-200 overflow-hidden shadow-lg hover:shadow-2xl hover:border-teal-300 transition-all cursor-pointer"
                    onClick={() => router.push(`/blog/${post.slug}`)}
                  >
                    {post.featured_image_url && (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={post.featured_image_url}
                          alt={post.title}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      </div>
                    )}
                    <div className="p-6">
                      <h3 className="text-lg font-serif font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-teal-600 transition-colors">
                        {post.title}
                      </h3>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-2 text-sm leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {post.author.full_name}
                          </div>
                          <div className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.view_count.toLocaleString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-wrap mb-3">
                        {post.categories.slice(0, 2).map((cat) => (
                          <span
                            key={cat.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-teal-50 text-teal-700 rounded text-xs font-medium"
                          >
                            {cat.name}
                          </span>
                        ))}
                        {post.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs font-medium"
                          >
                            <Tag className="w-3 h-3" />
                            {tag.name}
                          </span>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 text-teal-600 font-semibold text-sm group-hover:gap-3 transition-all">
                        Devamını Oku
                        <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>
            )}
          </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <BlogSidebar />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
