import type { Task, TaskStatus } from "@csac/shared";
import type { Repositories } from "../data/repository";
import type { Clock } from "../lib/clock";
import type { TypedEventBus } from "../realtime/event-bus";
import { NotFoundError } from "../http/errors";

export class TaskService {
  constructor(
    private readonly repos: Repositories,
    private readonly clock: Clock,
    private readonly bus: TypedEventBus,
  ) {}

  updateStatus(taskId: string, status: TaskStatus): Task {
    const updated = this.repos.tasks.updateStatus(taskId, status, this.clock.now());
    if (!updated) {
      throw new NotFoundError("TASK_NOT_FOUND", `No task with id '${taskId}'.`);
    }

    this.bus.emit("taskChanged", { studentId: updated.studentId, taskId: updated.id });
    return updated;
  }
}
