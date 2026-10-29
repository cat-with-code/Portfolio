import type { Metadata } from "next";
import type { ReactNode } from "react";
import { bootScript, firstPaintStyle, fontVariables } from "../fonts";
import "../globals.css";

export const metadata: Metadata = {
  title: { default: "Dashboard · Hoeurn Dareach", template: "%s · Dashboard" },
  robots: { index: false, follow: false },
};

/** Dashboard root layout: its own html/body (outside the /[lang] site), English only. The sidebar shell is in (manager)/layout. */
export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" data-theme="light" data-theme-mode="light" className={fontVariables} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: bootScript }} />
        <style dangerouslySetInnerHTML={{ __html: firstPaintStyle }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  );
}
