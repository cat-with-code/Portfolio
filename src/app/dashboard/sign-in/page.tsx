import type { Metadata } from "next";
import { Suspense } from "react";
import { SignInForm } from "@/components/dashboard/sign-in-form";

export const metadata: Metadata = { title: "Sign in" };

/** Dashboard / Sign in: on its own, without the sidebar shell. */
export default function SignInPage() {
  return (
    <main className="flex min-h-dvh items-center justify-center bg-surface-secondary px-(--layout-gutter) py-48">
      <Suspense>
        <SignInForm />
      </Suspense>
    </main>
  );
}
