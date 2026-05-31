import {
  assembleActionCenter,
  type ActionCenterSnapshot,
  type RosterEntry,
} from "@csac/shared";
import type { Repositories } from "../data/repository";
import type { Clock } from "../lib/clock";
import { NotFoundError } from "../http/errors";

export class ActionCenterService {
  constructor(
    private readonly repos: Repositories,
    private readonly clock: Clock,
  ) {}

  getActionCenter(studentId: string): ActionCenterSnapshot {
    const student = this.repos.students.findById(studentId);
    if (!student) {
      throw new NotFoundError("STUDENT_NOT_FOUND", `No student with id '${studentId}'.`);
    }

    const tasks = this.repos.tasks.listByStudent(studentId);
    const messages = this.repos.messages.listByStudent(studentId);

    return assembleActionCenter(student, tasks, messages, this.clock.now());
  }

  getRoster(counselorId: string): RosterEntry[] {
    const now = this.clock.now();

    return this.repos.students
      .listByCounselor(counselorId)
      .map((student) => {
        const snapshot = assembleActionCenter(
          student,
          this.repos.tasks.listByStudent(student.id),
          this.repos.messages.listByStudent(student.id),
          now,
        );
        return {
          id: student.id,
          name: student.name,
          grade: student.grade,
          enrollmentStatus: student.enrollmentStatus,
          urgency: { level: snapshot.urgency.level, score: snapshot.urgency.score },
          openTaskCount: snapshot.stats.openTaskCount,
          unreadMessageCount: snapshot.stats.unreadMessageCount,
        } satisfies RosterEntry;
      })
      .sort((a, b) => b.urgency.score - a.urgency.score || a.name.localeCompare(b.name));
  }
}
