"use client";

import { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, CheckCircle2 } from "lucide-react";

function PaymentCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const status = searchParams.get("status");
    const oid = searchParams.get("oid") || searchParams.get("order_id");

    const timer = setTimeout(() => {
      if (status === "success" || status === "ok" || status === "approved") {
        router.push(oid ? `/payment/success?oid=${oid}` : "/payment/success");
      } else if (status === "fail" || status === "failed") {
        router.push("/payment/fail");
      } else {
        // Varsayilan olarak basarili veya dashboard'a yonlendir
        router.push(oid ? `/payment/success?oid=${oid}` : "/dashboard");
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-4">
      <div className="bg-slate-800/80 backdrop-blur border border-slate-700/60 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl">
        <div className="w-16 h-16 bg-teal-500/10 border border-teal-500/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Loader2 className="w-8 h-8 text-teal-400 animate-spin" />
        </div>
        <h1 className="text-2xl font-bold tracking-tight mb-2">Ödemeniz Doğrulanıyor</h1>
        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
          PayTR güvenli ödeme işleminiz onaylanıyor. Lütfen sayfayı kapatmayınız, otomatik olarak yönlendirileceksiniz...
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>256-Bit SSL PayTR Güvenli Ödeme Altyapısı</span>
        </div>
      </div>
    </div>
  );
}

export default function PaymentCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
          <Loader2 className="w-10 h-10 text-teal-400 animate-spin" />
        </div>
      }
    >
      <PaymentCallbackContent />
    </Suspense>
  );
}
