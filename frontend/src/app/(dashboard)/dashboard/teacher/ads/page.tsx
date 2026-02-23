"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  Plus,
  Filter,
  Search,
  TrendingUp,
  Image as ImageIcon,
  Calendar,
  DollarSign,
  Eye,
  Edit,
  Trash2,
  Pause,
  Play,
  BarChart3,
  AlertCircle,
  CheckCircle2,
  XCircle,
  Clock,
  Target,
} from "lucide-react";
import {
  adCampaignsApi,
  type AdCampaignListResponse,
  type CampaignStatus,
  type CampaignType,
  type AdPlacement,
  type ApprovalStatus,
} from "@/lib/api";
import { toast } from "sonner";
import AdCampaignForm from "@/components/ads/AdCampaignForm";
import Link from "next/link";

const STATUS_COLORS: Record<CampaignStatus, string> = {
  draft: "bg-gray-100 text-gray-800 border-gray-200",
  pending_approval: "bg-amber-100 text-amber-800 border-amber-200",
  active: "bg-green-100 text-green-800 border-green-200",
  paused: "bg-yellow-100 text-yellow-800 border-yellow-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
  cancelled: "bg-gray-100 text-gray-800 border-gray-200",
};

const STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: "Taslak",
  pending_approval: "Onay Bekliyor",
  active: "Aktif",
  paused: "Duraklatıldı",
  completed: "Tamamlandı",
  rejected: "Reddedildi",
  cancelled: "İptal Edildi",
};

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

const APPROVAL_STATUS_COLORS: Record<ApprovalStatus, string> = {
  pending: "bg-amber-100 text-amber-800 border-amber-200",
  approved: "bg-green-100 text-green-800 border-green-200",
  rejected: "bg-red-100 text-red-800 border-red-200",
};

const APPROVAL_STATUS_LABELS: Record<ApprovalStatus, string> = {
  pending: "Onay Bekliyor",
  approved: "Onaylandı",
  rejected: "Reddedildi",
};

function formatDate(date: string): string {
  return new Date(date).toLocaleString("tr-TR", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function TeacherAdsPage() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<AdCampaignListResponse | null>(null);
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | "all">("all");
  const [placementFilter, setPlacementFilter] = useState<string>("all");
  const [courseFilter, setCourseFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const { data: campaigns, isLoading } = useQuery<AdCampaignListResponse[]>({
    queryKey: ["teacher-ads", statusFilter, placementFilter, courseFilter],
    queryFn: () =>
      adCampaignsApi.list({
        status: statusFilter !== "all" ? statusFilter : undefined,
        placement_id: placementFilter !== "all" ? placementFilter : undefined,
        course_id: courseFilter !== "all" ? courseFilter : undefined,
      }),
  });

  const { data: balance } = useQuery({
    queryKey: ["teacher-ad-balance"],
    queryFn: () => adCampaignsApi.getBalance(),
  });

  const { data: placements } = useQuery<AdPlacement[]>({
    queryKey: ["teacher-placements"],
    queryFn: () => adCampaignsApi.getPlacements(),
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => adCampaignsApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-ads"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-ad-balance"] });
      setShowForm(false);
      toast.success("Kampanya başarıyla oluşturuldu ve onay için gönderildi");
    },
    onError: (error: any) => {
      console.error("Campaign creation error:", error);
      const errorMessage = error?.response?.data?.detail || error?.response?.data?.message || error?.message || "Kampanya oluşturulurken bir hata oluştu";
      const errorDetails = error?.response?.data?.errors;
      if (errorDetails) {
        console.error("Validation errors:", errorDetails);
        toast.error(`${errorMessage}: ${JSON.stringify(errorDetails)}`);
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const pauseMutation = useMutation({
    mutationFn: (id: string) => adCampaignsApi.pause(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-ads"] });
      toast.success("Kampanya duraklatıldı");
    },
  });

  const resumeMutation = useMutation({
    mutationFn: (id: string) => adCampaignsApi.resume(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-ads"] });
      toast.success("Kampanya devam ettirildi");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adCampaignsApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-ads"] });
      queryClient.invalidateQueries({ queryKey: ["teacher-ad-balance"] });
      toast.success("Kampanya silindi");
    },
  });

  const handleEdit = (campaign: AdCampaignListResponse) => {
    adCampaignsApi.get(campaign.id).then((fullCampaign) => {
      setEditingCampaign(fullCampaign as any);
      setShowForm(true);
    });
  };

  const handleSave = async (data: any) => {
    if (editingCampaign) {
      await adCampaignsApi.update(editingCampaign.id, data);
      toast.success("Kampanya güncellendi");
    } else {
      await createMutation.mutateAsync(data);
    }
    setShowForm(false);
    setEditingCampaign(null);
  };

  const filteredCampaigns = campaigns?.filter((c) => {
    if (searchQuery) {
      return c.name.toLowerCase().includes(searchQuery.toLowerCase());
    }
    return true;
  });

  // Stats
  const stats = {
    total: campaigns?.length || 0,
    active: campaigns?.filter((c) => c.status === "active").length || 0,
    pending: campaigns?.filter((c) => c.status === "pending_approval").length || 0,
    totalSpent: campaigns?.reduce((sum, c) => sum + Number(c.spent_amount || 0), 0) || 0,
  };

  return (
    <div className="space-y-8 p-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Reklam Kampanyalarım</h1>
          <p className="text-gray-600">
            Kurslarınızı öne çıkarın ve daha fazla öğrenciye ulaşın
          </p>
        </div>
        <button
          onClick={() => {
            setEditingCampaign(null);
            setShowForm(true);
          }}
          className="flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-teal-500 to-emerald-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105"
        >
          <Plus className="w-5 h-5" />
          Yeni Kampanya
        </button>
      </div>

      {/* Balance Card */}
      {balance && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 rounded-2xl p-6 border-2 border-amber-200 shadow-lg"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-amber-700 mb-1">Kullanılabilir Bakiye</p>
              <p className="text-4xl font-bold text-amber-900">
                {Number(balance.available_balance).toFixed(2)} TRY
              </p>
              {balance.pending_amounts > 0 && (
                <p className="text-xs text-amber-600 mt-1">
                  Bekleyen: {Number(balance.pending_amounts).toFixed(2)} TRY
                </p>
              )}
            </div>
            <div className="w-20 h-20 rounded-2xl bg-amber-500/20 flex items-center justify-center">
              <DollarSign className="w-10 h-10 text-amber-600" />
            </div>
          </div>
        </motion.div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          {
            label: "Toplam Kampanya",
            value: stats.total,
            icon: BarChart3,
            color: "from-teal-500 to-emerald-600",
            bgColor: "from-teal-50 to-emerald-50",
            borderColor: "border-teal-200",
          },
          {
            label: "Aktif Kampanya",
            value: stats.active,
            icon: CheckCircle2,
            color: "from-green-500 to-emerald-600",
            bgColor: "from-green-50 to-emerald-50",
            borderColor: "border-green-200",
          },
          {
            label: "Onay Bekliyor",
            value: stats.pending,
            icon: Clock,
            color: "from-amber-500 to-orange-600",
            bgColor: "from-amber-50 to-orange-50",
            borderColor: "border-amber-200",
          },
          {
            label: "Toplam Harcama",
            value: `${stats.totalSpent.toFixed(2)} TRY`,
            icon: DollarSign,
            color: "from-purple-500 to-pink-600",
            bgColor: "from-purple-50 to-pink-50",
            borderColor: "border-purple-200",
          },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`bg-gradient-to-br ${stat.bgColor} rounded-2xl p-6 border-2 ${stat.borderColor} shadow-lg`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${stat.color} bg-opacity-20 flex items-center justify-center`}>
                  <Icon className={`w-7 h-7 text-gray-700`} />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 border-2 border-gray-200 shadow-lg">
        <div className="flex items-center gap-4 mb-4">
          <Filter className="w-5 h-5 text-gray-600" />
          <h3 className="font-bold text-gray-900">Filtreler</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as CampaignStatus | "all")}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            >
              <option value="all">Tümü</option>
              {Object.entries(STATUS_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Yerleşim</label>
            <select
              value={placementFilter}
              onChange={(e) => setPlacementFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            >
              <option value="all">Tümü</option>
              {placements?.map((placement) => (
                <option key={placement.id} value={placement.id}>
                  {placement.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Kurs</label>
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
            >
              <option value="all">Tümü</option>
              {/* Courses will be loaded separately if needed */}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Ara</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Kampanya adı..."
                className="w-full pl-12 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 font-medium"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Campaigns List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="text-gray-500">Yükleniyor...</div>
        </div>
      ) : filteredCampaigns && filteredCampaigns.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredCampaigns.map((campaign, index) => {
            const TypeIcon = TYPE_ICONS[campaign.campaign_type];
            return (
              <motion.div
                key={campaign.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="group relative overflow-hidden rounded-2xl border-2 border-transparent bg-white/90 backdrop-blur-sm p-6 shadow-lg hover:shadow-2xl hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-emerald-500 to-green-500 rounded-t-2xl"></div>
                <div className="relative flex items-start justify-between gap-6">
                  <div className="flex-1">
                    <div className="mb-3 flex items-center gap-3 flex-wrap">
                      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-teal-50 to-emerald-50 border-2 border-teal-200">
                        <TypeIcon className="w-4 h-4 text-teal-600" />
                        <span className="font-semibold text-sm text-teal-900">
                          {TYPE_LABELS[campaign.campaign_type]}
                        </span>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 ${STATUS_COLORS[campaign.status]}`}
                      >
                        {STATUS_LABELS[campaign.status]}
                      </span>
                      {campaign.approval_status && (
                        <span
                          className={`px-4 py-2 rounded-xl font-semibold text-sm border-2 ${APPROVAL_STATUS_COLORS[campaign.approval_status]}`}
                        >
                          {APPROVAL_STATUS_LABELS[campaign.approval_status]}
                        </span>
                      )}
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">{campaign.name}</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Başlangıç: {formatDate(campaign.start_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span>Bitiş: {formatDate(campaign.end_date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <DollarSign className="w-4 h-4" />
                        <span>Bütçe: {Number(campaign.total_budget).toFixed(2)} TRY</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <TrendingUp className="w-4 h-4" />
                        <span>Harcanan: {Number(campaign.spent_amount).toFixed(2)} TRY</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <Eye className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          <span className="font-semibold">{campaign.impressions.toLocaleString()}</span> görüntülenme
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Target className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          <span className="font-semibold">{campaign.clicks.toLocaleString()}</span> tıklama
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <BarChart3 className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-600">
                          CTR: <span className="font-semibold">{Number(campaign.ctr).toFixed(2)}%</span>
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link
                      href={`/dashboard/teacher/ads/${campaign.id}`}
                      className="p-2.5 bg-blue-100 text-blue-700 rounded-xl hover:bg-blue-200 transition-colors"
                      title="Detaylar"
                    >
                      <Eye className="w-5 h-5" />
                    </Link>
                    {campaign.status !== "active" && (
                      <button
                        onClick={() => handleEdit(campaign)}
                        className="p-2.5 bg-teal-100 text-teal-700 rounded-xl hover:bg-teal-200 transition-colors"
                        title="Düzenle"
                      >
                        <Edit className="w-5 h-5" />
                      </button>
                    )}
                    {campaign.status === "active" ? (
                      <button
                        onClick={() => pauseMutation.mutate(campaign.id)}
                        className="p-2.5 bg-yellow-100 text-yellow-700 rounded-xl hover:bg-yellow-200 transition-colors"
                        title="Duraklat"
                      >
                        <Pause className="w-5 h-5" />
                      </button>
                    ) : campaign.status === "paused" ? (
                      <button
                        onClick={() => resumeMutation.mutate(campaign.id)}
                        className="p-2.5 bg-green-100 text-green-700 rounded-xl hover:bg-green-200 transition-colors"
                        title="Devam Et"
                      >
                        <Play className="w-5 h-5" />
                      </button>
                    ) : null}
                    {campaign.status !== "active" && (
                      <button
                        onClick={() => {
                          if (confirm("Bu kampanyayı silmek istediğinize emin misiniz?")) {
                            deleteMutation.mutate(campaign.id);
                          }
                        }}
                        className="p-2.5 bg-red-100 text-red-700 rounded-xl hover:bg-red-200 transition-colors"
                        title="Sil"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-12 text-center shadow-lg border-2 border-gray-200">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <BarChart3 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-600 text-lg">Henüz kampanya bulunmuyor</p>
          <p className="text-gray-500 text-sm mt-2">
            Yeni bir kampanya oluşturmak için yukarıdaki butona tıklayın
          </p>
        </div>
      )}

      {/* Form Modal */}
      {showForm && (
        <AdCampaignForm
          campaign={editingCampaign as any}
          onSave={handleSave}
          onCancel={() => {
            setShowForm(false);
            setEditingCampaign(null);
          }}
          isLoading={createMutation.isPending}
        />
      )}
    </div>
  );
}
