import type { Metadata } from "next";
import { ChecklistWidget, DraftsWidget, GamesWidget, InboxWidget, QuickActionsWidget, RecentMediaWidget, StatCard } from "@/components/dashboard/widgets";
import { Introduction } from "@/components/developer/introduction";
import { BlogIcon, GamesIcon, ImageIcon, ProjectsIcon, StudyIcon } from "@/components/icons";
import { SectionHeading } from "@/components/ui/section-heading";
import { overviewCopy as c } from "@/content/dashboard";
import { getDashboardSummary } from "@/lib/dashboard";

export const metadata: Metadata = { title: "Overview" };

/**
 * Dashboard / Overview (Figma Desktop 1346:2158 · Tablet 1435:7646 · Mobile 1437:11205).
 * Widget grid: 4 columns on Desktop, 2 on Tablet, 1 on Mobile.
 */
export default async function OverviewPage() {
  const s = await getDashboardSummary();
  return (
    <div className="flex w-full flex-col gap-(--layout-gap)">
      <SectionHeading title={c.title} description={c.description} />
      <div className="grid w-full grid-cols-1 gap-24 tablet:grid-cols-2 desktop:grid-cols-4">
        <div className="tablet:col-span-2 desktop:col-span-4">
          <Introduction eyebrow={c.welcome.eyebrow} title={c.welcome.title} body={c.welcome.body(s.allDrafts)} badge={c.welcome.badge} />
        </div>
        <StatCard href="/dashboard/projects" icon={ProjectsIcon} count={s.projects.total} title="Projects" detail={`${s.projects.drafts} drafts · ${s.projects.published} published`} tint="bg-accent-blue-subtle" />
        <StatCard href="/dashboard/writing" icon={BlogIcon} count={s.stories.total} title="Stories" detail={`${s.stories.drafts} drafts · ${s.stories.published} published`} tint="bg-accent-green-subtle" />
        <StatCard href="/dashboard/study" icon={StudyIcon} count={s.study.total} title="Study items" detail={`${s.study.tracks} tracks · ${s.study.books} books`} tint="bg-surface-secondary" />
        <StatCard href="/dashboard/games" icon={GamesIcon} count={s.games.total} title="Games" detail="Add links to start sharing" tint="bg-accent-violet-subtle" />
        <DraftsWidget drafts={s.drafts} total={s.allDrafts} className="tablet:col-span-2 desktop:row-span-2" />
        <InboxWidget className="tablet:col-span-2" />
        <ChecklistWidget className="tablet:col-span-2" />
        <RecentMediaWidget images={s.media.recent} summary={s.media.summary} className="tablet:col-span-2" />
        <GamesWidget linked={s.games.linked} total={s.games.total} next={s.games.next} />
        <QuickActionsWidget
          actions={[
            { label: c.actions.newProject, href: "/dashboard/projects", icon: ProjectsIcon },
            { label: c.actions.newStory, href: "/dashboard/writing", icon: BlogIcon },
            { label: c.actions.upload, href: "/dashboard/media", icon: ImageIcon },
          ]}
        />
      </div>
    </div>
  );
}
