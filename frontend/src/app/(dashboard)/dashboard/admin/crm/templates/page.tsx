"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import {
  siteSettingsApi,
  type EmailCustomTemplate,
  type EmailTemplateMeta,
} from "@/lib/api";

type SelectedTemplate =
  | { kind: "system"; name: string }
  | { kind: "custom"; id: string }
  | null;

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

function renderCustomTemplate(html: string, vars: Record<string, string>): string {
  let out = html;
  Object.entries(vars).forEach(([k, v]) => {
    out = out.replace(new RegExp(`{{\\s*${k}\\s*}}`, "g"), v);
  });
  return out;
}

export default function AdminCrmTemplatesPage() {
  const [selected, setSelected] = useState<SelectedTemplate>(null);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");
  const [testEmail, setTestEmail] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { data: systemTemplates, isLoading: systemLoading } = useQuery({
    queryKey: ["crm-system-templates"],
    queryFn: () => siteSettingsApi.listEmailTemplates(),
  });

  const { data: customTemplates, refetch: refetchCustomTemplates } = useQuery({
    queryKey: ["crm-custom-templates"],
    queryFn: () => siteSettingsApi.listCustomTemplates(),
  });

  const selectedSystemMeta: EmailTemplateMeta | undefined = useMemo(() => {
    if (!selected || selected.kind !== "system") return undefined;
    return systemTemplates?.find((t) => t.template_name === selected.name);
  }, [selected, systemTemplates]);

  const selectedCustomMeta: EmailCustomTemplate | undefined = useMemo(() => {
    if (!selected || selected.kind !== "custom") return undefined;
    return customTemplates?.find((t) => t.id === selected.id);
  }, [selected, customTemplates]);

  const { data: preview, isFetching: previewLoading, refetch: refetchPreview } = useQuery({
    queryKey: ["crm-system-template-preview", selectedSystemMeta?.template_name],
    enabled: !!selectedSystemMeta,
    queryFn: () =>
      siteSettingsApi.previewEmailTemplate({
        template_name: selectedSystemMeta!.template_name,
        subject: selectedSystemMeta!.default_subject,
        context: {
          user_name: "Demo Kullanıcı",
          teacher_name: "Demo Eğitmen",
          full_name: "Demo Kullanıcı",
          offer_title: "Yeni Sezon Kampanyası",
          offer_deadline: "15 Mart 2026",
          coupon_code: "BIHOCAM20",
          cta_url: "https://bihocam.com/kampanya",
        },
      }),
  });

  const customPreviewHtml = useMemo(() => {
    if (!selectedCustomMeta) return "<p style='padding:24px'>Önizleme için bir özel şablon seçin.</p>";
    const rendered = renderCustomTemplate(selectedCustomMeta.html_body, {
      full_name: "Demo Kullanıcı",
      email: "demo@bihocam.com",
      offer_title: "Yeni Sezon Kampanyası",
      offer_deadline: "15 Mart 2026",
      coupon_code: "BIHOCAM20",
      cta_url: "https://bihocam.com/kampanya",
    });
    return `<!doctype html><html><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/></head><body style='margin:0;background:#f9fafb'>${rendered}</body></html>`;
  }, [selectedCustomMeta]);

  const sendSystemTest = useMutation({
    mutationFn: () =>
      siteSettingsApi.sendTemplateTest({
        to_email: testEmail,
        template_name: selectedSystemMeta!.template_name,
        subject: selectedSystemMeta!.default_subject,
      }),
    onSuccess: (res) => {
      setMessage(res.message + " (Email Logları ekranından takip edebilirsin)");
      setError(null);
    },
    onError: (err: unknown) => {
      setError(getErrorMessage(err, "Test e-postası gönderilemedi"));
      setMessage(null);
    },
  });

  if (systemLoading) return <div className="p-6 text-sm text-gray-600">Şablonlar yükleniyor...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CRM Mail Template Önizleme</h1>
        <p className="text-sm text-gray-600">Sistem ve oluşturulan özel şablonları seçip sağda önizleyin.</p>
      </div>

      {message && <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{message}</div>}
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Sistem Şablonları</h2>
            <div className="space-y-2">
              {systemTemplates?.map((tpl) => (
                <button
                  key={tpl.template_name}
                  onClick={() => setSelected({ kind: "system", name: tpl.template_name })}
                  className={`w-full text-left px-3 py-3 rounded-xl border ${
                    selected?.kind === "system" && selected.name === tpl.template_name
                      ? "border-teal-400 bg-teal-50"
                      : "border-gray-200 hover:border-teal-200"
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">{tpl.title}</div>
                  <div className="text-xs text-gray-600 mt-1">{tpl.description}</div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-gray-900 mb-2">Oluşturulan Özel Şablonlar</h2>
            <div className="space-y-2">
              {(customTemplates || []).length === 0 && (
                <div className="rounded-lg border border-dashed border-gray-300 p-3 text-xs text-gray-500">
                  Henüz oluşturulan özel şablon yok.
                </div>
              )}
              {(customTemplates || []).map((tpl) => (
                <button
                  key={tpl.id}
                  onClick={() => setSelected({ kind: "custom", id: tpl.id })}
                  className={`w-full text-left px-3 py-3 rounded-xl border ${
                    selected?.kind === "custom" && selected.id === tpl.id
                      ? "border-orange-400 bg-orange-50"
                      : "border-gray-200 hover:border-orange-200"
                  }`}
                >
                  <div className="text-sm font-semibold text-gray-900">{tpl.name}</div>
                  <div className="text-xs text-gray-600 mt-1">{tpl.description || "Açıklama yok"}</div>
                </button>
              ))}
            </div>
            <button onClick={() => refetchCustomTemplates()} className="mt-3 text-xs text-teal-700">Listeyi yenile</button>
          </div>
        </div>

        <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-200 p-4 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-gray-900">Önizleme</h2>
            <div className="inline-flex p-1 rounded-lg bg-gray-100">
              <button onClick={() => setPreviewMode("desktop")} className={`px-3 py-1.5 text-xs rounded-md ${previewMode === "desktop" ? "bg-white shadow text-teal-700" : "text-gray-600"}`}>Masaüstü</button>
              <button onClick={() => setPreviewMode("mobile")} className={`px-3 py-1.5 text-xs rounded-md ${previewMode === "mobile" ? "bg-white shadow text-teal-700" : "text-gray-600"}`}>Mobil</button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-gray-50 p-2">
            {previewLoading && selected?.kind === "system" ? (
              <div className="h-[620px] flex items-center justify-center text-sm text-gray-500">Önizleme hazırlanıyor...</div>
            ) : (
              <iframe
                title="CRM Template Preview"
                sandbox=""
                className={`bg-white rounded-lg border border-gray-200 ${previewMode === "mobile" ? "w-[375px] max-w-full h-[620px] mx-auto" : "w-full h-[620px]"}`}
                srcDoc={selected?.kind === "custom" ? customPreviewHtml : (preview?.html_body || "<p style='padding:24px'>Önizleme için bir şablon seçin.</p>")}
              />
            )}
          </div>

          {selectedSystemMeta && (
            <div className="border-t border-gray-200 pt-4 space-y-3">
              <div className="text-sm font-semibold text-gray-900">Sistem Şablonu Test Gönderimi</div>
              <div className="flex gap-3">
                <input
                  type="email"
                  value={testEmail}
                  onChange={(e) => setTestEmail(e.target.value)}
                  placeholder="test@example.com"
                  className="flex-1 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                />
                <button
                  onClick={() => sendSystemTest.mutate()}
                  disabled={!testEmail || sendSystemTest.isLoading}
                  className="px-4 py-2 rounded-lg bg-orange-500 text-white text-sm font-semibold disabled:opacity-50"
                >
                  {sendSystemTest.isLoading ? "Gönderiliyor..." : "Test Gönder"}
                </button>
              </div>
              <button onClick={() => refetchPreview()} className="text-xs text-teal-700">Önizlemeyi yenile</button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
