"use client";

/**
 * EPIC-10: Video Player Component (EP10-FE-03)
 * 
 * Production-grade video player with progress tracking, playback controls,
 * and support for local videos, YouTube, and Vimeo.
 */

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { API_URL } from "@/lib/api";

interface VideoPlayerProps {
  videoUrl: string | null;  // YouTube/Vimeo URL
  contentUrl: string | null;  // Local video URL (backend-provided)
  contentPath: string | null;  // Fallback: content_path
  title: string;
  watchedSeconds?: number;  // Resume from this point
  onProgress?: (seconds: number) => void;  // Progress callback
  onComplete?: () => void;  // Completion callback
  className?: string;
}

function getYouTubeVideoId(url: string | null): string | null {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

function getVimeoVideoId(url: string | null): string | null {
  if (!url) return null;
  const regExp = /(?:vimeo)\.com.*(?:videos|video|channels|)\/([\d]+)/i;
  const match = url.match(regExp);
  return match ? match[1] : null;
}

export function VideoPlayer({
  videoUrl,
  contentUrl,
  contentPath,
  title,
  watchedSeconds = 0,
  onProgress,
  onComplete,
  className,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const controlsTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const youtubeVideoId = getYouTubeVideoId(videoUrl);
  const vimeoVideoId = getVimeoVideoId(videoUrl);
  const isEmbed = youtubeVideoId || vimeoVideoId;
  
  // Build local video URL - prefer contentUrl, fallback to contentPath
  const getLocalVideoUrl = (): string | null => {
    let baseUrl: string | null = null;
    
    if (contentUrl) {
      // Normalize backslashes to forward slashes (Windows paths)
      const normalizedUrl = contentUrl.replace(/\\/g, "/");
      
      // If URL is absolute (http/https), use as-is
      if (normalizedUrl.startsWith("http://") || normalizedUrl.startsWith("https://")) {
        baseUrl = normalizedUrl;
      } else if (normalizedUrl.startsWith("/api/v1")) {
        // If URL already starts with /api/v1, we need to prepend only the base URL (without /api/v1)
        const base = API_URL.replace("/api/v1", "");
        baseUrl = `${base}${normalizedUrl}`;
      } else {
        // If URL is relative but doesn't start with /api/v1, prepend API_URL
        const cleanUrl = normalizedUrl.startsWith("/") ? normalizedUrl.substring(1) : normalizedUrl;
        baseUrl = `${API_URL}/${cleanUrl}`;
      }
    } else if (contentPath) {
      // Normalize backslashes to forward slashes
      const normalizedPath = contentPath.replace(/\\/g, "/");
      const filename = normalizedPath.split("/").pop();
      if (filename) {
        // URL encode filename to handle spaces and special characters
        const encodedFilename = encodeURIComponent(filename);
        // API_URL already includes /api/v1, so we just need /media/videos/...
        baseUrl = `${API_URL}/media/videos/${encodedFilename}`;
      }
    }
    
    if (!baseUrl) {
      console.log("[VideoPlayer] No contentUrl or contentPath available");
      return null;
    }
    
    // Add token as query parameter for authentication (video elements don't send headers)
    const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;
    if (token) {
      const separator = baseUrl.includes("?") ? "&" : "?";
      return `${baseUrl}${separator}token=${encodeURIComponent(token)}`;
    }
    
    return baseUrl;
  };
  
  const localVideoUrl = getLocalVideoUrl();

  // Resume from watched seconds
  useEffect(() => {
    if (videoRef.current && watchedSeconds > 0 && !isEmbed) {
      videoRef.current.currentTime = watchedSeconds;
    }
  }, [watchedSeconds, isEmbed]);

  // Progress tracking
  useEffect(() => {
    if (!videoRef.current || isEmbed) return;

    const handleTimeUpdate = () => {
      if (videoRef.current) {
        const time = Math.floor(videoRef.current.currentTime);
        setCurrentTime(time);
        onProgress?.(time);
      }
    };

    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setDuration(videoRef.current.duration);
        setIsLoading(false);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      onComplete?.();
    };

    const video = videoRef.current;
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("ended", handleEnded);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("ended", handleEnded);
    };
  }, [isEmbed, onProgress, onComplete]);

  // Auto-hide controls
  useEffect(() => {
    if (isEmbed) return;

    const resetControlsTimeout = () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
      setShowControls(true);
      controlsTimeoutRef.current = setTimeout(() => {
        if (isPlaying) {
          setShowControls(false);
        }
      }, 3000);
    };

    resetControlsTimeout();

    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, [isPlaying, isEmbed]);

  const togglePlay = () => {
    if (isEmbed) return;
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isEmbed || !videoRef.current) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    const newTime = percent * duration;
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleFullscreen = () => {
    if (isEmbed) return;
    if (!isFullscreen) {
      videoRef.current?.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const formatTime = (seconds: number): string => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  if (error) {
    return (
      <div className={`bg-gray-900 rounded-lg aspect-video flex items-center justify-center ${className}`}>
        <div className="text-center text-white">
          <svg className="w-16 h-16 mx-auto mb-4 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold mb-2">Video yüklenemedi</p>
          <p className="text-sm text-gray-400">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`relative bg-black rounded-lg overflow-hidden aspect-video group ${className}`}
      onMouseMove={() => {
        if (!isEmbed) setShowControls(true);
      }}
      onMouseLeave={() => {
        if (!isEmbed && isPlaying) setShowControls(false);
      }}
    >
      {/* YouTube Embed */}
      {youtubeVideoId && (
        <iframe
          className="w-full h-full"
          src={`https://www.youtube.com/embed/${youtubeVideoId}?rel=0&modestbranding=1&start=${watchedSeconds || 0}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      )}

      {/* Vimeo Embed */}
      {!youtubeVideoId && vimeoVideoId && (
        <iframe
          className="w-full h-full"
          src={`https://player.vimeo.com/video/${vimeoVideoId}?title=0&byline=0&portrait=0#t=${watchedSeconds || 0}`}
          title={title}
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
          onLoad={() => setIsLoading(false)}
        />
      )}

      {/* Local Video */}
      {!isEmbed && localVideoUrl && (
        <>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 z-10">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-gray-400">Video yükleniyor...</p>
              </div>
            </div>
          )}

          <video
            ref={videoRef}
            className="w-full h-full"
            src={localVideoUrl}
            onLoadedData={() => setIsLoading(false)}
            onError={() => {
              setError("Video oynatılamadı. Lütfen tekrar deneyin.");
              setIsLoading(false);
            }}
            onPlay={() => setIsPlaying(true)}
            onPause={() => setIsPlaying(false)}
          />

          {/* Custom Controls */}
          <AnimatePresence>
            {showControls && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none"
              >
                {/* Progress Bar */}
                <div
                  className="absolute bottom-16 left-0 right-0 h-1 bg-gray-700 cursor-pointer group-hover:h-2 transition-all"
                  onClick={handleSeek}
                >
                  <div
                    className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all"
                    style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                  />
                </div>

                {/* Controls */}
                <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-auto">
                  <div className="flex items-center gap-4">
                    {/* Play/Pause */}
                    <button
                      onClick={togglePlay}
                      className="text-white hover:text-teal-400 transition-colors"
                      aria-label={isPlaying ? "Duraklat" : "Oynat"}
                    >
                      {isPlaying ? (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
                        </svg>
                      ) : (
                        <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      )}
                    </button>

                    {/* Time */}
                    <span className="text-white text-sm font-mono min-w-[100px]">
                      {formatTime(currentTime)} / {formatTime(duration)}
                    </span>

                    {/* Volume */}
                    <div className="flex items-center gap-2 flex-1">
                      <button
                        onClick={() => {
                          if (videoRef.current) {
                            const newVolume = volume > 0 ? 0 : 1;
                            videoRef.current.volume = newVolume;
                            setVolume(newVolume);
                          }
                        }}
                        className="text-white hover:text-teal-400 transition-colors"
                        aria-label={volume > 0 ? "Sesi kapat" : "Sesi aç"}
                      >
                        {volume > 0 ? (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                          </svg>
                        ) : (
                          <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                          </svg>
                        )}
                      </button>
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.1"
                        value={volume}
                        onChange={(e) => {
                          const newVolume = parseFloat(e.target.value);
                          if (videoRef.current) {
                            videoRef.current.volume = newVolume;
                            setVolume(newVolume);
                          }
                        }}
                        className="w-24 h-1 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-teal-500"
                      />
                    </div>

                    {/* Playback Speed */}
                    <select
                      value={playbackRate}
                      onChange={(e) => {
                        const rate = parseFloat(e.target.value);
                        if (videoRef.current) {
                          videoRef.current.playbackRate = rate;
                          setPlaybackRate(rate);
                        }
                      }}
                      className="bg-gray-800 text-white text-sm px-2 py-1 rounded border border-gray-700"
                    >
                      <option value="0.5">0.5x</option>
                      <option value="0.75">0.75x</option>
                      <option value="1">1x</option>
                      <option value="1.25">1.25x</option>
                      <option value="1.5">1.5x</option>
                      <option value="2">2x</option>
                    </select>

                    {/* Fullscreen */}
                    <button
                      onClick={toggleFullscreen}
                      className="text-white hover:text-teal-400 transition-colors"
                      aria-label="Tam ekran"
                    >
                      <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                      </svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}

      {/* No Video */}
      {!isEmbed && !localVideoUrl && (
        <div className="w-full h-full flex items-center justify-center bg-gray-900 text-white">
          <div className="text-center">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-400">Video içeriği bulunamadı</p>
          </div>
        </div>
      )}
    </div>
  );
}
