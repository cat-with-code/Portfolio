"use client";

import Link from "next/link";
import { CloseIcon, PauseIcon, PlayFilledIcon, WaveformIcon } from "@/components/icons";
import { useMiniPlayerVisible } from "@/components/study/mini-player";
import { FloatingCard } from "@/components/ui/floating-card";
import { clock } from "@/lib/speech";
import { useReader, useReaderCanFloat } from "./reader-provider";
import { SpeedChip } from "./text-reader";

/**
 * Floating reader: when you leave a page (or close the drawer) while "Listen instead" is reading, it keeps reading here.
 * Tap the title to go back to that page; ✕ stops reading. Only one floating box shows at a time: when the music could
 * show too, the one played last wins.
 */
export function FloatingReader({ lang, closeLabel }: { lang: string; closeLabel: string }) {
  const r = useReader();
  const music = useMiniPlayerVisible(lang);
  const canFloat = useReaderCanFloat();
  const s = r.session;
  if (!s || !canFloat || (music && r.front === "music")) return null;

  const playing = r.state === "playing";
  return (
    <FloatingCard
      storageKey="floating-reader-pos"
      label={s.labels.playing}
      className="inset-x-(--layout-gutter) bottom-16 tablet:inset-x-auto tablet:right-24 tablet:bottom-24 tablet:w-360"
    >
      <div className="flex items-center gap-12 p-12">
        <Link href={s.href} aria-label={`${s.labels.playing}: ${s.title}`} className="flex min-w-0 flex-1 items-center gap-12 rounded-lg">
          <span aria-hidden className="flex size-44 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-brand">
            <WaveformIcon className="size-24" />
          </span>
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="type-label truncate text-primary">{s.title}</span>
            <span className="type-caption truncate text-secondary tabular-nums">{`${s.labels.idleMeta} · ${clock(r.elapsed)} / ${clock(r.total)}`}</span>
          </span>
        </Link>
        <button
          type="button"
          aria-label={playing ? s.labels.pause : s.labels.play}
          onClick={r.toggle}
          className="flex size-40 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover"
        >
          {playing ? <PauseIcon className="size-18" /> : <PlayFilledIcon className="size-18" />}
        </button>
        <SpeedChip />
        <button type="button" aria-label={closeLabel} onClick={r.stop} className="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-general-primary hover:bg-surface-hover">
          <CloseIcon />
        </button>
      </div>
      <span aria-hidden className="h-2 w-full bg-(--color-border-general-secondary)">
        <span className="block h-2 bg-brand transition-[width] duration-1000 ease-linear" style={{ width: `${Math.min(100, (r.elapsed / r.total) * 100)}%` }} />
      </span>
    </FloatingCard>
  );
}
