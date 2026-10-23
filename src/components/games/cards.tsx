import Link from "next/link";
import { ArrowRightIcon } from "@/components/icons";
import { games, type GameKey } from "@/content/games";

export const href = (lang: string, key: GameKey) => `/${lang}/games/${key}`;

export function Badge({ children }: { children: string }) {
  return <span className="type-table-heading inline-flex w-fit items-center rounded-full bg-surface-primary px-8 py-4 text-secondary">{children}</span>;
}

export function PlayButton({ lang, game, label, className = "" }: { lang: string; game: GameKey; label?: string; className?: string }) {
  return (
    <Link
      href={href(lang, game)}
      className={`flex h-44 shrink-0 items-center justify-center gap-8 rounded-shell bg-brand px-24 text-[13px] leading-[20px] font-semibold text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover ${className}`}
    >
      {label ?? games[game].play}
      <ArrowRightIcon className="size-16" />
    </Link>
  );
}

function Art({ game, className = "" }: { game: GameKey; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element -- small fixed artwork, already optimised WebP
    <img src={`/images/games/${game}.webp`} alt="" loading="lazy" className={`object-contain drop-shadow-[0_4px_6px_rgb(0_0_0/0.18)] ${className}`} />
  );
}

const shell = (game: GameKey) => {
  const tint = games[game].tint;
  return `${tint} ${tint === "bg-surface-primary" ? "border border-general-default" : ""} rounded-card`;
};

/** Games / Game card — Layout=Row: 112 art, copy, round play button. */
export function RowCard({ lang, game }: { lang: string; game: GameKey }) {
  const g = games[game];
  return (
    <article className={`flex w-full items-center gap-16 p-16 ${shell(game)}`}>
      <Art game={game} className="size-[clamp(88px,26vw,112px)] shrink-0 rounded-lg" />
      <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
        <Badge>{g.badge}</Badge>
        <h3 className="type-card-title text-primary">{g.title}</h3>
        <p className="type-body text-secondary">{g.description}</p>
      </div>
      <Link href={href(lang, game)} aria-label={g.play} className="flex size-44 shrink-0 items-center justify-center rounded-shell bg-brand text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover">
        <ArrowRightIcon className="size-16" />
      </Link>
    </article>
  );
}

/** Games / Game card — Layout=Cover: art on top, centred copy and a play pill. */
export function CoverCard({ lang, game, artHeight = "h-144" }: { lang: string; game: GameKey; artHeight?: string }) {
  const g = games[game];
  return (
    <article className={`flex w-full flex-col items-stretch gap-12 p-16 ${shell(game)}`}>
      <Art game={game} className={`w-full rounded-lg ${artHeight}`} />
      <div className="flex flex-1 flex-col items-center gap-8 text-center">
        <Badge>{g.badge}</Badge>
        <h3 className="type-card-title text-primary">{g.title}</h3>
        <p className="type-body text-secondary">{g.description}</p>
      </div>
      <div className="flex justify-center">
        <PlayButton lang={lang} game={game} />
      </div>
    </article>
  );
}

/** Games / Game card — Layout=Split / Split reversed: copy beside the art (stacked on phones). */
export function SplitCard({ lang, game, reversed = false, artClass = "" }: { lang: string; game: GameKey; reversed?: boolean; artClass?: string }) {
  const g = games[game];
  return (
    <article className={`flex w-full flex-col items-stretch gap-12 p-16 tablet:items-center tablet:gap-20 tablet:p-20 ${reversed ? "tablet:flex-row-reverse" : "tablet:flex-row"} ${shell(game)}`}>
      <div className="order-2 flex flex-col items-center gap-8 text-center tablet:order-none tablet:min-w-0 tablet:flex-1">
        <Badge>{g.badge}</Badge>
        <h3 className="type-page-title text-primary">{g.title}</h3>
        <p className="type-body text-secondary">{g.description}</p>
        <span className="h-4" />
        <PlayButton lang={lang} game={game} />
      </div>
      <Art game={game} className={`order-1 w-full rounded-lg tablet:order-none tablet:min-w-0 tablet:flex-1 ${artClass}`} />
    </article>
  );
}
