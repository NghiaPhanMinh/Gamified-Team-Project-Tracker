import { useEffect, useRef, useState } from "react";
import { useQuery } from "convex/react";

import { api } from "../../../convex/_generated/api";
import type { Id } from "../../../convex/_generated/dataModel";
import { ProjectWorkspace, type ProjectTab } from "./ProjectWorkspace";

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
  requestedProjectTab = "overview",
}: ProjectHubProps) {
  const projects = useQuery(api.projects.listForTeam, { teamId });
  const [openProjectId, setOpenProjectId] = useState<Id<"projects"> | null>(null);
  const selectedDefault = useRef(false);

  useEffect(() => {
    if (!selectedDefault.current && projects && projects.length > 0) {
      selectedDefault.current = true;
      setOpenProjectId(projects[0]._id);
    }
  }, [projects]);

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
          <article key={project._id} className={project.status === "archived" ? "is-archived" : ""}>
            <div><span className="project-status">{project.status}</span><span>{project.frameworkName}</span></div>
            <h3>{project.title}</h3>
            <p>{project.description || "No project brief yet."}</p>
            <dl><div><dt>Deadline</dt><dd>{project.deadline}</dd></div><div><dt>Team</dt><dd>{project.memberCount} members</dd></div></dl>
            <button className="primary-button project-open-button" type="button" onClick={() => setOpenProjectId(project._id)}>Open project</button>
          </article>
        ))}
      </div>
    </section>
  );
}
