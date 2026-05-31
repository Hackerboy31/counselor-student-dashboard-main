import { Mail } from "lucide-react";
import { cn } from "@/lib/cn";

export function MessageCounter({
  unread,
  total,
  className,
}: {
  unread: number;
  total: number;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs text-muted", className)}>
      <Mail className="h-3.5 w-3.5 text-subtle" aria-hidden />
      <span className="tnum font-medium text-ink">{unread}</span>
      <span className="text-subtle">
        unread · <span className="tnum">{total}</span> total
      </span>
    </span>
  );
}
