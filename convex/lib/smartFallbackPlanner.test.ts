import { describe, expect, it } from "vitest";
import { generateSmartFallbackPlan } from "./smartFallbackPlanner";

describe("smartFallbackPlanner", () => {
  const mockContext = {
    project: { projectId: "proj_1", title: "Prototype Website", description: "React app", frameworkName: "Agile", startDate: "2026-08-01", deadline: "2026-08-30" },
    phases: [{ phaseId: "phase_1", title: "Requirements" }, { phaseId: "phase_2", title: "Execution" }],
    members: [{ profileId: "mem_1", displayName: "Anh" }, { profileId: "mem_2", displayName: "Minh" }],
  };

  it("generates a web domain plan for web keywords", () => {
    const plan = generateSmartFallbackPlan(mockContext, "Build a React website with Convex backend");
    expect(plan.recommendedFramework).toContain("Agile");
    expect(plan.milestones.length).toBeGreaterThan(0);
    expect(plan.tasks.length).toBeGreaterThanOrEqual(5);
    expect(plan.tasks[0].primaryOwnerProfileId).toBe("mem_1");
  });

  it("generates a mobile app plan for app keywords", () => {
    const mobileContext = { ...mockContext, project: { ...mockContext.project, title: "Mobile Order App" } };
    const plan = generateSmartFallbackPlan(mobileContext, "Build Flutter mobile app for iOS and Android");
    expect(plan.tasks[0].title).toContain("Mobile");
  });

  it("generates a generic plan for unknown domain", () => {
    const genericContext = { ...mockContext, project: { ...mockContext.project, title: "Random Activity" } };
    const plan = generateSmartFallbackPlan(genericContext, "Do some tasks");
    expect(plan.tasks.length).toBe(5);
  });
});
