import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { StoryEditor } from "@/components/dashboard/story-editor";
import { getPost, getPosts } from "@/lib/content";
import { toStoryForm } from "@/lib/story-form";

export async function generateStaticParams() {
  return [{ slug: "new" }, ...(await getPosts()).map((p) => ({ slug: p.slug }))];
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return { title: slug === "new" ? "New story" : ((await getPost(slug))?.title ?? "Story") };
}

/** Dashboard / Story editor for a post, or a blank one at /dashboard/writing/new. */
export default async function StoryEditorPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (slug === "new") return <StoryEditor initial={toStoryForm(null)} isNew />;
  const post = await getPost(slug);
  if (!post) notFound();
  return <StoryEditor key={slug} initial={toStoryForm(post)} />;
}
