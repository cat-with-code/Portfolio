/**
 * Khmer / Chinese versions of the database content (see src/lib/content-translations.ts).
 *
 *   npm run translations                 which posts, projects and books need translating (missing or outdated)
 *   npm run translations -- stamp a.json  check new translations against the current English and save them to
 *                                         src/content/translations.json, stamped with the English fingerprint
 *
 * Reads with the service key (drafts included); never writes to the database.
 */
import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { rowKey, sourceHash, translatedFields, type Table } from "../src/lib/content-translations";

const FILE = new URL("../src/content/translations.json", import.meta.url);
const tables: Table[] = ["posts", "projects", "books"];
const db = createClient((process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim(), process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
type Row = Record<string, unknown>;
const saved = JSON.parse(readFileSync(FILE, "utf8")) as Record<Table, Record<string, Row & { source?: string }>>;

const rows: Record<Table, Row[]> = { posts: [], projects: [], books: [] };
for (const t of tables) {
  const { data, error } = await db.from(t).select([rowKey[t], "status", ...translatedFields[t]].join(","));
  if (error) throw new Error(error.message);
  rows[t] = data as unknown as Row[];
}

/** Translated text must mirror the English: same keys, same block types, text only, sensible length. */
function check(path: string, en: unknown, tr: unknown, problems: string[]) {
  if (tr === undefined) return;
  if (typeof en === "string" || en === null) {
    if (typeof tr !== "string" || !tr.trim()) problems.push(`${path}: should be text`);
    else if (tr.length > (en?.length ?? 0) * 3 + 200) problems.push(`${path}: much longer than the English`);
    else if (/<\s*\/?\s*script|javascript:/i.test(tr)) problems.push(`${path}: contains code`);
    return;
  }
  if (Array.isArray(en)) {
    if (!Array.isArray(tr) || tr.length !== en.length) return void problems.push(`${path}: needs ${en.length} items`);
    return en.forEach((e, i) => check(`${path}[${i}]`, e, tr[i], problems));
  }
  if (en && typeof en === "object") {
    if (!tr || typeof tr !== "object" || Array.isArray(tr)) return void problems.push(`${path}: should be an object`);
    for (const k of Object.keys(tr)) {
      const e = (en as Row)[k];
      if (!(k in (en as Row))) problems.push(`${path}.${k}: not in the English`);
      else if (["type", "ordered", "src", "tone", "key"].includes(k)) {
        if ((tr as Row)[k] !== e) problems.push(`${path}.${k}: must stay "${e}"`);
      } else check(`${path}.${k}`, e, (tr as Row)[k], problems);
    }
  }
}

if (process.argv[2] === "stamp") {
  let problems = 0;
  for (const file of process.argv.slice(3)) {
    const incoming = JSON.parse(readFileSync(file, "utf8")) as Partial<Record<Table, Record<string, Partial<Record<"km" | "zh", Row>>>>>;
    for (const t of tables)
      for (const [key, langs] of Object.entries(incoming[t] ?? {})) {
        const row = rows[t].find((r) => r[rowKey[t]] === key);
        if (!row) {
          console.log(`✗ ${t}/${key}: no such item`);
          problems++;
          continue;
        }
        const issues: string[] = [];
        for (const lang of ["km", "zh"] as const) {
          for (const f of Object.keys(langs[lang] ?? {})) if (!translatedFields[t].includes(f)) issues.push(`${lang}.${f}: not a translated field`);
          for (const f of translatedFields[t]) check(`${lang}.${f}`, row[f], langs[lang]?.[f], issues);
        }
        if (issues.length) {
          console.log(`✗ ${t}/${key}\n   ${issues.join("\n   ")}`);
          problems += issues.length;
          continue;
        }
        saved[t][key] = { source: sourceHash(t, row), ...saved[t][key], ...langs };
        saved[t][key].source = sourceHash(t, row);
        console.log(`✓ ${t}/${key}`);
      }
  }
  if (problems) process.exit(1);
  writeFileSync(FILE, JSON.stringify(saved, null, 1) + "\n");
  console.log("Saved src/content/translations.json");
} else {
  for (const t of tables)
    for (const row of rows[t]) {
      const key = String(row[rowKey[t]]);
      const entry = saved[t][key];
      const state = !entry ? "needs translating" : entry.source !== sourceHash(t, row) ? "English changed — translate again" : "translated";
      console.log(`${state === "translated" ? "✓" : "•"} ${t}/${key} (${row.status}): ${state}`);
    }
}
