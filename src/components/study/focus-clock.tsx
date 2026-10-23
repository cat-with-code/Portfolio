"use client";

import { useCallback, useEffect, useState, type CSSProperties } from "react";
import { CirclePlayIcon, PauseIcon } from "@/components/icons";
import { clockCopy as c, techniques, type Stage, type Technique } from "@/content/study";
import { useStudy } from "./study-provider";

const ORDER: Technique[] = ["pomodoro", "deep", "flow"];
type Run = { stage: Stage; round: number; startedAt: number; endsAt: number; total: number; soonDismissed: boolean };
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(Math.floor(s % 60)).padStart(2, "0")}`;

/** Card background per stage (Figma Study / Focus clock 316:6513). */
const backgrounds: Record<"focus" | "soon" | "break", string> = {
  focus: "linear-gradient(114.89deg, var(--color-bg-brand-subtle) 6.78%, var(--color-bg-accent-blue-subtle) 49.15%, var(--color-bg-accent-violet-subtle) 91.53%)",
  soon: "linear-gradient(114.89deg, var(--color-bg-brand-subtle) 6.78%, var(--color-bg-status-warning-subtle) 49.15%, var(--color-bg-accent-violet-subtle) 91.53%)",
  break: "linear-gradient(114.89deg, var(--color-bg-accent-green-subtle) 6.78%, var(--color-bg-status-success-subtle) 49.15%, var(--color-bg-accent-blue-subtle) 91.53%)",
};
/** Ready state shows the illustrated ring (306.9° of the circle). */
const READY_SWEEP = 306.87 / 360;

/** Analog dial: base, 11px guide, progress ring and the orbit dot. Base and guide colours are fixed in Figma. */
function Dial({ sweep, color, time, caption, message, big }: { sweep: number; color: string; time: string; caption: string; message: string; big: boolean }) {
  const r = 87.89;
  const len = 2 * Math.PI * r;
  return (
    <div className="relative size-232 shrink-0">
      <svg width="232" height="232" viewBox="0 0 232 232" aria-hidden className="absolute inset-0">
        <circle cx="116" cy="116" r="105" fill="rgba(255,255,255,0.57)" stroke="rgba(34,103,242,0.12)" strokeWidth="1" />
        <circle cx="116" cy="116" r="88" fill="none" stroke="rgba(34,103,242,0.12)" strokeWidth="11" />
        <circle
          cx="116"
          cy="116"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="11.22"
          strokeDasharray={`${len * sweep} ${len}`}
          transform="rotate(-90 116 116)"
          className="transition-[stroke-dasharray] duration-1000 ease-linear"
        />
        <circle cx="185" cy="37" r="7" fill={color} />
      </svg>
      <p className={`absolute top-84 left-1/2 w-156 -translate-x-1/2 text-center font-bold text-primary tabular-nums ${big ? "text-[45px] leading-[59px]" : "text-[45px] leading-[59px]"}`}>{time}</p>
      <p className="absolute top-140 left-1/2 w-154 -translate-x-1/2 text-center text-[10px] leading-[16px] font-semibold text-brand">{caption}</p>
      <p className="absolute top-165 left-1/2 w-170 -translate-x-1/2 text-center text-[11px] leading-[18px] font-medium text-secondary">{message}</p>
    </div>
  );
}

function MethodCard({ name, detail, ratio, selected, dot, onClick, disabled }: { name: string; detail: string; ratio: string; selected: boolean; dot: string; onClick?: () => void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={onClick ? selected : undefined}
      aria-disabled={disabled}
      tabIndex={onClick ? 0 : -1}
      className={`relative flex w-full flex-col items-start gap-4 rounded-lg bg-surface-primary px-16 py-12 text-left desktop:block desktop:h-48 desktop:p-0 ${selected ? "ring-[1.4px] ring-(--color-bg-brand) ring-inset" : ""} ${onClick && !disabled ? "cursor-pointer" : "cursor-default"}`}
    >
      <span aria-hidden className={`absolute top-18 left-13 hidden size-10 rounded-full desktop:block ${dot}`} />
      <span className="type-label w-full text-primary desktop:absolute desktop:top-8 desktop:left-33 desktop:w-185">{name}</span>
      <span className="type-caption w-full whitespace-pre-wrap text-secondary desktop:absolute desktop:top-27 desktop:left-33 desktop:w-230">{detail}</span>
      <span className="type-table-heading w-full text-brand desktop:absolute desktop:top-17 desktop:right-12 desktop:w-88 desktop:text-right">{ratio}</span>
    </button>
  );
}

/** Study / Focus clock (Figma 316:6513): Pomodoro, Deep Focus or Flowtime — ready, running, break soon, break. */
export function FocusClock() {
  const { technique, setTechnique, addSession } = useStudy();
  const [run, setRun] = useState<Run>({ stage: "ready", round: 1, startedAt: 0, endsAt: 0, total: 1, soonDismissed: false });
  const [now, setNow] = useState(0);
  const { stage, round } = run;
  const t = techniques[technique];

  /** Every state change goes through here with the current time, so render stays pure. */
  const act = useCallback(
    (action: "start" | "break" | "next" | "keep" | "end", at: number) => {
      setNow(at);
      if (action === "break") addSession();
      setRun((r) => {
        switch (action) {
          case "start":
          case "next":
            return { ...r, stage: "running", round: action === "next" ? (r.round % c.rounds) + 1 : r.round, startedAt: at, endsAt: at + t.focus * 60_000, total: t.focus * 60, soonDismissed: false };
          case "break": {
            const rest = technique === "flow" ? Math.max(60, Math.round((at - r.startedAt) / 5000)) : t.rest * 60;
            return { ...r, stage: "break", endsAt: at + rest * 1000, total: rest };
          }
          case "keep":
            return { ...r, stage: "running", soonDismissed: true };
          case "end":
            return { ...r, stage: "ready" };
        }
      });
    },
    [addSession, t, technique]
  );

  useEffect(() => {
    if (stage === "ready") return;
    const id = setInterval(() => {
      const n = Date.now();
      setNow(n);
      const left = (run.endsAt - n) / 1000;
      if (technique === "flow" && stage === "running") return;
      if (stage === "running" && left <= 60 && !run.soonDismissed) setRun((r) => ({ ...r, stage: "soon" }));
      if ((stage === "running" || stage === "soon") && left <= 0) act("break", n);
      if (stage === "break" && left <= 0) setRun((r) => ({ ...r, stage: "ready", round: (r.round % c.rounds) + 1 }));
    }, 250);
    return () => clearInterval(id);
  }, [stage, technique, run.endsAt, run.soonDismissed, act]);

  const left = Math.max(0, Math.ceil((run.endsAt - now) / 1000));
  const flowElapsed = Math.max(0, Math.floor((now - run.startedAt) / 1000));
  const isFlowRun = technique === "flow" && stage === "running";

  const time = stage === "ready" ? (technique === "flow" ? "∞" : mmss(t.focus * 60)) : isFlowRun ? mmss(flowElapsed) : mmss(left);
  const sweep = stage === "ready" ? READY_SWEEP : isFlowRun ? (flowElapsed % 3600) / 3600 : left / run.total;
  const ringColor = stage === "soon" ? "var(--color-bg-status-warning)" : stage === "break" ? "var(--color-bg-status-success)" : "var(--color-bg-brand)";
  const [caption, message] =
    stage === "soon" ? c.caption.soon : stage === "break" ? c.caption.break[technique] : stage === "running" ? c.caption.running[technique] : c.caption.ready[technique];
  const status =
    stage === "soon" ? c.status.soon : stage === "break" ? c.status.break : stage === "running" ? c.status.running[technique] : c.status.ready[technique].replace("{r}", String(round).padStart(2, "0"));
  const statusColor = stage === "soon" ? "text-status-warning" : stage === "break" ? "text-status-success" : "text-brand";
  const [heading, sub] = stage === "break" ? c.heading.break : c.heading.focus;
  const tip = stage === "break" ? c.tip.break : stage === "running" ? c.tip.running[technique] : stage === "ready" ? c.tip.ready[technique] : null;
  const tipStyle =
    stage === "break" ? "type-table-heading text-status-success" : stage === "ready" && technique !== "pomodoro" ? "type-eyebrow text-secondary" : "type-table-heading text-secondary";
  const bg = backgrounds[stage === "soon" ? "soon" : stage === "break" ? "break" : "focus"];

  const primary =
    stage === "ready"
      ? { label: c.actions.start[technique], icon: <CirclePlayIcon className="size-18" />, action: "start" as const }
      : stage === "running"
        ? { label: c.actions.pause, icon: <PauseIcon className="size-18" />, action: "break" as const }
        : stage === "soon"
          ? { label: c.actions.breakNow, icon: <PauseIcon className="size-18" />, action: "break" as const }
          : { label: c.actions.next, icon: <CirclePlayIcon className="size-18" />, action: "next" as const };
  const secondary =
    stage === "running" || stage === "break"
      ? { label: c.actions.end, icon: <span className="block size-14 rounded-[3px] bg-brand" />, action: "end" as const }
      : stage === "soon"
        ? { label: c.actions.keep, icon: <CirclePlayIcon className="size-18" />, action: "keep" as const }
        : null;

  return (
    <section
      aria-label={c.eyebrow.replace("✦  ", "")}
      className="relative flex w-full flex-col items-center gap-12 overflow-clip rounded-shell p-24 desktop:block desktop:h-456 desktop:min-w-0 desktop:flex-1 desktop:p-0"
      style={{ backgroundImage: bg } as CSSProperties}
    >
      <span aria-hidden className="pointer-events-none absolute top-[-197px] left-456 hidden size-354 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.4),rgba(255,255,255,0))] desktop:block" />
      {/* Header: glass label + status */}
      <p className="type-eyebrow w-full whitespace-pre text-brand desktop:absolute desktop:top-18 desktop:left-22 desktop:flex desktop:h-28 desktop:w-154 desktop:items-center desktop:rounded-full desktop:bg-surface-primary desktop:px-12">
        {c.eyebrow}
      </p>
      <p className={`type-eyebrow w-full whitespace-pre ${statusColor} desktop:absolute desktop:top-25 desktop:right-25 desktop:w-auto desktop:text-right`} aria-live="polite">
        {status}
      </p>
      <div className="desktop:absolute desktop:top-63 desktop:left-22">
        <Dial sweep={sweep} color={ringColor} time={time} caption={caption} message={message} big={technique !== "flow" || stage !== "ready"} />
      </div>
      {/* Rhythm column */}
      <div className="flex w-full flex-col items-stretch gap-12 desktop:absolute desktop:top-71 desktop:right-26 desktop:left-268 desktop:w-auto desktop:gap-0">
        <h2 className="type-subheading text-primary desktop:h-27">{heading}</h2>
        <p className="type-caption text-secondary desktop:h-17">{sub}</p>
        <div className="flex flex-col gap-12 desktop:mt-10 desktop:gap-5">
          {stage === "break"
            ? c.breakIdeas.map((idea) => <MethodCard key={idea.name} {...idea} selected={false} dot="bg-accent-violet-subtle" disabled />)
            : ORDER.map((key) => (
                <MethodCard
                  key={key}
                  name={techniques[key].name}
                  detail={techniques[key].detail}
                  ratio={techniques[key].ratio}
                  selected={key === technique}
                  dot={key === technique ? "bg-brand" : "bg-accent-violet-subtle"}
                  disabled={stage !== "ready"}
                  onClick={stage === "ready" ? () => setTechnique(key) : undefined}
                />
              ))}
        </div>
        {stage === "soon" ? (
          <p className="type-table-heading flex h-28 items-center justify-center rounded-full bg-status-warning-subtle px-12 text-center whitespace-pre-wrap text-status-warning desktop:mt-10">{c.tip.soon}</p>
        ) : (
          <p className={`${tipStyle} text-center whitespace-pre-wrap desktop:mt-21`}>{tip}</p>
        )}
        <div className="flex w-full flex-wrap gap-12 desktop:mt-10 desktop:flex-nowrap">
          <button
            type="button"
            onClick={() => act(primary.action, Date.now())}
            className="flex min-h-41 min-w-160 flex-1 cursor-pointer items-center justify-center gap-8 rounded-shell bg-brand px-16 py-12 text-[14px] font-semibold whitespace-pre text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover desktop:h-48"
          >
            {primary.icon}
            {primary.label}
          </button>
          {secondary && (
            <button
              type="button"
              onClick={() => act(secondary.action, Date.now())}
              className="flex min-h-41 flex-1 cursor-pointer items-center justify-center gap-8 rounded-shell bg-surface-primary px-16 text-[14px] font-semibold whitespace-nowrap text-brand transition-colors duration-(--duration-fast) hover:bg-surface-hover desktop:h-48 desktop:w-138 desktop:flex-none"
            >
              {secondary.icon}
              {secondary.label}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
