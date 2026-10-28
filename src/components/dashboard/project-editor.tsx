"use client";

import { useState } from "react";
import { CaseCover } from "@/components/projects/case-cover";
import { covers, ProjectCover, type CoverKey } from "@/components/projects/project-cover";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SectionHeading } from "@/components/ui/section-heading";
import type { CaseStudy } from "@/content/case-studies";
import { projectEditorCopy as c, statusLabel } from "@/content/dashboard";
import type { DirectoryProject } from "@/content/projects";
import { CoverField, DeleteZone, ItemDialog } from "./dialogs";
import { AddItemRow, BackLink, EditorSection, FieldRow, ListItemRow, SaveNote, SelectField, TextArea, TextField } from "./editor";

/**
 * Dashboard / Project editor (Figma Desktop 1346:2166): the directory card, and — for projects with a case study page —
 * every part of that page, in page order. Preview opens the live case study.
 */
export function ProjectEditor({ card: initialCard, study: initialStudy, others }: { card: DirectoryProject; study: CaseStudy | null; others: { value: string; label: string }[] }) {
  const [card, setCard] = useState(initialCard);
  const [study, setStudy] = useState(initialStudy);
  const [next, setNext] = useState(others[0]?.value ?? "");
  const [saved, setSaved] = useState(false);
  /** Step open in Edit item; -1 = adding a new one */
  const [editing, setEditing] = useState<number | null>(null);
  const touch = () => setSaved(false);
  const setC = <K extends keyof DirectoryProject>(k: K) => (v: DirectoryProject[K]) => (setCard({ ...card, [k]: v }), touch());
  const edit = (fn: (s: CaseStudy) => CaseStudy) => study && (setStudy(fn(study)), touch());

  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <BackLink href="/dashboard/projects">{c.back}</BackLink>
      <SectionHeading
        title={card.name}
        description={c.status}
        action={
          <div className="flex gap-8">
            <Button variant="secondary" size="small" onClick={() => setSaved(true)}>
              {c.save}
            </Button>
            {card.key !== "new" && (
              <ButtonLink href={`/dashboard/projects/${card.key}/publish`} size="small">
                {c.publish}
              </ButtonLink>
            )}
          </div>
        }
      />
      <div className="flex w-full items-center gap-8">
        <Chip selected>{c.modes.edit}</Chip>
        {card.href && (
          <a href={`/en${card.href}`} target="_blank" rel="noreferrer" className="type-table-heading flex h-34 items-center rounded-full px-16 text-secondary hover:bg-surface-hover">
            {c.modes.preview} ↗
          </a>
        )}
        <Badge tone="warning" className="ml-10">
          {statusLabel.draft}
        </Badge>
      </div>
      {saved && <SaveNote>{c.saved}</SaveNote>}

      <div className="flex w-full flex-col gap-24">
        <EditorSection eyebrow={c.card.eyebrow} title={c.card.title} where={c.card.where}>
          <FieldRow>
            <TextField label={c.card.name} value={card.name} onChange={setC("name")} />
            <TextField label={c.card.category} value={card.category} onChange={setC("category")} />
          </FieldRow>
          <TextArea label={c.card.description} value={card.description} onChange={setC("description")} max={120} rows={2} />
          <TextField label={c.card.disciplines} value={card.disciplines} onChange={setC("disciplines")} hint={c.card.disciplinesHint} />
          {!study && <SaveNote>{c.card.noCase(card.href)}</SaveNote>}
        </EditorSection>

        <EditorSection eyebrow={c.cover.eyebrow} title={c.cover.title} where={c.cover.where}>
          <CoverField
            value={card.coverImage}
            folder="projects"
            onChange={setC("coverImage")}
            fallback={
              study ? (
                <CaseCover project={study.key} />
              ) : card.key in covers ? (
                <ProjectCover project={card.key as CoverKey} className="absolute inset-0 h-full rounded-none" />
              ) : (
                // eslint-disable-next-line @next/next/no-img-element -- the directory thumbnail
                card.cover && <img src={card.cover} alt="" className="absolute inset-0 size-full object-cover" />
              )
            }
          />
        </EditorSection>

        {study && (
          <>
            <EditorSection eyebrow={c.masthead.eyebrow} title={c.masthead.title} where={c.masthead.where}>
              <FieldRow>
                <TextField label={c.masthead.label} value={study.eyebrow} onChange={(v) => edit((s) => ({ ...s, eyebrow: v }))} />
                <TextField label={c.masthead.statusLabel} value={study.status.label} onChange={(v) => edit((s) => ({ ...s, status: { ...s.status, label: v } }))} />
              </FieldRow>
              <TextField label={c.masthead.name} value={study.title} onChange={(v) => edit((s) => ({ ...s, title: v }))} />
              <TextArea label={c.masthead.summary} value={study.summary} onChange={(v) => edit((s) => ({ ...s, summary: v }))} max={160} rows={2} />
            </EditorSection>

            <EditorSection eyebrow={c.credits.eyebrow} title={c.credits.title} where={c.credits.where}>
              <FieldRow>
                {study.credits.map((cr, i) => (
                  <TextField
                    key={cr.label}
                    label={cr.label.charAt(0) + cr.label.slice(1).toLowerCase()}
                    value={cr.value}
                    onChange={(v) => edit((s) => ({ ...s, credits: s.credits.map((x, k) => (k === i ? { ...x, value: v } : x)) }))}
                  />
                ))}
              </FieldRow>
            </EditorSection>

            <EditorSection eyebrow={c.overview.eyebrow} title={c.overview.title} where={c.overview.where}>
              <TextField label={c.overview.sectionTitle} value={study.overview.title} onChange={(v) => edit((s) => ({ ...s, overview: { ...s.overview, title: v } }))} />
              <TextArea label={c.overview.lead} value={study.overview.lead} onChange={(v) => edit((s) => ({ ...s, overview: { ...s.overview, lead: v } }))} max={240} />
            </EditorSection>

            <EditorSection eyebrow={c.challenge.eyebrow} title={c.challenge.title} where={c.challenge.where}>
              <TextField label={c.overview.sectionTitle} value={study.challenge.title} onChange={(v) => edit((s) => ({ ...s, challenge: { ...s.challenge, title: v } }))} />
              <TextArea label={c.challenge.body} value={study.challenge.body} onChange={(v) => edit((s) => ({ ...s, challenge: { ...s.challenge, body: v } }))} max={240} />
              <TextArea label={c.challenge.goal} value={study.challenge.goal} onChange={(v) => edit((s) => ({ ...s, challenge: { ...s.challenge, goal: v } }))} max={160} rows={2} />
            </EditorSection>

            <EditorSection eyebrow={c.work.eyebrow} title={c.work.title} where={c.work.where}>
              <TextField label={c.overview.sectionTitle} value={study.work.title} onChange={(v) => edit((s) => ({ ...s, work: { ...s.work, title: v } }))} />
              <ol className="flex w-full flex-col gap-12">
                {study.work.items.map((item, i) => (
                  <ListItemRow
                    key={i}
                    n={i + 1}
                    title={item.title}
                    detail={item.body}
                    onEdit={() => setEditing(i)}
                    onRemove={() => edit((s) => ({ ...s, work: { ...s.work, items: s.work.items.filter((_, k) => k !== i) } }))}
                  />
                ))}
              </ol>
              <AddItemRow label={c.work.add} onClick={() => setEditing(-1)} />
              <ItemDialog
                open={editing !== null}
                onOpenChange={(o) => !o && setEditing(null)}
                title={editing !== null && editing >= 0 ? study.work.items[editing].title : ""}
                detail={editing !== null && editing >= 0 ? study.work.items[editing].body : ""}
                onSave={(title, body = "") =>
                  edit((s) => ({
                    ...s,
                    work: { ...s.work, items: editing === -1 ? [...s.work.items, { title, body }] : s.work.items.map((x, k) => (k === editing ? { title, body } : x)) },
                  }))
                }
              />
            </EditorSection>

            <EditorSection eyebrow={c.outcome.eyebrow} title={c.outcome.title} where={c.outcome.where}>
              <TextField label={c.overview.sectionTitle} value={study.outcome.title} onChange={(v) => edit((s) => ({ ...s, outcome: { ...s.outcome, title: v } }))} />
              <TextArea label={c.outcome.statement} value={study.outcome.statement} onChange={(v) => edit((s) => ({ ...s, outcome: { ...s.outcome, statement: v } }))} max={240} />
            </EditorSection>

            {others.length > 0 && (
              <EditorSection eyebrow={c.next.eyebrow} title={c.next.title} where={c.next.where}>
                <SelectField label={c.next.label} value={next} options={others} onChange={(v) => (setNext(v), touch())} hint={c.next.hint} />
              </EditorSection>
            )}
          </>
        )}
        {card.key !== "new" && <DeleteZone name={card.name} />}
      </div>
    </div>
  );
}
