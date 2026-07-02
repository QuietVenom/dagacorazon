import type { MetadataRoute } from "next";
import { siteUrl as baseUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/api/", "/entrar"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
