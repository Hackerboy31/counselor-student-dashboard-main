import { useMemo } from "react";
import type { ActionCenterResponse, TaskStatus } from "@csac/shared";
import { useUiStore } from "@/store/uiStore";
import { useUpdateTaskStatus } from "@/hooks/useUpdateTaskStatus";
import { TaskCard } from "./TaskCard";
import { TaskFilters } from "./TaskFilters";

export function TaskList({ snapshot }: { snapshot: ActionCenterResponse }) {
  const statusFilter = useUiStore((state) => state.statusFilter);
  const mutation = useUpdateTaskStatus(snapshot.student.id);
  const asOf = useMemo(() => new Date(snapshot.generatedAt), [snapshot.generatedAt]);

  const visibleTasks =
    statusFilter === "all"
      ? snapshot.tasks
      : snapshot.tasks.filter((task) => task.status === statusFilter);

  const pendingTaskId = mutation.isPending ? mutation.variables?.taskId : undefined;

  const handleStatusChange = (taskId: string, status: TaskStatus) => {
    mutation.mutate({ taskId, status });
  };

  return (
    <section className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <span className="section-label">
          Tasks <span className="tnum normal-case text-subtle">({snapshot.tasks.length})</span>
        </span>
        <TaskFilters />
      </div>

      {visibleTasks.length === 0 ? (
        <p className="rounded-md border border-dashed border-border px-4 py-10 text-center text-sm text-muted">
          No tasks match this filter.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {visibleTasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              asOf={asOf}
              isUpdating={pendingTaskId === task.id}
              onStatusChange={handleStatusChange}
            />
          ))}
        </ul>
      )}
    </section>
  );
}
