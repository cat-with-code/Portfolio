import type { ReactNode } from "react";

/** Portfolio / Drawer header (Figma 86:11): title (Typography/Card title) + a 44px close Icon button, gap 16. */
export function DrawerHeader({ title, close }: { title: ReactNode; close: ReactNode }) {
  return (
    <div className="flex h-44 w-full shrink-0 items-center gap-16 overflow-clip">
      <div className="type-card-title min-w-0 flex-1 text-primary">{title}</div>
      {close}
    </div>
  );
}
