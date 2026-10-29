/**
 * Khmer and Chinese versions of the database content (posts, projects, books), kept in src/content/translations.json.
 * Each one is stamped with a fingerprint of the English it was translated from: once the English is edited, the
 * fingerprint stops matching and that item shows in English until it's translated again (`npm run translations`
 * lists what needs doing). Names — project names, book titles and authors — are never translated.
 */
import { createHash } from "node:crypto";
import data from "@/content/translations.json";
import { merge } from "@/i18n/content";

export type Table = "posts" | "projects" | "books";
type Row = Record<string, unknown>;
type Entry = { source: string } & Partial<Record<"km" | "zh", Row>>;

/** The English fields that get translated, per table. */
export const translatedFields: Record<Table, string[]> = {
  posts: ["title", "display_title", "category", "excerpt", "dek", "body"],
  projects: ["eyebrow", "category", "description", "disciplines", "card", "case_study"],
  books: ["topic", "teaser", "brief"],
};
export const rowKey: Record<Table, string> = { posts: "slug", projects: "key", books: "key" };

/** JSON with object keys sorted, so the same content always gives the same fingerprint. */
function stable(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((k) => `${JSON.stringify(k)}:${stable((value as Row)[k])}`).join(",")}}`;
  return JSON.stringify(value ?? null);
}

/** Fingerprint of a row's English text. */
export function sourceHash(table: Table, row: Row) {
  return createHash("sha256").update(stable(translatedFields[table].map((f) => row[f] ?? null))).digest("hex").slice(0, 16);
}

/** Same blocks in the same order (a translated body must never drop, add or reorder blocks). */
function sameBody(en: unknown, tr: unknown) {
  if (en == null) return tr == null;
  return Array.isArray(en) && Array.isArray(tr) && en.length === tr.length && en.every((b, i) => b?.type === tr[i]?.type && (b?.type !== "list" || b.items?.length === tr[i]?.items?.length));
}

/** `row` in `lang` when an up-to-date translation exists, otherwise unchanged (English). */
export function translateRow<T extends Row>(table: Table, row: T, lang: string): T {
  if (lang !== "km" && lang !== "zh") return row;
  const entry = (data as Record<Table, Record<string, Entry>>)[table]?.[String(row[rowKey[table]])];
  const tr = entry?.[lang];
  if (!tr || entry.source !== sourceHash(table, row)) return row;
  if (table === "posts" && !sameBody(row.body, tr.body ?? row.body)) return row;
  const picked: Row = Object.fromEntries(translatedFields[table].filter((f) => f in tr).map((f) => [f, tr[f]]));
  // Only words change: block types, list styles and image addresses always come from the English.
  const fixed = ["src", "type", "ordered"];
  if (Array.isArray(picked.body)) picked.body = picked.body.map((block: Row) => Object.fromEntries(Object.entries(block).filter(([k]) => !fixed.includes(k))));
  return merge(row, picked) as T;
}
