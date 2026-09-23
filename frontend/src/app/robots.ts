import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard/",
          "/api/",
          "/admin/",
          "/checkout/",
          "/reset-password/",
        ],
      },
      {
        userAgent: [
          "GPTBot",
          "ChatGPT-User",
          "PerplexityBot",
          "ClaudeBot",
          "Google-Extended",
          "CCBot",
        ],
        allow: ["/", "/courses", "/teachers", "/blog", "/tenders", "/llms.txt", "/llms-full.txt"],
      },
    ],
    sitemap: "https://bihocam.com/sitemap.xml",
    host: "https://bihocam.com",
  };
}
