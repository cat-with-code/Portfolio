"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";

const COLS = 7, ROWS = 6;
type Cell = 0 | 1 | null; // 0 = red, 1 = yellow
type Board = Cell[]; // row-major, row 0 = top

const idx = (r: number, c: number) => r * COLS + c;
const dropRow = (b: Board, c: number) => {
  for (let r = ROWS - 1; r >= 0; r--) if (b[idx(r, c)] === null) return r;
  return -1;
};

function winLine(b: Board): number[] | null {
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++) {
      const v = b[idx(r, c)];
      if (v === null) continue;
      for (const [dr, dc] of dirs) {
        const line = [idx(r, c)];
        for (let i = 1; i < 4; i++) {
          const rr = r + dr * i, cc = c + dc * i;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS || b[idx(rr, cc)] !== v) break;
          line.push(idx(rr, cc));
        }
        if (line.length === 4) return line;
      }
    }
  return null;
}

function scoreWindow(w: Cell[], me: 0 | 1) {
  const mine = w.filter((x) => x === me).length;
  const theirs = w.filter((x) => x !== null && x !== me).length;
  if (mine && theirs) return 0;
  if (mine === 4) return 1000;
  if (mine === 3) return 6;
  if (mine === 2) return 2;
  if (theirs === 3) return -8;
  if (theirs === 2) return -2;
  return 0;
}

function evaluate(b: Board, me: 0 | 1) {
  let s = 0;
  for (let r = 0; r < ROWS; r++) if (b[idx(r, 3)] === me) s += 3; // centre column
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < ROWS; r++)
    for (let c = 0; c < COLS; c++)
      for (const [dr, dc] of dirs) {
        const w: Cell[] = [];
        for (let i = 0; i < 4; i++) {
          const rr = r + dr * i, cc = c + dc * i;
          if (rr < 0 || rr >= ROWS || cc < 0 || cc >= COLS) break;
          w.push(b[idx(rr, cc)]);
        }
        if (w.length === 4) s += scoreWindow(w, me);
      }
  return s;
}

const ORDER = [3, 2, 4, 1, 5, 0, 6];
function search(b: Board, depth: number, alpha: number, beta: number, turn: 0 | 1, me: 0 | 1): number {
  const w = winLine(b);
  if (w) return b[w[0]] === me ? 100000 + depth : -100000 - depth;
  if (b.every((x) => x !== null)) return 0;
  if (depth === 0) return evaluate(b, me);
  let best = turn === me ? -Infinity : Infinity;
  for (const c of ORDER) {
    const r = dropRow(b, c);
    if (r < 0) continue;
    b[idx(r, c)] = turn;
    const v = search(b, depth - 1, alpha, beta, turn ? 0 : 1, me);
    b[idx(r, c)] = null;
    if (turn === me) {
      best = Math.max(best, v);
      alpha = Math.max(alpha, v);
    } else {
      best = Math.min(best, v);
      beta = Math.min(beta, v);
    }
    if (beta <= alpha) break;
  }
  return best;
}

function bestColumn(b: Board, me: 0 | 1, level: number) {
  const legal = ORDER.filter((c) => dropRow(b, c) >= 0);
  if (level === 0 && Math.random() < 0.45) return legal[Math.floor(Math.random() * legal.length)];
  const depth = [2, 4, 6][level];
  let best = legal[0], bestV = -Infinity;
  for (const c of legal) {
    const r = dropRow(b, c);
    b[idx(r, c)] = me;
    const v = search(b, depth - 1, -Infinity, Infinity, me ? 0 : 1, me);
    b[idx(r, c)] = null;
    if (v > bestV) [best, bestV] = [c, v];
  }
  return best;
}

/** Connect Four — red always drops first. */
export default function ConnectFour({ mode, level, side, paused, onReport, onEnd, onControls }: GameProps) {
  const [board, setBoard] = useState<Board>(() => Array(COLS * ROWS).fill(null));
  const [history, setHistory] = useState<Board[]>([]);
  const [hover, setHover] = useState<number | null>(null);
  const [hint, setHint] = useState<number | null>(null);
  const ended = useRef(false);
  const discs = board.filter((x) => x !== null).length;
  const turnColor: 0 | 1 = discs % 2 === 0 ? 0 : 1;
  const colorOfA: 0 | 1 = side;
  const turnPlayer: 0 | 1 = turnColor === colorOfA ? 0 : 1;
  const win = winLine(board);
  const full = discs === COLS * ROWS;

  useEffect(() => {
    onReport({ moves: discs, stat: discs, turn: win || full ? undefined : turnPlayer });
    if ((win || full) && !ended.current) {
      ended.current = true;
      setTimeout(() => onEnd({ winner: win ? (board[win[0]] === colorOfA ? 0 : 1) : null }), 900);
    }
  }, [board]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (mode !== 1 || paused || win || full || turnPlayer !== 1) return;
    const id = setTimeout(() => drop(bestColumn([...board], turnColor, level)), 500);
    return () => clearTimeout(id);
  }, [board, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      undo: history.length
        ? () => {
            const steps = mode === 1 && history.length >= 2 && turnPlayer === 0 ? 2 : 1;
            setBoard(history[history.length - steps]);
            setHistory((h) => h.slice(0, h.length - steps));
          }
        : undefined,
      hint: !win && !full ? () => setHint(bestColumn([...board], turnColor, 2)) : undefined,
    });
  }, [history, board]); // eslint-disable-line react-hooks/exhaustive-deps

  function drop(c: number) {
    const r = dropRow(board, c);
    if (r < 0) return;
    setHistory((h) => [...h, board]);
    setBoard((b) => b.map((x, i) => (i === idx(r, c) ? turnColor : x)));
    setHint(null);
  }
  const click = (c: number) => {
    if (paused || win || full || (mode === 1 && turnPlayer === 1)) return;
    drop(c);
  };

  return (
    <div className="flex w-full max-w-(--board) flex-col items-center gap-8">
      <div className="grid w-full grid-cols-7 gap-4 px-10" aria-hidden>
        {Array.from({ length: COLS }, (_, c) => (
          <span key={c} className={`mx-auto size-16 rounded-full transition-opacity ${hover === c && !win ? "opacity-100" : "opacity-0"} ${turnColor === 0 ? "bg-[#e5484d]" : "bg-[#f5b70a]"}`} />
        ))}
      </div>
      <div className="grid w-full grid-cols-7 gap-4 rounded-[18px] bg-[#2563d9] p-10 shadow-[0_8px_0_#1a3f99]" role="grid" aria-label="Connect Four board">
        {Array.from({ length: COLS }, (_, c) => (
          <button
            key={c}
            type="button"
            onClick={() => click(c)}
            onMouseEnter={() => setHover(c)}
            onMouseLeave={() => setHover(null)}
            aria-label={`Drop in column ${c + 1}`}
            className={`flex cursor-pointer flex-col gap-4 rounded-full ${hint === c ? "ring-4 ring-[#fff]/80" : ""}`}
          >
            {Array.from({ length: ROWS }, (_, r) => {
              const v = board[idx(r, c)];
              const inWin = win?.includes(idx(r, c));
              return (
                <span
                  key={r}
                  className={`aspect-square w-full rounded-full shadow-[inset_0_3px_4px_rgb(0_0_0/0.3)] ${v === null ? "bg-[#fff]" : v === 0 ? "bg-[#e5484d]" : "bg-[#f5b70a]"} ${inWin ? "ring-4 ring-[#fff]" : ""}`}
                />
              );
            })}
          </button>
        ))}
      </div>
    </div>
  );
}
