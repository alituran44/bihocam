"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";

interface ContactInfo {
  address: string;
  email: string;
  phone: string;
  workingHours: {
    weekdays: string;
    saturday: string;
    sunday: string;
  };
  social: {
    twitter: string;
    instagram: string;
    linkedin: string;
    youtube: string;
  };
  mapEmbedUrl: string;
}

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  active: boolean;
}

const initialContactInfo: ContactInfo = {
  address: "Örnek Mah. Eğitim Cad. No:1, İstanbul, Türkiye",
  email: "iletisim@bihocam.com",
  phone: "+90 (212) 555 0100",
  workingHours: {
    weekdays: "09:00 – 18:00",
    saturday: "10:00 – 15:00",
    sunday: "Kapalı",
  },
  social: {
    twitter: "https://twitter.com/bihocam",
    instagram: "https://instagram.com/bihocam",
    linkedin: "https://linkedin.com/company/bihocam",
    youtube: "https://youtube.com/@bihocam",
  },
  mapEmbedUrl: "",
};

const initialFaqs: FaqItem[] = [
  { id: 1, question: "Kurs satın aldıktan sonra ne kadar süre erişimim olur?", answer: "Satın aldığınız kurslara ömür boyu erişim hakkınız bulunmaktadır.", active: true },
  { id: 2, question: "Eğitmen olmak için ne yapmalıyım?", answer: "\"Eğitmen Ol\" sayfamızdaki formu doldurarak başvurabilirsiniz.", active: true },
  { id: 3, question: "İndirim kuponu nasıl kullanılır?", answer: "Ödeme adımında \"Kupon Kodu\" alanına kodunuzu girerek indirimi uygulayabilirsiniz.", active: true },
  { id: 4, question: "Sertifika programları var mı?", answer: "Evet! Kursu %80 ve üzeri tamamlayan öğrencilerimize dijital sertifika sunulmaktadır.", active: true },
];

type Tab = "info" | "faq" | "messages";

export default function AdminContactPage() {
  return (
    <Suspense fallback={<div className="p-6"><div className="w-8 h-8 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>}>
      <AdminContactContent />
    </Suspense>
  );
}

function AdminContactContent() {
  const searchParams = useSearchParams();
  const tabParam = searchParams.get("tab") as Tab | null;
  const validTabs: Tab[] = ["info", "faq", "messages"];
  const initialTab: Tab = tabParam && validTabs.includes(tabParam) ? tabParam : "info";
  const [activeTab, setActiveTab] = useState<Tab>(initialTab);
  const [info, setInfo] = useState<ContactInfo>(initialContactInfo);
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [savingInfo, setSavingInfo] = useState(false);
  const [savedInfo, setSavedInfo] = useState(false);

  // FAQ editing state
  const [editingFaqId, setEditingFaqId] = useState<number | null>(null);
  const [newFaqQuestion, setNewFaqQuestion] = useState("");
  const [newFaqAnswer, setNewFaqAnswer] = useState("");
  const [showAddFaq, setShowAddFaq] = useState(false);
  const [addFaqQ, setAddFaqQ] = useState("");
  const [addFaqA, setAddFaqA] = useState("");

  const handleSaveInfo = async () => {
    setSavingInfo(true);
    await new Promise((r) => setTimeout(r, 1000));
    setSavingInfo(false);
    setSavedInfo(true);
    setTimeout(() => setSavedInfo(false), 3000);
  };

  const handleDeleteFaq = (id: number) => {
    setFaqs((prev) => prev.filter((f) => f.id !== id));
  };

  const handleToggleFaq = (id: number) => {
    setFaqs((prev) => prev.map((f) => (f.id === id ? { ...f, active: !f.active } : f)));
  };

  const handleEditFaq = (faq: FaqItem) => {
    setEditingFaqId(faq.id);
    setNewFaqQuestion(faq.question);
    setNewFaqAnswer(faq.answer);
  };

  const handleSaveEditFaq = (id: number) => {
    setFaqs((prev) =>
      prev.map((f) => (f.id === id ? { ...f, question: newFaqQuestion, answer: newFaqAnswer } : f))
    );
    setEditingFaqId(null);
  };

  const handleAddFaq = () => {
    if (!addFaqQ.trim() || !addFaqA.trim()) return;
    setFaqs((prev) => [
      ...prev,
      { id: Date.now(), question: addFaqQ, answer: addFaqA, active: true },
    ]);
    setAddFaqQ("");
    setAddFaqA("");
    setShowAddFaq(false);
  };

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    {
      id: "info",
      label: "İletişim Bilgileri",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.945a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
        </svg>
      ),
    },
    {
      id: "faq",
      label: "SSS Yönetimi",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      id: "messages",
      label: "Gelen Mesajlar",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      ),
    },
  ];

  // Demo messages
  const demoMessages = [
    { id: 1, name: "Ahmet Yılmaz", email: "ahmet@test.com", subject: "Teknik Destek", message: "Kurs videolarına erişemiyorum.", date: "2026-05-24", read: false },
    { id: 2, name: "Fatma Kaya", email: "fatma@test.com", subject: "Eğitmen Başvurusu", message: "Eğitmen olmak istiyorum, ne yapmalıyım?", date: "2026-05-23", read: true },
    { id: 3, name: "Ali Öz", email: "ali@test.com", subject: "Fatura & Ödeme", message: "Faturamı nasıl alabilirim?", date: "2026-05-22", read: true },
  ];

  return (
    <div className="p-6 max-w-5xl">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20">
            <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.945a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">İletişim Yönetimi</h1>
            <p className="text-sm text-gray-500">İletişim sayfası içeriğini ve gelen mesajları yönetin</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          {[
            { label: "Toplam Mesaj", value: "127", icon: "📩", color: "from-blue-500 to-indigo-500" },
            { label: "Okunmamış", value: "3", icon: "🔴", color: "from-red-500 to-pink-500" },
            { label: "SSS Sayısı", value: `${faqs.length}`, icon: "❓", color: "from-teal-500 to-emerald-500" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 flex items-center gap-4">
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center text-xl shadow-lg`}>
                {stat.icon}
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
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
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab: Info */}
      {activeTab === "info" && (
        <div className="space-y-6">
          {/* Contact Details */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Temel İletişim Bilgileri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Adres</label>
                <input
                  type="text"
                  value={info.address}
                  onChange={(e) => setInfo({ ...info, address: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label>
                <input
                  type="email"
                  value={info.email}
                  onChange={(e) => setInfo({ ...info, email: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
                <input
                  type="text"
                  value={info.phone}
                  onChange={(e) => setInfo({ ...info, phone: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Harita Embed URL (iFrame src)</label>
                <input
                  type="text"
                  value={info.mapEmbedUrl}
                  placeholder="https://maps.google.com/maps?..."
                  onChange={(e) => setInfo({ ...info, mapEmbedUrl: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          {/* Working Hours */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Çalışma Saatleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { key: "weekdays" as keyof typeof info.workingHours, label: "Hafta içi (Pzt–Cum)" },
                { key: "saturday" as keyof typeof info.workingHours, label: "Cumartesi" },
                { key: "sunday" as keyof typeof info.workingHours, label: "Pazar" },
              ].map(({ key, label }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <input
                    type="text"
                    value={info.workingHours[key]}
                    onChange={(e) =>
                      setInfo({
                        ...info,
                        workingHours: { ...info.workingHours, [key]: e.target.value },
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Social Links */}
          <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
            <h2 className="text-lg font-bold text-gray-900 mb-5">Sosyal Medya Linkleri</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { key: "twitter" as keyof typeof info.social, label: "Twitter / X", placeholder: "https://twitter.com/..." },
                { key: "instagram" as keyof typeof info.social, label: "Instagram", placeholder: "https://instagram.com/..." },
                { key: "linkedin" as keyof typeof info.social, label: "LinkedIn", placeholder: "https://linkedin.com/company/..." },
                { key: "youtube" as keyof typeof info.social, label: "YouTube", placeholder: "https://youtube.com/@..." },
              ].map(({ key, label, placeholder }) => (
                <div key={key}>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">{label}</label>
                  <input
                    type="url"
                    value={info.social[key]}
                    placeholder={placeholder}
                    onChange={(e) =>
                      setInfo({ ...info, social: { ...info.social, [key]: e.target.value } })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Save Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleSaveInfo}
              disabled={savingInfo}
              className="px-8 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {savingInfo ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Değişiklikleri Kaydet
                </>
              )}
            </button>
            {savedInfo && (
              <span className="text-sm text-teal-600 font-medium flex items-center gap-1">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Kaydedildi!
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tab: FAQ */}
      {activeTab === "faq" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-lg font-bold text-gray-900">Sık Sorulan Sorular</h2>
            <button
              onClick={() => setShowAddFaq(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-teal-500 to-teal-600 text-white text-sm font-semibold rounded-xl hover:shadow-lg hover:shadow-teal-500/20 transition-all"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Yeni SSS Ekle
            </button>
          </div>

          {/* Add FAQ form */}
          {showAddFaq && (
            <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 space-y-4">
              <h3 className="font-semibold text-teal-800">Yeni Soru Ekle</h3>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Soru</label>
                <input
                  type="text"
                  value={addFaqQ}
                  onChange={(e) => setAddFaqQ(e.target.value)}
                  placeholder="Sıkça sorulan soru..."
                  className="w-full px-4 py-3 rounded-xl border border-teal-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Cevap</label>
                <textarea
                  rows={3}
                  value={addFaqA}
                  onChange={(e) => setAddFaqA(e.target.value)}
                  placeholder="Cevap metni..."
                  className="w-full px-4 py-3 rounded-xl border border-teal-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={handleAddFaq} className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors">
                  Ekle
                </button>
                <button onClick={() => setShowAddFaq(false)} className="px-5 py-2 bg-white text-gray-600 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors">
                  İptal
                </button>
              </div>
            </div>
          )}

          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              {editingFaqId === faq.id ? (
                <div className="p-5 space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Soru</label>
                    <input
                      type="text"
                      value={newFaqQuestion}
                      onChange={(e) => setNewFaqQuestion(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Cevap</label>
                    <textarea
                      rows={3}
                      value={newFaqAnswer}
                      onChange={(e) => setNewFaqAnswer(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                    />
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveEditFaq(faq.id)}
                      className="px-5 py-2 bg-teal-600 text-white text-sm font-semibold rounded-xl hover:bg-teal-700 transition-colors"
                    >
                      Kaydet
                    </button>
                    <button
                      onClick={() => setEditingFaqId(null)}
                      className="px-5 py-2 bg-white text-gray-600 text-sm font-semibold rounded-xl border border-gray-200 hover:bg-gray-50 transition-colors"
                    >
                      İptal
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start gap-4 p-5">
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-gray-900 mb-1">{faq.question}</p>
                    <p className="text-sm text-gray-500 line-clamp-2">{faq.answer}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    {/* Active toggle */}
                    <button
                      onClick={() => handleToggleFaq(faq.id)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors ${
                        faq.active
                          ? "bg-teal-100 text-teal-700 hover:bg-teal-200"
                          : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                      }`}
                    >
                      {faq.active ? "Aktif" : "Pasif"}
                    </button>
                    {/* Edit */}
                    <button
                      onClick={() => handleEditFaq(faq)}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </button>
                    {/* Delete */}
                    <button
                      onClick={() => handleDeleteFaq(faq.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tab: Messages */}
      {activeTab === "messages" && (
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold text-gray-900">Gelen Mesajlar</h2>
            <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full">
              {demoMessages.filter((m) => !m.read).length} Okunmamış
            </span>
          </div>
          <div className="space-y-3">
            {demoMessages.map((msg) => (
              <div
                key={msg.id}
                className={`bg-white rounded-2xl border shadow-sm p-5 flex items-start gap-4 transition-all ${
                  !msg.read ? "border-teal-200 bg-teal-50/30" : "border-gray-100"
                }`}
              >
                <div className="w-10 h-10 bg-gradient-to-br from-teal-500 to-emerald-500 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                  {msg.name[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-semibold text-gray-900">{msg.name}</span>
                    <span className="text-sm text-gray-500">({msg.email})</span>
                    {!msg.read && (
                      <span className="px-2 py-0.5 bg-teal-500 text-white text-xs font-bold rounded-full">Yeni</span>
                    )}
                  </div>
                  <p className="text-sm font-medium text-gray-700 mb-0.5">Konu: {msg.subject}</p>
                  <p className="text-sm text-gray-500">{msg.message}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-xs text-gray-400 mb-2">{msg.date}</p>
                  <button className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-semibold rounded-lg hover:bg-teal-100 hover:text-teal-700 transition-colors">
                    Yanıtla
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
