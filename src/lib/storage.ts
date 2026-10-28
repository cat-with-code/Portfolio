/**
 * Where uploaded files live: covers in Supabase Storage (bucket "covers"), music in Cloudflare R2.
 * Server only — the R2 keys never reach the browser; it gets one short-lived upload link per file instead.
 */
import "server-only";
import { DeleteObjectCommand, ListObjectsV2Command, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import type { SupabaseClient } from "@supabase/supabase-js";

export type UploadKind = "cover" | "audio";

/** What each kind accepts. The covers bucket enforces the same type and size limits itself. */
export const uploadRules = {
  cover: { types: { "image/png": "png", "image/jpeg": "jpg", "image/webp": "webp" } as Record<string, string>, max: 5 * 1024 * 1024 },
  audio: { types: { "audio/mpeg": "mp3", "audio/wav": "wav", "audio/x-wav": "wav", "audio/wave": "wav" } as Record<string, string>, max: 20 * 1024 * 1024 },
};
/** Folders per kind; file names are always random. */
export const uploadFolders = { cover: ["blog", "projects", "music", "books"], audio: ["tracks"] } as const;

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.replace(/\/$/, "");
const r2Public = process.env.NEXT_PUBLIC_R2_PUBLIC_URL?.replace(/\/$/, "");
export const COVERS = "covers";
export const coversBase = supabaseUrl ? `${supabaseUrl}/storage/v1/object/public/${COVERS}/` : null;
export const r2Base = r2Public ? `${r2Public}/` : null;

/** Paths we hand out: "<folder>/<uuid>.<ext>". Anything else is never touched. */
const pathPattern = /^[a-z]+\/[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(png|jpg|webp|mp3|wav)$/;
export const isOurPath = (path: string) => pathPattern.test(path);

/** An uploaded file's public URL → where it's stored; null for the site's own files or anything else. */
export function storedObject(url: string | null | undefined): { store: "covers" | "r2"; path: string } | null {
  if (!url) return null;
  const path = coversBase && url.startsWith(coversBase) ? url.slice(coversBase.length) : r2Base && url.startsWith(r2Base) ? url.slice(r2Base.length) : null;
  if (!path || !isOurPath(path)) return null;
  return { store: url.startsWith(coversBase ?? "\0") ? "covers" : "r2", path };
}

let client: S3Client | null = null;
function r2() {
  const { R2_ACCOUNT_ID: account, R2_ACCESS_KEY_ID: key, R2_SECRET_ACCESS_KEY: secret } = process.env;
  if (!account || !key || !secret || !process.env.R2_BUCKET) throw new Error("R2 is not configured");
  client ??= new S3Client({ region: "auto", endpoint: `https://${account}.r2.cloudflarestorage.com`, credentials: { accessKeyId: key, secretAccessKey: secret } });
  return client;
}

/** A 5-minute link that lets the browser PUT exactly this file (type and size are part of the signature). */
export async function r2UploadUrl(path: string, type: string, size: number) {
  return getSignedUrl(r2(), new PutObjectCommand({ Bucket: process.env.R2_BUCKET, Key: path, ContentType: type, ContentLength: size }), {
    expiresIn: 300,
    signableHeaders: new Set(["content-type", "content-length"]),
  });
}

/** Music files in R2 under `prefix`, with when they were uploaded (for the daily clean-up). */
export async function r2List(prefix: string) {
  const out: { path: string; at: Date }[] = [];
  let token: string | undefined;
  do {
    const page = await r2().send(new ListObjectsV2Command({ Bucket: process.env.R2_BUCKET, Prefix: prefix, ContinuationToken: token }));
    for (const o of page.Contents ?? []) if (o.Key && o.LastModified) out.push({ path: o.Key, at: o.LastModified });
    token = page.IsTruncated ? page.NextContinuationToken : undefined;
  } while (token);
  return out;
}

/** Deletes one uploaded file (covers with the owner's session, so the bucket's rules apply). Errors are logged, not thrown. */
export async function removeStored(supabase: SupabaseClient, url: string | null | undefined) {
  const obj = storedObject(url);
  if (!obj) return;
  try {
    if (obj.store === "covers") {
      const { error } = await supabase.storage.from(COVERS).remove([obj.path]);
      if (error) throw error;
    } else await r2().send(new DeleteObjectCommand({ Bucket: process.env.R2_BUCKET, Key: obj.path }));
  } catch (e) {
    console.error("couldn't remove an old upload", e);
  }
}

/** First bytes of a file → does it really look like `type`? (A renamed file fails this.) */
export function looksLike(type: string, b: Uint8Array) {
  const at = (i: number, ...bytes: number[]) => bytes.every((x, j) => b[i + j] === x);
  const ascii = (i: number, s: string) => at(i, ...Array.from(s, (ch) => ch.charCodeAt(0)));
  switch (type) {
    case "image/png":
      return at(0, 0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a);
    case "image/jpeg":
      return at(0, 0xff, 0xd8, 0xff);
    case "image/webp":
      return ascii(0, "RIFF") && ascii(8, "WEBP");
    case "audio/mpeg":
      return ascii(0, "ID3") || (b[0] === 0xff && (b[1] & 0xe0) === 0xe0);
    default: // the wav types
      return ascii(0, "RIFF") && ascii(8, "WAVE");
  }
}
