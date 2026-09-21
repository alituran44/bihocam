import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import SiteSettingsScripts from "@/components/SiteSettingsScripts";
import FloatingChat from "@/components/FloatingChat";
import { AIAssistantChat } from "@/components/ui/AIAssistantChat";

// Tüm sayfalar dynamic render — useSearchParams SSR hatalarını önler
export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

const plusJakarta = Plus_Jakarta_Sans({
  variable: "--font-display",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BiHocam | Türkiye'nin Yeni Nesil Özel Ders & Eğitim Platformu",
  description: "YKS, LGS ve okul derslerinde doğrulanmış uzman eğitmenlerle çalış. Canlı dersler, özel ders talepleri ve kişiselleştirilmiş öğrenme.",
  keywords: ["online eğitim", "YKS hazırlık", "LGS hazırlık", "özel ders", "özel ders talebi"],
  authors: [{ name: "BiHocam" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white`}>
        <Providers>
          <SiteSettingsScripts />
          {children}
          <FloatingChat />
          <AIAssistantChat />
        </Providers>
      </body>
    </html>
  );
}
