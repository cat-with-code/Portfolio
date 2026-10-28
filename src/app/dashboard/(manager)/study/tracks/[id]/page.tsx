import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackEditor } from "@/components/dashboard/study-editors";
import type { SiteContent } from "@/components/content/site-content";
import { vibes, type Vibe } from "@/content/study";
import { getSiteContent, requireOwnerContent } from "@/lib/site-content";

export const metadata: Metadata = { title: "Track" };

/** Pre-builds "new" and the published tracks (as <vibe>-<index>); other ids render on request. */
export async function generateStaticParams() {
  const content = await getSiteContent();
  return [{ id: "new" }, ...vibes.flatMap((v) => content.tracks[v.key].map((_, i) => ({ id: `${v.key}-${i}` })))];
}

/** A track by its database id (or an old "<vibe>-<index>" link): its vibe, position and id. */
function find(content: SiteContent, id: string): { vibe: Vibe; index: number; id: string } | null {
  for (const v of vibes) {
    const ids = content.trackIds?.[v.key] ?? [];
    const i = ids.indexOf(id);
    if (i >= 0) return { vibe: v.key, index: i, id };
  }
  const m = id.match(/^([a-z]+)-(\d+)$/);
  const vibe = m?.[1] as Vibe | undefined;
  const dbId = vibe ? content.trackIds?.[vibe]?.[Number(m![2])] : undefined;
  return vibe && dbId ? { vibe, index: Number(m![2]), id: dbId } : null;
}

/** Dashboard / Track editor (Figma Desktop 1412:6698). */
export default async function TrackEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") return <TrackEditor vibe="lofi" track={["", ""]} />;
  const content = await requireOwnerContent();
  const at = find(content, id);
  if (!at) notFound();
  return <TrackEditor key={at.id} id={at.id} vibe={at.vibe} track={content.tracks[at.vibe][at.index]} />;
}
