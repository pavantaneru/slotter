import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "danger" | "ghost" | "dark";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-purple border-brand-black text-white shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-brand-orange",
  danger:
    "bg-brand-red border-brand-black text-white shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
  ghost:
    "bg-white border-brand-black text-brand-black shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none hover:bg-brand-yellow",
  dark:
    "bg-brand-black border-brand-black text-brand-yellow shadow-brutal hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", loading, disabled, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(
          "inline-flex items-center justify-center gap-2",
          "border-2 px-5 py-2.5",
          "font-black uppercase tracking-wide text-sm",
          "transition-all duration-100",
          "disabled:opacity-50 disabled:cursor-not-allowed disabled:translate-x-0 disabled:translate-y-0 disabled:shadow-brutal",
          variantClasses[variant],
          className
        )}
        {...props}
      >
        {loading && (
          <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        )}
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";
