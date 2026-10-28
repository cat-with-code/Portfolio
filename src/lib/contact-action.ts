"use server";

import { headers } from "next/headers";
import { profileLinks } from "@/content/profile";

export type ContactInput = { name: string; email: string; message: string; choices: string[]; website?: string };
export type ContactResult = { ok: true } | { ok: false; reason: "invalid" | "unconfigured" | "failed" | "busy" };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const clip = (s: unknown, n: number) => (typeof s === "string" ? s.trim().slice(0, n) : "");

/** At most 5 messages per sender per 10 minutes. Per server instance — a speed bump for bots, not a guarantee. */
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

/**
 * Sends the Contact form through Resend (https://resend.com) when RESEND_API_KEY is set.
 * Without it the client falls back to opening the visitor's mail app (see contact-form.tsx).
 * Env: RESEND_API_KEY, optional CONTACT_FROM (a verified sender) and CONTACT_TO.
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

  const key = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO ?? profileLinks.email;
  if (!key || !to) return { ok: false, reason: "unconfigured" };

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
  return res?.ok ? { ok: true } : { ok: false, reason: "failed" };
}
