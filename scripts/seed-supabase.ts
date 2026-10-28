/**
 * One-time import: copies the content in src/content into Supabase and records you as the owner.
 * Run from the project folder:  npx tsx --env-file=.env.local scripts/seed-supabase.ts
 *
 * Uses the service key (bypasses security rules), so it only ever runs on your computer — it is not part of the site.
 * Safe to re-run: posts, projects and books are updated by key; tracks and settings are only added when empty.
 */
import { createClient } from "@supabase/supabase-js";
import { posts } from "../src/content/blog";
import { books } from "../src/content/books";
import { caseStudies } from "../src/content/case-studies";
import { directoryProjects, projectCards } from "../src/content/projects";
import { tracks, vibes } from "../src/content/study";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const owner = process.env.OWNER_USER_ID;
if (!url || !serviceKey || !owner) throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY or OWNER_USER_ID in .env.local");

const db = createClient(url, serviceKey, { auth: { persistSession: false, autoRefreshToken: false } });

async function step(label: string, run: () => PromiseLike<{ error: { message: string } | null; count?: number | null }>) {
  const { error } = await run();
  if (error) throw new Error(`${label}: ${error.message}`);
  console.log(`✓ ${label}`);
}

// Owner: must be a real user in this project.
const { data: user, error: userError } = await db.auth.admin.getUserById(owner);
if (userError || !user?.user) throw new Error("OWNER_USER_ID doesn't match a user in Supabase → Authentication → Users");
await step("owner recorded", () => db.from("app_config").upsert({ id: 1, owner_id: owner }));

await step(`${Object.keys(posts).length} posts`, () =>
  db.from("posts").upsert(
    Object.values(posts).map((p, i) => ({
      slug: p.slug,
      title: p.title,
      display_title: p.displayTitle ?? null,
      topic: p.topic,
      filter: p.filter,
      category: p.category,
      minutes: p.minutes,
      excerpt: p.excerpt,
      dek: p.dek,
      cover_url: p.cover ?? null,
      body: p.body ?? null,
      status: "published",
      sort: i,
      // Only real dates: the post page prints this, and an import date would be wrong.
      published_at: p.published ?? null,
    }))
  )
);

await step(`${directoryProjects.length} projects`, () =>
  db.from("projects").upsert(
    directoryProjects.map((p, i) => {
      const card = projectCards.find((c) => c.key === p.key);
      const study = caseStudies.find((s) => s.key === p.key);
      return {
        key: p.key,
        name: p.name,
        eyebrow: p.eyebrow,
        category: p.category,
        description: p.description,
        disciplines: p.disciplines,
        thumb: p.cover || null,
        cover_url: p.coverImage ?? null,
        href: p.href,
        card: card ? { meta: card.meta, status: card.status, name: card.name, description: card.description, tags: card.tags } : null,
        case_study: study ? (({ key: _key, ...rest }) => rest)(study) : null,
        status: "published",
        sort: i,
      };
    })
  )
);

await step(`${books.length} books`, () =>
  db.from("books").upsert(
    books.map((b, i) => ({
      key: b.key,
      title: b.title,
      author: b.author,
      topic: b.topic,
      teaser: b.teaser,
      tint: b.tint,
      cover_url: `/images/books/${b.key}.jpg`,
      brief: b.brief,
      status: "published",
      sort: i,
    }))
  )
);

const { count: trackCount } = await db.from("tracks").select("id", { count: "exact", head: true });
if (trackCount) console.log(`• tracks already imported (${trackCount}) — skipped`);
else
  await step("tracks", () =>
    db.from("tracks").insert(
      vibes.flatMap((v) =>
        tracks[v.key].map(([title, length, src, cover], i) => ({ vibe: v.key, title, length, audio_url: src ?? null, cover_url: cover ?? null, status: "published", sort: i }))
      )
    )
  );

const { count: settingsCount } = await db.from("settings").select("id", { count: "exact", head: true });
if (settingsCount) console.log("• settings already exist — skipped");
else await step("settings", () => db.from("settings").insert({ id: 1, name: user.user.user_metadata?.name ?? "Hoeurn Dareach", email: user.user.email ?? "", language: "en", prefs: { "email-messages": true, "reading-time": true, indexing: false } }));

console.log("Done.");
