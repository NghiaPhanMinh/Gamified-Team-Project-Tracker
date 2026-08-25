import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ProjectWorkspace, type ProjectTab } from "./ProjectWorkspace";
import { getErrorMessage } from "../../lib/errors";

type TeamMember = {
  profileId: Id<"userProfiles">;
  displayName: string;
};

type ProjectHubProps = {
  teamId: Id<"teams">;
  members: TeamMember[];
  currentProfileId: Id<"userProfiles">;
  requestedProjectTab?: ProjectTab;
};

export function ProjectHub({
  teamId,
  requestedProjectTab = "progress",
}: ProjectHubProps) {
  const projects = useQuery(api.projects.listForTeam, { teamId });
  const [openProjectId, setOpenProjectId] = useState<Id<"projects"> | null>(null);
  const [actionsProjectId, setActionsProjectId] = useState<Id<"projects"> | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const renameProject = useMutation(api.projects.rename);
  const setArchived = useMutation(api.projects.setArchived);
  const removeProject = useMutation(api.projects.removeFromMine);
  const selectedDefault = useRef(false);

  useEffect(() => {
    if (!selectedDefault.current && projects && projects.length > 0) {
      selectedDefault.current = true;
      setOpenProjectId(projects[0]._id);
    }
  }, [projects]);

  function revealActions(projectId: Id<"projects">, title: string) {
    setActionsProjectId(projectId);
    setRenameValue(title);
    setError(null);
  }

  function startLongPress(projectId: Id<"projects">, title: string) {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => revealActions(projectId, title), 550);
  }

  function cancelLongPress() {
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = null;
  }

  async function run(action: () => Promise<unknown>) {
    setError(null); setIsSaving(true);
    try { await action(); setActionsProjectId(null); }
    catch (caughtError) { setError(getErrorMessage(caughtError, "The project action could not be completed.")); }
    finally { setIsSaving(false); }
  }

  if (projects === undefined) {
    return <section className="project-hub" aria-busy="true"><p>Loading project…</p></section>;
  }

  if (projects.length === 0) {
    return (
      <section className="project-empty room-waiting-state">
        <p className="card-eyebrow">Waiting for project</p>
        <strong>This room is ready.</strong>
        <p>Share the room code. A project created for this room will appear here live.</p>
      </section>
    );
  }

  const openProject = projects.find((project) => project._id === openProjectId);
  if (openProject) {
    return (
      <ProjectWorkspace
        key={`${openProject._id}:${requestedProjectTab}`}
        projectId={openProject._id}
        onClose={() => setOpenProjectId(null)}
        initialTab={requestedProjectTab}
      />
    );
  }

  return (
    <section className="project-hub" aria-labelledby="room-projects-title">
      <div className="project-list-heading">
        <div><p className="card-eyebrow">Projects in this room</p><h2 id="room-projects-title">Choose a project</h2></div>
        <span className="sync-label">Live</span>
      </div>
      <div className="project-card-grid">
        {projects.map((project) => (
          <article
            key={project._id}
            className={project.status === "archived" ? "is-archived" : ""}
            onDoubleClick={() => { if (project.canManageProject) revealActions(project._id, project.title); }}
            onPointerDown={() => { if (project.canManageProject) startLongPress(project._id, project.title); }}
            onPointerUp={cancelLongPress}
            onPointerLeave={cancelLongPress}
            onPointerCancel={cancelLongPress}
          >
            <div><span className="project-status">{project.status}</span><span>{project.frameworkName}</span></div>
            <h3>{project.title}</h3>
            <p>{project.description || "No project brief yet."}</p>
            <dl><div><dt>Deadline</dt><dd>{project.deadline}</dd></div><div><dt>Team</dt><dd>{project.memberCount} members</dd></div></dl>
            <button className="primary-button project-open-button" type="button" onClick={() => setOpenProjectId(project._id)}>Open project</button>
            {project.canManageProject ? <small className="task-action-hint">Double-click or long-press for project actions</small> : null}
            {project.canManageProject && actionsProjectId === project._id ? (
              <div className="project-action-menu" role="dialog" aria-label={`Project actions for ${project.title}`} onClick={(event) => event.stopPropagation()}>
                <strong>Project actions</strong>
                <button className="quiet-button" type="button" onClick={() => setOpenProjectId(project._id)}>Open</button>
                <label><span>Rename</span><input maxLength={100} value={renameValue} onChange={(event) => setRenameValue(event.target.value)} /></label>
                <button className="quiet-button" type="button" disabled={isSaving || !renameValue.trim()} onClick={() => void run(() => renameProject({ projectId: project._id, title: renameValue }))}>Save name</button>
                <button className="quiet-button" type="button" disabled={isSaving} onClick={() => void run(() => setArchived({ projectId: project._id, archived: project.status !== "archived" }))}>{project.status === "archived" ? "Restore" : "Archive"}</button>
                <p>Removing this project changes only your account. Teammates keep the shared room and all project data.</p>
                <button className="danger-button" type="button" disabled={isSaving} onClick={() => void run(() => removeProject({ projectId: project._id }))}>Remove from my account</button>
                <button className="quiet-button" type="button" onClick={() => setActionsProjectId(null)}>Cancel</button>
              </div>
            ) : null}
          </article>
        ))}
      </div>
      {error ? <p className="form-error" role="alert">{error}</p> : null}
    </section>
  );
}
