import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { InboxList, type Message } from "@/components/dashboard/inbox-list";
import { SectionHeading } from "@/components/ui/section-heading";
import { inboxCopy as c } from "@/content/dashboard";
import { getOwner } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Inbox" };

/** Dashboard / Inbox (Figma Desktop 1346:2164 · content 1363:3172): messages from the contact page, read as the owner. */
export default async function InboxPage() {
  const owner = await getOwner();
  if (!owner) redirect("/dashboard/sign-in");
  const { data, error } = await owner.supabase
    .from("messages")
    .select("id,name,email,message,choices,read,archived,created_at")
    .order("created_at", { ascending: false })
    .limit(500);
  if (error) throw new Error("Couldn't load messages");
  return (
    <div className="flex w-full flex-col items-start gap-(--layout-gap)">
      <SectionHeading title={c.title} description={c.description} />
      <InboxList messages={(data ?? []) as Message[]} />
    </div>
  );
}
