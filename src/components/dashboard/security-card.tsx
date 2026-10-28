"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { confirmAuthenticator, removeFactor, startAuthenticator } from "@/app/dashboard/auth-actions";
import { LockIcon } from "@/components/icons";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fieldControl, fieldInput, FieldShell } from "@/components/ui/field";
import { securityCopy as c } from "@/content/dashboard";
import { SaveNote } from "./editor";
import { Modal } from "./modal";

export type Factor = { id: string; added: string };

const day = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });

/** Settings / Sign-in security: the authenticator app (second sign-in step) — set up with a QR code, or turn off. */
export function SecurityCard({ app }: { app: Factor | null }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [setup, setSetup] = useState<{ factorId: string; qr: string; secret: string } | null>(null);
  const [code, setCode] = useState("");
  const [removing, setRemoving] = useState(false);

  const run = async (fn: () => Promise<string | null>) => {
    setBusy(true);
    setError(null);
    const problem = await fn();
    setBusy(false);
    if (problem) setError(problem);
    else router.refresh();
  };

  return (
    <section className="flex w-full flex-col gap-16 rounded-card border border-general-default bg-surface-primary p-24">
      <div className="flex flex-col gap-4">
        <h2 className="type-subheading text-primary">{c.title}</h2>
        <p className="type-body text-secondary">{app ? c.on : c.off}</p>
      </div>
      {error && <SaveNote tone="error">{error}</SaveNote>}

      <div className="flex w-full flex-col gap-12 border-t border-general-default pt-16">
        <div className="flex flex-col gap-12 tablet:flex-row tablet:items-center">
          <span className="flex size-40 shrink-0 items-center justify-center rounded-lg bg-surface-secondary text-icon-general-primary">
            <LockIcon className="size-20" />
          </span>
          <div className="flex min-w-0 flex-1 flex-col gap-4">
            <p className="type-card-title text-primary">{c.app.title}</p>
            <p className="type-body text-secondary">{app ? c.app.since(day(app.added)) : c.app.body}</p>
          </div>
          {app ? (
            <div className="flex items-center gap-8">
              <Badge tone="success">{c.app.on}</Badge>
              <Button variant="ghost" size="small" disabled={busy} onClick={() => setRemoving(true)}>
                {c.remove}
              </Button>
            </div>
          ) : (
            !setup && (
              <Button
                variant="secondary"
                size="small"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    const r = await startAuthenticator();
                    if (!r.ok) return r.error;
                    setSetup(r);
                    setCode("");
                    return null;
                  })
                }
              >
                {c.app.setUp}
              </Button>
            )
          )}
        </div>

        {setup && (
          <div className="flex flex-col gap-16 rounded-lg bg-surface-secondary p-16 tablet:flex-row">
            {/* eslint-disable-next-line @next/next/no-img-element -- QR code from Supabase as an SVG data URL */}
            <img src={setup.qr} alt="QR code for your authenticator app" className="size-160 shrink-0 rounded-lg bg-white p-8" />
            <div className="flex min-w-0 flex-1 flex-col gap-12">
              <p className="type-body text-primary">{c.app.scan}</p>
              <p className="type-caption text-secondary">
                {c.app.manual} <code className="break-all text-primary select-all">{setup.secret}</code>
              </p>
              <FieldShell id="totp-code" label={c.app.code} className="w-full max-w-240">
                <div className={`${fieldControl()} h-44 rounded-shell bg-surface-primary px-12 py-8`}>
                  <input id="totp-code" value={code} onChange={(e) => setCode(e.target.value)} inputMode="numeric" autoComplete="one-time-code" maxLength={7} className={`${fieldInput} tracking-[4px]`} />
                </div>
              </FieldShell>
              <div className="flex gap-8">
                <Button
                  size="small"
                  disabled={busy || code.replace(/\s/g, "").length !== 6}
                  onClick={() =>
                    run(async () => {
                      const r = await confirmAuthenticator(setup.factorId, code);
                      if (!r.ok) return r.error;
                      setSetup(null);
                      return null;
                    })
                  }
                >
                  {c.app.confirm}
                </Button>
                <Button variant="ghost" size="small" disabled={busy} onClick={() => setSetup(null)}>
                  {c.app.cancel}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      <Modal
        open={removing}
        onOpenChange={setRemoving}
        title={c.confirmOff.title}
        description={c.confirmOff.body}
        action={c.remove}
        tone="danger"
        onAction={() => {
          setRemoving(false);
          if (app)
            void run(async () => {
              const r = await removeFactor(app.id);
              return r.ok ? null : r.error;
            });
        }}
      />
    </section>
  );
}
