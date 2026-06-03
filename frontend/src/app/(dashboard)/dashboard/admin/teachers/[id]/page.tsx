"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Avatar from "@/components/Avatar";
import {
  teacherProfileApi,
  bankAccountsApi,
  teacherEarningsApi,
  withdrawalsApi,
  type TeacherProfile,
  type TeacherProfileUpdate,
  type BankAccount,
  type BankAccountCreate,
  type TeacherEarning,
  type WithdrawalRequest,
  type TeacherEarningSummary,
  usersApi,
} from "@/lib/api";

type Tab = "profile" | "tax-info" | "bank-accounts" | "earnings" | "withdrawals";

export default function AdminTeacherDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const teacherId = params.id as string;
  const [activeTab, setActiveTab] = useState<Tab>("profile");

  // Fetch teacher profile
  const { data: profile, isLoading: profileLoading } = useQuery({
    queryKey: ["teacher-profile", teacherId],
    queryFn: () => teacherProfileApi.getTeacherProfile(teacherId),
  });

  // Fetch bank accounts
  const { data: bankAccounts, isLoading: bankAccountsLoading } = useQuery({
    queryKey: ["teacher-bank-accounts", teacherId],
    queryFn: () => bankAccountsApi.listAll({ teacher_id: teacherId }),
    enabled: activeTab === "bank-accounts",
  });

  // Fetch earnings summary (admin endpoint)
  const { data: earningsSummary } = useQuery({
    queryKey: ["teacher-earnings-summary-admin", teacherId],
    queryFn: () => teacherEarningsApi.getTeacherEarningsSummary(teacherId),
    enabled: activeTab === "earnings",
  });

  // Fetch earnings list (admin endpoint)
  const { data: earnings, isLoading: earningsLoading } = useQuery({
    queryKey: ["teacher-earnings-admin", teacherId],
    queryFn: () => teacherEarningsApi.listTeacherEarnings(teacherId, { limit: 50 }),
    enabled: activeTab === "earnings",
  });

  // Fetch withdrawals
  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["admin-withdrawals", teacherId],
    queryFn: () => withdrawalsApi.listAll({ teacher_id: teacherId }),
    enabled: activeTab === "withdrawals",
  });

  // Bank account approve/reject mutations
  const approveAccountMutation = useMutation({
    mutationFn: ({ accountId, note }: { accountId: string; note?: string }) =>
      bankAccountsApi.approve(accountId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-bank-accounts", teacherId] });
    },
  });

  const rejectAccountMutation = useMutation({
    mutationFn: ({ accountId, note }: { accountId: string; note: string }) =>
      bankAccountsApi.reject(accountId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-bank-accounts", teacherId] });
    },
  });

  // Withdrawal approve/reject/paid mutations
  const approveWithdrawalMutation = useMutation({
    mutationFn: ({ withdrawalId, note }: { withdrawalId: string; note?: string }) =>
      withdrawalsApi.approve(withdrawalId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals", teacherId] });
    },
  });

  const markPaidMutation = useMutation({
    mutationFn: (withdrawalId: string) => withdrawalsApi.markPaid(withdrawalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals", teacherId] });
    },
  });

  const rejectWithdrawalMutation = useMutation({
    mutationFn: ({ withdrawalId, note }: { withdrawalId: string; note: string }) =>
      withdrawalsApi.reject(withdrawalId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-withdrawals", teacherId] });
    },
  });

  // Profile update mutation
  const updateProfileMutation = useMutation({
    mutationFn: (profileData: TeacherProfileUpdate) => teacherProfileApi.updateTeacherProfile(teacherId, profileData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-profile", teacherId] });
      alert("Profil başarıyla güncellendi!");
    },
    onError: (error: any) => {
      alert("Profil güncellenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  const toggleVerificationMutation = useMutation({
    mutationFn: (isVerified: boolean) => usersApi.update(teacherId, { is_verified: isVerified }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-profile", teacherId] });
      alert("Kullanıcı onay durumu güncellendi.");
    },
    onError: (error: any) => {
      alert("Durum güncellenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  const toggleActiveMutation = useMutation({
    mutationFn: (isActive: boolean) => isActive ? usersApi.activate(teacherId) : usersApi.deactivate(teacherId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-profile", teacherId] });
      alert("Kullanıcı aktiflik durumu güncellendi.");
    },
    onError: (error: any) => {
      alert("Durum güncellenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  // Bank account create mutation
  const createBankAccountMutation = useMutation({
    mutationFn: (accountData: BankAccountCreate) => bankAccountsApi.createForTeacher(teacherId, accountData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teacher-bank-accounts", teacherId] });
      alert("Banka hesabı başarıyla eklendi ve onay bekliyor.");
    },
    onError: (error: any) => {
      alert("Banka hesabı eklenirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
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
        <p className="text-red-700">Eğitmen bulunamadı.</p>
        <Link href="/dashboard/admin/teachers" className="text-teal-600 hover:text-teal-700 mt-2 inline-block">
          ← Eğitmen listesine dön
        </Link>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "profile", label: "Profil", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
    { id: "tax-info", label: "Vergi & Kimlik", icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" },
    { id: "bank-accounts", label: "Banka Hesapları", icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" },
    { id: "earnings", label: "Kazançlar", icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
    { id: "withdrawals", label: "Çekim Talepleri", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
  ];

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/dashboard/admin/teachers" className="hover:text-teal-600 transition-colors">
          Eğitmen Yönetimi
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{profile.full_name}</span>
      </nav>

      <div className="bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl p-8 text-white shadow-lg relative overflow-hidden">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-3xl font-bold border-4 border-white/30 shrink-0">
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
            <button
              onClick={() => toggleActiveMutation.mutate(!profile.is_active)}
              disabled={toggleActiveMutation.isPending}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-50 ${profile.is_active ? "bg-emerald-500" : "bg-red-500"}`}
            >
              {toggleActiveMutation.isPending ? "Bekleyiniz..." : profile.is_active ? "Aktif (Pasife Al)" : "Pasif (Aktife Al)"}
            </button>
            {!profile.is_verified ? (
              <button
                onClick={() => toggleVerificationMutation.mutate(true)}
                disabled={toggleVerificationMutation.isPending}
                className="px-4 py-2 rounded-full text-sm font-medium bg-amber-500 hover:bg-amber-600 transition-colors disabled:opacity-50"
              >
                {toggleVerificationMutation.isPending ? "Onaylanıyor..." : "Hesabı Doğrula / Onayla"}
              </button>
            ) : (
              <span className="px-4 py-2 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-100 border border-emerald-500/30">
                Doğrulanmış Hesap
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
            />
          )}

          {/* Tax Info Tab */}
          {activeTab === "tax-info" && (
            <TaxInfoAdminTab profile={profile} />
          )}

          {/* Bank Accounts Tab */}
          {activeTab === "bank-accounts" && (
            <BankAccountsTab
              bankAccounts={bankAccounts || []}
              isLoading={bankAccountsLoading}
              onApprove={(accountId, note) => approveAccountMutation.mutate({ accountId, note })}
              onReject={(accountId, note) => rejectAccountMutation.mutate({ accountId, note })}
              onCreate={(accountData) => createBankAccountMutation.mutate(accountData)}
              isCreating={createBankAccountMutation.isPending}
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
              onApprove={(withdrawalId, note) => approveWithdrawalMutation.mutate({ withdrawalId, note })}
              onMarkPaid={(withdrawalId) => markPaidMutation.mutate(withdrawalId)}
              onReject={(withdrawalId, note) => rejectWithdrawalMutation.mutate({ withdrawalId, note })}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// Profile Tab Component
function ProfileTab({
  profile,
  onUpdate,
  isUpdating,
}: {
  profile: TeacherProfile;
  onUpdate: (data: TeacherProfileUpdate) => void;
  isUpdating: boolean;
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const updateData: TeacherProfileUpdate = {
      full_name: formData.full_name,
      phone: formData.phone || undefined,
      bio: formData.bio || undefined,
      expertise_tags: formData.expertise_tags
        ? formData.expertise_tags.split(",").map((t) => t.trim()).filter(Boolean)
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
    <div className="space-y-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Profil Bilgileri</h2>
        <button
          onClick={() => setIsEditing(!isEditing)}
          className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
        >
          {isEditing ? "İptal" : "Düzenle"}
        </button>
      </div>

      {isEditing ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad *</label>
              <input
                type="text"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Biyografi</label>
            <textarea
              value={formData.bio}
              onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık Alanları (virgülle ayırın)</label>
            <input
              type="text"
              value={formData.expertise_tags}
              onChange={(e) => setFormData({ ...formData, expertise_tags: e.target.value })}
              placeholder="Örn: Python, JavaScript, React"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">LinkedIn URL</label>
              <input
                type="url"
                value={formData.social_links.linkedin}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, linkedin: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Twitter URL</label>
              <input
                type="url"
                value={formData.social_links.twitter}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, twitter: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Instagram URL</label>
              <input
                type="url"
                value={formData.social_links.instagram}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, instagram: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website URL</label>
              <input
                type="url"
                value={formData.social_links.website}
                onChange={(e) => setFormData({ ...formData, social_links: { ...formData.social_links, website: e.target.value } })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Avatar URL</label>
            <input
              type="url"
              value={formData.avatar_url}
              onChange={(e) => setFormData({ ...formData, avatar_url: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            />
          </div>
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg hover:shadow-lg hover:shadow-teal-500/30 transition-all duration-200 font-medium disabled:opacity-50"
            >
              {isUpdating ? "Kaydediliyor..." : "Kaydet"}
            </button>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              İptal
            </button>
          </div>
        </form>
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profile.full_name}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">E-posta</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profile.email}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">{profile.phone || "-"}</div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Kayıt Tarihi</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900">
                {new Date(profile.created_at).toLocaleDateString("tr-TR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          </div>
          {profile.bio && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Biyografi</label>
              <div className="px-4 py-3 bg-gray-50 rounded-lg text-gray-900 whitespace-pre-wrap">{profile.bio}</div>
            </div>
          )}
          {profile.expertise_tags && profile.expertise_tags.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Uzmanlık Alanları</label>
              <div className="flex flex-wrap gap-2">
                {profile.expertise_tags.map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 bg-teal-100 text-teal-700 rounded-full text-sm font-medium">
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {profile.social_links && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sosyal Medya</label>
              <div className="grid grid-cols-2 gap-4">
                {profile.social_links.linkedin && (
                  <a href={profile.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
                    </svg>
                    LinkedIn
                  </a>
                )}
                {profile.social_links.twitter && (
                  <a href={profile.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23 3a10.9 10.9 0 01-3.14 1.53 4.48 4.48 0 00-7.86 3v1A10.66 10.66 0 013 4s-4 9 5 13a11.64 11.64 0 01-7 2c9 5 20 0 20-11.5a4.5 4.5 0 00-.08-.83A7.72 7.72 0 0023 3z" />
                    </svg>
                    Twitter
                  </a>
                )}
                {profile.social_links.instagram && (
                  <a href={profile.social_links.instagram} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                    </svg>
                    Instagram
                  </a>
                )}
                {profile.social_links.website && (
                  <a href={profile.social_links.website} target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:text-teal-700 flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                    </svg>
                    Website
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// Bank Accounts Tab Component
function BankAccountsTab({
  bankAccounts,
  isLoading,
  onApprove,
  onReject,
  onCreate,
  isCreating,
}: {
  bankAccounts: BankAccount[];
  isLoading: boolean;
  onApprove: (accountId: string, note?: string) => void;
  onReject: (accountId: string, note: string) => void;
  onCreate: (accountData: BankAccountCreate) => void;
  isCreating: boolean;
}) {
  // All hooks must be called before any conditional returns
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    bank_name: "",
    iban: "",
    account_holder_name: "",
  });

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Yükleniyor...</p>
      </div>
    );
  }

  if (bankAccounts.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
        <p className="text-gray-600 text-lg">Banka hesabı bulunamadı</p>
      </div>
    );
  }

  const handleAction = () => {
    if (!selectedAccount) return;
    if (actionType === "approve") {
      onApprove(selectedAccount, note || undefined);
    } else if (actionType === "reject") {
      if (!note.trim()) {
        alert("Red sebebi zorunludur");
        return;
      }
      onReject(selectedAccount, note);
    }
    setSelectedAccount(null);
    setActionType(null);
    setNote("");
  };

  const handleAddAccount = (e: React.FormEvent) => {
    e.preventDefault();
    // IBAN'dan boşlukları kaldır
    const cleanIban = newAccount.iban.replace(/\s/g, "").toUpperCase();
    onCreate({ ...newAccount, iban: cleanIban });
    setNewAccount({ bank_name: "", iban: "", account_holder_name: "" });
    setShowAddForm(false);
  };

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
                        // TR + 2 rakam + 4 rakam + 4 rakam + 4 rakam + 4 rakam + 4 rakam + 2 rakam
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

      <div className="grid grid-cols-1 gap-4">
        {bankAccounts.map((account) => (
          <div
            key={account.id}
            className="group relative overflow-hidden bg-white border-2 border-gray-200 rounded-2xl p-6 hover:border-teal-300 hover:shadow-xl transition-all duration-300"
          >
            {/* Decorative gradient overlay on hover */}
            <div className="absolute inset-0 bg-gradient-to-br from-teal-50/0 to-teal-100/0 group-hover:from-teal-50/50 group-hover:to-teal-100/30 transition-all duration-300 pointer-events-none"></div>
            
            <div className="relative flex items-start justify-between gap-4">
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
                        {account.iban || account.iban_masked || "-"}
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
                </div>
              </div>
              
              {account.status === "pending" && (
                <div className="flex flex-col gap-2 flex-shrink-0">
                  <button
                    onClick={() => {
                      setSelectedAccount(account.id);
                      setActionType("approve");
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-semibold text-sm whitespace-nowrap flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Onayla
                  </button>
                  <button
                    onClick={() => {
                      setSelectedAccount(account.id);
                      setActionType("reject");
                    }}
                    className="px-6 py-3 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl hover:shadow-lg hover:shadow-red-500/30 transition-all font-semibold text-sm whitespace-nowrap flex items-center gap-2"
                  >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    Reddet
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Action Modal */}
      {selectedAccount && actionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {actionType === "approve" ? "Hesabı Onayla" : "Hesabı Reddet"}
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === "reject" ? "Red Sebebi (Zorunlu)" : "Not (Opsiyonel)"}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={actionType === "reject" ? "Red sebebini yazın..." : "Not ekleyin (opsiyonel)..."}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAction}
                  className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                    actionType === "approve" ? "bg-emerald-500 hover:bg-emerald-600" : "bg-red-500 hover:bg-red-600"
                  }`}
                >
                  {actionType === "approve" ? "Onayla" : "Reddet"}
                </button>
                <button
                  onClick={() => {
                    setSelectedAccount(null);
                    setActionType(null);
                    setNote("");
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Earnings Tab Component
function EarningsTab({
  summary,
  earnings,
  isLoading,
}: {
  summary?: TeacherEarningSummary;
  earnings: TeacherEarning[];
  isLoading: boolean;
}) {
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
          <div className="bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl p-6 text-white">
            <div className="text-sm font-medium opacity-90 mb-1">Toplam Kazanç</div>
            <div className="text-2xl font-bold">{Number(summary.total_earnings).toFixed(2)} ₺</div>
          </div>
          <div className="bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl p-6 text-white">
            <div className="text-sm font-medium opacity-90 mb-1">Toplam Çekim</div>
            <div className="text-2xl font-bold">{Number(summary.total_withdrawals).toFixed(2)} ₺</div>
          </div>
          <div className="bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl p-6 text-white">
            <div className="text-sm font-medium opacity-90 mb-1">Çekilebilir Bakiye</div>
            <div className="text-2xl font-bold">{Number(summary.available_balance).toFixed(2)} ₺</div>
          </div>
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-6 text-white">
            <div className="text-sm font-medium opacity-90 mb-1">Bekleyen Çekim</div>
            <div className="text-2xl font-bold">{Number(summary.pending_withdrawals).toFixed(2)} ₺</div>
          </div>
        </div>
      )}

      {/* Earnings List */}
      <div className="border border-gray-200 rounded-xl overflow-hidden">
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
            {earnings.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-gray-600">
                  Kazanç hareketi bulunamadı
                </td>
              </tr>
            ) : (
              earnings.map((earning) => (
                <tr key={earning.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {new Date(earning.created_at).toLocaleDateString("tr-TR")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-medium ${
                        earning.type === "earning"
                          ? "bg-emerald-100 text-emerald-700"
                          : earning.type === "withdrawal"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {earning.type === "earning" ? "Kazanç" : earning.type === "withdrawal" ? "Çekim" : "Düzeltme"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{earning.description || "-"}</td>
                  <td className={`px-6 py-4 whitespace-nowrap text-right text-sm font-medium ${
                    earning.amount >= 0 ? "text-emerald-600" : "text-red-600"
                  }`}>
                    {earning.amount >= 0 ? "+" : ""}{earning.amount.toFixed(2)} ₺
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

// Withdrawals Tab Component
function WithdrawalsTab({
  withdrawals,
  isLoading,
  onApprove,
  onMarkPaid,
  onReject,
}: {
  withdrawals: WithdrawalRequest[];
  isLoading: boolean;
  onApprove: (withdrawalId: string, note?: string) => void;
  onMarkPaid: (withdrawalId: string) => void;
  onReject: (withdrawalId: string, note: string) => void;
}) {
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | "paid" | null>(null);
  const [note, setNote] = useState("");

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-gray-600 mt-4">Yükleniyor...</p>
      </div>
    );
  }

  if (withdrawals.length === 0) {
    return (
      <div className="text-center py-12">
        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-gray-600 text-lg">Çekim talebi bulunamadı</p>
      </div>
    );
  }

  const handleAction = () => {
    if (!selectedWithdrawal) return;
    if (actionType === "approve") {
      onApprove(selectedWithdrawal, note || undefined);
    } else if (actionType === "reject") {
      if (!note.trim()) {
        alert("Red sebebi zorunludur");
        return;
      }
      onReject(selectedWithdrawal, note);
    } else if (actionType === "paid") {
      onMarkPaid(selectedWithdrawal);
    }
    setSelectedWithdrawal(null);
    setActionType(null);
    setNote("");
  };

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
      {withdrawals.map((withdrawal) => (
        <div key={withdrawal.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-3">
                <h3 className="text-lg font-semibold text-gray-900">{withdrawal.amount.toFixed(2)} ₺</h3>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(withdrawal.status)}`}>
                  {getStatusLabel(withdrawal.status)}
                </span>
              </div>
              <div className="space-y-2 text-sm text-gray-600">
                <div>
                  <span className="font-medium">Banka:</span> {withdrawal.bank_account_info?.bank_name || "-"}
                </div>
                <div>
                  <span className="font-medium">IBAN:</span> {withdrawal.bank_account_info?.iban || withdrawal.bank_account_info?.iban_masked || "-"}
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
            <div className="flex gap-2 ml-4">
              {withdrawal.status === "pending" && (
                <>
                  <button
                    onClick={() => {
                      setSelectedWithdrawal(withdrawal.id);
                      setActionType("approve");
                    }}
                    className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-sm font-medium"
                  >
                    Onayla
                  </button>
                  <button
                    onClick={() => {
                      setSelectedWithdrawal(withdrawal.id);
                      setActionType("reject");
                    }}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-medium"
                  >
                    Reddet
                  </button>
                </>
              )}
              {withdrawal.status === "approved" && (
                <button
                  onClick={() => {
                    setSelectedWithdrawal(withdrawal.id);
                    setActionType("paid");
                  }}
                  className="px-4 py-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition-colors text-sm font-medium"
                >
                  Ödendi İşaretle
                </button>
              )}
            </div>
          </div>
        </div>
      ))}

      {/* Action Modal */}
      {selectedWithdrawal && actionType && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">
              {actionType === "approve" ? "Çekim Talebini Onayla" : actionType === "reject" ? "Çekim Talebini Reddet" : "Ödendi Olarak İşaretle"}
            </h3>
            {(actionType === "approve" || actionType === "reject") && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {actionType === "reject" ? "Red Sebebi (Zorunlu)" : "Not (Opsiyonel)"}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder={actionType === "reject" ? "Red sebebini yazın..." : "Not ekleyin (opsiyonel)..."}
                />
              </div>
            )}
            <div className="flex gap-3">
              <button
                onClick={handleAction}
                className={`flex-1 px-4 py-2 rounded-lg text-white font-medium transition-colors ${
                  actionType === "approve" || actionType === "paid"
                    ? "bg-emerald-500 hover:bg-emerald-600"
                    : "bg-red-500 hover:bg-red-600"
                }`}
              >
                {actionType === "approve" ? "Onayla" : actionType === "reject" ? "Reddet" : "Ödendi İşaretle"}
              </button>
              <button
                onClick={() => {
                  setSelectedWithdrawal(null);
                  setActionType(null);
                  setNote("");
                }}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                İptal
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Tax Info Tab Component for Admin (Read-Only)
function TaxInfoAdminTab({ profile }: { profile: TeacherProfile }) {
  const taxInfo = profile.tax_info || {
    company_type: "-",
    tc_kimlik: "-",
    address: "-",
    city: "-",
    district: "-",
    exemption_status: "Belge Yüklenmedi",
    document_barcode: "-",
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div className="bg-white rounded-2xl border border-gray-100 p-8 shadow-sm">
        <div className="flex items-center gap-3 mb-8 pb-6 border-b border-gray-100">
          <div className="w-10 h-10 rounded-xl bg-teal-50 flex items-center justify-center text-teal-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Vergi & Kimlik Bilgileri</h2>
        </div>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">ŞİRKET / ALT ÜYE TİPİ</label>
              <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold bg-gray-50 text-gray-800">
                {taxInfo.company_type || "-"}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">
                {taxInfo.company_type === "Kurumsal (Anonim, Limited vb.)" ? "VERGİ NUMARASI" : "T.C. KİMLİK NUMARASI"}
              </label>
              <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold bg-gray-50 text-gray-800">
                {taxInfo.tc_kimlik || "-"}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">VERGİ MUAFİYET DURUMU</label>
              <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold bg-gray-50 text-gray-800">
                {taxInfo.exemption_status || "-"}
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">YASAL YERLEŞİM ADRESİ</label>
            <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold bg-gray-50 text-gray-800 whitespace-pre-wrap min-h-[80px]">
              {taxInfo.address || "-"}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">ŞEHİR / İL</label>
              <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold bg-gray-50 text-gray-800">
                {taxInfo.city || "-"}
              </div>
            </div>
            <div>
              <label className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 block">İLÇE</label>
              <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold bg-gray-50 text-gray-800">
                {taxInfo.district || "-"}
              </div>
            </div>
          </div>

          <div className="mt-8 bg-gray-50 border border-gray-200 rounded-2xl p-6">
            <h4 className="text-sm font-black text-gray-900 mb-4">20B İSTİSNA BELGESİ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">BELGE BARKOD NUMARASI</label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold bg-white text-gray-800">
                  {taxInfo.document_barcode || "-"}
                </div>
              </div>
              <div>
                <label className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2 block">BELGE DOSYASI</label>
                <div className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm font-semibold bg-white text-gray-500 italic">
                  Görüntülenecek belge yok
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
