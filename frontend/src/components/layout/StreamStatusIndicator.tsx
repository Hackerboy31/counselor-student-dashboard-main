import { useUiStore, type StreamStatus } from "@/store/uiStore";
import { cn } from "@/lib/cn";

const LABELS: Record<StreamStatus, string> = {
  idle: "Offline",
  connecting: "Connecting",
  live: "Live",
  reconnecting: "Reconnecting",
};

export function StreamStatusIndicator({ className }: { className?: string }) {
  const status = useUiStore((state) => state.streamStatus);
  const live = status === "live";

  const dotColor =
    status === "live" ? "bg-low-fg" : status === "reconnecting" ? "bg-high-fg" : "bg-subtle";

  return (
    <span
      className={cn("inline-flex items-center gap-1.5 text-2xs font-medium text-subtle", className)}
      title={`Realtime: ${LABELS[status]}`}
    >
      <span className="relative flex h-1.5 w-1.5">
        {live ? (
          <span className="absolute inline-flex h-1.5 w-1.5 animate-ping rounded-full bg-low-fg opacity-60" />
        ) : null}
        <span className={cn("inline-flex h-1.5 w-1.5 rounded-full", dotColor)} />
      </span>
      {LABELS[status]}
    </span>
  );
}
