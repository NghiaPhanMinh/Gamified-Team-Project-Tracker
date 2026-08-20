import { useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { MainSection } from "../../lib/navigation";
import type { BuiltInFramework } from "../../data/frameworks";
import { CustomFrameworkSection } from "../frameworks/CustomFrameworkSection";
import { FrameworkLibrary } from "../frameworks/FrameworkLibrary";
import { ProjectHub } from "../projects/ProjectHub";
import { ActivityCenter } from "./ActivityCenter";
import { CharacterCustomizer } from "./CharacterCustomizer";
import type { SpellType } from "../../lib/character";
import { ProfileCenter } from "../profile/ProfileCenter";

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
  activeSection: MainSection;
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

  if (activeSection === "profile") {
    return (
      <ProfileCenter
        roomControl={<label className="compact-room-select"><span>Room</span><select value={selectedTeamId} onChange={(event) => onSelectTeam(event.target.value as Id<"teams">)}>{teams.map((team) => <option key={team._id} value={team._id}>{team.name}</option>)}</select></label>}
        character={currentMember ? <CharacterCustomizer key={`${selectedTeamId}:${currentMember.characterFill}:${currentMember.characterOutline}:${currentMember.spellType ?? "none"}`} teamId={selectedTeamId} member={{ displayName: currentMember.displayName, characterFill: currentMember.characterFill, characterOutline: currentMember.characterOutline, spellType: currentMember.spellType as SpellType | undefined }} /> : undefined}
      />
    );
  }

  async function copyCode() {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus(joinCode);
    }
  }

  return (
    <section className="room-workspace" aria-labelledby="room-title">
      <header className="room-command-header">
        <div>
          <p className="room-breadcrumb">Projects / {workspace.team.name}</p>
          <h1 className="room-title-compact" id="room-title">{workspace.team.name}</h1>
          <p>{workspace.members.length} {workspace.members.length === 1 ? "member" : "members"} · live updates</p>
        </div>
        <div className="room-header-actions">
          <ActivityCenter teamId={selectedTeamId} />
          <button className="quiet-button" type="button" onClick={() => void copyCode()}>{copyStatus}</button>
        </div>
      </header>

      <div className="room-switch-row">
        <label><span>Current room</span><select value={selectedTeamId} onChange={(event) => onSelectTeam(event.target.value as Id<"teams">)}>{teams.map((team) => <option key={team._id} value={team._id}>{team.name} · {team.memberCount}</option>)}</select></label>
        <button className="secondary-button" type="button" onClick={onAddTeam}>Create Another Project</button>
      </div>

      <ProjectHub
        teamId={selectedTeamId}
        members={workspace.members.map((member) => ({ profileId: member.profileId, displayName: member.displayName }))}
        currentProfileId={workspace.currentProfileId}
        requestedProjectTab="plan"
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
