"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { withdrawalsApi, bankAccountsApi, teacherEarningsApi, type WithdrawalRequest, type BankAccount, type TeacherEarningSummary } from "@/lib/api";

export default function TeacherWithdrawalsPage() {
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [withdrawalData, setWithdrawalData] = useState({
    bank_account_id: "",
    amount: "",
  });

  // Fetch withdrawals
  const { data: withdrawals, isLoading: withdrawalsLoading } = useQuery({
    queryKey: ["my-withdrawals"],
    queryFn: () => withdrawalsApi.list(),
  });

  // Fetch bank accounts
  const { data: bankAccounts, isLoading: bankAccountsLoading } = useQuery({
    queryKey: ["my-bank-accounts"],
    queryFn: () => bankAccountsApi.list(),
  });

  // Fetch balance summary
  const { data: balanceSummary, isLoading: balanceLoading } = useQuery({
    queryKey: ["my-earnings-summary"],
    queryFn: () => teacherEarningsApi.getSummary(),
  });

  // Create withdrawal mutation
  const createWithdrawalMutation = useMutation({
    mutationFn: (requestData: { bank_account_id: string; amount: number }) => withdrawalsApi.create(requestData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["my-earnings-summary"] });
      setShowCreateForm(false);
      setWithdrawalData({ bank_account_id: "", amount: "" });
    },
    onError: (error: any) => {
      alert("Çekim talebi oluşturulurken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  // Cancel withdrawal mutation
  const cancelWithdrawalMutation = useMutation({
    mutationFn: (withdrawalId: string) => withdrawalsApi.cancel(withdrawalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-withdrawals"] });
      queryClient.invalidateQueries({ queryKey: ["my-earnings-summary"] });
      alert("Çekim talebi başarıyla iptal edildi.");
    },
    onError: (error: any) => {
      alert("Çekim talebi iptal edilirken bir hata oluştu: " + (error.message || "Bilinmeyen hata"));
    },
  });

  const handleCreateWithdrawal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!withdrawalData.bank_account_id || !withdrawalData.amount) {
      alert("Lütfen tüm alanları doldurun.");
      return;
    }
    const amount = parseFloat(withdrawalData.amount);
    if (amount <= 0) {
      alert("Tutar pozitif bir sayı olmalıdır.");
      return;
    }
    if (balanceSummary && amount > Number(balanceSummary.available_balance)) {
      alert("Çekilebilir bakiyeniz yetersiz.");
      return;
    }
    createWithdrawalMutation.mutate({
      bank_account_id: withdrawalData.bank_account_id,
      amount: amount,
    });
  };

  const approvedAccounts = (bankAccounts || []).filter((acc) => acc.status === "approved");
  const withdrawalsList = withdrawals || [];

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "paid":
        return {
          color: "from-emerald-500 to-emerald-600",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
          border: "border-emerald-200",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: "Ödendi",
        };
      case "approved":
        return {
          color: "from-blue-500 to-blue-600",
          bg: "bg-blue-50",
          text: "text-blue-700",
          border: "border-blue-200",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ),
          label: "Onaylandı",
        };
      case "rejected":
        return {
          color: "from-red-500 to-red-600",
          bg: "bg-red-50",
          text: "text-red-700",
          border: "border-red-200",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ),
          label: "Reddedildi",
        };
      default:
        return {
          color: "from-amber-500 to-amber-600",
          bg: "bg-amber-50",
          text: "text-amber-700",
          border: "border-amber-200",
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: "Beklemede",
        };
    }
  };

  if (withdrawalsLoading || bankAccountsLoading || balanceLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-gray-600 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/20">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
                <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Çekim Talepleri</h1>
                <p className="text-teal-100 text-lg">Çekim taleplerinizi oluşturun ve takip edin</p>
              </div>
            </div>
            <Link
              href="/dashboard/teacher/profile"
              className="px-6 py-3 bg-white/20 backdrop-blur-md text-white rounded-xl hover:bg-white/30 transition-all font-semibold border border-white/30 flex items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Profil & Finansal
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        {/* Balance Summary Cards */}
        {balanceSummary && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Çekilebilir</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{Number(balanceSummary.available_balance).toFixed(2)} ₺</div>
                <div className="text-sm text-gray-600">Bakiye</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-amber-500 to-amber-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1 rounded-full">Bekleyen</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{Number(balanceSummary.pending_withdrawals).toFixed(2)} ₺</div>
                <div className="text-sm text-gray-600">Çekim</div>
              </div>
            </div>

            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-teal-500 to-teal-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
              <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-400 to-teal-500 flex items-center justify-center shadow-lg">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <span className="text-xs font-semibold text-teal-600 bg-teal-50 px-3 py-1 rounded-full">Toplam</span>
                </div>
                <div className="text-3xl font-bold text-gray-900 mb-1">{Number(balanceSummary.total_earnings).toFixed(2)} ₺</div>
                <div className="text-sm text-gray-600">Kazanç</div>
              </div>
            </div>
          </div>
        )}

        {/* Create Withdrawal Form */}
        {approvedAccounts.length === 0 ? (
          <div className="bg-amber-50/80 backdrop-blur-xl border-2 border-amber-200 rounded-2xl p-6 mb-8 shadow-xl">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                <svg className="w-6 h-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-amber-900 mb-1">Onaylanmış Banka Hesabı Gerekli</h3>
                <p className="text-amber-800 text-sm">
                  Çekim talebi oluşturmak için önce onaylanmış bir banka hesabı eklemeniz gerekiyor.{" "}
                  <Link href="/dashboard/teacher/profile?tab=bank-accounts" className="underline font-semibold hover:text-amber-900">
                    Banka Hesapları
                  </Link>{" "}
                  sayfasından hesap ekleyebilirsiniz.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-8 shadow-xl border border-white/50 mb-8">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Yeni Çekim Talebi</h2>
                <p className="text-gray-600">Onaylanmış banka hesabınızdan çekim talebi oluşturun</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateForm(!showCreateForm);
                  if (showCreateForm) {
                    setWithdrawalData({ bank_account_id: "", amount: "" });
                  }
                }}
                className={`px-6 py-3 rounded-xl font-semibold transition-all shadow-lg hover:shadow-xl flex items-center gap-2 ${
                  showCreateForm
                    ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    : "bg-gradient-to-r from-teal-500 to-teal-600 text-white hover:from-teal-600 hover:to-teal-700"
                }`}
              >
                {showCreateForm ? (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    İptal
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Yeni Talep Oluştur
                  </>
                )}
              </button>
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateWithdrawal} className="space-y-6 animate-in slide-in-from-top-4 duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">Banka Hesabı *</label>
                    <select
                      value={withdrawalData.bank_account_id}
                      onChange={(e) => setWithdrawalData({ ...withdrawalData, bank_account_id: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
                    >
                      <option value="">Banka Hesabı Seçin</option>
                      {approvedAccounts.map((account) => (
                        <option key={account.id} value={account.id}>
                          {account.bank_name} - {account.iban_masked || account.iban} {account.is_default && "(Varsayılan)"}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-3">
                      Tutar (₺) *
                      {balanceSummary && (
                        <span className="text-xs font-normal text-gray-500 ml-2">
                          (Maks: {Number(balanceSummary.available_balance).toFixed(2)} ₺)
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      max={balanceSummary ? Number(balanceSummary.available_balance) : undefined}
                      value={withdrawalData.amount}
                      onChange={(e) => setWithdrawalData({ ...withdrawalData, amount: e.target.value })}
                      required
                      className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div className="flex gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="submit"
                    disabled={createWithdrawalMutation.isPending}
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl hover:shadow-lg hover:shadow-teal-500/30 transition-all font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {createWithdrawalMutation.isPending ? "Oluşturuluyor..." : "Talep Oluştur"}
                  </button>
                </div>
              </form>
            )}
          </div>
        )}

        {/* Withdrawals List */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Geçmiş Talepler</h2>
            <span className="text-sm text-gray-600 font-medium">{withdrawalsList.length} talep</span>
          </div>

          {withdrawalsList.length === 0 ? (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-20 shadow-xl border border-white/50 text-center">
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">Henüz çekim talebi yok</h3>
              <p className="text-gray-600">İlk çekim talebinizi oluşturmak için yukarıdaki formu kullanın</p>
            </div>
          ) : (
            withdrawalsList.map((withdrawal, idx) => {
              const statusConfig = getStatusConfig(withdrawal.status);
              return (
                <div
                  key={withdrawal.id}
                  className="group bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50 hover:shadow-2xl hover:scale-[1.01] transition-all duration-300"
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${statusConfig.color} flex items-center justify-center shadow-lg text-white`}>
                          {statusConfig.icon}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="text-2xl font-bold text-gray-900">{Number(withdrawal.amount).toFixed(2)} ₺</h3>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border-2 border-current/20`}>
                              {statusConfig.label}
                            </span>
                            {withdrawal.status === "pending" && (
                              <button
                                onClick={() => {
                                  if (confirm("Bu çekim talebini iptal etmek istediğinize emin misiniz?")) {
                                    cancelWithdrawalMutation.mutate(withdrawal.id);
                                  }
                                }}
                                disabled={cancelWithdrawalMutation.isPending}
                                className="ml-auto px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                              >
                                {cancelWithdrawalMutation.isPending ? (
                                  <>
                                    <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
                                    İptal Ediliyor...
                                  </>
                                ) : (
                                  <>
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                    İptal Et
                                  </>
                                )}
                              </button>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(withdrawal.requested_at).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pl-18">
                        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Banka Bilgileri</div>
                          <div className="font-semibold text-gray-900">{withdrawal.bank_account_info?.bank_name || "Bilinmiyor"}</div>
                          <div className="text-sm text-gray-600 font-mono mt-1">
                            {withdrawal.bank_account_info?.iban_masked || withdrawal.bank_account_info?.iban || "-"}
                          </div>
                        </div>
                        {withdrawal.processed_at && (
                          <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                            <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">İşlem Tarihi</div>
                            <div className="font-semibold text-gray-900">
                              {new Date(withdrawal.processed_at).toLocaleDateString("tr-TR", {
                                year: "numeric",
                                month: "long",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </div>
                          </div>
                        )}
                      </div>

                      {withdrawal.admin_note && (
                        <div className="mt-4 pl-18">
                          <div className={`${statusConfig.bg} border-l-4 ${statusConfig.border} rounded-r-xl p-4`}>
                            <div className={`text-xs font-semibold ${statusConfig.text} uppercase tracking-wide mb-2`}>Admin Notu</div>
                            <p className="text-sm text-gray-700">{withdrawal.admin_note}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
