"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useMutation } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import {
  Loader2,
  ShieldCheck,
  AlertCircle,
  FlaskConical,
  User,
  Phone,
  MapPin,
  ArrowRight,
  CreditCard,
  Building2,
  CheckCircle2,
  Copy,
  ChevronLeft,
} from "lucide-react";
import { api } from "@/lib/api";

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-12 h-12 animate-spin text-teal-600" /></div>}>
      <CheckoutContent />
    </Suspense>
  );
}

type Step = "info" | "method" | "payment";
type PaymentMethod = "card" | "transfer" | null;

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuthStore();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [iframeLoaded, setIframeLoaded] = useState(false);

  const [step, setStep] = useState<Step>("info");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const [agreed, setAgreed] = useState(false);

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

  // Step 1: Validate billing info
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
    if (!agreed) {
      setFormError("Devam etmek için Mesafeli Satış Sözleşmesi ve Üyelik Sözleşmesi'ni kabul etmelisiniz.");
      return;
    }

    setStep("method");
  };

  // Step 2: Select payment method and proceed
  const handleSelectMethod = (method: PaymentMethod) => {
    setPaymentMethod(method);
    setStep("payment");
    if (method === "card") {
      checkoutMutation.mutate();
    }
  };

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(null), 2000);
  };

  const getStepLabel = (s: Step) => {
    if (s === "info") return 1;
    if (s === "method") return 2;
    return 3;
  };

  const StepIndicator = ({ current }: { current: Step }) => (
    <div className="flex items-center gap-2 mt-3">
      {[
        { num: 1, label: "Bilgiler", key: "info" as Step },
        { num: 2, label: "Yöntem", key: "method" as Step },
        { num: 3, label: "Ödeme", key: "payment" as Step },
      ].map((s, idx) => {
        const active = getStepLabel(current) >= s.num;
        const isCurrent = current === s.key;
        return (
          <div key={s.key} className="flex items-center gap-1.5">
            <div
              className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                active
                  ? "bg-teal-600 text-white"
                  : "bg-gray-200 text-gray-400"
              } ${isCurrent ? "ring-2 ring-teal-300 ring-offset-1" : ""}`}
            >
              {getStepLabel(current) > s.num ? (
                <CheckCircle2 className="w-4 h-4" />
              ) : (
                s.num
              )}
            </div>
            <span className={`text-sm font-medium ${active ? "text-teal-700" : "text-gray-400"}`}>
              {s.label}
            </span>
            {idx < 2 && <div className="w-6 h-px bg-gray-300 mx-1" />}
          </div>
        );
      })}
    </div>
  );

  // ─── STEP 1: BILLING INFO ───
  if (step === "info") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/20">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
              <h1 className="text-lg font-semibold text-gray-800">Güvenli Ödeme</h1>
            </div>
            <StepIndicator current="info" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmitInfo} className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8 space-y-5">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-1">Fatura Bilgileri</h2>
              <p className="text-gray-500 text-sm">
                Ödeme işlemine devam etmek için fatura bilgilerinizi doldurun.
              </p>
            </div>

            {formError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-sm text-red-700 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
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
                placeholder="Ahmet Yılmaz"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50"
                required
              />
            </div>

            {/* Telefon */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                <Phone className="w-4 h-4 inline mr-1.5 text-gray-400" />
                Telefon Numarası <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={billingInfo.phone}
                onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                placeholder="05321234567"
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all bg-gray-50"
                required
              />
              <p className="text-xs text-gray-400 mt-1">05 ile başlayan 11 haneli telefon numarası</p>
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
                placeholder="Mahalle, sokak, bina no, daire no, ilçe, il"
                rows={3}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all resize-none bg-gray-50"
                required
              />
            </div>

            {/* Agreements Checkbox */}
            <div className="flex items-start gap-3 text-sm text-gray-600 bg-slate-50 p-4 rounded-xl border border-gray-100">
              <input
                id="agree-checkbox"
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500 cursor-pointer"
                required
              />
              <label htmlFor="agree-checkbox" className="cursor-pointer hover:text-gray-900 leading-normal font-semibold">
                <Link href="/pages/mesafeli-satis-sozlesmesi" target="_blank" className="text-teal-600 hover:underline font-bold">Mesafeli Satış Sözleşmesi</Link>
                {" ve "}
                <Link href="/pages/uyelik-sozlesmesi" target="_blank" className="text-teal-600 hover:underline font-bold">Üyelik Sözleşmesi</Link>
                &apos;ni okudum ve kabul ediyorum. *
              </label>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all font-semibold text-base"
            >
              Ödeme Yöntemini Seç
              <ArrowRight className="w-5 h-5" />
            </button>

            {/* Security badges */}
            <div className="flex items-center justify-center gap-4 pt-2">
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                256-bit SSL
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <CreditCard className="w-4 h-4 text-teal-500" />
                Güvenli Ödeme
              </div>
              <div className="w-px h-4 bg-gray-200" />
              <div className="flex items-center gap-1.5 text-xs text-gray-400">
                <ShieldCheck className="w-4 h-4 text-teal-500" />
                3D Secure
              </div>
            </div>
          </form>
        </div>
      </div>
    );
  }

  // ─── STEP 2: PAYMENT METHOD SELECTION ───
  if (step === "method") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/20">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-2xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
              <h1 className="text-lg font-semibold text-gray-800">Güvenli Ödeme</h1>
            </div>
            <StepIndicator current="method" />
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-1">Ödeme Yöntemi Seçin</h2>
              <p className="text-gray-500 text-sm">Tercih ettiğiniz ödeme yöntemiyle işleminizi tamamlayın.</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Credit Card Option */}
              <button
                id="payment-method-card"
                onClick={() => handleSelectMethod("card")}
                className="group relative flex flex-col items-center gap-4 p-6 border-2 border-gray-200 rounded-2xl hover:border-teal-500 hover:bg-teal-50/30 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-200 text-left cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base mb-1">Kredi / Banka Kartı</p>
                  <p className="text-sm text-gray-500">Visa, Mastercard, Troy</p>
                  <p className="text-xs text-gray-400 mt-2">Taksit imkânı mevcuttur</p>
                </div>
                {/* Card logos */}
                <div className="flex items-center gap-2 mt-auto">
                  {["VISA", "MC", "TROY"].map((brand) => (
                    <span
                      key={brand}
                      className="px-2 py-1 bg-gray-100 rounded text-[10px] font-bold text-gray-600 tracking-wide"
                    >
                      {brand}
                    </span>
                  ))}
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-teal-500 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </div>
              </button>

              {/* Bank Transfer Option */}
              <button
                id="payment-method-transfer"
                onClick={() => handleSelectMethod("transfer")}
                className="group relative flex flex-col items-center gap-4 p-6 border-2 border-gray-200 rounded-2xl hover:border-blue-500 hover:bg-blue-50/30 hover:shadow-lg hover:shadow-blue-500/10 transition-all duration-200 text-left cursor-pointer"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
                  <Building2 className="w-8 h-8 text-white" />
                </div>
                <div className="text-center">
                  <p className="font-bold text-gray-900 text-base mb-1">Havale / EFT</p>
                  <p className="text-sm text-gray-500">Tüm bankalar geçerli</p>
                  <p className="text-xs text-gray-400 mt-2">Manuel onay gerekir (1–2 iş günü)</p>
                </div>
                {/* Bank icon */}
                <div className="flex items-center gap-2 mt-auto">
                  <span className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-[10px] font-bold tracking-wide border border-blue-200">
                    TÜM BANKALAR
                  </span>
                </div>
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                    <ArrowRight className="w-3 h-3 text-white" />
                  </div>
                </div>
              </button>
            </div>

            <button
              onClick={() => setStep("info")}
              className="mt-6 flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" />
              Fatura bilgilerine geri dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 3a: BANK TRANSFER INSTRUCTIONS ───
  if (step === "payment" && paymentMethod === "transfer") {
    const bankAccounts = [
      {
        bank: "Ziraat Bankası",
        color: "from-red-500 to-red-600",
        iban: "TR12 0001 0017 4500 0058 4900 01",
        accountName: "BiHocam Eğitim Teknolojileri A.Ş.",
        accountNo: "4500 0058 4900 01",
        branch: "İstanbul Şubesi",
      },
      {
        bank: "Garanti BBVA",
        color: "from-green-500 to-green-600",
        iban: "TR34 0006 2000 3340 0006 2994 04",
        accountName: "BiHocam Eğitim Teknolojileri A.Ş.",
        accountNo: "6299404",
        branch: "İstanbul Şubesi",
      },
      {
        bank: "İş Bankası",
        color: "from-blue-500 to-blue-700",
        iban: "TR56 0006 4000 0011 2345 6789 01",
        accountName: "BiHocam Eğitim Teknolojileri A.Ş.",
        accountNo: "123456789",
        branch: "İstanbul Şubesi",
      },
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50/20">
        <div className="bg-white border-b border-gray-200 shadow-sm">
          <div className="max-w-3xl mx-auto px-4 py-4">
            <div className="flex items-center gap-3">
              <ShieldCheck className="w-6 h-6 text-teal-600" />
              <h1 className="text-lg font-semibold text-gray-800">Havale / EFT ile Ödeme</h1>
            </div>
            <StepIndicator current="payment" />
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 py-8 space-y-5">
          {/* Info box */}
          <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5 flex gap-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <Building2 className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="font-semibold text-blue-900 mb-1">Havale Talimatları</p>
              <ul className="text-sm text-blue-700 space-y-1 list-disc list-inside">
                <li>Aşağıdaki banka hesaplarından birine transfer yapın.</li>
                <li>Açıklama kısmına <strong>adınızı ve e-posta adresinizi</strong> yazın.</li>
                <li>Transfer sonrası sisteminiz <strong>1–2 iş günü</strong> içinde aktif edilir.</li>
                <li>Dekontu <strong>destek@bihocam.com</strong> adresine iletebilirsiniz.</li>
              </ul>
            </div>
          </div>

          {/* Bank accounts */}
          {bankAccounts.map((acc) => (
            <div key={acc.bank} className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className={`bg-gradient-to-r ${acc.color} px-5 py-3 flex items-center gap-3`}>
                <Building2 className="w-5 h-5 text-white/80" />
                <span className="font-bold text-white text-sm">{acc.bank}</span>
              </div>
              <div className="p-5 space-y-3">
                {[
                  { label: "Hesap Adı", value: acc.accountName, key: `${acc.bank}-name` },
                  { label: "IBAN", value: acc.iban, key: `${acc.bank}-iban` },
                  { label: "Hesap No", value: acc.accountNo, key: `${acc.bank}-acc` },
                  { label: "Şube", value: acc.branch, key: `${acc.bank}-branch` },
                ].map((row) => (
                  <div key={row.key} className="flex items-center justify-between gap-4">
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-0.5">{row.label}</p>
                      <p className="text-sm font-mono font-medium text-gray-900">{row.value}</p>
                    </div>
                    <button
                      onClick={() => handleCopy(row.value, row.key)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                        copied === row.key
                          ? "bg-teal-100 text-teal-700"
                          : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {copied === row.key ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5" /> Kopyalandı
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Kopyala
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={() => router.push("/dashboard")}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all font-semibold"
            >
              <CheckCircle2 className="w-5 h-5" />
              Tamam, Anladım
            </button>
            <button
              onClick={() => setStep("method")}
              className="flex items-center justify-center gap-2 px-6 py-3.5 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Geri Dön
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 3b: CARD PAYMENT (PayTR iFrame) ───

  if (checkoutMutation.isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-teal-50/20">
        <div className="text-center">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
          </div>
          <h2 className="text-xl font-semibold text-gray-800">Ödeme hazırlanıyor...</h2>
          <p className="text-gray-500 mt-2">Lütfen bekleyin, güvenli ödeme sayfası yükleniyor.</p>
        </div>
      </div>
    );
  }

  if (checkoutMutation.isError) {
    const error = checkoutMutation.error as any;
    const message = error?.response?.data?.detail || "Ödeme başlatılamadı. Lütfen tekrar deneyin.";
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-red-50/20">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8 max-w-md text-center">
          <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Kart ile Ödeme Başlatılamadı</h2>
          <p className="text-gray-600 mb-6 text-sm">{message}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={() => { checkoutMutation.reset(); handleSelectMethod("transfer"); }}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl hover:shadow-lg transition-all font-semibold"
            >
              <Building2 className="w-4 h-4" />
              Havale / EFT ile Öde
            </button>
            <button
              onClick={() => { setStep("method"); checkoutMutation.reset(); }}
              className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
            >
              <ChevronLeft className="w-4 h-4" />
              Ödeme Yöntemini Değiştir
            </button>
          </div>
        </div>
      </div>
    );
  }

  const data = checkoutMutation.data;
  if (!data?.iframe_token) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-teal-50/20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-3xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-teal-600" />
            <div>
              <h1 className="text-lg font-semibold text-gray-800">Güvenli Ödeme</h1>
              <p className="text-sm text-gray-500">Sipariş: #{data.order_number}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <StepIndicator current="payment" />
            <p className="text-2xl font-bold text-teal-700 ml-4">{data.total} TL</p>
          </div>
        </div>
      </div>

      {/* PayTR iFrame */}
      <div className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
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

        {/* Test mode */}
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
                Başarılı Simüle Et
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
                Başarısız Simüle Et
              </button>
            </div>
          </div>
        )}

        <div className="mt-6 text-center text-sm text-gray-400 flex items-center justify-center gap-4">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-500" />
            256-bit SSL korumalı
          </span>
          <span className="w-px h-4 bg-gray-200" />
          <span>PayTR Ödeme Kuruluşu A.Ş.</span>
        </div>
      </div>
    </div>
  );
}
