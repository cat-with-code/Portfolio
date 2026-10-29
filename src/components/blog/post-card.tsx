"use client";

import { useSiteContent } from "@/components/content/site-content";
import type { ReactNode } from "react";
import { ArrowUpRightIcon } from "@/components/icons";
import { useDrawer } from "@/components/shell/drawer-provider";
import { type Placement, type Post } from "@/content/blog";
import { PostArt } from "./topic-art";
import { useT } from "@/i18n/lang-context";

/** "TECHNOLOGY  ·  8 MIN READ", or just the category when reading time is switched off (minRead null). */
export const metaLine = (post: Pick<Post, "category" | "minutes">, minRead: ((n: number) => string) | null) => (minRead ? `${post.category}  ·  ${minRead(post.minutes)}` : post.category);
const eyebrow = (p: Placement) => (p.kicker ? `${p.number}  /  ${p.kicker}` : p.number);

/** Every card opens the post in the "Inside the story" preview drawer. */
function CardButton({ slug, className, children }: { slug: string; className: string; children: ReactNode }) {
  const { setOpen } = useDrawer();
  return (
    <button type="button" onClick={() => setOpen("blog-post", slug)} className={`group/post cursor-pointer text-left ${className}`}>
      {children}
    </button>
  );
}

function ReadCta() {
  const magazine = useT("magazine");
  return (
    <span className="type-label flex shrink-0 items-center gap-4 whitespace-nowrap text-brand group-hover/post:text-brand-hover">
      {magazine.readStory}
      <span className="relative size-16 shrink-0">
        <ArrowUpRightIcon className="absolute top-0 left-0" />
      </span>
    </span>
  );
}

function Footer({ post, className = "" }: { post: Post; className?: string }) {
  const { readingTime = true } = useSiteContent();
  const units = useT("units");
  return (
    <span className={`flex w-full items-center gap-12 px-4 pt-4 ${className}`}>
      <span className="type-table-heading min-w-0 flex-1 whitespace-pre-wrap text-muted">{metaLine(post, readingTime ? units.minRead : null)}</span>
      <ReadCta />
    </span>
  );
}

/**
 * Blog / Post card — cover story. Desktop: Featured Square (280 square art beside the copy);
 * Tablet / Mobile: Featured (wide art on top).
 */
export function CoverStoryCard({ placement }: { placement: Placement }) {
  const { posts } = useSiteContent();
  const post = posts[placement.slug];
  // Unpublished or deleted posts simply leave their slot empty.
  if (!post) return null;
  return (
    <CardButton
      slug={post.slug}
      className="flex w-full flex-col items-start gap-16 rounded-card bg-surface-primary pt-16 pr-16 pb-20 pl-16 tablet:min-w-0 tablet:flex-1 desktop:flex-row desktop:gap-20"
    >
      <span className="relative block h-200 w-full shrink-0 overflow-clip rounded-xl desktop:size-280">
        <PostArt post={post} shape="wide" className="tablet:hidden" />
        <PostArt post={post} shape="wide-478" className="hidden tablet:block desktop:hidden" />
        <PostArt post={post} shape="square" className="hidden desktop:block" />
      </span>
      <span className="flex w-full flex-col items-start gap-16 desktop:h-280 desktop:min-w-0 desktop:flex-1 desktop:justify-between">
        <span className="flex w-full flex-col items-start gap-8 px-4">
          <span className="type-table-heading w-full whitespace-pre-wrap text-brand">{eyebrow(placement)}</span>
          <span className="type-page-title w-full text-primary">{post.title}</span>
          <span className="type-body line-clamp-2 w-full text-muted tablet:line-clamp-3 desktop:line-clamp-4">{post.excerpt}</span>
        </span>
        <Footer post={post} />
      </span>
    </CardButton>
  );
}

/**
 * Side stories next to the cover story. Desktop / Tablet: Compact Feature (96 square thumbnail);
 * Mobile: Standard (wide art on top, meta + Read the story underneath).
 */
export function FeatureCard({ placement }: { placement: Placement }) {
  const { readingTime = true } = useSiteContent();
  const units = useT("units");
  const { posts } = useSiteContent();
  const post = posts[placement.slug];
  // Unpublished or deleted posts simply leave their slot empty.
  if (!post) return null;
  return (
    <CardButton
      slug={post.slug}
      className="flex w-full flex-col items-start gap-16 rounded-card bg-surface-primary pt-16 pr-16 pb-20 pl-16 tablet:flex-row tablet:items-center tablet:p-16"
    >
      <span className="relative block h-200 w-full shrink-0 overflow-clip rounded-xl tablet:hidden">
        <PostArt post={post} shape="wide" />
      </span>
      <span className="relative hidden size-96 shrink-0 overflow-clip rounded-lg tablet:block">
        <span className="absolute top-0 left-0 size-120">
          <PostArt post={post} shape="square" />
        </span>
      </span>
      <span className="flex w-full min-w-0 flex-col items-start gap-8 px-4 tablet:flex-1 tablet:gap-4 tablet:px-0">
        <span className="type-table-heading w-full whitespace-pre-wrap text-brand">{eyebrow(placement)}</span>
        <span className="type-card-title w-full text-primary">{post.title}</span>
        {readingTime && <span className="type-caption hidden w-full text-accent-green tablet:block">{units.minReadShort(post.minutes)}</span>}
      </span>
      <Footer post={post} className="tablet:hidden" />
    </CardButton>
  );
}

/** Reading room story. Desktop / Tablet: Wide card (art beside the copy); Mobile: Standard card. */
export function WideCard({ placement }: { placement: Placement }) {
  const { posts } = useSiteContent();
  const post = posts[placement.slug];
  // Unpublished or deleted posts simply leave their slot empty.
  if (!post) return null;
  return (
    <CardButton
      slug={post.slug}
      className="flex size-full flex-col items-start gap-16 rounded-card bg-surface-primary pt-16 pr-16 pb-20 pl-16 tablet:flex-row tablet:gap-24 tablet:pr-24"
    >
      <span className="relative block h-200 w-full shrink-0 overflow-clip rounded-xl tablet:h-full tablet:min-w-0 tablet:flex-1 tablet:rounded-none">
        <PostArt post={post} shape="wide" className="desktop:hidden" />
        <PostArt post={post} shape="wide-507" className="hidden desktop:block" />
      </span>
      <span className="flex w-full min-w-0 flex-col items-start gap-16 tablet:flex-1 tablet:self-stretch">
        <span className="flex w-full flex-col items-start gap-8 px-4">
          <span className="type-table-heading w-full whitespace-pre-wrap text-brand">{eyebrow(placement)}</span>
          <span className="type-card-title tablet:type-page-title w-full text-primary">{post.title}</span>
          <span className="type-body w-full text-muted">{post.excerpt}</span>
        </span>
        <Footer post={post} className="tablet:flex-1" />
      </span>
    </CardButton>
  );
}

/** Archive row — Blog / Post card Size=Compact: 84 thumbnail (wide art cropped), copy, arrow. */
export function ArchiveCard({ placement }: { placement: Placement }) {
  const { readingTime = true } = useSiteContent();
  const units = useT("units");
  const { posts } = useSiteContent();
  const post = posts[placement.slug];
  // Unpublished or deleted posts simply leave their slot empty.
  if (!post) return null;
  return (
    <CardButton slug={post.slug} className="flex w-full items-center gap-16 rounded-card bg-surface-primary py-12 pr-16 pl-12">
      <span className="relative block size-84 shrink-0 overflow-clip rounded-lg">
        <span className="absolute top-0 -left-25 h-84 w-134">
          <PostArt post={post} shape="wide" />
        </span>
      </span>
      <span className="flex min-w-0 flex-1 flex-col items-start gap-4">
        <span className="type-table-heading w-full text-brand">{placement.number}</span>
        <span className="type-table-heading w-full whitespace-pre-wrap text-muted">{metaLine(post, readingTime ? units.minRead : null)}</span>
        <span className="type-card-title w-full text-primary">{post.title}</span>
        <span className="type-caption w-full text-muted">{placement.excerpt ?? post.excerpt}</span>
      </span>
      <ArrowUpRightIcon className="size-20 shrink-0 text-brand" />
    </CardButton>
  );
}
