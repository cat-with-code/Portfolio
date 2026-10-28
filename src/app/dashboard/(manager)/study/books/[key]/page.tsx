import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BookEditor } from "@/components/dashboard/study-editors";
import { books } from "@/content/books";

export function generateStaticParams() {
  return [{ key: "new" }, ...books.map((b) => ({ key: b.key }))];
}

export async function generateMetadata({ params }: { params: Promise<{ key: string }> }): Promise<Metadata> {
  const { key } = await params;
  return { title: books.find((b) => b.key === key)?.title ?? "New book" };
}

/** Dashboard / Book editor (Figma Desktop 1412:11494). */
export default async function BookEditorPage({ params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  if (key === "new")
    return <BookEditor isNew book={{ key: "new", title: "", author: "", topic: "", teaser: "", tint: "bg-accent-green-subtle", brief: { bigIdea: "", ideas: ["", "", ""], sentence: "", question: "" } }} />;
  const book = books.find((b) => b.key === key);
  if (!book) notFound();
  return <BookEditor key={key} book={book} />;
}
