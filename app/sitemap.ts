import type { MetadataRoute } from "next";
import { schemas } from "@/lib/creators";
import { siteUrl as baseUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const creatorPages: MetadataRoute.Sitemap = schemas.map((schema) => ({
    url: `${baseUrl}/taller/${schema.slug}`,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  return [
    {
      url: baseUrl,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${baseUrl}/taller`,
      changeFrequency: "monthly",
      priority: 0.9,
    },
    ...creatorPages,
    {
      url: `${baseUrl}/taller/recursos`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/mesa`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/comunidad`,
      changeFrequency: "weekly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];
}
