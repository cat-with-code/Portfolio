"use client";

import { useEffect } from "react";

const EVERY_MS = 5 * 60_000;

/**
 * Counts typing and clicking in the dashboard as activity, so writing a long story without changing pages never runs
 * into the inactivity limit (lib/supabase/session-policy). At most one quiet ping every 5 minutes; it stops for good
 * once the session has ended (the proxy then answers with a redirect to Sign in).
 */
export function SessionKeepAlive() {
  useEffect(() => {
    let last = Date.now();
    let stopped = false;
    const ping = () => {
      if (stopped || Date.now() - last < EVERY_MS) return;
      last = Date.now();
      fetch("/dashboard/keepalive", { cache: "no-store", redirect: "manual" })
        .then((res) => {
          if (!res.ok) stopped = true;
        })
        .catch(() => {});
    };
    const events = ["keydown", "pointerdown", "input", "wheel"] as const;
    events.forEach((e) => window.addEventListener(e, ping, { passive: true, capture: true }));
    return () => events.forEach((e) => window.removeEventListener(e, ping, { capture: true }));
  }, []);
  return null;
}
