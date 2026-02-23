"use client";

import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  Eye,
  TrendingUp,
  Target,
  ImageIcon,
  DollarSign,
  Calendar,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  BarChart3,
  Play,
  Pause,
  Edit,
  Trash2,
} from "lucide-react";
import { adCampaignsApi, type AdCampaign, type CampaignType } from "@/lib/api";
import { toast } from "sonner";

const TYPE_ICONS: Record<CampaignType, typeof TrendingUp> = {
  featured_course: TrendingUp,
  course_promotion: Target,
  banner_ad: ImageIcon,
};

const TYPE_LABELS: Record<CampaignType, string> = {
  featured_course: "Öne Çıkan Kurs",
  course_promotion: "Kurs Promosyonu",
  banner_ad: "Banner Reklam",
};

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700",
  pending: "bg-amber-100 text-amber-700",
  pending_approval: "bg-amber-100 text-amber-700",
  active: "bg-green-100 text-green-700",
  paused: "bg-yellow-100 text-yellow-700",
  completed: "bg-blue-100 text-blue-700",
  rejected: "bg-red-100 text-red-700",
};

const APPROVAL_STATUS_COLORS: Record<string, string> = {
  pending: "bg-amber-100 text-amber-700",
  approved: "bg-green-100 text-green-700",
  rejected: "bg-red-100 text-red-700",
};

export default function TeacherCampaignDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const campaignId = params.id as string;

  const { data: campaign, isLoading, error } = useQuery({
    queryKey: ["teacher-campaign", campaignId],
    queryFn: () => adCampaignsApi.get(campaignId),
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => adCampaignsApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-ads"] });
      toast.success("Kampanya duraklatıldı");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Kampanya duraklatılamadı");
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => adCampaignsApi.resume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-campaign", campaignId] });
      queryClient.invalidateQueries({ queryKey: ["teacher-ads"] });
      toast.success("Kampanya devam ettirildi");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Kampanya devam ettirilemedi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adCampaignsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-ads"] });
      toast.success("Kampanya silindi");
      router.push("/dashboard/teacher/ads");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.detail || "Kampanya silinemedi");
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  if (error || !campaign) {
    return (
      <div className="p-8">
        <div className="bg-red-50 border-2 border-red-200 rounded-2xl p-8 text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-red-900 mb-2">Kampanya Bulunamadı</h2>
          <p className="text-red-700 mb-6">
            {error ? "Kampanya yüklenirken bir hata oluştu." : "Bu kampanya bulunamadı veya erişim yetkiniz yok."}
          </p>
          <button
            onClick={() => router.push("/dashboard/teacher/ads")}
            className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition-colors font-medium"
          >
            Kampanyalarıma Dön
          </button>
        </div>
      </div>
    );
  }

  const TypeIcon = TYPE_ICONS[campaign.campaign_type] || TrendingUp;
  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.push("/dashboard/teacher/ads")}
            className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-gray-700" />
          </button>
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">{campaign.name}</h1>
            <p className="text-gray-600">Kampanya Detayları</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {campaign.status === "active" ? (
            <button
              onClick={() => pauseMutation.mutate(campaign.id)}
              disabled={pauseMutation.isPending}
              className="px-6 py-3 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Pause className="w-5 h-5" />
              Duraklat
            </button>
          ) : campaign.status === "paused" ? (
            <button
              onClick={() => resumeMutation.mutate(campaign.id)}
              disabled={resumeMutation.isPending}
              className="px-6 py-3 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Play className="w-5 h-5" />
              Devam Et
            </button>
          ) : null}
          {campaign.status !== "active" && (
            <button
              onClick={() => {
                if (confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) {
                  deleteMutation.mutate(campaign.id);
                }
              }}
              disabled={deleteMutation.isPending}
              className="px-6 py-3 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors font-medium flex items-center gap-2 disabled:opacity-50"
            >
              <Trash2 className="w-5 h-5" />
              Sil
            </button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Durum</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${STATUS_COLORS[campaign.status] || "bg-gray-100 text-gray-700"}`}>
              {campaign.status === "pending_approval" ? "Onay Bekliyor" : campaign.status === "active" ? "Aktif" : campaign.status === "paused" ? "Duraklatıldı" : campaign.status}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
              <BarChart3 className="w-6 h-6 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">{TYPE_LABELS[campaign.campaign_type]}</p>
              <p className="text-sm text-gray-600">Kampanya Tipi</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Onay Durumu</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${APPROVAL_STATUS_COLORS[campaign.approval_status] || "bg-gray-100 text-gray-700"}`}>
              {campaign.approval_status === "pending" ? "Beklemede" : campaign.approval_status === "approved" ? "Onaylandı" : "Reddedildi"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
              {campaign.approval_status === "approved" ? (
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              ) : campaign.approval_status === "rejected" ? (
                <XCircle className="w-6 h-6 text-red-600" />
              ) : (
                <Clock className="w-6 h-6 text-amber-600" />
              )}
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {campaign.approval_status === "approved" ? "Onaylandı" : campaign.approval_status === "rejected" ? "Reddedildi" : "Beklemede"}
              </p>
              <p className="text-sm text-gray-600">Onay Durumu</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-gray-600">Ödeme Durumu</span>
            <span className={`px-3 py-1 rounded-lg text-xs font-semibold ${campaign.payment_status === "paid" ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"}`}>
              {campaign.payment_status === "paid" ? "Ödendi" : campaign.payment_status === "pending" ? "Beklemede" : "İade Edildi"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
              <DollarSign className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {Number(campaign.total_budget).toFixed(2)} TRY
              </p>
              <p className="text-sm text-gray-600">Toplam Bütçe</p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Campaign Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Kampanya Bilgileri</h2>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-teal-100 flex items-center justify-center">
                  <TypeIcon className="w-6 h-6 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Kampanya Tipi</p>
                  <p className="text-lg font-semibold text-gray-900">{TYPE_LABELS[campaign.campaign_type]}</p>
                </div>
              </div>

              {campaign.course && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                    <Target className="w-6 h-6 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Kurs</p>
                    <p className="text-lg font-semibold text-gray-900">{campaign.course.title}</p>
                  </div>
                </div>
              )}

              {campaign.placement && (
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center">
                    <ImageIcon className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Yerleşim</p>
                    <p className="text-lg font-semibold text-gray-900">{campaign.placement.name}</p>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tarih Aralığı</p>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDate(campaign.start_date)} - {formatDate(campaign.end_date)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Analytics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Performans Metrikleri</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-teal-50 rounded-xl">
                <Eye className="w-8 h-8 text-teal-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{campaign.impressions.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Görüntülenme</p>
              </div>
              <div className="text-center p-4 bg-blue-50 rounded-xl">
                <Target className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{campaign.clicks.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Tıklama</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-xl">
                <TrendingUp className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{Number(campaign.ctr).toFixed(2)}%</p>
                <p className="text-sm text-gray-600">CTR</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-xl">
                <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto mb-2" />
                <p className="text-2xl font-bold text-gray-900">{campaign.conversions.toLocaleString()}</p>
                <p className="text-sm text-gray-600">Dönüşüm</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Column - Budget & Actions */}
        <div className="space-y-6">
          {/* Budget Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg"
          >
            <h3 className="text-lg font-bold text-gray-900 mb-4">Bütçe Bilgileri</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Toplam Bütçe</span>
                <span className="text-lg font-bold text-gray-900">{Number(campaign.total_budget).toFixed(2)} TRY</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Harcanan</span>
                <span className="text-lg font-bold text-teal-600">{Number(campaign.spent_amount).toFixed(2)} TRY</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Kalan</span>
                <span className="text-lg font-bold text-green-600">
                  {(Number(campaign.total_budget) - Number(campaign.spent_amount)).toFixed(2)} TRY
                </span>
              </div>
              {campaign.daily_budget && (
                <div className="pt-3 border-t border-amber-200">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Günlük Bütçe</span>
                    <span className="text-sm font-semibold text-gray-900">{Number(campaign.daily_budget).toFixed(2)} TRY</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {/* Rejection Reason */}
          {campaign.approval_status === "rejected" && campaign.rejection_reason && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-red-50 border-2 border-red-200 rounded-2xl p-6"
            >
              <div className="flex items-center gap-3 mb-3">
                <XCircle className="w-6 h-6 text-red-600" />
                <h3 className="text-lg font-bold text-red-900">Red Sebebi</h3>
              </div>
              <p className="text-sm text-red-700">{campaign.rejection_reason}</p>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
