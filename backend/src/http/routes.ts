import { Router } from "express";
import type { Container } from "../container";
import { asyncHandler } from "../lib/async-handler";
import {
  StudentIdParamsSchema,
  TaskIdParamsSchema,
  UpdateTaskStatusBodySchema,
} from "../domain/schemas";
import { validate } from "./middleware/validate";
import { ActionCenterController } from "./controllers/action-center.controller";
import { TaskController } from "./controllers/task.controller";
import { healthController } from "./controllers/health.controller";

export function createRouter(container: Container): Router {
  const router = Router();
  const actionCenter = new ActionCenterController(container.actionCenterService, container.sseHub);
  const tasks = new TaskController(container.taskService);

  router.get("/health", healthController);

  router.get("/students", asyncHandler(actionCenter.getRoster));

  router.get(
    "/students/:id/action-center",
    validate(StudentIdParamsSchema, "params"),
    asyncHandler(actionCenter.getActionCenter),
  );

  router.get(
    "/students/:id/action-center/stream",
    validate(StudentIdParamsSchema, "params"),
    asyncHandler(actionCenter.streamActionCenter),
  );

  router.patch(
    "/tasks/:taskId/status",
    validate(TaskIdParamsSchema, "params"),
    validate(UpdateTaskStatusBodySchema, "body"),
    asyncHandler(tasks.updateStatus),
  );

  return router;
}
