"use server";

/**
 * Dashboard writes. Every action:
 *   1. re-checks the signed-in user is the owner (requireOwner) — the proxy gate alone is never trusted,
 *   2. validates its input with a fixed schema (unknown fields dropped, lengths capped, links restricted),
 *   3. writes through the owner's own session, so the database's security rules apply as well,
 *   4. refreshes the public site with updateTag("content").
 * Failures return a short message; database details never reach the browser.
 */
import { updateTag } from "next/cache";
import { z } from "zod";
import { readingMinutes } from "@/content/blocks";
import { gameOrder } from "@/content/games";
import { vibes } from "@/content/study";
import { storyTopics } from "@/lib/story-form";
import { removeStored, storedObject } from "@/lib/storage";
import { requireOwner } from "@/lib/supabase/server";

export type Result = { ok: true; key?: string } | { ok: false; error: string };

// ── Shared rules ─────────────────────────────────────────────────────────────

/** The site's own files ("/images/…", "/audio/…") or a file uploaded to our storage — images in the covers bucket, music in R2. Nothing else. */
const fileUrl = (store: "covers" | "r2") =>
  z
    .string()
    .max(500)
    .refine((u) => /^\/(images|audio)\/[A-Za-z0-9/_.\-]+$/.test(u) || storedObject(u)?.store === store, "Use an uploaded file");
const mediaUrl = fileUrl("covers");
const audioUrl = fileUrl("r2");
const text = (max: number) => z.string().trim().max(max);
const required = (max: number) => z.string().trim().min(1, "Required").max(max);
const slugify = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "item";
const status = z.enum(["draft", "published"]);

const block = z.discriminatedUnion("type", [
  z.object({ type: z.literal("paragraph"), text: required(4000) }),
  z.object({ type: z.literal("heading"), text: required(200) }),
  z.object({ type: z.literal("quote"), text: required(400), label: text(60).optional() }),
  z.object({ type: z.literal("list"), items: z.array(required(300)).min(1).max(20), ordered: z.boolean().optional() }),
  z.object({ type: z.literal("image"), src: mediaUrl, alt: text(200), caption: text(200).optional() }),
]);

async function run(fn: () => Promise<Result>): Promise<Result> {
  try {
    return await fn();
  } catch (e) {
    if (e instanceof z.ZodError) return { ok: false, error: e.issues[0]?.message ?? "Check the highlighted fields." };
    if (e instanceof Error && e.message === "Not signed in") return { ok: false, error: "Your session ended — sign in again." };
    console.error("dashboard action failed", e);
    return { ok: false, error: "Couldn’t save — please try again." };
  }
}
const check = (error: { message: string } | null) => {
  if (error) throw new Error(error.message);
};
type Db = Awaited<ReturnType<typeof requireOwner>>["supabase"];
/** After a save: delete uploaded files the item no longer uses (only ever our own random-named uploads). */
async function dropReplaced(db: Db, before: (string | null | undefined)[], after: (string | null | undefined)[]) {
  await Promise.all(before.filter((u) => u && !after.includes(u)).map((u) => removeStored(db, u)));
}
/** A key that isn't taken yet in `table`: "my-post", then "my-post-2", … */
async function freeKey(db: Db, table: string, column: string, base: string) {
  for (let i = 1; i < 50; i++) {
    const key = i === 1 ? base : `${base}-${i}`;
    const { count } = await db.from(table).select(column, { count: "exact", head: true }).eq(column, key);
    if (!count) return key;
  }
  throw new Error("no free key");
}

// ── Posts ────────────────────────────────────────────────────────────────────

const postInput = z.object({
  slug: z.string().regex(/^[a-z0-9]+(-[a-z0-9]+)*$/).max(120).optional(),
  title: required(160),
  topic: z.enum(storyTopics.map((t) => t.value) as [string, ...string[]]),
  art: z.enum(storyTopics.map((t) => t.value) as [string, ...string[]]),
  excerpt: text(400),
  dek: text(200),
  cover: mediaUrl.optional(),
  body: z.array(block).max(60),
  status,
});

export async function savePost(input: z.input<typeof postInput>): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    const p = postInput.parse(input);
    const topic = storyTopics.find((t) => t.value === p.topic)!;
    const row = {
      title: p.title,
      topic: p.art,
      filter: topic.filter,
      category: topic.category,
      excerpt: p.excerpt,
      dek: p.dek,
      cover_url: p.cover ?? null,
      body: p.body.length ? p.body : null,
      minutes: readingMinutes(p.body),
      status: p.status,
    };
    let slug = p.slug;
    if (slug) {
      const { data: current } = await supabase.from("posts").select("published_at,cover_url").eq("slug", slug).single();
      check((await supabase.from("posts").update({ ...row, ...(p.status === "published" && !current?.published_at ? { published_at: new Date().toISOString() } : {}) }).eq("slug", slug)).error);
      await dropReplaced(supabase, [current?.cover_url], [row.cover_url]);
    } else {
      slug = await freeKey(supabase, "posts", "slug", slugify(p.title));
      check((await supabase.from("posts").insert({ ...row, slug, sort: -Date.now() % 2147483647, published_at: p.status === "published" ? new Date().toISOString() : null })).error);
    }
    updateTag("content");
    return { ok: true, key: slug };
  });
}

export async function deletePost(slug: string): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    const key = z.string().max(120).parse(slug);
    const { data: old } = await supabase.from("posts").select("cover_url").eq("slug", key).maybeSingle();
    check((await supabase.from("posts").delete().eq("slug", key)).error);
    await dropReplaced(supabase, [old?.cover_url], []);
    updateTag("content");
    return { ok: true };
  });
}

// ── Projects ─────────────────────────────────────────────────────────────────

const caseStudy = z.object({
  issue: text(80),
  eyebrow: text(60),
  title: required(120),
  status: z.object({ label: text(40), tone: z.enum(["success", "brand"]) }),
  summary: text(300),
  credits: z.array(z.object({ label: required(30), value: text(120) })).max(6),
  overview: z.object({ title: text(120), lead: text(600) }),
  challenge: z.object({ title: text(120), body: text(800), goal: text(300) }),
  work: z.object({ title: text(120), items: z.array(z.object({ title: required(120), body: text(300) })).max(10) }),
  outcome: z.object({ title: text(120), statement: text(600) }),
});
const projectInput = z.object({
  key: z.string().max(80).optional(),
  name: required(120),
  category: text(80),
  description: text(300),
  disciplines: text(120),
  coverImage: mediaUrl.optional(),
  caseStudy: caseStudy.nullable().optional(),
});

export async function saveProject(input: z.input<typeof projectInput>): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    const p = projectInput.parse(input);
    const row = { name: p.name, category: p.category, description: p.description, disciplines: p.disciplines, cover_url: p.coverImage ?? null, ...(p.caseStudy !== undefined ? { case_study: p.caseStudy } : {}) };
    let key = p.key && p.key !== "new" ? p.key : undefined;
    if (key) {
      const { data: old } = await supabase.from("projects").select("cover_url").eq("key", key).maybeSingle();
      check((await supabase.from("projects").update(row).eq("key", key)).error);
      await dropReplaced(supabase, [old?.cover_url], [row.cover_url]);
    } else {
      key = await freeKey(supabase, "projects", "key", slugify(p.name));
      check((await supabase.from("projects").insert({ ...row, key, status: "draft", sort: 1000 })).error);
    }
    updateTag("content");
    return { ok: true, key };
  });
}

export async function setProjectStatus(key: string, next: "draft" | "published"): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    check((await supabase.from("projects").update({ status: status.parse(next) }).eq("key", z.string().max(80).parse(key))).error);
    updateTag("content");
    return { ok: true };
  });
}

export async function deleteProject(key: string): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    const k = z.string().max(80).parse(key);
    const { data: old } = await supabase.from("projects").select("cover_url").eq("key", k).maybeSingle();
    check((await supabase.from("projects").delete().eq("key", k)).error);
    await dropReplaced(supabase, [old?.cover_url], []);
    updateTag("content");
    return { ok: true };
  });
}

// ── Tracks and books ─────────────────────────────────────────────────────────

const trackInput = z.object({
  id: z.uuid().optional(),
  vibe: z.enum(vibes.map((v) => v.key) as [string, ...string[]]),
  title: required(120),
  length: z.string().regex(/^[0-9]{1,2}:[0-5][0-9]$/, "Length looks like 3:42"),
  audio: audioUrl.optional(),
  cover: mediaUrl.optional(),
});

export async function saveTrack(input: z.input<typeof trackInput>): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    const t = trackInput.parse(input);
    const row = { vibe: t.vibe, title: t.title, length: t.length, audio_url: t.audio ?? null, cover_url: t.cover ?? null };
    let id = t.id;
    if (id) {
      const { data: old } = await supabase.from("tracks").select("audio_url,cover_url").eq("id", id).maybeSingle();
      check((await supabase.from("tracks").update(row).eq("id", id)).error);
      await dropReplaced(supabase, [old?.audio_url, old?.cover_url], [row.audio_url, row.cover_url]);
    } else {
      const { data, error } = await supabase.from("tracks").insert({ ...row, status: "published", sort: 1000 }).select("id").single();
      check(error);
      id = data!.id;
    }
    updateTag("content");
    return { ok: true, key: id };
  });
}

export async function deleteTrack(id: string): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    const trackId = z.uuid().parse(id);
    const { data: old } = await supabase.from("tracks").select("audio_url,cover_url").eq("id", trackId).maybeSingle();
    check((await supabase.from("tracks").delete().eq("id", trackId)).error);
    await dropReplaced(supabase, [old?.audio_url, old?.cover_url], []);
    updateTag("content");
    return { ok: true };
  });
}

const tints = ["bg-accent-green-subtle", "bg-accent-blue-subtle", "bg-accent-red-subtle", "bg-accent-violet-subtle", "bg-status-warning-subtle"] as const;
const bookInput = z.object({
  key: z.string().max(80).optional(),
  title: required(160),
  author: text(160),
  topic: text(40),
  teaser: text(200),
  tint: z.enum(tints),
  cover: mediaUrl.optional(),
  brief: z.object({ bigIdea: text(600), ideas: z.tuple([text(200), text(200), text(200)]), sentence: text(300), question: text(300) }),
});

export async function saveBook(input: z.input<typeof bookInput>): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    const b = bookInput.parse(input);
    const row = { title: b.title, author: b.author, topic: b.topic, teaser: b.teaser, tint: b.tint, cover_url: b.cover ?? null, brief: b.brief };
    let key = b.key && b.key !== "new" ? b.key : undefined;
    if (key) {
      const { data: old } = await supabase.from("books").select("cover_url").eq("key", key).maybeSingle();
      check((await supabase.from("books").update(row).eq("key", key)).error);
      await dropReplaced(supabase, [old?.cover_url], [row.cover_url]);
    } else {
      key = await freeKey(supabase, "books", "key", slugify(b.title));
      check((await supabase.from("books").insert({ ...row, key, status: "published", sort: 1000 })).error);
    }
    updateTag("content");
    return { ok: true, key };
  });
}

export async function deleteBook(key: string): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    const k = z.string().max(80).parse(key);
    const { data: old } = await supabase.from("books").select("cover_url").eq("key", k).maybeSingle();
    check((await supabase.from("books").delete().eq("key", k)).error);
    await dropReplaced(supabase, [old?.cover_url], []);
    updateTag("content");
    return { ok: true };
  });
}

// ── Game links and settings ─────────────────────────────────────────────────

export async function setGameLink(game: string, url: string): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    const key = z.enum(gameOrder as unknown as [string, ...string[]]).parse(game);
    const link = z.url({ protocol: /^https?$/, error: "Use a web link (https://…)" }).max(500).parse(url.trim());
    check((await supabase.from("game_links").upsert({ game_key: key, url: link })).error);
    updateTag("content");
    return { ok: true };
  });
}

const settingsInput = z.object({
  name: text(120),
  email: z.union([z.literal(""), z.email().max(200)]),
  language: z.enum(["en", "km", "zh"]),
  prefs: z.object({ "email-messages": z.boolean(), "reading-time": z.boolean(), indexing: z.boolean() }),
});

export async function saveSettings(input: z.input<typeof settingsInput>): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    const s = settingsInput.parse(input);
    check((await supabase.from("settings").upsert({ id: 1, ...s })).error);
    // robots.txt and the "noindex" tag follow "Let search engines find my portfolio" at once.
    updateTag("settings");
    return { ok: true };
  });
}

// ── Inbox ────────────────────────────────────────────────────────────────────

const messagePatch = z.object({ read: z.boolean().optional(), archived: z.boolean().optional() }).strict();

/** Mark a message read / unread, archive / unarchive. */
export async function updateMessage(id: string, patch: z.input<typeof messagePatch>): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    check((await supabase.from("messages").update(messagePatch.parse(patch)).eq("id", z.uuid().parse(id))).error);
    return { ok: true };
  });
}

export async function deleteMessage(id: string): Promise<Result> {
  return run(async () => {
    const { supabase } = await requireOwner();
    check((await supabase.from("messages").delete().eq("id", z.uuid().parse(id))).error);
    return { ok: true };
  });
}
