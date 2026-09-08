"use client";

import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  adminGibApi,
  type GibAuditLogItem,
  type GibAuditSummary,
} from "@/lib/api";

export default function GibReportsPage() {
  const currentYear = new Date().getFullYear();
  const currentMonth = new Date().getMonth() + 1;

  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number | undefined>(currentMonth);
  const [serviceType, setServiceType] = useState<string>("");
  const [isCompliant, setIsCompliant] = useState<boolean | undefined>(undefined);
  const [search, setSearch] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  const [logs, setLogs] = useState<GibAuditLogItem[]>([]);
  const [summary, setSummary] = useState<GibAuditSummary | null>(null);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [selectedLog, setSelectedLog] = useState<GibAuditLogItem | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);
    return () => clearTimeout(handler);
  }, [search]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const res = await adminGibApi.getLogs({
        year: year || undefined,
        month: month || undefined,
        service_type: serviceType || undefined,
        is_compliant: isCompliant,
        search: debouncedSearch || undefined,
        limit: 100,
      });
      setLogs(res.logs || []);
      setSummary(res.summary || null);
      setTotalCount(res.total || 0);
    } catch (err: any) {
      console.error("GIB loglari alinamadi:", err);
      toast.error(err.response?.data?.detail || "GİB denetim logları yüklenirken hata oluştu.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [year, month, serviceType, isCompliant, debouncedSearch]);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      const res = await adminGibApi.triggerSync();
      toast.success(res.message || "GİB logları başarıyla senkronize edildi.");
      fetchLogs();
    } catch (err: any) {
      toast.error(err.response?.data?.detail || "Senkronizasyon sırasında hata oluştu.");
    } finally {
      setIsSyncing(false);
    }
  };

  const handleExportCsv = () => {
    const url = adminGibApi.downloadCsvUrl({
      year: year || undefined,
      month: month || undefined,
      service_type: serviceType || undefined,
      is_compliant: isCompliant,
    });
    window.open(url, "_blank");
  };

  const handleExportXml = () => {
    const url = adminGibApi.downloadXmlUrl({
      year: year || undefined,
      month: month || undefined,
      service_type: serviceType || undefined,
      is_compliant: isCompliant,
    });
    window.open(url, "_blank");
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* 1. ÜST BAŞLIK VE HAREKET BUTONLARI */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-200 dark:border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-900">
              VUK 538 & 595 Resmî Bildirim Masası
            </span>
            <span className="text-xs text-gray-500 dark:text-zinc-400">
              Mükerrer Madde 257 Denetim Günlüğü
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 dark:text-zinc-100">
            GİB & BTRANS İlan, Canlı Ders ve Kurs Denetim Masası
          </h1>
          <p className="text-sm text-gray-600 dark:text-zinc-400 mt-1">
            İnternet ortamında açılan canlı ders ilanları, video kurslar ve eğitim satışlarının Gelir İdaresi Başkanlığı'na aylık bildirim arşivi.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleSync}
            disabled={isSyncing}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-200 hover:bg-gray-50 dark:hover:bg-zinc-700 transition shadow-sm disabled:opacity-50"
          >
            <svg className={`w-4 h-4 ${isSyncing ? "animate-spin" : ""}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            {isSyncing ? "Taranıyor..." : "Verileri Tara & Senkronize Et"}
          </button>

          <button
            onClick={handleExportCsv}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Resmi CSV (Excel) İndir
          </button>

          <button
            onClick={handleExportXml}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium bg-indigo-600 hover:bg-indigo-700 text-white transition shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            BTRANS XML İndir
          </button>
        </div>
      </div>

      {/* 2. MEVZUAT BİLGİLENDİRME KUTUSU */}
      <div className="bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 rounded-2xl p-5 text-amber-900 dark:text-amber-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0 mt-0.5">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-xs sm:text-sm leading-relaxed">
            <strong className="font-semibold block text-amber-950 dark:text-amber-100">
              Yasal Bildirim Takvimi & Aracı Hizmet Sağlayıcı Sorumluluğu:
            </strong>
            Her takvim ayına ait kurs açılışları, canlı ders rezervasyonları ve satışlar, takip eden ayın son günü saat 23:59'a kadar Gelir İdaresi BTRANS sistemine iletilmelidir. Mükellef TCKN/VKN ve 5651 logları (IP, Port, Zaman Damgası) yasal zorunluluktur.
          </div>
        </div>

        {summary && summary.non_compliant_count > 0 && (
          <div className="shrink-0">
            <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-red-600 text-white flex items-center gap-1.5 shadow-sm">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              {summary.non_compliant_count} Kayıtta Vergi Bilgisi Eksik!
            </span>
          </div>
        )}
      </div>

      {/* 3. 4 OBSIDIAN KPI KARTI */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Kart 1: Toplam Kayıt */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Bildirilecek İşlem / İlan
            </span>
            <span className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
              {summary?.total_items || 0}
            </span>
            <span className="text-xs text-gray-500 dark:text-zinc-400 ml-2">Adet Kayıt</span>
          </div>
        </div>

        {/* Kart 2: Toplam Brüt Ciro */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Toplam Brüt Hacim
            </span>
            <span className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100">
              {formatCurrency(summary?.total_gross_amount || 0)}
            </span>
            <span className="block text-xs text-gray-500 dark:text-zinc-400 mt-1">GİB Bildirim Matrahı</span>
          </div>
        </div>

        {/* Kart 3: Platform Komisyonu */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              Platform Aracı Payı
            </span>
            <span className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </span>
          </div>
          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-zinc-100">
              {formatCurrency(summary?.total_commission_amount || 0)}
            </span>
            <span className="block text-xs text-gray-500 dark:text-zinc-400 mt-1">BiHocam Komisyon Geliri</span>
          </div>
        </div>

        {/* Kart 4: Uyum Oranı & Ceza Riski */}
        <div className="p-6 rounded-2xl bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
              GİB Uyum Durumu
            </span>
            <span className={`w-8 h-8 rounded-lg flex items-center justify-center ${
              (summary?.non_compliant_count || 0) === 0
                ? "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400"
                : "bg-red-50 dark:bg-red-950/50 text-red-600 dark:text-red-400"
            }`}>
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </span>
          </div>
          <div className="mt-4 flex items-baseline justify-between">
            <div>
              <span className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
                %{summary?.compliance_rate_percent || 0}
              </span>
              <span className="block text-xs text-gray-500 dark:text-zinc-400 mt-1">
                {summary?.compliant_count || 0} Hazır / {summary?.non_compliant_count || 0} Eksik
              </span>
            </div>
            {summary && summary.non_compliant_count > 0 && (
              <span className="px-2 py-1 text-[10px] font-bold uppercase rounded bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300">
                Eksik Var
              </span>
            )}
          </div>
        </div>
      </div>

      {/* 4. FİLTRE & ARAMA ÇUBUĞU */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
          {/* Yıl Seçici */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
              Bildirim Yılı
            </label>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              {[2024, 2025, 2026, 2027].map((y) => (
                <option key={y} value={y}>
                  {y} Yılı
                </option>
              ))}
            </select>
          </div>

          {/* Ay Seçici */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
              Bildirim Dönemi (Ay)
            </label>
            <select
              value={month || ""}
              onChange={(e) => setMonth(e.target.value ? Number(e.target.value) : undefined)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Tüm Aylar</option>
              {[
                "1 - Ocak", "2 - Şubat", "3 - Mart", "4 - Nisan",
                "5 - Mayıs", "6 - Haziran", "7 - Temmuz", "8 - Ağustos",
                "9 - Eylül", "10 - Ekim", "11 - Kasım", "12 - Aralık"
              ].map((m, idx) => (
                <option key={idx + 1} value={idx + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>

          {/* Hizmet Türü Filtresi */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
              Hizmet / İlan Türü
            </label>
            <select
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Tüm Hizmetler</option>
              <option value="LIVE_CLASS">Canlı Dersler</option>
              <option value="COURSE">Video Kurslar</option>
              <option value="EDUCATION_PROGRAM">Eğitim Programları</option>
            </select>
          </div>

          {/* Uyum Durumu Filtresi */}
          <div>
            <label className="text-xs font-semibold text-gray-500 dark:text-zinc-400 uppercase tracking-wider block mb-1.5">
              GİB Uyum Filtresi
            </label>
            <select
              value={isCompliant === undefined ? "" : String(isCompliant)}
              onChange={(e) => {
                if (e.target.value === "") setIsCompliant(undefined);
                else setIsCompliant(e.target.value === "true");
              }}
              className="w-full px-3 py-2 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:ring-2 focus:ring-indigo-500 outline-none"
            >
              <option value="">Tüm Kayıtlar</option>
              <option value="true">✅ Sadece Bildirime Hazırlar</option>
              <option value="false">⚠️ Eksik Bilgisi Olanlar</option>
            </select>
          </div>
        </div>

        {/* Canlı Arama Inputu */}
        <div className="relative">
          <input
            type="text"
            placeholder="Eğitmen adı, TCKN/VKN, Sipariş/İlan no veya IP adresi ile filtrele..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 placeholder-gray-400 dark:placeholder-zinc-500 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <svg
            className="w-4 h-4 text-gray-400 dark:text-zinc-500 absolute left-3.5 top-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* 5. GİB DENETİM LOGLARI TABLOSU */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">
              Resmî Denetim Günlüğü ({totalCount} Kayıt)
            </h2>
            <p className="text-xs text-gray-500 dark:text-zinc-400">
              5651 Sayılı Kanun ve 538 Sıra No.lu VUK Genel Tebliği uyarınca tutulan zaman damgalı iz kayıtları.
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="py-20 text-center text-sm text-gray-500 dark:text-zinc-400">
            <svg className="w-8 h-8 animate-spin mx-auto text-indigo-600 mb-3" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
            </svg>
            Denetim kayıtları taranıyor...
          </div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-500 dark:text-zinc-400">
            Seçilen dönem ve filtre kriterlerine uygun kayıt bulunamadı.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-zinc-800 bg-gray-50/50 dark:bg-zinc-800/40 text-gray-500 dark:text-zinc-400 text-[11px] uppercase tracking-wider font-semibold">
                  <th className="py-3 px-4">Ref No & Tür</th>
                  <th className="py-3 px-4">Hizmet / Ders Başlığı</th>
                  <th className="py-3 px-4">Mükellef (Eğitmen)</th>
                  <th className="py-3 px-4">Mali Bilgiler</th>
                  <th className="py-3 px-4">5651 Teknik İz (IP:Port)</th>
                  <th className="py-3 px-4">BTRANS Durumu</th>
                  <th className="py-3 px-4 text-right">İncele</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-zinc-800/60">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-gray-50/70 dark:hover:bg-zinc-800/30 transition cursor-pointer"
                    onClick={() => setSelectedLog(log)}
                  >
                    {/* Ref No & Tür */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-mono font-bold text-gray-900 dark:text-zinc-100">
                        {log.item_reference_no}
                      </div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                          log.service_type === "LIVE_CLASS"
                            ? "bg-purple-100 text-purple-700 dark:bg-purple-950 dark:text-purple-300"
                            : log.service_type === "EDUCATION_PROGRAM"
                            ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                            : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300"
                        }`}>
                          {log.service_type === "LIVE_CLASS" ? "Canlı Ders" : log.service_type === "EDUCATION_PROGRAM" ? "Eğitim Programı" : "Video Kurs"}
                        </span>
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                          {log.action}
                        </span>
                      </div>
                    </td>

                    {/* Başlık & Kategori */}
                    <td className="py-3.5 px-4 max-w-xs">
                      <div className="font-medium text-gray-900 dark:text-zinc-100 truncate" title={log.item_title}>
                        {log.item_title}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                        {log.item_category || "Eğitim"}
                      </div>
                    </td>

                    {/* Mükellef Bilgileri */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-zinc-100">
                        {log.teacher_name}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        {log.teacher_tc_vkn ? (
                          <span className="font-mono text-[11px] text-gray-600 dark:text-zinc-300 bg-gray-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">
                            {log.teacher_tc_vkn}
                          </span>
                        ) : (
                          <span className="text-[10px] text-red-600 dark:text-red-400 font-bold">
                            TCKN/VKN Yok
                          </span>
                        )}
                        <span className="text-[10px] text-gray-400 dark:text-zinc-500">
                          {log.teacher_city || "Şehir Belirtilmemiş"}
                        </span>
                      </div>
                    </td>

                    {/* Mali Bilgiler */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <div className="font-semibold text-gray-900 dark:text-zinc-100">
                        {formatCurrency(log.gross_amount)}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-zinc-400 mt-0.5">
                        Komisyon: {formatCurrency(log.commission_amount)} (%{Math.round(log.commission_rate * 100)})
                      </div>
                    </td>

                    {/* 5651 Teknik İz */}
                    <td className="py-3.5 px-4 whitespace-nowrap font-mono text-xs">
                      <div className="text-gray-800 dark:text-zinc-200">
                        {log.client_ip}:{log.client_port || 443}
                      </div>
                      <div className="text-[10px] text-gray-400 dark:text-zinc-500 font-sans mt-0.5">
                        {log.created_at}
                      </div>
                    </td>

                    {/* BTRANS Uyum Durumu */}
                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {log.is_compliant ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Bildirime Hazır
                        </span>
                      ) : (
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-300 border border-red-200 dark:border-red-800">
                            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                            Bilgi Eksik
                          </span>
                          <div className="text-[10px] text-red-600 dark:text-red-400 max-w-[150px] truncate" title={log.missing_fields.join(", ")}>
                            {log.missing_fields.join(", ")}
                          </div>
                        </div>
                      )}
                    </td>

                    {/* Aksiyon */}
                    <td className="py-3.5 px-4 text-right whitespace-nowrap">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedLog(log);
                        }}
                        className="px-2.5 py-1 rounded-lg text-xs font-medium bg-gray-100 hover:bg-gray-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-gray-700 dark:text-zinc-200 transition"
                      >
                        Detay
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 6. DETAYLI 5651 & VUK KANUNİ İZ İNCELEME MODALI */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-gray-200 dark:border-zinc-800 pb-4">
              <div>
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  GİB BTRANS Resmi Kayıt İnceleme
                </span>
                <h3 className="text-lg font-bold text-gray-900 dark:text-zinc-100">
                  {selectedLog.item_reference_no} — {selectedLog.item_title}
                </h3>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-zinc-800 text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-700 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
              <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl space-y-2">
                <span className="font-bold text-gray-900 dark:text-zinc-100 block border-b pb-1 dark:border-zinc-700">
                  👤 Mükellef (Hizmet Sağlayıcı)
                </span>
                <div><span className="text-gray-500">Ad Soyad / Unvan:</span> <strong>{selectedLog.teacher_name}</strong></div>
                <div><span className="text-gray-500">TCKN / VKN:</span> <strong>{selectedLog.teacher_tc_vkn || "Eksik (-)"}</strong></div>
                <div><span className="text-gray-500">Vergi Dairesi:</span> <strong>{selectedLog.teacher_tax_office || "-"}</strong></div>
                <div><span className="text-gray-500">Şehir / İlçe:</span> <strong>{selectedLog.teacher_city || "-"} / {selectedLog.teacher_district || "-"}</strong></div>
                <div><span className="text-gray-500">Yasal Adres:</span> <span className="text-gray-800 dark:text-zinc-200">{selectedLog.teacher_address || "-"}</span></div>
                <div><span className="text-gray-500">Ödeme IBAN:</span> <span className="font-mono text-xs">{selectedLog.teacher_iban || "-"}</span></div>
              </div>

              <div className="bg-gray-50 dark:bg-zinc-800/50 p-4 rounded-xl space-y-2">
                <span className="font-bold text-gray-900 dark:text-zinc-100 block border-b pb-1 dark:border-zinc-700">
                  💰 Mali & Hakediş Bilgileri
                </span>
                <div><span className="text-gray-500">Brüt Bedel:</span> <strong>{formatCurrency(selectedLog.gross_amount)}</strong></div>
                <div><span className="text-gray-500">Komisyon Oranı:</span> <strong>%{Math.round(selectedLog.commission_rate * 100)}</strong></div>
                <div><span className="text-gray-500">BiHocam Komisyon:</span> <strong>{formatCurrency(selectedLog.commission_amount)}</strong></div>
                <div><span className="text-gray-500">Eğitici Net Hakediş:</span> <strong>{formatCurrency(selectedLog.teacher_net_earnings)}</strong></div>
                <div><span className="text-gray-500">Ödeme Referans:</span> <span className="font-mono text-xs">{selectedLog.payment_gateway_ref || "-"}</span></div>
                <div><span className="text-gray-500">Alıcı Öğrenci:</span> <strong>{selectedLog.buyer_name || "İlan Aşamasında"}</strong></div>
              </div>
            </div>

            <div className="bg-gray-900 text-gray-100 p-4 rounded-xl space-y-2 font-mono text-xs">
              <div className="text-indigo-400 font-bold border-b border-gray-800 pb-1 font-sans">
                🛡️ 5651 & VUK 257 Teknik İz Kayıtları (Silinemez Kanuni Delil)
              </div>
              <div>İstemci Gerçek IP : {selectedLog.client_ip}</div>
              <div>İstemci Portu      : {selectedLog.client_port || 443}</div>
              <div>İşlem Zamanı       : {selectedLog.created_at}</div>
              <div>User-Agent         : {selectedLog.user_agent || "System"}</div>
              <div>Web URL Bağlantısı : {selectedLog.item_url || "-"}</div>
            </div>

            {selectedLog.missing_fields && selectedLog.missing_fields.length > 0 && (
              <div className="bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 rounded-xl p-4 text-red-900 dark:text-red-200 text-xs">
                <strong className="block mb-1 font-bold">⚠️ Eksik Bilgiler (GİB BTRANS Gönderim Öncesi Giderilmeli):</strong>
                <ul className="list-disc pl-5 space-y-0.5">
                  {selectedLog.missing_fields.map((field, i) => (
                    <li key={i}>{field}</li>
                  ))}
                </ul>
              </div>
            )}

            <div className="flex justify-end">
              <button
                onClick={() => setSelectedLog(null)}
                className="px-5 py-2 rounded-xl text-sm font-medium bg-gray-900 dark:bg-zinc-100 text-white dark:text-zinc-900 hover:opacity-90 transition"
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
