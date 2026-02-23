"use client";

/**
 * EPIC-BLOG: Public Tag Page (EP13-FE-10)
 * 
 * SEO-optimized public tag page with filtered blog posts
 * Aesthetic: "Editorial Magazine / Luxury Refined" - Asymmetric layouts, elegant typography
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Eye,
  Tag,
  ArrowRight,
  BookOpen,
  Loader2,
  Hash,
} from "lucide-react";
import { blogPublicApi, type BlogPost, type BlogTag } from "@/lib/api";
import Link from "next/link";
import { SEOHead } from "@/components/blog/SEOHead";

export default function TagPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: tagData, isLoading } = useQuery({
    queryKey: ["publicTag", slug, page],
    queryFn: () => blogPublicApi.getTag(slug, { skip: (page - 1) * limit, limit }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Etiket yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!tagData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 flex items-center justify-center">
        <div className="text-center">
          <Tag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Etiket Bulunamadı</h2>
          <Link
            href="/blog"
            className="text-teal-600 hover:text-teal-700 font-medium"
          >
            Blog'a dön
          </Link>
        </div>
      </div>
    );
  }

  const { tag, posts, total } = tagData;
  const totalPages = Math.ceil(total / limit);

  return (
    <>
      <SEOHead
        title={`${tag.name} - Blog Etiketi`}
        description={tag.description || `${tag.name} etiketindeki blog yazıları`}
        canonicalUrl={`/blog/tag/${tag.slug}`}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-orange-900 via-orange-800 to-amber-900 text-white py-20 overflow-hidden">
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
            }}
          />
          <div className="relative max-w-7xl mx-auto px-6">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              <div className="flex items-center gap-3 mb-4">
                <Hash className="w-8 h-8 text-white/80" />
                <Tag className="w-8 h-8 text-white/80" />
              </div>
              <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                #{tag.name}
              </h1>
              {tag.description && (
                <p className="text-xl text-white/90 max-w-3xl leading-relaxed">
                  {tag.description}
                </p>
              )}
              <div className="mt-6 flex items-center gap-4 text-white/80">
                <span className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5" />
                  {total} yazı
                </span>
                <span className="flex items-center gap-2">
                  <Tag className="w-5 h-5" />
                  {tag.usage_count} kullanım
                </span>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-orange-600 transition-colors">
                Ana Sayfa
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-orange-600 transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">#{tag.name}</span>
            </nav>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          {posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Bu etikette henüz yazı yok
              </h3>
              <p className="text-gray-600">
                Yakında bu etikette yeni yazılar yayınlanacak.
              </p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
                {posts.map((post, index) => (
                  <motion.article
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 overflow-hidden hover:shadow-2xl hover:border-orange-300/50 transition-all group"
                  >
                    {post.featured_image_url ? (
                      <Link href={`/blog/${post.slug}`}>
                        <div className="relative h-48 overflow-hidden">
                          <img
                            src={post.featured_image_url}
                            alt={post.title}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                          {post.is_featured && (
                            <div className="absolute top-4 right-4 px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full">
                              Öne Çıkan
                            </div>
                          )}
                        </div>
                      </Link>
                    ) : (
                      <div className="h-48 bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-orange-600/50" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {post.tags.slice(0, 3).map((t) => (
                          <Link
                            key={t.id}
                            href={`/blog/tag/${t.slug}`}
                            className="px-2 py-1 bg-orange-50 text-orange-700 rounded-lg text-xs font-medium hover:bg-orange-100 transition-colors"
                          >
                            #{t.name}
                          </Link>
                        ))}
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-orange-600 transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                      </Link>
                      {post.excerpt && (
                        <p className="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">
                          {post.excerpt}
                        </p>
                      )}
                      <div className="flex items-center justify-between text-xs text-gray-500 pt-4 border-t border-gray-200/50">
                        <div className="flex items-center gap-4">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {post.published_at
                              ? new Date(post.published_at).toLocaleDateString("tr-TR")
                              : "Yayınlanmadı"}
                          </span>
                          <span className="flex items-center gap-1">
                            <Eye className="w-3 h-3" />
                            {post.view_count.toLocaleString()}
                          </span>
                        </div>
                        <Link
                          href={`/blog/${post.slug}`}
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-700 font-medium group-hover:gap-2 transition-all"
                        >
                          Oku
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  </motion.article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2">
                  <button
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    disabled={page === 1}
                    className="px-4 py-2 border-2 border-gray-300/50 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Önceki
                  </button>
                  <span className="px-4 py-2 text-gray-700">
                    Sayfa {page} / {totalPages}
                  </span>
                  <button
                    onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                    className="px-4 py-2 border-2 border-gray-300/50 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Sonraki
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
}
