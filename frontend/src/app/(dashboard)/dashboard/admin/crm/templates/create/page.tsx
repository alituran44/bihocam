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
          `<span style="background:#ccfbf1;padding:2px 6px;border-radius:4px;font-weight:600;color:#0f766e;">[${v}]</span>`
        );
      });
    return `<!doctype html><html><head><meta charset='utf-8'/><meta name='viewport' content='width=device-width,initial-scale=1'/></head><body style='margin:0;background:#f9fafb'>${rendered}</body></html>`;
  };

  return (
    <div className="space-y-8">
      {/* Hero Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-teal-600 via-emerald-600 to-teal-500 rounded-3xl mb-8 shadow-2xl">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48Y2lyY2xlIGN4PSIzMCIgY3k9IjMwIiByPSIxLjUiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
        <div className="relative px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-white mb-3 tracking-tight">
                Yeni E-posta Şablonu
              </h1>
              <p className="text-teal-100 text-lg">
                CRM kampanyalarınız için özel HTML e-posta şablonu oluşturun
              </p>
            </div>
            <div className="hidden md:block">
              <div className="w-32 h-32 rounded-full bg-white/10 backdrop-blur-sm border-2 border-white/20 flex items-center justify-center">
                <svg className="w-16 h-16 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
            </div>
          </div>
          <button
            onClick={() => router.push("/dashboard/admin/crm/templates")}
            className="mt-4 px-5 py-2 text-sm font-semibold text-teal-700 bg-white/90 backdrop-blur-sm rounded-xl hover:bg-white transition-colors"
          >
            ← Şablonlara Dön
          </button>
        </div>
      </div>

      {message && (
        <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-2xl p-4 border border-emerald-200 text-emerald-700 text-sm font-medium">
          ✅ {message}
        </div>
      )}
      {error && (
        <div className="bg-gradient-to-br from-red-50 to-rose-50 rounded-2xl p-4 border border-red-200 text-red-700 text-sm font-medium">
          ❌ {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form */}
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg space-y-5">
            <h2 className="text-xl font-bold text-gray-900">Şablon Bilgileri</h2>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Şablon Adı *</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Örn: Hoş Geldin Kampanyası"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Konu *</label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="E-posta konu satırı"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">Açıklama</label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Şablonun amacını kısaca açıklayın"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-semibold text-gray-700 mb-1 block">
                Değişkenler (virgülle ayırın)
              </label>
              <input
                type="text"
                value={variables}
                onChange={(e) => setVariables(e.target.value)}
                placeholder="full_name, email, coupon_code"
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-transparent bg-white text-sm"
              />
              <p className="text-xs text-gray-500 mt-1">
                HTML içinde {"{{ degisken_adi }}"} şeklinde kullanın
              </p>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">HTML İçerik</h2>
              <div className="inline-flex p-1 rounded-xl bg-gray-100">
                <button
                  onClick={() => setPreviewMode("edit")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg ${
                    previewMode === "edit" ? "bg-white shadow text-teal-700" : "text-gray-600"
                  } transition-all`}
                >
                  Düzenle
                </button>
                <button
                  onClick={() => setPreviewMode("preview")}
                  className={`px-4 py-1.5 text-xs font-semibold rounded-lg ${
                    previewMode === "preview" ? "bg-white shadow text-teal-700" : "text-gray-600"
                  } transition-all`}
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
                className="w-full px-4 py-2.5 border border-gray-200 rounded-xl font-mono text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                placeholder="HTML e-posta içeriğini buraya yazın..."
              />
            ) : (
              <div className="rounded-xl border border-gray-200 bg-gray-50 p-2">
                <iframe
                  title="Template Preview"
                  sandbox=""
                  className="w-full h-[500px] bg-white rounded-xl border border-gray-200"
                  srcDoc={renderPreview()}
                />
              </div>
            )}
          </div>

          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Düz Metin (Opsiyonel)</h2>
            <textarea
              value={plainBody}
              onChange={(e) => setPlainBody(e.target.value)}
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              placeholder="HTML desteklemeyen istemciler için düz metin versiyonu..."
            />
          </div>

          <button
            onClick={() => createMutation.mutate()}
            disabled={!name || !subject || !htmlBody || createMutation.isPending}
            className="w-full px-6 py-3.5 bg-gradient-to-r from-teal-600 to-emerald-600 text-white font-bold rounded-xl hover:from-teal-700 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-xl text-base"
          >
            {createMutation.isPending ? "Oluşturuluyor..." : "Şablonu Oluştur"}
          </button>
        </div>

        {/* Right: Live Preview */}
        <div className="space-y-6">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-gray-200 p-6 shadow-lg sticky top-6 space-y-4">
            <h2 className="text-xl font-bold text-gray-900">Canlı Önizleme</h2>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-2">
              <iframe
                title="Live Preview"
                sandbox=""
                className="w-full h-[700px] bg-white rounded-xl border border-gray-200"
                srcDoc={renderPreview()}
              />
            </div>
            <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-4">
              <p className="text-xs text-teal-800">
                <strong>💡 İpucu:</strong> Değişkenleri{" "}
                <code className="bg-teal-100 px-1.5 py-0.5 rounded text-teal-700 font-semibold">{"{{ degisken }}"}</code> formatında
                kullanın. Önizlemede yeşil ile vurgulanırlar.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

const DEFAULT_HTML = `<div style="max-width: 600px; margin: 0 auto; padding: 40px 20px;">
  <div style="background: #ffffff; border-radius: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); overflow: hidden;">
    <div style="background: linear-gradient(135deg, #0f766e, #10b981); padding: 32px; text-align: center;">
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
