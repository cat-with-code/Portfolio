import type { Metadata } from "next";
import { TryItCard } from "@/components/developer/try-it-card";
import { DesignApproach, ProcessList } from "@/components/projects/design-approach";
import { DirectoryButton, DirectoryCaption } from "@/components/projects/directory-button";
import { Explorations } from "@/components/projects/explorations";
import { ProjectCard } from "@/components/projects/project-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { developer } from "@/content/developer";
import { projectsPage as p } from "@/content/projects";
import { getSiteContent } from "@/lib/site-content";
import { getLocale } from "@/i18n/dictionaries";
import { pageMetadata, sectionDescriptions } from "@/lib/seo";

export async function generateMetadata(): Promise<Metadata> {
  return pageMetadata({ lang: await getLocale(), path: "/projects", title: "Projects", description: sectionDescriptions.projects });
}

/** Projects — Bento editorial layout (Figma Desktop 694:22512 · Tablet 696:37956 · Mobile 696:44618). */
export default async function ProjectsPage() {
  const lang = await getLocale();
  const { projectCards, projects } = await getSiteContent();
  // Game Hub first on this page (Projects / Try it yourself 860:53385).
  const tryIt = [...developer.tryIt].reverse();
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap) pb-32">
      <SectionHeading title={p.heading.title} description={p.heading.description} action={<DirectoryButton>{p.heading.action}</DirectoryButton>} />
      <div className="flex w-full flex-col items-start gap-20 tablet:gap-32">
        <div className="flex w-full flex-col items-start gap-8">
          <p className="type-eyebrow w-full whitespace-pre-wrap text-brand">{p.intro.eyebrow}</p>
          <p className="type-kpi tablet:type-large-metric w-full text-primary">{p.intro.title}</p>
          <p className="type-body w-full text-secondary">{p.intro.body}</p>
        </div>
        {/* Selected work */}
        <div className="flex w-full flex-col items-start gap-12">
          <div className="flex w-full flex-col items-stretch gap-16 tablet:flex-row tablet:gap-20 desktop:gap-24">
            {projectCards.map((project) => (
              <ProjectCard key={project.key} lang={lang} project={project} image={projects.find((x) => x.key === project.key)?.coverImage} />
            ))}
          </div>
          <DirectoryCaption className="hidden tablet:block">{p.closing}</DirectoryCaption>
        </div>
        {/* Try it yourself */}
        <div className="flex w-full flex-col items-start gap-12">
          <div className="flex w-full flex-col items-start gap-4 overflow-clip text-muted">
            <p className="type-table-heading w-full">{p.tryIt.eyebrow}</p>
            <p className="type-caption w-full">{p.tryIt.note}</p>
          </div>
          <div className="flex w-full flex-wrap items-stretch gap-(--layout-gap)">
            {tryIt.map((item) => (
              <TryItCard key={item.key} lang={lang} item={item} className="min-w-300" />
            ))}
          </div>
        </div>
        <DirectoryCaption className="tablet:hidden">{p.closing}</DirectoryCaption>
        <DesignApproach />
        <ProcessList />
        <Explorations />
        <div aria-hidden className="h-28 w-full shrink-0" />
      </div>
    </div>
  );
}
