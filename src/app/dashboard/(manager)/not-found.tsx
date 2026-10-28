import type { Metadata } from "next";
import { NotFoundView } from "@/components/feedback/not-found-view";
import { BlogIcon, GridIcon, ProjectsIcon, StudyIcon } from "@/components/icons";
import { dashboardNotFound } from "@/content/dashboard";

export const metadata: Metadata = { title: "Not found" };

/** 404 inside the dashboard: deleted items and unknown dashboard addresses. */
export default function DashboardNotFound() {
  const icon = "size-18";
  return (
    <NotFoundView
      copy={dashboardNotFound}
      home="/dashboard"
      links={[
        { href: "/dashboard", label: "Overview", icon: <GridIcon className={icon} /> },
        { href: "/dashboard/projects", label: "Projects", icon: <ProjectsIcon className={icon} /> },
        { href: "/dashboard/writing", label: "Writing", icon: <BlogIcon className={icon} /> },
        { href: "/dashboard/study", label: "Study library", icon: <StudyIcon className={icon} /> },
      ]}
    />
  );
}
