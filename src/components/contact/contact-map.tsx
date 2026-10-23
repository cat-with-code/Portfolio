import { ArrowUpRightIcon } from "@/components/icons";
import { map } from "@/content/contact";

/*
 * Contact / Map (Figma 1132:2684 — Layout Desktop 1078×320 · Tablet 902×300 · Mobile 356×320).
 * Every shape sits at the same fraction of the map's width and height in all three layouts, so each one is
 * an absolutely positioned SVG with % geometry; strokes keep their Figma widths via non-scaling-stroke.
 * Mobile only changes stroke widths, the street-grid spacing, and where the pin and location card sit.
 */

type Line = { box: string; d: string; width: string; color: "road" | "river" };

// Boxes are [left, top, width, height] in % of the map (or px offsets where Figma overhangs the edge).
// Paths are in a 0–1 box, normalised from the desktop vectors.
const lines: Line[] = [
  { box: "left-[44%] -top-10 w-[3%] h-[calc(100%+20px)]", d: "M0 0L1 1", width: "[--w:5px] tablet:[--w:7px]", color: "road" },
  { box: "-left-10 top-[38%] w-[calc(62%+10px)] h-[4%]", d: "M0 1L1 0", width: "[--w:5px] tablet:[--w:7px]", color: "road" },
  { box: "left-[5%] top-[44%] w-[45%] h-[calc(56%+10px)]", d: "M0 1L1 0", width: "[--w:4px] tablet:[--w:6px]", color: "road" },
  { box: "left-[67.468%] -top-20 w-[6.532%] h-[calc(48%+20px)]", d: "M1 0C0.3876 0.447 -0.2252 0.6682 0.0814 1", width: "[--w:18px] tablet:[--w:30px]", color: "river" },
  { box: "left-[68%] top-[12%] w-[calc(32%+20px)] h-[80%]", d: "M1 0C0.5317 0.225 0.1772 0.35 0 0.45C0.2954 0.625 0.6498 0.825 1 1", width: "[--w:23.4px] tablet:[--w:39px]", color: "river" },
  { box: "left-[56%] top-[48%] w-[12%] h-[calc(52%+20px)]", d: "M1 0C0.5 0.309 0.3333 0.5837 0 1", width: "[--w:14.4px] tablet:[--w:24px]", color: "river" },
];

const parks = ["left-[18%] top-[18%] w-[12%] h-[16%]", "left-[38%] top-[66%] w-[10%] h-[14%]", "left-[8%] top-[60%] w-[14%] h-[20%]", "left-[54%] top-[12%] w-[8%] h-[12%]"];

function StreetGrid() {
  // Street grid: 2px lines every 64×44 (Mobile 46×34), in a frame 140%×160% of the map rotated 8° about its top-left.
  return (
    <div className="absolute -top-[30%] -left-[20%] h-[160%] w-[140%] origin-top-left rotate-8">
      <svg className="absolute inset-0 size-full overflow-visible" aria-hidden>
        <defs>
          {[
            ["map-grid-sm", 46, 34],
            ["map-grid-lg", 64, 44],
          ].map(([id, w, h]) => (
            <pattern key={id} id={id as string} width={w} height={h} patternUnits="userSpaceOnUse">
              <g className="fill-[var(--color-bg-surface-primary)]">
                <rect width="1" height={h} />
                <rect x={(w as number) - 1} width="1" height={h} />
                <rect width={w} height="1" />
                <rect y={(h as number) - 1} width={w} height="1" />
              </g>
            </pattern>
          ))}
        </defs>
        <rect width="100%" height="100%" className="fill-[url(#map-grid-sm)] tablet:fill-[url(#map-grid-lg)]" />
      </svg>
    </div>
  );
}

export function ContactMap() {
  return (
    <section aria-label={map.title} className="relative h-320 w-full shrink-0 overflow-clip rounded-card border border-general-default bg-surface-subtle tablet:h-300 desktop:h-320">
      {/* Map art — Figma places it at inset −1 so its geometry is measured from the outer edge. */}
      <div className="absolute -inset-1" aria-hidden>
        {parks.map((p) => (
          <span key={p} className={`absolute rounded-[10px] bg-accent-green-subtle ${p}`} />
        ))}
        <StreetGrid />
        {lines.map((l) => (
          <svg key={l.d} viewBox="0 0 1 1" preserveAspectRatio="none" className={`absolute overflow-visible ${l.box} ${l.width}`}>
            <path
              d={l.d}
              fill="none"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              strokeLinejoin="round"
              className={l.color === "road" ? "stroke-[var(--color-bg-surface-primary)]" : "stroke-[var(--color-bg-accent-blue-subtle)]"}
              style={{ strokeWidth: "var(--w)" }}
            />
          </svg>
        ))}

        {/* Pin: 64 pulse at 18%, 26 ring, 16 dot — centred, 42% down (Mobile 30%). */}
        <span className="absolute top-[30%] left-1/2 size-64 -translate-1/2 tablet:top-[42%]">
          <span className="absolute inset-0 rounded-full bg-brand opacity-[0.18]" />
          <span className="absolute inset-19 rounded-full bg-surface-primary" />
          <span className="absolute inset-24 rounded-full bg-brand" />
        </span>
        <span className="absolute top-[30%] left-[calc(50%+71.5px)] -translate-1/2 rounded-full bg-surface-primary px-12 py-4 shadow-card tablet:top-[42%]">
          <span className="type-label whitespace-nowrap text-primary">{map.pin}</span>
        </span>
      </div>

      {/* Location card */}
      <div className="absolute right-11 bottom-11 left-11 flex flex-col items-start gap-4 rounded-lg bg-surface-primary p-16 shadow-card tablet:right-auto tablet:bottom-19 tablet:left-19">
        <p className="type-table-heading whitespace-nowrap text-brand">{map.eyebrow}</p>
        <p className="type-card-title whitespace-nowrap text-primary">{map.title}</p>
        <p className="type-caption whitespace-pre text-muted">{map.zone}</p>
        <span className="h-4" />
        <a
          href={map.href}
          target="_blank"
          rel="noreferrer"
          className="flex items-center gap-8 rounded-shell bg-brand px-16 py-8 text-on-brand transition-colors duration-(--duration-fast) hover:bg-brand-hover"
        >
          <span className="type-label whitespace-nowrap">{map.open}</span>
          {/* Figma: a 20px Arrow Up Right frame inside a 14px slot (it overhangs into the padding). */}
          <span className="relative size-14 shrink-0">
            <ArrowUpRightIcon className="absolute top-0 left-0 size-20" />
          </span>
        </a>
      </div>
    </section>
  );
}
