import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryEditor } from "@/components/dashboard/story-editor";
import { getPosts } from "@/lib/content";
import { getSiteContent, requireOwnerContent } from "@/lib/site-content";
import { toStoryForm } from "@/lib/story-form";

export async function generateStaticParams() {
  return [{ slug: "new" }, ...(await getPosts()).map((p) => ({ slug: p.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug === "new" ? "New story" : ((await getSiteContent()).posts[slug]?.title ?? "Story") };
}

/** Dashboard / Story editor for a post, or a blank one at /dashboard/writing/new. */
export default async function StoryEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "new") return <StoryEditor initial={toStoryForm(null)} />;
  // As the owner: drafts included.
  const content = await requireOwnerContent();
  const post = content.posts[slug];
  if (!post) notFound();
  return <StoryEditor key={slug} slug={slug} status={content.status?.[`post:${slug}`] ?? "draft"} initial={toStoryForm(post)} />;
}
