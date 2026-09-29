"use client";

import { useEffect, useState } from "react";

import { workspaceGroups } from "./sections";

type WorkspaceShellProps = {
  active: string;
  title: string;
  subtitle: string;
  children: React.ReactNode;
};

type CompanySession = {
  companyName: string;
  email: string;
  stage: string;
};

const workspaceNews = [
  ["Fierce Biotech", "Abcuro secures $66M as private biotech financings stay selective", "Funding"],
  ["BioPharma Dive", "Biotech startup funding gap widens despite rebound in VC investment", "Venture"],
  ["STAT", "European VCs coordinate new capital pathways for biotech startups", "Market"],
];

export function WorkspaceShell({
  active,
  title,
  subtitle,
  children,
}: WorkspaceShellProps) {
  const [companySession, setCompanySession] = useState<CompanySession>({
    companyName: "Demo Biotech Company",
    email: "founder@company.com",
    stage: "Prototype workspace",
  });

  useEffect(() => {
    const stored = window.localStorage.getItem("bbw-company-session");

    if (!stored) {
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<CompanySession>;

      setCompanySession({
        companyName: parsed.companyName || "Company workspace",
        email: parsed.email || "founder@company.com",
        stage: parsed.stage || "Company workspace",
      });
    } catch {
      window.localStorage.removeItem("bbw-company-session");
    }
  }, []);

  function signOut() {
    window.localStorage.removeItem("bbw-company-session");
    window.location.assign("/");
  }

  return (
    <main className="app-shell">
      <aside className="sidebar" aria-label="Company workspace navigation">
        <a className="brand workspace-brand" href="/">
          <span className="brand-mark" aria-hidden="true">
            <img src="/favicon.svg" alt="" />
          </span>
          <span>BBW</span>
        </a>
        <div className="company-chip">
          <span>{companySession.companyName}</span>
          <strong>{companySession.stage}</strong>
        </div>
        <nav className="side-nav grouped-side-nav">
          {workspaceGroups.map((group) => (
            <details
              className="nav-group"
              key={group.label}
              open={group.items.some((item) => item.label === active)}
            >
              <summary>{group.label}</summary>
              <div>
                {group.items.map((item) => (
                  <a
                    className={item.label === active ? "active" : ""}
                    href={item.href}
                    key={item.href}
                  >
                    <span>{item.label}</span>
                    <small>{item.kicker}</small>
                  </a>
                ))}
              </div>
            </details>
          ))}
        </nav>
        <section className="sidebar-news" aria-labelledby="sidebar-news-title">
          <div>
            <h2 id="sidebar-news-title">Biotech news</h2>
            <span>Live context</span>
          </div>
          {workspaceNews.map(([source, title, tag]) => (
            <a href="/" key={title}>
              <span>{source}</span>
              <p>{title}</p>
              <small>{tag}</small>
            </a>
          ))}
        </section>
      </aside>

      <section className="workspace-main">
        <header className="workspace-header">
          <div>
            <p className="eyebrow">Logged-in company workspace</p>
            <h1>{title}</h1>
            <p>{subtitle}</p>
          </div>
          <div className="header-actions">
            <button type="button">Invite scientist</button>
            <button type="button" onClick={signOut}>
              Sign out
            </button>
            <button className="primary" type="button">
              New question
            </button>
          </div>
        </header>
        {children}
      </section>
    </main>
  );
}
