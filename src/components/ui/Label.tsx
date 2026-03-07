import { LabelHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export function Label({ className, children, ...props }: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn(
        "text-xs font-black uppercase tracking-widest text-brand-black",
        className
      )}
      {...props}
    >
      {children}
    </label>
  );
}
