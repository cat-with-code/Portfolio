"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { covers } from "@/components/projects/project-cover";
import { useDrawer } from "@/components/shell/drawer-provider";
import { developer, type FeaturedProject } from "@/content/developer";

/** Artwork box per view, as % of the square slide (from the Figma variants). */
const views = [
  "top-[20.551%] left-[3%] w-[94%] h-[58.899%]",
  "top-[4.573%] left-[-2.9%] w-[145%] h-[90.854%]",
  "top-[4.573%] left-[-42.1%] w-[145%] h-[90.854%]",
];

/** Pagination dot: active = 32×12 brand pill, inactive = 12px dot (border/strong @ 60%). 4×16 padding = hit area. */
function Dots({ count, active, onSelect, label }: { count: number; active: number; onSelect: (i: number) => void; label: string }) {
  return (
    <div className="flex items-center gap-4 overflow-clip" role="tablist" aria-label={label}>
      {Array.from({ length: count }, (_, i) => (
        <button
          key={i}
          type="button"
          role="tab"
          aria-selected={i === active}
          aria-label={`${label} ${i + 1}`}
          onClick={() => onSelect(i)}
          className="flex cursor-pointer items-center justify-center overflow-clip px-4 py-16"
        >
          <span className={`block h-12 rounded-full transition-[width] duration-(--duration-standard) ease-standard ${i === active ? "w-32 bg-brand" : "w-12 bg-(--color-border-general-strong) opacity-60"}`} />
        </button>
      ))}
    </div>
  );
}

/** Projects / Image gallery (Figma 812:63134): 3 square slides, swipe or tap a dot. */
function Gallery({ project }: { project: FeaturedProject }) {
  const [index, setIndex] = useState(0);
  const start = useRef<number | null>(null);
  const { Art, bg } = covers[project.key];
  return (
    <div className="flex w-308 max-w-full shrink-0 flex-col items-center gap-4">
      <div
        className="relative aspect-square w-full touch-pan-y overflow-clip rounded-xl"
        onPointerDown={(e) => (start.current = e.clientX)}
        onPointerUp={(e) => {
          if (start.current === null) return;
          const dx = e.clientX - start.current;
          start.current = null;
          if (Math.abs(dx) > 40) setIndex((i) => Math.min(2, Math.max(0, i + (dx < 0 ? 1 : -1))));
        }}
      >
        <div className="flex h-full gap-16 transition-transform duration-(--duration-drawer) ease-figma-out" style={{ transform: `translateX(calc(${-index} * (100% + 16px)))` }}>
          {views.map((box, i) => (
            <div key={i} className={`relative size-full shrink-0 overflow-clip rounded-xl ${bg}`} aria-hidden={i !== index}>
              <Art className={`absolute ${box}`} aria-hidden />
            </div>
          ))}
        </div>
      </div>
      <Dots count={3} active={index} onSelect={setIndex} label={`${project.name} image`} />
    </div>
  );
}

/** Projects / Featured project carousel / Wide (Figma 1114:3471) — 5 projects, dots switch project. */
export function FeaturedProjects({ lang }: { lang: string }) {
  const [active, setActive] = useState(0);
  const { setOpen } = useDrawer();
  const p = developer.featured[active];
  return (
    <div className="flex min-w-0 flex-1 flex-col items-center gap-4">
      <article className="flex w-full flex-col items-start gap-16 overflow-clip rounded-shell bg-surface-primary p-24">
        <div className="flex w-full flex-wrap items-center justify-between gap-x-12 gap-y-8 overflow-clip">
          <p className="type-eyebrow min-w-160 flex-1 whitespace-pre-wrap text-brand">{p.eyebrow}</p>
          <span className="type-eyebrow flex h-26 shrink-0 items-center justify-center gap-4 overflow-clip rounded-full bg-accent-green-subtle px-12 py-4 whitespace-nowrap text-primary">
            {p.status}
          </span>
        </div>
        <div className="flex w-full flex-col items-center gap-16 overflow-clip tablet:flex-row tablet:gap-32">
          <div className="flex w-full min-w-260 flex-col items-start gap-12 tablet:w-auto tablet:flex-1">
            <h3 className="type-section-heading w-full text-primary">{p.name}</h3>
            <p className="type-subheading w-full text-primary">{p.pitch}</p>
            {"description" in p && p.description && <p className="type-ui w-full text-secondary">{p.description}</p>}
            <ul className="flex w-full flex-wrap items-start gap-8 overflow-clip">
              {p.tags.map((tag, i) => (
                <li
                  key={tag}
                  className={`${i === 0 ? "type-eyebrow" : "type-table-heading"} flex shrink-0 items-center justify-center overflow-clip rounded-full bg-surface-secondary px-12 py-4 whitespace-nowrap text-secondary`}
                >
                  {tag}
                </li>
              ))}
            </ul>
            <Link
              href={`/${lang}${p.href}`}
              className="type-eyebrow flex w-full items-center justify-center gap-8 overflow-clip rounded-full bg-brand px-16 py-12 text-center whitespace-pre text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover active:bg-brand-pressed"
            >
              {p.cta}
            </Link>
          </div>
          <Gallery key={p.key} project={p} />
        </div>
        <div className="type-eyebrow flex w-full flex-wrap items-start justify-between gap-8 overflow-clip">
          <p className="min-w-200 flex-1 whitespace-pre-wrap text-secondary">{p.footer}</p>
          <button type="button" onClick={() => setOpen("projects")} className="shrink-0 cursor-pointer whitespace-pre text-brand hover:text-brand-hover">
            {developer.exploreWork}
          </button>
        </div>
      </article>
      <Dots count={developer.featured.length} active={active} onSelect={setActive} label="Featured project" />
    </div>
  );
}
