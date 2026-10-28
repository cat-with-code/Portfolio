/**
 * Supabase with the service key — bypasses the database's security rules, so it's used for exactly three server jobs:
 * saving contact messages (visitors can't write to the table), the daily maintenance job, and reading the one
 * "Let search engines find my portfolio" switch for robots / noindex (lib/seo). Never for anything a visitor's input
 * could steer beyond that.
 */
import "server-only";
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
}
