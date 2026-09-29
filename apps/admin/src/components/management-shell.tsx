import Link from "next/link";
import type { ReactNode } from "react";

import type { ManagementPrincipal } from "../lib/auth/access-policy";
import { managementNavigation } from "./management-navigation";

type ManagementShellProperties = Readonly<{
  children: ReactNode;
  principal: ManagementPrincipal;
}>;

export function ManagementShell({ children, principal }: ManagementShellProperties) {
  return (
    <div className="management-layout">
      <aside className="management-sidebar">
        <p className="management-brand">BBW Management</p>
        <nav aria-label="Management navigation">
          <ul>
            {managementNavigation.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>{item.label}</Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
      <main className="management-content">
        <header className="management-header">
          <div>
            <p className="management-eyebrow">Platform operations</p>
            <h1>Management console</h1>
          </div>
          <p aria-label="Signed-in administrator">{principal.displayName}</p>
        </header>
        {children}
      </main>
    </div>
  );
}
