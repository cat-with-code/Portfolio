import Link from "next/link";
import { ArrowUpRightIcon } from "@/components/icons";
import { type ProjectCard as Card } from "@/content/projects";
import { ProjectCover } from "./project-cover";
import { tr } from "@/i18n/content";

/** Projects / Project card (Figma 856:2446): cover, category + status, name, description, tags, Explore link. */
export function ProjectCard({ lang, project, image }: { lang: string; project: Card; image?: string }) {
  const projectsPage = tr(lang, "projectsPage");
  return (
    <Link
      href={`/${lang}/projects/${project.key}`}
      className="group/card flex min-w-0 flex-1 flex-col items-start gap-16 rounded-card bg-surface-primary p-20"
    >
      <ProjectCover project={project.key} image={image} />
      <span className="flex w-full flex-wrap content-center items-center justify-between gap-8 overflow-clip">
        <span className="type-table-heading whitespace-nowrap text-brand">{project.meta}</span>
        <span className="type-caption flex shrink-0 items-start overflow-clip rounded-full bg-brand-subtle px-12 py-4 whitespace-nowrap text-brand">
          {project.status}
        </span>
      </span>
      <span className="flex min-h-px w-full flex-1 flex-col items-start gap-8 overflow-clip">
        <span className="type-page-title w-full text-primary">{project.name}</span>
        <span className="type-body w-full text-muted">{project.description}</span>
      </span>
      <span className="flex w-full flex-wrap content-start items-start gap-8 overflow-clip">
        {project.tags.map((tag) => (
          <span key={tag} className="type-caption flex shrink-0 items-start overflow-clip rounded-full bg-page px-12 py-4 whitespace-nowrap text-primary">
            {tag}
          </span>
        ))}
      </span>
      <span className="type-label flex items-center gap-4 overflow-clip pt-12 pb-4 whitespace-nowrap text-brand group-hover/card:text-brand-hover">
        {projectsPage.cta}
        <span className="relative size-16 shrink-0">
          <ArrowUpRightIcon className="absolute top-0 left-0" />
        </span>
      </span>
    </Link>
  );
}
