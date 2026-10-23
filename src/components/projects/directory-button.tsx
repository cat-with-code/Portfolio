"use client";

import type { ReactNode } from "react";
import { useDrawer } from "@/components/shell/drawer-provider";
import { Button } from "@/components/ui/button";

/** Opens the "All projects" directory drawer (Figma 694:22672). */
export function DirectoryButton({ children }: { children: ReactNode }) {
  const { setOpen } = useDrawer();
  return (
    <Button variant="secondary" size="small" onClick={() => setOpen("projects")}>
      {children}
    </Button>
  );
}

/** Projects / Closing caption (694:22596) — the arrow points at the directory, so the line opens it. */
export function DirectoryCaption({ children, className = "" }: { children: ReactNode; className?: string }) {
  const { setOpen } = useDrawer();
  return (
    <button
      type="button"
      onClick={() => setOpen("projects")}
      className={`type-eyebrow w-full cursor-pointer text-left whitespace-pre-wrap text-secondary transition-colors duration-(--duration-fast) hover:text-brand ${className}`}
    >
      {children}
    </button>
  );
}
