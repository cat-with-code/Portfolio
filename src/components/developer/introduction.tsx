import { IdentityArt } from "@/components/illustrations/identity";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { developer } from "@/content/developer";

/**
 * Portfolio / Identity art tile (Figma 867:2031 inside Introduction 86:30).
 * Mobile shows it at 308px; Tablet/Desktop scale the tile to 280 (×0.909), memoji and badge included.
 */
function IdentityTile({ badge }: { badge: string }) {
  return (
    <div className="relative aspect-square w-full max-w-360 shrink-0 tablet:size-280" role="img" aria-label="Illustration: Dareach’s memoji on a design canvas with code and colour swatches">
      <IdentityArt className="absolute inset-0 size-full" />
      {/* Reach avatar: 94.5px circle at (92.7, 74.5) within the 280 tile */}
      <div className="absolute top-[26.62%] left-[33.12%] size-[33.76%] overflow-clip rounded-full bg-brand">
        <Image src="/images/memoji.png" alt="" width={512} height={512} className="absolute top-1/2 left-1/2 h-[125%] w-[106.25%] max-w-none -translate-1/2 object-cover" />
      </div>
      <div className="absolute bottom-[6.494%] left-1/2 origin-bottom -translate-x-1/2 tablet:scale-[0.909]">
        <Badge>{badge}</Badge>
      </div>
    </div>
  );
}

/**
 * Portfolio / Introduction (Figma 86:30) — Layout=Wide on Tablet/Desktop, Stacked on Mobile.
 * The Developer page uses its own copy; the dashboard's Welcome widget (1388:4770) passes its own.
 */
export function Introduction({
  eyebrow = developer.intro.eyebrow,
  title = developer.intro.title,
  body = developer.intro.body,
  badge = developer.intro.badge,
}: {
  eyebrow?: string;
  title?: readonly string[];
  body?: readonly string[];
  badge?: string;
}) {
  return (
    <section className="flex w-full flex-col items-center gap-24 overflow-clip rounded-card border border-general-default bg-surface-primary p-24 shadow-card tablet:flex-row tablet:items-center tablet:gap-32 tablet:p-32">
      <div className="flex w-full min-w-0 flex-col items-start gap-12 overflow-clip tablet:w-auto tablet:flex-1">
        <p className="type-table-heading whitespace-nowrap text-brand">{eyebrow}</p>
        <h2 className="type-page-title text-primary tablet:type-large-metric">
          {title.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </h2>
        <p className="type-body text-muted">
          {body.map((line) => (
            <span key={line} className="block">
              {line}
            </span>
          ))}
        </p>
      </div>
      <IdentityTile badge={badge} />
    </section>
  );
}
