import type { ErrorCode, ErrorEnvelope } from "@csac/shared";

const API_BASE = "/api";

type ApiErrorCode = ErrorCode | "NETWORK_ERROR" | "UNKNOWN";

export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly status: number;
  readonly requestId: string | undefined;

  constructor(message: string, options: { code: ApiErrorCode; status: number; requestId?: string }) {
    super(message);
    this.name = "ApiError";
    this.code = options.code;
    this.status = options.status;
    this.requestId = options.requestId;
  }
}

export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Network request failed. Is the API running?", {
      code: "NETWORK_ERROR",
      status: 0,
    });
  }

  if (!response.ok) {
    const envelope = (await response.json().catch(() => null)) as ErrorEnvelope | null;
    throw new ApiError(envelope?.error?.message ?? `Request failed (${response.status}).`, {
      code: envelope?.error?.code ?? "UNKNOWN",
      status: response.status,
      requestId: envelope?.error?.requestId,
    });
  }

  return (await response.json()) as T;
}
