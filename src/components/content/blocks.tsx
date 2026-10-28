import type { Block } from "@/content/blocks";

/** Type per size: "page" for the post / project pages, "compact" for the post preview drawer (Figma 694:19920). */
const styles = {
  page: {
    gap: "gap-20",
    paragraph: "type-body text-secondary",
    heading: "type-page-title pt-12 text-primary",
    quote: "type-subheading",
    list: "type-body",
  },
  compact: {
    gap: "gap-14",
    paragraph: "text-[13px] leading-[22px] text-secondary",
    heading: "text-[19px] leading-[28px] font-semibold text-primary",
    quote: "type-subheading",
    list: "type-ui",
  },
};

/** Renders post / project content blocks (see content/blocks). */
export function Blocks({ blocks, size = "page" }: { blocks: Block[]; size?: keyof typeof styles }) {
  const s = styles[size];
  return (
    <div className={`flex w-full flex-col items-start ${s.gap}`}>
      {blocks.map((b, i) => {
        switch (b.type) {
          case "paragraph":
            return (
              <p key={i} className={`w-full whitespace-pre-line ${s.paragraph}`}>
                {b.text}
              </p>
            );
          case "heading":
            return (
              <h2 key={i} className={`w-full ${s.heading}`}>
                {b.text}
              </h2>
            );
          case "quote":
            return (
              <figure key={i} className="flex w-full flex-col items-start gap-11 border-l-3 border-brand py-8 pl-20">
                {b.label && <figcaption className="type-eyebrow text-brand">{b.label}</figcaption>}
                <blockquote className={`w-full text-primary ${s.quote}`}>{b.text}</blockquote>
              </figure>
            );
          case "list":
            return b.ordered ? (
              <ol key={i} className="flex w-full flex-col gap-14">
                {b.items.map((item, n) => (
                  <li key={n} className="flex w-full items-start gap-12">
                    <span className="type-label w-38 shrink-0 text-brand tabular-nums">{String(n + 1).padStart(2, "0")}</span>
                    <span className={`min-w-0 flex-1 text-primary ${s.list}`}>{item}</span>
                  </li>
                ))}
              </ol>
            ) : (
              <ul key={i} className="flex w-full flex-col gap-10">
                {b.items.map((item, n) => (
                  <li key={n} className="flex w-full items-start gap-12">
                    <span aria-hidden className="mt-9 size-6 shrink-0 rounded-full bg-brand" />
                    <span className={`min-w-0 flex-1 text-primary ${s.list}`}>{item}</span>
                  </li>
                ))}
              </ul>
            );
          case "image":
            return (
              <figure key={i} className="flex w-full flex-col gap-8">
                {/* eslint-disable-next-line @next/next/no-img-element -- images may come from the dashboard's storage, any host */}
                <img src={b.src} alt={b.alt} loading="lazy" className="w-full rounded-card bg-surface-secondary object-cover" />
                {b.caption && <figcaption className="type-caption text-muted">{b.caption}</figcaption>}
              </figure>
            );
        }
      })}
    </div>
  );
}
