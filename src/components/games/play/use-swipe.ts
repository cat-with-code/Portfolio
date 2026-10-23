"use client";

import { useRef } from "react";

export type SwipeDir = "left" | "right" | "up" | "down";

/** Pointer-based swipe detection for board games (spread the returned handlers on the board). */
export function useSwipe(onSwipe: (d: SwipeDir) => void, threshold = 24) {
  const start = useRef<{ x: number; y: number } | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      start.current = { x: e.clientX, y: e.clientY };
    },
    onPointerUp: (e: React.PointerEvent) => {
      if (!start.current) return;
      const dx = e.clientX - start.current.x;
      const dy = e.clientY - start.current.y;
      start.current = null;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < threshold) return;
      onSwipe(Math.abs(dx) > Math.abs(dy) ? (dx > 0 ? "right" : "left") : dy > 0 ? "down" : "up");
    },
  };
}
