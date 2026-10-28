/** Data behind the dashboard Overview, worked out from the owner's content (drafts included) and Inbox. */
import { bookCover } from "@/content/books";
import { gameOrder, games } from "@/content/games";
import { requireOwnerContent } from "./site-content";
import { getOwner } from "./supabase/server";

export type Status = "draft" | "published";
export type DraftItem = { key: string; title: string; meta: string; href: string; status: Status };

export async function getDashboardSummary() {
  const [content, owner] = await Promise.all([requireOwnerContent(), getOwner()]);
  const unread = owner ? (await owner.supabase.from("messages").select("id", { count: "exact", head: true }).eq("read", false).eq("archived", false)).count ?? 0 : 0;
  const { projects: directoryProjects, tracks, books, gameLinks } = content;
  const posts = Object.values(content.posts);
  const statusOf = (key: string): Status => content.status?.[key] ?? "published";
  const trackCount = Object.values(tracks).reduce((n, list) => n + list.length, 0);
  const projectDrafts: DraftItem[] = directoryProjects.map((p) => ({
    key: `project:${p.key}`,
    title: p.name,
    meta: `Project · ${p.eyebrow.includes("FEATURED") ? "Featured" : p.category}`,
    href: `/dashboard/projects/${p.key}`,
    status: statusOf(`project:${p.key}`),
  }));
  const storyDrafts: DraftItem[] = posts.map((p) => ({
    key: `story:${p.slug}`,
    title: p.title,
    meta: `Writing · ${p.category.charAt(0)}${p.category.slice(1).toLowerCase()}`,
    href: `/dashboard/writing/${p.slug}`,
    status: statusOf(`post:${p.slug}`),
  }));
  return {
    unread,
    projects: { total: directoryProjects.length, drafts: projectDrafts.filter((d) => d.status === "draft").length, published: projectDrafts.filter((d) => d.status === "published").length },
    stories: { total: posts.length, drafts: storyDrafts.filter((d) => d.status === "draft").length, published: storyDrafts.filter((d) => d.status === "published").length },
    study: { total: trackCount + books.length, tracks: trackCount, books: books.length },
    games: { total: gameOrder.length, linked: Object.keys(gameLinks).length, next: gameOrder.filter((k) => !gameLinks[k]).slice(0, 3).map((key) => ({ key, title: games[key].title, image: `/images/games/${key}.webp` })) },
    /** "Pick up a draft": up to three drafts, projects first */
    drafts: [...projectDrafts, ...storyDrafts].filter((d) => d.status === "draft").slice(0, 3),
    allDrafts: [...projectDrafts, ...storyDrafts].filter((d) => d.status === "draft").length,
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
