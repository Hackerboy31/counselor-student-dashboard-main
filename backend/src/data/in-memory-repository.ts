import type { Message, Student, Task, TaskStatus } from "@csac/shared";
import type { Repositories } from "./repository";
import { messages as seedMessages, students as seedStudents, tasks as seedTasks } from "./seed";

function clone<T>(value: T): T {
  return structuredClone(value);
}

class InMemoryStore {
  private readonly studentsById = new Map<string, Student>();
  private readonly tasksById = new Map<string, Task>();
  private readonly messagesById = new Map<string, Message>();

  constructor() {
    for (const student of seedStudents) this.studentsById.set(student.id, clone(student));
    for (const task of seedTasks) this.tasksById.set(task.id, clone(task));
    for (const message of seedMessages) this.messagesById.set(message.id, clone(message));
  }

  findStudentById(id: string): Student | null {
    const student = this.studentsById.get(id);
    return student ? clone(student) : null;
  }

  listStudentsByCounselor(counselorId: string): Student[] {
    return [...this.studentsById.values()]
      .filter((student) => student.counselorId === counselorId)
      .map(clone);
  }

  listTasksByStudent(studentId: string): Task[] {
    return [...this.tasksById.values()]
      .filter((task) => task.studentId === studentId)
      .map(clone);
  }

  findTaskById(taskId: string): Task | null {
    const task = this.tasksById.get(taskId);
    return task ? clone(task) : null;
  }

  updateTaskStatus(taskId: string, status: TaskStatus, now: Date): Task | null {
    const task = this.tasksById.get(taskId);
    if (!task) return null;
    task.status = status;
    task.updatedAt = now.toISOString();
    return clone(task);
  }

  listMessagesByStudent(studentId: string): Message[] {
    return [...this.messagesById.values()]
      .filter((message) => message.studentId === studentId)
      .map(clone);
  }
}

export function createInMemoryRepositories(): Repositories {
  const store = new InMemoryStore();

  return {
    students: {
      findById: (id) => store.findStudentById(id),
      listByCounselor: (counselorId) => store.listStudentsByCounselor(counselorId),
    },
    tasks: {
      listByStudent: (studentId) => store.listTasksByStudent(studentId),
      findById: (taskId) => store.findTaskById(taskId),
      updateStatus: (taskId, status, now) => store.updateTaskStatus(taskId, status, now),
    },
    messages: {
      listByStudent: (studentId) => store.listMessagesByStudent(studentId),
    },
  };
}
