"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { ArrowUpIcon, LinkIcon, MicrophoneIcon, PencilIcon, PlusIcon, RobotIcon, SparklesIcon, ZoomInIcon } from "@/components/icons";
import { developer, sdabbyUrl } from "@/content/developer";

const lab = developer.aiLab;
const starterIcons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = { zoom: ZoomInIcon, sparkles: SparklesIcon, pencil: PencilIcon };

/** AI / Chat message (677:3553) Layout=Assistant: 28px Sdabby avatar, SDABBY label, message. */
function AssistantMessage({ text }: { text: string }) {
  return (
    <div className="flex w-full items-start gap-12 overflow-clip">
      <span className="flex size-28 shrink-0 items-center justify-center overflow-clip rounded-full bg-brand text-icon-on-brand">
        <RobotIcon size={16} />
      </span>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-4 overflow-clip">
        <p className="type-eyebrow w-150 text-brand">{lab.assistant.label}</p>
        <p className="type-ui w-full text-primary">{text}</p>
      </div>
    </div>
  );
}

/** AI / Chat message Layout=User: right-aligned bubble, max text width 240. */
function UserMessage({ text }: { text: string }) {
  return (
    <div className="flex w-full items-start justify-end gap-8 overflow-clip">
      <div className="flex max-w-410 flex-col items-start gap-4 overflow-clip rounded-lg rounded-tr-sm bg-accent-blue-subtle px-16 py-12">
        <p className="type-caption max-w-240 text-primary">{text}</p>
      </div>
    </div>
  );
}

/** AI / Chat panel (Figma 677:3722). The composer is the prototype's visual sample — a real model connects later. */
function ChatPanel({ question, reply, onAsk }: { question: string; reply: string; onAsk: (q: string, r: string) => void }) {
  const tryButton = "flex size-40 shrink-0 items-center justify-center gap-4 overflow-clip rounded-full bg-brand p-0 text-icon-on-brand";
  return (
    <div className="flex min-w-0 flex-1 flex-col items-start gap-12 overflow-clip rounded-shell bg-surface-primary p-20">
      <div className="flex w-full items-center gap-8 overflow-clip">
        <span className="flex size-38 shrink-0 items-center justify-center overflow-clip rounded-lg bg-brand text-icon-on-brand">
          <RobotIcon size={22} />
        </span>
        <div className="flex h-43 min-w-0 flex-1 flex-col items-start gap-2 overflow-clip whitespace-nowrap">
          <p className="type-mobile-label w-full truncate text-primary">{lab.assistant.name}</p>
          <p className="type-caption w-full truncate text-secondary">{lab.assistant.tagline}</p>
        </div>
        {sdabbyUrl ? (
          <a href={sdabbyUrl} target="_blank" rel="noreferrer" aria-label={lab.assistant.tryLabel} className={`${tryButton} hover:bg-brand-hover`}>
            <LinkIcon />
          </a>
        ) : (
          <span aria-label={lab.assistant.tryLabel} title={lab.assistant.tryLabel} className={tryButton}>
            <LinkIcon />
          </span>
        )}
      </div>
      <div className="h-px w-full shrink-0 bg-surface-hover" />
      <div className="flex w-full flex-col items-start gap-16 overflow-x-clip overflow-y-auto" aria-live="polite">
        <AssistantMessage text={lab.greeting} />
        <UserMessage text={question} />
        <AssistantMessage text={reply} />
      </div>
      <div className="flex w-full flex-wrap content-center items-center gap-8 overflow-clip">
        {lab.chips.map((c) => (
          <button
            key={c.label}
            type="button"
            onClick={() => onAsk(c.question, c.reply)}
            className="type-table-heading flex shrink-0 cursor-pointer items-center justify-center overflow-clip rounded-shell bg-surface-secondary px-12 py-8 text-center whitespace-nowrap text-primary"
          >
            {c.label}
          </button>
        ))}
      </div>
      <div className="hidden min-h-0 w-px flex-1 tablet:block" />
      {/* AI / Chat composer (677:3595) */}
      <div className="flex h-96 w-full shrink-0 flex-col items-start gap-12 overflow-clip rounded-card border border-general-default bg-surface-primary pt-16 pr-12 pb-12 pl-16 shadow-card">
        <p className="type-body min-h-0 w-full flex-1 text-general-placeholder">{lab.composerPlaceholder}</p>
        <div className="flex w-full items-center justify-between overflow-clip" aria-hidden>
          <span className="flex size-32 items-center justify-center overflow-clip rounded-full border border-general-default text-icon-general-primary">
            <PlusIcon />
          </span>
          <span className="flex items-center gap-8 overflow-clip">
            <span className="flex size-32 items-center justify-center overflow-clip rounded-full text-icon-general-primary">
              <MicrophoneIcon />
            </span>
            <span className="flex size-32 items-center justify-center overflow-clip rounded-full bg-brand text-icon-on-brand">
              <ArrowUpIcon />
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** AI / Support card (Figma 677:3642) Layout=Prompts. */
function PromptsCard({ onAsk }: { onAsk: (q: string, r: string) => void }) {
  const p = lab.prompts;
  return (
    <div className="flex w-full flex-col items-start gap-12 overflow-clip rounded-shell bg-accent-violet-subtle p-20">
      {/* Figma keeps this row 24px tall and lets the wrapped "/ 01" line run into the gap below */}
      <div className="flex h-24 w-121 items-center gap-8">
        <span className="flex size-24 shrink-0 items-center justify-center overflow-clip rounded-md bg-brand text-icon-on-brand">
          <RobotIcon size={14} />
        </span>
        <p className="type-eyebrow h-full min-w-0 flex-1 whitespace-pre-wrap text-secondary">{p.eyebrow}</p>
      </div>
      <h3 className="type-subheading w-full text-primary">{p.heading}</h3>
      <p className="type-caption w-full text-secondary">{p.intro}</p>
      <div className="flex w-full flex-col items-start gap-8 overflow-clip pt-4">
        {p.starters.map((s) => {
          const Icon = starterIcons[s.icon];
          return (
            <button
              key={s.label}
              type="button"
              onClick={() => onAsk(s.question, s.reply)}
              className="flex w-full cursor-pointer items-center gap-12 overflow-clip rounded-lg bg-surface-primary p-12 text-left"
            >
              <span className="flex size-36 shrink-0 items-center justify-center overflow-clip rounded-md bg-accent-violet-subtle text-(--color-bg-accent-violet)">
                <Icon />
              </span>
              <span className="flex h-40 min-w-0 flex-1 flex-col items-start gap-2 overflow-clip">
                <span className="type-caption w-full text-muted">{s.category}</span>
                <span className="type-label w-full text-primary">{s.label}</span>
              </span>
              <span className="flex size-32 shrink-0 items-center justify-center overflow-clip rounded-full bg-brand text-icon-on-brand">
                <ArrowUpIcon />
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** AI / Support card Layout=Workflow: Ask → Explore → Refine. */
function WorkflowCard() {
  const w = lab.workflow;
  return (
    <div className="flex w-full flex-col items-start gap-12 overflow-clip rounded-shell bg-accent-green-subtle p-20">
      <p className="type-eyebrow w-full whitespace-pre-wrap text-secondary">{w.eyebrow}</p>
      <h3 className="type-page-title w-full text-primary">{w.heading}</h3>
      <p className="type-caption w-full text-secondary">{w.intro}</p>
      <ol className="flex w-full flex-col items-start overflow-clip py-4">
        {w.steps.map((s, i) => {
          const last = i === w.steps.length - 1;
          return (
            <li key={s.title} className="flex w-full items-start gap-12 overflow-clip">
              <span className="flex flex-col items-center gap-4 self-stretch overflow-clip">
                <span className={`type-label flex size-32 shrink-0 items-center justify-center overflow-clip rounded-full text-center ${last ? "bg-brand text-on-brand" : "bg-surface-primary text-brand"}`}>
                  {String(i + 1).padStart(2, "0")}
                </span>
                {!last && <span className="min-h-0 w-2 flex-1 rounded-full bg-(--color-border-general-strong)" />}
              </span>
              <span className={`flex min-w-0 flex-1 flex-col items-start gap-2 overflow-clip pt-4 ${last ? "" : "pb-16"}`}>
                <span className="type-card-title w-full text-primary">{s.title}</span>
                <span className="type-caption w-full text-secondary">{s.text}</span>
              </span>
            </li>
          );
        })}
      </ol>
      <p className="type-eyebrow w-full whitespace-pre-wrap text-secondary">{w.footnote}</p>
    </div>
  );
}

/** Developer / AI Playground section: heading + two-column bento (chat panel + supporting cards). */
export function AiLab() {
  const [chat, setChat] = useState<{ question: string; reply: string }>({ ...lab.conversation });
  const ask = (question: string, reply: string) => setChat({ question, reply });
  return (
    <section aria-labelledby="ai-lab-title" className="flex w-full flex-col items-start gap-16 pb-40">
      <div className="flex w-full flex-col items-start gap-12 tablet:h-67 tablet:flex-row tablet:items-center tablet:justify-between tablet:gap-8">
        <div className="flex w-full min-w-0 flex-col items-start gap-4 overflow-clip tablet:w-auto tablet:flex-1 desktop:h-64">
          <p className="type-eyebrow w-full text-brand">{lab.eyebrow}</p>
          <h2 id="ai-lab-title" className="type-page-title w-full text-primary tablet:type-kpi">
            {lab.title}
          </h2>
        </div>
        <span className="type-eyebrow flex h-29 shrink-0 items-center justify-center overflow-clip rounded-full bg-accent-blue-subtle px-12 py-8 tablet:w-179 desktop:w-181 text-center whitespace-nowrap text-primary">
          {lab.chip}
        </span>
      </div>
      <div className="flex w-full flex-col items-stretch gap-16 tablet:flex-row tablet:gap-24">
        <ChatPanel question={chat.question} reply={chat.reply} onAsk={ask} />
        <div className="flex w-full shrink-0 flex-col items-start gap-20 tablet:w-352">
          <PromptsCard onAsk={ask} />
          <WorkflowCard />
        </div>
      </div>
    </section>
  );
}
