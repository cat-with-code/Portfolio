import type { ReactNode } from "react";
import { SiteContentProvider } from "@/components/content/site-content";
import { DashboardShell } from "@/components/dashboard/shell";
import { getSiteContent } from "@/lib/site-content";

/** Every dashboard page except Sign in sits in the Portfolio manager shell. */
export default async function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <SiteContentProvider value={await getSiteContent()}>
      <DashboardShell>{children}</DashboardShell>
    </SiteContentProvider>
  );
}
