import { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AccentColor = "yellow" | "orange" | "red" | "none";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  accent?: AccentColor;
}

const accentClasses: Record<AccentColor, string> = {
  yellow: "border-t-4 border-t-brand-yellow",
  orange: "border-t-4 border-t-brand-orange",
  red: "border-t-4 border-t-brand-red",
  none: "",
};

export function Card({ accent = "none", className, children, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "bg-white border-2 border-brand-black shadow-brutal-lg p-6",
        accentClasses[accent],
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
