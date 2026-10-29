import { redirect } from "next/navigation";
import { Suspense, type ReactNode } from "react";
import { SiteContentProvider } from "@/components/content/site-content";
import { DashboardShell } from "@/components/dashboard/shell";
import { PageHold, RouteSkeleton } from "@/components/feedback/page-hold";
import { UnreadSync } from "@/components/dashboard/unread";
import { getOwnerContent } from "@/lib/site-content";
import { getOwner } from "@/lib/supabase/server";

/** Everything the owner can edit, drafts included. Reads the session cookie, so it renders inside <Suspense>. */
async function OwnerContent({ children }: { children: ReactNode }) {
  const [content, owner] = await Promise.all([getOwnerContent(), getOwner()]);
  if (!content || !owner) redirect("/dashboard/sign-in");
  // Unread, not archived: drives the red dot on Inbox in the navigation.
  const { count } = await owner.supabase.from("messages").select("id", { count: "exact", head: true }).eq("read", false).eq("archived", false);
  return (
    <SiteContentProvider value={content}>
      <UnreadSync count={count ?? 0} />
      {children}
    </SiteContentProvider>
  );
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
