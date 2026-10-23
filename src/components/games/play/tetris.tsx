"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import type { GameProps } from "../types";

const W = 10, H = 20;
const SHAPES: Record<string, number[][]> = {
  I: [[0, 0, 0, 0], [1, 1, 1, 1], [0, 0, 0, 0], [0, 0, 0, 0]],
  O: [[1, 1], [1, 1]],
  T: [[0, 1, 0], [1, 1, 1], [0, 0, 0]],
  S: [[0, 1, 1], [1, 1, 0], [0, 0, 0]],
  Z: [[1, 1, 0], [0, 1, 1], [0, 0, 0]],
  J: [[1, 0, 0], [1, 1, 1], [0, 0, 0]],
  L: [[0, 0, 1], [1, 1, 1], [0, 0, 0]],
};
const COLOR: Record<string, string> = { I: "#3ec6e0", O: "#f5c400", T: "#a35ce0", S: "#4cc46a", Z: "#ef5a5a", J: "#3f6fe0", L: "#f2913b" };
const TYPES = Object.keys(SHAPES);
const rotate = (m: number[][]) => m[0].map((_, i) => m.map((r) => r[i]).reverse());

type Piece = { t: string; m: number[][]; x: number; y: number };
type State = { board: (string | null)[]; piece: Piece; next: string; bag: string[]; lines: number; score: number; over: boolean; ticks: number; moves: number };

function bag(): string[] {
  return [...TYPES].sort(() => Math.random() - 0.5);
}
function spawn(t: string): Piece {
  const m = SHAPES[t];
  return { t, m, x: Math.floor((W - m[0].length) / 2), y: t === "I" ? -1 : 0 };
}
function fits(board: (string | null)[], p: Piece) {
  return p.m.every((row, r) => row.every((v, c) => {
    if (!v) return true;
    const x = p.x + c, y = p.y + r;
    return x >= 0 && x < W && y < H && (y < 0 || !board[y * W + x]);
  }));
}
function init(): State {
  const b = bag();
  const first = b.pop()!;
  const next = b.pop()!;
  return { board: Array(W * H).fill(null), piece: spawn(first), next, bag: b, lines: 0, score: 0, over: false, ticks: 0, moves: 0 };
}

type Action = { type: "left" | "right" | "rotate" | "down" | "drop" | "tick" };
function lock(s: State): State {
  const board = [...s.board];
  let over = false;
  s.piece.m.forEach((row, r) => row.forEach((v, c) => {
    if (!v) return;
    const y = s.piece.y + r;
    if (y < 0) over = true;
    else board[y * W + s.piece.x + c] = s.piece.t;
  }));
  const kept: (string | null)[] = [];
  let cleared = 0;
  for (let y = 0; y < H; y++) {
    const row = board.slice(y * W, y * W + W);
    if (row.every(Boolean)) cleared++;
    else kept.push(...row);
  }
  const nb = [...Array(cleared * W).fill(null), ...kept];
  const level = Math.floor(s.lines / 10) + 1;
  let b2 = s.bag.length ? s.bag : bag();
  const nextType = b2[b2.length - 1];
  b2 = b2.slice(0, -1);
  const piece = spawn(s.next);
  return { ...s, board: nb, piece, next: nextType, bag: b2, lines: s.lines + cleared, score: s.score + [0, 100, 300, 500, 800][cleared] * level, over: over || !fits(nb, piece), moves: s.moves + 1 };
}
function reducer(s: State, a: Action): State {
  if (s.over) return s;
  const move = (dx: number, dy: number, m = s.piece.m): State | null => {
    const p = { ...s.piece, x: s.piece.x + dx, y: s.piece.y + dy, m };
    return fits(s.board, p) ? { ...s, piece: p } : null;
  };
  switch (a.type) {
    case "left": return move(-1, 0) ?? s;
    case "right": return move(1, 0) ?? s;
    case "rotate": {
      const m = rotate(s.piece.m);
      return move(0, 0, m) ?? move(-1, 0, m) ?? move(1, 0, m) ?? move(-2, 0, m) ?? move(2, 0, m) ?? s;
    }
    case "down": return move(0, 1) ?? lock(s);
    case "tick": { const n = move(0, 1); return n ? { ...n, ticks: s.ticks + 1 } : lock(s); }
    case "drop": {
      let y = s.piece.y;
      while (fits(s.board, { ...s.piece, y: y + 1 })) y++;
      return lock({ ...s, piece: { ...s.piece, y }, score: s.score + (y - s.piece.y) * 2 });
    }
  }
}

/** Tetris — Marathon (play on), Sprint (clear 40 lines) or Ultra (best score in 2 minutes). */
export default function Tetris({ option, paused, onReport, onEnd, onControls }: GameProps) {
  const [s, dispatch] = useReducer(reducer, undefined, init);
  const [secs, setSecs] = useState(0);
  const ended = useRef(false);
  const level = Math.floor(s.lines / 10) + 1;

  useEffect(() => onControls({}), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (paused || s.over) return;
    const id = setInterval(() => setSecs((x) => x + 1), 1000);
    return () => clearInterval(id);
  }, [paused, s.over]);

  useEffect(() => {
    if (paused || s.over) return;
    const id = setInterval(() => dispatch({ type: "tick" }), Math.max(90, 700 - (level - 1) * 60));
    return () => clearInterval(id);
  }, [paused, s.over, level]);

  useEffect(() => {
    if (paused) return;
    const onKey = (e: KeyboardEvent) => {
      const map: Record<string, Action["type"]> = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "rotate", ArrowDown: "down", " ": "drop", x: "rotate", z: "rotate" };
      const t = map[e.key];
      if (!t) return;
      e.preventDefault();
      dispatch({ type: t });
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [paused]);

  // Ultra: two minutes of play time
  const ultraLeft = option === 2 ? Math.max(0, 120 - secs) : null;
  useEffect(() => {
    onReport({ moves: s.moves, stat: option === 2 ? `${s.lines} · ${ultraLeft}s` : s.lines, progress: option === 2 ? 1 - (ultraLeft ?? 120) / 120 : Math.min(1, s.lines / 40) });
    if (ended.current) return;
    const sprintDone = option === 1 && s.lines >= 40;
    const ultraDone = option === 2 && ultraLeft === 0;
    if (s.over || sprintDone || ultraDone) {
      ended.current = true;
      setTimeout(() => onEnd({ won: sprintDone || ultraDone || s.lines >= 40, score: s.score }), 700);
    }
  }, [s, ultraLeft]); // eslint-disable-line react-hooks/exhaustive-deps

  const cells = [...s.board];
  // ghost + active piece
  let gy = s.piece.y;
  while (fits(s.board, { ...s.piece, y: gy + 1 })) gy++;
  const overlay = new Map<number, string>();
  s.piece.m.forEach((row, r) => row.forEach((v, c) => {
    if (!v) return;
    const gi = (gy + r) * W + s.piece.x + c;
    if (gy + r >= 0) overlay.set(gi, "ghost");
    const i = (s.piece.y + r) * W + s.piece.x + c;
    if (s.piece.y + r >= 0) overlay.set(i, s.piece.t);
  }));
  const next = SHAPES[s.next];
  const controls = ([["left", "◀"], ["right", "▶"], ["rotate", "⟳"], ["down", "▼"], ["drop", "⤓"]] as const).map(([t, g]) => (
    <button key={t} type="button" aria-label={t} onClick={() => dispatch({ type: t })} className={`h-44 min-w-44 cursor-pointer rounded-lg bg-surface-primary text-[18px] text-primary hover:bg-surface-hover ${t === "right" ? "order-1 tablet:order-none" : t === "drop" ? "order-2 col-span-2 tablet:order-none" : ""}`}>{g}</button>
  ));

  return (
    <div className="flex w-full max-w-(--board) flex-col items-center gap-12">
      <div className="flex w-full items-start justify-center gap-12">
        <div className="grid aspect-[1/2] w-[min(66vw,280px)] grid-cols-10 gap-px rounded-[10px] bg-[#162038] p-4 shadow-[0_6px_0_#0b1222] tablet:w-[min(340px,calc((100dvh-240px)/2))] desktop:w-[min(400px,calc((100dvh-210px)/2))]" role="img" aria-label={`Tetris, ${s.lines} lines`}>
          {cells.map((v, i) => {
            const o = overlay.get(i);
            const t = o && o !== "ghost" ? o : v;
            return <span key={i} className="rounded-[2px]" style={{ background: t ? COLOR[t] : o === "ghost" ? "rgb(255 255 255 / 0.12)" : "#1e2a48" }} />;
          })}
        </div>
        <div className="flex flex-col gap-8">
          <span className="type-table-heading text-secondary">NEXT</span>
          <div className="grid w-64 gap-px rounded-md bg-[#162038] p-6" style={{ gridTemplateColumns: `repeat(${next[0].length}, 1fr)` }}>
            {next.flat().map((v, i) => <span key={i} className="aspect-square rounded-[2px]" style={{ background: v ? COLOR[s.next] : "transparent" }} />)}
          </div>
          <span className="type-table-heading text-secondary">SCORE</span>
          <span className="type-subheading text-primary tabular-nums">{s.score}</span>
          <span className="type-table-heading text-secondary">LEVEL</span>
          <span className="type-subheading text-primary tabular-nums">{level}</span>
          <div className="mt-8 hidden w-96 grid-cols-2 gap-8 tablet:grid" aria-label="Controls">{controls}</div>
        </div>
      </div>
      <div className="flex gap-8 tablet:hidden" aria-label="Controls">{controls}</div>
    </div>
  );
}
