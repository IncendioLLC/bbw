import { WorkspaceShell } from "../WorkspaceShell";

const steps = [
  ["Pre-IND story", "Define target product profile and animal model rationale"],
  ["Evidence gap", "Add CMC comparability plan for outsourced batch"],
  ["Agency question", "Clarify biomarker evidence threshold for first-in-human study"],
];

export default function RegulatoryPage() {
  return (
    <WorkspaceShell
      active="Regulatory Strategy"
      title="Regulatory Strategy"
      subtitle="Plan FDA interactions, preclinical evidence, CMC readiness, and clinical entry decisions with business impact attached."
    >
      <section className="panel regulatory-board">
        <div className="panel-heading">
          <h2>Development pathway</h2>
          <span>Pre-IND planning</span>
        </div>
        <div className="pathway">
          {steps.map(([label, text], index) => (
            <article key={label}>
              <span>0{index + 1}</span>
              <h3>{label}</h3>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="panel">
        <div className="panel-heading">
          <h2>Business impact summary</h2>
          <span>AI generated</span>
        </div>
        <p className="large-copy">
          The highest leverage regulatory work is not another broad experiment. It is a
          crisp pre-IND evidence package that makes the next financing round easier to
          diligence and reduces partner uncertainty around development cost.
        </p>
      </section>
    </WorkspaceShell>
  );
}
