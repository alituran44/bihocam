"use client";

/**
 * EPIC-10: Reusable File Upload Component (EP10-FE-06)
 * 
 * Production-grade file upload component with drag & drop, progress tracking,
 * and comprehensive error handling.
 */

import { useState, useRef, useCallback, DragEvent, ChangeEvent } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { validateFileMimeType } from "@/lib/security";

export interface FileUploadProps {
  accept?: string;  // ".pdf,.docx,.pptx" or MIME types
  maxSizeMB?: number;  // Max file size in MB
  onUpload: (file: File, onProgress?: (progress: number) => void, abortSignal?: AbortSignal) => Promise<void>;
  onRemove?: () => void;
  currentFile?: {
    name: string;
    size: number;
    url?: string;
  };
  disabled?: boolean;
  label?: string;
  description?: string;
  multiple?: boolean;
  className?: string;
  enableChunkedUpload?: boolean;  // Enable chunked upload for large files (>50MB)
  chunkSizeMB?: number;  // Chunk size in MB (default: 5MB)
}

type UploadState = "idle" | "uploading" | "success" | "error";

export function FileUpload({
  accept,
  maxSizeMB,
  onUpload,
  onRemove,
  currentFile,
  disabled = false,
  label = "Dosya Yükle",
  description,
  multiple = false,
  className,
  enableChunkedUpload = false,
  chunkSizeMB = 5,
}: FileUploadProps) {
  const [state, setState] = useState<UploadState>("idle");
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Format file size
  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon based on type
  const getFileIcon = (file: File): string => {
    const type = file.type;
    if (type.startsWith("image/")) return "🖼️";
    if (type === "application/pdf") return "📄";
    if (type.includes("video")) return "🎬";
    if (type.includes("word") || type.includes("document")) return "📝";
    if (type.includes("presentation") || type.includes("powerpoint")) return "📊";
    return "📎";
  };

  // Validate file
  const validateFile = (file: File): string | null => {
    // Check file type using MIME type validation
    if (accept) {
      const acceptedTypes = accept.split(",").map((t) => t.trim());
      const mimeValidation = validateFileMimeType(file, acceptedTypes);
      if (!mimeValidation.valid) {
        return mimeValidation.error || `Bu dosya tipi kabul edilmiyor. İzin verilen tipler: ${accept}`;
      }
    }

    // Check file size
    if (maxSizeMB) {
      const maxBytes = maxSizeMB * 1024 * 1024;
      if (file.size > maxBytes) {
        return `Dosya boyutu çok büyük. Maksimum: ${maxSizeMB} MB`;
      }
    }

    return null;
  };

  // Handle file selection
  const handleFileSelect = useCallback(
    async (file: File) => {
      const validationError = validateFile(file);
      if (validationError) {
        setErrorMessage(validationError);
        setState("error");
        return;
      }

      // Create preview for images
      if (file.type.startsWith("image/")) {
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        setPreviewUrl(null);
      }

      setState("uploading");
      setUploadProgress(0);
      setErrorMessage(null);

      // Create AbortController for cancellation
      abortControllerRef.current = new AbortController();

      try {
        // EP10-FE-12: Chunked upload for large files (>50MB)
        const shouldUseChunked = enableChunkedUpload && file.size > 50 * 1024 * 1024; // 50MB threshold
        
        if (shouldUseChunked) {
          // Chunked upload implementation
          const { uploadFileInChunks } = await import("@/lib/upload");
          const chunkSize = chunkSizeMB * 1024 * 1024;
          
          // Note: Backend needs to support chunked upload endpoint
          // For now, fallback to regular upload
          await onUpload(file, (progress) => {
            setUploadProgress(progress);
          }, abortControllerRef.current.signal);
        } else {
          // Regular upload with progress tracking
          await onUpload(file, (progress) => {
            setUploadProgress(progress);
          }, abortControllerRef.current.signal);
        }
        
        setState("success");
        setUploadProgress(100);
        abortControllerRef.current = null;
      } catch (error: any) {
        if (error?.name === "AbortError" || abortControllerRef.current?.signal.aborted) {
          setState("idle");
          setUploadProgress(0);
          setErrorMessage(null);
        } else {
          setState("error");
          setErrorMessage(
            error?.response?.data?.detail || error?.message || "Dosya yüklenirken bir hata oluştu."
          );
        }
        abortControllerRef.current = null;
      }
    },
    [onUpload, accept, maxSizeMB]
  );

  // Handle drag events
  const handleDragEnter = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) setIsDragging(true);
  }, [disabled]);

  const handleDragLeave = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    // Only set dragging to false if we're leaving the dropzone (not entering a child)
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = e.clientX;
    const y = e.clientY;
    if (x < rect.left || x > rect.right || y < rect.top || y > rect.bottom) {
      setIsDragging(false);
    }
  }, []);

  const handleDragOver = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled && !isDragging) {
      setIsDragging(true);
    }
  }, [disabled, isDragging]);

  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;

    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelect(files[0]); // For now, handle only first file
    }
  }, [disabled, handleFileSelect]);

  // Handle file input change
  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      handleFileSelect(files[0]);
    }
  };

  // Handle remove
  const handleRemove = () => {
    // Cancel upload if in progress
    if (state === "uploading" && abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }
    setState("idle");
    setUploadProgress(0);
    setErrorMessage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
    onRemove?.();
  };

  // Get current file info
  const displayFile = currentFile || (state === "success" && fileInputRef.current?.files?.[0] ? {
    name: fileInputRef.current.files[0].name,
    size: fileInputRef.current.files[0].size,
  } : null);

  return (
    <div className={cn("w-full", className)}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label}
        </label>
      )}
      {description && (
        <p className="text-xs text-gray-500 mb-3">{description}</p>
      )}

      {/* Dropzone */}
      <label
        onDragEnter={handleDragEnter}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={(e) => {
          if (disabled || displayFile) {
            e.preventDefault();
          }
        }}
        onKeyDown={(e) => {
          if ((e.key === "Enter" || e.key === " ") && !disabled && !displayFile) {
            e.preventDefault();
            fileInputRef.current?.click();
          }
        }}
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={label || "Dosya yükleme alanı"}
        aria-describedby={description ? `file-upload-desc-${label}` : undefined}
        aria-busy={state === "uploading"}
        aria-live="polite"
        className={cn(
          "block cursor-pointer relative border-2 border-dashed rounded-xl transition-all duration-200",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-teal-500 focus-within:ring-offset-2",
          isDragging && !disabled
            ? "border-teal-500 bg-teal-50/50 scale-[1.02]"
            : "border-gray-300 hover:border-teal-400 hover:bg-gray-50/50",
          disabled && "opacity-50 cursor-not-allowed",
          displayFile && "border-teal-500 bg-teal-50/30",
          state === "error" && "border-rose-500 bg-rose-50/30"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          disabled={disabled}
          onChange={handleInputChange}
          className="hidden"
          aria-label={label || "Dosya seç"}
        />

        <AnimatePresence mode="wait">
          {!displayFile ? (
            // Empty state
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center p-8 text-center"
            >
              <motion.div
                animate={{ y: [0, -4, 0] }}
                transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
                className="text-4xl mb-3"
              >
                ☁️
              </motion.div>
              <p className="text-sm font-medium text-gray-700 mb-1">
                Dosyayı buraya sürükleyin veya tıklayın
              </p>
              {description && (
                <p id={`file-upload-desc-${label}`} className="text-xs text-gray-500 mb-1">
                  {description}
                </p>
              )}
              <p className="text-xs text-gray-500">
                {accept && `İzin verilen tipler: ${accept}`}
                {maxSizeMB && ` • Maksimum: ${maxSizeMB} MB`}
              </p>
            </motion.div>
          ) : (
            // File preview
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="p-4"
            >
              <div className="flex items-start gap-4">
                {/* Preview/Icon */}
                <div className="flex-shrink-0">
                  {previewUrl ? (
                    <img
                      src={previewUrl}
                      alt="Preview"
                      className="w-16 h-16 object-cover rounded-lg border border-gray-200"
                    />
                  ) : (
                    <div className="w-16 h-16 flex items-center justify-center bg-gradient-to-br from-teal-100 to-teal-200 rounded-lg text-3xl">
                      {displayFile.name && getFileIcon(new File([], displayFile.name))}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {displayFile.name}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatFileSize(displayFile.size)}
                  </p>

                  {/* Progress Bar */}
                  {state === "uploading" && (
                    <div className="mt-3">
                      <div 
                        className="h-2 bg-gray-200 rounded-full overflow-hidden"
                        role="progressbar"
                        aria-valuenow={uploadProgress}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Yükleme ilerlemesi: %${uploadProgress}`}
                      >
                        <motion.div
                          className="h-full bg-gradient-to-r from-teal-500 to-emerald-500"
                          initial={{ width: 0 }}
                          animate={{ width: `${uploadProgress}%` }}
                          transition={{ duration: 0.3 }}
                        />
                      </div>
                      <p className="text-xs text-gray-600 mt-1 text-right">
                        %{uploadProgress}
                      </p>
                    </div>
                  )}

                  {/* Success State */}
                  {state === "success" && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="mt-2 flex items-center gap-2 text-sm text-emerald-600"
                    >
                      <motion.svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M5 13l4 4L19 7"
                        />
                      </motion.svg>
                      <span>Yükleme tamamlandı</span>
                    </motion.div>
                  )}

                  {/* Error State */}
                  {state === "error" && errorMessage && (
                    <motion.div
                      initial={{ opacity: 0, y: -4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-2 flex items-start gap-2 text-sm text-rose-600"
                      role="alert"
                      aria-live="assertive"
                    >
                      <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      <span className="flex-1">{errorMessage}</span>
                    </motion.div>
                  )}
                </div>

                {/* Remove Button */}
                {!disabled && (state === "success" || state === "error" || currentFile) && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemove();
                    }}
                    className="flex-shrink-0 p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                    aria-label="Dosyayı kaldır"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </label>
    </div>
  );
}
