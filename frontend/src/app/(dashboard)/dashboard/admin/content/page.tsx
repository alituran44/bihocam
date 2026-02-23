"use client";

/**
 * EPIC-10: Admin Content Management Page (EP10-FE-08)
 * 
 * Platform-wide content statistics and management dashboard
 */

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/lib/store";
import { adminContentApi, type AuditLog, type StorageMetrics, type StorageQuota } from "@/lib/api";
import { motion } from "framer-motion";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658"];

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

export default function AdminContentPage() {
  const { user } = useAuthStore();
  const [auditLogPage, setAuditLogPage] = useState(1);
  const [auditLogLimit] = useState(20);
  const [quotaPage, setQuotaPage] = useState(1);
  const [quotaLimit] = useState(20);

  // Admin check
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  // Fetch storage metrics
  const { data: storageMetrics, isLoading: metricsLoading } = useQuery<StorageMetrics>({
    queryKey: ["admin-storage-metrics"],
    queryFn: () => adminContentApi.getStorageMetrics(),
    refetchInterval: 5 * 60 * 1000, // 5 dakikada bir
  });

  // Fetch audit logs
  const { data: auditLogs, isLoading: auditLogsLoading } = useQuery({
    queryKey: ["admin-audit-logs", auditLogPage],
    queryFn: () =>
      adminContentApi.listAuditLogs({
        skip: (auditLogPage - 1) * auditLogLimit,
        limit: auditLogLimit,
      }),
  });

  // Fetch storage quotas
  const { data: storageQuotas, isLoading: quotasLoading } = useQuery({
    queryKey: ["admin-storage-quotas", quotaPage],
    queryFn: () =>
      adminContentApi.listStorageQuotas({
        skip: (quotaPage - 1) * quotaLimit,
        limit: quotaLimit,
      }),
  });

  // Prepare chart data
  const typeBreakdownData =
    storageMetrics?.type_breakdown
      ? Object.entries(storageMetrics.type_breakdown).map(([type, data]) => ({
          name: type,
          count: data.count,
          size: data.total_size_bytes,
        }))
      : [];

  const pieChartData = typeBreakdownData.map((item) => ({
    name: item.name,
    value: item.count,
  }));

  const barChartData = typeBreakdownData.map((item) => ({
    name: item.name,
    "Dosya Sayısı": item.count,
    "Toplam Boyut (GB)": item.size / (1024 * 1024 * 1024),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">İçerik Yönetimi</h1>
        <p className="text-gray-600 mt-2">Platform geneli içerik istatistikleri ve yönetim</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-xl p-6 shadow-lg"
        >
          <div className="text-sm text-gray-600 mb-1">Toplam İçerik</div>
          <div className="text-3xl font-bold text-gray-900">
            {metricsLoading ? "..." : storageMetrics?.total_content_items || 0}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-6 shadow-lg"
        >
          <div className="text-sm text-gray-600 mb-1">Toplam Dosya Boyutu</div>
          <div className="text-3xl font-bold text-gray-900">
            {metricsLoading ? "..." : formatFileSize(storageMetrics?.total_file_size_bytes || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-xl p-6 shadow-lg"
        >
          <div className="text-sm text-gray-600 mb-1">Son 24 Saat Upload</div>
          <div className="text-3xl font-bold text-gray-900">
            {metricsLoading ? "..." : storageMetrics?.recent_uploads_count || 0}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-xl p-6 shadow-lg"
        >
          <div className="text-sm text-gray-600 mb-1">Quota Kullanımı</div>
          <div className="text-3xl font-bold text-gray-900">
            {metricsLoading ? "..." : `${(storageMetrics?.quota_stats?.avg_usage_percentage || 0).toFixed(1)}%`}
          </div>
        </motion.div>
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Pie Chart - Type Breakdown */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">İçerik Tipi Dağılımı</h3>
          {metricsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Bar Chart - Type Breakdown by Size */}
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Tip Bazlı Dosya Boyutu</h3>
          {metricsLoading ? (
            <div className="h-64 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Dosya Sayısı" fill="#8884d8" />
                <Bar dataKey="Toplam Boyut (GB)" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Storage Usage Details */}
      {storageMetrics && (
        <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Storage Kullanım Detayları</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Toplam Kullanılan</span>
              <span className="font-bold text-gray-900">
                {formatFileSize(storageMetrics.total_file_size_bytes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Toplam Quota</span>
              <span className="font-bold text-gray-900">
                {formatFileSize(storageMetrics.quota_stats.total_quota_bytes)}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Kullanılan Quota</span>
              <span className="font-bold text-gray-900">
                {formatFileSize(storageMetrics.quota_stats.total_used_bytes)} (
                {(storageMetrics.quota_stats.avg_usage_percentage || 0).toFixed(1)}%)
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Quota Sahibi Kullanıcılar</span>
              <span className="font-bold text-gray-900">
                {storageMetrics.quota_stats.total_users}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Recent Audit Logs */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Son İçerik Aktiviteleri</h3>
        {auditLogsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Tarih</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kullanıcı</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Aksiyon</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kaynak</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs?.logs.map((log: AuditLog) => (
                    <tr key={log.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {new Date(log.created_at).toLocaleString("tr-TR")}
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.user_id || "Sistem"}</td>
                      <td className="py-3 px-4 text-sm">
                        <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded-full text-xs font-semibold">
                          {log.action}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-600">{log.resource_type}</td>
                      <td className="py-3 px-4 text-sm text-gray-600">
                        {log.metadata?.file_name || log.resource_id || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {auditLogs && auditLogs.total > auditLogLimit && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">
                  Toplam {auditLogs.total} kayıt
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setAuditLogPage((p) => Math.max(1, p - 1))}
                    disabled={auditLogPage === 1}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
                  >
                    Önceki
                  </button>
                  <span className="text-sm text-gray-600">
                    Sayfa {auditLogPage} / {Math.ceil(auditLogs.total / auditLogLimit)}
                  </span>
                  <button
                    onClick={() => setAuditLogPage((p) => p + 1)}
                    disabled={auditLogPage >= Math.ceil(auditLogs.total / auditLogLimit)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Storage Quotas Table */}
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-bold text-gray-900 mb-4">Storage Quota Kullanımı</h3>
        {quotasLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kullanıcı</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quota</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kullanılan</th>
                    <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Kullanım %</th>
                  </tr>
                </thead>
                <tbody>
                  {storageQuotas?.quotas.map((quota: StorageQuota) => {
                    const usagePercent = quota.quota_bytes > 0
                      ? (quota.used_bytes / quota.quota_bytes) * 100
                      : 0;
                    return (
                      <tr key={quota.user_id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm text-gray-900">
                          {quota.user_name || quota.user_email || quota.user_id}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatFileSize(quota.quota_bytes)}
                        </td>
                        <td className="py-3 px-4 text-sm text-gray-600">
                          {formatFileSize(quota.used_bytes)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  usagePercent > 90 ? "bg-red-500" :
                                  usagePercent > 70 ? "bg-yellow-500" :
                                  "bg-teal-500"
                                }`}
                                style={{ width: `${Math.min(usagePercent, 100)}%` }}
                              />
                            </div>
                            <span className="text-sm font-medium text-gray-700 min-w-[50px]">
                              {usagePercent.toFixed(1)}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {storageQuotas && storageQuotas.total > quotaLimit && (
              <div className="flex items-center justify-between mt-4">
                <span className="text-sm text-gray-600">
                  Toplam {storageQuotas.total} kullanıcı
                </span>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQuotaPage((p) => Math.max(1, p - 1))}
                    disabled={quotaPage === 1}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
                  >
                    Önceki
                  </button>
                  <span className="text-sm text-gray-600">
                    Sayfa {quotaPage} / {Math.ceil(storageQuotas.total / quotaLimit)}
                  </span>
                  <button
                    onClick={() => setQuotaPage((p) => p + 1)}
                    disabled={quotaPage >= Math.ceil(storageQuotas.total / quotaLimit)}
                    className="px-4 py-2 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-sm font-medium"
                  >
                    Sonraki
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
