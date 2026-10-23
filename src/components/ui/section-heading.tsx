import type { ReactNode } from "react";

/**
 * Portfolio / Section heading (Figma 778:62725).
 * Inline (Tablet/Desktop): title + description left, action right (Desktop: fixed 52px row, 58px copy centred).
 * Stacked (Mobile <768): title row with the action, description underneath.
 */
export function SectionHeading({ title, description, action }: { title: string; description?: string; action?: ReactNode }) {
  return (
    <div className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-x-16 gap-y-4 [grid-template-areas:'title_action''desc_desc'] desktop:h-52 tablet:gap-y-4 tablet:[grid-template-areas:'title_action''desc_action'] tablet:content-center">
      <h1 className="type-page-title text-primary [grid-area:title]">{title}</h1>
      {description && <p className="type-body text-muted [grid-area:desc]">{description}</p>}
      {action && <div className="shrink-0 [grid-area:action]">{action}</div>}
    </div>
  );
}
