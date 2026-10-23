import Link from "next/link";
import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "small" | "medium";

/**
 * Button (Figma 43:36) — Style=Primary|Secondary|Ghost × Size=Small(36)|Medium(44) × State.
 * Padding 0/20, gap 8, radius/full, Typography/Label. Focus = Elevation/Focus ring (global).
 */
export function buttonClasses(variant: Variant = "primary", size: Size = "medium") {
  const height = size === "small" ? "h-36" : "h-44";
  const style = {
    primary:
      "bg-brand text-on-brand hover:bg-brand-hover active:bg-brand-pressed aria-disabled:bg-surface-disabled aria-disabled:text-general-disabled disabled:bg-surface-disabled disabled:text-general-disabled",
    secondary:
      "border border-general-primary bg-surface-primary text-primary hover:bg-surface-hover active:bg-surface-pressed disabled:border-interaction-disabled disabled:bg-surface-disabled disabled:text-general-disabled",
    ghost: "text-primary hover:bg-surface-hover active:bg-surface-pressed disabled:bg-surface-disabled disabled:text-general-disabled",
  }[variant];
  return `type-label inline-flex ${height} shrink-0 cursor-pointer items-center justify-center gap-8 rounded-full px-20 whitespace-nowrap transition-colors duration-(--duration-fast) disabled:cursor-not-allowed ${style}`;
}

type Common = { variant?: Variant; size?: Size; icon?: ReactNode; children: ReactNode };

export function Button({ variant, size, icon, children, className = "", type = "button", ...props }: Common & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button type={type} className={`${buttonClasses(variant, size)} ${className}`} {...props}>
      {icon}
      {children}
    </button>
  );
}

export function ButtonLink({ variant, size, icon, children, className = "", href, ...props }: Common & AnchorHTMLAttributes<HTMLAnchorElement> & { href: string }) {
  return (
    <Link href={href} className={`${buttonClasses(variant, size)} ${className}`} {...props}>
      {icon}
      {children}
    </Link>
  );
}
