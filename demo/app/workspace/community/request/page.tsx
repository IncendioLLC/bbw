import { WorkspaceShell } from "../../WorkspaceShell";

const requestFields = [
  "Community theme and target founder profile",
  "Problem to solve for members",
  "Ideal advisors, operators, or investors to invite",
  "Launch criteria and expected cadence",
];

export default function RequestCommunityPage() {
  return (
    <WorkspaceShell
      active="Request community"
      title="Request a Community"
      subtitle="Propose a new founder group when the company needs a specialized peer network."
    >
      <div className="workspace-grid two">
        <section className="panel request-community-form">
          <div className="panel-heading">
            <h2>Community request</h2>
            <span>Draft</span>
          </div>
          <form>
            <label htmlFor="community-theme">Community theme</label>
            <input id="community-theme" placeholder="Example: IND-ready cell therapy founders" />
            <label htmlFor="community-need">Primary need</label>
            <textarea
              id="community-need"
              placeholder="Describe the operating problem this group should solve."
            />
            <button type="button">Submit request</button>
          </form>
        </section>
        <section className="panel">
          <div className="panel-heading">
            <h2>BBW review checklist</h2>
            <span>Required signal</span>
          </div>
          <div className="brief-list">
            {requestFields.map((field) => (
              <div key={field}>
                <span>Required</span>
                <p>{field}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </WorkspaceShell>
  );
}
