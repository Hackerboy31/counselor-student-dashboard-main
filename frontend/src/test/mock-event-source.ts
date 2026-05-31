type Listener = (event: Event) => void;

export class MockEventSource {
  static instances: MockEventSource[] = [];
  static reset(): void {
    MockEventSource.instances = [];
  }

  readonly url: string;
  readyState = 0;
  private readonly listeners = new Map<string, Set<Listener>>();

  constructor(url: string) {
    this.url = url;
    MockEventSource.instances.push(this);
  }

  addEventListener(type: string, listener: Listener): void {
    const set = this.listeners.get(type) ?? new Set<Listener>();
    set.add(listener);
    this.listeners.set(type, set);
  }

  removeEventListener(type: string, listener: Listener): void {
    this.listeners.get(type)?.delete(listener);
  }

  close(): void {
    this.readyState = 2;
  }

  emitOpen(): void {
    this.readyState = 1;
    this.dispatch("open", new Event("open"));
  }

  emitSnapshot(data: unknown): void {
    this.dispatch("snapshot", { data: JSON.stringify(data) } as MessageEvent);
  }

  emitError(): void {
    this.dispatch("error", new Event("error"));
  }

  private dispatch(type: string, event: Event): void {
    this.listeners.get(type)?.forEach((listener) => listener(event));
  }
}

export function installMockEventSource(): void {
  (globalThis as unknown as { EventSource: unknown }).EventSource = MockEventSource;
  MockEventSource.reset();
}
