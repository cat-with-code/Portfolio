"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { Command } from "cmdk";
import { useRouter } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { BlogIcon, GamesIcon, GridIcon, ImageIcon, LockIcon, MailIcon, ProjectsIcon, SearchIcon, SettingsIcon, StudyIcon } from "@/components/icons";
import { useSearch } from "@/components/shell/search-provider";
import { Avatar } from "@/components/ui/avatar";
import { dashboardNav, dashboardShell, dialogsCopy as c } from "@/content/dashboard";

const pageIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  overview: GridIcon,
  projects: ProjectsIcon,
  writing: BlogIcon,
  study: StudyIcon,
  games: GamesIcon,
  media: ImageIcon,
  inbox: MailIcon,
  settings: SettingsIcon,
};

export type SearchDraft = { kind: "project" | "story"; title: string; href: string };

/** Dashboard search (Figma Desktop 1384:4752): pages and drafts, filtered as you type. ⌘K / the top-bar field opens it. */
export function DashboardSearch({ drafts }: { drafts: SearchDraft[] }) {
  const { open, setOpen } = useSearch();
  const router = useRouter();
  const go = (href: string) => {
    setOpen(false);
    router.push(href);
  };
  const pages = [...dashboardNav.map((n) => ({ key: n.key, label: n.label, href: `/dashboard${n.path}` })), { key: "settings", label: dashboardShell.settings, href: "/dashboard/settings" }];
  const item = "type-label flex cursor-pointer items-center gap-12 rounded-lg px-12 py-8 text-primary data-[selected=true]:bg-surface-hover";
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay-scrim backdrop-blur-backdrop data-[state=closed]:animate-dissolve-out data-[state=open]:animate-dissolve-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed top-16 right-16 left-16 z-50 flex max-h-[calc(100dvh-32px)] flex-col overflow-clip rounded-card bg-surface-primary shadow-modal outline-none data-[state=open]:animate-dissolve-in tablet:top-96 tablet:right-auto tablet:left-1/2 tablet:max-h-[calc(100dvh-128px)] tablet:w-640 tablet:-translate-x-1/2"
        >
          <Dialog.Title className="sr-only">{c.search.placeholder}</Dialog.Title>
          <Command loop label={c.search.placeholder} className="flex min-h-0 flex-col gap-8 p-16">
            <div className="flex h-44 shrink-0 items-center gap-8 rounded-shell border-2 border-interaction-focus px-12">
              <Command.Input placeholder={c.search.placeholder} className="type-input min-w-0 flex-1 bg-transparent text-primary outline-none placeholder:text-general-placeholder focus-visible:shadow-none" />
              <SearchIcon className="shrink-0 text-icon-general-secondary" />
            </div>
            <Command.List className="min-h-0 overflow-y-auto">
              <Command.Empty className="type-body px-12 py-16 text-secondary">{c.search.empty}</Command.Empty>
              <Command.Group heading={c.search.pages} className="[&_[cmdk-group-heading]]:type-table-heading [&_[cmdk-group-heading]]:px-12 [&_[cmdk-group-heading]]:pt-8 [&_[cmdk-group-heading]]:pb-4 [&_[cmdk-group-heading]]:text-secondary">
                {pages.map((p) => {
                  const Icon = pageIcons[p.key];
                  return (
                    <Command.Item key={p.key} value={`page ${p.label}`} onSelect={() => go(p.href)} className={item}>
                      <Icon className="size-20 shrink-0 text-icon-general-primary" />
                      {p.label}
                    </Command.Item>
                  );
                })}
              </Command.Group>
              <Command.Group heading={c.search.drafts} className="[&_[cmdk-group-heading]]:type-table-heading [&_[cmdk-group-heading]]:px-12 [&_[cmdk-group-heading]]:pt-12 [&_[cmdk-group-heading]]:pb-4 [&_[cmdk-group-heading]]:text-secondary">
                {drafts.map((d) => {
                  const Icon = d.kind === "project" ? ProjectsIcon : BlogIcon;
                  return (
                    <Command.Item key={d.href} value={`${d.kind} ${d.title}`} onSelect={() => go(d.href)} className={item}>
                      <Icon className="size-20 shrink-0 text-icon-general-primary" />
                      <span className="truncate">{d.title}</span>
                    </Command.Item>
                  );
                })}
              </Command.Group>
            </Command.List>
            <p className="type-caption shrink-0 pt-4 text-center text-secondary">{c.search.hint}</p>
          </Command>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Profile menu (Figma Desktop 1371:4391): the avatar opens who's signed in, Profile & settings, and Sign out. */
export function ProfileMenu({ size }: { size: 32 | 40 }) {
  const router = useRouter();
  const row = "type-label flex w-full cursor-pointer items-center gap-12 rounded-lg px-12 py-8 text-primary hover:bg-surface-secondary";
  return (
    <Popover.Root>
      <Popover.Trigger aria-label={c.profile.open} className="flex shrink-0 cursor-pointer rounded-full">
        <Avatar size={size} />
      </Popover.Trigger>
      <Popover.Portal>
        <Popover.Content align="end" sideOffset={8} className="z-50 flex w-260 flex-col gap-4 rounded-card border border-general-default bg-surface-primary p-8 shadow-dropdown outline-none data-[state=open]:animate-dissolve-in">
          <div className="flex items-center gap-12 border-b border-general-default px-12 pt-8 pb-12">
            <Avatar size={32} />
            <div className="flex min-w-0 flex-col">
              <p className="type-label truncate text-primary">{dashboardShell.owner}</p>
              <p className="type-caption truncate text-secondary">{c.profile.role}</p>
            </div>
          </div>
          <Popover.Close asChild>
            <button type="button" onClick={() => router.push("/dashboard/settings")} className={row}>
              <SettingsIcon className="size-20 shrink-0 text-icon-general-primary" />
              {c.profile.settings}
            </button>
          </Popover.Close>
          <Popover.Close asChild>
            <button type="button" onClick={() => router.push("/dashboard/sign-in")} className={row}>
              <LockIcon className="size-20 shrink-0 text-icon-general-primary" />
              {c.profile.signOut}
            </button>
          </Popover.Close>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}
