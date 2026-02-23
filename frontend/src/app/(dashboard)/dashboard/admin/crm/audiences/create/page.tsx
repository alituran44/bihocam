"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { siteSettingsApi, usersApi, type UserListItem } from "@/lib/api";

type RoleType = "student" | "teacher" | "organization" | "admin" | "staff";

function getErrorMessage(err: unknown, fallback: string): string {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof (err as { response?: { data?: { detail?: string } } }).response?.data?.detail === "string"
  ) {
    return (err as { response?: { data?: { detail?: string } } }).response!.data!.detail!;
  }
  return fallback;
}

export default function AdminCrmAudienceCreatePage() {
  const queryClient = useQueryClient();
  const [role, setRole] = useState<RoleType>("student");
  const [search, setSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [segmentName, setSegmentName] = useState("");
  const [segmentDescription, setSegmentDescription] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: userListData, isFetching: usersLoading } = useQuery({
    queryKey: ["crm-audience-create-users", role, search],
    queryFn: () =>
      usersApi.list({
        role,
        q: search || undefined,
        limit: 100,
      }),
  });

  const users: UserListItem[] = useMemo(() => userListData?.items || [], [userListData]);

  const previewMutation = useMutation({
    mutationFn: () => siteSettingsApi.previewCampaignRecipients({ user_ids: selectedUserIds, sample_limit: 8 }),
  });

  const createMutation = useMutation({
    mutationFn: () =>
      siteSettingsApi.createCustomCampaignSegment({
        name: segmentName,
        description: segmentDescription || undefined,
        user_ids: selectedUserIds,
      }),
    onSuccess: async (res) => {
      const latest = await siteSettingsApi.listCustomCampaignSegments();
      setMessage(`Kitle başarıyla oluşturuldu. (ID: ${res.id}, Toplam kitle: ${latest.length})`);
      setError(null);
      setSegmentName("");
      setSegmentDescription("");
      setSelectedUserIds([]);
      queryClient.invalidateQueries({ queryKey: ["crm-segments-list"] });
      queryClient.invalidateQueries({ queryKey: ["crm-campaign-custom-segments"] });
      queryClient.invalidateQueries({ queryKey: ["crm-custom-segments"] });
      queryClient.invalidateQueries({ queryKey: ["admin-email-custom-campaign-segments"] });
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "Kitle oluşturulamadı"));
      setMessage(null);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CRM Kitle Oluşturma</h1>
        <p className="text-sm text-gray-600">Kullanıcı seçip tekrar kullanılabilir kitle segmenti oluşturun.</p>
      </div>

      {message && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{message}</div>}
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Kullanıcı Seçimi</h2>
          <div className="flex gap-2">
            <select value={role} onChange={(e) => setRole(e.target.value as RoleType)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
              <option value="student">Öğrenci</option>
              <option value="teacher">Eğitmen</option>
              <option value="organization">Kurum</option>
              <option value="staff">Staff</option>
              <option value="admin">Admin</option>
            </select>
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="İsim/e-posta ara" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          </div>

          <div className="max-h-80 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 space-y-1">
            {usersLoading && <div className="text-xs text-gray-500">Kullanıcılar yükleniyor...</div>}
            {!usersLoading && users.length === 0 && <div className="text-xs text-gray-500">Kullanıcı bulunamadı.</div>}
            {users.map((u) => (
              <label key={u.id} className="flex items-center gap-2 text-xs rounded px-2 py-1 hover:bg-white cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedUserIds.includes(u.id)}
                  onChange={() =>
                    setSelectedUserIds((prev) =>
                      prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                    )
                  }
                />
                <span className="font-medium text-gray-800 truncate">{u.full_name}</span>
                <span className="text-gray-500 truncate">{u.email}</span>
              </label>
            ))}
          </div>
          <div className="text-xs text-gray-600">Seçilen kişi: {selectedUserIds.length}</div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Segment Bilgisi</h2>
          <input value={segmentName} onChange={(e) => setSegmentName(e.target.value)} placeholder="Segment adı" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
          <textarea value={segmentDescription} onChange={(e) => setSegmentDescription(e.target.value)} placeholder="Açıklama" rows={3} className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />

          <div className="flex gap-2">
            <button
              onClick={() => previewMutation.mutate()}
              disabled={selectedUserIds.length === 0 || previewMutation.isLoading}
              className="px-4 py-2 rounded-lg border border-teal-600 text-teal-700 bg-white text-sm font-semibold disabled:opacity-50"
            >
              {previewMutation.isLoading ? "Hesaplanıyor..." : "Alıcı Önizle"}
            </button>
            <button
              onClick={() => createMutation.mutate()}
              disabled={!segmentName || selectedUserIds.length === 0 || createMutation.isLoading}
              className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold disabled:opacity-50"
            >
              {createMutation.isLoading ? "Oluşturuluyor..." : "Kitleyi Oluştur"}
            </button>
          </div>

          {previewMutation.data && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
              <div className="text-sm font-semibold text-teal-900">Alıcı Önizleme</div>
              <div className="text-xs text-teal-800 mt-1">Toplam alıcı: {previewMutation.data.total_recipients}</div>
              <div className="mt-2 space-y-1">
                {previewMutation.data.sample_recipients.map((r) => (
                  <div key={r.id} className="text-xs text-gray-700">{r.full_name || "İsimsiz"} - {r.email}</div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
