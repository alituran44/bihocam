"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";
import { useState } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart,
  Area,
  AreaChart,
} from "recharts";

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

export default function TimeSeriesAnalyticsPage() {
  const [dateFrom, setDateFrom] = useState<string>(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState<string>(() => {
    return new Date().toISOString().split("T")[0];
  });
  const [groupBy, setGroupBy] = useState<"course" | "teacher">("course");
  const [interval, setInterval] = useState<"daily" | "weekly" | "monthly">("monthly");

  const { data: earningsData, isLoading, error } = useQuery({
    queryKey: ["earnings-report", dateFrom, dateTo, groupBy, interval],
    queryFn: () =>
      reportsApi.getEarningsReport({
        group_by: groupBy,
        interval: interval,
        date_from: dateFrom,
        date_to: dateTo,
      }),
    enabled: !!dateFrom && !!dateTo,
  });

  if (error) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-800">
          Veri yüklenirken bir hata oluştu. Lütfen sayfayı yenileyin.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Zaman Serisi Analizi
              </h1>
              <p className="text-teal-100 text-lg">
                Gelir, satış ve diğer metriklerin zaman içindeki trendlerini detaylı inceleyin
              </p>
            </div>
            <div className="hidden md:block">
              <svg className="w-32 h-32 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Toplam Gelir</span>
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? "..." : formatCurrency(earningsData?.total_revenue || 0)}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Toplam Satış</span>
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? "..." : earningsData?.total_count || 0}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Ortalama Gelir</span>
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {isLoading
              ? "..."
              : earningsData && earningsData.total_count > 0
              ? formatCurrency((earningsData.total_revenue || 0) / earningsData.total_count)
              : formatCurrency(0)}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Filtreler</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Başlangıç Tarihi</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Bitiş Tarihi</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Gruplama</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as "course" | "teacher")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="course">Kurs</option>
              <option value="teacher">Eğitmen</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Aralık</label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value as "daily" | "weekly" | "monthly")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="daily">Günlük</option>
              <option value="weekly">Haftalık</option>
              <option value="monthly">Aylık</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 gap-6">
        {/* Revenue Trend Line Chart */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Gelir Trendi</h3>
          <ResponsiveContainer width="100%" height={400}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Yükleniyor...</div>
            ) : earningsData && earningsData.data.length > 0 ? (
              <AreaChart data={earningsData.data}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} tickFormatter={(value) => formatCurrency(value)} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                  formatter={(value) => formatCurrency(Number(value ?? 0))}
                />
                <Legend />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Gelir"
                />
              </AreaChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Veri bulunamadı</div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Revenue & Count Composed Chart */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Gelir ve Satış Adedi</h3>
          <ResponsiveContainer width="100%" height={400}>
            {isLoading ? (
              <div className="flex items-center justify-center h-full text-gray-500">Yükleniyor...</div>
            ) : earningsData && earningsData.data.length > 0 ? (
              <ComposedChart data={earningsData.data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="label" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <YAxis
                  yAxisId="left"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <YAxis yAxisId="right" orientation="right" stroke="#6b7280" style={{ fontSize: "12px" }} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                  formatter={(value: any, name: any) => {
                    if (name === "Gelir") {
                      return formatCurrency(Number(value ?? 0));
                    }
                    return String(value);
                  }}
                />
                <Legend />
                <Bar yAxisId="right" dataKey="count" fill="#10b981" name="Satış Adedi" radius={[8, 8, 0, 0]} />
                <Line
                  yAxisId="left"
                  type="monotone"
                  dataKey="value"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  name="Gelir"
                  dot={{ fill: "#14b8a6", r: 4 }}
                />
              </ComposedChart>
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">Veri bulunamadı</div>
            )}
          </ResponsiveContainer>
        </div>

        {/* Data Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Detaylı Veri</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-700">Tarih</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Gelir</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Satış Adedi</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-700">Ortalama</th>
                </tr>
              </thead>
              <tbody>
                {isLoading ? (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Yükleniyor...
                    </td>
                  </tr>
                ) : earningsData && earningsData.data.length > 0 ? (
                  earningsData.data
                    .slice()
                    .reverse()
                    .map((item, index) => (
                      <tr
                        key={item.label}
                        className="border-b border-gray-100 hover:bg-teal-50/50 transition-colors"
                        style={{ animation: `fadeInUp 0.5s ease-out ${index * 20}ms forwards` }}
                      >
                        <td className="py-3 px-4 font-medium text-gray-900">{item.label}</td>
                        <td className="py-3 px-4 text-right font-bold text-teal-600">{formatCurrency(item.value)}</td>
                        <td className="py-3 px-4 text-right text-gray-600">{item.count || 0}</td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {item.count && item.count > 0 ? formatCurrency(item.value / item.count) : formatCurrency(0)}
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center py-8 text-gray-500">
                      Veri bulunamadı
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
