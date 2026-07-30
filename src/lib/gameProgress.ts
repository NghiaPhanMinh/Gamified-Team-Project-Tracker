export type PracticalTaskStatus =
  | "todo"
  | "in_progress"
  | "blocked"
  | "review"
  | "completed";

export type WeightedProgressTask = {
  id: string;
  title: string;
  weight: number;
  required: boolean;
  status: PracticalTaskStatus;
  dueDate?: string;
};

export type ProgressMilestone = {
  id: string;
  title: string;
  requiredTaskIds: string[];
};

export type PracticalProjectStatus =
  | "planning"
  | "active"
  | "at_risk"
  | "overdue"
  | "completed"
  | "archived";

function isBeforeDate(firstDate: string, secondDate: string) {
  return firstDate < secondDate;
}

export function calculateWeightedProgress(tasks: WeightedProgressTask[]) {
  const requiredTasks = tasks.filter(
    (task) => task.required && Number.isFinite(task.weight) && task.weight > 0,
  );
  const totalWeight = requiredTasks.reduce(
    (total, task) => total + task.weight,
    0,
  );
  const completedWeight = requiredTasks
    .filter((task) => task.status === "completed")
    .reduce((total, task) => total + task.weight, 0);
  const progress =
    totalWeight === 0 ? 0 : Math.min(1, completedWeight / totalWeight);

  return {
    totalWeight,
    completedWeight,
    progress,
    progressPercent: Math.round(progress * 100),
    bossHealthPercent: Math.round((1 - progress) * 100),
  };
}

export function calculateMilestoneProgress(
  tasks: WeightedProgressTask[],
  milestones: ProgressMilestone[],
) {
  const completedTaskIds = new Set(
    tasks
      .filter((task) => task.status === "completed")
      .map((task) => task.id),
  );
  const milestoneStates = milestones.map((milestone) => ({
    ...milestone,
    completed:
      milestone.requiredTaskIds.length > 0 &&
      milestone.requiredTaskIds.every((taskId) =>
        completedTaskIds.has(taskId),
      ),
  }));

  return {
    milestones: milestoneStates,
    completedCount: milestoneStates.filter((milestone) => milestone.completed)
      .length,
    totalCount: milestoneStates.length,
  };
}

export function derivePracticalProjectStatus(input: {
  tasks: WeightedProgressTask[];
  deadline: string;
  today: string;
  archived?: boolean;
}) {
  if (input.archived) {
    return "archived" satisfies PracticalProjectStatus;
  }

  const progress = calculateWeightedProgress(input.tasks);

  if (progress.totalWeight === 0) {
    return "planning" satisfies PracticalProjectStatus;
  }

  if (progress.progress === 1) {
    return "completed" satisfies PracticalProjectStatus;
  }

  if (isBeforeDate(input.deadline, input.today)) {
    return "overdue" satisfies PracticalProjectStatus;
  }

  const hasBlockedRequiredTask = input.tasks.some(
    (task) => task.required && task.status === "blocked",
  );
  const hasOverdueRequiredTask = input.tasks.some(
    (task) =>
      task.required &&
      task.status !== "completed" &&
      task.dueDate !== undefined &&
      isBeforeDate(task.dueDate, input.today),
  );

  if (hasBlockedRequiredTask || hasOverdueRequiredTask) {
    return "at_risk" satisfies PracticalProjectStatus;
  }

  return "active" satisfies PracticalProjectStatus;
}

export function describeGameState(status: PracticalProjectStatus) {
  switch (status) {
    case "planning":
      return "Choose required work before the encounter begins.";
    case "active":
      return "The boss is active. Every completed weighted task moves the team forward.";
    case "at_risk":
      return "The boss is pushing back. Resolve blocked or overdue required work.";
    case "overdue":
      return "The deadline passed and the boss is still standing.";
    case "completed":
      return "Boss defeated! The practical project status is completed.";
    case "archived":
      return "This encounter is archived. Its project history remains available.";
  }
}
