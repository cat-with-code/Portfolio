import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setProjectStatus } from "@/app/dashboard/actions";
import { PublishReview } from "@/components/dashboard/publish-review";
import { CaseStudy } from "@/components/projects/case-study";
import { publishCopy as c } from "@/content/dashboard";
import { getSiteContent, requireOwnerContent } from "@/lib/site-content";

export async function generateStaticParams() {
  return (await getSiteContent()).projects.map((p) => ({ key: p.key }));
}

export const metadata: Metadata = { title: "Publish" };

/** Dashboard / Publish review for a project: the checklist and its case study as visitors see it. */
export default async function PublishPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  const { projects, caseStudies } = await requireOwnerContent();
  const card = projects.find((p) => p.key === key);
  if (!card) notFound();
  const index = caseStudies.findIndex((s) => s.key === key);
  const study = caseStudies[index];
  return (
    <PublishReview name={card.name} editHref={`/dashboard/projects/${key}`} onPublish={setProjectStatus.bind(null, key, "published")}>
      {study ? <CaseStudy lang="en" study={study} next={caseStudies[(index + 1) % caseStudies.length]} image={card.coverImage} preview /> : <p className="type-body text-secondary">{c.noCase}</p>}
    </PublishReview>
  );
}
