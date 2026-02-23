"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { reportsApi, type CoursePerformance } from "@/lib/api";
import Link from "next/link";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

export default function CoursePerformancePage() {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [limit, setLimit] = useState<number>(50);

  const { data: courseData, isLoading } = useQuery<CoursePerformance>({
    queryKey: ["course-performance", limit, dateFrom, dateTo],
    queryFn: () =>
      reportsApi.getCoursePerformance({
        limit,
        date_from: dateFrom || undefined,
        date_to: dateTo || undefined,
      }),
    enabled: true,
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const renderStars = (rating: number | null) => {
    if (!rating) return null;
    return [...Array(5)].map((_, i) => (
      <svg
        key={i}
        className={`w-3 h-3 ${i < Math.round(rating) ? "text-amber-400 fill-current" : "text-gray-300"}`}
        viewBox="0 0 20 20"
      >
        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
      </svg>
    ));
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
                Kurs Performans Analizi
              </h1>
              <p className="text-teal-100 text-lg">
                En çok kazandıran ve en çok satan kursları detaylı inceleyin
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
        <div className="flex flex-wrap items-center gap-4">
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
          <div className="flex items-center gap-2">
            <label className="text-sm font-semibold text-gray-700">Göster:</label>
            <select
              value={limit}
              onChange={(e) => setLimit(Number(e.target.value))}
              className="px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm font-medium"
            >
              <option value={25}>Top 25</option>
              <option value={50}>Top 50</option>
              <option value={100}>Top 100</option>
              <option value={200}>Top 200</option>
            </select>
          </div>
          {(dateFrom || dateTo) && (
            <button
              onClick={() => {
                setDateFrom("");
                setDateTo("");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-gray-900 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      </div>

      {/* Summary Cards */}
      {courseData && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border border-teal-100 shadow-lg">
            <div className="text-sm font-semibold text-teal-700 mb-2">Toplam Ciro</div>
            <div className="text-3xl font-bold text-teal-900">{formatCurrency(courseData.total_revenue)}</div>
          </div>
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-6 border border-blue-100 shadow-lg">
            <div className="text-sm font-semibold text-blue-700 mb-2">Toplam Kurs</div>
            <div className="text-3xl font-bold text-blue-900">{courseData.total_courses}</div>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border border-purple-100 shadow-lg">
            <div className="text-sm font-semibold text-purple-700 mb-2">Toplam Satış</div>
            <div className="text-3xl font-bold text-purple-900">{courseData.total_sales}</div>
          </div>
        </div>
      )}

      {/* Top Courses Chart */}
      {isLoading ? (
        <div className="h-96 flex items-center justify-center bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-200">
          <div className="animate-pulse text-gray-400">Veriler yükleniyor...</div>
        </div>
      ) : courseData && courseData.data.length > 0 ? (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">En Çok Kazandıran Kurslar</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart
              data={courseData.data.slice(0, 10).map((d) => ({
                ...d,
                total_revenue: Number(d.total_revenue),
                course_title: d.course_title.length > 30 ? d.course_title.substring(0, 30) + "..." : d.course_title,
              }))}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="course_title"
                stroke="#6b7280"
                style={{ fontSize: "12px" }}
                angle={-45}
                textAnchor="end"
                height={120}
              />
              <YAxis stroke="#6b7280" style={{ fontSize: "12px" }} tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                contentStyle={{
                  backgroundColor: "rgba(255, 255, 255, 0.95)",
                  border: "1px solid #e5e7eb",
                  borderRadius: "12px",
                  padding: "12px",
                }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Legend />
              <Bar dataKey="total_revenue" fill="#14b8a6" name="Ciro" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      ) : null}

      {/* Course Performance Table */}
      {courseData && courseData.data.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Kurs Performans Detayları</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Kurs</th>
                  <th className="text-left py-4 px-4 text-sm font-semibold text-gray-700">Eğitmen</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Ciro</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Satış</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Kayıt</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Tamamlama</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">Puan</th>
                  <th className="text-right py-4 px-4 text-sm font-semibold text-gray-700">İade Oranı</th>
                </tr>
              </thead>
              <tbody>
                {courseData.data.map((course, index) => (
                  <tr
                    key={course.course_id}
                    className="border-b border-gray-100 hover:bg-teal-50/50 transition-colors"
                    style={{ animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards` }}
                  >
                    <td className="py-4 px-4">
                      <Link
                        href={`/courses/${course.course_id}`}
                        className="font-semibold text-gray-900 hover:text-teal-700 transition-colors"
                      >
                        {course.course_title}
                      </Link>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{course.teacher_name}</td>
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-teal-700">{formatCurrency(course.total_revenue)}</span>
                    </td>
                    <td className="py-4 px-4 text-right text-gray-700 font-medium">{course.total_sales}</td>
                    <td className="py-4 px-4 text-right text-gray-700 font-medium">{course.total_enrollments}</td>
                    <td className="py-4 px-4 text-right">
                      {course.completion_rate !== null ? (
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-16 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-gradient-to-r from-teal-400 to-emerald-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${course.completion_rate}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-semibold text-gray-700 w-12 text-right">
                            {course.completion_rate.toFixed(0)}%
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {course.average_rating ? (
                        <div className="flex items-center justify-end gap-1">
                          {renderStars(course.average_rating)}
                          <span className="text-sm font-semibold text-gray-700 ml-1">
                            ({course.average_rating.toFixed(1)})
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="py-4 px-4 text-right">
                      {course.refund_rate !== null && course.refund_rate > 0 ? (
                        <span className={`text-sm font-semibold ${course.refund_rate > 10 ? "text-rose-600" : "text-amber-600"}`}>
                          {course.refund_rate.toFixed(1)}%
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
