import { EventEmitter } from "node:events";

export interface TaskChangedEvent {
  studentId: string;
  taskId: string;
}

interface EventMap {
  taskChanged: [TaskChangedEvent];
}

export class TypedEventBus {
  private readonly emitter = new EventEmitter();

  emit<K extends keyof EventMap>(event: K, ...payload: EventMap[K]): void {
    this.emitter.emit(event, ...payload);
  }

  on<K extends keyof EventMap>(event: K, listener: (...payload: EventMap[K]) => void): () => void {
    const wrapped = listener as (...args: unknown[]) => void;
    this.emitter.on(event, wrapped);
    return () => this.emitter.off(event, wrapped);
  }
}
