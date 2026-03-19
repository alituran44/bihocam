"use client";

import { useRouter } from "next/navigation";
import { XCircle, ArrowLeft, HelpCircle } from "lucide-react";
import Link from "next/link";

export default function PaymentFailPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
      <div className="bg-white rounded-2xl shadow-xl p-10 max-w-lg text-center">
        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <XCircle className="w-12 h-12 text-red-500" />
        </div>

        <h1 className="text-2xl font-bold text-gray-800 mb-2">Ödeme Başarısız</h1>
        <p className="text-gray-600 mb-6">
          Ödemeniz tamamlanamadı. Kartınızın limitini kontrol edin veya farklı bir kart ile tekrar deneyin.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-left">
          <div className="flex gap-3">
            <HelpCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-amber-800">
              <p className="font-medium mb-1">Sık karşılaşılan nedenler:</p>
              <ul className="list-disc list-inside space-y-1 text-amber-700">
                <li>Yetersiz bakiye veya limit</li>
                <li>3D Secure doğrulama hatası</li>
                <li>Kart bilgileri hatalı girilmiş</li>
                <li>Bankanız işlemi engellemiş olabilir</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => router.push("/cart")}
            className="flex items-center justify-center gap-2 px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
          >
            <ArrowLeft className="w-5 h-5" />
            Sepete Dön
          </button>
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
