"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Eye,
  MousePointerClick,
  DollarSign,
  BarChart3,
  Calendar,
  Filter,
} from "lucide-react";
import { adCampaignsApi, type AdCampaign } from "@/lib/api";

export default function AdminAnalyticsPage() {
  const [dateRange, setDateRange] = useState<"7d" | "30d" | "90d" | "all">("30d");
  const [selectedCampaign, setSelectedCampaign] = useState<string>("all");

  const { data: campaigns } = useQuery<AdCampaign[]>({
    queryKey: ["admin-campaigns"],
    queryFn: () => adCampaignsApi.listAll({}),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-campaigns-stats"],
    queryFn: () => adCampaignsApi.getStats(),
  });

  // Calculate analytics
  const totalImpressions =
    campaigns?.reduce((sum, c) => sum + (c.impressions || 0), 0) || 0;
  const totalClicks = campaigns?.reduce((sum, c) => sum + (c.clicks || 0), 0) || 0;
  const totalSpent = campaigns?.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0) || 0;
  const averageCTR =
    totalImpressions > 0 ? (totalClicks / totalImpressions) * 100 : 0;
  const averageCPC = totalClicks > 0 ? totalSpent / totalClicks : 0;
  const averageCPM = totalImpressions > 0 ? (totalSpent / totalImpressions) * 1000 : 0;

  const filteredCampaigns =
    selectedCampaign === "all"
      ? campaigns
      : campaigns?.filter((c) => c.id === selectedCampaign);

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Reklam Analitikleri</h1>
        <p className="text-gray-600">Kampanya performans metriklerini görüntüleyin</p>
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Tarih Aralığı</label>
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as "7d" | "30d" | "90d" | "all")}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            >
              <option value="7d">Son 7 Gün</option>
              <option value="30d">Son 30 Gün</option>
              <option value="90d">Son 90 Gün</option>
              <option value="all">Tümü</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Kampanya</label>
            <select
              value={selectedCampaign}
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            >
              <option value="all">Tüm Kampanyalar</option>
              {campaigns?.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-blue-800">Toplam Görüntülenme</span>
            <Eye className="w-5 h-5 text-blue-600" />
          </div>
          <div className="text-3xl font-bold text-blue-900">{totalImpressions.toLocaleString()}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-green-800">Toplam Tıklama</span>
            <MousePointerClick className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">{totalClicks.toLocaleString()}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border-2 border-teal-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-teal-800">Toplam Harcama</span>
            <DollarSign className="w-5 h-5 text-teal-600" />
          </div>
          <div className="text-3xl font-bold text-teal-900">{Number(totalSpent).toFixed(2)} TRY</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-purple-800">Ortalama CTR</span>
            <TrendingUp className="w-5 h-5 text-purple-600" />
          </div>
          <div className="text-3xl font-bold text-purple-900">{Number(averageCTR).toFixed(2)}%</div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-600">Ortalama CPC</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{Number(averageCPC).toFixed(2)} TRY</div>
          <p className="text-xs text-gray-500 mt-2">Tıklama başına maliyet</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-600">Ortalama CPM</span>
            <DollarSign className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{Number(averageCPM).toFixed(2)} TRY</div>
          <p className="text-xs text-gray-500 mt-2">Bin görüntülenme başına maliyet</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-gray-600">Aktif Kampanyalar</span>
            <BarChart3 className="w-5 h-5 text-gray-400" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{stats?.active_campaigns || 0}</div>
          <p className="text-xs text-gray-500 mt-2">Şu anda aktif kampanya sayısı</p>
        </motion.div>
      </div>

      {/* Campaign Performance Table */}
      {filteredCampaigns && filteredCampaigns.length > 0 && (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Kampanya Performansı</h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-gray-200">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900">Kampanya</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Görüntülenme</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Tıklama</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">CTR</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">Harcama</th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900">CPC</th>
                </tr>
              </thead>
              <tbody>
                {filteredCampaigns.map((campaign) => {
                  const ctr =
                    campaign.impressions && campaign.impressions > 0
                      ? (Number(campaign.clicks || 0) / campaign.impressions) * 100
                      : 0;
                  const cpc =
                    campaign.clicks && campaign.clicks > 0
                      ? Number(campaign.spent_amount || 0) / campaign.clicks
                      : 0;

                  return (
                    <tr key={campaign.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-gray-900">{campaign.name}</div>
                        <div className="text-sm text-gray-500">{campaign.campaign_type}</div>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-700">
                        {(campaign.impressions || 0).toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4 text-gray-700">
                        {(campaign.clicks || 0).toLocaleString()}
                      </td>
                      <td className="text-right py-3 px-4">
                        <span
                          className={`font-semibold ${
                            ctr > 2 ? "text-green-600" : ctr > 1 ? "text-amber-600" : "text-red-600"
                          }`}
                        >
                          {ctr.toFixed(2)}%
                        </span>
                      </td>
                      <td className="text-right py-3 px-4 text-gray-700">
                        {Number(campaign.spent_amount || 0).toFixed(2)} TRY
                      </td>
                      <td className="text-right py-3 px-4 text-gray-700">{Number(cpc).toFixed(2)} TRY</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
