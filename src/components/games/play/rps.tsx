"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";

type Hand = 0 | 1 | 2; // rock, paper, scissors
const HANDS = [
  { name: "Rock", glyph: "✊" },
  { name: "Paper", glyph: "✋" },
  { name: "Scissors", glyph: "✌️" },
] as const;
const beats = (a: Hand, b: Hand) => (a - b + 3) % 3 === 1;
const counter = (h: Hand): Hand => ((h + 1) % 3) as Hand;

/** Your past throws this session — Sdabby learns from them on Medium and Hard. */
const memory: Hand[] = [];

function sdabbyPick(level: number): Hand {
  const rand = () => Math.floor(Math.random() * 3) as Hand;
  if (level === 0 || memory.length < 3 || Math.random() < 0.2) return rand();
  if (level === 1) {
    const counts = [0, 0, 0];
    memory.slice(-12).forEach((h) => counts[h]++);
    return counter(counts.indexOf(Math.max(...counts)) as Hand);
  }
  // Hard: what usually follows your last throw?
  const last = memory[memory.length - 1];
  const next = [0, 0, 0];
  for (let i = 0; i < memory.length - 1; i++) if (memory[i] === last) next[memory[i + 1]]++;
  if (next.every((x) => x === 0)) return counter(last);
  return counter(next.indexOf(Math.max(...next)) as Hand);
}

/** Rock Paper Scissors: one round per game; the panel counts rounds to the match length. */
export default function RockPaperScissors({ mode, level, paused, onReport, onEnd, onControls }: GameProps) {
  const [a, setA] = useState<Hand | null>(null);
  const [b, setB] = useState<Hand | null>(null);
  const [reveal, setReveal] = useState(false);
  const ended = useRef(false);

  useEffect(() => onControls({}), []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    onReport({ moves: (a !== null ? 1 : 0) + (b !== null ? 1 : 0), stat: memory.length, turn: reveal ? undefined : a === null ? 0 : 1 });
  }, [a, b, reveal]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (!reveal || a === null || b === null || ended.current) return;
    ended.current = true;
    const id = setTimeout(() => onEnd({ winner: a === b ? null : beats(a, b) ? 0 : 1 }), 1400);
    return () => clearTimeout(id);
  }, [reveal]); // eslint-disable-line react-hooks/exhaustive-deps

  const choose = (h: Hand) => {
    if (paused || reveal) return;
    if (a === null) {
      setA(h);
      if (mode === 1) {
        memory.push(h);
        const s = sdabbyPick(level);
        setTimeout(() => {
          setB(s);
          setReveal(true);
        }, 500);
      }
    } else if (mode === 2 && b === null) {
      setB(h);
      setReveal(true);
    }
  };

  const outcome = reveal && a !== null && b !== null ? (a === b ? "Draw" : beats(a, b) ? (mode === 1 ? "You win the round" : "Player 1 wins the round") : mode === 1 ? "Sdabby wins the round" : "Player 2 wins the round") : null;
  const prompt = mode === 2 ? (a === null ? "Player 1 — choose in secret" : b === null ? "Player 2 — your turn" : "") : "Make your move";

  return (
    <div className="flex w-full max-w-(--board) flex-col items-center gap-24">
      <div className="flex w-full items-center justify-center gap-24">
        {[a, b].map((h, i) => (
          <div key={i} className="flex flex-col items-center gap-8">
            <div className={`flex size-120 items-center justify-center rounded-full text-[56px] shadow-[0_6px_0_rgb(0_0_0/0.18)] ${i === 0 ? "bg-[#cfe3f7]" : "bg-[#f7d3d1]"}`} aria-live="polite">
              {reveal && h !== null ? HANDS[h].glyph : h !== null ? "✔︎" : "?"}
            </div>
            <span className="type-label text-secondary">{i === 0 ? (mode === 1 ? "You" : "Player 1") : mode === 1 ? "Sdabby" : "Player 2"}</span>
          </div>
        ))}
      </div>
      <p className="type-subheading min-h-28 text-center text-primary">{outcome ?? prompt}</p>
      <div className="flex w-full justify-center gap-12">
        {HANDS.map((h, i) => (
          <button
            key={h.name}
            type="button"
            onClick={() => choose(i as Hand)}
            disabled={reveal || (mode === 1 && a !== null)}
            className="flex w-108 cursor-pointer flex-col items-center gap-4 rounded-xl bg-surface-primary py-12 shadow-[0_4px_0_rgb(0_0_0/0.12)] transition-transform duration-150 hover:-translate-y-2 disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled) disabled:hover:translate-y-0"
          >
            <span className="text-[36px] leading-none" aria-hidden>{h.glyph}</span>
            <span className="type-label text-primary">{h.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
