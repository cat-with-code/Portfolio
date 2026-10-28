"use server";

/**
 * Uploads, in two steps so files never pass through this server:
 *   1. startUpload  — owner only; checks type and size, picks a random name, returns a one-file upload link
 *                     (Supabase signed upload for covers, 5-minute presigned PUT for R2 music).
 *   2. finishUpload — owner only; reads the file's first bytes back and deletes it unless they match its type,
 *                     then returns the public URL to save on the item.
 * The covers bucket also enforces owner-only writes, image types and 5 MB in the database.
 */
import { z } from "zod";
import { COVERS, coversBase, isOurPath, looksLike, r2Base, r2UploadUrl, removeStored, uploadFolders, uploadRules, type UploadKind } from "@/lib/storage";
import { requireOwner } from "@/lib/supabase/server";

export type StartedUpload = { ok: true; store: "covers"; path: string; token: string } | { ok: true; store: "r2"; path: string; url: string } | { ok: false; error: string };
export type FinishedUpload = { ok: true; url: string } | { ok: false; error: string };

const MB = 1024 * 1024;
const startInput = z.object({
  kind: z.enum(["cover", "audio"]),
  folder: z.string().max(20),
  type: z.string().max(40),
  size: z.number().int().positive(),
});

const failure = (e: unknown, fallback: string) => {
  if (e instanceof Error && e.message === "Not signed in") return { ok: false as const, error: "Your session ended — sign in again." };
  console.error("upload failed", e);
  return { ok: false as const, error: fallback };
};

export async function startUpload(input: z.input<typeof startInput>): Promise<StartedUpload> {
  try {
    const { supabase } = await requireOwner();
    const { kind, folder, type, size } = startInput.parse(input);
    const rules = uploadRules[kind];
    const ext = rules.types[type];
    if (!ext) return { ok: false, error: kind === "cover" ? "Use a PNG, JPG or WebP image." : "Use an MP3 or WAV file." };
    if (size > rules.max) return { ok: false, error: `That file is too big — the limit is ${rules.max / MB} MB.` };
    if (!(uploadFolders[kind] as readonly string[]).includes(folder)) return { ok: false, error: "Couldn’t start the upload." };
    const path = `${folder}/${crypto.randomUUID()}.${ext}`;
    if (kind === "cover") {
      const { data, error } = await supabase.storage.from(COVERS).createSignedUploadUrl(path);
      if (error || !data) throw error ?? new Error("no upload link");
      return { ok: true, store: "covers", path, token: data.token };
    }
    return { ok: true, store: "r2", path, url: await r2UploadUrl(path, type, size) };
  } catch (e) {
    return failure(e, "Couldn’t start the upload — please try again.");
  }
}

export async function finishUpload(kind: UploadKind, path: string, type: string): Promise<FinishedUpload> {
  try {
    const { supabase } = await requireOwner();
    z.enum(["cover", "audio"]).parse(kind);
    const base = kind === "cover" ? coversBase : r2Base;
    if (!base || !isOurPath(path) || !uploadRules[kind].types[type]) return { ok: false, error: "Couldn’t finish the upload." };
    const url = base + path;
    const res = await fetch(url, { headers: { Range: "bytes=0-15" }, cache: "no-store" });
    const head = res.ok ? new Uint8Array(await res.arrayBuffer()).slice(0, 16) : null;
    if (!head || !looksLike(type, head)) {
      await removeStored(supabase, url);
      return { ok: false, error: kind === "cover" ? "That file isn’t a real PNG, JPG or WebP image." : "That file isn’t a real MP3 or WAV file." };
    }
    return { ok: true, url };
  } catch (e) {
    return failure(e, "Couldn’t finish the upload — please try again.");
  }
}
