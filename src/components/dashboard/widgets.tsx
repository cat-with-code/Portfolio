import Link from "next/link";
import type { ComponentType, ReactNode, SVGProps } from "react";
import { ChevronRightIcon, MailIcon, PencilIcon, PlusIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { overviewCopy as c, statusLabel } from "@/content/dashboard";
import type { DraftItem } from "@/lib/dashboard";

/** Dashboard / Widget card (Figma 1393:4972): white card, 24 padding, card radius. Tinted widgets pass their own fill. */
export function WidgetCard({ className = "", tint, children }: { className?: string; tint?: string; children: ReactNode }) {
  return <section className={`flex flex-col items-start gap-16 rounded-card p-24 ${tint ?? "border border-general-default bg-surface-primary"} ${className}`}>{children}</section>;
}

/** Card header: eyebrow, subheading title, optional line of body copy. */
export function CardHeader({ eyebrow, title, body }: { eyebrow?: string; title: string; body?: string }) {
  return (
    <div className="flex w-full min-w-0 flex-col items-start gap-4">
      {eyebrow && <p className="type-eyebrow whitespace-nowrap text-brand">{eyebrow}</p>}
      <h2 className="type-subheading w-full text-primary">{title}</h2>
      {body && <p className="type-body w-full text-secondary">{body}</p>}
    </div>
  );
}

/** Widget / Stat (Figma 1357:2450): a count on a tinted panel, linking to its page. */
export function StatCard({ href, icon: Icon, count, title, detail, tint }: { href: string; icon: ComponentType<SVGProps<SVGSVGElement>>; count: number; title: string; detail: string; tint: string }) {
  return (
    <Link href={href} className="group/stat flex flex-col items-start gap-16 rounded-card border border-general-default bg-surface-primary p-16 transition-colors duration-(--duration-fast) hover:bg-surface-hover">
      <div className={`flex h-136 w-full flex-col items-start justify-between overflow-clip rounded-lg p-16 ${tint}`}>
        <span className="flex size-48 items-center justify-center rounded-full bg-surface-primary text-icon-general-primary">
          <Icon className="size-24" />
        </span>
        <p className="type-kpi text-primary tabular-nums">{String(count).padStart(2, "0")}</p>
      </div>
      <div className="flex w-full flex-col gap-4 px-4 pb-4">
        <div className="flex w-full items-center">
          <p className="type-card-title min-w-0 flex-1 text-primary">{title}</p>
          <ChevronRightIcon className="size-24 shrink-0 text-icon-general-primary transition-transform duration-(--duration-fast) group-hover/stat:translate-x-2" />
        </div>
        <p className="type-body text-secondary">{detail}</p>
      </div>
    </Link>
  );
}

/** Dashboard / Draft row (Figma 1357:2461): title, meta, status, Edit. */
export function DraftRow({ item }: { item: DraftItem }) {
  return (
    <div className="flex w-full items-center gap-16 border-t border-general-default py-16">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <p className="type-card-title truncate text-primary">{item.title}</p>
        <p className="type-caption truncate text-secondary">{item.meta}</p>
      </div>
      <Badge tone={item.status === "draft" ? "warning" : "success"} className="max-tablet:hidden">
        {statusLabel[item.status]}
      </Badge>
      <ButtonLink href={item.href} variant="secondary" size="small" icon={<PencilIcon className="size-20" />}>
        {c.drafts.edit}
      </ButtonLink>
    </div>
  );
}

/** Widget / Pick up a draft (Figma 1388:4875) */
export function DraftsWidget({ drafts, total, className = "" }: { drafts: DraftItem[]; total: number; className?: string }) {
  return (
    <WidgetCard className={className}>
      <CardHeader eyebrow={c.drafts.eyebrow(drafts.length)} title={c.drafts.title} body={c.drafts.body} />
      <div className="flex w-full flex-col">
        {drafts.map((d) => (
          <DraftRow key={d.key} item={d} />
        ))}
      </div>
      <ButtonLink href="/dashboard/writing" variant="secondary" aria-label={`${c.drafts.all} (${total})`}>
        {c.drafts.all}
      </ButtonLink>
    </WidgetCard>
  );
}

/** Widget / Inbox (Figma 1388:4887) */
export function InboxWidget({ className = "" }: { className?: string }) {
  return (
    <WidgetCard tint="bg-accent-blue-subtle" className={className}>
      <div className="flex w-full items-center gap-12">
        <span className="flex size-40 shrink-0 items-center justify-center rounded-full bg-surface-primary text-icon-general-primary">
          <MailIcon className="size-24" />
        </span>
        <h2 className="type-subheading min-w-0 flex-1 text-primary">{c.inbox.title}</h2>
      </div>
      <p className="type-body w-full text-secondary">{c.inbox.empty}</p>
      <ButtonLink href="/dashboard/inbox" variant="secondary" icon={<MailIcon className="size-20" />}>
        {c.inbox.open}
      </ButtonLink>
    </WidgetCard>
  );
}

/** Widget / Before you publish (Figma 1388:4898) with Dashboard / Checklist step (1357:2475) */
export function ChecklistWidget({ className = "" }: { className?: string }) {
  return (
    <WidgetCard tint="bg-accent-green-subtle" className={className}>
      <h2 className="type-subheading w-full text-primary">{c.checklist.title}</h2>
      <ol className="flex w-full flex-col gap-12">
        {c.checklist.steps.map((step, i) => (
          <li key={step} className="flex w-full items-center gap-12">
            <span className="type-label flex size-28 shrink-0 items-center justify-center rounded-full bg-surface-primary text-brand">{i + 1}</span>
            <span className="type-body min-w-0 flex-1 text-primary">{step}</span>
          </li>
        ))}
      </ol>
    </WidgetCard>
  );
}

/** Widget / Recent media (Figma 1388:4903) */
export function RecentMediaWidget({ images, summary, className = "" }: { images: readonly { src: string; fit: "cover" | "contain" }[]; summary: string; className?: string }) {
  return (
    <WidgetCard className={className}>
      <div className="flex w-full items-end gap-16">
        <div className="min-w-0 flex-1">
          <CardHeader eyebrow={c.media.eyebrow} title={c.media.title} />
        </div>
        <ButtonLink href="/dashboard/media" variant="secondary" size="small">
          {c.media.open}
        </ButtonLink>
      </div>
      <div className="grid w-full grid-cols-2 gap-12 tablet:grid-cols-4">
        {images.map((img) => (
          // eslint-disable-next-line @next/next/no-img-element -- small thumbnails of the site's own images
          <img key={img.src} src={img.src} alt="" className={`h-104 w-full rounded-lg bg-surface-secondary ${img.fit === "cover" ? "object-cover" : "object-contain"}`} />
        ))}
      </div>
      <p className="type-caption w-full text-secondary">{summary}</p>
    </WidgetCard>
  );
}

/** Widget / Games to link (Figma 1388:4925) */
export function GamesWidget({ linked, total, next, className = "" }: { linked: number; total: number; next: { key: string; title: string; image: string }[]; className?: string }) {
  return (
    <WidgetCard className={className}>
      <CardHeader eyebrow={c.games.eyebrow} title={c.games.title} body={c.games.progress(linked, total)} />
      <div className="h-8 w-full overflow-clip rounded-full bg-surface-secondary" role="progressbar" aria-valuemin={0} aria-valuemax={total} aria-valuenow={linked}>
        <div className="h-8 rounded-full bg-brand" style={{ width: `${(linked / total) * 100}%` }} />
      </div>
      <ul className="flex w-full flex-col gap-8">
        {next.map((g) => (
          <li key={g.key} className="flex w-full items-center gap-12">
            {/* eslint-disable-next-line @next/next/no-img-element -- 32px game thumbnail */}
            <img src={g.image} alt="" className="size-32 shrink-0 rounded-md bg-surface-secondary object-contain" />
            <span className="type-label min-w-0 flex-1 truncate text-primary">{g.title}</span>
          </li>
        ))}
      </ul>
      <ButtonLink href="/dashboard/games" variant="secondary" size="small" icon={<PlusIcon className="size-20" />}>
        {c.games.add}
      </ButtonLink>
    </WidgetCard>
  );
}

/** Widget / Quick actions (Figma 1388:4954) */
export function QuickActionsWidget({ actions, className = "" }: { actions: { label: string; href: string; icon: ComponentType<SVGProps<SVGSVGElement>> }[]; className?: string }) {
  return (
    <WidgetCard className={className}>
      <CardHeader eyebrow={c.actions.eyebrow} title={c.actions.title} />
      <ul className="flex w-full flex-col gap-4">
        {actions.map(({ label, href, icon: Icon }) => (
          <li key={label}>
            <Link href={href} className="type-label flex w-full items-center gap-12 rounded-lg px-12 py-8 text-primary transition-colors duration-(--duration-fast) hover:bg-surface-hover">
              <Icon className="size-20 shrink-0 text-icon-general-primary" />
              {label}
            </Link>
          </li>
        ))}
      </ul>
    </WidgetCard>
  );
}

