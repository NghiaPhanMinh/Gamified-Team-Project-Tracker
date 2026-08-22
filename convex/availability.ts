import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import type { MutationCtx, QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireTeamMember } from "./lib/auth";

async function requireProjectMember(
  ctx: QueryCtx | MutationCtx,
  projectId: Id<"projects">,
) {
  const project = await ctx.db.get(projectId);
  if (!project) throw new Error("This project no longer exists.");
  const { membership, profile } = await requireTeamMember(ctx, project.teamId);
  const projectMembership = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_and_user", (q) =>
      q.eq("projectId", projectId).eq("profileId", profile._id),
    )
    .unique();
  if (!projectMembership && membership.role !== "owner") {
    throw new Error("Only project members can view availability.");
  }
  return { project, profile, membership, projectMembership };
}

const availabilityBlock = v.object({
  dayOfWeek: v.number(),
  startMinute: v.number(),
  endMinute: v.number(),
});

function validateBlock(block: { dayOfWeek: number; startMinute: number; endMinute: number }) {
  if (!Number.isInteger(block.dayOfWeek) || block.dayOfWeek < 0 || block.dayOfWeek > 6) {
    throw new Error("Choose a valid day of the week.");
  }
  if (
    !Number.isInteger(block.startMinute) ||
    !Number.isInteger(block.endMinute) ||
    block.startMinute < 0 ||
    block.endMinute > 1440 ||
    block.endMinute - block.startMinute < 30
  ) {
    throw new Error("Availability blocks must be at least 30 minutes and stay within one day.");
  }
}

export const updateMine = mutation({
  args: {
    projectId: v.id("projects"),
    timezone: v.string(),
    meetingDurationMinutes: v.number(),
    meetingCadence: v.union(
      v.literal("weekly"),
      v.literal("fortnightly"),
      v.literal("as_needed"),
    ),
    blocks: v.array(availabilityBlock),
  },
  handler: async (ctx, args) => {
    const { project, profile, projectMembership } = await requireProjectMember(ctx, args.projectId);
    if (!projectMembership) throw new Error("Join this project before adding availability.");
    const timezone = args.timezone.trim();
    if (!timezone || timezone.length > 80) throw new Error("Choose a valid timezone.");
    if (![30, 45, 60, 90, 120].includes(args.meetingDurationMinutes)) {
      throw new Error("Choose a supported meeting duration.");
    }
    args.blocks.forEach(validateBlock);
    const existing = await ctx.db
      .query("availabilityBlocks")
      .withIndex("by_project_and_profile", (q) =>
        q.eq("projectId", project._id).eq("profileId", profile._id),
      )
      .collect();
    await Promise.all(existing.map((block) => ctx.db.delete(block._id)));
    const now = Date.now();
    await Promise.all(
      args.blocks.map((block) =>
        ctx.db.insert("availabilityBlocks", {
          projectId: project._id,
          profileId: profile._id,
          ...block,
          timezone,
          createdAt: now,
          updatedAt: now,
        }),
      ),
    );
    await ctx.db.patch(projectMembership._id, {
      timezone,
      meetingDurationMinutes: args.meetingDurationMinutes,
      meetingCadence: args.meetingCadence,
      availabilityMode: "busy",
    });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "availability_updated",
      metadata: { projectId: project._id },
      createdAt: now,
    });
    return profile._id;
  },
});

export const getForProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const { profile, project } = await requireProjectMember(ctx, args.projectId);
    const [blocks, memberships, plans, votes, tasks] = await Promise.all([
      ctx.db.query("availabilityBlocks").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).collect(),
      ctx.db.query("projectMembers").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).collect(),
      ctx.db.query("meetingPlans").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).collect(),
      ctx.db.query("meetingVotes").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).collect(),
      ctx.db.query("tasks").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).collect(),
    ]);
    const members = await Promise.all(memberships.map(async (member) => {
      const memberProfile = await ctx.db.get(member.profileId);
      const teamMember = await ctx.db
        .query("teamMembers")
        .withIndex("by_team_and_user", (q) => q.eq("teamId", project.teamId).eq("profileId", member.profileId))
        .unique();

      return {
        profileId: member.profileId,
        displayName: memberProfile?.displayName ?? "Former member",
        imageUrl: memberProfile?.imageUrl,
        characterFill: teamMember?.characterFill ?? memberProfile?.characterFill ?? "#FFF73F",
        characterOutline: teamMember?.characterOutline ?? memberProfile?.characterOutline ?? "#4CA0FE",
        spellType: teamMember?.spellType ?? memberProfile?.spellType,
        skills: memberProfile?.skills ?? member.skills,
        softwareSkills: memberProfile?.softwareSkills ?? [],
        workload: member.currentWorkload,
        weeklyCapacity: memberProfile?.weeklyCapacity ?? member.weeklyCapacity,
        assignedTaskCount: tasks.filter((task) => task.primaryOwnerProfileId === member.profileId && task.assignmentState !== "unassigned").length,
        reviewTaskCount: tasks.filter((task) => task.reviewerProfileId === member.profileId).length,
        timezone: member.timezone,
        meetingDurationMinutes: member.meetingDurationMinutes,
        meetingCadence: member.meetingCadence,
      };
    }));

    const suggestions: Array<{
      dayOfWeek: number;
      startMinute: number;
      endMinute: number;
      attendeeProfileIds: Id<"userProfiles">[];
    }> = [];
    for (let dayOfWeek = 0; dayOfWeek < 7; dayOfWeek += 1) {
      for (let startMinute = 8 * 60; startMinute <= 20 * 60; startMinute += 60) {
        const endMinute = startMinute + 60;
        const attendeeProfileIds = memberships
          .filter((member) => {
            const memberBlocks = blocks.filter(
              (block) => block.profileId === member.profileId && block.dayOfWeek === dayOfWeek,
            );
            if (member.availabilityMode === "busy") {
              return !memberBlocks.some(
                (block) => block.startMinute < endMinute && block.endMinute > startMinute,
              );
            }
            if (memberBlocks.length === 0) return false;
            return memberBlocks.some(
              (block) => block.startMinute <= startMinute && block.endMinute >= endMinute,
            );
          })
          .map((member) => member.profileId);
        if (attendeeProfileIds.length > 0) {
          suggestions.push({ dayOfWeek, startMinute, endMinute, attendeeProfileIds });
        }
      }
    }
    suggestions.sort((a, b) =>
      b.attendeeProfileIds.length - a.attendeeProfileIds.length ||
      (b.endMinute - b.startMinute) - (a.endMinute - a.startMinute) ||
      a.dayOfWeek - b.dayOfWeek ||
      a.startMinute - b.startMinute,
    );
    return {
      currentProfileId: profile._id,
      canManageMeetings: project.creatorProfileId === profile._id,
      members,
      blocks,
      suggestions: suggestions.slice(0, 8),
      plans: plans
        .map((plan) => ({
          ...plan,
          votes: votes.filter((vote) => vote.meetingPlanId === plan._id),
          suitableCount: votes.filter((vote) => vote.meetingPlanId === plan._id && vote.suitable).length,
          hasMyVote: votes.some((vote) => vote.meetingPlanId === plan._id && vote.profileId === profile._id),
        }))
        .sort((a, b) =>
          (a.status === "selected" ? -1 : b.status === "selected" ? 1 : 0) ||
          b.suitableCount - a.suitableCount ||
          a.dayOfWeek - b.dayOfWeek ||
          a.startMinute - b.startMinute,
        ),
    };
  },
});

export const saveMeetingPlan = mutation({
  args: {
    projectId: v.id("projects"),
    title: v.string(),
    dayOfWeek: v.number(),
    startMinute: v.number(),
    durationMinutes: v.number(),
    timezone: v.string(),
    attendeeProfileIds: v.array(v.id("userProfiles")),
    source: v.union(v.literal("deterministic"), v.literal("ai"), v.literal("manual")),
    meetingMode: v.optional(v.union(v.literal("online"), v.literal("offline"))),
  },
  handler: async (ctx, args) => {
    const { project, profile } = await requireProjectMember(ctx, args.projectId);
    if (project.creatorProfileId !== profile._id) {
      throw new Error("Only the room creator can create a meeting plan.");
    }
    validateBlock({ dayOfWeek: args.dayOfWeek, startMinute: args.startMinute, endMinute: args.startMinute + args.durationMinutes });
    const memberIds = new Set((await ctx.db.query("projectMembers").withIndex("by_project", (q) => q.eq("projectId", project._id)).collect()).map((member) => member.profileId));
    const attendeeProfileIds = [...new Set(args.attendeeProfileIds)];
    if (attendeeProfileIds.length < 2 || attendeeProfileIds.some((id) => !memberIds.has(id))) {
      throw new Error("A saved meeting needs at least two current project members.");
    }
    const now = Date.now();
    const planId = await ctx.db.insert("meetingPlans", {
      projectId: project._id,
      createdByProfileId: profile._id,
      title: args.title.trim().slice(0, 100) || "Team meeting",
      dayOfWeek: args.dayOfWeek,
      startMinute: args.startMinute,
      durationMinutes: args.durationMinutes,
      timezone: args.timezone.trim().slice(0, 80),
      attendeeProfileIds,
      source: args.source,
      meetingMode: args.meetingMode ?? "online",
      status: "candidate",
      createdAt: now,
      updatedAt: now,
    });
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "meeting_plan_saved",
      metadata: { projectId: project._id },
      createdAt: now,
    });
    return planId;
  },
});

export const voteMeeting = mutation({
  args: { meetingPlanId: v.id("meetingPlans"), suitable: v.boolean() },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.meetingPlanId);
    if (!plan) throw new Error("This meeting suggestion no longer exists.");
    const { project, profile } = await requireProjectMember(ctx, plan.projectId);
    if (plan.status === "selected" || plan.status === "cancelled") {
      throw new Error("Voting is closed for this meeting suggestion.");
    }
    const existing = await ctx.db
      .query("meetingVotes")
      .withIndex("by_plan_and_profile", (query) =>
        query.eq("meetingPlanId", plan._id).eq("profileId", profile._id),
      )
      .unique();
    const now = Date.now();
    if (existing) {
      await ctx.db.patch(existing._id, { suitable: args.suitable, updatedAt: now });
    } else {
      await ctx.db.insert("meetingVotes", {
        projectId: project._id,
        meetingPlanId: plan._id,
        profileId: profile._id,
        suitable: args.suitable,
        createdAt: now,
        updatedAt: now,
      });
    }
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "meeting_vote_recorded",
      metadata: { projectId: project._id },
      createdAt: now,
    });
    return plan._id;
  },
});

export const selectMeeting = mutation({
  args: { meetingPlanId: v.id("meetingPlans") },
  handler: async (ctx, args) => {
    const plan = await ctx.db.get(args.meetingPlanId);
    if (!plan) throw new Error("This meeting suggestion no longer exists.");
    const { project, profile } = await requireProjectMember(ctx, plan.projectId);
    if (project.creatorProfileId !== profile._id) {
      throw new Error("Only the room creator can select the official meeting.");
    }
    const plans = await ctx.db
      .query("meetingPlans")
      .withIndex("by_project", (query) => query.eq("projectId", project._id))
      .collect();
    const now = Date.now();
    await Promise.all(plans.map((candidate) =>
      ctx.db.patch(candidate._id, {
        status: candidate._id === plan._id ? "selected" : "candidate",
        updatedAt: now,
      }),
    ));
    await ctx.db.insert("activityLogs", {
      teamId: project.teamId,
      projectId: project._id,
      actorProfileId: profile._id,
      action: "meeting_selected",
      metadata: { projectId: project._id },
      createdAt: now,
    });
    return plan._id;
  },
});
