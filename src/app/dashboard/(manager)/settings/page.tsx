import type { Metadata } from "next";
import { SettingsForm } from "@/components/dashboard/settings-form";

export const metadata: Metadata = { title: "Settings" };

/** Dashboard / Settings (Figma Desktop 1346:2165 · content 1363:3308). */
export default function SettingsPage() {
  return <SettingsForm />;
}
