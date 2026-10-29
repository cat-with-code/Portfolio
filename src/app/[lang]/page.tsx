import type { Metadata } from "next";
import { AiLab } from "@/components/developer/ai-lab";
import { ApproachButton } from "@/components/developer/approach-drawer";
import { FeaturedProjects } from "@/components/developer/featured-projects";
import { Introduction } from "@/components/developer/introduction";
import { Skills } from "@/components/developer/skills";
import { TryItCard } from "@/components/developer/try-it-card";
import { SectionHeading } from "@/components/ui/section-heading";
import { getLocale } from "@/i18n/dictionaries";
import { absolute, jsonLd, pageMetadata, personJsonLd, sectionMeta, siteName } from "@/lib/seo";
import { tr } from "@/i18n/content";

export async function generateMetadata(): Promise<Metadata> {
  const lang = await getLocale();
  return pageMetadata({ lang, path: "", ...sectionMeta(lang, "home") });
}

/** Developer — Featured work + AI Lab (Figma Desktop 694:23284 · Tablet 696:38432 · Mobile 696:45094). Home page. */
export default async function DeveloperPage() {
  const lang = await getLocale();
  const developer = tr(lang, "developer");
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap) pb-32">
      {/* Who this site is about, for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: jsonLd({
            "@graph": [
              personJsonLd(lang),
              { "@type": "WebSite", "@id": absolute("/#website"), name: siteName, url: absolute(`/${lang}`), inLanguage: lang, author: { "@id": absolute("/#person") } },
            ],
          }),
        }}
      />
      <SectionHeading title={developer.heading.title} description={developer.heading.description} action={<ApproachButton />} />
      <Introduction eyebrow={developer.intro.eyebrow} title={developer.intro.title} body={developer.intro.body} badge={developer.intro.badge} />
      <Skills />
      {/* Work and exploration */}
      <div className="flex w-full flex-col items-stretch gap-16 tablet:gap-24 desktop:flex-row">
        <FeaturedProjects lang={lang} />
        {/* Study and Game */}
        <div className="flex shrink-0 flex-col gap-16 tablet:flex-row desktop:w-360 desktop:flex-col">
          {developer.tryIt.map((item) => (
            <TryItCard key={item.key} lang={lang} item={item} chip={developer.tryItChip} />
          ))}
        </div>
      </div>
      <AiLab />
    </div>
  );
}
