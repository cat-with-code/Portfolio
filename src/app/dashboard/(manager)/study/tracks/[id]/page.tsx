import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TrackEditor } from "@/components/dashboard/study-editors";
import { tracks, vibes, type Vibe } from "@/content/study";

/** Track ids are "<vibe>-<index>", e.g. "lofi-0"; "new" starts a blank Lofi track. */
const parse = (id: string): [Vibe, number] | null => {
  const m = id.match(/^([a-z]+)-(\d+)$/);
  return m && m[1] in tracks && tracks[m[1] as Vibe][+m[2]] ? [m[1] as Vibe, +m[2]] : null;
};

export function generateStaticParams() {
  return [{ id: "new" }, ...vibes.flatMap((v) => tracks[v.key].map((_, i) => ({ id: `${v.key}-${i}` })))];
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const at = parse((await params).id);
  return { title: at ? tracks[at[0]][at[1]][0] : "New track" };
}

/** Dashboard / Track editor (Figma Desktop 1412:6698). */
export default async function TrackEditorPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (id === "new") return <TrackEditor vibe="lofi" track={["", ""]} isNew />;
  const at = parse(id);
  if (!at) notFound();
  return <TrackEditor key={id} vibe={at[0]} track={tracks[at[0]][at[1]]} />;
}
