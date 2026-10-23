import type { ComponentType, SVGProps } from "react";
import { TopicBooksSquareArt } from "@/components/illustrations/topic-books-square";
import { TopicBooksWideArt } from "@/components/illustrations/topic-books-wide";
import { TopicBooksWide478Art } from "@/components/illustrations/topic-books-wide-478";
import { TopicBooksWide507Art } from "@/components/illustrations/topic-books-wide-507";
import { TopicCultureSquareArt } from "@/components/illustrations/topic-culture-square";
import { TopicCultureWideArt } from "@/components/illustrations/topic-culture-wide";
import { TopicCultureWide478Art } from "@/components/illustrations/topic-culture-wide-478";
import { TopicCultureWide507Art } from "@/components/illustrations/topic-culture-wide-507";
import { TopicFictionSquareArt } from "@/components/illustrations/topic-fiction-square";
import { TopicFictionWideArt } from "@/components/illustrations/topic-fiction-wide";
import { TopicFictionWide478Art } from "@/components/illustrations/topic-fiction-wide-478";
import { TopicFictionWide507Art } from "@/components/illustrations/topic-fiction-wide-507";
import { TopicNotesSquareArt } from "@/components/illustrations/topic-notes-square";
import { TopicNotesWideArt } from "@/components/illustrations/topic-notes-wide";
import { TopicNotesWide478Art } from "@/components/illustrations/topic-notes-wide-478";
import { TopicNotesWide507Art } from "@/components/illustrations/topic-notes-wide-507";
import { TopicTechnologySquareArt } from "@/components/illustrations/topic-technology-square";
import { TopicTechnologyWideArt } from "@/components/illustrations/topic-technology-wide";
import { TopicTechnologyWide478Art } from "@/components/illustrations/topic-technology-wide-478";
import { TopicTechnologyWide507Art } from "@/components/illustrations/topic-technology-wide-507";

export type TopicKey = "technology" | "books" | "fiction" | "notes" | "culture";
/**
 * Blog / Topic art (Figma 1073:91155–9): Square 300×300, Wide 320×200. The Wide art stretches
 * non-uniformly in the Wide post card (507×242) and the tablet cover story (478×200), so those
 * two sizes are exported as their own layouts.
 */
export type TopicShape = "square" | "wide" | "wide-507" | "wide-478";

type Art = ComponentType<SVGProps<SVGSVGElement>>;
const arts: Record<TopicKey, Record<TopicShape, Art>> = {
  technology: { square: TopicTechnologySquareArt, wide: TopicTechnologyWideArt, "wide-507": TopicTechnologyWide507Art, "wide-478": TopicTechnologyWide478Art },
  books: { square: TopicBooksSquareArt, wide: TopicBooksWideArt, "wide-507": TopicBooksWide507Art, "wide-478": TopicBooksWide478Art },
  fiction: { square: TopicFictionSquareArt, wide: TopicFictionWideArt, "wide-507": TopicFictionWide507Art, "wide-478": TopicFictionWide478Art },
  notes: { square: TopicNotesSquareArt, wide: TopicNotesWideArt, "wide-507": TopicNotesWide507Art, "wide-478": TopicNotesWide478Art },
  culture: { square: TopicCultureSquareArt, wide: TopicCultureWideArt, "wide-507": TopicCultureWide507Art, "wide-478": TopicCultureWide478Art },
};

/**
 * Fills its box: "stretch" draws the art to the box like a resized Figma instance;
 * "cover" keeps the art's proportions and crops it (the article preview banner).
 */
export function TopicArt({ topic, shape, fit = "stretch", className = "" }: { topic: TopicKey; shape: TopicShape; fit?: "stretch" | "cover"; className?: string }) {
  const Art = arts[topic][shape];
  return <Art aria-hidden preserveAspectRatio={fit === "cover" ? "xMidYMid slice" : "none"} width="100%" height="100%" className={`block ${className}`} />;
}
