"use client";

import { useEffect, useState } from "react";
import { SparklesIcon } from "@/components/icons";
import { gregorianLines, holyDayInfo, khmerDigits, khmerLines, phnomPenhParts } from "@/lib/khmer-calendar";
import { useLang, useT } from "@/i18n/lang-context";

export type Calendar = "gregorian" | "khmer";

/** The prototype's sample moment (10:10:00 on Friday 16 October 2026) — shown until the live time is known. */
const SAMPLE = { year: 2026, month: 10, day: 16, hour: 10, minute: 10, second: 0 };

function useNow() {
  const [now, setNow] = useState<typeof SAMPLE | null>(null);
  useEffect(() => {
    const tick = () => setNow(phnomPenhParts(new Date()));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);
  return now ?? SAMPLE;
}

const numerals = [
  { n: 12, x: 100, y: 44 },
  { n: 3, x: 156, y: 100 },
  { n: 6, x: 100, y: 156 },
  { n: 9, x: 44, y: 100 },
];

/** Settings / Clock / Khmer-aware (Figma 1149:2784): 200px analog face drawn with colour tokens. */
function ClockFace({ hour, minute, second, khmer }: { hour: number; minute: number; second: number; khmer: boolean }) {
  const secA = second * 6;
  const minA = minute * 6 + second * 0.1;
  const hourA = (hour % 12) * 30 + minute * 0.5;
  return (
    <div className="relative size-200 shrink-0" role="img" aria-label={`${hour}:${String(minute).padStart(2, "0")}`}>
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none" aria-hidden className="absolute inset-0 overflow-visible">
        <circle cx="100" cy="100" r="99.5" fill="var(--color-bg-surface-primary)" stroke="var(--color-border-general-default)" style={{ filter: "drop-shadow(0 2px 6px rgb(0 0 0 / 0.02))" }} />
        <circle cx="100" cy="100" r="88" fill="var(--color-bg-surface-subtle)" />
        <path
          transform="translate(17.7 17.7)"
          d="M90.8721 0.75L90.3495 5.72261M99.3496 2.09269L98.31 6.98343M107.64 4.31416L106.095 9.06944M115.653 7.39007L113.62 11.9578M130.499 15.9614L127.56 20.0065M137.17 21.3629L133.824 25.0786M143.239 27.4321L139.523 30.7777M148.64 34.1024L144.595 37.0413M157.212 48.9484L152.644 50.9821M160.287 56.9614L155.532 58.5065M162.509 65.252L157.618 66.2916M163.852 73.7295L158.879 74.2521M163.852 90.8721L158.879 90.3495M162.509 99.3496L157.618 98.31M160.287 107.64L155.532 106.095M157.212 115.653L152.644 113.62M148.64 130.499L144.595 127.56M143.239 137.17L139.523 133.824M137.17 143.239L133.824 139.523M130.499 148.64L127.56 144.595M115.653 157.212L113.62 152.644M107.64 160.287L106.095 155.532M99.3496 162.509L98.31 157.618M90.8721 163.852L90.3495 158.879M73.7295 163.852L74.2521 158.879M65.252 162.509L66.2916 157.618M56.9614 160.287L58.5065 155.532M48.9484 157.212L50.9821 152.644M34.1024 148.64L37.0413 144.595M27.4321 143.239L30.7777 139.523M21.3629 137.17L25.0786 133.824M15.9614 130.499L20.0065 127.56M7.39007 115.653L11.9578 113.62M4.31416 107.64L9.06944 106.095M2.09269 99.3496L6.98343 98.31M0.75 90.8721L5.72261 90.3495M0.75 73.7295L5.72261 74.2521M2.09269 65.252L6.98343 66.2916M4.31416 56.9614L9.06944 58.5065M7.39007 48.9484L11.9578 50.9821M15.9614 34.1024L20.0065 37.0413M21.3629 27.4321L25.0786 30.7777M27.4321 21.3629L30.7777 25.0786M34.1024 15.9614L37.0413 20.0065M48.9484 7.39007L50.9821 11.9578M56.9614 4.31416L58.5065 9.06944M65.252 2.09269L66.2916 6.98343M73.7295 0.75L74.2521 5.72261"
          stroke="var(--color-text-muted)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
        <path
          transform="translate(16.5 16.5)"
          d="M83.5 1.5V13.5M124.5 12.4859L118.5 22.8782M154.514 42.5L144.122 48.5M165.5 83.5H153.5M154.514 124.5L144.122 118.5M124.5 154.514L118.5 144.122M83.5 165.5V153.5M42.5 154.514L48.5 144.122M12.4859 124.5L22.8782 118.5M1.5 83.5H13.5M12.4859 42.5L22.8782 48.5M42.5 12.4859L48.5 22.8782"
          stroke="var(--color-text-primary)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <line x1="100" y1="100" x2="100" y2="52" stroke="var(--color-text-primary)" strokeWidth="6" strokeLinecap="round" transform={`rotate(${hourA} 100 100)`} />
        <line x1="100" y1="100" x2="100" y2="30" stroke="var(--color-text-primary)" strokeWidth="4" strokeLinecap="round" transform={`rotate(${minA} 100 100)`} />
        <line x1="100" y1="118" x2="100" y2="22" stroke="var(--color-bg-brand)" strokeWidth="2" strokeLinecap="round" transform={`rotate(${secA} 100 100)`} />
        <circle cx="100" cy="100" r="6" fill="var(--color-bg-brand)" />
        <circle cx="100" cy="100" r="2" fill="var(--color-bg-surface-primary)" />
      </svg>
      {numerals.map(({ n, x, y }) => (
        <span key={n} className="type-label absolute -translate-1/2 font-semibold whitespace-nowrap text-primary" style={{ left: x, top: y }}>
          {khmer ? khmerDigits(n) : n}
        </span>
      ))}
    </div>
  );
}

/** Moon tile: dark disc with the lit part for the current lunar day (waxing lights the right side). */
function MoonPhase({ phase }: { phase: number }) {
  const r = 16;
  const lit = 1 - Math.cos(phase * 2 * Math.PI); // 0 new … 2 full
  const waxing = phase <= 0.5;
  const rx = Math.abs(1 - lit) * r; // terminator ellipse half-width
  const sweepOuter = waxing ? 1 : 0;
  const sweepInner = lit > 1 ? sweepOuter : 1 - sweepOuter;
  const d = `M16 0 A16 16 0 0 ${sweepOuter} 16 32 A${rx} 16 0 0 ${sweepInner} 16 0 Z`;
  return (
    <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden>
      <circle cx="16" cy="16" r="16" fill="var(--color-text-on-accent)" />
      <path d={d} fill="var(--color-icon-on-brand)" />
    </svg>
  );
}

/** Settings / Khmer holy day (Figma 1147:2782) — Khmer calendar only. */
function HolyDayCard({ day }: { day: { year: number; month: number; day: number } }) {
  const info = holyDayInfo(day);
  return (
    <div className="flex w-full flex-wrap items-start gap-12 rounded-lg bg-surface-subtle px-16 py-12">
      <div className="flex min-w-0 flex-1 basis-200 items-center gap-10">
        <span className="flex size-40 shrink-0 items-center justify-center rounded-[20px] bg-brand">
          <MoonPhase phase={info.phase} />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="type-khmer-card-title text-primary">{info.moonTitle}</span>
          <span className="type-khmer-caption text-secondary">{info.fullMoon}</span>
        </span>
      </div>
      <div className="flex min-w-0 flex-1 basis-200 items-center gap-12">
        <span className="flex size-40 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-(--color-bg-brand)">
          <SparklesIcon />
        </span>
        <span className="flex min-w-0 flex-1 flex-col">
          <span className="type-khmer-card-title text-primary">ថ្ងៃសីលបន្ទាប់</span>
          <span className="type-khmer-caption text-secondary">{info.nextSila}</span>
        </span>
      </div>
    </div>
  );
}

/** Local time card body: clock face + digital time, city, divider and date lines. */
export function LocalTime({ calendar }: { calendar: Calendar }) {
  const lang = useLang();
  const settingsCopy = useT("settingsCopy");
  const now = useNow();
  const khmer = calendar === "khmer";
  const h12 = now.hour % 12 || 12;
  const time = `${h12}:${String(now.minute).padStart(2, "0")}:${String(now.second).padStart(2, "0")}`;
  const g = gregorianLines(now, lang, settingsCopy.weekDetail);
  const k = khmerLines(now);
  return (
    <>
      <div className="flex w-full flex-wrap content-center items-center justify-center gap-x-24 gap-y-20 tablet:justify-start">
        <ClockFace hour={now.hour} minute={now.minute} second={now.second} khmer={khmer} />
        <div className="flex flex-col items-center gap-4 overflow-clip text-center tablet:items-start tablet:text-left">
          {khmer ? (
            <p className="type-kpi font-(family-name:--font-khmer) leading-[40px] whitespace-nowrap text-primary">
              {khmerDigits(time)} {now.hour < 12 ? "ព្រឹក" : "ល្ងាច"}
            </p>
          ) : (
            <p className="type-kpi whitespace-nowrap text-primary">
              {time} {now.hour < 12 ? "AM" : "PM"}
            </p>
          )}
          <p className={`whitespace-pre text-secondary ${khmer ? "type-khmer-caption" : "type-caption"}`}>{khmer ? settingsCopy.cityKhmer : settingsCopy.city}</p>
          <div className="h-8 w-px" />
          <div className="h-px w-full bg-(--color-border-general-default)" />
          <div className="h-8 w-px" />
          {khmer ? (
            <div className="flex flex-col items-center gap-2 tablet:items-start">
              <p className="type-khmer-card-title text-primary">{k.main}</p>
              <p className="type-khmer-caption text-muted">{k.year}</p>
              <p className="type-khmer-caption text-muted">{k.solar}</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 tablet:items-start">
              <p className="type-card-title whitespace-nowrap text-primary">{g.main}</p>
              <p className="type-caption whitespace-pre text-muted">{g.detail}</p>
            </div>
          )}
        </div>
      </div>
      {khmer && <HolyDayCard day={now} />}
    </>
  );
}
