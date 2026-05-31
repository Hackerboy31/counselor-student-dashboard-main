import { useUiStore, type StatusFilter } from "@/store/uiStore";
import { TASK_STATUS_LABELS } from "@/lib/task-status";
import { cn } from "@/lib/cn";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "all", label: "All" },
  { value: "todo", label: TASK_STATUS_LABELS.todo },
  { value: "in_progress", label: TASK_STATUS_LABELS.in_progress },
  { value: "completed", label: TASK_STATUS_LABELS.completed },
];

export function TaskFilters() {
  const statusFilter = useUiStore((state) => state.statusFilter);
  const setStatusFilter = useUiStore((state) => state.setStatusFilter);

  return (
    <div
      role="tablist"
      aria-label="Filter tasks by status"
      className="inline-flex items-center gap-0.5 rounded-md border border-border bg-panel p-0.5"
    >
      {FILTERS.map((filter) => {
        const active = statusFilter === filter.value;
        return (
          <button
            key={filter.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setStatusFilter(filter.value)}
            className={cn(
              "rounded-[5px] px-2.5 py-1 text-xs font-medium transition-colors",
              active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink",
            )}
          >
            {filter.label}
          </button>
        );
      })}
    </div>
  );
}
