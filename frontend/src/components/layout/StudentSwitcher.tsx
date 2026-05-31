import { useEffect } from "react";
import { useRoster } from "@/hooks/useRoster";
import { useUiStore } from "@/store/uiStore";
import { UrgencyDot } from "@/components/action-center/UrgencyBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/cn";

export function StudentSwitcher() {
  const { data: students, isPending, isError, refetch } = useRoster();
  const selectedStudentId = useUiStore((state) => state.selectedStudentId);
  const selectStudent = useUiStore((state) => state.selectStudent);

  useEffect(() => {
    const first = students?.[0];
    if (first && !selectedStudentId) selectStudent(first.id);
  }, [students, selectedStudentId, selectStudent]);

  return (
    <nav className="flex flex-col gap-1" aria-label="Students">
      <p className="section-label px-2 pb-1">Caseload</p>

      {isPending
        ? Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full rounded-md" />
          ))
        : null}

      {isError ? (
        <button
          type="button"
          onClick={() => void refetch()}
          className="rounded-md px-2 py-2 text-left text-xs text-muted hover:bg-surface"
        >
          Couldn&rsquo;t load students. Retry.
        </button>
      ) : null}

      {students?.map((student) => {
        const active = student.id === selectedStudentId;
        return (
          <button
            key={student.id}
            type="button"
            onClick={() => selectStudent(student.id)}
            aria-current={active ? "true" : undefined}
            className={cn(
              "group flex items-start gap-2.5 rounded-md px-2 py-2 text-left transition-colors",
              active ? "bg-surface shadow-sm ring-1 ring-border" : "hover:bg-surface/70",
            )}
          >
            <UrgencyDot level={student.urgency.level} className="mt-1 shrink-0" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate text-sm font-medium text-ink">{student.name}</span>
                <span className="tnum shrink-0 text-2xs text-subtle">G{student.grade}</span>
              </div>
              <div className="mt-0.5 flex items-center gap-1.5 text-2xs text-subtle">
                <span className="tnum">{student.openTaskCount} open</span>
                {student.unreadMessageCount > 0 ? (
                  <span className="tnum">· {student.unreadMessageCount} unread</span>
                ) : null}
              </div>
            </div>
          </button>
        );
      })}
    </nav>
  );
}
