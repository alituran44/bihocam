import type { NextConfig } from "next";

const securityHeaders = [
  {
    key: "Content-Security-Policy",
    value:
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval' https://www.paytr.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: http: https:; font-src 'self' data:; connect-src 'self' http://localhost:6767 http://localhost:8000 http://127.0.0.1:8000 https://api-bihocam.summarify.io ws://localhost:3454 ws://localhost:3000; frame-src 'self' https://www.paytr.com https://view.officeapps.live.com https://www.youtube.com https://player.vimeo.com; media-src 'self' http://localhost:6767 http://localhost:8000 http://127.0.0.1:8000 https://api-bihocam.summarify.io blob:;",
  },
  {
    key: "X-Content-Type-Options",
    value: "nosniff",
  },
  {
    key: "X-Frame-Options",
    value: "SAMEORIGIN",
  },
  {
    key: "X-XSS-Protection",
    value: "1; mode=block",
  },
  {
    key: "Referrer-Policy",
    value: "strict-origin-when-cross-origin",
  },
];

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    "https://bihocam.summarify.io",
    "http://16.170.218.212",
  ],
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: securityHeaders,
      },
    ];
  },
};

export default nextConfig;
