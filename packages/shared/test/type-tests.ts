import type { OrganizationId, UserId } from "../src/index.js";

declare const organizationId: OrganizationId;
declare const userId: UserId;

// @ts-expect-error Branded organization and user identifiers must not mix.
const invalidOrganizationId: OrganizationId = userId;
// @ts-expect-error Branded organization and user identifiers must not mix.
const invalidUserId: UserId = organizationId;

void invalidOrganizationId;
void invalidUserId;
