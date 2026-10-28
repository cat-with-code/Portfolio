import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SiteContentProvider } from "@/components/content/site-content";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHold, RouteSkeleton } from "@/components/feedback/page-hold";
import { getOwnerContent } from "@/lib/site-content";

/** Everything the owner can edit, drafts included. Reads the session cookie, so it renders inside <Suspense>. */
async function OwnerContent({ children }: { children: ReactNode }) {
  const content = await getOwnerContent();
  if (!content) redirect("/dashboard/sign-in");
  return <SiteContentProvider value={content}>{children}</SiteContentProvider>;
}

/** Every dashboard page except Sign in sits in the Portfolio manager shell, signed in as the owner. */
export default function ManagerLayout({ children }: { children: ReactNode }) {
  return (
    <DashboardShell>
      <Suspense fallback={<RouteSkeleton variant="dashboard" label="Loading your dashboard…" />}>
        <OwnerContent>
          <PageHold variant="dashboard" label="Loading…">{children}</PageHold>
        </OwnerContent>
      </Suspense>
    </DashboardShell>
  );
}
