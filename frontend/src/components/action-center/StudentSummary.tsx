import type { Student } from "@csac/shared";
import { cn } from "@/lib/cn";

function initials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function EnrollmentChip({ atRisk }: { atRisk: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-sm border px-1.5 py-0.5 text-2xs font-medium",
        atRisk ? "border-critical-border bg-critical-bg text-critical-fg" : "border-low-border bg-low-bg text-low-fg",
      )}
    >
      {atRisk ? "At risk" : "Active"}
    </span>
  );
}

function Fact({ label, value }: { label: string; value: string }) {
  return (
    <span className="inline-flex items-baseline gap-1">
      <span className="text-subtle">{label}</span>
      <span className="tnum font-medium text-ink">{value}</span>
    </span>
  );
}

export function StudentSummary({ student }: { student: Student }) {
  return (
    <div className="flex items-start gap-3">
      <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-accent-subtle text-sm font-semibold text-accent-hover">
        {initials(student.name)}
      </div>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="truncate text-lg font-semibold tracking-[-0.01em] text-ink">
            {student.name}
          </h1>
          <EnrollmentChip atRisk={student.enrollmentStatus === "at_risk"} />
        </div>
        <p className="truncate text-xs text-muted">{student.email}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          <Fact label="Grade" value={String(student.grade)} />
          <span className="h-3 w-px bg-border" aria-hidden />
          <Fact label="GPA" value={student.gpa.toFixed(1)} />
        </div>
      </div>
    </div>
  );
}
