"use client";

import { useSiteContent } from "@/components/content/site-content";
import { ArrowRightIcon, BookOpenIcon } from "@/components/icons";
import { useDrawer } from "@/components/shell/drawer-provider";

/** Study / Favorite books button (1286:110254): opens the Book Library; the badge counts the books. */
export function FavoriteBooksButton({ label, className = "" }: { label: string; className?: string }) {
  const { setOpen } = useDrawer();
  const { books } = useSiteContent();
  return (
    <button
      type="button"
      onClick={() => setOpen("book-library")}
      className={`type-label flex h-44 shrink-0 cursor-pointer items-center justify-center gap-8 rounded-full bg-brand py-12 pr-12 pl-16 text-on-brand transition-[background-color,filter] duration-(--duration-fast) hover:bg-brand-hover hover:drop-shadow-[0_6px_8px_rgba(28,77,217,0.28)] ${className}`}
    >
      <BookOpenIcon />
      {label}
      <span className="type-table-heading flex min-w-24 items-center justify-center rounded-full bg-surface-primary px-8 py-2 text-brand">{books.length}</span>
    </button>
  );
}

/** "View book library ↗" pill (desktop / tablet) and the full-width mobile button. */
export function LibraryLink({ label, mobileLabel }: { label: string; mobileLabel: string }) {
  const { setOpen } = useDrawer();
  return (
    <>
      <button
        type="button"
        onClick={() => setOpen("book-library")}
        className="type-label hidden h-40 shrink-0 cursor-pointer items-center rounded-shell bg-surface-primary px-19 whitespace-pre text-brand hover:bg-surface-hover tablet:flex"
      >
        {label}
      </button>
      <button
        type="button"
        onClick={() => setOpen("book-library")}
        className="type-mobile-label flex h-48 w-full cursor-pointer items-center justify-center gap-8 rounded-shell border border-general-default bg-surface-primary px-20 text-primary hover:bg-surface-hover tablet:hidden"
      >
        <BookOpenIcon className="text-icon-general-primary" />
        {mobileLabel}
        <ArrowRightIcon className="text-icon-general-primary" />
      </button>
    </>
  );
}
