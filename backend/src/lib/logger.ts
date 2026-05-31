import pino, { type Logger } from "pino";
import { config } from "../config";

export const logger: Logger = pino({
  level: config.logLevel,
  ...(config.logPretty
    ? {
        transport: {
          target: "pino-pretty",
          options: { colorize: true, translateTime: "HH:MM:ss", ignore: "pid,hostname" },
        },
      }
    : {}),
});

export type { Logger };
