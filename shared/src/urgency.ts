import type { EnrollmentStatus } from "./domain";
import type { UrgencyAssessment, UrgencyLevel, UrgencySignal } from "./action-center";

export interface UrgencyInput {
  enrollmentStatus: EnrollmentStatus;
  gpa: number;
  overdueOpenTaskCount: number;
  urgentOpenTaskCount: number;
  unreadMessageCount: number;
}

export const URGENCY_RUBRIC = {
  atRiskPoints: 30,
  overdueTaskPoints: 15,
  overdueTaskCap: 45,
  urgentTaskPoints: 10,
  urgentTaskCap: 30,
  unreadMessagePoints: 5,
  unreadMessageCap: 15,
  lowGpaSevereThreshold: 2.5,
  lowGpaSeverePoints: 20,
  lowGpaModerateThreshold: 3.0,
  lowGpaModeratePoints: 10,
  maxScore: 100,
} as const;

export const URGENCY_THRESHOLDS = {
  critical: 70,
  high: 45,
  moderate: 20,
} as const;

export function levelForScore(score: number): UrgencyLevel {
  if (score >= URGENCY_THRESHOLDS.critical) return "critical";
  if (score >= URGENCY_THRESHOLDS.high) return "high";
  if (score >= URGENCY_THRESHOLDS.moderate) return "moderate";
  return "low";
}

function countLabel(count: number, noun: string): string {
  return `${count} ${count === 1 ? noun : `${noun}s`}`;
}

export function computeUrgency(input: UrgencyInput): UrgencyAssessment {
  const r = URGENCY_RUBRIC;
  const signals: UrgencySignal[] = [];

  if (input.enrollmentStatus === "at_risk") {
    signals.push({
      code: "AT_RISK_ENROLLMENT",
      label: "Flagged at-risk",
      detail: "Enrollment status is at-risk",
      weight: r.atRiskPoints,
    });
  }

  if (input.overdueOpenTaskCount > 0) {
    signals.push({
      code: "OVERDUE_TASKS",
      label: countLabel(input.overdueOpenTaskCount, "overdue task"),
      detail: `${countLabel(input.overdueOpenTaskCount, "open task")} past the due date`,
      weight: Math.min(input.overdueOpenTaskCount * r.overdueTaskPoints, r.overdueTaskCap),
    });
  }

  if (input.urgentOpenTaskCount > 0) {
    signals.push({
      code: "URGENT_TASKS",
      label: `${countLabel(input.urgentOpenTaskCount, "urgent task")} open`,
      detail: `${countLabel(input.urgentOpenTaskCount, "open task")} marked urgent`,
      weight: Math.min(input.urgentOpenTaskCount * r.urgentTaskPoints, r.urgentTaskCap),
    });
  }

  if (input.unreadMessageCount > 0) {
    signals.push({
      code: "UNREAD_MESSAGES",
      label: countLabel(input.unreadMessageCount, "unread message"),
      detail: "Messages awaiting the counselor's review",
      weight: Math.min(input.unreadMessageCount * r.unreadMessagePoints, r.unreadMessageCap),
    });
  }

  if (input.gpa < r.lowGpaSevereThreshold) {
    signals.push({
      code: "LOW_GPA",
      label: `GPA ${input.gpa.toFixed(1)} below threshold`,
      detail: `GPA is under ${r.lowGpaSevereThreshold.toFixed(1)}`,
      weight: r.lowGpaSeverePoints,
    });
  } else if (input.gpa < r.lowGpaModerateThreshold) {
    signals.push({
      code: "LOW_GPA",
      label: `GPA ${input.gpa.toFixed(1)} needs monitoring`,
      detail: `GPA is under ${r.lowGpaModerateThreshold.toFixed(1)}`,
      weight: r.lowGpaModeratePoints,
    });
  }

  const score = Math.min(
    signals.reduce((sum, signal) => sum + signal.weight, 0),
    r.maxScore,
  );

  return { level: levelForScore(score), score, signals };
}
