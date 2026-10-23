import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/projects/case-study";
import { caseStudies } from "@/content/case-studies";
import { getLocale } from "@/i18n/dictionaries";

export function generateStaticParams() {
  return caseStudies.map((study) => ({ slug: study.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.key === slug);
  return study ? { title: study.title, description: study.summary } : {};
}

/** Project details (Figma Desktop 1108:92447 · Tablet 1109:73500 · Mobile 1109:95062, one per project). */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = caseStudies.find((s) => s.key === slug);
  if (!study) notFound();
  const lang = await getLocale();
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap) pb-32">
      <CaseStudy lang={lang} study={study} />
      <div aria-hidden className="h-24 w-full shrink-0" />
    </div>
  );
}
