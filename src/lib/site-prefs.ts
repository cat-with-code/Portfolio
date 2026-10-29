/**
 * The dashboard's public-facing preferences (Settings → Preferences), as the site reads them:
 *   • indexing    — "Let search engines find my portfolio" (robots.txt, noindex)
 *   • readingTime — "Show reading time" ("5 min read" on stories)
 * Read with the service key (the settings row is owner-only), only these yes/no values leave this file. Cached, and
 * refreshed the moment Settings are saved (updateTag("settings")). Each is on unless switched off.
 * ("Email me about new messages" is read by the contact form itself.)
 */
import "server-only";
import { cacheLife, cacheTag } from "next/cache";

export type SitePrefs = { indexing: boolean; readingTime: boolean };

export async function sitePrefs(): Promise<SitePrefs> {
  "use cache";
  cacheTag("settings");
  cacheLife("hours");
  const { supabaseAdmin } = await import("@/lib/supabase/admin");
  const db = supabaseAdmin();
  if (!db) return { indexing: true, readingTime: true };
  const { data, error } = await db.from("settings").select("prefs").eq("id", 1).maybeSingle();
  const prefs = (error ? {} : (data?.prefs ?? {})) as Record<string, unknown>;
  return { indexing: prefs.indexing !== false, readingTime: prefs["reading-time"] !== false };
}
