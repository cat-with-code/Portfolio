import Link from "next/link";
import type { ReactNode } from "react";
import { SignatureLogo } from "@/components/icons";
import { SearchProvider } from "@/components/shell/search-provider";
import { SearchField, SearchIconButton } from "@/components/shell/search-triggers";
import { SidebarToggle } from "@/components/shell/sidebar-toggle";
import { ThemeToggle } from "@/components/shell/theme-toggle";
import { Badge } from "@/components/ui/badge";
import { posts } from "@/content/blog";
import { dashboardShell as copy } from "@/content/dashboard";
import { directoryProjects } from "@/content/projects";
import { DashboardMenu, DashboardNav } from "./nav";
import { DashboardSearch, ProfileMenu, type SearchDraft } from "./overlays";

/** Everything searchable besides the pages: every project and story (all drafts until publishing exists). */
const drafts: SearchDraft[] = [
  ...directoryProjects.map((p) => ({ kind: "project" as const, title: p.name, href: `/dashboard/projects/${p.key}` })),
  ...Object.values(posts).map((p) => ({ kind: "story" as const, title: p.title, href: `/dashboard/writing/${p.slug}` })),
];

/**
 * Dashboard shell (Figma Desktop / Overview 1346:2158 · Tablet 1435:7646 · Mobile 1437:11205): the portfolio's shell with
 * the "Portfolio manager" navigation. Desktop 248px sidebar (collapsible) · Tablet 72px rail · Mobile top bar + menu.
 */
export function DashboardShell({ children }: { children: ReactNode }) {
  return (
    <SearchProvider>
      <div className="flex min-h-dvh flex-col">
        <header className="sticky top-0 z-40 flex h-72 shrink-0 items-start bg-surface-primary">
          {/* Mobile */}
          <div className="flex h-72 w-full items-center justify-between px-(--layout-gutter) py-16 tablet:hidden">
            <div className="flex shrink-0 items-center gap-12">
              <Link href="/dashboard" aria-label={copy.a11y.home} className="flex shrink-0 items-center">
                <SignatureLogo className="h-36 w-[98.18px] overflow-visible" />
              </Link>
              <DashboardMenu />
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-12">
              <SearchIconButton label={copy.a11y.search} />
              <ThemeToggle label={copy.a11y.theme} />
              <ProfileMenu size={32} />
            </div>
          </div>

          {/* Tablet + Desktop */}
          <div className="hidden h-72 w-full tablet:flex">
            <div className="flex h-72 w-72 shrink-0 items-center justify-center overflow-clip border-r border-general-default bg-surface-primary py-12 desktop:w-248 desktop:justify-between desktop:gap-12 desktop:px-20">
              <Link href="/dashboard" aria-label={copy.a11y.home} className="flex shrink-0 items-center">
                <SignatureLogo className="h-[20.53px] w-56 overflow-visible desktop:h-36 desktop:w-[98.18px]" />
              </Link>
              <SidebarToggle label={copy.a11y.toggleSidebar} />
            </div>
            <div className="flex h-72 min-w-0 flex-1 items-center gap-8 overflow-clip bg-surface-primary px-24 desktop:gap-16">
              <SearchField placeholder={copy.search} />
              <div className="h-px min-w-px flex-1" />
              <ThemeToggle label={copy.a11y.theme} />
              <Badge>{copy.owner}</Badge>
              <ProfileMenu size={40} />
            </div>
          </div>
        </header>

        <div className="flex flex-1">
          <nav
            aria-label={copy.a11y.nav}
            className="sticky top-72 hidden h-[calc(100dvh-72px)] w-248 shrink-0 flex-col gap-8 overflow-y-auto border-r border-general-default bg-surface-primary p-20 transition-[width,padding] duration-(--duration-drawer) ease-figma-out tablet:flex rail:w-72 rail:px-12 rail:pt-20 rail:pb-12"
          >
            <p className="type-table-heading whitespace-nowrap text-secondary rail:hidden">{copy.manager}</p>
            <DashboardNav />
          </nav>
          <main className="min-w-0 flex-1 bg-page px-(--layout-gutter) pt-32 pb-48">{children}</main>
        </div>
      </div>
      <DashboardSearch drafts={drafts} />
    </SearchProvider>
  );
}
