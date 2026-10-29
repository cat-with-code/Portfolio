import Link from "next/link";
import { Suspense, type ReactNode } from "react";
import { SignatureLogo } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import type { Dictionary } from "@/i18n/dictionaries";
import { LangProvider } from "@/i18n/lang-context";
import { BrowseDrawer, PostDrawer } from "@/components/blog/blog-drawers";
import { BriefDrawer, LibraryDrawer } from "@/components/blog/book-drawers";
import { ApproachDrawer } from "@/components/developer/approach-drawer";
import { GameLibraryDrawer } from "@/components/games/library-drawer";
import { FloatingReader } from "@/components/reader/floating-reader";
import { ReaderProvider } from "@/components/reader/reader-provider";
import { SettingsDrawer } from "@/components/settings/settings-drawer";
import { MiniPlayer } from "@/components/study/mini-player";
import { StudyProvider } from "@/components/study/study-provider";
import { AvatarButton } from "./avatar-button";
import { DrawerProvider } from "./drawer-provider";
import { MobileMenu } from "./mobile-menu";
import { NavLinks } from "./nav-links";
import { ProfileDrawer } from "./profile-drawer";
import { ProjectsDrawer } from "./projects-drawer";
import { SearchDialog } from "./search-dialog";
import { SearchProvider } from "./search-provider";
import { SearchField, SearchIconButton } from "./search-triggers";
import { SidebarToggle } from "./sidebar-toggle";
import { ThemeToggle } from "./theme-toggle";

/**
 * Portfolio shell from the Prototype page:
 * Desktop ≥1280 — 248px sidebar (collapsible to a 72px rail) · Tablet 768–1279 — 72px rail · Mobile <768 — top bar + menu drawer.
 */
export function AppShell({ lang, dict, children }: { lang: string; dict: Dictionary; children: ReactNode }) {
  const home = `/${lang}`;
  return (
    <LangProvider lang={lang}>
    <DrawerProvider>
    <SearchProvider>
    {/* Study music and the text reader live here so they keep playing across pages. */}
    <StudyProvider>
    <ReaderProvider>
      <div className="flex min-h-dvh flex-col">
        {/* Fixed portfolio header */}
        <header className="sticky top-0 z-40 flex h-72 shrink-0 items-start bg-surface-primary">
          {/* Mobile: Top bar Layout=Mobile */}
          <div className="flex h-72 w-full items-center justify-between px-(--layout-gutter) py-16 tablet:hidden">
            <div className="flex shrink-0 items-center gap-12">
              <Link href={home} aria-label={dict.a11y.home} className="flex shrink-0 items-center">
                <SignatureLogo className="h-36 w-[98.18px] overflow-visible" />
              </Link>
              <MobileMenu lang={lang} labels={dict.nav} openLabel={dict.a11y.openMenu} closeLabel={dict.a11y.closeMenu} />
            </div>
            <div className="flex min-w-0 flex-1 items-center justify-end gap-12">
              <SearchIconButton label={dict.a11y.search} />
              <ThemeToggle label={dict.a11y.theme} />
              <AvatarButton label={dict.a11y.profile} size={32} />
            </div>
          </div>

          {/* Tablet + Desktop: Sidebar header + Top bar */}
          <div className="hidden h-72 w-full tablet:flex">
            <div className="flex h-72 w-72 shrink-0 items-center justify-center overflow-clip border-r border-general-default bg-surface-primary py-12 desktop:w-248 desktop:justify-between desktop:gap-12 desktop:px-20">
              <Link href={home} aria-label={dict.a11y.home} className="flex shrink-0 items-center">
                <SignatureLogo className="h-[20.53px] w-56 overflow-visible desktop:h-36 desktop:w-[98.18px]" />
              </Link>
              <SidebarToggle label={dict.a11y.toggleSidebar} />
            </div>
            <div className="flex h-72 min-w-0 flex-1 items-center gap-8 overflow-clip bg-surface-primary px-24 desktop:gap-16">
              <SearchField placeholder={dict.search.placeholder} />
              <div className="h-px min-w-px flex-1" />
              <ThemeToggle label={dict.a11y.theme} />
              <Badge>{dict.owner.name}</Badge>
              <AvatarButton label={dict.a11y.profile} size={40} />
            </div>
          </div>
        </header>

        {/* Portfolio body */}
        <div className="flex flex-1">
          <nav
            aria-label={dict.a11y.primaryNav}
            className="sticky top-72 hidden h-[calc(100dvh-72px)] w-248 shrink-0 flex-col gap-24 overflow-y-auto border border-general-default bg-surface-primary p-20 transition-[width,padding] duration-(--duration-drawer) ease-figma-out tablet:flex rail:w-72 rail:px-12 rail:pt-20 rail:pb-12"
          >
            <p className="type-table-heading whitespace-nowrap text-muted rail:hidden">{dict.nav.portfolio}</p>
            <NavLinks lang={lang} labels={dict.nav} />
          </nav>
          <main className="min-w-0 flex-1 bg-page px-(--layout-gutter) pt-32">{children}</main>
        </div>
      </div>
      {/* Overlays that read the address: on the 404 catch-all (address unknown at build time) they appear after load */}
      <Suspense fallback={null}>
      <SearchDialog lang={lang} copy={dict.search.dialog} />
      <SettingsDrawer lang={lang} dict={dict} />
      <ProfileDrawer lang={lang} dict={dict} />
      <ProjectsDrawer lang={lang} dict={dict} />
      <ApproachDrawer closeLabel={dict.a11y.close} />
      <BrowseDrawer closeLabel={dict.a11y.close} />
      <PostDrawer closeLabel={dict.a11y.close} />
      <LibraryDrawer closeLabel={dict.a11y.close} />
      <BriefDrawer closeLabel={dict.a11y.close} />
      <GameLibraryDrawer lang={lang} closeLabel={dict.a11y.close} />
      <MiniPlayer lang={lang} closeLabel={dict.a11y.close} />
      <FloatingReader lang={lang} closeLabel={dict.a11y.close} />
      </Suspense>
    </ReaderProvider>
    </StudyProvider>
    </SearchProvider>
    </DrawerProvider>
    </LangProvider>
  );
}
