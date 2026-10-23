"use client";

import { useRef, useState } from "react";
import { BookArt } from "@/components/blog/book-drawers";
import { TextReader } from "@/components/reader/text-reader";
import { caseStudyCopy } from "@/content/case-studies";
import { books } from "@/content/books";
import { recentlyRead as rr } from "@/content/study";

const items = rr.books.map((b) => ({ ...b, book: books.find((x) => x.key === b.key)! }));

/** Study / Recently read carousel (Figma 891:86899): one book at a time, dots + swipe. */
export function RecentlyRead() {
  const [index, setIndex] = useState(0);
  const start = useRef<number | null>(null);
  const go = (i: number) => setIndex(Math.min(items.length - 1, Math.max(0, i)));
  return (
    <div className="flex w-full flex-col items-center gap-4">
      <div
        className="w-full touch-pan-y overflow-clip rounded-shell"
        onPointerDown={(e) => (start.current = e.clientX)}
        onPointerUp={(e) => {
          if (start.current === null) return;
          const dx = e.clientX - start.current;
          start.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        <div className="flex gap-24 transition-transform duration-(--duration-drawer) ease-figma-out" style={{ transform: `translateX(calc(${-index} * (100% + 24px)))` }}>
          {items.map(({ book, topic, progress }, i) => (
            <article
              key={book.key}
              aria-hidden={i !== index}
              inert={i !== index}
              className="flex w-full shrink-0 flex-col overflow-clip rounded-shell border border-general-default bg-page tablet:min-h-297 tablet:flex-row"
            >
              <div className={`flex h-280 w-full shrink-0 items-center justify-center p-16 tablet:h-auto tablet:w-240 tablet:p-24 tablet:bg-transparent ${book.tint}`}>
                <span className="relative block h-244 w-183">
                  <BookArt book={book} />
                </span>
              </div>
              <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-8 px-20 pt-16 pb-20">
                <span className="type-eyebrow flex h-32 items-center rounded-full bg-accent-blue-subtle px-12 whitespace-pre text-brand">{rr.inProgress}</span>
                <h3 className="type-page-title w-full text-primary">{book.title}</h3>
                <p className="type-caption w-full whitespace-pre-wrap text-secondary">{`${book.author}  ·  ${topic}`}</p>
                <p className="type-body w-full text-secondary tablet:line-clamp-2">{book.brief.bigIdea}</p>
                <TextReader title={book.title} text={`${book.title}, by ${book.author}. ${book.brief.bigIdea}`} lang="en" labels={caseStudyCopy.reader} />
                <div className="flex w-full items-start justify-between gap-8">
                  <span className="type-caption text-secondary">{rr.progress}</span>
                  <span className="type-label text-brand">{progress}%</span>
                </div>
                <div className="h-8 w-full overflow-clip rounded-[4px] bg-surface-subtle" role="progressbar" aria-valuenow={progress} aria-valuemin={0} aria-valuemax={100} aria-label={rr.progress}>
                  <span className="block h-8 rounded-full bg-brand" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
      <div className="flex items-center gap-4" role="tablist" aria-label={rr.title}>
        {items.map(({ book }, i) => (
          <button key={book.key} type="button" role="tab" aria-selected={i === index} aria-label={book.title} onClick={() => go(i)} className="flex cursor-pointer items-center justify-center px-4 py-16">
            <span className={`block h-12 rounded-full transition-[width] duration-(--duration-standard) ease-standard ${i === index ? "w-32 bg-brand" : "w-12 bg-(--color-border-general-strong) opacity-60"}`} />
          </button>
        ))}
      </div>
    </div>
  );
}
