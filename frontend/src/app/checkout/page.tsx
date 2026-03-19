"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Loader2, ShieldCheck, AlertCircle, FlaskConical } from "lucide-react";
import { api } from "@/lib/api";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-teal-600" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const couponCode = searchParams.get("coupon") || undefined;

  const checkoutMutation = useMutation({
    mutationFn: () => paymentsApi.checkout(couponCode),
    onSuccess: (data) => {
      // Ücretsiz sipariş — direkt başarı sayfasına yönlendir
      if (!data.iframe_token) {
        router.push(`/payment/success?oid=${data.order_id}`);
      }
    },
    onError: () => {},
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }
    checkoutMutation.mutate();
  }, []);

  // iFrame yüklendi
  useEffect(() => {
    if (checkoutMutation.data?.iframe_token) {
      // PayTR iFrameResizer script'ini yükle
      const script = document.createElement("script");
      script.src = "https://www.paytr.com/js/iframeResizer.min.js";
      script.onload = () => {
        if ((window as any).iFrameResize) {
          (window as any).iFrameResize({}, "#paytriframe");
        }
      };
      document.head.appendChild(script);
      return () => {
        document.head.removeChild(script);
      };
    }
  }, [checkoutMutation.data?.iframe_token]);

  // Loading state
  if (checkoutMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Ödeme hazırlanıyor...</h2>
          <p className="text-gray-500 mt-2">Lütfen bekleyin, güvenli ödeme sayfası yükleniyor.</p>
        </div>
      </div>
    );
  }

  // Error state
  if (checkoutMutation.isError) {
    const error = checkoutMutation.error as any;
    const message = error?.response?.data?.detail || "Ödeme başlatılamadı. Lütfen tekrar deneyin.";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Ödeme Başlatılamadı</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={() => router.push("/cart")}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            Sepete Dön
          </button>
        </div>
      </div>
    );
  }

  const data = checkoutMutation.data;
  if (!data?.iframe_token) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Güvenli Ödeme</h1>
              <p className="text-sm text-gray-500">Sipariş: #{data.order_number}</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-teal-700">{data.total} TL</p>
          </div>
        </div>
      </div>

      {/* PayTR iFrame */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          {!iframeLoaded && (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
              <span className="ml-3 text-gray-600">Ödeme formu yükleniyor...</span>
            </div>
          )}
          <iframe
            id="paytriframe"
            ref={iframeRef}
            src={data.iframe_url}
            frameBorder="0"
            scrolling="no"
            style={{ width: "100%", minHeight: iframeLoaded ? undefined : 0 }}
            onLoad={() => setIframeLoaded(true)}
          />
        </div>

        {/* Test modu: Simülasyon butonları (sadece development'ta) */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-800 text-sm">Test Modu — Callback Simülasyonu</span>
            </div>
            <p className="text-xs text-amber-700 mb-3">
              PayTR callback'i local'e ulaşamaz. Bu butonlarla ödeme sonucunu simüle edebilirsin.
            </p>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await api.post("/payments/simulate-callback", null, {
                      params: { order_number: data.order_number, status: "success" },
                    });
                    router.push(`/payment/success?oid=${data.order_id}`);
                  } catch (err: any) {
                    alert(err?.response?.data?.detail || "Simülasyon hatası");
                  }
                }}
                className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
              >
                Basarili Odeme Simule Et
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.post("/payments/simulate-callback", null, {
                      params: { order_number: data.order_number, status: "failed" },
                    });
                    router.push("/payment/fail");
                  } catch (err: any) {
                    alert(err?.response?.data?.detail || "Simülasyon hatası");
                  }
                }}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Basarisiz Odeme Simule Et
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>256-bit SSL ile korunan güvenli ödeme altyapısı</p>
          <p className="mt-1">PayTR Ödeme Kuruluşu A.Ş. tarafından sağlanmaktadır</p>
        </div>
      </div>
    </div>
  );
}
