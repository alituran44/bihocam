"use client";

import React, { useState, useEffect } from "react";
import {
  tendersApi,
  type TenderItem,
  type TenderBidItem,
} from "@/lib/api";

export default function TeacherTendersPage() {
  const [activeTab, setActiveTab] = useState<"POOL" | "MY_BIDS">("POOL");
  const [poolTenders, setPoolTenders] = useState<TenderItem[]>([]);
  const [myBids, setMyBids] = useState<TenderBidItem[]>([]);
  const [loading, setLoading] = useState(true);

  // Teklif Verme Modalı
  const [biddingTender, setBiddingTender] = useState<TenderItem | null>(null);
  const [offeredPrice, setOfferedPrice] = useState("");
  const [proposalLetter, setProposalLetter] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [modalError, setModalError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fetchPool = async () => {
    setLoading(true);
    try {
      const list = await tendersApi.listPublic();
      setPoolTenders(list);
    } catch (err) {
      console.error("Ders talepleri havuzu alinamadi:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyBids = async () => {
    setLoading(true);
    try {
      const list = await tendersApi.getMyBids();
      setMyBids(list);
    } catch (err) {
      console.error("Verdigim teklifler alinamadi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "POOL") {
      fetchPool();
    } else {
      fetchMyBids();
    }
  }, [activeTab]);

  const handleOpenBidModal = (tender: TenderItem) => {
    setBiddingTender(tender);
    setOfferedPrice(tender.max_budget?.toString() || tender.min_budget?.toString() || "600");
    setProposalLetter("");
    setModalError(null);
  };

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingTender) return;
    setModalError(null);

    const price = parseFloat(offeredPrice);
    if (!price || price <= 0) {
      setModalError("Lütfen geçerli bir saatlik ücret giriniz.");
      return;
    }

    if (!proposalLetter.trim() || proposalLetter.length < 10) {
      setModalError("Lütfen kendinizi ve ders yönteminizi tanıtan en az 10 karakterlik bir not yazınız.");
      return;
    }

    setSubmitting(true);
    try {
      await tendersApi.submitBid(biddingTender.id, {
        offered_price: price,
        proposal_letter: proposalLetter.trim(),
      });

      setSuccessMessage("Teklifiniz öğrenciye başarıyla iletildi!");
      setTimeout(() => setSuccessMessage(null), 3000);
      setBiddingTender(null);
      fetchPool();
    } catch (err: any) {
      setModalError(err.response?.data?.detail || "Teklif gönderilirken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8 bg-gray-50/50 min-h-screen text-gray-900">
      {/* Başlık & Sekmeler */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
            Özel Ders Talepleri
          </h1>
          <p className="text-sm font-medium text-gray-600 mt-1">
            Öğrencilerin açtığı ders taleplerini inceleyin, branşınıza uygun olanlara teklif verin.
          </p>
        </div>

        {successMessage && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-bold shadow-sm">
            {successMessage}
          </div>
        )}
      </div>

      {/* Sekme Butonları */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("POOL")}
          className={`pb-3.5 px-3 text-sm font-bold transition-colors relative ${
            activeTab === "POOL"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Açık Ders Talepleri Havuzu
        </button>
        <button
          onClick={() => setActiveTab("MY_BIDS")}
          className={`pb-3.5 px-3 text-sm font-bold transition-colors relative ${
            activeTab === "MY_BIDS"
              ? "text-gray-900 border-b-2 border-gray-900"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Verdiğim Teklifler
        </button>
      </div>

      {/* İçerik */}
      {loading ? (
        <div className="py-24 text-center text-gray-500 text-base font-semibold">
          Yükleniyor...
        </div>
      ) : activeTab === "POOL" ? (
        // HAVUZ SEKMESİ
        poolTenders.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 text-sm font-medium shadow-sm">
            Şu anda açık özel ders talebi bulunmuyor. Yeni talepler geldiğinde burada listelenecektir.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {poolTenders.map((tender) => (
              <div
                key={tender.id}
                className="bg-white border border-gray-200 rounded-3xl p-6 flex flex-col justify-between space-y-4 hover:shadow-md transition-all shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-50 text-emerald-700 border border-emerald-200">
                      {tender.subject}
                    </span>
                    <span className="text-xs font-bold text-blue-600 font-mono bg-blue-50 px-2.5 py-0.5 rounded-full">
                      {tender.bids_count} / 4 Teklif
                    </span>
                  </div>

                  <h3 className="text-lg font-extrabold text-gray-900 mb-1.5">
                    {tender.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 mb-3.5 flex-wrap">
                    <span className="bg-gray-100 px-2.5 py-0.5 rounded text-gray-700">
                      {tender.mode === "ONLINE" ? "🌐 Online" : "📍 Yüz Yüze"}
                    </span>
                    {tender.city && <span>• {tender.city}</span>}
                    <span>• {tender.target_date_info || "Esnek"}</span>
                  </div>

                  <p className="text-sm font-medium text-gray-700 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-200/80 mb-3">
                    {tender.description}
                  </p>
                </div>

                <div className="border-t border-gray-100 pt-4 flex items-center justify-between">
                  <div>
                    <div className="text-[11px] text-gray-500 uppercase tracking-wider font-bold">
                      Öğrenci Bütçesi
                    </div>
                    <div className="text-base font-black text-gray-900 font-mono">
                      {tender.min_budget && tender.max_budget
                        ? `${tender.min_budget} - ${tender.max_budget} ₺`
                        : "Teklif Bekleniyor"}
                    </div>
                  </div>

                  {tender.bids_count >= 4 ? (
                    <span className="text-xs text-gray-500 font-bold px-3 py-1.5 bg-gray-100 rounded-xl">
                      Kota Doldu (4 Teklif)
                    </span>
                  ) : (
                    <button
                      onClick={() => handleOpenBidModal(tender)}
                      className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-600/20 transition-all active:scale-[0.98]"
                    >
                      Teklif Ver
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        // VERDİĞİM TEKLİFLER SEKMESİ
        myBids.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-500 text-sm font-medium shadow-sm">
            Henüz bir ders talebine teklif vermediniz.
          </div>
        ) : (
          <div className="space-y-4">
            {myBids.map((bid) => (
              <div
                key={bid.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm"
              >
                <div>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="font-mono text-xs text-gray-400 font-bold">
                      Teklif ID: {bid.id.slice(0, 8)}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-extrabold ${
                        bid.status === "ACCEPTED"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : bid.status === "REJECTED"
                          ? "bg-red-50 text-red-700 border border-red-200"
                          : "bg-blue-50 text-blue-700 border border-blue-200"
                      }`}
                    >
                      {bid.status === "ACCEPTED"
                        ? "✓ Kabul Edildi"
                        : bid.status === "REJECTED"
                        ? "Reddedildi"
                        : "Öğrenci İncelemesinde"}
                    </span>
                  </div>
                  <p className="text-sm text-gray-700 font-medium italic">
                    "{bid.proposal_letter}"
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-xl font-black text-emerald-700 font-mono">
                      {bid.offered_price} {bid.currency}
                    </div>
                    <div className="text-[11px] font-bold text-gray-500">saatlik ücret</div>
                  </div>

                  {bid.status === "ACCEPTED" && (
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200">
                      Öğrenci sizinle iletişime geçecektir
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )
      )}

      {/* Teklif Verme Modalı */}
      {biddingTender && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-md w-full p-6 sm:p-7 space-y-4 shadow-2xl text-gray-900">
            <div className="flex items-start justify-between border-b border-gray-200 pb-3">
              <div>
                <h2 className="text-lg font-extrabold text-gray-900">
                  Ders Talebine Teklif Ver
                </h2>
                <p className="text-xs font-medium text-gray-500 mt-0.5">
                  {biddingTender.subject} • {biddingTender.title}
                </p>
              </div>
              <button
                onClick={() => setBiddingTender(null)}
                className="text-gray-400 hover:text-gray-900 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {modalError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-xl">
                {modalError}
              </div>
            )}

            <form onSubmit={handleSubmitBid} className="space-y-4 text-xs font-medium">
              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                  Teklif Ettiğiniz Saatlik Ücret (TL) *
                </label>
                <input
                  type="number"
                  placeholder="Örn: 650"
                  value={offeredPrice}
                  onChange={(e) => setOfferedPrice(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl px-4 py-2.5 text-gray-900 font-mono text-base font-bold focus:outline-none focus:ring-2 focus:ring-gray-900"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-700 font-bold mb-1.5 text-sm">
                  Tanıtım & Ders Yaklaşımınız Notu *
                </label>
                <textarea
                  rows={4}
                  placeholder="Deneyiminizi, bu dersteki uzmanlığınızı ve öğrenciye sağlayacağınız faydayı açıklayın..."
                  value={proposalLetter}
                  onChange={(e) => setProposalLetter(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-300 rounded-xl p-3.5 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900 resize-none font-medium"
                  required
                />
                <p className="text-[11px] text-gray-500 mt-2 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-200">
                  🛡️ <strong>Güvenlik Uyarısı:</strong> KVKK ve platform kuralları gereği telefon, e-posta ve sosyal medya bilgileri sistem tarafından otomatik olarak maskelenir. Öğrenci teklifinizi kabul ettiğinde doğrudan WhatsApp bağlantısı açılır.
                </p>
              </div>

              <div className="pt-3 flex justify-end gap-2.5 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => setBiddingTender(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded-xl font-bold"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 disabled:opacity-50"
                >
                  {submitting ? "Gönderiliyor..." : "Teklifi Gönder"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
