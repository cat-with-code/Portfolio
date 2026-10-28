"use server";

import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { profileLinks } from "@/content/profile";
import { supabaseAdmin } from "@/lib/supabase/admin";

export type ContactInput = { name: string; email: string; message: string; choices: string[]; website?: string };
export type ContactResult = { ok: true } | { ok: false; reason: "invalid" | "unconfigured" | "failed" | "busy" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

/**
 * At most 5 messages per sender per 10 minutes. This in-memory count is per server instance — a quick first speed
 * bump; the database count below is the real limit.
 */
const WINDOW = 10 * 60_000;
const LIMIT = 5;
const sent = new Map<string, number[]>();
function allow(ip: string) {
  const now = Date.now();
  const recent = (sent.get(ip) ?? []).filter((t) => now - t < WINDOW);
  if (recent.length >= LIMIT) return false;
  sent.set(ip, [...recent, now]);
  if (sent.size > 5000) sent.clear();
  return true;
}

/** Over all senders: at most this many messages an hour, so a flood can't bury the Inbox. */
const HOURLY_CAP = 60;

/** Keyed hash of the sender's address (raw IPs are never stored). */
const senderHash = (ip: string) => createHmac("sha256", process.env.SUPABASE_SERVICE_ROLE_KEY ?? "").update(ip).digest("hex");

type Admin = NonNullable<ReturnType<typeof supabaseAdmin>>;
/** Saves the message for the Inbox. "busy" when the sender (or everyone together) is over the limit. */
async function store(db: Admin, row: { name: string; email: string; message: string; choices: string[] }, ip: string): Promise<"saved" | "busy" | "failed"> {
  const hash = senderHash(ip);
  const since = (ms: number) => new Date(Date.now() - ms).toISOString();
  const [mine, all] = await Promise.all([
    db.from("messages").select("id", { count: "exact", head: true }).eq("sender_hash", hash).gte("created_at", since(WINDOW)),
    db.from("messages").select("id", { count: "exact", head: true }).gte("created_at", since(60 * 60_000)),
  ]);
  if (mine.error || all.error) return "failed";
  if ((mine.count ?? 0) >= LIMIT || (all.count ?? 0) >= HOURLY_CAP) return "busy";
  const { error } = await db.from("messages").insert({ ...row, sender_hash: hash });
  if (error) console.error("couldn't save a contact message", error.message);
  return error ? "failed" : "saved";
}

/** The owner's "Email me about new messages" setting (on unless switched off). */
async function wantsEmail(db: Admin | null) {
  if (!db) return true;
  const { data } = await db.from("settings").select("prefs").eq("id", 1).maybeSingle();
  return (data?.prefs as Record<string, unknown> | undefined)?.["email-messages"] !== false;
}

/**
 * Contact form: saves the message to the dashboard Inbox (Supabase), then emails a copy through Resend
 * (https://resend.com) if RESEND_API_KEY is set and the owner wants email. Either one succeeding counts as sent.
 * With neither, the client falls back to opening the visitor's mail app (see contact-form.tsx).
 * Env: SUPABASE_SERVICE_ROLE_KEY, RESEND_API_KEY, optional CONTACT_FROM (a verified sender) and CONTACT_TO.
 */
export async function sendContactMessage(input: ContactInput): Promise<ContactResult> {
  // Names go into the email subject: no line breaks.
  const name = clip(input.name, 120).replace(/[\r\n]+/g, " ");
  const email = clip(input.email, 200);
  const message = clip(input.message, 5000);
  const choices = Array.isArray(input.choices) ? input.choices.map((c) => clip(c, 40)).filter(Boolean).slice(0, 4) : [];
  // Honeypot: real visitors never see or fill the "website" field.
  if (clip(input.website, 200)) return { ok: true };
  if (!name || !EMAIL.test(email) || !message) return { ok: false, reason: "invalid" };

  const ip = (await headers()).get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  if (!allow(ip)) return { ok: false, reason: "busy" };

  const db = supabaseAdmin();
  const saved = db ? await store(db, { name, email, message, choices }, ip) : null;
  if (saved === "busy") return { ok: false, reason: "busy" };

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? profileLinks.email;
  if (!key || !to || !(await wantsEmail(db))) return saved === "saved" ? { ok: true } : { ok: false, reason: saved ? "failed" : "unconfigured" };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: process.env.CONTACT_FROM ?? "Portfolio <onboarding@resend.dev>",
      to: [to],
      reply_to: email,
      subject: `Portfolio message from ${name}`,
      text: `${message}\n\nPlanning: ${choices.join(", ") || "—"}\nFrom: ${name} <${email}>`,
    }),
  }).catch(() => null);
  return res?.ok || saved === "saved" ? { ok: true } : { ok: false, reason: "failed" };
}
