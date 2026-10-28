"use client";

import { usePathname } from "next/navigation";
import { Suspense, useEffect, useState, type ReactNode } from "react";
import { dashboardSkeleton, siteSkeleton } from "./skeleton";

/** How long a page switch shows its skeleton, at least (loading time counts towards it). */
const HOLD_MS = 900;

/** When the current page switch started (link click or Back/Forward), so loading time counts towards the hold. */
let navStart: number | null = null;

if (typeof window !== "undefined") {
  document.addEventListener(
    "click",
    (e) => {
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.target as Element | null)?.closest?.("a[href]") as HTMLAnchorElement | null;
      if (!a || (a.target && a.target !== "_self") || a.hasAttribute("download")) return;
      const to = new URL(a.href, location.href);
      // Only a move to another page of this site; same-page links (#section) don't count.
      if (to.origin === location.origin && to.pathname !== location.pathname) navStart = performance.now();
    },
    true
  );
  window.addEventListener("popstate", () => (navStart = performance.now()));
}

type Variant = "site" | "dashboard";
const skeletonFor = (variant: Variant, pathname: string | null, label: string) => (variant === "site" ? siteSkeleton : dashboardSkeleton)(pathname, label);

/** The skeleton of the page at the current address (for loading.tsx and other fallbacks). */
export function RouteSkeleton({ variant, label }: { variant: Variant; label: string }) {
  // On the 404 catch-all the address isn't known while prerendering: show a plain skeleton there.
  return (
    <Suspense fallback={skeletonFor(variant, null, label)}>
      <CurrentSkeleton variant={variant} label={label} />
    </Suspense>
  );
}

function CurrentSkeleton({ variant, label }: { variant: Variant; label: string }) {
  return skeletonFor(variant, usePathname(), label);
}

/**
 * Calm page switches: when the address changes, the page's skeleton stays up until HOLD_MS have passed since the
 * click, then the new page fades in. The skeleton is the new page's own (same layout, grey blocks). A first visit or
 * reload shows the server-rendered page straight away.
 */
export function PageHold({ variant, label, children }: { variant: Variant; label: string; children: ReactNode }) {
  // The address isn't known while prerendering the 404 catch-all; that page simply renders without the hold.
  return (
    <Suspense fallback={children}>
      <Hold variant={variant} label={label}>
        {children}
      </Hold>
    </Suspense>
  );
}

function Hold({ variant, label, children }: { variant: Variant; label: string; children: ReactNode }) {
  const pathname = usePathname();
  /** The address whose page is on screen; differs from `pathname` while holding. */
  const [shown, setShown] = useState(pathname);
  const [switched, setSwitched] = useState(false);

  useEffect(() => {
    if (pathname === shown) return;
    const start = navStart ?? performance.now();
    navStart = null;
    const id = setTimeout(() => {
      setShown(pathname);
      setSwitched(true);
    }, Math.max(0, HOLD_MS - (performance.now() - start)));
    return () => clearTimeout(id);
  }, [pathname, shown]);

  if (pathname !== shown) return skeletonFor(variant, pathname, label);
  // Keyed by address so the fade replays on every switch
  return (
    <div key={shown} className={switched ? "motion-safe:animate-dissolve-in" : undefined}>
      {children}
    </div>
  );
}
