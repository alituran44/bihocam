"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Star,
  BookOpen,
  TrendingUp,
  DollarSign,
  Calendar,
  User,
  Eye,
  MousePointerClick,
  X,
  Plus,
  Search,
  Filter,
} from "lucide-react";
import {
  adCampaignsApi,
  coursesApi,
  type AdCampaign,
  type CampaignStatus,
} from "@/lib/api";
import { toast } from "sonner";
import Image from "next/image";
import Link from "next/link";

const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Taslak",
  pending_approval: "Onay Bekliyor",
  active: "Aktif",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
  rejected: "Reddedildi",
  cancelled: "İptal Edildi",
};

export default function AdminFeaturedCoursesPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("active");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: campaigns, isLoading } = useQuery<AdCampaign[]>({
    queryKey: ["admin-campaigns", "featured"],
    queryFn: () =>
      adCampaignsApi.listAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
      }),
  });

  // Filter for featured_course and course_promotion campaigns
  const featuredCampaigns =
    campaigns?.filter(
      (c) =>
        (c.campaign_type === "featured_course" || c.campaign_type === "course_promotion") &&
        (searchQuery ? c.name.toLowerCase().includes(searchQuery.toLowerCase()) : true)
    ) || [];

  const activeCampaigns = featuredCampaigns.filter((c) => c.status === "active");
  const pendingCampaigns = featuredCampaigns.filter((c) => c.status === "pending_approval");
  const totalSpent = featuredCampaigns.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0);

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Öne Çıkan Kurslar</h1>
          <p className="text-gray-600">Kurs promosyon kampanyalarını yönetin</p>
        </div>
        <Link
          href="/dashboard/admin/ads/campaigns"
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Yeni Kampanya
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-amber-800">Toplam Kampanya</span>
            <Star className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-900">{featuredCampaigns.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-green-800">Aktif Kampanya</span>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">{activeCampaigns.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-800">Bekleyen</span>
            <Calendar className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">{pendingCampaigns.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border-2 border-teal-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-teal-800">Toplam Harcama</span>
            <DollarSign className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-bold text-teal-900">{totalSpent.toFixed(2)} TRY</div>
        </motion.div>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | "all")}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            >
              <option value="all">Tümü</option>
              {Object.entries(CAMPAIGN_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Ara</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kampanya veya kurs adı ile ara..."
                className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      ) : featuredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredCampaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all"
            >
              {/* Campaign Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === "active"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "paused"
                          ? "bg-gray-100 text-gray-800"
                          : campaign.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {CAMPAIGN_STATUS_LABELS[campaign.status]}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800">
                      {campaign.campaign_type === "featured_course" ? "Öne Çıkan" : "Promosyon"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">{campaign.name}</h3>
                  <p className="text-xs text-gray-500">
                    {new Date(campaign.start_date).toLocaleDateString("tr-TR")} -{" "}
                    {new Date(campaign.end_date).toLocaleDateString("tr-TR")}
                  </p>
                </div>
              </div>

              {/* Course Info */}
              {campaign.course_id && (
                <div className="mb-4 p-3 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
                  <div className="flex items-center gap-2 mb-2">
                    <BookOpen className="w-4 h-4 text-teal-600" />
                    <span className="text-xs font-semibold text-teal-800">Kurs ID</span>
                  </div>
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {campaign.course_id.slice(0, 8)}...
                  </p>
                </div>
              )}

              {/* Stats */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <Eye className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">Görüntülenme</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {(campaign.impressions || 0).toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2 mb-1">
                    <MousePointerClick className="w-4 h-4 text-gray-500" />
                    <span className="text-xs text-gray-600">Tıklama</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">
                    {(campaign.clicks || 0).toLocaleString()}
                  </p>
                </div>
              </div>

              {/* Budget Info */}
              <div className="pt-4 border-t border-gray-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-gray-600">Bütçe</span>
                  <span className="text-sm font-bold text-gray-900">
                    {Number(campaign.total_budget || 0).toFixed(2)} TRY
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-600">Harcanan</span>
                  <span className="text-sm font-bold text-teal-600">
                    {Number(campaign.spent_amount || 0).toFixed(2)} TRY
                  </span>
                </div>
                {campaign.ctr !== undefined && (
                  <div className="mt-2 pt-2 border-t border-gray-100">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-600">CTR</span>
                      <span
                        className={`text-sm font-bold ${
                          campaign.ctr > 2 ? "text-green-600" : campaign.ctr > 1 ? "text-amber-600" : "text-red-600"
                        }`}
                      >
                        {Number(campaign.ctr || 0).toFixed(2)}%
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Actions */}
              <div className="mt-4 pt-4 border-t border-gray-200">
                <Link
                  href={`/dashboard/admin/ads/approvals`}
                  className="w-full px-4 py-2.5 bg-teal-100 text-teal-700 rounded-xl hover:bg-teal-200 transition-colors font-medium text-sm flex items-center justify-center gap-2"
                >
                  <Eye className="w-4 h-4" />
                  Detayları Görüntüle
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border-2 border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Star className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">Henüz öne çıkan kurs kampanyası bulunmuyor</p>
          <p className="text-gray-500 text-sm mt-2">
            Yeni bir kampanya oluşturmak için yukarıdaki butona tıklayın
          </p>
        </div>
      )}
    </div>
  );
}
