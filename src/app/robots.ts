import type { MetadataRoute } from "next";
import { absolute, indexingAllowed, previewDeploy } from "@/lib/seo";

/**
 * robots.txt. Preview deploys are closed to crawlers entirely. Production stays open even when the dashboard switch
 * "Let search engines find my portfolio" is off: then every page says "noindex", and crawlers must be able to read
 * that to drop pages they already know. The dashboard isn't listed on purpose — it already says "noindex", and naming
 * it here would only advertise it.
 */
export default async function robots(): Promise<MetadataRoute.Robots> {
  if (previewDeploy) return { rules: { userAgent: "*", disallow: "/" } };
  // The share image lives under /api, and social apps check robots.txt before showing it.
  const rules = { userAgent: "*", allow: ["/", "/api/og"], disallow: "/api/" };
  return (await indexingAllowed()) ? { rules, sitemap: absolute("/sitemap.xml") } : { rules };
}
