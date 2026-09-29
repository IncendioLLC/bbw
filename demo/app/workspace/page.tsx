import { WorkspaceShell } from "./WorkspaceShell";
import { companyMetrics, milestoneRows, nextStepChecklist, stageMap } from "./sections";

const riskSignals = [
  ["Investor narrative", "Strong", "Progress claims are clear, but bridge rationale needs sharper timing."],
  ["Regulatory plan", "Medium", "Pre-IND questions exist; agency-decision framing needs review."],
  ["CMC operations", "Watch", "Vendor dependency is the most visible execution constraint."],
];

export default function WorkspaceHome() {
  return (
    <WorkspaceShell
      active="Dashboard"
      title="Company Info"
      subtitle="A founder dashboard for milestones, operating checks, company stage, risk, and near-term business priorities."
    >
      <div className="metric-grid">
        {companyMetrics.map(([label, value, note]) => (
          <article className="metric-card" key={label}>
            <p>{label}</p>
            <strong>{value}</strong>
            <span>{note}</span>
          </article>
        ))}
      </div>

      <div className="workspace-grid two company-dashboard-grid">
        <section className="panel">
          <div className="panel-heading">
            <h2>Key milestones</h2>
            <span>Founder operating view</span>
          </div>
          <div className="milestone-table">
            {milestoneRows.map(([milestone, due, status, owner]) => (
              <article key={milestone}>
                <div>
                  <h3>{milestone}</h3>
                  <p>{owner}</p>
                </div>
                <span>{due}</span>
                <strong>{status}</strong>
              </article>
            ))}
          </div>
        </section>

        <section className="panel">
          <div className="panel-heading">
            <h2>Next step checklist</h2>
            <span>BBW suggested</span>
          </div>
          <div className="checklist-stack">
            {nextStepChecklist.map((item, index) => (
              <label key={item}>
                <input type="checkbox" defaultChecked={index < 2} />
                <span>{item}</span>
              </label>
            ))}
          </div>
        </section>
      </div>

      <section className="panel stage-panel">
        <div className="panel-heading">
          <h2>Company path to outcome</h2>
          <span>Current stage: Seed validation</span>
        </div>
        <div className="stage-map">
          {stageMap.map(([stage, status, detail]) => (
            <article className={status === "Current" ? "current" : ""} key={stage}>
              <span>{status}</span>
              <h3>{stage}</h3>
              <p>{detail}</p>
            </article>
          ))}
        </div>
      </section>

      <div className="workspace-grid two">
        <section className="panel">
          <div className="panel-heading">
            <h2>Business risk signals</h2>
            <span>Updated today</span>
          </div>
          <div className="brief-list">
            {riskSignals.map(([label, status, text]) => (
              <div key={label}>
                <span>
                  {label}: {status}
                </span>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="panel molecular-map">
          <div className="panel-heading">
            <h2>Business readiness map</h2>
            <span>78%</span>
          </div>
          <div className="radar">
            <span>IP</span>
            <span>FDA</span>
            <span>BD</span>
            <span>Market</span>
            <span>Capital</span>
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
