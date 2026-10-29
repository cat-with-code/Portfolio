import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CaseStudy } from "@/components/projects/case-study";
import { getSiteContent } from "@/lib/site-content";
import { getLocale } from "@/i18n/dictionaries";
import { absolute, jsonLd, pageMetadata, personJsonLd } from "@/lib/seo";

export async function generateStaticParams() {
  return (await getSiteContent()).caseStudies.map((study) => ({ slug: study.key }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const lang = await getLocale();
  const { caseStudies, projects } = await getSiteContent(lang);
  const study = caseStudies.find((s) => s.key === slug);
  if (!study) return {};
  const card = projects.find((p) => p.key === slug);
  return pageMetadata({ lang, path: `/projects/${slug}`, title: study.title, description: study.summary || card?.description || study.overview.lead, image: card?.coverImage });
}

/** Project details (Figma Desktop 1108:92447 · Tablet 1109:73500 · Mobile 1109:95062, one per project). */
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const lang = await getLocale();
  const { caseStudies, projects } = await getSiteContent(lang);
  const index = caseStudies.findIndex((s) => s.key === slug);
  const study = caseStudies[index];
  if (!study) notFound();
  const next = caseStudies[(index + 1) % caseStudies.length];
  const image = projects.find((p) => p.key === slug)?.coverImage;
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap) pb-32">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@type": "CreativeWork",
            name: study.title,
            description: study.summary,
            url: absolute(`/${lang}/projects/${study.key}`),
            ...(image ? { image: absolute(image) } : {}),
            genre: study.eyebrow,
            inLanguage: lang,
            author: personJsonLd(lang),
          }),
        }}
      />
      <CaseStudy lang={lang} study={study} next={next} image={image} />
      <div aria-hidden className="h-24 w-full shrink-0" />
    </div>
  );
}
