import { type ReactNode } from "react";
import Link from "next/link";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

interface ButtonBaseProps {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
}

interface ButtonAsButton extends ButtonBaseProps {
  href?: never;
  type?: "button" | "submit" | "reset";
  onClick?: () => void;
  disabled?: boolean;
}

interface ButtonAsLink extends ButtonBaseProps {
  href: string;
  type?: never;
  onClick?: never;
  disabled?: never;
}

type ButtonProps = ButtonAsButton | ButtonAsLink;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-accent text-cream hover:bg-accent-hover border border-transparent",
  secondary:
    "bg-transparent text-charcoal border border-charcoal hover:bg-charcoal hover:text-cream",
  ghost:
    "bg-transparent text-charcoal-light border border-transparent hover:text-accent",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "px-5 py-2 text-xs",
  md: "px-7 py-3 text-xs",
  lg: "px-10 py-4 text-sm",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  className = "",
  href,
  ...rest
}: ButtonProps) {
  const classes = [
    "inline-flex items-center justify-center font-sans tracking-widest uppercase rounded-sm transition-all duration-300",
    variantClasses[variant],
    sizeClasses[size],
    className,
  ]
    .filter(Boolean)
    .join(" ");

  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }

  const { type = "button", onClick, disabled } = rest as ButtonAsButton;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${classes} ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
    >
      {children}
    </button>
  );
}
