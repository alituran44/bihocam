"use client";

/**
 * EPIC-BLOG: Public Blog Post Detail Page (EP13-FE-09)
 * 
 * Redesigned with professional typography and complete Header/Footer integration
 * for consistent, global back-and-forth navigation.
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
} from "lucide-react";
import { blogPublicApi, type BlogPost } from "@/lib/api";
import { SEOHead } from "@/components/blog/SEOHead";
import { TextContent } from "@/components/content/TextContent";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import AdBanner from "@/components/ads/AdBanner";

export default function BlogPostDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const { data: post, isLoading } = useQuery<BlogPost>({
    queryKey: ["publicBlogPost", slug],
    queryFn: () => blogPublicApi.getBySlug(slug),
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mx-auto mb-4"></div>
          <p className="text-slate-400 font-bold text-xs">Yazı yükleniyor, lütfen bekleyin...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center bg-white rounded-[2rem] border border-slate-100 p-8 shadow-sm max-w-sm w-full">
          <h1 className="text-2xl font-black text-slate-800 mb-2">Yazı Bulunamadı</h1>
          <p className="text-slate-400 font-medium text-xs mb-6">Aradığınız blog yazısı mevcut değil veya yayından kaldırılmış.</p>
          <button
            onClick={() => router.push("/blog")}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold transition-colors text-xs shadow-md shadow-blue-500/10"
          >
            ← Blog'a Dön
          </button>
        </div>
      </div>
    );
  }

  // Calculate reading time (average 200 words per minute)
  const wordCount = post.content?.split(/\s+/).length || 0;
  const readingTime = Math.ceil(wordCount / 200);

  // Generate SEO metadata
  const seoTitle = post.seo_meta_title || post.title;
  const seoDescription = post.seo_meta_description || post.excerpt || "";
  const seoKeywords = post.seo_meta_keywords || "";
  const ogImage = post.seo_og_image_url || post.featured_image_url || "";
  const canonicalUrl = post.seo_canonical_url || `/blog/${post.slug}`;

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
        title={`${seoTitle} - BiHocam Blog`}
        description={seoDescription}
        keywords={seoKeywords}
        canonicalUrl={canonicalUrl}
        ogTitle={post.seo_og_title || post.title}
        ogDescription={post.seo_og_description || post.excerpt || ""}
        ogImage={ogImage}
        ogType="article"
        schemaJson={schemaJson}
      />
      
      <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
        <div>
          {/* Global Header */}
          <Header />

          {/* Breadcrumb Navigation Bar */}
          <div className="bg-white border-b border-slate-100 sticky top-20 z-30 backdrop-blur-md bg-white/90 pt-1">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
              <button
                onClick={() => router.push("/blog")}
                className="flex items-center gap-1.5 text-xs font-black text-slate-500 hover:text-blue-600 transition-colors uppercase tracking-wider"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Blog Ana Sayfasına Dön</span>
              </button>
              
              <div className="hidden sm:flex items-center gap-2 text-[10px] text-slate-400 font-extrabold uppercase">
                <Link href="/" className="hover:underline">Ana Sayfa</Link>
                <span>/</span>
                <Link href="/blog" className="hover:underline">Blog</Link>
                <span>/</span>
                <span className="text-slate-600 truncate max-w-[200px]">{post.title}</span>
              </div>
            </div>
          </div>

          {/* Article Main Frame */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 relative z-20 grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-8">
              <motion.article
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm overflow-hidden"
            >
              {/* Featured Image */}
              {post.featured_image_url && (
                <div className="relative h-[300px] sm:h-[420px] overflow-hidden bg-slate-100">
                  <img
                    src={post.featured_image_url}
                    alt={post.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
                </div>
              )}

              <div className="p-6 sm:p-10 md:p-14">
                
                {/* Categories & Tags */}
                <div className="flex items-center gap-2 flex-wrap mb-6">
                  {post.categories.map((cat) => (
                    <Link
                      key={cat.id}
                      href={`/blog?category=${cat.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      {cat.name}
                    </Link>
                  ))}
                  {post.tags.map((tag) => (
                    <Link
                      key={tag.id}
                      href={`/blog?tag=${tag.slug}`}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-slate-50 hover:bg-slate-100 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-wider transition-all"
                    >
                      <Tag className="w-3.5 h-3.5" />
                      {tag.name}
                    </Link>
                  ))}
                </div>

                {/* Title */}
                <h1 className="text-2xl sm:text-4xl md:text-5xl font-black text-slate-800 mb-6 leading-tight font-serif tracking-tight">
                  {post.title}
                </h1>

                {/* Excerpt */}
                {post.excerpt && (
                  <p className="text-base sm:text-lg text-slate-500 mb-8 leading-relaxed font-medium">
                    {post.excerpt}
                  </p>
                )}

                {/* Meta Information Bar */}
                <div className="flex items-center gap-5 flex-wrap pb-6 border-b border-slate-100 mb-8 text-[11px] text-slate-400 font-bold uppercase tracking-wider">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-700">{post.author.full_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4 text-slate-400" />
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
                  <div className="flex items-center gap-1">
                    <Eye className="w-4 h-4 text-slate-400" />
                    <span>{post.view_count.toLocaleString()} okuma</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4 text-slate-400" />
                    <span>{readingTime} dk okuma</span>
                  </div>
                </div>

                {/* Share Option */}
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
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-slate-50 hover:bg-slate-100 text-slate-600 rounded-xl transition-colors font-black text-[10px] uppercase shadow-sm border border-slate-100/60"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Paylaş
                  </button>
                </div>

                {/* Rich Content Area */}
                <div className="prose prose-slate max-w-none prose-headings:text-slate-800 prose-headings:font-serif prose-headings:font-black prose-p:text-slate-600 prose-p:leading-relaxed prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-slate-800 prose-code:text-blue-600 prose-code:bg-blue-50 prose-code:px-2 prose-code:py-1 prose-code:rounded prose-pre:bg-slate-900 prose-img:rounded-3xl prose-img:shadow-md">
                  <TextContent content={post.content} />
                </div>

                {/* Author Card Footer */}
                <div className="mt-12 pt-8 border-t border-slate-100">
                  <div className="flex items-center justify-between flex-wrap gap-4 bg-slate-50/50 p-6 rounded-3xl border border-slate-100/50">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-xl shadow-inner flex-shrink-0">
                        👤
                      </div>
                      <div>
                        <p className="font-black text-slate-800 text-sm leading-tight">{post.author.full_name}</p>
                        {post.author.bio && (
                          <p className="text-xs font-semibold text-slate-400 mt-1 leading-relaxed max-w-md">{post.author.bio}</p>
                        )}
                      </div>
                    </div>
                    <Link
                      href={`/blog?author=${post.author.id}`}
                      className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl transition-colors font-bold text-xs shadow-md shadow-blue-500/10"
                    >
                      Yazarın Diğer Yazıları
                    </Link>
                  </div>
                </div>

              </div>
            </motion.article>
          </div>

          <aside className="lg:col-span-4">
            <div className="sticky top-36">
              <AdBanner placementCode="sidebar_blog" />
            </div>
          </aside>
        </div>
      </div>

        {/* Global Footer */}
        <Footer />
      </div>
    </>
  );
}
