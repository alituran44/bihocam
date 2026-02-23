"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  emailLogsApi,
  siteSettingsApi,
  usersApi,
  type EmailCampaignRecipientPreviewResponse,
  type EmailCampaignSegment,
  type EmailCustomCampaignSegment,
  type EmailCustomTemplate,
  type UserListItem,
} from "@/lib/api";

type CampaignMode = "base_segments" | "saved_segments" | "users";
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

export default function AdminCrmCampaignsPage() {
  const [campaignMode, setCampaignMode] = useState<CampaignMode>("base_segments");
  const [selectedSegmentKey, setSelectedSegmentKey] = useState("all_students");
  const [selectedCustomSegmentId, setSelectedCustomSegmentId] = useState("");
  const [userRoleFilter, setUserRoleFilter] = useState<RoleType>("student");
  const [userSearch, setUserSearch] = useState("");
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [campaignTemplateId, setCampaignTemplateId] = useState("");
  const [recipientPreview, setRecipientPreview] = useState<EmailCampaignRecipientPreviewResponse | null>(null);
  const [scheduleAtLocal, setScheduleAtLocal] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [contextValues, setContextValues] = useState<Record<string, string>>({});
  const [contextWarning, setContextWarning] = useState<string | null>(null);

  const { data: customTemplates } = useQuery({
    queryKey: ["crm-campaign-custom-templates"],
    queryFn: () => siteSettingsApi.listCustomTemplates(),
  });

  const { data: campaignSegments } = useQuery({
    queryKey: ["crm-campaign-segments"],
    queryFn: () => siteSettingsApi.listCampaignSegments(),
  });

  const { data: customSegments, refetch: refetchCustomSegments } = useQuery({
    queryKey: ["crm-campaign-custom-segments"],
    queryFn: () => siteSettingsApi.listCustomCampaignSegments(),
  });

  const { data: workerHealth, refetch: refetchWorkerHealth, isFetching: healthLoading } = useQuery({
    queryKey: ["crm-email-worker-health"],
    queryFn: () => emailLogsApi.workerHealth(),
    refetchInterval: 15000,
  });

  const { data: userListData, isFetching: usersLoading } = useQuery({
    queryKey: ["crm-campaign-users", userRoleFilter, userSearch],
    enabled: campaignMode === "users",
    queryFn: () =>
      usersApi.list({
        role: userRoleFilter,
        q: userSearch || undefined,
        limit: 100,
      }),
  });

  const userItems: UserListItem[] = useMemo(() => userListData?.items || [], [userListData]);
  const effectiveCampaignTemplateId = campaignTemplateId || customTemplates?.[0]?.id || "";
  const selectedTemplate: EmailCustomTemplate | undefined = useMemo(
    () => (customTemplates || []).find((tpl) => tpl.id === effectiveCampaignTemplateId),
    [customTemplates, effectiveCampaignTemplateId]
  );

  // Backend zaten her kullanıcı için bu alanları context'e otomatik ekliyor.
  // Bu yüzden UI'da göstermiyoruz; sadece gerçekten kampanya özelinde
  // doldurulması gereken ilave değişkenleri gösteriyoruz.
  const AUTO_CONTEXT_KEYS = new Set(["user_id", "full_name", "email", "role", "teacher_name"]);

  const templateVariables: string[] = useMemo(
    () =>
      (selectedTemplate?.variables || [])
        .filter(Boolean)
        .filter((key) => !AUTO_CONTEXT_KEYS.has(key)),
    [selectedTemplate]
  );

  const buildContextPayload = (): Record<string, unknown> | undefined => {
    if (!templateVariables.length) {
      if (Object.keys(contextValues).length > 0) {
        setContextWarning("Şablon için tanımlı değişken yok; girilen context değerleri kullanılmayacak.");
      } else {
        setContextWarning(null);
      }
      return undefined;
    }

    const payload: Record<string, unknown> = {};
    let anySet = false;
    templateVariables.forEach((key) => {
      const raw = contextValues[key];
      if (raw && raw.trim().length > 0) {
        anySet = true;
        // Basit tip dönüştürme: "true"/"false" → boolean, sayılar → number, diğerleri → string
        const trimmed = raw.trim();
        if (trimmed === "true") payload[key] = true;
        else if (trimmed === "false") payload[key] = false;
        else if (!Number.isNaN(Number(trimmed)) && trimmed !== "") payload[key] = Number(trimmed);
        else payload[key] = trimmed;
      }
    });

    setContextWarning(
      anySet ? null : "Bu şablon için context alanı boş; sadece şablondaki statik içerik gönderilecek."
    );

    return anySet ? payload : undefined;
  };

  const canSendCampaign =
    !!effectiveCampaignTemplateId &&
    ((campaignMode === "base_segments" && !!selectedSegmentKey) ||
      (campaignMode === "saved_segments" && !!selectedCustomSegmentId) ||
      (campaignMode === "users" && selectedUserIds.length > 0));

  const previewRecipientsMutation = useMutation({
    mutationFn: () =>
      siteSettingsApi.previewCampaignRecipients({
        segment_key: campaignMode === "base_segments" ? selectedSegmentKey : undefined,
        custom_segment_id: campaignMode === "saved_segments" ? selectedCustomSegmentId : undefined,
        user_ids: campaignMode === "users" ? selectedUserIds : undefined,
        sample_limit: 10,
      }),
    onSuccess: (res) => {
      setRecipientPreview(res);
      setError(null);
    },
    onError: (err: unknown) => {
      setRecipientPreview(null);
      setError(getErrorMessage(err, "Alıcı önizlemesi alınamadı"));
      setMessage(null);
    },
  });

  const sendCampaignMutation = useMutation({
    mutationFn: () =>
      siteSettingsApi.sendCampaign({
        template_id: effectiveCampaignTemplateId || undefined,
        segment_key: campaignMode === "base_segments" ? selectedSegmentKey : undefined,
        custom_segment_id: campaignMode === "saved_segments" ? selectedCustomSegmentId : undefined,
        user_ids: campaignMode === "users" ? selectedUserIds : undefined,
        context: buildContextPayload(),
        schedule_at: scheduleAtLocal ? new Date(scheduleAtLocal).toISOString() : undefined,
      }),
    onSuccess: (res) => {
      const scheduleText = res.scheduled_for ? ` Planlanan zaman: ${new Date(res.scheduled_for).toLocaleString("tr-TR")}.` : "";
      setMessage(`${res.message}.${scheduleText} (Email Logları ekranından takip edebilirsin)`);
      setError(null);
      refetchCustomSegments();
      refetchWorkerHealth();
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "Kampanya gönderimi başarısız"));
      setMessage(null);
    },
  });

  return (
    <div className="space-y-6">
      <div
        className="rounded-2xl border border-emerald-200 p-6"
        style={{
          background:
            "linear-gradient(120deg, rgba(16,185,129,.15) 0%, rgba(13,148,136,.14) 45%, rgba(249,115,22,.12) 100%)",
        }}
      >
        <h1 className="text-3xl font-bold text-gray-900">Kitleye Mail Gönder</h1>
        <p className="text-sm text-gray-700 mt-2">CRM kampanyanı başlat, hedef kitleyi önizle ve gönderimi kuyruktan güvenli şekilde yürüt.</p>
      </div>

      {message && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{message}</div>}
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h2 className="text-lg font-semibold text-gray-900">Kampanya Başlat</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <select
              value={effectiveCampaignTemplateId}
              onChange={(e) => setCampaignTemplateId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm"
            >
              <option value="">Gönderim için özel şablon seç</option>
              {(customTemplates || []).map((tpl: EmailCustomTemplate) => (
                <option key={tpl.id} value={tpl.id}>{tpl.name}</option>
              ))}
            </select>
            <div className="text-xs text-gray-500 flex items-center">Gönderim kanalı: Email Queue + Email Log</div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3">
            <div className="text-xs font-semibold text-gray-900 mb-2">Zamanlama</div>
            <div className="flex items-center gap-2">
              <input
                type="datetime-local"
                value={scheduleAtLocal}
                onChange={(e) => setScheduleAtLocal(e.target.value)}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm bg-white"
              />
              {scheduleAtLocal ? (
                <button
                  type="button"
                  onClick={() => setScheduleAtLocal("")}
                  className="px-3 py-2 rounded-lg text-xs font-semibold border border-gray-300 bg-white text-gray-700"
                >
                  Şimdi gönder
                </button>
              ) : (
                <div className="text-xs text-gray-500">Boş bırakılırsa anında kuyruklanır.</div>
              )}
            </div>
          </div>

          {!!templateVariables.length && (
            <div className="mt-2 rounded-xl border border-dashed border-amber-200 bg-amber-50/60 p-3 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-xs font-semibold text-amber-900">Kampanya Değişkenleri</div>
                  <div className="text-[11px] text-amber-800">
                    Bu alanlar isteğe bağlı. Girersen şablondaki <code className="px-1 bg-white rounded">{"{{ key }}"}</code> yerlerine oturur.
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() =>
                    setContextValues((prev) => ({
                      ...prev,
                      offer_title: prev.offer_title ?? "Yeni Sezon Kampanyası",
                      offer_deadline: prev.offer_deadline ?? "31 Mart 2026",
                      coupon_code: prev.coupon_code ?? "BIHOCAM20",
                      cta_url: prev.cta_url ?? "https://bihocam.com/kampanya",
                    }))
                  }
                  className="hidden md:inline-flex px-2.5 py-1.5 rounded-lg bg-white text-[11px] font-semibold text-amber-900 border border-amber-200 shadow-sm"
                >
                  Örnek değerleri doldur
                </button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {templateVariables.map((key) => (
                  <div key={key} className="space-y-1">
                    <label className="text-[11px] font-semibold text-gray-800 flex items-center justify-between">
                      <span>{key}</span>
                    </label>
                    <input
                      value={contextValues[key] ?? ""}
                      onChange={(e) =>
                        setContextValues((prev) => ({
                          ...prev,
                          [key]: e.target.value,
                        }))
                      }
                      placeholder={
                        key === "coupon_code"
                          ? "Örn: BIHOCAM20"
                          : key === "offer_deadline"
                          ? "Örn: 31 Mart 2026"
                          : key === "offer_title"
                          ? "Örn: Bahar Kampanyası"
                          : key === "cta_url"
                          ? "Örn: https://bihocam.com/kampanya"
                          : ""
                      }
                      className="w-full px-3 py-1.5 rounded-lg border border-amber-200 bg-white text-xs"
                    />
                  </div>
                ))}
              </div>
              {contextWarning && <div className="text-[11px] text-amber-900">{contextWarning}</div>}
            </div>
          )}

          <div className="inline-flex p-1 rounded-lg bg-gray-100">
            <button onClick={() => setCampaignMode("base_segments")} className={`px-3 py-1.5 text-xs rounded-md ${campaignMode === "base_segments" ? "bg-white shadow text-teal-700" : "text-gray-600"}`}>Temel Segment</button>
            <button onClick={() => setCampaignMode("saved_segments")} className={`px-3 py-1.5 text-xs rounded-md ${campaignMode === "saved_segments" ? "bg-white shadow text-teal-700" : "text-gray-600"}`}>Kayıtlı Segment</button>
            <button onClick={() => setCampaignMode("users")} className={`px-3 py-1.5 text-xs rounded-md ${campaignMode === "users" ? "bg-white shadow text-teal-700" : "text-gray-600"}`}>Seçili Kullanıcı</button>
          </div>

          {campaignMode === "base_segments" && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {(campaignSegments || []).map((segment: EmailCampaignSegment) => (
                <button
                  key={segment.key}
                  onClick={() => setSelectedSegmentKey(segment.key)}
                  className={`text-left rounded-xl border px-3 py-3 ${selectedSegmentKey === segment.key ? "border-teal-400 bg-teal-50" : "border-gray-200"}`}
                >
                  <div className="text-sm font-semibold text-gray-900">{segment.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{segment.description}</div>
                </button>
              ))}
            </div>
          )}

          {campaignMode === "saved_segments" && (
            <div className="space-y-2">
              {(customSegments || []).length === 0 && <div className="text-xs text-gray-500">Kayıtlı segment yok.</div>}
              {(customSegments || []).map((segment: EmailCustomCampaignSegment) => (
                <button
                  key={segment.id}
                  onClick={() => setSelectedCustomSegmentId(segment.id)}
                  className={`w-full text-left rounded-xl border px-3 py-3 ${selectedCustomSegmentId === segment.id ? "border-teal-400 bg-teal-50" : "border-gray-200"}`}
                >
                  <div className="text-sm font-semibold text-gray-900">{segment.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{segment.description || "Açıklama yok"}</div>
                  <div className="text-[11px] text-gray-500 mt-1">Kişi sayısı: {segment.user_ids.length}</div>
                </button>
              ))}
            </div>
          )}

          {campaignMode === "users" && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <select value={userRoleFilter} onChange={(e) => setUserRoleFilter(e.target.value as RoleType)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm">
                  <option value="student">Öğrenci</option>
                  <option value="teacher">Eğitmen</option>
                  <option value="organization">Kurum</option>
                  <option value="staff">Staff</option>
                  <option value="admin">Admin</option>
                </select>
                <input value={userSearch} onChange={(e) => setUserSearch(e.target.value)} placeholder="İsim/e-posta ara" className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm" />
              </div>
              <div className="max-h-56 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-2 space-y-1">
                {usersLoading && <div className="text-xs text-gray-500">Kullanıcılar yükleniyor...</div>}
                {!usersLoading && userItems.length === 0 && <div className="text-xs text-gray-500">Kullanıcı bulunamadı.</div>}
                {userItems.map((u) => (
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
          )}

          <div className="flex gap-2">
            <button
              onClick={() => previewRecipientsMutation.mutate()}
              disabled={!canSendCampaign || previewRecipientsMutation.isPending}
              className="px-4 py-2 rounded-lg border border-teal-600 text-teal-700 bg-white text-sm font-semibold disabled:opacity-50"
            >
              {previewRecipientsMutation.isPending ? "Hesaplanıyor..." : "Alıcı Önizle"}
            </button>
            <button
              onClick={() => sendCampaignMutation.mutate()}
              disabled={!canSendCampaign || sendCampaignMutation.isPending}
              className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold disabled:opacity-50"
            >
              {sendCampaignMutation.isPending ? "Kuyruğa alınıyor..." : "Kampanya Gönder"}
            </button>
          </div>

          {recipientPreview && (
            <div className="rounded-lg border border-teal-200 bg-teal-50 p-3">
              <div className="text-sm font-semibold text-teal-900">Alıcı Önizleme</div>
              <div className="text-xs text-teal-800 mt-1">Toplam alıcı: {recipientPreview.total_recipients}</div>
              {recipientPreview.role_breakdown && Object.keys(recipientPreview.role_breakdown).length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {Object.entries(recipientPreview.role_breakdown).map(([role, count]) => (
                    <div key={role} className="text-[11px] px-2 py-1 rounded-full bg-white border border-teal-200 text-teal-900">
                      {role}: {count}
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-2 space-y-1">
                {recipientPreview.sample_recipients.map((r) => (
                  <div key={r.id} className="text-xs text-gray-700">{r.full_name || "İsimsiz"} - {r.email}</div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 p-5 space-y-4">
          <h3 className="text-base font-semibold text-gray-900">Worker Durumu</h3>
          <div className={`rounded-xl border p-3 ${workerHealth?.ok ? "border-emerald-300 bg-emerald-50" : "border-red-300 bg-red-50"}`}>
            <div className="text-sm font-semibold">{workerHealth?.ok ? "Worker erişilebilir" : "Worker erişilemiyor"}</div>
            <div className="text-xs mt-1">Queue: {workerHealth?.queued ?? "-"}</div>
            <div className="text-xs">Delayed: {workerHealth?.delayed ?? "-"}</div>
          </div>
          <button onClick={() => refetchWorkerHealth()} className="text-xs text-teal-700" disabled={healthLoading}>
            {healthLoading ? "Yenileniyor..." : "Durumu yenile"}
          </button>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs text-gray-700 space-y-1">
            <div className="font-semibold text-gray-900">Nasıl çalışır?</div>
            <div>1. Gönderimler önce Email Log tablosuna yazılır (pending).</div>
            <div>2. Job Redis kuyruğuna düşer.</div>
            <div>3. Worker kuyruğu tüketip SMTP ile gönderir.</div>
            <div>4. Sonuç sent/failed/retrying olarak Email Logları bölümüne yansır.</div>
          </div>
        </div>
      </div>
    </div>
  );
}
