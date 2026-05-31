import type { Message, Student, Task } from "./domain";

export type UrgencyLevel = "critical" | "high" | "moderate" | "low";

export type UrgencySignalCode =
  | "AT_RISK_ENROLLMENT"
  | "OVERDUE_TASKS"
  | "URGENT_TASKS"
  | "UNREAD_MESSAGES"
  | "LOW_GPA";

export interface UrgencySignal {
  code: UrgencySignalCode;
  label: string;
  detail: string;
  weight: number;
}

export interface UrgencyAssessment {
  level: UrgencyLevel;
  score: number;
  signals: UrgencySignal[];
}

export interface TaskView extends Task {
  isOverdue: boolean;
}

export interface ActionCenterStats {
  totalTaskCount: number;
  openTaskCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
  urgentOpenTaskCount: number;
  totalMessageCount: number;
  unreadMessageCount: number;
}

export interface ActionCenterSnapshot {
  student: Student;
  urgency: UrgencyAssessment;
  stats: ActionCenterStats;
  tasks: TaskView[];
  messages: Message[];
  generatedAt: string;
}
