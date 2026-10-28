import type { Metadata } from "next";
import { SiteContentProvider } from "@/components/content/site-content";
import { PageHold } from "@/components/feedback/page-hold";
import { AppShell } from "@/components/shell/app-shell";
import { getSiteContent } from "@/lib/site-content";
import { getDictionary, getLocale, locales } from "@/i18n/dictionaries";
import { searchable, sectionDescriptions, siteName, siteUrl } from "@/lib/seo";
import { bootScript, fontVariables } from "../fonts";
import "../globals.css";

/** Site-wide defaults; each page adds its own title, description, canonical and language links (lib/seo). */
export async function generateMetadata(): Promise<Metadata> {
  const index = await searchable();
  return {
    metadataBase: siteUrl,
    title: { default: `${siteName} — UI/UX designer & developer`, template: `%s · ${siteName}` },
    description: sectionDescriptions.home,
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
    <html lang={lang} data-theme="light" data-theme-mode="light" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
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
        <SiteContentProvider value={await getSiteContent()}>
        <AppShell lang={lang} dict={dict}>
          <PageHold variant="site" label={dict.loading}>{children}</PageHold>
        </AppShell>
        </SiteContentProvider>
      </body>
    </html>
  );
}
