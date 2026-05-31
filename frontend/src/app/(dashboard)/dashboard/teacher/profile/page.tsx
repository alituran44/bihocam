"use client";

import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  teacherProfileApi,
  bankAccountsApi,
  teacherEarningsApi,
  withdrawalsApi,
  mediaApi,
  type TeacherProfile,
  type TeacherProfileUpdate,
  type BankAccount,
  type BankAccountCreate,
  type BankAccountUpdate,
  type TeacherEarning,
  type WithdrawalRequest,
  type TeacherEarningSummary,
} from "@/lib/api";
import Avatar from "@/components/Avatar";
import { getAvatarUrl } from "@/lib/utils/avatar";

type Tab = "profile" | "bank-accounts" | "earnings" | "withdrawals";

export default function TeacherProfilePage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Fetch teacher profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["my-teacher-profile"],
    queryFn: () => teacherProfileApi.getMyProfile(),
  });

  // Fetch bank accounts
  const { data: bankAccounts, isLoading: bankAccountsLoading } = useQuery({
    queryKey: ["my-bank-accounts"],
    queryFn: () => bankAccountsApi.list(),
    enabled: activeTab === "bank-accounts" || activeTab === "withdrawals",
  });

  // Fetch earnings summary
  const { data: earningsSummary } = useQuery({
    queryKey: ["my-earnings-summary"],
    queryFn: () => teacherEarningsApi.getMyEarningsSummary(),
    enabled: activeTab === "earnings",
  });

  // Fetch earnings list
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ["my-earnings"],
    queryFn: () => teacherEarningsApi.listMyEarnings({ limit: 50 }),
    enabled: activeTab === "earnings",
  });

  // Fetch withdrawals
  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["my-withdrawals"],
    queryFn: () => withdrawalsApi.listMyWithdrawals(),
    enabled: activeTab === "withdrawals",
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: TeacherProfileUpdate) => teacherProfileApi.updateMyProfile(profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-teacher-profile"] });
      alert("Profil başarıyla güncellendi!");
    },
    onError: (error: any) => {
      alert("Profil güncellenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  // Bank account create mutation
  const createBankAccountMutation = useMutation({
    mutationFn: (accountData: BankAccountCreate) => bankAccountsApi.create(accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bank-accounts"] });
      alert("Banka hesabı başarıyla eklendi ve onay bekliyor.");
    },
    onError: (error: any) => {
      alert("Banka hesabı eklenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  const updateBankAccountMutation = useMutation({
    mutationFn: ({ accountId, accountData }: { accountId: string; accountData: BankAccountUpdate }) =>
      bankAccountsApi.update(accountId, accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bank-accounts"] });
      alert("Banka hesabi guncellendi.");
    },
    onError: (error: any) => {
      alert("Banka hesabi guncellenirken bir hata olustu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  const deleteBankAccountMutation = useMutation({
    mutationFn: (accountId: string) => bankAccountsApi.delete(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bank-accounts"] });
      alert("Banka hesabi silindi.");
    },
    onError: (error: any) => {
      alert("Banka hesabi silinirken bir hata olustu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  const setDefaultBankAccountMutation = useMutation({
    mutationFn: (accountId: string) => bankAccountsApi.setDefault(accountId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-bank-accounts"] });
      alert("Varsayilan banka hesabi guncellendi.");
    },
    onError: (error: any) => {
      alert("Varsayilan hesap ayarlanirken bir hata olustu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  // Withdrawal create mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: (withdrawalData: { bank_account_id: string; amount: number }) =>
      withdrawalsApi.create(withdrawalData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["my-earnings-summary"] });
      alert("Çekim talebi başarıyla oluşturuldu!");
    },
    onError: (error: any) => {
      alert("Çekim talebi oluşturulurken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  const cancelWithdrawalMutation = useMutation({
    mutationFn: (withdrawalId: string) => withdrawalsApi.cancel(withdrawalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["my-earnings-summary"] });
      alert("Cekim talebi iptal edildi.");
    },
    onError: (error: any) => {
      alert("Cekim talebi iptal edilirken bir hata olustu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  if (profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
        <p className="text-red-700">Profil yüklenemedi.</p>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "bank-accounts", label: "Banka Hesapları", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { id: "earnings", label: "Kazançlar", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "withdrawals", label: "Çekim Talepleri", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30">
            {profile.full_name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
            <div className="flex items-center gap-4 text-teal-100">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profile.email}
              </span>
              {profile.phone && (
                <span className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {profile.phone}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span className={`px-4 py-2 rounded-full text-sm font-medium ${profile.is_active ? "bg-emerald-500" : "bg-red-500"}`}>
              {profile.is_active ? "Aktif" : "Pasif"}
            </span>
            {!profile.is_verified && (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-amber-500">
                Doğrulanmamış
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? "border-teal-500 text-teal-600"
                    : "border-transparent text-gray-600 hover:text-gray-900 hover:border-gray-300"
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
                </svg>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-6">
              {/* Profile Tab */}
              {activeTab === "profile" && (
                <ProfileTab
                  profile={profile}
                  onUpdate={(data) => updateProfileMutation.mutate(data)}
                  isUpdating={updateProfileMutation.isPending}
                  queryClient={queryClient}
                />
              )}

          {/* Bank Accounts Tab */}
          {activeTab === "bank-accounts" && (
            <BankAccountsTab
              bankAccounts={bankAccounts || []}
              isLoading={bankAccountsLoading}
              onCreate={(accountData) => createBankAccountMutation.mutate(accountData)}
              onUpdate={(accountId, accountData) => updateBankAccountMutation.mutate({ accountId, accountData })}
              onDelete={(accountId) => deleteBankAccountMutation.mutate(accountId)}
              onSetDefault={(accountId) => setDefaultBankAccountMutation.mutate(accountId)}
              isCreating={createBankAccountMutation.isPending}
              isUpdating={updateBankAccountMutation.isPending}
              isDeleting={deleteBankAccountMutation.isPending}
              isSettingDefault={setDefaultBankAccountMutation.isPending}
            />
          )}

          {/* Earnings Tab */}
          {activeTab === "earnings" && (
            <EarningsTab
              summary={earningsSummary}
              earnings={earnings || []}
              isLoading={earningsLoading}
            />
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <WithdrawalsTab
              withdrawals={withdrawals || []}
              isLoading={withdrawalsLoading}
              bankAccounts={bankAccounts || []}
              onCreate={(withdrawalData) => createWithdrawalMutation.mutate(withdrawalData)}
              onCancel={(withdrawalId) => cancelWithdrawalMutation.mutate(withdrawalId)}
              isCreating={createWithdrawalMutation.isPending}
              isCancelling={cancelWithdrawalMutation.isPending}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component - Enhanced with detailed editing
function ProfileTab({
  profile,
  onUpdate,
  isUpdating,
  queryClient,
}: {
  profile: TeacherProfile;
  onUpdate: (data: TeacherProfileUpdate) => void;
  isUpdating: boolean;
  queryClient: any;
}) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    full_name: profile.full_name,
    phone: profile.phone || "",
    bio: profile.bio || "",
    expertise_tags: profile.expertise_tags?.join(", ") || "",
    social_links: {
      linkedin: profile.social_links?.linkedin || "",
      twitter: profile.social_links?.twitter || "",
      instagram: profile.social_links?.instagram || "",
      website: profile.social_links?.website || "",
    },
    avatar_url: profile.avatar_url || "",
  });
  const [tagInput, setTagInput] = useState("");
  const [urlErrors, setUrlErrors] = useState<Record<string, string>>({});
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const directFileInputRef = React.useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isEditing) {
      setFormData({
        full_name: profile.full_name,
        phone: profile.phone || "",
        bio: profile.bio || "",
        expertise_tags: profile.expertise_tags?.join(", ") || "",
        social_links: {
          linkedin: profile.social_links?.linkedin || "",
          twitter: profile.social_links?.twitter || "",
          instagram: profile.social_links?.instagram || "",
          website: profile.social_links?.website || "",
        },
        avatar_url: profile.avatar_url || "",
      });
    }
  }, [profile, isEditing]);

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.expertise_tags.split(", ").includes(tagInput.trim())) {
      const newTags = formData.expertise_tags
        ? [...formData.expertise_tags.split(", ").filter(Boolean), tagInput.trim()]
        : [tagInput.trim()];
      setFormData({ ...formData, expertise_tags: newTags.join(", ") });
      setTagInput("");
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const tags = formData.expertise_tags.split(", ").filter((t) => t.trim() !== tagToRemove);
    setFormData({ ...formData, expertise_tags: tags.join(", ") });
  };

  const handleAvatarUpload = async (file: File) => {
    // Dosya validasyonu
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      alert("Geçersiz dosya formatı. Lütfen JPG, PNG, GIF veya WEBP formatında bir resim seçin.");
      return;
    }

    // Dosya boyutu kontrolü (5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("Dosya boyutu çok büyük. Maksimum 5MB olmalıdır.");
      return;
    }

    setIsUploadingAvatar(true);
    setUploadProgress(0);

    try {
      // Simüle edilmiş progress (gerçek upload progress için XMLHttpRequest kullanılabilir)
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 100);

      const result = await mediaApi.uploadAvatar(file);
      clearInterval(progressInterval);
      setUploadProgress(100);

      // Profil güncelleme
      await onUpdate({
        avatar_url: result.url,
      });

      // Query'yi invalidate et
      queryClient.invalidateQueries({ queryKey: ["my-teacher-profile"] });

      setTimeout(() => {
        setIsUploadingAvatar(false);
        setUploadProgress(0);
      }, 500);
    } catch (error: any) {
      setIsUploadingAvatar(false);
      setUploadProgress(0);
      alert("Avatar yüklenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleAvatarUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleAvatarUpload(e.target.files[0]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: TeacherProfileUpdate = {
      full_name: formData.full_name,
      phone: formData.phone || undefined,
      bio: formData.bio || undefined,
      expertise_tags: formData.expertise_tags
        ? formData.expertise_tags.split(", ").map((t) => t.trim()).filter(Boolean)
        : undefined,
      social_links: {
        linkedin: formData.social_links.linkedin || undefined,
        twitter: formData.social_links.twitter || undefined,
        instagram: formData.social_links.instagram || undefined,
        website: formData.social_links.website || undefined,
      },
      avatar_url: formData.avatar_url || undefined,
    };
    onUpdate(updateData);
    setIsEditing(false);
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 rounded-2xl p-8 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative flex items-center gap-6">
          <input
            ref={directFileInputRef}
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleAvatarUpload(e.target.files[0]);
              }
            }}
            className="hidden"
          />
          <div className="relative">
            <div
              className="relative group cursor-pointer"
              onClick={() => directFileInputRef.current?.click()}
              title="Profil Fotoğrafı Yükle / Değiştir"
            >
              <Avatar
                src={profile.avatar_url}
                name={profile.full_name}
                size="xl"
                showBorder
                borderColor="border-white/30"
                className="bg-white/20 backdrop-blur-md transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center border-4 border-white/20">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            </div>
            {isEditing && (
              <div
                onClick={() => directFileInputRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center shadow-lg border-2 border-white cursor-pointer hover:bg-teal-600 transition-colors"
              >
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-3xl font-bold text-white mb-2">{profile.full_name}</h2>
            <div className="flex items-center gap-4 text-teal-100 mb-4">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {profile.email}
              </div>
              {profile.phone && (
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  {profile.phone}
                </div>
              )}
            </div>
            <div className="flex items-center gap-3">
              <span className={`px-4 py-1.5 rounded-full text-sm font-semibold ${profile.is_active ? "bg-emerald-500/20 text-white border border-emerald-300/30" : "bg-red-500/20 text-white border border-red-300/30"}`}>
                {profile.is_active ? "✓ Aktif" : "✗ Pasif"}
              </span>
              {profile.is_verified && (
                <span className="px-4 py-1.5 rounded-full text-sm font-semibold bg-blue-500/20 text-white border border-blue-300/30">
                  ✓ Doğrulanmış
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsEditing(!isEditing)}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 ${
              isEditing
                ? "bg-white/20 backdrop-blur-md text-white border border-white/30 hover:bg-white/30"
                : "bg-white text-teal-600 hover:bg-teal-50"
            }`}
          >
            {isEditing ? (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                İptal
              </>
            ) : (
              <>
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Profili Düzenle
              </>
            )}
          </button>
        </div>
      </div>

      {/* Form Section */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Temel Bilgiler</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Ad Soyad <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
                  placeholder="Adınız ve soyadınız"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Telefon</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
                  placeholder="+90 5XX XXX XX XX"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-3">E-posta</label>
                <div className="px-4 py-3 bg-gray-50 border-2 border-gray-200 rounded-xl text-gray-600 font-medium">
                  {profile.email}
                </div>
                <p className="text-xs text-gray-500 mt-2">E-posta adresi değiştirilemez</p>
              </div>
            </div>
          </div>

          {/* Bio & Expertise Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Biyografi & Uzmanlık</h3>
            </div>
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Biyografi <span className="text-gray-500 font-normal">(Maks. 2000 karakter)</span>
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={6}
                  maxLength={2000}
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300 resize-none"
                  placeholder="Kendiniz hakkında kısa bir açıklama yazın..."
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">Bu bilgi public profil sayfanızda görünecektir</p>
                  <span className="text-xs font-medium text-gray-600">{formData.bio.length}/2000</span>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  Uzmanlık Alanları <span className="text-gray-500 font-normal">(Maks. 20 alan)</span>
                </label>
                <div className="flex flex-wrap gap-2 mb-3 min-h-[60px] p-3 bg-gray-50 rounded-xl border-2 border-gray-200">
                  {formData.expertise_tags
                    ? formData.expertise_tags
                        .split(", ")
                        .filter(Boolean)
                        .map((tag, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full text-sm font-semibold shadow-md"
                          >
                            {tag}
                            <button
                              type="button"
                              onClick={() => handleRemoveTag(tag)}
                              className="hover:bg-white/20 rounded-full p-0.5 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                              </svg>
                            </button>
                          </span>
                        ))
                    : null}
                  {(!formData.expertise_tags || formData.expertise_tags.split(", ").filter(Boolean).length < 20) && (
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            handleAddTag();
                          }
                        }}
                        placeholder="Yeni alan ekle..."
                        className="px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 text-sm font-medium min-w-[150px]"
                      />
                      <button
                        type="button"
                        onClick={handleAddTag}
                        className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors font-semibold text-sm"
                      >
                        Ekle
                      </button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-gray-500">
                  {formData.expertise_tags ? formData.expertise_tags.split(", ").filter(Boolean).length : 0}/20 uzmanlık alanı
                </p>
              </div>
            </div>
          </div>

          {/* Social Media & Avatar Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sosyal Medya & Görsel</h3>
            </div>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={formData.social_links.linkedin}
                    onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
                    placeholder="https://linkedin.com/in/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-sky-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={formData.social_links.twitter}
                    onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
                    placeholder="https://twitter.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-pink-600" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={formData.social_links.instagram}
                    onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, instagram: e.target.value } })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
                    placeholder="https://instagram.com/..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website URL
                  </label>
                  <input
                    type="url"
                    value={formData.social_links.website}
                    onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, website: e.target.value } })}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
                    placeholder="https://example.com"
                  />
                </div>
              </div>
              {/* Avatar Upload Component */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Profil Fotoğrafı
                </label>
                
                {/* Drag & Drop Upload Area */}
                <div
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`relative group transition-all duration-300 ${
                    dragActive
                      ? "scale-105 border-teal-500 bg-teal-50"
                      : "border-gray-200 hover:border-teal-300 bg-white"
                  } border-2 border-dashed rounded-2xl p-8 cursor-pointer`}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/gif,image/webp"
                    onChange={handleFileInput}
                    className="hidden"
                  />

                  {isUploadingAvatar ? (
                    <div className="flex flex-col items-center justify-center space-y-4">
                      <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-4 border-teal-200"></div>
                        <div
                          className="absolute inset-0 rounded-full border-4 border-teal-500 border-t-transparent animate-spin"
                          style={{
                            background: `conic-gradient(from 0deg, transparent ${uploadProgress * 3.6}deg, #14b8a6 ${uploadProgress * 3.6}deg)`,
                          }}
                        ></div>
                        <div className="absolute inset-0 flex items-center justify-center">
                          <span className="text-2xl font-bold text-teal-600">{uploadProgress}%</span>
                        </div>
                      </div>
                      <p className="text-sm font-semibold text-gray-700">Yükleniyor...</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-col items-center justify-center space-y-4">
                        <div className="relative">
                          {formData.avatar_url || profile.avatar_url ? (
                            <div className="relative group/avatar">
                              <img
                                src={getAvatarUrl(formData.avatar_url || profile.avatar_url || "")}
                                alt="Avatar"
                                className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-2xl transition-transform group-hover:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/50 rounded-2xl opacity-0 group-hover/avatar:opacity-100 transition-opacity flex items-center justify-center">
                                <div className="text-white text-center">
                                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                  </svg>
                                  <p className="text-xs font-semibold">Değiştir</p>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-teal-100 to-teal-200 border-4 border-teal-300 flex items-center justify-center shadow-xl">
                              <svg className="w-16 h-16 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>
                        <div className="text-center">
                          <p className="text-sm font-bold text-gray-900 mb-1">
                            {formData.avatar_url || profile.avatar_url ? "Fotoğrafı Değiştir" : "Fotoğraf Yükle"}
                          </p>
                          <p className="text-xs text-gray-500">
                            Sürükle & Bırak veya <span className="text-teal-600 font-semibold">tıkla</span>
                          </p>
                          <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF veya WEBP (Max 5MB)</p>
                        </div>
                      </div>
                      {/* Decorative elements */}
                      <div className="absolute top-4 right-4 w-2 h-2 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="absolute bottom-4 left-4 w-2 h-2 bg-teal-400 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-4 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setFormData({
                  full_name: profile.full_name,
                  phone: profile.phone || "",
                  bio: profile.bio || "",
                  expertise_tags: profile.expertise_tags?.join(", ") || "",
                  social_links: {
                    linkedin: profile.social_links?.linkedin || "",
                    twitter: profile.social_links?.twitter || "",
                    instagram: profile.social_links?.instagram || "",
                    website: profile.social_links?.website || "",
                  },
                  avatar_url: profile.avatar_url || "",
                });
              }}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-bold"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isUpdating}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {isUpdating ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-8">
          {/* Basic Information Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Temel Bilgiler</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Ad Soyad</div>
                <div className="text-lg font-bold text-gray-900">{profile.full_name}</div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">E-posta</div>
                <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  {profile.email}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Telefon</div>
                <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  {profile.phone ? (
                    <>
                      <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      {profile.phone}
                    </>
                  ) : (
                    <span className="text-gray-400">Belirtilmemiş</span>
                  )}
                </div>
              </div>
              <div className="bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-xl p-5 border border-gray-200">
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Kayıt Tarihi</div>
                <div className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {new Date(profile.created_at).toLocaleDateString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Bio & Expertise Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Biyografi & Uzmanlık</h3>
            </div>
            <div className="space-y-6">
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Biyografi</div>
                {profile.bio ? (
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100/30 rounded-xl p-6 border border-blue-200">
                    <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{profile.bio}</p>
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                    <p className="text-gray-400 italic">Henüz biyografi eklenmemiş</p>
                  </div>
                )}
              </div>
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Uzmanlık Alanları</div>
                {profile.expertise_tags && profile.expertise_tags.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {profile.expertise_tags.map((tag, idx) => (
                      <span
                        key={idx}
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-full text-sm font-bold shadow-md hover:shadow-lg transition-shadow"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {tag}
                      </span>
                    ))}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                    <p className="text-gray-400 italic">Henüz uzmanlık alanı eklenmemiş</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Social Media & Avatar Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Sosyal Medya & Görsel</h3>
            </div>
            <div className="space-y-6">
              {profile.avatar_url && (
                <div>
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Profil Fotoğrafı</div>
                  <img
                    src={getAvatarUrl(profile.avatar_url)}
                    alt={profile.full_name}
                    className="w-32 h-32 rounded-2xl object-cover border-4 border-teal-200 shadow-xl"
                  />
                </div>
              )}
              <div>
                <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">Sosyal Medya Linkleri</div>
                {profile.social_links && (profile.social_links.linkedin || profile.social_links.twitter || profile.social_links.instagram || profile.social_links.website) ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {profile.social_links.linkedin && (
                      <a
                        href={profile.social_links.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-xl p-4 border-2 border-blue-200 hover:border-blue-400 hover:shadow-lg transition-all flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-lg bg-blue-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors">LinkedIn</div>
                          <div className="text-xs text-gray-600 truncate">{profile.social_links.linkedin}</div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                    {profile.social_links.twitter && (
                      <a
                        href={profile.social_links.twitter}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-gradient-to-br from-sky-50 to-sky-100/50 rounded-xl p-4 border-2 border-sky-200 hover:border-sky-400 hover:shadow-lg transition-all flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-lg bg-sky-400 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 group-hover:text-sky-600 transition-colors">Twitter</div>
                          <div className="text-xs text-gray-600 truncate">{profile.social_links.twitter}</div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                    {profile.social_links.instagram && (
                      <a
                        href={profile.social_links.instagram}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-gradient-to-br from-pink-50 to-pink-100/50 rounded-xl p-4 border-2 border-pink-200 hover:border-pink-400 hover:shadow-lg transition-all flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 group-hover:text-pink-600 transition-colors">Instagram</div>
                          <div className="text-xs text-gray-600 truncate">{profile.social_links.instagram}</div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-pink-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                    {profile.social_links.website && (
                      <a
                        href={profile.social_links.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group bg-gradient-to-br from-teal-50 to-teal-100/50 rounded-xl p-4 border-2 border-teal-200 hover:border-teal-400 hover:shadow-lg transition-all flex items-center gap-3"
                      >
                        <div className="w-12 h-12 rounded-lg bg-teal-500 flex items-center justify-center">
                          <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                          </svg>
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-900 group-hover:text-teal-600 transition-colors">Website</div>
                          <div className="text-xs text-gray-600 truncate">{profile.social_links.website}</div>
                        </div>
                        <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="bg-gray-50 rounded-xl p-6 border border-gray-200 text-center">
                    <p className="text-gray-400 italic">Henüz sosyal medya linki eklenmemiş</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Bank Accounts Tab Component (for teacher - can only create, not approve/reject)
function BankAccountsTab({
  bankAccounts,
  isLoading,
  onCreate,
  onUpdate,
  onDelete,
  onSetDefault,
  isCreating,
  isUpdating,
  isDeleting,
  isSettingDefault,
}: {
  bankAccounts: BankAccount[];
  isLoading: boolean;
  onCreate: (accountData: BankAccountCreate) => void;
  onUpdate: (accountId: string, accountData: BankAccountUpdate) => void;
  onDelete: (accountId: string) => void;
  onSetDefault: (accountId: string) => void;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isSettingDefault: boolean;
}) {
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAccountId, setEditingAccountId] = useState<string | null>(null);
  const [newAccount, setNewAccount] = useState({
    bank_name: "",
    iban: "",
    account_holder_name: "",
  });
  const [editAccount, setEditAccount] = useState({
    bank_name: "",
    iban: "",
    account_holder_name: "",
  });

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // IBAN'dan boşlukları kaldır
    const cleanIban = newAccount.iban.replace(/\s/g, "").toUpperCase();
    onCreate({ ...newAccount, iban: cleanIban });
    setNewAccount({ bank_name: "", iban: "", account_holder_name: "" });
    setShowAddForm(false);
  };

  const beginEdit = (account: BankAccount) => {
    setEditingAccountId(account.id);
    setEditAccount({
      bank_name: account.bank_name,
      iban: account.iban || "",
      account_holder_name: account.account_holder_name,
    });
  };

  const handleUpdateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAccountId) return;
    const cleanIban = editAccount.iban.replace(/\s/g, "").toUpperCase();
    onUpdate(editingAccountId, {
      bank_name: editAccount.bank_name,
      iban: cleanIban,
      account_holder_name: editAccount.account_holder_name,
    });
    setEditingAccountId(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Banka Hesapları</h2>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 text-sm font-medium"
        >
          {showAddForm ? "İptal" : "+ Yeni Hesap Ekle"}
        </button>
      </div>

      {showAddForm && (
        <div className="relative overflow-hidden bg-gradient-to-br from-teal-50 via-white to-teal-50/50 border-2 border-teal-200/60 rounded-2xl p-8 mb-6 shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-teal-200/20 rounded-full -mr-16 -mt-16 blur-2xl"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-teal-300/20 rounded-full -ml-12 -mb-12 blur-xl"></div>
          <div className="relative">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900">Yeni Banka Hesabı Ekle</h3>
            </div>
            <form onSubmit={handleAddAccount} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Banka Adı *
                  </label>
                  <input
                    type="text"
                    value={newAccount.bank_name}
                    onChange={(e) => setNewAccount({ ...newAccount, bank_name: e.target.value })}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
                    placeholder="Örn: Ziraat Bankası"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                    <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                    IBAN *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={newAccount.iban}
                      onChange={(e) => {
                        // IBAN formatını otomatik düzenle (boşlukları ekle)
                        let value = e.target.value.toUpperCase().replace(/\s/g, ""); // Tüm boşlukları kaldır
                        if (value.startsWith("TR") && value.length > 2) {
                          // TR IBAN: TR + 2 rakam + 4 rakam + 4 rakam + 4 rakam + 4 rakam + 4 rakam + 2 rakam
                          value = value.slice(0, 2) + " " + value.slice(2, 4) + " " + value.slice(4, 8) + " " + value.slice(8, 12) + " " + value.slice(12, 16) + " " + value.slice(16, 20) + " " + value.slice(20, 24) + " " + value.slice(24, 26);
                          value = value.trim();
                        }
                        setNewAccount({ ...newAccount, iban: value });
                      }}
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-mono text-gray-900 shadow-sm hover:border-teal-300 text-base tracking-wider"
                      placeholder="TR00 0000 0000 0000 0000 0000 00"
                      maxLength={34}
                    />
                    {newAccount.iban && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                    )}
                  </div>
                  <div className="mt-2 flex items-start gap-2">
                    <svg className="w-4 h-4 text-teal-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-xs text-gray-600 leading-relaxed">
                      <span className="font-semibold text-gray-700">Otomatik formatlanır:</span> IBAN yazarken boşluklar otomatik eklenir ve geçerliliği kontrol edilir.
                    </p>
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                  Hesap Sahibi Adı *
                </label>
                <input
                  type="text"
                  value={newAccount.account_holder_name}
                  onChange={(e) => setNewAccount({ ...newAccount, account_holder_name: e.target.value })}
                  required
                  className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
                  placeholder="Ad Soyad"
                />
              </div>
              <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setNewAccount({ bank_name: "", iban: "", account_holder_name: "" });
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  disabled={isCreating}
                  className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 font-bold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isCreating ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Ekleniyor...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Hesap Ekle
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {bankAccounts.length === 0 && !showAddForm ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
          </svg>
          <p className="text-gray-600 text-lg">Banka hesabı bulunamadı</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {bankAccounts.map((account) => (
            <div
              key={account.id}
              className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-xl transition-all duration-300"
            >
              {/* Decorative gradient overlay on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-100/0 group-hover:from-teal-50/50 group-hover:to-teal-100/30 transition-all duration-300 pointer-events-none"></div>
              
              <div className="relative flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4 flex-wrap">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center shadow-lg">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{account.bank_name}</h3>
                      <p className="text-sm text-gray-500 mt-0.5">{account.account_holder_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 mb-4 flex-wrap">
                    <span
                      className={`px-3 py-1.5 rounded-full text-xs font-bold ${
                        account.status === "approved"
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : account.status === "rejected"
                          ? "bg-red-100 text-red-700 border border-red-200"
                          : "bg-amber-100 text-amber-700 border border-amber-200"
                      }`}
                    >
                      {account.status === "approved" ? "✓ Onaylandı" : account.status === "rejected" ? "✗ Reddedildi" : "⏳ Beklemede"}
                    </span>
                    {account.is_default && (
                      <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700 border border-teal-200">
                        ⭐ Varsayılan
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                      <svg className="w-5 h-5 text-gray-400 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <div className="flex-1 min-w-0">
                        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide block mb-0.5">IBAN</span>
                        <span className="text-sm font-mono text-gray-900 tracking-wider break-all">
                          {account.iban_masked || account.iban || "-"}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span>Oluşturulma: {new Date(account.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}</span>
                    </div>
                    
                    {account.review_note && (
                      <div className="mt-3 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <div className="flex items-start gap-2">
                          <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          <div className="flex-1">
                            <span className="text-xs font-bold text-amber-800 uppercase tracking-wide block mb-1">Admin Notu</span>
                            <p className="text-sm text-amber-900 leading-relaxed">{account.review_note}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap gap-2">
                      {!account.is_default && (
                        <button
                          type="button"
                          disabled={isSettingDefault}
                          onClick={() => onSetDefault(account.id)}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 disabled:opacity-50"
                        >
                          Varsayilan Yap
                        </button>
                      )}
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => beginEdit(account)}
                        className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 disabled:opacity-50"
                      >
                        Duzenle
                      </button>
                      {account.status !== "approved" && (
                        <button
                          type="button"
                          disabled={isDeleting}
                          onClick={() => {
                            if (confirm("Bu banka hesabini silmek istediginize emin misiniz?")) {
                              onDelete(account.id);
                            }
                          }}
                          className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                        >
                          Sil
                        </button>
                      )}
                    </div>

                    {editingAccountId === account.id && (
                      <form onSubmit={handleUpdateAccount} className="mt-4 p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-3">
                        <div className="text-sm font-semibold text-slate-700">Banka Hesabi Duzenle</div>
                        <input
                          type="text"
                          value={editAccount.bank_name}
                          onChange={(e) => setEditAccount({ ...editAccount, bank_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                          placeholder="Banka adi"
                          required
                        />
                        <input
                          type="text"
                          value={editAccount.iban}
                          onChange={(e) => setEditAccount({ ...editAccount, iban: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                          placeholder="IBAN"
                          required
                        />
                        <input
                          type="text"
                          value={editAccount.account_holder_name}
                          onChange={(e) => setEditAccount({ ...editAccount, account_holder_name: e.target.value })}
                          className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                          placeholder="Hesap sahibi"
                          required
                        />
                        <div className="flex gap-2">
                          <button
                            type="submit"
                            disabled={isUpdating}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
                          >
                            Kaydet
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingAccountId(null)}
                            className="px-4 py-2 text-xs font-semibold rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300"
                          >
                            Vazgec
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Earnings Tab Component (same as admin but for teacher)
function EarningsTab({
  summary,
  earnings,
  isLoading,
}: {
  summary?: TeacherEarningSummary;
  earnings: TeacherEarning[];
  isLoading: boolean;
}) {
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const queryClient = useQueryClient();

  // Filter earnings locally (or refetch with filters)
  const filteredEarnings = earnings.filter((earning) => {
    if (dateFrom && new Date(earning.created_at) < new Date(dateFrom)) return false;
    if (dateTo && new Date(earning.created_at) > new Date(dateTo)) return false;
    if (typeFilter !== "all" && earning.type !== typeFilter) return false;
    return true;
  });

  const handleExportCSV = () => {
    if (filteredEarnings.length === 0) {
      alert("Dışa aktarılacak veri bulunamadı.");
      return;
    }

    // CSV header
    const headers = ["Tarih", "Tip", "Açıklama", "Tutar (₺)"];
    const rows = filteredEarnings.map((earning) => [
      new Date(earning.created_at).toLocaleDateString("tr-TR"),
      earning.type === "earning" ? "Kazanç" : earning.type === "withdrawal" ? "Çekim" : "Düzeltme",
      earning.description || "-",
      Number(earning.amount).toFixed(2),
    ]);

    // Combine headers and rows
    const csvContent = [headers, ...rows].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n");

    // Create blob and download
    const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" }); // BOM for Excel UTF-8 support
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `kazanclar_${new Date().toISOString().split("T")[0]}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90 mb-1">Toplam Kazanç</div>
            <div className="text-2xl font-bold">{Number(summary.total_earnings).toFixed(2)} ₺</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90 mb-1">Toplam Çekim</div>
            <div className="text-2xl font-bold">{Number(summary.total_withdrawals).toFixed(2)} ₺</div>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90 mb-1">Çekilebilir Bakiye</div>
            <div className="text-2xl font-bold">{Number(summary.available_balance).toFixed(2)} ₺</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white shadow-lg">
            <div className="text-sm font-medium opacity-90 mb-1">Bekleyen Çekim</div>
            <div className="text-2xl font-bold">{Number(summary.pending_withdrawals).toFixed(2)} ₺</div>
          </div>
        </div>
      )}

      {/* Filters and Export */}
      <div className="bg-white/80 backdrop-blur-xl rounded-xl p-6 border border-white/50 shadow-lg">
        <div className="flex flex-col md:flex-row gap-4 items-end">
          <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Başlangıç Tarihi</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Bitiş Tarihi</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tip</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900"
              >
                <option value="all">Tümü</option>
                <option value="earning">Kazanç</option>
                <option value="withdrawal">Çekim</option>
                <option value="adjustment">Düzeltme</option>
                <option value="commission">Komisyon</option>
              </select>
            </div>
          </div>
          <button
            onClick={handleExportCSV}
            className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all font-semibold flex items-center gap-2 whitespace-nowrap"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            CSV İndir
          </button>
        </div>
      </div>

      {/* Earnings List */}
      <div className="border border-gray-200 rounded-xl overflow-hidden shadow-lg">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tarih</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Tip</th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-gray-700 uppercase">Açıklama</th>
              <th className="px-6 py-3 text-right text-xs font-semibold text-gray-700 uppercase">Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {filteredEarnings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-600">
                  {earnings.length === 0 ? "Kazanç hareketi bulunamadı" : "Filtre kriterlerine uygun hareket bulunamadı"}
                </td>
              </tr>
            ) : (
              filteredEarnings.map((earning) => (
                <tr key={earning.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(earning.created_at).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        earning.type === "earning"
                          ? "bg-emerald-100 text-emerald-700"
                          : earning.type === "withdrawal"
                          ? "bg-red-100 text-red-700"
                          : earning.type === "adjustment"
                          ? "bg-blue-100 text-blue-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {earning.type === "earning" ? "Kazanç" : earning.type === "withdrawal" ? "Çekim" : earning.type === "adjustment" ? "Düzeltme" : "Komisyon"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{earning.description || "-"}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                    earning.amount >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {earning.amount >= 0 ? "+" : ""}{Number(earning.amount).toFixed(2)} ₺
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Withdrawals Tab Component (for teacher - can create withdrawals)
function WithdrawalsTab({
  withdrawals,
  isLoading,
  bankAccounts,
  onCreate,
  onCancel,
  isCreating,
  isCancelling,
}: {
  withdrawals: WithdrawalRequest[];
  isLoading: boolean;
  bankAccounts: BankAccount[];
  onCreate: (withdrawalData: { bank_account_id: string; amount: number }) => void;
  onCancel: (withdrawalId: string) => void;
  isCreating: boolean;
  isCancelling: boolean;
}) {
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({
    bank_account_id: "",
    amount: "",
  });

  const handleCreateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalData.bank_account_id || !withdrawalData.amount) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }
    onCreate({
      bank_account_id: withdrawalData.bank_account_id,
      amount: parseFloat(withdrawalData.amount),
    });
    setWithdrawalData({ bank_account_id: "", amount: "" });
    setShowCreateForm(false);
  };

  const approvedAccounts = bankAccounts.filter((acc) => acc.status === "approved");

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Yükleniyor...</p>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-emerald-100 text-emerald-700";
      case "approved":
        return "bg-blue-100 text-blue-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-amber-100 text-amber-700";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "paid":
        return "Ödendi";
      case "approved":
        return "Onaylandı";
      case "rejected":
        return "Reddedildi";
      default:
        return "Beklemede";
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-900">Çekim Talepleri</h2>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          disabled={approvedAccounts.length === 0}
          className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {showCreateForm ? "İptal" : "+ Yeni Çekim Talebi"}
        </button>
      </div>

      {approvedAccounts.length === 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
          <p className="text-amber-800 text-sm">
            Çekim talebi oluşturmak için önce onaylanmış bir banka hesabı eklemeniz gerekiyor.
          </p>
        </div>
      )}

      {showCreateForm && (
        <div className="bg-gradient-to-br from-teal-50 to-teal-100/30 border-2 border-teal-200 rounded-xl p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Yeni Çekim Talebi</h3>
          <form onSubmit={handleCreateWithdrawal} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Banka Hesabı *</label>
              <select
                value={withdrawalData.bank_account_id}
                onChange={(e) => setWithdrawalData({ ...withdrawalData, bank_account_id: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              >
                <option value="">Seçiniz...</option>
                {approvedAccounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.bank_name} - {account.iban_masked || account.iban}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Tutar (₺) *</label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={withdrawalData.amount}
                onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0.00"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                disabled={isCreating}
                className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 font-medium disabled:opacity-50"
              >
                {isCreating ? "Oluşturuluyor..." : "Talep Oluştur"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setWithdrawalData({ bank_account_id: "", amount: "" });
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                İptal
              </button>
            </div>
          </form>
        </div>
      )}

      {withdrawals.length === 0 ? (
        <div className="text-center py-12">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-gray-600 text-lg">Çekim talebi bulunamadı</p>
        </div>
      ) : (
        withdrawals.map((withdrawal) => (
          <div key={withdrawal.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">{withdrawal.amount.toFixed(2)} ₺</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                    {getStatusLabel(withdrawal.status)}
                  </span>
                  {withdrawal.status === "pending" && (
                    <button
                      type="button"
                      disabled={isCancelling}
                      onClick={() => {
                        if (confirm("Bu cekim talebini iptal etmek istiyor musunuz?")) {
                          onCancel(withdrawal.id);
                        }
                      }}
                      className="ml-auto px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-200 hover:bg-red-100 disabled:opacity-50"
                    >
                      Iptal Et
                    </button>
                  )}
                </div>
                <div className="space-y-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Banka:</span> {withdrawal.bank_account_info?.bank_name || "-"}
                  </div>
                  <div>
                    <span className="font-medium">IBAN:</span> {withdrawal.bank_account_info?.iban_masked || withdrawal.bank_account_info?.iban || "-"}
                  </div>
                  <div>
                    <span className="font-medium">Talep Tarihi:</span> {new Date(withdrawal.requested_at).toLocaleDateString("tr-TR")}
                  </div>
                  {withdrawal.admin_note && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-700">Admin Notu:</span>
                      <p className="text-gray-600 mt-1">{withdrawal.admin_note}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}
