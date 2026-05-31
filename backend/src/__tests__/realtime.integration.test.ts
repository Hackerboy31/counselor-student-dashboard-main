import { describe, expect, it } from "vitest";
import type { Response } from "express";
import { createContainer } from "../container";
import { FixedClock } from "../lib/clock";

function fakeResponse() {
  const chunks: string[] = [];
  const res = {
    chunks,
    writeHead: () => res,
    write: (chunk: string) => {
      chunks.push(chunk);
      return true;
    },
    end: () => undefined,
  };
  return res;
}

describe("realtime task-change broadcast", () => {
  it("pushes a refreshed snapshot to a student's subscribers when their task changes", () => {
    const container = createContainer({ clock: new FixedClock("2026-05-31T12:00:00Z") });
    const res = fakeResponse();
    const connection = container.sseHub.addConnection(
      "stu_001",
      res as unknown as Response,
    );

    container.taskService.updateStatus("tsk_001", "completed");

    const stream = res.chunks.join("");
    expect(stream).toContain("event: snapshot");
    expect(stream).toContain('"id":"stu_001"');
    expect(stream).toContain('"id":"tsk_001"');

    container.sseHub.removeConnection("stu_001", connection);
  });

  it("does not broadcast to subscribers of a different student", () => {
    const container = createContainer({ clock: new FixedClock("2026-05-31T12:00:00Z") });
    const res = fakeResponse();
    const connection = container.sseHub.addConnection(
      "stu_002",
      res as unknown as Response,
    );

    const before = res.chunks.length;
    container.taskService.updateStatus("tsk_001", "completed");
    expect(res.chunks.length).toBe(before);

    container.sseHub.removeConnection("stu_002", connection);
  });
});
