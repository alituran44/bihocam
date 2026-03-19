"use client";

import { useMemo, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { siteSettingsApi, usersApi, type EmailCustomCampaignSegment, type UserListItem } from "@/lib/api";

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

export default function AdminCrmAudienceListPage() {
  const [selectedSegmentId, setSelectedSegmentId] = useState<string>("");
  const [editorName, setEditorName] = useState("");
  const [editorDescription, setEditorDescription] = useState("");
  const [editorUserIds, setEditorUserIds] = useState<string[]>([]);
  const [role, setRole] = useState<RoleType>("student");
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const segmentsQuery = useQuery({
    queryKey: ["crm-segments-list"],
    queryFn: () => siteSettingsApi.listCustomCampaignSegments(),
    refetchOnMount: "always",
    refetchOnWindowFocus: true,
  });
  const { refetch: refetchSegments } = segmentsQuery;

  const { data: userListData, isFetching: usersLoading } = useQuery({
    queryKey: ["crm-segments-users", role, search],
    queryFn: () => usersApi.list({ role, q: search || undefined, limit: 100 }),
  });

  const users: UserListItem[] = useMemo(() => userListData?.items || [], [userListData]);

  const segments: EmailCustomCampaignSegment[] = useMemo(
    () => (Array.isArray(segmentsQuery.data) ? segmentsQuery.data : []),
    [segmentsQuery.data]
  );

  const selectedSegment: EmailCustomCampaignSegment | undefined = useMemo(
    () => segments.find((s) => s.id === selectedSegmentId),
    [segments, selectedSegmentId]
  );

  const startEdit = (segment: EmailCustomCampaignSegment) => {
    setSelectedSegmentId(segment.id);
    setEditorName(segment.name);
    setEditorDescription(segment.description || "");
    setEditorUserIds([...segment.user_ids]);
  };

  const updateMutation = useMutation({
    mutationFn: () =>
      siteSettingsApi.updateCustomCampaignSegment(selectedSegmentId, {
        name: editorName,
        description: editorDescription,
        user_ids: editorUserIds,
      }),
    onSuccess: () => {
      setMessage("Kitle güncellendi.");
      setError(null);
      refetchSegments();
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "Kitle güncellenemedi"));
      setMessage(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => siteSettingsApi.deleteCustomCampaignSegment(id),
    onSuccess: () => {
      setMessage("Kitle silindi.");
      setError(null);
      setSelectedSegmentId("");
      setEditorName("");
      setEditorDescription("");
      setEditorUserIds([]);
      refetchSegments();
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "Kitle silinemedi"));
      setMessage(null);
    },
  });

  const previewMutation = useMutation({
    mutationFn: () => siteSettingsApi.previewCampaignRecipients({ custom_segment_id: selectedSegmentId, sample_limit: 10 }),
  });

  const exportCsvMutation = useMutation({
    mutationFn: (segmentId: string) => siteSettingsApi.exportAudienceCsv(segmentId),
    onSuccess: (csvText) => {
      if (!selectedSegment) return;
      const blob = new Blob([csvText], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `kitle-${selectedSegment.name.replace(/\s+/g, "-").toLowerCase()}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
      setMessage("CSV dışa aktarma tamamlandı.");
      setError(null);
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "CSV dışa aktarma başarısız"));
      setMessage(null);
    },
  });

  const importCsvMutation = useMutation({
    mutationFn: () => siteSettingsApi.importAudienceCsv(selectedSegmentId, csvFile as File, importMode),
    onSuccess: (res) => {
      setMessage(res.message);
      setError(null);
      refetchSegments();
      setCsvFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "CSV içe aktarma başarısız"));
      setMessage(null);
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CRM Kitle Görüntüleme</h1>
        <p className="text-sm text-gray-600">Kayıtlı kitleleri inceleyin, düzenleyin ve alıcı önizlemesini kontrol edin.</p>
      </div>

      {message && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{message}</div>}
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Kayıtlı Kitleler</h2>
            <button onClick={() => refetchSegments()} className="text-xs text-teal-700">Yenile</button>
          </div>
          <div className="text-xs text-gray-500">Toplam kitle: {segments.length}</div>
          {segmentsQuery.isError && (
            <div className="text-xs text-red-600">Kitle listesi alınamadı.</div>
          )}
          <div className="space-y-2">
            {(segments || []).length === 0 && <div className="text-xs text-gray-500">Henüz kayıtlı kitle yok.</div>}
            {(segments || []).map((segment) => (
              <div key={segment.id} className={`rounded-xl border p-3 ${selectedSegmentId === segment.id ? "border-teal-400 bg-teal-50" : "border-gray-200"}`}>
                <button onClick={() => startEdit(segment)} className="w-full text-left">
                  <div className="text-sm font-semibold text-gray-900">{segment.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{segment.description || "Açıklama yok"}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Kişi sayısı: {segment.user_ids.length}</div>
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-3">
          <h2 className="text-sm font-semibold text-gray-900">Kitle Düzenleme</h2>
          {!selectedSegment && <div className="text-xs text-gray-500">Düzenlemek için bir kitle seçin.</div>}
          {selectedSegment && (
            <>
              <input value={editorName} onChange={(e) => setEditorName(e.target.value)} placeholder="Kitle adı" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              <input value={editorDescription} onChange={(e) => setEditorDescription(e.target.value)} placeholder="Açıklama" className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />

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

              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 space-y-1">
                {usersLoading && <div className="text-xs text-gray-500">Kullanıcılar yükleniyor...</div>}
                {users.map((u) => (
                  <label key={u.id} className="flex items-center gap-2 text-xs rounded px-2 py-1 hover:bg-white cursor-pointer">
                    <input
                      type="checkbox"
                      checked={editorUserIds.includes(u.id)}
                      onChange={() =>
                        setEditorUserIds((prev) =>
                          prev.includes(u.id) ? prev.filter((id) => id !== u.id) : [...prev, u.id]
                        )
                      }
                    />
                    <span className="font-medium text-gray-800 truncate">{u.full_name}</span>
                    <span className="text-gray-500 truncate">{u.email}</span>
                  </label>
                ))}
              </div>

              <div className="flex gap-2">
                <button onClick={() => previewMutation.mutate()} disabled={!selectedSegmentId || previewMutation.isPending} className="px-4 py-2 rounded-lg border border-teal-600 text-teal-700 bg-white text-sm font-semibold disabled:opacity-50">
                  {previewMutation.isPending ? "Hesaplanıyor..." : "Alıcı Önizle"}
                </button>
                <button onClick={() => updateMutation.mutate()} disabled={!editorName || editorUserIds.length === 0 || updateMutation.isPending} className="px-4 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold disabled:opacity-50">
                  {updateMutation.isPending ? "Güncelleniyor..." : "Kaydet"}
                </button>
                <button onClick={() => deleteMutation.mutate(selectedSegmentId)} disabled={deleteMutation.isPending} className="px-4 py-2 rounded-lg bg-red-500 text-white text-sm font-semibold disabled:opacity-50">
                  Sil
                </button>
              </div>

              <div className="rounded-lg border border-gray-200 bg-gray-50 p-3 space-y-2">
                <div className="text-xs font-semibold text-gray-900">CSV Import / Export</div>
                <div className="flex flex-wrap items-center gap-2">
                  <button
                    onClick={() => exportCsvMutation.mutate(selectedSegmentId)}
                    disabled={exportCsvMutation.isPending}
                    className="px-3 py-2 rounded-lg border border-teal-600 text-teal-700 bg-white text-xs font-semibold disabled:opacity-50"
                  >
                    {exportCsvMutation.isPending ? "Hazırlanıyor..." : "CSV Dışa Aktar"}
                  </button>
                  <select
                    value={importMode}
                    onChange={(e) => setImportMode(e.target.value as "merge" | "replace")}
                    className="px-3 py-2 rounded-lg border border-gray-200 text-xs bg-white"
                  >
                    <option value="merge">Birleştir (merge)</option>
                    <option value="replace">Tamamen değiştir (replace)</option>
                  </select>
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  className="block w-full text-xs text-gray-700 file:mr-3 file:py-1.5 file:px-3 file:rounded-md file:border file:border-gray-300 file:bg-white file:text-xs"
                />
                <button
                  onClick={() => importCsvMutation.mutate()}
                  disabled={!csvFile || importCsvMutation.isPending}
                  className="px-3 py-2 rounded-lg bg-orange-500 text-white text-xs font-semibold disabled:opacity-50"
                >
                  {importCsvMutation.isPending ? "İçe aktarılıyor..." : "CSV İçe Aktar"}
                </button>
                <div className="text-[11px] text-gray-600">Kolonlar: <code>user_id</code> veya <code>email</code></div>
              </div>

              {previewMutation.data && (
                <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
                  <div className="text-sm font-semibold text-teal-900">Alıcı Önizleme</div>
                  <div className="text-xs text-teal-800 mt-1">Toplam alıcı: {previewMutation.data.total_recipients}</div>
                  {previewMutation.data.role_breakdown && Object.keys(previewMutation.data.role_breakdown).length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-2">
                      {Object.entries(previewMutation.data.role_breakdown).map(([roleKey, count]) => (
                        <div key={roleKey} className="text-[11px] px-2 py-1 rounded-full bg-white border border-teal-200 text-teal-900">
                          {roleKey}: {count}
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="mt-2 space-y-1">
                    {previewMutation.data.sample_recipients.map((r) => (
                      <div key={r.id} className="text-xs text-gray-700">{r.full_name || "İsimsiz"} - {r.email}</div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
