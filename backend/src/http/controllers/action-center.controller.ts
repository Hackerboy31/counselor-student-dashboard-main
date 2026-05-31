import type { Request, Response } from "express";
import type { ActionCenterResponse, RosterResponse } from "@csac/shared";
import type { ActionCenterService } from "../../services/action-center.service";
import type { SseHub } from "../../realtime/sse";

const DEFAULT_COUNSELOR_ID = "csl_001";

function studentId(req: Request): string {
  return (req.params as { id: string }).id;
}

export class ActionCenterController {
  constructor(
    private readonly service: ActionCenterService,
    private readonly sseHub: SseHub,
  ) {}

  getRoster = (req: Request, res: Response): void => {
    const raw = req.query.counselorId;
    const counselorId = typeof raw === "string" && raw.length > 0 ? raw : DEFAULT_COUNSELOR_ID;
    const body: RosterResponse = { students: this.service.getRoster(counselorId) };
    res.json(body);
  };

  getActionCenter = (req: Request, res: Response): void => {
    const snapshot: ActionCenterResponse = this.service.getActionCenter(studentId(req));
    res.json(snapshot);
  };

  streamActionCenter = (req: Request, res: Response): void => {
    const id = studentId(req);
    const snapshot = this.service.getActionCenter(id);

    const connection = this.sseHub.addConnection(id, res);
    this.sseHub.sendSnapshot(connection, snapshot);

    req.on("close", () => this.sseHub.removeConnection(id, connection));
  };
}
