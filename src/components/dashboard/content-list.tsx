"use client";

import { useState, type ReactNode } from "react";
import { PencilIcon, TrashIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { dialogsCopy as d, statusLabel } from "@/content/dashboard";
import { DeleteDialog } from "./dialogs";
import { SaveNote } from "./editor";
import type { Status } from "@/lib/dashboard";

export type ContentRow = {
  key: string;
  title: string;
  meta: string;
  /** The one info column (language, reading time…) */
  info: string;
  /** Status badge; rows without one (tracks, games) skip it */
  status?: Status;
  href: string;
  /** Image thumbnail; without one the row shows `icon` on a tinted tile */
  thumb?: string;
  /** Badge other than a draft / published status, e.g. "NO LINK" */
  badge?: { label: string; tone: "warning" | "success" | "neutral" };
  /** Action label and icon, "Edit" with a pencil by default */
  action?: string;
  actionIcon?: ReactNode;
};

/** Dashboard / Content row list (Figma 1363:2543): thumb, title + meta, one info column, status, action. Top hairline divides rows. */
export function Rows({ rows, icon, tint = "bg-surface-secondary", onAction, onDelete }: { rows: ContentRow[]; icon: ReactNode; tint?: string; onAction?: (row: ContentRow) => void; onDelete?: (row: ContentRow) => void }) {
  return (
    <ul className="flex w-full flex-col">
      {rows.map((r, i) => (
        <li key={r.key} className={`flex w-full items-center gap-12 py-16 tablet:gap-16 ${i ? "border-t border-general-default" : ""}`}>
          <span className={`flex size-40 shrink-0 items-center justify-center overflow-clip rounded-lg text-icon-general-primary ${r.thumb ? "bg-surface-secondary" : tint}`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- 40px thumbnail of the site's own art */}
            {r.thumb ? <img src={r.thumb} alt="" className="size-full object-contain" /> : icon}
          </span>
          <span className="flex min-w-0 flex-1 flex-col gap-4">
            <span className="type-card-title truncate text-primary">{r.title}</span>
            <span className="type-caption truncate text-secondary">{r.meta}</span>
          </span>
          <span className="type-body hidden w-160 shrink-0 text-secondary desktop:block">{r.info}</span>
          {r.status && (
            <Badge tone={r.status === "draft" ? "warning" : "success"} className="max-tablet:hidden">
              {statusLabel[r.status]}
            </Badge>
          )}
          {r.badge && (
            <Badge tone={r.badge.tone} className="max-tablet:hidden">
              {r.badge.label}
            </Badge>
          )}
          {onAction ? (
            <Button variant="secondary" size="small" icon={r.actionIcon ?? <PencilIcon className="size-20" />} aria-label={`${r.action ?? "Edit"} ${r.title}`} onClick={() => onAction(r)}>
              {r.action ?? "Edit"}
            </Button>
          ) : (
            <ButtonLink href={r.href} variant="secondary" size="small" icon={r.actionIcon ?? <PencilIcon className="size-20" />} aria-label={`${r.action ?? "Edit"} ${r.title}`}>
              {r.action ?? "Edit"}
            </ButtonLink>
          )}
          {onDelete && (
            <button
              type="button"
              aria-label={`Delete ${r.title}`}
              title="Delete"
              onClick={() => onDelete(r)}
              className="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-general-primary transition-colors duration-(--duration-fast) hover:bg-status-error-subtle hover:text-status-error"
            >
              <TrashIcon className="size-18" />
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

/**
 * Dashboard list page body (Figma Desktop / Projects 1350:2555, Writing 1363:2612): All / Drafts / Published filter chips,
 * then a card of Dashboard / Content rows (1363:2543) and a "Showing …" count.
 */
export function ContentList({ rows: all, icon, noun }: { rows: ContentRow[]; icon: ReactNode; noun: [string, string] }) {
  const [filter, setFilter] = useState<"all" | Status>("all");
  // Deleted this visit (until the backend can delete for good)
  const [removed, setRemoved] = useState<string[]>([]);
  const [deleting, setDeleting] = useState<ContentRow | null>(null);
  const rows = all.filter((r) => !removed.includes(r.key));
  const shown = filter === "all" ? rows : rows.filter((r) => r.status === filter);
  const count = (s: Status) => rows.filter((r) => r.status === s).length;
  const filters = [
    { key: "all", label: `All · ${rows.length}` },
    { key: "draft", label: `Drafts · ${count("draft")}` },
    { key: "published", label: `Published · ${count("published")}` },
  ] as const;

  return (
    <>
      <div role="group" aria-label="Filter" className="flex max-w-full gap-8 overflow-x-auto [scrollbar-width:none]">
        {filters.map((f) => (
          <Chip key={f.key} selected={filter === f.key} onClick={() => setFilter(f.key)}>
            {f.label}
          </Chip>
        ))}
      </div>
      <div className="flex w-full flex-col gap-16 rounded-card border border-general-default bg-surface-primary p-16 tablet:p-24">
        {removed.length > 0 && <SaveNote>{d.remove.listNote}</SaveNote>}
        <Rows rows={shown} icon={icon} onDelete={setDeleting} />
        <p className="type-caption w-full text-secondary">
          {shown.length === rows.length ? `Showing all ${rows.length} ${noun[1]}` : `Showing ${shown.length} of ${rows.length} ${noun[1]}`}
        </p>
      </div>
      <DeleteDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} name={deleting?.title ?? ""} onConfirm={() => deleting && setRemoved([...removed, deleting.key])} />
    </>
  );
}
