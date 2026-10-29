"use client";

import type { ComponentType, SVGProps } from "react";
import { CirclePlayIcon, CloseIcon, CodeIcon, GridIcon, MonitorIcon } from "@/components/icons";
import { useDrawer, useDrawerState } from "@/components/shell/drawer-provider";
import { Button } from "@/components/ui/button";
import { DrawerHeader } from "@/components/ui/drawer-header";
import { IconButton } from "@/components/ui/icon-button";
import { PanelClose, SidePanel } from "@/components/ui/side-panel";
import { useT } from "@/i18n/lang-context";

const icons: Record<string, ComponentType<SVGProps<SVGSVGElement>>> = { monitor: MonitorIcon, code: CodeIcon, grid: GridIcon, play: CirclePlayIcon };

/** "About my approach" / "My approach" — Button Secondary Small that opens the drawer. */
export function ApproachButton() {
  const developer = useT("developer");
  const { setOpen } = useDrawer();
  return (
    <Button variant="secondary" size="small" onClick={() => setOpen("approach")}>
      <span className="tablet:hidden">{developer.heading.actionShort}</span>
      <span className="hidden tablet:inline">{developer.heading.action}</span>
    </Button>
  );
}

/** Developer / About approach drawer: 640px panel inset 24px from the right (Mobile: full width, 8px inset). */
export function ApproachDrawer({ closeLabel }: { closeLabel: string }) {
  const a = useT("developer").approach;
  const state = useDrawerState("approach");
  return (
    <SidePanel {...state} title={a.title} className="inset-8 items-start gap-16 border border-general-default bg-surface-primary p-24 tablet:inset-y-24 tablet:right-24 tablet:left-auto tablet:w-640">
          <DrawerHeader
            title={<p>{a.title}</p>}
            close={
              <PanelClose asChild>
                <IconButton aria-label={closeLabel} surface="secondary">
                  <CloseIcon />
                </IconButton>
              </PanelClose>
            }
          />
          <div className="flex min-h-0 w-full flex-1 flex-col items-start overflow-x-clip overflow-y-auto [scrollbar-width:none]">
            {/* Developer / Approach content (1045:2287) */}
            <div className="flex w-full flex-col items-start gap-32">
              <div className="flex w-full flex-col items-start gap-12 overflow-clip">
                <p className="type-large-metric w-full text-primary">{a.headline}</p>
                <p className="type-body w-full text-secondary">{a.intro}</p>
              </div>
              <ul className="grid w-full grid-cols-1 gap-16 overflow-clip tablet:grid-cols-2">
                {a.skills.map((s) => {
                  const Icon = icons[s.icon];
                  return (
                    <li key={s.title} className="flex flex-col items-start gap-12 overflow-clip rounded-xl border border-general-default bg-surface-primary p-20">
                      <span className="flex size-40 shrink-0 items-center justify-center overflow-clip rounded-lg bg-brand-subtle text-brand">
                        <Icon />
                      </span>
                      <span className="flex w-full flex-col items-start gap-4 overflow-clip">
                        <span className="type-card-title w-full text-primary">{s.title}</span>
                        <span className="type-body w-full text-secondary">{s.text}</span>
                      </span>
                    </li>
                  );
                })}
              </ul>
              <div className="flex w-full flex-col items-start gap-16 overflow-clip">
                <p className="type-page-title w-full text-primary">{a.processTitle}</p>
                <ol className="flex w-full flex-col items-start overflow-clip">
                  {a.steps.map((s, i) => {
                    const last = i === a.steps.length - 1;
                    return (
                      <li key={s.title} className="flex w-full items-start gap-16 overflow-clip">
                        <span className="flex flex-col items-center self-stretch overflow-clip">
                          <span className="type-label flex size-32 shrink-0 items-center justify-center overflow-clip rounded-full bg-brand-subtle whitespace-nowrap text-brand">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          {!last && <span className="min-h-0 w-2 flex-1 bg-(--color-border-general-default)" />}
                        </span>
                        <span className={`flex min-w-0 flex-1 flex-col items-start gap-4 overflow-clip pt-4 ${last ? "" : "pb-24"}`}>
                          <span className="type-card-title w-full text-primary">{s.title}</span>
                          <span className="type-body w-full text-secondary">{s.text}</span>
                        </span>
                      </li>
                    );
                  })}
                </ol>
              </div>
            </div>
          </div>
    </SidePanel>
  );
}
