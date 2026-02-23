"use client";

/**
 * EPIC-BLOG: Public Author Page (EP13-FE-11)
 * 
 * SEO-optimized public author profile page with their blog posts
 * Aesthetic: "Editorial Magazine / Luxury Refined" - Author profile with elegant design
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Eye,
  User,
  BookOpen,
  Loader2,
  Mail,
  FileText,
  TrendingUp,
} from "lucide-react";
import { blogPublicApi, type BlogPost } from "@/lib/api";
import Link from "next/link";
import { SEOHead } from "@/components/blog/SEOHead";

export default function AuthorPage() {
  const params = useParams();
  const authorId = params.authorId as string;
  const [page, setPage] = useState(1);
  const limit = 12;

  const { data: authorData, isLoading } = useQuery({
    queryKey: ["publicAuthor", authorId, page],
    queryFn: () => blogPublicApi.getAuthor(authorId, { skip: (page - 1) * limit, limit }),
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Yazar bilgileri yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!authorData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 flex items-center justify-center">
        <div className="text-center">
          <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Yazar Bulunamadı</h2>
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

  const { author, posts, total } = authorData;
  const totalPages = Math.ceil(total / limit);
  const totalViews = posts.reduce((sum, post) => sum + post.view_count, 0);

  return (
    <>
      <SEOHead
        title={`${author.full_name} - Blog Yazarı`}
        description={author.bio || `${author.full_name} tarafından yazılan blog yazıları`}
        canonicalUrl={`/blog/author/${author.id}`}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-indigo-900 via-purple-800 to-pink-900 text-white py-24 overflow-hidden">
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
              className="flex flex-col md:flex-row items-center md:items-start gap-8"
            >
              {/* Avatar */}
              <div className="relative">
                {author.avatar_url ? (
                  <img
                    src={author.avatar_url}
                    alt={author.full_name}
                    className="w-32 h-32 rounded-full border-4 border-white/30 shadow-2xl object-cover"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full border-4 border-white/30 shadow-2xl bg-gradient-to-br from-indigo-400 to-purple-500 flex items-center justify-center">
                    <User className="w-16 h-16 text-white" />
                  </div>
                )}
              </div>

              {/* Author Info */}
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-5xl md:text-6xl font-bold mb-4 tracking-tight">
                  {author.full_name}
                </h1>
                {author.bio && (
                  <p className="text-xl text-white/90 max-w-3xl leading-relaxed mb-6">
                    {author.bio}
                  </p>
                )}
                <div className="flex items-center justify-center md:justify-start gap-6 text-white/80">
                  <span className="flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    {total} yazı
                  </span>
                  <span className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    {totalViews.toLocaleString()} görüntülenme
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Breadcrumb */}
        <div className="bg-white/50 backdrop-blur-sm border-b border-gray-200/50">
          <div className="max-w-7xl mx-auto px-6 py-4">
            <nav className="flex items-center gap-2 text-sm text-gray-600">
              <Link href="/" className="hover:text-indigo-600 transition-colors">
                Ana Sayfa
              </Link>
              <span>/</span>
              <Link href="/blog" className="hover:text-indigo-600 transition-colors">
                Blog
              </Link>
              <span>/</span>
              <span className="text-gray-900 font-medium">{author.full_name}</span>
            </nav>
          </div>
        </div>

        {/* Posts Grid */}
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">
              {author.full_name}'ın Yazıları
            </h2>
            <p className="text-gray-600">
              {total} yazı bulundu
            </p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center py-20">
              <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-gray-800 mb-2">
                Henüz yazı yok
              </h3>
              <p className="text-gray-600">
                Bu yazar henüz blog yazısı yayınlamamış.
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
                    className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 overflow-hidden hover:shadow-2xl hover:border-indigo-300/50 transition-all group"
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
                      <div className="h-48 bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
                        <BookOpen className="w-16 h-16 text-indigo-600/50" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        {post.categories.slice(0, 2).map((cat) => (
                          <Link
                            key={cat.id}
                            href={`/blog/category/${cat.slug}`}
                            className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-lg text-xs font-medium hover:bg-indigo-100 transition-colors"
                          >
                            {cat.name}
                          </Link>
                        ))}
                      </div>
                      <Link href={`/blog/${post.slug}`}>
                        <h2 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors line-clamp-2">
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
                          className="flex items-center gap-1 text-indigo-600 hover:text-indigo-700 font-medium group-hover:gap-2 transition-all"
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
