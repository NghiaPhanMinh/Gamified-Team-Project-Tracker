import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Doc, Id } from "../../../convex/_generated/dataModel";
import type { MainSection, ProjectsView } from "../../lib/navigation";
import { PersonalTasks } from "../projects/PersonalTasks";
import { ProjectOnboarding } from "../projects/ProjectOnboarding";
import { TeamWorkspace } from "./TeamWorkspace";
import { ProfileCenter } from "../profile/ProfileCenter";

type RoomSummary = {
  _id: Id<"teams">;
  name: string;
  memberCount: number;
};

type TeamSystemProps = {
  profile: Doc<"userProfiles">;
  activeSection: MainSection;
  projectsView: ProjectsView;
  rooms: RoomSummary[];
  selectedRoomId: Id<"teams"> | null;
  onNavigateHome: () => void;
  onOpenProjects: (view: ProjectsView) => void;
  onOpenRoom: (roomId: Id<"teams">) => void;
};

export function TeamSystem({
  profile,
  activeSection,
  projectsView,
  rooms,
  selectedRoomId,
  onNavigateHome,
  onOpenProjects,
  onOpenRoom,
}: TeamSystemProps) {
  const personalTaskGroups = useQuery(api.tasks.listMineAcrossRooms);

  if (activeSection === "home") {
    const nextTask = personalTaskGroups
      ?.flatMap((group) => group.tasks.map((task) => ({ ...task, projectTitle: group.projectTitle })))
      .filter((task) => task.isMine && !["verified", "completed"].includes(task.status))
      .sort((first, second) => first.dueDate.localeCompare(second.dueDate))[0];

    return (
      <section className="signed-in-home" aria-labelledby="signed-in-home-title">
        <header className="signed-in-welcome">
          <p className="kicker">Welcome back</p>
          <h1 className="display-heading" id="signed-in-home-title">{profile.displayName}</h1>
          <p>{rooms.length === 0 ? "Create a project room or join your team with a code." : "Pick up the clearest next action for your group project."}</p>
        </header>

        <div className="home-next-grid">
          {rooms[0] ? (
            <article className="home-focus-card">
              <p className="card-eyebrow">Recently accessed room</p>
              <h2>{rooms[0].name}</h2>
              <p>{rooms[0].memberCount} {rooms[0].memberCount === 1 ? "member" : "members"} · realtime workspace</p>
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
            <p className="card-eyebrow">Due next</p>
            {nextTask ? (
              <><h2>{nextTask.title}</h2><p>{nextTask.projectTitle} · due {nextTask.dueDate}</p><button className="quiet-button" type="button" onClick={() => onOpenProjects("personal-tasks")}>Open my tasks</button></>
            ) : (
              <><h2>No urgent tasks</h2><p>Your next assigned task will appear here.</p></>
            )}
          </aside>
        </div>

        <div className="home-secondary-actions">
          <button className="quiet-button" type="button" onClick={() => onOpenProjects("create")}>Create another project</button>
          <button className="quiet-button" type="button" onClick={() => onOpenProjects("join")}>Join with code</button>
        </div>
      </section>
    );
  }

  if (activeSection === "profile") {
    if (!selectedRoomId) {
      return <ProfileCenter />;
    }
    return <TeamWorkspace selectedTeamId={selectedRoomId} teams={rooms} onAddTeam={() => onOpenProjects("create")} onSelectTeam={onOpenRoom} activeSection="profile" />;
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
      {rooms.length === 0 ? (
        <div className="project-empty"><strong>No rooms yet.</strong><p>Create a project or join your teammates to begin.</p></div>
      ) : (
        <div className="room-index-grid">
          {rooms.map((room) => (
            <button key={room._id} className="room-index-card" type="button" onClick={() => onOpenRoom(room._id)}>
              <span className="live-badge"><i aria-hidden="true" /> Realtime room</span>
              <strong>{room.name}</strong>
              <small>{room.memberCount} {room.memberCount === 1 ? "member" : "members"}</small>
              <span>Open room →</span>
            </button>
          ))}
        </div>
      )}
    </section>
  );
}
