import type { Response } from "express";
import { SSE_SNAPSHOT_EVENT, type ActionCenterSnapshot } from "@csac/shared";

const HEARTBEAT_INTERVAL_MS = 15_000;

const MAX_CONNECTIONS_PER_STUDENT = 8;

interface SseConnection {
  res: Response;
  heartbeat: NodeJS.Timeout;
}

export class SseHub {
  private readonly connectionsByStudent = new Map<string, Set<SseConnection>>();
  private nextEventId = 1;

  addConnection(studentId: string, res: Response): SseConnection {
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    });
    res.write("retry: 3000\n\n");

    const heartbeat = setInterval(() => {
      res.write(": heartbeat\n\n");
    }, HEARTBEAT_INTERVAL_MS);
    heartbeat.unref?.();

    const connection: SseConnection = { res, heartbeat };
    const set = this.connectionsByStudent.get(studentId) ?? new Set<SseConnection>();

    while (set.size >= MAX_CONNECTIONS_PER_STUDENT) {
      const oldest = set.values().next().value;
      if (!oldest) break;
      set.delete(oldest);
      clearInterval(oldest.heartbeat);
      oldest.res.end();
    }

    set.add(connection);
    this.connectionsByStudent.set(studentId, set);
    return connection;
  }

  removeConnection(studentId: string, connection: SseConnection): void {
    clearInterval(connection.heartbeat);
    const set = this.connectionsByStudent.get(studentId);
    if (!set) return;
    set.delete(connection);
    if (set.size === 0) this.connectionsByStudent.delete(studentId);
  }

  sendSnapshot(connection: SseConnection, snapshot: ActionCenterSnapshot): void {
    this.writeSnapshot(connection.res, snapshot);
  }

  broadcast(studentId: string, snapshot: ActionCenterSnapshot): void {
    const set = this.connectionsByStudent.get(studentId);
    if (!set) return;
    for (const connection of set) this.writeSnapshot(connection.res, snapshot);
  }

  closeAll(): void {
    for (const set of this.connectionsByStudent.values()) {
      for (const connection of set) {
        clearInterval(connection.heartbeat);
        connection.res.end();
      }
    }
    this.connectionsByStudent.clear();
  }

  private writeSnapshot(res: Response, snapshot: ActionCenterSnapshot): void {
    const id = this.nextEventId++;
    res.write(`id: ${id}\n`);
    res.write(`event: ${SSE_SNAPSHOT_EVENT}\n`);
    res.write(`data: ${JSON.stringify(snapshot)}\n\n`);
  }
}
