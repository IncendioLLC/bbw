import { WorkspaceShell } from "../WorkspaceShell";

const collections = [
  ["Scientific evidence", "42 files", "Assay reports, protocol drafts, reproducibility notes"],
  ["Business assumptions", "18 notes", "Market sizing, pricing logic, reimbursement hypotheses"],
  ["Investor materials", "9 decks", "Pitch, diligence Q&A, cap table snapshots"],
  ["Legal and IP", "11 items", "Patent landscape, option agreements, counsel memos"],
];

export default function CompanyKnowledgePage() {
  return (
    <WorkspaceShell
      active="Company Knowledge"
      title="Company Knowledge"
      subtitle="A secure company brain that lets the agent answer with context from science, finance, IP, and operating history."
    >
      <div className="knowledge-grid">
        {collections.map(([name, count, description]) => (
          <article className="knowledge-card" key={name}>
            <span>{count}</span>
            <h2>{name}</h2>
            <p>{description}</p>
          </article>
        ))}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h2>Knowledge health</h2>
          <span>Private RAG ready</span>
        </div>
        <div className="health-bars">
          <div><span>Evidence traceability</span><strong>91%</strong></div>
          <div><span>Financial model coverage</span><strong>73%</strong></div>
          <div><span>Regulatory context</span><strong>66%</strong></div>
          <div><span>IP source freshness</span><strong>84%</strong></div>
        </div>
      </section>
    </WorkspaceShell>
  );
}
