import type { UrgencyLevel } from "@csac/shared";
import { cn } from "@/lib/cn";

interface LevelStyle {
  label: string;
  dot: string;
  chip: string;
}

const URGENCY_LEVEL_STYLES: Record<UrgencyLevel, LevelStyle> = {
  critical: {
    label: "Critical",
    dot: "bg-critical-fg",
    chip: "border-critical-border bg-critical-bg text-critical-fg",
  },
  high: {
    label: "High",
    dot: "bg-high-fg",
    chip: "border-high-border bg-high-bg text-high-fg",
  },
  moderate: {
    label: "Moderate",
    dot: "bg-moderate-fg",
    chip: "border-moderate-border bg-moderate-bg text-moderate-fg",
  },
  low: {
    label: "Low",
    dot: "bg-low-fg",
    chip: "border-low-border bg-low-bg text-low-fg",
  },
};

export function UrgencyDot({ level, className }: { level: UrgencyLevel; className?: string }) {
  return (
    <span
      className={cn("inline-block h-2 w-2 rounded-full", URGENCY_LEVEL_STYLES[level].dot, className)}
      aria-hidden
    />
  );
}

export function UrgencyBadge({
  level,
  score,
  showScore = false,
  className,
}: {
  level: UrgencyLevel;
  score: number;
  showScore?: boolean;
  className?: string;
}) {
  const style = URGENCY_LEVEL_STYLES[level];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-xs font-semibold",
        style.chip,
        className,
      )}
    >
      <span className={cn("h-1.5 w-1.5 rounded-full", style.dot)} aria-hidden />
      {style.label}
      {showScore ? <span className="tnum font-medium opacity-70">· {score}</span> : null}
    </span>
  );
}
