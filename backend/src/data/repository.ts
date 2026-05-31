import type { Message, Student, Task, TaskStatus } from "@csac/shared";

export interface StudentRepository {
  findById(id: string): Student | null;
  listByCounselor(counselorId: string): Student[];
}

export interface TaskRepository {
  listByStudent(studentId: string): Task[];
  findById(taskId: string): Task | null;
  updateStatus(taskId: string, status: TaskStatus, now: Date): Task | null;
}

export interface MessageRepository {
  listByStudent(studentId: string): Message[];
}

export interface Repositories {
  students: StudentRepository;
  tasks: TaskRepository;
  messages: MessageRepository;
}
