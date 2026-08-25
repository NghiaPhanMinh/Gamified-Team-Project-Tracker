import { useMutation, useQuery } from "convex/react";
import { useState, type CSSProperties } from "react";
import { X } from "lucide-react";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { MainSection, ProjectsView } from "../../lib/navigation";
import { PersonalTasks } from "../projects/PersonalTasks";
import { ProjectOnboarding } from "../projects/ProjectOnboarding";
import { TeamWorkspace } from "./TeamWorkspace";
import { ProfileCenter } from "../profile/ProfileCenter";
import { ResourcesPage } from "../resources/ResourcesPage";
import { getGroupColor } from "../../lib/groupColors";
import { getErrorMessage } from "../../lib/errors";

type RoomSummary = {
  _id: Id<"teams">;
  name: string;
  memberCount: number;
};

type ProjectSummary = {
  _id: Id<"projects">;
  teamId: Id<"teams">;
  roomName: string;
  title: string;
  description: string;
  frameworkName: string;
  status: "planning" | "active" | "at_risk" | "overdue" | "completed" | "archived";
  deadline: string;
  memberCount: number;
  canDelete: boolean;
  updatedAt: number;
};

type TeamSystemProps = {
  profile: Doc<"userProfiles">;
  activeSection: MainSection;
  projectsView: ProjectsView;
  rooms: RoomSummary[];
  projectCards: ProjectSummary[] | undefined;
  selectedRoomId: Id<"teams"> | null;
  onNavigateHome: () => void;
  onOpenProjects: (view: ProjectsView) => void;
  onOpenRoom: (roomId: Id<"teams">) => void;
};

type ProjectDeleteTarget = {
  projectId: Id<"projects">;
  projectTitle: string;
};

export function ProjectDeleteDialog({
  target,
  onCancel,
  onConfirm,
}: {
  target: ProjectDeleteTarget;
  onCancel: () => void;
  onConfirm: (confirmationName: string) => Promise<void>;
}) {
  const [confirmationName, setConfirmationName] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const matchesProjectName = confirmationName.trim() === target.projectTitle.trim();

  async function confirmDeletion() {
    if (!matchesProjectName || isDeleting) return;
    setError(null);
    setIsDeleting(true);
    try {
      await onConfirm(confirmationName);
    } catch (caughtError) {
      setError(getErrorMessage(caughtError, "The project could not be deleted."));
      setIsDeleting(false);
    }
  }

  return (
    <div className="project-delete-overlay" role="presentation">
      <section className="project-delete-dialog" role="dialog" aria-modal="true" aria-labelledby="project-delete-title">
        <p className="kicker">Permanent action</p>
        <h2 id="project-delete-title">Delete project?</h2>
        <p>This will permanently remove the project and its related data. This cannot be undone.</p>
        <label className="project-delete-confirmation">
          <span>Type <strong>{target.projectTitle}</strong> to confirm</span>
          <input
            autoFocus
            value={confirmationName}
            onChange={(event) => setConfirmationName(event.target.value)}
            aria-label="Project name confirmation"
          />
        </label>
        {error ? <p className="form-error" role="alert">{error}</p> : null}
        <div className="project-delete-actions">
          <button className="quiet-button" type="button" disabled={isDeleting} onClick={onCancel}>Cancel</button>
          <button className="danger-button" type="button" disabled={!matchesProjectName || isDeleting} onClick={() => void confirmDeletion()}>
            {isDeleting ? "Deleting…" : "Delete project"}
          </button>
        </div>
      </section>
    </div>
  );
}

export function TeamSystem({
  profile,
  activeSection,
  projectsView,
  rooms,
  projectCards,
  selectedRoomId,
  onNavigateHome,
  onOpenProjects,
  onOpenRoom,
}: TeamSystemProps) {
  const personalTaskGroups = useQuery(api.tasks.listMineAcrossRooms);
  const deleteProject = useMutation(api.projects.deletePermanently);
  const [deleteTarget, setDeleteTarget] = useState<ProjectDeleteTarget | null>(null);

  if (activeSection === "home") {
    const nextTask = personalTaskGroups
      ?.flatMap((group) => group.tasks.map((task) => ({ ...task, projectTitle: group.projectTitle })))
      .filter((task) => {
        const needsAcceptance = task.isMine && task.acceptanceStatus === "pending";
        const needsReview = task.isReviewer && ["submitted", "review"].includes(task.status);
        const isActiveMine = task.isMine && !["verified", "completed"].includes(task.status);
        return needsAcceptance || needsReview || isActiveMine || task.isOpenForClaiming;
      })
      .sort((first, second) => first.dueDate.localeCompare(second.dueDate))[0];

    return (
      <section className="signed-in-home" aria-labelledby="signed-in-home-title">
        <header className="signed-in-welcome">
          <p className="kicker">Welcome back</p>
          <h1 className="display-heading" id="signed-in-home-title">{profile.displayName}</h1>
          <p>{rooms.length === 0 ? "Create a project room or join your team with a code." : "Pick up the clearest next action for your group project."}</p>
        </header>

        <div className="home-next-grid">
          {nextTask ? (
            <article className="home-focus-card home-next-action-card">
              <p className="card-eyebrow">Your next action</p>
              <h2>{nextTask.title}</h2>
              <p>{nextTask.projectTitle} · due {nextTask.dueDate}</p>
              <button className="primary-button" type="button" onClick={() => onOpenProjects("personal-tasks")}>Open task</button>
            </article>
          ) : rooms[0] ? (
            <article className="home-focus-card">
              <p className="card-eyebrow">Your next step</p>
              <h2>Continue your project</h2>
              <p>{rooms[0].name} · {rooms[0].memberCount} {rooms[0].memberCount === 1 ? "member" : "members"}</p>
              <button className="primary-button" type="button" onClick={() => onOpenRoom(rooms[0]._id)}>Continue project</button>
            </article>
          ) : (
            <article className="home-focus-card">
              <p className="card-eyebrow">Start here</p>
              <h2>Create your first project</h2>
              <p>Choose a framework, add the brief, select an allocation mode, then invite your team.</p>
              <button className="primary-button" type="button" onClick={() => onOpenProjects("create")}>Create project</button>
            </article>
          )}

          <aside className="home-due-card">
            <p className="card-eyebrow">Project at a glance</p>
            {nextTask ? (
              <><h2>Due {nextTask.dueDate}</h2><p>{nextTask.projectTitle} is the next deadline in your queue.</p><button className="quiet-button" type="button" onClick={() => onOpenProjects("personal-tasks")}>View all my tasks</button></>
            ) : rooms[0] ? (
              <><h2>{rooms[0].name}</h2><p>{rooms[0].memberCount} {rooms[0].memberCount === 1 ? "member" : "members"} · realtime workspace</p><button className="quiet-button" type="button" onClick={() => onOpenRoom(rooms[0]._id)}>Open project</button></>
            ) : (
              <><h2>Start with a project</h2><p>Create a room or join your team with a code.</p></>
            )}
          </aside>
        </div>

        <div className="home-secondary-actions">
          <button className="primary-button home-create-cta" type="button" onClick={() => onOpenProjects("create")}>{rooms.length ? "Create Another Project" : "Create Project"}</button>
          <button className="secondary-button home-join-cta" type="button" onClick={() => onOpenProjects("join")}>Join with Code</button>
        </div>
      </section>
    );
  }

  if (activeSection === "profile") {
    return <ProfileCenter />;
  }

  if (activeSection === "resources" || projectsView === "resources") {
    return <ResourcesPage currentProfileId={profile._id} />;
  }

  if (projectsView === "create" || projectsView === "join") {
    return (
      <ProjectOnboarding
        mode={projectsView}
        currentProfileId={profile._id}
        onCancel={onNavigateHome}
        onRoomReady={onOpenRoom}
      />
    );
  }

  if (projectsView === "personal-tasks") {
    return <PersonalTasks onOpenRoom={onOpenRoom} />;
  }

  if (projectsView === "room" && selectedRoomId) {
    return <TeamWorkspace selectedTeamId={selectedRoomId} teams={rooms} onAddTeam={() => onOpenProjects("create")} onSelectTeam={onOpenRoom} activeSection="projects" />;
  }

  return (
    <section className="projects-index" aria-labelledby="projects-index-title">
      <header className="focused-page-heading">
        <div><p className="kicker">Rooms and projects</p><h1 className="display-heading" id="projects-index-title">Projects</h1><p>Open a room, create a project, or join one with a code.</p></div>
        <button className="primary-button" type="button" onClick={() => onOpenProjects("create")}>Create project</button>
      </header>
      <div className="projects-index-actions">
        <button className="quiet-button" type="button" onClick={() => onOpenProjects("join")}>Join with code</button>
        <button className="quiet-button" type="button" onClick={() => onOpenProjects("personal-tasks")}>View my tasks</button>
      </div>
      {projectCards === undefined ? <p aria-busy="true">Loading projects…</p> : null}
      {projectCards !== undefined && projectCards.length === 0 && rooms.length === 0 ? (
        <div className="project-empty"><strong>No rooms yet.</strong><p>Create a project or join your teammates to begin.</p></div>
      ) : projectCards !== undefined ? (
        <div className="room-index-grid">
          {projectCards.map((project, index) => (
            <article key={project._id} className="project-index-card-shell">
              <button
                className="room-index-card room-index-card-colored project-index-card"
                type="button"
                style={{ "--group-color": getGroupColor(index) } as CSSProperties}
                onClick={() => onOpenRoom(project.teamId)}
              >
                <span className="live-badge"><i aria-hidden="true" /> {project.status}</span>
                <strong>{project.title}</strong>
                <small>{project.roomName} · {project.memberCount} {project.memberCount === 1 ? "member" : "members"}</small>
                <span>{project.frameworkName}</span>
                <span>Open project →</span>
              </button>
              {project.canDelete ? (
                <button
                  className="project-index-delete-button"
                  type="button"
                  aria-label={`Delete ${project.title}`}
                  title="Delete project"
                  onClick={() => setDeleteTarget({ projectId: project._id, projectTitle: project.title })}
                >
                  <X aria-hidden="true" />
                </button>
              ) : null}
            </article>
          ))}
          {rooms
            .filter((room) => !projectCards.some((project) => project.teamId === room._id))
            .map((room, index) => (
              <button
                key={room._id}
                className="room-index-card room-index-card-colored"
                type="button"
                style={{ "--group-color": getGroupColor(projectCards.length + index) } as CSSProperties}
                onClick={() => onOpenRoom(room._id)}
              >
                <span className="live-badge"><i aria-hidden="true" /> Realtime room</span>
                <strong>{room.name}</strong>
                <small>{room.memberCount} {room.memberCount === 1 ? "member" : "members"}</small>
                <span>Project setup waiting →</span>
              </button>
            ))}
        </div>
      ) : null}
      {deleteTarget ? (
        <ProjectDeleteDialog
          key={deleteTarget.projectId}
          target={deleteTarget}
          onCancel={() => setDeleteTarget(null)}
          onConfirm={async (confirmationName) => {
            await deleteProject({ projectId: deleteTarget.projectId, confirmationName });
            setDeleteTarget(null);
          }}
        />
      ) : null}
    </section>
  );
}
