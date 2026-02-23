"use client";

/**
 * EPIC-BLOG: Blog Sidebar Component (EP13-FE-13)
 * 
 * Public blog sidebar with categories, tags, and recent posts
 * Aesthetic: "Editorial Magazine / Luxury Refined" - Elegant sidebar design
 */

import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  FolderOpen,
  Tag,
  Calendar,
  Eye,
  ArrowRight,
  BookOpen,
  TrendingUp,
  Hash,
} from "lucide-react";
import { blogPublicApi, type BlogPost, type BlogCategory, type BlogTag } from "@/lib/api";
import Link from "next/link";

export default function BlogSidebar() {
  const { data: categories } = useQuery({
    queryKey: ["publicBlogCategories"],
    queryFn: () => blogPublicApi.getCategories(),
  });

  const { data: popularTags } = useQuery({
    queryKey: ["publicBlogPopularTags"],
    queryFn: () => blogPublicApi.getTags({ popular: true, limit: 20 }),
  });

  const { data: recentPosts } = useQuery({
    queryKey: ["publicBlogRecentPosts"],
    queryFn: () => blogPublicApi.list({ limit: 5 }),
  });

  return (
    <aside className="space-y-8">
      {/* Categories */}
      {categories && categories.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <FolderOpen className="w-5 h-5 text-teal-600" />
            <h3 className="text-xl font-bold text-gray-900">Kategoriler</h3>
          </div>
          <div className="space-y-2">
            {categories.slice(0, 10).map((category) => (
              <Link
                key={category.id}
                href={`/blog/category/${category.slug}`}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-teal-50/50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  {category.icon && (
                    <span className="text-lg">{category.icon}</span>
                  )}
                  {category.color && (
                    <div
                      className="w-3 h-3 rounded-full border border-gray-300"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                  <span className="text-gray-700 group-hover:text-teal-600 font-medium transition-colors">
                    {category.name}
                  </span>
                </div>
                <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-teal-600 opacity-0 group-hover:opacity-100 transition-all" />
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Popular Tags */}
      {popularTags && popularTags.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <Tag className="w-5 h-5 text-orange-600" />
            <h3 className="text-xl font-bold text-gray-900">Popüler Etiketler</h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {popularTags.slice(0, 15).map((tag) => (
              <Link
                key={tag.id}
                href={`/blog/tag/${tag.slug}`}
                className="px-3 py-1.5 bg-orange-50 text-orange-700 rounded-lg text-sm font-medium hover:bg-orange-100 hover:shadow-md transition-all group"
              >
                <Hash className="w-3 h-3 inline mr-1" />
                {tag.name}
                {tag.usage_count > 0 && (
                  <span className="ml-1 text-xs text-orange-500">
                    ({tag.usage_count})
                  </span>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Posts */}
      {recentPosts && recentPosts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 shadow-lg"
        >
          <div className="flex items-center gap-3 mb-4">
            <BookOpen className="w-5 h-5 text-indigo-600" />
            <h3 className="text-xl font-bold text-gray-900">Son Yazılar</h3>
          </div>
          <div className="space-y-4">
            {recentPosts.slice(0, 5).map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="block p-3 rounded-lg hover:bg-indigo-50/50 transition-colors group"
              >
                <div className="flex items-start gap-3">
                  {post.featured_image_url ? (
                    <img
                      src={post.featured_image_url}
                      alt={post.title}
                      className="w-16 h-16 rounded-lg object-cover flex-shrink-0"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center flex-shrink-0">
                      <BookOpen className="w-8 h-8 text-indigo-600/50" />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors line-clamp-2 text-sm mb-1">
                      {post.title}
                    </h4>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("tr-TR", {
                              day: "numeric",
                              month: "short",
                            })
                          : ""}
                      </span>
                      <span className="flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        {post.view_count.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </motion.div>
      )}

      {/* Newsletter CTA (Optional) */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-500 rounded-2xl p-6 text-white shadow-xl"
      >
        <div className="text-center">
          <TrendingUp className="w-10 h-10 mx-auto mb-3 opacity-80" />
          <h3 className="text-xl font-bold mb-2">Blog Güncellemeleri</h3>
          <p className="text-sm text-white/90 mb-4">
            Yeni yazılarımızdan haberdar olmak için bültenimize abone olun
          </p>
          <button className="w-full px-4 py-2 bg-white text-teal-600 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
            Abone Ol
          </button>
        </div>
      </motion.div>
    </aside>
  );
}
