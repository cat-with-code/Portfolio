"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { CalendarIcon, CoffeeIcon, MoonFilledIcon, SunSmallIcon } from "@/components/icons";
import { daytimeCopy as d } from "@/content/study";

const TZ = "Asia/Phnom_Penh";

/** Phnom Penh wall-clock time, ticking every 15 s on the client (null while server-rendering). */
let cache: { at: number; parts: Record<string, string> } | null = null;
function snapshot() {
  const now = Date.now();
  if (cache && now - cache.at < 15_000) return cache;
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat("en-GB", { timeZone: TZ, hour: "2-digit", minute: "2-digit", hourCycle: "h23", weekday: "long", day: "numeric", month: "long", year: "numeric" })
      .formatToParts(new Date(now))
      .map((p) => [p.type, p.value])
  );
  cache = { at: now, parts };
  return cache;
}
function subscribe(cb: () => void) {
  const id = setInterval(cb, 15_000);
  return () => clearInterval(id);
}
export function usePhnomPenhTime() {
  const snap = useSyncExternalStore(subscribe, snapshot, () => null);
  if (!snap) return null;
  const { hour, minute, weekday, day, month, year } = snap.parts;
  const h = Number(hour);
  const m = Number(minute);
  return { h, m, minutes: h * 60 + m, date: `${weekday}, ${day} ${month} ${year}` };
}
const pad = (n: number) => String(n).padStart(2, "0");
const twelve = (minutes: number) => {
  const h = Math.floor(minutes / 60) % 24;
  return { text: `${pad(h % 12 || 12)}:${pad(minutes % 60)}`, ampm: h < 12 ? "AM" : "PM" };
};

// ── Weather (Open-Meteo, no key) ──

const WMO: [number[], string][] = [
  [[0], "Clear sky"],
  [[1], "Mainly clear"],
  [[2], "Partly cloudy"],
  [[3], "Overcast"],
  [[45, 48], "Foggy"],
  [[51, 53, 55, 56, 57], "Drizzle"],
  [[61, 63, 65, 66, 67], "Rain"],
  [[80, 81, 82], "Rain showers"],
  [[95, 96, 99], "Thunderstorm"],
];
type Weather = { temp: number; label: string } | "error" | null;
function useWeather() {
  const [w, setW] = useState<Weather>(null);
  useEffect(() => {
    let alive = true;
    const load = () =>
      fetch("https://api.open-meteo.com/v1/forecast?latitude=11.5564&longitude=104.9282&current=temperature_2m,weather_code&timezone=Asia%2FPhnom_Penh")
        .then((r) => (r.ok ? r.json() : Promise.reject()))
        .then((j) => {
          if (!alive) return;
          const code = j.current.weather_code as number;
          setW({ temp: Math.round(j.current.temperature_2m), label: WMO.find(([codes]) => codes.includes(code))?.[1] ?? "—" });
        })
        .catch(() => alive && setW("error"));
    load();
    const id = setInterval(load, 15 * 60_000);
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, []);
  return w;
}

/** Integrated weather illustration (sun behind a cloud), drawn from the Figma ellipses. */
function WeatherArt() {
  return (
    <svg width="106" height="66" viewBox="0 0 106 66" aria-hidden className="shrink-0">
      <circle cx="72.5" cy="25.5" r="25.5" fill="var(--color-bg-status-warning-subtle)" />
      <circle cx="74" cy="26" r="17" fill="var(--color-bg-accent-orange)" />
      <circle cx="28" cy="48" r="14" fill="var(--color-bg-accent-blue-subtle)" />
      <circle cx="51.5" cy="45.5" r="21.5" fill="var(--color-bg-accent-blue-subtle)" />
      <circle cx="79.5" cy="49.5" r="13.5" fill="var(--color-bg-accent-blue-subtle)" />
      <rect x="16" y="48" width="76" height="17" rx="8.5" fill="var(--color-bg-accent-blue-subtle)" />
    </svg>
  );
}

function WeatherPanel({ className = "" }: { className?: string }) {
  const w = useWeather();
  return (
    <div
      className={`flex flex-col items-start gap-12 overflow-clip rounded-shell p-16 text-on-warning ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(79px 70px at 117px 113px, rgba(227,211,181,0.25), rgba(227,211,181,0)), linear-gradient(109.39deg, var(--orange-100) 3.27%, var(--color-bg-surface-primary) 45.33%, var(--color-bg-accent-blue-subtle) 96.73%)",
      }}
    >
      <p className="type-eyebrow w-full">{d.weather}</p>
      <div className="flex w-full items-center justify-between">
        <div className="flex flex-col gap-4 whitespace-nowrap">
          <p className="type-kpi">{w && w !== "error" ? `${w.temp}°C` : "—"}</p>
          <p className="type-label">{w && w !== "error" ? w.label : w === "error" ? d.offline.toLowerCase() : "…"}</p>
        </div>
        <WeatherArt />
      </div>
      <p className="type-eyebrow w-full">{w === "error" ? d.offline : d.live}</p>
    </div>
  );
}

const greeting = (h: number) => (h < 5 ? d.greetings.night : h < 12 ? d.greetings.morning : h < 18 ? d.greetings.afternoon : h < 22 ? d.greetings.evening : d.greetings.night);

/** Study / Daytime clock (725:2070): Desktop = weather beside the time, Compact = weather below. */
export function LocalClock({ className = "" }: { className?: string }) {
  const t = usePhnomPenhTime();
  const time = t ? twelve(t.minutes) : null;
  return (
    <section
      aria-label={d.eyebrow.replace("◉  ", "")}
      className={`relative flex flex-col items-start gap-12 overflow-clip rounded-shell p-24 desktop:block desktop:h-228 desktop:p-0 ${className}`}
      style={{
        backgroundImage:
          "radial-gradient(162px 91px at 194.6px 155px, rgba(242,172,39,0.18), rgba(242,172,39,0)), linear-gradient(122.98deg, var(--color-bg-accent-red-subtle) 3.39%, var(--color-bg-status-warning-subtle) 42.37%, var(--color-bg-accent-green-subtle) 88.14%)",
      }}
    >
      <p className="type-eyebrow w-full whitespace-pre text-brand desktop:absolute desktop:top-20 desktop:left-22 desktop:w-236">{d.eyebrow}</p>
      <p className="relative flex items-baseline gap-10 text-[53px] font-bold text-primary tabular-nums desktop:absolute desktop:top-64 desktop:left-21 desktop:leading-[normal]">
        <time suppressHydrationWarning>{time?.text ?? "--:--"}</time>
        <span className="type-subheading hidden text-brand desktop:inline">{time?.ampm ?? ""}</span>
      </p>
      <p className="type-subheading w-full text-primary desktop:absolute desktop:top-134 desktop:left-22 desktop:w-207">{t ? greeting(t.h) : " "}</p>
      <p className="type-label w-full text-secondary desktop:absolute desktop:top-159 desktop:left-22 desktop:w-207">{t?.date ?? " "}</p>
      <p className="type-eyebrow flex h-24 w-full items-center justify-center rounded-full bg-surface-primary whitespace-pre text-brand opacity-88 desktop:absolute desktop:top-189 desktop:left-22 desktop:w-208">
        {d.location}
      </p>
      <WeatherPanel className="w-full desktop:absolute desktop:top-15 desktop:right-16 desktop:w-198" />
    </section>
  );
}

/** Which part of the day it is, and how far into it (0–1). */
function dayPart(minutes: number) {
  const h = minutes / 60;
  if (h < 6) return { index: -1, fraction: 0 };
  const index = Math.min(2, Math.floor((h - 6) / 6));
  return { index, fraction: (h - 6 - index * 6) / 6 };
}

/** Study / Day rhythm (Default 340×228; Tall on tablet adds the sun path). */
export function DayRhythm({ tall = false, className = "" }: { tall?: boolean; className?: string }) {
  const t = usePhnomPenhTime();
  const { index, fraction } = t ? dayPart(t.minutes) : { index: 0, fraction: 0 };
  const part = index >= 0 ? d.rhythm.parts[index] : null;
  const headline = part ? part.headline : d.rhythm.night.headline;
  const note = part ? part.note : d.rhythm.night.note;
  const range = part ? `${part.label.toUpperCase()}   ${part.range}` : `NIGHT   ${d.rhythm.night.range}`;
  const pos = index < 0 ? 0 : (index + fraction) / 3;
  // Sun along the arc: 06:00 at the left horizon, 18:00 at the right.
  const sunT = t ? Math.min(1, Math.max(0, (t.minutes / 60 - 6) / 12)) : 0.2;
  const sx = 375 * sunT;
  const sy = 70 - 280 * sunT * (1 - sunT);
  return (
    <section className={`flex flex-col items-start gap-12 rounded-shell bg-surface-primary p-20 ${className}`}>
      <p className="type-eyebrow text-secondary">{d.rhythm.eyebrow}</p>
      <h3 className="type-subheading w-full text-primary">{headline}</h3>
      <p className="type-caption w-full text-secondary">{d.rhythm.support}</p>
      {tall && (
        <div className="relative h-71 w-full shrink-0" aria-hidden>
          <svg className="absolute inset-0 size-full" viewBox="0 0 375 71" preserveAspectRatio="none">
            <path d="M0 70 Q187.5 -70 375 70" fill="none" stroke="var(--color-border-general-strong)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
            <rect x="0" y="70" width="375" height="1" fill="var(--color-border-general-default)" />
          </svg>
          {t && t.minutes >= 360 && t.minutes <= 1080 && (
            <span className="absolute" style={{ left: `calc(${(sx / 375) * 100}% - 21.5px)`, top: sy - 15 }}>
              <span className="absolute h-30 w-43 rounded-full bg-accent-orange opacity-20" />
              <span className="absolute top-8 left-10 h-16 w-23 rounded-full bg-accent-orange" />
            </span>
          )}
          <SunSmallIcon className="absolute top-50 left-0 size-16 text-icon-general-primary" />
          <MoonFilledIcon className="absolute top-50 right-0 size-16 text-icon-general-primary" />
        </div>
      )}
      <div className="relative w-full shrink-0 pt-6">
        <div className="flex h-9 w-full gap-4 rounded-full bg-surface-subtle">
          {(["bg-brand", "bg-accent-blue-subtle", "bg-accent-violet-subtle"] as const).map((bg, i) => (
            <span key={bg} className={`h-9 flex-1 rounded-full ${i === index ? "bg-brand" : i === 0 ? "bg-surface-subtle" : bg}`} />
          ))}
        </div>
        <span
          aria-hidden
          className="absolute top-0 size-19 -translate-x-1/2 rounded-full border-3 border-(--color-bg-surface-primary) bg-brand"
          style={{ left: `${pos * 100}%` }}
        />
        <div className="mt-13 flex w-full gap-4">
          {d.rhythm.parts.map((p, i) => (
            <span key={p.key} className={`flex-1 text-[11px] leading-[18px] ${i === index ? "font-semibold text-brand" : "font-medium text-secondary"}`}>
              {p.label}
            </span>
          ))}
        </div>
      </div>
      <div className="flex w-full flex-col rounded-lg bg-accent-blue-subtle px-12 py-5">
        <p className="type-eyebrow whitespace-pre text-brand">{range}</p>
        <p className="type-caption text-secondary">{note}</p>
      </div>
    </section>
  );
}

/** Study / Focus window (Default; Tall on tablet adds the session timeline and day totals). */
export function FocusWindow({ tall = false, className = "" }: { tall?: boolean; className?: string }) {
  const t = usePhnomPenhTime();
  const start = t ? Math.ceil((t.minutes + 1) / 30) * 30 : 480;
  const a = twelve(start);
  const b = twelve(start + 25);
  const steps = [start, start + 25, start + 30].map((m) => { const x = twelve(m); return x.text; });
  return (
    <section className={`flex flex-col items-start gap-16 rounded-shell bg-accent-green-subtle p-20 ${tall ? "justify-center" : ""} ${className}`}>
      <div className="flex w-full items-center gap-12">
        <span className={`flex size-36 shrink-0 items-center justify-center bg-surface-primary text-icon-general-primary ${tall ? "rounded-shell" : "rounded-md"}`}>
          <CalendarIcon />
        </span>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="type-eyebrow text-secondary">{d.window.eyebrow}</p>
          <p className="type-page-title text-primary">{d.window.title}</p>
        </div>
      </div>
      <div className="flex w-full flex-col gap-2">
        <p className="type-page-title text-primary tabular-nums">{`${a.text}–${b.text}`}</p>
        <p className="type-eyebrow whitespace-pre text-brand">{`${a.ampm}  ·  ${d.window.suffix}`}</p>
      </div>
      {tall ? (
        <>
          <div className="relative flex w-full flex-col gap-8">
            <span aria-hidden className="absolute top-32 left-72 h-70 w-2 bg-(--color-border-line-divider)" />
            {d.window.steps.map((s, i) => (
              <div key={s.title} className={`relative flex w-full items-center gap-12 rounded-shell px-12 py-8 ${i === 0 ? "bg-surface-primary" : ""}`}>
                <span className={`type-label w-44 tabular-nums ${i === 0 ? "text-primary" : "text-secondary"}`}>{steps[i]}</span>
                <span className={`size-10 rounded-full ${i === 0 ? "bg-brand" : i === 1 ? "bg-accent-green" : "bg-(--color-icon-general-tertiary)"}`} />
                <span className="flex min-w-0 flex-1 items-center justify-between gap-8">
                  <span className={i === 0 ? "type-card-title text-primary" : "type-body text-primary"}>{s.title}</span>
                  <span className={`type-caption ${i === 0 ? "text-brand" : "text-secondary"}`}>{s.meta}</span>
                </span>
              </div>
            ))}
          </div>
          <div className="flex w-full gap-8">
            {d.window.stats.map((s) => (
              <div key={s.label} className="flex flex-1 flex-col items-center gap-2 rounded-shell bg-surface-primary px-12 py-8">
                <span className="type-table-heading text-secondary">{s.label}</span>
                <span className="type-card-title text-primary">{s.value}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex w-full flex-col gap-8">
            <div className="flex h-8 w-full gap-4">
              <span className="h-8 flex-[173] rounded-full bg-brand" />
              <span className="h-8 flex-[35] rounded-full bg-accent-green" />
            </div>
            <p className="type-eyebrow text-brand">{d.window.pomodoro}</p>
          </div>
          <p className="type-caption flex items-center gap-8 text-secondary">
            <CoffeeIcon className="size-16 text-icon-general-primary" />
            {d.window.tip}
          </p>
        </>
      )}
    </section>
  );
}
