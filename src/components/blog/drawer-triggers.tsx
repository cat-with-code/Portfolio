"use client";

import type { ReactNode } from "react";
import { ArrowRightIcon, BookOpenIcon } from "@/components/icons";
import { useDrawer, type DrawerKind } from "@/components/shell/drawer-provider";

/** A plain button that opens one of the Blog drawers (Browse all posts, View book library). */
export function OpenDrawer({ kind, className, children }: { kind: DrawerKind; className: string; children: ReactNode }) {
  const { setOpen } = useDrawer();
  return (
    <button type="button" onClick={() => setOpen(kind)} className={`cursor-pointer ${className}`}>
      {children}
    </button>
  );
}

/** Mobile / View book library button: full-width outline pill with a book icon and an arrow. */
export function LibraryButton({ label }: { label: string }) {
  return (
    <OpenDrawer
      kind="book-library"
      className="type-mobile-label flex h-48 w-full items-center justify-center gap-8 rounded-full border border-general-default bg-surface-primary px-20 text-primary transition-colors duration-(--duration-fast) hover:bg-surface-hover tablet:hidden"
    >
      <BookOpenIcon className="text-icon-general-primary" />
      {label}
      <ArrowRightIcon className="text-icon-general-primary" />
    </OpenDrawer>
  );
}
