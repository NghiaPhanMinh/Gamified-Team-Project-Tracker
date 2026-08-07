import { describe, expect, it } from "vitest";

import {
  rankAllocationCandidates,
  scoreAllocationCandidate,
  type AllocationMember,
  type AllocationTask,
} from "./allocationEngine";

const task: AllocationTask = {
  id: "task-1",
  title: "Edit campaign video",
  description: "Cut interviews and prepare motion graphics.",
  requiredSkills: ["video editing", "motion graphics"],
  estimatedEffortHours: 8,
  dependencyTaskIds: [],
};

function member(
  overrides: Partial<AllocationMember> = {},
): AllocationMember {
  return {
    id: "member-1",
    displayName: "Alex",
    skills: ["video editing", "motion graphics"],
    availability: "Tuesday and Thursday",
    currentWorkload: "low",
    preferences: "video interviews",
    weeklyCapacity: 10,
    assignedOpenEffort: 0,
    ...overrides,
  };
}

describe("deterministic allocation scoring", () => {
  it("prioritises a stronger skill match when other inputs are equal", () => {
    const candidates = rankAllocationCandidates({
      members: [
        member({ id: "strong", displayName: "Strong fit" }),
        member({
          id: "partial",
          displayName: "Partial fit",
          skills: ["research"],
        }),
      ],
      task,
      completedTaskIds: new Set(),
    });

    expect(candidates[0].memberId).toBe("strong");
    expect(candidates[0].breakdown.skillMatch).toBeGreaterThan(
      candidates[1].breakdown.skillMatch,
    );
  });

  it("treats zero capacity as a hard constraint", () => {
    const score = scoreAllocationCandidate({
      member: member({ weeklyCapacity: 0 }),
      task,
      completedTaskIds: new Set(),
    });

    expect(score.eligible).toBe(false);
    expect(score.totalScore).toBe(0);
    expect(score.explanation.join(" ")).toMatch(/no availability/i);
  });

  it("reduces the score for high workload and existing effort", () => {
    const available = scoreAllocationCandidate({
      member: member({ id: "available" }),
      task,
      completedTaskIds: new Set(),
    });
    const busy = scoreAllocationCandidate({
      member: member({
        id: "busy",
        currentWorkload: "high",
        assignedOpenEffort: 20,
      }),
      task,
      completedTaskIds: new Set(),
    });

    expect(available.breakdown.workloadBalance).toBeGreaterThan(
      busy.breakdown.workloadBalance,
    );
    expect(available.totalScore).toBeGreaterThan(busy.totalScore);
  });

  it("uses preferences and dependency readiness as visible inputs", () => {
    const ready = scoreAllocationCandidate({
      member: member({ preferences: "video interviews" }),
      task: { ...task, dependencyTaskIds: ["research"] },
      completedTaskIds: new Set(["research"]),
    });
    const waiting = scoreAllocationCandidate({
      member: member({ preferences: "budget spreadsheets" }),
      task: { ...task, dependencyTaskIds: ["research"] },
      completedTaskIds: new Set(),
    });

    expect(ready.breakdown.preferenceFit).toBeGreaterThan(
      waiting.breakdown.preferenceFit,
    );
    expect(ready.breakdown.dependencyTiming).toBe(5);
    expect(waiting.breakdown.dependencyTiming).toBe(0);
  });

  it("returns stable scores and ordering for the same inputs", () => {
    const input = {
      members: [
        member({ id: "b", displayName: "Bailey" }),
        member({ id: "a", displayName: "Avery" }),
      ],
      task,
      completedTaskIds: new Set<string>(),
    };

    const first = rankAllocationCandidates(input);
    const second = rankAllocationCandidates(input);

    expect(first).toEqual(second);
    expect(first.map((candidate) => candidate.displayName)).toEqual([
      "Avery",
      "Bailey",
    ]);
    expect(first[0].totalScore).toBe(
      Object.values(first[0].breakdown).reduce(
        (sum, component) => sum + component,
        0,
      ),
    );
  });
});
