"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, type OverviewStats, type EarningsReport } from "@/lib/api";
import Link from "next/link";
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
} from "recharts";

export default function AdminAnalyticsPage() {
  const [groupBy, setGroupBy] = useState<"course" | "teacher">("course");
  const [interval, setInterval] = useState<"daily" | "weekly" | "monthly">("monthly");
  const [dateFrom, setDateFrom] = useState(() => {
    const date = new Date();
    date.setMonth(date.getMonth() - 6);
    return date.toISOString().split("T")[0];
  });
  const [dateTo, setDateTo] = useState(() => {
    return new Date().toISOString().split("T")[0];
  });

  const { data: overviewStats, isLoading: statsLoading } = useQuery<OverviewStats>({
    queryKey: ["admin-overview-stats"],
    queryFn: () => reportsApi.getOverview(),
    refetchInterval: 5 * 60 * 1000, // 5 dakikada bir otomatik yenileme
  });

  const { data: earningsReport, isLoading: earningsLoading } = useQuery<EarningsReport>({
    queryKey: ["admin-earnings-report", groupBy, interval, dateFrom, dateTo],
    queryFn: () =>
      reportsApi.getEarningsReport({
        group_by: groupBy,
        interval: interval,
        date_from: new Date(dateFrom).toISOString(),
        date_to: new Date(dateTo).toISOString(),
      }),
    enabled: !!dateFrom && !!dateTo,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    if (interval === "daily") {
      return date.toLocaleDateString("tr-TR", { day: "numeric", month: "short" });
    } else if (interval === "weekly") {
      return dateString; // ISO week format
    } else {
      return date.toLocaleDateString("tr-TR", { month: "short", year: "numeric" });
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Analiz & Raporlar
              </h1>
              <p className="text-teal-100 text-lg">
                Platform performansını detaylı analiz edin
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            label: "Toplam Ciro",
            value: statsLoading ? "..." : formatCurrency(overviewStats?.total_revenue || 0),
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: "from-emerald-500 to-emerald-600",
          },
          {
            label: "Son 30 Gün Ciro",
            value: statsLoading ? "..." : formatCurrency(overviewStats?.last_30_days_revenue || 0),
            change: overviewStats?.last_30_days_revenue_change,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            ),
            color: "from-teal-500 to-teal-600",
          },
          {
            label: "Aktif Öğrenci",
            value: statsLoading ? "..." : overviewStats?.active_students || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            ),
            color: "from-blue-500 to-blue-600",
          },
          {
            label: "Aktif Eğitmen",
            value: statsLoading ? "..." : overviewStats?.active_teachers || 0,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            ),
            color: "from-purple-500 to-purple-600",
          },
        ].map((stat, index) => (
          <div
            key={index}
            className="relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl group"
            style={{ animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards` }}
          >
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="flex items-center justify-between mb-4">
              <div className={`w-14 h-14 bg-gradient-to-br ${stat.color} rounded-2xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                {stat.icon}
              </div>
            </div>
            <div className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</div>
            {stat.change !== null && stat.change !== undefined && (
              <div className={`text-sm font-semibold flex items-center gap-1 mb-2 ${
                stat.change > 0 ? "text-emerald-600" : stat.change < 0 ? "text-rose-600" : "text-gray-500"
              }`}>
                {stat.change > 0 ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                    +{stat.change.toFixed(1)}%
                  </>
                ) : stat.change < 0 ? (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                    {stat.change.toFixed(1)}%
                  </>
                ) : null}
              </div>
            )}
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters & Chart */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Gelir Trendi</h2>
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Gruplama:</label>
              <select
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value as "course" | "teacher")}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm font-medium"
              >
                <option value="course">Kurs</option>
                <option value="teacher">Eğitmen</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Aralık:</label>
              <select
                value={interval}
                onChange={(e) => setInterval(e.target.value as "daily" | "weekly" | "monthly")}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm font-medium"
              >
                <option value="daily">Günlük</option>
                <option value="weekly">Haftalık</option>
                <option value="monthly">Aylık</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Başlangıç:</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-semibold text-gray-700">Bitiş:</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
              />
            </div>
          </div>
        </div>

        {earningsLoading ? (
          <div className="h-96 flex items-center justify-center">
            <div className="animate-pulse text-gray-400">Grafik yükleniyor...</div>
          </div>
        ) : earningsReport && earningsReport.data.length > 0 ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl p-4 border border-teal-100">
                <div className="text-sm font-semibold text-teal-700 mb-1">Toplam Ciro</div>
                <div className="text-2xl font-bold text-teal-900">{formatCurrency(earningsReport.total_revenue)}</div>
              </div>
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                <div className="text-sm font-semibold text-blue-700 mb-1">Toplam Satış</div>
                <div className="text-2xl font-bold text-blue-900">{earningsReport.total_count}</div>
              </div>
            </div>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={earningsReport.data.map((d) => ({ ...d, value: Number(d.value) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis
                  dataKey="label"
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={formatDate}
                />
                <YAxis
                  stroke="#6b7280"
                  style={{ fontSize: "12px" }}
                  tickFormatter={(value) => formatCurrency(value)}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "1px solid #e5e7eb",
                    borderRadius: "12px",
                    padding: "12px",
                  }}
                  formatter={(value: number | undefined) => formatCurrency(value || 0)}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#14b8a6"
                  strokeWidth={3}
                  dot={{ fill: "#14b8a6", r: 5 }}
                  name="Ciro"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-96 flex items-center justify-center bg-gray-50 rounded-xl">
            <div className="text-center">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-gray-600 font-medium">Bu tarih aralığında veri bulunmuyor</p>
            </div>
          </div>
        )}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Toplam Kurslar</h3>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {statsLoading ? "..." : overviewStats?.total_courses || 0}
          </div>
          <div className="text-sm text-gray-600">
            Yayında: <span className="font-semibold text-teal-600">{overviewStats?.published_courses || 0}</span>
          </div>
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Toplam Siparişler</h3>
          <div className="text-4xl font-bold text-gray-900 mb-2">
            {statsLoading ? "..." : overviewStats?.total_orders || 0}
          </div>
          <div className="text-sm text-gray-600">
            Son 30 gün: <span className="font-semibold text-teal-600">{overviewStats?.total_orders_last_30_days || 0}</span>
          </div>
        </div>
      </div>

      {/* Quick Links to Detailed Analytics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link
          href="/dashboard/admin/analytics/categories"
          className="group relative overflow-hidden bg-gradient-to-br from-teal-50 via-emerald-50 to-teal-100 rounded-2xl p-8 shadow-lg border-2 border-teal-200 hover:border-teal-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-teal-500 to-emerald-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h10M4 14h7M4 18h4" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-teal-700 transition-colors">
              Kategori Analizi
            </h3>
            <p className="text-gray-600 mb-4">
              Kategorilere göre performans metriklerini detaylı inceleyin. Hangi kategoriler en çok kazandırıyor?
            </p>
            <div className="flex items-center gap-2 text-teal-600 font-semibold group-hover:gap-4 transition-all">
              <span>Detaylı Analiz</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/analytics/courses"
          className="group relative overflow-hidden bg-gradient-to-br from-blue-50 via-indigo-50 to-blue-100 rounded-2xl p-8 shadow-lg border-2 border-blue-200 hover:border-blue-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors">
              Kurs Performansı
            </h3>
            <p className="text-gray-600 mb-4">
              En çok kazandıran ve en çok satan kursları detaylı inceleyin. Tamamlama oranları ve iade istatistikleri.
            </p>
            <div className="flex items-center gap-2 text-blue-600 font-semibold group-hover:gap-4 transition-all">
              <span>Detaylı Analiz</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/analytics/students"
          className="group relative overflow-hidden bg-gradient-to-br from-purple-50 via-pink-50 to-purple-100 rounded-2xl p-8 shadow-lg border-2 border-purple-200 hover:border-purple-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-purple-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-purple-700 transition-colors">
              Öğrenci Analizi
            </h3>
            <p className="text-gray-600 mb-4">
              Öğrenci davranışlarını, harcamalarını ve tamamlama oranlarını detaylı inceleyin.
            </p>
            <div className="flex items-center gap-2 text-purple-600 font-semibold group-hover:gap-4 transition-all">
              <span>Detaylı Analiz</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/analytics/teachers"
          className="group relative overflow-hidden bg-gradient-to-br from-orange-50 via-amber-50 to-orange-100 rounded-2xl p-8 shadow-lg border-2 border-orange-200 hover:border-orange-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-orange-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-amber-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-orange-700 transition-colors">
              Eğitmen Performansı
            </h3>
            <p className="text-gray-600 mb-4">
              Eğitmenlerin performans metriklerini, kazançlarını ve öğrenci memnuniyetini detaylı inceleyin.
            </p>
            <div className="flex items-center gap-2 text-orange-600 font-semibold group-hover:gap-4 transition-all">
              <span>Detaylı Analiz</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>

        <Link
          href="/dashboard/admin/analytics/timeseries"
          className="group relative overflow-hidden bg-gradient-to-br from-indigo-50 via-violet-50 to-indigo-100 rounded-2xl p-8 shadow-lg border-2 border-indigo-200 hover:border-indigo-400 transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-200/30 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-500"></div>
          <div className="relative">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg group-hover:rotate-6 transition-transform duration-300">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2 group-hover:text-indigo-700 transition-colors">
              Zaman Serisi Analizi
            </h3>
            <p className="text-gray-600 mb-4">
              Gelir, satış ve diğer metriklerin zaman içindeki trendlerini detaylı inceleyin.
            </p>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold group-hover:gap-4 transition-all">
              <span>Detaylı Analiz</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
