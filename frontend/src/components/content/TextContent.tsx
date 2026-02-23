"use client";

/**
 * EPIC-10: Text Content Viewer Component (EP10-FE-03)
 * 
 * Rich text content viewer with XSS sanitization
 */

import { useMemo } from "react";
import DOMPurify from "isomorphic-dompurify";

interface TextContentProps {
  content: string | null;
  className?: string;
}

export function TextContent({ content, className }: TextContentProps) {
  // Sanitize HTML content to prevent XSS
  const sanitizedContent = useMemo(() => {
    if (!content) return "";
    
    // Allow safe HTML tags and attributes
    return DOMPurify.sanitize(content, {
      ALLOWED_TAGS: [
        "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
        "ul", "ol", "li", "blockquote", "code", "pre", "a", "img", "table", "thead",
        "tbody", "tr", "th", "td", "div", "span", "hr"
      ],
      ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "style", "target", "rel"],
      ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
    });
  }, [content]);

  if (!content) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center text-gray-500">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p>Metin içeriği bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
      <div
        className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-a:text-teal-600 prose-a:no-underline hover:prose-a:underline prose-strong:text-gray-900 prose-code:text-teal-700 prose-code:bg-teal-50 prose-code:px-1 prose-code:py-0.5 prose-code:rounded prose-pre:bg-gray-900 prose-pre:text-gray-100"
        dangerouslySetInnerHTML={{ __html: sanitizedContent }}
      />
    </div>
  );
}
