"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Eye,
  Edit,
  Trash2,
  Pause,
  Play,
  Filter,
  Search,
  TrendingUp,
  DollarSign,
  Calendar,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import {
  adCampaignsApi,
  type AdCampaign,
  type CampaignStatus,
  type ApprovalStatus,
} from "@/lib/api";
import { toast } from "sonner";
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

const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

export default function AdminCampaignsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [approvalFilter, setApprovalFilter] = useState<ApprovalStatus | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: campaigns, isLoading } = useQuery<AdCampaign[]>({
    queryKey: ["admin-campaigns", statusFilter, approvalFilter],
    queryFn: () =>
      adCampaignsApi.listAll({
        status: statusFilter !== "all" ? statusFilter : undefined,
        approval_status: approvalFilter !== "all" ? approvalFilter : undefined,
      }),
  });

  const { data: stats } = useQuery({
    queryKey: ["admin-campaigns-stats"],
    queryFn: () => adCampaignsApi.getStats(),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adCampaignsApi.deleteAdmin(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns-stats"] });
      toast.success("Kampanya başarıyla silindi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Kampanya silinirken bir hata oluştu");
    },
  });

  const filteredCampaigns =
    campaigns?.filter((campaign) => {
      if (searchQuery) {
        return campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
      }
      return true;
    }) || [];

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Tüm Kampanyalar</h1>
        <p className="text-gray-600">Reklam kampanyalarını görüntüleyin ve yönetin</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-blue-800">Toplam Kampanya</span>
              <TrendingUp className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-blue-900">{stats.total_campaigns}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-green-800">Aktif Kampanya</span>
              <CheckCircle2 className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-green-900">{stats.active_campaigns}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-amber-800">Bekleyen Onay</span>
              <AlertCircle className="w-5 h-5 text-amber-600" />
            </div>
            <div className="text-3xl font-bold text-amber-900">{stats.pending_approval}</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-teal-50 to-emerald-50 rounded-2xl p-6 border-2 border-teal-200 shadow-lg"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-semibold text-teal-800">Toplam Gelir</span>
              <DollarSign className="w-5 h-5 text-teal-600" />
            </div>
            <div className="text-3xl font-bold text-teal-900">
              {Number(stats.total_revenue || 0).toFixed(2)} {stats.currency || "TRY"}
            </div>
          </motion.div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
            <label className="block text-sm font-semibold text-gray-900 mb-2">Onay Durumu</label>
            <select
              value={approvalFilter}
              onChange={(e) => setApprovalFilter(e.target.value as ApprovalStatus | "all")}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            >
              <option value="all">Tümü</option>
              {Object.entries(APPROVAL_STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-semibold text-gray-900 mb-2">Ara</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kampanya adı ile ara..."
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
      ) : filteredCampaigns.length > 0 ? (
        <div className="space-y-4">
          {filteredCampaigns.map((campaign) => (
            <motion.div
              key={campaign.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-xl font-bold text-gray-900">{campaign.name}</h3>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === "active"
                          ? "bg-green-100 text-green-800"
                          : campaign.status === "paused"
                          ? "bg-gray-100 text-gray-800"
                          : campaign.status === "completed"
                          ? "bg-blue-100 text-blue-800"
                          : campaign.status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {CAMPAIGN_STATUS_LABELS[campaign.status]}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.approval_status === "approved"
                          ? "bg-green-100 text-green-800"
                          : campaign.approval_status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {APPROVAL_STATUS_LABELS[campaign.approval_status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        <span className="font-semibold">{Number(campaign.total_budget || 0).toFixed(2)}</span> TRY
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span>
                        Harcanan: <span className="font-semibold">{Number(campaign.spent_amount || 0).toFixed(2)}</span> TRY
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(campaign.start_date).toLocaleDateString("tr-TR")}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(campaign.end_date).toLocaleDateString("tr-TR")}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {campaign.impressions !== undefined && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          <span className="font-semibold">{campaign.impressions.toLocaleString()}</span> görüntülenme
                        </span>
                      </div>
                    )}
                    {campaign.clicks !== undefined && (
                      <div className="flex items-center gap-2">
                        <TrendingUp className="w-4 h-4" />
                        <span>
                          <span className="font-semibold">{campaign.clicks.toLocaleString()}</span> tıklama
                        </span>
                      </div>
                    )}
                    {campaign.ctr !== undefined && (
                      <div className="flex items-center gap-2">
                        <span>
                          CTR: <span className="font-semibold">{Number(campaign.ctr || 0).toFixed(2)}%</span>
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <Link
                    href={`/dashboard/admin/ads/approvals`}
                    className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Detay
                  </Link>
                  <button
                    onClick={() => {
                      if (confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) {
                        deleteMutation.mutate(campaign.id);
                      }
                    }}
                    disabled={deleteMutation.isPending}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                  >
                    <Trash2 className="w-4 h-4" />
                    Sil
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border-2 border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">Henüz kampanya bulunmuyor</p>
        </div>
      )}
    </div>
  );
}
