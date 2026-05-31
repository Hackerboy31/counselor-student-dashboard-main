export const queryKeys = {
  roster: (counselorId: string) => ["roster", counselorId] as const,
  actionCenter: (studentId: string) => ["action-center", studentId] as const,
};
