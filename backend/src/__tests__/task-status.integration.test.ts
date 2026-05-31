import { describe, expect, it } from "vitest";
import request from "supertest";
import { buildTestApp } from "./helpers/test-app";

interface TaskLike {
  id: string;
  status: string;
  isOverdue: boolean;
}

describe("PATCH /api/tasks/:taskId/status", () => {
  it("updates a task and reflects the change (and recomputed urgency) on the next read", async () => {
    const { app } = buildTestApp();

    const patch = await request(app)
      .patch("/api/tasks/tsk_003/status")
      .send({ status: "completed" });

    expect(patch.status).toBe(200);
    expect(patch.body.task.status).toBe("completed");

    const after = await request(app).get("/api/students/stu_001/action-center");
    const task = after.body.tasks.find((t: TaskLike) => t.id === "tsk_003");

    expect(task.status).toBe("completed");
    expect(task.isOverdue).toBe(false);
    expect(after.body.stats.overdueTaskCount).toBe(0);

    expect(after.body.urgency.score).toBe(50);
    expect(after.body.urgency.level).toBe("high");
  });

  it("rejects an invalid status with 400 VALIDATION_ERROR and details", async () => {
    const { app } = buildTestApp();

    const res = await request(app)
      .patch("/api/tasks/tsk_001/status")
      .send({ status: "not_a_status" });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe("VALIDATION_ERROR");
    expect(res.body.error.details).toBeDefined();
    expect(res.body.error.requestId).toBe(res.headers["x-request-id"]);
  });

  it("returns 404 TASK_NOT_FOUND for an unknown task id", async () => {
    const { app } = buildTestApp();

    const res = await request(app)
      .patch("/api/tasks/tsk_999/status")
      .send({ status: "completed" });

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("TASK_NOT_FOUND");
  });
});
