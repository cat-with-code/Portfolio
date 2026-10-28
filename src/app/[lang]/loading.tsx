import { RouteSkeleton } from "@/components/feedback/page-hold";
import { getDictionary } from "@/i18n/dictionaries";

/** Shown while a page loads (inside the site's shell): a skeleton in that page's own layout. */
export default async function Loading() {
  const dict = await getDictionary();
  return <RouteSkeleton variant="site" label={dict.loading} />;
}
