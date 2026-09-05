"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, useMemo, Suspense } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Avatar from "@/components/Avatar";
import { teachersApi } from "@/lib/api";
import AdBanner from "@/components/ads/AdBanner";
import { motion } from "framer-motion";

type TeacherListItem = {
  id: string;
  full_name: string;
  email: string;
  courses_count: number;
  avatar_url?: string | null;
  bio?: string | null;
  expertise_tags: string[];
  live_class_price?: number | null;
  live_class_discount_price?: number | null;
  face_to_face_price?: number | null;
  created_at: string;
};

const DISCOUNT_MAP: Record<number, number> = { 4: 0, 12: 10, 24: 15, 36: 20 };

const ALL_BRANCHES = [
  "Matematik", "Fen Bilimleri", "Turkce", "Fizik", "Kimya", "Biyoloji",
  "Ingilizce", "Tarih", "Cografya", "Edebiyat", "YKS", "LGS", "Takviye",
  "Muzik", "Kodlama", "Sanat", "Almanca", "Fransizca",
];

const WEEK_OPTIONS = [
  { weeks: 4,  label: "4 Hafta",  sub: "1 Ay" },
  { weeks: 12, label: "12 Hafta", sub: "3 Ay" },
  { weeks: 24, label: "24 Hafta", sub: "6 Ay" },
  { weeks: 36, label: "36 Hafta", sub: "Egitim Donemi" },
];

function calcPackage(hourlyPrice: number, hours: number, weeks: number) {
  const discount = DISCOUNT_MAP[weeks] ?? 0;
  const total = hourlyPrice * hours * weeks * (1 - discount / 100);
  return { total: Math.round(total), discount };
}

const getNext7Days = () => {
  const days = [];
  const localeDays = ["Pzr", "Pzt", "Sl", "Çrş", "Prş", "Cma", "Cmt"];
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    days.push({
      dayNum: d.getDate(),
      dayLabel: localeDays[d.getDay()],
      rawDate: d.toISOString().split("T")[0]
    });
  }
  return days;
};

function TeachersPageInner() {
  const params = useSearchParams();
  const urlHours  = parseInt(params.get("hours")  || "4");
  const urlWeeks  = parseInt(params.get("weeks")  || "4");
  const urlBranch = params.get("branch") || "";

  const [selectedWeeks,    setSelectedWeeks]    = useState(urlWeeks);
  const [selectedHours,    setSelectedHours]    = useState(urlHours);
  const [selectedBranches, setSelectedBranches] = useState<string[]>(urlBranch ? [urlBranch] : []);
  const [sortBy,           setSortBy]           = useState<"price_asc"|"price_desc"|"default">("default");
  const [showAllBranches,  setShowAllBranches]  = useState(false);
  const [cardTabs,         setCardTabs]         = useState<Record<string, "takvim" | "hakkimda">>({});

  const next7Days = useMemo(() => getNext7Days(), []);

  const { data, isLoading, error } = useQuery<TeacherListItem[]>({
    queryKey: ["teachers"],
    queryFn: () => teachersApi.list(0, 100),
  });

  const formatJoinDate = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString("tr-TR", { day: "numeric", month: "short", year: "numeric" });
    } catch { return "-"; }
  };

  const toggleBranch = (b: string) =>
    setSelectedBranches((prev) => prev.includes(b) ? prev.filter((x) => x !== b) : [...prev, b]);

  const filteredData = useMemo(() => {
    if (!data) return [];
    let list = [...data];
    if (selectedBranches.length > 0) {
      list = list.filter((t) =>
        selectedBranches.some((br) =>
          t.expertise_tags?.some((tag) => tag.toLowerCase().includes(br.toLowerCase()))
        )
      );
    }
    if (sortBy === "price_asc")  list.sort((a, b) => (a.live_class_price ?? Infinity) - (b.live_class_price ?? Infinity));
    if (sortBy === "price_desc") list.sort((a, b) => (b.live_class_price ?? 0) - (a.live_class_price ?? 0));
    return list;
  }, [data, selectedBranches, sortBy]);

  const visibleBranches = showAllBranches ? ALL_BRANCHES : ALL_BRANCHES.slice(0, 10);
  const fromCalculator  = !!params.get("hours");

  return (
    <div className="min-h-screen bg-slate-50/50">
      <Header />

      <div className="relative pt-32 pb-20 text-center md:text-left min-h-[420px] flex items-center overflow-hidden bg-slate-950 border-b border-white/5">
        <div className="absolute inset-0 bg-cover bg-center opacity-35 mix-blend-luminosity transform scale-105" style={{ backgroundImage: "url('/teachers_banner_bg.png')" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/85 to-transparent" />
        <div className="absolute inset-0 bg-[radial-gradient(rgba(255,255,255,0.03)_1.5px,transparent_1.5px)] [background-size:24px_24px] opacity-40" />
        <div className="absolute top-12 right-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute -bottom-10 left-10 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-12">
            <div className="space-y-6 max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-teal-300 text-xs font-bold uppercase tracking-wider backdrop-blur-sm">
                <span>&#127775;</span> Turkiye&apos;nin En Seckin Egitmenleri
              </div>
              <h1 className="text-4xl md:text-6xl font-black text-white tracking-tight leading-tight">
                Uzman <span className="bg-clip-text text-transparent bg-gradient-to-r from-teal-400 to-indigo-400">Egitmenlerimiz</span>
              </h1>
              <p className="text-slate-300 text-base md:text-lg max-w-2xl font-medium leading-relaxed">
                Hedeflerinize ulasmak icin Turkiye&apos;nin en seckin ogretmenleriyle birebir canli dersler planlayin.
              </p>
            </div>
            <div className="hidden lg:flex flex-col gap-4 w-80 bg-white/5 border border-white/10 p-6 rounded-3xl backdrop-blur-md shadow-2xl">
              {[
                { title: "Birebir Canli Dersler", sub: "Uzman ogretmenlerle aninda baslayin" },
                { title: "Yapay Zeka Destekli",   sub: "AI asistani esliginde ders hazirliga" },
                { title: "Ucret Iadesi Garantisi",sub: "Ilk 15 dk ucretsiz tanisma dersi" },
              ].map((item, i) => (
                <div key={i}>
                  {i > 0 && <div className="border-t border-white/5 my-1" />}
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-teal-500/20 flex items-center justify-center text-teal-300 font-bold">&#10003;</div>
                    <div>
                      <h4 className="text-white text-sm font-bold">{item.title}</h4>
                      <p className="text-slate-400 text-xs font-medium">{item.sub}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 -mt-8 relative z-20">
        <AdBanner placementCode="teachers_banner" className="mb-8" />

        {/* FILTER BAR */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl border border-slate-100 shadow-sm p-6 mb-8 space-y-6">

          {fromCalculator && (
            <div className="flex items-center gap-3 px-4 py-3 bg-teal-50 border border-teal-100 rounded-2xl text-sm text-teal-800 font-medium">
              <span className="text-lg">&#127919;</span>
              <span>Hesaplayicinizdan gelen plan uygulandi: <strong>{urlHours} saat/hafta</strong>, <strong>{urlWeeks} hafta</strong> program.</span>
            </div>
          )}

          {/* Hourly Slider */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-slate-700">Haftalik Ders Saati</label>
              <span className="text-teal-600 font-black text-sm">{selectedHours} Saat</span>
            </div>
            <input type="range" min={1} max={10} value={selectedHours}
              onChange={(e) => setSelectedHours(parseInt(e.target.value))}
              className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-teal-500" />
            <div className="flex justify-between text-xs text-slate-400 font-semibold mt-1">
              <span>1 Saat</span><span>5 Saat (Onerilen)</span><span>10 Saat</span>
            </div>
          </div>

          {/* Week Toggle */}
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">Program Suresi &amp; Indirim</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {WEEK_OPTIONS.map((opt) => {
                const disc   = DISCOUNT_MAP[opt.weeks];
                const active = selectedWeeks === opt.weeks;
                return (
                  <button key={opt.weeks} type="button" onClick={() => setSelectedWeeks(opt.weeks)}
                    className={`relative p-3 rounded-2xl border-2 font-bold text-xs text-center transition-all ${active ? "border-teal-500 bg-teal-50 text-teal-800" : "border-slate-100 bg-slate-50 text-slate-500 hover:border-slate-200"}`}>
                    {disc > 0 && (
                      <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full whitespace-nowrap">
                        %{disc} Indirim
                      </span>
                    )}
                    <div className="font-black text-sm">{opt.label}</div>
                    <div className="text-[10px] font-semibold opacity-70">{opt.sub}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Branch Chips */}
          <div>
            <p className="text-sm font-bold text-slate-700 mb-3">Brans / Alan Secimi</p>
            <div className="flex flex-wrap gap-2">
              {visibleBranches.map((b) => {
                const active = selectedBranches.includes(b);
                return (
                  <button key={b} type="button" onClick={() => toggleBranch(b)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all border ${active ? "bg-teal-500 text-white border-teal-500 shadow-sm" : "bg-slate-50 text-slate-600 border-slate-100 hover:border-teal-300 hover:text-teal-600"}`}>
                    {b}
                  </button>
                );
              })}
              <button type="button" onClick={() => setShowAllBranches((v) => !v)}
                className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-slate-400 border border-dashed border-slate-200 hover:border-slate-300 transition-all">
                {showAllBranches ? "Daha Az" : `+${ALL_BRANCHES.length - 10} Daha`}
              </button>
              {selectedBranches.length > 0 && (
                <button type="button" onClick={() => setSelectedBranches([])}
                  className="px-3.5 py-1.5 rounded-xl text-xs font-bold text-rose-500 border border-rose-100 hover:bg-rose-50 transition-all">
                  Temizle
                </button>
              )}
            </div>
          </div>

          {/* Sort + count */}
          <div className="flex items-center justify-between border-t border-slate-50 pt-4">
            <p className="text-sm text-slate-500 font-medium">
              <span className="font-black text-slate-700">{filteredData.length}</span> egitmen listeleniyor
            </p>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="text-xs font-bold text-slate-600 border border-slate-100 rounded-xl px-3 py-2 bg-slate-50 focus:outline-none focus:border-teal-300">
              <option value="default">Varsayilan Siralama</option>
              <option value="price_asc">En Uygun Fiyat</option>
              <option value="price_desc">En Yuksek Fiyat</option>
            </select>
          </div>
        </motion.div>

        {/* TEACHER LIST */}
        {isLoading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm animate-pulse flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gray-200" />
                    <div className="space-y-2 flex-1"><div className="h-6 bg-gray-200 rounded w-1/4" /><div className="h-4 bg-gray-200 rounded w-1/6" /></div>
                  </div>
                  <div className="h-16 bg-gray-200 rounded w-full" />
                </div>
                <div className="w-full lg:w-80 bg-gray-100 rounded-3xl h-56" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Egitmenler Yuklenemedi</h2>
          </div>
        ) : filteredData.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-16 text-center border border-gray-100">
            <div className="text-5xl mb-4">&#128269;</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Filtreyle Eslesen Egitmen Bulunamadi</h3>
            <button type="button" onClick={() => { setSelectedBranches([]); setSortBy("default"); }}
              className="mt-4 px-6 py-2.5 bg-teal-500 text-white font-bold rounded-xl hover:bg-teal-600 transition-colors text-sm">
              Filtreleri Sifirla
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {filteredData.map((teacher, idx) => {
              const subtitle   = teacher.expertise_tags?.[0] ? `${teacher.expertise_tags[0]} Ogretmeni` : "Seckin Egitmen";
              const bio        = teacher.bio || "Egitim her ogrenci icin kisisel bir yolculuktur. Uzun yillara dayanan tecrubem ile basariya birlikte ulasalim.";
              const hourlyRate = teacher.live_class_discount_price || teacher.live_class_price || null;

              const activeTab = cardTabs[teacher.id] ?? "takvim";

              return (
                <motion.div key={teacher.id}
                  initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: idx * 0.04 }}
                  className="bg-white rounded-[2.5rem] border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200/80 transition-all duration-300 p-6 sm:p-8 flex flex-col xl:flex-row gap-8 relative overflow-hidden group">

                  {/* Left Side: Profile & Details */}
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-4">
                        <Avatar src={teacher.avatar_url} name={teacher.full_name} size="xl"
                          className="shadow-lg shadow-teal-500/5 ring-4 ring-slate-50 group-hover:scale-105 transition-transform duration-300 flex-shrink-0" />
                        <div className="space-y-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <Link href={`/teachers/${teacher.id}`}>
                              <h2 className="text-2xl font-black text-slate-800 hover:text-rose-500 transition-colors uppercase tracking-tight">{teacher.full_name}</h2>
                            </Link>
                            <span className="w-5 h-5 rounded-full bg-rose-500 flex items-center justify-center text-white text-[10px] shadow-sm select-none" title="Dogrulanmıs Uzman">★</span>
                            <span className="text-[10px] font-extrabold text-rose-500 bg-rose-50 px-2 py-0.5 rounded-md uppercase tracking-wider">Uzman</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-teal-600 font-bold text-sm">
                            <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            <span>{teacher.expertise_tags?.[0] || "Brans Belirtilmemis"}</span>
                          </div>
                          <p className="text-slate-400 text-xs font-semibold">Online {teacher.expertise_tags?.[0]?.toLowerCase() || "ozel"} dersi</p>
                        </div>
                      </div>

                      {/* Info badges row */}
                      <div className="flex flex-wrap gap-4 mt-6 text-slate-500 text-xs font-bold">
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span>Bireysel</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span>40 Dakika</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-blue-600 font-bold">
                          <span>🌐</span>
                          <span>{hourlyRate ? `${hourlyRate.toLocaleString("tr-TR")} TL (Online)` : "Anlaşmalı"}</span>
                        </div>
                        {teacher.face_to_face_price !== undefined && teacher.face_to_face_price !== null && (
                          <div className="flex items-center gap-1.5 text-indigo-600 font-bold">
                            <span>📍</span>
                            <span>{teacher.face_to_face_price ? `${teacher.face_to_face_price.toLocaleString("tr-TR")} TL (Yüz Yüze)` : "Ücretsiz"}</span>
                          </div>
                        )}
                      </div>

                      <p className="mt-5 text-gray-500 text-[14px] leading-relaxed font-medium line-clamp-3">{bio}</p>
                    </div>

                    <div className="mt-8 pt-4">
                      <Link href={`/teachers/${teacher.id}#live-class`}
                        className="inline-flex w-full sm:w-auto px-10 py-4 bg-[#f45c58] hover:bg-[#e04f4b] text-white font-extrabold text-sm rounded-2xl hover:shadow-lg hover:shadow-rose-500/10 transition-all text-center justify-center">
                        Yer Ayırt
                      </Link>
                    </div>
                  </div>

                  {/* Right Side: Tabbed panel (TAKVİM & HAKKIMDA) */}
                  <div className="w-full xl:w-[48%] flex-shrink-0 bg-slate-50/30 rounded-3xl border border-slate-100/70 p-5 flex flex-col justify-between">
                    <div>
                      {/* Tabs selector */}
                      <div className="flex border-b border-slate-100 pb-px mb-4">
                        <button
                          type="button"
                          onClick={() => setCardTabs(prev => ({ ...prev, [teacher.id]: "takvim" }))}
                          className={`pb-2.5 px-4 text-xs font-black relative transition-all tracking-wider ${
                            activeTab === "takvim" ? "text-[#f45c58]" : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          TAKVİM
                          {activeTab === "takvim" && (
                            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#f45c58] rounded-full"></span>
                          )}
                        </button>
                        <button
                          type="button"
                          onClick={() => setCardTabs(prev => ({ ...prev, [teacher.id]: "hakkimda" }))}
                          className={`pb-2.5 px-4 text-xs font-black relative transition-all tracking-wider ${
                            activeTab === "hakkimda" ? "text-[#f45c58]" : "text-slate-400 hover:text-slate-600"
                          }`}
                        >
                          HAKKIMDA
                          {activeTab === "hakkimda" && (
                            <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-[#f45c58] rounded-full"></span>
                          )}
                        </button>
                      </div>

                      {/* Tab Content */}
                      {activeTab === "takvim" ? (
                        /* Weekly Time Slots Grid Preview */
                        <div className="space-y-4">
                          <div className="grid grid-cols-8 gap-1 text-center">
                            <span className="text-[10px] font-bold text-slate-300 self-center">Saat</span>
                            {next7Days.map((day, dIdx) => (
                              <div key={dIdx} className="flex flex-col items-center">
                                <span className="text-[10px] font-semibold text-slate-400 leading-none">{day.dayNum}</span>
                                <span className="text-[10px] font-black text-slate-700 mt-0.5 leading-none uppercase">{day.dayLabel}</span>
                              </div>
                            ))}
                          </div>

                          <div className="space-y-1">
                            {["00-04", "04-08", "08-12", "12-16", "16-20", "20-24"].map((slotLabel) => {
                              const isAvailableSlot = slotLabel === "16-20" || slotLabel === "20-24";
                              return (
                                <div key={slotLabel} className="grid grid-cols-8 gap-1 items-center">
                                  <span className="text-[9px] font-bold text-slate-400 text-right pr-1 leading-none">{slotLabel}</span>
                                  {[...Array(7)].map((_, dayIdx) => (
                                    <div
                                      key={dayIdx}
                                      className={`h-6 rounded-sm border transition-all ${
                                        isAvailableSlot
                                          ? "bg-emerald-500/80 hover:bg-emerald-500 border-white shadow-sm cursor-pointer"
                                          : "bg-slate-50/50 border-slate-100/50"
                                      }`}
                                      title={isAvailableSlot ? `${slotLabel} saat dilimi musait` : undefined}
                                    />
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ) : (
                        /* Hakkımda Details Tab */
                        <div className="space-y-5">
                          <div>
                            <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2">Beceriler</h4>
                            <div className="flex flex-wrap gap-1.5">
                              {(teacher.expertise_tags?.length > 0 ? teacher.expertise_tags : ["Matematik", "Ozel Ders"]).map((tag, tIdx) => (
                                <span key={tIdx} className="px-2.5 py-1 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-100">
                                  {tag}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="border-t border-slate-100 pt-4">
                            <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider mb-2">Ozet Bilgi</h4>
                            <div className="grid grid-cols-2 gap-4">
                              {[
                                { label: "Uyelik Tarihi", value: formatJoinDate(teacher.created_at) },
                                { label: "Kurs Sayısı", value: String(teacher.courses_count || 0) },
                              ].map((item, iIdx) => (
                                <div key={iIdx} className="bg-slate-50/50 rounded-xl p-3 border border-slate-100/50">
                                  <div className="text-[9px] text-slate-400 font-bold uppercase">{item.label}</div>
                                  <div className="text-slate-700 font-black text-xs mt-0.5">{item.value}</div>
                                </div>
                              ))}
                            </div>
                          </div>

                          {hourlyRate && (
                            <div className="border-t border-slate-100 pt-4 space-y-2">
                              <h4 className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wider">Seçili Program Ücreti</h4>
                              <div className="bg-teal-50/50 border border-teal-100/50 rounded-xl p-3.5 flex items-center justify-between">
                                <div className="space-y-1">
                                  <div className="text-[9px] text-teal-700 font-extrabold uppercase">
                                    {selectedWeeks} Hafta / Haftada {selectedHours} Saat
                                  </div>
                                  <div className="text-slate-500 text-[10px] font-semibold leading-none">
                                    Toplam: {selectedWeeks * selectedHours} Ders Saati
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-black text-teal-800 leading-none">
                                    {calcPackage(hourlyRate, selectedHours, selectedWeeks).total.toLocaleString("tr-TR")} TL
                                  </div>
                                  {calcPackage(hourlyRate, selectedHours, selectedWeeks).discount > 0 ? (
                                    <div className="text-[9px] font-bold text-rose-500 mt-1 leading-none">
                                      %{calcPackage(hourlyRate, selectedHours, selectedWeeks).discount} indirim
                                    </div>
                                  ) : (
                                    <div className="text-[9px] text-slate-400 mt-1 leading-none">
                                      İndirimsiz
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                </motion.div>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}

export default function TeachersPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center"><div className="animate-spin w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full" /></div>}>
      <TeachersPageInner />
    </Suspense>
  );
}
