/**
 * Where pages get blog posts and project case studies — from lib/site-content (Supabase, cached). Only these
 * functions know where content lives; the pages stay the same. `lang` picks the Khmer / Chinese version where one
 * exists (lib/content-translations); without it, English.
 */
import "server-only";
import type { Post } from "@/content/blog";
import type { CaseStudy } from "@/content/case-studies";
import { getSiteContent } from "./site-content";

/** All published posts, newest first when they have dates; otherwise in their saved order. */
export async function getPosts(lang = "en"): Promise<Post[]> {
  const { posts } = await getSiteContent(lang);
  return Object.values(posts).sort((a, b) => (b.published ?? "").localeCompare(a.published ?? ""));
}

export async function getPost(slug: string, lang = "en"): Promise<Post | null> {
  return (await getSiteContent(lang)).posts[slug] ?? null;
}

/** The post after `slug` (wrapping), for "Next post". */
export async function getNextPost(slug: string, lang = "en"): Promise<Post | null> {
  const all = await getPosts(lang);
  const i = all.findIndex((p) => p.slug === slug);
  return all.length > 1 && i >= 0 ? all[(i + 1) % all.length] : null;
}

export async function getCaseStudies(lang = "en"): Promise<CaseStudy[]> {
  return (await getSiteContent(lang)).caseStudies;
}

export async function getCaseStudy(slug: string, lang = "en"): Promise<CaseStudy | null> {
  return (await getSiteContent(lang)).caseStudies.find((s) => s.key === slug) ?? null;
}
