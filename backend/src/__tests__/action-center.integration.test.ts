import { describe, expect, it } from "vitest";
import request from "supertest";
import { buildTestApp } from "./helpers/test-app";

describe("GET /api/students/:id/action-center", () => {
  it("returns Maya's aggregated, critical snapshot with the overdue task first", async () => {
    const { app } = buildTestApp();

    const res = await request(app).get("/api/students/stu_001/action-center");

    expect(res.status).toBe(200);
    expect(res.body.student.name).toBe("Maya Patel");
    expect(res.body.urgency.level).toBe("critical");
    expect(res.body.urgency.score).toBe(75);
    expect(res.body.stats.overdueTaskCount).toBe(1);
    expect(res.body.stats.urgentOpenTaskCount).toBe(2);
    expect(res.body.stats.unreadMessageCount).toBe(2);

    expect(res.body.tasks[0].id).toBe("tsk_003");
    expect(res.body.tasks[0].isOverdue).toBe(true);
    expect(res.body.tasks.at(-1).status).toBe("completed");

    expect(res.headers["x-request-id"]).toMatch(/.+/);
  });

  it("discriminates a healthy student (Jordan) as low urgency", async () => {
    const { app } = buildTestApp();

    const res = await request(app).get("/api/students/stu_002/action-center");

    expect(res.status).toBe(200);
    expect(res.body.urgency.level).toBe("low");
    expect(res.body.urgency.score).toBe(5);
    expect(res.body.stats.overdueTaskCount).toBe(0);
  });

  it("returns 404 STUDENT_NOT_FOUND with a correlated request id", async () => {
    const { app } = buildTestApp();

    const res = await request(app).get("/api/students/stu_999/action-center");

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe("STUDENT_NOT_FOUND");
    expect(res.body.error.requestId).toBe(res.headers["x-request-id"]);
  });
});
