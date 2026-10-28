import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import en from "./en.json";
import km from "./km.json";
import zh from "./zh.json";

export const locales = ["en", "km", "zh"] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = "en";

export type Dictionary = typeof en;

export const hasLocale = (value: string): value is Locale => (locales as readonly string[]).includes(value);

type DeepPartial<T> = { [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K] };

// Khmer and Chinese strings come from the Figma "Interface language" collection. Anything without a
// translation there falls back to English instead of an invented translation.
function withFallback<T extends object>(base: T, override: DeepPartial<T>): T {
  const out = { ...base } as Record<string, unknown>;
  for (const [key, value] of Object.entries(override)) {
    const current = out[key];
    out[key] =
      value && typeof value === "object" && current && typeof current === "object"
        ? withFallback(current as object, value as object)
        : value;
  }
  return out as T;
}

const dictionaries: Record<Locale, Dictionary> = {
  en,
  km: withFallback(en, km),
  zh: withFallback(en, zh),
};

export async function getLocale(): Promise<Locale> {
  const value = await lang();
  // undefined outside the [lang] root layout (the dashboard has its own)
  if (!value || !hasLocale(value)) notFound();
  return value;
}

export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()];
}
