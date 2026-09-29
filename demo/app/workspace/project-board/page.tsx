import { WorkspaceShell } from "../WorkspaceShell";

const columns = [
  {
    stage: "Initialized",
    projects: [
      ["SBIR grant plan", "Define specific aims and budget story", "Ops", "Low"],
      ["KOL interview sprint", "Recruit oncology advisors for indication feedback", "BD", "Medium"],
    ],
  },
  {
    stage: "In Review",
    projects: [
      ["Investor data room", "Finance model and IP folder need founder review", "Finance", "High"],
    ],
  },
  {
    stage: "In Progress",
    projects: [
      ["Preclinical evidence package", "Convert assay data into diligence-ready claims", "Science", "High"],
      ["CMC vendor shortlist", "Compare cost, timeline, and batch documentation risk", "CMC", "Medium"],
    ],
  },
  {
    stage: "Complete",
    projects: [
      ["Market sizing memo", "TAM, SAM, and first indication assumptions finished", "Market", "Low"],
    ],
  },
];

export default function ProjectBoardPage() {
  return (
    <WorkspaceShell
      active="Plan execution"
      title="Plan Execution"
      subtitle="A Jira-style operating board for business projects, scientific translation work, and company milestones."
    >
      <section className="project-board" aria-label="Project status board">
        {columns.map((column) => (
          <div className="board-column" key={column.stage}>
            <div className="board-column-header">
              <h2>{column.stage}</h2>
              <span>{column.projects.length}</span>
            </div>
            <div className="board-cards">
              {column.projects.map(([title, description, owner, risk]) => (
                <article className="jira-card" key={title}>
                  <div className="card-row">
                    <span className="pill">{owner}</span>
                    <strong>{risk}</strong>
                  </div>
                  <h3>{title}</h3>
                  <p>{description}</p>
                  <div className="card-footer">
                    <span>HelixNova</span>
                    <button type="button">Open</button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </WorkspaceShell>
  );
}
