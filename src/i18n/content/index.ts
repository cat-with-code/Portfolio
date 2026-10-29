/**
 * Page text in the visitor's language: the English source with the Khmer / Chinese translation laid over it.
 * Anything not translated stays English. Server components: tr(await getLocale(), "form");
 * client components: useT("form").
 */
import { sources, type Sources } from "./sources";
import { km } from "./km";
import { zh } from "./zh";
import type { Overlay } from "./types";

const overlays: Record<string, Overlay> = { km, zh };

/** Lays `over` onto `base`: text and templates are replaced; objects merge; keyed lists match by key. */
export function merge(base: unknown, over: unknown): unknown {
  if (over === undefined || over === null) return base;
  if (Array.isArray(base)) {
    if (!Array.isArray(over)) return base;
    const id = ["key", "id"].find((f) => base.length > 0 && base.every((b) => b && typeof b === "object" && f in b));
    return base.map((b, i) => merge(b, id ? over.find((o) => o && typeof o === "object" && o[id] === b[id]) : over[i]));
  }
  if (base && typeof base === "object" && typeof base !== "function") {
    if (!over || typeof over !== "object") return base;
    const out: Record<string, unknown> = { ...(base as Record<string, unknown>) };
    for (const k of Object.keys(over)) out[k] = k in out ? merge(out[k], (over as Record<string, unknown>)[k]) : out[k];
    return out;
  }
  return typeof over === typeof base ? over : base;
}

const cache = new Map<string, unknown>();

export function tr<K extends keyof Sources>(lang: string, key: K): Sources[K] {
  const overlay = overlays[lang]?.[key];
  if (!overlay) return sources[key];
  const id = `${lang}:${key}`;
  if (!cache.has(id)) cache.set(id, merge(sources[key], overlay));
  return cache.get(id) as Sources[K];
}
