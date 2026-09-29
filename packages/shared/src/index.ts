export type Brand<Value, Name extends string> = Value & { readonly __brand: Name };

export type OrganizationId = Brand<string, "OrganizationId">;
export type UserId = Brand<string, "UserId">;
export type ActorId = UserId | OrganizationId | Brand<string, "SystemActorId">;
export type IsoTimestamp = Brand<string, "IsoTimestamp">;

const identifierPattern = /^[a-z][a-z0-9_-]{1,63}$/;

function parseIdentifier(value: unknown, label: string): string {
  if (typeof value !== "string" || !identifierPattern.test(value)) {
    throw new Error(`${label} must be a lowercase identifier`);
  }
  return value;
}

export function parseOrganizationId(value: unknown): OrganizationId {
  return parseIdentifier(value, "organizationId") as OrganizationId;
}

export function parseUserId(value: unknown): UserId {
  return parseIdentifier(value, "userId") as UserId;
}

export function parseSystemActorId(value: unknown): Brand<string, "SystemActorId"> {
  return parseIdentifier(value, "systemActorId") as Brand<string, "SystemActorId">;
}

export function parseIsoTimestamp(value: unknown): IsoTimestamp {
  if (
    typeof value !== "string" ||
    !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value)
  ) {
    throw new Error("timestamp must be an ISO-8601 UTC timestamp");
  }
  const date = new Date(value);
  if (Number.isNaN(date.valueOf())) throw new Error("timestamp must be valid");
  return value as IsoTimestamp;
}

export interface PageRequest {
  readonly limit: number;
  readonly cursor?: string;
}

export function parsePageRequest(value: unknown): PageRequest {
  if (!value || typeof value !== "object") throw new Error("page request must be an object");
  const request = value as { limit?: unknown; cursor?: unknown };
  const limit = request.limit;
  if (typeof limit !== "number" || !Number.isInteger(limit) || limit < 1 || limit > 100) {
    throw new Error("page limit must be an integer from 1 to 100");
  }
  if (
    request.cursor !== undefined &&
    (typeof request.cursor !== "string" || request.cursor.length > 512)
  ) {
    throw new Error("page cursor must be a string of at most 512 characters");
  }
  return { limit, ...(request.cursor === undefined ? {} : { cursor: request.cursor }) };
}

export type CurrencyCode = "USD" | "EUR" | "GBP";
export interface Money {
  readonly amountMinor: number;
  readonly currency: CurrencyCode;
}

export function parseMoney(value: unknown): Money {
  if (!value || typeof value !== "object") throw new Error("money must be an object");
  const money = value as { amountMinor?: unknown; currency?: unknown };
  const amountMinor = money.amountMinor;
  if (typeof amountMinor !== "number" || !Number.isSafeInteger(amountMinor) || amountMinor < 0) {
    throw new Error("money amountMinor must be a non-negative safe integer");
  }
  if (money.currency !== "USD" && money.currency !== "EUR" && money.currency !== "GBP") {
    throw new Error("money currency is unsupported");
  }
  return { amountMinor, currency: money.currency };
}

export type ActorType = "member" | "management" | "system";
export interface Actor {
  readonly type: ActorType;
  readonly id: ActorId;
}

export interface TenantContext {
  readonly tenantId: OrganizationId;
  readonly actor: Actor;
}

export function parseActor(value: unknown): Actor {
  if (!value || typeof value !== "object") throw new Error("actor must be an object");
  const actor = value as { type?: unknown; id?: unknown };
  if (actor.type !== "member" && actor.type !== "management" && actor.type !== "system") {
    throw new Error("actor type is unsupported");
  }
  return { type: actor.type, id: parseIdentifier(actor.id, "actor id") as ActorId };
}

export function parseTenantContext(value: unknown): TenantContext {
  if (!value || typeof value !== "object") throw new Error("tenant context must be an object");
  const context = value as { tenantId?: unknown; actor?: unknown };
  return { tenantId: parseOrganizationId(context.tenantId), actor: parseActor(context.actor) };
}

export * from "./analytics.js";
export * from "./api.js";
