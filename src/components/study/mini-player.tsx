"use client";

import { useSiteContent } from "@/components/content/site-content";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { CloseIcon, PauseIcon, PlayFilledIcon, SkipForwardIcon } from "@/components/icons";
import { useReader } from "@/components/reader/reader-provider";
import { FloatingCard } from "@/components/ui/floating-card";
import { audioCopy as a, trackCaption } from "@/content/study";
import { CustomCover, TrackCover } from "./focus-audio";
import { useStudy } from "./study-provider";

/** Whether the mini player is on screen: music is playing or paused, and this isn't the Study page. */
export function useMiniPlayerVisible(lang: string) {
  const { status } = useStudy();
  const pathname = usePathname();
  const study = `/${lang}/study`;
  return status !== "stopped" && pathname !== study && !pathname.startsWith(`${study}/`);
}

/**
 * Floating player shown on every page except Study while focus music or a YouTube song is playing or paused.
 * Drag it anywhere (the spot is remembered); a tap still works its buttons. Closing it stops the music.
 */
export function MiniPlayer({ lang, closeLabel }: { lang: string; closeLabel: string }) {
  const { tracks } = useSiteContent();
  const s = useStudy();
  const study = `/${lang}/study`;
  const visible = useMiniPlayerVisible(lang);
  // Only one floating box at a time: while the reader was played after the music, the music box steps aside
  // (even on the reader's own page, where the reader shows inline instead of floating).
  const { front, state: readerState } = useReader();
  const readerInFront = readerState !== "idle" && front === "reader";
  if (!visible || readerInFront) return null;

  const caption = s.vibe === "custom" ? (s.customSong?.source ?? a.custom) : trackCaption(tracks, s.vibe, s.index);
  const playing = s.status === "playing";
  return (
    <FloatingCard storageKey="mini-player-pos" label={a.nowPlaying} className="inset-x-(--layout-gutter) bottom-16 tablet:inset-x-auto tablet:right-24 tablet:bottom-24 tablet:w-360">
      <div className="flex items-center gap-12 py-12 pr-12 pl-12">
        <Link href={study} aria-label={`${a.nowPlaying}: ${s.title}`} className="flex min-w-0 flex-1 items-center gap-12 rounded-lg">
          {s.vibe === "custom" ? <CustomCover song={s.customSong} className="size-44 rounded-md" /> : <TrackCover vibe={s.vibe} index={s.index} className="size-44" />}
          <span className="flex min-w-0 flex-1 flex-col">
            <span className="type-label truncate text-primary">{s.title}</span>
            <span className="type-caption truncate text-secondary">{caption}</span>
          </span>
        </Link>
        <button
          type="button"
          aria-label={playing ? "Pause" : "Play"}
          onClick={s.toggle}
          className="flex size-40 shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover"
        >
          {playing ? <PauseIcon className="size-18" /> : <PlayFilledIcon className="size-18" />}
        </button>
        <button type="button" aria-label="Next track" onClick={() => s.skip(1)} className="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-general-primary hover:bg-surface-hover">
          <SkipForwardIcon className="size-18" />
        </button>
        <button type="button" aria-label={closeLabel} onClick={s.stop} className="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-general-primary hover:bg-surface-hover">
          <CloseIcon />
        </button>
      </div>
      <span aria-hidden className="h-2 w-full bg-(--color-border-general-secondary)">
        <span className="block h-2 bg-brand transition-[width] duration-1000 ease-linear" style={{ width: s.duration ? `${(s.elapsed / s.duration) * 100}%` : 0 }} />
      </span>
    </FloatingCard>
  );
}
