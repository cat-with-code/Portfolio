import type { Metadata } from "next";
import { MediaLibrary } from "@/components/dashboard/media-library";
import { UploadImagesButton } from "@/components/dashboard/dialogs";
import { SectionHeading } from "@/components/ui/section-heading";
import { books } from "@/content/books";
import { mediaCopy as c } from "@/content/dashboard";
import { gameOrder, games } from "@/content/games";
import { directoryProjects } from "@/content/projects";

export const metadata: Metadata = { title: "Media" };

const fileName = (src: string) => src.split("/").pop() ?? src;

/** Dashboard / Media (Figma Desktop 1346:2163 · content 1363:3034): every image the site uses, grouped by where it appears. */
export default function MediaPage() {
  const groups = {
    projects: directoryProjects.map((p) => ({ src: p.cover, name: fileName(p.cover), usedOn: p.name })),
    games: gameOrder.map((k) => ({ src: `/images/games/${k}.webp`, name: `${k}.webp`, usedOn: games[k].title, tint: games[k].tint })),
    books: books.map((b) => ({ src: `/images/books/${b.key}.jpg`, name: `${b.key}.jpg`, usedOn: b.title, tint: b.tint })),
  };
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <SectionHeading
        title={c.title}
        description={c.description}
        action={<UploadImagesButton label={c.upload} />}
      />
      <MediaLibrary groups={groups} />
    </div>
  );
}
