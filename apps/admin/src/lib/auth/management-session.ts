import "server-only";

import type { ManagementPrincipal } from "./access-policy";

/**
 * Deny by default until the dedicated management Cognito integration supplies
 * a cryptographically verified principal. Cookie presence alone must never
 * grant management access.
 */
export async function readManagementPrincipal(): Promise<ManagementPrincipal | null> {
  return null;
}
