"use client";

/**
 * EPIC-10: PDF Viewer Component (EP10-FE-03)
 * 
 * Modern PDF viewer using react-pdf library with page navigation, zoom, and controls
 */

import { useState, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Download, Maximize, Minimize } from "lucide-react";
import { API_URL } from "@/lib/api";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Set up PDF.js worker for Next.js
if (typeof window !== "undefined") {
  // Use worker from public folder (copied from pdfjs-dist)
  pdfjs.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";
}

interface PDFViewerProps {
  pdfUrl: string | null;  // Backend-provided PDF URL
  filename?: string | null;
  className?: string;
}

export function PDFViewer({ pdfUrl, filename, className }: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number | null>(null);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [blobUrl, setBlobUrl] = useState<string | null>(null);

  // Fetch PDF with authentication and create blob URL
  useEffect(() => {
    if (!pdfUrl) {
      setBlobUrl(null);
      setIsLoading(false);
      return;
    }

    // If URL is already a blob or data URL, use as-is
    if (pdfUrl.startsWith("blob:") || pdfUrl.startsWith("data:")) {
      setBlobUrl(pdfUrl);
      setIsLoading(false);
      return;
    }

    // Fetch PDF with authentication headers
    const fetchPDF = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
        
        // Build full URL
        let fullUrl = pdfUrl;
        if (pdfUrl && !pdfUrl.startsWith("http://") && !pdfUrl.startsWith("https://") && !pdfUrl.startsWith("blob:") && !pdfUrl.startsWith("data:")) {
          if (pdfUrl.startsWith("/api/v1")) {
            const base = API_URL.replace("/api/v1", "");
            fullUrl = `${base}${pdfUrl}`;
          } else {
            fullUrl = `${API_URL}${pdfUrl.startsWith("/") ? "" : "/"}${pdfUrl}`;
          }
        }
        
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
        console.error("PDF fetch error:", err);
        setError("PDF yüklenemedi. Lütfen tekrar deneyin.");
        setIsLoading(false);
      }
    };

    fetchPDF();

    // Cleanup blob URL on unmount
    return () => {
      if (blobUrl && blobUrl.startsWith("blob:")) {
        URL.revokeObjectURL(blobUrl);
      }
    };
  }, [pdfUrl]);

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error: Error) => {
    console.error("PDF load error:", error);
    setError("PDF yüklenemedi. Lütfen tekrar deneyin.");
    setIsLoading(false);
  };

  const goToPrevPage = () => {
    setPageNumber((prev) => Math.max(1, prev - 1));
  };

  const goToNextPage = () => {
    setPageNumber((prev) => Math.min(numPages || 1, prev + 1));
  };

  const handleZoomIn = () => {
    setScale((prev) => Math.min(3, prev + 0.2));
  };

  const handleZoomOut = () => {
    setScale((prev) => Math.max(0.5, prev - 0.2));
  };

  const handleDownload = async () => {
    if (!blobUrl) return;
    
    try {
      const response = await fetch(blobUrl);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename || "document.pdf";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Download error:", err);
    }
  };

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const viewer = document.getElementById("pdf-viewer-container");
      if (viewer) {
        viewer.requestFullscreen();
        setIsFullscreen(true);
      }
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Handle fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  if (error) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold text-gray-900 mb-2">PDF yüklenemedi</p>
          <p className="text-sm text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!pdfUrl || !blobUrl) {
    return (
      <div className={`bg-white rounded-lg border-2 border-gray-200 p-8 ${className}`}>
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600">PDF dosyası bulunamadı</p>
        </div>
      </div>
    );
  }

  return (
    <div
      id="pdf-viewer-container"
      className={`relative bg-gray-100 rounded-lg border-2 border-gray-200 overflow-hidden ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none border-0" : ""
      } ${className}`}
    >
      {/* Toolbar */}
      <div className="absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 z-10">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {filename && (
              <span className="text-white text-sm font-medium truncate max-w-xs">{filename}</span>
            )}
            {numPages && (
              <span className="text-white/80 text-sm">
                {pageNumber} / {numPages}
              </span>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            {/* Page Navigation */}
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
              <button
                onClick={goToPrevPage}
                disabled={pageNumber <= 1}
                className="p-1.5 text-white hover:bg-white/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Önceki sayfa"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={goToNextPage}
                disabled={pageNumber >= (numPages || 1)}
                className="p-1.5 text-white hover:bg-white/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title="Sonraki sayfa"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center gap-1 bg-white/20 backdrop-blur-sm rounded-lg px-2 py-1">
              <button
                onClick={handleZoomOut}
                className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
                title="Uzaklaştır"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-white text-sm px-2 min-w-[3rem] text-center">
                {Math.round(scale * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-1.5 text-white hover:bg-white/20 rounded transition-colors"
                title="Yakınlaştır"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>

            {/* Actions */}
            <button
              onClick={handleDownload}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
              title="İndir"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-white/20 hover:bg-white/30 text-white rounded-lg transition-colors backdrop-blur-sm"
              title={isFullscreen ? "Tam ekrandan çık" : "Tam ekran"}
            >
              {isFullscreen ? <Minimize className="w-4 h-4" /> : <Maximize className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center bg-gray-50 z-20"
          >
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
              <p className="text-gray-600">PDF yükleniyor...</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* PDF Document */}
      <div className={`overflow-auto bg-gray-200 flex justify-center p-4 ${
        isFullscreen ? "h-screen pt-16" : "h-[600px]"
      }`}>
        <Document
          file={blobUrl}
          onLoadSuccess={onDocumentLoadSuccess}
          onLoadError={onDocumentLoadError}
          loading={
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-gray-600">PDF yükleniyor...</p>
              </div>
            </div>
          }
        >
          <Page
            pageNumber={pageNumber}
            scale={scale}
            renderTextLayer={true}
            renderAnnotationLayer={true}
            className="shadow-lg"
          />
        </Document>
      </div>
    </div>
  );
}
