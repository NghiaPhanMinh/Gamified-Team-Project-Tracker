export type AllocationMember = {
  id: string;
  displayName: string;
  skills: string[];
  availability: string;
  currentWorkload: "low" | "medium" | "high";
  preferences: string;
  weeklyCapacity?: number;
  assignedOpenEffort: number;
};

export type AllocationTask = {
  id: string;
  title: string;
  description: string;
  requiredSkills: string[];
  estimatedEffortHours: number;
  dependencyTaskIds: string[];
};

export type AllocationConfig = {
  skillMatch: number;
  availabilityFit: number;
  workloadBalance: number;
  preferenceFit: number;
  dependencyTiming: number;
};

export const DEFAULT_ALLOCATION_CONFIG: AllocationConfig = {
  skillMatch: 40,
  availabilityFit: 25,
  workloadBalance: 20,
  preferenceFit: 10,
  dependencyTiming: 5,
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(maximum, Math.max(minimum, value));
}

function round(value: number) {
  return Math.round(value * 10) / 10;
}

function tokens(value: string) {
  return new Set(
    value
      .toLowerCase()
      .split(/[^a-z0-9+#]+/)
      .map((token) => token.trim())
      .filter((token) => token.length > 1),
  );
}

function overlapCount(first: Set<string>, second: Set<string>) {
  return [...first].filter((value) => second.has(value)).length;
}

export function scoreAllocationCandidate(input: {
  member: AllocationMember;
  task: AllocationTask;
  completedTaskIds: Set<string>;
  config?: AllocationConfig;
}) {
  const config = input.config ?? DEFAULT_ALLOCATION_CONFIG;
  const availabilityText = input.member.availability.toLowerCase();
  const unavailable =
    input.member.weeklyCapacity === 0 ||
    /\bunavailable\b|\bno availability\b/.test(availabilityText);

  if (unavailable) {
    return {
      memberId: input.member.id,
      displayName: input.member.displayName,
      eligible: false,
      totalScore: 0,
      breakdown: {
        skillMatch: 0,
        availabilityFit: 0,
        workloadBalance: 0,
        preferenceFit: 0,
        dependencyTiming: 0,
      },
      explanation: [
        "Not suggested because this member reported no availability for the project.",
      ],
    };
  }

  const memberSkillTokens = tokens(input.member.skills.join(" "));
  const requiredSkillTokens = tokens(input.task.requiredSkills.join(" "));
  const skillRatio =
    requiredSkillTokens.size === 0
      ? 0.5
      : overlapCount(requiredSkillTokens, memberSkillTokens) /
        requiredSkillTokens.size;
  const skillMatch = config.skillMatch * skillRatio;
  const availabilityFit =
    input.member.weeklyCapacity === undefined
      ? config.availabilityFit * 0.5
      : config.availabilityFit *
        clamp(
          input.member.weeklyCapacity /
            Math.max(1, input.task.estimatedEffortHours),
          0,
          1,
        );
  const workloadBase =
    input.member.currentWorkload === "low"
      ? config.workloadBalance
      : input.member.currentWorkload === "medium"
        ? config.workloadBalance * 0.6
        : config.workloadBalance * 0.2;
  const capacityForBalance = Math.max(
    1,
    input.member.weeklyCapacity ?? 10,
  );
  const workloadPenalty = Math.min(
    config.workloadBalance * 0.5,
    (input.member.assignedOpenEffort / capacityForBalance) *
      config.workloadBalance *
      0.25,
  );
  const workloadBalance = clamp(
    workloadBase - workloadPenalty,
    0,
    config.workloadBalance,
  );
  const taskTokens = tokens(
    `${input.task.title} ${input.task.description} ${input.task.requiredSkills.join(" ")}`,
  );
  const preferenceTokens = tokens(input.member.preferences);
  const preferenceFit =
    preferenceTokens.size === 0
      ? config.preferenceFit * 0.5
      : config.preferenceFit *
        clamp(
          overlapCount(preferenceTokens, taskTokens) /
            Math.min(3, preferenceTokens.size),
          0,
          1,
        );
  const dependenciesReady = input.task.dependencyTaskIds.every((taskId) =>
    input.completedTaskIds.has(taskId),
  );
  const dependencyTiming = dependenciesReady ? config.dependencyTiming : 0;
  const breakdown = {
    skillMatch: round(skillMatch),
    availabilityFit: round(availabilityFit),
    workloadBalance: round(workloadBalance),
    preferenceFit: round(preferenceFit),
    dependencyTiming: round(dependencyTiming),
  };
  const explanation = [
    requiredSkillTokens.size === 0
      ? "This task has no required skills, so every member receives a neutral skill score."
      : `${overlapCount(requiredSkillTokens, memberSkillTokens)} of ${requiredSkillTokens.size} required skill terms match this member's self-reported skills.`,
    input.member.weeklyCapacity === undefined
      ? "Weekly capacity was not supplied, so availability receives a neutral score."
      : `${input.member.weeklyCapacity} self-reported hours are available against ${input.task.estimatedEffortHours} estimated task hours.`,
    `The member reported ${input.member.currentWorkload} current workload and has ${round(input.member.assignedOpenEffort)} open estimated hours already assigned.`,
    preferenceTokens.size === 0
      ? "No task preferences were supplied, so preference fit is neutral."
      : `${overlapCount(preferenceTokens, taskTokens)} preference terms match the task description or required skills.`,
    dependenciesReady
      ? "All recorded task dependencies are complete or none are required."
      : "At least one recorded dependency is not complete yet.",
  ];

  return {
    memberId: input.member.id,
    displayName: input.member.displayName,
    eligible: true,
    totalScore: round(Object.values(breakdown).reduce((sum, value) => sum + value, 0)),
    breakdown,
    explanation,
  };
}

export function rankAllocationCandidates(input: {
  members: AllocationMember[];
  task: AllocationTask;
  completedTaskIds: Set<string>;
  config?: AllocationConfig;
}) {
  return input.members
    .map((member) =>
      scoreAllocationCandidate({
        member,
        task: input.task,
        completedTaskIds: input.completedTaskIds,
        config: input.config,
      }),
    )
    .sort(
      (first, second) =>
        Number(second.eligible) - Number(first.eligible) ||
        second.totalScore - first.totalScore ||
        first.displayName.localeCompare(second.displayName),
    );
}
