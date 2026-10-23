"use client";

import { useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";
import { answers } from "./words";

const TRIES = 6;
const KEYS = ["QWERTYUIOP", "ASDFGHJKL", "ZXCVBNM"];
type Mark = "hit" | "near" | "miss";

function score(guess: string, answer: string): Mark[] {
  const marks: Mark[] = Array(guess.length).fill("miss");
  const left: Record<string, number> = {};
  [...answer].forEach((ch, i) => (guess[i] === ch ? (marks[i] = "hit") : (left[ch] = (left[ch] ?? 0) + 1)));
  [...guess].forEach((ch, i) => {
    if (marks[i] !== "hit" && left[ch]) {
      marks[i] = "near";
      left[ch]--;
    }
  });
  return marks;
}
const COLOR: Record<Mark, string> = { hit: "bg-[#2f9e5a] text-[#fff] border-transparent", near: "bg-[#f2b630] text-[#fff] border-transparent", miss: "bg-[#7c8592] text-[#fff] border-transparent" };

/** Word Guess — find the hidden word in six tries. */
export default function WordGuess({ option, paused, onReport, onEnd, onControls }: GameProps) {
  const len = ([4, 5, 6] as const)[option];
  const [answer] = useState(() => answers[len][Math.floor(Math.random() * answers[len].length)]);
  const [guesses, setGuesses] = useState<string[]>([]);
  const [current, setCurrent] = useState("");
  const [shake, setShake] = useState(false);
  const [revealed, setRevealed] = useState<number[]>([]);
  const ended = useRef(false);
  const solved = guesses.includes(answer);
  const over = solved || guesses.length === TRIES;

  const keyState: Record<string, Mark> = {};
  guesses.forEach((g) => score(g, answer).forEach((m, i) => {
    const prev = keyState[g[i]];
    if (prev === "hit" || (prev === "near" && m === "miss")) return;
    keyState[g[i]] = m;
  }));

  const type = (k: string) => {
    if (paused || over) return;
    if (k === "ENTER") {
      if (current.length !== len) { setShake(true); setTimeout(() => setShake(false), 400); return; }
      setGuesses((g) => [...g, current]);
      setCurrent("");
    } else if (k === "BACK") setCurrent((c) => c.slice(0, -1));
    else if (/^[A-Z]$/.test(k) && current.length < len) setCurrent((c) => c + k);
  };

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || (e.target as HTMLElement)?.closest?.("input, textarea")) return;
      if (e.key === "Enter") type("ENTER");
      else if (e.key === "Backspace") type("BACK");
      else if (/^[a-z]$/i.test(e.key)) type(e.key.toUpperCase());
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  useEffect(() => {
    onReport({ moves: guesses.length, stat: TRIES - guesses.length, progress: solved ? 1 : guesses.length / (TRIES + 1) });
    if (over && !ended.current) {
      ended.current = true;
      setTimeout(() => onEnd({ won: solved, score: solved ? (TRIES + 1 - guesses.length) * 20 - revealed.length * 10 : 0 }), 1400);
    }
  }, [guesses]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onControls({
      hint: !over && revealed.length < len - 1 ? () => {
        const hidden = [...answer].map((_, i) => i).filter((i) => !revealed.includes(i));
        setRevealed((r) => [...r, hidden[Math.floor(Math.random() * hidden.length)]]);
      } : undefined,
    });
  }, [revealed, over]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex w-full max-w-(--board) flex-col items-center gap-16">
      <div className="flex flex-col gap-6" role="grid" aria-label="Guesses">
        {Array.from({ length: TRIES }, (_, row) => {
          const g = guesses[row] ?? (row === guesses.length ? current : "");
          const marks = guesses[row] ? score(guesses[row], answer) : null;
          return (
            <div key={row} className={`flex gap-6 ${shake && row === guesses.length ? "animate-[shake_0.4s]" : ""}`} role="row">
              {Array.from({ length: len }, (_, i) => (
                <span
                  key={i}
                  role="gridcell"
                  className={`flex size-[clamp(36px,10vw,52px)] items-center justify-center rounded-[8px] border-2 text-[clamp(18px,5vw,26px)] tablet:size-60 tablet:text-[30px] font-bold ${marks ? COLOR[marks[i]] : g[i] ? "border-[#8b95a5] bg-surface-primary text-primary" : "border-general-default bg-surface-primary text-primary"}`}
                >
                  {g[i] ?? (row === guesses.length && revealed.includes(i) ? <span className="text-muted">{answer[i]}</span> : "")}
                </span>
              ))}
            </div>
          );
        })}
      </div>
      <p className="type-label h-20 text-primary" aria-live="polite">{over ? (solved ? "Solved!" : `The word was ${answer}`) : ""}</p>
      <div className="flex w-full flex-col items-center gap-6">
        {KEYS.map((row, r) => (
          <div key={row} className="flex w-full justify-center gap-4">
            {r === 2 && <button type="button" onClick={() => type("ENTER")} className="type-table-heading h-44 flex-[1.5] cursor-pointer rounded-md bg-surface-primary px-4 text-primary">ENTER</button>}
            {[...row].map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => type(k)}
                className={`h-44 max-w-36 flex-1 cursor-pointer rounded-md text-[13px] font-semibold ${keyState[k] ? COLOR[keyState[k]] : "bg-surface-primary text-primary"}`}
              >
                {k}
              </button>
            ))}
            {r === 2 && <button type="button" aria-label="Delete" onClick={() => type("BACK")} className="h-44 flex-[1.5] cursor-pointer rounded-md bg-surface-primary px-4 text-primary">⌫</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
