"use client";

import { useSiteContent } from "@/components/content/site-content";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Blocks } from "@/components/content/blocks";
import { PanelClose, SidePanel } from "@/components/ui/side-panel";
import { useDrawer, useDrawerPayload, useDrawerState } from "@/components/shell/drawer-provider";
import { type PostTopicFilter } from "@/content/blog";
import { PostArt } from "./topic-art";
import { useT } from "@/i18n/lang-context";

/** Blog drawers place their panel like the other drawers: 544 wide, 24 from the edges; full width (8 inset) on phones. */
export const panelPlacement = "inset-8 gap-16 p-24 tablet:inset-y-24 tablet:right-24 tablet:left-auto tablet:w-544";

/** The Blog drawers' close button: a 44px circle with a "×" glyph (not the icon used elsewhere). */
export function GlyphClose({ label, className = "bg-surface-secondary text-primary", size = "text-[23px]" }: { label: string; className?: string; size?: string }) {
  return (
    <PanelClose
      aria-label={label}
      className={`flex size-44 shrink-0 cursor-pointer items-center justify-center rounded-full leading-[30px] transition-opacity duration-(--duration-fast) hover:opacity-80 ${size} ${className}`}
    >
      ×
    </PanelClose>
  );
}

function Header({ eyebrow, title, closeLabel, height }: { eyebrow: string; title: string; closeLabel: string; height: string }) {
  return (
    <div className={`flex w-full shrink-0 items-start gap-8 ${height}`}>
      <div className="flex min-w-0 flex-1 flex-col items-start gap-4">
        <p className="type-eyebrow w-full whitespace-pre-wrap text-brand">{eyebrow}</p>
        <p className="type-page-title w-full text-primary">{title}</p>
      </div>
      <GlyphClose label={closeLabel} />
    </div>
  );
}

/** Blog / Browse posts drawer (Figma 694:19844): topic chips filter the list; a row opens its preview. */
export function BrowseDrawer({ closeLabel }: { closeLabel: string }) {
  const units = useT("units");
  const browse = useT("browse");
  const state = useDrawerState("blog-browse");
  const { setOpen } = useDrawer();
  const [filter, setFilter] = useState<"all" | PostTopicFilter>("all");
  const { posts, readingTime = true } = useSiteContent();
  const list = browse.posts.flatMap((slug) => (posts[slug] ? [posts[slug]] : [])).filter((post) => filter === "all" || post.filter === filter);
  return (
    <SidePanel {...state} title={browse.title} className={`${panelPlacement} bg-surface-primary`}>
      <Header eyebrow={browse.eyebrow} title={browse.title} closeLabel={closeLabel} height="h-63" />
      <p className="type-ui w-full shrink-0 text-secondary">{browse.summary}</p>
      <div className="flex min-h-38 w-full shrink-0 flex-wrap items-start gap-8" role="group" aria-label={browse.note}>
        {browse.filters.map((chip) => (
          <button
            key={chip.key}
            type="button"
            aria-pressed={filter === chip.key}
            onClick={() => setFilter(chip.key)}
            className="type-table-heading flex h-34 cursor-pointer items-center justify-center rounded-full px-8 whitespace-nowrap tablet:px-16 text-secondary transition-colors duration-(--duration-fast) hover:bg-surface-hover aria-pressed:bg-brand-subtle aria-pressed:text-brand"
          >
            {chip.label}
          </button>
        ))}
      </div>
      <div className="type-eyebrow flex h-30 w-full shrink-0 items-start justify-between gap-8">
        <p className="text-primary">{units.posts(list.length)}</p>
        <p className="text-secondary">{browse.note}</p>
      </div>
      <div className="flex min-h-0 w-full flex-1 flex-col overflow-y-auto [scrollbar-width:none]">
        {list.map((post) => (
          <div key={post.slug} className="flex w-full flex-col">
            <button
              type="button"
              onClick={() => setOpen("blog-post", post.slug)}
              className="flex min-h-164 w-full cursor-pointer items-start gap-16 rounded-lg p-4 text-left tablet:min-h-176 transition-colors duration-(--duration-fast) hover:bg-surface-hover"
            >
              <span className="relative block size-150 shrink-0 overflow-clip rounded-lg">
                <span className="absolute top-0 -left-45 h-150 w-240">
                  <PostArt post={post} shape="wide" />
                </span>
              </span>
              <span className="flex min-h-150 min-w-0 flex-1 flex-col items-start gap-8 self-stretch py-8">
                <span className="type-eyebrow w-full text-brand">{browse.rowCategory[post.filter]}</span>
                <span className="type-card-title w-full text-primary">{post.title}</span>
                <span className="type-caption w-full text-secondary">{post.dek}</span>
                <span className="min-h-0 flex-1" />
                {readingTime && <span className="type-eyebrow w-full text-accent-green">{units.minRead(post.minutes)}</span>}
              </span>
            </button>
            <span aria-hidden className="h-px w-full shrink-0 bg-(--color-border-line-divider)" />
          </div>
        ))}
      </div>
    </SidePanel>
  );
}

/** Blog / Post preview drawer — "Inside the story" (Figma 694:20009). */
export function PostDrawer({ closeLabel }: { closeLabel: string }) {
  const units = useT("units");
  const browse = useT("browse");
  const preview = useT("preview");
  const state = useDrawerState("blog-post");
  const { setOpen } = useDrawer();
  const { posts, readingTime = true } = useSiteContent();
  const post = posts[useDrawerPayload("blog-post") ?? ""] ?? posts[browse.posts[0]] ?? Object.values(posts)[0];
  const lang = usePathname().split("/")[1];
  if (!post) return null;
  return (
    <SidePanel {...state} title={post.title} className={`${panelPlacement} bg-surface-primary`}>
      <Header eyebrow={preview.eyebrow} title={preview.title} closeLabel={closeLabel} height="h-62" />
      <p className="type-eyebrow w-full shrink-0 whitespace-pre-wrap text-secondary">
        {`${preview.sample}  ·  ${post.category}${readingTime ? "  ·  " : ""}`}
        {readingTime && <span className="text-accent-green">{units.minRead(post.minutes)}</span>}
      </p>
      <article className="flex min-h-0 w-full flex-1 flex-col items-start gap-14 overflow-y-auto rounded-card px-16 pt-16 pb-32 [scrollbar-width:none]">
        <h2 className="w-full text-[31px] leading-[40px] font-semibold whitespace-pre-line text-primary">{post.displayTitle ?? post.title}</h2>
        <p className="w-full text-[11px] leading-[17px] font-semibold whitespace-pre-wrap text-brand">{preview.byline}</p>
        <div className="relative h-232 w-full shrink-0 overflow-clip rounded-card">
          <PostArt post={post} shape="wide" fit="cover" />
        </div>
        {post.body ? <Blocks blocks={post.body} size="compact" /> : <p className="w-full text-[14px] leading-[23px] text-secondary">{post.excerpt}</p>}
      </article>
      <Link
        href={`/${lang}/blog/${post.slug}`}
        onClick={() => setOpen(null)}
        className="type-eyebrow flex h-44 w-full shrink-0 items-center justify-center rounded-lg bg-brand-subtle whitespace-pre text-brand transition-colors duration-(--duration-fast) hover:bg-brand-subtle-hover"
      >
        {preview.readFull}
      </Link>
      <button
        type="button"
        onClick={() => setOpen("blog-browse")}
        className="type-eyebrow flex h-44 w-full shrink-0 cursor-pointer items-center justify-center rounded-lg bg-brand whitespace-pre text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover"
      >
        {preview.back}
      </button>
    </SidePanel>
  );
}
