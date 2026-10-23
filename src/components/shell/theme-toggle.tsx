"use client";

import { MonitorIcon, MoonIcon, SunIcon } from "@/components/icons";
import { IconButton } from "@/components/ui/icon-button";

type Mode = "light" | "dark" | "system";
const order: Mode[] = ["light", "dark", "system"];

export function applyTheme(mode: Mode) {
  const root = document.documentElement;
  root.dataset.themeMode = mode;
  if (mode === "system") delete root.dataset.theme;
  else root.dataset.theme = mode;
  try {
    localStorage.setItem("theme", mode);
  } catch {}
}

/** Portfolio / Theme toggle (Figma 117:1451): Light → Dark → System → Light. The icon shows the current mode. */
export function ThemeToggle({ label }: { label: string }) {
  return (
    <IconButton
      aria-label={label}
      size={32}
      surface="secondary"
      bordered={false}
      onClick={() => {
        const current = (document.documentElement.dataset.themeMode as Mode) ?? "light";
        applyTheme(order[(order.indexOf(current) + 1) % order.length]);
      }}
    >
      <SunIcon className="hidden mode-light:block" />
      <MoonIcon className="hidden mode-dark:block" />
      <MonitorIcon className="hidden mode-system:block" />
    </IconButton>
  );
}
