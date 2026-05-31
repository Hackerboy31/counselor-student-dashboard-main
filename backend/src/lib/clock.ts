export interface Clock {
  now(): Date;
}

export class SystemClock implements Clock {
  now(): Date {
    return new Date();
  }
}

export class FixedClock implements Clock {
  private readonly instant: Date;

  constructor(instant: string | Date) {
    this.instant = typeof instant === "string" ? new Date(instant) : new Date(instant);
  }

  now(): Date {
    return new Date(this.instant);
  }
}
