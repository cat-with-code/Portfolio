import type { Metadata } from "next";
import { Archive } from "@/components/blog/archive";
import { LibraryButton, OpenDrawer } from "@/components/blog/drawer-triggers";
import { CoverStoryCard, FeatureCard } from "@/components/blog/post-card";
import { ReadingRoom } from "@/components/blog/reading-room";
import { getLocale } from "@/i18n/dictionaries";
import { pageMetadata, sectionMeta } from "@/lib/seo";
import { tr } from "@/i18n/content";
import { blogLayout } from "@/lib/blog-layout";
import { getSiteContent } from "@/lib/site-content";

const Rule = ({ className = "" }: { className?: string }) => <div aria-hidden className={`h-px w-full shrink-0 bg-(--color-border-line-divider) ${className}`} />;

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  return pageMetadata({ lang, path: "/blog", ...sectionMeta(lang, "blog") });
}

/** Blog — The Notebook magazine (Figma Desktop 694:19591 · Tablet 696:35187 · Mobile 696:41849). Posts are sample content. */
export default async function BlogPage() {
  const lang = await getLocale();
  const m = tr(lang, "magazine");
  const layout = blogLayout(Object.values((await getSiteContent(lang)).posts), m.cover.kicker);
  return (
    <div className="flex w-full flex-col items-start pb-32">
      <div className="flex w-full flex-col items-start gap-16 tablet:gap-0 tablet:pt-2">
        {/* Masthead */}
        <div className="flex w-full flex-col gap-16 tablet:flex-row tablet:justify-between">
          <p className="type-eyebrow whitespace-pre text-brand">
            <span className="desktop:hidden">{m.issueLong}</span>
            <span className="hidden desktop:inline">{m.issue}</span>
          </p>
          <p className="type-eyebrow whitespace-pre-wrap text-secondary tablet:w-419">{m.publisher}</p>
        </div>
        <Rule className="tablet:mt-12" />
        <div className="flex w-full flex-col gap-16 tablet:flex-row tablet:items-start tablet:justify-between tablet:pt-18 tablet:pb-27">
          <h1 className="text-[44px] leading-[48px] font-semibold tracking-[-1.5px] text-primary tablet:text-[68px] tablet:leading-[81px] tablet:tracking-[-3.4px]">
            {m.wordmark}
          </h1>
          <div className="flex flex-col gap-16 tablet:mr-12 tablet:w-280 tablet:gap-9 tablet:pt-9">
            <p className="type-eyebrow text-brand">{m.columnEyebrow}</p>
            <p className="type-body whitespace-pre-line text-secondary">{m.caption}</p>
          </div>
        </div>
        <Rule />
        <OpenDrawer
          kind="blog-browse"
          className="type-eyebrow flex h-32 w-full items-center justify-center self-end rounded-full bg-surface-primary whitespace-pre text-primary transition-colors duration-(--duration-fast) hover:bg-surface-hover tablet:mt-12 tablet:w-213"
        >
          {m.browseAll}
        </OpenDrawer>

        {/* Responsive feature row */}
        <div className="flex w-full flex-col items-start gap-20 tablet:mt-22 tablet:flex-row">
          {layout.cover && <CoverStoryCard placement={layout.cover} />}
          <div className="flex w-full flex-col gap-16 tablet:w-372 tablet:shrink-0">
            {layout.features.map((placement) => (
              <FeatureCard key={placement.slug} placement={placement} />
            ))}
          </div>
        </div>

        {layout.readingRoom.length > 0 && (
          <>
            {/* The reading room */}
            <div className="flex w-full flex-col gap-16 tablet:mt-10 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-0 desktop:mt-32">
              <div className="flex flex-col gap-16 tablet:gap-7">
                <p className="type-eyebrow text-brand">{m.readingRoom.eyebrow}</p>
                <h2 className="type-page-title tablet:type-section-heading text-primary">{m.readingRoom.title}</h2>
              </div>
              <p className="type-eyebrow whitespace-pre text-secondary tablet:mr-2 tablet:mb-9 tablet:w-300">{m.readingRoom.total}</p>
            </div>
            <Rule className="tablet:mt-19" />
            <div className="w-full tablet:mt-17">
              <ReadingRoom />
            </div>
          </>
        )}

        {/* The archive */}
        <Rule className="tablet:mt-24" />
        <div className="flex w-full flex-col gap-16 tablet:mt-24 tablet:flex-row tablet:items-end tablet:justify-between tablet:gap-0">
          <div className="flex flex-col gap-16 tablet:gap-9">
            <p className="type-eyebrow whitespace-pre text-brand">{m.archive.label}</p>
            <h2 className="type-page-title tablet:type-section-heading text-primary">{m.archive.title}</h2>
          </div>
          <OpenDrawer
            kind="book-library"
            className="type-eyebrow hidden whitespace-pre text-brand transition-colors duration-(--duration-fast) hover:text-brand-hover tablet:mb-1 tablet:block"
          >
            {m.archive.library}
          </OpenDrawer>
          <LibraryButton label={m.archive.libraryButton} />
        </div>
        <Rule className="tablet:mt-27" />
        <div className="w-full tablet:mt-6">
          <Archive />
        </div>
      </div>
      {/* Bottom safe area */}
      <div aria-hidden className="h-32 w-full shrink-0 tablet:h-48" />
    </div>
  );
}
