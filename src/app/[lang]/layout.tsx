import type { Metadata } from "next";
import { AppShell } from "@/components/shell/app-shell";
import { getDictionary, getLocale, locales } from "@/i18n/dictionaries";
import { bootScript, fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Hoeurn Dareach — Personal portfolio", template: "%s · Hoeurn Dareach" },
  description: "Design, code, writing, study and games by Hoeurn Dareach.",
};

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
        <AppShell lang={lang} dict={dict}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
