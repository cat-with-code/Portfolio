/**
 * Daily job (Vercel Cron, see vercel.json). Only runs with `Authorization: Bearer <CRON_SECRET>` — Vercel sends it.
 *   1. Keeps the free Supabase project awake (it pauses after a week without requests).
 *   2. Deletes uploads that no item uses: files picked in an editor that was never saved. Only files older than a
 *      day, so an upload you're still working with is never touched.
 * Answers with counts only.
 */
import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { COVERS, coversBase, isOurPath, r2Base, r2List, removeStored, uploadFolders } from "@/lib/storage";
import { supabaseAdmin } from "@/lib/supabase/admin";

const DAY = 24 * 60 * 60_000;

function authorized(req: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const given = req.headers.get("authorization") ?? "";
  const expected = `Bearer ${secret}`;
  return !!secret && given.length === expected.length && timingSafeEqual(Buffer.from(given), Buffer.from(expected));
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const db = supabaseAdmin();
  if (!db) return NextResponse.json({ error: "Not configured" }, { status: 500 });

  // 1. Keep-alive (any query counts).
  const alive = await db.from("settings").select("id").limit(1);
  if (alive.error) return NextResponse.json({ error: "Database unavailable" }, { status: 502 });

  // 2. Every file URL an item still uses.
  const [posts, projects, tracks, books] = await Promise.all([
    db.from("posts").select("cover_url,body"),
    db.from("projects").select("cover_url"),
    db.from("tracks").select("audio_url,cover_url"),
    db.from("books").select("cover_url"),
  ]);
  if ([posts, projects, tracks, books].some((r) => r.error)) return NextResponse.json({ error: "Couldn't read items" }, { status: 502 });
  const used = new Set<string>();
  const add = (u: unknown) => typeof u === "string" && used.add(u);
  for (const p of posts.data ?? []) {
    add(p.cover_url);
    for (const b of (p.body as { type: string; src?: string }[] | null) ?? []) if (b.type === "image") add(b.src);
  }
  for (const p of projects.data ?? []) add(p.cover_url);
  for (const t of tracks.data ?? []) {
    add(t.audio_url);
    add(t.cover_url);
  }
  for (const b of books.data ?? []) add(b.cover_url);

  const cutoff = Date.now() - DAY;
  let removed = 0;
  let failed = 0;
  const sweep = async (url: string) => {
    if (used.has(url)) return;
    try {
      await removeStored(db, url);
      removed++;
    } catch {
      failed++;
    }
  };

  // Covers, folder by folder.
  if (coversBase) {
    for (const folder of uploadFolders.cover) {
      for (let offset = 0; ; offset += 1000) {
        const { data, error } = await db.storage.from(COVERS).list(folder, { limit: 1000, offset });
        if (error || !data?.length) break;
        for (const f of data) {
          const path = `${folder}/${f.name}`;
          if (isOurPath(path) && f.created_at && Date.parse(f.created_at) < cutoff) await sweep(coversBase + path);
        }
        if (data.length < 1000) break;
      }
    }
  }
  // Music in R2.
  if (r2Base) {
    for (const folder of uploadFolders.audio) {
      for (const f of await r2List(`${folder}/`)) if (isOurPath(f.path) && f.at.getTime() < cutoff) await sweep(r2Base + f.path);
    }
  }

  return NextResponse.json({ ok: true, removed, failed });
}
