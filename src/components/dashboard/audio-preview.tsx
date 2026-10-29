"use client";

import { useRef, useState } from "react";
import { PauseIcon, PlayFilledIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";

/**
 * Track editor: listen to the audio file before or after saving. Plays from storage (the same file visitors get) and
 * shows the time while playing. Give it `key={src}` so a new file starts fresh; leaving the editor stops it.
 */
export function AudioPreview({ src, labels }: { src: string; labels: { preview: string; stop: string; previewError: string } }) {
  const audio = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [time, setTime] = useState(0);
  const [failed, setFailed] = useState(false);

  const toggle = () => {
    const el = audio.current;
    if (!el) return;
    if (playing) el.pause();
    else el.play().catch(() => setFailed(true));
  };

  const clock = `${Math.floor(time / 60)}:${String(Math.floor(time % 60)).padStart(2, "0")}`;
  return (
    <span className="flex items-center gap-8">
      <audio
        ref={audio}
        src={src}
        preload="none"
        onPlay={() => (setPlaying(true), setFailed(false))}
        onPause={() => setPlaying(false)}
        onEnded={() => setPlaying(false)}
        onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
        onError={() => (setPlaying(false), setFailed(true))}
      />
      <Button variant="secondary" size="small" icon={playing ? <PauseIcon className="size-20" /> : <PlayFilledIcon className="size-20" />} onClick={toggle} aria-pressed={playing}>
        {playing ? `${labels.stop} · ${clock}` : labels.preview}
      </Button>
      {failed && <span className="type-caption text-status-error">{labels.previewError}</span>}
    </span>
  );
}
