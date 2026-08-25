import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Id } from "../../../convex/_generated/dataModel";
import authenticatedHomeSource from "../auth/AuthenticatedHome.tsx?raw";
import battleSceneSource from "../game/BattleScene.tsx?raw";
import resourcesSource from "../resources/ResourcesPage.tsx?raw";
import teamSystemSource from "./TeamSystem.tsx?raw";
import { ProjectRemovalDialog, ProjectIndexCard, type ProjectSummary } from "./TeamSystem";

const projectStatuses: ProjectSummary["status"][] = [
  "planning",
  "active",
  "at_risk",
  "overdue",
  "completed",
  "archived",
];

function projectForStatus(status: ProjectSummary["status"]): ProjectSummary {
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
    updatedAt: 1,
  };
}

describe("personal project removal dialog", () => {
  afterEach(cleanup);

  it("clearly confirms that removal affects only the current account", async () => {
    const onCancel = vi.fn();
    const onConfirm = vi.fn().mockResolvedValue(undefined);
    render(
      <ProjectRemovalDialog
        target={{ projectId: "project-1" as Id<"projects">, projectTitle: "Studio Prototype" }}
        onCancel={onCancel}
        onConfirm={onConfirm}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove from my account" }));

    await waitFor(() => expect(onConfirm).toHaveBeenCalledOnce());
    expect(screen.getByText(/teammates keep the room, tasks, files, progress, and shared history/i)).toBeInTheDocument();
  });

  it("keeps cancellation separate from the destructive action", () => {
    const onCancel = vi.fn();
    render(
      <ProjectRemovalDialog
        target={{ projectId: "project-2" as Id<"projects">, projectTitle: "Research Sprint" }}
        onCancel={onCancel}
        onConfirm={vi.fn().mockResolvedValue(undefined)}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it("keeps the dialog open and reports an error when account removal fails", async () => {
    render(
      <ProjectRemovalDialog
        target={{ projectId: "project-3" as Id<"projects">, projectTitle: "Failed Removal" }}
        onCancel={vi.fn()}
        onConfirm={vi.fn().mockRejectedValue(new Error("Removal was rejected"))}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Remove from my account" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Removal was rejected");
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

describe("project card personal removal visibility", () => {
  afterEach(cleanup);

  it.each(projectStatuses)("shows the account-removal X for every member on a %s project", (status) => {
    const onRequestRemoval = vi.fn();
    const project = projectForStatus(status);

    render(
      <ProjectIndexCard
        project={project}
        colorIndex={0}
        onOpen={vi.fn()}
        onRequestRemoval={onRequestRemoval}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: `Remove ${project.title} from my account` }));
    expect(onRequestRemoval).toHaveBeenCalledOnce();
  });
});
