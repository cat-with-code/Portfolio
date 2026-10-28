"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { Post } from "@/content/blog";
import type { Book } from "@/content/books";
import type { CaseStudy } from "@/content/case-studies";
import type { DirectoryProject, ProjectCard } from "@/content/projects";
import type { Track, Vibe } from "@/content/study";

/**
 * Everything editable the site shows, as loaded by lib/site-content (Supabase, or the files in src/content when
 * Supabase isn't configured). Visitors only ever receive published items.
 */
export type SiteContent = {
  posts: Record<string, Post>;
  /** All projects, in directory order */
  projects: DirectoryProject[];
  /** Projects shown as cards on the Projects page */
  projectCards: ProjectCard[];
  caseStudies: CaseStudy[];
  tracks: Record<Vibe, Track[]>;
  books: Book[];
  /** Play link per game key */
  gameLinks: Record<string, string>;
};

const Ctx = createContext<SiteContent | null>(null);

/** Hands the server-loaded content to client components (posts, projects, tracks, books…). */
export function SiteContentProvider({ value, children }: { value: SiteContent; children: ReactNode }) {
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useSiteContent() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useSiteContent must be used inside SiteContentProvider");
  return ctx;
}

/** Uploaded cover image of a project, if any. */
export const projectImage = (content: Pick<SiteContent, "projects">, key: string) => content.projects.find((p) => p.key === key)?.coverImage;
