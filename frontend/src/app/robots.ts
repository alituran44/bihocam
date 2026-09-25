import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const disallowedPrivateRoutes = [
    "/dashboard/",
    "/api/",
    "/admin/",
    "/checkout/",
    "/cart/",
    "/orders/",
    "/payment/",
    "/tenders/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password/",
    "/verify-certificate/",
  ];

  const allowedPublicPaths = [
    "/",
    "/courses",
    "/courses/",
    "/teachers",
    "/teachers/",
    "/egitim-programlari",
    "/egitim-programlari/",
    "/blog",
    "/blog/",
    "/pages",
    "/pages/",
    "/iletisim",
    "/tanisma-dersi",
    "/become-instructor",
    "/llms.txt",
    "/llms-full.txt",
  ];

  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/llms.txt", "/llms-full.txt"],
        disallow: disallowedPrivateRoutes,
      },
      {
        userAgent: "GPTBot",
        allow: allowedPublicPaths,
        disallow: disallowedPrivateRoutes,
      },
      {
        userAgent: "ClaudeBot",
        allow: allowedPublicPaths,
        disallow: disallowedPrivateRoutes,
      },
      {
        userAgent: "PerplexityBot",
        allow: allowedPublicPaths,
        disallow: disallowedPrivateRoutes,
      },
      {
        userAgent: [
          "ChatGPT-User",
          "Google-Extended",
          "CCBot",
          "Applebot-Extended",
          "cohere-ai",
          "Diffbot",
        ],
        allow: allowedPublicPaths,
        disallow: disallowedPrivateRoutes,
      },
    ],
    sitemap: "https://bihocam.com/sitemap.xml",
    host: "https://bihocam.com",
  };
}
