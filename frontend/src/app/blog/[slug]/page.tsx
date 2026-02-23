"use client";

/**
 * EPIC-BLOG: Public Blog Post Detail Page (EP13-FE-09)
 * 
 * SEO-optimized detail page with rich content
 * Aesthetic: "Editorial Magazine / Luxury Refined" - Elegant typography, sophisticated layout
 */

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Calendar,
  Eye,
  User,
  Tag,
  FolderOpen,
  Share2,
  ArrowLeft,
  Clock,
  BookOpen,
} from "lucide-react";
import { blogPublicApi, type BlogPost } from "@/lib/api";
import { SEOHead } from "@/components/blog/SEOHead";
import { TextContent } from "@/components/content/TextContent";
import Link from "next/link";

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: post, isLoading } = useQuery({
    queryKey: ["publicBlogPost", slug],
    queryFn: () => blogPublicApi.getBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/10 to-amber-50/10 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Yazı yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/10 to-amber-50/10 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Yazı Bulunamadı</h1>
          <p className="text-gray-600 mb-6">Aradığınız blog yazısı bulunamadı.</p>
          <button
            onClick={() => router.push("/blog")}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            Blog'a Dön
          </button>
        </div>
      </div>
    );
  }

  // Calculate reading time (average 200 words per minute)
  const wordCount = post.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  // Generate SEO metadata
  const seoTitle = post.seo?.seo_meta_title || post.title;
  const seoDescription = post.seo?.seo_meta_description || post.excerpt || "";
  const seoKeywords = post.seo?.seo_meta_keywords || "";
  const ogImage = post.seo?.seo_og_image_url || post.featured_image_url || "";
  const canonicalUrl = post.seo?.seo_canonical_url || `/blog/${post.slug}`;

  // Generate Schema.org JSON-LD
  const schemaJson = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    image: ogImage ? [ogImage] : [],
    datePublished: post.published_at || post.created_at,
    dateModified: post.updated_at,
    author: {
      "@type": "Person",
      name: post.author.full_name,
      url: `/blog/author/${post.author.id}`,
    },
    publisher: {
      "@type": "Organization",
      name: "BiHocam",
      logo: {
        "@type": "ImageObject",
        url: "/logo.png",
      },
    },
    description: seoDescription,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": canonicalUrl,
    },
    articleSection: post.categories.map((cat) => cat.name).join(", "),
    keywords: seoKeywords.split(",").map((k) => k.trim()),
  };

  return (
    <>
      <SEOHead
        title={seoTitle}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={canonicalUrl}
        ogTitle={post.seo?.seo_og_title || post.title}
        ogDescription={post.seo?.seo_og_description || post.excerpt || ""}
        ogImage={ogImage}
        ogType="article"
        schemaJson={schemaJson}
      />
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/10 to-amber-50/10">
        {/* Header */}
        <div className="bg-white border-b-2 border-gray-200 sticky top-0 z-10 backdrop-blur-sm bg-white/95">
          <div className="max-w-4xl mx-auto px-6 py-4">
            <button
              onClick={() => router.push("/blog")}
              className="flex items-center gap-2 text-gray-600 hover:text-teal-600 transition-colors mb-4"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Blog'a Dön</span>
            </button>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          {/* Article Header */}
          <motion.article
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white rounded-2xl border-2 border-gray-200 shadow-xl overflow-hidden"
          >
            {/* Featured Image */}
            {post.featured_image_url && (
              <div className="relative h-96 overflow-hidden">
                <img
                  src={post.featured_image_url}
                  alt={post.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
            )}

            <div className="p-8 md:p-12">
              {/* Categories & Tags */}
              <div className="flex items-center gap-3 flex-wrap mb-6">
                {post.categories.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-teal-50 text-teal-700 rounded-lg text-sm font-medium hover:bg-teal-100 transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    {cat.name}
                  </Link>
                ))}
                {post.tags.map((tag) => (
                  <Link
                    key={tag.id}
                    href={`/blog?tag=${tag.slug}`}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
                  >
                    <Tag className="w-4 h-4" />
                    {tag.name}
                  </Link>
                ))}
              </div>

              {/* Title */}
              <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
                {post.title}
              </h1>

              {/* Excerpt */}
              {post.excerpt && (
                <p className="text-xl text-gray-600 mb-8 leading-relaxed font-light">
                  {post.excerpt}
                </p>
              )}

              {/* Meta Information */}
              <div className="flex items-center gap-6 flex-wrap pb-6 border-b-2 border-gray-200 mb-8">
                <div className="flex items-center gap-2 text-gray-600">
                  <User className="w-5 h-5" />
                  <span className="font-medium">{post.author.full_name}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Calendar className="w-5 h-5" />
                  <span>
                    {post.published_at
                      ? new Date(post.published_at).toLocaleDateString("tr-TR", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })
                      : "Yayınlanmadı"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Eye className="w-5 h-5" />
                  <span>{post.view_count.toLocaleString()} görüntülenme</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <Clock className="w-5 h-5" />
                  <span>{readingTime} dk okuma</span>
                </div>
              </div>

              {/* Share Button */}
              <div className="mb-8">
                <button
                  onClick={() => {
                    if (navigator.share) {
                      navigator.share({
                        title: post.title,
                        text: post.excerpt || "",
                        url: window.location.href,
                      });
                    } else {
                      navigator.clipboard.writeText(window.location.href);
                      alert("Link kopyalandı!");
                    }
                  }}
                  className="inline-flex items-center gap-2 px-4 py-2 bg-teal-50 text-teal-700 rounded-lg hover:bg-teal-100 transition-colors font-medium"
                >
                  <Share2 className="w-5 h-5" />
                  Paylaş
                </button>
              </div>

              {/* Content */}
              <div className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-headings:font-serif prose-p:text-gray-700 prose-p:leading-relaxed prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-teal-700 prose-code:bg-teal-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-img:rounded-xl prose-img:shadow-lg">
                <TextContent content={post.content} />
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t-2 border-gray-200">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-gray-600">
                      <User className="w-5 h-5" />
                      <div>
                        <p className="font-medium text-gray-900">{post.author.full_name}</p>
                        {post.author.bio && (
                          <p className="text-sm text-gray-600">{post.author.bio}</p>
                        )}
                      </div>
                    </div>
                  </div>
                  <Link
                    href={`/blog/author/${post.author.id}`}
                    className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
                  >
                    Yazarın Tüm Yazıları
                  </Link>
                </div>
              </div>
            </div>
          </motion.article>
        </div>
      </div>
    </>
  );
}
