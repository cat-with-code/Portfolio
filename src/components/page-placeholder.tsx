import { getDictionary } from "@/i18n/dictionaries";
import type { NavKey } from "@/lib/site";

/** Temporary page body until each page is built from its Figma frame. */
export async function PagePlaceholder({ page }: { page: NavKey }) {
  const dict = await getDictionary();
  return (
    <section className="flex flex-col gap-4 pb-64">
      <h1 className="type-page-title text-primary">{dict.nav[page]}</h1>
    </section>
  );
}
