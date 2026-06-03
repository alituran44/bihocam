"use client";

/**
 * EPIC-BLOG: Blog Post Form Component (EP13-FE-04)
 * 
 * Create/Edit form for blog posts with SEO section
 */

import { useState, useEffect, useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";
import { motion, AnimatePresence } from "framer-motion";
import {
  Save,
  X,
  Eye,
  EyeOff,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Calendar,
  Tag,
  FolderOpen,
  Search,
  Globe,
  FileText,
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
} from "lucide-react";
import {
  blogPostsApi,
  blogCategoriesApi,
  blogTagsApi,
  type BlogPost,
  type BlogPostCreate,
  type BlogPostUpdate,
  type BlogPostStatus,
  type BlogCategory,
  type BlogTag,
} from "@/lib/api";
import { RichTextEditor } from "./RichTextEditor";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

interface BlogPostFormProps {
  post?: BlogPost | null;
  onSave: (data: BlogPostCreate | BlogPostUpdate) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export function BlogPostForm({
  post,
  onSave,
  onCancel,
  isLoading = false,
}: BlogPostFormProps) {
  const user = useAuthStore((state) => state.user);
  const isTeacher = user?.role === "teacher";
  
  const [form, setForm] = useState<BlogPostCreate>({
    title: post?.title || "",
    slug: post?.slug || "",
    excerpt: post?.excerpt || "",
    content: post?.content || "",
    featured_image_url: post?.featured_image_url || "",
    status: post?.status || "draft",
    published_at: post?.published_at
      ? new Date(post.published_at).toISOString().slice(0, 16)
      : "",
    is_featured: post?.is_featured || false,
    is_pinned: post?.is_pinned || false,
    allow_comments: post?.allow_comments ?? true,
    category_ids: post?.categories?.map((c) => c.id) || [],
    tag_ids: post?.tags?.map((t) => t.id) || [],
    seo_meta_title: post?.seo_meta_title || "",
    seo_meta_description: post?.seo_meta_description || "",
    seo_meta_keywords: post?.seo_meta_keywords || "",
    seo_og_title: post?.seo_og_title || "",
    seo_og_description: post?.seo_og_description || "",
    seo_og_image_url: post?.seo_og_image_url || "",
    seo_twitter_card: post?.seo_twitter_card || "summary_large_image",
    seo_canonical_url: post?.seo_canonical_url || "",
  });

  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [tags, setTags] = useState<BlogTag[]>([]);
  const [popularTags, setPopularTags] = useState<BlogTag[]>([]);
  const [showSEOSection, setShowSEOSection] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [tagSearch, setTagSearch] = useState("");
  const [categorySearch, setCategorySearch] = useState("");

  // Load categories
  useEffect(() => {
    blogCategoriesApi
      .list({ is_active: true, limit: 1000 })
      .then(setCategories)
      .catch(() => {
        toast.error("Kategoriler yüklenirken bir hata oluştu");
      });
  }, []);

  // Load tags
  useEffect(() => {
    blogTagsApi
      .list({ limit: 1000 })
      .then(setTags)
      .catch(() => {
        toast.error("Etiketler yüklenirken bir hata oluştu");
      });
  }, []);

  // Load popular tags
  useEffect(() => {
    blogTagsApi
      .getPopular(20)
      .then(setPopularTags)
      .catch(() => {
        // Ignore errors
      });
  }, []);

  // Auto-generate slug from title
  useEffect(() => {
    if (!post && form.title && !form.slug) {
      const slug = form.title
        .toLowerCase()
        .replace(/ğ/g, "g")
        .replace(/ü/g, "u")
        .replace(/ş/g, "s")
        .replace(/ı/g, "i")
        .replace(/ö/g, "o")
        .replace(/ç/g, "c")
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
      setForm((prev) => ({ ...prev, slug }));
    }
  }, [form.title, post]);

  // Auto-generate SEO fields from title/excerpt
  useEffect(() => {
    if (!post && form.title && !form.seo_meta_title) {
      setForm((prev) => ({
        ...prev,
        seo_meta_title: (form.title || "").length > 60 ? (form.title || "").substring(0, 57) + "..." : form.title,
      }));
    }
    if (!post && form.excerpt && !form.seo_meta_description) {
      setForm((prev) => ({
        ...prev,
        seo_meta_description: (form.excerpt || "").length > 160 ? (form.excerpt || "").substring(0, 157) + "..." : form.excerpt,
      }));
    }
  }, [form.title, form.excerpt, post]);

  const filteredCategories = useMemo(() => {
    if (!categorySearch) return categories;
    return categories.filter((cat) =>
      cat.name.toLowerCase().includes(categorySearch.toLowerCase())
    );
  }, [categories, categorySearch]);

  const filteredTags = useMemo(() => {
    if (!tagSearch) return tags;
    return tags.filter((tag) =>
      tag.name.toLowerCase().includes(tagSearch.toLowerCase())
    );
  }, [tags, tagSearch]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!(form.title || "").trim()) {
      newErrors.title = "Başlık gereklidir";
    } else if ((form.title || "").length < 3) {
      newErrors.title = "Başlık en az 3 karakter olmalıdır";
    }

    if (!(form.slug || "").trim()) {
      newErrors.slug = "Slug gereklidir";
    }

    if (!(form.content || "").trim()) {
      newErrors.content = "İçerik gereklidir";
    } else if ((form.content || "").length < 100) {
      newErrors.content = "İçerik en az 100 karakter olmalıdır";
    }

    if (form.excerpt && form.excerpt.length > 500) {
      newErrors.excerpt = "Özet en fazla 500 karakter olabilir";
    }

    if (form.seo_meta_title && form.seo_meta_title.length > 60) {
      newErrors.seo_meta_title = "Meta title en fazla 60 karakter olabilir";
    }

    if (form.seo_meta_description && form.seo_meta_description.length > 160) {
      newErrors.seo_meta_description = "Meta description en fazla 160 karakter olabilir";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error("Lütfen form hatalarını düzeltin");
      return;
    }

    // Teacher'lar published yazıları edit edemez, tekrar pending_review'a dönmeli
    let finalStatus = form.status;
    if (isTeacher && post && post.status === "published" && form.status === "published") {
      finalStatus = "pending_review";
      toast.info("Yayınlanmış yazılar düzenlendiğinde tekrar onay bekliyor durumuna geçer");
    }

    // Convert empty strings to undefined for optional fields
    const submitData: BlogPostCreate | BlogPostUpdate = {
      ...form,
      status: finalStatus as BlogPostStatus,
      excerpt: form.excerpt || undefined,
      featured_image_url: form.featured_image_url || undefined,
      published_at: form.published_at || undefined,
      seo_meta_title: form.seo_meta_title || undefined,
      seo_meta_description: form.seo_meta_description || undefined,
      seo_meta_keywords: form.seo_meta_keywords || undefined,
      seo_og_title: form.seo_og_title || undefined,
      seo_og_description: form.seo_og_description || undefined,
      seo_og_image_url: form.seo_og_image_url || undefined,
      seo_twitter_card: form.seo_twitter_card || undefined,
      seo_canonical_url: form.seo_canonical_url || undefined,
    };

    await onSave(submitData);
  };

  const addTag = (tagId: string) => {
    const currentTags = form.tag_ids || [];
    if (!currentTags.includes(tagId)) {
      setForm((prev) => ({
        ...prev,
        tag_ids: [...(prev.tag_ids || []), tagId],
      }));
    }
    setTagSearch("");
  };

  const removeTag = (tagId: string) => {
    setForm((prev) => ({
      ...prev,
      tag_ids: (prev.tag_ids || []).filter((id) => id !== tagId),
    }));
  };

  const createNewTag = async (tagName: string) => {
    try {
      const newTag = await blogTagsApi.create({ name: tagName });
      setTags((prev) => [...prev, newTag]);
      addTag(newTag.id);
      toast.success("Etiket oluşturuldu");
    } catch (error: any) {
      toast.error(error.response?.data?.detail || "Etiket oluşturulamadı");
    }
  };

  const metaTitleLength = form.seo_meta_title?.length || 0;
  const metaDescriptionLength = form.seo_meta_description?.length || 0;
  const excerptLength = form.excerpt?.length || 0;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">
          {post ? "Blog Yazısı Düzenle" : "Yeni Blog Yazısı"}
        </h2>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            {showPreview ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            {showPreview ? "Düzenle" : "Önizle"}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            İptal
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-teal-600 to-teal-700 text-white rounded-lg hover:from-teal-700 hover:to-teal-800 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            {post ? "Güncelle" : "Kaydet"}
          </button>
        </div>
      </div>

      {showPreview ? (
        /* Preview Mode */
        <div className="bg-white rounded-xl border-2 border-gray-200 p-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">{form.title || "Başlık"}</h1>
          {form.excerpt && (
            <p className="text-xl text-gray-600 mb-6">{form.excerpt}</p>
          )}
          {form.featured_image_url && (
            <img
              src={form.featured_image_url}
              alt={form.title}
              className="w-full h-64 object-cover rounded-lg mb-6"
            />
          )}
          <div
            className="prose prose-lg max-w-none"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(form.content || "<p>İçerik...</p>") }}
          />
        </div>
      ) : (
        <>
          {/* Basic Fields */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Başlık <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.title ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Blog yazısı başlığı"
              />
              {errors.title && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.title}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Slug <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={form.slug}
                onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.slug ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="blog-yazisi-slug"
              />
              {errors.slug && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.slug}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Özet
              </label>
              <textarea
                value={form.excerpt || ""}
                onChange={(e) => setForm((prev) => ({ ...prev, excerpt: e.target.value }))}
                rows={3}
                maxLength={500}
                className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                  errors.excerpt ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Kısa özet (liste görünümü için)"
              />
              <div className="flex items-center justify-between mt-1">
                {errors.excerpt && (
                  <p className="text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="w-4 h-4" />
                    {errors.excerpt}
                  </p>
                )}
                <p className="text-xs text-gray-500 ml-auto">
                  {excerptLength}/500 karakter
                </p>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                İçerik <span className="text-red-500">*</span>
              </label>
              <RichTextEditor
                value={form.content}
                onChange={(html) => setForm((prev) => ({ ...prev, content: html }))}
                placeholder="Blog yazısı içeriğinizi buraya yazın..."
                minHeight="500px"
              />
              {errors.content && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4" />
                  {errors.content}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Öne Çıkan Görsel URL
              </label>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={form.featured_image_url}
                  onChange={(e) => setForm((prev) => ({ ...prev, featured_image_url: e.target.value }))}
                  className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  placeholder="https://..."
                />
                {form.featured_image_url && (
                  <img
                    src={form.featured_image_url}
                    alt="Preview"
                    className="w-20 h-20 object-cover rounded-lg border-2 border-gray-300"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                )}
              </div>
            </div>
          </div>

          {/* Categories & Tags */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Kategoriler
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  placeholder="Kategori ara..."
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {filteredCategories.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      const currentCategories = form.category_ids || [];
                      if (currentCategories.includes(cat.id)) {
                        setForm((prev) => ({
                          ...prev,
                          category_ids: (prev.category_ids || []).filter((id) => id !== cat.id),
                        }));
                      } else {
                        setForm((prev) => ({
                          ...prev,
                          category_ids: [...(prev.category_ids || []), cat.id],
                        }));
                      }
                    }}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      (form.category_ids || []).includes(cat.id)
                        ? "bg-teal-100 text-teal-700 border-2 border-teal-300"
                        : "bg-gray-100 text-gray-700 border-2 border-gray-300 hover:bg-gray-200"
                    }`}
                  >
                    {cat.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Etiketler
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={tagSearch}
                  onChange={(e) => setTagSearch(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      const tagName = tagSearch.trim();
                      if (tagName && !tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase())) {
                        createNewTag(tagName);
                      } else if (tagName) {
                        const existingTag = tags.find((t) => t.name.toLowerCase() === tagName.toLowerCase());
                        if (existingTag) {
                          addTag(existingTag.id);
                        }
                      }
                    }
                  }}
                  placeholder="Etiket ara veya yeni etiket oluştur (Enter)"
                  className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                {(form.tag_ids || []).map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  if (!tag) return null;
                  return (
                    <span
                      key={tagId}
                      className="inline-flex items-center gap-1 px-3 py-1.5 bg-teal-100 text-teal-700 rounded-lg text-sm font-medium border-2 border-teal-300"
                    >
                      {tag.name}
                      <button
                        type="button"
                        onClick={() => removeTag(tagId)}
                        className="hover:text-teal-900"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  );
                })}
              </div>
              {popularTags.length > 0 && (
                <div className="mt-3">
                  <p className="text-xs text-gray-500 mb-2">Popüler Etiketler:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.slice(0, 10).map((tag) => (
                      <button
                        key={tag.id}
                        type="button"
                        onClick={() => addTag(tag.id)}
                        disabled={(form.tag_ids || []).includes(tag.id)}
                        className={`px-2 py-1 rounded text-xs font-medium transition-colors ${
                          (form.tag_ids || []).includes(tag.id)
                            ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                        }`}
                      >
                        {tag.name} ({tag.usage_count})
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Publishing Options */}
          <div className="bg-white rounded-xl border-2 border-gray-200 p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-teal-600" />
              Yayın Ayarları
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Durum
                </label>
                <select
                  value={form.status}
                  onChange={(e) => setForm((prev) => ({ ...prev, status: e.target.value as BlogPostStatus }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  disabled={isLoading || (isTeacher && post?.status === "published")}
                >
                  <option value="draft">Taslak</option>
                  {isTeacher ? (
                    <option value="pending_review">Onay Bekliyor</option>
                  ) : (
                    <>
                      <option value="pending_review">Onay Bekliyor</option>
                      <option value="published">Yayınlandı</option>
                      <option value="archived">Arşivlendi</option>
                    </>
                  )}
                </select>
                {isTeacher && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">Not:</span>{" "}
                    {post?.status === "published" ? (
                      <>
                        Yayınlanmış yazılar düzenlendiğinde otomatik olarak "Onay Bekliyor" durumuna geçer.
                      </>
                    ) : (
                      <>
                        Öğretmenler yazıları direkt yayınlayamaz. "Onay Bekliyor" seçtiğinizde yazınız admin onayından sonra yayınlanacaktır.
                      </>
                    )}
                  </p>
                )}
                {isTeacher && (
                  <p className="mt-2 text-sm text-gray-600">
                    <span className="font-semibold">Not:</span> Öğretmenler yazıları direkt yayınlayamaz. 
                    "Onay Bekliyor" seçtiğinizde yazınız admin onayından sonra yayınlanacaktır.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Yayın Tarihi (Planlanmış)
                </label>
                <input
                  type="datetime-local"
                  value={form.published_at}
                  onChange={(e) => setForm((prev) => ({ ...prev, published_at: e.target.value }))}
                  className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_featured}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_featured: e.target.checked }))}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">Öne Çıkan</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.is_pinned}
                  onChange={(e) => setForm((prev) => ({ ...prev, is_pinned: e.target.checked }))}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">Sabitlenmiş</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.allow_comments}
                  onChange={(e) => setForm((prev) => ({ ...prev, allow_comments: e.target.checked }))}
                  className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                />
                <span className="text-sm font-medium text-gray-700">Yorumlara İzin Ver</span>
              </label>
            </div>
          </div>

          {/* SEO Section */}
          <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden">
            <button
              type="button"
              onClick={() => setShowSEOSection(!showSEOSection)}
              className="w-full flex items-center justify-between p-6 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 transition-colors"
            >
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <Search className="w-5 h-5 text-teal-600" />
                SEO Ayarları
              </h3>
              {showSEOSection ? (
                <ChevronUp className="w-5 h-5 text-gray-600" />
              ) : (
                <ChevronDown className="w-5 h-5 text-gray-600" />
              )}
            </button>
            <AnimatePresence>
              {showSEOSection && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="p-6 space-y-4 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Meta Title
                        </label>
                        <input
                          type="text"
                          value={form.seo_meta_title || ""}
                          onChange={(e) => setForm((prev) => ({ ...prev, seo_meta_title: e.target.value }))}
                          maxLength={60}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                            errors.seo_meta_title ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="SEO başlığı (max 60 karakter)"
                        />
                        <div className="flex items-center justify-between mt-1">
                          {errors.seo_meta_title && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.seo_meta_title}
                            </p>
                          )}
                          <p className={`text-xs ml-auto ${metaTitleLength > 60 ? "text-red-600" : "text-gray-500"}`}>
                            {metaTitleLength}/60
                          </p>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Meta Description
                        </label>
                        <textarea
                          value={form.seo_meta_description || ""}
                          onChange={(e) => setForm((prev) => ({ ...prev, seo_meta_description: e.target.value }))}
                          maxLength={160}
                          rows={3}
                          className={`w-full px-4 py-3 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500 ${
                            errors.seo_meta_description ? "border-red-500" : "border-gray-300"
                          }`}
                          placeholder="SEO açıklaması (max 160 karakter)"
                        />
                        <div className="flex items-center justify-between mt-1">
                          {errors.seo_meta_description && (
                            <p className="text-sm text-red-600 flex items-center gap-1">
                              <AlertCircle className="w-4 h-4" />
                              {errors.seo_meta_description}
                            </p>
                          )}
                          <p className={`text-xs ml-auto ${metaDescriptionLength > 160 ? "text-red-600" : "text-gray-500"}`}>
                            {metaDescriptionLength}/160
                          </p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        Meta Keywords
                      </label>
                      <input
                        type="text"
                        value={form.seo_meta_keywords || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, seo_meta_keywords: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="keyword1, keyword2, keyword3"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          OG Title
                        </label>
                        <input
                          type="text"
                          value={form.seo_og_title || ""}
                          onChange={(e) => setForm((prev) => ({ ...prev, seo_og_title: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Open Graph başlığı"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          OG Description
                        </label>
                        <textarea
                          value={form.seo_og_description || ""}
                          onChange={(e) => setForm((prev) => ({ ...prev, seo_og_description: e.target.value }))}
                          rows={3}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="Open Graph açıklaması"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-900 mb-2">
                        OG Image URL
                      </label>
                      <input
                        type="url"
                        value={form.seo_og_image_url || ""}
                        onChange={(e) => setForm((prev) => ({ ...prev, seo_og_image_url: e.target.value }))}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        placeholder="https://..."
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Twitter Card Type
                        </label>
                        <select
                          value={form.seo_twitter_card || ""}
                          onChange={(e) => setForm((prev) => ({ ...prev, seo_twitter_card: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                        >
                          <option value="summary">Summary</option>
                          <option value="summary_large_image">Summary Large Image</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                          Canonical URL
                        </label>
                        <input
                          type="url"
                          value={form.seo_canonical_url || ""}
                          onChange={(e) => setForm((prev) => ({ ...prev, seo_canonical_url: e.target.value }))}
                          className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </form>
  );
}
