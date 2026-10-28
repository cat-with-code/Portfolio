/**
 * Where pages get blog posts and project case studies — from lib/site-content (Supabase, cached). Only these
 * functions know where content lives; the pages stay the same.
 */
import "server-only";
import type { Post } from "@/content/blog";
import type { CaseStudy } from "@/content/case-studies";
import { getSiteContent } from "./site-content";

/** All published posts, newest first when they have dates; otherwise in their saved order. */
export async function getPosts(): Promise<Post[]> {
  const { posts } = await getSiteContent();
  return Object.values(posts).sort((a, b) => (b.published ?? "").localeCompare(a.published ?? ""));
}

export async function getPost(slug: string): Promise<Post | null> {
  return (await getSiteContent()).posts[slug] ?? null;
}

/** The post after `slug` (wrapping), for "Next post". */
export async function getNextPost(slug: string): Promise<Post | null> {
  const all = await getPosts();
  const i = all.findIndex((p) => p.slug === slug);
  return all.length > 1 && i >= 0 ? all[(i + 1) % all.length] : null;
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return (await getSiteContent()).caseStudies;
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  return (await getSiteContent()).caseStudies.find((s) => s.key === slug) ?? null;
}
