"use client";

import { useRouter } from "next/navigation";
import type { Result } from "@/app/dashboard/actions";
import { useState, type ReactNode } from "react";
import { ImageIcon, PlaylistIcon, PlusIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { dialogsCopy as c } from "@/content/dashboard";
import { vibes, type Vibe } from "@/content/study";
import { SaveNote, SelectField, TextArea, TextField } from "./editor";
import { DropZone, Modal } from "./modal";
import { uploadFile } from "./upload";

/** Picked file → uploaded (see upload.ts), with the dialog's busy state and error. */
function useUpload(kind: "cover" | "audio", folder: string, done: (file: File, url: string) => void) {
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  return {
    file,
    busy,
    error,
    pick: (f: File | null) => (setFile(f), setError(null)),
    reset: () => (setFile(null), setError(null)),
    async send() {
      if (!file) return false;
      setBusy(true);
      setError(null);
      const r = await uploadFile(kind, folder, file);
      setBusy(false);
      if (!r.ok) return setError(r.error), false;
      done(file, r.url);
      setFile(null);
      return true;
    },
  };
}

/** "Upload" in the Track editor → Upload audio (Figma Desktop 1413:7069). Uploads to music storage and hands back the file and its URL. */
export function UploadAudioButton({ children, onFile }: { children: ReactNode; onFile: (file: File, url: string) => void }) {
  const [open, setOpen] = useState(false);
  const up = useUpload("audio", "tracks", onFile);
  return (
    <>
      <Button variant="secondary" size="small" icon={<PlaylistIcon className="size-20" />} onClick={() => (up.reset(), setOpen(true))}>
        {children}
      </Button>
      <Modal
        open={open}
        onOpenChange={(o) => !up.busy && setOpen(o)}
        eyebrow={c.uploadAudio.eyebrow}
        title={c.uploadAudio.title}
        description={c.uploadAudio.description}
        action={up.busy ? c.uploading : c.uploadAudio.upload}
        actionDisabled={!up.file || up.busy}
        onAction={async () => (await up.send()) && setOpen(false)}
      >
        <DropZone icon={<PlaylistIcon className="size-20" />} title={c.uploadAudio.drop} hint={c.uploadAudio.hint} accept="audio/mpeg,audio/wav,.mp3,.wav" onFiles={(f) => up.pick(f[0] ?? null)} />
        {up.error && <SaveNote tone="error">{up.error}</SaveNote>}
      </Modal>
    </>
  );
}

/** "Add track" / "Add book" → Add to your library (Figma Desktop 1384:4681); continues in the Track or Book editor. */
export function AddStudyItemButton({ label, kind: initialKind = "track", variant = "primary" }: { label: string; kind?: "track" | "book"; variant?: "primary" | "secondary" }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [kind, setKind] = useState(initialKind);
  const [title, setTitle] = useState("");
  const [vibe, setVibe] = useState<Vibe>("lofi");
  const [author, setAuthor] = useState("");
  return (
    <>
      <Button variant={variant} size="small" icon={<PlusIcon className="size-20" />} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Modal
        open={open}
        onOpenChange={setOpen}
        eyebrow={c.addStudy.eyebrow}
        title={c.addStudy.title}
        description={c.addStudy.description}
        action={c.addStudy.add}
        actionDisabled={!title.trim()}
        onAction={() => {
          const q = new URLSearchParams({ title: title.trim(), ...(kind === "track" ? { vibe } : { author: author.trim() }) });
          router.push(`/dashboard/study/${kind === "track" ? "tracks" : "books"}/new#${q}`);
        }}
      >
        <div className="flex gap-8">
          <Chip selected={kind === "track"} onClick={() => setKind("track")}>
            {c.addStudy.track}
          </Chip>
          <Chip selected={kind === "book"} onClick={() => setKind("book")}>
            {c.addStudy.book}
          </Chip>
        </div>
        <TextField label={c.addStudy.name} value={title} onChange={setTitle} placeholder={kind === "track" ? "Rain on the window" : "Atomic Habits"} />
        {kind === "track" ? (
          <SelectField label={c.addStudy.vibe} value={vibe} options={vibes.map((v) => ({ value: v.key, label: v.label }))} onChange={setVibe} />
        ) : (
          <TextField label={c.addStudy.author} value={author} onChange={setAuthor} placeholder="James Clear" />
        )}
      </Modal>
    </>
  );
}

/** Edit item (Figma Desktop 1400:6121): a list item's title and, for case-study steps, its short description. */
export function ItemDialog({ open, onOpenChange, title, detail, onSave }: { open: boolean; onOpenChange: (o: boolean) => void; title: string; detail?: string; onSave: (title: string, detail?: string) => void }) {
  const [t, setT] = useState(title);
  const [dt, setDt] = useState(detail ?? "");
  const [last, setLast] = useState({ open, title, detail });
  // Start from the item's current text each time the dialog opens.
  if (last.open !== open || last.title !== title || last.detail !== detail) {
    setLast({ open, title, detail });
    if (open) {
      setT(title);
      setDt(detail ?? "");
    }
  }
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      eyebrow={c.listItem.eyebrow}
      title={c.listItem.title}
      description={c.listItem.description}
      action={c.listItem.save}
      actionDisabled={!t.trim()}
      onAction={() => {
        onSave(t.trim(), detail === undefined ? undefined : dt.trim());
        onOpenChange(false);
      }}
    >
      <TextField label={c.listItem.name} value={t} onChange={setT} />
      {detail !== undefined && <TextArea label={c.listItem.detail} value={dt} onChange={setDt} hint={c.listItem.hint} max={120} rows={2} />}
    </Modal>
  );
}

/** Preview box per cover shape: wide (posts, projects), square (tracks), portrait book on its colour panel. */
const coverBox = {
  wide: "aspect-[16/10] w-full tablet:w-320",
  square: "size-160",
  portrait: "h-200 w-full tablet:w-240",
};

/**
 * Cover field for the editors: preview, then Upload / Replace and Remove beside it, with the file's name.
 * The file goes to cover storage straight away; the item keeps it once you Save. Remove goes back to the placeholder art.
 */
export function CoverField({ value, folder, onChange, fallback, shape = "wide", panel = "bg-surface-secondary" }: { value?: string; folder: string; onChange: (path: string | undefined) => void; fallback: ReactNode; shape?: keyof typeof coverBox; panel?: string }) {
  const [open, setOpen] = useState(false);
  const up = useUpload("cover", folder, (_, url) => onChange(url));
  const src = value;
  return (
    <div className="flex w-full flex-col items-start gap-16 tablet:flex-row tablet:items-center tablet:gap-24">
      <div className={`relative shrink-0 overflow-clip rounded-card ${panel} ${coverBox[shape]}`}>
        {src ? (
          // eslint-disable-next-line @next/next/no-img-element -- local preview or uploaded cover
          <img src={src} alt="" className={`absolute inset-0 size-full ${shape === "portrait" ? "object-contain" : "object-cover"}`} />
        ) : (
          fallback
        )}
      </div>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-12">
        <div className="flex flex-col gap-4">
          <p className="type-label break-all text-primary">{src ? (value?.split("/").pop() ?? c.cover.title) : c.cover.none}</p>
          <p className="type-caption text-secondary">{c.cover.hint}</p>
        </div>
        <div className="flex flex-wrap gap-8">
          <Button variant="secondary" size="small" icon={<ImageIcon className="size-20" />} onClick={() => (up.reset(), setOpen(true))}>
            {src ? c.cover.replace : c.cover.upload}
          </Button>
          {src && (
            <Button variant="ghost" size="small" onClick={() => onChange(undefined)}>
              {c.cover.remove}
            </Button>
          )}
        </div>
      </div>
      <Modal
        open={open}
        onOpenChange={(o) => !up.busy && setOpen(o)}
        eyebrow={c.cover.eyebrow}
        title={c.cover.title}
        description={c.cover.description}
        action={up.busy ? c.uploading : c.cover.upload}
        actionDisabled={!up.file || up.busy}
        onAction={async () => (await up.send()) && setOpen(false)}
      >
        <DropZone icon={<ImageIcon className="size-20" />} title={c.cover.drop} hint={c.cover.hint} accept="image/png,image/jpeg,image/webp" onFiles={(f) => up.pick(f[0] ?? null)} />
        {up.error && <SaveNote tone="error">{up.error}</SaveNote>}
      </Modal>
    </div>
  );
}

/** Delete confirmation, shared by list rows and editors. */
export function DeleteDialog({ open, onOpenChange, name, onConfirm }: { open: boolean; onOpenChange: (o: boolean) => void; name: string; onConfirm: () => void | Promise<void> }) {
  return (
    <Modal
      open={open}
      onOpenChange={onOpenChange}
      title={c.remove.title(name)}
      description={c.remove.description}
      action={c.remove.action}
      tone="danger"
      onAction={() => {
        onConfirm();
        onOpenChange(false);
      }}
    />
  );
}

/** Delete section at the bottom of an editor (button + confirmation); goes to `after` once it's gone. */
export function DeleteZone({ name, onDelete, after }: { name: string; onDelete: () => Promise<Result>; after: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [error, setError] = useState("");
  return (
    <section className="flex w-full flex-col gap-12 rounded-card border border-status-error p-16 tablet:flex-row tablet:items-center tablet:p-24">
      <div className="flex min-w-0 flex-1 flex-col gap-4">
        <h2 className="type-card-title text-primary">{c.remove.zone.title}</h2>
        <p className={`type-body ${error ? "text-status-error" : "text-secondary"}`}>{error || c.remove.zone.body}</p>
      </div>
      <Button variant="secondary" size="small" onClick={() => setOpen(true)} className="border-status-error text-status-error">
        {c.remove.action}
      </Button>
      <DeleteDialog
        open={open}
        onOpenChange={setOpen}
        name={name}
        onConfirm={async () => {
          const result = await onDelete();
          if (result.ok) {
            router.push(after);
            router.refresh();
          } else setError(result.error);
        }}
      />
    </section>
  );
}
