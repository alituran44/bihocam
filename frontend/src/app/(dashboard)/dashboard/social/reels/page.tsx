"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { socialApi } from "@/lib/api";
import { useState, useRef, useEffect } from "react";
import Avatar from "@/components/Avatar";
import { useAuthStore } from "@/lib/store";

export default function ReelsPage() {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [activeVideoIndex, setActiveVideoIndex] = useState(0);

  const { data: reels, isLoading } = useQuery({
    queryKey: ["social-reels"],
    queryFn: () => socialApi.getReels(0, 50),
  });

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

  if (isLoading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!reels || reels.length === 0) {
    return (
      <div className="min-h-[80vh] flex flex-col items-center justify-center text-center">
        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz İçerik Yok</h3>
        <p className="text-gray-500 max-w-md">Şu an için paylaşılmış herhangi bir reel videosu bulunmuyor. Eğitmenler içerik yüklediğinde burada görünecektir.</p>
      </div>
    );
  }

  return (
    <div className="max-w-[400px] mx-auto h-[85vh] bg-black rounded-[3rem] border-[8px] border-gray-900 overflow-hidden shadow-2xl relative snap-y snap-mandatory overflow-y-scroll hide-scrollbar">
      {reels.map((reel: any, index: number) => (
        <ReelVideo 
          key={reel.id} 
          reel={reel} 
          isActive={index === activeVideoIndex}
          onLike={() => reel.is_liked_by_me ? unlikeMutation.mutate(reel.id) : likeMutation.mutate(reel.id)}
          onSave={() => reel.is_saved_by_me ? unsaveMutation.mutate(reel.id) : saveMutation.mutate(reel.id)}
        />
      ))}
    </div>
  );
}

function ReelVideo({ reel, isActive, onLike, onSave }: any) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    if (isActive && videoRef.current) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
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
    <div className="w-full h-full snap-start relative bg-black">
      <video
        ref={videoRef}
        src={reel.media_url}
        className="w-full h-full object-contain cursor-pointer bg-black"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />
      
      {/* Top Right Mute Button */}
      <button 
        onClick={toggleMute} 
        className="absolute top-6 right-6 w-10 h-10 bg-black/40 hover:bg-black/60 rounded-full flex items-center justify-center backdrop-blur-sm z-10 transition-colors"
      >
        {isMuted ? (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Play/Pause overlay indicator */}
      {!isPlaying && isActive && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
            <svg className="w-8 h-8 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </div>
        </div>
      )}

      {/* Right side actions */}
      <div className="absolute right-4 bottom-28 flex flex-col items-center gap-5 z-20">
        <button onClick={onLike} className="flex flex-col items-center gap-1 group">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all ${reel.is_liked_by_me ? 'bg-red-500/20 text-red-500' : 'bg-gray-500/40 text-white hover:bg-gray-500/60'}`}>
            <svg className="w-6 h-6" fill={reel.is_liked_by_me ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={reel.is_liked_by_me ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
            </svg>
          </div>
          <span className="text-white text-[10px] font-bold shadow-black drop-shadow-md">{reel.likes_count > 0 ? reel.likes_count : "5"}</span>
        </button>

        <button className="flex flex-col items-center gap-1 group">
          <div className="w-12 h-12 rounded-2xl bg-gray-500/40 text-white hover:bg-gray-500/60 flex items-center justify-center backdrop-blur-md transition-all">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <span className="text-white text-[10px] font-bold shadow-black drop-shadow-md">0</span>
        </button>

        <button onClick={onSave} className="flex flex-col items-center gap-1 group">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center backdrop-blur-md transition-all ${reel.is_saved_by_me ? 'bg-yellow-500/20 text-yellow-500' : 'bg-gray-500/40 text-white hover:bg-gray-500/60'}`}>
            <svg className="w-6 h-6" fill={reel.is_saved_by_me ? "currentColor" : "none"} viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={reel.is_saved_by_me ? 0 : 2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </div>
        </button>

        <button className="flex flex-col items-center gap-1 group mt-1">
          <div className="w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-md transition-all bg-black/60 text-white hover:bg-black/80">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
            </svg>
          </div>
        </button>

        <button className="flex flex-col items-center gap-1 group mt-2">
          <div className="w-10 h-10 rounded-full flex items-center justify-center backdrop-blur-md transition-all border border-gray-600/50 bg-black/40 text-white hover:bg-black/60">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </div>
        </button>
      </div>

      {/* Bottom User Info & Content */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black via-black/80 to-transparent pt-24 z-10 pointer-events-none">
        <div className="pointer-events-auto">
          {/* User info row */}
          <div className="flex items-center gap-4 mb-4">
            {reel.user?.avatar_url ? (
              <img src={reel.user.avatar_url} alt="User" className="w-12 h-12 rounded-xl object-cover" />
            ) : (
              <div className="w-12 h-12 rounded-xl bg-teal-900/80 flex items-center justify-center text-teal-200 font-bold text-lg border border-teal-500/30 shadow-lg">
                {(reel.user?.full_name || "A").charAt(0).toUpperCase()}
              </div>
            )}
            <div className="flex flex-col">
              <h4 className="text-white font-bold text-base tracking-wide uppercase">
                {reel.user?.full_name || "ALİ BAYINDIR"}
              </h4>
              <button className="text-left text-gray-300 text-xs font-semibold tracking-wider hover:text-white transition-colors mt-0.5 flex items-center gap-1">
                + TAKİP ET
              </button>
            </div>
          </div>
          
          {/* Post Content */}
          <div className="bg-black/60 backdrop-blur-md rounded-2xl p-4 border border-white/5 shadow-2xl">
            <h3 className="text-white font-bold text-sm uppercase leading-snug mb-2">
              {reel.title || "DENKLEM KURMAYI BIRAK! LGS'NİN EN UZUN SORUSUNA PRATİK ÇÖZÜMÜ"}
            </h3>
            <p className="text-gray-300 text-xs italic line-clamp-2 leading-relaxed">
              {reel.content || "LGS Matematik'te iki farklı grafiği (Daire ve Sütun) yan yana gördüğün an \"Eyvah, bu soru çok uzun\" deyip..."}
            </p>
            <button className="text-teal-400 text-[10px] font-bold uppercase tracking-wider mt-2 hover:text-teal-300 transition-colors">
              DEVAMINI GÖR
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
