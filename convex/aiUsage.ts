import { v } from "convex/values";

import { internalMutation, internalQuery, query } from "./_generated/server";
import type { QueryCtx } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { requireTeamMember, requireUserProfile } from "./lib/auth";

export type SubscriptionTier = "free" | "plus" | "pro";

export const TIER_ENTITLEMENTS = {
  free: { platformPlanGenerationsPerProject: 1, advancedAi: false, priorityRouting: false },
  plus: { platformPlanGenerationsPerProject: null, advancedAi: true, priorityRouting: true },
  pro: { platformPlanGenerationsPerProject: null, advancedAi: true, priorityRouting: true },
} as const;

async function activeTier(ctx: QueryCtx, profileId: Id<"userProfiles">): Promise<SubscriptionTier> {
  const subscription = await ctx.db
    .query("subscriptions")
    .withIndex("by_profile", (q) => q.eq("profileId", profileId))
    .order("desc")
    .first();
  if (!subscription || subscription.status !== "active" || (subscription.expiresAt && subscription.expiresAt <= Date.now())) {
    return "free";
  }
  return subscription.tier;
}

async function accessForProject(ctx: QueryCtx, projectId: Id<"projects">) {
  const project = await ctx.db.get(projectId);
  if (!project) throw new Error("This project no longer exists.");
  const { profile, membership } = await requireTeamMember(ctx, project.teamId);
  const projectMembership = await ctx.db
    .query("projectMembers")
    .withIndex("by_project_and_user", (q) => q.eq("projectId", project._id).eq("profileId", profile._id))
    .unique();
  if (!projectMembership && membership.role !== "owner") throw new Error("Only project members can use AI planning.");
  const tier = await activeTier(ctx, profile._id);
  const usage = await ctx.db
    .query("aiUsage")
    .withIndex("by_project_and_source", (q) => q.eq("projectId", project._id).eq("source", "platform"))
    .collect();
  return {
    profileId: profile._id,
    tier,
    entitlement: TIER_ENTITLEMENTS[tier],
    successfulPlatformPlanGenerations: usage.filter((item) => item.success && item.operation === "project_plan").length,
  };
}

export const getProjectAccess = internalQuery({
  args: { projectId: v.id("projects") },
  handler: (ctx, args) => accessForProject(ctx, args.projectId),
});

export const getCurrent = query({
  args: {},
  handler: async (ctx) => {
    const profile = await requireUserProfile(ctx);
    const tier = await activeTier(ctx, profile._id);
    return { tier, entitlement: TIER_ENTITLEMENTS[tier] };
  },
});

export const getProjectUsage = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => {
    const access = await accessForProject(ctx, args.projectId);
    return {
      tier: access.tier,
      limit: access.entitlement.platformPlanGenerationsPerProject,
      used: access.successfulPlatformPlanGenerations,
      platformGenerationAvailable:
        access.entitlement.platformPlanGenerationsPerProject === null ||
        access.successfulPlatformPlanGenerations < access.entitlement.platformPlanGenerationsPerProject,
    };
  },
});

export const record = internalMutation({
  args: {
    projectId: v.id("projects"),
    profileId: v.id("userProfiles"),
    source: v.union(v.literal("platform"), v.literal("byok")),
    operation: v.union(v.literal("project_plan"), v.literal("plan_adjustment"), v.literal("meeting_interpretation")),
    model: v.string(),
    success: v.boolean(),
  },
  handler: (ctx, args) => ctx.db.insert("aiUsage", { ...args, createdAt: Date.now() }),
});

export const reservePlatformGeneration = internalMutation({
  args: {
    projectId: v.id("projects"),
    profileId: v.id("userProfiles"),
    limit: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db
      .query("aiUsage")
      .withIndex("by_project_and_source", (q) => q.eq("projectId", args.projectId).eq("source", "platform"))
      .collect();
    const recentPendingCutoff = Date.now() - 2 * 60 * 1000;
    const consumed = usage.filter((item) =>
      item.operation === "project_plan" && (item.success || item.createdAt >= recentPendingCutoff),
    ).length;
    if (args.limit !== undefined && consumed >= args.limit) {
      throw new Error("AI GENERATION USED. Continue with unlimited manual planning, or use your own session-only OpenRouter key in Profile → AI Settings.");
    }
    return await ctx.db.insert("aiUsage", {
      projectId: args.projectId,
      profileId: args.profileId,
      source: "platform",
      operation: "project_plan",
      model: "pending",
      success: false,
      createdAt: Date.now(),
    });
  },
});

export const finishPlatformGeneration = internalMutation({
  args: {
    usageId: v.id("aiUsage"),
    success: v.boolean(),
    model: v.string(),
  },
  handler: async (ctx, args) => {
    const usage = await ctx.db.get(args.usageId);
    if (!usage) return;
    if (args.success) await ctx.db.patch(usage._id, { success: true, model: args.model });
    else await ctx.db.delete(usage._id);
  },
});
