"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType, SVGProps } from "react";
import { BlogIcon, ContactIcon, DeveloperIcon, GamesIcon, ProjectsIcon, SettingsIcon, StudyIcon } from "@/components/icons";
import { activeNav, primaryNav, secondaryNav, type NavKey, type NavLabels } from "@/lib/site";
import { useDrawer } from "./drawer-provider";

const icons: Record<NavKey | "settings", ComponentType<SVGProps<SVGSVGElement>>> = {
  developer: DeveloperIcon,
  projects: ProjectsIcon,
  blog: BlogIcon,
  study: StudyIcon,
  games: GamesIcon,
  contact: ContactIcon,
  settings: SettingsIcon,
};

/**
 * Navigation item (Figma 51:11). Expanded: 2px indicator + 198px row. Rail (Tablet / collapsed Desktop): 44px circle.
 * `allowRail` is false inside the Mobile menu drawer, which always shows labels.
 */
function itemClasses(active: boolean, allowRail: boolean) {
  const rail = allowRail;
  return {
    root: `group/nav flex h-44 w-208 shrink-0 cursor-pointer items-center gap-8 ${rail ? "rail:w-44 rail:gap-0" : ""}`,
    indicator: `h-24 w-2 shrink-0 rounded-full ${active ? "bg-brand" : ""} ${rail ? "rail:hidden" : ""}`,
    content: [
      "flex h-44 w-198 shrink-0 items-center gap-12 rounded-lg p-12 transition-colors duration-(--duration-fast)",
      active ? "bg-surface-selected" : "group-hover/nav:bg-surface-hover",
      rail ? "rail:w-44 rail:justify-center rail:rounded-full rail:p-0" : "",
    ].join(" "),
    icon: `shrink-0 ${active ? "text-icon-on-selected" : "text-icon-general-primary"}`,
    label: `type-label whitespace-nowrap ${active ? "text-on-selected" : "text-secondary"} ${rail ? "rail:sr-only" : ""}`,
  };
}

export function NavLinks({
  lang,
  labels,
  allowRail = true,
  onNavigate,
}: {
  lang: string;
  labels: NavLabels;
  allowRail?: boolean;
  onNavigate?: () => void;
}) {
  const pathname = usePathname();
  const { setOpen } = useDrawer();
  const current = activeNav(pathname);

  const link = (key: NavKey, path: string) => {
    const Icon = icons[key];
    const active = current === key;
    const c = itemClasses(active, allowRail);
    return (
      <li key={key}>
        <Link
          href={`/${lang}${path}`}
          aria-current={active ? "page" : undefined}
          title={labels[key]}
          onClick={onNavigate}
          className={c.root}
        >
          <span className={c.indicator} />
          <span className={c.content}>
            <Icon className={c.icon} />
            <span className={c.label}>{labels[key]}</span>
          </span>
        </Link>
      </li>
    );
  };

  const settings = itemClasses(false, allowRail);
  const SettingsGlyph = icons.settings;

  return (
    <>
      <ul className={`flex flex-col gap-8 ${allowRail ? "rail:w-full" : ""}`}>{primaryNav.map((i) => link(i.key, i.path))}</ul>
      <div className="min-h-0 flex-1" />
      <ul className={`flex flex-col gap-8 ${allowRail ? "rail:w-full rail:items-center" : ""}`}>
        {secondaryNav.map((i) => link(i.key, i.path))}
        <li>
          <button
            type="button"
            title={labels.settings}
            onClick={() => {
              onNavigate?.();
              setOpen("settings");
            }}
            className={settings.root}
          >
            <span className={settings.indicator} />
            <span className={settings.content}>
              <SettingsGlyph className={settings.icon} />
              <span className={settings.label}>{labels.settings}</span>
            </span>
          </button>
        </li>
      </ul>
    </>
  );
}
