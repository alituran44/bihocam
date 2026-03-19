"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { emailLogsApi, type EmailLogItem } from "@/lib/api";

export default function AdminEmailLogsPage() {
  const [page, setPage] = useState(0);
  const [status, setStatus] = useState<"" | "pending" | "sent" | "failed" | "retrying">("");
  const [email, setEmail] = useState("");
  const [expandedErrorId, setExpandedErrorId] = useState<string | null>(null);
  const limit = 20;

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["admin-email-logs", page, status, email],
    queryFn: () =>
      emailLogsApi.list({
        skip: page * limit,
        limit,
        status: status || undefined,
        email: email || undefined,
      }),
  });

  const retryMutation = useMutation({
    mutationFn: (id: string) => emailLogsApi.retry(id),
    onSuccess: () => refetch(),
  });

  const totalPages = useMemo(() => {
    const total = data?.total || 0;
    return Math.max(1, Math.ceil(total / limit));
  }, [data?.total]);

  const badgeClass = (value: EmailLogItem["status"]) => {
    if (value === "sent") return "bg-emerald-100 text-emerald-700";
    if (value === "failed") return "bg-red-100 text-red-700";
    return "bg-amber-100 text-amber-700";
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Email Logları</h1>
        <p className="text-sm text-gray-600">Gönderim durumlarını takip et ve başarısızları yeniden dene.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Toplam</p>
          <p className="text-2xl font-bold text-gray-900">{data?.stats?.total ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Sent</p>
          <p className="text-2xl font-bold text-emerald-700">{data?.stats?.sent ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Failed</p>
          <p className="text-2xl font-bold text-red-700">{data?.stats?.failed ?? 0}</p>
        </div>
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <p className="text-xs text-gray-500">Pending/Retrying</p>
          <p className="text-2xl font-bold text-amber-700">
            {(data?.stats?.pending ?? 0) + (data?.stats?.retrying ?? 0)}
          </p>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <select
            value={status}
            onChange={(e) => {
              setPage(0);
              setStatus(e.target.value as any);
            }}
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
          >
            <option value="">Tüm Durumlar</option>
            <option value="sent">SENT</option>
            <option value="failed">FAILED</option>
            <option value="pending">PENDING</option>
            <option value="retrying">RETRYING</option>
          </select>
          <input
            value={email}
            onChange={(e) => {
              setPage(0);
              setEmail(e.target.value);
            }}
            placeholder="Email ara..."
            className="px-3 py-2 rounded-lg border border-gray-200 text-sm"
          />
          <button
            onClick={() => refetch()}
            className="px-3 py-2 rounded-lg bg-teal-600 text-white text-sm font-semibold"
          >
            Filtreyi Uygula
          </button>
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Alıcı</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Konu</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Şablon</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Durum</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Deneme</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Tarih</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Aksiyon</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Yükleniyor...
                  </td>
                </tr>
              ) : !data?.items?.length ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Kayıt bulunamadı.
                  </td>
                </tr>
              ) : (
                data.items.map((item) => (
                  <tr key={item.id} className="border-t border-gray-100 align-top">
                    <td className="px-4 py-3">{item.to_email}</td>
                    <td className="px-4 py-3">{item.subject}</td>
                    <td className="px-4 py-3">{item.template_name || "-"}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${badgeClass(item.status)}`}>
                        {item.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3">{item.attempt_count}</td>
                    <td className="px-4 py-3">
                      {new Date(item.created_at).toLocaleString("tr-TR")}
                      {item.sent_at && <div className="text-xs text-gray-500">Sent: {new Date(item.sent_at).toLocaleString("tr-TR")}</div>}
                      {item.last_error && (
                        <button
                          className="block text-xs text-red-600 mt-1"
                          onClick={() => setExpandedErrorId(expandedErrorId === item.id ? null : item.id)}
                        >
                          Hata Detayı
                        </button>
                      )}
                      {expandedErrorId === item.id && item.last_error && (
                        <div className="mt-1 text-xs text-red-700 bg-red-50 border border-red-100 rounded p-2">
                          {item.last_error}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {item.status !== "sent" ? (
                        <button
                          onClick={() => {
                            if (confirm("Bu e-postayı tekrar kuyruğa almak istiyor musun?")) {
                              retryMutation.mutate(item.id);
                            }
                          }}
                          className="px-3 py-1.5 rounded-md bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600"
                        >
                          Tekrar Gönder
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex items-center justify-between">
        <button
          onClick={() => setPage((p) => Math.max(0, p - 1))}
          disabled={page === 0}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
        >
          Önceki
        </button>
        <p className="text-sm text-gray-600">
          Sayfa {page + 1} / {totalPages}
        </p>
        <button
          onClick={() => setPage((p) => (p + 1 < totalPages ? p + 1 : p))}
          disabled={page + 1 >= totalPages}
          className="px-4 py-2 rounded-lg border border-gray-200 text-sm disabled:opacity-50"
        >
          Sonraki
        </button>
      </div>
    </div>
  );
}
