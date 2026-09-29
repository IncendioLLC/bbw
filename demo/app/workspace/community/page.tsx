import { WorkspaceShell } from "../WorkspaceShell";

const joinedCommunities = [
  ["Oncology Translational Founders", "8 companies", "Indication strategy, KOL feedback, translational evidence"],
  ["Pre-IND Operators Circle", "12 companies", "FDA meeting prep, tox package planning, CMC readiness"],
  ["Seed Extension Biotech CEOs", "6 companies", "Bridge financing, investor updates, diligence materials"],
];

export default function CommunityPage() {
  return (
    <WorkspaceShell
      active="My communities"
      title="My Communities"
      subtitle="Communities the company has joined for founder-to-founder learning and expert operating support."
    >
      <section className="community-card-grid">
        {joinedCommunities.map(([name, companies, focus]) => (
          <article className="panel community-company-card" key={name}>
            <div className="community-logo">{name.slice(0, 2).toUpperCase()}</div>
            <div>
              <h2>{name}</h2>
              <p>{focus}</p>
            </div>
            <span>{companies}</span>
            <button type="button">Open community</button>
          </article>
        ))}
      </section>
    </WorkspaceShell>
  );
}
