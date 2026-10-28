/**
 * Search and share details for the public site: the site's address, per-page titles / descriptions / canonical and
 * language links, share previews, structured data (JSON-LD), and the dashboard's "Let search engines find my
 * portfolio" switch.
 */
import "server-only";
import type { Metadata } from "next";
import { cacheLife, cacheTag } from "next/cache";
import { profile, profileLinks } from "@/content/profile";
import { locales, type Locale } from "@/i18n/dictionaries";

/** The live address: NEXT_PUBLIC_SITE_URL (your domain), else Vercel's production address, else local. */
export const siteUrl = new URL(
  process.env.NEXT_PUBLIC_SITE_URL ?? (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000")
);
export const siteName = profile.name;
export const absolute = (path: string) => new URL(path, siteUrl).toString();

/** Short descriptions of each section, as search results show them. */
export const sectionDescriptions = {
  home: "Hoeurn Dareach — UI/UX designer and developer in Phnom Penh, Cambodia. Projects, writing, study tools and games, from idea to interaction.",
  projects: "Selected UI/UX design and development work by Hoeurn Dareach, with the thinking behind each project: case studies, design systems and responsive websites.",
  blog: "The Notebook — Hoeurn Dareach’s notes on design, development, books and the ideas that shape the work.",
  study: "A focus space to learn and build: a Pomodoro timer, focus music, a reading library and a daily study plan.",
  games: "Where design meets play: classic games like chess, checkers, sudoku and 2048, built with interface design and code.",
  contact: "Contact Hoeurn Dareach about UI/UX design and web development projects — send a message and get a reply within 1–2 working days.",
};

const ogLocale: Record<Locale, string> = { en: "en_US", km: "km_KH", zh: "zh_CN" };
const hreflang: Record<Locale, string> = { en: "en", km: "km", zh: "zh-Hans" };

/** The same page in every language, for search engines (hreflang). */
export const languageLinks = (path: string) => ({
  ...Object.fromEntries(locales.map((l) => [hreflang[l], `/${l}${path}`])),
  "x-default": `/en${path}`,
});

/** Shared preview image (see app/api/og) unless the page has its own cover. */
const defaultImage = { url: "/api/og", width: 1200, height: 630, alt: `${siteName} — UI/UX designer & developer` };

/**
 * Metadata for one public page. `path` is the address after the language, e.g. "/blog/my-post" ("" for home).
 * Images that aren't full URLs must be site paths.
 */
export function pageMetadata({ lang, path, title, description, image, article }: { lang: Locale; path: string; title?: string; description: string; image?: string; article?: { published?: string; section?: string } }): Metadata {
  const url = `/${lang}${path}`;
  const images = image ? [{ url: image, alt: title ?? siteName }] : [defaultImage];
  const shareTitle = title ? `${title} · ${siteName}` : `${siteName} — Personal portfolio`;
  return {
    ...(title ? { title } : {}),
    description,
    alternates: { canonical: url, languages: languageLinks(path) },
    openGraph: {
      type: article ? "article" : "website",
      url,
      siteName,
      title: shareTitle,
      description,
      locale: ogLocale[lang],
      alternateLocale: locales.filter((l) => l !== lang).map((l) => ogLocale[l]),
      images,
      ...(article ? { publishedTime: article.published, section: article.section, authors: [absolute(`/${lang}`)] } : {}),
    },
    twitter: { card: "summary_large_image", title: shareTitle, description, images: images.map((i) => i.url) },
  };
}

/** The person behind the site, for structured data. */
export function personJsonLd(lang: Locale) {
  return {
    "@type": "Person",
    "@id": absolute("/#person"),
    name: profile.name,
    jobTitle: "UI/UX designer and developer",
    description: profile.about,
    url: absolute(`/${lang}`),
    image: absolute("/images/memoji.png"),
    address: { "@type": "PostalAddress", addressLocality: "Phnom Penh", addressCountry: "KH" },
    knowsAbout: profile.skills,
    sameAs: [profileLinks.github, profileLinks.telegram, profileLinks.instagram, profileLinks.facebook, profileLinks.x].filter(Boolean),
  };
}

/** `<script type="application/ld+json">` content, safe to put in HTML (no "</script>" breakouts). */
export const jsonLd = (data: object) => JSON.stringify({ "@context": "https://schema.org", ...data }).replace(/</g, "\\u003c");

/** Vercel preview deploys (copies of the site on other addresses) are never indexed. */
export const previewDeploy = !!process.env.VERCEL_ENV && process.env.VERCEL_ENV !== "production";

/** Whether search engines may index the site: production only, and the dashboard switch is on. */
export async function searchable() {
  return !previewDeploy && (await indexingAllowed());
}

/**
 * Dashboard switch "Let search engines find my portfolio". Read with the service key (settings are owner-only),
 * cached and refreshed when Settings are saved. On unless switched off.
 */
export async function indexingAllowed(): Promise<boolean> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  const { supabaseAdmin } = await import("@/lib/supabase/admin");
  const db = supabaseAdmin();
  if (!db) return true;
  const { data, error } = await db.from("settings").select("prefs").eq("id", 1).maybeSingle();
  if (error) return true;
  return (data?.prefs as Record<string, unknown> | undefined)?.indexing !== false;
}
