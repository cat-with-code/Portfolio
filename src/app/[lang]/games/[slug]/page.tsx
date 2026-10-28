import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { RowCard } from "@/components/games/cards";
import { GamePlay } from "@/components/games/game-page";
import { ChevronLeftIcon } from "@/components/icons";
import { gameOrder, games, panelCopy as pc, sections, type GameKey } from "@/content/games";
import { getLocale } from "@/i18n/dictionaries";
import { pageMetadata } from "@/lib/seo";

export function generateStaticParams() {
  return gameOrder.map((slug) => ({ slug }));
}

const find = (slug: string) => (slug in games ? games[slug as GameKey] : null);

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const game = find(slug);
  if (!game) return {};
  return pageMetadata({ lang: await getLocale(), path: `/games/${slug}`, title: `${game.title} — play online`, description: game.description, image: `/images/games/${slug}.webp` });
}

/** Games / Game page (Figma Desktop 1239:95379 … · Tablet 1246:122385 … · Mobile 1248:127103 …). */
export default async function GamePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const game = find(slug);
  if (!game) notFound();
  const lang = await getLocale();
  const section = sections.find((s) => s.key === game.section)!;
  return (
    <div className="flex w-full flex-col gap-32 pb-64">
      <div className="flex items-center justify-between gap-16">
        <Link href={`/${lang}/games`} className="type-label flex items-center gap-4 text-brand hover:text-brand-hover">
          <ChevronLeftIcon className="size-20" />
          {pc.back}
        </Link>
        <p className="type-eyebrow hidden whitespace-pre text-secondary tablet:block">{pc.crumb(section.crumb)}</p>
      </div>
      <header className="flex flex-col items-start gap-8">
        <span className="type-table-heading rounded-full border border-general-default bg-surface-primary px-10 py-4 text-secondary">{game.badge}</span>
        <h1 className="type-page-title tablet:type-section-heading text-primary">{game.title}</h1>
        <p className="type-body tablet:type-mobile-body text-secondary">{game.description}</p>
      </header>
      <div className="flex w-full flex-col gap-24 tablet:flex-row tablet:items-stretch">
        <GamePlay gameKey={game.key} stageClass={game.kind === "duel" ? "min-h-340 tablet:min-h-627" : "min-h-340 tablet:min-h-560"} />
      </div>
      <section className="flex flex-col gap-12 rounded-card border border-general-default bg-surface-primary p-20">
        <p className="type-eyebrow text-secondary">{pc.howTo}</p>
        <ol className="flex flex-col gap-12 tablet:flex-row tablet:gap-24">
          {game.how.map((step, i) => (
            <li key={step} className="flex flex-1 gap-12">
              <span className="type-label text-brand">{String(i + 1).padStart(2, "0")}</span>
              <span className="type-body text-primary">{step}</span>
            </li>
          ))}
        </ol>
      </section>
      <section className="flex flex-col gap-16">
        <h2 className="type-page-title text-primary">{pc.more}</h2>
        <div className="grid grid-cols-1 gap-16 tablet:grid-cols-3">
          {game.more.map((k) => (
            <RowCard key={k} lang={lang} game={k} />
          ))}
        </div>
      </section>
    </div>
  );
}
