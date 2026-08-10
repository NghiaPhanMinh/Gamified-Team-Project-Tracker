import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireTeamMember } from "./lib/auth";
import { deriveProjectStatus } from "./lib/projectProgress";
import {
  validateBuiltInFramework,
  validateMemberPlanning,
  validateProjectDetails,
  validateProjectPhases,
} from "./lib/projectValidation";

const projectPhaseValidator = v.object({
  key: v.string(),
  name: v.string(),
  description: v.string(),
  canOverlap: v.boolean(),
  dependencyKeys: v.array(v.string()),
  reviewCheckpoint: v.boolean(),
});

const projectMemberValidator = v.object({
  profileId: v.id("userProfiles"),
  skills: v.array(v.string()),
  availability: v.string(),
  currentWorkload: v.union(
    v.literal("low"),
    v.literal("medium"),
    v.literal("high"),
  ),
  preferences: v.string(),
  weeklyCapacity: v.optional(v.number()),
});

export const listForTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_team_and_updated", (indexQuery) =>
        indexQuery.eq("teamId", args.teamId),
      )
      .order("desc")
      .take(50);

    return await Promise.all(
      projects.map(async (project) => {
        const phases = await ctx.db
          .query("phases")
          .withIndex("by_project_and_order", (indexQuery) =>
            indexQuery.eq("projectId", project._id),
          )
          .collect();
        const projectMembers = await ctx.db
          .query("projectMembers")
          .withIndex("by_project", (indexQuery) =>
            indexQuery.eq("projectId", project._id),
          )
          .collect();

        return {
          ...project,
          phaseCount: phases.length,
          memberCount: projectMembers.length,
          phases: phases.map((phase) => ({
            _id: phase._id,
            title: phase.title,
            order: phase.order,
            canOverlap: phase.canOverlap,
            reviewCheckpoint: phase.reviewCheckpoint,
          })),
        };
      }),
    );
  },
});

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    title: v.string(),
    description: v.string(),
    startDate: v.string(),
    deadline: v.string(),
    frameworkType: v.union(
      v.literal("none"),
      v.literal("built_in"),
      v.literal("custom"),
    ),
    builtInFrameworkId: v.optional(v.string()),
    customFrameworkId: v.optional(v.id("customFrameworks")),
    frameworkName: v.string(),
    phases: v.array(projectPhaseValidator),
    members: v.array(projectMemberValidator),
    setupMode: v.optional(v.union(v.literal("manual"), v.literal("ai"))),
    targetMemberCount: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { profile } = await requireTeamMember(ctx, args.teamId);
    const details = validateProjectDetails(args);
    let frameworkName: string;
    let phases;
    let builtInFrameworkId: string | undefined;
    let customFrameworkId: typeof args.customFrameworkId;

    if (args.frameworkType === "none") {
      if (args.builtInFrameworkId || args.customFrameworkId) {
        throw new Error("A framework-free project cannot include a framework ID.");
      }
      frameworkName = "Flexible project";
      phases = validateProjectPhases([
        {
          key: "project-work",
          name: "Project work",
          description: "A flexible workspace for tasks and checkpoints.",
          canOverlap: true,
          dependencyKeys: [],
          reviewCheckpoint: false,
        },
      ]);
    } else if (args.frameworkType === "built_in") {
      if (!args.builtInFrameworkId || args.customFrameworkId) {
        throw new Error("Choose a built-in framework.");
      }

      const validated = validateBuiltInFramework(
        args.builtInFrameworkId,
        args.frameworkName,
        args.phases,
      );
      frameworkName = validated.frameworkName;
      phases = validated.phases;
      builtInFrameworkId = args.builtInFrameworkId;
    } else {
      if (!args.customFrameworkId || args.builtInFrameworkId) {
        throw new Error("Choose a custom framework.");
      }

      const customFramework = await ctx.db.get(args.customFrameworkId);

      if (
        customFramework === null ||
        customFramework.teamId !== args.teamId
      ) {
        throw new Error("That custom framework does not belong to this team.");
      }

      frameworkName = customFramework.name;
      phases = validateProjectPhases(
        customFramework.phases.map((phase) => ({
          key: phase.key,
          name: phase.name,
          description: phase.description,
          canOverlap: phase.canOverlap,
          dependencyKeys: phase.defaultDependencyKeys,
          reviewCheckpoint: phase.reviewCheckpoint,
        })),
      );
      customFrameworkId = customFramework._id;
    }

    if (args.members.length < 1) {
      throw new Error("Choose at least one project member.");
    }

    const uniqueProfileIds = new Set(
      args.members.map((member) => member.profileId),
    );

    if (uniqueProfileIds.size !== args.members.length) {
      throw new Error("Each project member can only be added once.");
    }

    const teamMemberships = await ctx.db
      .query("teamMembers")
      .withIndex("by_team", (indexQuery) =>
        indexQuery.eq("teamId", args.teamId),
      )
      .collect();
    const teamProfileIds = new Set(
      teamMemberships.map((membership) => membership.profileId),
    );

    if (
      args.members.some((member) => !teamProfileIds.has(member.profileId))
    ) {
      throw new Error("Every project member must belong to the team.");
    }

    const now = Date.now();
    const projectId = await ctx.db.insert("projects", {
      teamId: args.teamId,
      ...details,
      frameworkType: args.frameworkType,
      frameworkName,
      builtInFrameworkId,
      customFrameworkId,
      status: "planning",
      setupMode: args.setupMode,
      targetMemberCount: args.targetMemberCount,
      creatorProfileId: profile._id,
      createdAt: now,
      updatedAt: now,
    });

    for (const [order, phase] of phases.entries()) {
      await ctx.db.insert("phases", {
        projectId,
        frameworkPhaseKey: phase.key,
        title: phase.name,
        description: phase.description,
        order,
        status: "not_started",
        canOverlap: phase.canOverlap,
        reviewCheckpoint: phase.reviewCheckpoint,
        dependencyKeys: phase.dependencyKeys,
      });
    }

    for (const member of args.members) {
      await ctx.db.insert("projectMembers", {
        projectId,
        profileId: member.profileId,
        ...validateMemberPlanning(member),
        joinedAt: now,
      });
    }

    await ctx.db.insert("activityLogs", {
      teamId: args.teamId,
      actorProfileId: profile._id,
      action: "project_created",
      metadata: { projectId, projectTitle: details.title },
      createdAt: now,
    });
    await ctx.db.patch(args.teamId, { updatedAt: now });

    return projectId;
  },
});

export const joinLatestWithPreferences = mutation({
  args: {
    teamId: v.id("teams"),
    skills: v.array(v.string()),
    availability: v.string(),
    currentWorkload: v.union(
      v.literal("low"),
      v.literal("medium"),
      v.literal("high"),
    ),
    preferences: v.string(),
    weeklyCapacity: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const { profile } = await requireTeamMember(ctx, args.teamId);
    const planning = validateMemberPlanning({
      profileId: profile._id,
      skills: args.skills,
      availability: args.availability,
      currentWorkload: args.currentWorkload,
      preferences: args.preferences,
      weeklyCapacity: args.weeklyCapacity,
    });
    const projects = await ctx.db
      .query("projects")
      .withIndex("by_team_and_updated", (query) => query.eq("teamId", args.teamId))
      .order("desc")
      .take(50);
    const project = projects.find((candidate) => candidate.status !== "archived");

    if (!project) {
      return null;
    }

    const existing = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (query) =>
        query.eq("projectId", project._id).eq("profileId", profile._id),
      )
      .unique();
    const now = Date.now();

    if (existing) {
      await ctx.db.patch(existing._id, planning);
    } else {
      await ctx.db.insert("projectMembers", {
        projectId: project._id,
        profileId: profile._id,
        ...planning,
        joinedAt: now,
      });
    }

    await ctx.db.patch(project._id, { updatedAt: now });
    return project._id;
  },
});

export const launch = mutation({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);
    if (project === null) throw new Error("This project no longer exists.");

    const { membership, profile } = await requireTeamMember(ctx, project.teamId);
    if (membership.role !== "owner" && project.creatorProfileId !== profile._id) {
      throw new Error("Only the project creator or team owner can launch this project.");
    }
    if (project.status === "archived") {
      throw new Error("Restore this project before launching it.");
    }
    if (project.launchedAt) return project._id;

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect();
    if (tasks.length === 0) throw new Error("Add at least one task before launch.");
    if (tasks.some((task) => task.required && (!task.requiresReview || !task.reviewerProfileId))) {
      throw new Error("Every required task needs an assigned reviewer before launch.");
    }

    const now = Date.now();
    await ctx.db.patch(project._id, { launchedAt: now, status: "active", updatedAt: now });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "project_launched",
      metadata: { projectId: project._id, projectTitle: project.title },
      createdAt: now,
    });
    return project._id;
  },
});

export const setArchived = mutation({
  args: {
    projectId: v.id("projects"),
    archived: v.boolean(),
  },
  handler: async (ctx, args) => {
    const project = await ctx.db.get(args.projectId);

    if (project === null) {
      throw new Error("This project no longer exists.");
    }

    const { membership, profile } = await requireTeamMember(ctx, project.teamId);
    const projectMembership = await ctx.db
      .query("projectMembers")
      .withIndex("by_project_and_user", (indexQuery) =>
        indexQuery.eq("projectId", project._id).eq("profileId", profile._id),
      )
      .unique();

    if (membership.role !== "owner" && projectMembership === null) {
      throw new Error("Only project members or the team owner can archive this project.");
    }

    if ((project.status === "archived") === args.archived) {
      return project._id;
    }

    const tasks = await ctx.db
      .query("tasks")
      .withIndex("by_project", (indexQuery) =>
        indexQuery.eq("projectId", project._id),
      )
      .collect();
    const status = args.archived
      ? "archived" as const
      : deriveProjectStatus({ ...project, status: "planning" }, tasks);
    const now = Date.now();

    await ctx.db.patch(project._id, {
      status,
      updatedAt: now,
      completedAt: status === "completed" ? (project.completedAt ?? now) : undefined,
    });
    await ctx.db.patch(project.teamId, { updatedAt: now });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: args.archived ? "project_archived" : "project_restored",
      metadata: {
        projectId: project._id,
        projectTitle: project.title,
        previousProjectStatus: project.status,
        projectStatus: status,
      },
      createdAt: now,
    });

    return project._id;
  },
});
