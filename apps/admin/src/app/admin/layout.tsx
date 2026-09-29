import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { ManagementShell } from "../../components/management-shell";
import { decideManagementAccess } from "../../lib/auth/access-policy";
import { readManagementPrincipal } from "../../lib/auth/management-session";

export default async function AdminLayout({ children }: Readonly<{ children: ReactNode }>) {
  const access = decideManagementAccess(await readManagementPrincipal(), "/admin");

  if (!access.allowed) {
    redirect(access.destination);
  }

  return <ManagementShell principal={access.principal}>{children}</ManagementShell>;
}
