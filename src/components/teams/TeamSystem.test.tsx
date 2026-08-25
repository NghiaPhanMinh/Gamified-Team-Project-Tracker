import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Id } from "../../../convex/_generated/dataModel";
import authenticatedHomeSource from "../auth/AuthenticatedHome.tsx?raw";
import battleSceneSource from "../game/BattleScene.tsx?raw";
import resourcesSource from "../resources/ResourcesPage.tsx?raw";
import teamSystemSource from "./TeamSystem.tsx?raw";
import { ProjectDeleteDialog, ProjectIndexCard, type ProjectSummary } from "./TeamSystem";

const projectStatuses: ProjectSummary["status"][] = [
  "planning",
  "active",
  "at_risk",
  "overdue",
  "completed",
  "archived",
];

function projectForStatus(status: ProjectSummary["status"], canDelete: boolean): ProjectSummary {
  return {
    _id: `project-${status}` as Id<"projects">,
    teamId: "team-1" as Id<"teams">,
    roomName: "Studio Team",
    title: `${status} project`,
    description: "Project card deletion regression fixture.",
    frameworkName: "Nonlinear Design Process",
    status,
    deadline: "2026-08-31",
    memberCount: 4,
    canDelete,
    updatedAt: 1,
  };
}

describe("project deletion dialog", () => {
  afterEach(cleanup);

  it("requires the exact project name before confirming permanent deletion", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ProjectDeleteDialog
        target={{ projectId: "project-1" as Id<"projects">, projectTitle: "Studio Prototype" }}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    const deleteButton = screen.getByRole("button", { name: "Delete project" });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Project name confirmation"), { target: { value: "Studio" } });
    expect(deleteButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText("Project name confirmation"), { target: { value: "Studio Prototype" } });
    expect(deleteButton).toBeEnabled();
    fireEvent.click(deleteButton);

    await waitFor(() => expect(onConfirm).toHaveBeenCalledWith("Studio Prototype"));
    expect(screen.getByText(/cannot be undone/i)).toBeInTheDocument();
  });

  it("keeps cancellation separate from the destructive action", () => {
    const onCancel = vi.fn();
    render(
      <ProjectDeleteDialog
        target={{ projectId: "project-2" as Id<"projects">, projectTitle: "Research Sprint" }}
        onCancel={onCancel}
        onConfirm={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("keeps the dialog open and reports an error when backend deletion fails", async () => {
    render(
      <ProjectDeleteDialog
        target={{ projectId: "project-3" as Id<"projects">, projectTitle: "Failed Delete" }}
        onCancel={vi.fn()}
        onConfirm={vi.fn().mockRejectedValue(new Error("Deletion was rejected"))}
      />,
    );

    fireEvent.change(screen.getByLabelText("Project name confirmation"), { target: { value: "Failed Delete" } });
    fireEvent.click(screen.getByRole("button", { name: "Delete project" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Deletion was rejected");
    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("uses one reactive project source for the sidebar, grid, and resource selector", () => {
    expect(authenticatedHomeSource).toContain("api.projects.listMineAcrossRooms");
    expect(authenticatedHomeSource).toContain("availableProjects.map");
    expect(authenticatedHomeSource).toContain("projectCards={projects}");
    expect(authenticatedHomeSource).toContain("availableProjects.some((project) => project.teamId === room._id)");
    expect(authenticatedHomeSource).toContain('navigate("/projects", { replace: true })');
    expect(teamSystemSource).not.toContain("const projectCards = useQuery(api.projects.listMineAcrossRooms)");
    expect(resourcesSource).toContain("api.projects.listMineAcrossRooms");
    expect([authenticatedHomeSource, battleSceneSource, teamSystemSource, resourcesSource].join("\n")).not.toContain("window.location.reload");
  });
});

describe("project card delete visibility", () => {
  afterEach(cleanup);

  it.each(projectStatuses)("shows the delete X for an authorised %s project", (status) => {
    const onRequestDelete = vi.fn();
    const project = projectForStatus(status, true);

    render(
      <ProjectIndexCard
        project={project}
        colorIndex={0}
        onOpen={vi.fn()}
        onRequestDelete={onRequestDelete}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: `Delete ${project.title}` }));
    expect(onRequestDelete).toHaveBeenCalledOnce();
  });

  it.each(projectStatuses)("hides the delete X from an unauthorised member for a %s project", (status) => {
    const project = projectForStatus(status, false);

    render(
      <ProjectIndexCard
        project={project}
        colorIndex={0}
        onOpen={vi.fn()}
        onRequestDelete={vi.fn()}
      />,
    );

    expect(screen.queryByRole("button", { name: `Delete ${project.title}` })).not.toBeInTheDocument();
  });
});
