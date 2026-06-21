"use client";

import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { popcastsApi, type PopcastResponse, type PopcastStatus } from "@/lib/api";
import { Headphones, Plus, Trash2, Clock, CheckCircle2, AlertTriangle, AlertCircle, X, Music, Image as ImageIcon } from "lucide-react";

export default function TeacherPopcastsPage() {
  const queryClient = useQueryClient();
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [isUploadingAudio, setIsUploadingAudio] = useState(false);
  const [isUploadingCover, setIsUploadingCover] = useState(false);
  
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [audioUrl, setAudioUrl] = useState("");
  const [coverImageUrl, setCoverImageUrl] = useState("");
  const [duration, setDuration] = useState(0);

  const audioFileInputRef = useRef<HTMLInputElement>(null);
  const coverFileInputRef = useRef<HTMLInputElement>(null);

  // Fetch my popcasts
  const { data: popcasts, isLoading } = useQuery<PopcastResponse[]>({
    queryKey: ["my-popcasts"],
    queryFn: () => popcastsApi.getMe(),
  });

  // Create Popcast mutation
  const createMutation = useMutation({
    mutationFn: (payload: { title: string; description: string; audio_url: string; cover_image_url?: string; duration: number }) =>
      popcastsApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-popcasts"] });
      resetForm();
      setShowUploadModal(false);
    },
    onError: (err: any) => {
      alert("Popcast oluşturulurken hata oluştu: " + (err.message || "Bilinmeyen Hata"));
    }
  });

  // Delete Popcast mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => popcastsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-popcasts"] });
    },
    onError: (err: any) => {
      alert("Popcast silinirken hata oluştu: " + (err.message || "Bilinmeyen Hata"));
    }
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setAudioUrl("");
    setCoverImageUrl("");
    setDuration(0);
    if (audioFileInputRef.current) audioFileInputRef.current.value = "";
    if (coverFileInputRef.current) coverFileInputRef.current.value = "";
  };

  const handleAudioUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingAudio(true);
    try {
      // Get audio duration
      const audioEl = document.createElement("audio");
      audioEl.src = URL.createObjectURL(file);
      audioEl.onloadedmetadata = () => {
        setDuration(audioEl.duration);
      };

      const res = await popcastsApi.uploadAudio(file);
      setAudioUrl(res.url);
    } catch (err: any) {
      alert("Ses dosyası yükleme hatası: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploadingAudio(false);
    }
  };

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingCover(true);
    try {
      const res = await popcastsApi.uploadCover(file);
      setCoverImageUrl(res.url);
    } catch (err: any) {
      alert("Kapak görseli yükleme hatası: " + (err.response?.data?.detail || err.message));
    } finally {
      setIsUploadingCover(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !audioUrl) {
      alert("Lütfen en azından Başlık ve Ses Dosyası yükleyin.");
      return;
    }
    createMutation.mutate({
      title,
      description,
      audio_url: audioUrl,
      cover_image_url: coverImageUrl || undefined,
      duration,
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-50 border border-emerald-100 text-emerald-600">
            <CheckCircle2 className="w-3.5 h-3.5" /> Yayında
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-rose-50 border border-rose-100 text-rose-600">
            <AlertCircle className="w-3.5 h-3.5" /> Reddedildi
          </span>
        );
      case "pending_review":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 border border-amber-100 text-amber-600">
            <Clock className="w-3.5 h-3.5 animate-pulse" /> İncelemede
          </span>
        );
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
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-gray-900 tracking-tight">Popcast Yayınlarım</h1>
          <p className="text-gray-500 font-semibold text-sm mt-1">Sesli ders notlarınızı, podcast yayınlarınızı ve eğitim kayıtlarınızı buradan yükleyip yönetin.</p>
        </div>
        <button
          onClick={() => setShowUploadModal(true)}
          className="inline-flex items-center gap-2 px-5 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-2xl shadow-lg hover:shadow-teal-600/20 transition-all duration-200 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-5 h-5" /> Yeni Popcast Yükle
        </button>
      </div>

      {/* Popcast List */}
      {!popcasts || popcasts.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-[2rem] p-12 text-center flex flex-col items-center justify-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-50 flex items-center justify-center text-teal-600 shadow">
            <Headphones className="w-8 h-8" />
          </div>
          <div className="space-y-1">
            <h3 className="text-lg font-bold text-gray-900">Henüz yayınlanmış Popcast'iniz yok</h3>
            <p className="text-sm text-gray-500 max-w-sm">Yeni bir ses dosyası ve kapak resmi yükleyerek hemen ilk Popcast'inizi oluşturun.</p>
          </div>
          <button
            onClick={() => setShowUploadModal(true)}
            className="px-5 py-2.5 bg-teal-600 hover:bg-teal-700 text-white font-bold rounded-xl transition-colors cursor-pointer"
          >
            İlk Kaydı Yükle
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {popcasts.map((popcast) => (
            <div key={popcast.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow">
              <div className="p-6 space-y-4">
                {/* Visual Cover fallback */}
                <div className="aspect-video rounded-2xl bg-gradient-to-br from-teal-500 to-indigo-600 overflow-hidden relative flex items-center justify-center shadow-inner">
                  {popcast.cover_image_url ? (
                    <img src={popcast.cover_image_url} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <Headphones className="w-12 h-12 text-white/30" />
                  )}
                  <span className="absolute bottom-3 right-3 bg-black/60 text-white text-xs font-bold px-2 py-1 rounded">
                    {Math.floor(popcast.duration / 60)}:{(Math.floor(popcast.duration % 60)).toString().padStart(2, '0')}
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    {getStatusBadge(popcast.status)}
                  </div>
                  <h3 className="font-extrabold text-gray-900 line-clamp-1 leading-snug">{popcast.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-2 leading-relaxed">
                    {popcast.description || "Açıklama girilmedi."}
                  </p>
                </div>
              </div>

              <div className="p-6 bg-slate-50/50 border-t border-gray-100 flex items-center justify-between">
                <span className="text-xs text-gray-400 font-semibold">
                  {new Date(popcast.created_at).toLocaleDateString("tr-TR")}
                </span>
                <div className="flex items-center gap-2">
                  {popcast.status === "rejected" && popcast.admin_note && (
                    <button
                      onClick={() => alert("Red Nedeni: " + popcast.admin_note)}
                      className="px-3 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Red Nedeni
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm("Bu popcast'i silmek istediğinize emin misiniz?")) {
                        deleteMutation.mutate(popcast.id);
                      }
                    }}
                    className="w-9 h-9 rounded-xl border border-gray-200 hover:border-rose-200 text-gray-400 hover:text-rose-500 flex items-center justify-center transition-colors cursor-pointer bg-white"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-[2rem] border border-gray-100 shadow-2xl p-6 md:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                resetForm();
                setShowUploadModal(false);
              }}
              className="absolute top-6 right-6 w-8 h-8 rounded-full bg-slate-50 hover:bg-slate-100 text-gray-400 hover:text-gray-600 flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="space-y-1">
              <h2 className="text-2xl font-black text-gray-900 tracking-tight">Yeni Popcast Yükle</h2>
              <p className="text-xs text-gray-400 font-semibold">Ses kaydı ve kapak görselini girerek başvuruda bulunun.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Title */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Popcast Başlığı</label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Konu Başlığı (Örn: TYT Matematik İpuçları)"
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:bg-white transition-all outline-none text-sm font-semibold text-gray-800 placeholder-gray-400"
                />
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Açıklama</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Kısaca bu derste nelerden bahsettiğinizi açıklayın..."
                  rows={3}
                  className="w-full px-4 py-3.5 bg-slate-50 border-2 border-gray-100 rounded-xl focus:border-teal-500 focus:bg-white transition-all outline-none text-sm font-semibold text-gray-800 placeholder-gray-400 resize-none"
                />
              </div>

              {/* Audio Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Ses Dosyası (.mp3, .m4a vb.)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={audioFileInputRef}
                    accept="audio/*"
                    onChange={handleAudioUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => audioFileInputRef.current?.click()}
                    disabled={isUploadingAudio}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 cursor-pointer transition-colors"
                  >
                    <Music className="w-4 h-4 text-teal-600" />
                    {isUploadingAudio ? "Dosya Yükleniyor..." : "Dosya Seç"}
                  </button>
                  {audioUrl && (
                    <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hazır
                    </span>
                  )}
                </div>
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">Kapak Görseli (Opsiyonel)</label>
                <div className="flex items-center gap-3">
                  <input
                    type="file"
                    ref={coverFileInputRef}
                    accept="image/*"
                    onChange={handleCoverUpload}
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => coverFileInputRef.current?.click()}
                    disabled={isUploadingCover}
                    className="inline-flex items-center gap-2 px-4 py-3 bg-white hover:bg-slate-50 border-2 border-gray-200 rounded-xl text-sm font-bold text-gray-600 cursor-pointer transition-colors"
                  >
                    <ImageIcon className="w-4 h-4 text-teal-600" />
                    {isUploadingCover ? "Görsel Yükleniyor..." : "Görsel Seç"}
                  </button>
                  {coverImageUrl && (
                    <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Hazır
                    </span>
                  )}
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={createMutation.isPending || isUploadingAudio || isUploadingCover}
                className="w-full py-4 bg-teal-600 hover:bg-teal-700 disabled:bg-slate-200 disabled:text-gray-400 text-white font-bold rounded-2xl shadow-lg hover:shadow-teal-600/20 disabled:shadow-none transition-all duration-200 cursor-pointer text-center text-sm"
              >
                {createMutation.isPending ? "Gönderiliyor..." : "Başvuruyu Tamamla"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
