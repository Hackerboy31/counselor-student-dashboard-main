import type { TaskStatus, TaskView } from "@csac/shared";
import { AlertTriangle, CalendarClock } from "lucide-react";
import { cn } from "@/lib/cn";
import { formatDueLabel } from "@/lib/format";
import { PriorityBadge } from "./PriorityBadge";
import { TaskStatusControl } from "./TaskStatusControl";

export function TaskCard({
  task,
  asOf,
  isUpdating,
  onStatusChange,
}: {
  task: TaskView;
  asOf: Date;
  isUpdating: boolean;
  onStatusChange: (taskId: string, status: TaskStatus) => void;
}) {
  const completed = task.status === "completed";

  return (
    <li
      className={cn(
        "flex items-start gap-3 rounded-md border border-border bg-surface px-3.5 py-3 transition-colors hover:border-border-strong",
        task.isOverdue && "border-l-2 border-l-critical-fg",
      )}
    >
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <PriorityBadge priority={task.priority} />
          {task.isOverdue ? (
            <span className="inline-flex items-center gap-1 text-2xs font-medium text-critical-fg">
              <AlertTriangle className="h-3 w-3" aria-hidden />
              Overdue
            </span>
          ) : null}
        </div>

        <h4
          className={cn(
            "mt-1.5 text-sm font-medium text-ink",
            completed && "text-muted line-through decoration-border",
          )}
        >
          {task.title}
        </h4>
        <p className="mt-0.5 line-clamp-2 text-xs text-muted">{task.description}</p>

        <div className="mt-2 flex items-center gap-1.5 text-2xs text-subtle">
          <CalendarClock className="h-3 w-3" aria-hidden />
          <span className={cn(task.isOverdue && "font-medium text-critical-fg")}>
            {formatDueLabel(task.dueDate, asOf)}
          </span>
        </div>
      </div>

      <div className="shrink-0">
        <TaskStatusControl
          status={task.status}
          isUpdating={isUpdating}
          onChange={(status) => onStatusChange(task.id, status)}
        />
      </div>
    </li>
  );
}
