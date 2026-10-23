"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";

const LEVELS = [
  { cols: 9, rows: 9, mines: 10 },
  { cols: 14, rows: 14, mines: 32 },
  { cols: 20, rows: 16, mines: 66 },
];
type Cell = { mine: boolean; open: boolean; flag: boolean; n: number };
const NUM = ["", "text-[#2563d9]", "text-[#1f9d55]", "text-[#e5484d]", "text-[#5b3cc4]", "text-[#b54708]", "text-[#0e7c86]", "text-[#111]", "text-[#666]"];

function neighbours(i: number, cols: number, rows: number) {
  const r = Math.floor(i / cols), c = i % cols, out: number[] = [];
  for (let dr = -1; dr <= 1; dr++)
    for (let dc = -1; dc <= 1; dc++) {
      if (!dr && !dc) continue;
      const rr = r + dr, cc = c + dc;
      if (rr >= 0 && rr < rows && cc >= 0 && cc < cols) out.push(rr * cols + cc);
    }
  return out;
}

function generate(cols: number, rows: number, mines: number, safe: number): Cell[] {
  const keepClear = new Set([safe, ...neighbours(safe, cols, rows)]);
  const cells: Cell[] = Array.from({ length: cols * rows }, () => ({ mine: false, open: false, flag: false, n: 0 }));
  let placed = 0;
  while (placed < mines) {
    const i = Math.floor(Math.random() * cells.length);
    if (cells[i].mine || keepClear.has(i)) continue;
    cells[i].mine = true;
    placed++;
  }
  cells.forEach((c, i) => (c.n = neighbours(i, cols, rows).filter((j) => cells[j].mine).length));
  return cells;
}

function flood(cells: Cell[], start: number, cols: number, rows: number) {
  const stack = [start];
  while (stack.length) {
    const i = stack.pop()!;
    const c = cells[i];
    if (c.open || c.flag) continue;
    c.open = true;
    if (c.n === 0 && !c.mine) stack.push(...neighbours(i, cols, rows));
  }
}

/** Minesweeper — right-click or long-press (or Flag mode) to flag; click a number to clear around it. */
export default function Minesweeper({ option, paused, onReport, onEnd, onControls }: GameProps) {
  const { cols, rows, mines } = LEVELS[option];
  const [cells, setCells] = useState<Cell[] | null>(null);
  const [flagMode, setFlagMode] = useState(false);
  const [moves, setMoves] = useState(0);
  const [boom, setBoom] = useState<number | null>(null);
  const press = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressed = useRef(false);
  const ended = useRef(false);
  const safeTotal = cols * rows - mines;
  const opened = cells?.filter((c) => c.open && !c.mine).length ?? 0;
  const flags = cells?.filter((c) => c.flag).length ?? 0;

  useEffect(() => {
    onReport({ moves, stat: `${flags}/${mines}`, progress: opened / safeTotal });
    if (ended.current || !cells) return;
    if (boom !== null) {
      ended.current = true;
      setTimeout(() => onEnd({ won: false, score: opened }), 1200);
    } else if (opened === safeTotal) {
      ended.current = true;
      setTimeout(() => onEnd({ won: true, score: Math.max(10, safeTotal * 4 - moves) }), 700);
    }
  }, [cells, boom]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      hint: cells && boom === null
        ? () => {
            const safe = cells.map((c, i) => (!c.mine && !c.open ? i : -1)).filter((i) => i >= 0);
            if (!safe.length) return;
            const next = cells.map((c) => ({ ...c }));
            flood(next, safe[Math.floor(Math.random() * safe.length)], cols, rows);
            setCells(next);
          }
        : undefined,
    });
  }, [cells, boom]); // eslint-disable-line react-hooks/exhaustive-deps

  const reveal = (i: number) => {
    if (paused || boom !== null || ended.current) return;
    const next = cells ? cells.map((c) => ({ ...c })) : generate(cols, rows, mines, i);
    const c = next[i];
    if (c.flag) return;
    if (c.open && c.n > 0) {
      // chord: open neighbours when enough flags are placed
      const ns = neighbours(i, cols, rows);
      if (ns.filter((j) => next[j].flag).length !== c.n) return;
      for (const j of ns) if (!next[j].flag && !next[j].open) {
        if (next[j].mine) { next[j].open = true; setBoom(j); }
        else flood(next, j, cols, rows);
      }
    } else if (c.mine) {
      c.open = true;
      setBoom(i);
    } else flood(next, i, cols, rows);
    setCells(next);
    setMoves((m) => m + 1);
  };
  const toggleFlag = (i: number) => {
    if (paused || !cells || boom !== null || cells[i].open) return;
    setCells(cells.map((c, j) => (j === i ? { ...c, flag: !c.flag } : c)));
  };

  return (
    <div className="flex w-full max-w-(--board) flex-col items-center gap-12">
      <div className="w-full overflow-x-auto">
        <div
          className="grid gap-[2px] rounded-[14px] bg-[#9aa6b8] p-[6px] shadow-[0_6px_0_#7d889b]"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(18px, 1fr))`, minWidth: cols > 14 ? cols * 20 : undefined }}
          role="grid"
          aria-label={`Minesweeper, ${mines} mines`}
          onContextMenu={(e) => e.preventDefault()}
        >
          {Array.from({ length: cols * rows }, (_, i) => {
            const c = cells?.[i];
            const showMine = c?.mine && (c.open || boom !== null);
            return (
              <button
                key={i}
                type="button"
                aria-label={c?.open ? (c.mine ? "Mine" : c.n ? `${c.n}` : "Empty") : c?.flag ? "Flagged" : "Hidden"}
                onClick={() => (longPressed.current ? (longPressed.current = false) : flagMode ? toggleFlag(i) : reveal(i))}
                onContextMenu={(e) => { e.preventDefault(); toggleFlag(i); }}
                onPointerDown={(e) => {
                  if (e.pointerType !== "touch") return;
                  press.current = setTimeout(() => { longPressed.current = true; toggleFlag(i); }, 420);
                }}
                onPointerUp={() => press.current && clearTimeout(press.current)}
                onPointerLeave={() => press.current && clearTimeout(press.current)}
                className={`flex aspect-square items-center justify-center rounded-[4px] text-[clamp(10px,2.6vw,15px)] font-bold select-none ${c?.open || showMine ? (boom === i ? "bg-[#ffb4b4]" : "bg-[#eef1f5]") : "cursor-pointer bg-[#cdd5df] shadow-[inset_0_-3px_0_rgb(0_0_0/0.15)] hover:bg-[#d9e0e8]"} ${c?.open && c.n ? NUM[c.n] : ""}`}
              >
                {showMine ? "●" : c?.open ? (c.n || "") : c?.flag ? <span className="text-[#e5484d]">⚑</span> : ""}
              </button>
            );
          })}
        </div>
      </div>
      <button
        type="button"
        aria-pressed={flagMode}
        onClick={() => setFlagMode((f) => !f)}
        className={`type-label h-36 cursor-pointer rounded-full px-16 ${flagMode ? "bg-brand text-on-brand" : "border border-general-default bg-surface-primary text-primary"}`}
      >
        ⚑ Flag mode {flagMode ? "on" : "off"}
      </button>
    </div>
  );
}
