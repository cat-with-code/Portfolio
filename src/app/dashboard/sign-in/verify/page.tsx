import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { VerifyForm } from "@/components/dashboard/verify-form";
import { getOwnerSession } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Verify it’s you" };

/** Second sign-in step: the authenticator app code (only for the owner, after the password). */
async function Verify() {
  const session = await getOwnerSession();
  if (!session) redirect("/dashboard/sign-in");
  if (!session.needsCode) redirect("/dashboard");
  return <VerifyForm />;
}

export default function VerifyPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-secondary px-(--layout-gutter) py-48">
      <Suspense>
        <Verify />
      </Suspense>
    </main>
  );
}
