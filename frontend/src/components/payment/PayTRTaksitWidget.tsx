"use client";

import { useEffect, useRef, useState } from "react";
import { CreditCard, ShieldCheck } from "lucide-react";

interface PayTRTaksitWidgetProps {
  amount: number;
  className?: string;
}

const PAYTR_TOKEN    = "397bc72b1d356cf409e84d9abb800380afc4955a108bc65be3ad80784141a4e6";
const PAYTR_MERCHANT = "623775";
const PAYTR_BASE     = "https://www.paytr.com/odeme/taksit-tablosu/v2";

const BANK_NAMES = ["World", "Bonus", "Maximum", "Axess", "CardFinans", "Paraf"];

export default function PayTRTaksitWidget({ amount, className = "" }: PayTRTaksitWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef    = useRef<HTMLScriptElement | null>(null);
  const prevAmount   = useRef<number>(-1);
  const [hasPayTRContent, setHasPayTRContent] = useState<boolean>(false);
  const [selectedBank, setSelectedBank] = useState<string>("Tüm Kartlar");

  const roundedAmount = Math.max(1, Math.round(amount || 0));

  useEffect(() => {
    if (prevAmount.current === roundedAmount) return;
    prevAmount.current = roundedAmount;
    setHasPayTRContent(false);

    if (scriptRef.current) {
      scriptRef.current.remove();
      scriptRef.current = null;
    }
    if (containerRef.current) {
      containerRef.current.innerHTML = "";
    }

    if (roundedAmount <= 0) return;

    // Try loading PayTR
    const src = `${PAYTR_BASE}?token=${PAYTR_TOKEN}&merchant_id=${PAYTR_MERCHANT}&amount=${roundedAmount}&taksit=6&tumu=0`;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;

    // Watch for PayTR injection
    const timer = setTimeout(() => {
      if (containerRef.current && containerRef.current.children.length > 0) {
        setHasPayTRContent(true);
      }
    }, 1200);

    script.onload = () => {
      setTimeout(() => {
        if (containerRef.current && containerRef.current.children.length > 0) {
          setHasPayTRContent(true);
        }
      }, 500);
    };

    script.onerror = () => {
      setHasPayTRContent(false);
    };

    document.body.appendChild(script);
    scriptRef.current = script;

    return () => {
      clearTimeout(timer);
      script.remove();
      scriptRef.current = null;
    };
  }, [roundedAmount]);

  // Installment plans for fallback
  const plans = [
    { installments: 1, label: "Tek Çekim", isNoInterest: true, monthly: roundedAmount, total: roundedAmount },
    { installments: 2, label: "2 Taksit", isNoInterest: true, monthly: Math.round(roundedAmount / 2), total: roundedAmount },
    { installments: 3, label: "3 Taksit", isNoInterest: true, monthly: Math.round(roundedAmount / 3), total: roundedAmount },
    { installments: 6, label: "6 Taksit", isNoInterest: true, monthly: Math.round(roundedAmount / 6), total: roundedAmount, badge: "Vade Farksız" },
    { installments: 9, label: "9 Taksit", isNoInterest: false, monthly: Math.round((roundedAmount * 1.06) / 9), total: Math.round(roundedAmount * 1.06) },
    { installments: 12, label: "12 Taksit", isNoInterest: false, monthly: Math.round((roundedAmount * 1.09) / 12), total: Math.round(roundedAmount * 1.09) },
  ];

  return (
    <div className={className}>
      <style>{`
        #paytr_taksit_tablosu {
          clear: both;
          font-size: 11px;
          width: 100%;
          text-align: center;
          font-family: inherit;
          max-height: 200px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: #10B981 #f1f5f9;
        }
        #paytr_taksit_tablosu::-webkit-scrollbar { width: 4px; }
        #paytr_taksit_tablosu::-webkit-scrollbar-thumb { background: #10B981; border-radius: 4px; }
        #paytr_taksit_tablosu::before { display: table; content: " "; }
        #paytr_taksit_tablosu::after  { content: ""; clear: both; display: table; }
        .taksit-tablosu-wrapper {
          margin: 3px;
          padding: 8px 6px;
          display: inline-block;
          border: 1px solid #cbd5e1 !important;
          border-radius: 12px !important;
          background: #ffffff !important;
          width: calc(50% - 8px);
          min-width: 85px;
          vertical-align: top;
          box-sizing: border-box;
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
          transition: all 0.2s ease;
        }
        .taksit-tablosu-wrapper:hover {
          border-color: #10B981 !important;
          box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.15);
        }
        .taksit-logo img {
          max-height: 22px;
          padding-bottom: 4px;
          filter: none !important;
          opacity: 1 !important;
        }
        .taksit-tutari-text {
          float: left; width: 48%;
          color: #475569 !important;
          font-weight: 700 !important;
          margin-bottom: 2px;
          font-size: 10px !important;
        }
        .taksit-tutar-wrapper { display: inline-block; width: 100%; }
        .taksit-tutari {
          float: left; width: 48%;
          padding: 2px 0;
          color: #0f172a !important;
          border: none;
          font-size: 10px !important;
          font-weight: 600 !important;
        }
        .taksit-tutari-bold {
          font-weight: 800 !important;
          color: #047857 !important;
        }
      `}</style>

      {/* PayTR container */}
      <div
        id="paytr_taksit_tablosu"
        ref={containerRef}
        className={`w-full ${hasPayTRContent ? "block" : "hidden"}`}
      />

      {/* High-contrast Native Installment Fallback */}
      {!hasPayTRContent && (
        <div className="space-y-3 pt-1">
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
            <span className="flex items-center gap-1 text-slate-700 font-semibold">
              <CreditCard className="w-3.5 h-3.5 text-emerald-600" />
              Tüm Kartlara 6 Aya Varan Taksit
            </span>
            <span className="flex items-center gap-1 text-emerald-700 font-bold">
              <ShieldCheck className="w-3.5 h-3.5" />
              3D Secure
            </span>
          </div>

          {/* Bank Badges */}
          <div className="flex flex-wrap gap-1.5 justify-start">
            {BANK_NAMES.map((b) => (
              <span
                key={b}
                className="px-2 py-0.5 bg-white border border-slate-200 text-slate-700 font-bold text-[10px] rounded-md shadow-2xs"
              >
                {b}
              </span>
            ))}
          </div>

          {/* Installment Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {plans.map((p) => (
              <div
                key={p.installments}
                className={`p-2.5 rounded-xl border transition-all text-left ${
                  p.badge
                    ? "bg-emerald-50/70 border-emerald-300 shadow-2xs"
                    : "bg-white border-slate-200 hover:border-slate-300"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-bold text-slate-900">{p.label}</span>
                  {p.badge && (
                    <span className="text-[9px] font-black uppercase text-emerald-800 bg-emerald-100/90 px-1.5 py-0.5 rounded border border-emerald-200">
                      {p.badge}
                    </span>
                  )}
                </div>
                <div className="text-sm font-black text-slate-900 font-mono">
                  {p.monthly.toLocaleString("tr-TR")} <span className="text-[10px] font-bold text-slate-500">TL/ay</span>
                </div>
                <div className="text-[10px] text-slate-500 font-medium mt-0.5">
                  Toplam: {p.total.toLocaleString("tr-TR")} TL
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

