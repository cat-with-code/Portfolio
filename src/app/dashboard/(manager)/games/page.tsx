import type { Metadata } from "next";
import { GamesList } from "@/components/dashboard/games-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { gamesCopy as c } from "@/content/dashboard";
import { games, sections } from "@/content/games";
import { requireOwnerContent } from "@/lib/site-content";

export const metadata: Metadata = { title: "Games" };

/** Dashboard / Games (Figma Desktop 1346:2162 · content 1363:2892). Games listed by section, as on the Game Hub. */
export default async function GamesPage() {
  const { gameLinks } = await requireOwnerContent();
  const list = sections.flatMap((s) =>
    Object.values(games)
      .filter((g) => g.section === s.key)
      .map((g) => ({ key: g.key, title: g.title, section: s.title, image: `/images/games/${g.key}.webp`, linked: !!gameLinks[g.key] }))
  );
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <SectionHeading title={c.title} description={c.description} />
      <GamesList games={list} />
    </div>
  );
}
