import type { ValidatedAiPlan } from "./aiPlanValidation";

type PlanningContext = {
  project: { projectId: string; title: string; startDate: string; deadline: string; frameworkName: string };
  phases: Array<{ phaseId: string; title: string }>;
  members: Array<{ profileId: string; displayName: string }>;
};

export type GeneratedAiPlan = ValidatedAiPlan & {
  generatedAt: number;
  source?: "ai" | "smart_template";
};

function formatIsoDate(daysFromNow: number): string {
  const target = new Date();
  target.setDate(target.getDate() + daysFromNow);
  return target.toISOString().slice(0, 10);
}

export function generateSmartFallbackPlan(context: PlanningContext, brief: string): ValidatedAiPlan {
  const combinedText = `${context.project.title} ${brief}`.toLowerCase();
  const phases = context.phases.length > 0 ? context.phases : [{ phaseId: "phase_1", title: "Project Execution" }];
  const members = context.members.length > 0 ? context.members : [{ profileId: "member_1", displayName: "Team Member" }];

  let domain: "web" | "mobile" | "design" | "marketing" | "research" | "game" | "general" = "general";

  if (/mobile|app|flutter|react native|ios|android|swift|kotlin/.test(combinedText)) {
    domain = "mobile";
  } else if (/web|frontend|backend|fullstack|react|vue|next|node|laravel|django|css|html/.test(combinedText)) {
    domain = "web";
  } else if (/design|ui|ux|figma|prototype|brand|logo|graphic/.test(combinedText)) {
    domain = "design";
  } else if (/marketing|campaign|seo|content|social|media|ad|launch/.test(combinedText)) {
    domain = "marketing";
  } else if (/research|thesis|study|survey|paper|analysis|report/.test(combinedText)) {
    domain = "research";
  } else if (/game|unity|unreal|godot|gamedev|2d|3d|graphics/.test(combinedText)) {
    domain = "game";
  }

  const rawTasks = domain === "web" ? [
    { title: "System Architecture & Database Design", desc: "Draft entity relationships, API specs, and database structure.", weight: 3, diff: 3, effort: 6, skills: ["Architecture", "Database"], offset: 3 },
    { title: "UI Wireframes & Component Layouts", desc: "Design responsive layouts, color tokens, and interactive mockups.", weight: 2, diff: 2, effort: 5, skills: ["Figma", "UI/UX"], offset: 5 },
    { title: "Core Frontend Component Development", desc: "Build main user interface screens and state management.", weight: 4, diff: 3, effort: 10, skills: ["React/TypeScript", "CSS"], offset: 9 },
    { title: "Backend REST API Endpoints", desc: "Implement authentication routes, CRUD services, and data validation.", weight: 4, diff: 3, effort: 10, skills: ["Node.js/Convex", "API Design"], offset: 12 },
    { title: "Integration & End-to-End Testing", desc: "Connect frontend to backend APIs and test user workflows.", weight: 3, diff: 2, effort: 6, skills: ["Testing", "QA"], offset: 15 },
    { title: "Production Deployment & Polish", desc: "Deploy client and server hosting, set up SSL, and verify performance.", weight: 2, diff: 2, effort: 4, skills: ["DevOps", "CI/CD"], offset: 18 },
  ] : domain === "mobile" ? [
    { title: "User Journey & Mobile Wireframing", desc: "Outline navigation hierarchy and core user actions.", weight: 2, diff: 2, effort: 4, skills: ["UI/UX", "Mobile Design"], offset: 3 },
    { title: "Mobile Navigation & Layout Setup", desc: "Initialize app project structure and routing stack.", weight: 3, diff: 2, effort: 6, skills: ["React Native/Flutter", "Mobile"], offset: 6 },
    { title: "Core App Feature Development", desc: "Implement primary screens, data forms, and state management.", weight: 5, diff: 4, effort: 12, skills: ["Mobile Dev", "State Mgmt"], offset: 11 },
    { title: "Backend API Sync & Push Services", desc: "Integrate server backend endpoints and notification services.", weight: 4, diff: 3, effort: 8, skills: ["API Integration", "Push Services"], offset: 14 },
    { title: "Device Testing & Performance Audit", desc: "Test responsiveness on iOS and Android devices.", weight: 3, diff: 2, effort: 6, skills: ["QA", "Performance"], offset: 17 },
  ] : [
    { title: "Project Scoping & Requirement Analysis", desc: "Detailed outline of project goals, milestone dates, and team roles.", weight: 2, diff: 2, effort: 4, skills: ["Planning", "Management"], offset: 3 },
    { title: "Core Deliverable 1 Development", desc: "Implement the first foundational component of the project.", weight: 4, diff: 3, effort: 8, skills: ["Execution", "Domain Skills"], offset: 7 },
    { title: "Core Deliverable 2 Development", desc: "Implement the second main component of the project.", weight: 4, diff: 3, effort: 8, skills: ["Execution", "Domain Skills"], offset: 11 },
    { title: "Testing, Quality Check & Documentation", desc: "Verify all project requirements are met and write summary docs.", weight: 3, diff: 2, effort: 5, skills: ["QA", "Documentation"], offset: 14 },
    { title: "Final Review & Presentation", desc: "Present completed project deliverables to stakeholders.", weight: 2, diff: 2, effort: 4, skills: ["Presentation", "Review"], offset: 17 },
  ];

  const milestones = phases.slice(0, 3).map((phase, index) => ({
    tempId: `milestone_${index + 1}`,
    title: `Milestone ${index + 1}: ${phase.title}`,
    description: `Completion check for ${phase.title} deliverables.`,
    phaseId: phase.phaseId,
    dueDate: formatIsoDate((index + 1) * 6),
  }));

  const tasks = rawTasks.map((task, index) => {
    const assignedPhase = phases[index % phases.length];
    const assignedOwner = members[index % members.length];
    const assignedReviewer = members.length > 1 ? members[(index + 1) % members.length] : null;

    return {
      tempId: `task_${index + 1}`,
      title: task.title,
      description: task.desc,
      phaseId: assignedPhase.phaseId,
      milestoneTempId: milestones[index % milestones.length]?.tempId ?? null,
      primaryOwnerProfileId: assignedOwner.profileId,
      collaboratorProfileIds: [],
      requiredSkills: task.skills,
      estimatedEffortHours: task.effort,
      difficulty: task.diff,
      weight: task.weight,
      required: true,
      startDate: context.project.startDate || formatIsoDate(0),
      dueDate: formatIsoDate(task.offset),
      dependencyTempIds: index > 0 ? [`task_${index}`] : [],
      requiresReview: true,
      reviewerProfileId: assignedReviewer ? assignedReviewer.profileId : null,
      allocationExplanation: `Assigned to ${assignedOwner.displayName} based on domain workload balance.`,
      longTaskBreakdown: task.effort > 10 ? "Break down into sub-tasks for daily progress checks." : "",
    };
  });

  return {
    recommendedFramework: `${context.project.frameworkName || "Agile Sprint"} (Smart Template)`,
    frameworkReason: "Instant structured plan generated via Smart Heuristic Engine for immediate execution.",
    milestones,
    tasks,
    risks: [
      "Scope creep: Additional requirements identified during execution phase.",
      "Timeline compression: Ensure tasks are claimed and started on time to prevent HP penalties.",
    ],
    assumptions: [
      "Team members have access to required development tools and environments.",
      "Phase review checkpoints will be verified before final submission.",
    ],
  };
}
