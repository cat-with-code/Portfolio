"use client";

import { useState } from "react";
import { Chip } from "@/components/ui/chip";
import { mediaCopy as c } from "@/content/dashboard";
import { MediaTile } from "./media-tile";
import { CardHeader, WidgetCard } from "./widgets";

export type MediaGroup = "projects" | "games" | "books";
export type MediaItem = { src: string; name: string; usedOn: string; tint?: string };

const grid: Record<MediaGroup, string> = {
  projects: "grid-cols-1 tablet:grid-cols-2 desktop:grid-cols-3",
  games: "grid-cols-2 tablet:grid-cols-4",
  books: "grid-cols-2 tablet:grid-cols-4",
};

/** Dashboard / Media body (Figma 1363:3034): filter chips, then one card per group of Dashboard / Media tiles. */
export function MediaLibrary({ groups }: { groups: Record<MediaGroup, MediaItem[]> }) {
  const [filter, setFilter] = useState<"all" | MediaGroup>("all");
  const keys = Object.keys(groups) as MediaGroup[];
  const total = keys.reduce((n, k) => n + groups[k].length, 0);
  return (
    <>
      <div role="group" aria-label="Filter" className="flex max-w-full gap-8 overflow-x-auto [scrollbar-width:none]">
        <Chip selected={filter === "all"} onClick={() => setFilter("all")}>{`${c.all} · ${total}`}</Chip>
        {keys.map((k) => (
          <Chip key={k} selected={filter === k} onClick={() => setFilter(k)}>{`${c.groups[k].filter} · ${groups[k].length}`}</Chip>
        ))}
      </div>
      {keys
        .filter((k) => filter === "all" || filter === k)
        .map((k) => (
          <WidgetCard key={k} className="w-full gap-20">
            <div className="flex w-full flex-wrap items-end gap-x-16 gap-y-4">
              <div className="min-w-0 flex-1">
                <CardHeader eyebrow={c.groups[k].eyebrow} title={c.groups[k].title} />
              </div>
              <p className="type-caption whitespace-nowrap text-secondary">{`${groups[k].length} images · ${c.groups[k].note}`}</p>
            </div>
            <ul className={`grid w-full gap-20 ${grid[k]}`}>
              {groups[k].map((m) => (
                <li key={m.src} className="min-w-0">
                  <MediaTile src={m.src} title={m.name} caption={`${c.groups[k].caption} · ${m.usedOn}`} shape={k === "projects" ? "wide" : "square"} tint={m.tint} />
                </li>
              ))}
            </ul>
          </WidgetCard>
        ))}
    </>
  );
}
