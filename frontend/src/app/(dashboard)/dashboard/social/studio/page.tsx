"use client";

import { useState, useRef } from "react";
import { useAuthStore } from "@/lib/store";
import { AIGenerateButton } from "@/components/ui/AIGenerateButton";

type StudioView = "dashboard" | "video_upload" | "story_creator";

export default function ContentStudioPage() {
  const { user } = useAuthStore();
  const [currentView, setCurrentView] = useState<StudioView>("dashboard");

  // Tab state for dashboard
  const [activeTab, setActiveTab] = useState<"videos" | "stories">("videos");

  // State for video upload form
  const [videoTitle, setVideoTitle] = useState("");
  const [videoDescription, setVideoDescription] = useState("");
  const [videoCategory, setVideoCategory] = useState("");
  const [isPublic, setIsPublic] = useState(true);
  const [selectedVideo, setSelectedVideo] = useState<File | null>(null);
  const [selectedCover, setSelectedCover] = useState<File | null>(null);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // State for story creator
  const [storyBgColor, setStoryBgColor] = useState("#000000");
  const [storyImage, setStoryImage] = useState<File | null>(null);
  const [storyPrompt, setStoryPrompt] = useState("");
  const [isGeneratingStoryImage, setIsGeneratingStoryImage] = useState(false);

  const colors = ["#000000", "#EF4444", "#F59E0B", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899"];

  const videoInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  const storyBgInputRef = useRef<HTMLInputElement>(null);

  const renderDashboard = () => (
    <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-10">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-teal-100 text-teal-600 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Kısa İçerik & Hikaye Merkezi
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            İçerik <span className="text-teal-600">Stüdyosu</span>
          </h1>
          <p className="mt-2 text-sm text-gray-500 font-medium max-w-2xl">
            Dikey videolar ve hikayeler ile kursiyerlerinizle bağ kurun, özel eğitim içeriklerinizi saniyeler içinde binlerce kişiye ulaştırın.
          </p>
        </div>
        
        <div className="flex items-center gap-3 mt-4 md:mt-0">
          <button 
            onClick={() => setCurrentView("video_upload")}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-600/30 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Video Yükle
          </button>
          <button 
            onClick={() => setCurrentView("story_creator")}
            className="flex items-center gap-2 px-6 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-xl shadow-lg shadow-teal-600/30 transition-all text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Yeni Hikaye
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
        {[
          { label: "Hikayeler", count: 0, icon: "M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z M15 13a3 3 0 11-6 0 3 3 0 016 0z", color: "text-teal-500", bg: "bg-teal-50" },
          { label: "Kısa Videolar", count: 0, icon: "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z", color: "text-teal-500", bg: "bg-teal-50" },
          { label: "Toplam İzlenme", count: 0, icon: "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z", color: "text-emerald-500", bg: "bg-emerald-50" },
          { label: "Kaydedilenler", count: 0, icon: "M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z", color: "text-orange-500", bg: "bg-orange-50" }
        ].map((stat, i) => (
          <div key={i} className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center gap-5">
            <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${stat.bg}`}>
              <svg className={`w-7 h-7 ${stat.color}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={stat.icon} />
              </svg>
            </div>
            <div>
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1">{stat.label}</p>
              <h3 className="text-3xl font-bold text-gray-900">{stat.count}</h3>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <div className="flex gap-8">
          <button 
            onClick={() => setActiveTab("videos")}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "videos" ? "text-teal-600" : "text-gray-500 hover:text-gray-900"}`}
          >
            Kısa Videolar (0)
            {activeTab === "videos" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full"></div>}
          </button>
          <button 
            onClick={() => setActiveTab("stories")}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === "stories" ? "text-teal-600" : "text-gray-500 hover:text-gray-900"}`}
          >
            Hikayeler (0)
            {activeTab === "stories" && <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-teal-600 rounded-t-full"></div>}
          </button>
        </div>
      </div>

      {/* Tab Content (Empty State) */}
      <div className="py-12 flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={activeTab === "videos" ? "M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" : "M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"} />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Henüz İçerik Yok</h3>
        <p className="text-sm text-gray-500">Paylaştığınız içerikler burada listelenecektir.</p>
      </div>
    </div>
  );

  const renderVideoUpload = () => (
    <div className="fixed inset-0 z-50 bg-[#0B0D17] flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300">
      {/* Top Left Close Button */}
      <button 
        onClick={() => setCurrentView("dashboard")}
        className="absolute top-6 left-6 w-10 h-10 bg-white/10 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors z-50"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      {/* Left Area - Upload */}
      <div className="flex-1 flex flex-col items-center justify-center p-12 border-r border-white/5 relative">
        <div className="w-full max-w-sm flex flex-col items-center text-center">
          <div 
            onClick={() => videoInputRef.current?.click()}
            className="w-32 h-32 rounded-3xl border-2 border-dashed border-white/20 bg-white/5 flex items-center justify-center mb-8 cursor-pointer hover:bg-white/10 hover:border-teal-500/50 transition-all group"
          >
            <svg className="w-10 h-10 text-white/50 group-hover:text-teal-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Video Yükle</h2>
          <p className="text-gray-400 text-sm mb-8">
            Sürükle bırak veya bilgisayarından bir video seçerek <span className="text-teal-400 font-semibold">Studio</span>'ya başla.
          </p>
          <button 
            onClick={() => videoInputRef.current?.click()}
            className="px-6 py-2.5 bg-[#1A1D2D] border border-teal-500/30 text-white text-sm font-medium rounded-xl hover:bg-[#23273D] hover:shadow-[0_0_15px_rgba(20,184,166,0.3)] transition-all"
          >
            Dosya Seç
          </button>
          <input type="file" ref={videoInputRef} className="hidden" accept="video/mp4,video/x-m4v,video/*" onChange={(e) => e.target.files && setSelectedVideo(e.target.files[0])} />
          
          {selectedVideo && (
            <div className="mt-6 px-4 py-2 bg-teal-500/20 text-teal-300 rounded-lg text-sm font-medium border border-teal-500/30">
              {selectedVideo.name} seçildi.
            </div>
          )}
        </div>
      </div>

      {/* Right Area - Details Form */}
      <div className="w-full md:w-[600px] bg-[#11131E] p-10 overflow-y-auto flex flex-col justify-between hide-scrollbar">
        <div>
          <div className="mb-10">
            <h2 className="text-2xl font-bold text-white">İçerik Detayları</h2>
            <p className="text-gray-400 text-sm mt-1">Videonuzu optimize edin</p>
          </div>

          <div className="flex flex-col md:flex-row gap-8">
            {/* Form Fields */}
            <div className="flex-1 space-y-6">
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> Video Başlığı
                </label>
                <input 
                  type="text"
                  placeholder="Etkileyici bir başlık..."
                  className="w-full bg-[#1A1D2D] border-none rounded-xl px-4 py-3 text-white text-sm font-medium placeholder-gray-600 focus:ring-1 focus:ring-teal-500 outline-none"
                  value={videoTitle}
                  onChange={(e) => setVideoTitle(e.target.value)}
                />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> Açıklama
                </label>
                <textarea 
                  placeholder="Videonuzu detaylandırın..."
                  rows={6}
                  className="w-full bg-[#1A1D2D] border-none rounded-2xl px-4 py-4 text-white text-sm font-medium placeholder-gray-600 focus:ring-1 focus:ring-teal-500 outline-none resize-none mb-2"
                  value={videoDescription}
                  onChange={(e) => setVideoDescription(e.target.value)}
                />
                <div className="flex justify-end">
                  <AIGenerateButton 
                    type="description" 
                    promptData={`Sosyal medya kısa video/reels için ilgi çekici, bol emojili ve hashtagli bir açıklama yaz. Konu/Başlık: ${videoTitle}`} 
                    onSuccess={(text) => setVideoDescription(text)} 
                    buttonText="AI ile Açıklama Üret"
                    className="text-xs px-3 py-1.5 bg-[#1A1D2D] border border-teal-500/30 shadow-none hover:bg-teal-500/20"
                  />
                </div>
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> Kategori Seçimi
                </label>
                <div className="relative">
                  <select 
                    className="w-full bg-[#1A1D2D] border-none rounded-xl px-4 py-3 text-white text-sm font-medium appearance-none focus:ring-1 focus:ring-teal-500 outline-none"
                    value={videoCategory}
                    onChange={(e) => setVideoCategory(e.target.value)}
                  >
                    <option value="" disabled className="text-gray-600">Seçim yapın...</option>
                    <option value="math">Matematik</option>
                    <option value="science">Fen Bilimleri</option>
                    <option value="history">Tarih</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-500">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column in Form */}
            <div className="w-48 space-y-6">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-400">
                    <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> Kapak Fotoğrafı
                  </label>
                  <button
                    type="button"
                    onClick={async () => {
                      if (!videoTitle) {
                        alert("Lütfen önce video başlığını girin.");
                        return;
                      }
                      setIsGeneratingImage(true);
                      try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/generate_image`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt: `${videoTitle} konulu sosyal medya video kapağı, dikey formatta, neon tarzı` }),
                        });
                        if (!response.ok) throw new Error('API isteği başarısız oldu');
                        const data = await response.json();
                        const imageRes = await fetch(data.image_url);
                        const imageBlob = await imageRes.blob();
                        const file = new File([imageBlob], "ai_cover.jpg", { type: "image/jpeg" });
                        setSelectedCover(file);
                      } catch (error) {
                        console.error("Resim üretilirken hata:", error);
                        alert("Yapay zeka ile resim üretilirken bir hata oluştu.");
                      } finally {
                        setIsGeneratingImage(false);
                      }
                    }}
                    disabled={isGeneratingImage}
                    className="flex items-center gap-1.5 px-2 py-1 text-[10px] font-bold text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded hover:from-purple-600 hover:to-pink-600 shadow-sm disabled:opacity-50 transition-all"
                  >
                    {isGeneratingImage ? (
                      <>
                        <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                        Üretiliyor...
                      </>
                    ) : (
                      <>✨ AI</>
                    )}
                  </button>
                </div>
                <div 
                  onClick={() => coverInputRef.current?.click()}
                  className="w-full aspect-[9/16] rounded-3xl border-2 border-dashed border-teal-500/30 bg-[#1A1D2D] flex flex-col items-center justify-center cursor-pointer hover:bg-[#1A1D2D]/80 hover:border-teal-500/60 transition-all overflow-hidden"
                >
                  {selectedCover ? (
                    <img src={URL.createObjectURL(selectedCover)} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <svg className="w-8 h-8 text-white/20 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs font-semibold text-gray-500">Kapak Seç</span>
                    </>
                  )}
                </div>
                <input type="file" ref={coverInputRef} className="hidden" accept="image/*" onChange={(e) => e.target.files && setSelectedCover(e.target.files[0])} />
              </div>

              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-400 mb-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500"></div> Yayın Ayarları
                </label>
                <div 
                  onClick={() => setIsPublic(!isPublic)}
                  className={`w-full p-4 rounded-2xl border cursor-pointer transition-all flex flex-col gap-1 ${isPublic ? 'bg-[#064E3B]/20 border-emerald-500/50' : 'bg-[#1A1D2D] border-gray-700'}`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${isPublic ? 'bg-emerald-500' : 'bg-gray-600'}`}>
                      <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h4 className={`text-sm font-semibold ${isPublic ? 'text-emerald-400' : 'text-gray-400'}`}>Yayına Al</h4>
                      <p className="text-xs text-gray-500">{isPublic ? 'Herkes Görebilir' : 'Gizli'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Share Button */}
        <button className="w-full mt-10 py-4 bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold rounded-2xl shadow-lg shadow-teal-600/30 transition-all flex items-center justify-center gap-2">
          Stüdyoda Paylaş
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );

  const renderStoryCreator = () => (
    <div className="fixed inset-0 z-50 bg-[#F8FAFC] overflow-y-auto animate-in zoom-in-95 duration-300">
      <div className="max-w-[1400px] mx-auto min-h-screen p-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button 
            onClick={() => setCurrentView("dashboard")}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Hikaye Oluşturucu</h1>
            <p className="text-xs text-gray-500 font-medium mt-1">Arayüz üzerinden yazılı ve görsel hikayenizi dizayn edip paylaşın</p>
          </div>
        </div>

        {/* Toggle */}
        <div className="mb-10">
          <div className="inline-flex items-center bg-teal-600 text-white rounded-full px-5 py-2.5 text-sm font-medium shadow-md shadow-teal-500/30 gap-2 cursor-pointer">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
            </svg>
            Resim / Metin
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-16">
          {/* Left Preview */}
          <div className="flex-1 flex flex-col items-center">
            <h3 className="w-full text-left font-bold text-gray-900 mb-6">Önizleme</h3>
            <div 
              className="w-full max-w-[320px] aspect-[9/16] rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] relative overflow-hidden flex items-center justify-center transition-colors duration-300"
              style={{ backgroundColor: storyBgColor }}
            >
              {storyImage && (
                <img src={URL.createObjectURL(storyImage)} alt="Story Bg" className="absolute inset-0 w-full h-full object-cover" />
              )}
            </div>
            <p className="text-[10px] text-gray-500 mt-6 text-center italic">
              Bu alan doğrudan tek bir fotoğrafa dönüştürülüp gönderilecektir.
            </p>
            <p className="text-[9px] text-gray-400 mt-2 text-center max-w-sm">
              *Hikaye oluşturulduğunda tasarladığınız görünüm tek bir yüksek çözünürlüklü "Resim" dosyasına çevrilip gönderilir.
            </p>
          </div>

          {/* Right Tools */}
          <div className="flex-1 max-w-2xl flex flex-col gap-8 pt-14">
            
            {/* Background Tools Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <label className="flex items-center gap-2 text-sm font-semibold text-teal-900 mb-4">
                <svg className="w-4 h-4 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Arka Plan
              </label>

              <div className="mb-4">
                <label className="block text-xs font-semibold text-gray-500 mb-2">✨ AI ile Arka Plan Üret</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={storyPrompt}
                    onChange={(e) => setStoryPrompt(e.target.value)}
                    placeholder="Örn: Uzay temalı, neon renklerde dikey arka plan"
                    className="flex-1 text-sm px-3 py-2 border border-gray-200 rounded-xl focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                  <button
                    disabled={isGeneratingStoryImage || !storyPrompt.trim()}
                    onClick={async () => {
                      setIsGeneratingStoryImage(true);
                      try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1'}/ai/generate_image`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ prompt: `${storyPrompt}, dikey hikaye formatı (9:16), estetik arka plan` }),
                        });
                        if (!response.ok) throw new Error('API isteği başarısız oldu');
                        const data = await response.json();
                        const imageRes = await fetch(data.image_url);
                        const imageBlob = await imageRes.blob();
                        const file = new File([imageBlob], "ai_story_bg.jpg", { type: "image/jpeg" });
                        setStoryImage(file);
                        setStoryBgColor("transparent");
                      } catch (error) {
                        console.error("Resim üretilirken hata:", error);
                        alert("Yapay zeka ile resim üretilirken bir hata oluştu.");
                      } finally {
                        setIsGeneratingStoryImage(false);
                      }
                    }}
                    className="px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold rounded-xl hover:from-purple-600 hover:to-pink-600 disabled:opacity-50 transition-all flex items-center justify-center min-w-[80px]"
                  >
                    {isGeneratingStoryImage ? (
                      <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>
                    ) : (
                      "Üret"
                    )}
                  </button>
                </div>
              </div>
              
              <div 
                onClick={() => storyBgInputRef.current?.click()}
                className="w-full border-2 border-dashed border-teal-200 rounded-xl py-6 flex flex-col items-center justify-center cursor-pointer hover:bg-teal-50 transition-colors mb-6"
              >
                <svg className="w-6 h-6 text-teal-500 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
                <span className="text-xs font-semibold text-teal-900">veya Cihazınızdan Seçin</span>
              </div>
              <input type="file" ref={storyBgInputRef} className="hidden" accept="image/*" onChange={(e) => { e.target.files && setStoryImage(e.target.files[0]); setStoryBgColor("transparent"); }} />

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Arka Plan Rengi</label>
                <div className="flex items-center gap-3">
                  {colors.map(color => (
                    <button
                      key={color}
                      onClick={() => { setStoryBgColor(color); setStoryImage(null); }}
                      className={`w-8 h-8 rounded-xl transition-all shadow-sm border border-black/5 ${storyBgColor === color && !storyImage ? 'ring-2 ring-offset-2 ring-teal-500 scale-110' : 'hover:scale-110'}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Text Tools Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
              <label className="flex items-center gap-2 text-sm font-semibold text-teal-900 mb-4">
                <span className="text-teal-500 font-serif text-lg leading-none">T</span>
                Studio Metin Araçları
              </label>
              
              <button className="w-full border-2 border-dashed border-teal-200 rounded-xl py-4 flex items-center justify-center gap-2 text-sm font-semibold text-teal-600 hover:bg-teal-50 transition-colors">
                <span>+</span> Yeni Metin Katmanı Ekle
              </button>
            </div>

            {/* Submit Button */}
            <div className="mt-4">
              <button className="w-full py-4 bg-[#5EEAD4] hover:bg-[#4FD1C5] text-teal-900 text-sm font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-teal-500/20 transition-all flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                </svg>
                Hemen Paylaş
              </button>
              <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest text-center mt-4">
                1080X1920 HD STUDIO ÇIKTISI
              </p>
            </div>

          </div>
        </div>
      </div>
    </div>
  );

  if (currentView === "video_upload") return renderVideoUpload();
  if (currentView === "story_creator") return renderStoryCreator();
  return renderDashboard();
}
