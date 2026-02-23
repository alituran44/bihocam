"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { siteSettingsApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function CreateCrmTemplatePage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [htmlBody, setHtmlBody] = useState(DEFAULT_HTML);
  const [plainBody, setPlainBody] = useState("");
  const [variables, setVariables] = useState("full_name, email");
  const [previewMode, setPreviewMode] = useState<"edit" | "preview">("edit");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const createMutation = useMutation({
    mutationFn: () =>
      siteSettingsApi.createCustomTemplate({
        name,
        subject,
        html_body: htmlBody,
        plain_body: plainBody || undefined,
        description: description || undefined,
        variables: variables
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean),
      }),
    onSuccess: () => {
      setMessage("Şablon başarıyla oluşturuldu!");
      setError(null);
      setTimeout(() => router.push("/dashboard/admin/crm/templates"), 1500);
    },
    onError: (err: unknown) => {
      const detail =
        typeof err === "object" && err !== null && "response" in err
          ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
          : undefined;
      setError(detail || "Şablon oluşturulamadı");
      setMessage(null);
    },
  });

  const renderPreview = () => {
    let rendered = htmlBody;
    variables
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean)
      .forEach((v) => {
        rendered = rendered.replace(
          new RegExp(`{{\\s*${v}\\s*}}`, "g"),
          `<span style="background:#fef3c7;padding:2px 6px;border-radius:4px;font-weight:600;">[${v}]</span>`
        );
      });
    return `<!doctype html><html><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/></head><body style='margin:0;background:#f9fafb'>${rendered}</body></html>`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Yeni E-posta Şablonu Oluştur</h1>
          <p className="text-sm text-gray-600">
            CRM kampanyalarınız için özel HTML e-posta şablonu oluşturun.
          </p>
        </div>
        <button
          onClick={() => router.push("/dashboard/admin/crm/templates")}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
        >
          ← Geri Dön
        </button>
      </div>

      {message && (
        <div className="p-3 rounded-lg bg-emerald-50 text-emerald-700 text-sm">{message}</div>
      )}
      {error && <div className="p-3 rounded-lg bg-red-50 text-red-700 text-sm">{error}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Şablon Bilgileri</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şablon Adı *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Hoş Geldin Kampanyası"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Konu *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="E-posta konu satırı"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Açıklama</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Şablonun amacını kısaca açıklayın"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Değişkenler (virgülle ayırın)
              </label>
              <input
                type="text"
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                placeholder="full_name, email, coupon_code"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                HTML içinde {"{{ degisken_adi }}"} şeklinde kullanın
              </p>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">HTML İçerik</h2>
              <div className="inline-flex p-1 rounded-lg bg-gray-100">
                <button
                  onClick={() => setPreviewMode("edit")}
                  className={`px-3 py-1.5 text-xs rounded-md ${
                    previewMode === "edit" ? "bg-white shadow text-teal-700" : "text-gray-600"
                  }`}
                >
                  Düzenle
                </button>
                <button
                  onClick={() => setPreviewMode("preview")}
                  className={`px-3 py-1.5 text-xs rounded-md ${
                    previewMode === "preview" ? "bg-white shadow text-teal-700" : "text-gray-600"
                  }`}
                >
                  Önizle
                </button>
              </div>
            </div>

            {previewMode === "edit" ? (
              <textarea
                value={htmlBody}
                onChange={(e) => setHtmlBody(e.target.value)}
                rows={20}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                placeholder="HTML e-posta içeriğini buraya yazın..."
              />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-2">
                <iframe
                  title="Template Preview"
                  sandbox=""
                  className="w-full h-[500px] bg-white rounded-lg border border-gray-200"
                  srcDoc={renderPreview()}
                />
              </div>
            )}
          </div>

          <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Düz Metin (Opsiyonel)</h2>
            <textarea
              value={plainBody}
              onChange={(e) => setPlainBody(e.target.value)}
              rows={6}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
              placeholder="HTML desteklemeyen istemciler için düz metin versiyonu..."
            />
          </div>

          <button
            onClick={() => createMutation.mutate()}
            disabled={!name || !subject || !htmlBody || createMutation.isLoading}
            className="w-full px-6 py-3 bg-teal-600 text-white font-semibold rounded-xl hover:bg-teal-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {createMutation.isLoading ? "Oluşturuluyor..." : "Şablonu Oluştur"}
          </button>
        </div>

        {/* Right: Live Preview */}
        <div className="bg-white rounded-2xl border border-gray-200 p-6 space-y-4 sticky top-6">
          <h2 className="text-lg font-semibold text-gray-900">Canlı Önizleme</h2>
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-2">
            <iframe
              title="Live Preview"
              sandbox=""
              className="w-full h-[700px] bg-white rounded-lg border border-gray-200"
              srcDoc={renderPreview()}
            />
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <p className="text-xs text-amber-800">
              <strong>İpucu:</strong> Değişkenleri{" "}
              <code className="bg-amber-100 px-1 rounded">{"{{ degisken }}"}</code> formatında
              kullanın. Önizlemede sarı ile vurgulanırlar.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_HTML = `<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #0f766e, #f97316); padding: 32px; text-align: center;">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 700;">BiHocam</h1>
    </div>
    <div style="padding: 32px; line-height: 1.6;">
      <h2 style="color: #111827; font-size: 20px; margin-top: 0;">Merhaba {{ full_name }},</h2>
      <p style="color: #4b5563;">Buraya mesajınızı yazın...</p>
      <p style="text-align: center;">
        <a href="#" style="display: inline-block; background: #0f766e; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600;">Harekete Geç</a>
      </p>
    </div>
    <div style="padding: 24px 32px; text-align: center; border-top: 1px solid #e5e7eb;">
      <p style="color: #9ca3af; font-size: 13px; margin: 0;">© BiHocam</p>
    </div>
  </div>
</div>`;
