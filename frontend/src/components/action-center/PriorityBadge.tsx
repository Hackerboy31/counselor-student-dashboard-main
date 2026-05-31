import type { TaskPriority } from "@csac/shared";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/cn";

const PRIORITY_STYLES: Record<TaskPriority, { label: string; className: string }> = {
  urgent: { label: "Urgent", className: "border-critical-border bg-critical-bg text-critical-fg" },
  high: { label: "High", className: "border-high-border bg-high-bg text-high-fg" },
  medium: { label: "Medium", className: "border-border text-muted" },
  low: { label: "Low", className: "border-border text-subtle" },
};

export function PriorityBadge({
  priority,
  className,
}: {
  priority: TaskPriority;
  className?: string;
}) {
  const style = PRIORITY_STYLES[priority];
  return <Badge className={cn(style.className, className)}>{style.label}</Badge>;
}
