import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  compress: true,
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: ["lucide-react", "framer-motion", "@tanstack/react-query"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  allowedDevOrigins: [
    "https://bihocam.summarify.io",
    "https://bihocam.com",
    "https://www.bihocam.com",
    "http://16.170.218.212",
    "http://13.53.172.136",
    "http://ec2-13-53-172-136.eu-north-1.compute.amazonaws.com",
  ],
};

export default nextConfig;
