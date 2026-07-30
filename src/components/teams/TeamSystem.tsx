import { useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import { TeamLobby } from "./TeamLobby";
import { TeamWorkspace } from "./TeamWorkspace";

type TeamSystemProps = {
  profile: Doc<"userProfiles">;
};

export function TeamSystem({ profile }: TeamSystemProps) {
  const teams = useQuery(api.teams.listMine);
  const [selectedTeamId, setSelectedTeamId] = useState<Id<"teams"> | null>(
    null,
  );
  const [showLobby, setShowLobby] = useState(false);

  if (teams === undefined) {
    return (
      <section className="team-loading" aria-busy="true">
        <p className="kicker">Loading teams</p>
        <h1>Finding your shared rooms…</h1>
      </section>
    );
  }

  const activeTeamId = teams.some((team) => team._id === selectedTeamId)
    ? selectedTeamId
    : (teams[0]?._id ?? null);

  if (showLobby || teams.length === 0 || activeTeamId === null) {
    return (
      <TeamLobby
        displayName={profile.displayName}
        hasTeams={teams.length > 0}
        onCancel={() => setShowLobby(false)}
        onTeamReady={(teamId) => {
          setSelectedTeamId(teamId);
          setShowLobby(false);
        }}
      />
    );
  }

  return (
    <TeamWorkspace
      key={activeTeamId}
      selectedTeamId={activeTeamId}
      teams={teams}
      onAddTeam={() => setShowLobby(true)}
      onSelectTeam={setSelectedTeamId}
    />
  );
}
