"use client";

import { useState } from "react";
import { PostArt, TopicArt } from "@/components/blog/topic-art";
import { Blocks } from "@/components/content/blocks";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SectionHeading } from "@/components/ui/section-heading";
import { statusLabel, storyEditorCopy as c } from "@/content/dashboard";
import { storyBlocks, storyLimits as max, storyMinutes, storyTopics, type StoryForm } from "@/lib/story-form";
import { CoverField, DeleteZone, ItemDialog } from "./dialogs";
import { AddItemRow, BackLink, EditorSection, FieldRow, ListItemRow, SaveNote, SelectField, TextArea, TextField } from "./editor";

/** Dashboard / Story editor (Figma Desktop 1371:4104): the blog post's fields, with a live preview of the article. */
export function StoryEditor({ initial, isNew = false }: { initial: StoryForm; isNew?: boolean }) {
  const [f, setF] = useState(initial);
  const [mode, setMode] = useState<"edit" | "preview">("edit");
  const [saved, setSaved] = useState(false);
  /** Point open in Edit item; -1 = adding a new one */
  const [editing, setEditing] = useState<number | null>(null);
  const set = <K extends keyof StoryForm>(key: K) => (value: StoryForm[K]) => {
    setF((prev) => ({ ...prev, [key]: value }));
    setSaved(false);
  };
  const minutes = storyMinutes(f);
  const topic = storyTopics.find((t) => t.value === f.topic)!;
  const blocks = storyBlocks(f);

  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <BackLink href="/dashboard/writing">{c.back}</BackLink>
      <SectionHeading
        title={f.title || c.newTitle}
        description={c.status}
        action={
          <Button size="small" onClick={() => setSaved(true)} disabled={isNew && !f.title.trim()}>
            {c.save}
          </Button>
        }
      />
      <div className="flex w-full items-center gap-8">
        <Chip selected={mode === "edit"} onClick={() => setMode("edit")}>
          {c.modes.edit}
        </Chip>
        <Chip selected={mode === "preview"} onClick={() => setMode("preview")}>
          {c.modes.preview}
        </Chip>
        <Badge tone="warning" className="ml-10">
          {statusLabel.draft}
        </Badge>
      </div>
      {saved && <SaveNote>{c.saved}</SaveNote>}

      {mode === "edit" ? (
        <div className="flex w-full flex-col gap-24">
          <EditorSection eyebrow={c.headline.eyebrow} title={c.headline.title} where={c.headline.where}>
            <TextField label={c.headline.storyTitle} value={f.title} onChange={set("title")} />
            <FieldRow>
              <SelectField label={c.headline.topic} value={f.topic} options={storyTopics} onChange={set("topic")} />
              <TextField label={c.headline.reading} value={`${minutes} min read`} readOnly hint={c.headline.readingHint} />
            </FieldRow>
            <TextArea label={c.headline.excerpt} value={f.excerpt} onChange={set("excerpt")} hint={c.headline.excerptHint} max={max.excerpt} rows={2} />
            <TextField label={c.headline.dek} value={f.dek} onChange={set("dek")} hint={`${c.headline.dekHint} ${f.dek.length} / ${max.dek}`} />
          </EditorSection>

          <EditorSection eyebrow={c.art.eyebrow} title={c.art.title} where={c.art.where}>
            <CoverField value={f.cover} folder="blog" onChange={set("cover")} fallback={<TopicArt topic={f.art} shape="wide" fit="cover" />} />
            {!f.cover && (
              <div className="flex w-full flex-col gap-8">
                <p className="type-label text-general-label">{c.art.placeholder}</p>
                <div role="group" aria-label={c.art.placeholder} className="flex flex-wrap gap-8">
                  {storyTopics.map((t) => (
                    <Chip key={t.value} selected={f.art === t.value} onClick={() => set("art")(t.value)}>
                      {t.label}
                    </Chip>
                  ))}
                </div>
              </div>
            )}
          </EditorSection>

          <EditorSection eyebrow={c.intro.eyebrow} title={c.intro.title} where={c.intro.where}>
            <TextArea label={c.intro.label} value={f.intro} onChange={set("intro")} hint={c.intro.hint} max={max.intro} />
          </EditorSection>

          <EditorSection eyebrow={c.section.eyebrow} title={c.section.title} where={c.section.where}>
            <TextField label={c.section.heading} value={f.heading} onChange={set("heading")} />
            <TextArea label={c.section.body} value={f.body} onChange={set("body")} hint={c.section.hint} max={max.body} rows={6} />
          </EditorSection>

          <EditorSection eyebrow={c.quote.eyebrow} title={c.quote.title} where={c.quote.where}>
            <TextField label={c.quote.label} value={f.quoteLabel} onChange={set("quoteLabel")} hint={c.quote.labelHint} />
            <TextArea label={c.quote.quote} value={f.quote} onChange={set("quote")} hint={c.quote.hint} max={max.quote} rows={2} />
          </EditorSection>

          <EditorSection eyebrow={c.list.eyebrow} title={c.list.title} where={c.list.where}>
            <TextField label={c.list.heading} value={f.listHeading} onChange={set("listHeading")} />
            <ol className="flex w-full flex-col gap-12">
              {f.points.map((p, i) => (
                <ListItemRow key={i} n={i + 1} title={p} onEdit={() => setEditing(i)} onRemove={() => set("points")(f.points.filter((_, k) => k !== i))} />
              ))}
            </ol>
            <AddItemRow label={c.list.add} onClick={() => setEditing(-1)} />
            <ItemDialog
              open={editing !== null}
              onOpenChange={(o) => !o && setEditing(null)}
              title={editing !== null && editing >= 0 ? f.points[editing] : ""}
              onSave={(title) => set("points")(editing === -1 ? [...f.points, title] : f.points.map((p, k) => (k === editing ? title : p)))}
            />
          </EditorSection>
          {!isNew && <DeleteZone name={f.title} />}
        </div>
      ) : (
        /* Preview: the post page's header and article, from the current fields */
        <article className="flex w-full flex-col gap-20 rounded-card border border-general-default bg-surface-primary p-16 tablet:p-32">
          <p className="type-eyebrow flex flex-wrap gap-x-12 text-secondary">
            <span>{topic.category}</span>
            <span className="text-accent-green">{minutes} MIN READ</span>
          </p>
          <h2 className="type-large-metric text-primary">{f.title || c.newTitle}</h2>
          {f.dek && <p className="type-body text-secondary">{f.dek}</p>}
          <div className="relative h-220 w-full overflow-clip rounded-card bg-surface-secondary tablet:h-320">
            <PostArt post={{ topic: f.art, cover: f.cover }} shape="wide" fit="cover" />
          </div>
          <div className="mx-auto w-full max-w-680">
            {blocks.length ? <Blocks blocks={blocks} /> : <p className="type-body text-muted">{c.previewEmpty}</p>}
          </div>
        </article>
      )}
    </div>
  );
}
