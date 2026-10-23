"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { CirclePlayIcon, PauseIcon } from "@/components/icons";

/** Words per second for the time estimate (≈155 wpm at rate 1). */
const WPS = 2.6;
/** Playing waveform bar heights (Figma State=Playing); Idle bars are all 6px. */
const PLAYING = [8, 16, 22, 12, 18, 10, 20, 14, 6, 18, 10, 16, 8, 20, 12, 6, 16, 22, 10, 14];

const female = /samantha|victoria|karen|moira|tessa|fiona|zira|susan|allison|ava|serena|female|woman|kanya|li-mu|ting-ting|mei-jia/i;
const male = /daniel|alex|fred|david|mark|aaron|arthur|rishi|tom\b|male|man\b|thomas|oliver/i;

/** Picks a system voice for the page language and the "Reading voice" setting (Settings drawer). */
function pickVoice(lang: string): SpeechSynthesisVoice | undefined {
  const voices = speechSynthesis.getVoices().filter((v) => v.lang.toLowerCase().startsWith(lang));
  let pref = "Female";
  try {
    pref = localStorage.getItem("voice") ?? pref;
  } catch {}
  if (pref === "Female") return voices.find((v) => female.test(v.name) && !male.test(v.name)) ?? voices[0];
  if (pref === "Male") return voices.find((v) => male.test(v.name)) ?? voices[0];
  return voices.find((v) => v.default) ?? voices[0];
}

const clock = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
const subscribeNothing = () => () => {};

/**
 * Study / Text reader (Figma 892:3283) — "Listen instead": reads the text aloud with the browser's
 * speech engine. Tap toggles Idle ↔ Playing. Times are estimates from the word count.
 */
export function TextReader({ title, text, lang, labels, bordered = false }: {
  title: string;
  text: string;
  lang: string;
  labels: { idleMeta: string; playing: string; play: string; pause: string };
  /** The book brief's reader has a border (color/border/general/default) */
  bordered?: boolean;
}) {
  const supported = useSyncExternalStore(subscribeNothing, () => "speechSynthesis" in window, () => true);
  const [state, setState] = useState<"idle" | "playing" | "paused">("idle");
  const [elapsed, setElapsed] = useState(0);
  const started = useRef(false);
  const total = Math.max(1, Math.round(text.split(/\s+/).length / WPS));

  useEffect(() => () => {
    if (started.current) speechSynthesis.cancel();
  }, []);

  useEffect(() => {
    if (state !== "playing") return;
    const id = setInterval(() => setElapsed((e) => Math.min(total, e + 1)), 1000);
    return () => clearInterval(id);
  }, [state, total]);

  function toggle() {
    if (!supported) return;
    if (state === "playing") {
      speechSynthesis.pause();
      setState("paused");
      return;
    }
    if (state === "paused" && speechSynthesis.paused) {
      speechSynthesis.resume();
      setState("playing");
      return;
    }
    speechSynthesis.cancel();
    const voice = pickVoice(lang);
    // One utterance per sentence: long utterances get cut off in some browsers.
    const sentences = text.match(/[^.!?。]+[.!?。”"]*\s*/g) ?? [text];
    sentences.forEach((s, i) => {
      const u = new SpeechSynthesisUtterance(s.trim());
      u.lang = voice?.lang ?? lang;
      if (voice) u.voice = voice;
      if (i === sentences.length - 1) u.onend = () => { setState("idle"); setElapsed(0); };
      speechSynthesis.speak(u);
    });
    started.current = true;
    setElapsed(0);
    setState("playing");
  }

  const active = state !== "idle";
  return (
    <button
      type="button"
      onClick={toggle}
      aria-disabled={!supported}
      aria-label={state === "playing" ? labels.pause : labels.play}
      aria-pressed={state === "playing"}
      className={`flex w-full cursor-pointer items-center gap-12 overflow-clip rounded-full bg-surface-primary py-8 pr-12 pl-8 ${bordered ? "border border-general-default" : ""} text-left aria-disabled:cursor-not-allowed aria-disabled:opacity-(--opacity-disabled)`}
    >
      <span className="flex size-40 shrink-0 items-center justify-center rounded-full bg-brand text-icon-on-brand">
        {state === "playing" ? <PauseIcon /> : <CirclePlayIcon />}
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-4">
        <span className="type-label w-full text-primary">{active ? labels.playing : title}</span>
        <span className="type-caption w-full whitespace-pre text-muted">
          {active ? `${clock(elapsed)} / ${clock(total)}` : `${labels.idleMeta}  ·  ${Math.max(1, Math.round(total / 60))} min`}
        </span>
      </span>
      <span aria-hidden className="flex h-22 w-136 shrink-0 items-center gap-4">
        {PLAYING.map((h, i) => (
          <span
            key={i}
            className={`w-3 shrink-0 rounded-full transition-[height,background-color] duration-(--duration-standard) ${active ? "bg-brand" : "bg-(--color-border-general-strong)"}`}
            style={{ height: active ? h : 6 }}
          />
        ))}
      </span>
    </button>
  );
}
