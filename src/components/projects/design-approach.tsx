import type { ComponentType } from "react";
import { FlagIcon, PencilIcon, RefreshIcon, SearchIcon } from "@/components/icons";
import { projectsPage } from "@/content/projects";

const { approach } = projectsPage;
const icons: Record<(typeof approach.steps)[number]["key"], ComponentType<{ className?: string }>> = {
  discover: SearchIcon,
  define: FlagIcon,
  design: PencilIcon,
  refine: RefreshIcon,
};

/** Projects / Design approach (Figma 1099:2399): Row = Desktop (4 cards), Grid = Tablet (2×2). Hidden on Mobile. */
export function DesignApproach() {
  return (
    <section className="hidden w-full flex-col items-start gap-24 tablet:flex">
      <div className="flex w-full flex-col items-start gap-8 overflow-clip">
        <p className="type-table-heading whitespace-pre text-brand">{approach.eyebrow}</p>
        <h2 className="type-kpi text-primary">{approach.title}</h2>
        <p className="type-body w-full text-secondary">{approach.body}</p>
      </div>
      <ol className="grid w-full grid-cols-2 gap-16 desktop:flex">
        {approach.steps.map((step) => {
          const Icon = icons[step.key];
          return (
            <li key={step.key} className="flex min-w-0 flex-1 items-start gap-16 overflow-clip rounded-card border border-general-default bg-surface-primary p-16">
              <span className="flex size-40 shrink-0 items-center justify-center overflow-clip rounded-lg bg-brand-subtle text-(--color-bg-brand)">
                <Icon />
              </span>
              <span className="flex min-w-0 flex-1 flex-col items-start gap-4 overflow-clip">
                <span className="type-table-heading whitespace-nowrap text-brand">{step.number}</span>
                <span className="type-card-title w-full text-primary">{step.title}</span>
                <span className="type-body w-full text-secondary">{step.body}</span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

/** Projects / Process section (Figma 696:44641): Mobile version of the design approach — numbered list with dividers. */
export function ProcessList() {
  return (
    <section className="flex w-full flex-col items-start gap-16 tablet:hidden">
      <div className="flex w-full flex-col items-start gap-12 overflow-clip">
        <p className="type-eyebrow w-full whitespace-pre-wrap text-brand">{approach.eyebrow}</p>
        <h2 className="type-page-title w-full text-primary">{approach.title}</h2>
        <p className="type-ui w-full text-secondary">{approach.body}</p>
      </div>
      <ol className="flex w-full flex-col items-start gap-4 overflow-clip">
        {approach.steps.map((step, i) => (
          <li key={step.key} className="contents">
            {i > 0 && <span aria-hidden className="h-px w-full shrink-0 bg-(--color-text-tertiary) opacity-22" />}
            <span className="flex w-full items-center gap-16 overflow-clip">
              <span className="type-label whitespace-nowrap text-brand">{step.number}</span>
              <span className="flex min-w-0 flex-1 flex-col items-start gap-2 overflow-clip">
                <span className="type-card-title w-full text-primary">{step.title}</span>
                <span className="type-caption w-full text-secondary">{step.body}</span>
              </span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
