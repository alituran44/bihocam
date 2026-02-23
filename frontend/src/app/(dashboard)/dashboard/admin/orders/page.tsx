"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { ordersApi } from "@/lib/api";

type OrderStatus = "pending" | "paid" | "failed" | "refunded" | "cancelled";

interface AdminOrder {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  discount_amount: number;
  status: OrderStatus;
  created_at: string;
  paid_at?: string | null;
  coupon_code?: string | null;
  user?: {
    id: string;
    full_name: string;
    email: string;
  };
}

const statusLabel: Record<OrderStatus, string> = {
  pending: "Beklemede",
  paid: "Ödendi",
  failed: "Başarısız",
  refunded: "İade",
  cancelled: "İptal",
};

const statusColor: Record<OrderStatus, string> = {
  pending: "bg-amber-50 text-amber-800 border-amber-300",
  paid: "bg-emerald-50 text-emerald-800 border-emerald-300",
  failed: "bg-rose-50 text-rose-800 border-rose-300",
  refunded: "bg-sky-50 text-sky-800 border-sky-300",
  cancelled: "bg-slate-50 text-slate-800 border-slate-300",
};

export default function AdminOrdersPage() {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<OrderStatus | "all">("all");
  const [q, setQ] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["admin-orders", status, q, dateFrom, dateTo],
    queryFn: () =>
      ordersApi.listAll({
        limit: 100,
        status: status === "all" ? undefined : status,
        q: q || undefined,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
  });

  const completeMutation = useMutation({
    mutationFn: ({ orderId, txId }: { orderId: string; txId?: string }) =>
      ordersApi.completeAdmin(orderId, txId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      setSelectedOrderId(null);
      setTransactionId("");
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (orderId: string) => ordersApi.cancelAdmin(orderId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
    },
  });

  const orders = ((data as AdminOrder[]) || []).slice();

  const stats = useMemo(() => {
    const paidOrders = orders.filter((o) => o.status === "paid");
    return {
      totalCount: orders.length,
      paidCount: paidOrders.length,
      pendingCount: orders.filter((o) => o.status === "pending").length,
      revenue: paidOrders.reduce((sum, o) => sum + Number(o.total || 0), 0),
    };
  }, [orders]);

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);

  const formatDate = (value?: string | null) => {
    if (!value) return "-";
    return new Date(value).toLocaleString("tr-TR", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-orange-50/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Sipariş Yönetimi
              </h1>
              <p className="text-teal-100 text-lg">
                {orders.length > 0 ? `${orders.length} sipariş` : "Tüm siparişleri görüntüle ve yönet"}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 opacity-50"></div>
          <div className="relative">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">Toplam Sipariş</p>
            <p className="text-3xl font-bold text-slate-900 lg:text-4xl">{stats.totalCount}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-emerald-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-emerald-200 to-emerald-300 opacity-40"></div>
          <div className="relative">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-emerald-700">Ödenen</p>
            <p className="text-3xl font-bold text-emerald-800 lg:text-4xl">{stats.paidCount}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-amber-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-amber-200 to-amber-300 opacity-40"></div>
          <div className="relative">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-700">Bekleyen</p>
            <p className="text-3xl font-bold text-amber-800 lg:text-4xl">{stats.pendingCount}</p>
          </div>
        </div>

        <div className="group relative overflow-hidden bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-teal-200/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl">
          <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-gradient-to-br from-teal-200 to-teal-300 opacity-40"></div>
          <div className="relative">
            <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-teal-700">Toplam Ciro</p>
            <p className="text-3xl font-bold text-teal-800 lg:text-4xl">{formatMoney(stats.revenue)}</p>
          </div>
        </div>
      </div>

      {/* Search & Filters - Glassmorphism */}
      <div className="mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
          <input
                type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
                placeholder="Kullanıcı adı veya e-posta ara..."
                className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-transparent rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-3">
            {/* Status Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 mr-2">Durum:</span>
              {[
                { value: "all", label: "Tümü", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
                { value: "pending", label: "Beklemede", color: "bg-amber-100 text-amber-700 hover:bg-amber-200" },
                { value: "paid", label: "Ödendi", color: "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" },
                { value: "failed", label: "Başarısız", color: "bg-rose-100 text-rose-700 hover:bg-rose-200" },
                { value: "refunded", label: "İade", color: "bg-sky-100 text-sky-700 hover:bg-sky-200" },
                { value: "cancelled", label: "İptal", color: "bg-slate-100 text-slate-700 hover:bg-slate-200" },
              ].map((statusOption) => (
                <button
                  key={statusOption.value}
                  onClick={() => setStatus(statusOption.value as OrderStatus | "all")}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    status === statusOption.value
                      ? `${statusOption.color} ring-2 ring-offset-2 ring-teal-400 shadow-md`
                      : `${statusOption.color}`
                  }`}
                >
                  {statusOption.label}
                </button>
              ))}
            </div>

            {/* Date Filters */}
            <div className="flex items-center gap-2 flex-wrap ml-auto">
          <input
            type="date"
            value={dateFrom}
            onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-300"
          />
              <span className="text-gray-500 font-medium">-</span>
          <input
            type="date"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 rounded-xl border-2 border-gray-200 bg-white text-sm font-medium focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-300"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
        {isLoading ? (
          <div className="flex min-h-[400px] items-center justify-center p-12">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
              <span className="text-gray-600 font-medium">Yükleniyor...</span>
            </div>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex min-h-[400px] items-center justify-center p-12">
            <div className="text-center">
              <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <p className="text-xl font-semibold text-gray-700 mb-2">Sipariş bulunamadı</p>
              <p className="text-gray-500">Filtreleri değiştirerek tekrar deneyin</p>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-100">
              <thead className="bg-gradient-to-r from-gray-50 to-gray-100/50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Sipariş No</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Kullanıcı</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Toplam</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Kupon</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Durum</th>
                  <th className="px-6 py-4 text-left text-xs font-bold uppercase tracking-wider text-gray-700">Tarih</th>
                  <th className="px-6 py-4 text-right text-xs font-bold uppercase tracking-wider text-gray-700">İşlem</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {orders.map((order, idx) => (
                  <tr
                    key={order.id}
                    className="transition-colors hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-emerald-50/30"
                  >
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-mono text-sm font-semibold text-gray-900">{order.order_number}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="font-semibold text-gray-900">{order.user?.full_name || "-"}</p>
                      <p className="text-xs text-gray-500">{order.user?.email || "-"}</p>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4">
                      <span className="font-bold text-gray-900">{formatMoney(Number(order.total || 0))}</span>
                    </td>
                    <td className="px-6 py-4">
                      {order.coupon_code ? (
                        <span className="inline-flex items-center rounded-full bg-orange-50 px-2.5 py-1 text-xs font-medium text-orange-800 border border-orange-200">
                          {order.coupon_code}
                        </span>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full border px-3 py-1 text-xs font-semibold ${statusColor[order.status]}`}>
                        {statusLabel[order.status]}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-600">{formatDate(order.created_at)}</td>
                    <td className="whitespace-nowrap px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link
                          href={`/dashboard/admin/orders/${order.id}`}
                          className="rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm transition-all hover:border-teal-400 hover:bg-teal-50 hover:text-teal-700"
                        >
                          Detay
                        </Link>
                        {order.status === "pending" && (
                          <>
                            <button
                              onClick={() => setSelectedOrderId(order.id)}
                              className="rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-700 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-emerald-500/30 transition-all hover:from-emerald-700 hover:to-emerald-800 hover:shadow-lg"
                            >
                              Tamamla
                            </button>
                            <button
                              onClick={() => {
                                if (confirm("Sipariş iptal edilsin mi?")) {
                                  cancelMutation.mutate(order.id);
                                }
                              }}
                              className="rounded-lg bg-gradient-to-r from-rose-600 to-rose-700 px-3 py-1.5 text-xs font-semibold text-white shadow-md shadow-rose-500/30 transition-all hover:from-rose-700 hover:to-rose-800 hover:shadow-lg"
                            >
                              İptal
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Complete Order Modal */}
      {selectedOrderId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-3xl border border-white/20 bg-white/95 backdrop-blur-md p-8 shadow-2xl">
            <div className="mb-6">
              <h2 className="mb-2 text-2xl font-bold text-gray-900">Siparişi Tamamla</h2>
              <p className="text-sm text-gray-600">İstersen ödeme işlem numarasını girerek siparişi tamamlayabilirsin.</p>
            </div>
            <input
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              placeholder="Örn: PAY-12345"
              className="mb-6 w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm font-medium shadow-sm transition-all focus:border-teal-400 focus:outline-none focus:ring-4 focus:ring-teal-100"
            />
            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setSelectedOrderId(null);
                  setTransactionId("");
                }}
                className="rounded-xl border-2 border-gray-200 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm transition-all hover:bg-gray-50"
              >
                Vazgeç
              </button>
              <button
                onClick={() =>
                  completeMutation.mutate({
                    orderId: selectedOrderId,
                    txId: transactionId || undefined,
                  })
                }
                disabled={completeMutation.isPending}
                className="rounded-xl bg-gradient-to-r from-teal-600 to-emerald-600 px-4 py-2.5 text-sm font-semibold text-white shadow-md shadow-teal-500/30 transition-all hover:from-teal-700 hover:to-emerald-700 hover:shadow-lg disabled:opacity-50"
              >
                {completeMutation.isPending ? "İşleniyor..." : "Onayla"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
