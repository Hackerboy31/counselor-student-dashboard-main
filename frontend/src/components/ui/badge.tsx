import { forwardRef, type HTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const Badge = forwardRef<HTMLSpanElement, HTMLAttributes<HTMLSpanElement>>(
  ({ className, ...props }, ref) => (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center gap-1 rounded-sm border border-border px-1.5 py-0.5 text-2xs font-medium leading-none",
        className,
      )}
      {...props}
    />
  ),
);
Badge.displayName = "Badge";
