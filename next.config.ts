import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN: Do not use this in production
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
