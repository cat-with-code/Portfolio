"use client";

import { useState, useTransition, type ReactNode } from "react";
import type { Result } from "@/app/dashboard/actions";
import { BadgeCheckIcon, CheckIcon } from "@/components/icons";
import { Button, ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { publishCopy as c } from "@/content/dashboard";
import { BackLink, SaveNote } from "./editor";
import { EmptyState } from "./empty-state";

/**
 * Dashboard / Publish review (Figma Desktop 1346:2168) → Published (1346:2169).
 * Tick the checklist to enable Publish now; `children` is the page as visitors will see it.
 */
export function PublishReview({ name, editHref, onPublish, children }: { name: string; editHref: string; onPublish: () => Promise<Result>; children: ReactNode }) {
  const [checked, setChecked] = useState<boolean[]>(c.checklist.items.map(() => false));
  const [published, setPublished] = useState(false);
  const [error, setError] = useState("");
  const [pending, start] = useTransition();

  if (published)
    return (
      <div className="flex w-full flex-col gap-(--layout-gap)">
        <section className="w-full rounded-card border border-general-default bg-surface-primary">
          <EmptyState
            icon={<BadgeCheckIcon className="size-24" />}
            title={c.done.title(name)}
            body={c.done.body}
            actions={
              <>
                <ButtonLink href="/dashboard" variant="secondary">
                  {c.done.overview}
                </ButtonLink>
                <ButtonLink href="/dashboard/projects">{c.done.projects}</ButtonLink>
              </>
            }
          />
        </section>
      </div>
    );

  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <BackLink href={editHref}>{c.back}</BackLink>
      <SectionHeading
        title={c.title}
        description={c.description}
        action={
          <Button
            size="small"
            disabled={!checked.every(Boolean) || pending}
            onClick={() =>
              start(async () => {
                const result = await onPublish();
                if (result.ok) setPublished(true);
                else setError(result.error);
              })
            }
          >
            {pending ? c.publishing : c.publish}
          </Button>
        }
      />
      {error && <SaveNote tone="error">{error}</SaveNote>}
      <section className="flex w-full flex-col gap-16 rounded-card bg-accent-green-subtle px-24 py-20 tablet:flex-row tablet:items-center tablet:gap-24">
        <h2 className="type-subheading shrink-0 text-primary">{c.checklist.title}</h2>
        <ul className="grid flex-1 grid-cols-1 gap-12 tablet:grid-cols-3">
          {c.checklist.items.map((item, i) => (
            <li key={item}>
              <label className="type-body flex cursor-pointer items-center gap-12 text-primary">
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={() => setChecked(checked.map((v, k) => (k === i ? !v : v)))}
                  className="peer sr-only"
                />
                <span className="flex size-28 shrink-0 items-center justify-center rounded-full bg-surface-primary text-brand peer-focus-visible:shadow-focus">
                  {checked[i] && <CheckIcon className="size-16" />}
                </span>
                {item}
              </label>
            </li>
          ))}
        </ul>
      </section>
      <section className="flex w-full flex-col gap-16 rounded-card border border-general-default bg-surface-primary p-16 tablet:p-32">
        <p className="type-table-heading text-secondary">{c.preview}</p>
        {children}
      </section>
    </div>
  );
}
