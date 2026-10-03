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
  description: "YKS, LGS ve tüm okul derslerinde doğrulanmış uzman eğitmenlerle canlı özel ders yap. İster öğretmen seç, ister ders talebi aç.",
  authors: [{ name: "BiHocam", url: "https://bihocam.com" }],
  creator: "BiHocam",
  publisher: "BiHocam Eğitim Teknolojileri",
  alternates: {
    canonical: "https://bihocam.com",
  },
  openGraph: {
    title: "BiHocam | Türkiye'nin Yeni Nesil Özel Ders Platformu",
    description: "YKS, LGS ve tüm okul derslerinde doğrulanmış uzman eğitmenlerle canlı özel ders yap. İster öğretmen seç, ister ders talebi aç.",
    url: "https://bihocam.com",
    siteName: "BiHocam",
    locale: "tr_TR",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "BiHocam | Türkiye'nin Yeni Nesil Özel Ders Platformu",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "BiHocam | Türkiye'nin Yeni Nesil Özel Ders Platformu",
    description: "YKS, LGS ve tüm okul derslerinde doğrulanmış uzman eğitmenlerle canlı özel ders yap. İster öğretmen seç, ister ders talebi aç.",
    images: ["/og-image.png"],
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
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" fetchPriority="high" />
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
