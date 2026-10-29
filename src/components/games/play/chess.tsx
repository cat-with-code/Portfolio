"use client";

import { Chess, type Move, type Square } from "chess.js";
import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";
import { useT } from "@/i18n/lang-context";

const GLYPH: Record<string, string> = { k: "♚", q: "♛", r: "♜", b: "♝", n: "♞", p: "♟" };
const VALUE: Record<string, number> = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 0 };
// Piece-square tables (white's view, a8 → h1)
const PST: Record<string, number[]> = {
  p: [0,0,0,0,0,0,0,0,50,50,50,50,50,50,50,50,10,10,20,30,30,20,10,10,5,5,10,25,25,10,5,5,0,0,0,20,20,0,0,0,5,-5,-10,0,0,-10,-5,5,5,10,10,-20,-20,10,10,5,0,0,0,0,0,0,0,0],
  n: [-50,-40,-30,-30,-30,-30,-40,-50,-40,-20,0,0,0,0,-20,-40,-30,0,10,15,15,10,0,-30,-30,5,15,20,20,15,5,-30,-30,0,15,20,20,15,0,-30,-30,5,10,15,15,10,5,-30,-40,-20,0,5,5,0,-20,-40,-50,-40,-30,-30,-30,-30,-40,-50],
  b: [-20,-10,-10,-10,-10,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,10,10,5,0,-10,-10,5,5,10,10,5,5,-10,-10,0,10,10,10,10,0,-10,-10,10,10,10,10,10,10,-10,-10,5,0,0,0,0,5,-10,-20,-10,-10,-10,-10,-10,-10,-20],
  r: [0,0,0,0,0,0,0,0,5,10,10,10,10,10,10,5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,-5,0,0,0,0,0,0,-5,0,0,0,5,5,0,0,0],
  q: [-20,-10,-10,-5,-5,-10,-10,-20,-10,0,0,0,0,0,0,-10,-10,0,5,5,5,5,0,-10,-5,0,5,5,5,5,0,-5,0,0,5,5,5,5,0,-5,-10,5,5,5,5,5,0,-10,-10,0,5,0,0,0,0,-10,-20,-10,-10,-5,-5,-10,-10,-20],
  k: [-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-30,-40,-40,-50,-50,-40,-40,-30,-20,-30,-30,-40,-40,-30,-30,-20,-10,-20,-20,-20,-20,-20,-20,-10,20,20,0,0,0,0,20,20,20,30,10,0,0,10,30,20],
};

function evaluate(g: Chess) {
  let s = 0;
  g.board().forEach((row, r) => row.forEach((p, c) => {
    if (!p) return;
    const idx = p.color === "w" ? r * 8 + c : (7 - r) * 8 + c;
    const v = VALUE[p.type] + PST[p.type][idx];
    s += p.color === "w" ? v : -v;
  }));
  return s;
}

function search(g: Chess, depth: number, alpha: number, beta: number): number {
  if (g.isCheckmate()) return g.turn() === "w" ? -100000 - depth : 100000 + depth;
  if (g.isDraw() || g.isStalemate()) return 0;
  if (depth === 0) return evaluate(g);
  const moves = g.moves({ verbose: true }).sort((a, b) => (b.captured ? VALUE[b.captured] : 0) - (a.captured ? VALUE[a.captured] : 0));
  const white = g.turn() === "w";
  let best = white ? -Infinity : Infinity;
  for (const m of moves) {
    g.move(m);
    const v = search(g, depth - 1, alpha, beta);
    g.undo();
    if (white) { best = Math.max(best, v); alpha = Math.max(alpha, v); }
    else { best = Math.min(best, v); beta = Math.min(beta, v); }
    if (beta <= alpha) break;
  }
  return best;
}

function bestMove(fen: string, level: number): Move | null {
  const g = new Chess(fen);
  const moves = g.moves({ verbose: true });
  if (!moves.length) return null;
  if (level === 0 && Math.random() < 0.35) return moves[Math.floor(Math.random() * moves.length)];
  const depth = [1, 2, 3][level];
  const white = g.turn() === "w";
  let best = moves[0], bestV = white ? -Infinity : Infinity;
  for (const m of moves.sort(() => Math.random() - 0.5)) {
    g.move(m);
    const v = search(g, depth - 1, -Infinity, Infinity);
    g.undo();
    if (white ? v > bestV : v < bestV) [best, bestV] = [m, v];
  }
  return best;
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Chess — full rules (castling, en passant, promotion to queen), optional clocks. */
export default function ChessGame({ mode, level, side, option, paused, onReport, onEnd, onControls }: GameProps) {
  const t = useT("panelCopy").inGame.chess;
  const [g] = useState(() => new Chess());
  const [fen, setFen] = useState(() => g.fen());
  const [sel, setSel] = useState<Square | null>(null);
  const [hint, setHint] = useState<Move | null>(null);
  const [last, setLast] = useState<Move | null>(null);
  const [thinking, setThinking] = useState(false);
  const limit = [300, 600, 0][option];
  const [clocks, setClocks] = useState<[number, number]>([limit, limit]); // [white, black]
  const ended = useRef(false);
  const colorA = side === 0 ? "w" : "b";
  const turnColor = g.turn();
  const turnPlayer: 0 | 1 = turnColor === colorA ? 0 : 1;
  const flipped = mode === 1 && colorA === "b";
  const history = g.history({ verbose: true });
  const capturedByA = history.filter((m) => m.color === colorA && m.captured).length;

  const finish = (winner: 0 | 1 | null) => {
    if (ended.current) return;
    ended.current = true;
    setTimeout(() => onEnd({ winner }), 1200);
  };

  const sync = (m: Move | null) => {
    setFen(g.fen());
    setLast(m);
    setSel(null);
    setHint(null);
  };

  useEffect(() => {
    onReport({ moves: Math.ceil(history.length / 2), stat: capturedByA, turn: g.isGameOver() ? undefined : turnPlayer });
    if (g.isCheckmate()) finish(turnPlayer === 0 ? 1 : 0);
    else if (g.isDraw() || g.isStalemate()) finish(null);
  }, [fen]); // eslint-disable-line react-hooks/exhaustive-deps

  // Sdabby moves
  useEffect(() => {
    if (mode !== 1 || paused || turnPlayer !== 1 || ended.current || g.isGameOver()) return;
    setThinking(true);
    const id = setTimeout(() => {
      const m = bestMove(g.fen(), level);
      if (m) { g.move(m); sync(m); }
      setThinking(false);
    }, 350);
    return () => clearTimeout(id);
  }, [fen, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  // Clocks
  useEffect(() => {
    if (!limit || paused || ended.current || history.length === 0) return;
    const id = setInterval(() => {
      setClocks(([w, b]) => {
        const next: [number, number] = turnColor === "w" ? [w - 1, b] : [w, b - 1];
        if (next[0] <= 0 || next[1] <= 0) finish((next[0] <= 0 ? "w" : "b") === colorA ? 1 : 0);
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [fen, paused]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      undo: history.length ? () => {
        const steps = mode === 1 && turnPlayer === 0 && history.length >= 2 ? 2 : 1;
        for (let i = 0; i < steps; i++) g.undo();
        sync(null);
      } : undefined,
      hint: !g.isGameOver() ? () => setHint(bestMove(g.fen(), 1)) : undefined,
    });
  }, [fen]); // eslint-disable-line react-hooks/exhaustive-deps

  const click = (sq: Square) => {
    if (paused || ended.current || (mode === 1 && turnPlayer === 1)) return;
    if (sel) {
      const m = g.moves({ square: sel, verbose: true }).find((x) => x.to === sq);
      if (m) {
        g.move({ from: m.from, to: m.to, promotion: "q" });
        return sync(m);
      }
    }
    const p = g.get(sq);
    setSel(p && p.color === turnColor ? sq : null);
  };

  const targets = sel ? g.moves({ square: sel, verbose: true }).map((m) => m.to) : [];
  const rows = flipped ? [...g.board()].reverse().map((r) => [...r].reverse()) : g.board();
  const files = "abcdefgh";
  const inCheck = g.inCheck();

  const clockRow = (color: "w" | "b") =>
    limit ? (
      <div className={`type-label flex items-center justify-between rounded-md px-12 py-6 tabular-nums ${turnColor === color && !g.isGameOver() ? "bg-brand text-on-brand" : "bg-surface-primary text-primary"}`}>
        <span>{color === "w" ? "White" : "Black"}{mode === 1 ? (color === colorA ? " · You" : " · Sdabby") : ""}</span>
        <span>{clock(Math.max(0, clocks[color === "w" ? 0 : 1]))}</span>
      </div>
    ) : null;

  return (
    <div className="flex w-full max-w-(--board) flex-col gap-8">
      {clockRow(flipped ? "w" : "b")}
      <div className="@container grid aspect-square w-full grid-cols-8 grid-rows-8 overflow-clip rounded-[8px] shadow-[0_6px_0_rgb(0_0_0/0.35)]" role="grid" aria-label="Chess board">
        {rows.flat().map((p, i) => {
          const r = Math.floor(i / 8), c = i % 8;
          const sq = (flipped ? `${files[7 - c]}${r + 1}` : `${files[c]}${8 - r}`) as Square;
          const light = (r + c) % 2 === 0;
          const isLast = last && (last.from === sq || last.to === sq);
          const isHint = hint && (hint.from === sq || hint.to === sq);
          const isCheckKing = inCheck && p?.type === "k" && p.color === turnColor;
          return (
            <button
              key={sq}
              type="button"
              onClick={() => click(sq)}
              aria-label={`${sq}${p ? `: ${p.color === "w" ? "white" : "black"} ${p.type}` : ""}`}
              className={`relative flex min-h-0 min-w-0 cursor-pointer items-center justify-center overflow-hidden ${light ? "bg-[#f1ecd8]" : "bg-[#6c9a63]"} ${isLast ? "after:absolute after:inset-0 after:bg-[#f5d64b]/40" : ""} ${sel === sq ? "after:absolute after:inset-0 after:bg-[#2563d9]/30" : ""} ${isHint ? "ring-4 ring-[#2563d9] ring-inset" : ""} ${isCheckKing ? "bg-[#ef8b8b]" : ""}`}
            >
              {p && (
                <span
                  className={`relative z-10 text-[11.5cqw] leading-none [paint-order:stroke_fill] select-none ${p.color === "w" ? "text-[#fff] [-webkit-text-stroke:0.7cqw_#1d1f24] [text-shadow:0_3px_3px_rgb(0_0_0/0.35)]" : "text-[#1d1f24] [-webkit-text-stroke:0.7cqw_#fff] [text-shadow:0_3px_3px_rgb(0_0_0/0.3)]"}`}
                >
                  {GLYPH[p.type]}{"\uFE0E"}
                </span>
              )}
              {targets.includes(sq) && <span className={`absolute z-20 rounded-full ${p ? "inset-[6%] border-4 border-[#2563d9]/60" : "size-[28%] bg-[#2563d9]/50"}`} />}
            </button>
          );
        })}
      </div>
      {clockRow(flipped ? "b" : "w")}
      <p className="type-caption h-18 text-center text-secondary" aria-live="polite">
        {g.isCheckmate() ? t.checkmate : g.isDraw() || g.isStalemate() ? t.draw : thinking ? t.thinking : inCheck ? t.check : ""}
      </p>
    </div>
  );
}
