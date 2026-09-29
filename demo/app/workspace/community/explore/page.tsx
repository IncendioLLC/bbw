import { WorkspaceShell } from "../../WorkspaceShell";

const hotCommunities = [
  ["AI Drug Discovery Operators", "41 companies", "High activity", "Workflow automation, platform partnerships, compute budget"],
  ["Women in Biotech Leadership", "29 companies", "Growing", "Hiring, board readiness, executive coaching"],
  ["Rare Disease Commercialization", "17 companies", "High signal", "Patient finding, payer evidence, advocacy partnerships"],
  ["Non-dilutive Funding Lab", "34 companies", "Hot", "SBIR, BARDA, disease foundation grants"],
];

export default function ExploreCommunitiesPage() {
  return (
    <WorkspaceShell
      active="Explore communities"
      title="Explore Communities"
      subtitle="Hot founder and operator communities matched to biomedical startup needs."
    >
      <section className="community-card-grid explore">
        {hotCommunities.map(([name, companies, signal, focus]) => (
          <article className="panel community-company-card" key={name}>
            <div className="community-logo">{name.slice(0, 2).toUpperCase()}</div>
            <div>
              <h2>{name}</h2>
              <p>{focus}</p>
            </div>
            <span>
              {companies} - {signal}
            </span>
            <button type="button">Request access</button>
          </article>
        ))}
      </section>
    </WorkspaceShell>
  );
}
