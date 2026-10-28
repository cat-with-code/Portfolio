import type { ReactNode } from "react";

/** Field (Figma 45:24) control box — Default / Hover / Focus (2px focus stroke + focus ring) / Error. Add the height and radius. */
export const fieldControl = (error = false) =>
  `flex w-full items-center gap-8 border bg-surface-primary transition-colors duration-(--duration-fast) focus-within:border-interaction-focus focus-within:shadow-[inset_0_0_0_1px_var(--color-border-interaction-focus),var(--focus-ring)] ${
    error ? "border-status-error" : "border-general-primary hover:border-interaction-hover"
  }`;
/** The bare <input>/<select>/<textarea> inside a fieldControl box. */
export const fieldInput = "type-input min-w-0 flex-1 bg-transparent text-primary outline-none placeholder:text-general-placeholder focus-visible:shadow-none";

/** Field label, control and an error or hint line underneath. */
export function FieldShell({ id, label, error, hint, className = "", children }: { id: string; label: string; error?: string; hint?: ReactNode; className?: string; children: ReactNode }) {
  return (
    <div className={`flex flex-col items-start gap-8 ${className}`}>
      <label htmlFor={id} className="type-label whitespace-nowrap text-general-label">
        {label}
      </label>
      {children}
      {error ? (
        <p id={`${id}-error`} className="type-caption text-status-error">
          {error}
        </p>
      ) : (
        hint && (
          <p id={`${id}-hint`} className="type-caption w-full text-muted">
            {hint}
          </p>
        )
      )}
    </div>
  );
}
