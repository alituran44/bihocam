"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { Loader2, ShieldCheck, AlertCircle, FlaskConical, User, Phone, MapPin, ArrowRight } from "lucide-react";
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

  // Adım 1: Fatura bilgileri, Adım 2: iFrame ödeme
  const [step, setStep] = useState<"info" | "payment">("info");

  // Fatura bilgileri formu
  const [billingInfo, setBillingInfo] = useState({
    full_name: user?.full_name || "",
    phone: "",
    address: "",
  });
  const [formError, setFormError] = useState("");

  const couponCode = searchParams.get("coupon") || undefined;

  const checkoutMutation = useMutation({
    mutationFn: () => paymentsApi.checkout(couponCode, billingInfo),
    onSuccess: (data) => {
      if (!data.iframe_token) {
        router.push(`/payment/success?oid=${data.order_id}`);
      }
    },
    onError: () => {},
  });

  useEffect(() => {
    if (!user) {
      router.push("/login");
    }
  }, []);

  // iFrame yüklendi
  useEffect(() => {
    if (checkoutMutation.data?.iframe_token) {
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

  // Adım 1: Bilgi formu doğrulama ve gönderme
  const handleSubmitInfo = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");

    if (!billingInfo.full_name.trim() || billingInfo.full_name.trim().length < 3) {
      setFormError("Ad soyad en az 3 karakter olmalı.");
      return;
    }
    if (!billingInfo.phone.trim() || !/^0[5]\d{9}$/.test(billingInfo.phone.trim())) {
      setFormError("Telefon numarası 05 ile başlamalı ve 11 haneli olmalı. (Örn: 05321234567)");
      return;
    }
    if (!billingInfo.address.trim() || billingInfo.address.trim().length < 10) {
      setFormError("Adres en az 10 karakter olmalı.");
      return;
    }

    setStep("payment");
    checkoutMutation.mutate();
  };

  // ─── ADIM 1: FATURA BİLGİLERİ ───
  if (step === "info") {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-white border-b border-gray-200">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
              <h1 className="text-lg font-semibold text-gray-800">Fatura Bilgileri</h1>
            </div>
            {/* Adım göstergesi */}
            <div className="flex items-center gap-2 mt-3">
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-bold">1</div>
                <span className="text-sm font-medium text-teal-700">Bilgiler</span>
              </div>
              <div className="w-8 h-px bg-gray-300" />
              <div className="flex items-center gap-1.5">
                <div className="w-7 h-7 rounded-full bg-gray-200 text-gray-400 flex items-center justify-center text-sm font-bold">2</div>
                <span className="text-sm text-gray-400">Odeme</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmitInfo} className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 space-y-5">
            <p className="text-gray-600 text-sm">
              Odeme islemine devam etmek icin fatura bilgilerinizi doldurun.
            </p>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700">
                {formError}
              </div>
            )}

            {/* Ad Soyad */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <User className="w-4 h-4 inline mr-1.5 text-gray-400" />
                Ad Soyad <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={billingInfo.full_name}
                onChange={(e) => setBillingInfo({ ...billingInfo, full_name: e.target.value })}
                placeholder="Ahmet Yilmaz"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                required
              />
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />
                Telefon Numarasi <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={billingInfo.phone}
                onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                placeholder="05321234567"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors"
                required
              />
              <p className="text-xs text-gray-400 mt-1">05 ile baslayan 11 haneli telefon numarasi</p>
            </div>

            {/* Adres */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <MapPin className="w-4 h-4 inline mr-1.5 text-gray-400" />
                Fatura Adresi <span className="text-red-500">*</span>
              </label>
              <textarea
                value={billingInfo.address}
                onChange={(e) => setBillingInfo({ ...billingInfo, address: e.target.value })}
                placeholder="Mahalle, sokak, bina no, daire no, ilce, il"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-colors resize-none"
                required
              />
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-semibold text-lg"
            >
              Odemeye Gec
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ─── ADIM 2: ÖDEME (iFrame) ───

  if (checkoutMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Odeme hazirlaniyor...</h2>
          <p className="text-gray-500 mt-2">Lutfen bekleyin, guvenli odeme sayfasi yukleniyor.</p>
        </div>
      </div>
    );
  }

  if (checkoutMutation.isError) {
    const error = checkoutMutation.error as any;
    const message = error?.response?.data?.detail || "Odeme baslatilamadi. Lutfen tekrar deneyin.";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800 mb-2">Odeme Baslatilamadi</h2>
          <p className="text-gray-600 mb-6">{message}</p>
          <button
            onClick={() => { setStep("info"); checkoutMutation.reset(); }}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors"
          >
            Geri Don
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
              <h1 className="text-lg font-semibold text-gray-800">Guvenli Odeme</h1>
              <p className="text-sm text-gray-500">Siparis: #{data.order_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {/* Adım göstergesi */}
            <div className="hidden sm:flex items-center gap-2 text-sm">
              <span className="text-teal-600 font-medium">Bilgiler</span>
              <div className="w-4 h-px bg-gray-300" />
              <div className="flex items-center gap-1">
                <div className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-xs font-bold">2</div>
                <span className="text-teal-700 font-medium">Odeme</span>
              </div>
            </div>
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
              <span className="ml-3 text-gray-600">Odeme formu yukleniyor...</span>
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

        {/* Test modu: Simülasyon butonları */}
        {process.env.NODE_ENV === "development" && (
          <div className="mt-6 bg-amber-50 border-2 border-dashed border-amber-300 rounded-xl p-4">
            <div className="flex items-center gap-2 mb-3">
              <FlaskConical className="w-5 h-5 text-amber-600" />
              <span className="font-semibold text-amber-800 text-sm">Test Modu</span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={async () => {
                  try {
                    await api.post("/payments/simulate-callback", null, {
                      params: { order_number: data.order_number, status: "success" },
                    });
                    router.push(`/payment/success?oid=${data.order_id}`);
                  } catch (err: any) {
                    alert(err?.response?.data?.detail || "Hata");
                  }
                }}
                className="flex-1 py-2 px-4 bg-emerald-600 text-white rounded-lg text-sm font-medium hover:bg-emerald-700"
              >
                Basarili Simule Et
              </button>
              <button
                onClick={async () => {
                  try {
                    await api.post("/payments/simulate-callback", null, {
                      params: { order_number: data.order_number, status: "failed" },
                    });
                    router.push("/payment/fail");
                  } catch (err: any) {
                    alert(err?.response?.data?.detail || "Hata");
                  }
                }}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700"
              >
                Basarisiz Simule Et
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-400">
          <p>256-bit SSL ile korunan guvenli odeme altyapisi</p>
          <p className="mt-1">PayTR Odeme Kurulusu A.S. tarafindan saglanmaktadir</p>
        </div>
      </div>
    </div>
  );
}
