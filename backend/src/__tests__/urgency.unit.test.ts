import { describe, expect, it } from "vitest";
import { computeUrgency, levelForScore, URGENCY_RUBRIC, type UrgencyInput } from "@csac/shared";

const calmStudent: UrgencyInput = {
  enrollmentStatus: "active",
  gpa: 4.0,
  overdueOpenTaskCount: 0,
  urgentOpenTaskCount: 0,
  unreadMessageCount: 0,
};

describe("levelForScore boundaries", () => {
  it.each([
    [0, "low"],
    [19, "low"],
    [20, "moderate"],
    [44, "moderate"],
    [45, "high"],
    [69, "high"],
    [70, "critical"],
    [100, "critical"],
  ] as const)("score %i maps to %s", (score, level) => {
    expect(levelForScore(score)).toBe(level);
  });
});

describe("computeUrgency", () => {
  it("returns low with no signals for a calm, active student", () => {
    const result = computeUrgency(calmStudent);
    expect(result.score).toBe(0);
    expect(result.level).toBe("low");
    expect(result.signals).toHaveLength(0);
  });

  it("adds the at-risk enrollment weight", () => {
    const result = computeUrgency({ ...calmStudent, enrollmentStatus: "at_risk" });
    expect(result.score).toBe(URGENCY_RUBRIC.atRiskPoints);
    expect(result.signals.map((s) => s.code)).toContain("AT_RISK_ENROLLMENT");
  });

  it("caps the overdue-task contribution", () => {
    const result = computeUrgency({ ...calmStudent, overdueOpenTaskCount: 10 });
    expect(result.signals.find((s) => s.code === "OVERDUE_TASKS")?.weight).toBe(
      URGENCY_RUBRIC.overdueTaskCap,
    );
  });

  it("caps the urgent-task contribution", () => {
    const result = computeUrgency({ ...calmStudent, urgentOpenTaskCount: 10 });
    expect(result.signals.find((s) => s.code === "URGENT_TASKS")?.weight).toBe(
      URGENCY_RUBRIC.urgentTaskCap,
    );
  });

  it("caps the unread-message contribution", () => {
    const result = computeUrgency({ ...calmStudent, unreadMessageCount: 10 });
    expect(result.signals.find((s) => s.code === "UNREAD_MESSAGES")?.weight).toBe(
      URGENCY_RUBRIC.unreadMessageCap,
    );
  });

  it("uses the severe low-GPA band below 2.5", () => {
    const result = computeUrgency({ ...calmStudent, gpa: 2.4 });
    expect(result.signals.find((s) => s.code === "LOW_GPA")?.weight).toBe(
      URGENCY_RUBRIC.lowGpaSeverePoints,
    );
  });

  it("uses the moderate low-GPA band between 2.5 and 3.0", () => {
    const result = computeUrgency({ ...calmStudent, gpa: 2.8 });
    expect(result.signals.find((s) => s.code === "LOW_GPA")?.weight).toBe(
      URGENCY_RUBRIC.lowGpaModeratePoints,
    );
  });

  it("emits no low-GPA signal at or above 3.0", () => {
    const result = computeUrgency({ ...calmStudent, gpa: 3.0 });
    expect(result.signals.find((s) => s.code === "LOW_GPA")).toBeUndefined();
  });

  it("clamps the total score to the rubric maximum", () => {
    const result = computeUrgency({
      enrollmentStatus: "at_risk",
      gpa: 1.0,
      overdueOpenTaskCount: 10,
      urgentOpenTaskCount: 10,
      unreadMessageCount: 10,
    });
    expect(result.score).toBe(URGENCY_RUBRIC.maxScore);
    expect(result.level).toBe("critical");
  });
});
