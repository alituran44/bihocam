import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bihocam.com";
  const now = new Date();

  const routes = [
    { url: `${baseUrl}`, lastModified: now, changeFrequency: "daily" as const, priority: 1.0 },
    { url: `${baseUrl}/courses`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/teachers`, lastModified: now, changeFrequency: "daily" as const, priority: 0.9 },
    { url: `${baseUrl}/tenders`, lastModified: now, changeFrequency: "always" as const, priority: 0.9 },
    { url: `${baseUrl}/tenders/new`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/egitim-programlari`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.8 },
    { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${baseUrl}/iletisim`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.5 },
    { url: `${baseUrl}/pages/hakkimizda`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.4 },
    { url: `${baseUrl}/pages/uyelik-sozlesmesi`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/pages/gizlilik`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.3 },
    { url: `${baseUrl}/pages/KVKK-aydinlatma-metni`, lastModified: now, changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  return routes;
}
