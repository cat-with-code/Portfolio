/**
 * Global search index. Only real, live content goes here — the prototype's sample posts,
 * books and games get added as each one is actually published.
 * Copy (titles + meta lines) comes from the Figma search panel (1121:82735).
 */
export type SearchGroup = "pages" | "projects" | "blog" | "study" | "games";
export type SearchIconKey = "developer" | "projects" | "blog" | "study" | "games" | "contact" | "sdabby";

export type SearchItem = {
  id: string;
  group: SearchGroup;
  title: string;
  meta: string;
  icon: SearchIconKey;
  /** Path after the locale, e.g. "/projects" */
  path: string;
  keywords?: string;
};

export const searchGroups: { key: SearchGroup; label: string; filter: string }[] = [
  { key: "pages", label: "PAGES", filter: "Pages" },
  { key: "projects", label: "PROJECTS", filter: "Projects" },
  { key: "blog", label: "BLOG", filter: "Blog" },
  { key: "study", label: "STUDY", filter: "Study" },
  { key: "games", label: "GAMES", filter: "Games" },
];

export const searchIndex: SearchItem[] = [
  { id: "developer", group: "pages", title: "Developer", meta: "Page · About, skills, and AI lab", icon: "developer", path: "" },
  { id: "projects", group: "pages", title: "Projects", meta: "Page · Selected work", icon: "projects", path: "/projects" },
  { id: "blog", group: "pages", title: "Blog", meta: "Page · The Notebook", icon: "blog", path: "/blog" },
  { id: "study", group: "pages", title: "Study", meta: "Page · Focus Studio", icon: "study", path: "/study" },
  { id: "games", group: "pages", title: "Games", meta: "Page · Game Hub", icon: "games", path: "/games" },
  { id: "contact", group: "pages", title: "Contact", meta: "Page · Send a message", icon: "contact", path: "/contact" },
  { id: "sdabby", group: "pages", title: "Sdabby", meta: "AI lab · Business chat assistant", icon: "sdabby", path: "" },
  { id: "student-club", group: "projects", title: "Student Club", meta: "Project · Community platform", icon: "projects", path: "/projects/student-club" },
  { id: "design-system", group: "projects", title: "Portfolio Design System", meta: "Project · Tokens and components", icon: "projects", path: "/projects/portfolio-design-system" },
  { id: "personal-website", group: "projects", title: "Personal Website", meta: "Project · In progress", icon: "projects", path: "/projects/personal-website" },
];

/** "TRY" suggestions from the prototype. Only words that currently return results are shown. */
export const searchSuggestions = ["AI", "habits", "study", "chess", "recipes"];

export function searchMatches(item: SearchItem, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return `${item.title} ${item.meta} ${item.keywords ?? ""}`.toLowerCase().includes(q);
}
