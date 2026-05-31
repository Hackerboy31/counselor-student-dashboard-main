import { describe, expect, it } from "vitest";
import { assembleActionCenter, type ActionCenterSnapshot } from "@csac/shared";
import { messages, students, tasks } from "../data/seed";

const NOW = new Date("2026-05-31T12:00:00Z");

function snapshotFor(studentId: string): ActionCenterSnapshot {
  const student = students.find((s) => s.id === studentId);
  if (!student) throw new Error(`missing seed student ${studentId}`);
  return assembleActionCenter(
    student,
    tasks.filter((t) => t.studentId === studentId),
    messages.filter((m) => m.studentId === studentId),
    NOW,
  );
}

describe("assembleActionCenter (seed data, today = 2026-05-31)", () => {
  it("scores Maya (stu_001) as critical and surfaces the overdue task first", () => {
    const snapshot = snapshotFor("stu_001");

    expect(snapshot.urgency.level).toBe("critical");
    expect(snapshot.urgency.score).toBe(75);
    expect(snapshot.stats.overdueTaskCount).toBe(1);
    expect(snapshot.stats.urgentOpenTaskCount).toBe(2);
    expect(snapshot.stats.unreadMessageCount).toBe(2);

    expect(snapshot.tasks[0]?.id).toBe("tsk_003");
    expect(snapshot.tasks[0]?.isOverdue).toBe(true);
    expect(snapshot.tasks.at(-1)?.id).toBe("tsk_005");
    expect(snapshot.tasks.at(-1)?.status).toBe("completed");

    expect(snapshot.messages[0]?.id).toBe("msg_001");
  });

  it("scores Carlos (stu_003) as critical (low GPA + overdue + at-risk)", () => {
    const snapshot = snapshotFor("stu_003");
    expect(snapshot.urgency.level).toBe("critical");
    expect(snapshot.urgency.score).toBe(85);
  });

  it("scores Jordan (stu_002) as low", () => {
    const snapshot = snapshotFor("stu_002");
    expect(snapshot.urgency.level).toBe("low");
    expect(snapshot.urgency.score).toBe(5);
    expect(snapshot.stats.overdueTaskCount).toBe(0);
  });
});
