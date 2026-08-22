import { useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { MainSection } from "../../lib/navigation";
import type { BuiltInFramework } from "../../data/frameworks";
import { CustomFrameworkSection } from "../frameworks/CustomFrameworkSection";
import { FrameworkLibrary } from "../frameworks/FrameworkLibrary";
import { ProjectHub } from "../projects/ProjectHub";

type RoomSummary = {
  _id: Id<"teams">;
  name: string;
  memberCount: number;
};

type TeamWorkspaceProps = {
  selectedTeamId: Id<"teams">;
  teams: RoomSummary[];
  onAddTeam: () => void;
  onSelectTeam: (teamId: Id<"teams">) => void;
  activeSection?: MainSection;
};

export function TeamWorkspace({
  selectedTeamId,
  teams,
  onAddTeam,
  onSelectTeam,
  activeSection,
}: TeamWorkspaceProps) {
  const workspace = useQuery(api.teams.getWorkspace, { teamId: selectedTeamId });
  const [copyStatus, setCopyStatus] = useState("Share code");
  const [frameworkSeed, setFrameworkSeed] = useState<BuiltInFramework | null>(null);

  if (workspace === undefined) {
    return <section className="team-loading" aria-busy="true"><p className="kicker">Opening room</p><h1 className="display-heading">Gathering everyone…</h1></section>;
  }

  const currentMember = workspace.members.find((member) => member.profileId === workspace.currentProfileId);
  const joinCode = workspace.team.joinCode;

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus(joinCode);
    }
  }

  return (
    <section className="room-workspace">
      <ProjectHub
        teamId={selectedTeamId}
        members={workspace.members.map((member) => ({ profileId: member.profileId, displayName: member.displayName }))}
        currentProfileId={workspace.currentProfileId}
        requestedProjectTab="progress"
      />
      <details className="room-tools">
        <summary>Room tools · Framework library</summary>
        <p>Browse every template or build a custom framework for future projects in this room.</p>
        <FrameworkLibrary onDuplicate={setFrameworkSeed} />
        <CustomFrameworkSection
          teamId={selectedTeamId}
          currentProfileId={workspace.currentProfileId}
          currentRole={workspace.currentRole}
          seed={frameworkSeed}
          onSeedClosed={() => setFrameworkSeed(null)}
        />
      </details>
    </section>
  );
}
