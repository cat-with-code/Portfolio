"use client";

import * as Dialog from "@radix-ui/react-dialog";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, type ComponentType, type SVGProps } from "react";
import { ArrowUpRightIcon, BlogIcon, CloseIcon, GamesIcon, GridIcon, ImageIcon, MailIcon, MenuIcon, ProjectsIcon, SettingsIcon, StudyIcon } from "@/components/icons";
import { itemClasses } from "@/components/shell/nav-links";
import { DrawerHeader } from "@/components/ui/drawer-header";
import { IconButton } from "@/components/ui/icon-button";
import { dashboardNav, dashboardShell as copy, type DashboardNavKey } from "@/content/dashboard";
import { useUnread } from "./unread";

const icons: Record<DashboardNavKey | "settings" | "portfolio", ComponentType<SVGProps<SVGSVGElement>>> = {
  overview: GridIcon,
  projects: ProjectsIcon,
  writing: BlogIcon,
  study: StudyIcon,
  games: GamesIcon,
  media: ImageIcon,
  inbox: MailIcon,
  portfolio: ArrowUpRightIcon,
  settings: SettingsIcon,
};

const base = "/dashboard";

/** Sidebar navigation (Figma Dashboard / Rail item 1371:138058, Navigation item 51:11). `allowRail` is false in the mobile menu. */
export function DashboardNav({ allowRail = true, onNavigate }: { allowRail?: boolean; onNavigate?: () => void }) {
  const pathname = usePathname();
  const unread = useUnread();
  const active = (path: string) => (path ? pathname === base + path || pathname.startsWith(`${base}${path}/`) : pathname === base);

  const item = (key: DashboardNavKey | "settings" | "portfolio", label: string, href: string, current: boolean, { external = false, className = "" } = {}) => {
    const Icon = icons[key];
    const c = itemClasses(current, allowRail);
    return (
      <li key={key} className={className}>
        <Link
          href={href}
          aria-current={current ? "page" : undefined}
          title={label}
          onClick={onNavigate}
          target={external ? "_blank" : undefined}
          rel={external ? "noopener noreferrer" : undefined}
          className={c.root}
        >
          <span className={c.indicator} />
          <span className={c.content}>
            <span className="relative flex shrink-0">
              <Icon className={`size-20 ${c.icon}`} />
              {key === "inbox" && unread > 0 && (
                <>
                  {/* New messages waiting: a red dot on the mail icon */}
                  <span aria-hidden className="absolute -top-2 -right-2 size-8 rounded-full bg-status-error ring-2 ring-(--color-bg-surface-primary)" />
                  <span className="sr-only">{copy.unread(unread)}</span>
                </>
              )}
            </span>
            <span className={c.label}>{label}</span>
          </span>
        </Link>
      </li>
    );
  };

  return (
    <>
      <ul className="flex flex-col gap-8">{dashboardNav.map((n) => item(n.key, n.label, base + n.path, active(n.path)))}</ul>
      <ul className="mt-auto flex flex-col gap-8">
        {/* The rail (tablet) keeps only Settings at the bottom */}
        {item("portfolio", copy.viewPortfolio, "/", false, { external: true, className: allowRail ? "rail:hidden" : "" })}
        {item("settings", copy.settings, `${base}/settings`, active("/settings"))}
      </ul>
    </>
  );
}

/** Mobile / Menu drawer (Figma 1439:18089): the same sheet as the portfolio's menu, with the dashboard pages. */
export function DashboardMenu() {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <IconButton aria-label={copy.a11y.openMenu} size={32} surface="secondary" bordered={false}>
          <MenuIcon />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay-scrim backdrop-blur-backdrop data-[state=closed]:animate-scrim-out data-[state=open]:animate-scrim-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-320 flex-col gap-24 overflow-clip rounded-r-shell bg-surface-primary p-24 shadow-sheet outline-none data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in"
        >
          <DrawerHeader
            title={<Dialog.Title>{copy.menu}</Dialog.Title>}
            close={
              <Dialog.Close asChild>
                <IconButton aria-label={copy.a11y.closeMenu} surface="secondary">
                  <CloseIcon />
                </IconButton>
              </Dialog.Close>
            }
          />
          <nav aria-label={copy.a11y.nav} className="flex min-h-0 w-full flex-1 flex-col gap-8 overflow-y-auto">
            <p className="type-table-heading whitespace-nowrap text-secondary">{copy.manager}</p>
            <DashboardNav allowRail={false} onNavigate={() => setOpen(false)} />
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
