/**
 * Search and share details for the public site: the site's address, per-page titles / descriptions / canonical and
 * language links, share previews, structured data (JSON-LD), and the dashboard's "Let search engines find my
 * portfolio" switch.
 */
import "server-only";
import type { Metadata } from "next";
import { profile, profileLinks } from "@/content/profile";
import { tr } from "@/i18n/content";
import { sitePrefs } from "@/lib/site-prefs";
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

type Section = "home" | "projects" | "blog" | "study" | "games" | "contact";
/** Search-result titles and descriptions per language (English above; Khmer and Chinese written to read naturally). */
const sectionText: Record<Locale, { site: string; titles: Record<Exclude<Section, "home">, string>; descriptions: Record<Section, string> }> = {
  en: {
    site: `${siteName} — UI/UX designer & developer`,
    titles: { projects: "Projects", blog: "The Notebook — Blog", study: "Study", games: "Games", contact: "Contact" },
    descriptions: sectionDescriptions,
  },
  km: {
    site: `${siteName} — អ្នករចនា UI/UX និងអ្នកអភិវឌ្ឍ`,
    titles: { projects: "គម្រោង", blog: "សៀវភៅកត់ត្រា — អត្ថបទ", study: "សិក្សា", games: "ហ្គេម", contact: "ទំនាក់ទំនង" },
    descriptions: {
      home: "Hoeurn Dareach — អ្នករចនា UI/UX និងអ្នកអភិវឌ្ឍគេហទំព័រ នៅភ្នំពេញ ប្រទេសកម្ពុជា។ គម្រោង អត្ថបទ ឧបករណ៍សិក្សា និងហ្គេម ពីគំនិតដល់អន្តរកម្ម។",
      projects: "ការងាររចនា UI/UX និងការអភិវឌ្ឍដែលបានជ្រើសរើសរបស់ Hoeurn Dareach ព្រមទាំងការគិតនៅពីក្រោយគម្រោងនីមួយៗ៖ ករណីសិក្សា ប្រព័ន្ធរចនា និងគេហទំព័របត់បែន។",
      blog: "សៀវភៅកត់ត្រា — កំណត់ត្រារបស់ Hoeurn Dareach អំពីការរចនា ការអភិវឌ្ឍ សៀវភៅ និងគំនិតដែលបង្កើតជាការងារ។",
      study: "កន្លែងផ្តោតអារម្មណ៍សម្រាប់រៀន និងបង្កើត៖ នាឡិកា Pomodoro តន្ត្រីផ្តោតអារម្មណ៍ បណ្ណាល័យសៀវភៅ និងផែនការសិក្សាប្រចាំថ្ងៃ។",
      games: "កន្លែងដែលការរចនាជួបនឹងការលេង៖ ហ្គេមបុរាណដូចជា Chess, Checkers, Sudoku និង 2048 ដែលបង្កើតឡើងដោយការរចនាចំណុចប្រទាក់ និងកូដ។",
      contact: "ទាក់ទង Hoeurn Dareach អំពីគម្រោងរចនា UI/UX និងអភិវឌ្ឍគេហទំព័រ — ផ្ញើសារ ហើយទទួលការឆ្លើយតបក្នុងរយៈពេល 1–2 ថ្ងៃធ្វើការ។",
    },
  },
  zh: {
    site: `${siteName} — UI/UX 设计师与开发者`,
    titles: { projects: "项目", blog: "笔记本 — 博客", study: "学习", games: "游戏", contact: "联系" },
    descriptions: {
      home: "Hoeurn Dareach——柬埔寨金边的 UI/UX 设计师与网页开发者。项目、文章、学习工具和小游戏，从想法到交互。",
      projects: "Hoeurn Dareach 精选的 UI/UX 设计与开发作品，以及每个项目背后的思考：案例研究、设计系统和响应式网站。",
      blog: "笔记本——Hoeurn Dareach 关于设计、开发、阅读，以及塑造作品的那些想法的笔记。",
      study: "一个用来学习和创造的专注空间：番茄钟、专注音乐、书库和每日学习计划。",
      games: "当设计遇上游戏：国际象棋、跳棋、数独、2048 等经典游戏，用界面设计和代码重新打造。",
      contact: "联系 Hoeurn Dareach 洽谈 UI/UX 设计和网页开发项目——发送留言，1–2 个工作日内回复。",
    },
  },
};

/** Title and description of a section page in `lang` (home has no title of its own: the site title is used). */
export function sectionMeta(lang: Locale, section: Section) {
  const t = sectionText[lang] ?? sectionText.en;
  return { ...(section === "home" ? {} : { title: t.titles[section] }), description: t.descriptions[section] };
}
export const siteTitle = (lang: Locale) => (sectionText[lang] ?? sectionText.en).site;

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
  const images = image ? [{ url: image, alt: title ?? siteName }] : [{ ...defaultImage, alt: siteTitle(lang) }];
  const shareTitle = title ? `${title} · ${siteName}` : siteTitle(lang);
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
    jobTitle: { en: "UI/UX designer and developer", km: "អ្នករចនា UI/UX និងអ្នកអភិវឌ្ឍ", zh: "UI/UX 设计师与开发者" }[lang],
    description: tr(lang, "profile").about,
    url: absolute(`/${lang}`),
    image: absolute("/images/memoji.png"),
    address: { "@type": "PostalAddress", addressLocality: "Phnom Penh", addressCountry: "KH" },
    knowsAbout: tr(lang, "profile").skills,
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

/** Dashboard switch "Let search engines find my portfolio" (see lib/site-prefs). */
export async function indexingAllowed(): Promise<boolean> {
  return (await sitePrefs()).indexing;
}
