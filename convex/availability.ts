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
    const { profile } = await requireProjectMember(ctx, args.projectId);
    const [blocks, memberships, plans] = await Promise.all([
      ctx.db.query("availabilityBlocks").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).collect(),
      ctx.db.query("projectMembers").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).collect(),
      ctx.db.query("meetingPlans").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).collect(),
    ]);
    const members = await Promise.all(memberships.map(async (member) => {
      const memberProfile = await ctx.db.get(member.profileId);
      return {
        profileId: member.profileId,
        displayName: memberProfile?.displayName ?? "Former member",
        imageUrl: memberProfile?.imageUrl,
        skills: member.skills,
        workload: member.currentWorkload,
        weeklyCapacity: member.weeklyCapacity,
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
      const dayBlocks = blocks.filter((block) => block.dayOfWeek === dayOfWeek);
      const points = [...new Set(dayBlocks.flatMap((block) => [block.startMinute, block.endMinute]))].sort((a, b) => a - b);
      for (let index = 0; index < points.length - 1; index += 1) {
        const startMinute = points[index];
        const endMinute = points[index + 1];
        if (endMinute - startMinute < 30) continue;
        const attendeeProfileIds = [...new Set(dayBlocks
          .filter((block) => block.startMinute <= startMinute && block.endMinute >= endMinute)
          .map((block) => block.profileId))];
        if (attendeeProfileIds.length >= 2) {
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
      members,
      blocks,
      suggestions: suggestions.slice(0, 8),
      plans: plans.sort((a, b) => a.dayOfWeek - b.dayOfWeek || a.startMinute - b.startMinute),
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
  },
  handler: async (ctx, args) => {
    const { project, profile } = await requireProjectMember(ctx, args.projectId);
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
