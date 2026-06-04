import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "myanimelist.net",
        port: ""
      },
      {
        protocol: "https",
        hostname: "cdn.myanimelist.net",
        port: ""
      },
      {
        protocol: "https",
        hostname: process.env.NEXT_PUBLIC_R2_HOSTNAME,
        port: ""
      }
    ]
  },
  rewrites: async () => [
    {
      source: "/sitemap-anime-:id.xml",
      destination: "/sitemaps.xml/anime/:id"
    },
    {
      source: "/sitemap-manga-:id.xml",
      destination: "/sitemaps.xml/manga/:id"
    },
    {
      source: "/sitemap-light-novel-:id.xml",
      destination: "/sitemaps.xml/light-novel/:id"
    }
  ]
};

export default nextConfig;
