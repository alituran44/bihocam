"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/lib/store";

type Role = "student" | "teacher";

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setUser = useAuthStore((state) => state.setUser);

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState<Role>("student");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const roleParam = searchParams.get("role");
    if (roleParam === "teacher") {
      setRole("teacher");
    }
  }, [searchParams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Şifreler eşleşmiyor.");
      return;
    }

    if (password.length < 8) {
      setError("Şifre en az 8 karakter olmalı.");
      return;
    }

    setLoading(true);

    try {
      await authApi.register(email, password, fullName, role);

      // P1-02: HttpOnly cookie + localStorage fallback
      const tokens = await authApi.login(email, password);
      if (tokens.access_token) {
        localStorage.setItem("access_token", tokens.access_token);
      }
      if (tokens.refresh_token) {
        localStorage.setItem("refresh_token", tokens.refresh_token);
      }

      const user = await authApi.getMe();
      setUser(user);

      router.push("/dashboard");
    } catch (err: unknown) {
      const error = err as { response?: { data?: { detail?: string } } };
      setError(error.response?.data?.detail || "Kayıt oluşturulamadı. Lütfen tekrar deneyin.");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = () => {
    const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (clientId) {
      const redirectUri = `${window.location.origin}/auth/google/callback`;
      const scope = encodeURIComponent("openid email profile");
      const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=${scope}&access_type=offline&prompt=consent&state=${role}`;
      window.location.href = googleAuthUrl;
    } else {
      setError("Google / Gmail ile kayıt servisi yapılandırılıyor. Lütfen aşağıdaki formu doldurarak kayıt olunuz.");
    }
  };

  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100">
        <div className="text-center mb-8">
          <img src="/logo-light.png" alt="BiHocam Logo" className="h-14 w-auto object-contain mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Hesap Oluştur</h1>
          <p className="text-gray-500">Öğrenmeye hemen başlayın</p>
        </div>

        {/* Role Selection */}
        <div className="flex gap-3 mb-6 p-1.5 bg-gray-100 rounded-xl">
          <button
            type="button"
            onClick={() => setRole("student")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
              role === "student"
                ? "bg-white text-teal-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            Öğrenci
          </button>
          <button
            type="button"
            onClick={() => setRole("teacher")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg font-semibold transition-all ${
              role === "teacher"
                ? "bg-white text-emerald-600 shadow-sm"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
            Eğitmen
          </button>
        </div>

        {/* Google / Gmail ile Kayıt Ol */}
        <button
          type="button"
          onClick={handleGoogleRegister}
          className="w-full flex items-center justify-center gap-3 px-4 py-3.5 bg-white border border-slate-200 hover:border-slate-300 hover:bg-slate-50 text-slate-700 font-semibold rounded-xl shadow-2xs hover:shadow-xs transition-all cursor-pointer group mb-6"
        >
          <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span className="text-sm">
            Google / Gmail ile {role === "teacher" ? "Eğitmen Olarak" : ""} Kayıt Ol
          </span>
        </button>

        <div className="relative mb-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-gray-400 font-semibold tracking-wider">veya form ile devam et</span>
          </div>
        </div>

        {role === "student" ? (
          <form action="/api/v1/auth/register" method="POST" onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm flex items-center gap-2">
                <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label htmlFor="fullName" className="block text-sm font-semibold text-gray-700 mb-2">
                Ad Soyad
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Adınız Soyadınız"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                E-posta
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="ornek@email.com"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="En az 8 karakter"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                Şifre Tekrar
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent transition-all"
                placeholder="Şifrenizi tekrar girin"
              />
            </div>

            <div className="text-sm text-gray-500">
              Kayıt olarak{" "}
              <Link href="/pages/uyelik-sozlesmesi" className="text-teal-600 hover:text-teal-700 font-medium">
                Üyelik Sözleşmesi
              </Link>
              {" "}ve{" "}
              <Link href="/pages/gizlilik" className="text-teal-600 hover:text-teal-700 font-medium">
                Gizlilik Politikası
              </Link>
              &apos;nı kabul etmiş olursunuz.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 rounded-xl font-semibold transition-all disabled:cursor-not-allowed disabled:opacity-50 bg-gradient-to-r from-teal-500 to-teal-600 hover:shadow-lg hover:shadow-teal-500/30 text-white"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Kayıt oluşturuluyor...
                </span>
              ) : (
                "Kayıt Ol"
              )}
            </button>
          </form>
        ) : (
          <div className="space-y-6 text-center animate-fadeIn">
            <div className="w-16 h-16 bg-orange-50 rounded-2xl flex items-center justify-center mx-auto text-3xl shadow-inner text-orange-600 animate-pulse">
              👨‍🏫
            </div>
            
            <div className="space-y-2">
              <h3 className="text-xl font-bold text-gray-900">Eğitmen Başvurusu</h3>
              <p className="text-gray-500 text-sm leading-relaxed">
                BiHocam ailesine katılarak uzmanlığınızı kazanca dönüştürün, esnek çalışma saatleriyle kendi düzeninizi kurun.
              </p>
            </div>

            <div className="bg-slate-50 border border-gray-100 rounded-2xl p-4 text-left space-y-3">
              <div className="flex items-start gap-3">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span className="text-sm text-gray-600 font-semibold">Kendi ders saatlik ücretinizi belirleyin</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span className="text-sm text-gray-600 font-semibold">İstediğiniz zaman, istediğiniz yerde ders verin</span>
              </div>
              <div className="flex items-start gap-3">
                <span className="text-orange-500 mt-0.5">✓</span>
                <span className="text-sm text-gray-600 font-semibold">Yapay zeka destekli ders hazırlık araçları</span>
              </div>
            </div>

            <Link
              href="/become-instructor"
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl font-bold text-white bg-gradient-to-r from-orange-500 to-orange-600 hover:shadow-lg hover:shadow-orange-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300"
            >
              <span>Eğitmen Ol & Başvuru Yap</span>
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </Link>
          </div>
        )}

        <div className="mt-8 text-center">
          <p className="text-gray-600">
            Zaten hesabınız var mı?{" "}
            <Link href="/login" className="text-teal-600 hover:text-teal-700 font-semibold">
              Giriş yapın
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function LoadingFallback() {
  return (
    <div className="w-full max-w-md">
      <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 animate-pulse">
        <div className="w-16 h-16 bg-gray-200 rounded-2xl mx-auto mb-4" />
        <div className="h-8 bg-gray-200 rounded-lg w-40 mx-auto mb-2" />
        <div className="h-4 bg-gray-200 rounded w-48 mx-auto mb-8" />
        <div className="space-y-5">
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
          <div className="h-12 bg-gray-200 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <RegisterForm />
    </Suspense>
  );
}
