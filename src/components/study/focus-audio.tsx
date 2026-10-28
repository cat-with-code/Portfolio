"use client";

import * as Dialog from "@radix-ui/react-dialog";
import * as Popover from "@radix-ui/react-popover";
import { useEffect, useRef, useState, type ComponentType, type SVGProps } from "react";
import {
  CheckIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CloseIcon,
  MinusIcon,
  PauseIcon,
  PlayFilledIcon,
  PlaylistIcon,
  PlusIcon,
  RefreshIcon,
  SkipBackIcon,
  SkipForwardIcon,
  TimerIcon,
  VolumeOffIcon,
  VolumeOnIcon,
  WaveformIcon,
} from "@/components/icons";
import { AudioAmbientArt } from "@/components/illustrations/audio-ambient";
import { AudioCustomArt } from "@/components/illustrations/audio-custom";
import { AudioLofiArt } from "@/components/illustrations/audio-lofi";
import { AudioNeoArt } from "@/components/illustrations/audio-neo";
import { AudioPianoArt } from "@/components/illustrations/audio-piano";
import { AudioRainArt } from "@/components/illustrations/audio-rain";
import { useDrawer } from "@/components/shell/drawer-provider";
import { audioCopy as a, trackCaption, tracks, vibes, type Vibe } from "@/content/study";
import { clock } from "@/lib/focus-audio";
import { youTubeId, youTubeThumb } from "@/lib/youtube";
import { useStudy, type CustomSong } from "./study-provider";

type Style = Vibe | "custom";
export const covers: Record<Style, ComponentType<SVGProps<SVGSVGElement>>> = {
  lofi: AudioLofiArt,
  neo: AudioNeoArt,
  ambient: AudioAmbientArt,
  rain: AudioRainArt,
  piano: AudioPianoArt,
  custom: AudioCustomArt,
};

/** A focus track's uploaded cover (4th item of its `Track`), or its vibe's artwork. */
export function TrackCover({ vibe, index, className = "" }: { vibe: Vibe; index: number; className?: string }) {
  const image = tracks[vibe][index]?.[3];
  const Art = covers[vibe];
  // eslint-disable-next-line @next/next/no-img-element -- uploaded covers may live on any host
  if (image) return <img src={image} alt="" className={`shrink-0 rounded-lg object-cover ${className}`} />;
  return <Art aria-hidden className={`shrink-0 ${className}`} />;
}

/** A custom song's cover: the YouTube thumbnail (cropped square), or the Custom artwork for other links. */
export function CustomCover({ song, className = "" }: { song: CustomSong | null; className?: string }) {
  const id = song && (song.videoId ?? youTubeId(song.url));
  if (!id) return <AudioCustomArt aria-hidden className={`shrink-0 ${className}`} />;
  // Built from the id (not the saved `thumb`) so songs saved with the old letterboxed thumbnail fill the box too.
  return (
    <span className={`block shrink-0 overflow-clip ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- remote YouTube thumbnail, already sized by i.ytimg.com */}
      <img src={youTubeThumb(id)} alt="" className="size-full object-cover" />
    </span>
  );
}

/** Card and equalizer gradients per sound style (Figma Study / Focus audio 379:15202, Audio / Equalizer 379:13241). */
const cardBg: Record<Style, string> = {
  lofi: "var(--color-bg-status-warning-subtle)",
  neo: "var(--color-bg-accent-violet-subtle)",
  ambient: "var(--color-bg-accent-green-subtle)",
  rain: "var(--color-bg-accent-blue-subtle)",
  piano: "var(--color-study-surface)",
  custom: "var(--color-study-surface)",
};
const eqBg: Record<Style, [string, string]> = {
  lofi: ["var(--color-bg-status-warning-subtle)", "var(--color-study-inset)"],
  neo: ["var(--color-bg-accent-violet-subtle)", "var(--color-bg-accent-blue-subtle)"],
  ambient: ["var(--color-bg-accent-green-subtle)", "var(--color-bg-accent-blue-subtle)"],
  rain: ["var(--color-bg-accent-blue-subtle)", "var(--color-bg-brand-subtle)"],
  piano: ["var(--color-study-surface)", "var(--color-bg-status-warning-subtle)"],
  custom: ["var(--color-study-surface)", "var(--color-bg-status-warning-subtle)"],
};
/** 32 bands: Still, phase A, phase B heights (px). */
const STILL = [7, 15, 19, 17, 11, 11, 17, 19, 15, 7, 15, 19, 17, 11, 11, 18, 19, 14, 7, 15, 19, 17, 11, 12, 18, 19, 14, 8, 15, 19, 17, 10];
const PHASE_A = [12, 37, 53, 50, 31, 17, 34, 38, 32, 20, 20, 36, 46, 41, 20, 31, 49, 48, 33, 13, 27, 34, 34, 26, 16, 38, 51, 48, 27, 23, 41, 42];
const PHASE_B = [48, 48, 31, 20, 41, 46, 37, 20, 20, 32, 37, 33, 17, 31, 50, 53, 37, 12, 32, 39, 35, 23, 16, 32, 43, 42, 25, 25, 47, 51, 38, 17];
/** Seconds per phase swap — calmer styles move slower. */
const PACE: Record<Style, number> = { lofi: 0.6, neo: 0.5, ambient: 1.4, rain: 0.9, piano: 0.8, custom: 0.8 };

function Equalizer({ style, playing }: { style: Style; playing: boolean }) {
  const [phase, setPhase] = useState(0);
  useEffect(() => {
    if (!playing || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setPhase((p) => p + 1), PACE[style] * 1000);
    return () => clearInterval(id);
  }, [playing, style]);
  const heights = !playing ? STILL : phase % 2 ? PHASE_B : PHASE_A;
  const ink = style === "lofi" || style === "piano" || style === "custom" ? "bg-study-text" : "bg-(--color-text-primary)";
  const [from, to] = eqBg[style];
  return (
    <div
      aria-hidden
      className="flex h-68 w-full shrink-0 items-center justify-center gap-4 overflow-clip rounded-lg px-12"
      style={{ backgroundImage: `linear-gradient(${phase % 2 ? 156.88 : 142.93}deg, ${from} 6.78%, ${to} 91.53%)` }}
    >
      {heights.map((h, i) => (
        <span
          key={i}
          className={`min-w-px flex-1 rounded-full ${ink} transition-[height] ease-in-out`}
          style={{ height: h, transitionDuration: `${PACE[style] * 900}ms` }}
        />
      ))}
    </div>
  );
}

/** Study / Player toggle (902:90202): Off = white + border, On = brand-subtle. */
function Toggle({ on, label, onClick, children }: { on: boolean; label: string; onClick?: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={on}
      onClick={onClick}
      className={`flex shrink-0 cursor-pointer items-center justify-center gap-8 rounded-full px-12 py-8 transition-colors duration-(--duration-fast) ${on ? "bg-brand-subtle text-brand" : "border border-general-default bg-surface-primary text-icon-general-primary hover:bg-surface-hover"}`}
    >
      {children}
    </button>
  );
}

/** Audio / Sleep timer menu (930:4460): Off / 15 / 25 / 50 / 90 min, or a custom length in 5-min steps. */
function SleepMenu() {
  const { sleep, setSleep } = useStudy();
  const [view, setView] = useState<"list" | "custom">("list");
  const [custom, setCustom] = useState(30);
  const [open, setOpen] = useState(false);
  const isCustom = sleep.minutes > 0 && !a.sleep.options.includes(sleep.minutes);
  return (
    <Popover.Root modal open={open} onOpenChange={(o) => { setOpen(o); if (!o) setView("list"); }}>
      <Popover.Trigger asChild>
        <button
          type="button"
          aria-label={a.sleep.title}
          className={`flex shrink-0 cursor-pointer items-center justify-center rounded-full px-12 py-8 transition-colors duration-(--duration-fast) ${sleep.minutes ? "bg-brand-subtle text-brand" : "border border-general-default bg-surface-primary text-icon-general-primary hover:bg-surface-hover"}`}
        >
          <TimerIcon className="size-16" />
        </button>
      </Popover.Trigger>
      {/* Blur (no dimming) over the music card only — the card is `relative`; a click on it closes the menu. */}
      {open && <div aria-hidden className="absolute inset-0 z-10 backdrop-blur-[2px] animate-scrim-in" />}
      <Popover.Portal>
        <Popover.Content side="top" align="end" sideOffset={8} className="z-50 flex w-200 flex-col gap-2 rounded-lg border border-general-default bg-surface-primary p-8 shadow-sheet outline-none">
          {view === "list" ? (
            <>
              <p className="type-caption px-12 py-4 text-muted">{a.sleep.title}</p>
              {a.sleep.options.map((m) => {
                const selected = sleep.minutes === m;
                return (
                  <button
                    key={m}
                    type="button"
                    onClick={() => { setSleep(m); setOpen(false); }}
                    className={`type-label flex h-36 cursor-pointer items-center justify-between rounded-md px-12 ${selected ? "bg-brand-subtle text-brand" : "text-primary hover:bg-surface-hover"}`}
                  >
                    {m ? `${m} min` : a.sleep.off}
                    {selected && <CheckIcon />}
                  </button>
                );
              })}
              <button
                type="button"
                onClick={() => setView("custom")}
                className={`type-label flex h-36 cursor-pointer items-center justify-between rounded-md px-12 ${isCustom ? "bg-brand-subtle text-brand" : "text-primary hover:bg-surface-hover"}`}
              >
                {a.custom}
                <span className="type-caption flex items-center gap-2 text-muted">
                  {isCustom ? sleep.minutes : custom} min
                  <ChevronRightIcon className="size-16" />
                </span>
              </button>
            </>
          ) : (
            <div className="flex flex-col gap-8">
              <button type="button" onClick={() => setView("list")} className="type-caption flex cursor-pointer items-center gap-4 px-12 py-4 text-muted">
                <ChevronLeftIcon className="size-16" />
                {a.sleep.custom}
              </button>
              <div className="flex items-center justify-between px-12 py-16">
                <button type="button" aria-label="−5 min" onClick={() => setCustom((v) => Math.max(5, v - 5))} className="flex size-40 cursor-pointer items-center justify-center rounded-full border border-general-default bg-surface-primary text-icon-general-primary">
                  <MinusIcon />
                </button>
                <div className="flex flex-col items-center">
                  <span className="type-page-title text-primary tabular-nums">{custom}</span>
                  <span className="type-caption text-muted">{a.sleep.minutes}</span>
                </div>
                <button type="button" aria-label="+5 min" onClick={() => setCustom((v) => Math.min(180, v + 5))} className="flex size-40 cursor-pointer items-center justify-center rounded-full border border-general-default bg-surface-primary text-icon-general-primary">
                  <PlusIcon />
                </button>
              </div>
              <button type="button" onClick={() => { setSleep(custom); setOpen(false); setView("list"); }} className="type-label flex h-36 cursor-pointer items-center justify-center rounded-full bg-brand text-on-brand hover:bg-brand-hover">
                {a.sleep.set}
              </button>
            </div>
          )}
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Mute button: tap to mute, press and hold (or ↑/↓) for a volume slider. */
function VolumeButton() {
  const s = useStudy();
  const [open, setOpen] = useState(false);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const cancel = () => hold.current && clearTimeout(hold.current);
  const level = Math.round((s.muted ? 0 : s.volume) * 100);
  return (
    <Popover.Root modal open={open} onOpenChange={setOpen}>
      {/* Same light blur over the music card as the sleep timer menu. */}
      {open && <div aria-hidden className="absolute inset-0 z-10 backdrop-blur-[2px] animate-scrim-in" />}
      <Popover.Anchor asChild>
        <button
          type="button"
          aria-label={s.muted ? "Unmute" : "Mute"}
          aria-pressed={s.muted}
          title={a.volume.hint}
          onPointerDown={() => {
            held.current = false;
            hold.current = setTimeout(() => {
              held.current = true;
              setOpen(true);
            }, 450);
          }}
          onPointerUp={cancel}
          onPointerLeave={cancel}
          onContextMenu={(e) => e.preventDefault()}
          onClick={() => !held.current && s.setMuted(!s.muted)}
          onKeyDown={(e) => {
            if (e.key !== "ArrowUp" && e.key !== "ArrowDown") return;
            e.preventDefault();
            setOpen(true);
          }}
          className="flex size-40 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-primary text-icon-general-primary transition-colors duration-(--duration-fast) select-none [-webkit-touch-callout:none] hover:bg-surface-hover"
        >
          {s.muted || !s.volume ? <VolumeOffIcon /> : <VolumeOnIcon />}
        </button>
      </Popover.Anchor>
      <Popover.Portal>
        <Popover.Content side="bottom" align="end" sideOffset={8} className="z-40 flex w-240 items-center gap-12 rounded-lg border border-general-default bg-surface-primary px-16 py-12 shadow-sheet outline-none">
          <button type="button" aria-label={s.muted ? "Unmute" : "Mute"} onClick={() => s.setMuted(!s.muted)} className="flex shrink-0 cursor-pointer text-icon-general-primary">
            {s.muted || !s.volume ? <VolumeOffIcon /> : <VolumeOnIcon />}
          </button>
          <input
            type="range"
            min={0}
            max={100}
            value={level}
            autoFocus
            aria-label={a.volume.label}
            onChange={(e) => s.setVolume(Number(e.target.value) / 100)}
            className="h-4 min-w-0 flex-1 cursor-pointer accent-(--color-bg-brand)"
          />
          <span className="type-caption w-32 shrink-0 text-right text-secondary tabular-nums">{level}%</span>
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
}

/** Progress bar: click or drag to seek, ←/→ steps 5 seconds. */
function SeekBar() {
  const s = useStudy();
  const [drag, setDrag] = useState<number | null>(null);
  const at = (e: React.PointerEvent<HTMLDivElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    return Math.min(1, Math.max(0, (e.clientX - r.left) / r.width));
  };
  const fraction = drag ?? (s.duration ? Math.min(1, s.elapsed / s.duration) : 0);
  const shown = drag !== null ? Math.round(drag * s.duration) : s.elapsed;
  return (
    <div className="flex h-32 w-full flex-col gap-8">
      <div
        role="slider"
        tabIndex={0}
        aria-label="Seek"
        aria-valuemin={0}
        aria-valuemax={s.duration}
        aria-valuenow={shown}
        aria-valuetext={clock(shown)}
        onPointerDown={(e) => {
          e.currentTarget.setPointerCapture(e.pointerId);
          setDrag(at(e));
        }}
        onPointerMove={(e) => drag !== null && setDrag(at(e))}
        onPointerUp={(e) => {
          if (drag === null) return;
          s.seek(at(e));
          setDrag(null);
        }}
        onPointerCancel={() => setDrag(null)}
        onKeyDown={(e) => {
          const step = e.key === "ArrowRight" ? 5 : e.key === "ArrowLeft" ? -5 : 0;
          if (!step || !s.duration) return;
          e.preventDefault();
          s.seek((s.elapsed + step) / s.duration);
        }}
        className="group/seek relative -my-5 flex h-16 w-full shrink-0 cursor-pointer touch-none items-center rounded-full outline-none focus-visible:shadow-focus"
      >
        <span className="h-6 w-full overflow-clip rounded-full bg-(--color-border-general-secondary)">
          {/* No easing while dragging, so the bar follows the pointer. */}
          <span className={`block h-6 rounded-full bg-brand ${drag === null ? "transition-[width] duration-1000 ease-linear" : ""}`} style={{ width: `${fraction * 100}%` }} />
        </span>
        <span
          aria-hidden
          className={`absolute size-14 -translate-x-1/2 rounded-full border-2 border-(--color-bg-surface-primary) bg-brand shadow-card transition-opacity duration-(--duration-fast) ${drag !== null ? "opacity-100" : "opacity-0 group-hover/seek:opacity-100 group-focus-visible/seek:opacity-100"}`}
          style={{ left: `${fraction * 100}%` }}
        />
      </div>
      <div className="type-caption flex h-18 w-full justify-between text-secondary tabular-nums">
        <span>{clock(shown)}</span>
        <span>{s.duration ? clock(s.duration) : "—"}</span>
      </div>
    </div>
  );
}

/** Melody picker (Figma 1332:135293): press and hold a sound style to pick one of its tracks (only styles with more than one). */
function MelodyPicker({ vibe, onClose }: { vibe: Vibe | null; onClose: () => void }) {
  const { playTrack, vibe: current, index, status } = useStudy();
  const info = vibes.find((v) => v.key === vibe);
  return (
    <Dialog.Root open={!!vibe} onOpenChange={(o) => !o && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay-scrim backdrop-blur-backdrop data-[state=closed]:animate-scrim-out data-[state=open]:animate-scrim-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[85dvh] flex-col gap-16 overflow-y-auto rounded-t-card bg-surface-primary p-24 shadow-sheet outline-none data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in tablet:inset-auto tablet:top-1/2 tablet:left-1/2 tablet:w-420 tablet:-translate-x-1/2 tablet:-translate-y-1/2 tablet:rounded-card tablet:data-[state=closed]:animate-dissolve-out tablet:data-[state=open]:animate-dissolve-in"
        >
          {info && (
            <>
              <div className="flex items-center gap-12">
                <span className="flex size-44 shrink-0 items-center justify-center rounded-lg bg-brand-subtle text-brand">
                  <WaveformIcon className="size-24" />
                </span>
                <div className="flex min-w-0 flex-1 flex-col gap-2">
                  <p className="type-eyebrow text-brand">{a.picker.eyebrow}</p>
                  <Dialog.Title className="type-subheading text-primary">{info.title}</Dialog.Title>
                  <p className="type-caption text-secondary">{a.picker.caption(tracks[info.key].length)}</p>
                </div>
                <Dialog.Close aria-label="Close" className="flex size-36 cursor-pointer items-center justify-center rounded-full bg-surface-secondary text-icon-general-primary">
                  <CloseIcon />
                </Dialog.Close>
              </div>
              <span aria-hidden className="h-px w-full bg-(--color-border-line-divider)" />
              <ol className="flex flex-col gap-4">
                {tracks[info.key].map(([title, len], i) => {
                  const active = current === info.key && index === i && status === "playing";
                  return (
                    <li key={title}>
                      <button
                        type="button"
                        onClick={() => { playTrack(info.key, i); onClose(); }}
                        className="flex w-full cursor-pointer items-center gap-12 rounded-lg py-8 pr-12 pl-8 text-left hover:bg-surface-hover"
                      >
                        <span className={`flex size-32 shrink-0 items-center justify-center rounded-full ${active || i === 0 ? "bg-brand text-on-brand" : "bg-surface-secondary text-icon-general-primary"}`}>
                          <PlayFilledIcon className="size-16" />
                        </span>
                        <span className="flex min-w-0 flex-1 flex-col">
                          <span className="type-mobile-label text-primary">{title}</span>
                          <span className="type-caption text-secondary">{`${String(i + 1).padStart(2, "0")} · ${info.label} · ${a.collection}`}</span>
                        </span>
                        <span className="type-label text-secondary">{len}</span>
                      </button>
                    </li>
                  );
                })}
              </ol>
            </>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Study / Focus audio (Figma 379:15202): generated focus music with play, skip, seek, loop, sleep timer and mute. */
export function FocusAudio({ className = "" }: { className?: string }) {
  const s = useStudy();
  const { setOpen } = useDrawer();
  const [picker, setPicker] = useState<Vibe | null>(null);
  const hold = useRef<ReturnType<typeof setTimeout> | null>(null);
  const held = useRef(false);
  const style = s.vibe;
  const playing = s.status === "playing";

  const startHold = (v: Vibe) => {
    held.current = false;
    if (tracks[v].length < 2) return;
    hold.current = setTimeout(() => {
      held.current = true;
      setPicker(v);
    }, 450);
  };
  const endHold = () => hold.current && clearTimeout(hold.current);

  // Desktop has no touch swipe: let the wheel and a mouse drag scroll the style row sideways.
  const row = useRef<HTMLDivElement>(null);
  const drag = useRef<{ x: number; left: number; moved: boolean } | null>(null);
  useEffect(() => {
    const el = row.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      if (Math.abs(e.deltaY) <= Math.abs(e.deltaX)) return;
      const max = el.scrollWidth - el.clientWidth;
      if ((e.deltaY < 0 && el.scrollLeft <= 0) || (e.deltaY > 0 && el.scrollLeft >= max)) return;
      e.preventDefault();
      el.scrollLeft += e.deltaY;
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <section
      aria-label={a.nowPlaying}
      className={`relative flex flex-col items-start gap-16 overflow-clip rounded-shell p-24 ${className}`}
      style={{ backgroundImage: `linear-gradient(104.06deg, var(--color-bg-surface-primary) 6.78%, ${cardBg[style]} 91.53%)` }}
    >
      <div className="flex w-full items-center justify-between">
        <p className="type-table-heading text-secondary">{a.nowPlaying}</p>
        <button
          type="button"
          aria-label={a.library.title}
          onClick={() => setOpen("study-music", style)}
          className="flex size-40 cursor-pointer items-center justify-center rounded-full bg-surface-primary text-icon-general-primary transition-colors duration-(--duration-fast) hover:bg-surface-hover"
        >
          <PlaylistIcon />
        </button>
      </div>
      <div className="flex w-full items-center gap-12">
        {s.vibe === "custom" ? <CustomCover song={s.customSong} className="size-64 rounded-lg" /> : <TrackCover vibe={s.vibe} index={s.index} className="size-64" />}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="truncate text-[20px] leading-[28px] font-semibold text-primary">{s.vibe === "custom" && !s.customSong ? a.customLists.count.split(" · ")[1] : s.title}</p>
          <p className="type-caption truncate text-secondary">{s.vibe === "custom" ? (s.blocked ? a.customLists.blocked : (s.customSong?.source ?? a.custom)) : trackCaption(s.vibe, s.index)}</p>
        </div>
        <VolumeButton />
      </div>
      <Equalizer style={style} playing={playing} />
      <SeekBar />
      <div className="flex w-full flex-wrap content-center items-center justify-between gap-8">
        <Toggle on={s.loop} label="Repeat track" onClick={() => s.setLoop(!s.loop)}>
          <RefreshIcon className="size-16" />
        </Toggle>
        <button type="button" aria-label="Previous track" onClick={() => s.skip(-1)} className="flex size-40 cursor-pointer items-center justify-center rounded-full bg-surface-primary text-icon-general-primary hover:bg-surface-hover">
          <SkipBackIcon className="size-18" />
        </button>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={s.toggle}
          className="flex size-56 cursor-pointer items-center justify-center rounded-full bg-brand text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover"
        >
          {playing ? <PauseIcon className="size-24" /> : <PlayFilledIcon className="size-24" />}
        </button>
        <button type="button" aria-label="Next track" onClick={() => s.skip(1)} className="flex size-40 cursor-pointer items-center justify-center rounded-full bg-surface-primary text-icon-general-primary hover:bg-surface-hover">
          <SkipForwardIcon className="size-18" />
        </button>
        <SleepMenu />
      </div>
      <div className="flex w-full flex-col gap-8 pt-8">
        <p className="type-table-heading text-secondary">{a.soundStyle}</p>
        <div
          ref={row}
          onPointerDown={(e) => {
            if (e.pointerType === "mouse" && e.button === 0) drag.current = { x: e.clientX, left: e.currentTarget.scrollLeft, moved: false };
          }}
          onPointerMove={(e) => {
            const d = drag.current;
            if (!d) return;
            const dx = e.clientX - d.x;
            if (!d.moved && Math.abs(dx) < 5) return;
            if (!d.moved) {
              d.moved = true;
              endHold();
              e.currentTarget.setPointerCapture(e.pointerId);
            }
            e.currentTarget.scrollLeft = d.left - dx;
          }}
          onPointerUp={() => { if (drag.current && !drag.current.moved) drag.current = null; }}
          onClickCapture={(e) => {
            if (drag.current?.moved) { e.preventDefault(); e.stopPropagation(); }
            drag.current = null;
          }}
          className="flex w-full items-start gap-8 overflow-x-auto [scrollbar-width:none]"
          role="radiogroup" aria-label={a.soundStyle} title={vibes.some((v) => tracks[v.key].length > 1) ? a.picker.hint : undefined}>
          {vibes.map((v) => (
            <button
              key={v.key}
              type="button"
              role="radio"
              aria-checked={style === v.key}
              onPointerDown={() => startHold(v.key)}
              onPointerUp={endHold}
              onPointerLeave={endHold}
              onContextMenu={(e) => e.preventDefault()}
              onClick={() => !held.current && s.chooseVibe(v.key)}
              className={`type-caption flex h-36 shrink-0 cursor-pointer items-center justify-center rounded-full px-16 select-none ${style === v.key ? "bg-brand text-on-brand" : "bg-surface-primary text-primary hover:bg-surface-hover"}`}
            >
              {v.label}
            </button>
          ))}
          <button
            type="button"
            role="radio"
            aria-checked={style === "custom"}
            onClick={() => { s.chooseVibe("custom"); setOpen("study-music", "custom"); }}
            className={`type-caption flex h-36 shrink-0 cursor-pointer items-center justify-center gap-4 rounded-full px-16 ${style === "custom" ? "bg-brand text-on-brand" : "bg-surface-primary text-primary hover:bg-surface-hover"}`}
          >
            {a.custom}
            <span aria-hidden className={`size-6 rounded-full ${style === "custom" ? "bg-(--color-icon-on-brand)" : "bg-brand"}`} />
          </button>
        </div>
      </div>
      <MelodyPicker vibe={picker} onClose={() => setPicker(null)} />
    </section>
  );
}
