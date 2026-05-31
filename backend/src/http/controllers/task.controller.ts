import type { Request, Response } from "express";
import type { UpdateTaskStatusRequest, UpdateTaskStatusResponse } from "@csac/shared";
import type { TaskService } from "../../services/task.service";

export class TaskController {
  constructor(private readonly service: TaskService) {}

  updateStatus = (req: Request, res: Response): void => {
    const { taskId } = req.params as { taskId: string };
    const { status } = req.body as UpdateTaskStatusRequest;

    const task = this.service.updateStatus(taskId, status);
    const body: UpdateTaskStatusResponse = { task };
    res.json(body);
  };
}
