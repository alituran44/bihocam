"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notificationsApi, NotificationPreferences } from "@/lib/api";

export default function NotificationSettingsPage() {
  const queryClient = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ["notifications", "preferences"],
    queryFn: () => notificationsApi.getPreferences(),
  });

  const [form, setForm] = useState<NotificationPreferences | null>(null);

  useEffect(() => {
    if (data) {
      setForm(data);
    }
  }, [data]);

  const mutation = useMutation({
    mutationFn: (body: Partial<NotificationPreferences>) =>
      notificationsApi.updatePreferences(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications", "preferences"] });
    },
  });

  const handleToggle = (field: keyof NotificationPreferences) => {
    if (!form) return;
    setForm({ ...form, [field]: !form[field] });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form) return;
    mutation.mutate(form);
  };

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">Bildirim Ayarları</h1>
        <p className="text-gray-600 text-sm">
          E-posta ve uygulama içi bildirim tercihlerini buradan yönetebilirsin.
        </p>
      </div>

      {isLoading || !form ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm">
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-100 rounded-xl animate-pulse" />
            ))}
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl border border-gray-200 p-8 shadow-sm space-y-8"
        >
          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Genel Ayarlar</h2>
            <div className="space-y-4">
              <ToggleRow
                label="Uygulama içi bildirimler"
                description="Kurs durumları, siparişler ve ilerleme güncellemeleri için bildirim al."
                checked={form.in_app_enabled}
                onChange={() => handleToggle("in_app_enabled")}
              />
              <ToggleRow
                label="E-posta bildirimleri"
                description="Önemli bildirimler ve özetler e-posta olarak gönderilsin."
                checked={form.email_enabled}
                onChange={() => handleToggle("email_enabled")}
              />
              <ToggleRow
                label="Push bildirimler"
                description="Tarayıcı veya mobil uygulama üzerinden anlık bildirim al."
                checked={form.push_enabled}
                onChange={() => handleToggle("push_enabled")}
              />
            </div>
          </section>

          <section>
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Sessiz Saatler</h2>
            <p className="text-sm text-gray-600 mb-4">
              Belirlediğin saat aralığında e-posta ve push bildirimleri duraklatılır (uygulama
              içi bildirimler birikir).
            </p>
            <div className="flex flex-wrap items-center gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Başlangıç
                </label>
                <input
                  type="time"
                  value={form.quiet_hours_start || ""}
                  onChange={(e) =>
                    setForm({ ...form, quiet_hours_start: e.target.value || null })
                  }
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-400"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">
                  Bitiş
                </label>
                <input
                  type="time"
                  value={form.quiet_hours_end || ""}
                  onChange={(e) =>
                    setForm({ ...form, quiet_hours_end: e.target.value || null })
                  }
                  className="px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:border-teal-400"
                />
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="submit"
              disabled={mutation.isPending}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold hover:shadow-lg hover:shadow-teal-500/30 disabled:opacity-50 transition-all"
            >
              {mutation.isPending ? "Kaydediliyor..." : "Ayarları Kaydet"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

interface ToggleRowProps {
  label: string;
  description: string;
  checked: boolean;
  onChange: () => void;
}

function ToggleRow({ label, description, checked, onChange }: ToggleRowProps) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-gray-900">{label}</p>
        <p className="text-xs text-gray-500 mt-0.5">{description}</p>
      </div>
      <button
        type="button"
        onClick={onChange}
        className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full border transition-colors ${
          checked
            ? "bg-teal-500 border-teal-500"
            : "bg-gray-200 border-gray-300"
        }`}
        aria-pressed={checked}
      >
        <span
          className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
            checked ? "translate-x-5" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
}

