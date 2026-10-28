import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * True when the signed-in user has an authenticator app set up but hasn't entered its code in this session yet
 * (password only, "aal1"). Such a session can only reach the code page — and the database refuses its writes too.
 */
export async function needsCode(supabase: SupabaseClient) {
  const { data, error } = await supabase.auth.mfa.getAuthenticatorAssuranceLevel();
  if (error) return true; // fail closed
  return data.nextLevel === "aal2" && data.currentLevel !== "aal2";
}
