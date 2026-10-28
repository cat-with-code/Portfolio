"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type Pos = { x: number; y: number; w: number };
/** Keeps the card on screen, below the 72px top bar. */
const clamp = (p: Pos, h: number): Pos => ({
  ...p,
  w: Math.min(p.w, window.innerWidth - 16),
  x: Math.min(Math.max(8, p.x), window.innerWidth - Math.min(p.w, window.innerWidth - 16) - 8),
  y: Math.min(Math.max(80, p.y), window.innerHeight - h - 8),
});

/**
 * Floating card (music mini player, floating reader): sits where `className` puts it until dragged, then stays where it was
 * dropped (remembered under `storageKey`). A tap still works its buttons; only a press that moves 5px or more drags.
 */
export function FloatingCard({ storageKey, label, className, children }: { storageKey: string; label: string; className: string; children: ReactNode }) {
  const el = useRef<HTMLElement>(null);
  const [pos, setPos] = useState<Pos | null>(null);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ sx: number; sy: number; ox: number; oy: number; h: number; moved: boolean; to: Pos; frame: number } | null>(null);
  const justDragged = useRef(false);

  // Restore the last spot, and keep it on screen when the window resizes.
  useEffect(() => {
    const fit = () => setPos((p) => (p && el.current ? clamp(p, el.current.offsetHeight) : p));
    try {
      const saved = JSON.parse(localStorage.getItem(storageKey) ?? "null") as Pos | null;
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage
      if (saved) setPos(saved);
    } catch {}
    requestAnimationFrame(fit);
    window.addEventListener("resize", fit);
    return () => window.removeEventListener("resize", fit);
  }, [storageKey]);

  return (
    <section
      ref={el}
      aria-label={label}
      onPointerDown={(e) => {
        if (e.button !== 0) return;
        const r = e.currentTarget.getBoundingClientRect();
        drag.current = { sx: e.clientX, sy: e.clientY, ox: r.left, oy: r.top, h: r.height, moved: false, to: { x: r.left, y: r.top, w: r.width }, frame: 0 };
      }}
      onPointerMove={(e) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.sx;
        const dy = e.clientY - d.sy;
        if (!d.moved && Math.hypot(dx, dy) < 5) return;
        const node = e.currentTarget;
        if (!d.moved) {
          d.moved = true;
          setDragging(true);
          node.setPointerCapture(e.pointerId);
        }
        // Move with a transform, once per frame, without re-rendering; the new spot is committed on release.
        d.to = clamp({ x: d.ox + dx, y: d.oy + dy, w: d.to.w }, d.h);
        if (!d.frame)
          d.frame = requestAnimationFrame(() => {
            d.frame = 0;
            node.style.transform = `translate3d(${d.to.x - d.ox}px, ${d.to.y - d.oy}px, 0)`;
          });
      }}
      onPointerUp={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d?.moved) return;
        cancelAnimationFrame(d.frame);
        // Swap the transform for left/top in the same frame, so the card doesn't jump.
        Object.assign(e.currentTarget.style, { transform: "", left: `${d.to.x}px`, top: `${d.to.y}px`, right: "auto", bottom: "auto", width: `${d.to.w}px` });
        setPos(d.to);
        setDragging(false);
        // Swallow the click that follows a drag, so dropping on a button or a link doesn't trigger it.
        justDragged.current = true;
        setTimeout(() => (justDragged.current = false));
        try {
          localStorage.setItem(storageKey, JSON.stringify(d.to));
        } catch {}
      }}
      onPointerCancel={(e) => {
        const d = drag.current;
        drag.current = null;
        if (!d?.moved) return;
        cancelAnimationFrame(d.frame);
        e.currentTarget.style.transform = "";
        setDragging(false);
      }}
      onClickCapture={(e) => {
        if (!justDragged.current) return;
        e.preventDefault();
        e.stopPropagation();
      }}
      onDragStart={(e) => e.preventDefault()}
      style={pos ? { left: pos.x, top: pos.y, right: "auto", bottom: "auto", width: pos.w } : undefined}
      className={`fixed z-30 flex touch-none flex-col overflow-clip rounded-card border border-general-default bg-surface-primary shadow-modal select-none animate-dissolve-in ${className} ${dragging ? "cursor-grabbing will-change-transform" : "cursor-grab"}`}
    >
      {children}
    </section>
  );
}
