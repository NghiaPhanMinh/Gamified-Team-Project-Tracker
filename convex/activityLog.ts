import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byTeam = query({
  args: { teamId: v.id("teams") },
  handler: async (ctx, args) => ctx.db.query("activityLog").withIndex("by_team_time", (q) => q.eq("teamId", args.teamId)).order("desc").collect(),
});

export const append = mutation({
  args: { teamId: v.id("teams"), actorId: v.id("users"), action: v.string(), detail: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("activityLog", { ...args, timestamp: Date.now() }),
});
