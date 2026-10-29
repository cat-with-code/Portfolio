/**
 * Loads the site's editable content from Supabase — published rows only, read with the public (anon) key, so the
 * database's security rules decide what visitors can see. Cached and tagged "content": publishing from the dashboard
 * calls updateTag("content"); otherwise it refreshes in the background every hour.
 *
 * Without Supabase settings (e.g. a fresh clone with no .env.local) it falls back to the files in src/content.
 * With settings, an error is thrown instead of falling back — the files hold the original dummy content, which must
 * never reappear once you've deleted it. Next keeps serving the last good cached pages while that happens.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";
import { cacheLife, cacheTag } from "next/cache";
import type { SiteContent } from "@/components/content/site-content";
import { translateRow } from "./content-translations";
import { freshFetch } from "./supabase/fresh-fetch";
import { posts as filePosts, type Post } from "@/content/blog";
import type { Block } from "@/content/blocks";
import { books as fileBooks, type Book } from "@/content/books";
import { caseStudies as fileCaseStudies, type CaseStudy } from "@/content/case-studies";
import { directoryProjects as fileProjects, projectCards as fileCards, type DirectoryProject, type ProjectCard } from "@/content/projects";
import { tracks as fileTracks, vibes, type Track, type Vibe } from "@/content/study";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
export const supabaseConfigured = Boolean(url && anonKey);

function fromFiles(): SiteContent {
  return { posts: filePosts, projects: fileProjects, projectCards: fileCards, caseStudies: fileCaseStudies, tracks: fileTracks, books: fileBooks, gameLinks: {} };
}

type PostRow = { slug: string; title: string; display_title: string | null; topic: Post["topic"]; filter: Post["filter"]; category: string; minutes: number; excerpt: string; dek: string; cover_url: string | null; body: Block[] | null; published_at: string | null };
type ProjectRow = { key: string; name: string; eyebrow: string; category: string; description: string; disciplines: string; thumb: string | null; cover_url: string | null; href: string | null; card: Omit<ProjectCard, "key"> | null; case_study: Omit<CaseStudy, "key"> | null };
type TrackRow = { vibe: Vibe; title: string; length: string; audio_url: string | null; cover_url: string | null };
type BookRow = { key: string; title: string; author: string; topic: string; teaser: string; tint: string; cover_url: string | null; brief: Book["brief"] };

type Status = "draft" | "published";
type Client = ReturnType<typeof createClient>;

/** Reads every content table with `db`; visitors' reads are limited to published rows (the database enforces it too). */
async function load(db: Client, publishedOnly: boolean, lang = "en"): Promise<SiteContent> {
  const pick = <T,>(q: T & { eq: (c: string, v: string) => T }) => (publishedOnly ? q.eq("status", "published") : q);
  const [posts, projects, tracks, books, links] = await Promise.all([
    pick(db.from("posts").select("slug,title,display_title,topic,filter,category,minutes,excerpt,dek,cover_url,body,published_at,status")).order("sort"),
    pick(db.from("projects").select("key,name,eyebrow,category,description,disciplines,thumb,cover_url,href,card,case_study,status")).order("sort"),
    pick(db.from("tracks").select("id,vibe,title,length,audio_url,cover_url,status")).order("sort"),
    pick(db.from("books").select("key,title,author,topic,teaser,tint,cover_url,brief,status")).order("sort"),
    db.from("game_links").select("game_key,url"),
  ]);
  const failed = [posts, projects, tracks, books, links].find((r) => r.error);
  if (failed?.error) throw new Error(`Couldn't load content from Supabase: ${failed.error.message}`);

  // Visitors reading in Khmer / Chinese get the translated text where it's up to date (the dashboard stays English).
  const postRows = ((posts.data ?? []) as (PostRow & { status: Status })[]).map((r) => translateRow("posts", r, lang));
  const projectRows = ((projects.data ?? []) as (ProjectRow & { status: Status })[]).map((r) => translateRow("projects", r, lang));
  const trackRows = (tracks.data ?? []) as (TrackRow & { id: string; status: Status })[];
  const bookRows = ((books.data ?? []) as (BookRow & { status: Status })[]).map((r) => translateRow("books", r, lang));
  const content: SiteContent = {
    posts: Object.fromEntries(
      postRows.map((p) => [
        p.slug,
        {
          slug: p.slug,
          title: p.title,
          displayTitle: p.display_title ?? undefined,
          topic: p.topic,
          filter: p.filter,
          category: p.category,
          minutes: p.minutes,
          excerpt: p.excerpt,
          dek: p.dek,
          cover: p.cover_url ?? undefined,
          body: p.body ?? undefined,
          published: p.published_at?.slice(0, 10),
        } satisfies Post,
      ])
    ),
    projects: projectRows.map(
      (p): DirectoryProject => ({
        key: p.key,
        eyebrow: p.eyebrow,
        name: p.name,
        category: p.category,
        description: p.description,
        disciplines: p.disciplines,
        cover: p.thumb ?? "",
        coverImage: p.cover_url ?? undefined,
        href: p.href,
      })
    ),
    projectCards: projectRows.filter((p) => p.card).map((p) => ({ key: p.key as ProjectCard["key"], ...p.card! })),
    caseStudies: projectRows.filter((p) => p.case_study).map((p) => ({ key: p.key as CaseStudy["key"], ...p.case_study! })),
    tracks: Object.fromEntries(
      vibes.map((v) => [v.key, trackRows.filter((t) => t.vibe === v.key).map((t): Track => [t.title, t.length, t.audio_url ?? undefined, t.cover_url ?? undefined])])
    ) as Record<Vibe, Track[]>,
    books: bookRows.map((b) => ({ key: b.key, title: b.title, author: b.author, topic: b.topic, teaser: b.teaser, tint: b.tint, cover: b.cover_url ?? undefined, brief: b.brief })),
    gameLinks: Object.fromEntries(((links.data ?? []) as { game_key: string; url: string }[]).map((l) => [l.game_key, l.url])),
  };
  if (!publishedOnly) {
    content.status = Object.fromEntries([
      ...postRows.map((p) => [`post:${p.slug}`, p.status]),
      ...projectRows.map((p) => [`project:${p.key}`, p.status]),
      ...bookRows.map((b) => [`book:${b.key}`, b.status]),
      ...trackRows.map((t) => [`track:${t.id}`, t.status]),
    ]);
    content.trackIds = Object.fromEntries(vibes.map((v) => [v.key, trackRows.filter((t) => t.vibe === v.key).map((t) => t.id)])) as Record<Vibe, string[]>;
  }
  return content;
}

/** What visitors see: published content in `lang` (English when there's no translation), cached and tagged "content". */
export async function getSiteContent(lang = "en"): Promise<SiteContent> {
  "use cache";
  cacheTag("content");
  cacheLife("hours");
  if (!supabaseConfigured) return fromFiles();
  return load(createClient(url!, anonKey!, { auth: { persistSession: false, autoRefreshToken: false }, global: { fetch: freshFetch } }), true, lang);
}

/**
 * What the dashboard sees: everything, drafts included, read as the signed-in owner (never cached — it reads cookies,
 * so callers sit inside <Suspense>). Returns null if the visitor isn't the owner.
 */
export async function getOwnerContent(): Promise<SiteContent | null> {
  // Per-request (cookies): mark it before loading Supabase code, which reads the clock.
  const { connection } = await import("next/server");
  await connection();
  const { getOwner } = await import("./supabase/server");
  const owner = await getOwner();
  if (!owner) return null;
  return load(owner.supabase as unknown as Client, false);
}

/** Dashboard pages: the owner's content, or straight to Sign in. */
export async function requireOwnerContent(): Promise<SiteContent> {
  const content = await getOwnerContent();
  if (!content) {
    const { redirect } = await import("next/navigation");
    redirect("/dashboard/sign-in");
  }
  return content!;
}
