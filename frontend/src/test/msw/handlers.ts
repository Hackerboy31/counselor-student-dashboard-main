import { http, HttpResponse } from "msw";
import { buildMayaSnapshot, mayaTasks, rosterResponse, FIXED_NOW } from "../fixtures";

function errorEnvelope(code: string, message: string, status: number) {
  return HttpResponse.json(
    { error: { code, message, requestId: "test-request-id" } },
    { status },
  );
}

export const handlers = [
  http.get("/api/students", () => HttpResponse.json(rosterResponse)),

  http.get("/api/students/:id/action-center", ({ params }) => {
    if (params.id !== "stu_001") {
      return errorEnvelope("STUDENT_NOT_FOUND", `No student with id '${String(params.id)}'.`, 404);
    }
    return HttpResponse.json(buildMayaSnapshot());
  }),

  http.patch("/api/tasks/:taskId/status", async ({ params, request }) => {
    const { status } = (await request.json()) as { status: string };
    const task = mayaTasks.find((candidate) => candidate.id === params.taskId);
    if (!task) {
      return errorEnvelope("TASK_NOT_FOUND", `No task with id '${String(params.taskId)}'.`, 404);
    }
    return HttpResponse.json({
      task: { ...task, status, updatedAt: FIXED_NOW.toISOString() },
    });
  }),
];
