"use client";

import { useId, useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { fieldControl as control, fieldInput as input, FieldShell } from "@/components/ui/field";
import { ArrowUpIcon, CheckIcon, MailIcon } from "@/components/icons";
import { sendContactMessage } from "@/lib/contact-action";
import { useT } from "@/i18n/lang-context";

type Field = "name" | "email" | "message";
type Errors = Partial<Record<Field, string>>;
type Sent = { via: "server" | "mail-app"; email: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Field (Figma 45:24) — Default / Hover / Focus (2px focus stroke + focus ring) / Error (stroke + message). */
/** Contact / Choice chip (Figma 841:2039) — tap toggles On/Off (multi-select). */
function Chip({ label, on, onToggle }: { label: string; on: boolean; onToggle: () => void }) {
  return (
    <button
      type="button"
      aria-pressed={on}
      onClick={onToggle}
      className={`flex shrink-0 cursor-pointer items-center justify-center gap-4 rounded-full border px-16 py-8 transition-colors duration-(--duration-fast) ${
        on ? "border-[var(--color-bg-brand)] bg-brand-subtle text-brand hover:bg-brand-subtle-hover" : "border-general-default bg-surface-primary text-primary hover:bg-surface-hover"
      }`}
    >
      {on && (
        // Figma: a 20px Check frame in a 16px slot.
        <span className="relative size-16 shrink-0">
          <CheckIcon className="absolute top-0 left-0 size-20" />
        </span>
      )}
      <span className="type-label whitespace-nowrap">{label}</span>
    </button>
  );
}

/** Contact / Form card (Figma 842:2134) — "Send message" → Sent; "Send another message" → back. */
export function ContactForm() {
  const availability = useT("availability");
  const form = useT("form");
  const id = useId();
  const [values, setValues] = useState({ name: "", email: "", message: "", website: "" });
  const [choices, setChoices] = useState<string[]>(form.defaultChoices);
  const [errors, setErrors] = useState<Errors>({});
  const [failed, setFailed] = useState(false);
  const [sent, setSent] = useState<Sent | null>(null);
  const [pending, startTransition] = useTransition();

  const set = (k: keyof typeof values, v: string) => {
    setValues((s) => ({ ...s, [k]: v }));
    if (k in errors) setErrors((e) => ({ ...e, [k]: undefined }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const name = values.name.trim(), email = values.email.trim(), message = values.message.trim();
    const next: Errors = {};
    if (!name) next.name = form.name.error;
    if (!EMAIL.test(email)) next.email = form.email.error;
    if (!message) next.message = form.message.error;
    setErrors(next);
    setFailed(false);
    const first = (["name", "email", "message"] as Field[]).find((k) => next[k]);
    if (first) return document.getElementById(`${id}-${first}`)?.focus();

    startTransition(async () => {
      const res = await sendContactMessage({ name, email, message, choices, website: values.website }).catch(() => ({ ok: false as const, reason: "failed" as const }));
      if (res.ok) return setSent({ via: "server", email });
      const to = availability.email.value;
      if (res.reason === "unconfigured" && to) {
        // No mail service configured: hand the message to the visitor's own mail app instead.
        const body = `${message}\n\nPlanning: ${choices.join(", ") || "—"}\n— ${name} (${email})`;
        window.location.href = `mailto:${to}?subject=${encodeURIComponent(`Portfolio message from ${name}`)}&body=${encodeURIComponent(body)}`;
        return setSent({ via: "mail-app", email });
      }
      setFailed(true);
    });
  };

  const reset = () => {
    setValues({ name: "", email: "", message: "", website: "" });
    setChoices(form.defaultChoices);
    setSent(null);
  };

  if (sent) {
    return (
      <div className="flex min-h-528 w-full flex-col items-center justify-center gap-20 rounded-card py-32 text-center tablet:min-w-0 tablet:flex-1 tablet:self-stretch" aria-live="polite">
        <span className="flex size-64 items-center justify-center rounded-full bg-status-success-subtle text-icon-status-success">
          <CheckIcon aria-hidden className="size-28" />
        </span>
        <h2 className="type-page-title w-full text-primary">{sent.via === "server" ? form.sent.title : form.sent.mailAppTitle}</h2>
        <p className="type-body w-full text-muted">{sent.via === "server" ? form.sent.body(sent.email) : form.sent.mailAppBody}</p>
        <Button variant="secondary" onClick={reset}>
          {form.sent.again}
        </Button>
      </div>
    );
  }

  const describedBy = (k: Field) => (errors[k] ? `${id}-${k}-error` : undefined);
  return (
    <form
      noValidate
      onSubmit={submit}
      className="flex min-h-682 w-full flex-col items-start gap-20 rounded-card py-8 tablet:min-h-0 tablet:min-w-0 tablet:flex-1 tablet:self-stretch"
      aria-labelledby={`${id}-title`}
    >
      <div className="flex w-full flex-col gap-4">
        <h2 id={`${id}-title`} className="type-page-title text-primary">{form.title}</h2>
        <p className="type-body text-muted">{form.body}</p>
      </div>

      <div className="flex w-full flex-wrap items-start gap-16">
        <FieldShell id={`${id}-name`} label={form.name.label} error={errors.name} className="min-w-240 flex-1">
          <div className={`${control(!!errors.name)} h-44 rounded-shell px-12 py-8`}>
            <input
              id={`${id}-name`}
              name="name"
              autoComplete="name"
              value={values.name}
              onChange={(e) => set("name", e.target.value)}
              placeholder={form.name.placeholder}
              aria-invalid={!!errors.name}
              aria-describedby={describedBy("name")}
              className={input}
            />
          </div>
        </FieldShell>
        <FieldShell id={`${id}-email`} label={form.email.label} error={errors.email} className="min-w-240 flex-1">
          <div className={`${control(!!errors.email)} h-44 rounded-shell px-12 py-8`}>
            <input
              id={`${id}-email`}
              name="email"
              type="email"
              autoComplete="email"
              inputMode="email"
              value={values.email}
              onChange={(e) => set("email", e.target.value)}
              placeholder={form.email.placeholder}
              aria-invalid={!!errors.email}
              aria-describedby={describedBy("email")}
              className={input}
            />
            <MailIcon className="size-24 shrink-0 text-icon-general-primary" />
          </div>
        </FieldShell>
      </div>

      <fieldset className="flex w-full flex-col gap-8">
        <legend className="type-label mb-8 text-general-label">{form.planning}</legend>
        <div className="flex w-full flex-wrap gap-8">
          {form.choices.map((c) => (
            <Chip key={c} label={c} on={choices.includes(c)} onToggle={() => setChoices((s) => (s.includes(c) ? s.filter((x) => x !== c) : [...s, c]))} />
          ))}
        </div>
      </fieldset>

      <FieldShell id={`${id}-message`} label={form.message.label} error={errors.message} className="min-h-0 w-full flex-1">
        <div className={`${control(!!errors.message)} min-h-132 flex-1 items-stretch rounded-xl px-16 py-12`}>
          <textarea
            id={`${id}-message`}
            name="message"
            value={values.message}
            onChange={(e) => set("message", e.target.value)}
            placeholder={form.message.placeholder}
            aria-invalid={!!errors.message}
            aria-describedby={describedBy("message")}
            className={`${input} resize-none`}
          />
        </div>
      </FieldShell>

      {/* Honeypot for bots — hidden from people and assistive tech. */}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" value={values.website} onChange={(e) => set("website", e.target.value)} className="hidden" aria-hidden />

      <div className="flex w-full flex-wrap items-center gap-x-16 gap-y-12">
        <p className={`type-caption min-w-260 flex-1 ${failed ? "text-status-error" : "text-muted"}`} role={failed ? "alert" : undefined}>
          {failed ? form.failed : form.privacy}
        </p>
        <Button type="submit" disabled={pending} icon={<ArrowUpIcon className="size-20" />} className="min-w-160 flex-1 tablet:flex-none">
          {pending ? form.sending : form.send}
        </Button>
      </div>
    </form>
  );
}
