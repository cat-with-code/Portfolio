/**
 * Rich content for blog posts and project pages, as a list of blocks. Plain data (no JSX) so the same shape can later
 * come from the dashboard / a database: each block is one row of the editor.
 */
export type Block =
  | { type: "paragraph"; text: string }
  | { type: "heading"; text: string }
  | { type: "quote"; text: string; label?: string }
  | { type: "list"; items: string[]; ordered?: boolean }
  | { type: "image"; src: string; alt: string; caption?: string };

/** Readable text of the blocks, for the "Listen" reader and word counts. */
export const blocksToText = (blocks: Block[]) =>
  blocks
    .map((b) => (b.type === "list" ? b.items.join(". ") : b.type === "image" ? (b.caption ?? "") : b.text))
    .filter(Boolean)
    .join(" ");

/** Reading time at ~200 words a minute, at least 1. */
export const readingMinutes = (blocks: Block[]) => Math.max(1, Math.round(blocksToText(blocks).split(/\s+/).length / 200));
