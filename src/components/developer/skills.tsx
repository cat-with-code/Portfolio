"use client";

import { useRef, useState, type ComponentType, type SVGProps } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";
import { SkillDevelopmentArt } from "@/components/illustrations/skill-development";
import { SkillDevelopmentLargeArt } from "@/components/illustrations/skill-development-large";
import { SkillInterfaceArt } from "@/components/illustrations/skill-interface";
import { SkillInterfaceLargeArt } from "@/components/illustrations/skill-interface-large";
import { SkillPrototypingArt } from "@/components/illustrations/skill-prototyping";
import { SkillPrototypingLargeArt } from "@/components/illustrations/skill-prototyping-large";
import { SkillSystemsArt } from "@/components/illustrations/skill-systems";
import { SkillSystemsLargeArt } from "@/components/illustrations/skill-systems-large";
import { IconButton } from "@/components/ui/icon-button";
import { useT } from "@/i18n/lang-context";
import type { developer } from "@/content/developer";

type Art = ComponentType<SVGProps<SVGSVGElement>>;
type Skill = (typeof developer.skills)[number];

/** Size=Compact uses its own (re-composed) artwork; Size=Large and Size=Row share the 316px artwork. */
const art: Record<string, { compact: Art; large: Art }> = {
  interface: { compact: SkillInterfaceArt, large: SkillInterfaceLargeArt },
  development: { compact: SkillDevelopmentArt, large: SkillDevelopmentLargeArt },
  systems: { compact: SkillSystemsArt, large: SkillSystemsLargeArt },
  prototyping: { compact: SkillPrototypingArt, large: SkillPrototypingLargeArt },
};

function Copy({ skill }: { skill: Skill }) {
  return (
    <div className="flex w-full flex-col items-start gap-8 overflow-clip">
      <h3 className="type-card-title w-full text-primary">{skill.title}</h3>
      <p className="type-body w-full text-muted">{skill.description}</p>
    </div>
  );
}

/** Portfolio / Skill showcase card (Figma 808:2272) — Size=Compact (Desktop) */
function CompactCard({ skill }: { skill: Skill }) {
  const Art = art[skill.key].compact;
  return (
    <article className="flex flex-col items-start gap-16 rounded-card border border-general-default bg-surface-primary p-16">
      <Art className="aspect-square h-auto w-full shrink-0" aria-hidden />
      <Copy skill={skill} />
    </article>
  );
}

/** Size=Row (Tablet): 160px illustration left, copy centred right */
function RowCard({ skill }: { skill: Skill }) {
  const Art = art[skill.key].large;
  return (
    <article className="flex items-center gap-16 rounded-card border border-general-default bg-surface-primary p-16">
      <Art className="size-160 shrink-0" aria-hidden />
      <div className="flex min-w-0 flex-1 items-center self-stretch">
        <Copy skill={skill} />
      </div>
    </article>
  );
}

/** Size=Large (Mobile carousel slide): min height 470 */
function LargeCard({ skill }: { skill: Skill }) {
  const Art = art[skill.key].large;
  return (
    <article className="flex min-h-470 w-full shrink-0 flex-col items-start gap-16 rounded-card border border-general-default bg-surface-primary p-20">
      <Art className="aspect-square h-auto w-full shrink-0" aria-hidden />
      <Copy skill={skill} />
    </article>
  );
}

/**
 * Portfolio / Skills carousel (Figma 803:62318): one card at a time, "01 / 04" counter,
 * Previous / Next icon buttons (disabled at the ends), swipe left/right.
 */
function SkillsCarousel() {
  const developer = useT("developer");
  const [index, setIndex] = useState(0);
  const start = useRef<number | null>(null);
  const last = developer.skills.length - 1;
  const go = (i: number) => setIndex(Math.min(last, Math.max(0, i)));
  return (
    <div className="flex w-full flex-col items-center gap-12 tablet:hidden">
      <div
        className="w-full touch-pan-y overflow-clip"
        onPointerDown={(e) => (start.current = e.clientX)}
        onPointerUp={(e) => {
          if (start.current === null) return;
          const dx = e.clientX - start.current;
          start.current = null;
          if (Math.abs(dx) > 40) go(index + (dx < 0 ? 1 : -1));
        }}
      >
        <div className="flex items-start gap-16 transition-transform duration-(--duration-drawer) ease-figma-out" style={{ transform: `translateX(calc(${-index} * (100% + 16px)))` }}>
          {developer.skills.map((s, i) => (
            <div key={s.key} className="w-full shrink-0" aria-hidden={i !== index}>
              <LargeCard skill={s} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex w-full items-center justify-between overflow-clip">
        <p className="type-label whitespace-nowrap text-muted" aria-live="polite">
          <span className="text-primary">{String(index + 1).padStart(2, "0")}</span>
          {` / ${String(last + 1).padStart(2, "0")}`}
        </p>
        <div className="flex items-start gap-8 overflow-clip">
          <IconButton aria-label="Previous skill" onClick={() => go(index - 1)} disabled={index === 0} className="disabled:bg-surface-primary disabled:text-icon-general-primary disabled:opacity-(--opacity-disabled)">
            <ChevronLeftIcon />
          </IconButton>
          <IconButton aria-label="Next skill" onClick={() => go(index + 1)} disabled={index === last} className="disabled:bg-surface-primary disabled:text-icon-general-primary disabled:opacity-(--opacity-disabled)">
            <ChevronRightIcon />
          </IconButton>
        </div>
      </div>
    </div>
  );
}

/** Skills and capabilities — Mobile carousel · Tablet 2×2 Row cards · Desktop 4 Compact cards */
export function Skills() {
  const developer = useT("developer");
  return (
    <section aria-label="Skills and capabilities" className="w-full">
      <SkillsCarousel />
      <div className="hidden grid-cols-2 gap-20 tablet:grid desktop:hidden">
        {developer.skills.map((s) => (
          <RowCard key={s.key} skill={s} />
        ))}
      </div>
      <div className="hidden grid-cols-4 gap-16 desktop:grid">
        {developer.skills.map((s) => (
          <CompactCard key={s.key} skill={s} />
        ))}
      </div>
    </section>
  );
}
