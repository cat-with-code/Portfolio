import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SecurityCard, type Factor } from "@/components/dashboard/security-card";
import { SettingsForm, type SettingsValues } from "@/components/dashboard/settings-form";
import { getOwner } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Settings" };

const defaults: SettingsValues = { name: "", email: "", language: "en", prefs: { "email-messages": true, "reading-time": true, indexing: true } };

/** Dashboard / Settings (Figma Desktop 1346:2165 · content 1363:3308): your saved settings, read as the owner. */
export default async function SettingsPage() {
  const owner = await getOwner();
  if (!owner) redirect("/dashboard/sign-in");
  const [{ data }, { data: mfa }] = await Promise.all([owner.supabase.from("settings").select("name,email,language,prefs").eq("id", 1).maybeSingle(), owner.supabase.auth.mfa.listFactors()]);
  const initial: SettingsValues = data ? { ...defaults, ...data, prefs: { ...defaults.prefs, ...(data.prefs as object) } } : defaults;
  const app = mfa?.totp.find((f) => f.status === "verified");
  const factor: Factor | null = app ? { id: app.id, added: app.created_at } : null;
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <SettingsForm initial={initial} />
      <SecurityCard app={factor} />
    </div>
  );
}
