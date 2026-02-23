"use client";

import { useEffect, useState } from "react";
import { publicApi } from "@/lib/api";

export default function MaintenancePage() {
  const [settings, setSettings] = useState<{ site_title?: string | null; logo_url?: string | null } | null>(null);
  const [maintenanceMessage, setMaintenanceMessage] = useState<string>("Site bakım modundadır. Lütfen daha sonra tekrar deneyin.");
  const [estimatedEnd, setEstimatedEnd] = useState<string | null>(null);

  useEffect(() => {
    // SessionStorage'dan maintenance bilgilerini al (API interceptor'dan gelir)
    if (typeof window !== "undefined") {
      const message = sessionStorage.getItem("maintenance_message");
      const endTime = sessionStorage.getItem("maintenance_estimated_end");
      
      if (message) {
        setMaintenanceMessage(message);
      }
      if (endTime) {
        setEstimatedEnd(endTime);
      }
    }

    // Public settings'ten site bilgilerini al
    publicApi
      .getPublicSettings()
      .then((data) => {
        setSettings(data);
      })
      .catch(() => {
        // Ignore errors - maintenance mode'da API çalışmayabilir
      });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-emerald-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-teal-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-cyan-200/40 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      {/* Geometric Pattern Overlay */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23000000' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}></div>

      <div className="relative w-full max-w-4xl">
        {/* Main Card */}
        <div className="relative bg-white/80 backdrop-blur-2xl rounded-[2.5rem] shadow-2xl border border-emerald-100/50 p-8 md:p-16 overflow-hidden">
          {/* Decorative Gradient Border */}
          <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-emerald-400/20 via-teal-400/20 to-cyan-400/20 opacity-50 pointer-events-none"></div>
          <div className="absolute inset-[1px] rounded-[2.5rem] bg-white/80 backdrop-blur-2xl"></div>

          <div className="relative z-10">
            {/* Logo Section */}
            <div className="flex justify-center mb-12">
              {settings?.logo_url ? (
                <div className="relative">
                  <img src={settings.logo_url} alt="Logo" className="h-28 object-contain drop-shadow-lg" />
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/20 to-teal-400/20 rounded-full blur-2xl -z-10"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-emerald-500 via-teal-500 to-cyan-500 rounded-3xl flex items-center justify-center shadow-2xl transform hover:scale-105 transition-transform duration-300">
                    <span className="text-white font-bold text-5xl">B</span>
                  </div>
                  <div className="absolute -inset-4 bg-gradient-to-br from-emerald-400/30 to-teal-400/30 rounded-3xl blur-xl animate-pulse"></div>
                </div>
              )}
            </div>

            {/* Animated Maintenance Icon */}
            <div className="mb-12 flex justify-center">
              <div className="relative">
                {/* Outer Glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                
                {/* Main Icon Container */}
                <div className="relative w-48 h-48 bg-gradient-to-br from-emerald-100 via-teal-100 to-cyan-100 rounded-full flex items-center justify-center shadow-2xl border-4 border-emerald-200/50">
                  <svg className="w-24 h-24 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>

                {/* Spinning Rings */}
                <div className="absolute inset-0 border-4 border-transparent border-t-emerald-400 rounded-full animate-spin" style={{ animationDuration: '3s' }}></div>
                <div className="absolute inset-4 border-4 border-transparent border-t-teal-400 rounded-full animate-spin" style={{ animationDuration: '2s', animationDirection: 'reverse' }}></div>
              </div>
            </div>

            {/* Title */}
            <h1 className="text-6xl md:text-7xl font-black text-center mb-8 tracking-tight">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Bakım Modu
              </span>
            </h1>

            {/* Main Message */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-l-4 border-emerald-500 rounded-2xl p-8 mb-8 shadow-lg">
              <p className="text-xl md:text-2xl text-gray-800 leading-relaxed text-center font-medium">
                {maintenanceMessage}
              </p>
            </div>

            {/* Estimated End Time */}
            {estimatedEnd && (
              <div className="bg-gradient-to-br from-teal-50 via-emerald-50 to-cyan-50 border-2 border-teal-300/50 rounded-2xl p-8 mb-8 text-center shadow-lg backdrop-blur-sm">
                <div className="flex items-center justify-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-teal-800 uppercase tracking-wider">Tahmini Bitiş</p>
                </div>
                <p className="text-2xl font-bold text-teal-900">
                  {new Date(estimatedEnd).toLocaleString("tr-TR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            )}

            {/* Info Box */}
            <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200/50 rounded-2xl p-8 shadow-lg">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <p className="text-base text-blue-900 leading-relaxed font-medium">
                    Site şu anda bakım çalışmaları nedeniyle geçici olarak kullanılamıyor. 
                    Lütfen birkaç dakika sonra tekrar deneyin. Sorun devam ederse bizimle iletişime geçebilirsiniz.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
