"use client";

import { useEffect, useRef, useState } from "react";
import { BookOpenIcon, CheckIcon, CloseIcon, PencilIcon, PlusIcon, SparklesIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { useStudy } from "./study-provider";
import { uid } from "@/lib/uid";
import { useT } from "@/i18n/lang-context";

function useStored<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);
  useEffect(() => {
    try {
      const v = localStorage.getItem(key);
      // eslint-disable-next-line react-hooks/set-state-in-effect -- one-time restore from localStorage
      if (v) setValue(JSON.parse(v));
    } catch {}
  }, [key]);
  const save = (v: T) => {
    setValue(v);
    try {
      localStorage.setItem(key, JSON.stringify(v));
    } catch {}
  };
  return [value, save] as const;
}

/** Study / Intention card (Figma 696:13752): View → Editing (focus, plan, quick start) → Saved. */
export function IntentionCard({ className = "" }: { className?: string }) {
  const ic = useT("intentionCopy");
  const [saved, setSaved] = useStored<{ focus: string; plan: string } | null>("study-intention", null);
  const [editing, setEditing] = useState(false);
  const [focus, setFocus] = useState(ic.defaultFocus);
  const [plan, setPlan] = useState("");
  const current = saved ?? { focus: ic.defaultFocus, plan: "" };
  const edit = () => {
    setFocus(current.focus);
    setPlan(current.plan);
    setEditing(true);
  };
  return (
    <section
      className={`flex flex-col items-start gap-16 rounded-card p-24 ${className}`}
      style={{ backgroundImage: "linear-gradient(135deg, var(--color-bg-status-success-subtle) 0%, var(--color-bg-accent-green-subtle) 55%, var(--color-bg-accent-blue-subtle) 100%)" }}
    >
      <div className="flex w-full flex-col items-start gap-8">
        <p className="type-eyebrow flex h-30 items-center gap-8 text-status-information">
          <SparklesIcon className="size-16" />
          {ic.chip}
        </p>
        <h2 className="type-page-title w-full text-primary">{ic.title}</h2>
        <p className="type-ui w-full text-secondary">{ic.helper}</p>
      </div>
      {editing ? (
        <form
          className="flex w-full flex-col gap-12"
          onSubmit={(e) => {
            e.preventDefault();
            setSaved({ focus: focus.trim() || ic.defaultFocus, plan: plan.trim() });
            setEditing(false);
          }}
        >
          <label className="flex flex-col gap-8">
            <span className="type-table-heading text-muted">{ic.focusLabel}</span>
            <input
              autoFocus
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              className="type-card-title h-52 rounded-lg border border-general-default bg-surface-primary px-16 text-primary outline-none focus:border-2 focus:border-(--color-border-interaction-focus)"
            />
          </label>
          <label className="flex flex-col gap-8">
            <span className="type-table-heading text-muted">{ic.planLabel}</span>
            <textarea
              value={plan}
              onChange={(e) => setPlan(e.target.value)}
              placeholder={ic.planPlaceholder}
              rows={3}
              className="type-body min-h-88 resize-none rounded-lg border border-general-default bg-surface-primary px-16 py-12 text-primary outline-none placeholder:text-general-placeholder focus:border-(--color-border-interaction-focus)"
            />
          </label>
          <div className="flex flex-col gap-8">
            <span className="type-table-heading text-muted">{ic.quickStart}</span>
            <div className="flex flex-wrap gap-8">
              {ic.quick.map((q) => (
                <button
                  key={q}
                  type="button"
                  onClick={() => setFocus(q)}
                  className="type-table-heading flex h-34 cursor-pointer items-center rounded-full border border-general-default bg-surface-primary px-16 text-secondary hover:bg-surface-hover"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
          <div className="flex justify-end gap-8">
            <Button variant="secondary" size="small" onClick={() => setEditing(false)}>
              {ic.cancel}
            </Button>
            <Button size="small" type="submit">
              {ic.save}
            </Button>
          </div>
        </form>
      ) : (
        <div className="flex w-full items-center gap-12 rounded-lg border border-general-default bg-surface-primary px-16 py-12">
          <span className="flex size-36 shrink-0 items-center justify-center rounded-md bg-brand-subtle text-icon-general-primary">
            <BookOpenIcon />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <span className="type-table-heading text-muted">{ic.focusLabel}</span>
            <span className="type-card-title text-primary">{current.focus}</span>
            {current.plan && <span className="type-body text-secondary">{current.plan}</span>}
          </div>
          <button type="button" aria-label={ic.edit} onClick={edit} className="flex size-32 shrink-0 cursor-pointer items-center justify-center rounded-full bg-surface-secondary text-icon-general-primary">
            <PencilIcon className="size-16" />
          </button>
        </div>
      )}
      <p className="type-caption flex w-full items-stretch gap-12 text-secondary">
        <span aria-hidden className="w-3 shrink-0 rounded-full bg-(--color-border-status-success)" />
        {ic.footnote}
      </p>
    </section>
  );
}

type Task = { id: string; text: string; done: boolean };
const toTasks = (list: readonly string[]): Task[] => list.map((text, i) => ({ id: `d${i}`, text, done: false }));

/** Study / Plan card (Figma 696:13762): today's checklist — tick, remove, add. Saved per browser. */
export function PlanCard({ className = "" }: { className?: string }) {
  const pc = useT("planCopy");
  const [tasks, setTasks] = useStored<Task[]>("study-plan", toTasks(pc.defaults));
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const done = tasks.filter((t) => t.done).length;
  return (
    <section className={`flex flex-col items-start gap-8 rounded-card bg-surface-primary p-20 ${className}`}>
      <div className="flex w-full flex-wrap items-center justify-between gap-8">
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h2 className="type-subheading text-primary">{pc.title}</h2>
          <p className="type-caption text-secondary">{pc.subtitle}</p>
        </div>
        <span className="type-eyebrow flex h-30 items-center rounded-full bg-accent-blue-subtle px-8 text-brand">{pc.done(done, tasks.length)}</span>
      </div>
      <ul className="flex w-full flex-col gap-8">
        {tasks.map((t) => (
          <li key={t.id} className="flex w-full items-center gap-8">
            <button
              type="button"
              role="checkbox"
              aria-checked={t.done}
              onClick={() => setTasks(tasks.map((x) => (x.id === t.id ? { ...x, done: !x.done } : x)))}
              className="flex min-h-56 min-w-0 flex-1 cursor-pointer items-center gap-16 rounded-card bg-study-inset p-16 text-left"
            >
              <span className={`flex size-24 shrink-0 items-center justify-center rounded-full ${t.done ? "bg-brand text-on-brand" : "border-2 border-general-strong"}`}>
                {t.done && <CheckIcon className="size-16" />}
              </span>
              <span className={`type-body min-w-0 flex-1 text-study-text ${t.done ? "line-through opacity-70" : ""}`}>{t.text}</span>
            </button>
            <button
              type="button"
              aria-label={`${pc.remove}: ${t.text}`}
              onClick={() => setTasks(tasks.filter((x) => x.id !== t.id))}
              className="flex size-32 shrink-0 cursor-pointer items-center justify-center rounded-full text-icon-general-primary hover:bg-surface-hover"
            >
              <CloseIcon className="size-16" />
            </button>
          </li>
        ))}
      </ul>
      {adding ? (
        <form
          className="flex w-full items-center gap-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (draft.trim()) setTasks([...tasks, { id: uid(), text: draft.trim(), done: false }]);
            setDraft("");
            setAdding(false);
          }}
        >
          <input
            ref={input}
            autoFocus
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={(e) => !e.currentTarget.value && setAdding(false)}
            placeholder={pc.placeholder}
            className="type-body h-46 min-w-0 flex-1 rounded-lg border border-(--color-border-interaction-focus) bg-surface-primary px-16 text-primary outline-none placeholder:text-general-placeholder"
          />
          <Button size="small" type="submit">
            {pc.add}
          </Button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAdding(true)}
          className="type-label flex h-46 w-full cursor-pointer items-center gap-8 rounded-lg border border-dashed border-general-strong px-16 text-brand hover:bg-surface-hover"
        >
          <PlusIcon className="size-16" />
          {pc.add}
        </button>
      )}
    </section>
  );
}

/** Study / Focus goal (Figma 696:13793): the selected technique's length and today's sessions out of four. */
export function GoalCard({ className = "" }: { className?: string }) {
  const units = useT("units");
  const goalCopy = useT("goalCopy");
  const techniques = useT("techniques");
  const { technique, sessionsToday } = useStudy();
  const minutes = techniques[technique].focus;
  const n = Math.min(4, sessionsToday);
  const r = 29;
  const len = 2 * Math.PI * r;
  return (
    <section className={`flex flex-col gap-12 rounded-card bg-surface-primary p-20 ${className}`}>
      <div className="flex w-full items-center gap-16">
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          <p className="type-eyebrow text-secondary">{goalCopy.eyebrow}</p>
          <p className="type-section-heading text-primary">{minutes ? units.minutes(minutes) : units.flexible}</p>
          <p className="type-caption text-secondary">{goalCopy.footer}</p>
        </div>
        <div className="relative size-64 shrink-0" role="img" aria-label={`${n} of 4 sessions today`}>
          <svg width="64" height="64" viewBox="0 0 64 64" className="absolute inset-0">
            <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-border-general-default)" strokeWidth="6" />
            <circle cx="32" cy="32" r={r} fill="none" stroke="var(--color-bg-brand)" strokeWidth="6" strokeLinecap="round" strokeDasharray={`${(len * Math.max(n, 0.0001)) / 4} ${len}`} transform="rotate(-90 32 32)" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-[14px] font-bold text-primary">{`${n}/4`}</span>
        </div>
      </div>
    </section>
  );
}

/** Study / Focus reminder (Figma 696:13813). */
export function ReminderCard({ className = "" }: { className?: string }) {
  const rc = useT("reminderCopy");
  return (
    <section className={`flex flex-col gap-8 rounded-card bg-surface-primary p-20 ${className}`}>
      <p className="type-eyebrow text-secondary">{rc.eyebrow}</p>
      <h3 className="type-subheading text-primary">{rc.title}</h3>
      <p className="type-caption text-secondary">{rc.body}</p>
      <p className="type-label text-brand">{rc.tag}</p>
    </section>
  );
}
