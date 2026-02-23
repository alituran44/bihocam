"use client";

import { useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";

interface OrderItem {
  id: string;
  course?: {
    id: string;
    title: string;
    teacher?: {
      full_name: string;
    };
  };
  final_price: number;
  teacher_earnings: number;
}

interface TimelineEntry {
  status: string;
  at: string;
  note?: string;
}

interface OrderDetail {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  discount_amount: number;
  status: string;
  created_at: string;
  paid_at?: string | null;
  coupon_code?: string | null;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
  order_items?: OrderItem[];
  timeline?: TimelineEntry[];
}

const statusLabel: Record<string, string> = {
  pending: "Beklemede",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade",
  cancelled: "İptal",
};

const statusColor: Record<string, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-300",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-300",
  failed: "bg-rose-50 text-rose-800 border-rose-300",
  refunded: "bg-sky-50 text-sky-800 border-sky-300",
  cancelled: "bg-slate-50 text-slate-800 border-slate-300",
};

export default function AdminOrderDetailPage() {
  const params = useParams<{ id: string }>();
  const orderId = params?.id;
  const queryClient = useQueryClient();
  const [refundAmount, setRefundAmount] = useState("");
  const [refundReason, setRefundReason] = useState("");

  const { data: order, isLoading } = useQuery({
    queryKey: ["admin-order-detail", orderId],
    queryFn: () => ordersApi.getDetail(orderId as string),
    enabled: Boolean(orderId),
  });

  const refundMutation = useMutation({
    mutationFn: () =>
      ordersApi.refundAdmin(orderId as string, {
        amount: refundAmount ? Number(refundAmount) : undefined,
        reason: refundReason || undefined,
      }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-order-detail", orderId] });
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setRefundAmount("");
      setRefundReason("");
      alert("İade işlemi tamamlandı.");
    },
    onError: (error: any) => {
      alert(`Hata: ${error?.response?.data?.detail || error?.message || "Bilinmeyen hata"}`);
    },
  });

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-orange-50/20">
        <div className="text-center">
          <div className="mb-4 inline-block h-12 w-12 animate-spin rounded-full border-4 border-teal-200 border-t-teal-600"></div>
          <p className="text-sm font-medium text-slate-600">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-teal-50/30 to-orange-50/20">
        <div className="text-center">
          <div className="mb-4 text-6xl">❌</div>
          <p className="text-lg font-semibold text-slate-900">Sipariş bulunamadı</p>
          <Link href="/dashboard/admin/orders" className="mt-4 inline-block rounded-xl bg-teal-600 px-6 py-3 text-sm font-semibold text-white shadow-md transition-all hover:bg-teal-700">
            Sipariş Listesine Dön
          </Link>
        </div>
      </div>
    );
  }

  const orderData = order as OrderDetail;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-orange-50/20">
      <div className="space-y-8 p-6 lg:p-10">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
            <Link href="/dashboard/admin/orders" className="mb-4 inline-flex items-center gap-2 text-sm font-semibold text-slate-600 transition-colors hover:text-teal-700">
              <span>←</span> Sipariş Listesine Dön
            </Link>
            <h1 className="mb-2 text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl" style={{ fontFamily: "'Playfair Display', serif" }}>
              Sipariş Detayı
            </h1>
            <p className="text-lg text-slate-600 font-mono">{orderData.order_number}</p>
          </div>
          <span className={`inline-flex rounded-full border px-4 py-2 text-sm font-bold ${statusColor[orderData.status] || statusColor.pending}`}>
            {statusLabel[orderData.status] || orderData.status}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Order Items */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-lg shadow-slate-200/50">
              <div className="mb-6 flex items-center gap-2">
                <div className="h-1 w-12 rounded-full bg-gradient-to-r from-teal-600 to-orange-500"></div>
                <h2 className="text-xl font-bold text-slate-900">Sipariş Kalemleri</h2>
              </div>
              <div className="space-y-4">
                {(orderData.order_items || []).map((item) => (
                  <div key={item.id} className="rounded-xl border border-slate-200/60 bg-gradient-to-br from-slate-50 to-white p-6 shadow-sm">
                    <div className="mb-3">
                      <h3 className="text-lg font-bold text-slate-900">{item.course?.title || "Kurs bilgisi yok"}</h3>
                      {item.course?.teacher && (
                        <p className="mt-1 text-sm text-slate-600">Eğitmen: {item.course.teacher.full_name}</p>
                      )}
                    </div>
                    <div className="flex items-center justify-between border-t border-slate-200 pt-4">
                      <div>
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Net Fiyat</p>
                        <p className="mt-1 text-lg font-bold text-slate-900">{formatMoney(Number(item.final_price || 0))}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Öğretmen Kazancı</p>
                        <p className="mt-1 text-lg font-bold text-emerald-700">{formatMoney(Number(item.teacher_earnings || 0))}</p>
      </div>
      </div>
            </div>
          ))}
        </div>
      </div>

            {/* Timeline */}
            {(orderData.timeline || []).length > 0 && (
              <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-8 shadow-lg shadow-slate-200/50">
                <div className="mb-6 flex items-center gap-2">
                  <div className="h-1 w-12 rounded-full bg-gradient-to-r from-teal-600 to-orange-500"></div>
                  <h2 className="text-xl font-bold text-slate-900">Sipariş Geçmişi</h2>
                </div>
                <div className="relative space-y-6 pl-8">
                  <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-500 to-orange-500"></div>
                  {orderData.timeline.map((entry, idx) => (
                    <div key={`${entry.status}-${idx}`} className="relative">
                      <div className="absolute -left-11 top-1 h-6 w-6 rounded-full border-4 border-white bg-gradient-to-br from-teal-500 to-orange-500 shadow-md"></div>
                      <div className="rounded-xl border border-slate-200/60 bg-slate-50/50 p-4">
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-slate-900 capitalize">{statusLabel[entry.status] || entry.status}</span>
                          <span className="text-xs text-slate-600">{formatDate(entry.at)}</span>
                        </div>
                        {entry.note && <p className="mt-2 text-sm text-slate-600">{entry.note}</p>}
                      </div>
            </div>
          ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Order Summary */}
            <div className="rounded-2xl border border-slate-200/80 bg-white/80 backdrop-blur-sm p-6 shadow-lg shadow-slate-200/50">
              <div className="mb-4 flex items-center gap-2">
                <div className="h-1 w-8 rounded-full bg-gradient-to-r from-teal-600 to-orange-500"></div>
                <h3 className="text-lg font-bold text-slate-900">Sipariş Özeti</h3>
              </div>
              <div className="space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Müşteri</p>
                  <p className="mt-1 font-semibold text-slate-900">{orderData.user?.full_name || "-"}</p>
                  <p className="text-sm text-slate-600">{orderData.user?.email || "-"}</p>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <div className="mb-2 flex items-center justify-between text-sm">
                    <span className="text-slate-600">Ara Toplam</span>
                    <span className="font-semibold text-slate-900">{formatMoney(Number(orderData.subtotal || 0))}</span>
                  </div>
                  {orderData.discount_amount > 0 && (
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">İndirim</span>
                      <span className="font-semibold text-emerald-700">-{formatMoney(Number(orderData.discount_amount || 0))}</span>
                    </div>
                  )}
                  {orderData.coupon_code && (
                    <div className="mb-2 flex items-center justify-between text-sm">
                      <span className="text-slate-600">Kupon</span>
                      <span className="rounded-full bg-orange-50 px-2 py-1 text-xs font-bold text-orange-800 border border-orange-200">
                        {orderData.coupon_code}
                      </span>
                    </div>
                  )}
                  <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
                    <span className="font-bold text-slate-900">Toplam</span>
                    <span className="text-2xl font-bold text-teal-700">{formatMoney(Number(orderData.total || 0))}</span>
                  </div>
                </div>
                <div className="border-t border-slate-200 pt-4">
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">Oluşturulma</p>
                  <p className="mt-1 text-sm text-slate-700">{formatDate(orderData.created_at)}</p>
                  {orderData.paid_at && (
                    <>
                      <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-slate-500">Ödeme Tarihi</p>
                      <p className="mt-1 text-sm text-slate-700">{formatDate(orderData.paid_at)}</p>
                    </>
                  )}
                </div>
        </div>
      </div>

            {/* Refund Section */}
            {orderData.status === "paid" && (
              <div className="rounded-2xl border border-rose-200/80 bg-gradient-to-br from-rose-50/50 to-white p-6 shadow-lg shadow-rose-200/30">
                <div className="mb-4 flex items-center gap-2">
                  <div className="h-1 w-8 rounded-full bg-gradient-to-r from-rose-600 to-rose-500"></div>
                  <h3 className="text-lg font-bold text-slate-900">İade İşlemi</h3>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">
                      İade Tutarı (₺)
                    </label>
          <input
            type="number"
            min="0"
            step="0.01"
                      placeholder="Boş ise tam iade"
            value={refundAmount}
            onChange={(e) => setRefundAmount(e.target.value)}
                      className="w-full rounded-xl border border-slate-300/60 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          />
                    <p className="mt-1 text-xs text-slate-500">Boş bırakılırsa tam iade yapılır</p>
                  </div>
                  <div>
                    <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-600">İade Nedeni</label>
          <textarea
                      placeholder="İade nedeni (opsiyonel)"
            value={refundReason}
            onChange={(e) => setRefundReason(e.target.value)}
                      className="w-full rounded-xl border border-slate-300/60 bg-white px-4 py-3 text-sm shadow-sm transition-all focus:border-rose-500 focus:outline-none focus:ring-2 focus:ring-rose-500/20"
            rows={3}
          />
                  </div>
          <button
            onClick={() => {
              if (confirm("İade işlemini başlatmak istediğinize emin misiniz?")) {
                refundMutation.mutate();
              }
            }}
            disabled={refundMutation.isPending}
                    className="w-full rounded-xl bg-gradient-to-r from-rose-600 to-rose-700 px-4 py-3 text-sm font-bold text-white shadow-md shadow-rose-500/30 transition-all hover:from-rose-700 hover:to-rose-800 hover:shadow-lg hover:shadow-rose-500/40 disabled:opacity-50"
          >
            {refundMutation.isPending ? "İşleniyor..." : "İade Et"}
          </button>
                </div>
        </div>
      )}
          </div>
        </div>
      </div>
    </div>
  );
}
