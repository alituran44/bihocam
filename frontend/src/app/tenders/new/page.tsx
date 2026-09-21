"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { tendersApi, authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";
import {
  Sparkles,
  BookOpen,
  MapPin,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  HelpCircle,
  PlusCircle,
  Lock
} from "lucide-react";

export default function NewTenderPage() {
  const router = useRouter();
  const { user, isAuthenticated, setUser } = useAuthStore();

  // Form Field States
  const [subject, setSubject] = useState("Matematik");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [mode, setMode] = useState<"ONLINE" | "FACE_TO_FACE">("ONLINE");
  const [city, setCity] = useState("İstanbul");
  const [district, setDistrict] = useState("");
  const [targetDateInfo, setTargetDateInfo] = useState("Hemen Başlasın");
  const [minBudget, setMinBudget] = useState("500");
  const [maxBudget, setMaxBudget] = useState("850");

  // Inline Quick Registration State (if not logged in)
  const [authMode, setAuthMode] = useState<"REGISTER" | "LOGIN">("REGISTER");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  // Quick subject suggestions
  const popularSubjects = [
    "Matematik",
    "Fizik",
    "Kimya",
    "Biyoloji",
    "Türkçe & Paragraf",
    "İngilizce (YDS/IELTS)",
    "Geometri",
    "LGS Fen Bilimleri",
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Lütfen özel ders talebinize açıklayıcı bir başlık yazınız.");
      return;
    }
    if (!description.trim() || description.length < 15) {
      setError("Lütfen ihtiyacınızı ve hedeflerinizi en az 15 karakter ile açıklayınız.");
      return;
    }

    const minB = minBudget ? parseFloat(minBudget) : undefined;
    const maxB = maxBudget ? parseFloat(maxBudget) : undefined;

    if (minB && maxB && minB > maxB) {
      setError("Minimum bütçe, maksimum bütçeden büyük olamaz.");
      return;
    }

    setLoading(true);

    try {
      // 1. Eğer kullanıcı giriş yapmamışsa, inline register veya login yap
      if (!isAuthenticated) {
        if (!email.trim() || !password.trim()) {
          setError("Talebinizi yayınlayabilmek ve teklifleri görebilmek için e-posta ve şifrenizi giriniz.");
          setLoading(false);
          return;
        }

        if (authMode === "REGISTER") {
          if (!fullName.trim()) {
            setError("Lütfen adınızı ve soyadınızı giriniz.");
            setLoading(false);
            return;
          }
          if (password.length < 6) {
            setError("Şifre en az 6 karakter olmalıdır.");
            setLoading(false);
            return;
          }

          // Register as student
          await authApi.register(email.trim(), password, fullName.trim(), "student");
        }

        // Login to get tokens
        const tokens = await authApi.login(email.trim(), password);
        if (tokens.access_token) {
          localStorage.setItem("access_token", tokens.access_token);
        }
        if (tokens.refresh_token) {
          localStorage.setItem("refresh_token", tokens.refresh_token);
        }

        const me = await authApi.getMe();
        setUser(me);
      }

      // 2. Özel ders talebini oluştur
      await tendersApi.create({
        title: title.trim(),
        subject: subject.trim(),
        description: description.trim(),
        mode: mode,
        city: mode === "FACE_TO_FACE" ? city : undefined,
        district: mode === "FACE_TO_FACE" ? district : undefined,
        target_date_info: targetDateInfo,
        min_budget: minB,
        max_budget: maxB,
      });

      setSuccess(true);
      setTimeout(() => {
        router.push("/dashboard/student/tenders");
      }, 2000);
    } catch (err: any) {
      console.error("Talep oluşturma hatası:", err);
      const msg = err.response?.data?.detail || "Ders talebi oluşturulurken bir sorun oluştu. Lütfen tekrar deneyin.";
      setError(typeof msg === "string" ? msg : JSON.stringify(msg));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-emerald-500 selection:text-white flex flex-col font-sans">
      <Header />

      <main className="flex-1 pt-28 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* ── HEADER BREADCRUMB ── */}
          <div className="mb-6 flex items-center gap-2 text-xs font-medium text-slate-500">
            <Link href="/" className="hover:text-emerald-600 transition-colors">Ana Sayfa</Link>
            <span>/</span>
            <Link href="/tenders" className="hover:text-emerald-600 transition-colors">Özel Ders Talepleri</Link>
            <span>/</span>
            <span className="text-slate-800 font-semibold">Yeni Talep Aç</span>
          </div>

          {/* ── PAGE TITLE CARD ── */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-8 sm:p-10 shadow-sm mb-8 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-100/40 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 space-y-3">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-emerald-200 bg-emerald-50 text-emerald-800 text-xs font-semibold uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>ÜCRETSİZ ÖZEL DERS TALEBİ</span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight">
                İhtiyacın Olan Dersi Belirt, Öğretmenlerden Teklif Al
              </h1>
              <p className="text-sm sm:text-base text-slate-600 max-w-2xl leading-relaxed">
                Hedefini, bütçeni ve ders formatını belirt. BiHocam doğrulanmış branş öğretmenleri 24 saat içinde tekliflerini ve çalışma planlarını sunsun.
              </p>
            </div>
          </div>

          {/* ── FORM CONTAINER ── */}
          <div className="bg-white rounded-3xl border border-slate-200/80 p-6 sm:p-10 shadow-sm">
            {success ? (
              <div className="py-12 text-center space-y-4 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-black text-slate-900">Ders Talebiniz Başarıyla Oluşturuldu!</h2>
                <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                  Talebiniz ilgili branş öğretmenlerine iletildi. Gelen teklifleri öğrenci panelinizden inceleyebilir ve dilediğinizi kabul edebilirsiniz.
                </p>
                <div className="pt-4">
                  <Link
                    href="/dashboard/student/tenders"
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-md transition-all"
                  >
                    <span>Öğrenci Paneline Git</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-8">
                {error && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-3">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* ── BÖLÜM 1: DERS & BRANŞ ── */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <BookOpen className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900">1. Ders ve İhtiyaç Detayları</h2>
                  </div>

                  {/* Subject selector */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-2">
                      Ders / Branş Seçimi *
                    </label>
                    <div className="flex flex-wrap gap-2 mb-3">
                      {popularSubjects.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setSubject(s)}
                          className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
                            subject === s
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="veya farklı bir branş yazın (Örn: İspanyolca, Piyano, Robotik Kodlama...)"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                  </div>

                  {/* Title */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Talep Başlığı *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Örn: YKS 2026 Matematik - Limit, Türev ve İntegral Özel Ders"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Öğretmenlerin dikkatini çekecek, sınıf ve konu seviyenizi belirten kısa bir başlık.
                    </p>
                  </div>

                  {/* Description */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      İhtiyacınızı ve Hedefinizi Açıklayın *
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Hangi konularda zorlanıyorsunuz? Haftada kaç saat düşünüyorsunuz? Hedeflediğiniz okul veya net sayısı nedir? Belirtiniz..."
                      className="w-full p-4 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    />
                    <p className="text-[11px] text-slate-400 mt-1">
                      Minimum 15 karakter. Güvenliğiniz için telefon veya e-posta gibi iletişim bilgilerinizi yazmayınız.
                    </p>
                  </div>
                </div>

                {/* ── BÖLÜM 2: FORMAT & KONUM ── */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <MapPin className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900">2. Ders Formatı ve Zamanı</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <button
                      type="button"
                      onClick={() => setMode("ONLINE")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        mode === "ONLINE"
                          ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">Online Canlı Sınıf</span>
                        {mode === "ONLINE" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        BiHocam kurulumsuz video sınıfında, interaktif beyaz tahta ile canlı birebir ders.
                      </p>
                    </button>

                    <button
                      type="button"
                      onClick={() => setMode("FACE_TO_FACE")}
                      className={`p-4 rounded-2xl border text-left transition-all ${
                        mode === "FACE_TO_FACE"
                          ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                          : "border-slate-200 bg-slate-50 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-bold text-sm text-slate-900">Yüz Yüze Özel Ders</span>
                        {mode === "FACE_TO_FACE" && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        Öğrencinin veya öğretmenin belirleyeceği güvenli bir adreste birebir çalışma.
                      </p>
                    </button>
                  </div>

                  {mode === "FACE_TO_FACE" && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">Şehir *</label>
                        <input
                          type="text"
                          required
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          placeholder="Örn: İstanbul"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1.5">İlçe / Bölge</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          placeholder="Örn: Kadıköy, Çankaya"
                          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                        />
                      </div>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Başlama Zamanı Tercihi
                    </label>
                    <select
                      value={targetDateInfo}
                      onChange={(e) => setTargetDateInfo(e.target.value)}
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-800"
                    >
                      <option value="Hemen Başlasın">Hemen Başlasın (En erken tarihte)</option>
                      <option value="1 Hafta İçinde">1 Hafta İçinde</option>
                      <option value="Bu Ay İçinde">Bu Ay İçinde</option>
                      <option value="Hafta Sonu Odaklı">Hafta Sonu Odaklı</option>
                    </select>
                  </div>
                </div>

                {/* ── BÖLÜM 3: SAATLİK BÜTÇE ── */}
                <div className="space-y-4 pt-4">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <Clock className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-bold text-slate-900">3. Saatlik Bütçe Aralığı</h2>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Minimum Saatlik Bütçe (TL)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                        <input
                          type="number"
                          min="100"
                          step="50"
                          value={minBudget}
                          onChange={(e) => setMinBudget(e.target.value)}
                          placeholder="500"
                          className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1.5">
                        Maksimum Saatlik Bütçe (TL)
                      </label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold">₺</span>
                        <input
                          type="number"
                          min="100"
                          step="50"
                          value={maxBudget}
                          onChange={(e) => setMaxBudget(e.target.value)}
                          placeholder="850"
                          className="w-full pl-8 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold text-slate-800"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Bütçenizi yaklaşık olarak belirtebilirsiniz. Öğretmenler bu aralığa göre en uygun fiyatlarını sunacaktır.
                  </p>
                </div>

                {/* ── BÖLÜM 4: GİRİŞ / KAYIT (GİRİŞ YAPILMAMIŞSA) ── */}
                {!isAuthenticated && (
                  <div className="space-y-4 pt-6 border-t border-slate-200">
                    <div className="rounded-2xl bg-emerald-50/70 border border-emerald-200/80 p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-5 h-5 text-emerald-600" />
                        <h3 className="font-bold text-sm text-emerald-950">
                          Teklifleri Almak İçin İletişim Hesabınızı Belirtin
                        </h3>
                      </div>
                      <p className="text-xs text-emerald-800 leading-relaxed">
                        Öğretmenlerin tekliflerini görebilmeniz ve dersinizi yönetebilmeniz için ücretsiz öğrenci hesabınız oluşturulacaktır.
                      </p>

                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setAuthMode("REGISTER")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            authMode === "REGISTER"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          Yeni Hesap Aç (30 Saniye)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthMode("LOGIN")}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                            authMode === "LOGIN"
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-white text-slate-700 hover:bg-slate-100"
                          }`}
                        >
                          Zaten Hesabım Var (Giriş Yap)
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                        {authMode === "REGISTER" && (
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-slate-700 mb-1">Adınız Soyadınız *</label>
                            <input
                              type="text"
                              required
                              value={fullName}
                              onChange={(e) => setFullName(e.target.value)}
                              placeholder="Örn: Ayşe Yılmaz"
                              className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                            />
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">E-posta Adresiniz *</label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="ornek@email.com"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                          />
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-slate-700 mb-1">Şifre *</label>
                          <input
                            type="password"
                            required
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="En az 6 karakter"
                            className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-xs text-slate-800"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {/* ── SUBMIT BUTTON ── */}
                <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                    <span>Özel ders talebi açmak tamamen ücretsizdir. Hiçbir bağlayıcılığı yoktur.</span>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-60 flex-shrink-0"
                  >
                    <PlusCircle className="w-5 h-5" />
                    <span>{loading ? "Talebiniz Yayınlanıyor..." : "Özel Ders Talebini Yayınla"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>

        </div>
      </main>

      <Footer />
    </div>
  );
}
