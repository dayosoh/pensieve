"use client";

import { type ButtonHTMLAttributes, forwardRef } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-primary text-background font-medium hover:opacity-90",
  secondary:
    "bg-surface border border-text-tertiary/20 text-text-primary hover:bg-surface-elevated",
  ghost:
    "bg-transparent text-text-secondary hover:bg-surface-elevated",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", className = "", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={`px-4 py-3 rounded-lg font-body transition-standard disabled:opacity-40 ${variantStyles[variant]} ${className}`}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
