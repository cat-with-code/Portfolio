import type { ComponentType, SVGProps } from "react";
import { CoverFocusStudioArt } from "@/components/illustrations/cover-focus-studio";
import { CoverGameHubArt } from "@/components/illustrations/cover-game-hub";
import { CoverPersonalWebsiteArt } from "@/components/illustrations/cover-personal-website";
import { CoverPortfolioDesignSystemArt } from "@/components/illustrations/cover-portfolio-design-system";
import { CoverStudentClubArt } from "@/components/illustrations/cover-student-club";

export type CoverKey = "student-club" | "portfolio-design-system" | "personal-website" | "game-hub" | "focus-studio";

/** Projects / Cover art (Figma 862:2599): background token + artwork. */
export const covers: Record<CoverKey, { Art: ComponentType<SVGProps<SVGSVGElement>>; bg: string }> = {
  "student-club": { Art: CoverStudentClubArt, bg: "bg-accent-green-subtle" },
  "portfolio-design-system": { Art: CoverPortfolioDesignSystemArt, bg: "bg-accent-violet-subtle" },
  "personal-website": { Art: CoverPersonalWebsiteArt, bg: "bg-accent-blue-subtle" },
  "game-hub": { Art: CoverGameHubArt, bg: "bg-status-warning-subtle" },
  "focus-studio": { Art: CoverFocusStudioArt, bg: "bg-accent-blue-subtle" },
};

/** Project cover (Figma 856:2239): 316:198 tile, artwork fills it edge to edge. */
export function ProjectCover({ project, image, className = "" }: { project: string; image?: string; className?: string }) {
  // Projects without drawn art (new ones) get a plain tinted tile until a cover is uploaded.
  const { Art, bg } = covers[project as CoverKey] ?? { Art: null, bg: "bg-surface-secondary" };
  return (
    <span className={`relative block aspect-[316/198] w-full shrink-0 overflow-clip rounded-xl ${bg} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element -- uploaded covers may live on any host */}
      {image ? <img src={image} alt="" className="absolute inset-0 size-full object-cover" /> : Art && <Art className="absolute inset-0 size-full" aria-hidden />}
    </span>
  );
}
