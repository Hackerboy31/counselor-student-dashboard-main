import express, { type Express } from "express";
import cors from "cors";
import { config } from "./config";
import { createContainer, type Container, type ContainerOverrides } from "./container";
import { createRouter } from "./http/routes";
import { requestId } from "./http/middleware/request-id";
import { requestLogger } from "./http/middleware/request-logger";
import { notFoundHandler } from "./http/middleware/not-found";
import { errorHandler } from "./http/middleware/error-handler";

export interface AppDeps extends ContainerOverrides {
  container?: Container;
}

export interface CreatedApp {
  app: Express;
  container: Container;
}

export function createApp(deps: AppDeps = {}): CreatedApp {
  const container = deps.container ?? createContainer(deps);
  const app = express();

  app.disable("x-powered-by");

  app.use(
    cors({
      origin: config.corsOrigin,
      methods: ["GET", "PATCH", "OPTIONS"],
      exposedHeaders: ["X-Request-Id"],
    }),
  );
  app.use(requestId);
  app.use(requestLogger);
  app.use(express.json());

  app.use("/api", createRouter(container));

  app.use(notFoundHandler);
  app.use(errorHandler);

  return { app, container };
}
