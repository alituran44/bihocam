"use client";

import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { teachersApi } from "@/lib/api";
import { toast } from "sonner";

interface LibraryItem {
  id: string;
  teacher_id: string;
  title: string;
  description?: string;
  item_type: "file" | "video" | "youtube";
  file_path?: string;
  youtube_url?: string;
  created_at: string;
}

export default function TeacherLibraryPage() {
  const queryClient = useQueryClient();
  const [showAddForm, setShowAddForm] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [itemType, setItemType] = useState<"file" | "video" | "youtube">("file");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Upload status states
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Fetch teacher's own library
  const { data: libraryItems = [], isLoading, error } = useQuery<LibraryItem[]>({
    queryKey: ["my-library"],
    queryFn: () => teachersApi.getMyLibrary(),
  });

  // Create library item metadata mutation
  const createItemMutation = useMutation({
    mutationFn: (payload: any) => teachersApi.addLibraryItem(payload),
    onSuccess: () => {
      toast.success("Kütüphane öğesi başarıyla eklendi.");
      queryClient.invalidateQueries({ queryKey: ["my-library"] });
      resetForm();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Eklenirken bir hata oluştu.");
    },
  });

  // Delete library item mutation
  const deleteItemMutation = useMutation({
    mutationFn: (itemId: string) => teachersApi.deleteLibraryItem(itemId),
    onSuccess: () => {
      toast.success("Kütüphane öğesi başarıyla silindi.");
      queryClient.invalidateQueries({ queryKey: ["my-library"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.detail || "Silinirken bir hata oluştu.");
    },
  });

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setItemType("file");
    setYoutubeUrl("");
    setSelectedFile(null);
    setShowAddForm(false);
    setIsUploading(false);
    setUploadProgress(0);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Max 100MB check
      if (file.size > 100 * 1024 * 1024) {
        toast.error("Dosya boyutu 100MB'dan küçük olmalıdır.");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Lütfen bir başlık girin.");
      return;
    }

    let filePath = "";

    try {
      if (itemType === "file" || itemType === "video") {
        if (!selectedFile) {
          toast.error("Lütfen bir dosya seçin.");
          return;
        }

        setIsUploading(true);
        setUploadProgress(20);

        // Upload the file
        const uploadResponse = await teachersApi.uploadLibraryFile(selectedFile);
        filePath = uploadResponse.file_path;
        
        setUploadProgress(80);
      } else if (itemType === "youtube") {
        if (!youtubeUrl.trim()) {
          toast.error("Lütfen geçerli bir YouTube URL'si girin.");
          return;
        }
        // Basic youtube url validation
        if (!youtubeUrl.includes("youtube.com") && !youtubeUrl.includes("youtu.be")) {
          toast.error("Lütfen geçerli bir YouTube linki girin.");
          return;
        }
      }

      // Add to database
      const payload = {
        title,
        description,
        item_type: itemType,
        file_path: filePath || null,
        youtube_url: itemType === "youtube" ? youtubeUrl : null,
      };

      createItemMutation.mutate(payload);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Dosya yüklenirken bir hata oluştu.");
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const handleDelete = (itemId: string) => {
    if (confirm("Bu öğeyi kütüphanenizden tamamen silmek istediğinize emin misiniz? Bu işlem geri alınamaz.")) {
      deleteItemMutation.mutate(itemId);
    }
  };

  const formatBytes = (bytes: number = 0, decimals = 2) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  const getEmbedUrl = (url: string) => {
    try {
      if (url.includes("youtu.be")) {
        const id = url.split("/").pop();
        return `https://www.youtube.com/embed/${id}`;
      }
      const urlParams = new URLSearchParams(new URL(url).search);
      return `https://www.youtube.com/embed/${urlParams.get("v")}`;
    } catch {
      return url;
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fadeIn">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Kütüphane Yönetimi</h2>
          <p className="text-gray-500 text-sm mt-1">
            Öğrencilerinizle paylaşmak istediğiniz dökümanları (PDF, Word), MP4 videolarını veya YouTube videolarını buradan yönetin.
          </p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center justify-center gap-2 px-5 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold shadow-md shadow-teal-500/20 hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200"
        >
          {showAddForm ? (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
              İptal Et
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni İçerik Ekle
            </>
          )}
        </button>
      </div>

      {/* Add New Library Item Form */}
      {showAddForm && (
        <div className="bg-white rounded-2xl border border-gray-200/60 shadow-md p-6 animate-slideDown">
          <h3 className="text-lg font-bold text-gray-900 border-b border-gray-100 pb-3 mb-5">
            Yeni İçerik Tanımla
          </h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">İçerik Başlığı *</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Limit ve Süreklilik Formül Kağıdı"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">İçerik Tipi *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setItemType("file");
                      setSelectedFile(null);
                    }}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      itemType === "file"
                        ? "bg-teal-50 border-teal-200 text-teal-700 shadow-sm"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    📂 Dosya / Döküman
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setItemType("video");
                      setSelectedFile(null);
                    }}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      itemType === "video"
                        ? "bg-teal-50 border-teal-200 text-teal-700 shadow-sm"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    🎥 Video Yükle
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setItemType("youtube");
                      setSelectedFile(null);
                    }}
                    className={`py-2.5 px-3 text-xs font-semibold rounded-xl border transition-all ${
                      itemType === "youtube"
                        ? "bg-teal-50 border-teal-200 text-teal-700 shadow-sm"
                        : "border-gray-200 hover:bg-gray-50 text-gray-600"
                    }`}
                  >
                    🔗 YouTube Linki
                  </button>
                </div>
              </div>

              <div className="md:col-span-2 space-y-2">
                <label className="text-sm font-semibold text-gray-700">Açıklama (İsteğe bağlı)</label>
                <textarea
                  rows={3}
                  placeholder="İçeriğin detayları, hangi derse ait olduğu gibi kısa bir açıklama yazabilirsiniz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm resize-none"
                />
              </div>

              {/* Dynamic input fields based on Item Type */}
              <div className="md:col-span-2">
                {itemType === "file" && (
                  <div className="border-2 border-dashed border-gray-300 hover:border-teal-500/60 transition-all rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer relative">
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.png,.jpg,.jpeg,.zip"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                    {selectedFile ? (
                      <div className="text-center">
                        <p className="text-sm font-bold text-teal-600">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatBytes(selectedFile.size)}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">Döküman Yüklemek İçin Tıklayın veya Sürükleyin</p>
                        <p className="text-xs text-gray-400 mt-1">PDF, Word, Excel, PPT, Zip veya Görsel (Maks 100MB)</p>
                      </div>
                    )}
                  </div>
                )}

                {itemType === "video" && (
                  <div className="border-2 border-dashed border-gray-300 hover:border-teal-500/60 transition-all rounded-2xl p-8 flex flex-col items-center justify-center bg-gray-50/50 cursor-pointer relative">
                    <input
                      type="file"
                      accept="video/mp4"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <svg className="w-12 h-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    {selectedFile ? (
                      <div className="text-center">
                        <p className="text-sm font-bold text-teal-600">{selectedFile.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{formatBytes(selectedFile.size)}</p>
                      </div>
                    ) : (
                      <div className="text-center">
                        <p className="text-sm font-semibold text-gray-700">Video Yüklemek İçin Tıklayın veya Sürükleyin</p>
                        <p className="text-xs text-gray-400 mt-1">Sadece MP4 Formatında Yerel Videolar (Maks 100MB)</p>
                      </div>
                    )}
                  </div>
                )}

                {itemType === "youtube" && (
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-gray-700">YouTube Video URL *</label>
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=..."
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500 transition-all text-sm"
                    />
                    <p className="text-xs text-gray-400">Öğrencilerin profilinizde doğrudan izleyebileceği bir YouTube video linki ekleyin.</p>
                  </div>
                )}
              </div>
            </div>

            {/* Progress Bar when uploading */}
            {isUploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-gray-600">
                  <span>Sunucuya yükleniyor, lütfen kapatmayın...</span>
                  <span>{uploadProgress}%</span>
                </div>
                <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-teal-500 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 border-t border-gray-100 pt-4">
              <button
                type="button"
                onClick={resetForm}
                disabled={isUploading}
                className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-semibold text-sm transition-all duration-200"
              >
                Vazgeç
              </button>
              <button
                type="submit"
                disabled={isUploading || createItemMutation.isPending}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 hover:from-teal-600 hover:to-teal-700 text-white rounded-xl font-semibold text-sm shadow-md shadow-teal-500/10 transition-all duration-200 disabled:opacity-50"
              >
                {createItemMutation.isPending || isUploading ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Library Items List */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-6">Kütüphane İçerikleriniz ({libraryItems.length})</h3>

        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-gray-500 ml-3 text-sm font-medium">Kütüphane yükleniyor...</span>
          </div>
        ) : libraryItems.length === 0 ? (
          <div className="text-center py-16 border-2 border-dashed border-gray-200 rounded-2xl">
            <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0a2 2 0 01-2 2H6a2 2 0 01-2-2m16 0V9a2 2 0 00-2-2H6a2 2 0 00-2 2v2m16 4h-2a2 2 0 00-2 2v3a2 2 0 002 2h2a2 2 0 002-2v-3a2 2 0 00-2-2zM6 20h2a2 2 0 002-2v-3a2 2 0 00-2-2H6a2 2 0 00-2 2v3a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-base font-bold text-gray-700">Kütüphaneniz Henüz Boş</h4>
            <p className="text-gray-400 text-sm mt-1 max-w-md mx-auto">
              Henüz döküman veya video yüklemediniz. Yukarıdaki buton yardımıyla kütüphanenizi doldurmaya hemen başlayın!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {libraryItems.map((item) => (
              <div
                key={item.id}
                className="group relative bg-white border border-gray-200/80 rounded-2xl p-5 hover:border-teal-500/50 hover:shadow-lg hover:shadow-gray-200/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-4">
                  {/* Type badge and options */}
                  <div className="flex justify-between items-start gap-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                        item.item_type === "file"
                          ? "bg-blue-50 text-blue-700 border border-blue-100"
                          : item.item_type === "video"
                          ? "bg-purple-50 text-purple-700 border border-purple-100"
                          : "bg-red-50 text-red-700 border border-red-100"
                      }`}
                    >
                      {item.item_type === "file" ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          Döküman
                        </>
                      ) : item.item_type === "video" ? (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                          </svg>
                          Yerel Video
                        </>
                      ) : (
                        <>
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75A2.25 2.25 0 0 1 4.5 4.5h15a2.25 2.25 0 0 1 2.25 2.25Z" />
                          </svg>
                          YouTube Videosu
                        </>
                      )}
                    </span>

                    <button
                      onClick={() => handleDelete(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Sil"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-gray-900 group-hover:text-teal-600 transition-colors line-clamp-1">
                      {item.title}
                    </h4>
                    {item.description && (
                      <p className="text-gray-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Embedded Players / Viewers in cards */}
                  {item.item_type === "youtube" && item.youtube_url && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-inner border border-gray-100 bg-black/5 mt-3">
                      <iframe
                        src={getEmbedUrl(item.youtube_url)}
                        title={item.title}
                        className="w-full h-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}

                  {item.item_type === "video" && item.file_path && (
                    <div className="w-full aspect-video rounded-xl overflow-hidden shadow-inner border border-gray-100 bg-black mt-3">
                      <video
                        src={`http://localhost:8000/media/${item.file_path}`}
                        controls
                        className="w-full h-full object-cover"
                      ></video>
                    </div>
                  )}
                </div>

                {/* Footer and downloads */}
                <div className="mt-5 border-t border-gray-100 pt-4 flex items-center justify-between">
                  <span className="text-[11px] font-medium text-gray-400">
                    Eklendi: {new Date(item.created_at).toLocaleDateString("tr-TR", { day: "numeric", month: "long", year: "numeric" })}
                  </span>
                  
                  {item.item_type === "file" && item.file_path && (
                    <a
                      href={`http://localhost:8000/media/${item.file_path}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1.5 text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      </svg>
                      Dosyayı İndir
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
