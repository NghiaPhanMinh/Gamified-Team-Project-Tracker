import { mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => ctx.db.query("activityLog").withIndex("by_project_time", (q) => q.eq("projectId", args.projectId)).order("desc").collect(),
});

export const append = mutation({
  args: { projectId: v.id("projects"), actorId: v.id("users"), action: v.string(), detail: v.optional(v.string()) },
  handler: async (ctx, args) => ctx.db.insert("activityLog", { ...args, timestamp: Date.now() }),
});
