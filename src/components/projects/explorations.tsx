import type { ComponentType } from "react";
import { BadgeCheckIcon, MonitorIcon, MoonFilledIcon } from "@/components/icons";
import { projectsPage } from "@/content/projects";

const { explorations: e } = projectsPage;
const icons: Record<(typeof e.workbench.topics)[number]["key"], ComponentType<{ className?: string }>> = {
  responsive: MonitorIcon,
  themes: MoonFilledIcon,
  accessible: BadgeCheckIcon,
};

/** Projects / Explorations panel (Figma 859:2248): intro + focus areas, "On the workbench" topics. Wraps to one column. */
export function Explorations() {
  return (
    <section className="flex w-full flex-wrap content-start items-start gap-x-32 gap-y-24 rounded-card bg-surface-primary p-24">
      <div className="flex min-w-280 flex-1 flex-col items-start gap-12 overflow-clip">
        <p className="type-table-heading w-full whitespace-pre-wrap text-brand">{e.eyebrow}</p>
        <h2 className="type-page-title w-full text-primary">{e.title}</h2>
        <p className="type-body w-full text-muted">{e.body}</p>
        <ul className="flex w-full flex-wrap content-start items-start gap-8 overflow-clip pt-4">
          {e.focus.map((label) => (
            <li key={label} className="type-label flex shrink-0 items-start overflow-clip rounded-full bg-brand-subtle px-12 py-4 whitespace-nowrap text-brand">
              {label}
            </li>
          ))}
        </ul>
      </div>
      <div className="flex min-w-280 flex-1 flex-col items-start gap-12 overflow-clip">
        <p className="flex items-center gap-8 overflow-clip">
          <span aria-hidden className="size-8 shrink-0 rounded-full bg-status-success" />
          <span className="type-table-heading whitespace-nowrap text-muted">{e.workbench.label}</span>
        </p>
        <h3 className="type-card-title w-full text-primary">{e.workbench.title}</h3>
        <p className="type-caption w-full text-muted">{e.workbench.body}</p>
        <ul className="flex w-full flex-col items-start gap-8 overflow-clip pt-4">
          {e.workbench.topics.map((topic) => {
            const Icon = icons[topic.key];
            return (
              <li key={topic.key} className="flex w-full items-center gap-12 overflow-clip rounded-lg bg-page p-12">
                <span className="flex size-36 shrink-0 items-center justify-center overflow-clip rounded-md bg-surface-primary text-brand">
                  <Icon />
                </span>
                <span className="flex min-w-0 flex-1 flex-col items-start gap-2 overflow-clip">
                  <span className="type-label w-full text-primary">{topic.title}</span>
                  <span className="type-caption w-full text-muted">{topic.body}</span>
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
