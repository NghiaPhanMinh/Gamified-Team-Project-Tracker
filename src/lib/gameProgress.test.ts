import { describe, expect, it } from "vitest";

import {
  calculateMilestoneProgress,
  calculateWeightedProgress,
  derivePracticalProjectStatus,
  type WeightedProgressTask,
} from "./gameProgress";

const tasks: WeightedProgressTask[] = [
  {
    id: "research",
    title: "Research",
    weight: 2,
    required: true,
    status: "completed",
  },
  {
    id: "prototype",
    title: "Prototype",
    weight: 6,
    required: true,
    status: "in_progress",
  },
  {
    id: "bonus",
    title: "Optional polish",
    weight: 100,
    required: false,
    status: "completed",
  },
];

describe("game progress engine", () => {
  it("uses completed required weight rather than task count", () => {
    expect(calculateWeightedProgress(tasks)).toEqual({
      totalWeight: 8,
      completedWeight: 2,
      progress: 0.25,
      progressPercent: 25,
      bossHealthPercent: 75,
    });
  });

  it("ignores optional, zero, negative, and invalid weights", () => {
    const result = calculateWeightedProgress([
      ...tasks,
      {
        id: "zero",
        title: "Zero",
        weight: 0,
        required: true,
        status: "completed",
      },
      {
        id: "invalid",
        title: "Invalid",
        weight: Number.NaN,
        required: true,
        status: "completed",
      },
    ]);

    expect(result.totalWeight).toBe(8);
    expect(result.progressPercent).toBe(25);
  });

  it("completes milestones only when every required task is complete", () => {
    const milestones = calculateMilestoneProgress(tasks, [
      {
        id: "discovery",
        title: "Discovery",
        requiredTaskIds: ["research"],
      },
      {
        id: "making",
        title: "Making",
        requiredTaskIds: ["research", "prototype"],
      },
    ]);

    expect(milestones.completedCount).toBe(1);
    expect(milestones.milestones.map((milestone) => milestone.completed)).toEqual(
      [true, false],
    );
  });

  it("keeps practical statuses independent from game copy", () => {
    expect(
      derivePracticalProjectStatus({
        tasks,
        deadline: "2026-08-30",
        today: "2026-07-31",
      }),
    ).toBe("active");
    expect(
      derivePracticalProjectStatus({
        tasks,
        deadline: "2026-07-01",
        today: "2026-07-31",
      }),
    ).toBe("overdue");
    expect(
      derivePracticalProjectStatus({
        tasks: tasks.map((task) =>
          task.required ? { ...task, status: "completed" as const } : task,
        ),
        deadline: "2026-07-01",
        today: "2026-07-31",
      }),
    ).toBe("completed");
    expect(
      derivePracticalProjectStatus({
        tasks,
        deadline: "2026-08-30",
        today: "2026-07-31",
        archived: true,
      }),
    ).toBe("archived");
  });
});
