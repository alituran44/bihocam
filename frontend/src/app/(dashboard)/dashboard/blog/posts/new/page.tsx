"use client";

/**
 * EPIC-BLOG: Blog Post Create Page (EP13-FE-06)
 */

import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { blogPostsApi, type BlogPostCreate } from "@/lib/api";
import { BlogPostForm } from "@/components/blog/BlogPostForm";
import { toast } from "sonner";

export default function NewBlogPostPage() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const createMutation = useMutation({
    mutationFn: (data: BlogPostCreate) => blogPostsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["blogPosts"] });
      toast.success("Blog yazısı oluşturuldu");
      router.push("/dashboard/blog/posts");
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || "Blog yazısı oluşturulamadı");
    },
  });

  const handleSave = async (data: BlogPostCreate | any) => {
    await createMutation.mutateAsync(data as BlogPostCreate);
  };

  const handleCancel = () => {
    router.push("/dashboard/blog/posts");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 p-6">
      <div className="max-w-5xl mx-auto">
        <BlogPostForm
          onSave={handleSave}
          onCancel={handleCancel}
          isLoading={createMutation.isPending}
        />
      </div>
    </div>
  );
}
