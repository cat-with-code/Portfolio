import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { TryitFocusArt } from "@/components/illustrations/tryit-focus";
import { TryitGamesArt } from "@/components/illustrations/tryit-games";
import { developer } from "@/content/developer";

const looks = {
  focus: { Art: TryitFocusArt, bg: "bg-accent-blue-subtle" },
  games: { Art: TryitGamesArt, bg: "bg-status-warning-subtle" },
} as const;

/**
 * Projects / Try it card (Figma 860:2301): mini preview, "Try it" chip, title, one line and an action.
 * The whole card is the link; the action wraps under the copy on narrow widths.
 */
export function TryItCard({ lang, item, chip = developer.tryItChip, className = "min-w-0" }: { lang: string; item: (typeof developer.tryIt)[number]; chip?: string; className?: string }) {
  const { Art, bg } = looks[item.key];
  return (
    <Link
      href={`/${lang}${item.href}`}
      className={`group/try flex min-h-0 ${className} flex-1 flex-wrap content-center items-center gap-x-16 gap-y-12 rounded-card p-16 ${bg}`}
    >
      <Art className="size-72 shrink-0" aria-hidden />
      <span className="flex min-w-160 flex-1 flex-col items-start gap-4 overflow-clip">
        <span className="flex flex-wrap content-center items-center gap-x-8 gap-y-4 overflow-clip">
          <span className="type-table-heading flex items-center gap-4 overflow-clip rounded-full bg-surface-primary px-8 py-2 whitespace-nowrap text-brand">
            {chip}
          </span>
          <span className="type-table-heading whitespace-nowrap text-secondary">{item.eyebrow}</span>
        </span>
        <span className="type-card-title w-full text-primary">{item.title}</span>
        <span className="type-caption w-full text-secondary">{item.description}</span>
      </span>
      <span className="type-label flex min-h-44 shrink-0 items-center justify-center gap-8 overflow-clip rounded-full bg-brand px-16 py-12 whitespace-nowrap text-on-brand transition-colors duration-(--duration-fast) group-hover/try:bg-brand-hover group-active/try:bg-brand-pressed">
        {item.action}
        <span className="relative size-16 shrink-0">
          <ArrowUpRightIcon className="absolute top-0 left-0" />
        </span>
      </span>
    </Link>
  );
}
