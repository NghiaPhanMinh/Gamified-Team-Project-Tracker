const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function normaliseText(value: string, label: string, maxLength: number) {
  const normalised = value.trim().replace(/\s+/g, " ");

  if (normalised.length > maxLength) {
    throw new Error(`${label} must be ${maxLength} characters or fewer.`);
  }

  return normalised;
}

export function validateDate(value: string, label: string) {
  if (!ISO_DATE_PATTERN.test(value)) {
    throw new Error(`${label} must use the YYYY-MM-DD format.`);
  }

  return value;
}

export function validateMilestoneInput(input: {
  title: string;
  description: string;
  dueDate: string;
}) {
  const title = normaliseText(input.title, "Milestone title", 100);

  if (title.length < 2) {
    throw new Error("Milestone title must contain at least 2 characters.");
  }

  return {
    title,
    description: normaliseText(
      input.description,
      "Milestone description",
      800,
    ),
    dueDate: validateDate(input.dueDate, "Milestone due date"),
  };
}

export function validateTaskInput(input: {
  title: string;
  description: string;
  requiredSkills: string[];
  estimatedEffortHours: number;
  difficulty: number;
  weight: number;
  startDate: string;
  dueDate: string;
}) {
  const title = normaliseText(input.title, "Task title", 120);

  if (title.length < 2) {
    throw new Error("Task title must contain at least 2 characters.");
  }

  const startDate = validateDate(input.startDate, "Task start date");
  const dueDate = validateDate(input.dueDate, "Task due date");

  if (dueDate < startDate) {
    throw new Error("Task due date cannot be before its start date.");
  }

  if (
    !Number.isFinite(input.estimatedEffortHours) ||
    input.estimatedEffortHours <= 0 ||
    input.estimatedEffortHours > 2_000
  ) {
    throw new Error("Estimated effort must be between 0 and 2,000 hours.");
  }

  if (!Number.isInteger(input.difficulty) || input.difficulty < 1 || input.difficulty > 5) {
    throw new Error("Task difficulty must be a whole number from 1 to 5.");
  }

  if (!Number.isFinite(input.weight) || input.weight <= 0 || input.weight > 100) {
    throw new Error("Task weight must be between 0 and 100.");
  }

  const requiredSkills = [
    ...new Set(input.requiredSkills.map((skill) => skill.trim()).filter(Boolean)),
  ]
    .slice(0, 20)
    .map((skill) => normaliseText(skill, "Required skill", 60));

  return {
    title,
    description: normaliseText(input.description, "Task description", 1_500),
    requiredSkills,
    estimatedEffortHours: input.estimatedEffortHours,
    difficulty: input.difficulty,
    weight: input.weight,
    startDate,
    dueDate,
  };
}
