import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AIPlanningAssistant } from "./AIPlanningAssistant";

const mocks = vi.hoisted(() => ({
  generatePlan: vi.fn(),
}));

vi.mock("convex/react", () => ({
  useAction: () => mocks.generatePlan,
  useMutation: () => vi.fn(),
  useQuery: () => ({ platformGenerationAvailable: true }),
}));

vi.mock("../../lib/byokSession", () => ({ getByokSession: () => null }));
vi.mock("../../lib/analytics", () => ({ trackEvent: vi.fn() }));

const draft = {
  recommendedFramework: "Nonlinear Design Process (Smart Template)",
  frameworkReason: "The iterative structure matches the brief.",
  milestones: [{ tempId: "milestone-1", title: "Milestone 1: Empathise", description: "Completion check for Empathise deliverables.", phaseId: "phase-1", dueDate: "2026-08-29" }],
  tasks: Array.from({ length: 5 }, (_, index) => ({
    tempId: `task-${index + 1}`,
    title: `Project task ${index + 1}`,
    description: "Complete the planned work.",
    phaseId: "phase-1",
    milestoneTempId: "milestone-1",
    primaryOwnerProfileId: "member-1",
    collaboratorProfileIds: [],
    requiredSkills: ["Planning"],
    estimatedEffortHours: 4,
    difficulty: 2,
    weight: 1,
    required: true,
    startDate: "2026-08-24",
    dueDate: "2026-08-29",
    dependencyTempIds: [],
    requiresReview: true,
    reviewerProfileId: null,
    allocationExplanation: "Available capacity.",
    longTaskBreakdown: "",
  })),
  risks: [],
  assumptions: [],
};

const workspace = {
  project: { _id: "project-1", description: "Create and test a complete interaction design prototype.", status: "active" },
  phases: [{ _id: "phase-1", title: "Empathise" }],
  members: [{ profileId: "member-1", displayName: "anh quynh" }],
};

describe("AIPlanningAssistant presentation", () => {
  beforeEach(() => {
    mocks.generatePlan.mockReset();
    mocks.generatePlan.mockResolvedValue(draft);
  });
  afterEach(cleanup);

  it("numbers suggested tasks and separates milestone metadata", async () => {
    const { container } = render(<AIPlanningAssistant workspace={workspace as never} onUseTask={vi.fn()} />);
    fireEvent.click(screen.getByRole("button", { name: /Generate AI Plan/i }));

    await waitFor(() => expect(screen.getByText("Nonlinear Design Process (Smart Template)")).toBeInTheDocument());
    expect(screen.getByText("Due: 2026-08-29 · Phase: Empathise")).toBeInTheDocument();
    expect([...container.querySelectorAll(".ai-task-sequence")].map((item) => item.textContent)).toEqual(["01", "02", "03", "04", "05"]);
  });
});
