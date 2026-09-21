"use client";

import React, { useState, useEffect } from "react";
import { tendersApi, type TenderItem, type TenderBidItem } from "@/lib/api";

export default function StudentTendersPage() {
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [acceptingId, setAcceptingId] = useState<string | null>(null);
  const [acceptedSuccess, setAcceptedSuccess] = useState<{
    teacher_name: string;
    teacher_phone?: string;
    teacher_whatsapp_link?: string;
  } | null>(null);

  // Form State
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState<"ONLINE" | "FACE_TO_FACE">("ONLINE");
  const [city, setCity] = useState("");
  const [district, setDistrict] = useState("");
  const [targetDateInfo, setTargetDateInfo] = useState("Hemen Başlasın");
  const [minBudget, setMinBudget] = useState("");
  const [maxBudget, setMaxBudget] = useState("");
  const [description, setDescription] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  // Edit State
  const [editingTender, setEditingTender] = useState<TenderItem | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editSubject, setEditSubject] = useState("");
  const [editMode, setEditMode] = useState<"ONLINE" | "FACE_TO_FACE">("ONLINE");
  const [editCity, setEditCity] = useState("");
  const [editDistrict, setEditDistrict] = useState("");
  const [editTargetDateInfo, setEditTargetDateInfo] = useState("Hemen Başlasın");
  const [editMinBudget, setEditMinBudget] = useState("");
  const [editMaxBudget, setEditMaxBudget] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  // Delete State
  const [deletingTender, setDeletingTender] = useState<TenderItem | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchMyTenders = async () => {
    setLoading(true);
    try {
      const list = await tendersApi.getMyTenders();
      setTenders(list);
    } catch (err) {
      console.error("Ders taleplerim alinamadi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTenders();
  }, []);

  const handleOpenEdit = (tender: TenderItem) => {
    setEditingTender(tender);
    setEditTitle(tender.title);
    setEditSubject(tender.subject);
    setEditMode((tender.mode as "ONLINE" | "FACE_TO_FACE") || "ONLINE");
    setEditCity(tender.city || "");
    setEditDistrict(tender.district || "");
    setEditTargetDateInfo(tender.target_date_info || "Hemen Başlasın");
    setEditMinBudget(tender.min_budget ? String(tender.min_budget) : "");
    setEditMaxBudget(tender.max_budget ? String(tender.max_budget) : "");
    setEditDescription(tender.description);
    setEditError(null);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingTender) return;
    setEditError(null);

    if (!editSubject.trim()) {
      setEditError("Lütfen ders veya konu adını giriniz.");
      return;
    }
    if (!editTitle.trim()) {
      setEditError("Lütfen talep başlığını giriniz.");
      return;
    }
    if (!editDescription.trim() || editDescription.length < 10) {
      setEditError("Lütfen ihtiyacınızı en az 10 karakterle açıklayınız.");
      return;
    }

    setUpdating(true);
    try {
      await tendersApi.update(editingTender.id, {
        title: editTitle.trim(),
        subject: editSubject.trim(),
        mode: editMode,
        city: editMode === "FACE_TO_FACE" ? editCity.trim() : undefined,
        district: editMode === "FACE_TO_FACE" ? editDistrict.trim() : undefined,
        target_date_info: editTargetDateInfo,
        min_budget: editMinBudget ? parseFloat(editMinBudget) : undefined,
        max_budget: editMaxBudget ? parseFloat(editMaxBudget) : undefined,
        description: editDescription.trim(),
      });
      setEditingTender(null);
      fetchMyTenders();
    } catch (err: any) {
      setEditError(err.response?.data?.detail || "Talep güncellenirken bir hata oluştu.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingTender) return;
    setDeleting(true);
    try {
      await tendersApi.delete(deletingTender.id);
      setDeletingTender(null);
      fetchMyTenders();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Ders talebi silinirken bir hata oluştu.");
    } finally {
      setDeleting(false);
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!subject.trim()) {
      setFormError("Lütfen ders veya konu adını giriniz.");
      return;
    }
    if (!title.trim()) {
      setFormError("Lütfen talep başlığını giriniz.");
      return;
    }
    if (!description.trim() || description.length < 10) {
      setFormError("Lütfen ihtiyacınızı en az 10 karakterle açıklayınız.");
      return;
    }

    setCreating(true);
    try {
      await tendersApi.create({
        title: title.trim(),
        subject: subject.trim(),
        category_name: "Özel Ders",
        mode,
        city: mode === "FACE_TO_FACE" ? city.trim() : undefined,
        district: mode === "FACE_TO_FACE" ? district.trim() : undefined,
        target_date_info: targetDateInfo,
        min_budget: minBudget ? parseFloat(minBudget) : undefined,
        max_budget: maxBudget ? parseFloat(maxBudget) : undefined,
        description: description.trim(),
      });

      setShowCreateModal(false);
      // Reset form
      setTitle("");
      setSubject("");
      setDescription("");
      setMinBudget("");
      setMaxBudget("");
      setCity("");
      setDistrict("");
      fetchMyTenders();
    } catch (err: any) {
      setFormError(err.response?.data?.detail || "Talep oluşturulurken bir hata oluştu.");
    } finally {
      setCreating(false);
    }
  };

  const handleAcceptBid = async (tenderId: string, bidId: string) => {
    setAcceptingId(bidId);
    try {
      const res = await tendersApi.acceptBid(tenderId, bidId);
      setAcceptedSuccess({
        teacher_name: res.teacher_name,
        teacher_phone: res.teacher_phone,
        teacher_whatsapp_link: res.teacher_whatsapp_link,
      });
      fetchMyTenders();
    } catch (err: any) {
      alert(err.response?.data?.detail || "Teklif kabul edilirken bir hata oluştu.");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-8 bg-gray-50/50 min-h-screen text-gray-900">
      {/* Üst Kısım & Eylem Butonu */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Özel Ders Taleplerim
          </h1>
          <p className="text-sm font-medium text-gray-600 mt-1">
            İhtiyacınız olan ders için talep açın, uzman eğitmenlerden saatlik teklifler alın.
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
        >
          <span className="text-base font-bold">+</span>
          <span>Yeni Ders Talebi Oluştur</span>
        </button>
      </div>

      {/* Talepler Listesi */}
      {loading ? (
        <div className="py-24 text-center text-gray-500 text-base font-semibold">
          Ders talepleriniz yükleniyor...
        </div>
      ) : tenders.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto text-3xl font-bold shadow-inner">
            📚
          </div>
          <h2 className="text-xl font-extrabold text-gray-900">Henüz bir ders talebiniz yok</h2>
          <p className="text-sm font-medium text-gray-600 max-w-md mx-auto">
            Hangi derse ihtiyacınız varsa 1 dakikada talep oluşturun. İlgili branştaki öğretmenlerimiz size özel tekliflerini iletsin.
          </p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold transition-all shadow-md shadow-emerald-600/20"
          >
            Hemen İlk Talebini Aç
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {tenders.map((tender) => (
            <div
              key={tender.id}
              className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-7 space-y-6 shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Talep Başlığı & Rozetler */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 border-b border-gray-100 pb-5">
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tender.subject}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-gray-100 text-gray-800">
                      {tender.mode === "ONLINE" ? "🌐 Online" : "📍 Yüz Yüze"}
                    </span>
                    {tender.city && (
                      <span className="text-xs font-bold text-gray-700">{tender.city}</span>
                    )}
                    {tender.status === "ACCEPTED" ? (
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-purple-100 text-purple-800 border border-purple-200">
                        ✓ Teklif Kabul Edildi
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200">
                        Tekliflere Açık
                      </span>
                    )}
                  </div>
                  <h2 className="text-xl font-extrabold text-gray-900 mt-2.5">
                    {tender.title}
                  </h2>
                  <p className="text-xs font-medium text-gray-500">
                    {new Date(tender.created_at).toLocaleDateString("tr-TR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}{" "}
                    • Zamanlama: <span className="text-gray-700 font-semibold">{tender.target_date_info || "Esnek"}</span>
                  </p>
                </div>

                <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                  <div className="text-left sm:text-right">
                    <div className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Bütçe Aralığı
                    </div>
                    <div className="text-lg font-black text-gray-900 font-mono mt-0.5">
                      {tender.min_budget && tender.max_budget
                        ? `${tender.min_budget} - ${tender.max_budget} ₺/saat`
                        : "Teklif Bekleniyor"}
                    </div>
                  </div>

                  {/* Düzenleme ve Silme Butonları */}
                  {tender.status !== "ACCEPTED" && tender.status !== "PAID" && tender.status !== "COMPLETED" && (
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleOpenEdit(tender)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold transition-colors border border-gray-200"
                        title="Talebi Düzenle"
                      >
                        <svg className="w-3.5 h-3.5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span>Düzenle</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setDeletingTender(tender)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-xs font-bold transition-colors border border-rose-200"
                        title="Talebi Sil"
                      >
                        <svg className="w-3.5 h-3.5 text-rose-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        <span>Sil</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Açıklama */}
              <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-200/80">
                {tender.description}
              </p>

              {/* Gelen Teklifler Bölümü */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">
                    Eğitmen Teklifleri ({tender.bids?.length || 0} / 4)
                  </h3>
                  {tender.status === "OPEN" && (
                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                      Teklifler bekleniyor...
                    </span>
                  )}
                </div>

                {(!tender.bids || tender.bids.length === 0) ? (
                  <div className="text-sm font-medium text-gray-500 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center">
                    Henüz bir teklif gelmedi. İlgili eğitmenlerimiz talebinizi inceliyor.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tender.bids.map((bid) => (
                      <div
                        key={bid.id}
                        className={`p-5 rounded-2xl border transition-all flex flex-col justify-between ${
                          bid.id === tender.accepted_bid_id
                            ? "bg-purple-50/70 border-purple-300 shadow-sm ring-2 ring-purple-500/20"
                            : "bg-gray-50 border-gray-200 hover:bg-white hover:shadow-md"
                        }`}
                      >
                        <div>
                          <div className="flex items-start justify-between gap-2 mb-2">
                            <div>
                              <div className="font-extrabold text-gray-900 text-base">
                                {bid.teacher_name}
                              </div>
                              <div className="text-xs font-semibold text-gray-500">
                                {bid.teacher_title || "Uzman Eğitmen"}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-xl font-black text-emerald-700 font-mono">
                                {bid.offered_price} {bid.currency}
                              </div>
                              <div className="text-[11px] font-bold text-gray-500">saatlik ücret</div>
                            </div>
                          </div>

                          <p className="text-sm font-medium text-gray-700 bg-white p-3.5 rounded-xl border border-gray-200 mb-4 whitespace-pre-wrap">
                            "{bid.proposal_letter}"
                          </p>
                        </div>

                        {/* Eylem Butonu */}
                        <div>
                          {bid.id === tender.accepted_bid_id ? (
                            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-3 border-t border-purple-200">
                              <span className="text-xs font-extrabold text-purple-700 flex items-center gap-1">
                                ✓ Kabul Edildi
                              </span>
                              {bid.whatsapp_link && (
                                <a
                                  href={bid.whatsapp_link}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                                >
                                  <span>💬 WhatsApp İle Başla</span>
                                </a>
                              )}
                            </div>
                          ) : tender.accepted_bid_id ? (
                            <span className="text-xs font-semibold text-gray-400 block text-center pt-2">
                              Başka bir teklif seçildi
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAcceptBid(tender.id, bid.id)}
                              disabled={acceptingId === bid.id}
                              className="w-full py-2.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-all shadow-sm disabled:opacity-50"
                            >
                              {acceptingId === bid.id ? "Onaylanıyor..." : "Bu Teklifi Kabul Et"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 4 Soruluk Hızlı Talep Açma Modalı */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-6 shadow-2xl text-gray-900">
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <h2 className="text-xl font-extrabold text-gray-900">
                  Yeni Özel Ders Talebi Oluştur
                </h2>
                <p className="text-xs font-medium text-gray-600 mt-1">
                  1 dakikada ihtiyacınızı belirtin, öğretmenlerden en uygun teklifleri alın.
                </p>
              </div>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-900 text-xl font-bold transition-colors"
              >
                ✕
              </button>
            </div>

            {formError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                {formError}
              </div>
            )}

            <form onSubmit={handleCreateSubmit} className="space-y-4 text-xs font-medium">
              {/* 1. Soru: Ders / Konu */}
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                  1. Hangi Ders veya Sınav İçin Destek İstiyorsunuz? *
                </label>
                <input
                  type="text"
                  placeholder="Örn: LGS Matematik, YKS Fizik, İlkokul Okuma Yazma"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>

              {/* 2. Soru: Format ve Lokasyon */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                    2. Ders Formatı
                  </label>
                  <select
                    value={mode}
                    onChange={(e) => setMode(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="ONLINE">🌐 Online (Canlı)</option>
                    <option value="FACE_TO_FACE">📍 Yüz Yüze</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                    Zaman Tercihi
                  </label>
                  <select
                    value={targetDateInfo}
                    onChange={(e) => setTargetDateInfo(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="Hemen Başlasın">Hemen Başlasın</option>
                    <option value="Hafta Sonu">Hafta Sonu</option>
                    <option value="Hafta İçi Akşam">Hafta İçi Akşam</option>
                    <option value="Esnek">Farketmez (Esnek)</option>
                  </select>
                </div>
              </div>

              {mode === "FACE_TO_FACE" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Şehir</label>
                    <input
                      type="text"
                      placeholder="Örn: İstanbul"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">İlçe</label>
                    <input
                      type="text"
                      placeholder="Örn: Kadıköy"
                      value={district}
                      onChange={(e) => setDistrict(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>
              )}

              {/* 3. Soru: Bütçe */}
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                  3. Saatlik Bütçe Aralığınız (TL/Saat)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min ₺ (Örn: 500)"
                    value={minBudget}
                    onChange={(e) => setMinBudget(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Maks ₺ (Örn: 800)"
                    value={maxBudget}
                    onChange={(e) => setMaxBudget(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              {/* 4. Soru: Talep Başlığı & Detay */}
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                  Talep Başlığı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: LGS Matematik Yeni Nesil Soru Çözümü için Öğretmen"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                  4. Detaylı Açıklama & Hedefiniz *
                </label>
                <textarea
                  rows={3}
                  placeholder="Öğrencinin mevcut durumu, haftada kaç saat ders planlandığı ve öğretmenden beklentileriniz..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-medium"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {creating ? "Oluşturuluyor..." : "Talebi Yayınla"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Düzenleme Modalı */}
      {editingTender && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-xl w-full p-6 sm:p-7 space-y-5 shadow-2xl max-h-[90vh] overflow-y-auto text-gray-900">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h2 className="text-xl font-black text-gray-900">
                  Ders Talebini Düzenle
                </h2>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  Talep detaylarınızı ve beklentilerinizi güncelleyin.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingTender(null)}
                className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 flex items-center justify-center font-bold text-base transition-colors"
              >
                ✕
              </button>
            </div>

            {editError && (
              <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 text-xs font-semibold rounded-2xl">
                {editError}
              </div>
            )}

            <form onSubmit={handleUpdateSubmit} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                  Ders veya Sınav Konusu *
                </label>
                <input
                  type="text"
                  placeholder="Örn: LGS Matematik, YKS Fizik"
                  value={editSubject}
                  onChange={(e) => setEditSubject(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                    Ders Formatı
                  </label>
                  <select
                    value={editMode}
                    onChange={(e) => setEditMode(e.target.value as any)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="ONLINE">🌐 Online (Canlı)</option>
                    <option value="FACE_TO_FACE">📍 Yüz Yüze</option>
                  </select>
                </div>

                <div>
                  <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                    Zaman Tercihi
                  </label>
                  <select
                    value={editTargetDateInfo}
                    onChange={(e) => setEditTargetDateInfo(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2.5 text-gray-900 font-semibold focus:outline-none focus:ring-2 focus:ring-gray-900"
                  >
                    <option value="Hemen Başlasın">Hemen Başlasın</option>
                    <option value="Hafta Sonu">Hafta Sonu</option>
                    <option value="Hafta İçi Akşam">Hafta İçi Akşam</option>
                    <option value="Esnek">Farketmez (Esnek)</option>
                  </select>
                </div>
              </div>

              {editMode === "FACE_TO_FACE" && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">Şehir</label>
                    <input
                      type="text"
                      placeholder="Örn: İstanbul"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                  <div>
                    <label className="block text-gray-700 font-bold mb-1">İlçe</label>
                    <input
                      type="text"
                      placeholder="Örn: Kadıköy"
                      value={editDistrict}
                      onChange={(e) => setEditDistrict(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-300 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                  Saatlik Bütçe Aralığınız (TL/Saat)
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <input
                    type="number"
                    placeholder="Min ₺ (Örn: 500)"
                    value={editMinBudget}
                    onChange={(e) => setEditMinBudget(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                  <input
                    type="number"
                    placeholder="Maks ₺ (Örn: 800)"
                    value={editMaxBudget}
                    onChange={(e) => setEditMaxBudget(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                  Talep Başlığı *
                </label>
                <input
                  type="text"
                  placeholder="Örn: LGS Matematik Yeni Nesil Soru Çözümü için Öğretmen"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                  Detaylı Açıklama & Hedefiniz *
                </label>
                <textarea
                  rows={3}
                  placeholder="Öğrencinin mevcut durumu ve beklentileriniz..."
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-gray-900 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-medium"
                  required
                />
              </div>

              <div className="pt-3 flex justify-end gap-3 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setEditingTender(null)}
                  className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={updating}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {updating ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Silme Onay Modalı */}
      {deletingTender && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 sm:p-7 text-center space-y-4 shadow-2xl text-gray-900">
            <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto text-2xl font-bold border border-rose-200">
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h2 className="text-xl font-black text-gray-900">
              Ders Talebini Silmek İstiyor Musunuz?
            </h2>
            <p className="text-xs font-medium text-gray-600 leading-relaxed">
              <span className="font-bold text-gray-900">"{deletingTender.title}"</span> başlıklı ders talebiniz ve bu talebe gelen tüm eğitmen teklifleri silinecektir. Bu işlem geri alınamaz.
            </p>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setDeletingTender(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold transition-colors text-xs"
              >
                Vazgeç
              </button>
              <button
                type="button"
                disabled={deleting}
                onClick={handleDeleteConfirm}
                className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl font-bold transition-all shadow-md shadow-rose-600/20 text-xs disabled:opacity-50"
              >
                {deleting ? "Siliniyor..." : "Evet, Talebi Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Kabul Başarı Modalı */}
      {acceptedSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-7 text-center space-y-4 shadow-2xl text-gray-900">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 text-3xl flex items-center justify-center mx-auto shadow-inner">
              🎉
            </div>
            <h2 className="text-xl font-black text-gray-900">
              Teklif Başarıyla Kabul Edildi!
            </h2>
            <p className="text-sm font-medium text-gray-600 leading-relaxed">
              Eğitmeniniz <span className="font-bold text-gray-900">{acceptedSuccess.teacher_name}</span> ile eşleştiniz. Artık doğrudan WhatsApp üzerinden iletişime geçip ders saatini planlayabilirsiniz.
            </p>

            <div className="pt-2 flex flex-col gap-2.5">
              {acceptedSuccess.teacher_whatsapp_link && (
                <a
                  href={acceptedSuccess.teacher_whatsapp_link}
                  target="_blank"
                  rel="noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
                >
                  <span>💬 WhatsApp'ta Sohbeti Başlat</span>
                </a>
              )}
              <button
                onClick={() => setAcceptedSuccess(null)}
                className="w-full py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl text-xs font-bold"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
