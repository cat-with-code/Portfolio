import type { Metadata } from "next";
import { EmptyState } from "@/components/dashboard/empty-state";
import { MailIcon, SettingsIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { SectionHeading } from "@/components/ui/section-heading";
import { inboxCopy as c } from "@/content/dashboard";

export const metadata: Metadata = { title: "Inbox" };

/** Dashboard / Inbox (Figma Desktop 1346:2164 · content 1363:3172). No messages are stored yet, so it shows the empty state. */
export default function InboxPage() {
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <SectionHeading title={c.title} description={c.description} />
      <div role="group" aria-label="Filter" className="flex max-w-full gap-8 overflow-x-auto [scrollbar-width:none]">
        {c.filters.map((f, i) => (
          <Chip key={f} selected={i === 0}>{`${f} · 0`}</Chip>
        ))}
      </div>
      <section className="w-full rounded-card border border-general-default bg-surface-primary">
        <EmptyState
          icon={<MailIcon className="size-24" />}
          title={c.empty.title}
          body={c.empty.body}
          actions={
            <>
              <ButtonLink href="/dashboard/settings" variant="secondary" icon={<SettingsIcon className="size-20" />}>
                {c.empty.settings}
              </ButtonLink>
              <ButtonLink href="/dashboard">{c.empty.back}</ButtonLink>
            </>
          }
        />
      </section>
    </div>
  );
}
