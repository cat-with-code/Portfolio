"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";

const COLORS = ["bg-[#f6efe2]", "bg-[#f5c84c]", "bg-[#6fb7e8]", "bg-[#7fd1a8]", "bg-[#f28b78]"];

function shuffle(n: number) {
  const t = Array.from({ length: n * n }, (_, i) => (i + 1) % (n * n)); // 0 = blank, last
  let blank = n * n - 1, last = -1;
  for (let k = 0; k < n * n * 40; k++) {
    const r = Math.floor(blank / n), c = blank % n;
    const opts = [[r - 1, c], [r + 1, c], [r, c - 1], [r, c + 1]].filter(([rr, cc]) => rr >= 0 && rr < n && cc >= 0 && cc < n).map(([rr, cc]) => rr * n + cc).filter((i) => i !== last);
    const pick = opts[Math.floor(Math.random() * opts.length)];
    [t[blank], t[pick]] = [t[pick], t[blank]];
    last = blank;
    blank = pick;
  }
  return t;
}
const solvedAt = (t: number[], i: number) => t[i] === i + 1;
const distance = (t: number[], n: number) => t.reduce((s, v, i) => (v ? s + Math.abs(Math.floor((v - 1) / n) - Math.floor(i / n)) + Math.abs(((v - 1) % n) - (i % n)) : s), 0);

/** Sliding Puzzle — 3×3, 4×4 or 5×5; click a tile in the blank's row or column (or use the arrow keys). */
export default function SlidingPuzzle({ option, paused, onReport, onEnd, onControls }: GameProps) {
  const n = [3, 4, 5][option];
  const [tiles, setTiles] = useState(() => shuffle(n));
  const [history, setHistory] = useState<number[][]>([]);
  const [hint, setHint] = useState<number | null>(null);
  const ended = useRef(false);
  const blank = tiles.indexOf(0);
  const inPlace = tiles.filter((v, i) => v && solvedAt(tiles, i)).length;
  const moves = history.length;

  const slideFrom = (i: number) => {
    if (paused || ended.current || i === blank) return;
    const br = Math.floor(blank / n), bc = blank % n, r = Math.floor(i / n), c = i % n;
    if (br !== r && bc !== c) return;
    const t = [...tiles];
    const step = c > bc ? 1 : -1;
    let cur = blank;
    if (br === r) while (cur !== i) { const nx = cur + step; [t[cur], t[nx]] = [t[nx], t[cur]]; cur = nx; }
    else { const vs = r > br ? n : -n; while (cur !== i) { const nx = cur + vs; [t[cur], t[nx]] = [t[nx], t[cur]]; cur = nx; } }
    setHistory((h) => [...h, tiles]);
    setTiles(t);
    setHint(null);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, number> = { ArrowLeft: 1, ArrowRight: -1, ArrowUp: n, ArrowDown: -n };
      if (!(e.key in map)) return;
      const from = blank + map[e.key];
      if (from < 0 || from >= n * n || (Math.abs(map[e.key]) === 1 && Math.floor(from / n) !== Math.floor(blank / n))) return;
      e.preventDefault();
      slideFrom(from);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    onReport({ moves, stat: `${inPlace}/${n * n - 1}`, progress: inPlace / (n * n - 1) });
    if (!ended.current && inPlace === n * n - 1) {
      ended.current = true;
      setTimeout(() => onEnd({ won: true, score: Math.max(10, n * n * 30 - moves) }), 600);
    }
  }, [tiles]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      undo: history.length ? () => { setTiles(history[history.length - 1]); setHistory((h) => h.slice(0, -1)); } : undefined,
      hint: () => {
        // Greedy: the neighbour move that most reduces total distance
        const opts = [blank - n, blank + n, ...(blank % n ? [blank - 1] : []), ...(blank % n < n - 1 ? [blank + 1] : [])].filter((i) => i >= 0 && i < n * n);
        let best = opts[0], bestD = Infinity;
        for (const o of opts) {
          const t = [...tiles];
          [t[blank], t[o]] = [t[o], t[blank]];
          const d = distance(t, n) + (history.length && history[history.length - 1].join() === t.join() ? 99 : 0);
          if (d < bestD) [best, bestD] = [o, d];
        }
        setHint(best);
      },
    });
  }, [history, tiles]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="grid aspect-square w-full max-w-(--board) gap-8 rounded-[20px] bg-[#cbbfae] p-10 shadow-[0_6px_0_#a8998a]" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} role="grid" aria-label="Sliding puzzle">
      {tiles.map((v, i) =>
        v ? (
          <button
            key={v}
            type="button"
            onClick={() => slideFrom(i)}
            aria-label={`Tile ${v}`}
            className={`flex cursor-pointer items-center justify-center rounded-[14px] font-bold text-[#22262e] shadow-[0_4px_0_rgb(0_0_0/0.18)] transition-transform duration-150 hover:-translate-y-1 ${COLORS[(v - 1) % COLORS.length]} ${solvedAt(tiles, i) ? "" : "opacity-95"} ${hint === i ? "ring-4 ring-(--color-bg-brand)" : ""} ${n === 5 ? "text-[clamp(18px,5vw,30px)]" : "text-[clamp(22px,7vw,44px)]"}`}
          >
            {v}
          </button>
        ) : (
          <span key="blank" className="rounded-[14px] bg-[#b3a693]" />
        )
      )}
    </div>
  );
}
