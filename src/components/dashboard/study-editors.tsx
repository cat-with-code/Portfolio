"use client";

import { useEffect, useState } from "react";
import { PlaylistIcon } from "@/components/icons";
import { covers } from "@/components/study/focus-audio";
import { Button } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import type { Book } from "@/content/books";
import { bookEditorCopy as bc, trackEditorCopy as tc } from "@/content/dashboard";
import { vibes, type Track, type Vibe } from "@/content/study";
import { CoverField, DeleteZone, UploadAudioButton } from "./dialogs";
import { BackLink, EditorSection, FieldRow, SaveNote, SelectField, TextArea, TextField } from "./editor";

/** "3:42" from seconds. */
const mmss = (sec: number) => `${Math.floor(sec / 60)}:${String(Math.round(sec % 60)).padStart(2, "0")}`;

/** Dashboard / Track editor (Figma Desktop 1412:6698): details, the audio file and the cover (content/study `Track`). */
export function TrackEditor({ vibe: initialVibe, track, isNew = false }: { vibe: Vibe; track: Track; isNew?: boolean }) {
  const [vibe, setVibe] = useState(initialVibe);
  const [[title, length, src, cover], setTrack] = useState<Track>(track);
  const [saved, setSaved] = useState(false);
  const set = (i: 0 | 1 | 2 | 3) => (v: string | undefined) => {
    setTrack((t) => Object.assign([...t], { [i]: v }) as Track);
    setSaved(false);
  };
  const Cover = covers[vibe];
  const vibeLabel = vibes.find((v) => v.key === vibe)!.label;
  // Coming from "Add to your library": #title=…&vibe=…
  useEffect(() => {
    if (!isNew) return;
    const q = new URLSearchParams(window.location.hash.slice(1));
    const v = q.get("vibe");
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL hash
    if (q.get("title")) setTrack((t) => [q.get("title")!, t[1], t[2], t[3]]);
    if (v && vibes.some((x) => x.key === v)) setVibe(v as Vibe);
  }, [isNew]);
  /** Uploaded audio: keep its path and read its real length. */
  const takeAudio = (file: File) => {
    set(2)(`/audio/${vibe}/${file.name}`);
    const url = URL.createObjectURL(file);
    const probe = new Audio();
    probe.preload = "metadata";
    probe.onloadedmetadata = () => {
      if (Number.isFinite(probe.duration)) set(1)(mmss(probe.duration));
      URL.revokeObjectURL(url);
    };
    probe.src = url;
  };
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <BackLink href="/dashboard/study">{tc.back}</BackLink>
      <SectionHeading
        title={title || tc.newTitle}
        description={tc.status}
        action={
          <Button size="small" onClick={() => setSaved(true)} disabled={isNew && !title.trim()}>
            {tc.save}
          </Button>
        }
      />
      {saved && <SaveNote>{tc.saved}</SaveNote>}
      <div className="flex w-full flex-col gap-24">
        <EditorSection eyebrow={tc.details.eyebrow} title={tc.details.title} where={tc.details.where}>
          <TextField label={tc.details.title2} value={title} onChange={set(0)} placeholder="Rain on the window" />
          <FieldRow>
            <SelectField label={tc.details.vibe} value={vibe} options={vibes.map((v) => ({ value: v.key, label: v.label }))} onChange={(v) => (setVibe(v), setSaved(false))} />
            <TextField label={tc.details.length} value={length} onChange={set(1)} placeholder="3:30" hint={tc.details.lengthHint} />
          </FieldRow>
        </EditorSection>

        <EditorSection eyebrow={tc.audio.eyebrow} title={tc.audio.title} where={tc.audio.where}>
          <div className="flex w-full flex-col gap-16 rounded-card bg-surface-secondary p-16 tablet:flex-row tablet:items-center">
            <div className="flex min-w-0 flex-1 items-center gap-16">
              <span className="flex size-48 shrink-0 items-center justify-center rounded-lg bg-surface-primary text-icon-general-primary">
                <PlaylistIcon className="size-24" />
              </span>
              <div className="flex min-w-0 flex-1 flex-col gap-4">
                <p className="type-card-title truncate text-primary">{src ? src.split("/").pop() : tc.audio.generated}</p>
                <p className="type-caption text-secondary">{src ? tc.audio.fileNote(length) : tc.audio.generatedNote(vibeLabel)}</p>
              </div>
            </div>
            <div className="flex shrink-0 gap-8">
              <UploadAudioButton onFile={takeAudio}>{src ? tc.audio.replace : tc.audio.upload}</UploadAudioButton>
              {src && (
                <Button variant="ghost" size="small" onClick={() => set(2)(undefined)}>
                  {tc.audio.remove}
                </Button>
              )}
            </div>
          </div>
        </EditorSection>

        <EditorSection eyebrow={tc.cover.eyebrow} title={tc.cover.title} where={tc.cover.where}>
          <CoverField value={cover} folder="music" onChange={set(3)} shape="square" fallback={<Cover aria-hidden className="absolute inset-0 size-full" />} />
        </EditorSection>
        {!isNew && <DeleteZone name={title} />}
      </div>
    </div>
  );
}

/** Dashboard / Book editor (Figma Desktop 1412:11494): details, cover on its colour panel, then the brief (content/books `Book`). */
export function BookEditor({ book: initial, isNew = false }: { book: Book; isNew?: boolean }) {
  const [b, setB] = useState(initial);
  // Existing books use public/images/books/<key>.jpg
  const [cover, setCover] = useState<string | undefined>(isNew ? undefined : `/images/books/${initial.key}.jpg`);
  const [saved, setSaved] = useState(false);
  const update = (patch: Partial<Book>) => (setB({ ...b, ...patch }), setSaved(false));
  const brief = (patch: Partial<Book["brief"]>) => update({ brief: { ...b.brief, ...patch } });
  useEffect(() => {
    if (!isNew) return;
    const q = new URLSearchParams(window.location.hash.slice(1));
    // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time read of the URL hash
    setB((prev) => ({ ...prev, title: q.get("title") ?? prev.title, author: q.get("author") ?? prev.author }));
  }, [isNew]);
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <BackLink href="/dashboard/study">{bc.back}</BackLink>
      <SectionHeading
        title={b.title || bc.newTitle}
        description={bc.status}
        action={
          <Button size="small" onClick={() => setSaved(true)} disabled={isNew && !b.title.trim()}>
            {bc.save}
          </Button>
        }
      />
      {saved && <SaveNote>{bc.saved}</SaveNote>}
      <div className="flex w-full flex-col gap-24">
        <EditorSection eyebrow={bc.details.eyebrow} title={bc.details.title} where={bc.details.where}>
          <TextField label={bc.details.title2} value={b.title} onChange={(v) => update({ title: v })} placeholder="Atomic Habits" />
          <FieldRow>
            <TextField label={bc.details.author} value={b.author} onChange={(v) => update({ author: v })} placeholder="James Clear" />
            <TextField label={bc.details.topic} value={b.topic} onChange={(v) => update({ topic: v })} placeholder="Habits" />
          </FieldRow>
          <TextField label={bc.details.teaser} value={b.teaser} onChange={(v) => update({ teaser: v })} placeholder="Small actions compound into remarkable change." />
        </EditorSection>

        <EditorSection eyebrow={bc.cover.eyebrow} title={bc.cover.title} where={bc.cover.where}>
          <CoverField
            value={cover}
            folder="books"
            onChange={(v) => (setCover(v), setSaved(false))}
            shape="portrait"
            panel={b.tint}
            fallback={<span className="type-card-title absolute inset-0 flex items-center justify-center p-16 text-center text-secondary">{b.title || bc.newTitle}</span>}
          />
          <div className="flex flex-col gap-8">
            <p className="type-label text-general-label">{bc.cover.tint}</p>
            <div role="radiogroup" aria-label={bc.cover.tint} className="flex flex-wrap gap-8">
              {bc.tints.map((t) => (
                <button
                  key={t.value}
                  type="button"
                  role="radio"
                  aria-checked={b.tint === t.value}
                  aria-label={t.label}
                  title={t.label}
                  onClick={() => update({ tint: t.value })}
                  className={`size-36 cursor-pointer rounded-full border-2 ${t.value} ${b.tint === t.value ? "border-interaction-focus" : "border-general-default"}`}
                />
              ))}
            </div>
          </div>
        </EditorSection>
        <EditorSection eyebrow={bc.idea.eyebrow} title={bc.idea.title} where={bc.idea.where}>
          <TextArea label={bc.idea.label} value={b.brief.bigIdea} onChange={(v) => brief({ bigIdea: v })} max={260} />
        </EditorSection>
        <EditorSection eyebrow={bc.ideas.eyebrow} title={bc.ideas.title} where={bc.ideas.where}>
          {/* The brief always shows exactly three ideas */}
          {b.brief.ideas.map((idea, i) => (
            <TextField
              key={i}
              label={`${bc.ideas.label} ${i + 1}`}
              value={idea}
              onChange={(v) => brief({ ideas: b.brief.ideas.map((x, k) => (k === i ? v : x)) as Book["brief"]["ideas"] })}
            />
          ))}
        </EditorSection>
        <EditorSection eyebrow={bc.sentence.eyebrow} title={bc.sentence.title} where={bc.sentence.where}>
          <TextArea label={bc.sentence.label} value={b.brief.sentence} onChange={(v) => brief({ sentence: v })} max={140} rows={2} />
        </EditorSection>
        <EditorSection eyebrow={bc.reflection.eyebrow} title={bc.reflection.title} where={bc.reflection.where}>
          <TextField label={bc.reflection.label} value={b.brief.question} onChange={(v) => brief({ question: v })} />
        </EditorSection>
        {!isNew && <DeleteZone name={b.title} />}
      </div>
    </div>
  );
}
