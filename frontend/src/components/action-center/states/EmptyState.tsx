import { Users } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-24 text-center">
      <Users className="h-5 w-5 text-subtle" aria-hidden />
      <p className="text-sm text-muted">Select a student to view their action center.</p>
    </div>
  );
}
