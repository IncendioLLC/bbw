import { WorkspaceShell } from "../WorkspaceShell";
import { WorkingSessionsClient } from "./WorkingSessionsClient";

export default function WorkingSessionsPage() {
  return (
    <WorkspaceShell
      active="New chat"
      title="Working Session"
      subtitle="Start a focused BBW agent session. Every chat begins as a session and follow-up questions stay inside that session until a new one starts."
    >
      <WorkingSessionsClient />
    </WorkspaceShell>
  );
}
