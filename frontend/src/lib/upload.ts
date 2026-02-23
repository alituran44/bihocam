/**
 * EPIC-10: Chunked Upload Utility (EP10-FE-12)
 * 
 * Utilities for chunked file upload with retry and resume support
 */

const CHUNK_SIZE = 5 * 1024 * 1024; // 5MB chunks
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

export interface ChunkedUploadOptions {
  chunkSize?: number;
  maxRetries?: number;
  onProgress?: (progress: number) => void;
  onChunkProgress?: (chunkIndex: number, totalChunks: number) => void;
  abortSignal?: AbortSignal;
}

export interface ChunkedUploadResult {
  success: boolean;
  error?: string;
}

/**
 * Upload file in chunks
 */
export async function uploadFileInChunks(
  file: File,
  uploadUrl: string,
  uploadChunk: (chunk: Blob, chunkIndex: number, totalChunks: number, uploadId?: string) => Promise<{ uploadId?: string; chunkUrl?: string }>,
  options: ChunkedUploadOptions = {}
): Promise<ChunkedUploadResult> {
  const {
    chunkSize = CHUNK_SIZE,
    maxRetries = MAX_RETRIES,
    onProgress,
    onChunkProgress,
    abortSignal,
  } = options;

  const totalChunks = Math.ceil(file.size / chunkSize);
  let uploadId: string | undefined;
  let uploadedChunks = 0;

  try {
    for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex++) {
      // Check if aborted
      if (abortSignal?.aborted) {
        return { success: false, error: "Upload cancelled" };
      }

      const start = chunkIndex * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      // Retry logic for each chunk
      let lastError: Error | null = null;
      for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
          const result = await uploadChunk(chunk, chunkIndex, totalChunks, uploadId);
          if (result.uploadId) {
            uploadId = result.uploadId;
          }
          uploadedChunks++;
          break; // Success, move to next chunk
        } catch (error) {
          lastError = error as Error;
          if (attempt < maxRetries - 1) {
            // Wait before retry
            await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY * (attempt + 1)));
          }
        }
      }

      // If all retries failed for this chunk
      if (uploadedChunks <= chunkIndex) {
        return {
          success: false,
          error: lastError?.message || `Failed to upload chunk ${chunkIndex + 1}`,
        };
      }

      // Update progress
      const progress = Math.round((uploadedChunks / totalChunks) * 100);
      onProgress?.(progress);
      onChunkProgress?.(chunkIndex, totalChunks);
    }

    return { success: true };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Upload failed",
    };
  }
}

/**
 * Create AbortController for upload cancellation
 */
export function createUploadController(): AbortController {
  return new AbortController();
}
