import type { EnrollmentStatus, Task, TaskStatus } from "./domain";
import type { ActionCenterSnapshot, UrgencyLevel } from "./action-center";

export type ErrorCode =
  | "STUDENT_NOT_FOUND"
  | "TASK_NOT_FOUND"
  | "VALIDATION_ERROR"
  | "NOT_FOUND"
  | "INTERNAL_ERROR";

export interface ErrorEnvelope {
  error: {
    code: ErrorCode;
    message: string;
    requestId: string;
    details?: unknown;
  };
}

export type ActionCenterResponse = ActionCenterSnapshot;

export interface UpdateTaskStatusRequest {
  status: TaskStatus;
}

export interface UpdateTaskStatusResponse {
  task: Task;
}

export interface HealthResponse {
  status: "ok";
  uptimeSec: number;
  timestamp: string;
}

export interface RosterEntry {
  id: string;
  name: string;
  grade: number;
  enrollmentStatus: EnrollmentStatus;
  urgency: { level: UrgencyLevel; score: number };
  openTaskCount: number;
  unreadMessageCount: number;
}

export interface RosterResponse {
  students: RosterEntry[];
}

export const SSE_SNAPSHOT_EVENT = "snapshot" as const;
