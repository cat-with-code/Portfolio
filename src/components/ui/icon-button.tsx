import { forwardRef, type ButtonHTMLAttributes } from "react";

type IconButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  /** Figma `Style` */
  variant?: "primary" | "secondary";
  /** 44 = component default; 32 = the compact size used in top bars */
  size?: 32 | 44;
  /** Screens override the fill to color/bg/surface-secondary (top-bar actions, drawer close) */
  surface?: "default" | "secondary";
  /** Top-bar actions also remove the Secondary stroke */
  bordered?: boolean;
  "aria-label": string;
};

/**
 * Icon button (Figma 43:251) — Style=Primary|Secondary × State=Default|Hover|Pressed|Focus|Disabled.
 * Focus uses the global Elevation/Focus ring. With a surface override, Figma keeps the overridden
 * fill in every state, so hover/pressed fills only apply to the default surface.
 */
export const IconButton = forwardRef<HTMLButtonElement, IconButtonProps>(function IconButton(
  { variant = "secondary", size = 44, surface = "default", bordered = variant === "secondary", className = "", type = "button", ...props },
  ref
) {
  const box = size === 44 ? "size-44" : "size-32";
  const fill =
    surface === "secondary"
      ? "bg-surface-secondary"
      : variant === "primary"
        ? "bg-brand hover:bg-brand-hover active:bg-brand-pressed disabled:bg-surface-disabled"
        : "bg-surface-primary hover:bg-surface-hover active:bg-surface-pressed disabled:bg-surface-disabled";
  const icon = variant === "primary" ? "text-icon-on-brand" : "text-icon-general-primary";
  const border = bordered ? "border border-general-primary" : "";
  return (
    <button
      ref={ref}
      type={type}
      className={`flex ${box} shrink-0 cursor-pointer items-center justify-center rounded-full p-0 transition-colors duration-(--duration-fast) disabled:cursor-not-allowed disabled:text-icon-general-disabled ${fill} ${icon} ${border} ${className}`}
      {...props}
    />
  );
});
