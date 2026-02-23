/**
 * EPIC-10: Client-Side Security & Validation Utilities (EP10-FE-11)
 * 
 * Security utilities for URL validation, XSS prevention, and form security
 */

/**
 * Allowed domains for video and live lesson URLs
 */
const ALLOWED_VIDEO_DOMAINS = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "www.vimeo.com",
];

const ALLOWED_LIVE_LESSON_DOMAINS = [
  "zoom.us",
  "zoom.com",
  "meet.google.com",
  "teams.microsoft.com",
  "teams.live.com",
  "webex.com",
  "gotomeeting.com",
  "jitsi.org",
  "8x8.vc",
];

/**
 * Validate URL for video content
 * - Must be HTTPS
 * - Must be from allowed domains
 * - Must not be JavaScript/data scheme
 */
export function validateVideoUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) {
    return { valid: true }; // Empty is allowed (optional field)
  }

  try {
    const urlObj = new URL(url);

    // Check scheme - must be HTTPS
    if (urlObj.protocol !== "https:") {
      return { valid: false, error: "Video URL HTTPS olmalıdır." };
    }

    // Check domain
    const hostname = urlObj.hostname.toLowerCase();
    const isAllowed = ALLOWED_VIDEO_DOMAINS.some((domain) => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed) {
      return { 
        valid: false, 
        error: `İzin verilen platformlar: ${ALLOWED_VIDEO_DOMAINS.join(", ")}` 
      };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Geçersiz URL formatı." };
  }
}

/**
 * Validate URL for live lesson
 * - Must be HTTPS
 * - Must be from allowed domains
 * - Must not be JavaScript/data scheme
 */
export function validateLiveLessonUrl(url: string): { valid: boolean; error?: string } {
  if (!url.trim()) {
    return { valid: true }; // Empty is allowed (optional field)
  }

  try {
    const urlObj = new URL(url);

    // Check scheme - must be HTTPS
    if (urlObj.protocol !== "https:") {
      return { valid: false, error: "Canlı ders URL'i HTTPS olmalıdır." };
    }

    // Check domain
    const hostname = urlObj.hostname.toLowerCase();
    const isAllowed = ALLOWED_LIVE_LESSON_DOMAINS.some((domain) => 
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    if (!isAllowed) {
      return { 
        valid: false, 
        error: `İzin verilen platformlar: ${ALLOWED_LIVE_LESSON_DOMAINS.join(", ")}` 
      };
    }

    return { valid: true };
  } catch (error) {
    return { valid: false, error: "Geçersiz URL formatı." };
  }
}

/**
 * Validate file MIME type
 */
export function validateFileMimeType(file: File, allowedTypes: string[]): { valid: boolean; error?: string } {
  const fileType = file.type.toLowerCase();
  const fileName = file.name.toLowerCase();

  // Check MIME type
  const isMimeTypeAllowed = allowedTypes.some((type) => {
    if (type.includes("*")) {
      const baseType = type.split("/")[0];
      return fileType.startsWith(baseType + "/");
    }
    return fileType === type;
  });

  // Check extension as fallback
  const extension = fileName.split(".").pop();
  const isExtensionAllowed = allowedTypes.some((type) => {
    if (type.startsWith(".")) {
      return `.${extension}` === type;
    }
    return false;
  });

  if (!isMimeTypeAllowed && !isExtensionAllowed) {
    return { 
      valid: false, 
      error: `Bu dosya tipi kabul edilmiyor. İzin verilen tipler: ${allowedTypes.join(", ")}` 
    };
  }

  return { valid: true };
}

/**
 * Sanitize HTML content (client-side XSS prevention)
 * Uses DOMPurify for sanitization
 */
export async function sanitizeHtml(html: string): Promise<string> {
  if (typeof window === "undefined") {
    // SSR: Return as-is, backend will sanitize
    return html;
  }

  const DOMPurify = (await import("isomorphic-dompurify")).default;
  
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: [
      "p", "br", "strong", "em", "u", "s", "h1", "h2", "h3", "h4", "h5", "h6",
      "ul", "ol", "li", "blockquote", "code", "pre", "a", "img", "table", "thead",
      "tbody", "tr", "th", "td", "div", "span", "hr"
    ],
    ALLOWED_ATTR: ["href", "src", "alt", "title", "class", "style", "target", "rel"],
    ALLOWED_URI_REGEXP: /^(?:(?:(?:f|ht)tps?|mailto|tel|callto|sms|cid|xmpp):|[^a-z]|[a-z+.\-]+(?:[^a-z+.\-:]|$))/i,
  });
}

/**
 * Check if form has unsaved changes
 */
export function hasUnsavedChanges(originalData: any, currentData: any): boolean {
  return JSON.stringify(originalData) !== JSON.stringify(currentData);
}

/**
 * Setup beforeunload warning for unsaved changes
 */
export function setupUnsavedChangesWarning(hasChanges: boolean) {
  if (typeof window === "undefined") return;

  const handleBeforeUnload = (e: BeforeUnloadEvent) => {
    if (hasChanges) {
      e.preventDefault();
      e.returnValue = "Kaydedilmemiş değişiklikler var. Sayfadan ayrılmak istediğinize emin misiniz?";
      return e.returnValue;
    }
  };

  window.addEventListener("beforeunload", handleBeforeUnload);

  return () => {
    window.removeEventListener("beforeunload", handleBeforeUnload);
  };
}
