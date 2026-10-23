"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";

const SYMBOLS = ["❤️", "⭐", "🍃", "🌙", "☀️", "🍋", "🍒", "🌸", "🔔", "💎", "🎈", "🍀", "🎵", "🐟", "🦋", "🍄", "⚡", "🎯"];
const GRIDS = [
  { cols: 4, rows: 4 },
  { cols: 5, rows: 4 },
  { cols: 6, rows: 6 },
];

function deal(pairs: number) {
  const cards = SYMBOLS.slice(0, pairs).flatMap((s, i) => [{ id: i * 2, s }, { id: i * 2 + 1, s }]);
  for (let i = cards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [cards[i], cards[j]] = [cards[j], cards[i]];
  }
  return cards;
}

/** Memory Match — flip two cards a turn; pairs stay face up. */
export default function MemoryMatch({ option, paused, onReport, onEnd, onControls }: GameProps) {
  const { cols, rows } = GRIDS[option];
  const pairs = (cols * rows) / 2;
  const [cards] = useState(() => deal(pairs));
  const [open, setOpen] = useState<number[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [peek, setPeek] = useState<string | null>(null);
  const ended = useRef(false);

  useEffect(() => {
    onReport({ moves, stat: `${matched.size}/${pairs}`, progress: matched.size / pairs });
    if (!ended.current && matched.size === pairs) {
      ended.current = true;
      setTimeout(() => onEnd({ won: true, score: Math.max(10, pairs * 30 - moves * 3) }), 700);
    }
  }, [matched, moves]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      hint: () => {
        const left = SYMBOLS.slice(0, pairs).filter((s) => !matched.has(s));
        if (!left.length) return;
        setPeek(left[Math.floor(Math.random() * left.length)]);
        setTimeout(() => setPeek(null), 900);
      },
    });
  }, [matched]); // eslint-disable-line react-hooks/exhaustive-deps

  const flip = (i: number) => {
    if (paused || open.length === 2 || open.includes(i) || matched.has(cards[i].s)) return;
    const next = [...open, i];
    setOpen(next);
    if (next.length === 2) {
      setMoves((m) => m + 1);
      const [x, y] = next;
      if (cards[x].s === cards[y].s) {
        setMatched((m) => new Set(m).add(cards[x].s));
        setOpen([]);
      } else setTimeout(() => setOpen([]), 800);
    }
  };

  return (
    <div className="grid w-full max-w-(--board) gap-8" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }} role="grid" aria-label="Memory cards">
      {cards.map((c, i) => {
        const up = open.includes(i) || matched.has(c.s) || peek === c.s;
        return (
          <button
            key={c.id}
            type="button"
            onClick={() => flip(i)}
            aria-label={up ? c.s : "Hidden card"}
            className={`flex aspect-square cursor-pointer items-center justify-center rounded-[12px] shadow-[0_4px_0_rgb(0_0_0/0.2)] transition-transform duration-200 [transform-style:preserve-3d] ${up ? "bg-[#f6f0e3] [transform:rotateY(0deg)]" : "bg-[#3a4a8c] hover:-translate-y-1"} ${matched.has(c.s) ? "opacity-80" : ""}`}
          >
            <span className={`leading-none ${cols === 6 ? "text-[clamp(16px,4.5vw,28px)]" : "text-[clamp(22px,7vw,40px)]"}`}>{up ? c.s : <span className="text-[#8ea0e6]">◈</span>}</span>
          </button>
        );
      })}
    </div>
  );
}
