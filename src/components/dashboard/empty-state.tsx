import type { ReactNode } from "react";

/** Dashboard / Empty state (Figma 1363:2574): icon circle, title, one line of help and up to two actions. */
export function EmptyState({ icon, title, body, actions }: { icon: ReactNode; title: string; body: string; actions?: ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center gap-16 px-8 py-48 text-center tablet:py-64">
      <span className="flex size-56 items-center justify-center rounded-full bg-surface-secondary text-icon-general-primary">{icon}</span>
      <div className="flex max-w-360 flex-col items-center gap-8">
        <h2 className="type-subheading text-primary">{title}</h2>
        <p className="type-body text-secondary">{body}</p>
      </div>
      {actions && <div className="flex flex-wrap items-center justify-center gap-12 pt-16">{actions}</div>}
    </div>
  );
}
