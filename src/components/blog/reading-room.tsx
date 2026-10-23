"use client";

import { useRef, useState } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { magazine } from "@/content/blog";
import { WideCard } from "./post-card";

const pages = magazine.readingRoom.pages;
const pad = (n: number) => String(n).padStart(2, "0");

/**
 * Blog / Reading room (Figma 449:9648): one post per page, counter + Previous / Next
 * (dimmed at the ends), swipe left or right on the story to turn the page.
 */
export function ReadingRoom() {
  const [page, setPage] = useState(0);
  const start = useRef<number | null>(null);
  const go = (next: number) => setPage(Math.min(pages.length - 1, Math.max(0, next)));
  return (
    <div className="flex w-full flex-col items-start gap-12">
      <div
        className="w-full touch-pan-y tablet:h-300 desktop:h-278"
        onPointerDown={(e) => (start.current = e.clientX)}
        onPointerUp={(e) => {
          if (start.current === null) return;
          const dx = e.clientX - start.current;
          start.current = null;
          if (Math.abs(dx) > 40) go(page + (dx < 0 ? 1 : -1));
        }}
        aria-live="polite"
      >
        <WideCard key={pages[page].slug} placement={pages[page]} />
      </div>
      <div className="flex w-full items-center justify-between">
        <p className="type-label">
          <span className="text-primary">{pad(page + 1)}</span>
          <span className="text-muted"> / {pad(pages.length)}</span>
        </p>
        <div className="flex items-center gap-8">
          <IconButton
            aria-label="Previous post"
            aria-disabled={page === 0}
            onClick={() => go(page - 1)}
            className="aria-disabled:cursor-not-allowed aria-disabled:opacity-(--opacity-disabled)"
          >
            <ChevronLeftIcon />
          </IconButton>
          <IconButton
            aria-label="Next post"
            aria-disabled={page === pages.length - 1}
            onClick={() => go(page + 1)}
            className="aria-disabled:cursor-not-allowed aria-disabled:opacity-(--opacity-disabled)"
          >
            <ChevronRightIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
