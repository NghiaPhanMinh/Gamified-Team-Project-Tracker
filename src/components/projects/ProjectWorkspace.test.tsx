import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import type { Id } from "../../../convex/_generated/dataModel";
import { ProjectWorkspace } from "./ProjectWorkspace";

const workspace = {
  project: {
    _id: "project-1" as Id<"projects">,
    teamId: "team-1" as Id<"teams">,
    creatorProfileId: "profile-1" as Id<"userProfiles">,
    title: "Campaign",
    description: "Launch the campaign.",
    frameworkName: "Nonlinear Design Process",
    setupMode: "manual" as const,
    startDate: "2026-08-10",
    deadline: "2026-08-20",
    status: "active" as const,
    tasksLocked: false,
  },
  currentProfileId: "profile-1" as Id<"userProfiles">,
  canManageProject: true,
  canWrite: true,
  isTeamOwner: true,
  isLaunched: true,
  fairReviewCapacity: 1,
  reviewerLoads: [{ profileId: "profile-2" as Id<"userProfiles">, reviewCount: 1 }],
  phases: [{
    _id: "phase-1" as Id<"phases">,
    frameworkPhaseKey: "production",
    title: "Production",
    description: "Make the work.",
    order: 1,
    status: "active" as const,
  }],
  milestones: [],
  members: [
    { profileId: "profile-1" as Id<"userProfiles">, displayName: "Anh" },
    { profileId: "profile-2" as Id<"userProfiles">, displayName: "Quinn" },
  ],
  tasks: [{
    _id: "task-1" as Id<"tasks">,
    projectId: "project-1" as Id<"projects">,
    phaseId: "phase-1" as Id<"phases">,
    title: "Final illustration",
    description: "Finish and export the artwork.",
    primaryOwnerProfileId: "profile-1" as Id<"userProfiles">,
    collaboratorProfileIds: [],
    requiredSkills: ["Illustration"],
    estimatedEffortHours: 4,
    difficulty: 2,
    weight: 2,
    damage: 20,
    required: true,
    startDate: "2026-08-10",
    dueDate: "2026-08-16",
    dependencyTaskIds: [],
    requiresReview: true,
    reviewerProfileId: "profile-2" as Id<"userProfiles">,
    isOpenForClaiming: false,
    acceptanceStatus: "accepted" as const,
    assignmentState: "assigned" as const,
    collaboratorCanSubmit: false,
    status: "in_progress" as const,
    createdAt: 1,
    updatedAt: 1,
  }],
};

vi.mock("convex/react", () => ({
  useQuery: () => workspace,
  useMutation: () => vi.fn(),
}));

vi.mock("../game/BattleScene", () => ({
  BattleScene: () => <div aria-label="Shared Battle Scene">Realtime Battle</div>,
}));
vi.mock("./TaskEvidencePanel", () => ({
  TaskEvidencePanel: () => <div>Existing evidence workflow</div>,
}));
vi.mock("./TaskTradePanel", () => ({
  TaskTradePanel: () => <details><summary>Task trades</summary></details>,
}));
vi.mock("./AllocationWorkbench", () => ({
  AllocationWorkbench: () => <div>Workload snapshot</div>,
}));
vi.mock("./ProjectTeamMembers", () => ({ ProjectTeamMembers: () => <div>Members</div> }));
vi.mock("./DailyEvidenceFeed", () => ({ DailyEvidenceFeed: () => <div>Daily feed</div> }));
vi.mock("./AIPlanningAssistant", () => ({ AIPlanningAssistant: () => null }));

describe("ProjectWorkspace Battle hierarchy", () => {
  afterEach(cleanup);

  it("uses one dominant Battle in Overview and places tools after sticky tasks", () => {
    render(<ProjectWorkspace projectId={"project-1" as Id<"projects">} onClose={vi.fn()} />);

    expect(screen.getAllByLabelText("Shared Battle Scene")).toHaveLength(1);
    expect(screen.queryByRole("button", { name: "Battle Scene" })).not.toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Your next move" })).toBeInTheDocument();
    expect(screen.getByText("More Tools")).toBeInTheDocument();

    const battle = screen.getByLabelText("Shared project Battle scene");
    const taskBoard = screen.getByRole("region", { name: "Your next move" });
    const tools = screen.getByText("More Tools").closest("details");
    expect(battle.compareDocumentPosition(taskBoard) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(taskBoard.compareDocumentPosition(tools!) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("opens the existing evidence workflow directly from the owner task note", () => {
    render(<ProjectWorkspace projectId={"project-1" as Id<"projects">} onClose={vi.fn()} />);

    fireEvent.click(screen.getByRole("button", { name: "Submit Task" }));

    expect(screen.getByRole("dialog", { name: "Final illustration" })).toBeInTheDocument();
    expect(screen.getByText("Existing evidence workflow")).toBeInTheDocument();
  });
});
