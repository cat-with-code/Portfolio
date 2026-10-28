"use server";

import { redirect } from "next/navigation";
import { needsCode } from "@/lib/supabase/mfa";
import { getOwnerSession, isOwnerUser, requireOwner, supabaseServer } from "@/lib/supabase/server";

export type SignInState = { error?: string; email?: string } | undefined;

/** One message for every failure, so the form never reveals which emails exist. */
const FAILED = "Email or password is incorrect.";

/** Only ever return to a dashboard page (no open redirects). */
const safeNext = (next: unknown) => (typeof next === "string" && /^\/dashboard(\/[A-Za-z0-9/_\-]*)?(\?[^\s]*)?$/.test(next) && !next.startsWith("/dashboard/sign-in") ? next : "/dashboard");

export async function signIn(_prev: SignInState, form: FormData): Promise<SignInState> {
  const email = String(form.get("email") ?? "").trim().slice(0, 200);
  const password = String(form.get("password") ?? "").slice(0, 200);
  if (!email || !password) return { error: FAILED, email };

  const supabase = await supabaseServer();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !isOwnerUser(data.user)) {
    // A valid account that isn't the owner is signed straight back out.
    if (data.user) await supabase.auth.signOut();
    // Keep the email so it can be fixed; never send the password back.
    return { error: FAILED, email };
  }
  const next = safeNext(form.get("next"));
  // Authenticator app set up: ask for its code before anything else opens.
  if (await needsCode(supabase)) redirect(`/dashboard/sign-in/verify?next=${encodeURIComponent(next)}`);
  redirect(next);
}

/** Second step: the 6-digit code from the authenticator app. */
export async function verifyCode(_prev: SignInState, form: FormData): Promise<SignInState> {
  const WRONG = "That code didn’t work — use the newest one from your app.";
  const code = String(form.get("code") ?? "").replace(/\s/g, "");
  if (!/^\d{6}$/.test(code)) return { error: WRONG };
  const session = await getOwnerSession();
  if (!session) redirect("/dashboard/sign-in");
  const { data: factors } = await session.supabase.auth.mfa.listFactors();
  const factor = factors?.totp.find((f) => f.status === "verified");
  if (!factor) return { error: WRONG };
  const { error } = await session.supabase.auth.mfa.challengeAndVerify({ factorId: factor.id, code });
  if (error) return { error: WRONG };
  redirect(safeNext(form.get("next")));
}

// ── Second-step settings (owner, fully signed in) ────────────────────────────

export type MfaResult = { ok: true } | { ok: false; error: string };

/** Starts adding the authenticator app: a QR code (and the same key as text) to scan. */
export async function startAuthenticator(): Promise<{ ok: true; factorId: string; qr: string; secret: string } | { ok: false; error: string }> {
  try {
    const { supabase } = await requireOwner();
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (factors?.totp.some((f) => f.status === "verified")) return { ok: false, error: "An authenticator app is already set up." };
    // Clear half-finished attempts so they don't pile up.
    for (const f of factors?.all ?? []) if (f.factor_type === "totp" && f.status !== "verified") await supabase.auth.mfa.unenroll({ factorId: f.id });
    const { data, error } = await supabase.auth.mfa.enroll({ factorType: "totp", friendlyName: "Authenticator app", issuer: "Portfolio dashboard" });
    if (error || !data) throw error ?? new Error("enroll failed");
    return { ok: true, factorId: data.id, qr: data.totp.qr_code, secret: data.totp.secret };
  } catch (e) {
    console.error("authenticator setup failed", e);
    return { ok: false, error: "Couldn’t start the setup — please try again." };
  }
}

/** Finishes adding the authenticator app with the first code it shows. */
export async function confirmAuthenticator(factorId: string, code: string): Promise<MfaResult> {
  try {
    const { supabase } = await requireOwner();
    if (!/^\d{6}$/.test(code.replace(/\s/g, ""))) return { ok: false, error: "Enter the 6-digit code from your app." };
    const { error } = await supabase.auth.mfa.challengeAndVerify({ factorId: String(factorId).slice(0, 64), code: code.replace(/\s/g, "") });
    return error ? { ok: false, error: "That code didn’t work — try the newest one." } : { ok: true };
  } catch {
    return { ok: false, error: "Your session ended — sign in again." };
  }
}

/** Turns the authenticator app off. Needs a fully signed-in session (password + code), so a stolen password alone can't. */
export async function removeFactor(factorId: string): Promise<MfaResult> {
  try {
    const { supabase } = await requireOwner();
    const { data: factors } = await supabase.auth.mfa.listFactors();
    if (!factors?.totp.some((f) => f.id === factorId)) return { ok: false, error: "It’s already off." };
    const { error } = await supabase.auth.mfa.unenroll({ factorId });
    return error ? { ok: false, error: "Couldn’t remove it — please try again." } : { ok: true };
  } catch {
    return { ok: false, error: "Your session ended — sign in again." };
  }
}

export async function signOut() {
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  redirect("/dashboard/sign-in");
}
