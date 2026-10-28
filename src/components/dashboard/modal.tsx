"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";

/**
 * Dashboard dialog (Figma Desktop / 03 — Overlays & dialogs): eyebrow, title, one line of help, the form, then
 * Cancel + the main action. Centred on Tablet and Desktop; a bottom sheet on phones.
 */
export function Modal({
  open,
  onOpenChange,
  eyebrow,
  title,
  description,
  action,
  onAction,
  actionDisabled,
  tone = "default",
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  eyebrow?: string;
  title: string;
  description?: string;
  action: string;
  onAction: () => void;
  actionDisabled?: boolean;
  /** "danger" for destructive actions (Delete) */
  tone?: "default" | "danger";
  children?: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay-scrim backdrop-blur-backdrop data-[state=closed]:animate-scrim-out data-[state=open]:animate-scrim-in" />
        <Dialog.Content
          className="fixed inset-x-0 bottom-0 z-50 flex max-h-[90dvh] flex-col gap-16 overflow-y-auto rounded-t-card bg-surface-primary p-24 shadow-modal outline-none data-[state=closed]:animate-dissolve-out data-[state=open]:animate-dissolve-in tablet:inset-auto tablet:top-1/2 tablet:left-1/2 tablet:w-520 tablet:-translate-x-1/2 tablet:-translate-y-1/2 tablet:rounded-card"
          {...(description ? {} : { "aria-describedby": undefined })}
        >
          <form
            className="flex flex-col gap-16"
            onSubmit={(e) => {
              e.preventDefault();
              if (!actionDisabled) onAction();
            }}
          >
            <div className="flex flex-col gap-4">
              {eyebrow && <p className="type-eyebrow text-brand">{eyebrow}</p>}
              <Dialog.Title className="type-subheading text-primary">{title}</Dialog.Title>
              {description && <Dialog.Description className="type-body text-secondary">{description}</Dialog.Description>}
            </div>
            {children}
            <div className="flex justify-end gap-8 pt-8">
              <Dialog.Close asChild>
                <Button variant="secondary" size="small">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit" size="small" disabled={actionDisabled} className={tone === "danger" ? "bg-status-error text-on-error hover:bg-status-error hover:opacity-90" : ""}>
                {action}
              </Button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

/** Drop zone for Upload images / Upload audio: drop files or click to choose; lists what was picked. */
export function DropZone({ icon, title, hint, accept, multiple, onFiles }: { icon: ReactNode; title: string; hint: string; accept: string; multiple?: boolean; onFiles: (files: File[]) => void }) {
  const [over, setOver] = useState(false);
  const [names, setNames] = useState<string[]>([]);
  const take = (list: FileList | null) => {
    const files = Array.from(list ?? []);
    setNames(files.map((f) => f.name));
    onFiles(files);
  };
  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setOver(true);
      }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setOver(false);
        take(e.dataTransfer.files);
      }}
      className={`flex cursor-pointer flex-col items-center gap-8 rounded-card px-16 py-32 text-center transition-colors duration-(--duration-fast) focus-within:shadow-focus ${over ? "bg-brand-subtle" : "bg-surface-secondary hover:bg-surface-hover"}`}
    >
      <input type="file" accept={accept} multiple={multiple} className="sr-only" onChange={(e) => take(e.target.files)} />
      <span className="flex size-40 items-center justify-center rounded-full bg-surface-primary text-icon-general-primary">{icon}</span>
      <span className="type-card-title text-primary">{names.length ? names.join(", ") : title}</span>
      <span className="type-caption text-secondary">{hint}</span>
    </label>
  );
}
