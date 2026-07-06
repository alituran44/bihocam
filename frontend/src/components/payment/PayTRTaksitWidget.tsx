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
          font-family: Arial, sans-serif;
          max-height: 180px;
          overflow-y: auto;
          overflow-x: hidden;
          scrollbar-width: thin;
          scrollbar-color: rgba(45,212,191,0.4) transparent;
        }
        #paytr_taksit_tablosu::-webkit-scrollbar { width: 4px; }
        #paytr_taksit_tablosu::-webkit-scrollbar-thumb { background: rgba(45,212,191,0.4); border-radius: 4px; }
        #paytr_taksit_tablosu::before { display: table; content: " "; }
        #paytr_taksit_tablosu::after  { content: ""; clear: both; display: table; }
        .taksit-tablosu-wrapper {
          margin: 3px;
          padding: 6px 4px;
          display: inline-block;
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 8px;
          background: rgba(255,255,255,0.04);
          width: calc(50% - 10px);
          min-width: 80px;
          vertical-align: top;
          box-sizing: border-box;
        }
        .taksit-tablosu-wrapper:hover { background: rgba(255,255,255,0.09); }
        .taksit-logo img {
          max-height: 18px;
          padding-bottom: 4px;
          filter: brightness(0) invert(1);
          opacity: 0.8;
        }
        .taksit-tutari-text {
          float: left; width: 48%;
          color: rgba(255,255,255,0.4);
          margin-bottom: 2px; font-size: 9px;
        }
        .taksit-tutar-wrapper { display: inline-block; width: 100%; }
        .taksit-tutari {
          float: left; width: 48%;
          padding: 2px 0; color: #e2e8f0;
          border: none; font-size: 9px;
        }
        .taksit-tutari-bold { font-weight: bold; color: #2dd4bf; }
      `}</style>

      <div id="paytr_taksit_tablosu" ref={containerRef} className="w-full" />
    </div>
  );
}
