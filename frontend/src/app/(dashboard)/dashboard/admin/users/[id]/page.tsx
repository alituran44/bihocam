"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { usersApi, PasswordResetRequest, teacherEarningsApi, type TeacherEarningSummary } from "@/lib/api";
import { toast } from "sonner";
import { useAuthStore } from "@/lib/store";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  staff: "Personel",
  organization: "Kurum",
  teacher: "Eğitmen",
  student: "Öğrenci",
};

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);
  const userId = params.id as string;

  // Admin kontrolü
  if (user?.role !== "admin") {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Bu sayfaya erişim yetkiniz yok.</p>
        </div>
      </div>
    );
  }

  const [activeTab, setActiveTab] = useState<"general" | "contact" | "actions">("general");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showPasswordResetModal, setShowPasswordResetModal] = useState(false);
  const [passwordResetMode, setPasswordResetMode] = useState<"magic_link" | "temporary_password">("magic_link");
  const [temporaryPassword, setTemporaryPassword] = useState("");
  const [showBalanceModal, setShowBalanceModal] = useState(false);
  const [balanceAdjustment, setBalanceAdjustment] = useState({ amount: "", description: "" });

  // Form state
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    role: "",
    is_active: true,
    is_verified: false,
    phone: "",
  });

  // Kullanıcıyı çek
  const { data: userData, isLoading } = useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => usersApi.get(userId),
    enabled: !!userId,
  });

  // Bakiye özeti (sadece teacher için)
  const { data: balanceSummary, refetch: refetchBalance, isLoading: isLoadingBalance } = useQuery<TeacherEarningSummary>({
    queryKey: ["admin-user-balance", userId],
    queryFn: () => teacherEarningsApi.getTeacherEarningsSummary(userId),
    enabled: !!userId && !!userData && userData.role === "teacher",
  });

  // Bakiye düzeltme mutation
  const balanceAdjustmentMutation = useMutation({
    mutationFn: (adjustment: { amount: number; description: string }) =>
      teacherEarningsApi.adjustUserBalance(userId, adjustment),
    onSuccess: () => {
      toast.success("Bakiye başarıyla güncellendi!");
      setShowBalanceModal(false);
      setBalanceAdjustment({ amount: "", description: "" });
      refetchBalance();
      queryClient.invalidateQueries({ queryKey: ["admin-user-balance", userId] });
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      toast.error(detail || "Bakiye güncellenirken bir hata oluştu.");
    },
  });

  // Form'u user data ile doldur
  useEffect(() => {
    if (userData) {
      setFormData({
        full_name: userData.full_name || "",
        email: userData.email || "",
        role: userData.role || "",
        is_active: userData.is_active ?? true,
        is_verified: userData.is_verified ?? false,
        phone: (userData as any).phone || "",
      });
    }
  }, [userData]);

  // Güncelleme mutation
  const updateMutation = useMutation({
    mutationFn: (updateData: typeof formData) => usersApi.update(userId, updateData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      alert("Kullanıcı başarıyla güncellendi!");
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      alert(detail || "Kullanıcı güncellenirken bir hata oluştu.");
    },
  });

  // Deactivate/Activate mutations
  const deactivateMutation = useMutation({
    mutationFn: () => usersApi.deactivate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      alert("Kullanıcı deaktif edildi!");
    },
  });

  const activateMutation = useMutation({
    mutationFn: () => usersApi.activate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      alert("Kullanıcı aktif edildi!");
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: () => usersApi.delete(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
      router.push("/dashboard/admin/users");
      alert("Kullanıcı hesabı silindi (anonimleştirildi)!");
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      alert(detail || "Kullanıcı silinirken bir hata oluştu.");
    },
  });

  // Password reset mutation
  const passwordResetMutation = useMutation({
    mutationFn: (request: PasswordResetRequest) => usersApi.resetPassword(userId, request),
    onSuccess: (data) => {
      if (data.temporary_password) {
        // Geçici şifreyi göster (sadece bir kez)
        setTemporaryPassword(data.temporary_password);
      } else {
        alert(data.message);
        setShowPasswordResetModal(false);
      }
    },
    onError: (error: any) => {
      const detail = error?.response?.data?.detail;
      alert(detail || "Şifre sıfırlanırken bir hata oluştu.");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <span className="text-gray-600 font-medium">Yükleniyor...</span>
        </div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-gray-600">Kullanıcı bulunamadı.</p>
          <Link href="/dashboard/admin/users" className="text-teal-600 hover:text-teal-700 mt-4 inline-block">
            Kullanıcı listesine dön
          </Link>
        </div>
      </div>
    );
  }

  const initials = userData.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <Link href="/dashboard/admin/users" className="hover:text-teal-600">
          Kullanıcılar
        </Link>
        <span>/</span>
        <span className="text-gray-900 font-medium">{userData.full_name}</span>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-xl">
            {initials}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{userData.full_name}</h1>
            <p className="text-gray-600">{userData.email}</p>
          </div>
        </div>
        <Link
          href="/dashboard/admin/users"
          className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          ← Geri Dön
        </Link>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {[
            { id: "general", label: "Genel Bilgiler" },
            { id: "contact", label: "İletişim" },
            { id: "actions", label: "Hesap İşlemleri" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`pb-4 px-1 border-b-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? "border-teal-500 text-teal-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        {activeTab === "general" && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ad Soyad</label>
                <input
                  type="text"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rol</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  required
                >
                  <option value="student">Öğrenci</option>
                  <option value="teacher">Eğitmen</option>
                  <option value="admin">Admin</option>
                  <option value="staff">Personel</option>
                  <option value="organization">Kurum</option>
                </select>
                {formData.role === "admin" && (
                  <p className="mt-2 text-sm text-yellow-600">⚠️ Rol değişikliği güvenlik nedeniyle kısıtlanabilir.</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Aktif</span>
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={formData.is_verified}
                      onChange={(e) => setFormData({ ...formData, is_verified: e.target.checked })}
                      className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500"
                    />
                    <span className="text-sm text-gray-700">Email Doğrulandı</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 justify-end">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                type="submit"
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
              >
                {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </form>
        )}

        {activeTab === "contact" && (
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Telefon</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="0532 123 45 67"
              />
            </div>

            <div className="flex gap-3 justify-end">
              <button
                onClick={() => router.back()}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={handleSubmit}
                disabled={updateMutation.isPending}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
              >
                {updateMutation.isPending ? "Kaydediliyor..." : "Kaydet"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "actions" && (
          <div className="space-y-6">
            {/* Hesap Durumu */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Hesap Durumu</h3>
              <div className="flex items-center gap-4">
                {userData.is_active ? (
                  <>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">Aktif</span>
                    <button
                      onClick={() => deactivateMutation.mutate()}
                      disabled={deactivateMutation.isPending}
                      className="px-4 py-2 text-orange-600 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors font-medium disabled:opacity-50"
                    >
                      {deactivateMutation.isPending ? "Deaktif ediliyor..." : "Hesabı Deaktif Et"}
                    </button>
                  </>
                ) : (
                  <>
                    <span className="px-3 py-1 text-sm font-medium rounded-full bg-red-100 text-red-800">Pasif</span>
                    <button
                      onClick={() => activateMutation.mutate()}
                      disabled={activateMutation.isPending}
                      className="px-4 py-2 text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors font-medium disabled:opacity-50"
                    >
                      {activateMutation.isPending ? "Aktif ediliyor..." : "Hesabı Aktif Et"}
                    </button>
                  </>
                )}
              </div>
            </div>

            {/* Bakiye Yönetimi (Sadece Teacher için) */}
            {userData.role === "teacher" && (
              <div className="border-b border-gray-200 pb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Bakiye Yönetimi</h3>
                {isLoadingBalance ? (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-center py-4">
                      <div className="w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
                      <span className="ml-2 text-sm text-gray-600">Bakiye yükleniyor...</span>
                    </div>
                  </div>
                ) : balanceSummary ? (
                  <div className="mb-4 p-4 bg-gradient-to-br from-teal-50 to-emerald-50 rounded-xl border border-teal-200">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Toplam Kazanç</p>
                        <p className="text-lg font-bold text-gray-900">₺{Number(balanceSummary.total_earnings).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Toplam Çekim</p>
                        <p className="text-lg font-bold text-gray-900">₺{Number(balanceSummary.total_withdrawals).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Düzeltmeler</p>
                        <p className="text-lg font-bold text-gray-900">₺{Number(balanceSummary.total_adjustments).toFixed(2)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Kullanılabilir Bakiye</p>
                        <p className="text-lg font-bold text-teal-600">₺{Number(balanceSummary.available_balance).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="mb-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                    <p className="text-sm text-gray-600 text-center">Bakiye bilgisi yüklenemedi.</p>
                  </div>
                )}
                <button
                  onClick={() => setShowBalanceModal(true)}
                  className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-colors font-medium shadow-lg shadow-teal-500/30"
                >
                  Bakiye Düzelt
                </button>
                <p className="mt-2 text-sm text-gray-600">
                  Kullanıcının bakiyesine ekleme veya çıkarma yapabilirsiniz. Pozitif değer ekler, negatif değer çıkarır.
                </p>
              </div>
            )}

            {/* Şifre Reset */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Şifre İşlemleri</h3>
              <button
                onClick={() => setShowPasswordResetModal(true)}
                className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium"
              >
                Şifreyi Sıfırla
              </button>
            </div>

            {/* Hesap Silme */}
            <div>
              <h3 className="text-lg font-semibold text-red-600 mb-4">Tehlikeli İşlemler</h3>
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                Hesabı Sil (Anonimleştir)
              </button>
              <p className="mt-2 text-sm text-gray-600">
                Bu işlem geri alınamaz. Kullanıcının kişisel bilgileri anonimleştirilir ancak finansal ve kurs kayıtları korunur.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Hesabı Sil</h3>
            <p className="text-gray-600 mb-6">
              Bu işlem geri alınamaz. Kullanıcının email ve ismi anonimleştirilecek. Devam etmek istediğinize emin misiniz?
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  deleteMutation.mutate();
                  setShowDeleteModal(false);
                }}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Siliniyor..." : "Evet, Sil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Password Reset Modal */}
      {showPasswordResetModal && (
        <PasswordResetModal
          mode={passwordResetMode}
          onModeChange={setPasswordResetMode}
          onClose={() => {
            setShowPasswordResetModal(false);
            setTemporaryPassword("");
          }}
          onSubmit={(request) => passwordResetMutation.mutate(request)}
          isSubmitting={passwordResetMutation.isPending}
          temporaryPassword={temporaryPassword}
        />
      )}

      {/* Balance Adjustment Modal */}
      {showBalanceModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Bakiye Düzelt</h3>
            <p className="text-gray-600 mb-6">
              Kullanıcının bakiyesine ekleme veya çıkarma yapın. Pozitif değer ekler, negatif değer çıkarır.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tutar (₺) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold">₺</span>
                  <input
                    type="number"
                    step="0.01"
                    value={balanceAdjustment.amount}
                    onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, amount: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                    placeholder="100.00"
                    required
                  />
                </div>
                <p className="mt-1 text-xs text-gray-500">
                  Örnek: 100.00 (ekler), -50.00 (çıkarır)
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Açıklama <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={balanceAdjustment.description}
                  onChange={(e) => setBalanceAdjustment({ ...balanceAdjustment, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  rows={3}
                  placeholder="Örn: Reklam kampanyası için ek bakiye"
                  required
                />
              </div>
            </div>
            <div className="flex gap-3 justify-end mt-6">
              <button
                onClick={() => {
                  setShowBalanceModal(false);
                  setBalanceAdjustment({ amount: "", description: "" });
                }}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
              >
                İptal
              </button>
              <button
                onClick={() => {
                  const amount = parseFloat(balanceAdjustment.amount);
                  if (isNaN(amount) || amount === 0) {
                    toast.error("Geçerli bir tutar giriniz.");
                    return;
                  }
                  if (!balanceAdjustment.description.trim()) {
                    toast.error("Açıklama gereklidir.");
                    return;
                  }
                  balanceAdjustmentMutation.mutate({
                    amount,
                    description: balanceAdjustment.description,
                  });
                }}
                disabled={balanceAdjustmentMutation.isPending}
                className="px-4 py-2 bg-gradient-to-r from-teal-600 to-emerald-600 text-white rounded-lg hover:from-teal-700 hover:to-emerald-700 transition-colors font-medium disabled:opacity-50 shadow-lg shadow-teal-500/30"
              >
                {balanceAdjustmentMutation.isPending ? "İşleniyor..." : "Düzeltmeyi Uygula"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Password Reset Modal Component
function PasswordResetModal({
  mode,
  onModeChange,
  onClose,
  onSubmit,
  isSubmitting,
  temporaryPassword,
}: {
  mode: "magic_link" | "temporary_password";
  onModeChange: (mode: "magic_link" | "temporary_password") => void;
  onClose: () => void;
  onSubmit: (request: PasswordResetRequest) => void;
  isSubmitting: boolean;
  temporaryPassword: string;
}) {
  const [customPassword, setCustomPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      mode,
      temporary_password: mode === "temporary_password" && customPassword ? customPassword : undefined,
    });
  };

  // Geçici şifre gösteriliyorsa
  if (temporaryPassword) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
          <h3 className="text-xl font-bold text-gray-900 mb-2">Geçici Şifre Oluşturuldu</h3>
          <p className="text-gray-600 mb-4">Bu şifre sadece bir kez gösterilecektir. Lütfen kopyalayın:</p>
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <code className="text-lg font-mono text-gray-900">{temporaryPassword}</code>
          </div>
          <button
            onClick={() => {
              navigator.clipboard.writeText(temporaryPassword);
              alert("Şifre kopyalandı!");
            }}
            className="w-full px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium mb-2"
          >
            Kopyala
          </button>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
          >
            Kapat
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full mx-4">
        <h3 className="text-xl font-bold text-gray-900 mb-2">Şifreyi Sıfırla</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Mod</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="magic_link"
                  checked={mode === "magic_link"}
                  onChange={(e) => onModeChange(e.target.value as any)}
                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Magic Link (Email ile gönder)</span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  value="temporary_password"
                  checked={mode === "temporary_password"}
                  onChange={(e) => onModeChange(e.target.value as any)}
                  className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
                />
                <span className="text-sm text-gray-700">Geçici Şifre</span>
              </label>
            </div>
          </div>

          {mode === "temporary_password" && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Geçici Şifre (Boş bırakılırsa otomatik üretilir)
              </label>
              <input
                type="text"
                value={customPassword}
                onChange={(e) => setCustomPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="En az 8 karakter"
                minLength={8}
              />
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors font-medium"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors font-medium disabled:opacity-50"
            >
              {isSubmitting ? "İşleniyor..." : "Gönder"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
