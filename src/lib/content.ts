/**
 * Where pages get blog posts and project case studies. Today they come from the files in src/content; when the
 * dashboard exists, only these functions change (to read from its database / API) — the pages stay the same.
 * They're async for that reason.
 */
import { posts, type Post } from "@/content/blog";
import { caseStudies, type CaseStudy } from "@/content/case-studies";

/** All posts, newest first when they have dates; otherwise in the order they're written. */
export async function getPosts(): Promise<Post[]> {
  return Object.values(posts).sort((a, b) => (b.published ?? "").localeCompare(a.published ?? ""));
}

export async function getPost(slug: string): Promise<Post | null> {
  return posts[slug] ?? null;
}

/** The post after `slug` (wrapping), for "Next post". */
export async function getNextPost(slug: string): Promise<Post | null> {
  const all = await getPosts();
  const i = all.findIndex((p) => p.slug === slug);
  return all.length > 1 && i >= 0 ? all[(i + 1) % all.length] : null;
}

export async function getCaseStudies(): Promise<CaseStudy[]> {
  return caseStudies;
}

export async function getCaseStudy(slug: string): Promise<CaseStudy | null> {
  return caseStudies.find((s) => s.key === slug) ?? null;
}
