import type { MetadataRoute } from "next";
import { gameOrder } from "@/content/games";
import { locales } from "@/i18n/dictionaries";
import { getSiteContent } from "@/lib/site-content";
import { absolute, languageLinks } from "@/lib/seo";

/**
 * sitemap.xml: every published page in every language, each listing its other languages. New posts and projects
 * appear as soon as they're published (the content cache refreshes on publish).
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { posts, caseStudies } = await getSiteContent();
  const pages: { path: string; modified?: string; priority: number; freq: "weekly" | "monthly" }[] = [
    { path: "", priority: 1, freq: "weekly" },
    { path: "/projects", priority: 0.9, freq: "monthly" },
    { path: "/blog", priority: 0.9, freq: "weekly" },
    { path: "/study", priority: 0.6, freq: "monthly" },
    { path: "/games", priority: 0.6, freq: "monthly" },
    { path: "/contact", priority: 0.7, freq: "monthly" },
    ...caseStudies.map((s) => ({ path: `/projects/${s.key}`, priority: 0.8, freq: "monthly" as const })),
    ...Object.values(posts).map((p) => ({ path: `/blog/${p.slug}`, modified: p.published, priority: 0.7, freq: "monthly" as const })),
    ...gameOrder.map((k) => ({ path: `/games/${k}`, priority: 0.4, freq: "monthly" as const })),
  ];
  return pages.flatMap((p) =>
    locales.map((lang) => ({
      url: absolute(`/${lang}${p.path}`),
      ...(p.modified ? { lastModified: p.modified } : {}),
      changeFrequency: p.freq,
      priority: lang === "en" ? p.priority : Math.round(p.priority * 0.8 * 10) / 10,
      alternates: { languages: Object.fromEntries(Object.entries(languageLinks(p.path)).map(([k, v]) => [k, absolute(v)])) },
    }))
  );
}
