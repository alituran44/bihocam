"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Avatar from "@/components/Avatar";
import { usersApi, type UserListItem } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import { useRouter } from "next/navigation";

const ROLE_LABELS: Record<string, string> = {
  admin: "Admin",
  staff: "Personel",
  organization: "Kurum",
  teacher: "Eğitmen",
  student: "Öğrenci",
};

const ROLE_GRADIENTS: Record<string, string> = {
  admin: "from-red-500 via-rose-500 to-pink-500",
  staff: "from-blue-500 via-cyan-500 to-teal-500",
  organization: "from-purple-500 via-violet-500 to-fuchsia-500",
  teacher: "from-teal-500 via-emerald-500 to-green-500",
  student: "from-gray-400 via-slate-500 to-zinc-600",
};

const ROLE_BG_COLORS: Record<string, string> = {
  admin: "bg-red-50 border-red-200",
  staff: "bg-blue-50 border-blue-200",
  organization: "bg-purple-50 border-purple-200",
  teacher: "bg-teal-50 border-teal-200",
  student: "bg-gray-50 border-gray-200",
};

export default function AdminUsersPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const user = useAuthStore((state) => state.user);

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

  // Filtreler ve pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Kullanıcıları çek
  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-users", page, roleFilter, statusFilter, searchQuery],
    queryFn: () =>
      usersApi.list({
        skip: (page - 1) * limit,
        limit,
        role: roleFilter ? (roleFilter as "admin" | "staff" | "organization" | "teacher" | "student") : undefined,
        status: statusFilter ? (statusFilter as "active" | "inactive") : undefined,
        q: searchQuery || undefined,
        sort_by: "created_at",
        sort_order: "desc",
      }),
  });

  // Deactivate mutation
  const deactivateMutation = useMutation({
    mutationFn: (userId: string) => usersApi.deactivate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  // Activate mutation
  const activateMutation = useMutation({
    mutationFn: (userId: string) => usersApi.activate(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });

  const totalPages = data ? Math.ceil(data.total / limit) : 0;

  // Add CSS animation
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = `
      @keyframes fadeInUp {
        from {
          opacity: 0;
          transform: translateY(20px);
        }
        to {
          opacity: 1;
          transform: translateY(0);
        }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

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

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-red-600">Kullanıcılar yüklenirken bir hata oluştu.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-teal-50/30 to-orange-50/20">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Kullanıcı Yönetimi
              </h1>
              <p className="text-teal-100 text-lg">
                {data ? `${data.total} kullanıcı` : "Tüm kullanıcıları görüntüle ve yönet"}
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filters - Modern Glassmorphism */}
      <div className="mb-8">
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20">
          {/* Search Bar - Prominent */}
          <div className="mb-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                placeholder="İsim, email veya telefon ile ara..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setPage(1);
                }}
                className="w-full pl-12 pr-4 py-4 bg-gradient-to-r from-gray-50 to-gray-100 border-2 border-transparent rounded-xl focus:border-teal-400 focus:ring-4 focus:ring-teal-100 transition-all duration-300 text-gray-900 placeholder-gray-400 font-medium"
              />
            </div>
          </div>

          {/* Filter Chips */}
          <div className="flex flex-wrap gap-3">
            {/* Role Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700 mr-2">Rol:</span>
              {[
                { value: "", label: "Tümü", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
                { value: "admin", label: "Admin", color: "bg-red-100 text-red-700 hover:bg-red-200" },
                { value: "teacher", label: "Eğitmen", color: "bg-teal-100 text-teal-700 hover:bg-teal-200" },
                { value: "student", label: "Öğrenci", color: "bg-gray-100 text-gray-700 hover:bg-gray-200" },
                { value: "staff", label: "Personel", color: "bg-blue-100 text-blue-700 hover:bg-blue-200" },
              ].map((role) => (
                <button
                  key={role.value}
                  onClick={() => {
                    setRoleFilter(role.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    roleFilter === role.value
                      ? `${role.color} ring-2 ring-offset-2 ring-teal-400 shadow-md`
                      : `${role.color}`
                  }`}
                >
                  {role.label}
                </button>
              ))}
            </div>

            {/* Status Filters */}
            <div className="flex items-center gap-2 flex-wrap ml-auto">
              <span className="text-sm font-semibold text-gray-700 mr-2">Durum:</span>
              {[
                { value: "", label: "Tümü", color: "bg-gray-100 text-gray-700" },
                { value: "active", label: "Aktif", color: "bg-green-100 text-green-700 hover:bg-green-200" },
                { value: "inactive", label: "Pasif", color: "bg-red-100 text-red-700 hover:bg-red-200" },
              ].map((status) => (
                <button
                  key={status.value}
                  onClick={() => {
                    setStatusFilter(status.value);
                    setPage(1);
                  }}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 transform hover:scale-105 active:scale-95 ${
                    statusFilter === status.value
                      ? `${status.color} ring-2 ring-offset-2 ring-teal-400 shadow-md`
                      : `${status.color}`
                  }`}
                >
                  {status.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-end mb-4">
        <div className="bg-white/80 backdrop-blur-xl rounded-xl p-1 shadow-lg border border-white/20 flex gap-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              viewMode === "grid"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
              <span>Grid</span>
            </div>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
              viewMode === "list"
                ? "bg-gradient-to-r from-teal-500 to-emerald-500 text-white shadow-md"
                : "text-gray-600 hover:text-teal-600 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
              <span>Liste</span>
            </div>
          </button>
        </div>
      </div>

      {/* User Cards Grid or List */}
      {data && data.items.length > 0 ? (
        <>
          {viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {data.items.map((userItem, index) => (
                <UserCard
                  key={userItem.id}
                  user={userItem}
                  index={index}
                  onDeactivate={() => deactivateMutation.mutate(userItem.id)}
                  onActivate={() => activateMutation.mutate(userItem.id)}
                  isDeactivating={deactivateMutation.isPending}
                  isActivating={activateMutation.isPending}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden mb-8">
              <div className="divide-y divide-gray-100">
                {data.items.map((userItem, index) => (
                  <UserListRow
                    key={userItem.id}
                    user={userItem}
                    index={index}
                    onDeactivate={() => deactivateMutation.mutate(userItem.id)}
                    onActivate={() => activateMutation.mutate(userItem.id)}
                    isDeactivating={deactivateMutation.isPending}
                    isActivating={activateMutation.isPending}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Pagination - Modern Design */}
          {totalPages > 1 && (
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-6 shadow-xl border border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="text-sm text-gray-700 font-medium">
                Toplam <span className="font-bold text-teal-600">{data.total}</span> kullanıcıdan{" "}
                <span className="font-bold">{(page - 1) * limit + 1}</span> -{" "}
                <span className="font-bold">{Math.min(page * limit, data.total)}</span> arası gösteriliyor
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transform hover:scale-105 active:scale-95"
                >
                  ← Önceki
                </button>
                <div className="px-4 py-2.5 text-sm font-bold text-teal-600 bg-teal-50 rounded-xl border-2 border-teal-200">
                  {page} / {totalPages}
                </div>
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page === totalPages}
                  className="px-5 py-2.5 text-sm font-semibold text-gray-700 bg-white border-2 border-gray-200 rounded-xl hover:border-teal-400 hover:bg-teal-50 transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:border-gray-200 disabled:hover:bg-white transform hover:scale-105 active:scale-95"
                >
                  Sonraki →
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="bg-white/80 backdrop-blur-xl rounded-2xl p-16 text-center shadow-xl border border-white/20">
          <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          </div>
          <p className="text-xl font-semibold text-gray-700 mb-2">Kullanıcı bulunamadı</p>
          <p className="text-gray-500 mb-6">Arama kriterlerinize uygun kullanıcı bulunamadı.</p>
          {(searchQuery || roleFilter || statusFilter) && (
            <button
              onClick={() => {
                setSearchQuery("");
                setRoleFilter("");
                setStatusFilter("");
                setPage(1);
              }}
              className="px-6 py-3 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
            >
              Filtreleri Temizle
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Modern User Card Component
function UserCard({
  user,
  index,
  onDeactivate,
  onActivate,
  isDeactivating,
  isActivating,
}: {
  user: UserListItem;
  index: number;
  onDeactivate: () => void;
  onActivate: () => void;
  isDeactivating: boolean;
  isActivating: boolean;
}) {
  const router = useRouter();
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const roleGradient = ROLE_GRADIENTS[user.role] || ROLE_GRADIENTS.student;
  const roleBgColor = ROLE_BG_COLORS[user.role] || ROLE_BG_COLORS.student;

  return (
    <div
      className="group relative bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg hover:shadow-2xl border-2 border-transparent hover:border-teal-300 transition-all duration-300 transform hover:-translate-y-1"
      style={{
        animation: `fadeInUp 0.5s ease-out ${index * 50}ms forwards`,
      }}
    >
      {/* Gradient Accent Bar */}
      <div className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${roleGradient} rounded-t-2xl`}></div>

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-4 flex-1">
          {/* Avatar with Gradient */}
          <div className="relative">
            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${roleGradient} flex items-center justify-center text-white font-bold text-lg shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
              {initials}
            </div>
            {user.is_active && (
              <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-white shadow-md"></div>
            )}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">
              {user.full_name}
            </h3>
            <p className="text-sm text-gray-500 truncate">{user.email}</p>
          </div>
        </div>
      </div>

      {/* Role Badge */}
      <div className="mb-4">
        <span className={`inline-flex items-center px-3 py-1.5 rounded-full text-xs font-bold ${roleBgColor} border`}>
          <span className={`w-2 h-2 rounded-full bg-gradient-to-r ${roleGradient} mr-2`}></span>
          {ROLE_LABELS[user.role] || user.role}
        </span>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">Kayıt Tarihi</div>
          <div className="text-sm font-semibold text-gray-900">{formatDate(user.created_at)}</div>
        </div>
        <div className="bg-gray-50 rounded-xl p-3">
          <div className="text-xs text-gray-500 mb-1">Durum</div>
          <div className="flex items-center gap-2">
            {user.is_active ? (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                Aktif
              </span>
            ) : (
              <span className="inline-flex items-center px-2 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                Pasif
              </span>
            )}
            {!user.is_verified && (
              <div className="relative group/warning ml-2">
                <span className="inline-flex items-center justify-center px-2 py-1 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-700 cursor-help hover:bg-yellow-200 transition-colors">
                  ⚠️
                </span>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 invisible group-hover/warning:opacity-100 group-hover/warning:visible transition-all duration-200 z-50 pointer-events-none">
                  Email doğrulanmamış
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-4 border-t border-gray-100">
        <Link
          href={`/dashboard/admin/users/${user.id}`}
          className="flex-1 px-4 py-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl font-semibold text-sm hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-105 active:scale-95 shadow-md hover:shadow-lg text-center"
        >
          Detay
        </Link>
        {user.is_active ? (
          <button
            onClick={onDeactivate}
            disabled={isDeactivating}
            className="px-4 py-2.5 bg-orange-50 text-orange-600 rounded-xl font-semibold text-sm hover:bg-orange-100 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 border-2 border-orange-200"
          >
            {isDeactivating ? "..." : "Deaktif"}
          </button>
        ) : (
          <button
            onClick={onActivate}
            disabled={isActivating}
            className="px-4 py-2.5 bg-green-50 text-green-600 rounded-xl font-semibold text-sm hover:bg-green-100 transition-all duration-200 transform hover:scale-105 active:scale-95 disabled:opacity-50 border-2 border-green-200"
          >
            {isActivating ? "..." : "Aktif"}
          </button>
        )}
      </div>

      {/* Hover Glow Effect */}
      <div className={`absolute inset-0 rounded-2xl bg-gradient-to-r ${roleGradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 pointer-events-none`}></div>
    </div>
  );
}

// Modern List Row Component
function UserListRow({
  user,
  index,
  onDeactivate,
  onActivate,
  isDeactivating,
  isActivating,
}: {
  user: UserListItem;
  index: number;
  onDeactivate: () => void;
  onActivate: () => void;
  isDeactivating: boolean;
  isActivating: boolean;
}) {
  const router = useRouter();
  const initials = user.full_name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("tr-TR", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const roleGradient = ROLE_GRADIENTS[user.role] || ROLE_GRADIENTS.student;
  const roleBgColor = ROLE_BG_COLORS[user.role] || ROLE_BG_COLORS.student;

  return (
    <div
      className="group relative bg-white hover:bg-gradient-to-r hover:from-teal-50/50 hover:to-emerald-50/30 transition-all duration-300 px-6 py-4"
      style={{
        animation: `fadeInUp 0.4s ease-out ${index * 30}ms forwards`,
      }}
    >
      <div className="flex items-center gap-6">
        {/* Avatar & Basic Info */}
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="relative flex-shrink-0">
            <Avatar
              src={(user as any).avatar_url}
              name={user.full_name}
              size="md"
              className={`transform group-hover:scale-110 transition-transform duration-300`}
            />
            {user.is_active && (
              <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
            )}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1">
              <h3 className="text-base font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                {user.full_name}
              </h3>
              <span className={`inline-flex items-center px-2 py-0.5 rounded-lg text-xs font-semibold ${roleBgColor} border flex-shrink-0`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-gradient-to-r ${roleGradient} mr-1.5`}></span>
                {ROLE_LABELS[user.role] || user.role}
              </span>
            </div>
            <p className="text-sm text-gray-600 truncate">{user.email}</p>
          </div>
        </div>

        {/* Registration Date */}
        <div className="hidden md:block w-32 flex-shrink-0">
          <div className="text-xs text-gray-500 mb-1">Kayıt Tarihi</div>
          <div className="text-sm font-semibold text-gray-900">{formatDate(user.created_at)}</div>
        </div>

        {/* Status */}
        <div className="hidden lg:block w-28 flex-shrink-0">
          <div className="flex items-center gap-2">
            {user.is_active ? (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-green-100 text-green-700">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 mr-1.5"></span>
                Aktif
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-100 text-red-700">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                Pasif
              </span>
            )}
            {!user.is_verified && (
              <div className="relative group/warning">
                <span className="inline-flex items-center justify-center w-6 h-6 rounded-lg text-xs font-semibold bg-yellow-100 text-yellow-700 cursor-help hover:bg-yellow-200 transition-colors">
                  ⚠️
                </span>
                {/* Tooltip */}
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-xl whitespace-nowrap opacity-0 invisible group-hover/warning:opacity-100 group-hover/warning:visible transition-all duration-200 z-50 pointer-events-none">
                  Email doğrulanmamış
                  <div className="absolute left-1/2 -translate-x-1/2 top-full w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions - Icon Buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {/* Detail Button */}
          <Link
            href={`/dashboard/admin/users/${user.id}`}
            className="p-2.5 bg-gradient-to-r from-teal-500 to-emerald-500 text-white rounded-xl hover:from-teal-600 hover:to-emerald-600 transition-all duration-200 transform hover:scale-110 active:scale-95 shadow-md hover:shadow-lg group/btn"
            title="Detayları Görüntüle"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </Link>

          {/* Deactivate/Activate Button */}
          {user.is_active ? (
            <button
              onClick={onDeactivate}
              disabled={isDeactivating}
              className="p-2.5 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-all duration-200 transform hover:scale-110 active:scale-95 disabled:opacity-50 border-2 border-orange-200 hover:border-orange-300 group/btn"
              title="Hesabı Deaktif Et"
            >
              {isDeactivating ? (
                <div className="w-5 h-5 border-2 border-orange-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              )}
            </button>
          ) : (
            <button
              onClick={onActivate}
              disabled={isActivating}
              className="p-2.5 bg-green-50 text-green-600 rounded-xl hover:bg-green-100 transition-all duration-200 transform hover:scale-110 active:scale-95 disabled:opacity-50 border-2 border-green-200 hover:border-green-300 group/btn"
              title="Hesabı Aktif Et"
            >
              {isActivating ? (
                <div className="w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <svg className="w-5 h-5 group-hover/btn:rotate-180 transition-transform duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
            </button>
          )}

          {/* More Actions Menu */}
          <MenuDropdown
            user={user}
            onDeactivate={onDeactivate}
            onActivate={onActivate}
            isDeactivating={isDeactivating}
            isActivating={isActivating}
          />
        </div>
      </div>

      {/* Hover Accent Line */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b ${roleGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
    </div>
  );
}

// Menu Dropdown Component with Click Handler
function MenuDropdown({
  user,
  onDeactivate,
  onActivate,
  isDeactivating,
  isActivating,
}: {
  user: UserListItem;
  onDeactivate: () => void;
  onActivate: () => void;
  isDeactivating: boolean;
  isActivating: boolean;
}) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.menu-dropdown-container')) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  return (
    <div className="relative menu-dropdown-container">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen(!isOpen);
        }}
        className={`p-2.5 bg-gray-50 text-gray-600 rounded-xl hover:bg-gray-100 transition-all duration-200 transform hover:scale-110 active:scale-95 border-2 ${
          isOpen ? 'border-teal-400 bg-teal-50' : 'border-gray-200 hover:border-gray-300'
        }`}
        title="Daha Fazla İşlem"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
        </svg>
      </button>
      
      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-2xl border-2 border-gray-100 z-[9999] animate-in fade-in slide-in-from-top-2 duration-200">
          <div className="py-2">
            <Link
              href={`/dashboard/admin/users/${user.id}`}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:text-teal-600 transition-all duration-200 group/item"
            >
              <svg className="w-4 h-4 group-hover/item:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
              Düzenle
            </Link>
            <button
              onClick={() => {
                router.push(`/dashboard/admin/users/${user.id}?tab=actions`);
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gradient-to-r hover:from-teal-50 hover:to-emerald-50 hover:text-teal-600 transition-all duration-200 group/item"
            >
              <svg className="w-4 h-4 group-hover/item:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
              </svg>
              Şifre Sıfırla
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={() => {
                user.is_active ? onDeactivate() : onActivate();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-rose-50 transition-all duration-200 group/item"
            >
              <svg className="w-4 h-4 group-hover/item:scale-110 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
              </svg>
              {user.is_active ? "Deaktif Et" : "Aktif Et"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
