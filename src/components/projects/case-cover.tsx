/**
 * Case study cover art (Figma "Cover art" in Projects / Case study 1108:92445).
 * Shapes are placed in % of the 1078×675 desktop frame so they scale with the cover;
 * corner radii, strokes and type stay fixed, as they do in the Tablet and Mobile variants.
 */
import type { CSSProperties } from "react";
import type { CaseStudy } from "@/content/case-studies";

const W = 1078;
const H = 675;
/** [x, y, w, h, classes, text?] in desktop px */
type Shape = [number, number, number, number, string, string?];

const card = "rounded-lg bg-surface-primary shadow-card";
const primary = "bg-(--color-text-primary)";
const subtle = "bg-(--color-text-subtle)";
const muted = "bg-(--color-text-muted)";
const dot = "rounded-full";

const art: Record<CaseStudy["key"], { bg: string; shapes: Shape[] }> = {
  "student-club": {
    bg: "bg-accent-green-subtle",
    shapes: [
      [81.9, 81.9, 573.1, 511.7, card],
      [122.8, 122.8, 218.3, 27.3, `${primary} rounded-[4px]`],
      [122.8, 191.0, 81.9, 81.9, `${dot} bg-brand`],
      [232.0, 204.7, 245.6, 20.5, `${primary} rounded-[3px]`],
      [232.0, 238.8, 163.7, 17.1, `${subtle} rounded-[3px]`],
      [122.8, 313.8, 81.9, 81.9, `${dot} bg-accent-green`],
      [232.0, 327.5, 211.5, 20.5, `${primary} rounded-[3px]`],
      [232.0, 361.6, 163.7, 17.1, `${subtle} rounded-[3px]`],
      [122.8, 436.7, 81.9, 81.9, `${dot} bg-accent-violet`],
      [232.0, 450.3, 177.4, 20.5, `${primary} rounded-[3px]`],
      [232.0, 484.4, 163.7, 17.1, `${subtle} rounded-[3px]`],
      [600.4, 116.0, 395.7, 150.1, "rounded-[14px] bg-brand shadow-card"],
      [648.2, 163.7, 245.6, 20.5, "rounded-[3px] bg-(--color-text-on-brand)"],
      [648.2, 204.7, 163.7, 20.5, "rounded-[3px] bg-(--color-text-on-brand) opacity-70"],
      [655.0, 334.3, 341.1, 259.3, card],
      [695.9, 375.3, 81.9, 81.9, `${dot} border-2 border-(--color-bg-surface-primary) bg-accent-violet`],
      [750.5, 375.3, 81.9, 81.9, `${dot} border-2 border-(--color-bg-surface-primary) bg-accent-orange`],
      [805.1, 375.3, 81.9, 81.9, `${dot} border-2 border-(--color-bg-surface-primary) bg-accent-green`],
      [695.9, 491.2, 259.3, 61.4, "rounded-[9px] bg-brand"],
    ],
  },
  "portfolio-design-system": {
    bg: "bg-accent-violet-subtle",
    shapes: [
      [68.2, 75.1, 573.1, 184.2, card],
      [109.2, 119.4, 95.5, 95.5, `${dot} bg-brand`],
      [214.9, 119.4, 95.5, 95.5, `${dot} bg-accent-green`],
      [320.7, 119.4, 95.5, 95.5, `${dot} bg-accent-orange`],
      [426.4, 119.4, 95.5, 95.5, `${dot} bg-accent-violet`],
      [532.2, 119.4, 95.5, 95.5, `${dot} bg-accent-red`],
      [68.2, 300.2, 341.1, 300.2, card],
      [109.2, 320.7, 163.7, 150.1, "text-[36px] leading-normal font-bold text-primary", "Aa"],
      [109.2, 498.1, 238.8, 20.5, `${primary} rounded-[3px]`],
      [109.2, 539.0, 163.7, 17.1, `${muted} rounded-[3px]`],
      [450.3, 300.2, 191.0, 300.2, card],
      [484.4, 341.1, 34.1, 27.3, "rounded-[4px] bg-brand opacity-40"],
      [484.4, 402.5, 61.4, 27.3, "rounded-[4px] bg-brand opacity-60"],
      [484.4, 463.9, 88.7, 27.3, "rounded-[4px] bg-brand opacity-80"],
      [484.4, 525.4, 116.0, 27.3, "rounded-[4px] bg-brand"],
      [682.3, 75.1, 327.5, 525.4, card],
      [723.2, 122.8, 245.6, 75.1, "rounded-[11px] bg-brand"],
      [723.2, 225.2, 245.6, 75.1, "rounded-[11px] border border-general-default"],
      [723.2, 341.1, 122.8, 68.2, "rounded-[10px] bg-brand"],
      [784.6, 348.0, 54.6, 54.6, `${dot} bg-surface-primary`],
      [873.3, 341.1, 68.2, 68.2, "rounded-[5px] bg-brand"],
      [723.2, 450.3, 245.6, 75.1, "rounded-[11px] bg-brand-subtle"],
    ],
  },
  "personal-website": {
    bg: "bg-accent-blue-subtle",
    shapes: [
      [116.0, 68.2, 846.0, 545.8, card],
      [156.9, 109.2, 23.9, 23.9, `${dot} bg-accent-red`],
      [197.9, 109.2, 23.9, 23.9, `${dot} bg-accent-orange`],
      [238.8, 109.2, 23.9, 23.9, `${dot} bg-accent-green`],
      [116.0, 163.7, 846.0, 3.4, "bg-(--color-border-general-default)"],
      [170.6, 197.9, 150.1, 197.9, "text-[48px] leading-normal font-bold text-primary", "P."],
      [784.6, 218.3, 122.8, 122.8, `${dot} bg-brand-subtle`],
      [170.6, 409.4, 511.7, 27.3, `${primary} rounded-[4px]`],
      [170.6, 463.9, 668.6, 17.1, `${muted} rounded-[3px]`],
      [170.6, 504.9, 545.8, 17.1, `${muted} rounded-[3px]`],
      [429.8, 225.2, 75.1, 17.1, `${subtle} rounded-[3px]`],
      [532.2, 225.2, 75.1, 17.1, `${subtle} rounded-[3px]`],
      [634.5, 225.2, 75.1, 17.1, `${subtle} rounded-[3px]`],
      [170.6, 552.6, 218.3, 27.3, "rounded-[4px] bg-brand"],
    ],
  },
};

const pct = (v: number, of: number) => `${((v / of) * 100).toFixed(3)}%`;

export function CaseCover({ project, image }: { project: string; image?: string }) {
  // Projects without drawn art (new ones) get a plain tinted panel until a cover is uploaded.
  const { bg, shapes } = art[project as CaseStudy["key"]] ?? { bg: "bg-surface-secondary", shapes: [] };
  if (image)
    return (
      <div aria-hidden className={`relative aspect-[1078/675] w-full overflow-clip rounded-xl ${bg}`}>
        {/* eslint-disable-next-line @next/next/no-img-element -- uploaded covers may live on any host */}
        <img src={image} alt="" className="absolute inset-0 size-full object-cover" />
      </div>
    );
  return (
    <div aria-hidden className={`relative aspect-[1078/675] w-full overflow-clip rounded-xl ${bg}`}>
      {shapes.map(([x, y, w, h, cls, text], i) => {
        const style: CSSProperties = { left: pct(x, W), top: pct(y, H), width: pct(w, W), height: pct(h, H) };
        return (
          <span key={i} className={`absolute block ${cls}`} style={style}>
            {text}
          </span>
        );
      })}
    </div>
  );
}
