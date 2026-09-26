"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search, ArrowRight, Sparkles } from "lucide-react";

export default function HeroSearchCapsule() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (!trimmed) {
      router.push("/teachers");
      return;
    }
    router.push(`/teachers?search=${encodeURIComponent(trimmed)}`);
  };

  return (
    <div className="w-full max-w-xl mx-auto lg:mx-0">
      <form
        onSubmit={handleSearch}
        className="group relative flex items-center gap-2 rounded-full border border-slate-200/90 bg-white/95 p-1.5 sm:p-2 shadow-lg shadow-emerald-500/5 hover:border-emerald-500/40 focus-within:border-emerald-500 focus-within:ring-4 focus-within:ring-emerald-500/15 transition-all duration-300 backdrop-blur-md"
      >
        {/* Left Search Icon */}
        <div className="pl-3 sm:pl-3.5 text-emerald-600 transition-transform group-focus-within:scale-110">
          <Search className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>

        {/* Search Input */}
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Hangi alanda ders arıyorsunuz? (Örn: TYT Matematik, Python, IELTS)..."
          className="w-full min-w-0 bg-transparent text-xs sm:text-sm text-slate-800 placeholder-slate-400 outline-none px-2 font-normal"
        />

        {/* Action Button */}
        <button
          type="submit"
          className="shrink-0 inline-flex items-center gap-1.5 px-4 sm:px-6 py-2.5 sm:py-3 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-600/20 hover:shadow-lg hover:shadow-emerald-600/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 cursor-pointer"
        >
          <span>Hemen Bul</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </form>

      {/* Fast Subject Quick Links */}
      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mt-3 pl-2 text-[11px] sm:text-xs text-slate-500">
        <span className="font-semibold text-slate-400 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Popüler:
        </span>
        {[
          { label: "TYT Matematik", q: "Matematik" },
          { label: "LGS Hazırlık", q: "LGS" },
          { label: "IELTS & Speaking", q: "İngilizce" },
          { label: "Python & Kodlama", q: "Yazılım" },
        ].map((item, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => router.push(`/teachers?search=${encodeURIComponent(item.q)}`)}
            className="hover:text-emerald-700 hover:bg-emerald-50 text-slate-600 px-2 py-0.5 rounded-full border border-slate-200/80 bg-slate-50/60 transition-colors cursor-pointer"
          >
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}
