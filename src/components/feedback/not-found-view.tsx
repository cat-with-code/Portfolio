"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { SearchIcon } from "@/components/icons";
import { useSearch } from "@/components/shell/search-provider";
import { Button, ButtonLink } from "@/components/ui/button";

export type NotFoundCopy = { eyebrow: string; title: string; body: string; home: string; search: string; explore: string };

/**
 * 404 (site and dashboard): a big "4 ◉ 4" where your memoji, floating in a brand circle, is the zero — then the way
 * back home, search, and a few good places to pick up again.
 */
export function NotFoundView({ copy, home, links }: { copy: NotFoundCopy; home: string; links: { href: string; label: string; icon: ReactNode }[] }) {
  const { setOpen } = useSearch();
  const digit = "text-[104px] leading-none font-semibold tracking-[-4px] text-primary tablet:text-[168px] tablet:tracking-[-8px]";
  return (
    <section className="relative mx-auto my-16 flex w-full max-w-720 flex-col items-center gap-24 overflow-clip rounded-shell border border-general-default bg-surface-primary px-24 py-40 text-center shadow-card motion-safe:animate-rise-in tablet:my-32 tablet:px-48 tablet:py-56">
      {/* Soft brand glow behind the number */}
      <span aria-hidden className="pointer-events-none absolute -top-160 left-1/2 size-420 -translate-x-1/2 rounded-full bg-brand-subtle opacity-90 blur-[72px]" />

      <p className="type-eyebrow relative text-brand">{copy.eyebrow}</p>

      <div aria-hidden className="relative flex items-center gap-4 tablet:gap-12">
        <span className={digit}>4</span>
        <span className="relative flex size-92 shrink-0 items-center justify-center overflow-clip rounded-full bg-brand ring-8 ring-brand-subtle motion-safe:animate-float tablet:size-148 tablet:ring-12">
          <Image src="/images/memoji.png" alt="" width={512} height={512} priority className="absolute top-1/2 left-1/2 h-[120%] w-[100%] max-w-none -translate-1/2 object-cover" />
        </span>
        <span className={digit}>4</span>
      </div>

      <div className="relative flex flex-col items-center gap-8">
        <h1 className="type-page-title tablet:type-section-heading text-primary">{copy.title}</h1>
        <p className="type-body max-w-440 text-secondary">{copy.body}</p>
      </div>

      <div className="relative flex flex-wrap justify-center gap-12">
        <ButtonLink href={home}>{copy.home}</ButtonLink>
        <Button variant="secondary" icon={<SearchIcon className="size-20" />} onClick={() => setOpen(true)}>
          {copy.search}
        </Button>
      </div>

      <nav aria-label={copy.explore} className="relative flex w-full flex-col items-center gap-12 border-t border-general-default pt-24">
        <p className="type-table-heading text-muted">{copy.explore}</p>
        <ul className="flex flex-wrap justify-center gap-8">
          {links.map((l) => (
            <li key={l.href}>
              <Link href={l.href} className="type-label flex h-36 items-center gap-8 rounded-full border border-general-default bg-surface-primary px-16 text-primary transition-colors duration-(--duration-fast) hover:border-interaction-hover hover:bg-surface-hover">
                <span className="text-icon-general-primary">{l.icon}</span>
                {l.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </section>
  );
}
