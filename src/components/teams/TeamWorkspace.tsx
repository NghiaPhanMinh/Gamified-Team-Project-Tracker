import { useMemo, useState, type FormEvent } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import type { BuiltInFramework } from "../../data/frameworks";
import { CustomFrameworkSection } from "../frameworks/CustomFrameworkSection";
import { FrameworkLibrary } from "../frameworks/FrameworkLibrary";
import { getSpellGlyph, type SpellType } from "../../lib/character";
import { getErrorMessage } from "../../lib/errors";
import { CharacterCustomizer } from "./CharacterCustomizer";

type TeamSummary = {
  _id: Id<"teams">;
  name: string;
  memberCount: number;
};

type TeamWorkspaceProps = {
  selectedTeamId: Id<"teams">;
  teams: TeamSummary[];
  onAddTeam: () => void;
  onSelectTeam: (teamId: Id<"teams">) => void;
};

export function TeamWorkspace({
  selectedTeamId,
  teams,
  onAddTeam,
  onSelectTeam,
}: TeamWorkspaceProps) {
  const workspace = useQuery(api.teams.getWorkspace, {
    teamId: selectedTeamId,
  });
  const updateSharedNote = useMutation(api.teams.updateSharedNote);
  const [editedDraft, setEditedDraft] = useState("");
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [noteError, setNoteError] = useState<string | null>(null);
  const [copyStatus, setCopyStatus] = useState("Copy code");
  const [frameworkSeed, setFrameworkSeed] =
    useState<BuiltInFramework | null>(null);

  const noteAuthor = useMemo(() => {
    if (!workspace?.sharedRecord) {
      return null;
    }

    return workspace.members.find(
      (member) =>
        member.profileId === workspace.sharedRecord?.updatedByProfileId,
    );
  }, [workspace]);

  if (workspace === undefined) {
    return (
      <section className="team-loading" aria-busy="true">
        <p className="kicker">Opening team room</p>
        <h1>Gathering everyone…</h1>
      </section>
    );
  }

  const draft = isDirty
    ? editedDraft
    : (workspace.sharedRecord?.note ?? "");
  const joinCode = workspace.team.joinCode;
  const currentMember = workspace.members.find(
    (member) => member.profileId === workspace.currentProfileId,
  );

  async function handleCopyCode() {
    try {
      await navigator.clipboard.writeText(joinCode);
      setCopyStatus("Copied!");
    } catch {
      setCopyStatus("Select the code to copy");
    }
  }

  async function handleSharedNote(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setNoteError(null);
    setIsSaving(true);

    try {
      await updateSharedNote({ teamId: selectedTeamId, note: draft });
      setIsDirty(false);
    } catch (error) {
      setNoteError(
        getErrorMessage(error, "The shared update could not be saved."),
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <section className="team-workspace" aria-labelledby="team-title">
      <div className="team-command-bar">
        <label>
          <span>Current team</span>
          <select
            value={selectedTeamId}
            onChange={(event) =>
              onSelectTeam(event.target.value as Id<"teams">)
            }
          >
            {teams.map((team) => (
              <option key={team._id} value={team._id}>
                {team.name} · {team.memberCount}{" "}
                {team.memberCount === 1 ? "member" : "members"}
              </option>
            ))}
          </select>
        </label>
        <button className="quiet-button" type="button" onClick={onAddTeam}>
          Create or join another
        </button>
      </div>

      <header className="team-hero">
        <div>
          <div className="live-badge">
            <span aria-hidden="true" />
            Realtime room
          </div>
          <h1 id="team-title">{workspace.team.name}</h1>
          <p>
            Everyone in this room receives member and shared-note changes
            automatically—no refresh needed.
          </p>
        </div>
        <div className="join-code-card">
          <span>Invite code</span>
          <strong>{workspace.team.joinCode}</strong>
          <button type="button" onClick={() => void handleCopyCode()}>
            {copyStatus}
          </button>
        </div>
      </header>

      <div className="team-workspace-grid">
        <article className="shared-note-card">
          <div className="card-heading">
            <div>
              <p className="card-eyebrow">Shared test record</p>
              <h2>Team pulse</h2>
            </div>
            <span className="sync-label">Live</span>
          </div>

          <blockquote>
            {workspace.sharedRecord?.note ?? "Share the first team update."}
          </blockquote>
          <p className="note-meta">
            {noteAuthor
              ? `Last changed by ${noteAuthor.displayName}`
              : "Ready for the first update"}
          </p>

          <form className="shared-note-form" onSubmit={handleSharedNote}>
            <label htmlFor="shared-note">Update the team pulse</label>
            <textarea
              id="shared-note"
              name="sharedNote"
              rows={3}
              maxLength={280}
              required
              value={draft}
              onChange={(event) => {
                setEditedDraft(event.target.value);
                setIsDirty(true);
              }}
            />
            <div className="form-footer">
              <span>{draft.length}/280</span>
              <button
                className="primary-button"
                type="submit"
                disabled={isSaving || !isDirty}
              >
                {isSaving ? "Sharing…" : "Share update"}
              </button>
            </div>
            {noteError ? (
              <p className="form-error" role="alert">
                {noteError}
              </p>
            ) : null}
          </form>
        </article>

        <aside className="members-card">
          <div className="card-heading">
            <div>
              <p className="card-eyebrow">Present in the team</p>
              <h2>
                {workspace.members.length}{" "}
                {workspace.members.length === 1 ? "maker" : "makers"}
              </h2>
            </div>
            <span className="sync-label">Subscribed</span>
          </div>
          <ul className="member-list" aria-live="polite">
            {workspace.members.map((member) => (
              <li key={member.profileId}>
                <span
                  className="member-avatar"
                  style={{
                    backgroundColor: member.characterFill,
                    borderColor: member.characterOutline,
                    color: member.characterOutline,
                  }}
                  aria-hidden="true"
                >
                  {member.displayName.slice(0, 1).toUpperCase()}
                  <i>{getSpellGlyph(member.spellType as SpellType | undefined)}</i>
                </span>
                <span>
                  <strong>
                    {member.displayName}
                    {member.profileId === workspace.currentProfileId
                      ? " (you)"
                      : ""}
                  </strong>
                  <small>
                    {member.role === "owner" ? "Team owner" : "Team member"}
                  </small>
                </span>
              </li>
            ))}
          </ul>
        </aside>
      </div>

      {currentMember ? (
        <CharacterCustomizer
          key={`${selectedTeamId}:${currentMember.characterFill}:${currentMember.characterOutline}:${currentMember.spellType ?? "none"}`}
          teamId={selectedTeamId}
          member={{
            displayName: currentMember.displayName,
            characterFill: currentMember.characterFill,
            characterOutline: currentMember.characterOutline,
            spellType: currentMember.spellType as SpellType | undefined,
          }}
        />
      ) : null}

      <FrameworkLibrary onDuplicate={setFrameworkSeed} />
      <CustomFrameworkSection
        teamId={selectedTeamId}
        currentProfileId={workspace.currentProfileId}
        currentRole={workspace.currentRole}
        seed={frameworkSeed}
        onSeedClosed={() => setFrameworkSeed(null)}
      />
    </section>
  );
}
