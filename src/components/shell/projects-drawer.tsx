"use client";

import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";
import { CloseIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";
import { PanelClose, SidePanel } from "@/components/ui/side-panel";
import { useSiteContent } from "@/components/content/site-content";
import { type DirectoryProject } from "@/content/projects";
import type { Dictionary } from "@/i18n/dictionaries";
import { useDrawer, useDrawerState } from "./drawer-provider";
import { useT } from "@/i18n/lang-context";

/** Projects / Directory row (Figma 499:10676): Default / Hover (color/bg/surface-hover). */
function Row({ project, lang, onNavigate }: { project: DirectoryProject; lang: string; onNavigate: () => void }) {
  const body: ReactNode = (
    <>
      <span className="relative size-136 shrink-0 overflow-clip rounded-lg">
        <Image src={project.coverImage ?? project.cover} alt="" fill sizes="136px" className="object-cover" />
      </span>
      <span className="flex min-h-146 min-w-0 flex-1 flex-col items-start gap-4 overflow-clip py-4 text-left">
        <span className="type-eyebrow w-full text-brand">{project.eyebrow}</span>
        <span className="type-subheading w-full text-primary">{project.name}</span>
        <span className="type-table-heading w-full text-secondary">{project.category}</span>
        <span className="type-caption w-full text-secondary">{project.description}</span>
        <span className="min-h-0 w-px flex-1" />
        <span className="type-eyebrow w-full whitespace-pre-wrap text-brand">{project.disciplines}</span>
      </span>
    </>
  );
  const cls = "flex w-full shrink-0 items-start gap-16 overflow-clip rounded-lg p-12";
  return project.href ? (
    <Link href={`/${lang}${project.href}`} onClick={onNavigate} className={`${cls} transition-colors duration-(--duration-fast) hover:bg-surface-hover`}>
      {body}
    </Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** All projects drawer (Figma Projects / Directory sliding panel 1117:100222 · Mobile 1117:105627). */
export function ProjectsDrawer({ lang, dict }: { lang: string; dict: Dictionary }) {
  const units = useT("units");
  const directory = useT("directory");
  const { projects: directoryProjects } = useSiteContent();
  const state = useDrawerState("projects");
  const { setOpen } = useDrawer();
  return (
    <SidePanel {...state} title={directory.title} className="inset-8 gap-16 bg-surface-primary p-24 tablet:inset-y-24 tablet:right-24 tablet:left-auto tablet:w-544">
      <div className="flex h-65 w-full shrink-0 items-center gap-12 overflow-clip">
        <div className="flex h-62 min-w-0 flex-1 flex-col items-start gap-4 overflow-clip">
          <p className="type-eyebrow w-full whitespace-pre-wrap text-brand">{directory.eyebrow}</p>
          <p className="type-page-title w-full text-primary">{directory.title}</p>
        </div>
        <PanelClose asChild>
          <IconButton aria-label={dict.a11y.close} surface="secondary" bordered={false}>
            <CloseIcon className="text-primary" />
          </IconButton>
        </PanelClose>
      </div>
      <p className="type-ui w-full shrink-0 text-secondary">{directory.summary}</p>
      <div className="type-eyebrow flex h-25 w-full shrink-0 items-start justify-between gap-8 overflow-clip">
        <p className="text-primary">{units.projects(directoryProjects.length)}</p>
        <p className="text-secondary">{directory.scrollLabel}</p>
      </div>
      <div className="flex min-h-0 w-full flex-1 flex-col items-start gap-12 overflow-x-clip overflow-y-auto [scrollbar-width:none]">
        {directoryProjects.map((p) => (
          <Row key={p.key} project={p} lang={lang} onNavigate={() => setOpen(null)} />
        ))}
      </div>
    </SidePanel>
  );
}
