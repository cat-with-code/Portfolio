"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { GameProps } from "../types";

const PADS = [
  { name: "Green", on: "bg-[#5ce07a]", off: "bg-[#2fae4d]", hz: 329.6 },
  { name: "Red", on: "bg-[#ff7b7b]", off: "bg-[#e5484d]", hz: 261.6 },
  { name: "Yellow", on: "bg-[#ffe066]", off: "bg-[#f5c400]", hz: 220 },
  { name: "Blue", on: "bg-[#78a8ff]", off: "bg-[#2563d9]", hz: 164.8 },
];
const RADII = ["rounded-tl-full", "rounded-tr-full", "rounded-bl-full", "rounded-br-full"];

let ctx: AudioContext | null = null;
function tone(hz: number, ms: number) {
  try {
    ctx ??= new AudioContext();
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = "triangle";
    o.frequency.value = hz;
    g.gain.setValueAtTime(0.0001, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
    o.connect(g).connect(ctx.destination);
    o.start();
    o.stop(ctx.currentTime + ms / 1000 + 0.05);
  } catch {}
}

/** Simon Says — watch, then repeat (Classic), repeat backwards (Reverse), or keep up as it speeds up (Speed run). */
export default function Simon({ option, paused, sound, onReport, onEnd, onControls }: GameProps) {
  const [seq, setSeq] = useState<number[]>(() => [Math.floor(Math.random() * 4)]);
  const [step, setStep] = useState(0);
  const [lit, setLit] = useState<number | null>(null);
  const [showing, setShowing] = useState(true);
  const [taps, setTaps] = useState(0);
  const ended = useRef(false);
  const round = seq.length;
  const speed = option === 2 ? Math.max(180, 520 - round * 30) : 520;

  const flash = useCallback((p: number, ms: number) => {
    setLit(p);
    if (sound) tone(PADS[p].hz, ms);
    setTimeout(() => setLit(null), ms * 0.8);
  }, [sound]);

  const play = useCallback(() => {
    setShowing(true);
    seq.forEach((p, i) => setTimeout(() => flash(p, speed), 600 + i * (speed + 120)));
    setTimeout(() => setShowing(false), 600 + seq.length * (speed + 120));
  }, [seq, speed, flash]);

  useEffect(() => {
    if (paused) return;
    const id = setTimeout(play, 0);
    return () => clearTimeout(id);
  }, [seq]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onReport({ moves: taps, stat: round, progress: Math.min(1, (round - 1) / 15) });
  }, [taps, round]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => onControls({ hint: () => !showing && play() }), [showing, play]); // eslint-disable-line react-hooks/exhaustive-deps

  const press = (p: number) => {
    if (paused || showing || ended.current) return;
    flash(p, 260);
    setTaps((t) => t + 1);
    const expected = option === 1 ? seq[seq.length - 1 - step] : seq[step];
    if (p !== expected) {
      ended.current = true;
      if (sound) tone(110, 500);
      setTimeout(() => onEnd({ won: round - 1 >= 10, score: (round - 1) * 10 }), 700);
      return;
    }
    if (step + 1 === seq.length) {
      setStep(0);
      setShowing(true);
      setTimeout(() => setSeq((s) => [...s, Math.floor(Math.random() * 4)]), 500);
    } else setStep(step + 1);
  };

  return (
    <div className="flex w-full max-w-(--board) flex-col items-center gap-12">
      <div className="relative grid aspect-square w-full grid-cols-2 gap-10 rounded-full bg-[#1d2230] p-14 shadow-[0_8px_0_#0d1018]">
        {PADS.map((pad, i) => (
          <button
            key={pad.name}
            type="button"
            aria-label={pad.name}
            onClick={() => press(i)}
            className={`${RADII[i]} cursor-pointer transition-[filter,background-color] duration-100 ${lit === i ? `${pad.on} brightness-125` : pad.off} ${showing ? "cursor-wait" : "hover:brightness-110"}`}
          />
        ))}
        <span className="absolute top-1/2 left-1/2 flex size-[34%] -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full bg-[#1d2230] text-[#fff] shadow-[inset_0_0_0_6px_#2b3142]">
          <span className="text-[11px] font-semibold tracking-[1px] opacity-70">ROUND</span>
          <span className="text-[clamp(22px,6vw,36px)] font-bold tabular-nums">{round}</span>
        </span>
      </div>
      <p className="type-caption text-secondary" aria-live="polite">{showing ? "Watch the pattern…" : option === 1 ? "Your turn — repeat it backwards." : "Your turn — repeat it."}</p>
    </div>
  );
}
