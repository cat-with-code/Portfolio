import Link from "next/link";
import type { Metadata } from "next";
import { SiteContentProvider } from "@/components/content/site-content";
import { PageHold } from "@/components/feedback/page-hold";
import { AppShell } from "@/components/shell/app-shell";
import { ThemeRestore } from "@/components/shell/theme-toggle";
import { getSiteContent } from "@/lib/site-content";
import { sitePrefs } from "@/lib/site-prefs";
import { getDictionary, getLocale, locales } from "@/i18n/dictionaries";
import { searchable, sectionMeta, siteName, siteTitle, siteUrl } from "@/lib/seo";
import { bootScript, firstPaintStyle, fontVariables } from "../fonts";
import "../globals.css";

/** Site-wide defaults; each page adds its own title, description, canonical and language links (lib/seo). */
export async function generateMetadata(): Promise<Metadata> {
  const [index, lang] = await Promise.all([searchable(), getLocale()]);
  return {
    metadataBase: siteUrl,
    title: { default: siteTitle(lang), template: `%s · ${siteName}` },
    description: sectionMeta(lang, "home").description,
    applicationName: siteName,
    authors: [{ name: siteName, url: siteUrl.toString() }],
    creator: siteName,
    keywords: ["Hoeurn Dareach", "UI/UX designer", "web developer", "Phnom Penh", "Cambodia", "portfolio", "design systems", "Next.js"],
    robots: index ? { index: true, follow: true, googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 } } : { index: false, follow: false },
    formatDetection: { telephone: false, email: false, address: false },
  };
}

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const lang = await getLocale();
  const dict = await getDictionary();
  return (
    // No data-theme here: bootScript sets it from the visitor's choice before the page paints. Writing it in JSX would
    // reset dark mode to light whenever this layout is rebuilt (switching language does that).
    <html lang={lang} className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        {/* Paint the theme's background before the stylesheet arrives, so opening the site never flashes white in dark mode */}
        <style dangerouslySetInnerHTML={{ __html: firstPaintStyle }} />
        {/* Noto Sans SC is split into ~300 files, too many to self-host via next/font — load it from Google Fonts on Chinese pages only */}
        {lang === "zh" && (
          <>
            <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
            {/* eslint-disable-next-line @next/next/no-page-custom-font */}
            <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;600&display=swap" />
          </>
        )}
      </head>
      <body>
        <ThemeRestore />
        <SiteContentProvider value={{ ...(await getSiteContent(lang)), readingTime: (await sitePrefs()).readingTime }}>
        <AppShell lang={lang} dict={dict}>
          {lang !== "en" && (
            // Honest about machine translation, with the original one tap away
            <p lang={lang} className="type-caption -mt-16 mb-16 flex flex-wrap items-center gap-x-8 text-muted tablet:-mt-20">
              <span>{dict.translated.note}</span>
              <span aria-hidden>·</span>
              <Link href="/en" hrefLang="en" lang="en" className="text-brand underline-offset-2 hover:underline">
                {dict.translated.link}
              </Link>
            </p>
          )}
          <PageHold variant="site" label={dict.loading}>{children}</PageHold>
        </AppShell>
        </SiteContentProvider>
      </body>
    </html>
  );
}
