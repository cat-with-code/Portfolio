"use client";

import { useState, type ReactNode } from "react";
import { CalendarIcon, ChevronDownIcon, MailIcon, MapIcon } from "@/components/icons";
import { availability, faq } from "@/content/contact";

function Detail({ icon, label, children }: { icon: ReactNode; label: string; children: ReactNode }) {
  return (
    <div className="flex w-full items-center gap-12">
      <span className="flex size-36 shrink-0 items-center justify-center rounded-md bg-surface-primary text-icon-general-primary">{icon}</span>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <span className="type-caption text-muted">{label}</span>
        <span className="type-label text-primary">{children}</span>
      </div>
    </div>
  );
}

/** Contact / Availability card (Figma 842:2037). */
export function AvailabilityCard() {
  const email = availability.email.value;
  return (
    <section className="flex w-full flex-col items-start gap-16 rounded-card bg-accent-green-subtle p-20" aria-labelledby="contact-availability">
      <div className="flex items-center gap-8">
        <span className="size-10 rounded-full bg-status-success" aria-hidden />
        <span className="type-table-heading text-secondary">{availability.status}</span>
      </div>
      <h2 id="contact-availability" className="type-card-title text-primary">{availability.title}</h2>
      <p className="type-body text-secondary">{availability.body}</p>
      <div className="flex w-full flex-col gap-12">
        <Detail icon={<MapIcon className="size-18" />} label={availability.basedIn.label}>{availability.basedIn.value}</Detail>
        <Detail
          icon={
            // Figma: a 20px Calendar frame in an 18px slot.
            <span className="relative size-18">
              <CalendarIcon className="absolute top-0 left-0 size-20" />
            </span>
          }
          label={availability.replies.label}
        >
          {availability.replies.value}
        </Detail>
        <Detail icon={<MailIcon className="size-18" />} label={availability.email.label}>
          {email ? (
            <a href={`mailto:${email}`} className="break-all hover:underline">
              {email}
            </a>
          ) : (
            "—"
          )}
        </Detail>
      </div>
    </section>
  );
}

/** Contact / FAQ item (Figma 841:2056) — tap toggles Closed/Open. */
function FaqItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <button
      type="button"
      aria-expanded={open}
      onClick={() => setOpen(!open)}
      className="flex w-full cursor-pointer flex-col items-start gap-8 rounded-lg border border-general-default bg-surface-primary p-16 text-left transition-colors duration-(--duration-fast) hover:bg-surface-hover"
    >
      <span className="flex w-full items-center gap-12">
        <span className="type-label min-w-0 flex-1 text-primary">{q}</span>
        <ChevronDownIcon className={`size-20 shrink-0 text-muted ${open ? "rotate-180" : ""}`} />
      </span>
      {open && <span className="type-body w-full text-muted">{a}</span>}
    </button>
  );
}

export function Faq() {
  return (
    <section className="flex w-full flex-col items-start gap-12" aria-labelledby="contact-faq">
      <h2 id="contact-faq" className="type-table-heading whitespace-nowrap text-muted">{faq.label}</h2>
      {faq.items.map((item) => (
        <FaqItem key={item.q} {...item} />
      ))}
    </section>
  );
}
