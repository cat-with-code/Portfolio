import type { ReactNode } from "react";

type Tone = "neutral" | "information" | "success" | "warning" | "error";

const styles: Record<Tone, { subtle: string; solid: string }> = {
  neutral: { subtle: "bg-surface-secondary text-secondary", solid: "bg-inverse text-on-inverse" },
  information: { subtle: "bg-status-information-subtle text-status-information", solid: "bg-status-information text-on-information" },
  success: { subtle: "bg-status-success-subtle text-status-success", solid: "bg-status-success text-on-success" },
  warning: { subtle: "bg-status-warning-subtle text-status-warning", solid: "bg-status-warning text-on-warning" },
  error: { subtle: "bg-status-error-subtle text-status-error", solid: "bg-status-error text-on-error" },
};

/** Badge (Figma 51:79) — Tone × Treatment, 28px pill, Typography/Caption. */
export function Badge({ tone = "neutral", treatment = "subtle", className = "", children }: { tone?: Tone; treatment?: "subtle" | "solid"; className?: string; children: ReactNode }) {
  return (
    <span className={`type-caption flex h-28 shrink-0 items-center justify-center gap-4 rounded-full px-12 py-4 text-center whitespace-nowrap ${styles[tone][treatment]} ${className}`}>
      {children}
    </span>
  );
}
