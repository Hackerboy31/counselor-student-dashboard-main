import { AlertCircle } from "lucide-react";
import { ApiError } from "@/api/client";
import { Button } from "@/components/ui/button";

export function ErrorState({ error, onRetry }: { error: unknown; onRetry: () => void }) {
  const requestId = error instanceof ApiError ? error.requestId : undefined;
  const message = error instanceof Error ? error.message : "Something went wrong.";

  return (
    <div className="flex flex-col items-start gap-3 rounded-lg border border-border bg-surface p-6">
      <span className="inline-flex items-center gap-2 text-sm font-medium text-ink">
        <AlertCircle className="h-4 w-4 text-critical-fg" aria-hidden />
        Couldn&rsquo;t load this student&rsquo;s action center.
      </span>
      <p className="text-sm text-muted">{message}</p>
      {requestId ? (
        <p className="font-mono text-2xs text-subtle">Request ID: {requestId}</p>
      ) : null}
      <Button variant="outline" size="sm" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}
