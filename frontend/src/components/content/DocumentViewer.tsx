"use client";

/**
 * EPIC-10: Document Viewer Component (EP10-FE-03)
 * 
 * DOCX/DOC viewer using Google Docs Viewer or PDF conversion
 */

import { useState, useEffect } from "react";
import { API_URL } from "@/lib/api";

interface DocumentViewerProps {
  documentUrl: string | null;  // Backend-provided document URL
  pdfUrl?: string | null;  // Optional: PDF-converted version (from EP10-BE-12)
  filename?: string | null;
  className?: string;
}

export function DocumentViewer({ documentUrl, pdfUrl, filename, className }: DocumentViewerProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"google" | "pdf">(pdfUrl ? "pdf" : "google");
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Prefer PDF if available (more reliable)
  const displayUrl = viewMode === "pdf" && pdfUrl ? pdfUrl : documentUrl;
  
  // Fetch document with authentication and create blob URL for iframe
  useEffect(() => {
    if (!documentUrl) {
      setBlobUrl(null);
      setIsLoading(false);
      return;
    }

    // If URL is already a blob or data URL, use as-is
    if (documentUrl.startsWith("blob:") || documentUrl.startsWith("data:")) {
      setBlobUrl(documentUrl);
      setIsLoading(false);
      return;
    }

    // Fetch document with authentication headers
    const fetchDocument = async () => {
      try {
        setIsLoading(true);
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        
        // Build full URL
        let fullUrl = documentUrl;
        if (documentUrl && !documentUrl.startsWith("http://") && !documentUrl.startsWith("https://") && !documentUrl.startsWith("blob:") && !documentUrl.startsWith("data:")) {
          // If URL already starts with /api/v1, we need to prepend only the base URL (without /api/v1)
          if (documentUrl.startsWith("/api/v1")) {
            const base = API_URL.replace("/api/v1", "");
            fullUrl = `${base}${documentUrl}`;
          } else {
            // Relative path, prepend API_URL
            fullUrl = `${API_URL}${documentUrl.startsWith("/") ? "" : "/"}${documentUrl}`;
          }
        }
        
        console.log("[DocumentViewer] documentUrl:", documentUrl, "-> fullUrl:", fullUrl);
        
        const headers: HeadersInit = {};
        if (token) {
          headers.Authorization = `Bearer ${token}`;
        }

        const response = await fetch(fullUrl, {
          method: "GET",
          headers,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        setBlobUrl(url);
        setIsLoading(false);
      } catch (err) {
        console.error("Document fetch error:", err);
        setError("Doküman yüklenemedi. Lütfen tekrar deneyin.");
        setIsLoading(false);
      }
    };

    fetchDocument();
    
    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [documentUrl]);

  const handleLoad = () => {
    setIsLoading(false);
  };

  const handleError = () => {
    setError("Doküman yüklenemedi. Lütfen tekrar deneyin.");
    setIsLoading(false);
  };

  const handleDownload = () => {
    if (documentUrl) {
      // If URL is relative, prepend API_URL
      let fullUrl = documentUrl;
      if (documentUrl && !documentUrl.startsWith("http://") && !documentUrl.startsWith("https://")) {
        fullUrl = `${API_URL}${documentUrl.startsWith("/") ? "" : "/"}${documentUrl}`;
      }
      window.open(fullUrl, "_blank");
    }
  };

  if (error) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold text-gray-900 mb-2">Doküman yüklenemedi</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!documentUrl) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600">Doküman dosyası bulunamadı</p>
        </div>
      </div>
    );
  }

  // Build public URL for viewer (with token as query param)
  const getPublicUrl = () => {
    if (!documentUrl) return null;
    let fullUrl = documentUrl;
    if (documentUrl && !documentUrl.startsWith("http://") && !documentUrl.startsWith("https://")) {
      if (documentUrl.startsWith("/api/v1")) {
        const base = API_URL.replace("/api/v1", "");
        fullUrl = `${base}${documentUrl}`;
      } else {
        fullUrl = `${API_URL}${documentUrl.startsWith("/") ? "" : "/"}${documentUrl}`;
      }
    }
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (token) {
      fullUrl += `${fullUrl.includes("?") ? "&" : "?"}access_token=${encodeURIComponent(token)}`;
    }
    return fullUrl;
  };

  // Build download URL with authentication
  const getDownloadUrl = () => {
    return getPublicUrl();
  };

  const publicUrl = getPublicUrl();
  
  // Office Online Viewer URL for PPTX/PPT/DOCX/DOC
  const officeViewerUrl = publicUrl 
    ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(publicUrl)}`
    : null;

  return (
    <div className={`relative bg-white rounded-lg border-2 border-gray-200 overflow-hidden ${className}`}>
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/60 to-transparent p-4 z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          {filename && (
            <span className="text-white text-sm font-medium truncate max-w-xs">{filename}</span>
          )}
          {pdfUrl && (
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
              <button
                onClick={() => setViewMode("pdf")}
                className={`text-xs px-2 py-1 rounded transition-colors ${
                  viewMode === "pdf" ? "bg-white text-gray-900" : "text-white hover:bg-white/20"
                }`}
              >
                PDF Görünümü
              </button>
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownload}
            className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
            title="İndir"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Doküman yükleniyor...</p>
          </div>
        </div>
      )}

      {/* Viewer Content */}
      {viewMode === "pdf" && pdfUrl ? (
        <iframe
          src={`${pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
          className="w-full h-[600px] border-0"
          title={filename || "PDF Viewer"}
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      ) : officeViewerUrl ? (
        <iframe
          src={officeViewerUrl}
          className="w-full h-[600px] border-0"
          title={filename || "Document Viewer"}
          onLoad={handleLoad}
          onError={handleError}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
          referrerPolicy="no-referrer-when-downgrade"
        />
      ) : (
        <div className="flex flex-col items-center justify-center h-[600px] bg-gray-50 p-8">
          <svg className="w-24 h-24 text-gray-400 mb-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Doküman Görüntüleme</h3>
          <p className="text-gray-600 mb-6 text-center max-w-md">
            Bu dokümanı görüntülemek için lütfen dosyayı indirip bilgisayarınızda açın.
          </p>
          <button
            onClick={handleDownload}
            className="px-6 py-3 bg-gradient-to-r from-teal-600 to-cyan-600 hover:from-teal-700 hover:to-cyan-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Dosyayı İndir
          </button>
        </div>
      )}
    </div>
  );
}
