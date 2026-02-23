"use client";

/**
 * EPIC-BLOG: Blog Post List Page (EP13-FE-05)
 * 
 * Admin/Teacher dashboard for managing blog posts
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Plus,
  Search,
  Filter,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  Tag,
  FolderOpen,
  TrendingUp,
  FileText,
  Sparkles,
  MoreVertical,
  User,
} from "lucide-react";
import {
  blogPostsApi,
  blogAdminApi,
  blogCategoriesApi,
  blogTagsApi,
  type BlogPost,
  type BlogPostStatus,
} from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";
import { useAuthStore } from "@/lib/store";

const STATUS_COLORS: Record<BlogPostStatus, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  pending_review: "bg-yellow-100 text-yellow-800 border-yellow-200",
  published: "bg-green-100 text-green-800 border-green-200",
  archived: "bg-orange-100 text-orange-800 border-orange-200",
};

const STATUS_LABELS: Record<BlogPostStatus, string> = {
  draft: "Taslak",
  pending_review: "Onay Bekliyor",
  published: "Yayınlandı",
  archived: "Arşivlendi",
};

export default function BlogPostsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";
  
  const [statusFilter, setStatusFilter] = useState<BlogPostStatus | "all">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [tagFilter, setTagFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(1);
  const limit = 20;

  // Fetch posts - Admin tüm yazıları, Teacher sadece kendi yazılarını görür
  const { data: posts, isLoading: postsLoading } = useQuery({
    queryKey: ["blogPosts", statusFilter, categoryFilter, tagFilter, searchQuery, page, isAdmin],
    queryFn: () => {
      if (isAdmin) {
        return blogAdminApi.listAllPosts({
          status: statusFilter !== "all" ? statusFilter : undefined,
          skip: (page - 1) * limit,
          limit,
        });
      } else {
        return blogPostsApi.getMyPosts({
          status: statusFilter !== "all" ? statusFilter : undefined,
          skip: (page - 1) * limit,
          limit,
        });
      }
    },
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: ["blogCategories"],
    queryFn: () => blogCategoriesApi.list({ is_active: true, limit: 1000 }),
  });

  // Fetch tags
  const { data: tags } = useQuery({
    queryKey: ["blogTags"],
    queryFn: () => blogTagsApi.list({ limit: 1000 }),
  });

  // Delete mutation - Admin tüm yazıları silebilir, Teacher sadece kendi yazılarını
  const deleteMutation = useMutation({
    mutationFn: (postId: string) => 
      isAdmin ? blogAdminApi.deletePost(postId) : blogPostsApi.delete(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      toast.success("Blog yazısı silindi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Silme işlemi başarısız");
    },
  });

  // Publish/Unpublish mutation - Admin tüm yazıları yayınlayabilir, Teacher sadece kendi yazılarını
  const publishMutation = useMutation({
    mutationFn: ({ postId, action }: { postId: string; action: "publish" | "unpublish" }) => {
      if (isAdmin) {
        // Admin için update endpoint kullanarak status değiştir
        return action === "publish" 
          ? blogAdminApi.updatePost(postId, { status: "published" })
          : blogAdminApi.updatePost(postId, { status: "draft" });
      } else {
        return action === "publish" 
          ? blogPostsApi.publish(postId) 
          : blogPostsApi.unpublish(postId);
      }
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      toast.success(variables.action === "publish" ? "Blog yazısı yayınlandı" : "Blog yazısı taslağa çevrildi");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "İşlem başarısız");
    },
  });

  const filteredPosts = posts?.filter((post) => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      if (
        !post.title.toLowerCase().includes(query) &&
        !post.excerpt?.toLowerCase().includes(query)
      ) {
        return false;
      }
    }
    if (categoryFilter !== "all") {
      if (!post.categories.some((cat) => cat.id === categoryFilter)) {
        return false;
      }
    }
    if (tagFilter !== "all") {
      if (!post.tags.some((tag) => tag.id === tagFilter)) {
        return false;
      }
    }
    return true;
  }) || [];

  const stats = {
    total: posts?.length || 0,
    published: posts?.filter((p) => p.status === "published").length || 0,
    draft: posts?.filter((p) => p.status === "draft").length || 0,
    totalViews: posts?.reduce((sum, p) => sum + p.view_count, 0) || 0,
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <FileText className="w-8 h-8 text-teal-600" />
              Blog Yazılarım
            </h1>
            <p className="text-gray-600 mt-1">Blog yazılarınızı yönetin ve düzenleyin</p>
          </div>
          <button
            onClick={() => router.push("/dashboard/blog/posts/new")}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg hover:shadow-xl"
          >
            <Plus className="w-5 h-5" />
            Yeni Yazı
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Yazı</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <FileText className="w-10 h-10 text-teal-600 opacity-50" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Yayınlanan</p>
                <p className="text-2xl font-bold text-green-600">{stats.published}</p>
              </div>
              <Eye className="w-10 h-10 text-green-600 opacity-50" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Taslak</p>
                <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
              </div>
              <EyeOff className="w-10 h-10 text-gray-600 opacity-50" />
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-lg"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Toplam Görüntülenme</p>
                <p className="text-2xl font-bold text-teal-600">{stats.totalViews.toLocaleString()}</p>
              </div>
              <TrendingUp className="w-10 h-10 text-teal-600 opacity-50" />
            </div>
          </motion.div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border-2 border-gray-200 p-4 shadow-lg">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Ara..."
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as BlogPostStatus | "all")}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">Tüm Durumlar</option>
              <option value="draft">Taslak</option>
              <option value="published">Yayınlandı</option>
              <option value="archived">Arşivlendi</option>
            </select>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">Tüm Kategoriler</option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
            <select
              value={tagFilter}
              onChange={(e) => setTagFilter(e.target.value)}
              className="px-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="all">Tüm Etiketler</option>
              {tags?.map((tag) => (
                <option key={tag.id} value={tag.id}>
                  {tag.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Posts List */}
        {postsLoading ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Yazılar yükleniyor...</p>
          </div>
        ) : filteredPosts.length === 0 ? (
          <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-800 mb-2">Henüz Blog Yazınız Yok</h3>
            <p className="text-gray-600 mb-6">İlk blog yazınızı oluşturmak için yukarıdaki butona tıklayın</p>
            <button
              onClick={() => router.push("/dashboard/blog/posts/new")}
              className="px-6 py-3 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-xl hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg"
            >
              <Plus className="w-5 h-5 inline mr-2" />
              Yeni Yazı Oluştur
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredPosts.map((post, index) => (
              <motion.div
                key={post.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl border-2 border-gray-200 p-6 hover:border-teal-300 hover:shadow-xl transition-all"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{post.title}</h3>
                      {post.is_featured && (
                        <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-orange-500 text-white text-xs font-bold rounded-full flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Öne Çıkan
                        </span>
                      )}
                      {post.is_pinned && (
                        <span className="px-2 py-1 bg-gradient-to-r from-teal-400 to-cyan-500 text-white text-xs font-bold rounded-full">
                          📌 Sabitlenmiş
                        </span>
                      )}
                      <span
                        className={`px-3 py-1 rounded-lg text-sm font-semibold border-2 ${STATUS_COLORS[post.status]}`}
                      >
                        {STATUS_LABELS[post.status]}
                      </span>
                    </div>
                    {post.excerpt && (
                      <p className="text-gray-600 mb-4 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                      {isAdmin && post.author && (
                        <div className="flex items-center gap-1">
                          <User className="w-4 h-4" />
                          {post.author.full_name || "Bilinmeyen Yazar"}
                        </div>
                      )}
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {post.published_at
                          ? new Date(post.published_at).toLocaleDateString("tr-TR")
                          : "Yayınlanmadı"}
                      </div>
                      <div className="flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {post.view_count.toLocaleString()} görüntülenme
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      {post.categories.map((cat) => (
                        <span
                          key={cat.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-teal-50 text-teal-700 rounded-lg text-xs font-medium"
                        >
                          <FolderOpen className="w-3 h-3" />
                          {cat.name}
                        </span>
                      ))}
                      {post.tags.map((tag) => (
                        <span
                          key={tag.id}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded-lg text-xs font-medium"
                        >
                          <Tag className="w-3 h-3" />
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {post.status === "published" ? (
                      <button
                        onClick={() => publishMutation.mutate({ postId: post.id, action: "unpublish" })}
                        className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Taslağa Çevir"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                    ) : (
                      <button
                        onClick={() => publishMutation.mutate({ postId: post.id, action: "publish" })}
                        className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Yayınla"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => router.push(`/dashboard/blog/posts/${post.id}/edit`)}
                      className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Düzenle"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm("Bu yazıyı silmek istediğinize emin misiniz?")) {
                          deleteMutation.mutate(post.id);
                        }
                      }}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Sil"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
