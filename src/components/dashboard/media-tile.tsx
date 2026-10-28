/**
 * Dashboard / Media tile (Figma 1386:4758): image with a name and where it's used.
 * Wide = project covers (cropped to fill); Square = game and book art, whole, on a tinted panel.
 */
export function MediaTile({ src, title, caption, shape = "square", tint = "bg-surface-secondary" }: { src: string; title: string; caption: string; shape?: "square" | "wide"; tint?: string }) {
  return (
    <figure className="flex min-w-0 flex-col gap-12">
      {/* eslint-disable-next-line @next/next/no-img-element -- the site's own images, any size */}
      <img src={src} alt="" loading="lazy" className={`w-full rounded-card ${shape === "wide" ? "h-168 bg-surface-secondary object-cover" : `h-180 ${tint} object-contain`}`} />
      <figcaption className="flex w-full flex-col gap-4 px-4">
        <span className="type-label truncate text-primary">{title}</span>
        <span className="type-caption truncate text-secondary">{caption}</span>
      </figcaption>
    </figure>
  );
}
