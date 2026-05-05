import { forwardRef } from "react";

type Variant = "primary" | "ghost" | "audit";
type Size = "sm" | "md" | "lg";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  { variant = "primary", size = "md", className = "", ...rest },
  ref
) {
  const variantClass =
    variant === "primary"
      ? "op-btn--primary"
      : variant === "audit"
      ? "op-btn--audit"
      : "op-btn--ghost";
  const sizeClass = size === "sm" ? "op-btn--sm" : size === "lg" ? "op-btn--lg" : "";
  return (
    <button
      ref={ref}
      className={`op-btn ${variantClass} ${sizeClass} ${className}`}
      {...rest}
    />
  );
});
