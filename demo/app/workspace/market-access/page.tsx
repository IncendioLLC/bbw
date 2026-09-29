import { WorkspaceShell } from "../WorkspaceShell";

const segments = [
  ["Payers", "Evidence bar: durability and comparator clarity"],
  ["Hospitals", "Adoption driver: workflow fit and budget impact"],
  ["Pharma partners", "Value driver: indication expansion and biomarker ownership"],
];

export default function MarketAccessPage() {
  return (
    <WorkspaceShell
      active="Market Access"
      title="Market Access"
      subtitle="Connect scientific claims to customer value, reimbursement evidence, pricing logic, and adoption pathways."
    >
      <div className="market-grid">
        {segments.map(([name, text]) => (
          <article className="market-card" key={name}>
            <h2>{name}</h2>
            <p>{text}</p>
          </article>
        ))}
      </div>
      <section className="panel">
        <div className="panel-heading">
          <h2>Positioning matrix</h2>
          <span>Draft</span>
        </div>
        <div className="matrix">
          <span />
          <strong>Clinical value</strong>
          <strong>Economic value</strong>
          <strong>Strategic value</strong>
          <b>BX-214</b>
          <p>High unmet need</p>
          <p>Evidence pending</p>
          <p>Partnerable platform</p>
        </div>
      </section>
    </WorkspaceShell>
  );
}
