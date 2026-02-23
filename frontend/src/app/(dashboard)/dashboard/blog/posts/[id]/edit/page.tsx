"use client";

/**
 * EPIC-BLOG: Blog Post Edit Page (EP13-FE-06)
 */

import { useRouter, useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { blogPostsApi, blogAdminApi, type BlogPostUpdate } from "@/lib/api";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/lib/store";

export default function EditBlogPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const isAdmin = user?.role === "admin";

  // Admin tüm yazıları, Teacher sadece kendi yazılarını görebilir
  const { data: post, isLoading } = useQuery({
    queryKey: ["blogPost", postId, isAdmin],
    queryFn: () => isAdmin ? blogAdminApi.getPost(postId) : blogPostsApi.get(postId),
  });

  // Admin tüm yazıları, Teacher sadece kendi yazılarını güncelleyebilir
  const updateMutation = useMutation({
    mutationFn: (data: BlogPostUpdate) => 
      isAdmin ? blogAdminApi.updatePost(postId, data) : blogPostsApi.update(postId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      queryClient.invalidateQueries({ queryKey: ["blogPost", postId] });
      toast.success("Blog yazısı güncellendi");
      router.push("/dashboard/blog/posts");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Blog yazısı güncellenemedi");
    },
  });

  const handleSave = async (data: BlogPostUpdate | any) => {
    await updateMutation.mutateAsync(data as BlogPostUpdate);
  };

  const handleCancel = () => {
    router.push("/dashboard/blog/posts");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Yazı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Blog yazısı bulunamadı</p>
          <button
            onClick={() => router.push("/dashboard/blog/posts")}
            className="px-6 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors"
          >
            Geri Dön
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 p-6">
      <div className="max-w-5xl mx-auto">
        <BlogPostForm
          post={post}
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={updateMutation.isPending}
        />
      </div>
    </div>
  );
}
