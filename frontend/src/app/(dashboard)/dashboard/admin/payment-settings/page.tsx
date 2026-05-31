"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface BankAccount {
  id: number;
  bank: string;
  color: string;
  iban: string;
  accountName: string;
  accountNo: string;
  branch: string;
  active: boolean;
}

interface ChatSettings {
  whatsappEnabled: boolean;
  whatsappNumber: string;
  whatsappMessage: string;
  aiChatEnabled: boolean;
  aiChatName: string;
  aiChatAvatar: string;
  aiChatWelcomeMessage: string;
  aiChatOfflineMessage: string;
  aiOnlineHours: string;
  primaryColor: string;
}

const initialBankAccounts: BankAccount[] = [
  {
    id: 1,
    bank: "Ziraat Bankası",
    color: "from-red-500 to-red-600",
    iban: "TR12 0001 0017 4500 0058 4900 01",
    accountName: "BiHocam Eğitim Teknolojileri A.Ş.",
    accountNo: "4500 0058 4900 01",
    branch: "İstanbul Şubesi",
    active: true,
  },
  {
    id: 2,
    bank: "Garanti BBVA",
    color: "from-green-500 to-green-600",
    iban: "TR34 0006 2000 3340 0006 2994 04",
    accountName: "BiHocam Eğitim Teknolojileri A.Ş.",
    accountNo: "6299404",
    branch: "İstanbul Şubesi",
    active: true,
  },
  {
    id: 3,
    bank: "İş Bankası",
    color: "from-blue-500 to-blue-700",
    iban: "TR56 0006 4000 0011 2345 6789 01",
    accountName: "BiHocam Eğitim Teknolojileri A.Ş.",
    accountNo: "123456789",
    branch: "İstanbul Şubesi",
    active: false,
  },
];

const initialChatSettings: ChatSettings = {
  whatsappEnabled: true,
  whatsappNumber: "905321234567",
  whatsappMessage: "Merhaba! BiHocam hakkında bilgi almak istiyorum.",
  aiChatEnabled: true,
  aiChatName: "BiBot",
  aiChatAvatar: "🤖",
  aiChatWelcomeMessage: "Merhaba! Ben BiBot. Size nasıl yardımcı olabilirim?",
  aiChatOfflineMessage: "Şu anda çevrimiçi değiliz. Mesajınızı bırakın, en kısa sürede dönelim.",
  aiOnlineHours: "09:00 - 22:00",
  primaryColor: "#0d9488",
};

const bankColorOptions = [
  { label: "Kırmızı", value: "from-red-500 to-red-600" },
  { label: "Yeşil", value: "from-green-500 to-green-600" },
  { label: "Mavi", value: "from-blue-500 to-blue-700" },
  { label: "Turuncu", value: "from-orange-500 to-orange-600" },
  { label: "Mor", value: "from-purple-500 to-purple-600" },
  { label: "Gri", value: "from-gray-500 to-gray-700" },
];

type Tab = "banks" | "whatsapp" | "aichat";

export default function AdminPaymentSettingsPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <PaymentSettingsContent />
    </Suspense>
  );
}

function PaymentSettingsContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const validTabs: Tab[] = ["banks", "whatsapp", "aichat"];
  const initialTab: Tab = tabParam && validTabs.includes(tabParam) ? tabParam : "banks";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [banks, setBanks] = useState<BankAccount[]>(initialBankAccounts);
  const [chatSettings, setChatSettings] = useState<ChatSettings>(initialChatSettings);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showAddBank, setShowAddBank] = useState(false);
  const [editingBankId, setEditingBankId] = useState<number | null>(null);

  const [newBank, setNewBank] = useState<Omit<BankAccount, "id" | "active">>({
    bank: "",
    color: "from-blue-500 to-blue-700",
    iban: "",
    accountName: "",
    accountNo: "",
    branch: "",
  });

  const handleSave = async () => {
    setSaving(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleAddBank = () => {
    if (!newBank.bank || !newBank.iban) return;
    setBanks((prev) => [
      ...prev,
      { ...newBank, id: Date.now(), active: true },
    ]);
    setNewBank({ bank: "", color: "from-blue-500 to-blue-700", iban: "", accountName: "", accountNo: "", branch: "" });
    setShowAddBank(false);
  };

  const handleDeleteBank = (id: number) => {
    setBanks((prev) => prev.filter((b) => b.id !== id));
  };

  const handleToggleBank = (id: number) => {
    setBanks((prev) => prev.map((b) => (b.id === id ? { ...b, active: !b.active } : b)));
  };

  const handleUpdateBank = (id: number, field: keyof BankAccount, value: string) => {
    setBanks((prev) => prev.map((b) => (b.id === id ? { ...b, [field]: value } : b)));
  };

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "banks", label: "Banka Hesapları", icon: "🏦" },
    { id: "whatsapp", label: "WhatsApp", icon: "💬" },
    { id: "aichat", label: "AI Canlı Destek", icon: "🤖" },
  ];

  return (
    <div className="p-6 max-w-4xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ödeme & Destek Ayarları</h1>
            <p className="text-sm text-gray-500">Banka hesapları, WhatsApp ve AI canlı destek yönetimi</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Aktif Banka", value: `${banks.filter((b) => b.active).length}`, icon: "🏦", color: "from-blue-500 to-indigo-500" },
            { label: "WhatsApp", value: chatSettings.whatsappEnabled ? "Açık" : "Kapalı", icon: "💬", color: "from-green-500 to-emerald-500" },
            { label: "AI Chat", value: chatSettings.aiChatEnabled ? "Açık" : "Kapalı", icon: "🤖", color: "from-teal-500 to-cyan-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-xl font-bold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-8 w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
              activeTab === tab.id
                ? "bg-white text-teal-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <span>{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* ─── TAB: BANK ACCOUNTS ─── */}
      {activeTab === "banks" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">Havale / EFT Banka Hesapları</h2>
              <p className="text-sm text-gray-500 mt-0.5">Ödeme sayfasında gösterilecek banka hesaplarını yönetin</p>
            </div>
            <button
              onClick={() => setShowAddBank(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Hesap Ekle
            </button>
          </div>

          {/* Add Bank Form */}
          {showAddBank && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-bold text-teal-800">Yeni Banka Hesabı</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {[
                  { key: "bank", label: "Banka Adı", placeholder: "Ziraat Bankası" },
                  { key: "accountName", label: "Hesap Adı", placeholder: "Şirket Adı A.Ş." },
                  { key: "iban", label: "IBAN", placeholder: "TR00 0000 0000 0000 0000 0000 00" },
                  { key: "accountNo", label: "Hesap No", placeholder: "1234567890" },
                  { key: "branch", label: "Şube", placeholder: "İstanbul Şubesi" },
                ].map(({ key, label, placeholder }) => (
                  <div key={key}>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
                    <input
                      type="text"
                      placeholder={placeholder}
                      value={(newBank as any)[key]}
                      onChange={(e) => setNewBank({ ...newBank, [key]: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-teal-200 bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                ))}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Renk</label>
                  <select
                    value={newBank.color}
                    onChange={(e) => setNewBank({ ...newBank, color: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-teal-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  >
                    {bankColorOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>{opt.label}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddBank} className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700">Ekle</button>
                <button onClick={() => setShowAddBank(false)} className="px-5 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">İptal</button>
              </div>
            </div>
          )}

          {banks.map((bank) => (
            <div key={bank.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className={`bg-gradient-to-r ${bank.color} px-5 py-3 flex items-center justify-between`}>
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-white/80" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                  {editingBankId === bank.id ? (
                    <input
                      type="text"
                      value={bank.bank}
                      onChange={(e) => handleUpdateBank(bank.id, "bank", e.target.value)}
                      className="bg-white/20 text-white placeholder-white/60 border border-white/30 rounded-lg px-3 py-1 text-sm font-bold focus:outline-none focus:ring-1 focus:ring-white"
                    />
                  ) : (
                    <span className="font-bold text-white">{bank.bank}</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleToggleBank(bank.id)}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-colors ${
                      bank.active ? "bg-white/20 text-white" : "bg-black/20 text-white/60"
                    }`}
                  >
                    {bank.active ? "Aktif" : "Pasif"}
                  </button>
                  <button
                    onClick={() => setEditingBankId(editingBankId === bank.id ? null : bank.id)}
                    className="p-1.5 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => handleDeleteBank(bank.id)}
                    className="p-1.5 bg-black/20 hover:bg-black/30 rounded-lg transition-colors"
                  >
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
              {editingBankId === bank.id ? (
                <div className="p-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { field: "accountName" as keyof BankAccount, label: "Hesap Adı" },
                    { field: "iban" as keyof BankAccount, label: "IBAN" },
                    { field: "accountNo" as keyof BankAccount, label: "Hesap No" },
                    { field: "branch" as keyof BankAccount, label: "Şube" },
                  ].map(({ field, label }) => (
                    <div key={field}>
                      <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">{label}</label>
                      <input
                        type="text"
                        value={bank[field] as string}
                        onChange={(e) => handleUpdateBank(bank.id, field, e.target.value)}
                        className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                      />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">Renk</label>
                    <select
                      value={bank.color}
                      onChange={(e) => handleUpdateBank(bank.id, "color", e.target.value)}
                      className="w-full px-3 py-2.5 rounded-xl border border-gray-200 bg-gray-50 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    >
                      {bankColorOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex gap-3">
                    <button onClick={() => setEditingBankId(null)} className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700">Kaydet</button>
                    <button onClick={() => setEditingBankId(null)} className="px-5 py-2 border border-gray-200 text-gray-600 text-sm font-semibold rounded-xl hover:bg-gray-50">İptal</button>
                  </div>
                </div>
              ) : (
                <div className="p-5 grid grid-cols-2 gap-3">
                  {[
                    { label: "Hesap Adı", value: bank.accountName },
                    { label: "IBAN", value: bank.iban },
                    { label: "Hesap No", value: bank.accountNo },
                    { label: "Şube", value: bank.branch },
                  ].map((row) => (
                    <div key={row.label}>
                      <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">{row.label}</p>
                      <p className="text-sm font-mono text-gray-800 mt-0.5">{row.value}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}

          <div className="flex items-center gap-3 pt-2">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/20 transition-all disabled:opacity-70 flex items-center gap-2"
            >
              {saving ? (
                <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Kaydediliyor...</>
              ) : (
                <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Kaydet</>
              )}
            </button>
            {saved && <span className="text-sm text-teal-600 font-medium flex items-center gap-1">✓ Kaydedildi!</span>}
          </div>
        </div>
      )}

      {/* ─── TAB: WHATSAPP ─── */}
      {activeTab === "whatsapp" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">WhatsApp Destek Butonu</h2>
                <p className="text-sm text-gray-500 mt-0.5">Sitede sabit görünen WhatsApp iletişim butonu</p>
              </div>
              <button
                onClick={() => setChatSettings({ ...chatSettings, whatsappEnabled: !chatSettings.whatsappEnabled })}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${chatSettings.whatsappEnabled ? "bg-green-500" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-200 ${chatSettings.whatsappEnabled ? "left-7" : "left-0.5"}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">WhatsApp Numarası</label>
                <div className="flex">
                  <span className="px-4 py-3 bg-gray-100 border border-r-0 border-gray-200 rounded-l-xl text-sm text-gray-600 font-medium">+</span>
                  <input
                    type="text"
                    value={chatSettings.whatsappNumber}
                    onChange={(e) => setChatSettings({ ...chatSettings, whatsappNumber: e.target.value })}
                    placeholder="905321234567"
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-r-xl bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">Ülke kodu dahil yazın: 905321234567</p>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ön Doldurulmuş Mesaj</label>
                <textarea
                  rows={2}
                  value={chatSettings.whatsappMessage}
                  onChange={(e) => setChatSettings({ ...chatSettings, whatsappMessage: e.target.value })}
                  placeholder="Merhaba! BiHocam hakkında bilgi almak istiyorum."
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Önizleme</p>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 bg-[#25D366] rounded-full flex items-center justify-center shadow-lg shadow-green-500/30">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-900">WhatsApp'ta Yaz</p>
                  <p className="text-xs text-gray-500">{chatSettings.whatsappMessage.slice(0, 50)}...</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2">
              {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Kaydediliyor...</> : <>✓ Kaydet</>}
            </button>
            {saved && <span className="text-sm text-teal-600 font-medium">✓ Kaydedildi!</span>}
          </div>
        </div>
      )}

      {/* ─── TAB: AI CHAT ─── */}
      {activeTab === "aichat" && (
        <div className="space-y-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Yapay Zeka Canlı Destek</h2>
                <p className="text-sm text-gray-500 mt-0.5">Sitedeki AI destekli sohbet botu ayarları</p>
              </div>
              <button
                onClick={() => setChatSettings({ ...chatSettings, aiChatEnabled: !chatSettings.aiChatEnabled })}
                className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${chatSettings.aiChatEnabled ? "bg-teal-500" : "bg-gray-300"}`}
              >
                <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow transition-all duration-200 ${chatSettings.aiChatEnabled ? "left-7" : "left-0.5"}`} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bot Adı</label>
                <input
                  type="text"
                  value={chatSettings.aiChatName}
                  onChange={(e) => setChatSettings({ ...chatSettings, aiChatName: e.target.value })}
                  placeholder="BiBot"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Bot Avatarı (Emoji)</label>
                <input
                  type="text"
                  value={chatSettings.aiChatAvatar}
                  onChange={(e) => setChatSettings({ ...chatSettings, aiChatAvatar: e.target.value })}
                  placeholder="🤖"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Çevrimiçi Saatler</label>
                <input
                  type="text"
                  value={chatSettings.aiOnlineHours}
                  onChange={(e) => setChatSettings({ ...chatSettings, aiOnlineHours: e.target.value })}
                  placeholder="09:00 - 22:00"
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Tema Rengi (Hex)</label>
                <div className="flex gap-3">
                  <input
                    type="color"
                    value={chatSettings.primaryColor}
                    onChange={(e) => setChatSettings({ ...chatSettings, primaryColor: e.target.value })}
                    className="w-12 h-12 rounded-xl cursor-pointer border border-gray-200"
                  />
                  <input
                    type="text"
                    value={chatSettings.primaryColor}
                    onChange={(e) => setChatSettings({ ...chatSettings, primaryColor: e.target.value })}
                    placeholder="#0d9488"
                    className="flex-1 px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                  />
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Karşılama Mesajı</label>
                <textarea
                  rows={2}
                  value={chatSettings.aiChatWelcomeMessage}
                  onChange={(e) => setChatSettings({ ...chatSettings, aiChatWelcomeMessage: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">Çevrimdışı Mesajı</label>
                <textarea
                  rows={2}
                  value={chatSettings.aiChatOfflineMessage}
                  onChange={(e) => setChatSettings({ ...chatSettings, aiChatOfflineMessage: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-xl p-4">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Sohbet Önizlemesi</p>
              <div className="max-w-xs bg-white rounded-2xl shadow-xl border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 flex items-center gap-3" style={{ background: chatSettings.primaryColor }}>
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-lg">
                    {chatSettings.aiChatAvatar}
                  </div>
                  <div>
                    <p className="text-white font-bold text-sm">{chatSettings.aiChatName}</p>
                    <p className="text-white/70 text-xs">Çevrimiçi</p>
                  </div>
                </div>
                <div className="p-3">
                  <div className="bg-gray-100 rounded-2xl rounded-tl-none px-3 py-2 text-sm text-gray-700 max-w-[85%]">
                    {chatSettings.aiChatWelcomeMessage}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button onClick={handleSave} disabled={saving} className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-70 flex items-center gap-2">
              {saving ? <><span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Kaydediliyor...</> : <>✓ Kaydet</>}
            </button>
            {saved && <span className="text-sm text-teal-600 font-medium">✓ Kaydedildi!</span>}
          </div>
        </div>
      )}
    </div>
  );
}
