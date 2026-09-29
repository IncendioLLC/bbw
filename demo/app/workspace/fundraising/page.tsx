import { WorkspaceShell } from "../WorkspaceShell";

const investorTasks = [
  "Condense platform thesis into a 7-slide partner meeting deck.",
  "Map target funds by therapeutic area, check size, and lead-investor behavior.",
  "Prepare diligence answers for reproducibility, IP, and development cost.",
];

export default function FundraisingPage() {
  return (
    <WorkspaceShell
      active="Fundraising"
      title="Fundraising"
      subtitle="Turn scientific progress into investor narrative, target lists, diligence materials, and capital strategy."
    >
      <div className="workspace-grid two">
        <section className="panel">
          <div className="panel-heading">
            <h2>Investor readiness</h2>
            <span>74%</span>
          </div>
          <div className="funding-stack">
            <div><span>Story</span><strong>Strong</strong></div>
            <div><span>Data room</span><strong>Needs work</strong></div>
            <div><span>Target list</span><strong>Drafted</strong></div>
            <div><span>Financial plan</span><strong>Review</strong></div>
          </div>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>Agent next moves</h2>
            <span>This week</span>
          </div>
          <ul className="task-list">
            {investorTasks.map((task) => (
              <li key={task}>{task}</li>
            ))}
          </ul>
        </section>
      </div>
    </WorkspaceShell>
  );
}
