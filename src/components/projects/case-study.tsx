import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRightIcon } from "@/components/icons";
import { TextReader } from "@/components/reader/text-reader";
import { caseStudies, caseStudyCopy as copy, type CaseStudy as Study } from "@/content/case-studies";
import { CaseCover } from "./case-cover";

const Rule = () => <div aria-hidden className="h-px w-full shrink-0 bg-(--color-border-line-divider)" />;

/** Section: eyebrow + title beside the main column (Desktop 280 / Tablet 220), stacked on Mobile. */
function Section({ eyebrow, title, children }: { eyebrow: string; title: string; children: ReactNode }) {
  return (
    <section className="flex w-full flex-col items-start gap-16 pt-20 pb-24 tablet:flex-row tablet:gap-32 tablet:pt-24 tablet:pb-40">
      <div className="flex w-full shrink-0 flex-col items-start gap-4 tablet:w-220 desktop:w-280">
        <p className="type-eyebrow w-full whitespace-pre-wrap text-brand">{eyebrow}</p>
        <h2 className="type-page-title tablet:type-section-heading w-full text-primary">{title}</h2>
      </div>
      <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-24">{children}</div>
    </section>
  );
}

/** Projects / Case study (Figma 1108:92445): Desktop · Tablet · Mobile layouts of one project page. */
/** `preview` (dashboard Publish review) leaves out the audio reader, which needs the site's providers. */
export function CaseStudy({ lang, study, preview = false }: { lang: string; study: Study; preview?: boolean }) {
  const index = caseStudies.findIndex((s) => s.key === study.key);
  const next = caseStudies[(index + 1) % caseStudies.length];
  const spoken = [
    study.title,
    study.summary,
    study.overview.lead,
    study.challenge.body,
    study.challenge.goal,
    ...study.work.items.map((item) => `${item.title}. ${item.body}`),
    study.outcome.statement,
  ].join(" ");

  return (
    <article className="flex w-full flex-col items-start">
      {/* Top line */}
      <div className="flex w-full items-center justify-between gap-16 pb-12">
        <Link href={`/${lang}/projects`} className="type-eyebrow py-12 whitespace-pre text-brand hover:text-brand-hover">
          {copy.back}
        </Link>
        <p className="type-eyebrow text-right whitespace-pre text-muted">{study.issue}</p>
      </div>
      <Rule />
      {/* Masthead */}
      <header className="flex w-full flex-col items-start gap-24 py-20 tablet:flex-row tablet:items-end tablet:gap-32 tablet:py-24">
        <div className="flex w-full min-w-0 flex-1 flex-col items-start gap-16">
          <p className="type-eyebrow whitespace-pre text-brand">{study.eyebrow}</p>
          <h1 className="type-large-metric tablet:max-desktop:text-[54px] tablet:max-desktop:leading-[62px] tablet:max-desktop:tracking-[-2.4px] desktop:type-display w-full text-primary">
            {study.title}
          </h1>
        </div>
        <div className="flex w-full shrink-0 flex-col items-start gap-16 tablet:w-260 desktop:w-300">
          <p
            className={`type-eyebrow flex items-center rounded-full px-12 py-4 whitespace-pre ${
              study.status.tone === "success" ? "bg-status-success-subtle text-status-success" : "bg-accent-blue-subtle text-brand"
            }`}
          >
            {study.status.label}
          </p>
          <p className="type-body w-full text-secondary">{study.summary}</p>
        </div>
      </header>
      <Rule />
      {/* Credits: four columns, 2×2 on Mobile */}
      <dl className="grid w-full grid-cols-2 gap-x-24 gap-y-16 py-16 tablet:flex tablet:gap-24">
        {study.credits.map((credit) => (
          <div key={credit.label} className="flex min-w-0 flex-1 flex-col items-start gap-4">
            <dt className="type-eyebrow text-muted">{credit.label}</dt>
            <dd className="type-body w-full text-primary">{credit.value}</dd>
          </div>
        ))}
      </dl>
      <Rule />
      <div className="w-full py-20 tablet:py-32">
        <CaseCover project={study.key} />
      </div>
      <Rule />
      <Section eyebrow={copy.sections[0]} title={study.overview.title}>
        {!preview && <TextReader title={study.title} text={spoken} lang={lang} labels={copy.reader} />}
        <p className="type-mobile-body w-full text-primary">{study.overview.lead}</p>
      </Section>
      <Rule />
      <Section eyebrow={copy.sections[1]} title={study.challenge.title}>
        <p className="type-body w-full text-secondary">{study.challenge.body}</p>
        <figure className="flex w-full items-stretch gap-16">
          <span aria-hidden className="w-3 shrink-0 bg-brand" />
          <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
            <figcaption className="type-eyebrow text-brand">{copy.goal}</figcaption>
            <blockquote className="type-subheading tablet:type-page-title w-full text-primary">{study.challenge.goal}</blockquote>
          </div>
        </figure>
      </Section>
      <Rule />
      <Section eyebrow={copy.sections[2]} title={study.work.title}>
        <ol className="grid w-full grid-cols-1 items-start gap-x-32 gap-y-24 tablet:grid-cols-2">
          {study.work.items.map((item, i) => (
            <li key={item.title} className="flex min-w-0 flex-col items-start gap-4">
              <Rule />
              <div className="flex w-full items-baseline gap-16 pt-8">
                <span className="type-label shrink-0 text-brand">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="type-card-title min-w-0 flex-1 text-primary">{item.title}</h3>
              </div>
              <p className="type-body w-full text-secondary">{item.body}</p>
            </li>
          ))}
        </ol>
      </Section>
      <Rule />
      <Section eyebrow={copy.sections[3]} title={study.outcome.title}>
        <p className="type-page-title tablet:type-kpi w-full text-primary">{study.outcome.statement}</p>
      </Section>
      <Rule />
      {/* Next project */}
      <Link href={`/${lang}/projects/${next.key}`} className="group/next flex w-full items-center gap-24 py-20 tablet:py-24">
        <span className="flex min-w-0 flex-1 flex-col items-start gap-4">
          <span className="type-eyebrow text-muted">{copy.next}</span>
          <span className="type-page-title tablet:type-section-heading w-full text-primary">{next.title}</span>
          <span className="type-body w-full text-secondary">{next.summary}</span>
        </span>
        <span className="flex size-48 shrink-0 items-center justify-center rounded-full bg-brand text-icon-on-brand transition-colors duration-(--duration-fast) group-hover/next:bg-brand-hover">
          <ArrowRightIcon />
        </span>
      </Link>
      <Rule />
    </article>
  );
}
