import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { MutationCtx } from "./_generated/server";
import type { Doc, Id } from "./_generated/dataModel";
import { requireTeamMember, requireUserProfile } from "./lib/auth";
import {
  validateMilestoneInput,
  validateTaskInput,
} from "./lib/taskValidation";
import { refreshProjectProgress } from "./lib/projectProgress";

const taskStatusValidator = v.union(
  v.literal("todo"),
  v.literal("in_progress"),
  v.literal("blocked"),
  v.literal("review"),
  v.literal("completed"),
  v.literal("submitted"),
  v.literal("changes_requested"),
  v.literal("verified"),
);
const phaseStatusValidator = v.union(
  v.literal("not_started"),
  v.literal("active"),
  v.literal("completed"),
);

async function requireProjectWriteAccess(
  ctx: MutationCtx,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get(projectId);

  if (project === null) {
    throw new Error("This project no longer exists.");
  }

  if (project.status === "archived") {
    throw new Error("Restore this archived project before changing its plan.");
  }

  const { membership, profile } = await requireTeamMember(ctx, project.teamId);
  const projectMembership = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_and_user", (indexQuery) =>
      indexQuery.eq("projectId", projectId).eq("profileId", profile._id),
    )
    .unique();

  if (membership.role !== "owner" && projectMembership === null) {
    throw new Error("Only project members or the team owner can change this project.");
  }

  return { project, profile, membership, projectMembership };
}

function isProjectLaunched(project: Doc<"projects">) {
  return project.launchedAt !== undefined || project.status !== "planning";
}

function defaultDamage(difficulty: number) {
  if (difficulty <= 1) return 10;
  if (difficulty === 2) return 20;
  return 30;
}

function validateDamage(value: number | undefined, difficulty: number) {
  const damage = value ?? defaultDamage(difficulty);
  if (!Number.isInteger(damage) || damage < 1 || damage > 999) {
    throw new Error("Task damage must be a whole number from 1 to 999.");
  }
  return damage;
}

async function getProjectMemberIds(ctx: MutationCtx, projectId: Id<"projects">) {
  const projectMembers = await ctx.db
    .query("projectMembers")
    .withIndex("by_project", (indexQuery) =>
      indexQuery.eq("projectId", projectId),
    )
    .collect();

  return new Set(projectMembers.map((member) => member.profileId));
}

function assertDateWithinProject(
  date: string,
  project: Doc<"projects">,
  label: string,
) {
  if (date < project.startDate || date > project.deadline) {
    throw new Error(`${label} must fall within the project dates.`);
  }
}

function assertNoDependencyCycle(
  tasks: Doc<"tasks">[],
  editedTaskId: Id<"tasks">,
  proposedDependencyIds: Id<"tasks">[],
) {
  const graph = new Map(
    tasks.map((task) => [
      task._id as string,
      (task._id === editedTaskId
        ? proposedDependencyIds
        : task.dependencyTaskIds
      ).map((taskId) => taskId as string),
    ]),
  );
  const visiting = new Set<string>();
  const visited = new Set<string>();

  function visit(taskId: string): boolean {
    if (visiting.has(taskId)) {
      return true;
    }

    if (visited.has(taskId)) {
      return false;
    }

    visiting.add(taskId);

    for (const dependencyId of graph.get(taskId) ?? []) {
      if (visit(dependencyId)) {
        return true;
      }
    }

    visiting.delete(taskId);
    visited.add(taskId);
    return false;
  }

  if ([...graph.keys()].some((taskId) => visit(taskId))) {
    throw new Error("Task dependencies cannot contain a circular chain.");
  }
}

async function syncTaskMilestone(
  ctx: MutationCtx,
  task: Doc<"tasks">,
  nextMilestone: Doc<"milestones"> | null,
) {
  if (task.milestoneId === nextMilestone?._id) {
    return;
  }

  const now = Date.now();

  if (task.milestoneId) {
    const previousMilestone = await ctx.db.get(task.milestoneId);

    if (previousMilestone) {
      await ctx.db.patch(previousMilestone._id, {
        requiredTaskIds: previousMilestone.requiredTaskIds.filter(
          (taskId) => taskId !== task._id,
        ),
        updatedAt: now,
      });
    }
  }

  if (nextMilestone) {
    await ctx.db.patch(nextMilestone._id, {
      requiredTaskIds: [
        ...new Set([...nextMilestone.requiredTaskIds, task._id]),
      ],
      updatedAt: now,
    });
  }
}

export const getWorkspace = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (project === null) {
      throw new Error("This project no longer exists.");
    }

    const { membership, profile } = await requireTeamMember(ctx, project.teamId);
    const [phases, milestones, tasks, projectMembers] = await Promise.all([
      ctx.db
        .query("phases")
        .withIndex("by_project_and_order", (indexQuery) =>
          indexQuery.eq("projectId", project._id),
        )
        .collect(),
      ctx.db
        .query("milestones")
        .withIndex("by_project_and_due_date", (indexQuery) =>
          indexQuery.eq("projectId", project._id),
        )
        .collect(),
      ctx.db
        .query("tasks")
        .withIndex("by_project", (indexQuery) =>
          indexQuery.eq("projectId", project._id),
        )
        .collect(),
      ctx.db
        .query("projectMembers")
        .withIndex("by_project", (indexQuery) =>
          indexQuery.eq("projectId", project._id),
        )
        .collect(),
    ]);
    const members = await Promise.all(
      projectMembers.map(async (member) => {
        const profile = await ctx.db.get(member.profileId);

        return profile === null
          ? null
          : {
              ...member,
              displayName: profile.displayName,
              imageUrl: profile.imageUrl,
            };
      }),
    );

    const isProjectMember = projectMembers.some((member) => member.profileId === profile._id);
    const canManageProject = membership.role === "owner" || project.creatorProfileId === profile._id;
    const launched = isProjectLaunched(project);

    return {
      project,
      currentProfileId: profile._id,
      canManageProject,
      canWrite: project.status !== "archived" && (membership.role === "owner" || isProjectMember),
      isTeamOwner: membership.role === "owner",
      isLaunched: launched,
      phases,
      milestones,
      tasks: tasks.sort((first, second) => first.createdAt - second.createdAt),
      members: members.filter((member) => member !== null),
    };
  },
});

export const listMineAcrossRooms = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireUserProfile(ctx);
    const roomMemberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_user", (query) => query.eq("profileId", profile._id))
      .collect();
    const groups = [];

    for (const membership of roomMemberships) {
      const room = await ctx.db.get(membership.teamId);
      if (!room) continue;
      const projects = await ctx.db
        .query("projects")
        .withIndex("by_team_and_updated", (query) => query.eq("teamId", room._id))
        .order("desc")
        .take(50);

      for (const project of projects) {
        if (project.status === "archived") continue;
        const projectMembership = await ctx.db
          .query("projectMembers")
          .withIndex("by_project_and_user", (query) =>
            query.eq("projectId", project._id).eq("profileId", profile._id),
          )
          .unique();
        if (!projectMembership && membership.role !== "owner") continue;
        const [ownedTasks, phases] = await Promise.all([
          ctx.db
            .query("tasks")
            .withIndex("by_project_and_owner", (query) =>
              query.eq("projectId", project._id).eq("primaryOwnerProfileId", profile._id),
            )
            .collect(),
          ctx.db
            .query("phases")
            .withIndex("by_project_and_order", (query) => query.eq("projectId", project._id))
            .collect(),
        ]);
        const allTasks = await ctx.db
          .query("tasks")
          .withIndex("by_project", (query) => query.eq("projectId", project._id))
          .collect();
        const tasks = [
          ...ownedTasks,
          ...allTasks.filter((task) => task.isOpenForClaiming),
        ].filter((task, index, collection) =>
          collection.findIndex((candidate) => candidate._id === task._id) === index,
        );
        if (tasks.length === 0) continue;
        const phaseNames = new Map(phases.map((phase) => [phase._id, phase.title]));
        groups.push({
          roomId: room._id,
          roomName: room.name,
          projectId: project._id,
          projectTitle: project.title,
          tasks: tasks
            .sort((first, second) => first.dueDate.localeCompare(second.dueDate))
            .map((task) => ({
              ...task,
              phaseName: phaseNames.get(task.phaseId) ?? "Project work",
              isMine: task.primaryOwnerProfileId === profile._id,
            })),
        });
      }
    }

    return groups;
  },
});

export const updatePhaseStatus = mutation({
  args: {
    phaseId: v.id("phases"),
    status: phaseStatusValidator,
  },
  handler: async (ctx, args) => {
    const phase = await ctx.db.get(args.phaseId);

    if (phase === null) {
      throw new Error("This phase no longer exists.");
    }

    const { project, profile } = await requireProjectWriteAccess(
      ctx,
      phase.projectId,
    );

    if (phase.status === args.status) return phase._id;

    const now = Date.now();
    await ctx.db.patch(phase._id, { status: args.status });
    await ctx.db.patch(project._id, { updatedAt: now });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "phase_status_changed",
      metadata: {
        projectId: project._id,
        projectTitle: project.title,
        phaseId: phase._id,
        phaseTitle: phase.title,
        previousPhaseStatus: phase.status,
        phaseStatus: args.status,
      },
      createdAt: now,
    });

    return phase._id;
  },
});

export const createMilestone = mutation({
  args: {
    projectId: v.id("projects"),
    phaseId: v.optional(v.id("phases")),
    title: v.string(),
    description: v.string(),
    dueDate: v.string(),
  },
  handler: async (ctx, args) => {
    const { project, profile } = await requireProjectWriteAccess(
      ctx,
      args.projectId,
    );
    const milestone = validateMilestoneInput(args);
    assertDateWithinProject(milestone.dueDate, project, "Milestone due date");

    if (args.phaseId) {
      const phase = await ctx.db.get(args.phaseId);

      if (phase === null || phase.projectId !== project._id) {
        throw new Error("Choose a phase from this project.");
      }
    }

    const now = Date.now();
    const milestoneId = await ctx.db.insert("milestones", {
      projectId: project._id,
      phaseId: args.phaseId,
      ...milestone,
      status: "planned",
      requiredTaskIds: [],
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.patch(project._id, { updatedAt: now });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "milestone_created",
      metadata: {
        projectId: project._id,
        milestoneId,
        milestoneTitle: milestone.title,
      },
      createdAt: now,
    });

    return milestoneId;
  },
});

export const createTask = mutation({
  args: {
    projectId: v.id("projects"),
    phaseId: v.id("phases"),
    milestoneId: v.optional(v.id("milestones")),
    title: v.string(),
    description: v.string(),
    primaryOwnerProfileId: v.id("userProfiles"),
    collaboratorProfileIds: v.array(v.id("userProfiles")),
    requiredSkills: v.array(v.string()),
    estimatedEffortHours: v.number(),
    difficulty: v.number(),
    weight: v.number(),
    required: v.boolean(),
    startDate: v.string(),
    dueDate: v.string(),
    dependencyTaskIds: v.array(v.id("tasks")),
    requiresReview: v.boolean(),
    reviewerProfileId: v.optional(v.id("userProfiles")),
    damage: v.optional(v.number()),
    isOpenForClaiming: v.optional(v.boolean()),
    collaboratorCanSubmit: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const { project, profile } = await requireProjectWriteAccess(
      ctx,
      args.projectId,
    );
    const task = validateTaskInput(args);
    const damage = validateDamage(args.damage, task.difficulty);
    assertDateWithinProject(task.startDate, project, "Task start date");
    assertDateWithinProject(task.dueDate, project, "Task due date");
    const phase = await ctx.db.get(args.phaseId);

    if (phase === null || phase.projectId !== project._id) {
      throw new Error("Choose a phase from this project.");
    }

    let milestone: Doc<"milestones"> | null = null;

    if (args.milestoneId) {
      milestone = await ctx.db.get(args.milestoneId);

      if (milestone === null || milestone.projectId !== project._id) {
        throw new Error("Choose a milestone from this project.");
      }
    }

    const projectMemberIds = await getProjectMemberIds(ctx, project._id);
    const collaboratorProfileIds = [...new Set(args.collaboratorProfileIds)].filter(
      (profileId) => profileId !== args.primaryOwnerProfileId,
    );
    const assignedProfileIds = [
      args.primaryOwnerProfileId,
      ...collaboratorProfileIds,
      ...(args.reviewerProfileId ? [args.reviewerProfileId] : []),
    ];

    if (assignedProfileIds.some((profileId) => !projectMemberIds.has(profileId))) {
      throw new Error("Every task owner, collaborator, and reviewer must be a project member.");
    }

    if (args.requiresReview && !args.reviewerProfileId) {
      throw new Error("Choose a reviewer when review is required.");
    }

    if (!args.requiresReview && args.reviewerProfileId) {
      throw new Error("Remove the reviewer or enable review for this task.");
    }

    if (args.reviewerProfileId === args.primaryOwnerProfileId) {
      throw new Error("A task owner cannot review their own task.");
    }

    const dependencyTaskIds = [...new Set(args.dependencyTaskIds)];
    const dependencies = await Promise.all(
      dependencyTaskIds.map((taskId) => ctx.db.get(taskId)),
    );

    if (
      dependencies.some(
        (dependency) =>
          dependency === null || dependency.projectId !== project._id,
      )
    ) {
      throw new Error("Every dependency must be another task in this project.");
    }

    const now = Date.now();
    const taskId = await ctx.db.insert("tasks", {
      projectId: project._id,
      phaseId: phase._id,
      milestoneId: milestone?._id,
      ...task,
      damage,
      primaryOwnerProfileId: args.primaryOwnerProfileId,
      collaboratorProfileIds,
      required: args.required,
      status: "todo",
      acceptanceStatus:
        args.isOpenForClaiming || args.primaryOwnerProfileId === profile._id
          ? "accepted"
          : "pending",
      dependencyTaskIds,
      source: "manual",
      requiresReview: args.requiresReview,
      reviewerProfileId: args.reviewerProfileId,
      isOpenForClaiming: args.isOpenForClaiming ?? false,
      collaboratorCanSubmit: args.collaboratorCanSubmit ?? false,
      createdByProfileId: profile._id,
      createdAt: now,
      updatedAt: now,
    });

    if (milestone) {
      await ctx.db.patch(milestone._id, {
        requiredTaskIds: [...milestone.requiredTaskIds, taskId],
        updatedAt: now,
      });
    }

    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "task_created",
      metadata: {
        projectId: project._id,
        taskId,
        taskTitle: task.title,
        taskStatus: "todo",
      },
      createdAt: now,
    });
    await refreshProjectProgress(ctx, project, profile._id);

    return taskId;
  },
});

export const updateTask = mutation({
  args: {
    taskId: v.id("tasks"),
    phaseId: v.id("phases"),
    milestoneId: v.optional(v.id("milestones")),
    title: v.string(),
    description: v.string(),
    primaryOwnerProfileId: v.id("userProfiles"),
    collaboratorProfileIds: v.array(v.id("userProfiles")),
    requiredSkills: v.array(v.string()),
    estimatedEffortHours: v.number(),
    difficulty: v.number(),
    weight: v.number(),
    required: v.boolean(),
    startDate: v.string(),
    dueDate: v.string(),
    dependencyTaskIds: v.array(v.id("tasks")),
    requiresReview: v.boolean(),
    reviewerProfileId: v.optional(v.id("userProfiles")),
    damage: v.optional(v.number()),
    isOpenForClaiming: v.optional(v.boolean()),
    collaboratorCanSubmit: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.taskId);

    if (existing === null) {
      throw new Error("This task no longer exists.");
    }

    const { project, profile, membership } = await requireProjectWriteAccess(
      ctx,
      existing.projectId,
    );
    if (membership.role !== "owner") {
      if (isProjectLaunched(project)) {
        throw new Error("After launch, only the team owner can edit task details.");
      }
      if (existing.createdByProfileId !== profile._id) {
        throw new Error("Only the task creator can edit this task before launch.");
      }
    }
    const task = validateTaskInput(args);
    const damage = validateDamage(args.damage, task.difficulty);
    assertDateWithinProject(task.startDate, project, "Task start date");
    assertDateWithinProject(task.dueDate, project, "Task due date");
    const phase = await ctx.db.get(args.phaseId);

    if (phase === null || phase.projectId !== project._id) {
      throw new Error("Choose a phase from this project.");
    }

    let milestone: Doc<"milestones"> | null = null;

    if (args.milestoneId) {
      milestone = await ctx.db.get(args.milestoneId);

      if (milestone === null || milestone.projectId !== project._id) {
        throw new Error("Choose a milestone from this project.");
      }
    }

    const projectMemberIds = await getProjectMemberIds(ctx, project._id);
    const collaboratorProfileIds = [...new Set(args.collaboratorProfileIds)].filter(
      (profileId) => profileId !== args.primaryOwnerProfileId,
    );
    const assignedProfileIds = [
      args.primaryOwnerProfileId,
      ...collaboratorProfileIds,
      ...(args.reviewerProfileId ? [args.reviewerProfileId] : []),
    ];

    if (assignedProfileIds.some((profileId) => !projectMemberIds.has(profileId))) {
      throw new Error("Every task owner, collaborator, and reviewer must be a project member.");
    }

    if (args.requiresReview && !args.reviewerProfileId) {
      throw new Error("Choose a reviewer when review is required.");
    }

    if (!args.requiresReview && args.reviewerProfileId) {
      throw new Error("Remove the reviewer or enable review for this task.");
    }

    if (args.reviewerProfileId === args.primaryOwnerProfileId) {
      throw new Error("A task owner cannot review their own task.");
    }

    const dependencyTaskIds = [...new Set(args.dependencyTaskIds)];

    if (dependencyTaskIds.includes(existing._id)) {
      throw new Error("A task cannot depend on itself.");
    }

    const projectTasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (indexQuery) =>
        indexQuery.eq("projectId", project._id),
      )
      .collect();
    const projectTaskIds = new Set(projectTasks.map((projectTask) => projectTask._id));

    if (dependencyTaskIds.some((taskId) => !projectTaskIds.has(taskId))) {
      throw new Error("Every dependency must be another task in this project.");
    }

    assertNoDependencyCycle(projectTasks, existing._id, dependencyTaskIds);
    await syncTaskMilestone(ctx, existing, milestone);
    const now = Date.now();
    await ctx.db.patch(existing._id, {
      phaseId: phase._id,
      milestoneId: milestone?._id,
      ...task,
      damage,
      primaryOwnerProfileId: args.primaryOwnerProfileId,
      collaboratorProfileIds,
      required: args.required,
      dependencyTaskIds,
      requiresReview: args.requiresReview,
      reviewerProfileId: args.reviewerProfileId,
      isOpenForClaiming: args.isOpenForClaiming ?? false,
      collaboratorCanSubmit: args.collaboratorCanSubmit ?? false,
      acceptanceStatus:
        args.isOpenForClaiming || args.primaryOwnerProfileId === profile._id
          ? "accepted"
          : existing.primaryOwnerProfileId !== args.primaryOwnerProfileId
            ? "pending"
            : (existing.acceptanceStatus ?? "accepted"),
      status:
        !args.requiresReview && existing.status === "review"
          ? "in_progress"
          : existing.status,
      updatedAt: now,
    });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action:
        (existing.damage ?? defaultDamage(existing.difficulty)) !== damage
          ? "task_damage_changed"
          : "task_updated",
      metadata: {
        projectId: project._id,
        taskId: existing._id,
        taskTitle: task.title,
        taskStatus: existing.status,
        previousDamage: existing.damage ?? defaultDamage(existing.difficulty),
        damage,
      },
      createdAt: now,
    });

    if (existing.primaryOwnerProfileId !== args.primaryOwnerProfileId) {
      await ctx.db.insert("activityLogs", {
        teamId: project.teamId,
        projectId: project._id,
        actorProfileId: profile._id,
        action: "task_reassigned",
        metadata: {
          projectId: project._id,
          taskId: existing._id,
          taskTitle: task.title,
          previousOwnerProfileId: existing.primaryOwnerProfileId,
          ownerProfileId: args.primaryOwnerProfileId,
        },
        createdAt: now,
      });
    }

    await refreshProjectProgress(ctx, project, profile._id);
    return existing._id;
  },
});

export const deleteTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);

    if (task === null) {
      throw new Error("This task no longer exists.");
    }

    const { project, profile, membership } = await requireProjectWriteAccess(
      ctx,
      task.projectId,
    );
    const launched = isProjectLaunched(project);
    if (launched && membership.role !== "owner") {
      throw new Error("After launch, only the team owner can delete a task.");
    }
    if (!launched && membership.role !== "owner" && task.createdByProfileId !== profile._id) {
      throw new Error("Only the task creator can delete this task before launch.");
    }
    const projectTasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (indexQuery) =>
        indexQuery.eq("projectId", project._id),
      )
      .collect();
    const dependentTask = projectTasks.find((candidate) =>
      candidate.dependencyTaskIds.includes(task._id),
    );

    if (dependentTask) {
      throw new Error(
        `Remove this task from “${dependentTask.title}” dependencies before deleting it.`,
      );
    }

    if (task.milestoneId) {
      const milestone = await ctx.db.get(task.milestoneId);

      if (milestone) {
        await ctx.db.patch(milestone._id, {
          requiredTaskIds: milestone.requiredTaskIds.filter(
            (taskId) => taskId !== task._id,
          ),
          updatedAt: Date.now(),
        });
      }
    }

    const now = Date.now();
    await ctx.db.delete(task._id);
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "task_deleted",
      metadata: {
        projectId: project._id,
        taskId: task._id,
        taskTitle: task.title,
      },
      createdAt: now,
    });
    await refreshProjectProgress(ctx, project, profile._id);

    return task._id;
  },
});

export const updateTaskStatus = mutation({
  args: {
    taskId: v.id("tasks"),
    status: taskStatusValidator,
  },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);

    if (task === null) {
      throw new Error("This task no longer exists.");
    }

    const { project, profile, membership } = await requireProjectWriteAccess(
      ctx,
      task.projectId,
    );

    if (membership.role !== "owner" && task.primaryOwnerProfileId !== profile._id) {
      throw new Error("Only the assigned owner can update this task's progress.");
    }
    if (task.isOpenForClaiming) {
      throw new Error("Claim this task before updating its progress.");
    }
    if (task.acceptanceStatus === "pending") {
      throw new Error("Accept this task before updating its progress.");
    }

    if (task.status === args.status) {
      return task._id;
    }

    if (args.status === "review" || args.status === "submitted") {
      throw new Error("Use Submit for Review after adding evidence.");
    }
    if (args.status === "changes_requested" || args.status === "verified") {
      throw new Error("Only the assigned reviewer can set a review outcome.");
    }

    if (args.status === "completed" && task.requiresReview) {
      throw new Error("The assigned reviewer must approve this task before completion.");
    }

    const now = Date.now();
    await ctx.db.patch(task._id, {
      status: args.status,
      updatedAt: now,
      completedAt: args.status === "completed" ? now : undefined,
    });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "task_status_changed",
      metadata: {
        projectId: project._id,
        taskId: task._id,
        taskTitle: task.title,
        previousTaskStatus: task.status,
        taskStatus: args.status,
      },
      createdAt: now,
    });
    await refreshProjectProgress(ctx, project, profile._id);

    return task._id;
  },
});

export const acceptTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("This task no longer exists.");
    const { profile } = await requireProjectWriteAccess(ctx, task.projectId);
    if (task.primaryOwnerProfileId !== profile._id) {
      throw new Error("Only the proposed task owner can accept this task.");
    }
    if (task.isOpenForClaiming) throw new Error("Claim this open task instead.");
    if (task.acceptanceStatus !== "pending") return task._id;
    await ctx.db.patch(task._id, { acceptanceStatus: "accepted", updatedAt: Date.now() });
    return task._id;
  },
});

export const declineTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (!task) throw new Error("This task no longer exists.");
    const { project, profile } = await requireProjectWriteAccess(ctx, task.projectId);
    if (task.primaryOwnerProfileId !== profile._id) {
      throw new Error("Only the proposed task owner can decline this task.");
    }
    if (task.acceptanceStatus !== "pending") {
      throw new Error("Only a pending assignment can be declined.");
    }
    const now = Date.now();
    await ctx.db.patch(task._id, {
      isOpenForClaiming: true,
      acceptanceStatus: "accepted",
      updatedAt: now,
    });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "task_updated",
      metadata: { projectId: project._id, taskId: task._id, taskTitle: task.title, taskStatus: task.status },
      createdAt: now,
    });
    return task._id;
  },
});

export const claimTask = mutation({
  args: { taskId: v.id("tasks") },
  handler: async (ctx, args) => {
    const task = await ctx.db.get(args.taskId);
    if (task === null) throw new Error("This task no longer exists.");
    const { project, profile } = await requireProjectWriteAccess(ctx, task.projectId);
    if (!task.isOpenForClaiming) throw new Error("This task is not open for claiming.");
    if (task.status !== "todo") throw new Error("Only a to-do task can be claimed.");

    const now = Date.now();
    await ctx.db.patch(task._id, {
      primaryOwnerProfileId: profile._id,
      isOpenForClaiming: false,
      acceptanceStatus: "accepted",
      updatedAt: now,
    });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "task_claimed",
      metadata: {
        projectId: project._id,
        taskId: task._id,
        taskTitle: task.title,
        previousOwnerProfileId: task.primaryOwnerProfileId,
        ownerProfileId: profile._id,
      },
      createdAt: now,
    });
    return task._id;
  },
});
