import type { ApiError, ApiResponse } from "@bbw/shared";

export interface ApiClientOptions {
  readonly baseUrl: string;
  readonly getToken?: () => string | undefined | Promise<string | undefined>;
  readonly timeoutMs?: number;
  readonly fetchImpl?: typeof fetch;
}

export class ApiClientError extends Error {
  public readonly code: string;
  public readonly status: number;
  public readonly correlationId: string | undefined;
  public readonly fields: readonly { field: string; message: string }[] | undefined;

  public constructor(
    message: string,
    details: { code: string; status: number; correlationId?: string; fields?: ApiError["fields"] },
  ) {
    super(message);
    this.name = "ApiClientError";
    this.code = details.code;
    this.status = details.status;
    this.correlationId = details.correlationId;
    this.fields = details.fields;
  }
}

function requestId(): string {
  return (
    globalThis.crypto?.randomUUID?.() ?? `corr_${Date.now()}_${Math.random().toString(36).slice(2)}`
  );
}

export class ApiClient {
  private readonly options: Required<Pick<ApiClientOptions, "baseUrl" | "timeoutMs">> &
    ApiClientOptions;

  public constructor(options: ApiClientOptions) {
    this.options = { timeoutMs: 10_000, ...options };
  }

  public async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), this.options.timeoutMs);
    const correlationId = requestId();
    try {
      const token = await this.options.getToken?.();
      const headers = new Headers(init.headers);
      headers.set("accept", "application/json");
      headers.set("x-request-id", correlationId);
      if (token) headers.set("authorization", `Bearer ${token}`);
      const response = await (this.options.fetchImpl ?? fetch)(
        new URL(path, this.options.baseUrl),
        { ...init, headers, signal: controller.signal },
      );
      let payload: ApiResponse<T> | undefined;
      try {
        payload = (await response.json()) as ApiResponse<T>;
      } catch {
        throw new ApiClientError("API returned invalid JSON", {
          code: "INVALID_RESPONSE",
          status: response.status,
          correlationId,
        });
      }
      if (!response.ok || !payload.ok) {
        const error = payload.ok ? undefined : payload.error;
        throw new ApiClientError(error?.message ?? "API request failed", {
          code: error?.code ?? `HTTP_${response.status}`,
          status: response.status,
          correlationId: error?.correlationId ?? correlationId,
          fields: error?.fields,
        });
      }
      return payload.data;
    } catch (error) {
      if (error instanceof ApiClientError) throw error;
      if (error instanceof DOMException && error.name === "AbortError") {
        throw new ApiClientError("API request timed out", {
          code: "TIMEOUT",
          status: 408,
          correlationId,
        });
      }
      throw new ApiClientError("API request failed", {
        code: "NETWORK_ERROR",
        status: 0,
        correlationId,
      });
    } finally {
      clearTimeout(timeout);
    }
  }
}

export function createApiClient(options: ApiClientOptions): ApiClient {
  return new ApiClient(options);
}
