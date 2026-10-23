"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";
import { hangmanWords } from "./words";

const MAX = 6;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

/** Hangman — Animals, Movies or a random mix; six wrong letters and the drawing is done. */
export default function Hangman({ option, paused, onReport, onEnd, onControls }: GameProps) {
  const [word] = useState(() => {
    const pool = option === 0 ? hangmanWords.animals : option === 1 ? hangmanWords.movies : [...hangmanWords.animals, ...hangmanWords.movies];
    return pool[Math.floor(Math.random() * pool.length)];
  });
  const [picked, setPicked] = useState<string[]>([]);
  const [hints, setHints] = useState(0);
  const ended = useRef(false);
  const letters = new Set(word.replace(/[^A-Z]/g, ""));
  const misses = picked.filter((l) => !letters.has(l)).length;
  const solved = [...letters].every((l) => picked.includes(l));
  const lost = misses >= MAX;

  const pick = (l: string) => {
    if (paused || picked.includes(l) || solved || lost) return;
    setPicked((p) => [...p, l]);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (/^[a-z]$/i.test(e.key) && !e.metaKey && !e.ctrlKey) pick(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    onReport({ moves: picked.length, stat: `${misses}/${MAX}`, progress: [...letters].filter((l) => picked.includes(l)).length / letters.size });
    if ((solved || lost) && !ended.current) {
      ended.current = true;
      setTimeout(() => onEnd({ won: solved, score: solved ? Math.max(10, (MAX - misses) * 20 - hints * 15) : 0 }), 1300);
    }
  }, [picked]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      hint: !solved && !lost ? () => {
        const left = [...letters].filter((l) => !picked.includes(l));
        setHints((h) => h + 1);
        setPicked((p) => [...p, left[Math.floor(Math.random() * left.length)]]);
      } : undefined,
    });
  }, [picked]); // eslint-disable-line react-hooks/exhaustive-deps

  const parts = [
    <circle key="h" cx="150" cy="78" r="16" />,
    <line key="b" x1="150" y1="94" x2="150" y2="140" />,
    <line key="la" x1="150" y1="106" x2="130" y2="124" />,
    <line key="ra" x1="150" y1="106" x2="170" y2="124" />,
    <line key="ll" x1="150" y1="140" x2="134" y2="168" />,
    <line key="rl" x1="150" y1="140" x2="166" y2="168" />,
  ];
  return (
    <div className="flex w-full max-w-(--board) flex-col items-center gap-16">
      <svg viewBox="0 0 220 200" className="w-full max-w-[260px] rounded-[20px] bg-[#e3f2ee] tablet:max-w-[360px] shadow-[0_6px_0_#b9d8d0]" aria-label={`${misses} of ${MAX} wrong letters`} role="img">
        <g stroke="#2f3c5c" strokeWidth="6" strokeLinecap="round" fill="none">
          <line x1="40" y1="186" x2="120" y2="186" />
          <line x1="70" y1="186" x2="70" y2="30" />
          <line x1="70" y1="30" x2="150" y2="30" />
          <line x1="150" y1="30" x2="150" y2="62" stroke="#f2a33a" />
        </g>
        <g stroke="#2f3c5c" strokeWidth="5" strokeLinecap="round" fill="none">{parts.slice(0, misses)}</g>
      </svg>
      <p className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-center font-mono text-[clamp(20px,5vw,30px)] font-bold tracking-[4px] text-primary" aria-label="Word">
        {word.split(" ").map((w, wi) => (
          <span key={wi} className="whitespace-nowrap">
            {[...w].map((ch, i) => (
              <span key={i} className={`inline-block w-[1.1em] border-b-[3px] text-center ${picked.includes(ch) || lost ? "border-transparent" : "border-[#2f3c5c]"} ${lost && !picked.includes(ch) ? "text-[#e5484d]" : ""}`}>
                {picked.includes(ch) || lost ? ch : " "}
              </span>
            ))}
          </span>
        ))}
      </p>
      <div className="grid w-full grid-cols-9 gap-4">
        {ALPHABET.map((l) => {
          const used = picked.includes(l);
          return (
            <button
              key={l}
              type="button"
              onClick={() => pick(l)}
              disabled={used || solved || lost}
              className={`h-40 cursor-pointer rounded-md text-[14px] font-semibold disabled:cursor-not-allowed ${used ? (letters.has(l) ? "bg-[#2f9e5a] text-[#fff]" : "bg-[#c7ccd4] text-[#fff]") : "bg-surface-primary text-primary hover:bg-surface-hover"}`}
            >
              {l}
            </button>
          );
        })}
      </div>
    </div>
  );
}
