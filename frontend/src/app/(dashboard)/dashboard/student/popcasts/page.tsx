"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { popcastsApi, type PopcastResponse } from "@/lib/api";
import { Headphones, Trash2, Heart, Play, Pause, Download, Volume2, X, Music } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function StudentPopcastsPage() {
  const queryClient = useQueryClient();
  const [currentPlayingPopcast, setCurrentPlayingPopcast] = useState<PopcastResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Fetch my favorite popcasts
  const { data: popcasts, isLoading } = useQuery<PopcastResponse[]>({
    queryKey: ["my-favorite-popcasts"],
    queryFn: () => popcastsApi.getFavorites(),
  });

  // Unfavorite mutation
  const unfavoriteMutation = useMutation({
    mutationFn: (id: string) => popcastsApi.unfavorite(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-favorite-popcasts"] });
    },
    onError: (err: any) => {
      alert("Favorilerden çıkarılırken hata oluştu: " + (err.message || "Bilinmeyen Hata"));
    }
  });

  useEffect(() => {
    audioRef.current = new Audio();

    const handleTimeUpdate = () => {
      if (audioRef.current) {
        setCurrentTime(audioRef.current.currentTime);
        setAudioProgress((audioRef.current.currentTime / audioRef.current.duration) * 100 || 0);
      }
    };

    const handleLoadedMetadata = () => {
      if (audioRef.current) {
        setAudioDuration(audioRef.current.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setAudioProgress(0);
      setCurrentTime(0);
    };

    audioRef.current.addEventListener("timeupdate", handleTimeUpdate);
    audioRef.current.addEventListener("loadedmetadata", handleLoadedMetadata);
    audioRef.current.addEventListener("ended", handleEnded);

    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.removeEventListener("timeupdate", handleTimeUpdate);
        audioRef.current.removeEventListener("loadedmetadata", handleLoadedMetadata);
        audioRef.current.removeEventListener("ended", handleEnded);
      }
    };
  }, []);

  const handlePlayPause = (popcast: PopcastResponse) => {
    if (!audioRef.current) return;

    if (currentPlayingPopcast?.id === popcast.id) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play().catch(() => {});
        setIsPlaying(true);
      }
    } else {
      audioRef.current.pause();
      audioRef.current.src = popcast.audio_url;
      setCurrentPlayingPopcast(popcast);
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {});
    }
  };

  const handleDownload = (e: React.MouseEvent, url: string, title: string) => {
    e.stopPropagation();
    fetch(url)
      .then((res) => res.blob())
      .then((blob) => {
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = `${title}.mp3`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      })
      .catch(() => {
        window.open(url, "_blank");
      });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-12 min-h-[400px]">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-teal-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8 pb-32">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Favori Popcast'lerim</h1>
        <p className="text-gray-500 font-semibold text-sm mt-1">Eğlenerek öğrenmek için favorilerinize kaydettiğiniz tüm ses kayıtları buradadır.</p>
      </div>

      {/* Popcast List */}
      {!popcasts || popcasts.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow">
            <Heart className="w-8 h-8 fill-teal-600 text-teal-600" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Henüz favori kaydınız yok</h3>
            <p className="text-sm text-gray-500 max-w-sm">Ana sayfada onaylanan Popcast'leri dinlerken kalp ikonuna tıklayarak favorilerinize ekleyebilirsiniz.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popcasts.map((popcast) => {
            const isCurrent = currentPlayingPopcast?.id === popcast.id;
            const isPlayingThis = isCurrent && isPlaying;

            return (
              <div key={popcast.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow relative">
                <div className="p-6 space-y-4">
                  {/* Cover fallback */}
                  <div className="aspect-video rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 overflow-hidden relative flex items-center justify-center shadow-inner">
                    {popcast.cover_image_url ? (
                      <img src={popcast.cover_image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <Headphones className="w-12 h-12 text-white/30" />
                    )}
                    <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
                      {Math.floor(popcast.duration / 60)}:{(Math.floor(popcast.duration % 60)).toString().padStart(2, '0')}
                    </span>

                    {/* Play Button Overlay */}
                    <button
                      onClick={() => handlePlayPause(popcast)}
                      className="absolute w-12 h-12 bg-teal-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-105 hover:bg-teal-600 transition-transform cursor-pointer"
                    >
                      {isPlayingThis ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white translate-x-0.5" />}
                    </button>
                  </div>

                  <div className="space-y-2">
                    <h3 className="font-extrabold text-gray-900 line-clamp-1 leading-snug">{popcast.title}</h3>
                    <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                      {popcast.description || "Açıklama bulunmamaktadır."}
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-slate-50/50 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-slate-200 overflow-hidden">
                      {popcast.teacher?.avatar_url ? (
                        <img src={popcast.teacher.avatar_url} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full bg-teal-600 text-white flex items-center justify-center text-[10px] font-bold">
                          {popcast.teacher?.full_name?.charAt(0) || "E"}
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-gray-600 font-bold">{popcast.teacher?.full_name || "Eğitmen"}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDownload(e, popcast.audio_url, popcast.title)}
                      className="w-9 h-9 rounded-xl border border-gray-200 hover:border-gray-300 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors cursor-pointer bg-white"
                      title="İndir"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => unfavoriteMutation.mutate(popcast.id)}
                      className="w-9 h-9 rounded-xl border border-rose-100 hover:border-rose-300 text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-colors cursor-pointer bg-white"
                      title="Favorilerden Kaldır"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Sticky Player HUD at the bottom */}
      <AnimatePresence>
        {currentPlayingPopcast && (
          <motion.div 
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 max-w-xl w-[calc(100%-2rem)] bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-2xl flex items-center justify-between gap-4 z-50 text-white"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0 border border-teal-500/30 overflow-hidden">
                {currentPlayingPopcast.cover_image_url ? (
                  <img src={currentPlayingPopcast.cover_image_url} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Headphones className="w-5 h-5 text-teal-400" />
                )}
              </div>
              <div className="min-w-0">
                <h4 className="font-bold text-sm truncate leading-snug">{currentPlayingPopcast.title}</h4>
                <p className="text-[11px] text-teal-400/90 font-semibold truncate mt-0.5">{currentPlayingPopcast.teacher?.full_name || "Eğitmen"}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden sm:block text-xs font-semibold text-slate-400 tabular-nums">
                {Math.floor(currentTime / 60)}:{(Math.floor(currentTime % 60)).toString().padStart(2, '0')}
              </div>
              <div className="w-20 sm:w-32 h-1.5 bg-slate-800 rounded-full overflow-hidden relative">
                <div className="bg-teal-400 h-full transition-all duration-100" style={{ width: `${audioProgress}%` }}></div>
              </div>
              <div className="hidden sm:block text-xs font-semibold text-slate-400 tabular-nums">
                {Math.floor(audioDuration / 60)}:{(Math.floor(audioDuration % 60)).toString().padStart(2, '0')}
              </div>

              <button 
                onClick={() => handlePlayPause(currentPlayingPopcast)}
                className="w-10 h-10 bg-teal-500 text-white rounded-full flex items-center justify-center hover:scale-105 hover:bg-teal-600 transition-transform flex-shrink-0 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-white" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
