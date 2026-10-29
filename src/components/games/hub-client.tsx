"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { useDrawer } from "@/components/shell/drawer-provider";
import { useT } from "@/i18n/lang-context";

/** "16 GAMES / Browse all games ↗" — opens the Game Library drawer. */
export function LibraryCount() {
  const hub = useT("hub");
  const { setOpen } = useDrawer();
  return (
    <button
      type="button"
      onClick={() => setOpen("game-library")}
      className="flex h-60 w-full shrink-0 cursor-pointer items-center gap-12 rounded-lg bg-surface-primary pl-12 text-left transition-colors duration-(--duration-fast) hover:bg-surface-hover tablet:w-170"
    >
      <span className="h-32 w-7 shrink-0 rounded-full bg-brand" />
      <span className="flex flex-col gap-4">
        <span className="type-card-title text-primary">{hub.count}</span>
        <span className="type-caption text-(--color-text-link)">{hub.browse}</span>
      </span>
    </button>
  );
}

/** Sudoku bento footer: pick a difficulty, then play (the game page starts with it selected). */
export function SudokuStart({ lang }: { lang: string }) {
  const sudoku = useT("games").sudoku;
  const [level, setLevel] = useState(0);
  return (
    <div className="flex flex-col items-center gap-12">
      <div className="flex gap-4" role="radiogroup" aria-label={sudoku.option.label}>
        {sudoku.option.values.map((l, i) => (
          <button
            key={l}
            type="button"
            role="radio"
            aria-checked={level === i}
            onClick={() => setLevel(i)}
            className={`type-label h-28 cursor-pointer rounded-full px-12 ${level === i ? "bg-brand text-on-brand" : "bg-surface-primary text-secondary"}`}
          >
            {l}
          </button>
        ))}
      </div>
      <Link
        href={`/${lang}/games/sudoku`}
        onClick={() => {
          try {
            sessionStorage.setItem("game-option-sudoku", String(level));
          } catch {}
        }}
        className="flex h-44 items-center gap-8 rounded-shell bg-brand px-24 text-[13px] font-semibold text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover"
      >
        {sudoku.play}
        <ArrowRightIcon className="size-16" />
      </Link>
    </div>
  );
}
