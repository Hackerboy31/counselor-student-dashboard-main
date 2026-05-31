import type { Message, Student, Task, TaskPriority } from "./domain";
import type { ActionCenterSnapshot, ActionCenterStats, TaskView } from "./action-center";
import { computeUrgency } from "./urgency";

const PRIORITY_WEIGHT: Record<TaskPriority, number> = {
  urgent: 3,
  high: 2,
  medium: 1,
  low: 0,
};

export function toUtcDateString(now: Date): string {
  return now.toISOString().slice(0, 10);
}

export function buildTaskView(task: Task, todayUtc: string): TaskView {
  return {
    ...task,
    isOverdue: task.status !== "completed" && task.dueDate < todayUtc,
  };
}

function statusGroup(task: TaskView): number {
  return task.status === "completed" ? 1 : 0;
}

function byIdAsc(a: { id: string }, b: { id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0;
}

export function compareTaskViews(a: TaskView, b: TaskView): number {
  const group = statusGroup(a) - statusGroup(b);
  if (group !== 0) return group;

  if (a.status === "completed") {
    if (a.updatedAt !== b.updatedAt) return a.updatedAt < b.updatedAt ? 1 : -1;
    return byIdAsc(a, b);
  }

  if (a.isOverdue !== b.isOverdue) return a.isOverdue ? -1 : 1;

  const priority = PRIORITY_WEIGHT[b.priority] - PRIORITY_WEIGHT[a.priority];
  if (priority !== 0) return priority;

  if (a.dueDate !== b.dueDate) return a.dueDate < b.dueDate ? -1 : 1;

  return byIdAsc(a, b);
}

export function sortTaskViews(tasks: TaskView[]): TaskView[] {
  return [...tasks].sort(compareTaskViews);
}

export function computeStats(tasks: TaskView[], messages: Message[]): ActionCenterStats {
  let openTaskCount = 0;
  let completedTaskCount = 0;
  let overdueTaskCount = 0;
  let urgentOpenTaskCount = 0;

  for (const task of tasks) {
    if (task.status === "completed") {
      completedTaskCount += 1;
      continue;
    }
    openTaskCount += 1;
    if (task.isOverdue) overdueTaskCount += 1;
    if (task.priority === "urgent") urgentOpenTaskCount += 1;
  }

  const unreadMessageCount = messages.reduce((count, message) => count + (message.read ? 0 : 1), 0);

  return {
    totalTaskCount: tasks.length,
    openTaskCount,
    completedTaskCount,
    overdueTaskCount,
    urgentOpenTaskCount,
    totalMessageCount: messages.length,
    unreadMessageCount,
  };
}

function sortMessagesByReceivedDesc(messages: Message[]): Message[] {
  return [...messages].sort((a, b) =>
    a.receivedAt < b.receivedAt ? 1 : a.receivedAt > b.receivedAt ? -1 : 0,
  );
}

export function assembleActionCenter(
  student: Student,
  tasks: Task[],
  messages: Message[],
  now: Date,
): ActionCenterSnapshot {
  const todayUtc = toUtcDateString(now);
  const taskViews = tasks.map((task) => buildTaskView(task, todayUtc));
  const stats = computeStats(taskViews, messages);
  const urgency = computeUrgency({
    enrollmentStatus: student.enrollmentStatus,
    gpa: student.gpa,
    overdueOpenTaskCount: stats.overdueTaskCount,
    urgentOpenTaskCount: stats.urgentOpenTaskCount,
    unreadMessageCount: stats.unreadMessageCount,
  });

  return {
    student,
    urgency,
    stats,
    tasks: sortTaskViews(taskViews),
    messages: sortMessagesByReceivedDesc(messages),
    generatedAt: now.toISOString(),
  };
}
