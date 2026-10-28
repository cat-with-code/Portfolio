import type { Metadata } from "next";
import { AddStudyItemButton } from "@/components/dashboard/dialogs";
import { StudyLibrary } from "@/components/dashboard/study-library";
import { SectionHeading } from "@/components/ui/section-heading";
import { books } from "@/content/books";
import { studyCopy as c } from "@/content/dashboard";

export const metadata: Metadata = { title: "Study library" };

/** Dashboard / Study library (Figma Desktop 1346:2161 · content 1363:2755). */
export default function StudyLibraryPage() {
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <SectionHeading
        title={c.title}
        description={c.description}
        action={<AddStudyItemButton label={c.addTrack} />}
      />
      <StudyLibrary books={books} />
    </div>
  );
}
