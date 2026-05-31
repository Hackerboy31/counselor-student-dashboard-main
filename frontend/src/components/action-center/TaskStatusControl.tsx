import { TASK_STATUSES, type TaskStatus } from "@csac/shared";
import { ChevronDown, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TASK_STATUS_LABELS } from "@/lib/task-status";

export function TaskStatusControl({
  status,
  onChange,
  isUpdating = false,
}: {
  status: TaskStatus;
  onChange: (status: TaskStatus) => void;
  isUpdating?: boolean;
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" disabled={isUpdating} className="min-w-[7.5rem] justify-between">
          {TASK_STATUS_LABELS[status]}
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-subtle" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 text-subtle" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>Set status</DropdownMenuLabel>
        <DropdownMenuRadioGroup value={status} onValueChange={(value) => onChange(value as TaskStatus)}>
          {TASK_STATUSES.map((option) => (
            <DropdownMenuRadioItem key={option} value={option}>
              {TASK_STATUS_LABELS[option]}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
