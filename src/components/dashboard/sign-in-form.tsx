"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signIn, type SignInState } from "@/app/dashboard/auth-actions";
import { SignatureLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { fieldControl, fieldInput, FieldShell } from "@/components/ui/field";
import { signInCopy as c } from "@/content/dashboard";

/** Dashboard / Sign in (Figma Desktop 1371:4346): your Supabase account. Only the owner account gets in. */
export function SignInForm() {
  const params = useSearchParams();
  const next = params.get("next") ?? "";
  const reason = params.get("reason");
  const ended = reason === "idle" || reason === "max" ? c.ended[reason] : null;
  const [state, action, pending] = useActionState<SignInState, FormData>(signIn, undefined);
  return (
    <form action={action} className="flex w-full max-w-332 flex-col gap-16 rounded-card border border-general-default bg-surface-primary p-24">
      <SignatureLogo className="h-28 w-[76px] overflow-visible" />
      <div className="flex flex-col gap-4 pt-8">
        <h1 className="type-subheading text-primary">{c.title}</h1>
        <p className="type-body text-secondary">{c.body}</p>
      </div>
      {ended && !state?.error && <p className="type-caption rounded-lg bg-surface-secondary px-12 py-8 text-secondary">{ended}</p>}
      <input type="hidden" name="next" value={next} />
      <FieldShell id="sign-in-email" label={c.email} className="w-full">
        <div className={`${fieldControl(!!state?.error)} h-44 rounded-shell px-12 py-8`}>
          <input id="sign-in-email" key={state?.email} defaultValue={state?.email} name="email" type="email" autoComplete="username" inputMode="email" required placeholder="your@email.com" className={fieldInput} />
        </div>
      </FieldShell>
      <FieldShell id="sign-in-password" label={c.password} error={state?.error} className="w-full">
        <div className={`${fieldControl(!!state?.error)} h-44 rounded-shell px-12 py-8`}>
          <input id="sign-in-password" name="password" type="password" autoComplete="current-password" required className={fieldInput} />
        </div>
      </FieldShell>
      <Button type="submit" className="w-full" disabled={pending}>
        {pending ? c.pending : c.submit}
      </Button>
    </form>
  );
}
