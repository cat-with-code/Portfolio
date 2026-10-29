import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { PostArt } from "@/components/blog/topic-art";
import { Blocks } from "@/components/content/blocks";
import { ArrowRightIcon } from "@/components/icons";
import { TextReader } from "@/components/reader/text-reader";
import { SAMPLE_BLOG } from "@/content/blog";
import { tr } from "@/i18n/content";
import { blocksToText } from "@/content/blocks";
import { getLocale } from "@/i18n/dictionaries";
import { getNextPost, getPost, getPosts } from "@/lib/content";
import { absolute, jsonLd, pageMetadata, personJsonLd } from "@/lib/seo";
import { longDate } from "@/i18n/dates";

const Rule = () => <div aria-hidden className="h-px w-full shrink-0 bg-(--color-border-line-divider)" />;

export async function generateStaticParams() {
  return (await getPosts()).map((post) => ({ slug: post.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const lang = await getLocale();
  const post = await getPost((await params).slug, lang);
  if (!post) return {};
  return pageMetadata({
    lang,
    path: `/blog/${post.slug}`,
    title: post.title,
    description: post.excerpt || post.dek,
    image: post.cover,
    article: { published: post.published, section: post.category },
  });
}

/** Publish date in the page language: "28 October 2026", "ទី28 ខែតុលា ឆ្នាំ2026", "2026年10月28日". */
const date = (iso: string, lang: string) => longDate(lang, new Date(iso), { weekday: false });

/** Blog post page: the full article behind a magazine card or the preview drawer. Content comes from lib/content. */
export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLocale();
  const [post, next] = await Promise.all([getPost(slug, lang), getNextPost(slug, lang)]);
  if (!post) notFound();
  const copy = tr(lang, "postPage");
  const spoken = `${post.title}. ${post.body ? blocksToText(post.body) : post.excerpt}`;

  return (
    <article className="flex w-full flex-col items-start pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt || post.dek,
            url: absolute(`/${lang}/blog/${post.slug}`),
            mainEntityOfPage: absolute(`/${lang}/blog/${post.slug}`),
            ...(post.published ? { datePublished: post.published } : {}),
            ...(post.cover ? { image: absolute(post.cover) } : {}),
            articleSection: post.category,
            inLanguage: lang,
            author: personJsonLd(lang),
          }),
        }}
      />
      {/* Top line */}
      <div className="flex w-full items-center justify-between gap-16 pb-12">
        <Link href={`/${lang}/blog`} className="type-eyebrow py-12 whitespace-pre text-brand hover:text-brand-hover">
          {copy.back}
        </Link>
        <p className="type-eyebrow truncate text-right whitespace-pre text-muted">{copy.masthead}</p>
      </div>
      <Rule />

      {/* Masthead */}
      <header className="flex w-full flex-col items-start gap-16 py-24 tablet:py-32">
        <p className="type-eyebrow flex flex-wrap items-center gap-x-12 gap-y-8 whitespace-pre text-secondary">
          {SAMPLE_BLOG && <span className="rounded-full bg-status-warning-subtle px-10 py-2 text-primary">{copy.sample}</span>}
          <span>{post.category}</span>
          <span className="text-accent-green">{tr(lang, "units").minRead(post.minutes)}</span>
        </p>
        <h1 className="type-large-metric tablet:type-display w-full whitespace-pre-line text-primary">{post.displayTitle ?? post.title}</h1>
        <p className="type-body w-full max-w-680 text-secondary">{post.dek}</p>
        <p className="type-eyebrow whitespace-pre-wrap text-brand">
          {copy.byline}
          {post.published && `   /   ${date(post.published, lang).toUpperCase()}`}
        </p>
      </header>

      {/* Cover */}
      <div className="relative h-220 w-full shrink-0 overflow-clip rounded-card bg-surface-secondary tablet:h-360 desktop:h-420">
        <PostArt post={post} shape="wide" fit="cover" />
      </div>

      {/* Body */}
      <div className="mx-auto flex w-full max-w-680 flex-col items-start gap-24 py-32 tablet:py-48">
        <TextReader title={post.title} text={spoken} lang={lang} labels={copy.reader} bordered />
        {post.body ? (
          <Blocks blocks={post.body} />
        ) : (
          <>
            <p className="type-body w-full text-secondary">{post.excerpt}</p>
            <p className="type-caption w-full rounded-lg bg-surface-secondary px-16 py-12 text-muted">{copy.comingSoon}</p>
          </>
        )}
      </div>

      {/* Next post */}
      {next && (
        <>
          <Rule />
          <Link href={`/${lang}/blog/${next.slug}`} className="group/next flex w-full items-center gap-16 py-24 tablet:py-32">
            <span className="flex min-w-0 flex-1 flex-col gap-8">
              <span className="type-eyebrow text-brand">{copy.next}</span>
              <span className="type-page-title tablet:type-section-heading truncate text-primary">{next.title}</span>
              <span className="type-caption truncate text-secondary">{next.dek}</span>
            </span>
            <span className="flex size-48 shrink-0 items-center justify-center rounded-full bg-brand text-on-brand transition-transform duration-(--duration-fast) group-hover/next:translate-x-4">
              <ArrowRightIcon />
            </span>
          </Link>
        </>
      )}
    </article>
  );
}
