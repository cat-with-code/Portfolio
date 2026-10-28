import type { Metadata } from "next";
import { ContentList } from "@/components/dashboard/content-list";
import { PlusIcon, ProjectsIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { projectsCopy as c } from "@/content/dashboard";
import { directoryProjects } from "@/content/projects";

export const metadata: Metadata = { title: "Projects" };

/** Dashboard / Projects (Figma Desktop 1346:2159 · content 1350:2555). */
export default function ProjectsPage() {
  const rows = directoryProjects.map((p) => ({
    key: p.key,
    title: p.name,
    meta: p.category,
    info: "English",
    status: "draft" as const,
    href: `/dashboard/projects/${p.key}`,
    thumb: p.cover,
  }));
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <SectionHeading
        title={c.title}
        description={c.description}
        action={
          <ButtonLink href="/dashboard/projects/new" size="small" icon={<PlusIcon className="size-20" />}>
            {c.add}
          </ButtonLink>
        }
      />
      <ContentList rows={rows} icon={<ProjectsIcon className="size-24" />} noun={c.noun} />
    </div>
  );
}
