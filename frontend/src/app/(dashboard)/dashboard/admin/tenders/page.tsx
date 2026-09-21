"use client";

import React, { useState, useEffect } from "react";
import {
  adminTendersApi,
  type TenderItem,
  type TenderStats,
  type TenderBidItem,
} from "@/lib/api";

export default function AdminTendersPage() {
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [stats, setStats] = useState<TenderStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [search, setSearch] = useState("");
  const [selectedTender, setSelectedTender] = useState<TenderItem | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      const s = await adminTendersApi.getStats();
      setStats(s);
    } catch (err) {
      console.error("Talep istatistikleri alinamadi:", err);
    }
  };

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const res = await adminTendersApi.list({
        status_filter: statusFilter,
        search: search || undefined,
        limit: 50,
      });
      setTenders(res.items);
    } catch (err) {
      console.error("Talepler alinamadi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    fetchTenders();
  }, [statusFilter]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchTenders();
  };

  const handleOpenDetail = async (tenderId: string) => {
    setDetailLoading(true);
    try {
      const detail = await adminTendersApi.getDetail(tenderId);
      setSelectedTender(detail);
    } catch (err) {
      console.error("Talep detayi alinamadi:", err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleStatusUpdate = async (tenderId: string, newStatus: string) => {
    try {
      await adminTendersApi.updateStatus(tenderId, newStatus);
      setActionMessage(`Talep durumu '${newStatus}' olarak güncellendi.`);
      setTimeout(() => setActionMessage(null), 3000);
      fetchStats();
      fetchTenders();
      if (selectedTender && selectedTender.id === tenderId) {
        handleOpenDetail(tenderId);
      }
    } catch (err) {
      console.error("Durum guncellenemedi:", err);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "OPEN":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            Açık (Teklif Bekliyor)
          </span>
        );
      case "BIDDING":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            Teklif Geldi
          </span>
        );
      case "ACCEPTED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            Teklif Kabul Edildi
          </span>
        );
      case "PAID":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200">
            Ödendi / Tamamlandı
          </span>
        );
      case "CANCELLED":
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            İptal Edildi
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700 border border-gray-200">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen text-gray-900">
      {/* Üst Başlık & Açıklama */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
              Özel Ders Talep Masası
            </h1>
          </div>
          <p className="text-sm font-medium text-gray-600">
            Öğrencilerin açtığı özel ders talepleri, eğitmen teklifleri ve 5651 teknik iz denetimi
          </p>
        </div>

        {actionMessage && (
          <div className="px-4 py-2 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-sm font-semibold shadow-sm">
            {actionMessage}
          </div>
        )}
      </div>

      {/* KPI Kartları (Modern Yüksek Kontrast) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Toplam Ders Talebi
          </div>
          <div className="text-4xl font-extrabold text-gray-900">
            {stats?.total_tenders ?? 0}
          </div>
          <p className="text-xs font-medium text-gray-500 mt-2">Öğrencilerin oluşturduğu tüm talepler</p>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Açık & Teklif Sürecinde
          </div>
          <div className="text-4xl font-extrabold text-emerald-600">
            {(stats?.open_tenders ?? 0) + (stats?.bidding_tenders ?? 0)}
          </div>
          <p className="text-xs font-medium text-gray-500 mt-2">Eğitmen tekliflerine açık aktif talepler</p>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Eşleşen / Kabul Edilen
          </div>
          <div className="text-4xl font-extrabold text-purple-600">
            {(stats?.accepted_tenders ?? 0) + (stats?.paid_tenders ?? 0)}
          </div>
          <p className="text-xs font-medium text-gray-500 mt-2">Öğrencinin onayladığı teklifler</p>
        </div>

        <div className="bg-white border border-gray-200/80 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
          <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
            Verilen Toplam Teklif
          </div>
          <div className="text-4xl font-extrabold text-blue-600">
            {stats?.total_bids ?? 0}
          </div>
          <p className="text-xs font-medium text-gray-500 mt-2">Eğitmenlerin ilettiği teklif sayısı</p>
        </div>
      </div>

      {/* Filtre ve Arama Çubuğu */}
      <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center shadow-sm">
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {[
            { id: "ALL", label: "Tümü" },
            { id: "OPEN", label: "Açık" },
            { id: "BIDDING", label: "Teklif Geldi" },
            { id: "ACCEPTED", label: "Kabul Edildi" },
            { id: "CANCELLED", label: "İptal" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setStatusFilter(item.id)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                statusFilter === item.id
                  ? "bg-gray-900 text-white shadow"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSearchSubmit} className="flex gap-2 w-full md:w-80">
          <input
            type="text"
            placeholder="Ders, konu veya talep ara..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-900"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
          >
            Ara
          </button>
        </form>
      </div>

      {/* Talepler Tablosu */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-700 uppercase tracking-wider border-b border-gray-200 font-bold">
              <tr>
                <th className="py-4 px-5">Talep No & Tarih</th>
                <th className="py-4 px-5">Öğrenci</th>
                <th className="py-4 px-5">Ders / Konu</th>
                <th className="py-4 px-5">Format & Şehir</th>
                <th className="py-4 px-5">Bütçe Aralığı</th>
                <th className="py-4 px-5">Teklif Sayısı</th>
                <th className="py-4 px-5">Durum</th>
                <th className="py-4 px-5 text-right">İşlem</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500 text-sm font-semibold">
                    Ders talepleri yükleniyor...
                  </td>
                </tr>
              ) : tenders.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-gray-500 text-sm font-semibold">
                    Seçili filtreye uygun özel ders talebi bulunamadı.
                  </td>
                </tr>
              ) : (
                tenders.map((t) => (
                  <tr
                    key={t.id}
                    className="hover:bg-gray-50/80 transition-colors group cursor-pointer"
                    onClick={() => handleOpenDetail(t.id)}
                  >
                    <td className="py-4 px-5 font-mono text-gray-600">
                      <div className="font-bold text-gray-900">TLP-{t.id.slice(0, 8).toUpperCase()}</div>
                      <div className="text-[11px] text-gray-500">
                        {new Date(t.created_at).toLocaleDateString("tr-TR", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-gray-900 text-sm">{t.student_name}</div>
                      <div className="text-[11px] text-gray-500">{t.student_email}</div>
                    </td>
                    <td className="py-4 px-5">
                      <div className="font-bold text-gray-900 text-sm">{t.subject}</div>
                      <div className="text-[11px] text-gray-500 truncate max-w-xs">{t.title}</div>
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-block px-2.5 py-1 rounded-md bg-gray-100 text-gray-800 text-xs font-bold mr-1.5">
                        {t.mode === "ONLINE" ? "Online" : t.mode === "FACE_TO_FACE" ? "Yüz Yüze" : "Hibrit"}
                      </span>
                      {t.city && <span className="text-gray-700 font-semibold">{t.city}</span>}
                    </td>
                    <td className="py-4 px-5 font-mono text-gray-900 font-bold text-sm">
                      {t.min_budget && t.max_budget
                        ? `${t.min_budget} - ${t.max_budget} ₺`
                        : t.min_budget
                        ? `Min ${t.min_budget} ₺`
                        : t.max_budget
                        ? `Maks ${t.max_budget} ₺`
                        : "Belirtilmemiş"}
                    </td>
                    <td className="py-4 px-5">
                      <span className="inline-flex items-center gap-1 font-bold text-gray-900 text-sm">
                        <span className="text-blue-600">{t.bids_count}</span>
                        <span className="text-gray-400 text-xs">/ 4</span>
                      </span>
                    </td>
                    <td className="py-4 px-5">{getStatusBadge(t.status)}</td>
                    <td className="py-4 px-5 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleOpenDetail(t.id);
                        }}
                        className="px-4 py-1.5 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                      >
                        İncele
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detay & 5651 Denetim Modalı */}
      {selectedTender && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white border border-gray-200 rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto p-6 space-y-6 shadow-2xl text-gray-900">
            {/* Modal Başlık */}
            <div className="flex items-start justify-between border-b border-gray-200 pb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-extrabold text-gray-900">
                    {selectedTender.subject}
                  </h2>
                  {getStatusBadge(selectedTender.status)}
                </div>
                <p className="text-xs font-medium text-gray-500 mt-1">
                  Talep ID: <span className="font-mono text-gray-700 font-bold">{selectedTender.id}</span>
                </p>
              </div>
              <button
                onClick={() => setSelectedTender(null)}
                className="text-gray-400 hover:text-gray-900 text-xl font-bold p-1 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Talep & Öğrenci Bilgileri */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-gray-50 p-5 rounded-2xl border border-gray-200">
              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Öğrenci Bilgisi
                </h3>
                <div className="text-base font-bold text-gray-900">
                  {selectedTender.student_name}
                </div>
                <div className="text-xs font-medium text-gray-600 mt-0.5">
                  {selectedTender.student_email}
                </div>
                {selectedTender.student_phone && (
                  <div className="text-xs font-medium text-gray-600 mt-0.5">
                    Tel: {selectedTender.student_phone}
                  </div>
                )}
                {selectedTender.student_whatsapp && (
                  <a
                    href={selectedTender.student_whatsapp}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
                  >
                    <span>💬 Öğrenciye WhatsApp'tan Yaz (Concierge)</span>
                  </a>
                )}
              </div>

              <div>
                <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                  5651 & GİB Teknik İz Kütüğü
                </h3>
                <div className="text-xs text-gray-700 space-y-1.5 font-mono">
                  <div>İstemci IP: <span className="text-emerald-700 font-bold">{selectedTender.client_ip || "127.0.0.1"}</span></div>
                  <div>Bağlantı Portu: <span className="text-gray-900 font-bold">{selectedTender.client_port || 443}</span></div>
                  <div>Oluşturulma: <span className="text-gray-900">{new Date(selectedTender.created_at).toLocaleString("tr-TR")}</span></div>
                  <div>Optimistic Sürüm: <span className="text-purple-700 font-bold">v{selectedTender.version}</span></div>
                </div>
              </div>
            </div>

            {/* Açıklama */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                Talep Detayı
              </h3>
              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 text-sm font-medium text-gray-800 leading-relaxed whitespace-pre-wrap">
                {selectedTender.description}
              </div>
            </div>

            {/* Gelen Teklifler */}
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                Gelen Teklifler ({selectedTender.bids?.length || 0})
              </h3>
              {(!selectedTender.bids || selectedTender.bids.length === 0) ? (
                <div className="text-sm font-medium text-gray-500 bg-gray-50 p-6 rounded-2xl border border-gray-200 text-center">
                  Henüz bir eğitmen teklif vermemiş.
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedTender.bids.map((b) => (
                    <div
                      key={b.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        b.id === selectedTender.accepted_bid_id
                          ? "bg-purple-50/60 border-purple-300 shadow-sm"
                          : "bg-white border-gray-200 shadow-sm"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-gray-900 text-base">
                            {b.teacher_name}
                          </span>
                          {b.id === selectedTender.accepted_bid_id && (
                            <span className="px-2.5 py-0.5 bg-purple-600 text-white text-xs font-extrabold rounded-full">
                              ✓ KABUL EDİLEN TEKLİF
                            </span>
                          )}
                          <span className="text-xs text-gray-500 font-mono">
                            IP: {b.client_ip}
                          </span>
                        </div>
                        <div className="text-lg font-extrabold text-emerald-700 font-mono">
                          {b.offered_price} {b.currency}
                        </div>
                      </div>

                      <div className="text-sm text-gray-800 bg-gray-50 p-3.5 rounded-xl border border-gray-200 mb-3 whitespace-pre-wrap font-medium">
                        {b.proposal_letter}
                      </div>

                      <div className="flex items-center justify-between text-xs text-gray-600 font-medium">
                        <div>
                          Tel: <span className="text-gray-900 font-semibold">{b.teacher_phone || "Belirtilmemiş"}</span> | E-posta: <span className="text-gray-900 font-semibold">{b.teacher_email}</span>
                        </div>
                        {b.whatsapp_link && (
                          <a
                            href={b.whatsapp_link}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-sm"
                          >
                            💬 WhatsApp İle Görüş
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Admin Müdahale Butonları */}
            <div className="border-t border-gray-200 pt-4 flex flex-wrap gap-3 justify-end">
              <button
                onClick={() => handleStatusUpdate(selectedTender.id, "OPEN")}
                className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-300 rounded-xl text-xs font-bold transition-colors"
              >
                Açık Yap
              </button>
              <button
                onClick={() => handleStatusUpdate(selectedTender.id, "CANCELLED")}
                className="px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 border border-red-300 rounded-xl text-xs font-bold transition-colors"
              >
                Talebi İptal Et
              </button>
              <button
                onClick={() => setSelectedTender(null)}
                className="px-5 py-2 bg-gray-900 hover:bg-gray-800 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
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
