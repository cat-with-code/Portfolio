"use client";

/** Switch (Dashboard / Setting row 1363:2566): 40×24 track, On = brand with the knob right, Off = grey with the knob left. */
export function Switch({ checked, onChange, label, className = "" }: { checked: boolean; onChange: (on: boolean) => void; label: string; className?: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={`relative flex h-24 w-40 shrink-0 cursor-pointer items-center rounded-full border transition-colors duration-(--duration-fast) ${
        checked ? "border-transparent bg-brand" : "border-general-primary bg-surface-secondary"
      } ${className}`}
    >
      <span
        aria-hidden
        className={`absolute size-16 rounded-full transition-[left,background-color] duration-(--duration-fast) ${checked ? "left-19 bg-surface-primary" : "left-3 bg-(--color-icon-general-primary)"}`}
      />
    </button>
  );
}
