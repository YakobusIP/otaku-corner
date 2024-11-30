import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/anime`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/manga`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    },
    {
      url: `${process.env.NEXT_PUBLIC_WEBSITE_URL}/light-novel`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8
    }
  ];
}
