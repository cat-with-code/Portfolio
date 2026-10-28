import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PublishReview } from "@/components/dashboard/publish-review";
import { CaseStudy } from "@/components/projects/case-study";
import { publishCopy as c } from "@/content/dashboard";
import { directoryProjects } from "@/content/projects";
import { getCaseStudy } from "@/lib/content";

export function generateStaticParams() {
  return directoryProjects.map((p) => ({ key: p.key }));
}

export const metadata: Metadata = { title: "Publish" };

/** Dashboard / Publish review for a project: the checklist and its case study as visitors see it. */
export default async function PublishPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const card = directoryProjects.find((p) => p.key === key);
  if (!card) notFound();
  const study = await getCaseStudy(key);
  return (
    <PublishReview name={card.name} editHref={`/dashboard/projects/${key}`}>
      {study ? <CaseStudy lang="en" study={study} preview /> : <p className="type-body text-secondary">{c.noCase}</p>}
    </PublishReview>
  );
}
