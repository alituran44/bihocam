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

const COLORS = ["#14b8a6", "#10b981", "#059669", "#047857", "#065f46", "#064e3b", "#0d9488", "#0f766e"];

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

export default function TeacherPerformancePage() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortBy, setSortBy] = useState<"revenue" | "courses" | "students">("revenue");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  const { data: teacherPerformance, isLoading, error } = useQuery({
    queryKey: ["teacher-performance", dateFrom, dateTo],
    queryFn: () =>
      reportsApi.getTeacherPerformance({
        limit: 200,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
  });

  const sortedData = teacherPerformance?.data
    ? [...teacherPerformance.data].sort((a, b) => {
        let aValue: number;
        let bValue: number;

        switch (sortBy) {
          case "revenue":
            aValue = a.total_revenue;
            bValue = b.total_revenue;
            break;
          case "courses":
            aValue = a.total_courses;
            bValue = b.total_courses;
            break;
          case "students":
            aValue = a.total_students;
            bValue = b.total_students;
            break;
          default:
            return 0;
        }

        return sortOrder === "asc" ? aValue - bValue : bValue - aValue;
      })
    : [];

  const topEarners = sortedData.slice(0, 10);

  const courseDistribution = sortedData.slice(0, 6).map((t) => ({
    name: t.teacher_name,
    value: t.total_courses,
  }));

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
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Eğitmen Performansı
              </h1>
              <p className="text-teal-100 text-lg">
                Eğitmenlerin gelirlerini, kurs sayılarını ve öğrenci memnuniyetlerini analiz edin
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
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
            label: "Toplam Eğitmen",
            value: isLoading ? "..." : teacherPerformance?.total_teachers || sortedData.length,
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            ),
            color: "from-teal-500 to-teal-600",
          },
          {
            label: "Toplam Kurs",
            value: isLoading ? "..." : sortedData.reduce((sum, t) => sum + t.total_courses, 0),
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
              </svg>
            ),
            color: "from-emerald-500 to-emerald-600",
          },
          {
            label: "Toplam Gelir",
            value: isLoading ? "..." : formatCurrency(sortedData.reduce((sum, t) => sum + t.total_revenue, 0)),
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ),
            color: "from-blue-500 to-blue-600",
          },
          {
            label: "Ort. Puan",
            value: isLoading
              ? "..."
              : sortedData.length > 0
              ? (sortedData.reduce((sum, t) => sum + (t.average_rating || 0), 0) / sortedData.length).toFixed(1)
              : "0",
            icon: (
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
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
            <div className="text-sm font-semibold text-gray-600 uppercase tracking-wide">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Filtreler</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Başlangıç Tarihi</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Bitiş Tarihi</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Sıralama</label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as "revenue" | "courses" | "students")}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm font-medium"
            >
              <option value="revenue">Toplam Gelir</option>
              <option value="courses">Kurs Sayısı</option>
              <option value="students">Öğrenci Sayısı</option>
            </select>
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 mb-1 block">Sıra</label>
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
              className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm font-medium"
            >
              <option value="desc">Azalan</option>
              <option value="asc">Artan</option>
            </select>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">En Çok Kazanan Eğitmenler (Top 10)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={topEarners}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="teacher_name" angle={-45} textAnchor="end" height={80} stroke="#6b7280" style={{ fontSize: "12px" }} />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                contentStyle={{ backgroundColor: "rgba(255, 255, 255, 0.95)", border: "1px solid #e5e7eb", borderRadius: "12px", padding: "12px" }}
                formatter={(value) => formatCurrency(Number(value ?? 0))}
              />
              <Legend />
              <Bar dataKey="total_revenue" fill="#14b8a6" name="Toplam Gelir" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-4">Kurs Dağılımı (Top 6)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={courseDistribution}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ name, percent }: any) => `${name} ${((percent ?? 0) * 100).toFixed(0)}%`}
              >
                {courseDistribution.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Teacher Table */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Eğitmen Detayları</h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Eğitmen</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">E-posta</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Kurs</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Öğrenci</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Toplam Gelir</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-700">Puan</th>
                <th className="text-left py-3 px-4 font-semibold text-gray-700">Katılım</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Yükleniyor...</td>
                </tr>
              ) : sortedData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-gray-500">Veri bulunamadı</td>
                </tr>
              ) : (
                sortedData.map((teacher, index) => (
                  <tr
                    key={teacher.teacher_id}
                    className="border-b border-gray-100 hover:bg-teal-50/50 transition-colors"
                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 20}ms forwards` }}
                  >
                    <td className="py-3 px-4">
                      <div className="font-semibold text-gray-900">{teacher.teacher_name}</div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{teacher.teacher_id.slice(0, 8)}...</td>
                    <td className="py-3 px-4 text-right font-medium text-gray-700">{teacher.total_courses}</td>
                    <td className="py-3 px-4 text-right font-medium text-emerald-600">{teacher.total_students}</td>
                    <td className="py-3 px-4 text-right font-bold text-teal-600">{formatCurrency(teacher.total_revenue)}</td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <svg className="w-4 h-4 text-amber-400 fill-current" viewBox="0 0 20 20">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="font-semibold text-gray-700">{teacher.average_rating?.toFixed(1) || "-"}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-gray-600 text-sm">{teacher.total_sales} satış</td>
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
