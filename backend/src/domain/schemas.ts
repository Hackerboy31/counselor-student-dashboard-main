import { z } from "zod";
import { TASK_STATUSES, type TaskStatus } from "@csac/shared";

export const TaskStatusSchema = z.enum(TASK_STATUSES);

export const UpdateTaskStatusBodySchema = z.object({
  status: TaskStatusSchema,
});

export const StudentIdParamsSchema = z.object({
  id: z.string().min(1),
});

export const TaskIdParamsSchema = z.object({
  taskId: z.string().min(1),
});

type Equal<A, B> = [A] extends [B] ? ([B] extends [A] ? true : false) : false;

export const __taskStatusEnumMatchesUnion: Equal<
  z.infer<typeof TaskStatusSchema>,
  TaskStatus
> = true;
