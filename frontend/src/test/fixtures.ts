import {
  assembleActionCenter,
  type ActionCenterResponse,
  type Message,
  type RosterResponse,
  type Student,
  type Task,
} from "@csac/shared";

export const FIXED_NOW = new Date("2026-05-31T12:00:00Z");

export const maya: Student = {
  id: "stu_001",
  name: "Maya Patel",
  email: "maya.patel@school.edu",
  grade: 11,
  gpa: 3.2,
  counselorId: "csl_001",
  enrollmentStatus: "at_risk",
};

export const mayaTasks: Task[] = [
  {
    id: "tsk_003",
    studentId: "stu_001",
    title: "Attendance improvement plan",
    description: "Student missed 8 days this semester. Plan must be signed.",
    status: "todo",
    priority: "urgent",
    dueDate: "2026-05-28",
    createdAt: "2026-05-15T11:00:00Z",
    updatedAt: "2026-05-15T11:00:00Z",
  },
  {
    id: "tsk_001",
    studentId: "stu_001",
    title: "Submit FAFSA application",
    description: "Deadline is approaching. Student has not started the form.",
    status: "todo",
    priority: "urgent",
    dueDate: "2026-06-05",
    createdAt: "2026-05-13T14:00:00Z",
    updatedAt: "2026-05-13T14:00:00Z",
  },
  {
    id: "tsk_004",
    studentId: "stu_001",
    title: "Review college interest list",
    description: "Compile 5 target schools based on GPA and interests.",
    status: "todo",
    priority: "medium",
    dueDate: "2026-07-01",
    createdAt: "2026-05-23T08:00:00Z",
    updatedAt: "2026-05-23T08:00:00Z",
  },
  {
    id: "tsk_005",
    studentId: "stu_001",
    title: "Parent meeting scheduled",
    description: "Coordinate a meeting with guardian to discuss current standing.",
    status: "completed",
    priority: "high",
    dueDate: "2026-05-18",
    createdAt: "2026-05-04T10:00:00Z",
    updatedAt: "2026-05-17T11:00:00Z",
  },
];

export const mayaMessages: Message[] = [
  {
    id: "msg_001",
    studentId: "stu_001",
    from: "Mrs. Thompson (Math)",
    subject: "Maya missing assignments",
    preview: "Maya has not submitted the last three homework sets...",
    read: false,
    receivedAt: "2026-05-30T08:30:00Z",
  },
  {
    id: "msg_002",
    studentId: "stu_001",
    from: "Maya Patel",
    subject: "Can we meet this week?",
    preview: "Hi, I was wondering if you had any time to chat about my grades...",
    read: false,
    receivedAt: "2026-05-29T17:00:00Z",
  },
  {
    id: "msg_003",
    studentId: "stu_001",
    from: "Attendance Office",
    subject: "Absence notification",
    preview: "Maya was marked absent on May 25. Please follow up...",
    read: true,
    receivedAt: "2026-05-25T09:00:00Z",
  },
];

export function buildMayaSnapshot(): ActionCenterResponse {
  return assembleActionCenter(maya, mayaTasks, mayaMessages, FIXED_NOW);
}

export const rosterResponse: RosterResponse = {
  students: [
    {
      id: "stu_001",
      name: "Maya Patel",
      grade: 11,
      enrollmentStatus: "at_risk",
      urgency: { level: "critical", score: 75 },
      openTaskCount: 3,
      unreadMessageCount: 2,
    },
  ],
};
