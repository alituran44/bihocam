"use client";

/**
 * EPIC-BLOG: Pending Review Posts Page (Admin)
 * 
 * Admin panel for reviewing and approving/rejecting blog posts
 */

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  XCircle,
  Eye,
  User,
  Calendar,
  FileText,
  AlertCircle,
  Loader2,
} from "lucide-react";
import {
  blogAdminApi,
  type BlogPost,
} from "@/lib/api";
import { toast } from "sonner";
import { motion } from "framer-motion";

export default function PendingReviewPostsPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-blog-pending"],
    queryFn: () => blogAdminApi.listPendingPosts({ limit: 100 }),
  });

  const approveMutation = useMutation({
    mutationFn: (postId: string) => blogAdminApi.approvePost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Yazı onaylandı ve yayınlandı");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Onaylama sırasında bir hata oluştu");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (postId: string) => blogAdminApi.rejectPost(postId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-blog-pending"] });
      queryClient.invalidateQueries({ queryKey: ["admin-blog-posts"] });
      toast.success("Yazı reddedildi ve taslağa döndürüldü");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Reddetme sırasında bir hata oluştu");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Onay Bekleyen Yazılar</h1>
          <p className="text-gray-600 mt-2">
            {posts?.length || 0} yazı admin onayı bekliyor
          </p>
        </div>
      </div>

      {!posts || posts.length === 0 ? (
        <div className="bg-white rounded-xl border-2 border-gray-200 p-12 text-center">
          <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Onay Bekleyen Yazı Yok
          </h3>
          <p className="text-gray-600">
            Şu anda onay bekleyen blog yazısı bulunmuyor.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6">
          {posts.map((post) => (
            <motion.div
              key={post.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border-2 border-yellow-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
                    {post.excerpt && (
                      <p className="text-gray-600 text-sm mb-3 line-clamp-2">{post.excerpt}</p>
                    )}
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{post.author?.full_name || "Bilinmeyen"}</span>
                      </div>
                      {post.created_at && (
                        <div className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(post.created_at).toLocaleDateString("tr-TR")}</span>
                        </div>
                      )}
                      {post.categories && post.categories.length > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          <span>{post.categories.length} kategori</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    <button
                      onClick={() => router.push(`/dashboard/blog/posts/${post.id}/edit`)}
                      className="p-2 text-gray-600 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                      title="Detayları Görüntüle"
                    >
                      <Eye className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-4 border-t border-gray-200">
                  <button
                    onClick={() => {
                      if (confirm("Bu yazıyı onaylayıp yayınlamak istediğinize emin misiniz?")) {
                        approveMutation.mutate(post.id);
                      }
                    }}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {approveMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="w-4 h-4" />
                    )}
                    Onayla ve Yayınla
                  </button>
                  <button
                    onClick={() => {
                      if (confirm("Bu yazıyı reddetmek istediğinize emin misiniz? Yazı taslağa döndürülecektir.")) {
                        rejectMutation.mutate(post.id);
                      }
                    }}
                    disabled={approveMutation.isPending || rejectMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {rejectMutation.isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    Reddet
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
