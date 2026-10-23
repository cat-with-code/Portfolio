"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import type { GameProps } from "../types";

type Cell = 0 | 1 | null;

/** All winning lines for an n×n board where `k` in a row wins. */
function lines(n: number, k: number) {
  const out: number[][] = [];
  const dirs = [[0, 1], [1, 0], [1, 1], [1, -1]];
  for (let r = 0; r < n; r++)
    for (let c = 0; c < n; c++)
      for (const [dr, dc] of dirs) {
        const line = [];
        for (let i = 0; i < k; i++) {
          const rr = r + dr * i, cc = c + dc * i;
          if (rr < 0 || rr >= n || cc < 0 || cc >= n) break;
          line.push(rr * n + cc);
        }
        if (line.length === k) out.push(line);
      }
  return out;
}

function winner(b: Cell[], ls: number[][]) {
  for (const l of ls) {
    const v = b[l[0]];
    if (v !== null && l.every((i) => b[i] === v)) return { player: v, line: l };
  }
  return null;
}

/** Score a position for `me` (heuristic for bigger boards). */
function evaluate(b: Cell[], ls: number[][], me: 0 | 1) {
  let s = 0;
  for (const l of ls) {
    let mine = 0, theirs = 0;
    for (const i of l) {
      if (b[i] === me) mine++;
      else if (b[i] !== null) theirs++;
    }
    if (mine && !theirs) s += 10 ** mine;
    if (theirs && !mine) s -= 10 ** theirs;
  }
  return s;
}

function minimax(b: Cell[], ls: number[][], turn: 0 | 1, me: 0 | 1, depth: number, alpha: number, beta: number): number {
  const w = winner(b, ls);
  if (w) return w.player === me ? 1e6 + depth : -1e6 - depth;
  if (b.every((x) => x !== null)) return 0;
  if (depth === 0) return evaluate(b, ls, me);
  const moves = b.map((x, i) => (x === null ? i : -1)).filter((i) => i >= 0);
  if (turn === me) {
    let best = -Infinity;
    for (const m of moves) {
      b[m] = turn;
      best = Math.max(best, minimax(b, ls, turn ? 0 : 1, me, depth - 1, alpha, beta));
      b[m] = null;
      alpha = Math.max(alpha, best);
      if (beta <= alpha) break;
    }
    return best;
  }
  let best = Infinity;
  for (const m of moves) {
    b[m] = turn;
    best = Math.min(best, minimax(b, ls, turn ? 0 : 1, me, depth - 1, alpha, beta));
    b[m] = null;
    beta = Math.min(beta, best);
    if (beta <= alpha) break;
  }
  return best;
}

function bestMove(b: Cell[], ls: number[][], me: 0 | 1, n: number, level: number) {
  const empty = b.map((x, i) => (x === null ? i : -1)).filter((i) => i >= 0);
  const randomChance = [0.6, 0.25, 0][level];
  if (Math.random() < randomChance) return empty[Math.floor(Math.random() * empty.length)];
  const depth = n === 3 ? 9 : [1, 2, 3][level];
  let best = empty[0], bestScore = -Infinity;
  for (const m of empty) {
    b[m] = me;
    const s = minimax(b, ls, me ? 0 : 1, me, depth - 1, -Infinity, Infinity);
    b[m] = null;
    if (s > bestScore) [best, bestScore] = [m, s];
  }
  return best;
}

/** Tic-Tac-Toe: 3×3 (three in a row), 4×4 and 5×5 (four in a row). X always starts. */
export default function TicTacToe({ mode, level, side, option, paused, onReport, onEnd, onControls }: GameProps) {
  const n = [3, 4, 5][option];
  const k = n === 3 ? 3 : 4;
  const ls = useMemo(() => lines(n, k), [n, k]);
  const [board, setBoard] = useState<Cell[]>(() => Array(n * n).fill(null));
  const [history, setHistory] = useState<Cell[][]>([]);
  const [hint, setHint] = useState<number | null>(null);
  const ended = useRef(false);
  // Marks: 0 = X, 1 = O. Player A plays X when side = 0.
  const markOfA: 0 | 1 = side;
  const filled = board.filter((x) => x !== null).length;
  const turnMark: 0 | 1 = filled % 2 === 0 ? 0 : 1;
  const turnPlayer: 0 | 1 = turnMark === markOfA ? 0 : 1;
  const win = winner(board, ls);
  const full = filled === n * n;

  useEffect(() => {
    onReport({ moves: filled, stat: filled, turn: win || full ? undefined : turnPlayer });
    if ((win || full) && !ended.current) {
      ended.current = true;
      const w = win ? (win.player === markOfA ? 0 : 1) : null;
      setTimeout(() => onEnd({ winner: w }), 700);
    }
  }, [board]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sdabby's move
  useEffect(() => {
    if (mode !== 1 || paused || win || full || turnPlayer !== 1) return;
    const id = setTimeout(() => {
      const m = bestMove([...board], ls, turnMark, n, level);
      setHistory((h) => [...h, board]);
      setBoard((b) => b.map((x, i) => (i === m ? turnMark : x)));
    }, 450);
    return () => clearTimeout(id);
  }, [board, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      undo: history.length
        ? () => {
            // vs Sdabby: take back your move and Sdabby's reply
            const steps = mode === 1 && history.length >= 2 && turnPlayer === 0 ? 2 : 1;
            setBoard(history[history.length - steps]);
            setHistory((h) => h.slice(0, h.length - steps));
            setHint(null);
          }
        : undefined,
      hint: !win && !full ? () => setHint(bestMove([...board], ls, turnMark, n, 2)) : undefined,
    });
  }, [history, board]); // eslint-disable-line react-hooks/exhaustive-deps

  const play = (i: number) => {
    if (paused || board[i] !== null || win || (mode === 1 && turnPlayer === 1)) return;
    setHistory((h) => [...h, board]);
    setBoard((b) => b.map((x, j) => (j === i ? turnMark : x)));
    setHint(null);
  };

  return (
    <div className="grid aspect-square w-full max-w-(--board) gap-6 rounded-[20px] bg-[#2f3c5c] p-6 shadow-[0_6px_0_rgb(0_0_0/0.35)]" style={{ gridTemplateColumns: `repeat(${n}, 1fr)` }} role="grid" aria-label="Tic-Tac-Toe board">
      {board.map((cell, i) => {
        const inWin = win?.line.includes(i);
        return (
          <button
            key={i}
            type="button"
            onClick={() => play(i)}
            aria-label={`Cell ${Math.floor(i / n) + 1}, ${(i % n) + 1}${cell === null ? "" : cell === 0 ? ": X" : ": O"}`}
            className={`flex items-center justify-center rounded-[12px] transition-colors duration-150 ${inWin ? "bg-[#fff3cf]" : "bg-[#f4f1ea]"} ${hint === i ? "ring-4 ring-(--color-bg-brand) ring-inset" : ""} ${cell === null ? "cursor-pointer hover:bg-[#fff]" : "cursor-default"}`}
          >
            {cell === 0 && (
              <svg viewBox="0 0 40 40" className="size-3/5" aria-hidden>
                <path d="M9 9L31 31M31 9L9 31" stroke="#1f9d86" strokeWidth="8" strokeLinecap="round" />
              </svg>
            )}
            {cell === 1 && (
              <svg viewBox="0 0 40 40" className="size-3/5" aria-hidden>
                <circle cx="20" cy="20" r="12" fill="none" stroke="#ef5a5a" strokeWidth="7.5" />
              </svg>
            )}
          </button>
        );
      })}
    </div>
  );
}
