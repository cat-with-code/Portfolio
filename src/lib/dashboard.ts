/**
 * Data behind the dashboard, worked out from the site's content (src/content via lib/content).
 * Until the backend exists everything is a draft; when it does, status and counts come from it here.
 */
import { bookCover } from "@/content/books";
import { gameOrder, games } from "@/content/games";
import { getPosts } from "./content";
import { getSiteContent } from "./site-content";

export type Status = "draft" | "published";
export type DraftItem = { key: string; title: string; meta: string; href: string; status: Status };

export async function getDashboardSummary() {
  const [posts, { projects: directoryProjects, tracks, books, gameLinks }] = await Promise.all([getPosts(), getSiteContent()]);
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
    games: { total: gameOrder.length, linked: Object.keys(gameLinks).length, next: gameOrder.filter((k) => !gameLinks[k]).slice(0, 3).map((key) => ({ key, title: games[key].title, image: `/images/games/${key}.webp` })) },
    /** "Pick up a draft": the two featured projects, then the latest story */
    drafts: [...projectDrafts.slice(0, 2), storyDrafts[0]].filter(Boolean),
    allDrafts: projectDrafts.length + storyDrafts.length,
    media: {
      recent: [
        ...directoryProjects.slice(0, 2).map((p) => ({ src: p.coverImage ?? p.cover, fit: "cover" as const })),
        { src: "/images/games/chess.webp", fit: "contain" as const },
        ...(books[0] ? [{ src: bookCover(books[0]), fit: "contain" as const }] : []),
      ] as const,
      summary: `${directoryProjects.length + gameOrder.length + books.length} images · ${directoryProjects.length} projects, ${gameOrder.length} games, ${books.length} books`,
    },
  };
}
