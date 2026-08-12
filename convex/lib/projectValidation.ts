const BUILT_IN_FRAMEWORK_IDS = new Set([
  "design-nonlinear",
  "marketing-campaign",
  "business-project",
  "architecture-spatial",
  "media-production",
  "software-agile",
  "academic-research",
]);

const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

export type ProjectPhaseInput = {
  key: string;
  name: string;
  description: string;
  canOverlap: boolean;
  dependencyKeys: string[];
  reviewCheckpoint: boolean;
};

export type ProjectMemberInput = {
  profileId: string;
  skills: string[];
  availability: string;
  currentWorkload: "low" | "medium" | "high";
  preferences: string;
  weeklyCapacity?: number;
};

function normaliseText(value: string, label: string, maxLength: number) {
  const normalised = value.trim().replace(/\s+/g, " ");

  if (normalised.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }

  return normalised;
}

export function validateProjectDetails(input: {
  title: string;
  description: string;
  startDate?: string;
  deadline: string;
}) {
  const title = normaliseText(input.title, "Project title", 100);
  const description = normaliseText(
    input.description,
    "Project description",
    1_500,
  );

  if (title.length < 2) {
    throw new Error("Project title must contain at least 2 characters.");
  }

  const startDate = input.startDate ?? new Date().toISOString().slice(0, 10);

  if (!ISO_DATE_PATTERN.test(startDate) || !ISO_DATE_PATTERN.test(input.deadline)) {
    throw new Error("Project dates must use the YYYY-MM-DD format.");
  }

  if (input.deadline < startDate) {
    throw new Error("Project deadline cannot be before the start date.");
  }

  return {
    title,
    description,
    startDate,
    deadline: input.deadline,
  };
}

export function validateBuiltInFramework(
  frameworkId: string,
  frameworkName: string,
  phases: ProjectPhaseInput[],
) {
  if (!BUILT_IN_FRAMEWORK_IDS.has(frameworkId)) {
    throw new Error("Choose a recognised MayLamDi framework.");
  }

  return {
    frameworkName: normaliseText(frameworkName, "Framework name", 100),
    phases: validateProjectPhases(phases),
  };
}

export function validateProjectPhases(phases: ProjectPhaseInput[]) {
  if (phases.length < 1 || phases.length > 20) {
    throw new Error("A project must contain between 1 and 20 phases.");
  }

  const keys = phases.map((phase) =>
    normaliseText(phase.key, "Phase key", 80),
  );
  const keySet = new Set(keys);

  if (keySet.size !== keys.length || keys.some((key) => key.length === 0)) {
    throw new Error("Project phase keys must be present and unique.");
  }

  return phases.map((phase, index) => {
    const dependencyKeys = [...new Set(phase.dependencyKeys)];

    if (
      dependencyKeys.some(
        (dependencyKey) =>
          !keySet.has(dependencyKey) || dependencyKey === keys[index],
      )
    ) {
      throw new Error("Every phase dependency must reference another phase.");
    }

    return {
      key: keys[index],
      name: normaliseText(phase.name, "Phase name", 100),
      description: normaliseText(
        phase.description,
        "Phase description",
        800,
      ),
      canOverlap: phase.canOverlap,
      dependencyKeys,
      reviewCheckpoint: phase.reviewCheckpoint,
    };
  });
}

export function validateMemberPlanning(input: ProjectMemberInput) {
  const skills = [...new Set(input.skills.map((skill) => skill.trim()))]
    .filter(Boolean)
    .slice(0, 20)
    .map((skill) => normaliseText(skill, "Skill", 60));
  const availability = normaliseText(
    input.availability,
    "Availability",
    300,
  );
  const preferences = normaliseText(
    input.preferences,
    "Preferences",
    300,
  );

  if (
    input.weeklyCapacity !== undefined &&
    (!Number.isFinite(input.weeklyCapacity) ||
      input.weeklyCapacity < 0 ||
      input.weeklyCapacity > 168)
  ) {
    throw new Error("Weekly capacity must be between 0 and 168 hours.");
  }

  return {
    skills,
    availability,
    currentWorkload: input.currentWorkload,
    preferences,
    weeklyCapacity: input.weeklyCapacity,
  };
}
