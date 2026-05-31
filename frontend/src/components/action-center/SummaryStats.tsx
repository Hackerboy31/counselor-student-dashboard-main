import type { ActionCenterStats } from "@csac/shared";
import { cn } from "@/lib/cn";

type Tone = "default" | "critical" | "high";

interface Tile {
  label: string;
  value: number;
  tone: Tone;
}

const TONE_TEXT: Record<Tone, string> = {
  default: "text-ink",
  critical: "text-critical-fg",
  high: "text-high-fg",
};

export function SummaryStats({ stats }: { stats: ActionCenterStats }) {
  const tiles: Tile[] = [
    { label: "Open tasks", value: stats.openTaskCount, tone: "default" },
    { label: "Overdue", value: stats.overdueTaskCount, tone: stats.overdueTaskCount > 0 ? "critical" : "default" },
    { label: "Urgent", value: stats.urgentOpenTaskCount, tone: stats.urgentOpenTaskCount > 0 ? "high" : "default" },
    { label: "Unread", value: stats.unreadMessageCount, tone: "default" },
  ];

  return (
    <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-border bg-surface sm:grid-cols-4">
      {tiles.map((tile, index) => (
        <div
          key={tile.label}
          className={cn(
            "px-4 py-3",
            index % 2 === 1 && "border-l border-border",
            index >= 2 && "border-t border-border",
            "sm:border-l sm:border-t-0",
            index === 0 && "sm:border-l-0",
          )}
        >
          <div className={cn("tnum text-xl font-semibold leading-none", TONE_TEXT[tile.tone])}>
            {tile.value}
          </div>
          <div className="mt-1.5 text-2xs uppercase tracking-[0.06em] text-subtle">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
