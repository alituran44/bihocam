"use client";

/**
 * EPIC-BLOG: Blog Statistics Dashboard (EP13-FE-12)
 * 
 * Admin dashboard for blog analytics and statistics with charts
 * Aesthetic: "Editorial Magazine / Luxury Refined" - Elegant charts and visualizations
 */

import { useQuery } from "@tanstack/react-query";
import {
  FileText,
  Eye,
  TrendingUp,
  Calendar,
  Tag,
  FolderOpen,
  BarChart3,
  Loader2,
  PieChart as PieChartIcon,
} from "lucide-react";
import { blogAdminApi } from "@/lib/api";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#14b8a6", // teal-500
  "#10b981", // emerald-500
  "#f59e0b", // amber-500
  "#ef4444", // red-500
  "#8b5cf6", // violet-500
  "#06b6d4", // cyan-500
  "#22d3ee", // cyan-400
  "#34d399", // emerald-400
];

export default function BlogStatsPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["blogStats"],
    queryFn: () => blogAdminApi.getStats(),
  });

  if (isLoading) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 min-h-screen">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-12 text-center shadow-lg">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">İstatistikler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="p-8 bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 min-h-screen">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-12 text-center shadow-lg">
          <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-gray-800 mb-2">İstatistikler Yüklenemedi</h3>
          <p className="text-gray-600">Lütfen daha sonra tekrar deneyin</p>
        </div>
      </div>
    );
  }

  // Prepare chart data
  const postsByStatusData = [
    { name: "Yayınlanmış", value: stats.published_posts || 0, color: COLORS[1] },
    { name: "Taslak", value: stats.draft_posts || 0, color: COLORS[2] },
    { name: "Diğer", value: (stats.total_posts || 0) - (stats.published_posts || 0) - (stats.draft_posts || 0), color: COLORS[3] },
  ].filter((item) => item.value > 0);

  const topPostsData = (stats.top_posts || []).slice(0, 10).map((post: any) => ({
    name: post.title.length > 20 ? post.title.substring(0, 20) + "..." : post.title,
    views: post.view_count || 0,
  }));

  const topCategoriesData = (stats.top_categories || []).slice(0, 10).map((cat: any) => ({
    name: cat.name.length > 15 ? cat.name.substring(0, 15) + "..." : cat.name,
    posts: cat.post_count || 0,
  }));

  const topTagsData = (stats.top_tags || []).slice(0, 10).map((tag: any) => ({
    name: tag.name.length > 15 ? tag.name.substring(0, 15) + "..." : tag.name,
    usage: tag.usage_count || 0,
  }));

  const StatCard = ({
    icon: Icon,
    label,
    value,
    color = "teal",
  }: {
    icon: any;
    label: string;
    value: string | number;
    color?: "teal" | "blue" | "green" | "orange" | "purple";
  }) => {
    const colorClasses = {
      teal: "bg-teal-50 text-teal-600 border-teal-200",
      blue: "bg-blue-50 text-blue-600 border-blue-200",
      green: "bg-green-50 text-green-600 border-green-200",
      orange: "bg-orange-50 text-orange-600 border-orange-200",
      purple: "bg-purple-50 text-purple-600 border-purple-200",
    };

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 hover:shadow-xl transition-all"
      >
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
        </div>
        <div>
          <p className="text-3xl font-bold text-gray-900 mb-1">{value}</p>
          <p className="text-sm text-gray-600">{label}</p>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="p-8 bg-gradient-to-br from-slate-50 via-teal-50/20 to-blue-50/10 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <BarChart3 className="w-8 h-8 text-teal-600" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-700 to-emerald-700 bg-clip-text text-transparent">
              Blog İstatistikleri
            </h1>
          </div>
          <p className="text-gray-600 text-lg">Blog performansınızı ve istatistiklerinizi görüntüleyin</p>
        </div>

        {/* Main Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={FileText}
            label="Toplam Yazı"
            value={stats.total_posts || 0}
            color="teal"
          />
          <StatCard
            icon={Eye}
            label="Yayınlanmış Yazı"
            value={stats.published_posts || 0}
            color="green"
          />
          <StatCard
            icon={FileText}
            label="Taslak Yazı"
            value={stats.draft_posts || 0}
            color="orange"
          />
          <StatCard
            icon={TrendingUp}
            label="Toplam Görüntülenme"
            value={(stats.total_views || 0).toLocaleString()}
            color="blue"
          />
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Posts by Status Pie Chart */}
          {postsByStatusData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <PieChartIcon className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-900">Yazılar Duruma Göre</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={postsByStatusData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }: any) => `${name}: ${((percent ?? 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {postsByStatusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Top Posts Bar Chart */}
          {topPostsData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <TrendingUp className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-900">En Çok Okunan Yazılar</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topPostsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="views" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Top Categories & Tags Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Top Categories Bar Chart */}
          {topCategoriesData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <FolderOpen className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-900">En Popüler Kategoriler</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topCategoriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="posts" fill="#10b981" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Top Tags Bar Chart */}
          {topTagsData.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 shadow-lg"
            >
              <div className="flex items-center gap-3 mb-6">
                <Tag className="w-6 h-6 text-teal-600" />
                <h2 className="text-2xl font-bold text-gray-900">En Popüler Etiketler</h2>
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topTagsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis
                    dataKey="name"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                    fontSize={12}
                  />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="usage" fill="#f59e0b" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}
        </div>

        {/* Top Posts List */}
        {stats.top_posts && stats.top_posts.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/80 backdrop-blur-sm rounded-2xl border-2 border-gray-200/50 p-6 shadow-lg"
          >
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-teal-600" />
              <h2 className="text-2xl font-bold text-gray-900">En Çok Okunan Yazılar (Detaylı)</h2>
            </div>
            <div className="space-y-4">
              {stats.top_posts.map((post: any, index: number) => (
                <div
                  key={post.id}
                  className="flex items-center justify-between p-4 bg-gray-50/50 rounded-xl hover:bg-gray-100/50 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-500 text-white flex items-center justify-center font-bold shadow-lg">
                      {index + 1}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{post.title}</h3>
                      <p className="text-sm text-gray-500">/{post.slug}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-teal-600 font-semibold">
                    <Eye className="w-5 h-5" />
                    {post.view_count.toLocaleString()} görüntülenme
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
