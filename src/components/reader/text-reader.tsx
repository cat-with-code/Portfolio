"use client";

import { useEffect, useRef } from "react";
import { CirclePlayIcon, PauseIcon } from "@/components/icons";
import { clock, estimate, PLAYING } from "@/lib/speech";
import { useReader, type ReaderLabels } from "./reader-provider";

/**
 * Study / Text reader (Figma 892:3283) — "Listen instead": reads the text aloud with the browser's
 * speech engine. Tap toggles Idle ↔ Playing; the chip on the right sets the speed. Times are estimates from the word count.
 * Playback lives in ReaderProvider, so it keeps going (in the floating reader) after you leave the page.
 */
export function TextReader({ title, text, lang, labels, bordered = false }: {
  title: string;
  text: string;
  lang: string;
  labels: ReaderLabels;
  /** The book brief's reader has a border (color/border/general/default) */
  bordered?: boolean;
}) {
  const r = useReader();
  const id = `${lang}:${title}`;
  const mine = r.session?.id === id;
  const state = mine ? r.state : "idle";
  const elapsed = mine ? r.elapsed : 0;
  const total = mine ? r.total : estimate(text, r.speed);
  const bars = useRef<(HTMLSpanElement | null)[]>([]);

  const { mount } = r;
  useEffect(() => mount(id), [mount, id]);

  // While speaking, each bar bounces out of step with the others (scaleY only, so it runs off the main thread).
  // Paused bars hold still; "Reduce motion" keeps them still too.
  useEffect(() => {
    if (state !== "playing" || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const anims = bars.current.map((bar, i) =>
      bar?.animate([{ transform: "scaleY(0.3)" }, { transform: "scaleY(1)" }], {
        duration: 600 + ((i * 137) % 500),
        delay: -((i * 211) % 900),
        iterations: Infinity,
        direction: "alternate",
        easing: "ease-in-out",
      })
    );
    return () => anims.forEach((a) => a?.cancel());
  }, [state]);

  const active = state !== "idle";
  return (
    <div className={`flex w-full items-center gap-8 overflow-clip rounded-full bg-surface-primary py-8 pr-8 pl-8 ${bordered ? "border border-general-default" : ""}`}>
      <button
        type="button"
        onClick={() => (mine ? r.toggle() : r.start({ id, title, text, lang, labels }))}
        aria-disabled={!r.supported}
        aria-label={state === "playing" ? labels.pause : labels.play}
        aria-pressed={state === "playing"}
        className="flex min-w-0 flex-1 cursor-pointer items-center gap-12 rounded-full text-left aria-disabled:cursor-not-allowed aria-disabled:opacity-(--opacity-disabled)"
      >
        <span className="flex size-40 shrink-0 items-center justify-center rounded-full bg-brand text-icon-on-brand">
          {state === "playing" ? <PauseIcon /> : <CirclePlayIcon />}
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-start gap-4">
          <span className="type-label w-full truncate text-primary">{active ? labels.playing : title}</span>
          <span className="type-caption w-full truncate whitespace-pre text-muted">
            {active ? `${clock(elapsed)} / ${clock(total)}` : `${labels.idleMeta}  ·  ${Math.max(1, Math.round(total / 60))} min`}
          </span>
        </span>
        <span aria-hidden className="hidden h-22 w-136 shrink-0 items-center gap-4 min-[400px]:flex">
          {PLAYING.map((h, i) => (
            <span
              key={i}
              ref={(el) => {
                bars.current[i] = el;
              }}
              className={`w-3 shrink-0 rounded-full transition-[height,background-color] duration-(--duration-standard) ${active ? "bg-brand" : "bg-(--color-border-general-strong)"}`}
              style={{ height: active ? h : 6 }}
            />
          ))}
        </span>
      </button>
      <SpeedChip />
    </div>
  );
}

/** Steps the reading speed 0.75× → 2×; shared by every reader and remembered. */
export function SpeedChip() {
  const r = useReader();
  return (
    <button
      type="button"
      onClick={r.cycleSpeed}
      disabled={!r.supported}
      aria-label={`Reading speed ${r.speed}×`}
      title="Reading speed"
      className="type-caption flex h-32 min-w-48 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-secondary px-8 text-primary tabular-nums transition-colors duration-(--duration-fast) hover:bg-surface-hover disabled:cursor-not-allowed disabled:opacity-(--opacity-disabled)"
    >
      {r.speed}×
    </button>
  );
}
