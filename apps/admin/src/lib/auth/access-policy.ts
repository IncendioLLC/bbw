export type ManagementPrincipal = Readonly<{
  displayName: string;
  subject: string;
}>;

export type ManagementAccessDecision =
  | Readonly<{ allowed: true; principal: ManagementPrincipal }>
  | Readonly<{ allowed: false; destination: string }>;

export function decideManagementAccess(
  principal: ManagementPrincipal | null,
  requestedPath: string,
): ManagementAccessDecision {
  if (principal) {
    return { allowed: true, principal };
  }

  const returnTo = requestedPath.startsWith("/admin") ? requestedPath : "/admin";
  return {
    allowed: false,
    destination: `/sign-in?returnTo=${encodeURIComponent(returnTo)}`,
  };
}
