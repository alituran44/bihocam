"use client";

import { useQuery } from "@tanstack/react-query";
import { reportsApi } from "@/lib/api";
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const COLORS = ["#14b8a6", "#10b981", "#059669", "#047857", "#065f46", "#064e3b"];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: "TRY",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

const formatDate = (dateString: string | null) => {
  if (!dateString) return "Hiç";
  return new Date(dateString).toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const formatTime = (minutes: number) => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours > 0) {
    return `${hours}s ${mins}dk`;
  }
  return `${mins}dk`;
};

export default function StudentAnalyticsPage() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<"spent" | "enrollments" | "completion">("spent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: studentAnalytics, isLoading, error } = useQuery({
    queryKey: ["student-analytics", dateFrom, dateTo],
    queryFn: () =>
      reportsApi.getStudentAnalytics({
        limit: 200,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
  });

  const sortedData = studentAnalytics?.data
    ? [...studentAnalytics.data].sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (sortBy) {
          case "spent":
            aValue = a.total_spent;
            bValue = b.total_spent;
            break;
          case "enrollments":
            aValue = a.total_enrollments;
            bValue = b.total_enrollments;
            break;
          case "completion":
            aValue = a.average_completion_rate || 0;
            bValue = b.average_completion_rate || 0;
            break;
          default:
            return 0;
        }

        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      })
    : [];

  // Top 10 en çok harcayan öğrenciler
  const topSpenders = sortedData.slice(0, 10);

  // Tamamlama oranı dağılımı
  const completionDistribution = [
    {
      name: "0-25%",
      value: sortedData.filter((s) => (s.average_completion_rate || 0) < 25).length,
    },
    {
      name: "25-50%",
      value: sortedData.filter((s) => (s.average_completion_rate || 0) >= 25 && (s.average_completion_rate || 0) < 50).length,
    },
    {
      name: "50-75%",
      value: sortedData.filter((s) => (s.average_completion_rate || 0) >= 50 && (s.average_completion_rate || 0) < 75).length,
    },
    {
      name: "75-100%",
      value: sortedData.filter((s) => (s.average_completion_rate || 0) >= 75).length,
    },
  ];

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
                Öğrenci Analizi
              </h1>
              <p className="text-teal-100 text-lg">
                Öğrenci davranışlarını, harcamalarını ve tamamlama oranlarını detaylı inceleyin
              </p>
            </div>
            <div className="hidden md:block">
              <svg className="w-32 h-32 text-white/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Toplam Öğrenci</span>
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? "..." : studentAnalytics?.total_students || 0}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Toplam Kayıt</span>
            <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? "..." : studentAnalytics?.total_enrollments || 0}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Toplam Gelir</span>
            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? "..." : formatCurrency(studentAnalytics?.total_revenue || 0)}
          </div>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-600">Ort. Tamamlama</span>
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div className="text-3xl font-bold text-gray-900">
            {isLoading ? "..." : studentAnalytics?.average_completion_rate?.toFixed(1) || "0"}%
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
            <label className="block text-sm font-medium text-gray-700 mb-2">Sıralama</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "spent" | "enrollments" | "completion")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="spent">Toplam Harcama</option>
              <option value="enrollments">Kayıt Sayısı</option>
              <option value="completion">Tamamlama Oranı</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Sıra</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            >
              <option value="desc">Azalan</option>
              <option value="asc">Artan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Spenders Chart */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">En Çok Harcayan Öğrenciler (Top 10)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topSpenders}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="student_name" angle={-45} textAnchor="end" height={80} stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px" }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="total_spent" fill="#14b8a6" name="Toplam Harcama" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Completion Distribution */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Tamamlama Oranı Dağılımı</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={completionDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {completionDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Student Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Öğrenci Detayları</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Öğrenci</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">E-posta</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Kayıt</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tamamlanan</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Toplam Harcama</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Tamamlama %</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">İzlenen Ders</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">İzleme Süresi</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Son Aktivite</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-gray-500">
                    Veri bulunamadı
                  </td>
                </tr>
              ) : (
                sortedData.map((student, index) => (
                  <tr
                    key={student.student_id}
                    className="border-b border-gray-100 hover:bg-teal-50/50 transition-colors"
                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 20}ms forwards` }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{student.student_name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{student.student_email}</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-700">{student.total_enrollments}</td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600">{student.completed_courses}</td>
                    <td className="py-3 px-4 text-right font-bold text-teal-600">{formatCurrency(student.total_spent)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold text-gray-700">
                          {student.average_completion_rate?.toFixed(1) || "0"}%
                        </span>
                        <div className="w-16 h-2 bg-gray-200 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-teal-400 to-emerald-500 transition-all duration-500"
                            style={{ width: `${student.average_completion_rate || 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right text-gray-600">{student.total_lessons_watched}</td>
                    <td className="py-3 px-4 text-right text-gray-600">{formatTime(student.total_watch_time_minutes)}</td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{formatDate(student.last_activity_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
