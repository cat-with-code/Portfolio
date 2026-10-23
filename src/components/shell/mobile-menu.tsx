"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { useState } from "react";
import { CloseIcon, MenuIcon } from "@/components/icons";
import { DrawerHeader } from "@/components/ui/drawer-header";
import { IconButton } from "@/components/ui/icon-button";
import type { NavLabels } from "@/lib/site";
import { NavLinks } from "./nav-links";

/** Mobile / Menu drawer (Figma 778:44913): 320px sheet sliding from the left over a blurred scrim. */
export function MobileMenu({ lang, labels, openLabel, closeLabel }: { lang: string; labels: NavLabels; openLabel: string; closeLabel: string }) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <IconButton aria-label={openLabel} size={32} surface="secondary" bordered={false}>
          <MenuIcon />
        </IconButton>
      </Dialog.Trigger>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay-scrim backdrop-blur-backdrop data-[state=closed]:animate-scrim-out data-[state=open]:animate-scrim-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className="fixed inset-y-0 left-0 z-50 flex w-320 flex-col gap-24 overflow-clip rounded-r-shell bg-surface-primary p-24 shadow-sheet outline-none data-[state=closed]:animate-sheet-out data-[state=open]:animate-sheet-in"
        >
          <DrawerHeader
            title={<Dialog.Title>{labels.explore}</Dialog.Title>}
            close={
              <Dialog.Close asChild>
                <IconButton aria-label={closeLabel} surface="secondary">
                  <CloseIcon />
                </IconButton>
              </Dialog.Close>
            }
          />
          {/* Navigation panel */}
          <nav className="flex min-h-0 w-full flex-1 flex-col gap-24 overflow-y-auto bg-surface-primary p-20">
            <p className="type-table-heading whitespace-nowrap text-muted">{labels.portfolio}</p>
            <NavLinks lang={lang} labels={labels} allowRail={false} onNavigate={() => setOpen(false)} />
          </nav>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
