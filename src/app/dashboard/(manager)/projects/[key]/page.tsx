import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/dashboard/project-editor";
import { getSiteContent, requireOwnerContent } from "@/lib/site-content";

export async function generateStaticParams() {
  return [{ key: "new" }, ...(await getSiteContent()).projects.map((p) => ({ key: p.key }))];
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  return { title: key === "new" ? "New project" : ((await getSiteContent()).projects.find((p) => p.key === key)?.name ?? "Project") };
}

/** Dashboard / Project editor for one project in the directory, or a blank card at /dashboard/projects/new. */
export default async function ProjectEditorPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (key === "new") return <ProjectEditor card={{ key: "new", eyebrow: "", name: "New project", category: "", description: "", disciplines: "", cover: "", href: null }} study={null} />;
  // As the owner: drafts included.
  const content = await requireOwnerContent();
  const card = content.projects.find((p) => p.key === key);
  if (!card) notFound();
  const study = content.caseStudies.find((s) => s.key === key) ?? null;
  return <ProjectEditor key={key} card={card} study={study} status={content.status?.[`project:${key}`] ?? "draft"} />;
}
