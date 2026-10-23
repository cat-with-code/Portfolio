"use client";

import { PanelIcon } from "@/components/icons";

/** Sidebar header toggle (Desktop only). Collapsed state lives on <html data-sidebar> so CSS can lay out before hydration. */
export function SidebarToggle({ label }: { label: string }) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={() => {
        const root = document.documentElement;
        const collapsed = root.dataset.sidebar !== "collapsed";
        if (collapsed) root.dataset.sidebar = "collapsed";
        else delete root.dataset.sidebar;
        try {
          localStorage.setItem("sidebar", collapsed ? "collapsed" : "expanded");
        } catch {}
      }}
      className="hidden size-24 shrink-0 cursor-pointer text-icon-general-primary desktop:block"
    >
      <PanelIcon className="transition-transform duration-(--duration-drawer) ease-figma-out in-data-[sidebar=collapsed]:rotate-180" />
    </button>
  );
}
