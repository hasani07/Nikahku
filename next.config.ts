import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // izinkan upload dokumen (scan KTP, KK, dll) sampai 5 MB
    serverActions: { bodySizeLimit: "5mb" },
  },
};

export default nextConfig;
