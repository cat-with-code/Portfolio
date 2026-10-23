import type { Dictionary } from "@/i18n/dictionaries";

export type NavKey = "developer" | "projects" | "blog" | "study" | "games" | "contact";

/** Sidebar order from the Figma Navigation panel. Developer is the home page. */
export const primaryNav: { key: NavKey; path: string }[] = [
  { key: "developer", path: "" },
  { key: "projects", path: "/projects" },
  { key: "blog", path: "/blog" },
  { key: "study", path: "/study" },
  { key: "games", path: "/games" },
];

export const secondaryNav: { key: NavKey; path: string }[] = [{ key: "contact", path: "/contact" }];

export function activeNav(pathname: string): NavKey {
  const segment = pathname.split("/")[2] ?? "";
  const match = [...primaryNav, ...secondaryNav].find((item) => item.path === `/${segment}`);
  return match?.key ?? "developer";
}

export type NavLabels = Dictionary["nav"];
