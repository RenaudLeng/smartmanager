import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN: Do not use this in production
    ignoreBuildErrors: true,
  },
  // Autoriser les connexions réseau
  serverExternalPackages: []
};

export default nextConfig;
