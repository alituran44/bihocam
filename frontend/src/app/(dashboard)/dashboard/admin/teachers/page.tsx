"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import Avatar from "@/components/Avatar";
import { usersApi, type UserListItem } from "@/lib/api";

export default function AdminTeachersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [roleFilter, setRoleFilter] = useState<"teacher" | undefined>("teacher");
  const [statusFilter, setStatusFilter] = useState<"active" | "inactive" | undefined>(undefined);
  const [groupBy, setGroupBy] = useState<"status" | "verified" | "none">("status");

  const { data, isLoading, error } = useQuery({
    queryKey: ["admin-teachers", searchQuery, roleFilter, statusFilter],
    queryFn: () =>
      usersApi.list({
        role: roleFilter,
        status: statusFilter,
        q: searchQuery || undefined,
        limit: 100,
      }),
  });

  const teachers = data?.items || [];

  // Gruplama mantığı
  const groupedTeachers = useMemo(() => {
    if (groupBy === "none") {
      return { "Tüm Eğitmenler": teachers };
    }

    const groups: Record<string, UserListItem[]> = {};

    teachers.forEach((teacher) => {
      let groupKey = "";
      if (groupBy === "status") {
        groupKey = teacher.is_active ? "Aktif Eğitmenler" : "Pasif Eğitmenler";
      } else if (groupBy === "verified") {
        groupKey = teacher.is_verified ? "Doğrulanmış Eğitmenler" : "Doğrulanmamış Eğitmenler";
      }
      
      if (!groups[groupKey]) {
        groups[groupKey] = [];
      }
      groups[groupKey].push(teacher);
    });

    return groups;
  }, [teachers, groupBy]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-teal-800 bg-clip-text text-transparent">
            Eğitmen Yönetimi
          </h1>
          <p className="text-gray-600 mt-1">Eğitmen profillerini, kazançlarını ve çekim taleplerini yönetin</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold shadow-lg shadow-teal-500/30">
            {teachers.length} Eğitmen
          </div>
        </div>
      </div>

      {/* Filters & Grouping */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-2">Ara</label>
            <div className="relative">
              <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder="İsim veya e-posta ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Durum</label>
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value as "active" | "inactive" | undefined || undefined)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="">Tümü</option>
              <option value="active">Aktif</option>
              <option value="inactive">Pasif</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Grupla</label>
            <select
              value={groupBy}
              onChange={(e) => setGroupBy(e.target.value as typeof groupBy)}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
            >
              <option value="none">Gruplama Yok</option>
              <option value="status">Duruma Göre</option>
              <option value="verified">Doğrulama Durumuna Göre</option>
            </select>
          </div>
        </div>
        <div className="mt-4 flex gap-2">
          <button
            onClick={() => {
              setSearchQuery("");
              setStatusFilter(undefined);
              setGroupBy("status");
            }}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium text-sm"
          >
            Filtreleri Temizle
          </button>
        </div>
      </div>

      {/* Teachers List - Grouped */}
      {isLoading ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <div className="inline-block w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600 mt-4">Yükleniyor...</p>
        </div>
      ) : error ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
          <p className="text-red-700">Hata: Veriler yüklenirken bir sorun oluştu.</p>
        </div>
      ) : teachers.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 shadow-sm border border-gray-100 text-center">
          <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 text-lg">Eğitmen bulunamadı</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedTeachers).map(([groupName, groupTeachers]) => (
            <div key={groupName} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
              {/* Group Header */}
              <div className="bg-gradient-to-r from-teal-50 via-teal-100/50 to-transparent px-6 py-4 border-b border-teal-100">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-teal-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
                      <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900">{groupName}</h2>
                      <p className="text-sm text-gray-600">{groupTeachers.length} eğitmen</p>
                    </div>
                  </div>
                  <div className="px-4 py-2 bg-white/80 backdrop-blur-sm rounded-lg border border-teal-200">
                    <span className="text-sm font-semibold text-teal-700">{groupTeachers.length}</span>
                  </div>
                </div>
              </div>

              {/* Teachers Grid */}
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupTeachers.map((teacher) => (
                    <Link
                      key={teacher.id}
                      href={`/dashboard/admin/teachers/${teacher.id}`}
                      className="group relative bg-gradient-to-br from-white to-gray-50 rounded-xl p-5 border border-gray-200 hover:border-teal-300 hover:shadow-lg hover:shadow-teal-500/10 transition-all duration-300 overflow-hidden"
                    >
                      {/* Hover Effect Background */}
                      <div className="absolute inset-0 bg-gradient-to-br from-teal-500/0 to-teal-600/0 group-hover:from-teal-500/5 group-hover:to-teal-600/5 transition-all duration-300"></div>
                      
                      <div className="relative">
                        {/* Avatar & Status */}
                        <div className="flex items-start justify-between mb-4">
                          <div className="flex items-center gap-3">
                            <div className="relative">
                              <Avatar
                                src={(teacher as any).avatar_url}
                                name={teacher.full_name}
                                size="lg"
                                className="shadow-lg shadow-teal-500/30 group-hover:scale-110 transition-transform duration-300"
                              />
                              {teacher.is_active && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full border-2 border-white"></div>
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-bold text-gray-900 truncate group-hover:text-teal-600 transition-colors">
                                {teacher.full_name}
                              </h3>
                              <p className="text-sm text-gray-500 truncate">{teacher.email}</p>
                            </div>
                          </div>
                          <svg className="w-5 h-5 text-gray-400 group-hover:text-teal-600 group-hover:translate-x-1 transition-all duration-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                          </svg>
                        </div>

                        {/* Info Badges */}
                        <div className="flex flex-wrap gap-2 mb-4">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              teacher.is_active
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                            }`}
                          >
                            {teacher.is_active ? "Aktif" : "Pasif"}
                          </span>
                          {!teacher.is_verified && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700 flex items-center gap-1">
                              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                              </svg>
                              Doğrulanmamış
                            </span>
                          )}
                        </div>

                        {/* Details */}
                        <div className="space-y-2 text-sm text-gray-600">
                          {teacher.phone && (
                            <div className="flex items-center gap-2">
                              <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                              </svg>
                              <span className="truncate">{teacher.phone}</span>
                            </div>
                          )}
                          <div className="flex items-center gap-2">
                            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{new Date(teacher.created_at).toLocaleDateString("tr-TR", { year: "numeric", month: "short", day: "numeric" })}</span>
                          </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-4 pt-4 border-t border-gray-100">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">Detayları görüntüle</span>
                            <div className="px-3 py-1.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-lg text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                              Görüntüle →
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
