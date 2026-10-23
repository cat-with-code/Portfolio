"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";

type Grid = number[]; // 81, 0 = empty

const rowOf = (i: number) => Math.floor(i / 9), colOf = (i: number) => i % 9;
const boxOf = (i: number) => Math.floor(rowOf(i) / 3) * 3 + Math.floor(colOf(i) / 3);
const peers = Array.from({ length: 81 }, (_, i) =>
  Array.from({ length: 81 }, (_, j) => j).filter((j) => j !== i && (rowOf(j) === rowOf(i) || colOf(j) === colOf(i) || boxOf(j) === boxOf(i)))
);
const allowed = (g: Grid, i: number, v: number) => peers[i].every((j) => g[j] !== v);
const shuffled = () => [1, 2, 3, 4, 5, 6, 7, 8, 9].sort(() => Math.random() - 0.5);

function fill(g: Grid): boolean {
  const i = g.indexOf(0);
  if (i < 0) return true;
  for (const v of shuffled()) {
    if (allowed(g, i, v)) {
      g[i] = v;
      if (fill(g)) return true;
      g[i] = 0;
    }
  }
  return false;
}

function countSolutions(g: Grid, limit = 2): number {
  // choose the empty cell with the fewest candidates
  let best = -1, bestCands: number[] = [];
  for (let i = 0; i < 81; i++) {
    if (g[i]) continue;
    const c = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter((v) => allowed(g, i, v));
    if (best < 0 || c.length < bestCands.length) [best, bestCands] = [i, c];
    if (c.length === 0) return 0;
  }
  if (best < 0) return 1;
  let n = 0;
  for (const v of bestCands) {
    g[best] = v;
    n += countSolutions(g, limit - n);
    g[best] = 0;
    if (n >= limit) break;
  }
  return n;
}

function generate(clues: number) {
  const solution: Grid = Array(81).fill(0);
  fill(solution);
  const puzzle = [...solution];
  const order = Array.from({ length: 81 }, (_, i) => i).sort(() => Math.random() - 0.5);
  let filled = 81;
  for (const i of order) {
    if (filled <= clues) break;
    const keep = puzzle[i];
    puzzle[i] = 0;
    if (countSolutions([...puzzle]) !== 1) puzzle[i] = keep;
    else filled--;
  }
  return { puzzle, solution };
}

/** Sudoku — Easy, Medium or Hard; every puzzle has exactly one solution. */
export default function Sudoku({ option, paused, onReport, onEnd, onControls }: GameProps) {
  const [{ puzzle, solution }] = useState(() => generate([40, 32, 26][option]));
  const [grid, setGrid] = useState<Grid>(puzzle);
  const [notes, setNotes] = useState<number[][]>(() => Array.from({ length: 81 }, () => []));
  const [sel, setSel] = useState<number | null>(null);
  const [noteMode, setNoteMode] = useState(false);
  const [mistakes, setMistakes] = useState(0);
  const [hints, setHints] = useState(0);
  const [history, setHistory] = useState<{ grid: Grid; notes: number[][] }[]>([]);
  const [moves, setMoves] = useState(0);
  const ended = useRef(false);
  const empties = puzzle.filter((v) => !v).length;
  const correct = grid.filter((v, i) => !puzzle[i] && v === solution[i]).length;

  const enter = (v: number) => {
    if (paused || sel === null || puzzle[sel] || ended.current) return;
    setHistory((h) => [...h, { grid, notes }]);
    setMoves((m) => m + 1);
    if (noteMode && v) {
      setNotes((n) => n.map((x, i) => (i === sel ? (x.includes(v) ? x.filter((y) => y !== v) : [...x, v].sort()) : x)));
      return;
    }
    if (v && v !== solution[sel]) setMistakes((m) => m + 1);
    setGrid((g) => g.map((x, i) => (i === sel ? v : x)));
    // clear that number from the notes of its peers
    if (v === solution[sel]) setNotes((n) => n.map((x, i) => (i === sel ? [] : peers[sel].includes(i) ? x.filter((y) => y !== v) : x)));
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[1-9]$/.test(e.key)) enter(Number(e.key));
      else if (e.key === "Backspace" || e.key === "Delete" || e.key === "0") enter(0);
      else if (e.key.startsWith("Arrow") && sel !== null) {
        e.preventDefault();
        const d = { ArrowUp: -9, ArrowDown: 9, ArrowLeft: -1, ArrowRight: 1 }[e.key as "ArrowUp"];
        setSel((s) => (s === null ? 0 : Math.min(80, Math.max(0, s + d))));
      } else if (e.key === "n") setNoteMode((m) => !m);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    onReport({ moves, stat: mistakes, progress: correct / empties });
    if (!ended.current && grid.every((v, i) => v === solution[i])) {
      ended.current = true;
      setTimeout(() => onEnd({ won: true, score: Math.max(10, 400 - mistakes * 30 - hints * 20) }), 700);
    }
  }, [grid, mistakes]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      undo: history.length ? () => { const last = history[history.length - 1]; setGrid(last.grid); setNotes(last.notes); setHistory((h) => h.slice(0, -1)); } : undefined,
      hint: () => {
        const target = sel !== null && !puzzle[sel] && grid[sel] !== solution[sel] ? sel : grid.findIndex((v, i) => v !== solution[i]);
        if (target < 0) return;
        setHints((h) => h + 1);
        setHistory((h) => [...h, { grid, notes }]);
        setGrid((g) => g.map((x, i) => (i === target ? solution[target] : x)));
        setSel(target);
      },
    });
  }, [history, sel, grid]); // eslint-disable-line react-hooks/exhaustive-deps

  const selVal = sel !== null ? grid[sel] : 0;
  return (
    <div className="flex w-full max-w-(--board) flex-col items-center gap-12">
      <div className="grid aspect-square w-full grid-cols-9 overflow-clip rounded-[10px] border-[3px] border-[#2f3c5c] bg-[#fff] shadow-[0_6px_0_#c4cad6]" role="grid" aria-label="Sudoku grid">
        {grid.map((v, i) => {
          const given = !!puzzle[i];
          const wrong = v && !given && v !== solution[i];
          const related = sel !== null && (peers[sel].includes(i) || sel === i);
          return (
            <button
              key={i}
              type="button"
              onClick={() => setSel(i)}
              aria-label={`Row ${rowOf(i) + 1}, column ${colOf(i) + 1}${v ? `: ${v}` : ""}`}
              className={`relative flex items-center justify-center border-[#c4cad6] text-[clamp(14px,4.4vw,22px)] ${colOf(i) % 3 === 2 && colOf(i) < 8 ? "border-r-2 border-r-[#2f3c5c]" : "border-r"} ${rowOf(i) % 3 === 2 && rowOf(i) < 8 ? "border-b-2 border-b-[#2f3c5c]" : "border-b"} ${sel === i ? "bg-[#cfe0ff]" : v && v === selVal ? "bg-[#e2ecff]" : related ? "bg-[#f1f5fb]" : given ? "bg-[#f7f8fa]" : "bg-[#fff]"} ${given ? "font-semibold text-[#1d2433]" : wrong ? "text-[#e5484d]" : "text-[#2563d9]"}`}
            >
              {v ? v : (
                <span className="grid size-full grid-cols-3 p-[1px] text-[clamp(6px,1.6vw,9px)] leading-none text-muted">
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => <span key={n} className="flex items-center justify-center">{notes[i].includes(n) ? n : ""}</span>)}
                </span>
              )}
            </button>
          );
        })}
      </div>
      <div className="flex w-full flex-wrap justify-center gap-6">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button key={n} type="button" onClick={() => enter(n)} className="type-subheading size-40 cursor-pointer rounded-md bg-surface-primary text-primary hover:bg-surface-hover">{n}</button>
        ))}
        <button type="button" onClick={() => enter(0)} className="type-label h-40 cursor-pointer rounded-md bg-surface-primary px-12 text-primary">Erase</button>
        <button type="button" aria-pressed={noteMode} onClick={() => setNoteMode((m) => !m)} className={`type-label h-40 cursor-pointer rounded-md px-12 ${noteMode ? "bg-brand text-on-brand" : "bg-surface-primary text-primary"}`}>Notes {noteMode ? "on" : "off"}</button>
      </div>
    </div>
  );
}
