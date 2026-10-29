"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";
import { useSwipe } from "./use-swipe";
import { useT } from "@/i18n/lang-context";

type Grid = number[]; // 16 cells, 0 = empty
type Dir = "left" | "right" | "up" | "down";
const N = 4;

function addTile(g: Grid): Grid {
  const empty = g.map((v, i) => (v ? -1 : i)).filter((i) => i >= 0);
  if (!empty.length) return g;
  const next = [...g];
  next[empty[Math.floor(Math.random() * empty.length)]] = Math.random() < 0.9 ? 2 : 4;
  return next;
}

function slide(g: Grid, dir: Dir): { grid: Grid; gained: number; moved: boolean } {
  const out = Array(16).fill(0);
  let gained = 0, moved = false;
  for (let k = 0; k < N; k++) {
    const pos = Array.from({ length: N }, (_, j) => {
      if (dir === "left") return k * N + j;
      if (dir === "right") return k * N + (N - 1 - j);
      if (dir === "up") return j * N + k;
      return (N - 1 - j) * N + k;
    });
    const vals = pos.map((p) => g[p]).filter(Boolean);
    const merged: number[] = [];
    for (let i = 0; i < vals.length; i++) {
      if (vals[i] === vals[i + 1]) {
        merged.push(vals[i] * 2);
        gained += vals[i] * 2;
        i++;
      } else merged.push(vals[i]);
    }
    pos.forEach((p, j) => {
      out[p] = merged[j] ?? 0;
      if (out[p] !== g[p]) moved = true;
    });
  }
  return { grid: out, gained, moved };
}

const canMove = (g: Grid) => (["left", "right", "up", "down"] as Dir[]).some((d) => slide(g, d).moved);
const score = (g: Grid) => g.filter((v) => v === 0).length * 10 + Math.max(...g);

function bestDir(g: Grid): Dir | undefined {
  let best: Dir | undefined, bestV = -1;
  for (const d of ["left", "right", "up", "down"] as Dir[]) {
    const r = slide(g, d);
    if (!r.moved) continue;
    // one ply of look-ahead over our next move
    let v = r.gained + score(r.grid);
    for (const d2 of ["left", "right", "up", "down"] as Dir[]) {
      const r2 = slide(r.grid, d2);
      if (r2.moved) v = Math.max(v, r.gained + r2.gained + score(r2.grid));
    }
    if (v > bestV) [best, bestV] = [d, v];
  }
  return best;
}

const TILE: Record<number, string> = {
  2: "bg-[#f4efe6] text-[#5b4a3a]", 4: "bg-[#efe3cc] text-[#5b4a3a]", 8: "bg-[#f6a35b] text-[#fff]", 16: "bg-[#f5814e] text-[#fff]",
  32: "bg-[#f2614b] text-[#fff]", 64: "bg-[#e9473a] text-[#fff]", 128: "bg-[#f3cf62] text-[#fff]", 256: "bg-[#f1c84f] text-[#fff]",
  512: "bg-[#edc23c] text-[#fff]", 1024: "bg-[#5fbf86] text-[#fff]", 2048: "bg-[#21a06b] text-[#fff]",
};

/** 2048 — slide and merge; goal 2048, 4096 or endless. */
export default function Twenty48({ option, paused, onReport, onEnd, onControls }: GameProps) {
  const t = useT("panelCopy").inGame.twenty48;
  const goal = [2048, 4096, Infinity][option];
  const [grid, setGrid] = useState<Grid>(() => addTile(addTile(Array(16).fill(0))));
  const [pts, setPts] = useState(0);
  const [moves, setMoves] = useState(0);
  const [prev, setPrev] = useState<{ grid: Grid; pts: number } | null>(null);
  const [hint, setHint] = useState<Dir | null>(null);
  const ended = useRef(false);
  const max = Math.max(...grid);

  const move = (d: Dir) => {
    if (paused || ended.current) return;
    const r = slide(grid, d);
    if (!r.moved) return;
    setPrev({ grid, pts });
    setGrid(addTile(r.grid));
    setPts((p) => p + r.gained);
    setMoves((m) => m + 1);
    setHint(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Dir> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down" };
      const d = map[e.key];
      if (!d || (e.target as HTMLElement)?.closest?.("input, textarea")) return;
      e.preventDefault();
      move(d);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
  const swipe = useSwipe(move);

  useEffect(() => {
    onReport({ moves, stat: pts, progress: Math.min(1, Math.log2(max) / Math.log2(goal === Infinity ? 2048 : goal)) });
    if (ended.current) return;
    if (max >= goal) {
      ended.current = true;
      setTimeout(() => onEnd({ won: true, score: pts }), 600);
    } else if (!canMove(grid)) {
      ended.current = true;
      setTimeout(() => onEnd({ won: false, score: pts }), 900);
    }
  }, [grid]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      undo: prev ? () => { setGrid(prev.grid); setPts(prev.pts); setPrev(null); } : undefined,
      hint: () => setHint(bestDir(grid) ?? null),
    });
  }, [prev, grid]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex w-full max-w-(--board) flex-col items-center gap-12">
      <div {...swipe} className="grid aspect-square w-full touch-none grid-cols-4 gap-8 rounded-[18px] bg-[#cdbfae] p-8 shadow-[0_6px_0_#a8998a]" role="grid" aria-label={`2048 board, score ${pts}`}>
        {grid.map((v, i) => (
          <div key={i} className={`flex items-center justify-center rounded-[10px] font-bold tabular-nums transition-colors ${v ? (TILE[v] ?? "bg-[#1b7a54] text-[#fff]") : "bg-[#e3d8ca]"} ${v >= 1024 ? "text-[clamp(16px,5vw,30px)]" : v >= 128 ? "text-[clamp(18px,6vw,36px)]" : "text-[clamp(20px,7vw,44px)]"}`}>
            {v || ""}
          </div>
        ))}
      </div>
      <p className="type-caption h-18 text-secondary">{hint ? t.swipe(hint) : t.keys}</p>
    </div>
  );
}
