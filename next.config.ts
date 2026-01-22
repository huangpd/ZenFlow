import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  experimental: {
    serverActions: {
      allowedOrigins: ["www.zenflow.top", "zenflow.top", "localhost:3000"]
    }
  }
};

export default nextConfig;
