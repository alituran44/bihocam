"use client";

import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

const contactInfo = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Adres",
    value: "Çanakkale",
    sub: "Türkiye",
    color: "from-teal-500 to-emerald-500",
    bg: "bg-teal-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.945a2 2 0 002.22 0L21 8m-18 8h18a2 2 0 002-2V8a2 2 0 00-2-2H3a2 2 0 00-2 2v6a2 2 0 002 2z" />
      </svg>
    ),
    title: "E-posta",
    value: "bilgi@bihocam.com",
    sub: "7/24 e-posta desteği",
    color: "from-blue-500 to-indigo-500",
    bg: "bg-blue-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    title: "Telefon",
    value: "+90 8508405543",
    sub: "Pzt–Cum 09:00–18:00",
    color: "from-purple-500 to-pink-500",
    bg: "bg-purple-50",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
    title: "Canlı Destek",
    value: "Anlık destek hattı",
    sub: "Ortalama yanıt: 5 dakika",
    color: "from-orange-500 to-amber-500",
    bg: "bg-orange-50",
  },
];

const faqItems = [
  {
    q: "Kurs satın aldıktan sonra ne kadar süre erişimim olur?",
    a: "Satın aldığınız kurslara ömür boyu erişim hakkınız bulunmaktadır. Dilediğiniz zaman tekrar izleyebilirsiniz.",
  },
  {
    q: "Eğitmen olmak için ne yapmalıyım?",
    a: "\"Eğitmen Ol\" sayfamızdaki formu doldurarak başvurabilirsiniz. Başvurular genellikle 3 iş günü içinde değerlendirilmektedir.",
  },
  {
    q: "İndirim kuponu nasıl kullanılır?",
    a: "Ödeme adımında \"Kupon Kodu\" alanına kodunuzu girerek indirimi uygulayabilirsiniz.",
  },
  {
    q: "Sertifika programları var mı?",
    a: "Evet! Kursu %80 ve üzeri tamamlayan öğrencilerimize dijital sertifika sunulmaktadır.",
  },
];

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setSubmitting(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-gradient-to-br from-[#0b1329] via-[#0f1f4a] to-[#0b2a4a]">
        {/* Animated background blobs */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -left-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-3xl" />
          {/* Dot grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage: "radial-gradient(circle, #60a5fa 1px, transparent 1px)",
              backgroundSize: "32px 32px",
            }}
          />
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full text-white/80 text-sm font-medium mb-6">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse" />
            Destek ekibimiz çevrimiçi
          </div>
          <h1 className="text-4xl sm:text-6xl font-extrabold text-white mb-6 leading-tight">
            Bizimle{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
              İletişime
            </span>{" "}
            Geçin
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Sorularınız, önerileriniz veya işbirliği talepleriniz için 7/24 buradayız. Size en hızlı şekilde geri dönmeyi taahhüt ediyoruz.
          </p>
        </div>
      </section>

      {/* Contact Info Cards */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {contactInfo.map((info, idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl shadow-xl shadow-gray-100/80 border border-gray-100 p-6 group hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl ${info.bg} flex items-center justify-center mb-4 bg-gradient-to-br ${info.color} text-white shadow-lg`}
              >
                {info.icon}
              </div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-1">{info.title}</h3>
              <p className="text-base font-bold text-gray-900 mb-0.5">{info.value}</p>
              <p className="text-sm text-gray-500">{info.sub}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Main Content: Form + Map */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-3xl shadow-2xl shadow-gray-100/80 border border-gray-100 p-8 md:p-10">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Mesaj Gönderin</h2>
              <p className="text-gray-500 mb-8">Formu doldurun, en kısa sürede size ulaşalım.</p>

              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-gradient-to-br from-teal-400 to-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl shadow-teal-500/30">
                    <svg className="w-10 h-10 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Mesajınız İletildi!</h3>
                  <p className="text-gray-500 mb-6">En kısa sürede size geri dönüş yapacağız.</p>
                  <button
                    onClick={() => { setSubmitted(false); setForm({ name: "", email: "", subject: "", message: "" }); }}
                    className="px-6 py-3 bg-gradient-to-r from-teal-500 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg hover:shadow-teal-500/30 transition-all"
                  >
                    Yeni Mesaj Gönder
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Ad Soyad</label>
                      <input
                        id="contact-name"
                        type="text"
                        required
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        placeholder="Ahmet Yılmaz"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">E-posta</label>
                      <input
                        id="contact-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        placeholder="ahmet@ornek.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Konu</label>
                    <select
                      id="contact-subject"
                      value={form.subject}
                      onChange={(e) => setForm({ ...form, subject: e.target.value })}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                    >
                      <option value="">Konu seçin</option>
                      <option value="genel">Genel Bilgi</option>
                      <option value="teknik">Teknik Destek</option>
                      <option value="egitmen">Eğitmen Başvurusu</option>
                      <option value="fatura">Fatura &amp; Ödeme</option>
                      <option value="isbirligi">İşbirliği Teklifi</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Mesajınız</label>
                    <textarea
                      id="contact-message"
                      required
                      rows={5}
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      placeholder="Mesajınızı buraya yazın..."
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-gray-50 text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all resize-none"
                    />
                  </div>

                  <button
                    id="contact-submit"
                    type="submit"
                    disabled={submitting}
                    className="w-full py-4 bg-gradient-to-r from-teal-500 to-teal-600 text-white font-bold rounded-xl hover:shadow-xl hover:shadow-teal-500/30 hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-3"
                  >
                    {submitting ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Gönderiliyor...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Mesaj Gönder
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>

          {/* Sidebar: Map + Social */}
          <div className="lg:col-span-2 space-y-6">
            {/* Map placeholder */}
            <div className="bg-gradient-to-br from-[#0b1329] to-[#0f1f4a] rounded-3xl overflow-hidden shadow-2xl h-72 relative flex items-center justify-center">
              <div
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: "radial-gradient(circle, #60a5fa 1px, transparent 1px)",
                  backgroundSize: "24px 24px",
                }}
              />
              <div className="relative text-center">
                <div className="w-16 h-16 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center mx-auto mb-4 border border-white/20">
                  <svg className="w-8 h-8 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <p className="text-white font-semibold">Çanakkale, Türkiye</p>
                <p className="text-white/60 text-sm mt-1">Çanakkale / Türkiye</p>
              </div>
            </div>

            {/* Working Hours */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/80 border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-teal-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Çalışma Saatleri
              </h3>
              <div className="space-y-3">
                {[
                  { day: "Pazartesi – Cuma", hours: "09:00 – 18:00", open: true },
                  { day: "Cumartesi", hours: "10:00 – 15:00", open: true },
                  { day: "Pazar", hours: "Kapalı", open: false },
                ].map((item) => (
                  <div key={item.day} className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{item.day}</span>
                    <span className={`text-sm font-semibold px-3 py-1 rounded-full ${item.open ? "bg-teal-50 text-teal-700" : "bg-gray-100 text-gray-500"}`}>
                      {item.hours}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Social Links */}
            <div className="bg-white rounded-3xl shadow-xl shadow-gray-100/80 border border-gray-100 p-6">
              <h3 className="font-bold text-gray-900 mb-4">Sosyal Medya</h3>
              <div className="grid grid-cols-2 gap-3">
                {[
                  { name: "Twitter / X", color: "bg-black text-white", icon: "𝕏" },
                  { name: "Instagram", color: "bg-gradient-to-br from-purple-500 to-pink-500 text-white", icon: "📷" },
                  { name: "LinkedIn", color: "bg-blue-700 text-white", icon: "in" },
                  { name: "YouTube", color: "bg-red-600 text-white", icon: "▶" },
                ].map((s) => (
                  <button
                    key={s.name}
                    className={`${s.color} px-4 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 hover:opacity-90 transition-opacity`}
                  >
                    <span className="text-base">{s.icon}</span>
                    {s.name}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="bg-gradient-to-br from-gray-50 to-teal-50/30 py-20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Sık Sorulan Sorular</h2>
            <p className="text-gray-500">Hızlı yanıt için SSS bölümümüzü inceleyin.</p>
          </div>
          <div className="space-y-4">
            {faqItems.map((item, idx) => (
              <div
                key={idx}
                className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left hover:bg-gray-50/50 transition-colors"
                >
                  <span className="font-semibold text-gray-900">{item.q}</span>
                  <span className={`ml-4 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-200 ${openFaq === idx ? "bg-teal-500 text-white rotate-45" : "bg-gray-100 text-gray-500"}`}>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                    </svg>
                  </span>
                </button>
                {openFaq === idx && (
                  <div className="px-6 pb-5 text-gray-600 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
