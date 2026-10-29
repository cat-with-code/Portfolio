"use client";

import { finishUpload, startUpload } from "@/app/dashboard/upload-actions";

export type Uploaded = { ok: true; url: string } | { ok: false; error: string };

/**
 * Sends one file straight to storage: asks the server for a one-file upload link, uploads, then lets the server check
 * the file and hand back its public URL. Nothing is saved on the item until the editor's Save.
 */
/** Largest photo you can pick for a cover; it's resized before upload, so what's stored is far smaller. */
const COVER_PICK_MAX = 40 * 1024 * 1024;
/** Longest side of a stored cover — sharper than any screen shows it, a fraction of a phone photo's size. */
const COVER_EDGE = 2400;

/**
 * Shrinks a cover photo in the browser: at most COVER_EDGE px on the long side, re-encoded as WebP (JPEG where the
 * browser can't write WebP). Keeps the original when it's already small, or when the browser can't read the image —
 * the server still checks whatever arrives.
 */
async function shrinkImage(file: File): Promise<File> {
  try {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, COVER_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size < 1024 * 1024) return file;
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    const encode = (type: string) => new Promise<Blob | null>((done) => canvas.toBlob(done, type, 0.85));
    let blob = await encode("image/webp");
    if (blob?.type !== "image/webp") blob = await encode("image/jpeg");
    if (!blob || blob.size >= file.size) return file;
    const ext = blob.type === "image/webp" ? "webp" : "jpg";
    return new File([blob], file.name.replace(/\.[^.]+$/, "") + "." + ext, { type: blob.type });
  } catch {
    return file;
  }
}

export async function uploadFile(kind: "cover" | "audio", folder: string, picked: File): Promise<Uploaded> {
  if (kind === "cover" && picked.size > COVER_PICK_MAX) return { ok: false, error: "That photo is too big — the limit is 40 MB." };
  const file = kind === "cover" ? await shrinkImage(picked) : picked;
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
