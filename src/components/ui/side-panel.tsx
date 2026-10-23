"use client";

import * as Dialog from "@radix-ui/react-dialog";
import type { ReactNode } from "react";

/**
 * Right-hand drawer used by Settings, Developer profile, About approach and All projects:
 * full-screen scrim (color/bg/overlay-scrim + Overlay / Backdrop blur) and a panel that slides in from the right.
 * `className` sets the panel's size, inset, padding and background per drawer, as each is placed differently in Figma.
 */
export function SidePanel({
  open,
  onOpenChange,
  title,
  className,
  children,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  className: string;
  children: ReactNode;
}) {
  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-overlay-scrim backdrop-blur-backdrop data-[state=closed]:animate-scrim-out data-[state=open]:animate-scrim-in" />
        <Dialog.Content
          aria-describedby={undefined}
          className={`fixed z-50 flex flex-col overflow-clip rounded-shell outline-none data-[state=closed]:animate-panel-out data-[state=open]:animate-panel-in ${className}`}
        >
          <Dialog.Title className="sr-only">{title}</Dialog.Title>
          {children}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export const PanelClose = Dialog.Close;
