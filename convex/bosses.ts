import { internalMutation, mutation, query } from "./_generated/server";
import { v } from "convex/values";

export const byProject = query({
  args: { projectId: v.id("projects") },
  handler: async (ctx, args) => ctx.db.query("bosses").withIndex("by_project", (q) => q.eq("projectId", args.projectId)).order("desc").collect(),
});

export const create = mutation({
  args: { projectId: v.id("projects"), title: v.string(), totalScope: v.number(), deadline: v.number(), actorId: v.optional(v.id("users")) },
  handler: async (ctx, args) => {
    const { actorId, ...bossArgs } = args;
    const bossId = await ctx.db.insert("bosses", { ...bossArgs, remainingHP: args.totalScope, status: "active", createdAt: Date.now() });
    if (actorId) await ctx.db.insert("activityLog", { projectId: args.projectId, actorId, action: "created the weekly boss", detail: args.title, timestamp: Date.now() });
    return bossId;
  },
});

export const resolveDue = internalMutation({
  args: {},
  handler: async (ctx) => {
    const active = await ctx.db.query("bosses").collect();
    const now = Date.now();
    let resolved = 0;
    for (const boss of active) {
      if (boss.status !== "active" || boss.deadline > now) continue;
      const status = boss.remainingHP <= 0 ? "defeated" : "survived";
      await ctx.db.patch(boss._id, { status, resolvedAt: now });
      const project = await ctx.db.get(boss.projectId);
      const team = project ? await ctx.db.get(project.teamId) : null;
      const actorId = team?.members[0];
      if (project && actorId) await ctx.db.insert("activityLog", { projectId: project._id, actorId, action: status === "defeated" ? "defeated the boss" : "logged a surviving boss", detail: status === "defeated" ? "HP reached zero before the deadline" : "HP remained at the deadline · no penalty", timestamp: now });
      resolved += 1;
    }
    return resolved;
  },
});
