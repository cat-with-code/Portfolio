"use client";

import { useSearchParams } from "next/navigation";
import { useActionState } from "react";
import { signOut, verifyCode, type SignInState } from "@/app/dashboard/auth-actions";
import { SignatureLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { fieldControl, fieldInput, FieldShell } from "@/components/ui/field";
import { verifyCopy as c } from "@/content/dashboard";

/** Dashboard / Verify: the 6-digit code from the authenticator app, after the password. */
export function VerifyForm() {
  const next = useSearchParams().get("next") ?? "";
  const [state, action, pending] = useActionState<SignInState, FormData>(verifyCode, undefined);
  return (
    <div className="flex w-full max-w-332 flex-col gap-16 rounded-card border border-general-default bg-surface-primary p-24">
      <SignatureLogo className="h-28 w-[76px] overflow-visible" />
      <div className="flex flex-col gap-4 pt-8">
        <h1 className="type-subheading text-primary">{c.title}</h1>
        <p className="type-body text-secondary">{c.body}</p>
      </div>
      <form action={action} className="flex flex-col gap-16">
        <input type="hidden" name="next" value={next} />
        <FieldShell id="verify-code" label={c.code} error={state?.error} className="w-full">
          <div className={`${fieldControl(!!state?.error)} h-44 rounded-shell px-12 py-8`}>
            <input id="verify-code" name="code" inputMode="numeric" autoComplete="one-time-code" pattern="[0-9 ]{6,7}" maxLength={7} required autoFocus className={`${fieldInput} tracking-[4px]`} />
          </div>
        </FieldShell>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? c.codePending : c.codeSubmit}
        </Button>
      </form>
      <form action={signOut} className="flex justify-end">
        <button type="submit" className="type-label cursor-pointer text-secondary">
          {c.signOut}
        </button>
      </form>
    </div>
  );
}
