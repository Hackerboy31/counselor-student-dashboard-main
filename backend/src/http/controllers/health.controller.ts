import type { Request, Response } from "express";
import type { HealthResponse } from "@csac/shared";

export function healthController(_req: Request, res: Response): void {
  const body: HealthResponse = {
    status: "ok",
    uptimeSec: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  };
  res.json(body);
}
