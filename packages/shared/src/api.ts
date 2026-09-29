export type ApiErrorCode =
  | "BAD_REQUEST"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "RATE_LIMITED"
  | "INTERNAL_ERROR";

export interface FieldError {
  readonly field: string;
  readonly message: string;
}

export interface ApiError {
  readonly code: ApiErrorCode;
  readonly message: string;
  readonly correlationId: string;
  readonly fields?: readonly FieldError[];
}

export type ApiResponse<T> =
  | { readonly ok: true; readonly data: T; readonly correlationId: string }
  | { readonly ok: false; readonly error: ApiError };

export interface PaginatedData<T> {
  readonly items: readonly T[];
  readonly nextCursor?: string;
}

export function success<T>(data: T, correlationId: string): ApiResponse<T> {
  return { ok: true, data, correlationId };
}

export function failure(
  code: ApiErrorCode,
  message: string,
  correlationId: string,
  fields?: readonly FieldError[],
): ApiResponse<never> {
  return { ok: false, error: { code, message, correlationId, ...(fields ? { fields } : {}) } };
}

export function isApiFailure<T>(
  response: ApiResponse<T>,
): response is Extract<ApiResponse<T>, { ok: false }> {
  return !response.ok;
}

export const apiOpenApiExamples = {
  success: success({ id: "org_acme" }, "corr_01"),
  validationError: failure("BAD_REQUEST", "Request validation failed", "corr_02", [
    { field: "name", message: "Required" },
  ]),
  unauthorized: failure("UNAUTHORIZED", "Authentication required", "corr_03"),
} as const;
