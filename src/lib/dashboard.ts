/**
 * Data behind the dashboard, worked out from the site's content (src/content via lib/content).
 * Until the backend exists everything is a draft; when it does, status and counts come from it here.
 */
import { books } from "@/content/books";
import { gameOrder, games } from "@/content/games";
import { directoryProjects } from "@/content/projects";
import { tracks } from "@/content/study";
import { getPosts } from "./content";

export type Status = "draft" | "published";
export type DraftItem = { key: string; title: string; meta: string; href: string; status: Status };

export async function getDashboardSummary() {
  const posts = await getPosts();
  const trackCount = Object.values(tracks).reduce((n, list) => n + list.length, 0);
  const projectDrafts: DraftItem[] = directoryProjects.map((p) => ({
    key: `project:${p.key}`,
    title: p.name,
    meta: `Project · ${p.eyebrow.includes("FEATURED") ? "Featured" : p.category}`,
    href: "/dashboard/projects",
    status: "draft",
  }));
  const storyDrafts: DraftItem[] = posts.map((p) => ({
    key: `story:${p.slug}`,
    title: p.title,
    meta: `Writing · ${p.category.charAt(0)}${p.category.slice(1).toLowerCase()}`,
    href: "/dashboard/writing",
    status: "draft",
  }));
  return {
    projects: { total: directoryProjects.length, drafts: directoryProjects.length, published: 0 },
    stories: { total: posts.length, drafts: posts.length, published: 0 },
    study: { total: trackCount + books.length, tracks: trackCount, books: books.length },
    games: { total: gameOrder.length, linked: 0, next: gameOrder.slice(0, 3).map((key) => ({ key, title: games[key].title, image: `/images/games/${key}.webp` })) },
    /** "Pick up a draft": the two featured projects, then the latest story */
    drafts: [...projectDrafts.slice(0, 2), storyDrafts[0]].filter(Boolean),
    allDrafts: projectDrafts.length + storyDrafts.length,
    media: {
      recent: [
        { src: "/images/projects/student-club.png", fit: "cover" },
        { src: "/images/projects/focus-studio.png", fit: "cover" },
        { src: "/images/games/chess.webp", fit: "contain" },
        { src: "/images/books/atomic-habits.jpg", fit: "contain" },
      ] as const,
      summary: `${directoryProjects.length + gameOrder.length + books.length} images · ${directoryProjects.length} projects, ${gameOrder.length} games, ${books.length} books`,
    },
  };
}
