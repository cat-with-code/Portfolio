/**
 * Supabase on the server with the visitor's session cookie (dashboard reads and writes).
 * Writes go through the signed-in user, so the database's security rules still apply on top of these checks.
 */
import "server-only";
import { createServerClient } from "@supabase/ssr";
import type { User } from "@supabase/supabase-js";
import { cookies } from "next/headers";
import { connection } from "next/server";
import { freshFetch } from "./fresh-fetch";
import { needsCode } from "./mfa";
import { ACTIVE_COOKIE, browserSessionCookie, sessionExpiry, signedInAt } from "./session-policy";

const url = (process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").trim();
const anonKey = (process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "").trim();

export async function supabaseServer() {
  // Per-request work: mark it before any Supabase code runs (it reads the clock), or prerendering stalls.
  await connection();
  const store = await cookies();
  return createServerClient(url, anonKey, {
    global: { fetch: freshFetch },
    cookies: {
      getAll: () => store.getAll(),
      setAll: (list) => {
        try {
          list.forEach(({ name, value, options }) => store.set(name, value, browserSessionCookie(options)));
        } catch {
          // Called from a Server Component: the proxy refreshes the cookie instead.
        }
      },
    },
  });
}

/** True only for the owner account (OWNER_USER_ID). Any other signed-in account counts as nobody. */
export const isOwnerUser = (user: Pick<User, "id"> | null | undefined) => !!user && !!process.env.OWNER_USER_ID && user.id === process.env.OWNER_USER_ID;

/**
 * The signed-in owner account, verified with Supabase (getUser checks the token server-side), or null.
 * `needsCode`: the authenticator code hasn't been entered in this session yet (see mfa.ts).
 */
export async function getOwnerSession() {
  const supabase = await supabaseServer();
  const { data } = await supabase.auth.getUser();
  if (!isOwnerUser(data.user)) return null;
  // Past the session limits (inactivity or maximum length) counts as signed out; the proxy clears the cookies.
  const [{ data: auth }, store] = await Promise.all([supabase.auth.getClaims(), cookies()]);
  if (sessionExpiry(signedInAt(auth?.claims), Number(store.get(ACTIVE_COOKIE)?.value) || null)) return null;
  return { supabase, user: data.user!, needsCode: await needsCode(supabase) };
}

/** The fully signed-in owner (password, plus the authenticator code once that's set up), or null. */
export async function getOwner() {
  const session = await getOwnerSession();
  return session && !session.needsCode ? { supabase: session.supabase, user: session.user } : null;
}

/** For server actions: the owner's client, or a thrown error that never reaches the database. */
export async function requireOwner() {
  const owner = await getOwner();
  if (!owner) throw new Error("Not signed in");
  return owner;
}
