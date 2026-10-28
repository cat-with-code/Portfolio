"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { SignatureLogo } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { signInCopy as c } from "@/content/dashboard";
import { TextField } from "./editor";

/** Dashboard / Sign in (Figma Desktop 1371:4346). No accounts yet: any details open the dashboard. */
export function SignInForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        router.push("/dashboard");
      }}
      className="flex w-full max-w-332 flex-col gap-16 rounded-card border border-general-default bg-surface-primary p-24"
    >
      <SignatureLogo className="h-28 w-[76px] overflow-visible" />
      <div className="flex flex-col gap-4 pt-8">
        <h1 className="type-subheading text-primary">{c.title}</h1>
        <p className="type-body text-secondary">{c.body}</p>
      </div>
      <TextField label={c.email} value={email} onChange={setEmail} placeholder="your@email.com" />
      <TextField label={c.password} value={password} onChange={setPassword} type="password" />
      <Button type="submit" className="w-full">
        {c.submit}
      </Button>
      <p className="type-caption text-center text-secondary">{c.note}</p>
    </form>
  );
}
