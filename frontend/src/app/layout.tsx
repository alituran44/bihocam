import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import SiteSettingsScripts from "@/components/SiteSettingsScripts";

// Tüm sayfalar dynamic render — useSearchParams SSR hatalarını önler
export const dynamic = "force-dynamic";

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "BiHocam | Online Eğitim Platformu",
  description: "YKS, LGS ve okul derslerinde uzman eğitmenlerle çalış. Canlı dersler, video arşivi ve kişiselleştirilmiş öğrenme.",
  keywords: ["online eğitim", "YKS hazırlık", "LGS hazırlık", "özel ders"],
  authors: [{ name: "BiHocam" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <body className={`${inter.variable} antialiased`} style={{ fontFamily: "var(--font-body)" }}>
        <Providers>
          <SiteSettingsScripts />
          {children}
        </Providers>
      </body>
    </html>
  );
}
