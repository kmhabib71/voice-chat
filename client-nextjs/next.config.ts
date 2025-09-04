import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable turbopack to avoid fatal errors
  experimental: {
    turbo: undefined
  },
  // Set correct root directory to avoid workspace warnings
  turbopack: {
    root: process.cwd()
  },
  // Ensure proper TypeScript handling
  typescript: {
    ignoreBuildErrors: false,
  },
  // Configure for development
  reactStrictMode: true,
  poweredByHeader: false
};

export default nextConfig;
