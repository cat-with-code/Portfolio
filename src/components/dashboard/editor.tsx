"use client";

import Link from "next/link";
import { useId, type ReactNode } from "react";
import { ChevronDownIcon, ChevronLeftIcon, PencilIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { fieldControl, fieldInput, FieldShell } from "@/components/ui/field";

/** "Back to …" ghost button above an editor's heading. */
export function BackLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="type-label -ml-12 inline-flex h-36 items-center gap-8 rounded-full px-12 text-primary transition-colors duration-(--duration-fast) hover:bg-surface-hover">
      <ChevronLeftIcon className="size-20" />
      {children}
    </Link>
  );
}

/** Editor section card: eyebrow + subheading on the left, where it appears on the right (Figma "Section / …"). */
export function EditorSection({ eyebrow, title, where, children }: { eyebrow: string; title: string; where: string; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col gap-20 rounded-card border border-general-default bg-surface-primary p-16 tablet:p-24">
      <div className="flex w-full items-end gap-16">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="type-eyebrow text-brand">{eyebrow}</p>
          <h2 className="type-subheading text-primary">{title}</h2>
        </div>
        <p className="type-caption hidden whitespace-nowrap text-secondary tablet:block">{where}</p>
      </div>
      {children}
    </section>
  );
}

/** Two fields side by side from Tablet up. */
export function FieldRow({ children }: { children: ReactNode }) {
  return <div className="grid w-full grid-cols-1 items-start gap-16 tablet:grid-cols-2">{children}</div>;
}

/** Field (Figma 45:24), Text variant. */
export function TextField({ label, value, onChange, hint, placeholder, readOnly, trailing, type = "text" }: { label: string; value: string; onChange?: (v: string) => void; hint?: ReactNode; placeholder?: string; readOnly?: boolean; trailing?: ReactNode; type?: "text" | "email" | "password" | "url" }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className="w-full min-w-0">
      <div className={`${fieldControl()} h-44 rounded-shell px-12 py-8 ${readOnly ? "bg-surface-secondary" : ""}`}>
        <input id={id} type={type} value={value} readOnly={readOnly} placeholder={placeholder} onChange={(e) => onChange?.(e.target.value)} className={fieldInput} />
        {trailing}
      </div>
    </FieldShell>
  );
}

/** Field (Figma 45:24), Select variant. */
export function SelectField<T extends string>({ label, value, options, onChange, hint }: { label: string; value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; hint?: ReactNode }) {
  const id = useId();
  return (
    <FieldShell id={id} label={label} hint={hint} className="w-full min-w-0">
      <div className={`${fieldControl()} relative h-44 rounded-shell px-12 py-8`}>
        <select id={id} value={value} onChange={(e) => onChange(e.target.value as T)} className={`${fieldInput} cursor-pointer appearance-none pr-24`}>
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDownIcon aria-hidden className="pointer-events-none absolute right-12 size-20 text-icon-general-primary" />
      </div>
    </FieldShell>
  );
}

/** Dashboard / Text area (Figma 1396:5834): long copy with a helper line and a character count. */
export function TextArea({ label, value, onChange, hint, max, rows = 3 }: { label: string; value: string; onChange: (v: string) => void; hint?: string; max?: number; rows?: number }) {
  const id = useId();
  const over = max !== undefined && value.length > max;
  return (
    <div className="flex w-full flex-col gap-8">
      <label htmlFor={id} className="type-label text-general-label">
        {label}
      </label>
      <div className={`${fieldControl(over)} items-start rounded-card px-16 py-12`}>
        <textarea id={id} value={value} rows={rows} onChange={(e) => onChange(e.target.value)} aria-describedby={`${id}-help`} className={`${fieldInput} min-h-72 resize-y`} />
      </div>
      <div id={`${id}-help`} className="type-caption flex w-full gap-12 text-secondary">
        <p className="min-w-0 flex-1">{hint}</p>
        {max !== undefined && <p className={`whitespace-nowrap tabular-nums ${over ? "text-status-error" : ""}`}>{`${value.length} / ${max}`}</p>}
      </div>
    </div>
  );
}

/** Dashboard / List item editor (1396:5835): a numbered row with Edit (opens Edit item, 1400:6121) and Remove. */
export function ListItemRow({ n, title, detail, onEdit, onRemove }: { n: number; title: string; detail?: string; onEdit: () => void; onRemove: () => void }) {
  return (
    <li className="flex w-full items-center gap-12 rounded-card border border-general-default bg-surface-primary py-12 pr-12 pl-16">
      <span className="type-label flex size-32 shrink-0 items-center justify-center rounded-full bg-brand-subtle text-brand tabular-nums">{String(n).padStart(2, "0")}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <p className="type-card-title text-primary">{title || <span className="text-muted">Untitled</span>}</p>
        {detail && <p className="type-caption text-secondary">{detail}</p>}
      </div>
      <button type="button" aria-label={`Edit item ${n}`} onClick={onEdit} className="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-secondary text-icon-general-primary hover:bg-surface-hover">
        <PencilIcon className="size-18" />
      </button>
      <button type="button" aria-label={`Remove item ${n}`} onClick={onRemove} className="flex size-36 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-secondary text-icon-general-primary hover:bg-surface-hover">
        <TrashIcon className="size-18" />
      </button>
    </li>
  );
}

/** Dashboard / Add item row (1396:5851): dashed "add another" row. */
export function AddItemRow({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="type-label flex w-full cursor-pointer items-center justify-center gap-8 rounded-card border border-dashed border-general-strong px-16 py-12 text-primary transition-colors duration-(--duration-fast) hover:bg-surface-hover"
    >
      <PlusIcon className="size-20" />
      {label}
    </button>
  );
}

/** Note shown after Save while there's no backend. */
export function SaveNote({ children }: { children: ReactNode }) {
  return (
    <p role="status" className="type-caption w-full rounded-lg bg-status-information-subtle px-16 py-12 text-status-information">
      {children}
    </p>
  );
}
