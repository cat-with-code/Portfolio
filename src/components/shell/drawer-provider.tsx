"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";

export type DrawerKind = "settings" | "profile" | "approach" | "projects" | "blog-browse" | "blog-post" | "book-library" | "book-brief" | "study-music" | "game-library";

type DrawerState = { open: DrawerKind | null; payloads: Partial<Record<DrawerKind, string>> };
const DrawerContext = createContext<(DrawerState & { setOpen: (d: DrawerKind | null, payload?: string | null) => void }) | null>(null);

/**
 * One drawer at a time, opened from anywhere (sidebar, top bar, page buttons, other drawers).
 * `payload` says what a content drawer shows — a post slug or a book key. Each drawer keeps its last
 * payload, so its content stays put while it slides out.
 */
export function DrawerProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DrawerState>({ open: null, payloads: {} });
  // Switching language rebuilds the page; Settings (where you switched) reopens so you can carry on.
  useEffect(() => {
    try {
      if (sessionStorage.getItem(REOPEN) !== "settings") return;
      sessionStorage.removeItem(REOPEN);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore after a language switch
      setState((s) => ({ ...s, open: "settings" }));
    } catch {}
  }, []);
  const setOpen = useCallback(
    (open: DrawerKind | null, payload: string | null = null) =>
      setState((prev) => ({ open, payloads: open && payload ? { ...prev.payloads, [open]: payload } : prev.payloads })),
    []
  );
  return <DrawerContext.Provider value={{ ...state, setOpen }}>{children}</DrawerContext.Provider>;
}

const REOPEN = "reopen-drawer";
/** Call before switching language from Settings, so Settings is open again on the new page. */
export function reopenSettingsAfterSwitch() {
  try {
    sessionStorage.setItem(REOPEN, "settings");
  } catch {}
}

export function useDrawer() {
  const ctx = useContext(DrawerContext);
  if (!ctx) throw new Error("useDrawer must be used inside DrawerProvider");
  return ctx;
}

/** Props for a Radix Dialog root bound to one drawer kind. */
export function useDrawerState(kind: DrawerKind) {
  const { open, setOpen } = useDrawer();
  return { open: open === kind, onOpenChange: (next: boolean) => setOpen(next ? kind : null) };
}

/** What a content drawer last showed (post slug, book key). */
export function useDrawerPayload(kind: DrawerKind) {
  return useDrawer().payloads[kind] ?? null;
}
