import { v } from "convex/values";

import { mutation, query } from "./_generated/server";
import { requireTeamMember } from "./lib/auth";
import {
  customFrameworkPhaseValidator,
  validateCustomFramework,
} from "./lib/customFrameworkValidation";

export const listForTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => {
    await requireTeamMember(ctx, args.teamId);

    return await ctx.db
      .query("customFrameworks")
      .withIndex("by_team_and_updated", (indexQuery) =>
        indexQuery.eq("teamId", args.teamId),
      )
      .order("desc")
      .collect();
  },
});

export const create = mutation({
  args: {
    teamId: v.id("teams"),
    name: v.string(),
    description: v.string(),
    phases: v.array(customFrameworkPhaseValidator),
    sourceBuiltInId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const { profile } = await requireTeamMember(ctx, args.teamId);
    const framework = validateCustomFramework(args);
    const now = Date.now();
    const customFrameworkId = await ctx.db.insert("customFrameworks", {
      teamId: args.teamId,
      creatorProfileId: profile._id,
      ...framework,
      version: 1,
      createdAt: now,
      updatedAt: now,
    });

    await ctx.db.insert("activityLogs", {
      teamId: args.teamId,
      actorProfileId: profile._id,
      action: "framework_created",
      metadata: {
        customFrameworkId,
        frameworkName: framework.name,
      },
      createdAt: now,
    });

    return customFrameworkId;
  },
});

export const update = mutation({
  args: {
    customFrameworkId: v.id("customFrameworks"),
    name: v.string(),
    description: v.string(),
    phases: v.array(customFrameworkPhaseValidator),
    sourceBuiltInId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db.get(args.customFrameworkId);

    if (existing === null) {
      throw new Error("This custom framework no longer exists.");
    }

    const { membership, profile } = await requireTeamMember(
      ctx,
      existing.teamId,
    );

    if (
      existing.creatorProfileId !== profile._id &&
      membership.role !== "owner"
    ) {
      throw new Error(
        "Only the framework creator or team owner can edit this framework.",
      );
    }

    const framework = validateCustomFramework(args);
    const now = Date.now();
    await ctx.db.patch(existing._id, {
      ...framework,
      version: existing.version + 1,
      updatedAt: now,
    });
    await ctx.db.insert("activityLogs", {
      teamId: existing.teamId,
      actorProfileId: profile._id,
      action: "framework_updated",
      metadata: {
        customFrameworkId: existing._id,
        frameworkName: framework.name,
      },
      createdAt: now,
    });

    return existing._id;
  },
});
