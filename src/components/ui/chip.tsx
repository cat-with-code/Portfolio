import type { ButtonHTMLAttributes } from "react";

/** Blog / Topic chip (Figma 1089:71351) — Selected=true|false. Also used for search suggestions and filters. */
export function Chip({ selected = false, className = "", type = "button", ...props }: ButtonHTMLAttributes<HTMLButtonElement> & { selected?: boolean }) {
  return (
    <button
      type={type}
      aria-pressed={selected}
      className={`type-table-heading flex h-34 shrink-0 cursor-pointer items-center justify-center overflow-clip rounded-full px-16 text-center whitespace-nowrap ${
        selected ? "bg-brand-subtle text-brand" : "text-secondary"
      } ${className}`}
      {...props}
    />
  );
}
