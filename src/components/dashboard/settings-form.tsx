"use client";

import { useId, useState } from "react";
import { ChevronDownIcon, MailIcon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { fieldControl, fieldInput, FieldShell } from "@/components/ui/field";
import { SectionHeading } from "@/components/ui/section-heading";
import { Switch } from "@/components/ui/switch";
import { settingsCopy as c } from "@/content/dashboard";

/** Dashboard / Settings (Figma 1363:3308): Profile fields and Preference switches, side by side from Tablet up. */
export function SettingsForm() {
  const id = useId();
  const initial = { name: "Hoeurn Dareach", email: "", language: c.profile.language.options[0], prefs: Object.fromEntries(c.preferences.items.map((p) => [p.key, p.on])) as Record<string, boolean> };
  const [values, setValues] = useState(initial);
  const [note, setNote] = useState("");
  const dirty = JSON.stringify(values) !== JSON.stringify(initial);

  return (
    <form
      className="flex w-full flex-col items-start gap-(--layout-gap)"
      onSubmit={(e) => {
        e.preventDefault();
        // No backend yet: nothing is stored. Wire this to the settings API when it exists.
        setNote("Saving will work once the dashboard is connected to its backend.");
      }}
    >
      <SectionHeading
        title={c.title}
        description={c.description}
        action={
          <Button type="submit" size="small" disabled={!dirty}>
            {c.save}
          </Button>
        }
      />
      {note && (
        <p role="status" className="type-caption w-full rounded-lg bg-status-information-subtle px-16 py-12 text-status-information">
          {note}
        </p>
      )}
      <div className="grid w-full grid-cols-1 gap-24 tablet:grid-cols-2">
        <section className="flex flex-col gap-16 rounded-card border border-general-default bg-surface-primary p-24">
          <h2 className="type-subheading text-primary">{c.profile.title}</h2>
          <FieldShell id={`${id}-name`} label={c.profile.name.label} hint={c.profile.name.hint} className="w-full">
            <div className={`${fieldControl()} h-44 rounded-shell px-12 py-8`}>
              <input id={`${id}-name`} value={values.name} autoComplete="name" onChange={(e) => setValues({ ...values, name: e.target.value })} className={fieldInput} />
            </div>
          </FieldShell>
          <FieldShell id={`${id}-email`} label={c.profile.email.label} hint={c.profile.email.hint} className="w-full">
            <div className={`${fieldControl()} h-44 rounded-shell px-12 py-8`}>
              <input
                id={`${id}-email`}
                type="email"
                inputMode="email"
                autoComplete="email"
                value={values.email}
                placeholder={c.profile.email.placeholder}
                onChange={(e) => setValues({ ...values, email: e.target.value })}
                className={fieldInput}
              />
              <MailIcon className="size-24 shrink-0 text-icon-general-primary" />
            </div>
          </FieldShell>
          <FieldShell id={`${id}-language`} label={c.profile.language.label} hint={c.profile.language.hint} className="w-full">
            <div className={`${fieldControl()} relative h-44 rounded-shell px-12 py-8`}>
              <select id={`${id}-language`} value={values.language} onChange={(e) => setValues({ ...values, language: e.target.value })} className={`${fieldInput} cursor-pointer appearance-none pr-24`}>
                {c.profile.language.options.map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </select>
              <ChevronDownIcon aria-hidden className="pointer-events-none absolute right-12 size-20 text-icon-general-primary" />
            </div>
          </FieldShell>
        </section>
        <section className="flex flex-col gap-8 rounded-card border border-general-default bg-surface-primary p-24">
          <h2 className="type-subheading pb-8 text-primary">{c.preferences.title}</h2>
          <ul className="flex flex-col">
            {c.preferences.items.map((p, i) => (
              <li key={p.key} className={`flex items-center gap-16 py-16 ${i ? "border-t border-general-default" : ""}`}>
                <div className="flex min-w-0 flex-1 flex-col gap-4">
                  <p className="type-card-title text-primary">{p.title}</p>
                  <p className="type-body text-secondary">{p.body}</p>
                </div>
                <Switch checked={values.prefs[p.key]} label={p.title} onChange={(on) => setValues({ ...values, prefs: { ...values.prefs, [p.key]: on } })} />
              </li>
            ))}
          </ul>
        </section>
      </div>
    </form>
  );
}
