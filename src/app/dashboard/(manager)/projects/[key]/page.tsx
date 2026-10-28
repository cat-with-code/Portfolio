import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProjectEditor } from "@/components/dashboard/project-editor";
import { directoryProjects } from "@/content/projects";
import { getCaseStudies, getCaseStudy } from "@/lib/content";

export function generateStaticParams() {
  return [{ key: "new" }, ...directoryProjects.map((p) => ({ key: p.key }))];
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  return { title: key === "new" ? "New project" : (directoryProjects.find((p) => p.key === key)?.name ?? "Project") };
}

/** Dashboard / Project editor for one project in the directory, or a blank card at /dashboard/projects/new. */
export default async function ProjectEditorPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (key === "new") return <ProjectEditor card={{ key: "new", eyebrow: "", name: "New project", category: "", description: "", disciplines: "", cover: "", href: null }} study={null} others={[]} />;
  const card = directoryProjects.find((p) => p.key === key);
  if (!card) notFound();
  const [study, studies] = await Promise.all([getCaseStudy(key), getCaseStudies()]);
  const i = studies.findIndex((s) => s.key === key);
  // The site shows the next case study in order; offer that first.
  const others = studies.map((_, k) => studies[(i + 1 + k) % studies.length]).filter((s) => s.key !== key).map((s) => ({ value: s.key, label: s.title }));
  return <ProjectEditor key={key} card={card} study={study} others={study ? others : []} />;
}
