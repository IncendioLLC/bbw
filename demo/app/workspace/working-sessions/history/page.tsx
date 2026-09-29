import { WorkspaceShell } from "../../WorkspaceShell";

const historyTopics = [
  ["Investor diligence prep", "Converted reproducibility data into a Series A Q&A outline", "Today", "Fundraising"],
  ["FDA pre-IND questions", "Drafted agency questions around biomarker evidence threshold", "Yesterday", "Regulatory"],
  ["Market access scan", "Mapped payer evidence gaps for first oncology indication", "Aug 18", "Market"],
  ["Hiring plan", "Prioritized business development and clinical operations roles", "Aug 16", "Operations"],
  ["CMC vendor negotiation", "Compared milestone risk, documentation quality, and cost tradeoffs", "Aug 11", "Execution"],
];

export default function WorkingSessionHistoryPage() {
  return (
    <WorkspaceShell
      active="History"
      title="Session History"
      subtitle="Saved BBW conversations organized as business topics so the company can reuse prior context."
    >
      <section className="panel">
        <div className="panel-heading">
          <h2>Historical topics</h2>
          <span>{historyTopics.length} sessions</span>
        </div>
        <div className="history-topic-grid">
          {historyTopics.map(([title, summary, date, tag]) => (
            <article key={title}>
              <div>
                <span>{tag}</span>
                <h3>{title}</h3>
                <p>{summary}</p>
              </div>
              <time>{date}</time>
            </article>
          ))}
        </div>
      </section>
    </WorkspaceShell>
  );
}
