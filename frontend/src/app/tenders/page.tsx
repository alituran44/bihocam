"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { tendersApi, type TenderItem } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { 
  PlusCircle, 
  Search, 
  Filter, 
  Clock, 
  MapPin, 
  Tag, 
  CheckCircle2, 
  Sparkles, 
  ArrowRight, 
  GraduationCap, 
  Send, 
  X, 
  AlertCircle,
  HelpCircle,
  Users,
  ShieldCheck
} from "lucide-react";

export default function PublicTendersPage() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuthStore();
  const [tenders, setTenders] = useState<TenderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("ALL");
  const [selectedMode, setSelectedMode] = useState<"ALL" | "ONLINE" | "FACE_TO_FACE">("ALL");

  // Teklif Verme Modalı State
  const [biddingTender, setBiddingTender] = useState<TenderItem | null>(null);
  const [offeredPrice, setOfferedPrice] = useState("");
  const [proposalLetter, setProposalLetter] = useState("");
  const [submittingBid, setSubmittingBid] = useState(false);
  const [bidError, setBidError] = useState<string | null>(null);
  const [bidSuccess, setBidSuccess] = useState<string | null>(null);

  const fetchTenders = async () => {
    setLoading(true);
    try {
      const data = await tendersApi.listPublic();
      // Test ve negatif bütçeleri filtrele
      const valid = (data || []).filter(
        (t) => (t.min_budget == null || t.min_budget >= 0) && !t.title?.includes("Denetim")
      );
      setTenders(valid);
    } catch (err) {
      console.error("Talepler yüklenemedi:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTenders();
  }, []);

  const subjects = [
    { label: "Tüm Branşlar", value: "ALL" },
    { label: "Matematik", value: "Matematik" },
    { label: "Fen Bilimleri", value: "Fen" },
    { label: "Fizik", value: "Fizik" },
    { label: "Kimya", value: "Kimya" },
    { label: "Biyoloji", value: "Biyoloji" },
    { label: "Türkçe & Edebiyat", value: "Türkçe" },
    { label: "İngilizce & Yabancı Dil", value: "İngilizce" },
  ];

  const filteredTenders = useMemo(() => {
    return tenders.filter((t) => {
      // Search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = t.title?.toLowerCase().includes(q);
        const matchesSubject = t.subject?.toLowerCase().includes(q);
        const matchesCity = t.city?.toLowerCase().includes(q);
        const matchesDesc = t.description?.toLowerCase().includes(q);
        if (!matchesTitle && !matchesSubject && !matchesCity && !matchesDesc) return false;
      }
      // Subject
      if (selectedSubject !== "ALL") {
        if (!t.subject?.toLowerCase().includes(selectedSubject.toLowerCase())) return false;
      }
      // Mode
      if (selectedMode !== "ALL") {
        if (t.mode !== selectedMode) return false;
      }
      return true;
    });
  }, [tenders, searchQuery, selectedSubject, selectedMode]);

  const handleOpenBid = (tender: TenderItem) => {
    if (!isAuthenticated) {
      router.push(`/login?redirect=/tenders`);
      return;
    }
    if (user?.role !== "teacher" && user?.role !== "admin") {
      alert("Özel ders taleplerine yalnızca onaylı eğitmen hesapları teklif verebilir. Eğitmen olmak için eğitmen başvurusu yapabilirsiniz.");
      return;
    }
    setBiddingTender(tender);
    setOfferedPrice(tender.max_budget?.toString() || tender.min_budget?.toString() || "700");
    setProposalLetter("");
    setBidError(null);
    setBidSuccess(null);
  };

  const handleBidSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!biddingTender) return;
    setBidError(null);

    const price = parseFloat(offeredPrice);
    if (isNaN(price) || price <= 0) {
      setBidError("Lütfen geçerli bir saatlik teklif ücreti giriniz.");
      return;
    }

    if (!proposalLetter.trim() || proposalLetter.length < 15) {
      setBidError("Lütfen öğrenciye yönelik ders planınızı ve tecrübenizi en az 15 karakterle açıklayınız.");
      return;
    }

    setSubmittingBid(true);
    try {
      await tendersApi.submitBid(biddingTender.id, {
        offered_price: price,
        proposal_letter: proposalLetter.trim(),
      });
      setBidSuccess("Teklifiniz öğrenciye başarıyla iletildi!");
      setTimeout(() => {
        setBiddingTender(null);
        fetchTenders();
      }, 1800);
    } catch (err: any) {
      const msg = err.response?.data?.detail || "Teklif gönderilirken bir hata oluştu.";
      setBidError(msg);
    } finally {
      setSubmittingBid(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ── TOP HERO BANNER ── */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-8 sm:p-12 shadow-sm relative overflow-hidden mb-10">
            {/* Subtle background glow */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-100/30 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
              <div className="max-w-2xl space-y-4">
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>CANLI ÖZEL DERS TALEPLERİ & TEKLİF MASASI</span>
                </div>

                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
                  İhtiyacınıza Uygun Öğretmeni{" "}
                  <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent">
                    Siz Seçin
                  </span>
                </h1>

                <p className="text-base sm:text-lg text-slate-600 leading-relaxed">
                  Öğrencilerin güncel özel ders taleplerini inceleyin. Branş öğretmeniyseniz anında teklif verin; ders arayan öğrenciyseniz 60 saniyede ücretsiz talep oluşturun.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3.5 flex-shrink-0">
                <Link
                  href="/tenders/new"
                  className="inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 hover:-translate-y-0.5 transition-all duration-200"
                >
                  <PlusCircle className="w-5 h-5" />
                  <span>Yeni Ders Talebi Aç</span>
                </Link>

                {user?.role === "student" && (
                  <Link
                    href="/dashboard/student/tenders"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    <span>Taleplerimi Yönet</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}

                {user?.role === "teacher" && (
                  <Link
                    href="/dashboard/teacher/tenders"
                    className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs border border-emerald-200/80 transition-colors"
                  >
                    <span>Verdiğim Teklifler Paneli</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                )}
              </div>
            </div>
          </div>

          {/* ── FILTER & SEARCH BAR ── */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-4 sm:p-5 shadow-sm space-y-4 mb-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Search input */}
              <div className="relative flex-1 w-full">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Ders, konu, şehir veya anahtar kelime ile ara..."
                  className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Format selection */}
              <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full md:w-auto flex-shrink-0">
                <button
                  onClick={() => setSelectedMode("ALL")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedMode === "ALL"
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Tüm Formatlar
                </button>
                <button
                  onClick={() => setSelectedMode("ONLINE")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedMode === "ONLINE"
                      ? "bg-white text-emerald-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Online Canlı
                </button>
                <button
                  onClick={() => setSelectedMode("FACE_TO_FACE")}
                  className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all ${
                    selectedMode === "FACE_TO_FACE"
                      ? "bg-white text-indigo-700 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  Yüz Yüze
                </button>
              </div>
            </div>

            {/* Subject pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
              <span className="text-slate-400 font-medium flex items-center gap-1 flex-shrink-0 mr-1">
                <Filter className="w-3.5 h-3.5" /> Branş:
              </span>
              {subjects.map((sub) => (
                <button
                  key={sub.value}
                  onClick={() => setSelectedSubject(sub.value)}
                  className={`px-3 py-1.5 rounded-full font-medium whitespace-nowrap transition-all ${
                    selectedSubject === sub.value
                      ? "bg-emerald-600 text-white shadow-sm"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  {sub.label}
                </button>
              ))}
            </div>
          </div>

          {/* ── TENDERS GRID ── */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-slate-200 bg-white p-6 animate-pulse space-y-4 shadow-sm"
                >
                  <div className="h-5 bg-slate-200 rounded w-1/3" />
                  <div className="h-6 bg-slate-200 rounded w-4/5" />
                  <div className="h-16 bg-slate-100 rounded" />
                  <div className="h-10 bg-slate-200 rounded" />
                </div>
              ))}
            </div>
          ) : filteredTenders.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center space-y-4 max-w-xl mx-auto shadow-sm">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
                <Search className="w-8 h-8" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">Aradığınız kriterde talep bulunamadı</h3>
              <p className="text-sm text-slate-500 leading-relaxed">
                Filtreleri temizleyebilir veya hemen ihtiyacınıza özel yeni bir ders talebi oluşturabilirsiniz.
              </p>
              <div className="pt-2 flex justify-center gap-3">
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedSubject("ALL");
                    setSelectedMode("ALL");
                  }}
                  className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
                >
                  Filtreleri Sıfırla
                </button>
                <Link
                  href="/tenders/new"
                  className="px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition-colors"
                >
                  Yeni Talep Oluştur
                </Link>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTenders.map((tender) => (
                <div
                  key={tender.id}
                  className="rounded-3xl border border-slate-200/90 bg-white p-6 flex flex-col justify-between shadow-sm hover:shadow-xl hover:border-emerald-500/40 transition-all duration-300 group"
                >
                  <div>
                    {/* Top Row: Subject & Mode Badge */}
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/80">
                        <Tag className="w-3 h-3 text-emerald-600" />
                        {tender.subject || "Genel"}
                      </span>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          tender.mode === "FACE_TO_FACE"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : "bg-teal-50 text-teal-700 border-teal-200"
                        }`}
                      >
                        {tender.mode === "FACE_TO_FACE" ? "Yüz Yüze" : "Online Canlı"}
                      </span>
                    </div>

                    {/* Title */}
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-emerald-700 transition-colors line-clamp-2 mb-2">
                      {tender.title}
                    </h3>

                    {/* Description */}
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed line-clamp-3 mb-4">
                      {tender.description}
                    </p>

                    {/* Meta info tags */}
                    <div className="space-y-2 py-3 border-y border-slate-100 text-xs text-slate-500 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          <span>{tender.target_date_info || "Hemen Başlasın"}</span>
                        </span>
                        {tender.city && (
                          <span className="flex items-center gap-1.5 text-slate-600">
                            <MapPin className="w-3.5 h-3.5 text-slate-400" />
                            <span>
                              {tender.city} {tender.district ? `(${tender.district})` : ""}
                            </span>
                          </span>
                        )}
                      </div>

                      <div className="flex items-center justify-between pt-1">
                        <span className="text-slate-400">Teklif Sayısı:</span>
                        <span className="inline-flex items-center gap-1 text-slate-700 font-semibold">
                          <Users className="w-3.5 h-3.5 text-emerald-600" />
                          {tender.bids_count ?? 0} Teklif
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Bottom: Budget & Bid Action */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xs text-slate-400 font-medium">Bütçe Aralığı:</span>
                      <span className="text-base font-black text-emerald-700 font-mono">
                        {tender.min_budget && tender.max_budget
                          ? `₺${tender.min_budget} - ₺${tender.max_budget}`
                          : tender.min_budget
                          ? `₺${tender.min_budget}+`
                          : tender.max_budget
                          ? `₺${tender.max_budget}`
                          : "Belirtilmedi"}
                        <span className="text-xs text-slate-400 font-normal font-sans ml-1">/ saat</span>
                      </span>
                    </div>

                    <button
                      onClick={() => handleOpenBid(tender)}
                      className="w-full py-3 px-4 rounded-xl bg-slate-900 hover:bg-emerald-600 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all duration-200 shadow-sm"
                    >
                      <GraduationCap className="w-4 h-4" />
                      <span>{isAuthenticated && user?.role === "teacher" ? "Hemen Teklif Ver" : "Teklif Ver / Başvur"}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ── TRUST & PROCESS SECTION ── */}
          <div className="mt-20 rounded-3xl bg-white border border-slate-200/80 p-8 md:p-12 shadow-sm">
            <div className="max-w-3xl mx-auto text-center mb-12 space-y-3">
              <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">GÜVENLİ VE ŞEFFAF SÜREÇ</span>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900">Özel Ders Talep Sistemi Nasıl Çalışır?</h2>
              <p className="text-sm sm:text-base text-slate-600">
                Hem öğrenciler hem de öğretmenler için tamamen şeffaf, güvenli ve kolay adımlar.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-lg mx-auto md:mx-0">
                  1
                </div>
                <h3 className="text-base font-bold text-slate-900">1. Talebinizi Ücretsiz Açın</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  İhtiyacınız olan dersi, konuyu, hedeflediğiniz sınavı ve saatlik bütçenizi 60 saniyede form üzerinden belirtin.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center font-bold text-lg mx-auto md:mx-0">
                  2
                </div>
                <h3 className="text-base font-bold text-slate-900">2. Uzman Tekliflerini İnceleyin</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Doğrulanmış branş öğretmenleri tekliflerini ve çalışma planlarını sunsun. Öğretmen profillerini, puanlarını ve yorumlarını kıyaslayın.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3 text-center md:text-left">
                <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg mx-auto md:mx-0">
                  3
                </div>
                <h3 className="text-base font-bold text-slate-900">3. Güvenle Derse Başlayın</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  En uygun teklifi kabul edin, BiHocam havuz hesabı güvencesiyle canlı derse hemen başlayın. Memnuniyet garantilidir.
                </p>
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* ── TEACHER BID MODAL ── */}
      {biddingTender && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl border border-slate-200 max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Close button */}
            <button
              onClick={() => setBiddingTender(null)}
              className="absolute right-5 top-5 p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
                <Send className="w-3.5 h-3.5 text-emerald-600" />
                <span>Öğrenciye Teklif Gönder</span>
              </div>
              <h2 className="text-xl font-black text-slate-900">
                {biddingTender.title}
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                {biddingTender.subject} • {biddingTender.mode === "FACE_TO_FACE" ? "Yüz Yüze" : "Online Canlı"} • Bütçe: {biddingTender.min_budget} - {biddingTender.max_budget} TL
              </p>
            </div>

            {bidSuccess ? (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="font-bold text-sm">{bidSuccess}</p>
                <p className="text-xs text-emerald-600">Öğrenci teklifinizi inceleyip kabul ettiğinde bilgilendirileceksiniz.</p>
              </div>
            ) : (
              <form onSubmit={handleBidSubmit} className="space-y-4">
                {bidError && (
                  <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{bidError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Saatlik Ders Ücreti Teklifiniz (TL) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                    <input
                      type="number"
                      required
                      min="100"
                      step="50"
                      value={offeredPrice}
                      onChange={(e) => setOfferedPrice(e.target.value)}
                      placeholder="Örn: 750"
                      className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Öğrencinin belirttiği bütçe: ₺{biddingTender.min_budget} - ₺{biddingTender.max_budget}
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Teklif Ön Yazınız & Çalışma Planınız *
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={proposalLetter}
                    onChange={(e) => setProposalLetter(e.target.value)}
                    placeholder="Öğrenciye kendinizi tanıtın, branş tecrübenizi, dersi nasıl işleyeceğinizi ve kaynak önerilerinizi paylaşın..."
                    className="w-full p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Minimum 15 karakter. İletişim bilgisi paylaşmak platform kuralları gereği yasaktır.
                  </p>
                </div>

                <div className="pt-2 flex gap-3">
                  <button
                    type="button"
                    onClick={() => setBiddingTender(null)}
                    className="flex-1 py-3 px-4 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={submittingBid}
                    className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{submittingBid ? "Gönderiliyor..." : "Teklifi Gönder"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}
