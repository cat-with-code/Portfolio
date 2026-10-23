"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../types";

type Piece = { c: 0 | 1; k: boolean } | null; // 0 = red, 1 = black
type Board = Piece[];
type Move = { path: number[]; caps: number[] };

const rc = (i: number) => [Math.floor(i / 8), i % 8] as const;
const at = (r: number, c: number) => (r >= 0 && r < 8 && c >= 0 && c < 8 ? r * 8 + c : -1);

function initial(bottom: 0 | 1): Board {
  const b: Board = Array(64).fill(null);
  for (let i = 0; i < 64; i++) {
    const [r, c] = rc(i);
    if ((r + c) % 2 === 1) {
      if (r < 3) b[i] = { c: bottom === 0 ? 1 : 0, k: false };
      if (r > 4) b[i] = { c: bottom, k: false };
    }
  }
  return b;
}

/** Legal moves for `color`; captures are mandatory and multi-jumps continue. */
function legalMoves(b: Board, color: 0 | 1, bottom: 0 | 1): Move[] {
  const fwd = color === bottom ? -1 : 1;
  const jumps: Move[] = [];
  const steps: Move[] = [];
  const dirsOf = (p: NonNullable<Piece>) => (p.k ? [[1, 1], [1, -1], [-1, 1], [-1, -1]] : [[fwd, 1], [fwd, -1]]);
  const jumpFrom = (board: Board, i: number, p: NonNullable<Piece>, path: number[], caps: number[]) => {
    const [r, c] = rc(i);
    let extended = false;
    for (const [dr, dc] of dirsOf(p)) {
      const mid = at(r + dr, c + dc), to = at(r + 2 * dr, c + 2 * dc);
      if (mid < 0 || to < 0 || board[to] || !board[mid] || board[mid]!.c === color || caps.includes(mid)) continue;
      const nb = [...board];
      nb[to] = p;
      nb[i] = null;
      const [tr] = rc(to);
      const crowned = !p.k && (tr === 0 || tr === 7);
      extended = true;
      if (crowned) jumps.push({ path: [...path, to], caps: [...caps, mid] });
      else jumpFrom(nb, to, p, [...path, to], [...caps, mid]);
    }
    if (!extended && caps.length) jumps.push({ path, caps });
  };
  b.forEach((p, i) => {
    if (!p || p.c !== color) return;
    jumpFrom(b, i, p, [i], []);
    const [r, c] = rc(i);
    for (const [dr, dc] of dirsOf(p)) {
      const to = at(r + dr, c + dc);
      if (to >= 0 && !b[to]) steps.push({ path: [i, to], caps: [] });
    }
  });
  return jumps.length ? jumps : steps;
}

function apply(b: Board, m: Move): Board {
  const nb = [...b];
  const p = nb[m.path[0]]!;
  nb[m.path[0]] = null;
  m.caps.forEach((i) => (nb[i] = null));
  const to = m.path[m.path.length - 1];
  const [r] = rc(to);
  nb[to] = { c: p.c, k: p.k || r === 0 || r === 7 };
  return nb;
}

function evaluate(b: Board, me: 0 | 1, bottom: 0 | 1) {
  let s = 0;
  b.forEach((p, i) => {
    if (!p) return;
    const [r, c] = rc(i);
    const adv = p.c === bottom ? 7 - r : r;
    const v = (p.k ? 175 : 100 + adv * 4) + (c > 1 && c < 6 ? 4 : 0);
    s += p.c === me ? v : -v;
  });
  return s;
}

function search(b: Board, depth: number, alpha: number, beta: number, turn: 0 | 1, me: 0 | 1, bottom: 0 | 1): number {
  const ms = legalMoves(b, turn, bottom);
  if (!ms.length) return turn === me ? -100000 - depth : 100000 + depth;
  if (depth === 0) return evaluate(b, me, bottom);
  let best = turn === me ? -Infinity : Infinity;
  for (const m of ms) {
    const v = search(apply(b, m), depth - 1, alpha, beta, turn ? 0 : 1, me, bottom);
    if (turn === me) { best = Math.max(best, v); alpha = Math.max(alpha, v); }
    else { best = Math.min(best, v); beta = Math.min(beta, v); }
    if (beta <= alpha) break;
  }
  return best;
}

function bestMove(b: Board, me: 0 | 1, bottom: 0 | 1, level: number) {
  const ms = legalMoves(b, me, bottom);
  if (level === 0 && Math.random() < 0.4) return ms[Math.floor(Math.random() * ms.length)];
  const depth = [2, 4, 6][level];
  let best = ms[0], bestV = -Infinity;
  for (const m of ms.sort(() => Math.random() - 0.5)) {
    const v = search(apply(b, m), depth - 1, -Infinity, Infinity, me ? 0 : 1, me, bottom);
    if (v > bestV) [best, bestV] = [m, v];
  }
  return best;
}

/** Checkers — American rules: black moves first, captures are mandatory, reach the far row to crown a king. */
export default function Checkers({ mode, level, side, paused, onReport, onEnd, onControls }: GameProps) {
  const colorA: 0 | 1 = side; // 0 = red, 1 = black
  const bottom: 0 | 1 = mode === 1 ? colorA : 0;
  const [board, setBoard] = useState<Board>(() => initial(bottom));
  const [turn, setTurn] = useState<0 | 1>(1); // black first
  const [sel, setSel] = useState<number | null>(null);
  const [history, setHistory] = useState<{ board: Board; turn: 0 | 1 }[]>([]);
  const [quiet, setQuiet] = useState(0);
  const [hint, setHint] = useState<Move | null>(null);
  const [last, setLast] = useState<Move | null>(null);
  const ended = useRef(false);
  const moves = useMemo(() => legalMoves(board, turn, bottom), [board, turn, bottom]);
  const turnPlayer: 0 | 1 = turn === colorA ? 0 : 1;
  const capturedByA = 12 - board.filter((p) => p && p.c !== colorA).length;

  const play = (m: Move) => {
    setHistory((h) => [...h, { board, turn }]);
    setBoard(apply(board, m));
    setTurn(turn ? 0 : 1);
    setQuiet((q) => (m.caps.length ? 0 : q + 1));
    setSel(null);
    setHint(null);
    setLast(m);
  };

  useEffect(() => {
    const over = moves.length === 0 || quiet >= 80;
    onReport({ moves: history.length, stat: capturedByA, turn: over ? undefined : turnPlayer });
    if (over && !ended.current) {
      ended.current = true;
      setTimeout(() => onEnd({ winner: quiet >= 80 ? null : turnPlayer === 0 ? 1 : 0 }), 900);
    }
  }, [board, turn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode !== 1 || paused || turnPlayer !== 1 || !moves.length || ended.current) return;
    const id = setTimeout(() => play(bestMove(board, turn, bottom, level)), 550);
    return () => clearTimeout(id);
  }, [board, turn, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      undo: history.length ? () => {
        const steps = mode === 1 && history.length >= 2 && turnPlayer === 0 ? 2 : 1;
        const h = history[history.length - steps];
        setBoard(h.board);
        setTurn(h.turn);
        setHistory((x) => x.slice(0, x.length - steps));
        setSel(null);
      } : undefined,
      hint: moves.length ? () => setHint(bestMove(board, turn, bottom, 1)) : undefined,
    });
  }, [history, board, turn]); // eslint-disable-line react-hooks/exhaustive-deps

  const click = (i: number) => {
    if (paused || ended.current || (mode === 1 && turnPlayer === 1)) return;
    if (sel !== null) {
      const m = moves.find((mv) => mv.path[0] === sel && mv.path[mv.path.length - 1] === i);
      if (m) return play(m);
    }
    setSel(moves.some((mv) => mv.path[0] === i) ? i : null);
  };
  const targets = sel !== null ? moves.filter((m) => m.path[0] === sel).map((m) => m.path[m.path.length - 1]) : [];
  const movable = new Set(moves.map((m) => m.path[0]));

  return (
    <div className="grid aspect-square w-full max-w-(--board) grid-cols-8 grid-rows-8 overflow-clip rounded-[10px] border-[6px] border-[#3a6b4a] shadow-[0_6px_0_#2b4f37]" role="grid" aria-label="Checkers board">
      {board.map((p, i) => {
        const [r, c] = rc(i);
        const dark = (r + c) % 2 === 1;
        const isTarget = targets.includes(i);
        const isHint = hint && (hint.path[0] === i || hint.path[hint.path.length - 1] === i);
        const isLast = last && (last.path[0] === i || last.path[last.path.length - 1] === i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => dark && click(i)}
            aria-label={`${"abcdefgh"[c]}${8 - r}${p ? `: ${p.c ? "black" : "red"}${p.k ? " king" : ""}` : ""}`}
            className={`relative flex min-h-0 min-w-0 items-center justify-center overflow-hidden ${dark ? (isLast ? "bg-[#4f8a5f]" : "bg-[#5f9a6a]") : "bg-[#f1ecd8]"} ${dark ? "cursor-pointer" : "cursor-default"} ${isHint ? "ring-4 ring-[#f5c400] ring-inset" : ""}`}
          >
            {p && (
              <span className={`flex size-[78%] items-center justify-center rounded-full shadow-[0_4px_0_rgb(0_0_0/0.35),inset_0_-3px_0_rgb(0_0_0/0.2)] ${p.c ? "bg-[#2a2a2e]" : "bg-[#e5484d]"} ${sel === i ? "ring-4 ring-[#fff]" : movable.has(i) && turnPlayer === 0 && mode === 1 ? "ring-2 ring-[#fff]/60" : ""}`}>
                {p.k && <span className="text-[clamp(12px,3.5vw,20px)] text-[#f5c400]">{"♛\uFE0E"}</span>}
              </span>
            )}
            {isTarget && <span className="absolute size-[30%] rounded-full bg-[#fff]/70" />}
          </button>
        );
      })}
    </div>
  );
}
