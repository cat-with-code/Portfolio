"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { deleteMessage, updateMessage, type Result } from "@/app/dashboard/actions";
import { ArrowUpRightIcon, MailIcon, SettingsIcon, TrashIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink, buttonClasses } from "@/components/ui/button";
import { Chip } from "@/components/ui/chip";
import { inboxCopy as c } from "@/content/dashboard";
import { DeleteDialog } from "./dialogs";
import { SaveNote } from "./editor";
import { EmptyState } from "./empty-state";

export type Message = { id: string; name: string; email: string; message: string; choices: string[]; read: boolean; archived: boolean; created_at: string };
type Filter = "all" | "unread" | "archived";

const when = (iso: string) => new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });

/**
 * Dashboard / Inbox: messages from the contact page, newest first. Open one to read it (marks it read), reply by
 * email, archive or delete. All / Unread hide archived messages.
 */
export function InboxList({ messages }: { messages: Message[] }) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("all");
  const [openId, setOpenId] = useState<string | null>(null);
  const [removing, setRemoving] = useState<Message | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [, startTransition] = useTransition();
  // Changes show at once; the server copy follows on refresh.
  const [local, setLocal] = useState<Record<string, Partial<Message> | "deleted">>({});

  const list = messages.filter((m) => local[m.id] !== "deleted").map((m) => ({ ...m, ...(local[m.id] as Partial<Message> | undefined) }));
  const inbox = list.filter((m) => !m.archived);
  const counts: Record<Filter, number> = { all: inbox.length, unread: inbox.filter((m) => !m.read).length, archived: list.length - inbox.length };
  const shown = filter === "archived" ? list.filter((m) => m.archived) : filter === "unread" ? inbox.filter((m) => !m.read) : inbox;

  const apply = (id: string, change: Partial<Message> | "deleted", call: () => Promise<Result>) => {
    const before = local[id];
    setLocal((l) => ({ ...l, [id]: change === "deleted" ? change : { ...(l[id] as object), ...change } }));
    setError(null);
    startTransition(async () => {
      const r = await call();
      if (!r.ok) {
        setLocal((l) => ({ ...l, [id]: before ?? {} }));
        setError(r.error);
      } else router.refresh();
    });
  };
  const open = (m: Message) => {
    setOpenId(openId === m.id ? null : m.id);
    if (!m.read) apply(m.id, { read: true }, () => updateMessage(m.id, { read: true }));
  };

  return (
    <>
      <div role="group" aria-label="Filter" className="flex max-w-full gap-8 overflow-x-auto [scrollbar-width:none]">
        {(["all", "unread", "archived"] as const).map((f) => (
          <Chip key={f} selected={filter === f} onClick={() => setFilter(f)}>{`${c.filters[f]} · ${counts[f]}`}</Chip>
        ))}
      </div>
      {error && <SaveNote tone="error">{error}</SaveNote>}
      <section className="w-full rounded-card border border-general-default bg-surface-primary">
        {shown.length === 0 ? (
          <EmptyState
            icon={<MailIcon className="size-24" />}
            title={messages.length ? c.none[filter] : c.empty.title}
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
        ) : (
          <ul className="flex w-full flex-col px-16 tablet:px-24">
            {shown.map((m, i) => {
              const expanded = openId === m.id;
              return (
                <li key={m.id} className={`flex w-full flex-col ${i ? "border-t border-general-default" : ""}`}>
                  <button type="button" aria-expanded={expanded} onClick={() => open(m)} className="flex w-full cursor-pointer items-start gap-12 py-16 text-left tablet:gap-16">
                    <span aria-hidden className={`mt-8 size-8 shrink-0 rounded-full ${m.read ? "" : "bg-brand"}`} />
                    <span className="flex min-w-0 flex-1 flex-col gap-4">
                      <span className="flex min-w-0 items-center gap-8">
                        <span className={`type-card-title truncate ${m.read ? "text-secondary" : "text-primary"}`}>{m.name}</span>
                        {!m.read && <span className="sr-only">{c.unread}</span>}
                      </span>
                      <span className={`type-body text-secondary ${expanded ? "" : "line-clamp-1"}`}>{expanded ? m.email : m.message}</span>
                    </span>
                    <span className="type-caption shrink-0 whitespace-nowrap text-secondary">{when(m.created_at)}</span>
                  </button>
                  {expanded && (
                    <div className="flex w-full flex-col gap-16 pb-20 pl-20 tablet:pl-24">
                      {m.choices.length > 0 && (
                        <div className="flex flex-wrap gap-8">
                          {m.choices.map((ch) => (
                            <Badge key={ch} tone="information">
                              {ch}
                            </Badge>
                          ))}
                        </div>
                      )}
                      <p className="type-body w-full whitespace-pre-wrap break-words text-primary">{m.message}</p>
                      <div className="flex flex-wrap gap-8">
                        <a href={`mailto:${encodeURIComponent(m.email)}?subject=${encodeURIComponent(c.replySubject)}`} className={buttonClasses("primary", "small")}>
                          <ArrowUpRightIcon className="size-20" />
                          {c.reply}
                        </a>
                        <Button variant="secondary" size="small" onClick={() => apply(m.id, { read: !m.read }, () => updateMessage(m.id, { read: !m.read }))}>
                          {m.read ? c.markUnread : c.markRead}
                        </Button>
                        <Button
                          variant="secondary"
                          size="small"
                          onClick={() => {
                            setOpenId(null);
                            apply(m.id, { archived: !m.archived }, () => updateMessage(m.id, { archived: !m.archived }));
                          }}
                        >
                          {m.archived ? c.unarchive : c.archive}
                        </Button>
                        <Button variant="ghost" size="small" icon={<TrashIcon className="size-20" />} onClick={() => setRemoving(m)}>
                          {c.delete}
                        </Button>
                      </div>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </section>
      <DeleteDialog
        open={!!removing}
        onOpenChange={(o) => !o && setRemoving(null)}
        name={removing ? c.deleteName(removing.name) : ""}
        onConfirm={() => {
          if (removing) apply(removing.id, "deleted", () => deleteMessage(removing.id));
        }}
      />
    </>
  );
}
