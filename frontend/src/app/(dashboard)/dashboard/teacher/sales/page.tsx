"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { teacherSalesApi, type TeacherSaleItem, type TeacherSalesSummary } from "@/lib/api";

export default function TeacherSalesPage() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const { data: summary, isLoading: summaryLoading } = useQuery({
    queryKey: ["teacher-sales-summary"],
    queryFn: () => teacherSalesApi.summary(),
  });

  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: ["teacher-sales-list", fromDate, toDate],
    queryFn: () =>
      teacherSalesApi.list({
        limit: 100,
        from_date: fromDate || undefined,
        to_date: toDate || undefined,
      }),
  });

  const formatMoney = (amount: number) =>
    new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
    }).format(amount);

  const kpi = (summary as TeacherSalesSummary) || {
    total_sales_count: 0,
    total_revenue: 0,
    this_month_revenue: 0,
    average_order_amount: 0,
    currency: "TRY",
  };

  const rows = (sales as TeacherSaleItem[]) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Toplam Satış</p>
          <p className="text-2xl font-bold text-gray-900">{kpi.total_sales_count}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Toplam Gelir</p>
          <p className="text-2xl font-bold text-emerald-600">{formatMoney(kpi.total_revenue)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Bu Ay</p>
          <p className="text-2xl font-bold text-teal-600">{formatMoney(kpi.this_month_revenue)}</p>
        </div>
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <p className="text-sm text-gray-500">Ortalama Sipariş</p>
          <p className="text-2xl font-bold text-indigo-600">{formatMoney(kpi.average_order_amount)}</p>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <input
            type="date"
            value={fromDate}
            onChange={(e) => setFromDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <input
            type="date"
            value={toDate}
            onChange={(e) => setToDate(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
          />
          <button
            onClick={() => {
              setFromDate("");
              setToDate("");
            }}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50"
          >
            Filtreyi Temizle
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-gray-200 bg-white overflow-hidden">
        {summaryLoading || salesLoading ? (
          <div className="p-8 text-center text-gray-600">Yükleniyor...</div>
        ) : rows.length === 0 ? (
          <div className="p-8 text-center text-gray-600">Satış kaydı bulunamadı.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr className="text-left text-gray-600">
                  <th className="px-4 py-3 font-semibold">Tarih</th>
                  <th className="px-4 py-3 font-semibold">Sipariş</th>
                  <th className="px-4 py-3 font-semibold">Kurs</th>
                  <th className="px-4 py-3 font-semibold">Öğrenci</th>
                  <th className="px-4 py-3 font-semibold">Tutar</th>
                  <th className="px-4 py-3 font-semibold">Komisyon</th>
                  <th className="px-4 py-3 font-semibold">Net Kazanç</th>
                  <th className="px-4 py-3 font-semibold">Durum</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row) => (
                  <tr key={`${row.order_id}-${row.course_id}`} className="border-t border-gray-100">
                    <td className="px-4 py-3 text-gray-700">{new Date(row.created_at).toLocaleString("tr-TR")}</td>
                    <td className="px-4 py-3 font-medium text-gray-900">{row.order_number}</td>
                    <td className="px-4 py-3 text-gray-900">{row.course_title}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{row.student_name}</p>
                      <p className="text-xs text-gray-500">{row.student_email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-900">{formatMoney(row.gross_amount)}</td>
                    <td className="px-4 py-3 text-red-600">-{formatMoney(row.commission_amount)}</td>
                    <td className="px-4 py-3 font-semibold text-emerald-700">{formatMoney(row.net_earning)}</td>
                    <td className="px-4 py-3">
                      <span className="inline-flex rounded-full border border-gray-200 bg-gray-50 px-2.5 py-1 text-xs font-medium text-gray-700">
                        {row.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
