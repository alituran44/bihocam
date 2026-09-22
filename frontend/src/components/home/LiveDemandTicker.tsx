"use client";

import React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { tenderApi, Tender } from "@/lib/api";
import { Clock, MapPin, Tag, ArrowRight, ShieldAlert, Sparkles } from "lucide-react";

export default function LiveDemandTicker() {
  const { data: tenders, isLoading } = useQuery<Tender[]>({
    queryKey: ["public-tenders-ticker"],
    queryFn: () => tenderApi.getPublicTenders({ limit: 4 }),
    staleTime: 60 * 1000,
  });

  const fallbackTenders = [
    {
      id: "f1",
      title: "YKS 2026 Matematik Geometri İleri Düzey",
      subject: "Matematik",
      mode: "ONLINE",
      city: "İstanbul",
      min_budget: 1400,
      max_budget: 1800,
      bids_count: 3,
      created_at: new Date().toISOString(),
    },
    {
      id: "f2",
      title: "LGS 8. Sınıf Yeni Nesil Paragraf ve Dil Bilgisi",
      subject: "Türkçe",
      mode: "HYBRID",
      city: "Ankara",
      min_budget: 1200,
      max_budget: 1600,
      bids_count: 2,
      created_at: new Date().toISOString(),
    },
    {
      id: "f3",
      title: "IELTS 7.5 Hedefli Akademik Speaking & Writing",
      subject: "İngilizce",
      mode: "ONLINE",
      city: "İzmir",
      min_budget: 1500,
      max_budget: 2000,
      bids_count: 4,
      created_at: new Date().toISOString(),
    },
  ];

  const validTenders = (tenders || []).filter(
    (t) => (t.min_budget == null || t.min_budget > 0) && !t.title?.includes("Denetim")
  );
  const displayList = validTenders.length > 0 ? validTenders.slice(0, 3) : fallbackTenders;

  return (
    <div className="w-full rounded-3xl border border-slate-200/90 bg-white p-6 md:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
      {/* Background ambient gradient */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />
      
      {/* Header bar */}
      <div className="flex items-center justify-between pb-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600" />
          </span>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight font-display">
            Canlı Özel Ders Talepleri
          </h3>
        </div>
        <Link
          href="/tenders"
          className="group text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1.5 transition-colors bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-full"
        >
          <span>Tümünü Gör</span>
          <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>

      {/* Tenders List */}
      <div className="divide-y divide-slate-100">
        {displayList.map((item) => (
          <Link
            key={item.id}
            href={`/tenders`}
            className="block py-4 group/item hover:bg-slate-50 -mx-4 px-4 rounded-xl transition-all"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="inline-block px-2.5 py-0.5 text-xs font-bold rounded-md bg-emerald-50 text-emerald-800 border border-emerald-200/80">
                    {item.subject}
                  </span>
                  <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" />
                    {item.mode === "ONLINE" ? "Online" : item.city || "Yüz Yüze"}
                  </span>
                </div>
                <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover/item:text-emerald-700 transition-colors line-clamp-1">
                  {item.title}
                </h4>
              </div>

              <div className="flex items-center justify-between sm:justify-end gap-4 flex-shrink-0">
                <div className="text-left sm:text-right">
                  <div className="text-sm font-mono font-bold text-emerald-700">
                    {item.min_budget && item.max_budget 
                      ? `₺${Math.abs(item.min_budget)} - ₺${Math.abs(item.max_budget)}` 
                      : (item.max_budget ? `₺${Math.abs(item.max_budget)}` : "Görüşülecek")}
                  </div>
                  <div className="text-xs text-slate-500 font-medium">
                    {item.bids_count ? `${item.bids_count} Teklif Alındı` : "Yeni İlan"}
                  </div>
                </div>

                <span className="hidden sm:inline-flex items-center justify-center w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 text-slate-600 group-hover/item:bg-emerald-600 group-hover/item:text-white group-hover/item:border-emerald-600 transition-all">
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      {/* Footer CTA */}
      <div className="mt-4 pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="text-xs text-slate-500 text-center sm:text-left">
          Hangi konuda desteğe ihtiyacın var? Birkaç dakikada talep oluştur.
        </p>
        <Link
          href="/tenders/new"
          className="w-full sm:w-auto px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Ücretsiz Talep Aç</span>
        </Link>
      </div>
    </div>
  );
}
