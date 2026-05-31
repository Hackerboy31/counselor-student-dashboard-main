import { createInMemoryRepositories } from "./data/in-memory-repository";
import type { Repositories } from "./data/repository";
import { SystemClock, type Clock } from "./lib/clock";
import { ActionCenterService } from "./services/action-center.service";
import { TaskService } from "./services/task.service";
import { TypedEventBus } from "./realtime/event-bus";
import { SseHub } from "./realtime/sse";

export interface Container {
  repos: Repositories;
  clock: Clock;
  bus: TypedEventBus;
  sseHub: SseHub;
  actionCenterService: ActionCenterService;
  taskService: TaskService;
}

export interface ContainerOverrides {
  repos?: Repositories;
  clock?: Clock;
}

export function createContainer(overrides: ContainerOverrides = {}): Container {
  const repos = overrides.repos ?? createInMemoryRepositories();
  const clock = overrides.clock ?? new SystemClock();
  const bus = new TypedEventBus();
  const sseHub = new SseHub();

  const actionCenterService = new ActionCenterService(repos, clock);
  const taskService = new TaskService(repos, clock, bus);

  bus.on("taskChanged", ({ studentId }) => {
    const snapshot = actionCenterService.getActionCenter(studentId);
    sseHub.broadcast(studentId, snapshot);
  });

  return { repos, clock, bus, sseHub, actionCenterService, taskService };
}
