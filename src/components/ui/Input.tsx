import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, className, id, ...props }, ref) => {
    const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label
            htmlFor={inputId}
            className="text-xs font-black uppercase tracking-widest text-brand-black"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "border-2 border-brand-black px-4 py-2.5 text-base font-mono bg-white",
            "shadow-brutal-sm focus:outline-none focus:bg-brand-yellow focus:shadow-none",
            "disabled:opacity-50 disabled:cursor-not-allowed",
            "placeholder:text-brand-black/30",
            error && "border-brand-red",
            className
          )}
          {...props}
        />
        {error && (
          <p className="text-xs font-bold text-brand-red uppercase tracking-wide">{error}</p>
        )}
        {hint && !error && (
          <p className="text-xs text-brand-black/50 font-medium">{hint}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";
