import { createApp, type CreatedApp } from "../../app";
import { FixedClock } from "../../lib/clock";

export const TEST_NOW = "2026-05-31T12:00:00Z";

export function buildTestApp(): CreatedApp {
  return createApp({ clock: new FixedClock(TEST_NOW) });
}
