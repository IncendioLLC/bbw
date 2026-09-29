import type { OrganizationId, UserId } from "./index.js";

export type AnalyticsEventName =
  | "acquisition.landing_viewed"
  | "onboarding.completed"
  | "engagement.dashboard_viewed"
  | "sharing.snapshot_created"
  | "reliability.client_error";

export interface AnalyticsEventMap {
  "acquisition.landing_viewed": { readonly source?: string };
  "onboarding.completed": {
    readonly organizationId: OrganizationId;
    readonly role: "founder" | "service_provider" | "vc";
  };
  "engagement.dashboard_viewed": {
    readonly organizationId: OrganizationId;
    readonly userId: UserId;
  };
  "sharing.snapshot_created": {
    readonly organizationId: OrganizationId;
    readonly recipientOrganizationId: OrganizationId;
  };
  "reliability.client_error": { readonly message: string; readonly route: string };
}

export interface AnalyticsEvent<Name extends AnalyticsEventName = AnalyticsEventName> {
  readonly name: Name;
  readonly occurredAt: string;
  readonly anonymousId?: string;
  readonly properties: AnalyticsEventMap[Name];
}

export function createAnalyticsEvent<Name extends AnalyticsEventName>(
  name: Name,
  properties: AnalyticsEventMap[Name],
  occurredAt: string,
): AnalyticsEvent<Name> {
  if (Number.isNaN(Date.parse(occurredAt))) throw new Error("occurredAt must be a valid timestamp");
  const errorProperties = properties as AnalyticsEventMap["reliability.client_error"];
  if (name === "reliability.client_error" && errorProperties.message.length > 500) {
    throw new Error("client error message is too long");
  }
  return { name, properties, occurredAt };
}
