import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => ctx.db.query("projects").withIndex("by_team", (q) => q.eq("teamId", args.teamId)).collect(),
});

export const create = mutation({
  args: { teamId: v.id("teams"), name: v.string(), overallDeadline: v.optional(v.number()), actorId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const { actorId, ...projectArgs } = args;
    const projectId = await ctx.db.insert("projects", { ...projectArgs, createdAt: Date.now() });
    if (actorId) await ctx.db.insert("activityLog", { projectId, actorId, action: "created the project", detail: args.name, timestamp: Date.now() });
    return projectId;
  },
});
