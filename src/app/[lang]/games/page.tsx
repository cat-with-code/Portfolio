import type { Metadata } from "next";
import { CoverCard, PlayButton, RowCard, SplitCard } from "@/components/games/cards";
import { LibraryCount, SudokuStart } from "@/components/games/hub-client";
import { games as english, type GameKey, type SectionKey } from "@/content/games";
import { tr } from "@/i18n/content";
import { getLocale } from "@/i18n/dictionaries";
import { pageMetadata, sectionMeta } from "@/lib/seo";

const count = (s: SectionKey) => Object.values(english).filter((g) => g.section === s).length;

async function Section({ id, children }: { id: SectionKey; children: React.ReactNode }) {
  const lang = await getLocale();
  const sections = tr(lang, "sections");
  const hub = tr(lang, "hub");
  const s = sections.find((x) => x.key === id)!;
  return (
    <section className="flex w-full flex-col gap-16 pt-16" aria-labelledby={`games-${id}`}>
      <div className="flex items-center justify-between">
        <h2 id={`games-${id}`} className="type-page-title text-primary">{s.title}</h2>
        <span className="type-table-heading text-secondary">{hub.sectionCount(count(id))}</span>
      </div>
      {children}
    </section>
  );
}

function Art({ game, className }: { game: GameKey; className: string }) {
  // eslint-disable-next-line @next/next/no-img-element -- small fixed artwork, already optimised WebP
  return <img src={`/images/games/${game}.webp`} alt="" className={`object-contain drop-shadow-[0_4px_6px_rgb(0_0_0/0.18)] ${className}`} />;
}

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  return pageMetadata({ lang, path: "/games", ...sectionMeta(lang, "games") });
}

/** Games — Game Hub (Figma Desktop 694:11927 · Tablet 696:32013 · Mobile 696:38675). */
export default async function GamesPage() {
  const lang = await getLocale();
  const games = tr(lang, "games");
  const hub = tr(lang, "hub");
  const chess = games.chess;
  return (
    <div className="flex w-full flex-col gap-16 pb-64 tablet:gap-20 desktop:gap-16">
      {/* Introduction */}
      <div className="flex w-full flex-col gap-16 tablet:flex-row tablet:items-center tablet:justify-between">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="type-eyebrow whitespace-pre-wrap text-brand">{hub.eyebrow}</p>
          <h1 className="type-kpi text-primary">{hub.title}</h1>
          <p className="type-ui text-secondary">{hub.body}</p>
        </div>
        <LibraryCount />
      </div>

      <Section id="strategy">
        <div className="flex w-full flex-col gap-16 desktop:flex-row">
          <article className="flex w-full flex-col items-center gap-16 rounded-card border border-general-subtle bg-accent-blue-subtle p-24 tablet:flex-row tablet:gap-12 tablet:pr-20 desktop:min-w-0 desktop:flex-1">
            <div className="flex min-w-0 flex-1 flex-col items-center gap-24 text-center">
              <div className="flex flex-col items-center gap-8">
                <span className="flex h-25 items-center rounded-md bg-surface-primary px-12 text-[11px] font-medium whitespace-pre text-brand">{hub.editorsPick}</span>
                <h3 className="text-[42px] leading-[51px] font-semibold text-primary">{chess.title}</h3>
                <p className="text-[14px] leading-[21px] text-secondary">{chess.description}</p>
                <div className="flex gap-8">
                  {hub.chessTags.map((t) => (
                    <span key={t} className="flex h-23 items-center rounded-md bg-surface-primary px-16 text-[11px] font-medium text-secondary">{t}</span>
                  ))}
                </div>
              </div>
              <PlayButton lang={lang} game="chess" />
            </div>
            <Art game="chess" className="aspect-[305/264] w-full max-w-[305px] shrink-0" />
          </article>
          <div className="grid w-full grid-cols-1 gap-16 tablet:grid-cols-2 desktop:flex desktop:w-440 desktop:shrink-0 desktop:flex-col">
            <RowCard lang={lang} game="checkers" />
            <RowCard lang={lang} game="connect-four" />
            <div className="tablet:col-span-2 desktop:col-span-1">
              <RowCard lang={lang} game="tic-tac-toe" />
            </div>
          </div>
        </div>
      </Section>

      <Section id="puzzles">
        <div className="flex w-full flex-col gap-16 tablet:flex-row">
          <article className="flex w-full flex-col items-stretch gap-16 rounded-card border border-general-subtle bg-accent-violet-subtle p-20 tablet:w-394 tablet:shrink-0">
            <div className="flex items-center justify-between">
              <h3 className="text-[22px] leading-[25px] font-semibold text-primary">Sudoku</h3>
              <span className="rounded-md bg-surface-primary px-12 py-4 text-[11px] leading-[13px] font-medium text-secondary">{games.sudoku.badge}</span>
            </div>
            <Art game="sudoku" className="mx-auto size-156 rounded-md" />
            <div className="flex flex-col items-center gap-4 text-center">
              <p className="type-card-title whitespace-pre-line text-primary">{hub.sudoku.message}</p>
              <p className="type-body text-secondary">{hub.sudoku.body}</p>
            </div>
            <SudokuStart lang={lang} />
          </article>
          <div className="flex w-full min-w-0 flex-col gap-16 tablet:flex-1">
            <SplitCard lang={lang} game="2048" artClass="tablet:h-184" />
            <div className="flex flex-col gap-16 tablet:flex-row">
              <CoverCard lang={lang} game="minesweeper" />
              <CoverCard lang={lang} game="sliding-puzzle" />
            </div>
          </div>
        </div>
      </Section>

      <Section id="words">
        <div className="flex w-full flex-col gap-16 tablet:flex-row">
          <div className="flex tablet:w-340 tablet:shrink-0 desktop:w-360">
            <CoverCard lang={lang} game="word-guess" />
          </div>
          <SplitCard lang={lang} game="hangman" artClass="tablet:h-288" />
        </div>
      </Section>

      <Section id="arcade">
        <div className="flex w-full flex-col gap-16 tablet:flex-row">
          <CoverCard lang={lang} game="tetris" artHeight="h-132" />
          <CoverCard lang={lang} game="simon-says" artHeight="h-154" />
          <CoverCard lang={lang} game="memory-match" artHeight="h-154" />
        </div>
        <RowCard lang={lang} game="snake" />
      </Section>

      <Section id="cards">
        <div className="flex w-full flex-col gap-16 tablet:flex-row">
          <SplitCard lang={lang} game="solitaire" reversed artClass="tablet:h-220" />
          <SplitCard lang={lang} game="rock-paper-scissors" artClass="tablet:h-220" />
        </div>
      </Section>
    </div>
  );
}
