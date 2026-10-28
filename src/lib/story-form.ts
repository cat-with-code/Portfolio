/**
 * The Story editor's fields (Figma Dashboard / Story editor 1371:4104) and how they map to a blog Post and its content
 * blocks. Only what the site shows is editable: title, topic, card excerpt, one-line dek, cover illustration, and the
 * article — introduction, one section, pull quote, numbered list — which becomes Post.body.
 */
import type { TopicKey } from "@/components/blog/topic-art";
import type { Post, PostTopicFilter } from "@/content/blog";
import { readingMinutes, type Block } from "@/content/blocks";

export const storyTopics: { value: TopicKey; label: string; filter: PostTopicFilter; category: string }[] = [
  { value: "technology", label: "Technology", filter: "technology", category: "TECHNOLOGY" },
  { value: "books", label: "Books & Reading", filter: "books", category: "BOOKS & READING" },
  { value: "fiction", label: "Fiction & Stories", filter: "stories", category: "SHORT STORIES" },
  { value: "notes", label: "Personal notes", filter: "life", category: "PERSONAL NOTES" },
  { value: "culture", label: "Culture", filter: "life", category: "CULTURE" },
];

export type StoryForm = {
  title: string;
  /** Blog topic (filter + category line) */
  topic: TopicKey;
  /** Drawn cover illustration, shown until a cover image is uploaded */
  art: TopicKey;
  /** Uploaded cover image (Post.cover) */
  cover?: string;
  /** Card excerpt (magazine, archive) */
  excerpt: string;
  /** One line under the title on the post page and in Browse posts */
  dek: string;
  intro: string;
  heading: string;
  /** Paragraphs separated by a blank line */
  body: string;
  quoteLabel: string;
  quote: string;
  listHeading: string;
  points: string[];
};

export const storyLimits = { excerpt: 220, dek: 80, intro: 260, body: 800, quote: 140 };

/** Reads a post (or nothing, for a new story) into the editor's fields. */
export function toStoryForm(post?: Post | null): StoryForm {
  const blocks = post?.body ?? [];
  const take = <T extends Block["type"]>(type: T, from = 0) => {
    const i = blocks.findIndex((b, k) => k >= from && b.type === type);
    return { i, block: i >= 0 ? (blocks[i] as Extract<Block, { type: T }>) : undefined };
  };
  const intro = take("paragraph");
  const heading = take("heading");
  const quote = take("quote");
  const listHeading = take("heading", heading.i + 1);
  const list = take("list");
  const bodyEnd = quote.i >= 0 ? quote.i : listHeading.i >= 0 ? listHeading.i : blocks.length;
  const body = heading.i >= 0 ? blocks.slice(heading.i + 1, bodyEnd).filter((b) => b.type === "paragraph") : [];
  const topic = storyTopics.find((t) => t.category === post?.category)?.value ?? post?.topic ?? "technology";
  return {
    title: post?.title ?? "",
    topic,
    art: post?.topic ?? "technology",
    cover: post?.cover,
    excerpt: post?.excerpt ?? "",
    dek: post?.dek ?? "",
    intro: intro.block?.text ?? "",
    heading: heading.block?.text ?? "",
    body: body.map((b) => (b as { text: string }).text).join("\n\n"),
    quoteLabel: quote.block?.label ?? "FROM THE NOTEBOOK",
    quote: quote.block?.text ?? "",
    listHeading: listHeading.block?.text ?? "",
    points: list.block?.items ?? [],
  };
}

/** The editor's fields as content blocks, skipping empty parts. */
export function storyBlocks(f: StoryForm): Block[] {
  const blocks: Block[] = [];
  if (f.intro.trim()) blocks.push({ type: "paragraph", text: f.intro.trim() });
  if (f.heading.trim()) blocks.push({ type: "heading", text: f.heading.trim() });
  f.body
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)
    .forEach((text) => blocks.push({ type: "paragraph", text }));
  if (f.quote.trim()) blocks.push({ type: "quote", text: f.quote.trim(), label: f.quoteLabel.trim() || undefined });
  if (f.listHeading.trim()) blocks.push({ type: "heading", text: f.listHeading.trim() });
  const points = f.points.map((p) => p.trim()).filter(Boolean);
  if (points.length) blocks.push({ type: "list", ordered: true, items: points });
  return blocks;
}

export const storyMinutes = (f: StoryForm) => readingMinutes(storyBlocks(f));
