import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "open" | "full" | "cancelled" | "active" | "inactive";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant: BadgeVariant;
}

const variantClasses: Record<BadgeVariant, string> = {
  open: "bg-brand-yellow text-brand-black border-brand-black",
  full: "bg-brand-orange text-white border-brand-black",
  cancelled: "bg-brand-red text-white border-brand-black",
  active: "bg-brand-yellow text-brand-black border-brand-black",
  inactive: "bg-brand-black/10 text-brand-black/50 border-brand-black/30",
};

const labelMap: Record<BadgeVariant, string> = {
  open: "OPEN",
  full: "FULL",
  cancelled: "CANCELLED",
  active: "ACTIVE",
  inactive: "INACTIVE",
};

export function Badge({ variant, className, children, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center border-2 px-2 py-0.5 text-xs font-black uppercase tracking-widest",
        variantClasses[variant],
        className
      )}
      {...props}
    >
      {children ?? labelMap[variant]}
    </span>
  );
}
