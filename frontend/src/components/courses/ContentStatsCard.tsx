"use client";

/**
 * EPIC-10: Content Statistics Card Component (EP10-FE-05)
 * 
 * Displays course content statistics with visual breakdown
 */

import { useQuery } from "@tanstack/react-query";
import { coursesApi, type ContentStats, type LessonType } from "@/lib/api";
import { motion } from "framer-motion";

interface ContentStatsCardProps {
  courseId: string;
}

const lessonTypeLabels: Record<LessonType, string> = {
  video: "Video",
  pdf: "PDF",
  document: "Doküman",
  presentation: "Sunum",
  live_lesson: "Canlı Ders",
  text: "Metin",
  quiz: "Quiz",
};

const lessonTypeColors: Record<LessonType, string> = {
  video: "bg-blue-500",
  pdf: "bg-red-500",
  document: "bg-green-500",
  presentation: "bg-orange-500",
  live_lesson: "bg-purple-500",
  text: "bg-gray-500",
  quiz: "bg-yellow-500",
};

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, "0")} saat`;
  }
  return `${minutes} dakika`;
}

export function ContentStatsCard({ courseId }: ContentStatsCardProps) {
  const { data: stats, isLoading } = useQuery<ContentStats>({
    queryKey: ["content-stats", courseId],
    queryFn: () => coursesApi.getContentStats(courseId),
    enabled: !!courseId,
  });

  if (isLoading) {
    return (
      <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
        <div className="space-y-4">
          <div className="h-6 bg-gray-200 rounded animate-pulse" />
          <div className="h-32 bg-gray-200 rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (!stats) {
    return null;
  }

  // Calculate percentages for pie chart
  const typeBreakdown = stats.type_breakdown || {};
  const totalLessons = stats.total_lessons || 0;
  const breakdownEntries = Object.entries(typeBreakdown)
    .filter(([_, count]) => count > 0)
    .sort(([_, a], [__, b]) => b - a) as [LessonType, number][];

  // Calculate total file size percentage breakdown
  const totalSize = stats.total_file_size_bytes || 0;

  return (
    <div className="bg-white border-2 border-gray-200 rounded-xl p-6 shadow-lg">
      <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
        <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        İçerik İstatistikleri
      </h3>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200 rounded-lg p-4"
        >
          <div className="text-sm text-gray-600 mb-1">Toplam Ders</div>
          <div className="text-2xl font-bold text-gray-900">{stats.total_lessons}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-lg p-4"
        >
          <div className="text-sm text-gray-600 mb-1">Toplam Süre</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatDuration(stats.total_duration_seconds || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg p-4"
        >
          <div className="text-sm text-gray-600 mb-1">Dosya Boyutu</div>
          <div className="text-2xl font-bold text-gray-900">
            {formatFileSize(stats.total_file_size_bytes || 0)}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-orange-50 to-red-50 border-2 border-orange-200 rounded-lg p-4"
        >
          <div className="text-sm text-gray-600 mb-1">Canlı Dersler</div>
          <div className="text-2xl font-bold text-gray-900">
            {stats.upcoming_live_lessons || 0} yaklaşan
          </div>
        </motion.div>
      </div>

      {/* Type Breakdown */}
      {breakdownEntries.length > 0 && (
        <div className="mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">İçerik Tipi Dağılımı</h4>
          <div className="space-y-2">
            {breakdownEntries.map(([type, count], index) => {
              const percentage = totalLessons > 0 ? (count / totalLessons) * 100 : 0;
              return (
                <motion.div
                  key={type}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="flex items-center gap-3"
                >
                  <div className="flex items-center gap-2 min-w-[120px]">
                    <div className={`w-3 h-3 rounded-full ${lessonTypeColors[type]}`} />
                    <span className="text-sm font-medium text-gray-700">
                      {lessonTypeLabels[type] || type}
                    </span>
                  </div>
                  <div className="flex-1 bg-gray-200 rounded-full h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ delay: 0.2 + 0.1 * index, duration: 0.5 }}
                      className={`h-full ${lessonTypeColors[type]} rounded-full`}
                    />
                  </div>
                  <div className="text-sm font-bold text-gray-900 min-w-[60px] text-right">
                    {count} ({percentage.toFixed(0)}%)
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Additional Stats */}
      <div className="pt-4 border-t-2 border-gray-200 space-y-2">
        {stats.has_preview_lessons && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Önizleme Dersleri</span>
            <span className="font-bold text-gray-900">{stats.preview_lesson_count || 0}</span>
          </div>
        )}
        {stats.completed_live_lessons > 0 && (
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Tamamlanan Canlı Dersler</span>
            <span className="font-bold text-gray-900">{stats.completed_live_lessons}</span>
          </div>
        )}
      </div>
    </div>
  );
}
