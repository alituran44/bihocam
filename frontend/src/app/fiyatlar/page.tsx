"use client";

import { useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PayTRTaksitWidget from "@/components/payment/PayTRTaksitWidget";
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight, HelpCircle, Calculator, Clock, CreditCard } from "lucide-react";

const EXAM_SUBJECTS: Record<string, { label: string; tag: string; subjects: string[] }> = {
  yks: {
    label: "YKS Hazırlık",
    tag: "YKS",
    subjects: ["Matematik", "Fizik", "Kimya", "Biyoloji", "Türkçe", "Edebiyat", "Tarih", "Coğrafya", "İngilizce", "Felsefe", "Din Kültürü"],
  },
  lgs: {
    label: "LGS Hazırlık",
    tag: "LGS",
    subjects: ["Matematik", "Fen Bilimleri", "Türkçe", "İnkılap Tarihi", "Din Kültürü", "İngilizce"],
  },
  takviye: {
    label: "Okul Takviye",
    tag: "Okul",
    subjects: ["Matematik", "Fen Bilimleri", "Türkçe", "Fizik", "Kimya", "Biyoloji", "Tarih", "Coğrafya", "İngilizce", "Edebiyat"],
  },
  yabanci_dil: {
    label: "Yabancı Dil",
    tag: "Dil",
    subjects: ["İngilizce", "Almanca", "Fransızca", "İspanyolca", "İtalyanca", "Rusça"],
  },
  beceri: {
    label: "Beceri Geliştirme",
    tag: "Beceri",
    subjects: ["Müzik", "Kodlama", "Sanat", "Spor", "Dans", "Robotik", "Girişimcilik", "Fotoğrafçılık"],
  },
};

export default function FiyatlarPage() {
  const [calcExam, setCalcExam] = useState<string>("yks");
  const [calcSubjects, setCalcSubjects] = useState<string[]>(["Matematik"]);
  const [calcHours, setCalcHours] = useState<number>(2); // Varsayılan: 2 saat (önerilen ile uyumlu)
  const [calcWeeks, setCalcWeeks] = useState<number>(12); // Varsayılan: 12 hafta

  const toggleCalcSubject = (s: string) => {
    setCalcSubjects((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));
  };

  const hourlyRate = 800; // Taban saatlik ücret (Tahmini ortalama)
  const discount12 = 10;
  const discount24 = 15;
  const discount36 = 20;

  const selectedDiscount =
    calcWeeks === 4 ? 0 : calcWeeks === 12 ? discount12 : calcWeeks === 24 ? discount24 : discount36;
  const totalHours = calcHours * calcWeeks;
  const grossPrice = totalHours * hourlyRate;
  const netPrice = grossPrice * (1 - selectedDiscount / 100);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col justify-between">
      <Header />

      <main id="main-content" className="flex-1 pt-32 pb-24">
        {/* Header Hero */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-4">
            <Calculator className="w-3.5 h-3.5 text-emerald-600" />
            <span>ŞEFFAF BÜTÇE HESAPLAYICI</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-slate-900 font-display tracking-tight mb-4">
            Eğitim Bütçeni Planla
          </h1>
          <p className="text-slate-600 font-normal max-w-2xl mx-auto text-base sm:text-lg">
            Gizli ücret veya sürpriz ödeme yok. Fiyatlar eğitmene göre değişir; ihtiyacına uygun ders saatini belirleyip gelen teklifleri karşılaştırarak seçersin.
          </p>
        </section>

        {/* Calculator Body */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
            {/* Sliders Area */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between space-y-8">
              {/* Step 1: Sınav / Program Seçimi */}
              <div className="space-y-3">
                <label className="text-sm font-black text-slate-900 uppercase tracking-wider">
                  1. Sınav / Program Türü
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {Object.entries(EXAM_SUBJECTS).map(([key, val]) => (
                    <button
                      key={key}
                      type="button"
                      aria-pressed={calcExam === key}
                      onClick={() => {
                        setCalcExam(key === calcExam ? "" : key);
                        setCalcSubjects([]);
                      }}
                      className={`flex items-center justify-between px-3.5 py-3 rounded-2xl border font-bold text-xs transition-all text-left ${
                        calcExam === key
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-sm"
                          : "border-slate-300 bg-white text-slate-900 hover:border-slate-400 hover:bg-slate-50"
                      }`}
                    >
                      <span className="leading-tight">{val.label}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-100 border border-slate-300 text-slate-700 font-bold font-mono">
                        {val.tag}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Step 2: Ders Seçimi */}
              {calcExam && EXAM_SUBJECTS[calcExam] && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-black text-slate-900 uppercase tracking-wider">
                      2. Ders / Branş Tercihiniz
                    </label>
                    {calcSubjects.length > 0 && (
                      <button
                        type="button"
                        onClick={() => setCalcSubjects([])}
                        className="text-xs text-rose-600 font-bold hover:underline"
                      >
                        Temizle
                      </button>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {EXAM_SUBJECTS[calcExam].subjects.map((sub) => {
                      const isSelected = calcSubjects.includes(sub);
                      return (
                        <button
                          key={sub}
                          type="button"
                          onClick={() => toggleCalcSubject(sub)}
                          className={`px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                            isSelected
                              ? "bg-emerald-600 border-emerald-600 text-white shadow-xs"
                              : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          {isSelected ? `✓ ${sub}` : `+ ${sub}`}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Step 3: Haftalık Canlı Ders Saati */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    3. Haftalık Canlı Ders Saati
                  </label>
                  <span className="text-sm font-bold font-mono text-emerald-800 bg-emerald-50 px-3 py-1 rounded-xl border border-emerald-200">
                    {calcHours} Saat / Hafta
                  </span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={8}
                  step={1}
                  value={calcHours}
                  onChange={(e) => setCalcHours(Number(e.target.value))}
                  className="w-full accent-emerald-600 cursor-pointer"
                />
                <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                  <span>1 Saat</span>
                  <span className="font-bold text-emerald-700">2 Saat (Önerilen)</span>
                  <span>4 Saat</span>
                  <span>8 Saat</span>
                </div>
              </div>

              {/* Step 4: Program Süresi */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    4. Program Süresi
                  </label>
                  <span className="text-xs font-bold text-slate-500">Paket İndirimleri</span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { weeks: 4, label: "1 Ay", discount: 0 },
                    { weeks: 12, label: "3 Ay", discount: discount12 },
                    { weeks: 24, label: "6 Ay", discount: discount24 },
                    { weeks: 36, label: "9 Ay", discount: discount36 },
                  ].map((item) => (
                    <button
                      key={item.weeks}
                      type="button"
                      onClick={() => setCalcWeeks(item.weeks)}
                      className={`p-3 rounded-2xl border text-center transition-all ${
                        calcWeeks === item.weeks
                          ? "border-emerald-600 bg-emerald-50 text-emerald-950 ring-2 ring-emerald-500/20 shadow-xs"
                          : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                      }`}
                    >
                      <div className="text-xs font-bold">{item.weeks} Hafta</div>
                      <div className="text-[11px] text-slate-500">{item.label}</div>
                      {item.discount > 0 && (
                        <div className="text-[10px] font-black text-emerald-700 mt-1">-%{item.discount}</div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary & Installment Box */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="space-y-6">
                <h2 className="text-xl font-black text-slate-900 flex items-center justify-between border-b border-slate-100 pb-4">
                  <span>Tahmini Planlama Özeti</span>
                  <span className="text-xs font-mono text-emerald-800 font-bold px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200">
                    {totalHours} Saat Canlı
                  </span>
                </h2>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Toplam Seans:</span>
                    <span className="font-bold text-slate-900">{totalHours} Saat</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Referans Taban Ücret:</span>
                    <span className="font-mono font-bold text-slate-900">{hourlyRate.toLocaleString("tr-TR")} TL / saat</span>
                  </div>
                  {selectedDiscount > 0 && (
                    <div className="flex justify-between text-emerald-700 font-bold">
                      <span>Süre İndirimi:</span>
                      <span className="font-mono font-black">-%{selectedDiscount}</span>
                    </div>
                  )}
                </div>

                <div className="pt-4 border-t border-slate-100 space-y-1">
                  <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tahmini Toplam Tutar</span>
                  <div className="text-4xl font-black tracking-tight text-slate-900 font-mono">
                    {Math.round(netPrice).toLocaleString("tr-TR")} <span className="text-emerald-700 text-2xl">TL</span>
                  </div>
                  <p className="text-[11px] text-slate-500 leading-relaxed pt-1">
                    *Özel ders ücretleri her eğitmenin kendi profilinde serbestçe belirlenir. Bu hesaplama tahmini referans değerler içermektedir.
                  </p>
                </div>

                {/* Taksit Widget */}
                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
                  <PayTRTaksitWidget amount={netPrice} />
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <Link
                  href={`/teachers?hours=${calcHours}&weeks=${calcWeeks}&budget=${Math.round(netPrice)}&branch=${calcExam}&subjects=${encodeURIComponent(calcSubjects.join(","))}`}
                  className="w-full block text-center py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold shadow-lg shadow-emerald-600/20 transition-all"
                >
                  Bu Planla Eğitmenleri Keşfet →
                </Link>
                <Link
                  href="/tenders/new"
                  className="w-full block text-center py-3 rounded-2xl bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 text-xs font-bold transition-all"
                >
                  Kendi Bütçenle Ders Talebi Aç
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Trust Points */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <ShieldCheck className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Emanet Havuz Koruması</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Ödemeniz, eğitmenle dersiniz tamamlanana kadar güvenli havuz hesabında tutulur. Onayınız olmadan aktarılmaz.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <CreditCard className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Vade Farksız 6 Taksit</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Anlaşmalı kredi kartlarına peşin fiyatına 6 aya varan taksit avantajıyla bütçenizi sarsmadan eğitim alın.
              </p>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-2">
              <Clock className="w-6 h-6 text-emerald-600" />
              <h3 className="font-bold text-slate-900 text-base">Esnek Ders Kullanımı</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Satın aldığınız ders saatlerini eğitim yılı boyunca dilediğiniz gün ve saatte eğitmeninizle planlayarak kullanabilirsiniz.
              </p>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
