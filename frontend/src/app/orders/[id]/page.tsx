"use client";

import { ReactNode } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface OrderItem {
  id: string;
  course: {
    id: string;
    title: string;
    slug: string;
    thumbnail_path?: string | null;
    teacher?: {
      full_name: string;
    } | null;
  };
  final_price: number;
  price_at_order: number;
}

interface OrderDetail {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  discount_amount: number;
  status: "pending" | "paid" | "failed" | "refunded" | "cancelled";
  created_at: string;
  paid_at?: string | null;
  coupon_code?: string | null;
  payment_method?: string | null;
  order_items: OrderItem[];
}

const statusConfig: Record<string, { label: string; color: string; icon: ReactNode }> = {
  paid: {
    label: "Ödendi",
    color: "bg-emerald-50 text-emerald-700 border-emerald-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  pending: {
    label: "Beklemede",
    color: "bg-amber-50 text-amber-700 border-amber-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  failed: {
    label: "Başarısız",
    color: "bg-red-50 text-red-700 border-red-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  refunded: {
    label: "İade Edildi",
    color: "bg-violet-50 text-violet-700 border-violet-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
  cancelled: {
    label: "İptal Edildi",
    color: "bg-gray-50 text-gray-700 border-gray-300",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
  },
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id as string;

  const { data: order, isLoading, error } = useQuery<OrderDetail>({
    queryKey: ["order-detail", orderId],
    queryFn: () => ordersApi.get(orderId),
    enabled: !!orderId,
  });

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-gray-200 rounded-xl w-1/3 mb-8"></div>
            <div className="bg-white rounded-2xl p-8 border border-gray-100 shadow-sm">
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-8"></div>
              <div className="space-y-4">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-24 bg-gray-200 rounded-xl"></div>
                ))}
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
          <div className="bg-white rounded-2xl p-12 text-center border border-red-200 shadow-sm">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Sipariş bulunamadı</h2>
            <p className="text-gray-600 mb-8">Bu siparişe erişim yetkiniz yok veya sipariş mevcut değil.</p>
            <Link
              href="/dashboard/orders"
              className="inline-flex items-center gap-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
            >
              Siparişlerime Dön
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const status = statusConfig[order.status] || statusConfig.pending;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-12">
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/dashboard/orders"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-teal-600 transition-colors mb-4"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Siparişlerime Dön
          </Link>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Sipariş Detayı</h1>
              <p className="text-gray-600 font-mono text-lg">#{order.order_number}</p>
            </div>
            <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border-2 ${status.color}`}>
              {status.icon}
              {status.label}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Sol Taraf - Sipariş İçeriği */}
          <div className="lg:col-span-2 space-y-6">
            {/* Sipariş Bilgileri */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Bilgileri</h2>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Sipariş Tarihi</p>
                  <p className="text-base font-medium text-gray-900">{formatDate(order.created_at)}</p>
                </div>
                {order.paid_at && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Ödeme Tarihi</p>
                    <p className="text-base font-medium text-gray-900">{formatDate(order.paid_at)}</p>
                  </div>
                )}
                {order.payment_method && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Ödeme Yöntemi</p>
                    <p className="text-base font-medium text-gray-900 capitalize">{order.payment_method.replace("_", " ")}</p>
                  </div>
                )}
                {order.coupon_code && (
                  <div>
                    <p className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">Kullanılan Kupon</p>
                    <p className="text-base font-medium text-gray-900 font-mono">{order.coupon_code}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Kurslar */}
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Siparişteki Kurslar ({order.order_items.length})</h2>
              <div className="space-y-4">
                {order.order_items.map((item) => (
                  <div key={item.id} className="flex gap-4 p-4 border-2 border-gray-100 rounded-xl hover:border-teal-200 transition-colors">
                    {/* Thumbnail */}
                    <div className="w-32 h-24 bg-gradient-to-br from-teal-100 to-teal-200 rounded-xl flex-shrink-0 overflow-hidden">
                      {item.course.thumbnail_path ? (
                        <img src={item.course.thumbnail_path} alt={item.course.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-10 h-10 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253" />
                          </svg>
                        </div>
                      )}
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 min-w-0">
                      <Link href={`/courses/${item.course.slug}`} className="hover:text-teal-600 transition-colors">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 line-clamp-2">{item.course.title}</h3>
                      </Link>
                      {item.course.teacher && (
                        <p className="text-sm text-gray-600 mb-3 flex items-center gap-1">
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          {item.course.teacher.full_name}
                        </p>
                      )}
                      <div className="flex items-center justify-between">
                        <div>
                          {item.price_at_order !== item.final_price && (
                            <p className="text-sm text-gray-400 line-through mb-1">₺{Number(item.price_at_order).toFixed(2)}</p>
                          )}
                          <p className="text-xl font-bold text-teal-600">₺{Number(item.final_price).toFixed(2)}</p>
                        </div>
                        {order.status === "paid" && (
                          <Link
                            href={`/dashboard/courses/${item.course.id}`}
                            className="px-4 py-2 bg-teal-500 hover:bg-teal-600 text-white rounded-lg font-semibold text-sm transition-colors"
                          >
                            Kursa Git
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sağ Taraf - Özet */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm sticky top-24">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Sipariş Özeti</h2>

              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-600">
                  <span>Ara Toplam</span>
                  <span className="font-medium">₺{Number(order.subtotal).toFixed(2)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-emerald-600">
                    <span>İndirim</span>
                    <span className="font-medium">-₺{Number(order.discount_amount).toFixed(2)}</span>
                  </div>
                )}
                <div className="border-t border-gray-200 pt-4 flex justify-between text-xl font-bold text-gray-900">
                  <span>Toplam</span>
                  <span className="text-teal-600">₺{Number(order.total).toFixed(2)}</span>
                </div>
              </div>

              {order.status === "paid" && (
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-emerald-900">Ödeme Tamamlandı</p>
                  </div>
                  <p className="text-xs text-emerald-700">
                    Kurslara erişim sağlandı. Eğitimlerinize başlayabilirsiniz.
                  </p>
                </div>
              )}

              {order.status === "pending" && (
                <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl mb-6">
                  <div className="flex items-center gap-2 mb-2">
                    <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-sm font-semibold text-amber-900">Ödeme Bekleniyor</p>
                  </div>
                  <p className="text-xs text-amber-700">
                    Ödeme tamamlandığında kurslara erişim sağlanacaktır.
                  </p>
                </div>
              )}

              <Link
                href="/dashboard/orders"
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 rounded-xl font-semibold transition-colors text-center block"
              >
                Tüm Siparişlerim
              </Link>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
