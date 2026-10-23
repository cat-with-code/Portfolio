"use client";

import type { ComponentType, SVGProps } from "react";
import { BookAlchemistArt } from "@/components/illustrations/book-alchemist";
import { BookAtomicHabitsArt } from "@/components/illustrations/book-atomic-habits";
import { BookBriefHistoryOfTimeArt } from "@/components/illustrations/book-brief-history-of-time";
import { BookDeepWorkArt } from "@/components/illustrations/book-deep-work";
import { BookLittlePrinceArt } from "@/components/illustrations/book-little-prince";
import { BookMakeItStickArt } from "@/components/illustrations/book-make-it-stick";
import { BookMindsetArt } from "@/components/illustrations/book-mindset";
import { BookPsychologyOfMoneyArt } from "@/components/illustrations/book-psychology-of-money";
import { TextReader } from "@/components/reader/text-reader";
import { useDrawer, useDrawerPayload, useDrawerState } from "@/components/shell/drawer-provider";
import { SidePanel } from "@/components/ui/side-panel";
import { caseStudyCopy } from "@/content/case-studies";
import { books, library, type Book } from "@/content/books";
import { GlyphClose, panelPlacement } from "./blog-drawers";

const covers: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = {
  "atomic-habits": BookAtomicHabitsArt,
  "deep-work": BookDeepWorkArt,
  "make-it-stick": BookMakeItStickArt,
  "psychology-of-money": BookPsychologyOfMoneyArt,
  mindset: BookMindsetArt,
  "little-prince": BookLittlePrinceArt,
  alchemist: BookAlchemistArt,
  "brief-history-of-time": BookBriefHistoryOfTimeArt,
};

/** Study / Book art (Fit=Fill): a 3D book mock-up around the cover, drawn to its box. */
export function BookArt({ book, className = "" }: { book: Book; className?: string }) {
  const Art = covers[book.key];
  return <Art aria-hidden width="100%" height="100%" preserveAspectRatio="none" className={`block ${className}`} />;
}

/** Study / Book Library drawer (Figma 694:20083): one row per book; Brief opens the book brief. */
export function LibraryDrawer({ closeLabel }: { closeLabel: string }) {
  const state = useDrawerState("book-library");
  const { setOpen } = useDrawer();
  return (
    <SidePanel {...state} title={library.title} className={`${panelPlacement} border border-general-subtle bg-surface-primary`}>
      <div className="flex h-51 w-full shrink-0 items-center justify-between gap-12 tablet:h-54">
        <div className="flex min-w-0 flex-1 flex-col items-start gap-3">
          <p className="type-eyebrow w-full whitespace-pre text-brand">{library.eyebrow(books.length)}</p>
          <p className="type-page-title w-full text-primary">{library.title}</p>
        </div>
        <GlyphClose label={closeLabel} className="border border-general-default bg-surface-primary text-secondary" size="text-[22px]" />
      </div>
      <p className="type-ui w-full shrink-0 text-secondary tablet:py-3">{library.summary}</p>
      <ul className="flex min-h-0 w-full flex-1 flex-col gap-16 overflow-y-auto [scrollbar-width:none]">
        {books.map((book) => (
          <li key={book.key} className="flex w-full flex-col gap-16">
            <div className="flex w-full items-center gap-16 p-2">
              <span className="relative block h-128 w-96 shrink-0 overflow-clip rounded-lg">
                <BookArt book={book} />
              </span>
              <div className="flex min-w-0 flex-1 flex-col items-start gap-8">
                <p className="type-subheading w-full text-primary">{book.title}</p>
                <p className="type-table-heading w-full text-secondary">{book.author}</p>
                <p className="type-caption w-full text-secondary">{book.teaser}</p>
                <div className="flex w-full items-center justify-between gap-8 tablet:w-auto tablet:justify-start tablet:gap-22">
                  <span className="type-table-heading flex h-26 items-center justify-center rounded-full border border-general-default bg-surface-primary px-12 text-secondary tablet:h-30 tablet:w-150 tablet:px-3">
                    #{book.topic}
                  </span>
                  <button
                    type="button"
                    onClick={() => setOpen("book-brief", book.key)}
                    className="type-label flex h-36 cursor-pointer items-center justify-center rounded-full bg-brand px-16 text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover tablet:h-32 tablet:w-150 tablet:px-5"
                  >
                    {library.brief}
                  </button>
                </div>
              </div>
            </div>
            <span aria-hidden className="h-px w-full shrink-0 bg-(--color-border-line-divider)" />
          </li>
        ))}
      </ul>
    </SidePanel>
  );
}

/** Study / Book brief drawer (Figma 694:21938 · Study / Book brief 1195:4785). */
export function BriefDrawer({ closeLabel }: { closeLabel: string }) {
  const state = useDrawerState("book-brief");
  const { setOpen } = useDrawer();
  const key = useDrawerPayload("book-brief");
  const book = books.find((b) => b.key === key) ?? books[0];
  const spoken = [book.title, `by ${book.author}.`, book.brief.bigIdea, ...book.brief.ideas, book.brief.sentence, book.brief.question].join(" ");
  return (
    <SidePanel {...state} title={book.title} className={`${panelPlacement} border border-general-subtle bg-surface-elevated`}>
      <div className="flex w-full shrink-0 items-center justify-between gap-12 tablet:gap-10">
        <p className="type-eyebrow min-w-0 flex-1 whitespace-pre text-brand">{library.briefEyebrow(book.topic)}</p>
        <GlyphClose label={closeLabel} className="bg-surface-secondary text-secondary" />
      </div>
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto [scrollbar-width:none]">
        <div className="flex w-full flex-col gap-32 pb-16">
          <div className="flex w-full flex-col gap-24">
            <div className={`flex h-208 w-full shrink-0 items-center justify-center rounded-card ${book.tint}`}>
              <span className="relative block h-176 w-132">
                <BookArt book={book} />
              </span>
            </div>
            <div className="flex w-full flex-col gap-8">
              <h2 className="type-kpi w-full text-primary">{book.title}</h2>
              <p className="type-ui w-full whitespace-pre-wrap text-secondary">{`${book.author}  ·  ${book.topic}`}</p>
            </div>
            <TextReader key={book.key} title={book.title} text={spoken} lang="en" labels={caseStudyCopy.reader} bordered />
          </div>
          <section className="flex w-full flex-col gap-8">
            <p className="type-eyebrow text-brand">{library.bigIdea}</p>
            <p className="type-mobile-body w-full text-primary">{book.brief.bigIdea}</p>
          </section>
          <section className="flex w-full flex-col gap-12">
            <p className="type-eyebrow text-secondary">{library.ideas}</p>
            <ol className="flex w-full flex-col">
              {book.brief.ideas.map((idea, i) => (
                <li key={idea} className="flex w-full items-center gap-16 border-t border-(--color-border-line-divider) py-16 last:border-b">
                  <span className="type-label w-24 shrink-0 text-brand">{String(i + 1).padStart(2, "0")}</span>
                  <span className="type-body min-w-0 flex-1 text-primary">{idea}</span>
                </li>
              ))}
            </ol>
          </section>
          <section className="flex w-full items-stretch gap-16">
            <span aria-hidden className="w-3 shrink-0 rounded-[2px] bg-brand" />
            <div className="flex min-w-0 flex-1 flex-col gap-8">
              <p className="type-eyebrow text-secondary">{library.sentence}</p>
              <p className="type-subheading w-full text-primary">{book.brief.sentence}</p>
            </div>
          </section>
          <section className="flex w-full flex-col gap-8 rounded-xl bg-brand-subtle p-20">
            <p className="type-eyebrow text-brand">{library.question}</p>
            <p className="type-card-title w-full text-primary">{book.brief.question}</p>
          </section>
        </div>
      </div>
      <button
        type="button"
        onClick={() => setOpen("book-library")}
        className="type-label flex h-40 w-full shrink-0 cursor-pointer items-center justify-center rounded-full bg-brand text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover"
      >
        {library.back}
      </button>
    </SidePanel>
  );
}
