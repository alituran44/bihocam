"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialApi, mediaApi } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import { useAuthStore } from "@/lib/store";
import { toast } from "sonner";
import Link from "next/link";

// Seviye Tanımları & Renkleri
const EDUCATION_LEVELS = [
  { id: "all", label: "Tüm Seviyeler", icon: "🌟", color: "from-slate-700 to-slate-800" },
  { id: "lgs", label: "LGS (8. Sınıf)", icon: "📘", color: "from-blue-600 to-indigo-600" },
  { id: "yks_tyt", label: "YKS / TYT", icon: "📐", color: "from-emerald-600 to-teal-600" },
  { id: "yks_ayt", label: "YKS / AYT", icon: "🔬", color: "from-purple-600 to-violet-600" },
  { id: "kpss", label: "KPSS / DGS", icon: "📚", color: "from-amber-600 to-orange-600" },
  { id: "lise", label: "Lise (9-12)", icon: "🏫", color: "from-rose-600 to-pink-600" },
  { id: "ortaokul", label: "Ortaokul (5-7)", icon: "🎒", color: "from-cyan-600 to-blue-600" },
  { id: "ilkokul", label: "İlkokul (1-4)", icon: "🎨", color: "from-fuchsia-600 to-pink-600" },
];

function getLevelBadge(levelId?: string | null) {
  const match = EDUCATION_LEVELS.find((l) => l.id === levelId);
  if (!match || match.id === "all") return null;
  return match;
}

// Medya URL'sini dogru backend adresine ceviren yardimci fonksiyon
function getMediaUrl(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://") || url.startsWith("blob:")) {
    return url;
  }
  const backendBase = process.env.NEXT_PUBLIC_API_URL
    ? process.env.NEXT_PUBLIC_API_URL.replace(/\/api\/v1\/?$/, "")
    : "http://127.0.0.1:8000";
  return `${backendBase}${url.startsWith("/") ? "" : "/"}${url}`;
}

export default function ReelsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [selectedLevel, setSelectedLevel] = useState<string>("all");
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [editingReel, setEditingReel] = useState<any | null>(null);
  const [deletingReelId, setDeletingReelId] = useState<string | null>(null);
  const [commentingReel, setCommentingReel] = useState<any | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const isTeacherOrAdmin = user?.role === "teacher" || user?.role === "admin";

  const { data: reels, isLoading } = useQuery({
    queryKey: ["social-reels", selectedLevel],
    queryFn: () => socialApi.getReels(0, 50, selectedLevel === "all" ? undefined : selectedLevel),
  });

  const activeReel = reels && reels.length > 0 ? reels[activeVideoIndex] : null;

  // Seviye degistiginde oynatici indexini sifirla
  useEffect(() => {
    setActiveVideoIndex(0);
  }, [selectedLevel]);

  const handleSelectReel = (idx: number) => {
    setActiveVideoIndex(idx);
    const targetElement = document.getElementById(`reel-item-${idx}`);
    if (targetElement) {
      targetElement.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const index = Math.round(el.scrollTop / el.clientHeight);
    if (index >= 0 && reels && index < reels.length && index !== activeVideoIndex) {
      setActiveVideoIndex(index);
    }
  };

  const likeMutation = useMutation({
    mutationFn: (postId: string) => socialApi.likePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social-reels"] }),
  });

  const unlikeMutation = useMutation({
    mutationFn: (postId: string) => socialApi.unlikePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social-reels"] }),
  });

  const saveMutation = useMutation({
    mutationFn: (postId: string) => socialApi.savePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social-reels"] }),
  });

  const unsaveMutation = useMutation({
    mutationFn: (postId: string) => socialApi.unsavePost(postId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["social-reels"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: (postId: string) => socialApi.deletePost(postId),
    onSuccess: () => {
      toast.success("Hikaye / Reel videosu basariyla silindi! 🗑️");
      queryClient.invalidateQueries({ queryKey: ["social-reels"] });
      setDeletingReelId(null);
      if (activeVideoIndex > 0) {
        setActiveVideoIndex((prev) => prev - 1);
      }
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Video silinirken bir hata olustu.");
    },
  });

  return (
    <div className="max-w-4xl mx-auto py-4 px-4 space-y-6">
      {/* 1. UST YONETIM & HIKAYE SECICI KONTROL PANELI */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-xl border border-gray-100 space-y-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-teal-500 to-indigo-600 text-white flex items-center justify-center text-2xl shadow-md shadow-teal-500/20 flex-shrink-0">
              🎬
            </div>
            <div>
              <h1 className="text-lg sm:text-xl font-black text-gray-900 flex items-center gap-2">
                <span>Hikaye & Reels Yonetim Merkezi</span>
                <span className="text-xs font-bold px-2.5 py-0.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-full">
                  {reels?.length || 0} Video
                </span>
              </h1>
              <p className="text-xs text-gray-500">
                Seviyenize uygun egitim videolarini izleyin, filtreleyin veya yeni video yukleyin.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            {isTeacherOrAdmin && (
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full sm:w-auto px-5 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-black text-xs rounded-xl shadow-md shadow-teal-500/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span className="text-sm">➕</span>
                <span>YENI HIKAYE YUKLE</span>
              </button>
            )}
            <Link
              href="/dashboard/social/studio"
              className="px-3.5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 whitespace-nowrap"
            >
              <span>🎨 Stüdyo</span>
            </Link>
          </div>
        </div>

        {/* 2. SEVIYE FILTRELEME BUTONLARI (LGS, TYT, AYT, KPSS vb.) */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-gray-700 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯</span>
              <span>Hedef Seviye / Sinav Kategorisi:</span>
            </span>
            <span className="text-[11px] font-semibold text-teal-600">
              {EDUCATION_LEVELS.find((l) => l.id === selectedLevel)?.label}
            </span>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
            {EDUCATION_LEVELS.map((lvl) => {
              const isSelected = selectedLevel === lvl.id;
              return (
                <button
                  key={lvl.id}
                  onClick={() => setSelectedLevel(lvl.id)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 whitespace-nowrap flex-shrink-0 cursor-pointer ${
                    isSelected
                      ? "bg-slate-900 text-teal-300 shadow-md ring-2 ring-teal-500"
                      : "bg-gray-100 hover:bg-gray-200 text-gray-700"
                  }`}
                >
                  <span>{lvl.icon}</span>
                  <span>{lvl.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3. HIKAYE SECICI ACILIR METIN & EYLEM BUTONLARI */}
        {reels && reels.length > 0 && (
          <div className="bg-slate-900 rounded-2xl p-4 sm:p-5 text-white space-y-4 border border-slate-800 shadow-inner">
            <div className="flex flex-col lg:flex-row items-stretch lg:items-end gap-3.5">
              {/* Acilir Liste (Dropdown Select) */}
              <div className="flex-1">
                <label className="block text-xs font-extrabold uppercase tracking-wider text-teal-300 mb-2 flex items-center gap-1.5">
                  <span>🎬</span>
                  <span>Duzenlenecek / Oynatilacak Hikayeyi Secin:</span>
                </label>
                <div className="relative">
                  <select
                    value={activeVideoIndex}
                    onChange={(e) => handleSelectReel(Number(e.target.value))}
                    className="w-full px-4 py-3 bg-slate-800 hover:bg-slate-750 text-white font-bold text-xs sm:text-sm rounded-xl border-2 border-teal-500/40 focus:border-teal-400 focus:ring-2 focus:ring-teal-400/30 outline-none transition-all cursor-pointer appearance-none"
                  >
                    {reels.map((r: any, idx: number) => {
                      const title = r.content?.split("\n")[0] || `Hikaye #${idx + 1}`;
                      const author = r.user?.full_name ? ` (${r.user.full_name})` : "";
                      const badge = getLevelBadge(r.target_level);
                      const levelText = badge ? ` [${badge.label}]` : "";
                      return (
                        <option key={r.id} value={idx} className="bg-slate-900 text-white py-2">
                          #{idx + 1} - {title} {levelText} {author}
                        </option>
                      );
                    })}
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-teal-400 text-xs font-bold">
                    ▼
                  </div>
                </div>
              </div>

              {/* Secili Hikayeye Ozel Butonlar: Yorumlar, Duzenle, Sil */}
              {activeReel && (
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Yorumlar Butonu */}
                  <button
                    onClick={() => setCommentingReel(activeReel)}
                    className="flex-1 sm:flex-initial px-4 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    title="Yorumlari Gor ve Yorum Yaz"
                  >
                    <span className="text-sm">💬</span>
                    <span>Yorumlar ({activeReel.comments_count || 0})</span>
                  </button>

                  {isTeacherOrAdmin && (
                    <>
                      {/* Duzenle Butonu */}
                      <button
                        onClick={() => setEditingReel(activeReel)}
                        className="flex-1 sm:flex-initial px-4 py-3 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Bu Hikayeyi Duzenle"
                      >
                        <span className="text-sm">✏️</span>
                        <span>Duzenle</span>
                      </button>

                      {/* Sil Butonu */}
                      <button
                        onClick={() => setDeletingReelId(activeReel.id)}
                        className="flex-1 sm:flex-initial px-4 py-3 bg-red-600 hover:bg-red-500 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        title="Bu Hikayeyi Sil"
                      >
                        <span className="text-sm">🗑️</span>
                        <span>Sil</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Secili Hikaye Ozet Metni */}
            {activeReel && (
              <div className="flex items-center justify-between bg-slate-950/70 px-4 py-2.5 rounded-xl border border-white/10 text-xs text-slate-300">
                <div className="flex items-center gap-2.5 truncate pr-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-teal-400 animate-pulse flex-shrink-0"></span>
                  <span className="font-black text-white truncate">
                    {activeReel.content?.split("\n")[0] || "Secili Hikaye"}
                  </span>
                  {activeReel.target_level && getLevelBadge(activeReel.target_level) && (
                    <span className="px-2 py-0.5 bg-teal-500/20 text-teal-300 border border-teal-400/30 rounded-md text-[10px] font-bold">
                      {getLevelBadge(activeReel.target_level)?.label}
                    </span>
                  )}
                  {activeReel.content && (
                    <span className="text-slate-400 text-xs truncate hidden md:inline">
                      — {activeReel.content.replace(/\n/g, " ")}
                    </span>
                  )}
                </div>
                <span className="text-[11px] font-extrabold text-teal-300 bg-teal-950/90 px-2.5 py-1 rounded-lg border border-teal-700 flex-shrink-0">
                  {activeVideoIndex + 1} / {reels.length}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Main Reels View */}
      {isLoading ? (
        <div className="min-h-[50vh] flex flex-col items-center justify-center gap-3">
          <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-bold text-gray-400">Hikayeler yukleniyor...</span>
        </div>
      ) : !reels || reels.length === 0 ? (
        <div className="min-h-[45vh] bg-white rounded-3xl border-2 border-dashed border-gray-200 p-8 flex flex-col items-center justify-center text-center max-w-lg mx-auto shadow-sm">
          <div className="w-20 h-20 bg-teal-50 rounded-3xl flex items-center justify-center text-4xl mb-4 text-teal-600 shadow-inner">
            📹
          </div>
          <h3 className="text-xl font-black text-gray-900 mb-2">
            {selectedLevel !== "all"
              ? `${EDUCATION_LEVELS.find((l) => l.id === selectedLevel)?.label} Icin Hikaye Bulunamadi`
              : "Henuz Hikaye Paylasilmadi"}
          </h3>
          <p className="text-xs text-gray-500 max-w-sm leading-relaxed mb-6">
            {selectedLevel !== "all"
              ? "Bu seviyeye ait video bulunmuyor. Tum seviyeleri gormek icin 'Tum Seviyeler' sekmesine gecebilir veya ilk videoyu yukleyebilirsiniz."
              : "Ogrencilerinize hap bilgiler, soru cozum taktikleri ve kisa videolar ulastirmak icin ilk videonuzu hemen yukleyin."}
          </p>

          {isTeacherOrAdmin ? (
            <button
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-400 hover:to-teal-500 text-white font-bold rounded-2xl shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 text-sm cursor-pointer"
            >
              <span>🚀</span>
              <span>Bu Seviyede Ilk Hikayeyi Yukle</span>
            </button>
          ) : (
            <button
              onClick={() => setSelectedLevel("all")}
              className="px-5 py-2.5 bg-gray-900 text-white text-xs font-bold rounded-xl cursor-pointer"
            >
              Tum Seviyeleri Goster
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-2">
          {/* Instagram / TikTok Standart 9:16 Boyutunda Video Oynatıcı */}
          <div
            ref={containerRef}
            onScroll={handleScroll}
            className="w-[340px] sm:w-[360px] h-[580px] sm:h-[640px] bg-black rounded-[2rem] border-[4px] border-slate-900 overflow-hidden shadow-2xl relative snap-y snap-mandatory overflow-y-scroll hide-scrollbar"
          >
            {reels.map((reel: any, index: number) => (
              <div id={`reel-item-${index}`} key={reel.id} className="w-full h-full snap-start">
                <ReelVideo
                  reel={reel}
                  currentUser={user}
                  isActive={index === activeVideoIndex}
                  onLike={() =>
                    reel.is_liked_by_me ? unlikeMutation.mutate(reel.id) : likeMutation.mutate(reel.id)
                  }
                  onSave={() =>
                    reel.is_saved_by_me ? unsaveMutation.mutate(reel.id) : saveMutation.mutate(reel.id)
                  }
                  onComment={() => setCommentingReel(reel)}
                  onEdit={() => setEditingReel(reel)}
                  onDelete={() => setDeletingReelId(reel.id)}
                  onAddNew={() => setShowUploadModal(true)}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reel Comments Modal */}
      {commentingReel && (
        <ReelCommentsModal
          reel={commentingReel}
          currentUser={user}
          isOpen={!!commentingReel}
          onClose={() => setCommentingReel(null)}
          onCommentAdded={() => {
            queryClient.invalidateQueries({ queryKey: ["social-reels"] });
          }}
        />
      )}

      {/* Reel Upload Modal */}
      {showUploadModal && (
        <ReelUploadModal
          isOpen={showUploadModal}
          initialLevel={selectedLevel !== "all" ? selectedLevel : "all"}
          onClose={() => setShowUploadModal(false)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["social-reels"] });
            setShowUploadModal(false);
          }}
        />
      )}

      {/* Reel Edit Modal */}
      {editingReel && (
        <ReelEditModal
          reel={editingReel}
          isOpen={!!editingReel}
          onClose={() => setEditingReel(null)}
          onSuccess={() => {
            queryClient.invalidateQueries({ queryKey: ["social-reels"] });
            setEditingReel(null);
          }}
        />
      )}

      {/* Reel Delete Confirmation Modal */}
      {deletingReelId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full shadow-2xl border border-gray-100 space-y-4 text-center">
            <div className="w-14 h-14 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center text-2xl mx-auto shadow-inner">
              🗑️
            </div>
            <h3 className="text-base font-black text-gray-900">Bu Hikaye / Reel Videosunu Sil?</h3>
            <p className="text-xs text-gray-500 leading-relaxed">
              Bu videoyu sildiginizde akistan kalici olarak kaldirilacaktir. Bu islem geri alinamaz.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <button
                onClick={() => setDeletingReelId(null)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-xl transition-colors cursor-pointer"
              >
                Vazgec
              </button>
              <button
                onClick={() => deleteMutation.mutate(deletingReelId)}
                disabled={deleteMutation.isPending}
                className="flex-1 py-2.5 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-md transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {deleteMutation.isPending ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <span>Evet, Sil</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ReelCommentsModal({
  reel,
  currentUser,
  isOpen,
  onClose,
  onCommentAdded,
}: {
  reel: any;
  currentUser: any;
  isOpen: boolean;
  onClose: () => void;
  onCommentAdded: () => void;
}) {
  const queryClient = useQueryClient();
  const [commentText, setCommentText] = useState("");
  const commentsEndRef = useRef<HTMLDivElement>(null);

  const { data: comments = [], isLoading } = useQuery({
    queryKey: ["social-post-comments", reel.id],
    queryFn: () => socialApi.getComments(reel.id),
    enabled: isOpen,
  });

  const createCommentMutation = useMutation({
    mutationFn: (text: string) => socialApi.createComment(reel.id, text),
    onSuccess: () => {
      setCommentText("");
      queryClient.invalidateQueries({ queryKey: ["social-post-comments", reel.id] });
      onCommentAdded();
      toast.success("Yorumunuz paylasildi! ✨");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.detail || "Yorum gonderilemedi.");
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: (commentId: string) => socialApi.deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["social-post-comments", reel.id] });
      onCommentAdded();
      toast.success("Yorum silindi.");
    },
  });

  useEffect(() => {
    commentsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [comments]);

  if (!isOpen) return null;

  const handleSend = () => {
    if (!commentText.trim() || createCommentMutation.isPending) return;
    createCommentMutation.mutate(commentText);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-t-[2.5rem] sm:rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full h-[70vh] sm:h-[600px] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="text-lg">💬</span>
            <div>
              <h3 className="text-sm font-black tracking-tight">Yorumlar ({comments.length})</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-xs">{reel.content?.split("\n")[0] || "Reel Videosu"}</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xs transition-colors cursor-pointer">
            ✕
          </button>
        </div>

        {/* Comments List */}
        <div className="flex-1 p-5 overflow-y-auto space-y-4 bg-slate-50/50">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <div className="w-6 h-6 border-3 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : comments.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center text-2xl">
                💬
              </div>
              <h4 className="text-sm font-bold text-gray-800">Henuz yorum yok</h4>
              <p className="text-xs text-gray-500">Bu video hakkinda ilk yorumu siz yapin!</p>
            </div>
          ) : (
            comments.map((c: any) => {
              const isOwner = currentUser?.id === c.user_id || currentUser?.role === "admin" || currentUser?.id === reel.user_id;
              return (
                <div key={c.id} className="flex items-start gap-3 group">
                  {c.user?.avatar_url ? (
                    <img src={getMediaUrl(c.user.avatar_url)} alt="Avatar" className="w-8 h-8 rounded-xl object-cover flex-shrink-0" />
                  ) : (
                    <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 font-black text-xs flex items-center justify-center flex-shrink-0">
                      {(c.user?.full_name || "K").charAt(0).toUpperCase()}
                    </div>
                  )}

                  <div className="flex-1 bg-white p-3.5 rounded-2xl border border-gray-100 shadow-sm relative">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-bold text-gray-900">{c.user?.full_name || "Kullanici"}</span>
                      {isOwner && (
                        <button
                          onClick={() => deleteCommentMutation.mutate(c.id)}
                          className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 transition-opacity text-xs p-0.5 cursor-pointer"
                          title="Yorumu Sil"
                        >
                          🗑️
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-700 leading-relaxed whitespace-pre-line">{c.content}</p>
                  </div>
                </div>
              );
            })
          )}
          <div ref={commentsEndRef} />
        </div>

        {/* Input Box */}
        <div className="p-3 bg-white border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 focus-within:ring-2 focus-within:ring-teal-500 focus-within:bg-white transition-all">
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              placeholder="Bir yorum yazin..."
              className="flex-1 bg-transparent px-3 py-2 text-xs font-medium text-gray-800 outline-none placeholder:text-gray-400"
            />
            <button
              onClick={handleSend}
              disabled={!commentText.trim() || createCommentMutation.isPending}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 disabled:opacity-40 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
            >
              {createCommentMutation.isPending ? "..." : "Gonder"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function ReelUploadModal({
  isOpen,
  initialLevel = "all",
  onClose,
  onSuccess,
}: {
  isOpen: boolean;
  initialLevel?: string;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetLevel, setTargetLevel] = useState(initialLevel);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoPreviewUrl, setVideoPreviewUrl] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("video/")) {
      toast.error("Lütfen gecerli bir video dosyasi secin (.mp4, .mov, .webm)");
      return;
    }

    setVideoFile(file);
    const url = URL.createObjectURL(file);
    setVideoPreviewUrl(url);
  };

  const handlePublish = async () => {
    if (!videoFile) {
      toast.error("Lutfen yuklenecek video dosyasini secin.");
      return;
    }
    if (!title.trim()) {
      toast.error("Lutfen video icin bir baslik yazin.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(10);

    try {
      const uploadRes = await mediaApi.uploadGeneralFile(videoFile, (progress) => {
        setUploadProgress(Math.round(progress * 0.8));
      });

      setUploadProgress(85);

      const mediaUrl = uploadRes.url || uploadRes.path;
      const combinedContent = description.trim() ? `${title.trim()}\n\n${description.trim()}` : title.trim();

      await socialApi.createPost({
        content: combinedContent,
        media_url: mediaUrl,
        media_type: "video",
        target_level: targetLevel,
      });

      setUploadProgress(100);
      toast.success("Hikaye / Reel videonuz basariyla yayinlandi! 🎉");
      onSuccess();
    } catch (err: any) {
      console.error("Reels upload error:", err);
      toast.error(err?.response?.data?.detail || "Video yuklenirken bir hata olustu.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-2xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 bg-gradient-to-r from-teal-600 via-teal-700 to-indigo-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-xl shadow-inner border border-white/20">
              📹
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Yeni Hikaye / Reel Videosu Yukle</h2>
              <p className="text-xs text-teal-100">
                9:16 dikey formatta video yukleyin ve seviyesini belirleyin
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isUploading}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-sm transition-colors disabled:opacity-40 cursor-pointer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 bg-slate-50/50">
          {/* Seviye Secimi */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Hedef Seviye / Sinav Kategorisi *
            </label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none shadow-sm cursor-pointer"
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.icon} {lvl.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Video Dosyasi *
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="video/mp4,video/webm,video/quicktime,video/x-matroska"
              className="hidden"
            />

            {!videoPreviewUrl ? (
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="w-full py-10 px-4 border-2 border-dashed border-teal-300 hover:border-teal-500 rounded-3xl bg-teal-50/40 hover:bg-teal-50/80 transition-all flex flex-col items-center justify-center gap-3 group text-center cursor-pointer"
              >
                <div className="w-14 h-14 rounded-2xl bg-teal-100 group-hover:scale-110 transition-transform flex items-center justify-center text-3xl text-teal-600 shadow-sm">
                  📤
                </div>
                <div>
                  <span className="text-sm font-bold text-teal-900 block">
                    Video Dosyasini Secmek Icin Tiklayin
                  </span>
                  <span className="text-xs text-gray-500 block mt-1">
                    MP4, WEBM veya MOV formatinda (Maksimum 500 MB)
                  </span>
                </div>
              </button>
            ) : (
              <div className="bg-slate-900 rounded-3xl p-4 flex flex-col sm:flex-row items-center gap-4 border border-slate-800">
                <div className="w-32 h-44 bg-black rounded-2xl overflow-hidden relative flex-shrink-0 border border-slate-700">
                  <video
                    src={videoPreviewUrl}
                    className="w-full h-full object-cover"
                    controls
                    playsInline
                  />
                </div>
                <div className="space-y-2 flex-1 text-center sm:text-left">
                  <span className="text-xs font-bold text-teal-400 bg-teal-950/80 px-2.5 py-1 rounded-md border border-teal-800">
                    Secilen Dosya
                  </span>
                  <p className="text-sm font-bold text-white truncate max-w-xs">{videoFile?.name}</p>
                  <p className="text-xs text-slate-400">
                    Boyut: {videoFile ? (videoFile.size / (1024 * 1024)).toFixed(1) : 0} MB
                  </p>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-bold text-teal-400 hover:text-teal-300 underline block pt-1 cursor-pointer"
                  >
                    Farkli bir video sec
                  </button>
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Hikaye Basligi *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Orn: 30 Saniyede LGS Matematik Katlama Taktikleri!"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
              Aciklama ve Etiketler
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Videonun puf noktalarini yazin (Orn: Katlama sorularinda aciortayi kacirmayin! #lgs2026 #matematik)"
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-teal-500 outline-none shadow-sm transition-all resize-none"
            />
          </div>

          {isUploading && (
            <div className="space-y-2 bg-teal-50 p-4 rounded-2xl border border-teal-200 animate-pulse">
              <div className="flex items-center justify-between text-xs font-bold text-teal-900">
                <span>Video Yukleniyor ve Isleniyor...</span>
                <span>%{uploadProgress}</span>
              </div>
              <div className="w-full h-2.5 bg-teal-200/60 rounded-full overflow-hidden">
                <div
                  className="h-full bg-teal-600 transition-all duration-300 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-white border-t border-gray-100 flex items-center justify-between gap-4">
          <button
            onClick={onClose}
            disabled={isUploading}
            className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
          >
            Iptal
          </button>

          <button
            onClick={handlePublish}
            disabled={isUploading || !videoFile || !title.trim()}
            className="px-7 py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 disabled:opacity-40 text-white font-bold text-sm rounded-xl shadow-lg shadow-teal-500/25 transition-all flex items-center gap-2 cursor-pointer"
          >
            {isUploading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Yayinlaniyor (%{uploadProgress})...</span>
              </>
            ) : (
              <>
                <span>🚀</span>
                <span>Hikayeyi Paylas</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReelEditModal({
  reel,
  isOpen,
  onClose,
  onSuccess,
}: {
  reel: any;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [content, setContent] = useState(reel?.content || "");
  const [targetLevel, setTargetLevel] = useState(reel?.target_level || "all");
  const [isSaving, setIsSaving] = useState(false);

  if (!isOpen) return null;

  const handleSave = async () => {
    if (!content.trim()) {
      toast.error("Icerik bos birakilamaz.");
      return;
    }

    setIsSaving(true);
    try {
      await socialApi.updatePost(reel.id, { content, target_level: targetLevel });
      toast.success("Hikaye icerigi basariyla guncellendi! 🎉");
      onSuccess();
    } catch (err: any) {
      toast.error(err?.response?.data?.detail || "Guncellenirken bir hata olustu.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-lg w-full overflow-hidden">
        <div className="px-6 py-5 bg-gradient-to-r from-slate-900 to-teal-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xl">✏️</span>
            <h3 className="text-base font-black">Hikaye / Reel Klibini Duzenle</h3>
          </div>
          <button onClick={onClose} className="text-white/60 hover:text-white text-sm cursor-pointer">
            ✕
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Hedef Seviye / Sinav Kategorisi
            </label>
            <select
              value={targetLevel}
              onChange={(e) => setTargetLevel(e.target.value)}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-xs sm:text-sm font-bold text-gray-900 focus:ring-2 focus:ring-teal-500 outline-none"
            >
              {EDUCATION_LEVELS.map((lvl) => (
                <option key={lvl.id} value={lvl.id}>
                  {lvl.icon} {lvl.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Baslik & Aciklama Metni
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={5}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-teal-500 focus:bg-white outline-none transition-all resize-none text-gray-900"
              placeholder="Baslik ve aciklama..."
            />
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <button
            onClick={onClose}
            disabled={isSaving}
            className="px-5 py-2 text-xs font-bold text-gray-600 hover:text-gray-900 rounded-xl transition-colors cursor-pointer"
          >
            Iptal
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving || !content.trim()}
            className="px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40"
          >
            {isSaving ? (
              <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
            ) : (
              <span>Kaydet & Guncelle</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

function ReelVideo({
  reel,
  currentUser,
  isActive,
  onLike,
  onSave,
  onComment,
  onEdit,
  onDelete,
  onAddNew,
}: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  const videoSrc = getMediaUrl(reel.media_url);
  const levelBadge = getLevelBadge(reel.target_level);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setIsPlaying(false));
    } else if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
      setIsPlaying(false);
    }
  }, [isActive]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMuted(!isMuted);
  };

  return (
    <div className="w-full h-full snap-start relative bg-black flex items-center justify-center">
      <video
        ref={videoRef}
        src={videoSrc}
        className="w-full h-full object-cover cursor-pointer bg-black"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Top Left Seviye Rozeti */}
      {levelBadge && (
        <div className="absolute top-4 left-4 z-30 pointer-events-none">
          <div className="px-3 py-1 bg-black/80 backdrop-blur-md rounded-full border border-teal-400/40 text-teal-300 text-[11px] font-black flex items-center gap-1.5 shadow-lg">
            <span>{levelBadge.icon}</span>
            <span>{levelBadge.label}</span>
          </div>
        </div>
      )}

      {/* Top Right Sesi Ac / Kapat Butonu */}
      <div className="absolute top-4 right-4 z-30">
        <button
          onClick={toggleMute}
          className="w-10 h-10 bg-black/80 hover:bg-black text-white rounded-full flex items-center justify-center backdrop-blur-md transition-colors border border-white/20 cursor-pointer shadow-lg"
          title={isMuted ? "Sesi Ac" : "Sesi Kapat"}
        >
          {isMuted ? (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                clipRule="evenodd"
              />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
            </svg>
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
              />
            </svg>
          )}
        </button>
      </div>

      {/* Play/Pause overlay indicator */}
      {!isPlaying && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-2xl">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Sag Yan Eylem Sutunu (Like, Yorum, Save) */}
      <div className="absolute right-3.5 bottom-20 flex flex-col items-center gap-3.5 z-20">
        {/* Like */}
        <button onClick={onLike} className="flex flex-col items-center gap-1 group cursor-pointer">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
              reel.is_liked_by_me
                ? "bg-red-500/30 text-red-500 border border-red-500/40"
                : "bg-black/70 text-white hover:bg-black/90 border border-white/15"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={reel.is_liked_by_me ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={reel.is_liked_by_me ? 0 : 2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <span className="text-white text-[10px] font-bold drop-shadow-md">
            {reel.likes_count > 0 ? reel.likes_count : "0"}
          </span>
        </button>

        {/* Comment */}
        <button onClick={onComment} className="flex flex-col items-center gap-1 group cursor-pointer" title="Yorumlar">
          <div className="w-11 h-11 rounded-2xl bg-black/70 hover:bg-black/90 text-white flex items-center justify-center backdrop-blur-md transition-all shadow-lg border border-white/15">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
              />
            </svg>
          </div>
          <span className="text-white text-[10px] font-bold drop-shadow-md">
            {reel.comments_count > 0 ? reel.comments_count : "0"}
          </span>
        </button>

        {/* Save */}
        <button onClick={onSave} className="flex flex-col items-center gap-1 group cursor-pointer">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all shadow-lg ${
              reel.is_saved_by_me
                ? "bg-yellow-500/30 text-yellow-500 border border-yellow-500/40"
                : "bg-black/70 text-white hover:bg-black/90 border border-white/15"
            }`}
          >
            <svg
              className="w-5 h-5"
              fill={reel.is_saved_by_me ? "currentColor" : "none"}
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={reel.is_saved_by_me ? 0 : 2}
                d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"
              />
            </svg>
          </div>
        </button>
      </div>

      {/* Alt Bilgi & Icerik Metni */}
      <div className="absolute bottom-0 left-0 right-0 p-5 bg-gradient-to-t from-black via-black/85 to-transparent pt-20 z-10 pointer-events-none">
        <div className="pointer-events-auto space-y-2 pr-12">
          <div className="flex items-center gap-3">
            {reel.user?.avatar_url ? (
              <img
                src={getMediaUrl(reel.user.avatar_url)}
                alt="User"
                className="w-9 h-9 rounded-xl object-cover border border-white/20"
              />
            ) : (
              <div className="w-9 h-9 rounded-xl bg-teal-900/90 flex items-center justify-center text-teal-200 font-bold text-xs border border-teal-500/30 shadow-md">
                {(reel.user?.full_name || "O").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <h4 className="text-white font-bold text-xs tracking-wide">
                {reel.user?.full_name || "Egitmen"}
              </h4>
              <span className="text-[10px] text-teal-300 font-semibold">Bihocam Egitmeni</span>
            </div>
          </div>

          <div className="bg-black/55 backdrop-blur-md rounded-2xl p-3 border border-white/10 shadow-xl">
            <p className="text-white text-xs leading-relaxed font-medium whitespace-pre-line line-clamp-3">
              {reel.content || "Kisa egitim videosu ve ipuclari."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
