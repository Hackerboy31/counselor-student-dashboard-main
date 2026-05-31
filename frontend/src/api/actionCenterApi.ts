import type {
  ActionCenterResponse,
  RosterResponse,
  TaskStatus,
  UpdateTaskStatusResponse,
} from "@csac/shared";
import { apiFetch } from "./client";

export function getRoster(counselorId: string): Promise<RosterResponse> {
  return apiFetch<RosterResponse>(`/students?counselorId=${encodeURIComponent(counselorId)}`);
}

export function getActionCenter(studentId: string): Promise<ActionCenterResponse> {
  return apiFetch<ActionCenterResponse>(`/students/${encodeURIComponent(studentId)}/action-center`);
}

export function updateTaskStatus(
  taskId: string,
  status: TaskStatus,
): Promise<UpdateTaskStatusResponse> {
  return apiFetch<UpdateTaskStatusResponse>(`/tasks/${encodeURIComponent(taskId)}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}

export function actionCenterStreamUrl(studentId: string): string {
  return `/api/students/${encodeURIComponent(studentId)}/action-center/stream`;
}
