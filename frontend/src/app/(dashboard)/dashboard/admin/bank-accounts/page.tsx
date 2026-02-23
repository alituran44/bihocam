"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { bankAccountsApi, usersApi, type BankAccount, type UserListItem } from "@/lib/api";
import Avatar from "@/components/Avatar";

export default function AdminBankAccountsPage() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected" | undefined>(undefined);
  const [teacherFilter, setTeacherFilter] = useState<string | undefined>(undefined);
  const [selectedAccount, setSelectedAccount] = useState<string | null>(null);
  const [actionType, setActionType] = useState<"approve" | "reject" | null>(null);
  const [note, setNote] = useState("");

  // Fetch bank accounts
  const { data: bankAccounts, isLoading } = useQuery({
    queryKey: ["admin-bank-accounts", statusFilter, teacherFilter],
    queryFn: () => bankAccountsApi.listAll({ status: statusFilter, teacher_id: teacherFilter }),
  });

  // Fetch teachers for filter
  const { data: teachersData } = useQuery({
    queryKey: ["admin-teachers-filter"],
    queryFn: () => usersApi.list({ role: "teacher", limit: 100 }),
  });

  // Mutations
  const approveMutation = useMutation({
    mutationFn: ({ accountId, note }: { accountId: string; note?: string }) =>
      bankAccountsApi.approve(accountId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bank-accounts"] });
      setSelectedAccount(null);
      setActionType(null);
      setNote("");
      alert("Banka hesabı onaylandı.");
    },
  });

  const rejectMutation = useMutation({
    mutationFn: ({ accountId, note }: { accountId: string; note: string }) =>
      bankAccountsApi.reject(accountId, note),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-bank-accounts"] });
      setSelectedAccount(null);
      setActionType(null);
      setNote("");
      alert("Banka hesabı reddedildi.");
    },
  });

  const handleAction = () => {
    if (!selectedAccount) return;
    if (actionType === "approve") {
      approveMutation.mutate({ accountId: selectedAccount, note: note || undefined });
    } else if (actionType === "reject") {
      if (!note.trim()) {
        alert("Red sebebi zorunludur");
        return;
      }
      rejectMutation.mutate({ accountId: selectedAccount, note });
    }
  };

  const getStatusConfig = (status: string) => {
    switch (status) {
      case "approved":
        return {
          color: "from-emerald-500 to-emerald-600",
          bg: "bg-emerald-50",
          text: "text-emerald-700",
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
          icon: (
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          ),
          label: "Beklemede",
        };
    }
  };

  const accountsList = bankAccounts || [];
  const pendingCount = accountsList.filter((a) => a.status === "pending").length;
  const approvedCount = accountsList.filter((a) => a.status === "approved").length;
  const rejectedCount = accountsList.filter((a) => a.status === "rejected").length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-blue-50/20">
      {/* Header with gradient */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-teal-700 to-emerald-600 shadow-xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTM2IDM0YzAtMS4xLS45LTItMi0ycy0yIC45LTIgMiAuOSAyIDIgMiAyLS45IDItMnoiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-lg border border-white/30">
              <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Banka Hesabı Talepleri</h1>
              <p className="text-teal-100 text-lg">Tüm eğitmen banka hesabı taleplerini yönetin ve onaylayın</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 pb-12">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
              <div className="text-3xl font-bold text-gray-900 mb-1">{pendingCount}</div>
              <div className="text-sm text-gray-600">Talep</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-emerald-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">Onaylı</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{approvedCount}</div>
              <div className="text-sm text-gray-600">Hesap</div>
            </div>
          </div>

          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity"></div>
            <div className="relative bg-white/80 backdrop-blur-xl rounded-2xl p-6 border border-white/50 shadow-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-red-500 flex items-center justify-center shadow-lg">
                  <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
                <span className="text-xs font-semibold text-red-600 bg-red-50 px-3 py-1 rounded-full">Reddedilen</span>
              </div>
              <div className="text-3xl font-bold text-gray-900 mb-1">{rejectedCount}</div>
              <div className="text-sm text-gray-600">Hesap</div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/50 mb-8">
          <div className="flex items-center gap-3 mb-6">
            <svg className="w-5 h-5 text-teal-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-lg font-bold text-gray-900">Filtreler</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Durum</label>
              <select
                value={statusFilter || ""}
                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter || undefined)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
              >
                <option value="">Tüm Durumlar</option>
                <option value="pending">Beklemede</option>
                <option value="approved">Onaylandı</option>
                <option value="rejected">Reddedildi</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-3">Eğitmen</label>
              <select
                value={teacherFilter || ""}
                onChange={(e) => setTeacherFilter(e.target.value || undefined)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium text-gray-900 shadow-sm hover:border-teal-300"
              >
                <option value="">Tüm Eğitmenler</option>
                {teachersData?.items
                  ?.filter((t) => t.role === "teacher")
                  .map((teacher) => (
                    <option key={teacher.id} value={teacher.id}>
                      {teacher.full_name}
                    </option>
                  ))}
              </select>
            </div>
          </div>
        </div>

        {/* Bank Accounts List */}
        {isLoading ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-20 shadow-xl border border-white/50 text-center">
            <div className="inline-block w-12 h-12 border-4 border-teal-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-600 font-medium">Yükleniyor...</p>
          </div>
        ) : accountsList.length === 0 ? (
          <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-20 shadow-xl border border-white/50 text-center">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
              <svg className="w-10 h-10 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Banka hesabı talebi bulunamadı</h3>
            <p className="text-gray-600">Filtreleri değiştirerek tekrar deneyin</p>
          </div>
        ) : (
          <div className="space-y-4">
            {accountsList.map((account, idx) => {
              const statusConfig = getStatusConfig(account.status);
              return (
                <div
                  key={account.id}
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
                            <h3 className="text-xl font-bold text-gray-900">{account.bank_name}</h3>
                            <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${statusConfig.bg} ${statusConfig.text} border-2 border-current/20`}>
                              {statusConfig.label}
                            </span>
                            {account.is_default && (
                              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-teal-100 text-teal-700 border border-teal-200">
                                ⭐ Varsayılan
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <span className="flex items-center gap-2">
                              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                              {new Date(account.created_at).toLocaleDateString("tr-TR", {
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
                          <div className="font-semibold text-gray-900">{account.bank_name}</div>
                          <div className="text-sm text-gray-600 font-mono mt-1 break-all">
                            {account.iban || account.iban_masked || "-"}
                          </div>
                          <div className="text-sm text-gray-600 mt-1">
                            <span className="font-medium">Hesap Sahibi:</span> {account.account_holder_name}
                          </div>
                        </div>
                        <div className="bg-gray-50/50 rounded-xl p-4 border border-gray-100">
                          <div className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">Eğitmen</div>
                          {account.teacher_id ? (
                            <Link
                              href={`/dashboard/admin/teachers/${account.teacher_id}`}
                              className="font-semibold text-teal-600 hover:text-teal-700 transition-colors inline-flex items-center gap-2 group/link"
                            >
                              Eğitmen Detayı
                              <svg className="w-4 h-4 group-hover/link:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </Link>
                          ) : (
                            <span className="text-sm text-gray-500">Bilinmiyor</span>
                          )}
                        </div>
                      </div>

                      {account.review_note && (
                        <div className="mt-4 pl-18">
                          <div className="bg-blue-50/50 border-l-4 border-blue-500 rounded-r-xl p-4">
                            <div className="text-xs font-semibold text-blue-700 uppercase tracking-wide mb-2">Admin Notu</div>
                            <p className="text-sm text-gray-700">{account.review_note}</p>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col gap-2">
                      {account.status === "pending" && (
                        <>
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
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Modal */}
        {selectedAccount && actionType && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-300">
              <div className="flex items-center gap-4 mb-6">
                <div
                  className={`w-14 h-14 rounded-xl bg-gradient-to-br ${
                    actionType === "approve" ? "from-emerald-500 to-emerald-600" : "from-red-500 to-red-600"
                  } flex items-center justify-center shadow-lg text-white`}
                >
                  {actionType === "approve" ? (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : (
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <h3 className="text-2xl font-bold text-gray-900">
                  {actionType === "approve" ? "Banka Hesabını Onayla" : "Banka Hesabını Reddet"}
                </h3>
              </div>
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">
                  {actionType === "reject" ? "Red Sebebi (Zorunlu)" : "Not (Opsiyonel)"}
                </label>
                <textarea
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 transition-all font-medium resize-none"
                  placeholder={actionType === "reject" ? "Red sebebini detaylı olarak yazın..." : "Not ekleyin (opsiyonel)..."}
                />
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleAction}
                  disabled={approveMutation.isPending || rejectMutation.isPending}
                  className={`flex-1 px-6 py-3 rounded-xl text-white font-bold transition-all shadow-lg hover:shadow-xl disabled:opacity-50 ${
                    actionType === "approve"
                      ? "bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
                      : "bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700"
                  }`}
                >
                  {approveMutation.isPending || rejectMutation.isPending
                    ? "İşleniyor..."
                    : actionType === "approve"
                    ? "Onayla"
                    : "Reddet"}
                </button>
                <button
                  onClick={() => {
                    setSelectedAccount(null);
                    setActionType(null);
                    setNote("");
                  }}
                  className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-semibold"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
