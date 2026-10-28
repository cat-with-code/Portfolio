"use client";

import { useSiteContent } from "@/components/content/site-content";
import Link from "next/link";
import { useState } from "react";
import { PlaylistIcon } from "@/components/icons";
import { Chip } from "@/components/ui/chip";
import { studyCopy as c } from "@/content/dashboard";
import { bookCover, type Book } from "@/content/books";
import { trackCaption, vibes, type Vibe } from "@/content/study";
import { Rows } from "./content-list";
import { AddStudyItemButton } from "./dialogs";
import { MediaTile } from "./media-tile";
import { CardHeader, WidgetCard } from "./widgets";

/** Dashboard / Study library body (Figma 1363:2755): All / Music / Books filter, Focus music card with vibe chips, Book library grid. */
export function StudyLibrary({ books }: { books: Book[] }) {
  const { tracks } = useSiteContent();
  const trackCount = vibes.reduce((n, v) => n + tracks[v.key].length, 0);
  const [filter, setFilter] = useState<"all" | "music" | "books">("all");
  const [vibe, setVibe] = useState<Vibe | "custom">("lofi");
  const filters = [
    { key: "all", label: `${c.filters.all} · ${trackCount + books.length}` },
    { key: "music", label: `${c.filters.music} · ${trackCount}` },
    { key: "books", label: `${c.filters.books} · ${books.length}` },
  ] as const;

  return (
    <>
      <div role="group" aria-label="Filter" className="flex max-w-full gap-8 overflow-x-auto [scrollbar-width:none]">
        {filters.map((f) => (
          <Chip key={f.key} selected={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </Chip>
        ))}
      </div>

      {filter !== "books" && (
        <WidgetCard className="w-full gap-20">
          <div className="flex w-full flex-wrap items-center gap-16">
            <div className="min-w-0 flex-1">
              <CardHeader eyebrow={c.music.eyebrow} title={c.music.title} />
            </div>
            <p className="type-caption hidden whitespace-nowrap text-secondary tablet:block">{c.music.summary(trackCount, vibes.length)}</p>
            <AddStudyItemButton label={c.addTrack} variant="secondary" />
          </div>
          <div role="group" aria-label="Vibe" className="flex max-w-full gap-8 overflow-x-auto [scrollbar-width:none]">
            {vibes.map((v) => (
              <Chip key={v.key} selected={vibe === v.key} onClick={() => setVibe(v.key)}>
                {`${v.label} · ${tracks[v.key].length}`}
              </Chip>
            ))}
            <Chip selected={vibe === "custom"} onClick={() => setVibe("custom")}>
              {c.music.custom}
            </Chip>
          </div>
          {vibe === "custom" ? (
            <p className="type-body w-full rounded-lg bg-surface-secondary px-16 py-12 text-secondary">{c.music.customNote}</p>
          ) : (
            <Rows
              icon={<PlaylistIcon className="size-24" />}
              tint="bg-accent-blue-subtle"
              rows={tracks[vibe].map(([title, length], i) => ({
                key: `${vibe}-${i}`,
                title,
                meta: trackCaption(tracks, vibe, i),
                info: length,
                href: `/dashboard/study/tracks/${vibe}-${i}`,
              }))}
            />
          )}
        </WidgetCard>
      )}

      {filter !== "music" && (
        <WidgetCard className="w-full gap-20">
          <div className="flex w-full flex-wrap items-center gap-16">
            <div className="min-w-0 flex-1">
              <CardHeader eyebrow={c.books.eyebrow} title={c.books.title} />
            </div>
            <p className="type-caption hidden whitespace-nowrap text-secondary tablet:block">{c.books.summary(books.length)}</p>
            <AddStudyItemButton label={c.addBook} kind="book" variant="secondary" />
          </div>
          <ul className="grid w-full grid-cols-2 gap-20 tablet:grid-cols-4">
            {books.map((b) => (
              <li key={b.key} className="min-w-0">
                <Link href={`/dashboard/study/books/${b.key}`} className="block rounded-card transition-opacity duration-(--duration-fast) hover:opacity-80">
                  <MediaTile src={bookCover(b)} title={b.title} caption={`${b.author} · ${b.topic}`} tint={b.tint} />
                </Link>
              </li>
            ))}
          </ul>
        </WidgetCard>
      )}
    </>
  );
}
