import type { ErrorCode } from "@csac/shared";

export class AppError extends Error {
  readonly statusCode: number;
  readonly code: ErrorCode;
  readonly details: unknown;

  constructor(statusCode: number, code: ErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = new.target.name;
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(code: Extract<ErrorCode, "STUDENT_NOT_FOUND" | "TASK_NOT_FOUND" | "NOT_FOUND">, message: string) {
    super(404, code, message);
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details: unknown) {
    super(400, "VALIDATION_ERROR", message, details);
  }
}
