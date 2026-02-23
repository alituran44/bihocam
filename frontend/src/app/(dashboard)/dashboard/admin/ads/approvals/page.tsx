"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  CheckCircle2,
  XCircle,
  Eye,
  Clock,
  DollarSign,
  Calendar,
  User,
  BookOpen,
  MapPin,
  TrendingUp,
  AlertCircle,
  X,
} from "lucide-react";
import {
  adCampaignsApi,
  type AdCampaign,
  type ApprovalStatus,
  type CampaignStatus,
} from "@/lib/api";
import { toast } from "sonner";

const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Beklemede",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Taslak",
  pending: "Beklemede",
  active: "Aktif",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
  rejected: "Reddedildi",
};

export default function AdminApprovalsPage() {
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<ApprovalStatus | "all">("pending");
  const [selectedCampaign, setSelectedCampaign] = useState<AdCampaign | null>(null);

  const { data: campaigns, isLoading } = useQuery<AdCampaign[]>({
    queryKey: ["admin-campaigns", selectedStatus],
    queryFn: () =>
      adCampaignsApi.listAll({
        approval_status: selectedStatus !== "all" ? selectedStatus : undefined,
      }),
  });

  const approveMutation = useMutation({
    mutationFn: (id: string) => adCampaignsApi.approve(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      toast.success("Kampanya onaylandı");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Kampanya onaylanırken bir hata oluştu");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ id, reason }: { id: string; reason: string }) =>
      adCampaignsApi.reject(id, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-campaigns"] });
      setSelectedCampaign(null);
      toast.success("Kampanya reddedildi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Kampanya reddedilirken bir hata oluştu");
    },
  });

  const pendingCampaigns = campaigns?.filter((c) => c.approval_status === "pending") || [];
  const approvedCampaigns = campaigns?.filter((c) => c.approval_status === "approved") || [];
  const rejectedCampaigns = campaigns?.filter((c) => c.approval_status === "rejected") || [];

  const handleReject = (campaign: AdCampaign) => {
    const reason = prompt("Red sebebi:");
    if (reason && reason.trim()) {
      rejectMutation.mutate({ id: campaign.id, reason: reason.trim() });
    }
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div>
        <h1 className="text-4xl font-bold text-gray-900 mb-2">Kampanya Onayları</h1>
        <p className="text-gray-600">Reklam kampanyalarını onaylayın veya reddedin</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-amber-800">Bekleyen</span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="text-3xl font-bold text-amber-900">{pendingCampaigns.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-6 border-2 border-green-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-green-800">Onaylanan</span>
            <CheckCircle2 className="w-5 h-5 text-green-600" />
          </div>
          <div className="text-3xl font-bold text-green-900">{approvedCampaigns.length}</div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-6 border-2 border-red-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-semibold text-red-800">Reddedilen</span>
            <XCircle className="w-5 h-5 text-red-600" />
          </div>
          <div className="text-3xl font-bold text-red-900">{rejectedCampaigns.length}</div>
        </motion.div>
      </div>

      {/* Filter */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
        <label className="block text-sm font-semibold text-gray-900 mb-2">Durum Filtresi</label>
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value as ApprovalStatus | "all")}
          className="w-full md:w-auto px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
        >
          <option value="all">Tümü</option>
          <option value="pending">Beklemede</option>
          <option value="approved">Onaylanan</option>
          <option value="rejected">Reddedilen</option>
        </select>
      </div>

      {/* Campaign List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      ) : campaigns && campaigns.length > 0 ? (
        <div className="space-y-4">
          {campaigns.map((campaign) => (
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
                        campaign.approval_status === "approved"
                          ? "bg-green-100 text-green-800"
                          : campaign.approval_status === "rejected"
                          ? "bg-red-100 text-red-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {APPROVAL_STATUS_LABELS[campaign.approval_status]}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-semibold ${
                        campaign.status === "active"
                          ? "bg-teal-100 text-teal-800"
                          : campaign.status === "paused"
                          ? "bg-gray-100 text-gray-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {CAMPAIGN_STATUS_LABELS[campaign.status]}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <User className="w-4 h-4" />
                      <span className="font-medium">Eğitmen ID: {campaign.teacher_id.slice(0, 8)}...</span>
                    </div>
                    {campaign.course_id && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <BookOpen className="w-4 h-4" />
                        <span className="font-medium">Kurs ID: {campaign.course_id.slice(0, 8)}...</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4" />
                      <span className="font-medium">Yerleşim ID: {campaign.placement_id.slice(0, 8)}...</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <DollarSign className="w-4 h-4" />
                      <span className="font-medium">
                        Bütçe: {Number(campaign.total_budget || 0).toFixed(2)} TRY
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Başlangıç: {new Date(campaign.start_date).toLocaleDateString("tr-TR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>Bitiş: {new Date(campaign.end_date).toLocaleDateString("tr-TR")}</span>
                    </div>
                    {campaign.impressions !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>Görüntülenme: {campaign.impressions.toLocaleString()}</span>
                      </div>
                    )}
                    {campaign.clicks !== undefined && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>Tıklama: {campaign.clicks.toLocaleString()}</span>
                      </div>
                    )}
                  </div>

                  {campaign.rejection_reason && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <div className="flex items-center gap-2 text-red-800">
                        <AlertCircle className="w-4 h-4" />
                        <span className="font-semibold text-sm">Red Sebebi:</span>
                      </div>
                      <p className="text-sm text-red-700 mt-1">{campaign.rejection_reason}</p>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2 ml-4">
                  <button
                    onClick={() => setSelectedCampaign(campaign)}
                    className="px-4 py-2 bg-teal-100 text-teal-700 rounded-lg hover:bg-teal-200 transition-colors font-medium text-sm flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Detay
                  </button>
                  {campaign.approval_status === "pending" && (
                    <>
                      <button
                        onClick={() => approveMutation.mutate(campaign.id)}
                        disabled={approveMutation.isPending}
                        className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        Onayla
                      </button>
                      <button
                        onClick={() => handleReject(campaign)}
                        disabled={rejectMutation.isPending}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium text-sm flex items-center gap-2 disabled:opacity-50"
                      >
                        <XCircle className="w-4 h-4" />
                        Reddet
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border-2 border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">Henüz kampanya bulunmuyor</p>
        </div>
      )}

      {/* Detail Modal */}
      {selectedCampaign && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="sticky top-0 bg-gradient-to-r from-teal-500 to-emerald-600 p-6 rounded-t-3xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">Kampanya Detayları</h2>
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                >
                  <XCircle className="w-5 h-5 text-white" />
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Kampanya Adı</label>
                  <p className="text-lg font-bold text-gray-900">{selectedCampaign.name}</p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Durum</label>
                  <p className="text-lg font-bold text-gray-900">
                    {CAMPAIGN_STATUS_LABELS[selectedCampaign.status]}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Onay Durumu</label>
                  <p className="text-lg font-bold text-gray-900">
                    {APPROVAL_STATUS_LABELS[selectedCampaign.approval_status]}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Ödeme Durumu</label>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedCampaign.payment_status || "N/A"}
                  </p>
                </div>
              </div>

              {selectedCampaign.banner_image_url && (
                <div>
                  <label className="text-sm font-semibold text-gray-600">Banner Görseli</label>
                  <img
                    src={selectedCampaign.banner_image_url}
                    alt={selectedCampaign.banner_alt_text || "Banner"}
                    className="mt-2 rounded-xl max-w-full h-auto"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-semibold text-gray-600">Toplam Bütçe</label>
                  <p className="text-lg font-bold text-gray-900">
                    {Number(selectedCampaign.total_budget || 0).toFixed(2)} TRY
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Harcanan</label>
                  <p className="text-lg font-bold text-gray-900">
                    {Number(selectedCampaign.spent_amount || 0).toFixed(2)} TRY
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Görüntülenme</label>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedCampaign.impressions?.toLocaleString() || "0"}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-semibold text-gray-600">Tıklama</label>
                  <p className="text-lg font-bold text-gray-900">
                    {selectedCampaign.clicks?.toLocaleString() || "0"}
                  </p>
                </div>
              </div>

              {selectedCampaign.rejection_reason && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                  <label className="text-sm font-semibold text-red-800">Red Sebebi</label>
                  <p className="text-red-700 mt-1">{selectedCampaign.rejection_reason}</p>
                </div>
              )}

              <div className="flex items-center justify-end gap-4 pt-4 border-t">
                {selectedCampaign.approval_status === "pending" && (
                  <>
                    <button
                      onClick={() => {
                        approveMutation.mutate(selectedCampaign.id);
                        setSelectedCampaign(null);
                      }}
                      disabled={approveMutation.isPending}
                      className="px-6 py-3 bg-green-600 text-white font-semibold rounded-xl hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      Onayla
                    </button>
                    <button
                      onClick={() => {
                        const reason = prompt("Red sebebi:");
                        if (reason && reason.trim()) {
                          rejectMutation.mutate({ id: selectedCampaign.id, reason: reason.trim() });
                        }
                      }}
                      disabled={rejectMutation.isPending}
                      className="px-6 py-3 bg-red-600 text-white font-semibold rounded-xl hover:bg-red-700 transition-colors disabled:opacity-50"
                    >
                      Reddet
                    </button>
                  </>
                )}
                <button
                  onClick={() => setSelectedCampaign(null)}
                  className="px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                >
                  Kapat
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
