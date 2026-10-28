import { RouteSkeleton } from "@/components/feedback/page-hold";

/** Shown while a dashboard page loads its data (drafts included) from the database: a skeleton of that page. */
export default function Loading() {
  return <RouteSkeleton variant="dashboard" label="Loading…" />;
}
