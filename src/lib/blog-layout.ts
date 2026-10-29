/**
 * Where each published post sits on the Blog page, worked out from the posts themselves (newest first, the order
 * the dashboard saves them in), so a new post shows up the moment it's published:
 *   cover story → the newest · features → the next two · reading room → the following nine · archive & browse → all
 * Each card's small label is the post's own category.
 */
import type { Placement, Post } from "@/content/blog";

const number = (i: number) => String(i + 1).padStart(2, "0");
const place = (post: Post, i: number): Placement => ({ slug: post.slug, number: number(i), kicker: post.category });

/** Newest publish date first; posts without a date keep their saved order, after the dated ones. */
const newestFirst = (posts: Post[]) =>
  posts.map((p, i) => ({ p, i })).sort((a, b) => (b.p.published ?? "").localeCompare(a.p.published ?? "") || a.i - b.i).map(({ p }) => p);

export function blogLayout(all: Post[], coverKicker?: string) {
  const posts = newestFirst(all);
  return {
    cover: posts[0] ? { ...place(posts[0], 0), ...(coverKicker ? { kicker: coverKicker } : {}) } : null,
    features: posts.slice(1, 3).map((p, i) => place(p, i + 1)),
    readingRoom: posts.slice(3, 12).map((p, i) => place(p, i + 3)),
    archive: posts.map((p, i): Placement => ({ slug: p.slug, number: number(i) })),
  };
}
