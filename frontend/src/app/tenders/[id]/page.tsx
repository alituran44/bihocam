"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { tendersApi, type TenderItem } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import {
  Clock,
  MapPin,
  Tag,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
  ArrowLeft,
  Send,
  AlertCircle
} from "lucide-react";

export default function TenderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const tenderId = params?.id as string;

  const [tender, setTender] = useState<TenderItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Proposal modal state
  const [biddingModalOpen, setBiddingModalOpen] = useState(false);
  const [offeredPrice, setOfferedPrice] = useState("");
  const [proposalLetter, setProposalLetter] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!tenderId) return;

    const fetchDetail = async () => {
      setLoading(true);
      try {
        // Try public tenders list first or direct getDetail
        const publicList = await tendersApi.listPublic();
        const found = publicList.find((t) => t.id === tenderId);
        if (found) {
          setTender(found);
        } else {
          const direct = await tendersApi.getDetail(tenderId);
          setTender(direct);
        }
      } catch (err: any) {
        console.error("Tender fetch error:", err);
        setError("Talep detayları yüklenemedi veya bu talep artık yayında değil.");
      } finally {
        setLoading(false);
      }
    };

    fetchDetail();
  }, [tenderId]);

  const handleSubmitBid = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated) {
      router.push(`/login?redirect=/tenders/${tenderId}`);
      return;
    }
    if (user?.role !== "teacher") {
      setBidError("Yalnızca onaylı eğitmen hesapları ders taleplerine teklif verebilir.");
      return;
    }
    if (!offeredPrice || Number(offeredPrice) <= 0) {
      setBidError("Lütfen geçerli bir saatlik ders ücreti teklifi girin.");
      return;
    }

    setSubmittingBid(true);
    setBidError(null);
    setBidSuccess(null);

    try {
      await tendersApi.submitBid(tenderId, {
        offered_price: Number(offeredPrice),
        proposal_letter: proposalLetter.trim() || "Özel ders talebiniz için teklifimi iletiyorum.",
      });
      setBidSuccess("Teklifiniz öğrenciye başarıyla iletildi! Öğrenci teklifinizi kabul ettiğinde bildirim alacaksınız.");
      setOfferedPrice("");
      setProposalLetter("");
      setTimeout(() => setBiddingModalOpen(false), 2500);
    } catch (err: any) {
      setBidError(err?.response?.data?.detail || "Teklif iletilirken bir hata oluştu.");
    } finally {
      setSubmittingBid(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <Header />

      <main id="main-content" className="flex-1 pt-32 pb-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Back link */}
          <Link
            href="/tenders"
            className="inline-flex items-center gap-2 text-xs font-bold text-slate-600 hover:text-emerald-700 transition-colors mb-6"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Tüm Özel Ders Taleplerine Dön</span>
          </Link>

          {loading ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
              <span className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin inline-block mb-4" />
              <p className="text-sm font-semibold text-slate-600">Ders talebi detayları yükleniyor...</p>
            </div>
          ) : error || !tender ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-4">
              <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
              <h2 className="text-xl font-bold text-slate-900">Talep Bulunamadı</h2>
              <p className="text-sm text-slate-600 max-w-md mx-auto">{error || "Talep yayından kaldırılmış olabilir."}</p>
              <Link
                href="/tenders"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-emerald-600 text-white font-bold text-sm shadow-md"
              >
                <span>Aktif Talepleri İncele</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Main Card */}
              <div className="bg-white rounded-3xl p-8 sm:p-10 border border-slate-200 shadow-sm relative overflow-hidden">
                <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
                      {tender.subject}
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-slate-100 text-slate-700 border border-slate-200 text-xs font-medium flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {tender.mode === "ONLINE" ? "Online Canlı Ders" : tender.city || "Yüz Yüze"}
                    </span>
                  </div>

                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Aktif Ders Talebi
                  </span>
                </div>

                <div className="py-6 space-y-4">
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight">
                    {tender.title}
                  </h1>

                  <div className="bg-slate-50 rounded-2xl p-5 border border-slate-200/80">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Öğrenci Notu / Açıklama</h3>
                    <p className="text-sm text-slate-700 leading-relaxed">
                      {tender.description || "Öğrenci bu talep için ek detay belirtmedi. Branş ve hedefe yönelik teklifler bekleniyor."}
                    </p>
                  </div>
                </div>

                {/* Budget & Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-6 border-t border-slate-100">
                  <div className="p-4 rounded-2xl bg-emerald-50/50 border border-emerald-200/80">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Saatlik Bütçe Aralığı</span>
                    <div className="text-xl font-black text-emerald-800 font-mono mt-1">
                      {tender.min_budget && tender.max_budget
                        ? `₺${Math.abs(tender.min_budget)} - ₺${Math.abs(tender.max_budget)}`
                        : tender.max_budget
                        ? `₺${Math.abs(tender.max_budget)}`
                        : "Görüşülecek"}{" "}
                      <span className="text-xs font-normal text-slate-500">/ saatlik</span>
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Teklif Durumu</span>
                    <div className="text-lg font-black text-slate-900 mt-1">
                      {tender.bids_count ? `${tender.bids_count} Eğitmen Teklif Verdi` : "İlk Teklifi Sen Ver"}
                    </div>
                  </div>

                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Yayın Tarihi</span>
                    <div className="text-sm font-bold text-slate-700 mt-1 flex items-center gap-1.5">
                      <Clock className="w-4 h-4 text-slate-400" />
                      <span>{new Date(tender.created_at).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>
                </div>

                {/* Action CTA */}
                <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <p className="text-xs text-slate-500 text-center sm:text-left">
                    Bu talep için alanında uzman onaylı eğitmenler teklif sunabilir.
                  </p>

                  <button
                    type="button"
                    onClick={() => setBiddingModalOpen(true)}
                    className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:-translate-y-0.5 transition-all flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <GraduationCap className="w-4 h-4" />
                    <span>Bu Talebe Teklif Ver</span>
                  </button>
                </div>
              </div>

              {/* Trust Box */}
              <div className="bg-emerald-50/50 border border-emerald-200 rounded-3xl p-6 flex items-start gap-4">
                <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
                <div className="text-xs text-slate-700 space-y-1">
                  <p className="font-bold text-slate-900 text-sm">BiHocam Güvenli Teklif Süreci</p>
                  <p>
                    Öğrenci teklifinizi kabul ettiğinde ders saatiniz planlanır ve ödeme havuzda güvenceye alınır. İki taraf da canlı ders odasına tarayıcı üzerinden kolayca bağlanır.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal for Submitting Bid */}
        {biddingModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-200 shadow-2xl relative">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Saatlik Ders Teklifi Sun</h3>
              <p className="text-xs text-slate-500 mb-6">
                Öğrencinin talebine uygun saatlik ders ücretinizi ve kısa bir tanıtım mesajınızı iletin.
              </p>

              {bidSuccess ? (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm font-semibold flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{bidSuccess}</span>
                </div>
              ) : (
                <form onSubmit={handleSubmitBid} className="space-y-4">
                  {bidError && (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
                      {bidError}
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Saatlik Ders Ücreti Teklifiniz (TL)
                    </label>
                    <input
                      type="number"
                      required
                      min={100}
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(e.target.value)}
                      placeholder="Örn: 800"
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm font-mono focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Öğrenciye Notunuz / Ders Planınız
                    </label>
                    <textarea
                      rows={4}
                      value={proposalLetter}
                      onChange={(e) => setProposalLetter(e.target.value)}
                      placeholder="Öğrencinin hedefine yönelik nasıl bir yol haritası izleyeceğinizi kısaca özetleyin..."
                      className="w-full px-4 py-3 rounded-xl border border-slate-300 text-sm focus:border-emerald-600 focus:outline-none"
                    />
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => setBiddingModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 transition-colors"
                    >
                      Vazgeç
                    </button>
                    <button
                      type="submit"
                      disabled={submittingBid}
                      className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
                    >
                      {submittingBid ? (
                        <span>İletiliyor...</span>
                      ) : (
                        <>
                          <Send className="w-3.5 h-3.5" />
                          <span>Teklifi İlet</span>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
