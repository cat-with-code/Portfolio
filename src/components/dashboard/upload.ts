"use client";

import { finishUpload, startUpload } from "@/app/dashboard/upload-actions";

export type Uploaded = { ok: true; url: string } | { ok: false; error: string };

/**
 * Sends one file straight to storage: asks the server for a one-file upload link, uploads, then lets the server check
 * the file and hand back its public URL. Nothing is saved on the item until the editor's Save.
 */
export async function uploadFile(kind: "cover" | "audio", folder: string, file: File): Promise<Uploaded> {
  const start = await startUpload({ kind, folder, type: file.type, size: file.size });
  if (!start.ok) return start;
  try {
    if (start.store === "covers") {
      // The publishable key only identifies the project; the signed token is what allows this one upload.
      const { createClient } = await import("@supabase/supabase-js");
      const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!, { auth: { persistSession: false, autoRefreshToken: false } });
      const { error } = await db.storage.from("covers").uploadToSignedUrl(start.path, start.token, file, { contentType: file.type, upsert: false });
      if (error) throw error;
    } else {
      const res = await fetch(start.url, { method: "PUT", body: file, headers: { "Content-Type": file.type } });
      if (!res.ok) throw new Error(`upload ${res.status}`);
    }
  } catch (e) {
    console.error(e);
    return { ok: false, error: "The upload didn’t go through — check your connection and try again." };
  }
  return finishUpload(kind, start.path, file.type);
}
