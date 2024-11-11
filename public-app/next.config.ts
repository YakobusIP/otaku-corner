import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        port: ""
      },
      {
        protocol: process.env.NODE_ENV === "production" ? "https" : "http",
        hostname:
          process.env.NODE_ENV === "production"
            ? process.env.NEXT_PUBLIC_AXIOS_BASE_URL
            : "localhost",
        port: process.env.NODE_ENV === "production" ? "" : "5000"
      }
    ]
  }
};

export default nextConfig;
