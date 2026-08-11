import { authTables } from "@convex-dev/auth/server";
import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

const teamRole = v.union(v.literal("owner"), v.literal("member"));
const spellType = v.union(
  v.literal("spark"),
  v.literal("shield"),
  v.literal("focus"),
  v.literal("bloom"),
  v.literal("fire"),
  v.literal("lightning"),
  v.literal("water"),
  v.literal("nature"),
  v.literal("star"),
);
const activityAction = v.union(
  v.literal("team_created"),
  v.literal("member_joined"),
  v.literal("shared_note_updated"),
  v.literal("character_changed"),
  v.literal("framework_created"),
  v.literal("framework_updated"),
  v.literal("project_created"),
  v.literal("project_status_changed"),
  v.literal("project_archived"),
  v.literal("project_restored"),
  v.literal("phase_status_changed"),
  v.literal("milestone_created"),
  v.literal("task_created"),
  v.literal("task_updated"),
  v.literal("task_reassigned"),
  v.literal("task_deleted"),
  v.literal("task_status_changed"),
  v.literal("evidence_submitted"),
  v.literal("review_requested"),
  v.literal("review_approved"),
  v.literal("review_changes_requested"),
  v.literal("task_claimed"),
  v.literal("task_declined"),
  v.literal("task_trade_requested"),
  v.literal("task_trade_resolved"),
  v.literal("availability_updated"),
  v.literal("meeting_plan_saved"),
  v.literal("task_damage_changed"),
  v.literal("project_launched"),
  v.literal("combat_event_created"),
);
const projectStatus = v.union(
  v.literal("planning"),
  v.literal("active"),
  v.literal("at_risk"),
  v.literal("overdue"),
  v.literal("completed"),
  v.literal("archived"),
);
const projectFrameworkType = v.union(
  v.literal("none"),
  v.literal("built_in"),
  v.literal("custom"),
);
const workloadLevel = v.union(
  v.literal("low"),
  v.literal("medium"),
  v.literal("high"),
);
const phaseStatus = v.union(
  v.literal("not_started"),
  v.literal("active"),
  v.literal("completed"),
);
const milestoneStatus = v.union(
  v.literal("planned"),
  v.literal("completed"),
);
const taskStatus = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("blocked"),
  v.literal("review"),
  v.literal("completed"),
  v.literal("submitted"),
  v.literal("changes_requested"),
  v.literal("verified"),
);
const taskSource = v.union(
  v.literal("manual"),
  v.literal("template"),
  v.literal("ai"),
);
const evidenceType = v.union(
  v.literal("note"),
  v.literal("link"),
  v.literal("image"),
  v.literal("pdf"),
);
const reviewStatus = v.union(
  v.literal("pending"),
  v.literal("approved"),
  v.literal("changes_requested"),
);
const customFrameworkPhase = v.object({
  key: v.string(),
  name: v.string(),
  description: v.string(),
  isOptional: v.boolean(),
  suggestedDeliverables: v.array(v.string()),
  suggestedSkills: v.array(v.string()),
  canOverlap: v.boolean(),
  defaultDependencyKeys: v.array(v.string()),
  reviewCheckpoint: v.boolean(),
});

export default defineSchema({
  ...authTables,
  userProfiles: defineTable({
    authUserId: v.id("users"),
    displayName: v.string(),
    email: v.string(),
    imageUrl: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_auth_user_id", ["authUserId"])
    .index("by_email", ["email"]),
  teams: defineTable({
    name: v.string(),
    joinCode: v.string(),
    creatorProfileId: v.id("userProfiles"),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_join_code", ["joinCode"])
    .index("by_creator", ["creatorProfileId"]),
  teamMembers: defineTable({
    teamId: v.id("teams"),
    profileId: v.id("userProfiles"),
    role: teamRole,
    joinedAt: v.number(),
    characterFill: v.string(),
    characterOutline: v.string(),
    spellType: v.optional(spellType),
  })
    .index("by_team", ["teamId"])
    .index("by_user", ["profileId"])
    .index("by_team_and_user", ["teamId", "profileId"]),
  teamSharedRecords: defineTable({
    teamId: v.id("teams"),
    note: v.string(),
    updatedByProfileId: v.id("userProfiles"),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_team", ["teamId"]),
  customFrameworks: defineTable({
    teamId: v.id("teams"),
    creatorProfileId: v.id("userProfiles"),
    name: v.string(),
    description: v.string(),
    phases: v.array(customFrameworkPhase),
    sourceBuiltInId: v.optional(v.string()),
    version: v.number(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team", ["teamId"])
    .index("by_team_and_updated", ["teamId", "updatedAt"])
    .index("by_creator", ["creatorProfileId"]),
  projects: defineTable({
    teamId: v.id("teams"),
    title: v.string(),
    description: v.string(),
    frameworkType: projectFrameworkType,
    frameworkName: v.string(),
    builtInFrameworkId: v.optional(v.string()),
    customFrameworkId: v.optional(v.id("customFrameworks")),
    startDate: v.string(),
    deadline: v.string(),
    status: projectStatus,
    creatorProfileId: v.id("userProfiles"),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
    setupMode: v.optional(v.union(v.literal("manual"), v.literal("ai"))),
    taskCreationMode: v.optional(v.union(v.literal("manual"), v.literal("ai"))),
    allocationStrategy: v.optional(
      v.union(v.literal("ai"), v.literal("manual"), v.literal("self_selection")),
    ),
    launchedAt: v.optional(v.number()),
    targetMemberCount: v.optional(v.number()),
  })
    .index("by_team_and_status", ["teamId", "status"])
    .index("by_team_and_updated", ["teamId", "updatedAt"]),
  projectMembers: defineTable({
    projectId: v.id("projects"),
    profileId: v.id("userProfiles"),
    skills: v.array(v.string()),
    availability: v.string(),
    currentWorkload: workloadLevel,
    preferences: v.string(),
    weeklyCapacity: v.optional(v.number()),
    timezone: v.optional(v.string()),
    meetingDurationMinutes: v.optional(v.number()),
    meetingCadence: v.optional(
      v.union(v.literal("weekly"), v.literal("fortnightly"), v.literal("as_needed")),
    ),
    joinedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_user", ["projectId", "profileId"]),
  phases: defineTable({
    projectId: v.id("projects"),
    frameworkPhaseKey: v.string(),
    title: v.string(),
    description: v.string(),
    order: v.number(),
    startDate: v.optional(v.string()),
    endDate: v.optional(v.string()),
    status: phaseStatus,
    canOverlap: v.boolean(),
    reviewCheckpoint: v.boolean(),
    dependencyKeys: v.array(v.string()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_order", ["projectId", "order"]),
  milestones: defineTable({
    projectId: v.id("projects"),
    phaseId: v.optional(v.id("phases")),
    title: v.string(),
    description: v.string(),
    dueDate: v.string(),
    status: milestoneStatus,
    requiredTaskIds: v.array(v.id("tasks")),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_due_date", ["projectId", "dueDate"]),
  tasks: defineTable({
    projectId: v.id("projects"),
    phaseId: v.id("phases"),
    milestoneId: v.optional(v.id("milestones")),
    title: v.string(),
    description: v.string(),
    primaryOwnerProfileId: v.id("userProfiles"),
    collaboratorProfileIds: v.array(v.id("userProfiles")),
    requiredSkills: v.optional(v.array(v.string())),
    estimatedEffortHours: v.optional(v.number()),
    difficulty: v.optional(v.number()),
    weight: v.number(),
    damage: v.optional(v.number()),
    required: v.boolean(),
    isOpenForClaiming: v.optional(v.boolean()),
    collaboratorCanSubmit: v.optional(v.boolean()),
    startDate: v.string(),
    dueDate: v.string(),
    status: taskStatus,
    acceptanceStatus: v.optional(
      v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined")),
    ),
    dependencyTaskIds: v.optional(v.array(v.id("tasks"))),
    source: taskSource,
    requiresReview: v.boolean(),
    reviewerProfileId: v.optional(v.id("userProfiles")),
    createdByProfileId: v.id("userProfiles"),
    createdAt: v.number(),
    updatedAt: v.number(),
    completedAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_owner", ["projectId", "primaryOwnerProfileId"])
    .index("by_project_and_status", ["projectId", "status"]),
  taskEvidence: defineTable({
    taskId: v.id("tasks"),
    submitterProfileId: v.id("userProfiles"),
    type: evidenceType,
    note: v.optional(v.string()),
    url: v.optional(v.string()),
    storageId: v.optional(v.id("_storage")),
    fileName: v.optional(v.string()),
    contentType: v.optional(v.string()),
    fileSize: v.optional(v.number()),
    submittedAt: v.number(),
  }).index("by_task", ["taskId"]),
  taskReviews: defineTable({
    taskId: v.id("tasks"),
    reviewerProfileId: v.optional(v.id("userProfiles")),
    status: reviewStatus,
    comment: v.optional(v.string()),
    createdAt: v.number(),
    updatedAt: v.number(),
    reviewedAt: v.optional(v.number()),
  })
    .index("by_task_and_time", ["taskId", "createdAt"])
    .index("by_reviewer_and_time", ["reviewerProfileId", "createdAt"]),
  combatEvents: defineTable({
    projectId: v.id("projects"),
    taskId: v.id("tasks"),
    attackerProfileId: v.id("userProfiles"),
    reviewerProfileId: v.id("userProfiles"),
    damage: v.number(),
    spellType: spellType,
    createdAt: v.number(),
  })
    .index("by_project_and_time", ["projectId", "createdAt"])
    .index("by_task", ["taskId"]),
  activityLogs: defineTable({
    teamId: v.id("teams"),
    projectId: v.optional(v.id("projects")),
    actorProfileId: v.id("userProfiles"),
    action: activityAction,
    metadata: v.object({
      teamName: v.optional(v.string()),
      memberDisplayName: v.optional(v.string()),
      noteLength: v.optional(v.number()),
      characterFill: v.optional(v.string()),
      characterOutline: v.optional(v.string()),
      spellType: v.optional(spellType),
      customFrameworkId: v.optional(v.id("customFrameworks")),
      frameworkName: v.optional(v.string()),
      projectId: v.optional(v.id("projects")),
      projectTitle: v.optional(v.string()),
      previousProjectStatus: v.optional(projectStatus),
      projectStatus: v.optional(projectStatus),
      phaseId: v.optional(v.id("phases")),
      phaseTitle: v.optional(v.string()),
      previousPhaseStatus: v.optional(phaseStatus),
      phaseStatus: v.optional(phaseStatus),
      milestoneId: v.optional(v.id("milestones")),
      milestoneTitle: v.optional(v.string()),
      taskId: v.optional(v.id("tasks")),
      taskTitle: v.optional(v.string()),
      previousTaskStatus: v.optional(taskStatus),
      taskStatus: v.optional(taskStatus),
      previousOwnerProfileId: v.optional(v.id("userProfiles")),
      ownerProfileId: v.optional(v.id("userProfiles")),
      evidenceId: v.optional(v.id("taskEvidence")),
      evidenceType: v.optional(evidenceType),
      reviewId: v.optional(v.id("taskReviews")),
      reviewStatus: v.optional(reviewStatus),
      damage: v.optional(v.number()),
      previousDamage: v.optional(v.number()),
      combatEventId: v.optional(v.id("combatEvents")),
    }),
    createdAt: v.number(),
  })
    .index("by_team_and_time", ["teamId", "createdAt"])
    .index("by_project_and_time", ["projectId", "createdAt"])
    .index("by_actor_and_time", ["actorProfileId", "createdAt"]),
  activityReadStates: defineTable({
    teamId: v.id("teams"),
    profileId: v.id("userProfiles"),
    lastReadAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_team_and_profile", ["teamId", "profileId"])
    .index("by_profile", ["profileId"]),
  availabilityBlocks: defineTable({
    projectId: v.id("projects"),
    profileId: v.id("userProfiles"),
    dayOfWeek: v.number(),
    startMinute: v.number(),
    endMinute: v.number(),
    timezone: v.string(),
    createdAt: v.number(),
    updatedAt: v.number(),
  })
    .index("by_project", ["projectId"])
    .index("by_project_and_profile", ["projectId", "profileId"]),
  meetingPlans: defineTable({
    projectId: v.id("projects"),
    createdByProfileId: v.id("userProfiles"),
    title: v.string(),
    dayOfWeek: v.number(),
    startMinute: v.number(),
    durationMinutes: v.number(),
    timezone: v.string(),
    attendeeProfileIds: v.array(v.id("userProfiles")),
    source: v.union(v.literal("deterministic"), v.literal("ai"), v.literal("manual")),
    createdAt: v.number(),
    updatedAt: v.number(),
  }).index("by_project", ["projectId"]),
  taskTrades: defineTable({
    projectId: v.id("projects"),
    taskId: v.id("tasks"),
    requestedByProfileId: v.id("userProfiles"),
    requestedToProfileId: v.id("userProfiles"),
    offeredTaskId: v.optional(v.id("tasks")),
    message: v.optional(v.string()),
    status: v.union(v.literal("pending"), v.literal("accepted"), v.literal("declined"), v.literal("cancelled")),
    createdAt: v.number(),
    updatedAt: v.number(),
    resolvedAt: v.optional(v.number()),
  })
    .index("by_project", ["projectId"])
    .index("by_task", ["taskId"])
    .index("by_recipient_and_status", ["requestedToProfileId", "status"]),
  subscriptions: defineTable({
    profileId: v.id("userProfiles"),
    tier: v.union(v.literal("free"), v.literal("plus"), v.literal("pro")),
    status: v.union(v.literal("active"), v.literal("cancelled"), v.literal("expired")),
    source: v.union(v.literal("demo"), v.literal("admin"), v.literal("billing")),
    startedAt: v.number(),
    updatedAt: v.number(),
    expiresAt: v.optional(v.number()),
  }).index("by_profile", ["profileId"]),
  aiUsage: defineTable({
    projectId: v.id("projects"),
    profileId: v.id("userProfiles"),
    source: v.union(v.literal("platform"), v.literal("byok")),
    operation: v.union(v.literal("project_plan"), v.literal("plan_adjustment"), v.literal("meeting_interpretation")),
    model: v.string(),
    success: v.boolean(),
    createdAt: v.number(),
  })
    .index("by_project_and_source", ["projectId", "source"])
    .index("by_profile_and_time", ["profileId", "createdAt"]),
});
