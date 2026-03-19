"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { paymentsApi } from "@/lib/api";
import { CheckCircle, BookOpen, Loader2 } from "lucide-react";
import Link from "next/link";

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center"><Loader2 className="w-10 h-10 animate-spin text-teal-600" /></div>}>
      <PaymentSuccessContent />
    </Suspense>
  );
}

function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("oid");

  const { data: status, isLoading } = useQuery({
    queryKey: ["payment-status", orderId],
    queryFn: () => paymentsApi.getStatus(orderId!),
    enabled: !!orderId,
    refetchInterval: (query) => {
      // Ödeme henüz pending ise 3 saniyede bir sorgula
      if (query.state.data?.status === "pending") return 3000;
      return false;
    },
  });

  if (!orderId) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Geçersiz sayfa.</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-10 h-10 animate-spin text-teal-600" />
      </div>
    );
  }

  // Callback henüz gelmemiş olabilir — pending durumda bekle
  if (status?.status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-800">Ödemeniz kontrol ediliyor...</h2>
          <p className="text-gray-500 mt-2">Birkaç saniye içinde sonuçlanacak.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-12 h-12 text-emerald-600" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ödemeniz Tamamlandı!</h1>
        <p className="text-gray-600 mb-1">
          Sipariş numaranız: <span className="font-semibold">#{status?.order_number}</span>
        </p>
        {status?.payment_amount && (
          <p className="text-gray-600 mb-6">
            Ödenen tutar: <span className="font-semibold">{status.payment_amount} TL</span>
          </p>
        )}

        <p className="text-gray-500 mb-8">
          Kurslarınıza hemen erişmeye başlayabilirsiniz. Fatura bilgileriniz e-posta adresinize gönderilecektir.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/dashboard"
            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
          >
            <BookOpen className="w-5 h-5" />
            Kurslarıma Git
          </Link>
          <Link
            href="/courses"
            className="flex items-center justify-center gap-2 px-6 py-3 border-2 border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium"
          >
            Kurslara Göz At
          </Link>
        </div>
      </div>
    </div>
  );
}
