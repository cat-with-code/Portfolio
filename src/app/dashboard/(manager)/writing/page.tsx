import type { Metadata } from "next";
import { ContentList } from "@/components/dashboard/content-list";
import { BlogIcon, PlusIcon } from "@/components/icons";
import { ButtonLink } from "@/components/ui/button";
import { SectionHeading } from "@/components/ui/section-heading";
import { writingCopy as c } from "@/content/dashboard";
import { getPosts } from "@/lib/content";

export const metadata: Metadata = { title: "Writing" };

const sentence = (s: string) => s.charAt(0) + s.slice(1).toLowerCase();

/** Dashboard / Writing (Figma Desktop 1346:2160 · content 1363:2612). */
export default async function WritingPage() {
  const rows = (await getPosts()).map((p) => ({
    key: p.slug,
    title: p.title,
    meta: sentence(p.category),
    info: `${p.minutes} min read`,
    status: "draft" as const,
    href: `/dashboard/writing/${p.slug}`,
  }));
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <SectionHeading
        title={c.title}
        description={c.description}
        action={
          <ButtonLink href="/dashboard/writing/new" size="small" icon={<PlusIcon className="size-20" />}>
            {c.add}
          </ButtonLink>
        }
      />
      <ContentList rows={rows} icon={<BlogIcon className="size-24" />} noun={c.noun} />
    </div>
  );
}
