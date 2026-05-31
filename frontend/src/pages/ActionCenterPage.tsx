import { useUiStore } from "@/store/uiStore";
import { useActionCenter } from "@/hooks/useActionCenter";
import { useActionCenterStream } from "@/hooks/useActionCenterStream";
import { StudentSummary } from "@/components/action-center/StudentSummary";
import { SummaryStats } from "@/components/action-center/SummaryStats";
import { UrgencyPanel } from "@/components/action-center/UrgencyPanel";
import { MessagesPanel } from "@/components/action-center/MessagesPanel";
import { TaskList } from "@/components/action-center/TaskList";
import { UrgencyBadge } from "@/components/action-center/UrgencyBadge";
import { StreamStatusIndicator } from "@/components/layout/StreamStatusIndicator";
import { ActionCenterSkeleton } from "@/components/action-center/states/ActionCenterSkeleton";
import { ErrorState } from "@/components/action-center/states/ErrorState";
import { EmptyState } from "@/components/action-center/states/EmptyState";

export function ActionCenterPage() {
  const selectedStudentId = useUiStore((state) => state.selectedStudentId);
  const query = useActionCenter(selectedStudentId);

  useActionCenterStream(selectedStudentId);

  if (!selectedStudentId) return <EmptyState />;
  if (query.isPending) return <ActionCenterSkeleton />;
  if (query.isError) return <ErrorState error={query.error} onRetry={() => void query.refetch()} />;

  const snapshot = query.data;
  const asOf = new Date(snapshot.generatedAt);

  return (
    <div className="flex animate-fade-in flex-col gap-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <StudentSummary student={snapshot.student} />
        <div className="flex items-center gap-3">
          <StreamStatusIndicator />
          <UrgencyBadge level={snapshot.urgency.level} score={snapshot.urgency.score} showScore />
        </div>
      </header>

      <SummaryStats stats={snapshot.stats} />

      <div className="grid gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <TaskList snapshot={snapshot} />
        </div>
        <div className="flex flex-col gap-4">
          <UrgencyPanel urgency={snapshot.urgency} />
          <MessagesPanel messages={snapshot.messages} asOf={asOf} />
        </div>
      </div>
    </div>
  );
}
