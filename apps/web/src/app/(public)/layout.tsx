import Link from "next/link";
import type { ReactNode } from "react";

export default function PublicLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div className="shell">
      <header className="site-header">
        <Link className="brand" href="/">
          BBW Platform
        </Link>
        <nav aria-label="Primary" className="site-nav">
          <Link href="/">Home</Link>
          <Link href="/sign-in">Sign in</Link>
        </nav>
      </header>
      <main className="content">{children}</main>
    </div>
  );
}
