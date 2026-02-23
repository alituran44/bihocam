/**
 * EPIC-BLOG: SEO Head Component (EP13-FE-15)
 * 
 * Next.js 13+ App Router Metadata API wrapper for SEO meta tags
 * Note: In App Router, metadata is handled via metadata export or generateMetadata function
 * This component is a helper for client-side metadata updates
 */

"use client";

import { useEffect } from "react";

interface SEOHeadProps {
  title: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  twitterCard?: string;
  schemaJson?: Record<string, any>;
}

export function SEOHead({
  title,
  description,
  keywords,
  canonicalUrl,
  ogTitle,
  ogDescription,
  ogImage,
  ogType = "website",
  twitterCard = "summary_large_image",
  schemaJson,
}: SEOHeadProps) {
  useEffect(() => {
    const fullTitle = title.includes("BiHocam") ? title : `${title} - BiHocam`;
    const ogTitleFinal = ogTitle || title;
    const ogDescriptionFinal = ogDescription || description;
    const canonicalUrlFinal = canonicalUrl || (typeof window !== "undefined" ? window.location.href : "");

    // Update document title
    document.title = fullTitle;

    // Update or create meta tags
    const updateMetaTag = (name: string, content: string, property?: boolean) => {
      const selector = property ? `meta[property="${name}"]` : `meta[name="${name}"]`;
      let meta = document.querySelector(selector);
      if (!meta) {
        meta = document.createElement("meta");
        if (property) {
          meta.setAttribute("property", name);
        } else {
          meta.setAttribute("name", name);
        }
        document.head.appendChild(meta);
      }
      meta.setAttribute("content", content);
    };

    // Update description
    if (description) {
      updateMetaTag("description", description);
    }

    // Update keywords
    if (keywords) {
      updateMetaTag("keywords", keywords);
    }

    // Update canonical URL
    if (canonicalUrlFinal) {
      let canonical = document.querySelector('link[rel="canonical"]');
      if (!canonical) {
        canonical = document.createElement("link");
        canonical.setAttribute("rel", "canonical");
        document.head.appendChild(canonical);
      }
      canonical.setAttribute("href", canonicalUrlFinal);
    }

    // Update Open Graph tags
    updateMetaTag("og:title", ogTitleFinal, true);
    if (ogDescriptionFinal) {
      updateMetaTag("og:description", ogDescriptionFinal, true);
    }
    if (ogImage) {
      updateMetaTag("og:image", ogImage, true);
    }
    updateMetaTag("og:type", ogType, true);
    if (canonicalUrlFinal) {
      updateMetaTag("og:url", canonicalUrlFinal, true);
    }

    // Update Twitter Card tags
    updateMetaTag("twitter:card", twitterCard);
    updateMetaTag("twitter:title", ogTitleFinal);
    if (ogDescriptionFinal) {
      updateMetaTag("twitter:description", ogDescriptionFinal);
    }
    if (ogImage) {
      updateMetaTag("twitter:image", ogImage);
    }

    // Update Schema.org JSON-LD
    if (schemaJson) {
      let script = document.querySelector('script[type="application/ld+json"]');
      if (!script) {
        script = document.createElement("script");
        script.setAttribute("type", "application/ld+json");
        document.head.appendChild(script);
      }
      script.textContent = JSON.stringify(schemaJson);
    }
  }, [title, description, keywords, canonicalUrl, ogTitle, ogDescription, ogImage, ogType, twitterCard, schemaJson]);

  return null; // This component doesn't render anything
}
