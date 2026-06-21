"use client";

import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { popcastsApi, type PopcastResponse, type PopcastStatus } from "@/lib/api";
import { Headphones, CheckCircle2, XCircle, AlertCircle, Clock, Play, Pause, FileText, Check, X, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminPopcastsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<PopcastStatus | undefined>(undefined);
  const [currentPlayingPopcast, setCurrentPlayingPopcast] = useState<PopcastResponse | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioProgress, setAudioProgress] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [adminNote, setAdminNote] = useState("");

  // Fetch all popcasts for admin
  const { data: popcasts, isLoading } = useQuery<PopcastResponse[]>({
    queryKey: ["admin-popcasts", statusFilter],
    queryFn: () => popcastsApi.adminListAll(statusFilter),
  });

  // Review mutation
  const reviewMutation = useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: PopcastStatus; note?: string }) =>
      popcastsApi.adminReview(id, { status, admin_note: note }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-popcasts"] });
      setRejectingId(null);
      setAdminNote("");
    },
    onError: (err: any) => {
      alert("İşlem yapılırken hata oluştu: " + (err.message || "Bilinmeyen Hata"));
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

  const handleApprove = (id: string) => {
    if (confirm("Bu popcast'i onaylamak ve yayına almak istediğinize emin misiniz?")) {
      reviewMutation.mutate({ id, status: "approved" as PopcastStatus });
    }
  };

  const handleRejectSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectingId || !adminNote) return;
    reviewMutation.mutate({ id: rejectingId, status: "rejected" as PopcastStatus, note: adminNote });
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "approved":
        return <span className="px-2.5 py-1 text-xs font-bold bg-emerald-50 border border-emerald-100 text-emerald-600 rounded-lg">Yayında</span>;
      case "rejected":
        return <span className="px-2.5 py-1 text-xs font-bold bg-rose-50 border border-rose-100 text-rose-600 rounded-lg">Reddedildi</span>;
      case "pending_review":
      default:
        return <span className="px-2.5 py-1 text-xs font-bold bg-amber-50 border border-amber-100 text-amber-600 rounded-lg">İnceleme Bekliyor</span>;
    }
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
        <h1 className="text-3xl font-black text-gray-900 tracking-tight">Popcast Onay Paneli</h1>
        <p className="text-gray-500 font-semibold text-sm mt-1">Eğitmenler tarafından gönderilen ses kayıtlarını inceleyin, onaylayın veya gerekçe girerek reddedin.</p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-gray-100 pb-px">
        <button
          onClick={() => setStatusFilter(undefined)}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
            statusFilter === undefined ? "border-teal-500 text-teal-600 bg-teal-50/10" : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Tümü
        </button>
        <button
          onClick={() => setStatusFilter("pending_review" as PopcastStatus)}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
            statusFilter === "pending_review" ? "border-teal-500 text-teal-600 bg-teal-50/10" : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Bekleyenler
        </button>
        <button
          onClick={() => setStatusFilter("approved" as PopcastStatus)}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
            statusFilter === "approved" ? "border-teal-500 text-teal-600 bg-teal-50/10" : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Onaylananlar
        </button>
        <button
          onClick={() => setStatusFilter("rejected" as PopcastStatus)}
          className={`px-4 py-2 text-xs font-bold rounded-t-xl border-b-2 transition-all cursor-pointer ${
            statusFilter === "rejected" ? "border-teal-500 text-teal-600 bg-teal-50/10" : "border-transparent text-gray-400 hover:text-gray-600"
          }`}
        >
          Reddedilenler
        </button>
      </div>

      {/* Popcast List */}
      {!popcasts || popcasts.length === 0 ? (
        <div className="bg-slate-50 border border-slate-100 rounded-3xl p-12 text-center flex flex-col items-center justify-center space-y-4">
          <ShieldAlert className="w-12 h-12 text-gray-400" />
          <h3 className="text-lg font-bold text-gray-900">Eşleşen Popcast bulunamadı</h3>
          <p className="text-sm text-gray-500">Bu filtrelere uygun herhangi bir Popcast kaydı bulunmamaktadır.</p>
        </div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-3xl border border-gray-100 shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                <th className="p-6">Popcast Bilgileri</th>
                <th className="p-6">Eğitmen</th>
                <th className="p-6">Süre</th>
                <th className="p-6">Tarih</th>
                <th className="p-6">Durum</th>
                <th className="p-6 text-right">İşlemler</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50 text-sm font-semibold text-gray-700">
              {popcasts.map((popcast) => {
                const isCurrent = currentPlayingPopcast?.id === popcast.id;
                const isPlayingThis = isCurrent && isPlaying;

                return (
                  <tr key={popcast.id} className="hover:bg-slate-50/40 transition-colors">
                    <td className="p-6">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => handlePlayPause(popcast)}
                          className="w-10 h-10 rounded-xl bg-teal-50 hover:bg-teal-100 border border-teal-100 flex items-center justify-center text-teal-600 transition-colors cursor-pointer flex-shrink-0"
                        >
                          {isPlayingThis ? <Pause className="w-4 h-4 fill-teal-600" /> : <Play className="w-4 h-4 fill-teal-600 translate-x-0.5" />}
                        </button>
                        <div>
                          <h4 className="font-extrabold text-gray-900 leading-snug">{popcast.title}</h4>
                          <p className="text-xs text-gray-400 mt-1 max-w-sm line-clamp-1">{popcast.description || "Açıklama girilmedi"}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-6">
                      <span className="font-bold text-gray-800">{popcast.teacher?.full_name || "Eğitmen"}</span>
                    </td>
                    <td className="p-6 tabular-nums">
                      {Math.floor(popcast.duration / 60)}:{(Math.floor(popcast.duration % 60)).toString().padStart(2, '0')}
                    </td>
                    <td className="p-6">
                      <span className="text-xs text-gray-400">
                        {new Date(popcast.created_at).toLocaleDateString("tr-TR")}
                      </span>
                    </td>
                    <td className="p-6">
                      {getStatusLabel(popcast.status)}
                    </td>
                    <td className="p-6 text-right">
                      {popcast.status === "pending_review" && (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => handleApprove(popcast.id)}
                            className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 flex items-center justify-center border border-emerald-100 transition-colors cursor-pointer"
                            title="Onayla"
                          >
                            <Check className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setRejectingId(popcast.id)}
                            className="w-8 h-8 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 flex items-center justify-center border border-rose-100 transition-colors cursor-pointer"
                            title="Reddet"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      )}
                      {popcast.status === "rejected" && popcast.admin_note && (
                        <span className="text-xs text-gray-400 italic font-medium" title={popcast.admin_note}>
                          Reddedildi ({popcast.admin_note})
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Reject Modal */}
      {rejectingId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] border border-gray-100 shadow-2xl p-6 md:p-8 space-y-6 relative">
            <button
              onClick={() => {
                setRejectingId(null);
                setAdminNote("");
              }}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900 tracking-tight">Popcast Başvurusunu Reddet</h3>
              <p className="text-xs text-gray-400 font-semibold">Lütfen eğitmenin görebileceği bir red gerekçesi girin.</p>
            </div>

            <form onSubmit={handleRejectSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Red Gerekçesi</label>
                <textarea
                  required
                  rows={4}
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Dosya bozuk, ses kalitesi yetersiz, vb..."
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-gray-100 rounded-2xl focus:border-teal-500 focus:bg-white transition-all outline-none text-sm font-semibold text-gray-800"
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setRejectingId(null);
                    setAdminNote("");
                  }}
                  className="flex-1 py-3 border-2 border-gray-200 text-gray-500 hover:bg-slate-50 font-bold rounded-2xl transition-colors cursor-pointer text-sm"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={reviewMutation.isPending}
                  className="flex-1 py-3 bg-rose-500 hover:bg-rose-600 text-white font-bold rounded-2xl shadow-lg hover:shadow-rose-500/20 transition-all cursor-pointer text-sm"
                >
                  {reviewMutation.isPending ? "Reddediliyor..." : "Reddet"}
                </button>
              </div>
            </form>
          </div>
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
              <div className="w-10 h-10 rounded-lg bg-teal-500/20 flex items-center justify-center flex-shrink-0 border border-teal-500/30 overflow-hidden animate-pulse">
                <Headphones className="w-5 h-5 text-teal-400" />
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
