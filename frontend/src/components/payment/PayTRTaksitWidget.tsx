"use client";

import { useEffect, useRef } from "react";

interface PayTRTaksitWidgetProps {
  amount: number;
  className?: string;
}

const PAYTR_TOKEN    = "397bc72b1d356cf409e84d9abb800380afc4955a108bc65be3ad80784141a4e6";
const PAYTR_MERCHANT = "623775";
const PAYTR_BASE     = "https://www.paytr.com/odeme/taksit-tablosu/v2";

export default function PayTRTaksitWidget({ amount, className = "" }: PayTRTaksitWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scriptRef    = useRef<HTMLScriptElement | null>(null);
  const prevAmount   = useRef<number>(-1);

  useEffect(() => {
    if (prevAmount.current === amount) return;
    prevAmount.current = amount;

    if (scriptRef.current) { scriptRef.current.remove(); scriptRef.current = null; }
    if (containerRef.current)  containerRef.current.innerHTML = "";

    const amountParam = Math.round(amount);
    if (amountParam <= 0) return;

    // taksit=6 => yalnizca 6 taksit secenegi | tumu=0 => populer bankalar
    const src = `${PAYTR_BASE}?token=${PAYTR_TOKEN}&merchant_id=${PAYTR_MERCHANT}&amount=${amountParam}&taksit=6&tumu=0`;
    const script = document.createElement("script");
    script.src = src; script.async = true;
    document.body.appendChild(script);
    scriptRef.current = script;
    return () => { script.remove(); scriptRef.current = null; };
  }, [amount]);

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

      <div id="paytr_taksit_tablosu" ref={containerRef} className="w-full" />
    </div>
  );
}
