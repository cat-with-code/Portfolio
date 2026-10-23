"use client";

import { Avatar } from "@/components/ui/avatar";
import { useDrawer } from "./drawer-provider";

/** Reach avatar in the top bar: opens the Developer profile drawer. */
export function AvatarButton({ label, size }: { label: string; size: 32 | 40 }) {
  const { setOpen } = useDrawer();
  return (
    <button type="button" aria-label={label} onClick={() => setOpen("profile")} className="shrink-0 cursor-pointer rounded-full">
      <Avatar size={size} />
    </button>
  );
}
