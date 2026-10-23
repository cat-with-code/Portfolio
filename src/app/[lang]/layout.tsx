import type { Metadata } from "next";
import { Inter, Noto_Sans_Khmer } from "next/font/google";
import localFont from "next/font/local";
import { AppShell } from "@/components/shell/app-shell";
import { getDictionary, getLocale, locales } from "@/i18n/dictionaries";
import "../globals.css";

const inter = Inter({ variable: "--font-latin", subsets: ["latin"], weight: ["400", "500", "600", "700"] });
// Inter's arrows (← → ↗ …) are outside Google's "latin" subset; this tiny Inter subset covers them.
const interArrows = localFont({ src: "../../fonts/inter-arrows.woff2", variable: "--font-arrows", weight: "400 700", display: "swap", adjustFontFallback: false });
const notoKhmer = Noto_Sans_Khmer({ variable: "--font-khmer", subsets: ["khmer"], weight: ["400", "500", "600"] });

export const metadata: Metadata = {
  title: { default: "Hoeurn Dareach — Personal portfolio", template: "%s · Hoeurn Dareach" },
  description: "Design, code, writing, study and games by Hoeurn Dareach.",
};

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

// Runs before paint so the saved theme and sidebar state never flash.
// Default is Light, matching the prototype; System follows the device.
const bootScript = `(function(){var r=document.documentElement;try{var m=localStorage.getItem("theme")||"light";r.dataset.themeMode=m;if(m==="system"){delete r.dataset.theme}else{r.dataset.theme=m}if(localStorage.getItem("sidebar")==="collapsed")r.dataset.sidebar="collapsed"}catch(e){}})()`;

export default async function RootLayout({ children }: LayoutProps<"/[lang]">) {
  const lang = await getLocale();
  const dict = await getDictionary();
  return (
    <html lang={lang} data-theme="light" data-theme-mode="light" className={`${interArrows.variable} ${inter.variable} ${notoKhmer.variable}`} suppressHydrationWarning>
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
