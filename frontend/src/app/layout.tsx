import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Providers } from "@/lib/providers";
import SiteSettingsScripts from "@/components/SiteSettingsScripts";
import ClientChatWidgets from "@/components/ClientChatWidgets";
import { OrganizationJsonLd } from "@/components/seo/JsonLd";

// Tüm sayfalar dynamic render — useSearchParams SSR uyumluluğu
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
  metadataBase: new URL("https://bihocam.com"),
  title: {
    default: "BiHocam | Türkiye'nin Yeni Nesil Özel Ders Platformu",
    template: "%s | BiHocam"
  },
  description: "YKS, LGS ve okul derslerinde doğrulanmış uzman eğitmenlerle çalış. Canlı dersler, özel ders talepleri ve kişiselleştirilmiş öğrenme.",
  keywords: [
    "Özel Ders",
    "Yapay Zeka",
    "Yeni Nesil",
    "Ders Talebi",
    "Fazla Öğren",
    "YKS hazırlık",
    "LGS hazırlık",
    "online eğitim",
    "canlı özel ders",
    "birebir ders",
    "online öğretmen"
  ],
  authors: [{ name: "BiHocam", url: "https://bihocam.com" }],
  creator: "BiHocam",
  publisher: "BiHocam Eğitim Teknolojileri",
  alternates: {
    canonical: "https://bihocam.com",
  },
  openGraph: {
    title: "BiHocam | Türkiye'nin Yeni Nesil Özel Ders Platformu",
    description: "YKS, LGS ve okul derslerinde doğrulanmış uzman eğitmenlerle çalış. Canlı dersler, özel ders talepleri ve kişiselleştirilmiş öğrenme.",
    url: "https://bihocam.com",
    siteName: "BiHocam",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "BiHocam Akıllı Özel Ders Ağı",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BiHocam | Türkiye'nin Yeni Nesil Özel Ders Platformu",
    description: "YKS, LGS ve okul derslerinde doğrulanmış uzman eğitmenlerle çalış. Canlı dersler ve özel ders talepleri.",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="scroll-smooth">
      <head>
        <OrganizationJsonLd />
      </head>
      <body className={`${inter.variable} ${plusJakarta.variable} antialiased bg-slate-950 text-slate-100 selection:bg-emerald-500 selection:text-white`}>
        {/* WCAG 2.1 AA Skip Link */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[100] focus:px-4 focus:py-2 focus:bg-emerald-600 focus:text-white focus:font-bold focus:rounded-xl focus:shadow-xl focus:outline-none focus:ring-2 focus:ring-white"
        >
          İçeriğe Atla
        </a>
        <Providers>
          <SiteSettingsScripts />
          {children}
          <ClientChatWidgets />
        </Providers>
      </body>
    </html>
  );
}
