"use client";

import Link from "next/link";
import { GlyphClose, panelPlacement } from "@/components/blog/blog-drawers";
import { useDrawer, useDrawerState } from "@/components/shell/drawer-provider";
import { SidePanel } from "@/components/ui/side-panel";
import { gameOrder, games, hub } from "@/content/games";

/** Games / Game Library drawer (Figma 694:12681): all sixteen games with a Play button each. */
export function GameLibraryDrawer({ lang, closeLabel }: { lang: string; closeLabel: string }) {
  const state = useDrawerState("game-library");
  const { setOpen } = useDrawer();
  return (
    <SidePanel {...state} title={hub.library.title} className={`${panelPlacement} border border-general-subtle bg-surface-elevated`}>
      <div className="flex h-54 w-full shrink-0 items-center justify-between gap-12">
        <div className="flex min-w-0 flex-col gap-4">
          <p className="type-eyebrow whitespace-pre text-brand">{hub.library.eyebrow}</p>
          <p className="type-page-title text-primary">{hub.library.title}</p>
        </div>
        <GlyphClose label={closeLabel} className="bg-surface-secondary text-secondary" size="text-[22px]" />
      </div>
      <p className="type-ui shrink-0 text-secondary tablet:py-3">{hub.library.summary}</p>
      <ul className="flex min-h-0 w-full flex-1 flex-col gap-4 overflow-y-auto [scrollbar-width:none]">
        {gameOrder.map((key) => {
          const g = games[key];
          return (
            <li key={key} className="flex flex-col gap-12 py-2">
              <div className="flex items-center gap-16">
                {/* eslint-disable-next-line @next/next/no-img-element -- small fixed artwork */}
                <img src={`/images/games/${key}.webp`} alt="" loading="lazy" className="size-[clamp(104px,30vw,150px)] shrink-0 rounded-xl object-contain drop-shadow-[0_4px_6px_rgb(0_0_0/0.18)]" />
                <div className="flex min-h-[clamp(104px,30vw,150px)] min-w-0 flex-1 flex-col justify-between gap-12">
                  <div className="flex flex-col items-start gap-8">
                    <p className="type-card-title text-primary">{g.title}</p>
                    <span className="type-table-heading rounded-full border border-general-default bg-surface-primary px-12 py-4 text-secondary">{g.tag}</span>
                    <p className="type-ui text-secondary">{g.teaser}</p>
                  </div>
                  <Link
                    href={`/${lang}/games/${key}`}
                    onClick={() => setOpen(null)}
                    className="type-label flex h-32 w-148 items-center justify-center rounded-full bg-brand text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover"
                  >
                    {hub.library.play}
                  </Link>
                </div>
              </div>
              <span aria-hidden className="h-px w-full bg-(--color-border-line-divider)" />
            </li>
          );
        })}
      </ul>
    </SidePanel>
  );
}
